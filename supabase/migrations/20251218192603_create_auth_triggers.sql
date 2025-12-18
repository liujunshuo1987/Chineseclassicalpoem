/*
  # 创建认证触发器

  ## 功能说明

  ### 1. 新用户注册触发器
    - 当 auth.users 表新增用户时自动触发
    - 创建 profiles 记录
    - 创建 user_credits 记录并赠送 20 积分
    - 记录赠送交易

  ## 重要说明
    - 使用 ON CONFLICT DO NOTHING 防止重复创建
    - 原子操作保证数据一致性
*/

-- 创建处理新用户的函数
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_initial_credits INTEGER := 20;
BEGIN
  -- 生成用户名（从邮箱提取或使用 UUID 前8位）
  v_username := COALESCE(
    SPLIT_PART(NEW.email, '@', 1),
    'user_' || SUBSTRING(NEW.id::TEXT, 1, 8)
  );
  
  -- 创建 profile 记录
  INSERT INTO profiles (id, username, nickname, avatar_url, role)
  VALUES (
    NEW.id,
    v_username,
    v_username,
    NULL,
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- 创建 user_credits 记录
  INSERT INTO user_credits (user_id, balance, total_earned, total_spent)
  VALUES (
    NEW.id,
    v_initial_credits,
    v_initial_credits,
    0
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- 记录赠送交易
  INSERT INTO credit_transactions (
    user_id,
    amount,
    type,
    description,
    balance_after
  )
  VALUES (
    NEW.id,
    v_initial_credits,
    'bonus',
    '新用户注册赠送',
    v_initial_credits
  )
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 创建 updated_at 自动更新函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表添加 updated_at 触发器
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_credits_updated_at ON user_credits;
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_credit_packages_updated_at ON credit_packages;
CREATE TRIGGER update_credit_packages_updated_at
  BEFORE UPDATE ON credit_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_archives_updated_at ON archives;
CREATE TRIGGER update_archives_updated_at
  BEFORE UPDATE ON archives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_poetry_generations_updated_at ON poetry_generations;
CREATE TRIGGER update_poetry_generations_updated_at
  BEFORE UPDATE ON poetry_generations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_orders_updated_at ON payment_orders;
CREATE TRIGGER update_payment_orders_updated_at
  BEFORE UPDATE ON payment_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
