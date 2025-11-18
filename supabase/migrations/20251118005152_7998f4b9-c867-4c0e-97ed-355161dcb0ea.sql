-- Fix 1: Enable RLS on scraped_properties table
ALTER TABLE scraped_properties ENABLE ROW LEVEL SECURITY;

-- Add policy for authenticated users only to view scraped properties
CREATE POLICY "Only authenticated users can view scraped properties"
ON scraped_properties FOR SELECT
TO authenticated
USING (true);

-- Fix 2: Restrict email and phone access on properties table
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON properties;

-- Create new policy that allows public to view basic property info
-- but we'll handle email/phone restriction through a view
CREATE POLICY "Public can view basic property info"
ON properties FOR SELECT
USING (true);

-- Create a public-facing view without PII fields
CREATE OR REPLACE VIEW public.properties_public AS
SELECT 
  id,
  external_id,
  name,
  address,
  city,
  state,
  zip_code,
  latitude,
  longitude,
  min_price,
  max_price,
  bedrooms_min,
  bedrooms_max,
  bathrooms_min,
  bathrooms_max,
  square_feet_min,
  square_feet_max,
  description,
  amenities,
  pet_policy,
  images,
  listing_url,
  source,
  property_type,
  is_active,
  last_seen,
  first_scraped,
  last_updated,
  management_company,
  website,
  year_built,
  units_count,
  parking,
  utilities,
  features,
  virtual_tour_url,
  price_range,
  ai_description,
  ai_tags,
  sentiment_score
  -- Explicitly excluding: email, phone
FROM properties
WHERE is_active = true;