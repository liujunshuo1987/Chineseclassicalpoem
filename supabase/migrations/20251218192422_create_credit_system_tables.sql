/*
  # 创建积分系统核心表

  ## 新建表

  ### 1. profiles（用户资料表）
    - `id` (uuid, 主键，关联 auth.users)
    - `username` (text, unique, 用户名)
    - `nickname` (text, 昵称)
    - `avatar_url` (text, 头像URL)
    - `role` (text, 角色: 'user' 或 'admin')
    - `created_at` (timestamptz, 创建时间)
    - `updated_at` (timestamptz, 更新时间)

  ### 2. user_credits（用户积分钱包表）
    - `id` (bigserial, 主键)
    - `user_id` (uuid, 外键关联 auth.users)
    - `balance` (integer, 当前余额)
    - `total_earned` (integer, 累计获得)
    - `total_spent` (integer, 累计消费)
    - `created_at` (timestamptz, 创建时间)
    - `updated_at` (timestamptz, 更新时间)

  ### 3. credit_transactions（积分交易明细表）
    - `id` (bigserial, 主键)
    - `user_id` (uuid, 外键)
    - `amount` (integer, 金额，正数=充值，负数=消费)
    - `type` (text, 类型: 'purchase', 'ocr', 'analysis', 'poetry', 'annotation', 'refund', 'bonus')
    - `description` (text, 交易说明)
    - `related_entity_id` (bigint, 关联的实体ID)
    - `related_entity_type` (text, 关联的实体类型)
    - `balance_after` (integer, 交易后余额)
    - `created_at` (timestamptz, 创建时间)

  ### 4. credit_packages（积分充值套餐表）
    - `id` (bigserial, 主键)
    - `name` (text, 套餐名称)
    - `credits` (integer, 积分数量)
    - `price_cents` (integer, 价格，单位分)
    - `currency` (text, 货币代码)
    - `bonus_credits` (integer, 赠送积分)
    - `is_active` (boolean, 是否在售)
    - `sort_order` (integer, 显示顺序)
    - `stripe_price_id` (text, Stripe Price ID)
    - `created_at` (timestamptz, 创建时间)
    - `updated_at` (timestamptz, 更新时间)

  ## 安全策略
    - 所有表启用 RLS
    - profiles: 用户可读写自己，admin 可读写所有
    - user_credits: 用户只读自己，写操作通过 RPC 函数
    - credit_transactions: 用户只读自己，admin 可读所有
    - credit_packages: 所有人可读，只有 admin 可写
*/

-- 创建 profiles 表
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  nickname text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 创建 user_credits 表
CREATE TABLE IF NOT EXISTS user_credits (
  id bigserial PRIMARY KEY,
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_earned integer NOT NULL DEFAULT 0 CHECK (total_earned >= 0),
  total_spent integer NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 创建 credit_transactions 表
CREATE TABLE IF NOT EXISTS credit_transactions (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('purchase', 'ocr', 'analysis', 'poetry', 'annotation', 'refund', 'bonus')),
  description text NOT NULL,
  related_entity_id bigint,
  related_entity_type text CHECK (related_entity_type IN ('archive', 'poetry', 'order')),
  balance_after integer NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 创建 credit_packages 表
CREATE TABLE IF NOT EXISTS credit_packages (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  credits integer NOT NULL CHECK (credits > 0),
  price_cents integer NOT NULL CHECK (price_cents > 0),
  currency text NOT NULL DEFAULT 'usd',
  bonus_credits integer NOT NULL DEFAULT 0 CHECK (bonus_credits >= 0),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  stripe_price_id text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);

-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;

-- profiles 的 RLS 策略
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- user_credits 的 RLS 策略
CREATE POLICY "Users can view own credits"
  ON user_credits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all credits"
  ON user_credits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- credit_transactions 的 RLS 策略
CREATE POLICY "Users can view own transactions"
  ON credit_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON credit_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- credit_packages 的 RLS 策略
CREATE POLICY "Anyone can view active packages"
  ON credit_packages FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can view all packages"
  ON credit_packages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert packages"
  ON credit_packages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update packages"
  ON credit_packages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 插入默认积分套餐
INSERT INTO credit_packages (name, credits, price_cents, bonus_credits, sort_order, stripe_price_id) VALUES
  ('体验包', 100, 499, 0, 1, ''),
  ('标准包', 500, 1999, 50, 2, ''),
  ('超值包', 1200, 3999, 200, 3, ''),
  ('专业包', 3000, 8999, 700, 4, '')
ON CONFLICT DO NOTHING;
