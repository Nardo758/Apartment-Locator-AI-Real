-- Create saved_apartments table
CREATE TABLE public.saved_apartments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  apartment_id TEXT NOT NULL,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, apartment_id)
);

-- Create apartments table for apartment data
CREATE TABLE public.apartments (
  id TEXT NOT NULL PRIMARY KEY,
  address TEXT NOT NULL,
  rent NUMERIC,
  bedrooms INTEGER,
  bathrooms NUMERIC,
  square_feet INTEGER,
  amenities JSONB,
  location_data JSONB,
  images JSONB,
  contact_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create search_history table
CREATE TABLE public.search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  search_parameters JSONB NOT NULL,
  results_count INTEGER NOT NULL DEFAULT 0,
  search_location JSONB,
  radius INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_pois table
CREATE TABLE public.user_pois (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  category TEXT NOT NULL,
  priority INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.saved_apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pois ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for saved_apartments
CREATE POLICY "Users can manage their own saved apartments" 
ON public.saved_apartments 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for apartments (public read access)
CREATE POLICY "Apartments are publicly readable" 
ON public.apartments 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert apartments" 
ON public.apartments 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create RLS policies for search_history
CREATE POLICY "Users can manage their own search history" 
ON public.search_history 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_pois
CREATE POLICY "Users can manage their own POIs" 
ON public.user_pois 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create triggers for updating timestamps
CREATE TRIGGER update_saved_apartments_updated_at
BEFORE UPDATE ON public.saved_apartments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_apartments_updated_at
BEFORE UPDATE ON public.apartments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_pois_updated_at
BEFORE UPDATE ON public.user_pois
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();