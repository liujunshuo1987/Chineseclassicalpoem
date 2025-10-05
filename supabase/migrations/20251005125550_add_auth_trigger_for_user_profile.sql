/*
  # Add trigger to auto-create user profile

  1. New Function
    - `handle_new_user()` - Automatically creates a user profile when a new auth user signs up
    
  2. New Trigger
    - `on_auth_user_created` - Triggers after a new user is created in auth.users
    
  3. Behavior
    - When a user signs up, automatically create a profile in the users table
    - Set default membership type to 'visitor'
    - Set default role to 'user'
    - Use username from auth metadata or email prefix as fallback
*/

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, username, membership_type, role, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'visitor',
    'user',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
