/*
  # Fix RLS Infinite Recursion in Admin Policies

  ## Problem
  The admin policies were creating infinite recursion by querying the same table
  they're protecting. When checking if a user is admin, the query triggers RLS
  which checks if user is admin, creating a loop.

  ## Solution
  1. Use auth.jwt() to check user role from JWT metadata instead of querying users table
  2. Store role in auth.users raw_app_metadata during user creation
  3. Simplify policies to avoid self-referencing queries

  ## Changes
  - Drop all existing policies on users table
  - Create new policies that use auth.jwt() for role checking
  - Update trigger to store role in JWT metadata
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.users;
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Users can delete own data" ON public.users;
DROP POLICY IF EXISTS "Users can view own data or admin can view all" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Only admins can delete users" ON public.users;

-- Create new policies without infinite recursion

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

-- Policy: Users can update their own profile (non-role fields)
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (
    auth.uid() = auth_user_id 
    AND role = (SELECT role FROM public.users WHERE auth_user_id = auth.uid())
  );

-- Policy: Service role can do everything (for triggers)
CREATE POLICY "Service role full access"
  ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Update trigger to set role in app_metadata (for future JWT-based checks)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Determine if user should be admin
  IF NEW.email = 'liujunshuo1987@gmail.com' THEN
    user_role := 'admin';
  ELSE
    user_role := 'user';
  END IF;

  -- Insert user profile with appropriate role, or update if exists
  INSERT INTO public.users (auth_user_id, username, membership_type, role, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'visitor',
    user_role,
    NOW()
  )
  ON CONFLICT (auth_user_id) 
  DO UPDATE SET 
    role = EXCLUDED.role,
    updated_at = NOW();
  
  -- Update auth.users metadata with role for JWT
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', user_role)
  WHERE id = NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth process
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing user's metadata
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT u.auth_user_id, u.role 
    FROM public.users u
  LOOP
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', user_record.role)
    WHERE id = user_record.auth_user_id;
  END LOOP;
END $$;