/*
  # Fix trigger to handle conflicts

  1. Changes
    - Add ON CONFLICT handling to prevent duplicate key errors
    - If user profile already exists, update it instead
    
  2. Behavior
    - Creates user profile on signup
    - If profile exists, updates the role (useful for admin promotion)
    - Prevents "Database error saving new user" issues
*/

-- Recreate the function with conflict handling
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
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth process
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;