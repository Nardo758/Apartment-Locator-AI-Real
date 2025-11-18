-- Fix the security definer view issue by making it SECURITY INVOKER
DROP VIEW IF EXISTS public.properties_public;

CREATE VIEW public.properties_public 
WITH (security_invoker = true) AS
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
FROM properties
WHERE is_active = true;