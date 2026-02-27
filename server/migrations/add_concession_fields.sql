-- Add concession fields to properties table
-- These fields are synced from scraped_properties to enable True Cost calculations
ALTER TABLE properties ADD COLUMN IF NOT EXISTS special_offers TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS concession_type VARCHAR(100);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS concession_value INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS effective_price INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS days_on_market INTEGER;
