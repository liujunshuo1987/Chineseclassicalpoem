/*
  # Fix auth_user_id column type and create membership_plans table

  1. Changes to users table
    - Drop ALL existing policies on users table
    - Change auth_user_id from bigint to uuid
    - Recreate policies with correct type
    
  2. New Tables
    - `membership_plans` - Subscription plans table
      
  3. Security
    - Recreate RLS policies for users table
    - Enable RLS on membership_plans table with appropriate policies
*/

-- Drop ALL existing policies on users table
DROP POLICY IF EXISTS "Users can insert own data or admin can insert" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own data or admin can view all" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own data or admin can update all" ON users;
DROP POLICY IF EXISTS "Only admins can delete users" ON users;

-- Drop existing foreign key constraint if exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_auth_user_id_fkey'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_auth_user_id_fkey;
  END IF;
END $$;

-- Change auth_user_id column type to uuid
ALTER TABLE users 
ALTER COLUMN auth_user_id TYPE uuid USING auth_user_id::uuid;

-- Add foreign key constraint to auth.users
ALTER TABLE users 
ADD CONSTRAINT users_auth_user_id_fkey 
FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Recreate RLS policies for users table
CREATE POLICY "Users can view own data or admin can view all"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    auth_user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can update own data or admin can update all"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    auth_user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- Create membership_plans table
CREATE TABLE IF NOT EXISTS membership_plans (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name_en text NOT NULL,
  name_zh text NOT NULL,
  price numeric(10,2) NOT NULL,
  original_price numeric(10,2),
  period text NOT NULL,
  daily_limit integer NOT NULL DEFAULT 0,
  features_en text[] NOT NULL DEFAULT '{}',
  features_zh text[] NOT NULL DEFAULT '{}',
  popular boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on membership_plans
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active plans
CREATE POLICY "Anyone can view active plans"
  ON membership_plans
  FOR SELECT
  USING (active = true);

-- Only admins can insert plans
CREATE POLICY "Only admins can insert plans"
  ON membership_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Only admins can update plans
CREATE POLICY "Only admins can update plans"
  ON membership_plans
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Only admins can delete plans
CREATE POLICY "Only admins can delete plans"
  ON membership_plans
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Insert default membership plans
INSERT INTO membership_plans (name_en, name_zh, price, original_price, period, daily_limit, features_en, features_zh, popular, active) VALUES
  ('Monthly Plan', '月度会员', 29.00, 39.00, 'monthly', 30, 
   ARRAY['30 generations per day', 'Copy content', 'Export files', 'Priority support'],
   ARRAY['每日30次生成', '复制内容', '导出文件', '优先支持'],
   false, true),
  ('Annual Plan', '年度会员', 199.00, 299.00, 'annual', 999,
   ARRAY['Unlimited generations', 'Copy content', 'Export files', 'Priority support', 'Early access to new features'],
   ARRAY['无限次生成', '复制内容', '导出文件', '优先支持', '抢先体验新功能'],
   true, true)
ON CONFLICT DO NOTHING;
