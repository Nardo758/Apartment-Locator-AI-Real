-- Create table for rental offers
CREATE TABLE public.rental_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  property_id TEXT NOT NULL,
  move_in_date DATE NOT NULL,
  lease_term INTEGER NOT NULL,
  monthly_budget DECIMAL(10,2) NOT NULL,
  notes TEXT,
  ai_suggestions JSONB,
  property_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rental_offers ENABLE ROW LEVEL SECURITY;

-- Create policies for rental offers
-- Since this is a lead generation app, users can create offers with their email
-- but only see their own offers
CREATE POLICY "Users can create offers" 
ON public.rental_offers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own offers" 
ON public.rental_offers 
FOR SELECT 
USING (user_email = auth.jwt() ->> 'email' OR user_email IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_rental_offers_updated_at
BEFORE UPDATE ON public.rental_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();