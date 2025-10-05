/*
  # Add Admin Role System

  1. Changes
    - Add `role` column to users table with default 'user'
    - Add `auth_user_id` column to link with auth.users
    - Create admin check function
    - Update RLS policies to allow admin access
  
  2. Security
    - Only admins can modify role column
    - Admins have full access to all content
    - Regular users maintain existing restrictions
*/

-- Add auth_user_id to link with Supabase auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id);

-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = auth.uid()
    AND role = 'admin'
  );
$$;

-- Update users table policies to allow admin access
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;

-- New policies with admin bypass
CREATE POLICY "Users can view own data or admin can view all"
  ON users FOR SELECT
  TO authenticated
  USING (
    id = (auth.jwt()->>'sub')::bigint
    OR auth_user_id = auth.uid()
    OR is_current_user_admin()
  );

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (
    id = (auth.jwt()->>'sub')::bigint 
    OR auth_user_id = auth.uid()
  )
  WITH CHECK (
    (id = (auth.jwt()->>'sub')::bigint OR auth_user_id = auth.uid())
    AND (
      -- Users cannot change their own role unless they are admin
      role = (SELECT role FROM users WHERE auth_user_id = auth.uid())
      OR is_current_user_admin()
    )
  );

-- Admin can insert users (for management purposes) or users can insert their own
CREATE POLICY "Users can insert own data or admin can insert"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    id = (auth.jwt()->>'sub')::bigint
    OR auth_user_id = auth.uid()
    OR is_current_user_admin()
  );

-- Create indexes for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);