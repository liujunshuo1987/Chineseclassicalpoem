/*
  # Create orders table

  1. New Tables
    - `orders`
      - `id` (int8, primary key, auto increment)
      - `user_id` (int8) - Foreign key to users.id
      - `amount` (numeric) - Amount in cents/fen
      - `plan_type` (text) - Plan type (monthly/annual)
      - `status` (text) - Payment status
      - `created_at` (timestamp) - Order creation time
      - `paid_at` (timestamp) - Payment completion time

  2. Security
    - Enable RLS on `orders` table
    - Add policy for authenticated users to view their own orders
    - Add policy for authenticated users to create their own orders
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id bigserial PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount numeric(15,2) NOT NULL,
  plan_type text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  paid_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders table
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = (auth.jwt()->>'sub')::bigint);

CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (auth.jwt()->>'sub')::bigint);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);