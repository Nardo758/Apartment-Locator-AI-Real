-- Apartment Scraping Framework Database Schema for Hetzner PostgreSQL
-- Optimized for high-performance apartment data storage and analytics

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geospatial data

-- ============================================================================
-- CORE PROPERTY DATA TABLES
-- ============================================================================

-- Main properties table with comprehensive apartment data
CREATE TABLE properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    external_id VARCHAR(255) NOT NULL,
    source VARCHAR(100) NOT NULL,
    
    -- Basic property information
    name VARCHAR(500) NOT NULL,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10),
    
    -- Pricing information
    current_price INTEGER NOT NULL,
    original_price INTEGER,
    price_per_sqft DECIMAL(8,2),
    
    -- Property details
    bedrooms INTEGER NOT NULL DEFAULT 0,
    bathrooms DECIMAL(3,1) NOT NULL DEFAULT 0,
    sqft INTEGER,
    year_built INTEGER,
    
    -- Availability
    availability TEXT,
    availability_type VARCHAR(20) CHECK (availability_type IN ('immediate', 'soon', 'waitlist', 'unknown')),
    days_on_market INTEGER,
    
    -- Features and amenities (stored as JSONB for flexibility)
    features JSONB DEFAULT '[]',
    amenities JSONB DEFAULT '[]',
    
    -- Media
    images JSONB DEFAULT '[]',
    virtual_tour_url TEXT,
    
    -- Contact information
    phone_number VARCHAR(20),
    website_url TEXT,
    listing_url TEXT NOT NULL,
    
    -- Location data (using PostGIS for geospatial queries)
    coordinates GEOGRAPHY(POINT, 4326),
    
    -- Property policies
    pet_policy TEXT,
    parking TEXT,
    lease_terms JSONB DEFAULT '{}',
    
    -- AI-enhanced data
    match_score INTEGER,
    ai_predicted_price INTEGER,
    market_velocity VARCHAR(20) CHECK (market_velocity IN ('hot', 'normal', 'slow')),
    
    -- Metadata
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    data_quality_score INTEGER DEFAULT 0,
    
    -- Constraints
    UNIQUE(external_id, source),
    CHECK (current_price > 0),
    CHECK (bedrooms >= 0 AND bedrooms <= 20),
    CHECK (bathrooms >= 0 AND bathrooms <= 20),
    CHECK (sqft IS NULL OR sqft > 0),
    CHECK (year_built IS NULL OR (year_built >= 1800 AND year_built <= EXTRACT(YEAR FROM NOW()) + 5))
);

-- Price history tracking
CREATE TABLE price_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    price INTEGER NOT NULL,
    price_change INTEGER, -- Difference from previous price
    price_change_percent DECIMAL(5,2), -- Percentage change
    date_recorded TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(100) NOT NULL,
    
    CHECK (price > 0)
);

-- Property concessions and deals
CREATE TABLE property_concessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    concession_type VARCHAR(100) NOT NULL,
    value_description TEXT,
    estimated_value INTEGER,
    probability DECIMAL(5,2), -- 0-100 probability percentage
    confidence_level VARCHAR(20) CHECK (confidence_level IN ('low', 'medium', 'high')),
    reasoning TEXT,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SCRAPING OPERATIONS TABLES
-- ============================================================================

-- Scraping jobs tracking
CREATE TABLE scraping_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id VARCHAR(255) UNIQUE NOT NULL,
    source VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    
    -- Job status and configuration
    status VARCHAR(20) CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
    priority INTEGER DEFAULT 5,
    max_pages INTEGER DEFAULT 10,
    
    -- Timing
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    
    -- Results
    properties_found INTEGER DEFAULT 0,
    properties_processed INTEGER DEFAULT 0,
    properties_new INTEGER DEFAULT 0,
    properties_updated INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    
    -- Retry logic
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Additional data
    options JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    error_details JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraping errors and issues
CREATE TABLE scraping_errors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES scraping_jobs(id) ON DELETE CASCADE,
    error_type VARCHAR(50) NOT NULL,
    error_message TEXT NOT NULL,
    url TEXT,
    stack_trace TEXT,
    is_retryable BOOLEAN DEFAULT false,
    retry_count INTEGER DEFAULT 0,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MARKET INTELLIGENCE TABLES
-- ============================================================================

