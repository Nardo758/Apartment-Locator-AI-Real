-- Create user profiles table to store onboarding data
CREATE TABLE public.user_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  
  -- Current living situation
  current_address text,
  current_rent numeric,
  lease_expiration date,
  lease_duration text,
  move_timeline text,
  
  -- Budget and income
  gross_income numeric,
  max_budget numeric,
  credit_score text,
  income_verified boolean DEFAULT false,
  
  -- Important locations
  work_address text,
  max_commute integer DEFAULT 30,
  transportation text,
  other_locations jsonb DEFAULT '[]'::jsonb,
  employment_type text,
  work_frequency text,
  
  -- Housing preferences
  min_bedrooms text,
  household_size text,
  amenities text[] DEFAULT '{}',
  deal_breakers text[] DEFAULT '{}',
  pet_info text,
  
  -- Final details
  neighborhoods text,
  rental_history text,
  negotiation_comfort text,
  communication text[] DEFAULT '{}',
  additional_notes text,
  
  -- AI personalization data
  ai_preferences jsonb DEFAULT '{}'::jsonb,
  search_criteria jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();