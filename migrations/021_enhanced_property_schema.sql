-- Enhanced Property Schema for Market Intelligence & JEDI RE Integration
-- Captures additional fields needed for market analysis and underwriting

-- Add property characteristics
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS year_built INTEGER,
ADD COLUMN IF NOT EXISTS year_renovated INTEGER,
ADD COLUMN IF NOT EXISTS property_class VARCHAR(1) CHECK (property_class IN ('A', 'B', 'C', 'D')),
ADD COLUMN IF NOT EXISTS building_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS parking_spaces INTEGER,
ADD COLUMN IF NOT EXISTS management_company VARCHAR(255);

-- Add occupancy & income data
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS total_units INTEGER,
ADD COLUMN IF NOT EXISTS current_occupancy_percent DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS avg_days_to_lease INTEGER,
ADD COLUMN IF NOT EXISTS parking_fee_monthly DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS pet_rent_monthly DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS application_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS admin_fee DECIMAL(10,2);

-- Add unit availability tracking
ALTER TABLE lease_rates
ADD COLUMN IF NOT EXISTS available_date DATE,
ADD COLUMN IF NOT EXISTS unit_status VARCHAR(20) DEFAULT 'available' 
  CHECK (unit_status IN ('available', 'coming_soon', 'leased'));

-- Create rent history table for trend analysis
CREATE TABLE IF NOT EXISTS rent_history (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  unit_type VARCHAR(50),
  rent_amount DECIMAL(10,2),
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rent_history_property ON rent_history(property_id);
CREATE INDEX IF NOT EXISTS idx_rent_history_date ON rent_history(recorded_date);

-- View: Market Overview by Location
CREATE OR REPLACE VIEW market_overview AS
SELECT 
  city,
  state,
  zip_code,
  COUNT(DISTINCT p.id) as property_count,
  SUM(p.total_units) as total_units,
  AVG(p.current_occupancy_percent) as avg_occupancy,
  COUNT(DISTINCT CASE WHEN p.property_class = 'A' THEN p.id END) as class_a_count,
  COUNT(DISTINCT CASE WHEN p.property_class = 'B' THEN p.id END) as class_b_count,
  COUNT(DISTINCT CASE WHEN p.property_class = 'C' THEN p.id END) as class_c_count,
  AVG(lr.price) as avg_rent,
  COUNT(c.id) as active_concessions
FROM properties p
LEFT JOIN lease_rates lr ON p.id = lr.property_id
LEFT JOIN concessions c ON p.id = c.property_id
GROUP BY city, state, zip_code;

-- View: Unit Availability Forecast
CREATE OR REPLACE VIEW unit_availability_forecast AS
SELECT 
  p.city,
  p.state,
  lr.unit_type,
  COUNT(*) FILTER (WHERE lr.available_date <= CURRENT_DATE + INTERVAL '30 days') as available_30d,
  COUNT(*) FILTER (WHERE lr.available_date <= CURRENT_DATE + INTERVAL '60 days') as available_60d,
  COUNT(*) FILTER (WHERE lr.available_date <= CURRENT_DATE + INTERVAL '90 days') as available_90d,
  AVG(lr.price) as avg_rent,
  MIN(lr.price) as min_rent,
  MAX(lr.price) as max_rent
FROM lease_rates lr
JOIN properties p ON lr.property_id = p.id
WHERE lr.unit_status = 'available' OR lr.unit_status = 'coming_soon'
GROUP BY p.city, p.state, lr.unit_type;

-- View: Rent Growth Analysis
CREATE OR REPLACE VIEW rent_growth_analysis AS
WITH current_rents AS (
  SELECT 
    p.city,
    p.state,
    lr.unit_type,
    AVG(lr.price) as current_avg_rent
  FROM properties p
  JOIN lease_rates lr ON p.id = lr.property_id
  GROUP BY p.city, p.state, lr.unit_type
),
historical_rents AS (
  SELECT 
    p.city,
    p.state,
    rh.unit_type,
    AVG(rh.rent_amount) FILTER (WHERE rh.recorded_date >= CURRENT_DATE - INTERVAL '90 days') as rent_90d_ago,
    AVG(rh.rent_amount) FILTER (WHERE rh.recorded_date >= CURRENT_DATE - INTERVAL '180 days') as rent_180d_ago
  FROM properties p
  JOIN rent_history rh ON p.id = rh.property_id
  GROUP BY p.city, p.state, rh.unit_type
)
SELECT 
  c.city,
  c.state,
  c.unit_type,
  c.current_avg_rent,
  h.rent_90d_ago,
  h.rent_180d_ago,
  ROUND(((c.current_avg_rent - h.rent_90d_ago) / h.rent_90d_ago * 100), 2) as growth_90d_pct,
  ROUND(((c.current_avg_rent - h.rent_180d_ago) / h.rent_180d_ago * 100), 2) as growth_180d_pct
FROM current_rents c
LEFT JOIN historical_rents h ON c.city = h.city AND c.state = h.state AND c.unit_type = h.unit_type;

-- View: Concession Trends
CREATE OR REPLACE VIEW concession_trends AS
SELECT 
  p.city,
  p.state,
  c.concession_type,
  COUNT(*) as concession_count,
  AVG(CAST(REGEXP_REPLACE(c.value, '[^0-9.]', '', 'g') AS DECIMAL)) as avg_value,
  COUNT(*) * 100.0 / NULLIF(COUNT(DISTINCT p.id), 0) as concession_rate_pct
FROM concessions c
JOIN properties p ON c.property_id = p.id
WHERE c.concession_type IS NOT NULL
GROUP BY p.city, p.state, c.concession_type;
