-- Add product details to cart_items table
ALTER TABLE public.cart_items
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS product_price NUMERIC;

-- Create function to auto-populate product details from products table
CREATE OR REPLACE FUNCTION public.populate_cart_item_details()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Get product details and populate them
  SELECT name, price 
  INTO NEW.product_name, NEW.product_price
  FROM public.products
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-populate on insert
DROP TRIGGER IF EXISTS populate_cart_item_details_trigger ON public.cart_items;
CREATE TRIGGER populate_cart_item_details_trigger
BEFORE INSERT ON public.cart_items
FOR EACH ROW
EXECUTE FUNCTION public.populate_cart_item_details();