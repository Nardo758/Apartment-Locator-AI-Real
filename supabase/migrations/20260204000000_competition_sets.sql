-- Create competition_sets table for landlords to track competitor properties
CREATE TABLE IF NOT EXISTS public.competition_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  own_property_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  alerts_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create competition_set_competitors table to store competitor properties within sets
CREATE TABLE IF NOT EXISTS public.competition_set_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID NOT NULL REFERENCES public.competition_sets(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id),
  address VARCHAR(500) NOT NULL,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  bedrooms INTEGER,
  bathrooms NUMERIC(3, 1),
  square_feet INTEGER,
  current_rent NUMERIC(10, 2),
  amenities JSONB DEFAULT '[]'::jsonb,
  concessions JSONB DEFAULT '[]'::jsonb,
  last_updated TIMESTAMPTZ DEFAULT now(),
  source VARCHAR(50) DEFAULT 'manual',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_competition_sets_user_id ON public.competition_sets(user_id);
CREATE INDEX idx_competition_sets_updated_at ON public.competition_sets(updated_at DESC);
CREATE INDEX idx_competition_set_competitors_set_id ON public.competition_set_competitors(set_id);
CREATE INDEX idx_competition_set_competitors_created_at ON public.competition_set_competitors(created_at DESC);

-- Create spatial index for location-based queries (if PostGIS is available)
-- Uncomment if using PostGIS extension:
-- CREATE INDEX idx_competition_set_competitors_location 
-- ON public.competition_set_competitors 
-- USING GIST(ST_MakePoint(longitude::double precision, latitude::double precision)::geography);

-- Enable Row Level Security
ALTER TABLE public.competition_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_set_competitors ENABLE ROW LEVEL SECURITY;

-- Create policies for competition_sets table
CREATE POLICY "Users can view their own competition sets" 
ON public.competition_sets 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own competition sets" 
ON public.competition_sets 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own competition sets" 
ON public.competition_sets 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own competition sets" 
ON public.competition_sets 
FOR DELETE 
USING (user_id = auth.uid());

-- Create policies for competition_set_competitors table
CREATE POLICY "Users can view competitors in their own sets" 
ON public.competition_set_competitors 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.competition_sets 
    WHERE competition_sets.id = competition_set_competitors.set_id 
    AND competition_sets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert competitors into their own sets" 
ON public.competition_set_competitors 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.competition_sets 
    WHERE competition_sets.id = set_id 
    AND competition_sets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update competitors in their own sets" 
ON public.competition_set_competitors 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.competition_sets 
    WHERE competition_sets.id = set_id 
    AND competition_sets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete competitors from their own sets" 
ON public.competition_set_competitors 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.competition_sets 
    WHERE competition_sets.id = set_id 
    AND competition_sets.user_id = auth.uid()
  )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_competition_sets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_competition_sets_updated_at
BEFORE UPDATE ON public.competition_sets
FOR EACH ROW
EXECUTE FUNCTION public.update_competition_sets_updated_at();

-- Create function to update last_updated timestamp for competitors
CREATE OR REPLACE FUNCTION public.update_competitor_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic last_updated timestamp
CREATE TRIGGER update_competitor_last_updated
BEFORE UPDATE ON public.competition_set_competitors
FOR EACH ROW
EXECUTE FUNCTION public.update_competitor_last_updated();

-- Add comments for documentation
COMMENT ON TABLE public.competition_sets IS 'Stores competition sets created by landlords to track competitor properties';
COMMENT ON TABLE public.competition_set_competitors IS 'Stores competitor property details within competition sets';
COMMENT ON COLUMN public.competition_sets.own_property_ids IS 'JSON array of property IDs that the landlord owns and is comparing against';
COMMENT ON COLUMN public.competition_set_competitors.source IS 'Source of competitor data: manual, scraper, or api';
COMMENT ON COLUMN public.competition_set_competitors.concessions IS 'JSON array of concession objects with type, description, and value';
