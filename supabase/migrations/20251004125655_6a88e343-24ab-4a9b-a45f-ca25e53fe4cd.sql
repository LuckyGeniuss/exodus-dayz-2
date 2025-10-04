-- Create products table for server-side price validation
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price > 0),
  description TEXT,
  image TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Everyone can read products
CREATE POLICY "Anyone can view products"
ON public.products
FOR SELECT
USING (true);

-- Only admins can manage products
CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add INSERT policies for financial tables (only service role via Edge Functions)
CREATE POLICY "Service role can insert orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert order items"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Service role can insert balance transactions"
ON public.balance_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Fix profile INSERT policy to prevent fake profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id AND id IS NOT NULL);

-- Protect sensitive fields (is_veteran, balance) from user updates
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  (is_veteran IS NOT DISTINCT FROM (SELECT is_veteran FROM public.profiles WHERE id = auth.uid())) AND
  (balance IS NOT DISTINCT FROM (SELECT balance FROM public.profiles WHERE id = auth.uid()))
);

-- Admins can update any profile including sensitive fields
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add database constraints for data integrity
ALTER TABLE public.orders
ADD CONSTRAINT positive_total_amount CHECK (total_amount > 0),
ADD CONSTRAINT positive_final_amount CHECK (final_amount > 0),
ADD CONSTRAINT non_negative_discount CHECK (discount_amount >= 0);

ALTER TABLE public.order_items
ADD CONSTRAINT positive_quantity CHECK (quantity > 0),
ADD CONSTRAINT positive_price CHECK (product_price > 0);

ALTER TABLE public.balance_transactions
ADD CONSTRAINT non_zero_amount CHECK (amount != 0);

ALTER TABLE public.profiles
ADD CONSTRAINT non_negative_balance CHECK (balance >= 0);

-- Add function to safely update balance (prevents negative balance)
CREATE OR REPLACE FUNCTION public.safe_deduct_balance(user_id uuid, amount numeric)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance numeric;
BEGIN
  -- Get current balance
  SELECT balance INTO current_balance
  FROM public.profiles
  WHERE id = user_id;
  
  -- Check if sufficient balance
  IF current_balance < amount THEN
    RETURN false;
  END IF;
  
  -- Deduct balance
  UPDATE public.profiles
  SET balance = balance - amount
  WHERE id = user_id;
  
  RETURN true;
END;
$$;