-- Fix function search path issues by setting search_path
CREATE OR REPLACE FUNCTION public.update_subscribers_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix handle_new_user function search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, has_completed_social_signup)
  VALUES (NEW.id, NEW.email, true)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;