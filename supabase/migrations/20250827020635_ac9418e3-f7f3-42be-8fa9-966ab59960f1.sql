-- Update RLS policies for proper Stripe integration
DROP POLICY IF EXISTS "Allow webhook updates" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Create proper RLS policies
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT
  USING (user_id = auth.uid() OR user_email = auth.email());

CREATE POLICY "Users can insert their own orders" ON public.orders
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_email = auth.email());

-- Edge functions can update orders (webhooks and payment processing)
CREATE POLICY "Edge functions can update orders" ON public.orders
  FOR UPDATE
  USING (true);

-- Edge functions can insert orders (payment processing)
CREATE POLICY "Edge functions can insert orders" ON public.orders
  FOR INSERT
  WITH CHECK (true);

-- Add indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON public.orders(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON public.orders(stripe_session_id);

-- Add trigger to update timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_orders_updated_at_trigger ON public.orders;
CREATE TRIGGER update_orders_updated_at_trigger
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();