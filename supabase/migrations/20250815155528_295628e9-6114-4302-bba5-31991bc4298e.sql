-- Add missing columns to existing user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Austin, TX',
ADD COLUMN IF NOT EXISTS search_radius INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS max_drive_time INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS points_of_interest JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS budget INTEGER DEFAULT 2500,
ADD COLUMN IF NOT EXISTS bedrooms TEXT DEFAULT '1',
ADD COLUMN IF NOT EXISTS lifestyle TEXT,
ADD COLUMN IF NOT EXISTS work_schedule TEXT,
ADD COLUMN IF NOT EXISTS priorities TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS use_case TEXT,
ADD COLUMN IF NOT EXISTS has_completed_social_signup BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_completed_ai_programming BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS program_ai_prompt_dismissed BOOLEAN DEFAULT false;

-- Create function to handle new user signup if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, has_completed_social_signup)
  VALUES (NEW.id, NEW.email, true)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();