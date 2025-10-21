/*
  # Create orders table

  1. New Tables
    - `orders`
      - `id` (bigint, primary key, auto-increment)
      - `user_id` (bigint, references users(id))
      - `order_number` (text, unique, not null)
      - `membership_type` (text, not null)
      - `amount` (numeric, not null)
      - `status` (text, not null, default 'pending')
      - `payment_method` (text)
      - `payment_transaction_id` (text)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
      
  2. Security
    - Enable RLS on `orders` table
    - Add policy for authenticated users to read their own orders
    - Add policy for authenticated users to create orders
    - Add policy for admin users to manage all orders
    
  3. Indexes
    - Index on user_id for fast lookups
    - Index on order_number for unique constraint
    - Index on status for filtering
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  membership_type TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  payment_transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own orders
CREATE POLICY "Users can read own orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM public.users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Policy: Users can create their own orders
CREATE POLICY "Users can create own orders"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM public.users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Policy: Admin users can read all orders
CREATE POLICY "Admins can read all orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Policy: Admin users can update all orders
CREATE POLICY "Admins can update all orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Policy: Admin users can delete orders
CREATE POLICY "Admins can delete orders"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();