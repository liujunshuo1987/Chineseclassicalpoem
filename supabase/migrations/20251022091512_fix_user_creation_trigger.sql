/*
  # Fix user creation trigger

  1. Changes
    - Combine both triggers into one function
    - Create user profile and set admin role in single operation
    - Avoid race condition between triggers
    
  2. Behavior
    - Creates user profile when auth user signs up
    - Automatically sets admin role for liujunshuo1987@gmail.com
    - All happens in one atomic operation
*/

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_check_admin ON auth.users;

-- Drop old functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.auto_set_admin_on_signup();

-- Create combined function that handles both user creation and admin check
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

  -- Insert user profile with appropriate role
  INSERT INTO public.users (auth_user_id, username, membership_type, role, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'visitor',
    user_role,
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create single trigger for user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Remove the old manual admin promotion function as it's no longer needed
DROP FUNCTION IF EXISTS public.set_admin_role_for_email(TEXT);