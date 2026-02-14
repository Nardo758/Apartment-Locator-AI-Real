-- Enhanced Property Schema for Market Intelligence
-- Adds public financial data, property characteristics, and unit availability tracking

-- Add columns to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS year_built INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS year_renovated INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_class VARCHAR(1) CHECK (property_class IN ('A', 'B', 'C'));
ALTER TABLE properties ADD COLUMN IF NOT EXISTS building_type VARCHAR(50);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS parking_spaces INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS parking_ratio DECIMAL(4,2); -- spaces per unit
ALTER TABLE properties ADD COLUMN IF NOT EXISTS management_company VARCHAR(255);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS total_units INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS current_occupancy_percent DECIMAL(5,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS avg_days_to_lease INTEGER;

-- Public income fields (from listings)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS parking_fee_monthly DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS pet_rent_monthly DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS pet_deposit DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS application_fee DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS admin_fee DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS utility_reimbursements TEXT[]; -- array of utilities

-- Unit availability tracking
ALTER TABLE lease_rates ADD COLUMN IF NOT EXISTS available_date DATE;
ALTER TABLE lease_rates ADD COLUMN IF NOT EXISTS unit_status VARCHAR(20) DEFAULT 'available' 
  CHECK (unit_status IN ('available', 'coming_soon', 'leased', 'unavailable'));
ALTER TABLE lease_rates ADD COLUMN IF NOT EXISTS floor_plan VARCHAR(50);

-- Historical rent tracking
CREATE TABLE IF NOT EXISTS rent_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  unit_type VARCHAR(20) NOT NULL,
  rent_amount DECIMAL(10,2) NOT NULL,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  scrape_id UUID, -- link to scrape session
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(property_id, unit_type, recorded_date)
);

CREATE INDEX IF NOT EXISTS idx_rent_history_property ON rent_history(property_id);
CREATE INDEX IF NOT EXISTS idx_rent_history_date ON rent_history(recorded_date);

-- Market analytics helper view
CREATE OR REPLACE VIEW market_overview AS
SELECT 
  p.city,
  p.state,
  p.zip_code,
  COUNT(DISTINCT p.id) as total_properties,
  SUM(p.total_units) as total_units,
  AVG(p.current_occupancy_percent) as avg_occupancy,
  AVG(p.avg_days_to_lease) as avg_days_to_lease,
  COUNT(DISTINCT CASE WHEN p.property_class = 'A' THEN p.id END) as class_a_count,
  COUNT(DISTINCT CASE WHEN p.property_class = 'B' THEN p.id END) as class_b_count,
  COUNT(DISTINCT CASE WHEN p.property_class = 'C' THEN p.id END) as class_c_count,
  AVG(p.parking_fee_monthly) as avg_parking_fee,
  AVG(p.pet_rent_monthly) as avg_pet_rent,
  MAX(p.last_scraped_at) as last_updated
FROM properties p
WHERE p.last_scraped_at > CURRENT_DATE - INTERVAL '90 days'
GROUP BY p.city, p.state, p.zip_code;

-- Unit availability forecast view
CREATE OR REPLACE VIEW unit_availability_forecast AS
SELECT 
  p.city,
  p.state,
  p.zip_code,
  lr.unit_type,
  lr.available_date,
  DATE_TRUNC('month', lr.available_date) as availability_month,
  COUNT(*) as units_available,
  AVG(lr.rent_amount) as avg_rent,
  MIN(lr.rent_amount) as min_rent,
  MAX(lr.rent_amount) as max_rent
FROM lease_rates lr
JOIN properties p ON lr.property_id = p.id
WHERE lr.unit_status IN ('available', 'coming_soon')
  AND lr.available_date IS NOT NULL
  AND lr.available_date >= CURRENT_DATE
GROUP BY p.city, p.state, p.zip_code, lr.unit_type, lr.available_date;

-- Rent growth analysis view
CREATE OR REPLACE VIEW rent_growth_analysis AS
WITH monthly_rents AS (
  SELECT 
    p.city,
    p.state,
    p.zip_code,
    rh.unit_type,
    DATE_TRUNC('month', rh.recorded_date) as month,
    AVG(rh.rent_amount) as avg_rent
  FROM rent_history rh
  JOIN properties p ON rh.property_id = p.id
  WHERE rh.recorded_date >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY p.city, p.state, p.zip_code, rh.unit_type, DATE_TRUNC('month', rh.recorded_date)
),
rent_changes AS (
  SELECT 
    city, state, zip_code, unit_type, month, avg_rent,
    LAG(avg_rent) OVER (PARTITION BY city, state, zip_code, unit_type ORDER BY month) as prev_month_rent,
    FIRST_VALUE(avg_rent) OVER (PARTITION BY city, state, zip_code, unit_type ORDER BY month) as year_ago_rent
  FROM monthly_rents
)
SELECT 
  city, state, zip_code, unit_type, month, avg_rent,
  ROUND(((avg_rent - prev_month_rent) / NULLIF(prev_month_rent, 0) * 100)::NUMERIC, 2) as mom_change_percent,
  ROUND(((avg_rent - year_ago_rent) / NULLIF(year_ago_rent, 0) * 100)::NUMERIC, 2) as yoy_change_percent
FROM rent_changes
WHERE prev_month_rent IS NOT NULL;

-- Concession trends view
CREATE OR REPLACE VIEW concession_trends AS
SELECT 
  p.city,
  p.state,
  p.zip_code,
  DATE_TRUNC('month', c.created_at) as month,
  COUNT(DISTINCT p.id) as properties_with_concessions,
  COUNT(*) as total_concessions,
  AVG(c.value_amount) as avg_concession_value,
  ARRAY_AGG(DISTINCT c.concession_type) as concession_types
FROM concessions c
JOIN properties p ON c.property_id = p.id
WHERE c.created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY p.city, p.state, p.zip_code, DATE_TRUNC('month', c.created_at);

-- Add comments for documentation
COMMENT ON COLUMN properties.year_built IS 'Year the property was originally constructed';
COMMENT ON COLUMN properties.year_renovated IS 'Most recent major renovation year';
COMMENT ON COLUMN properties.property_class IS 'Property class: A (luxury), B (mid-range), C (affordable)';
COMMENT ON COLUMN properties.building_type IS 'e.g., garden, mid-rise, high-rise, townhome';
COMMENT ON COLUMN properties.parking_ratio IS 'Parking spaces per unit';
COMMENT ON COLUMN properties.management_company IS 'Property management company name';
COMMENT ON COLUMN properties.current_occupancy_percent IS 'Current occupancy percentage (0-100)';
COMMENT ON COLUMN properties.avg_days_to_lease IS 'Average days from listing to lease signing';
COMMENT ON COLUMN lease_rates.available_date IS 'Date the unit becomes available for move-in';
COMMENT ON COLUMN lease_rates.unit_status IS 'Current status: available, coming_soon, leased, unavailable';
COMMENT ON TABLE rent_history IS 'Historical rent tracking for trend analysis and forecasting';

-- Grant permissions (if using RLS)
ALTER TABLE rent_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to rent history" ON rent_history
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert to rent history" ON rent_history
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
