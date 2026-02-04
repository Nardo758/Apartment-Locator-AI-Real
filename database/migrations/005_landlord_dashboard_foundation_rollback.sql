-- Rollback Migration 005: Landlord Dashboard Foundation
-- Use this to undo all changes from migration 005
-- Date: 2026-02-04

-- =====================================================
-- PART 1: Drop Triggers
-- =====================================================
DROP TRIGGER IF EXISTS update_competition_sets_updated_at ON competition_sets;
DROP TRIGGER IF EXISTS update_alert_preferences_updated_at ON alert_preferences;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- =====================================================
-- PART 2: Drop New Tables (in reverse order due to FK constraints)
-- =====================================================
DROP TABLE IF EXISTS alert_preferences CASCADE;
DROP TABLE IF EXISTS pricing_alerts CASCADE;
DROP TABLE IF EXISTS competition_set_competitors CASCADE;
DROP TABLE IF EXISTS competition_sets CASCADE;

-- =====================================================
-- PART 3: Remove Landlord Intelligence from Market Snapshots
-- =====================================================
ALTER TABLE market_snapshots DROP COLUMN IF EXISTS ai_recommendation;
ALTER TABLE market_snapshots DROP COLUMN IF EXISTS demand_trend;
ALTER TABLE market_snapshots DROP COLUMN IF EXISTS supply_trend;
ALTER TABLE market_snapshots DROP COLUMN IF EXISTS rent_change_12m;
ALTER TABLE market_snapshots DROP COLUMN IF EXISTS rent_change_3m;
ALTER TABLE market_snapshots DROP COLUMN IF EXISTS rent_change_1m;
ALTER TABLE market_snapshots DROP COLUMN IF EXISTS leverage_score;
ALTER TABLE market_snapshots DROP COLUMN IF EXISTS inventory_level;

-- =====================================================
-- PART 4: Remove Landlord Fields from Properties
-- =====================================================
DROP INDEX IF EXISTS idx_properties_days_vacant;
DROP INDEX IF EXISTS idx_properties_occupancy;
DROP INDEX IF EXISTS idx_properties_landlord;

ALTER TABLE properties DROP COLUMN IF EXISTS actual_rent;
ALTER TABLE properties DROP COLUMN IF EXISTS target_rent;
ALTER TABLE properties DROP COLUMN IF EXISTS last_occupied_date;
ALTER TABLE properties DROP COLUMN IF EXISTS days_vacant;
ALTER TABLE properties DROP COLUMN IF EXISTS lease_end_date;
ALTER TABLE properties DROP COLUMN IF EXISTS lease_start_date;
ALTER TABLE properties DROP COLUMN IF EXISTS current_tenant_id;
ALTER TABLE properties DROP COLUMN IF EXISTS occupancy_status;
ALTER TABLE properties DROP COLUMN IF EXISTS is_landlord_owned;
ALTER TABLE properties DROP COLUMN IF EXISTS landlord_id;

-- =====================================================
-- PART 5: Remove Profile Fields from Users
-- =====================================================
ALTER TABLE users DROP COLUMN IF EXISTS role;
ALTER TABLE users DROP COLUMN IF EXISTS company_name;
ALTER TABLE users DROP COLUMN IF EXISTS phone_number;
ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;

-- =====================================================
-- Verification
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Rollback of Migration 005 completed successfully.';
END
$$;
