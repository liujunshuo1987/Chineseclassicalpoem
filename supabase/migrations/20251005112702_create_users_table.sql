/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (int8, primary key, auto increment)
      - `username` (text)
      - `membership_type` (text) - Values: trial/monthly/annual
      - `trial_start` (timestamp) - Trial start timestamp
      - `expiry_date` (timestamp) - Membership expiry timestamp

  2. Security
    - Enable RLS on `users` table
    - Add policy for authenticated users to read their own data
    - Add policy for authenticated users to update their own data
    - Add policy for authenticated users to insert their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id bigserial PRIMARY KEY,
  username text NOT NULL,
  membership_type text DEFAULT 'trial',
  trial_start timestamptz,
  expiry_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = (auth.jwt()->>'sub')::bigint);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = (auth.jwt()->>'sub')::bigint)
  WITH CHECK (id = (auth.jwt()->>'sub')::bigint);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (auth.jwt()->>'sub')::bigint);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_membership_type ON users(membership_type);
CREATE INDEX IF NOT EXISTS idx_users_expiry_date ON users(expiry_date);