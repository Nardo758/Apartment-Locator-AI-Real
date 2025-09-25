-- Create user_profiles table for storing AI preferences and user data
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Location & Search Preferences
  location TEXT DEFAULT 'Austin, TX',
  search_radius INTEGER DEFAULT 25,
  max_drive_time INTEGER DEFAULT 30,
  points_of_interest JSONB DEFAULT '[]'::jsonb,
  
  -- Budget & Housing
  budget INTEGER DEFAULT 2500,
  bedrooms TEXT DEFAULT '1',
  amenities TEXT[] DEFAULT '{}',
  deal_breakers TEXT[] DEFAULT '{}',
  
  -- Lifestyle & Preferences
  lifestyle TEXT,
  work_schedule TEXT,
  priorities TEXT[] DEFAULT '{}',
  
  -- Legacy signup fields
  current_address TEXT,
  current_rent INTEGER,
  lease_expiration TEXT,
  lease_duration TEXT,
  move_timeline TEXT,
  gross_income INTEGER,
  credit_score TEXT,
  income_verified BOOLEAN DEFAULT false,
  work_address TEXT,
  transportation TEXT,
  other_locations JSONB DEFAULT '[]'::jsonb,
  employment_type TEXT,
  work_frequency TEXT,
  household_size TEXT,
  pet_info TEXT,
  neighborhoods TEXT,
  rental_history TEXT,
  negotiation_comfort TEXT,
  communication TEXT[] DEFAULT '{}',
  
  -- Additional Information
  bio TEXT,
  use_case TEXT,
  additional_notes TEXT,
  
  -- AI and Search preferences (JSON for flexibility)
  ai_preferences JSONB DEFAULT '{}'::jsonb,
  search_criteria JSONB DEFAULT '{}'::jsonb,
  
  -- Onboarding status
  has_completed_social_signup BOOLEAN DEFAULT false,
  has_completed_ai_programming BOOLEAN DEFAULT false,
  program_ai_prompt_dismissed BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
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

CREATE POLICY "Users can delete their own profile" 
ON public.user_profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, has_completed_social_signup)
  VALUES (NEW.id, NEW.email, true);
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();