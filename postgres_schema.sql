-- Postgres Schema for Apartment Locator AI
-- Run this BEFORE migration script

-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Main properties table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(255) UNIQUE NOT NULL,
    source VARCHAR(50) NOT NULL,
    name VARCHAR(500) NOT NULL,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location GEOGRAPHY(Point, 4326),
    
    -- Pricing
    min_price INTEGER,
    max_price INTEGER,
    price_range VARCHAR(50),
    
    -- Property details
    bedrooms_min INTEGER,
    bedrooms_max INTEGER,
    bathrooms_min DECIMAL(3,1),
    bathrooms_max DECIMAL(3,1),
    square_feet_min INTEGER,
    square_feet_max INTEGER,
    
    -- Features and amenities (JSONB for flexible storage)
    amenities JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '{}'::jsonb,
    pet_policy JSONB DEFAULT '{}'::jsonb,
    parking JSONB DEFAULT '{}'::jsonb,
    utilities JSONB DEFAULT '{}'::jsonb,
    
    -- Media
    images JSONB DEFAULT '[]'::jsonb,
    virtual_tour_url TEXT,
    
    -- Additional info
    description TEXT,
    property_type VARCHAR(50),
    year_built INTEGER,
    units_count INTEGER,
    
    -- Contact
    phone VARCHAR(50),
    email VARCHAR(255),
    website TEXT,
    
    -- Management
    management_company VARCHAR(255),
    
    -- AI enhancements
    ai_description TEXT,
    ai_tags JSONB DEFAULT '[]'::jsonb,
    sentiment_score DECIMAL(3,2),
    
    -- Metadata
    listing_url TEXT NOT NULL,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_scraped TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- Search optimization
    search_vector tsvector,
    
    CONSTRAINT valid_coordinates CHECK (
        (latitude IS NULL AND longitude IS NULL) OR
        (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
    )
);

-- Price history tracking
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    min_price INTEGER,
    max_price INTEGER,
    price_change INTEGER,
    price_change_percentage DECIMAL(5,2),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_prices CHECK (
        min_price IS NULL OR min_price >= 0
    )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(min_price, max_price);
CREATE INDEX IF NOT EXISTS idx_properties_active ON properties(is_active);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_properties_search ON properties USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_properties_amenities ON properties USING GIN(amenities);
CREATE INDEX IF NOT EXISTS idx_price_history_property ON price_history(property_id);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded ON price_history(recorded_at);

-- Trigger to auto-update search_vector
CREATE OR REPLACE FUNCTION properties_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.address, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_search_vector_trigger
BEFORE INSERT OR UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION properties_search_vector_update();

-- Auto-update location from lat/lng
CREATE OR REPLACE FUNCTION properties_location_update() RETURNS trigger AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_location_trigger
BEFORE INSERT OR UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION properties_location_update();

-- View for active properties (commonly used)
CREATE OR REPLACE VIEW active_properties AS
SELECT * FROM properties
WHERE is_active = true
ORDER BY last_updated DESC;

COMMENT ON TABLE properties IS 'Apartment listings scraped from various sources';
COMMENT ON TABLE price_history IS 'Historical price tracking for properties';
COMMENT ON COLUMN properties.search_vector IS 'Full-text search vector (auto-updated)';
COMMENT ON COLUMN properties.location IS 'PostGIS geography point (auto-updated from lat/lng)';
