-- Create missing tables that are referenced in the codebase

-- Create user_sessions table for data tracker
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID,
  device_info JSONB,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  logout_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_activity_logs table for data tracker
CREATE TABLE public.user_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_content_logs table for data tracker
CREATE TABLE public.user_content_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  content_type TEXT NOT NULL,
  action TEXT NOT NULL,
  content_id TEXT,
  content_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rental_offers table for offers page
CREATE TABLE public.rental_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  property_address TEXT NOT NULL,
  leasing_office_email TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  offer_details JSONB,
  ai_suggestions JSONB,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'responded', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_offers ENABLE ROW LEVEL SECURITY;

-- Create policies for user_sessions (public access for tracking)
CREATE POLICY "Sessions are publicly accessible for tracking" 
ON public.user_sessions 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create policies for user_activity_logs (public access for tracking)
CREATE POLICY "Activity logs are publicly accessible for tracking" 
ON public.user_activity_logs 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create policies for user_content_logs (public access for tracking)
CREATE POLICY "Content logs are publicly accessible for tracking" 
ON public.user_content_logs 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create policies for rental_offers
CREATE POLICY "Users can view their own offers" 
ON public.rental_offers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create offers" 
ON public.rental_offers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own offers" 
ON public.rental_offers 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_activity_logs_session_id ON public.user_activity_logs(session_id);
CREATE INDEX idx_user_content_logs_session_id ON public.user_content_logs(session_id);
CREATE INDEX idx_rental_offers_user_id ON public.rental_offers(user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_rental_offers_updated_at
BEFORE UPDATE ON public.rental_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();