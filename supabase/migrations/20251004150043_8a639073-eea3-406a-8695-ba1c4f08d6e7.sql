-- Enable PostGIS extension for geospatial capabilities
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create properties table with comprehensive apartment data
CREATE TABLE IF NOT EXISTS public.properties (
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

-- Enable RLS on properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Allow public read access to properties
CREATE POLICY "Properties are viewable by everyone"
ON public.properties FOR SELECT
USING (true);

-- Price history tracking
CREATE TABLE IF NOT EXISTS public.price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    min_price INTEGER,
    max_price INTEGER,
    price_change INTEGER,
    price_change_percentage DECIMAL(5,2),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_prices CHECK (
        min_price IS NULL OR min_price >= 0
    )
);

ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Price history is viewable by everyone"
ON public.price_history FOR SELECT
USING (true);

-- Property concessions
CREATE TABLE IF NOT EXISTS public.property_concessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    concession_type VARCHAR(100),
    description TEXT,
    value_amount INTEGER,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.property_concessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Concessions are viewable by everyone"
ON public.property_concessions FOR SELECT
USING (true);

-- Scraping jobs tracking
CREATE TABLE IF NOT EXISTS public.scraping_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    source VARCHAR(50),
    search_criteria JSONB,
    
    -- Results
    properties_found INTEGER DEFAULT 0,
    properties_new INTEGER DEFAULT 0,
    properties_updated INTEGER DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_status CHECK (
        status IN ('pending', 'running', 'completed', 'failed', 'cancelled')
    )
);

ALTER TABLE public.scraping_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scraping jobs are viewable by authenticated users"
ON public.scraping_jobs FOR SELECT
TO authenticated
USING (true);

-- Scraping errors log
CREATE TABLE IF NOT EXISTS public.scraping_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.scraping_jobs(id) ON DELETE CASCADE,
    error_type VARCHAR(100),
    error_message TEXT,
    stack_trace TEXT,
    url TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.scraping_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scraping errors are viewable by authenticated users"
ON public.scraping_errors FOR SELECT
TO authenticated
USING (true);

-- Market snapshots for intelligence
CREATE TABLE IF NOT EXISTS public.market_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    
    -- Market metrics
    total_properties INTEGER DEFAULT 0,
    avg_price INTEGER,
    median_price INTEGER,
    min_price INTEGER,
    max_price INTEGER,
    price_trend_7d DECIMAL(5,2),
    price_trend_30d DECIMAL(5,2),
    
    -- Inventory
    new_listings_7d INTEGER DEFAULT 0,
    new_listings_30d INTEGER DEFAULT 0,
    active_listings INTEGER DEFAULT 0,
    
    -- Velocity
    avg_days_on_market DECIMAL(5,1),
    
    -- Bedrooms breakdown
    studios_count INTEGER DEFAULT 0,
    one_br_count INTEGER DEFAULT 0,
    two_br_count INTEGER DEFAULT 0,
    three_br_count INTEGER DEFAULT 0,
    
    -- Timestamp
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(city, state, snapshot_date)
);

ALTER TABLE public.market_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Market snapshots are viewable by everyone"
ON public.market_snapshots FOR SELECT
USING (true);

-- AI-driven market predictions
CREATE TABLE IF NOT EXISTS public.market_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    
    -- Predictions
    predicted_price_change_30d DECIMAL(5,2),
    predicted_price_change_90d DECIMAL(5,2),
    confidence_score DECIMAL(3,2),
    
    -- Market conditions
    market_temperature VARCHAR(20),
    supply_demand_ratio DECIMAL(5,2),
    
    -- Recommendations
    best_time_to_rent VARCHAR(50),
    negotiation_leverage VARCHAR(20),
    
    -- Metadata
    model_version VARCHAR(50),
    prediction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_temperature CHECK (
        market_temperature IN ('hot', 'warm', 'balanced', 'cool', 'cold')
    )
);

ALTER TABLE public.market_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Market predictions are viewable by everyone"
ON public.market_predictions FOR SELECT
USING (true);

-- User preferences (requires authentication)
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Search preferences
    preferred_cities JSONB DEFAULT '[]'::jsonb,
    max_price INTEGER,
    min_bedrooms INTEGER,
    min_bathrooms DECIMAL(3,1),
    required_amenities JSONB DEFAULT '[]'::jsonb,
    
    -- Notification settings
    email_alerts BOOLEAN DEFAULT true,
    price_drop_alerts BOOLEAN DEFAULT true,
    new_listing_alerts BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
ON public.user_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.user_preferences FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- User saved apartments
CREATE TABLE IF NOT EXISTS public.saved_apartments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    apartment_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    notes TEXT,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, apartment_id)
);

ALTER TABLE public.saved_apartments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved apartments"
ON public.saved_apartments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own saved apartments"
ON public.saved_apartments FOR ALL
USING (auth.uid() = user_id);

-- Search history
CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    search_parameters JSONB NOT NULL,
    results_count INTEGER DEFAULT 0,
    search_location JSONB,
    radius INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own search history"
ON public.search_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own searches"
ON public.search_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- User POIs (Points of Interest)
CREATE TABLE IF NOT EXISTS public.user_pois (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    category VARCHAR(100),
    priority INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_pois ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own POIs"
ON public.user_pois FOR ALL
USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_city_state ON public.properties(city, state);
CREATE INDEX IF NOT EXISTS idx_properties_price_range ON public.properties(min_price, max_price);
CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_properties_active ON public.properties(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_properties_search_vector ON public.properties USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_properties_amenities ON public.properties USING GIN(amenities);

CREATE INDEX IF NOT EXISTS idx_price_history_property ON public.price_history(property_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON public.scraping_jobs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_snapshots_location ON public.market_snapshots(city, state, snapshot_date DESC);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_property_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.address, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for search vector
CREATE TRIGGER properties_search_vector_update
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION update_property_search_vector();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_preferences
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for properties last_updated
CREATE TRIGGER update_properties_last_updated
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();