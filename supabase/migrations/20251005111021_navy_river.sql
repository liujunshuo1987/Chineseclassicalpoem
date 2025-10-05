/*
  # User Authentication and Membership System

  1. New Tables
    - `user_profiles`
      - `id` (uuid, references auth.users)
      - `username` (text, unique)
      - `membership_type` (enum: visitor, trial, monthly, annual, expired)
      - `trial_start_date` (timestamptz)
      - `expiry_date` (timestamptz)
      - `generations_used` (integer, total count)
      - `daily_generations_used` (integer, resets daily)
      - `last_generation_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `order_number` (text, unique)
      - `plan_type` (text: monthly, annual)
      - `amount` (decimal)
      - `currency` (text, default 'CNY')
      - `status` (enum: pending, paid, failed, refunded)
      - `payment_method` (text: wechat, alipay)
      - `paid_at` (timestamptz)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_generations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `content_type` (text: poetry, annotation, analysis)
      - `content` (text)
      - `keywords` (text)
      - `style` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Public read access for membership plans
</sql>

-- Create custom types
CREATE TYPE membership_type AS ENUM ('visitor', 'trial', 'monthly', 'annual', 'expired');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  membership_type membership_type DEFAULT 'visitor',
  trial_start_date timestamptz,
  expiry_date timestamptz,
  generations_used integer DEFAULT 0,
  daily_generations_used integer DEFAULT 0,
  last_generation_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  plan_type text NOT NULL,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'CNY',
  status order_status DEFAULT 'pending',
  payment_method text,
  paid_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_generations table for tracking usage
CREATE TABLE IF NOT EXISTS user_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  content_type text NOT NULL,
  content text NOT NULL,
  keywords text,
  style text,
  created_at timestamptz DEFAULT now()
);

-- Create membership_plans table for pricing
CREATE TABLE IF NOT EXISTS membership_plans (
  id text PRIMARY KEY,
  name_en text NOT NULL,
  name_zh text NOT NULL,
  price decimal(10,2) NOT NULL,
  original_price decimal(10,2),
  period text NOT NULL,
  daily_limit integer NOT NULL,
  features_en text[] NOT NULL,
  features_zh text[] NOT NULL,
  popular boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insert default membership plans
INSERT INTO membership_plans (id, name_en, name_zh, price, original_price, period, daily_limit, features_en, features_zh, popular) VALUES
('monthly', 'Monthly Member', '月度会员', 19.00, 29.00, 'monthly', 30, 
 ARRAY['Copy and export your works', '30 generations per day', 'Priority AI responsiveness', 'Access to all poetry styles'],
 ARRAY['复制和导出作品', '每日30次生成', 'AI优先响应', '访问所有诗词风格'],
 true),
('annual', 'Annual Member', '年度会员', 218.00, 258.00, 'annual', 999,
 ARRAY['Unlimited generation, copy, and export', 'Access AI Poem Interpretation', 'Exclusive cultural templates', 'Priority customer support'],
 ARRAY['无限生成、复制和导出', 'AI诗词解读功能', '独家文化模板', '优先客户支持'],
 false);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for orders
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create policies for user_generations
CREATE POLICY "Users can view own generations"
  ON user_generations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own generations"
  ON user_generations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create policies for membership_plans (public read)
CREATE POLICY "Anyone can view active membership plans"
  ON membership_plans
  FOR SELECT
  TO authenticated, anon
  USING (active = true);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, username, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_membership_type ON user_profiles(membership_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_expiry_date ON user_profiles(expiry_date);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_user_generations_user_id ON user_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_generations_created_at ON user_generations(created_at);