-- Market data snapshots
CREATE TABLE market_snapshots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    
    -- Market metrics
    median_rent INTEGER,
    average_rent INTEGER,
    rent_change_percent DECIMAL(5,2),
    average_days_on_market INTEGER,
    occupancy_rate DECIMAL(5,2),
    total_properties_analyzed INTEGER,
    
    -- Market conditions
    market_velocity VARCHAR(20) CHECK (market_velocity IN ('hot', 'normal', 'slow')),
    competitiveness_score INTEGER, -- 0-100 scale
    
    -- Price distribution
    price_percentile_25 INTEGER,
    price_percentile_75 INTEGER,
    price_per_sqft_median DECIMAL(8,2),
    
    -- Trending data
    trending_concessions JSONB DEFAULT '[]',
    price_trends JSONB DEFAULT '{}',
    
    -- Analysis metadata
    snapshot_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_sources JSONB DEFAULT '[]',
    confidence_score DECIMAL(3,2), -- 0-1 confidence in analysis
    
    UNIQUE(city, state, snapshot_date::DATE)
);

-- Market predictions and forecasts
CREATE TABLE market_predictions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    
    -- Prediction details
    prediction_type VARCHAR(50) NOT NULL, -- 'price', 'velocity', 'concessions'
    predicted_value JSONB NOT NULL,
    confidence_level DECIMAL(3,2), -- 0-1 confidence
    prediction_horizon_days INTEGER, -- How far into future
    
    -- Model information
    model_version VARCHAR(50),
    features_used JSONB DEFAULT '[]',
    
    -- Validation
    actual_value JSONB,
    accuracy_score DECIMAL(3,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- USER PREFERENCES AND NOTIFICATIONS
-- ============================================================================

-- User notification preferences
CREATE TABLE user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    push_token TEXT,
    
    -- Notification preferences
    price_drop_notifications BOOLEAN DEFAULT true,
    price_drop_min_amount INTEGER DEFAULT 50,
    price_drop_min_percent DECIMAL(5,2) DEFAULT 5.0,
    
    new_listing_notifications BOOLEAN DEFAULT true,
    market_alert_notifications BOOLEAN DEFAULT true,
    
    -- Search preferences
    max_price INTEGER,
    min_bedrooms INTEGER,
    max_bedrooms INTEGER,
    min_bathrooms DECIMAL(3,1),
    preferred_cities JSONB DEFAULT '[]',
    preferred_amenities JSONB DEFAULT '[]',
    pet_friendly BOOLEAN,
    
    -- Notification frequency
    notification_frequency VARCHAR(20) DEFAULT 'immediate' 
        CHECK (notification_frequency IN ('immediate', 'daily', 'weekly')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Notifications sent to users
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES user_preferences(user_id),
    
    -- Notification details
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    
    -- Related data
    property_id UUID REFERENCES properties(id),
    data JSONB DEFAULT '{}',
    
    -- Delivery
    channels JSONB DEFAULT '[]', -- ['email', 'push', 'sms']
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Delivery attempts
    delivery_attempts INTEGER DEFAULT 0,
    last_error TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ANALYTICS AND REPORTING TABLES
-- ============================================================================

-- Daily aggregated statistics
CREATE TABLE daily_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    city VARCHAR(100),
    state VARCHAR(2),
    source VARCHAR(100),
    
    -- Scraping stats
    properties_scraped INTEGER DEFAULT 0,
    properties_new INTEGER DEFAULT 0,
    properties_updated INTEGER DEFAULT 0,
    scraping_jobs_completed INTEGER DEFAULT 0,
    scraping_success_rate DECIMAL(5,2),
    
    -- Market stats
    median_price INTEGER,
    price_change_percent DECIMAL(5,2),
    total_active_properties INTEGER,
    
    -- Performance stats
    average_response_time_ms INTEGER,
    cache_hit_rate DECIMAL(5,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(date, COALESCE(city, ''), COALESCE(state, ''), COALESCE(source, ''))
);

-- User activity tracking
CREATE TABLE user_activity (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255),
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- GEOCODING AND LOCATION DATA
-- ============================================================================

-- Cached geocoding results
CREATE TABLE geocoding_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    address_hash VARCHAR(64) UNIQUE NOT NULL, -- MD5 hash of normalized address
    original_address TEXT NOT NULL,
    
    -- Geocoding results
    coordinates GEOGRAPHY(POINT, 4326),
    formatted_address TEXT,
    
    -- Address components
    street_number VARCHAR(20),
    street_name VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United States',
    
    -- Geocoding metadata
    accuracy VARCHAR(20), -- 'exact', 'approximate', 'unknown'
    geocoding_source VARCHAR(50), -- 'google', 'mapbox', 'nominatim'
    confidence_score DECIMAL(3,2),
    
    -- Cache management
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    use_count INTEGER DEFAULT 1
);

-- Commute data cache
CREATE TABLE commute_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    origin_coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
    destination_coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
    transport_mode VARCHAR(20) NOT NULL CHECK (transport_mode IN ('driving', 'transit', 'walking', 'cycling')),
    
    -- Commute results
    duration_minutes INTEGER NOT NULL,
    distance_miles DECIMAL(8,2) NOT NULL,
    route_data JSONB DEFAULT '{}',
    
    -- Cache metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    
    UNIQUE(ST_SnapToGrid(origin_coordinates::geometry, 0.001), 
           ST_SnapToGrid(destination_coordinates::geometry, 0.001), 
           transport_mode)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Properties table indexes
CREATE INDEX idx_properties_city_state ON properties(city, state);
CREATE INDEX idx_properties_source ON properties(source);
CREATE INDEX idx_properties_price_range ON properties(current_price);
CREATE INDEX idx_properties_bedrooms_bathrooms ON properties(bedrooms, bathrooms);
CREATE INDEX idx_properties_scraped_at ON properties(scraped_at DESC);
CREATE INDEX idx_properties_active ON properties(is_active) WHERE is_active = true;
CREATE INDEX idx_properties_coordinates ON properties USING GIST(coordinates);
CREATE INDEX idx_properties_external_id ON properties(external_id);

-- Full-text search on property names and addresses
CREATE INDEX idx_properties_search ON properties USING GIN(
    to_tsvector('english', name || ' ' || address || ' ' || city)
);

-- Amenities and features search
CREATE INDEX idx_properties_amenities ON properties USING GIN(amenities);
CREATE INDEX idx_properties_features ON properties USING GIN(features);

-- Price history indexes
CREATE INDEX idx_price_history_property_date ON price_history(property_id, date_recorded DESC);
CREATE INDEX idx_price_history_date ON price_history(date_recorded DESC);

-- Scraping jobs indexes
CREATE INDEX idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX idx_scraping_jobs_source_city ON scraping_jobs(source, city, state);
CREATE INDEX idx_scraping_jobs_scheduled ON scraping_jobs(scheduled_at DESC);

-- Market snapshots indexes
CREATE INDEX idx_market_snapshots_city_date ON market_snapshots(city, state, snapshot_date DESC);

-- Notifications indexes
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Geocoding cache indexes
CREATE INDEX idx_geocoding_cache_hash ON geocoding_cache(address_hash);
CREATE INDEX idx_geocoding_cache_coordinates ON geocoding_cache USING GIST(coordinates);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update last_updated timestamp on properties
CREATE OR REPLACE FUNCTION update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_update_timestamp
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated();

-- Update price change calculations
CREATE OR REPLACE FUNCTION calculate_price_change()
RETURNS TRIGGER AS $$
DECLARE
    prev_price INTEGER;
BEGIN
    -- Get the most recent price for this property
    SELECT price INTO prev_price
    FROM price_history
    WHERE property_id = NEW.property_id
    ORDER BY date_recorded DESC
    LIMIT 1;
    
    IF prev_price IS NOT NULL THEN
        NEW.price_change = NEW.price - prev_price;
        NEW.price_change_percent = ROUND(((NEW.price - prev_price)::DECIMAL / prev_price * 100), 2);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER price_history_calculate_change
    BEFORE INSERT ON price_history
    FOR EACH ROW
    EXECUTE FUNCTION calculate_price_change();

-- Update geocoding cache usage
CREATE OR REPLACE FUNCTION update_geocoding_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE geocoding_cache 
    SET last_used = NOW(), use_count = use_count + 1
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active properties with latest market data
CREATE VIEW active_properties_with_market AS
SELECT 
    p.*,
    ph.price_change,
    ph.price_change_percent,
    ms.market_velocity as market_condition,
    ms.median_rent as market_median,
    CASE 
        WHEN p.current_price < ms.median_rent * 0.9 THEN 'below_market'
        WHEN p.current_price > ms.median_rent * 1.1 THEN 'above_market'
        ELSE 'market_rate'
    END as price_category
FROM properties p
LEFT JOIN LATERAL (
    SELECT price_change, price_change_percent
    FROM price_history
    WHERE property_id = p.id
    ORDER BY date_recorded DESC
    LIMIT 1
) ph ON true
LEFT JOIN LATERAL (
    SELECT market_velocity, median_rent
    FROM market_snapshots
    WHERE city = p.city AND state = p.state
    ORDER BY snapshot_date DESC
    LIMIT 1
) ms ON true
WHERE p.is_active = true;

-- Property search view with full-text search
CREATE VIEW property_search AS
SELECT 
    p.id,
    p.name,
    p.address,
    p.city,
    p.state,
    p.current_price,
    p.bedrooms,
    p.bathrooms,
    p.sqft,
    p.amenities,
    p.coordinates,
    p.listing_url,
    p.scraped_at,
    to_tsvector('english', p.name || ' ' || p.address || ' ' || p.city) as search_vector
FROM properties p
WHERE p.is_active = true;

-- Market intelligence summary
CREATE VIEW market_intelligence AS
SELECT 
    city,
    state,
    COUNT(*) as total_properties,
    ROUND(AVG(current_price)) as avg_price,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY current_price) as median_price,
    MIN(current_price) as min_price,
    MAX(current_price) as max_price,
    ROUND(AVG(sqft)) as avg_sqft,
    ROUND(AVG(CASE WHEN sqft > 0 THEN current_price::DECIMAL / sqft END), 2) as avg_price_per_sqft,
    COUNT(*) FILTER (WHERE availability_type = 'immediate') as immediately_available,
    ROUND(AVG(days_on_market)) as avg_days_on_market
