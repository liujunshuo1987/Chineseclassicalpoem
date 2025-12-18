/*
  # 创建支付订单和管理员操作表

  ## 新建表

  ### 1. payment_orders（支付订单表）
    - `id` (bigserial, 主键)
    - `user_id` (uuid, 外键)
    - `order_number` (text, unique, 订单号)
    - `package_id` (bigint, 外键关联 credit_packages)
    - `credits` (integer, 购买积分)
    - `bonus_credits` (integer, 赠送积分)
    - `amount_cents` (integer, 支付金额，单位分)
    - `currency` (text, 货币代码)
    - `status` (text, 状态)
    - `stripe_payment_intent_id` (text, Stripe Payment Intent ID)
    - `stripe_checkout_session_id` (text, Stripe Checkout Session ID)
    - `paid_at` (timestamptz, 支付时间)
    - `created_at` (timestamptz, 创建时间)
    - `updated_at` (timestamptz, 更新时间)

  ### 2. admin_actions（管理员操作日志表）
    - `id` (bigserial, 主键)
    - `admin_user_id` (uuid, 外键，管理员用户)
    - `action_type` (text, 操作类型)
    - `target_user_id` (uuid, 目标用户)
    - `details` (jsonb, 操作详情)
    - `created_at` (timestamptz, 创建时间)

  ## 安全策略
    - 所有表启用 RLS
    - payment_orders: 用户可读自己，admin 可读写所有
    - admin_actions: 只有 admin 可读写
*/

-- 创建 payment_orders 表
CREATE TABLE IF NOT EXISTS payment_orders (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  package_id bigint NOT NULL REFERENCES credit_packages(id),
  credits integer NOT NULL CHECK (credits > 0),
  bonus_credits integer NOT NULL DEFAULT 0 CHECK (bonus_credits >= 0),
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id text,
  stripe_checkout_session_id text UNIQUE,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 创建 admin_actions 表
CREATE TABLE IF NOT EXISTS admin_actions (
  id bigserial PRIMARY KEY,
  admin_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('credit_adjustment', 'user_ban', 'user_unban', 'package_update', 'order_update')),
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_created_at ON payment_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_orders_stripe_session ON payment_orders(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_user_id ON admin_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user_id ON admin_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);

-- 启用 RLS
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- payment_orders 的 RLS 策略
CREATE POLICY "Users can view own orders"
  ON payment_orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON payment_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update orders"
  ON payment_orders FOR UPDATE
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

-- admin_actions 的 RLS 策略
CREATE POLICY "Admins can view all actions"
  ON admin_actions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert actions"
  ON admin_actions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
