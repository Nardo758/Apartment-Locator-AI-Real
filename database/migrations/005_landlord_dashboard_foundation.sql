-- Migration 005: Landlord Dashboard Foundation
-- Creates all tables and fields needed for the Landlord Dashboard feature
-- Date: 2026-02-04

-- =====================================================
-- PART 1: Update Users Table (Profile Fields)
-- =====================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(100);

-- =====================================================
-- PART 2: Update Properties Table (Landlord Ownership)
-- =====================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS landlord_id UUID REFERENCES users(id);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_landlord_owned BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS occupancy_status VARCHAR(50) DEFAULT 'vacant';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS current_tenant_id UUID;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS lease_start_date TIMESTAMP;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS lease_end_date TIMESTAMP;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS days_vacant INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS last_occupied_date TIMESTAMP;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS target_rent DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS actual_rent DECIMAL(10,2);

-- Create index for landlord queries
CREATE INDEX IF NOT EXISTS idx_properties_landlord ON properties(landlord_id) WHERE is_landlord_owned = true;
CREATE INDEX IF NOT EXISTS idx_properties_occupancy ON properties(occupancy_status) WHERE is_landlord_owned = true;
CREATE INDEX IF NOT EXISTS idx_properties_days_vacant ON properties(days_vacant) WHERE is_landlord_owned = true;

-- =====================================================
-- PART 3: Update Market Snapshots Table (Landlord Intelligence)
-- =====================================================
ALTER TABLE market_snapshots ADD COLUMN IF NOT EXISTS inventory_level DECIMAL(5,2);
ALTER TABLE market_snapshots ADD COLUMN IF NOT EXISTS leverage_score INTEGER;
ALTER TABLE market_snapshots ADD COLUMN IF NOT EXISTS rent_change_1m DECIMAL(5,2);
ALTER TABLE market_snapshots ADD COLUMN IF NOT EXISTS rent_change_3m DECIMAL(5,2);
ALTER TABLE market_snapshots ADD COLUMN IF NOT EXISTS rent_change_12m DECIMAL(5,2);
ALTER TABLE market_snapshots ADD COLUMN IF NOT EXISTS supply_trend VARCHAR(50);
ALTER TABLE market_snapshots ADD COLUMN IF NOT EXISTS demand_trend VARCHAR(50);
ALTER TABLE market_snapshots ADD COLUMN IF NOT EXISTS ai_recommendation TEXT;

-- =====================================================
-- PART 4: Create Competition Sets Table
-- =====================================================
CREATE TABLE IF NOT EXISTS competition_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  own_property_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  alerts_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for competition sets
CREATE INDEX IF NOT EXISTS idx_competition_sets_user ON competition_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_competition_sets_updated ON competition_sets(updated_at DESC);

-- =====================================================
-- PART 5: Create Competition Set Competitors Table
-- =====================================================
CREATE TABLE IF NOT EXISTS competition_set_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID NOT NULL REFERENCES competition_sets(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id),
  address VARCHAR(500) NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  square_feet INTEGER,
  current_rent DECIMAL(10,2),
  amenities JSONB DEFAULT '[]'::jsonb,
  concessions JSONB DEFAULT '[]'::jsonb,
  last_updated TIMESTAMP DEFAULT NOW(),
  source VARCHAR(50) DEFAULT 'manual',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for competitor queries
CREATE INDEX IF NOT EXISTS idx_competitors_set ON competition_set_competitors(set_id);
CREATE INDEX IF NOT EXISTS idx_competitors_property ON competition_set_competitors(property_id);
CREATE INDEX IF NOT EXISTS idx_competitors_active ON competition_set_competitors(is_active) WHERE is_active = true;

-- Spatial index for geo queries (if PostGIS extension is available)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_competitors_location ON competition_set_competitors USING GIST(ST_MakePoint(longitude::double precision, latitude::double precision)::geography)';
  END IF;
END
$$;

-- =====================================================
-- PART 6: Create Pricing Alerts Table
-- =====================================================
CREATE TABLE IF NOT EXISTS pricing_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  set_id UUID REFERENCES competition_sets(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id),
  competitor_id UUID,
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) DEFAULT 'info',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  dismissed_at TIMESTAMP
);

