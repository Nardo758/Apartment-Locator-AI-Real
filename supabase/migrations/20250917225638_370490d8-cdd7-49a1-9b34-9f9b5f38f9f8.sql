-- Add new preference columns to user_profiles table for comprehensive apartment hunting preferences

-- Transportation & Mobility preferences
ALTER TABLE public.user_profiles 
ADD COLUMN public_transit_access text[] DEFAULT '{}',
ADD COLUMN walkability_importance text DEFAULT 'moderate',
ADD COLUMN bike_friendly boolean DEFAULT false,
ADD COLUMN ev_charging_stations boolean DEFAULT false,
ADD COLUMN airport_proximity text DEFAULT 'moderate',
ADD COLUMN highway_access boolean DEFAULT false;

-- Neighborhood & Community preferences  
ALTER TABLE public.user_profiles
ADD COLUMN school_district_quality text DEFAULT 'no-preference',
ADD COLUMN crime_rate_preference text DEFAULT 'low',
ADD COLUMN noise_tolerance_level text DEFAULT 'moderate',
ADD COLUMN population_density text DEFAULT 'moderate',
ADD COLUMN age_demographics text DEFAULT 'mixed',
ADD COLUMN diversity_importance text DEFAULT 'moderate',
ADD COLUMN local_culture_arts boolean DEFAULT false;

-- Safety & Security preferences
ALTER TABLE public.user_profiles
ADD COLUMN security_system_required boolean DEFAULT false,
ADD COLUMN gated_community_preference text DEFAULT 'no-preference',
ADD COLUMN emergency_services_response text DEFAULT 'standard',
ADD COLUMN flood_zone_avoidance boolean DEFAULT false,
ADD COLUMN fire_safety_features text[] DEFAULT '{}';

-- Shopping & Services preferences
ALTER TABLE public.user_profiles
ADD COLUMN grocery_store_types text[] DEFAULT '{}',
ADD COLUMN shopping_mall_access boolean DEFAULT false,
ADD COLUMN farmers_markets boolean DEFAULT false,
ADD COLUMN banking_access boolean DEFAULT false,
ADD COLUMN post_office_proximity boolean DEFAULT false,
ADD COLUMN dry_cleaning_services boolean DEFAULT false;

-- Technology & Connectivity preferences
ALTER TABLE public.user_profiles
ADD COLUMN internet_speed_requirement text DEFAULT 'standard',
ADD COLUMN cell_coverage text DEFAULT 'good',
ADD COLUMN smart_home_compatibility boolean DEFAULT false,
ADD COLUMN streaming_options text[] DEFAULT '{}';