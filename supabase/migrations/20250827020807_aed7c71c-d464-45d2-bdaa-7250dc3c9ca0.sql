-- Fix security warning by properly recreating the function
DROP TRIGGER IF EXISTS update_orders_updated_at_trigger ON public.orders;
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

-- Recreate the trigger
CREATE TRIGGER update_orders_updated_at_trigger
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_orders_updated_at();