-- Indexes for alert queries
CREATE INDEX IF NOT EXISTS idx_alerts_user ON pricing_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_set ON pricing_alerts(set_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON pricing_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_unread ON pricing_alerts(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_alerts_created ON pricing_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON pricing_alerts(severity);

-- =====================================================
-- PART 7: Create Alert Preferences Table
-- =====================================================
CREATE TABLE IF NOT EXISTS alert_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  price_changes BOOLEAN DEFAULT true,
  concessions BOOLEAN DEFAULT true,
  vacancy_risk BOOLEAN DEFAULT true,
  market_trends BOOLEAN DEFAULT true,
  delivery_email BOOLEAN DEFAULT true,
  delivery_sms BOOLEAN DEFAULT false,
  delivery_inapp BOOLEAN DEFAULT true,
  delivery_push BOOLEAN DEFAULT false,
  frequency VARCHAR(20) DEFAULT 'realtime',
  quiet_hours_start VARCHAR(5),
  quiet_hours_end VARCHAR(5),
  price_threshold DECIMAL(10,2) DEFAULT 50.00,
  vacancy_threshold INTEGER DEFAULT 30,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for user lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_alert_preferences_user ON alert_preferences(user_id);

-- =====================================================
-- PART 8: Add Comments for Documentation
-- =====================================================
COMMENT ON TABLE competition_sets IS 'Tracks groups of competitor properties for landlords';
COMMENT ON TABLE competition_set_competitors IS 'Individual competitor properties within competition sets';
COMMENT ON TABLE pricing_alerts IS 'Automated alerts for market changes and pricing updates';
COMMENT ON TABLE alert_preferences IS 'User preferences for alert delivery and filtering';

COMMENT ON COLUMN properties.landlord_id IS 'Owner of the property if landlord-owned';
COMMENT ON COLUMN properties.is_landlord_owned IS 'Flag indicating if property is owned by a landlord user';
COMMENT ON COLUMN properties.occupancy_status IS 'Current occupancy status: vacant, occupied, pending';
COMMENT ON COLUMN properties.days_vacant IS 'Number of days the property has been vacant';
COMMENT ON COLUMN properties.target_rent IS 'Desired rental price set by landlord';
COMMENT ON COLUMN properties.actual_rent IS 'Current or last achieved rental price';

COMMENT ON COLUMN market_snapshots.leverage_score IS 'Market leverage score (0-100) indicating landlord vs tenant advantage';
COMMENT ON COLUMN market_snapshots.inventory_level IS 'Percentage of available inventory in the market';
COMMENT ON COLUMN market_snapshots.rent_change_1m IS 'Month-over-month rent change percentage';

-- =====================================================
-- PART 9: Create Updated At Trigger Functions
-- =====================================================
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to competition_sets
DROP TRIGGER IF EXISTS update_competition_sets_updated_at ON competition_sets;
CREATE TRIGGER update_competition_sets_updated_at
  BEFORE UPDATE ON competition_sets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to alert_preferences
DROP TRIGGER IF EXISTS update_alert_preferences_updated_at ON alert_preferences;
CREATE TRIGGER update_alert_preferences_updated_at
  BEFORE UPDATE ON alert_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PART 10: Verify Migration Success
-- =====================================================
-- Check that all tables exist
DO $$
DECLARE
  missing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'competition_sets') THEN
    missing_tables := array_append(missing_tables, 'competition_sets');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'competition_set_competitors') THEN
    missing_tables := array_append(missing_tables, 'competition_set_competitors');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pricing_alerts') THEN
    missing_tables := array_append(missing_tables, 'pricing_alerts');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alert_preferences') THEN
    missing_tables := array_append(missing_tables, 'alert_preferences');
  END IF;
  
  IF array_length(missing_tables, 1) > 0 THEN
    RAISE EXCEPTION 'Migration failed: missing tables: %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE 'Migration 005 completed successfully. All tables created.';
  END IF;
END
$$;
