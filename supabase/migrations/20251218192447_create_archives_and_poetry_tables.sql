/*
  # 创建古籍和诗词记录表

  ## 新建表

  ### 1. archives（古籍扫描记录表）
    - `id` (bigserial, 主键)
    - `user_id` (uuid, 外键)
    - `title` (text, 标题)
    - `image_url` (text, 图片URL)
    - `thumbnail_url` (text, 缩略图URL)
    - `original_text` (text, OCR 原始文本)
    - `analyzed_data` (jsonb, AI 分析的完整 JSON)
    - `punctuated_text` (text, 加标点的文本)
    - `status` (text, 状态)
    - `error_message` (text, 错误信息)
    - `credits_cost` (integer, 消耗积分)
    - `processing_time_ms` (integer, 处理耗时)
    - `created_at` (timestamptz, 创建时间)
    - `updated_at` (timestamptz, 更新时间)

  ### 2. poetry_generations（诗词创作记录表）
    - `id` (bigserial, 主键)
    - `user_id` (uuid, 外键)
    - `title` (text, 标题)
    - `keywords` (text, 关键词)
    - `style` (text, 风格代码)
    - `style_name` (text, 风格名称)
    - `content` (text, 诗词内容)
    - `explanation` (text, 诗词解析)
    - `style_analysis` (text, 格律分析)
    - `credits_cost` (integer, 消耗积分)
    - `is_favorite` (boolean, 是否收藏)
    - `created_at` (timestamptz, 创建时间)
    - `updated_at` (timestamptz, 更新时间)

  ## 安全策略
    - 所有表启用 RLS
    - archives: 用户可读写自己，admin 可读所有
    - poetry_generations: 用户可读写自己，admin 可读所有
*/

-- 创建 archives 表
CREATE TABLE IF NOT EXISTS archives (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '未命名古籍',
  image_url text NOT NULL,
  thumbnail_url text,
  original_text text,
  analyzed_data jsonb,
  punctuated_text text,
  status text NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'completed', 'failed')),
  error_message text,
  credits_cost integer NOT NULL DEFAULT 0,
  processing_time_ms integer,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 创建 poetry_generations 表
CREATE TABLE IF NOT EXISTS poetry_generations (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '未命名诗词',
  keywords text NOT NULL,
  style text NOT NULL,
  style_name text NOT NULL,
  content text NOT NULL,
  explanation text,
  style_analysis text,
  credits_cost integer NOT NULL DEFAULT 0,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_archives_user_id ON archives(user_id);
CREATE INDEX IF NOT EXISTS idx_archives_created_at ON archives(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_poetry_generations_user_id ON poetry_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_poetry_generations_created_at ON poetry_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_poetry_generations_is_favorite ON poetry_generations(user_id, is_favorite) WHERE is_favorite = true;

-- 启用 RLS
ALTER TABLE archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE poetry_generations ENABLE ROW LEVEL SECURITY;

-- archives 的 RLS 策略
CREATE POLICY "Users can view own archives"
  ON archives FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own archives"
  ON archives FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own archives"
  ON archives FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own archives"
  ON archives FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all archives"
  ON archives FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- poetry_generations 的 RLS 策略
CREATE POLICY "Users can view own poetry"
  ON poetry_generations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own poetry"
  ON poetry_generations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own poetry"
  ON poetry_generations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own poetry"
  ON poetry_generations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all poetry"
  ON poetry_generations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
