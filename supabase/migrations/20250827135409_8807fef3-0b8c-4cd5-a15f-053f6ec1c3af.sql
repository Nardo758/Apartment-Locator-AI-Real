-- Create subscribers table to track plan access and subscriptions
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  stripe_customer_id TEXT,
  stripe_session_id TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'pro', 'premium')),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired')),
  plan_start TIMESTAMPTZ DEFAULT now(),
  plan_end TIMESTAMPTZ NOT NULL,
  access_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(email, plan_type)
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies for subscribers table
CREATE POLICY "Users can view their own subscription" 
ON public.subscribers 
FOR SELECT 
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Edge functions can insert subscriptions" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Edge functions can update subscriptions" 
ON public.subscribers 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_subscribers_updated_at();

-- Create access tokens table for guest access
CREATE TABLE IF NOT EXISTS public.access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on access tokens
ALTER TABLE public.access_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for access tokens
CREATE POLICY "Tokens are publicly readable for validation" 
ON public.access_tokens 
FOR SELECT 
USING (true);