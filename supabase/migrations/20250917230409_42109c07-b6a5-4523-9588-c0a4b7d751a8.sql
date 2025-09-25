-- Add missing preference columns for comprehensive apartment search

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS walkability_score_requirement text DEFAULT 'moderate',
ADD COLUMN IF NOT EXISTS ride_share_availability text DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS noise_level_tolerance text DEFAULT 'moderate',
ADD COLUMN IF NOT EXISTS diversity_index text DEFAULT 'moderate',
ADD COLUMN IF NOT EXISTS emergency_services_response_time text DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS cell_tower_coverage text DEFAULT 'good',
ADD COLUMN IF NOT EXISTS cable_streaming_options text[] DEFAULT '{}';

-- Update existing columns to match new naming convention
UPDATE public.user_profiles 
SET walkability_score_requirement = walkability_importance 
WHERE walkability_score_requirement IS NULL AND walkability_importance IS NOT NULL;

UPDATE public.user_profiles 
SET noise_level_tolerance = noise_tolerance_level 
WHERE noise_level_tolerance IS NULL AND noise_tolerance_level IS NOT NULL;

UPDATE public.user_profiles 
SET diversity_index = diversity_importance 
WHERE diversity_index IS NULL AND diversity_importance IS NOT NULL;

UPDATE public.user_profiles 
SET emergency_services_response_time = emergency_services_response 
WHERE emergency_services_response_time IS NULL AND emergency_services_response IS NOT NULL;

UPDATE public.user_profiles 
SET cell_tower_coverage = cell_coverage 
WHERE cell_tower_coverage IS NULL AND cell_coverage IS NOT NULL;

UPDATE public.user_profiles 
SET cable_streaming_options = streaming_options 
WHERE cable_streaming_options IS NULL AND streaming_options IS NOT NULL;