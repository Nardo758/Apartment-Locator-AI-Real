-- Add landlord-specific fields to properties table
-- This migration adds fields required for landlord portfolio management

ALTER TABLE properties ADD COLUMN IF NOT EXISTS landlord_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_landlord_owned BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS occupancy_status VARCHAR(50) DEFAULT 'vacant';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS current_tenant_id UUID;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS lease_start_date TIMESTAMP;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS lease_end_date TIMESTAMP;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS days_vacant INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS last_occupied_date TIMESTAMP;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS target_rent DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS actual_rent DECIMAL(10,2);

-- Add index for landlord queries
CREATE INDEX IF NOT EXISTS idx_properties_landlord_id ON properties(landlord_id);
CREATE INDEX IF NOT EXISTS idx_properties_landlord_owned ON properties(landlord_id, is_landlord_owned) WHERE is_landlord_owned = true;
CREATE INDEX IF NOT EXISTS idx_properties_occupancy_status ON properties(occupancy_status);

COMMENT ON COLUMN properties.landlord_id IS 'User ID of the landlord who owns this property';
COMMENT ON COLUMN properties.is_landlord_owned IS 'Flag to differentiate landlord-owned properties from scraped listings';
COMMENT ON COLUMN properties.occupancy_status IS 'Current occupancy status: vacant, occupied, pending, maintenance';
COMMENT ON COLUMN properties.current_tenant_id IS 'Current tenant user ID (if occupied)';
COMMENT ON COLUMN properties.lease_start_date IS 'Start date of current lease';
COMMENT ON COLUMN properties.lease_end_date IS 'End date of current lease';
COMMENT ON COLUMN properties.days_vacant IS 'Number of days property has been vacant';
COMMENT ON COLUMN properties.last_occupied_date IS 'Last date the property was occupied';
COMMENT ON COLUMN properties.target_rent IS 'Target rental price set by landlord';
COMMENT ON COLUMN properties.actual_rent IS 'Actual rental price (may differ from target due to negotiations)';
