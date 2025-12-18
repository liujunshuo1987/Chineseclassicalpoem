/*
  # 创建积分管理 RPC 函数

  ## 功能说明

  ### 1. deduct_credits（扣减积分）
    - 原子操作扣减用户积分
    - 检查余额是否充足
    - 记录交易明细
    - 返回操作结果

  ### 2. add_credits（增加积分）
    - 原子操作增加用户积分
    - 记录交易明细
    - 用于充值、赠送等场景

  ### 3. get_user_credit_balance（查询余额）
    - 快速查询用户当前积分余额
*/

-- 扣减积分函数
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT,
  p_related_entity_id BIGINT DEFAULT NULL,
  p_related_entity_type TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_balance INTEGER;
  v_transaction_id BIGINT;
BEGIN
  -- 锁定用户积分行，防止并发问题
  SELECT balance INTO v_balance
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- 检查用户是否有积分记录
  IF v_balance IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'user_not_found',
      'message', '用户积分记录不存在'
    );
  END IF;
  
  -- 检查余额是否充足
  IF v_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'insufficient_credits',
      'message', '积分余额不足',
      'current_balance', v_balance,
      'required', p_amount
    );
  END IF;
  
  -- 扣减积分
  UPDATE user_credits
  SET balance = balance - p_amount,
      total_spent = total_spent + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- 记录交易
  INSERT INTO credit_transactions (
    user_id, amount, type, description,
    related_entity_id, related_entity_type,
    balance_after
  ) VALUES (
    p_user_id, -p_amount, p_type, p_description,
    p_related_entity_id, p_related_entity_type,
    v_balance - p_amount
  ) RETURNING id INTO v_transaction_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'new_balance', v_balance - p_amount,
    'amount_deducted', p_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 增加积分函数
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT,
  p_related_entity_id BIGINT DEFAULT NULL,
  p_related_entity_type TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_balance INTEGER;
  v_transaction_id BIGINT;
BEGIN
  -- 锁定用户积分行
  SELECT balance INTO v_balance
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- 检查用户是否有积分记录
  IF v_balance IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'user_not_found',
      'message', '用户积分记录不存在'
    );
  END IF;
  
  -- 增加积分
  UPDATE user_credits
  SET balance = balance + p_amount,
      total_earned = total_earned + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- 记录交易
  INSERT INTO credit_transactions (
    user_id, amount, type, description,
    related_entity_id, related_entity_type,
    balance_after
  ) VALUES (
    p_user_id, p_amount, p_type, p_description,
    p_related_entity_id, p_related_entity_type,
    v_balance + p_amount
  ) RETURNING id INTO v_transaction_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'new_balance', v_balance + p_amount,
    'amount_added', p_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 查询余额函数
CREATE OR REPLACE FUNCTION get_user_credit_balance(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  SELECT balance INTO v_balance
  FROM user_credits
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(v_balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 授予执行权限给 authenticated 用户
GRANT EXECUTE ON FUNCTION deduct_credits TO authenticated;
GRANT EXECUTE ON FUNCTION add_credits TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_credit_balance TO authenticated;
