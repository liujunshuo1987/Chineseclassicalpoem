/*
  # Set admin role for specific email

  1. New Functions
    - `set_admin_role_for_email()` - Function to promote a user to admin by email
    - `auto_set_admin_on_signup()` - Trigger function to automatically set admin role on signup
    
  2. New Trigger
    - `on_auth_user_created_check_admin` - Checks if new user should be admin
    
  3. Behavior
    - Automatically promotes liujunshuo1987@gmail.com to admin role on signup
    - Provides manual function to promote existing users to admin
*/

-- Function to manually set admin role for a specific email
CREATE OR REPLACE FUNCTION public.set_admin_role_for_email(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET role = 'admin'
  WHERE auth_user_id IN (
    SELECT id FROM auth.users WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically set admin role on signup for specific emails
CREATE OR REPLACE FUNCTION public.auto_set_admin_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the email should be an admin
  IF NEW.email = 'liujunshuo1987@gmail.com' THEN
    -- Update the user record to have admin role
    UPDATE public.users
    SET role = 'admin'
    WHERE auth_user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to check for admin emails on signup
DROP TRIGGER IF EXISTS on_auth_user_created_check_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_check_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_admin_on_signup();

-- Note: The trigger will automatically promote liujunshuo1987@gmail.com to admin when they sign up
-- For existing users, you can manually run: SELECT public.set_admin_role_for_email('liujunshuo1987@gmail.com');