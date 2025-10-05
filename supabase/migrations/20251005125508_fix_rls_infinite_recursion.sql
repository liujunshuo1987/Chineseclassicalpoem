/*
  # Fix RLS infinite recursion issue

  1. Problem
    - RLS policies were checking admin status by querying the users table
    - This created infinite recursion when accessing the users table
    
  2. Solution
    - Simplify policies to avoid self-referencing
    - Users can only view/update their own data based on auth.uid()
    - Remove admin checks from policies (handle admin logic in application layer)
    
  3. Security
    - Each user can only access their own data
    - Authentication required for all operations
*/

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view own data or admin can view all" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own data or admin can update all" ON users;
DROP POLICY IF EXISTS "Only admins can delete users" ON users;
DROP POLICY IF EXISTS "Users can insert own data or admin can insert" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can delete own data"
  ON users
  FOR DELETE
  TO authenticated
  USING (auth_user_id = auth.uid());
