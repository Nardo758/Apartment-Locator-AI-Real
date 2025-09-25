-- Fix security warning by setting search path for the update function
DROP FUNCTION IF EXISTS update_orders_updated_at();

CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;