FROM properties
WHERE is_active = true
GROUP BY city, state;

-- ============================================================================
-- FUNCTIONS FOR DATA ANALYSIS
-- ============================================================================

-- Function to get properties within radius
CREATE OR REPLACE FUNCTION get_properties_within_radius(
    center_lat DECIMAL,
    center_lng DECIMAL,
    radius_miles DECIMAL DEFAULT 5.0
)
RETURNS TABLE(
    id UUID,
    name VARCHAR,
    address VARCHAR,
    current_price INTEGER,
    distance_miles DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.address,
        p.current_price,
        ROUND(ST_Distance(p.coordinates, ST_Point(center_lng, center_lat)::geography) / 1609.34, 2) as distance_miles
    FROM properties p
    WHERE p.is_active = true
      AND p.coordinates IS NOT NULL
      AND ST_DWithin(p.coordinates, ST_Point(center_lng, center_lat)::geography, radius_miles * 1609.34)
    ORDER BY p.coordinates <-> ST_Point(center_lng, center_lat)::geography;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate market trends
CREATE OR REPLACE FUNCTION calculate_market_trend(
    p_city VARCHAR,
    p_state VARCHAR,
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
    metric VARCHAR,
    current_value DECIMAL,
    previous_value DECIMAL,
    change_percent DECIMAL,
    trend VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    WITH current_data AS (
        SELECT 
            AVG(current_price) as avg_price,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY current_price) as median_price,
            AVG(days_on_market) as avg_dom
        FROM properties
        WHERE city = p_city AND state = p_state AND is_active = true
          AND scraped_at >= NOW() - INTERVAL '7 days'
    ),
    historical_data AS (
        SELECT 
            AVG(current_price) as avg_price,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY current_price) as median_price,
            AVG(days_on_market) as avg_dom
        FROM properties
        WHERE city = p_city AND state = p_state AND is_active = true
          AND scraped_at BETWEEN NOW() - INTERVAL '37 days' AND NOW() - INTERVAL '30 days'
    )
    SELECT 
        'median_price'::VARCHAR,
        cd.median_price,
        hd.median_price,
        ROUND(((cd.median_price - hd.median_price) / hd.median_price * 100), 2),
        CASE 
            WHEN cd.median_price > hd.median_price * 1.02 THEN 'increasing'
            WHEN cd.median_price < hd.median_price * 0.98 THEN 'decreasing'
            ELSE 'stable'
        END
    FROM current_data cd, historical_data hd
    WHERE hd.median_price > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA AND CONFIGURATION
-- ============================================================================

-- Insert default user preferences template
INSERT INTO user_preferences (user_id, email) VALUES ('default_template', 'template@example.com')
ON CONFLICT DO NOTHING;

-- Create initial market snapshots for major cities
INSERT INTO market_snapshots (city, state, median_rent, total_properties_analyzed, confidence_score) VALUES
('austin', 'TX', 2100, 0, 0.0),
('dallas', 'TX', 1950, 0, 0.0),
('houston', 'TX', 1800, 0, 0.0)
ON CONFLICT DO NOTHING;