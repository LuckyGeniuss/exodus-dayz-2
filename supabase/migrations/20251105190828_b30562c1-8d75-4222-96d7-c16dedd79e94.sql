-- Add promotions table for discount system
CREATE TABLE public.promotions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id text NOT NULL,
  discount_percent integer NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  start_date timestamp with time zone NOT NULL DEFAULT now(),
  end_date timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Anyone can view active promotions
CREATE POLICY "Anyone can view active promotions" 
ON public.promotions 
FOR SELECT 
USING (is_active = true AND start_date <= now() AND (end_date IS NULL OR end_date > now()));

-- Admins can manage promotions
CREATE POLICY "Admins can manage promotions" 
ON public.promotions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add viewed_products table for history
CREATE TABLE public.viewed_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  product_id text NOT NULL,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.viewed_products ENABLE ROW LEVEL SECURITY;

-- Users can manage their own viewed products
CREATE POLICY "Users can manage own viewed products" 
ON public.viewed_products 
FOR ALL 
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_viewed_products_user_id ON public.viewed_products(user_id);
CREATE INDEX idx_viewed_products_viewed_at ON public.viewed_products(viewed_at DESC);
CREATE INDEX idx_promotions_product_id ON public.promotions(product_id) WHERE is_active = true;