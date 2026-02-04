-- =====================================================
-- Landlord Dashboard Schema Validation Script
-- Run this after migration to verify all changes
-- =====================================================

\echo '========================================'
\echo 'Validating Landlord Dashboard Schema'
\echo '========================================'
\echo ''

-- Check if all new tables exist
\echo 'Checking new tables...'
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'competition_sets')
    THEN '✅ competition_sets exists'
    ELSE '❌ competition_sets MISSING'
  END as status
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'competition_set_competitors')
    THEN '✅ competition_set_competitors exists'
    ELSE '❌ competition_set_competitors MISSING'
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pricing_alerts')
    THEN '✅ pricing_alerts exists'
    ELSE '❌ pricing_alerts MISSING'
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alert_preferences')
    THEN '✅ alert_preferences exists'
    ELSE '❌ alert_preferences MISSING'
  END;

\echo ''
\echo 'Checking updated columns in users table...'
SELECT 
  column_name,
  data_type,
  '✅' as status
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name IN ('avatar_url', 'phone_number', 'company_name', 'role');

\echo ''
\echo 'Checking updated columns in properties table...'
SELECT 
  column_name,
  data_type,
  '✅' as status
FROM information_schema.columns
WHERE table_name = 'properties' 
  AND column_name IN (
    'landlord_id', 'is_landlord_owned', 'occupancy_status',
    'current_tenant_id', 'lease_start_date', 'lease_end_date',
    'days_vacant', 'last_occupied_date', 'target_rent', 'actual_rent'
  );

\echo ''
\echo 'Checking updated columns in market_snapshots table...'
SELECT 
  column_name,
  data_type,
  '✅' as status
FROM information_schema.columns
WHERE table_name = 'market_snapshots' 
  AND column_name IN (
    'inventory_level', 'leverage_score', 'rent_change_1m',
    'rent_change_3m', 'rent_change_12m', 'supply_trend',
    'demand_trend', 'ai_recommendation'
  );

\echo ''
\echo 'Checking indexes...'
SELECT 
  indexname,
  tablename,
  '✅' as status
FROM pg_indexes
WHERE indexname IN (
  'idx_properties_landlord',
  'idx_properties_occupancy',
  'idx_properties_days_vacant',
  'idx_competition_sets_user',
  'idx_competitors_set',
  'idx_alerts_user',
  'idx_alerts_unread',
  'idx_alert_preferences_user'
);

\echo ''
\echo 'Checking foreign key constraints...'
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  '✅' as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN (
    'competition_sets',
    'competition_set_competitors',
    'pricing_alerts',
    'alert_preferences'
  )
ORDER BY tc.table_name;

\echo ''
\echo 'Checking triggers...'
SELECT
  trigger_name,
  event_object_table as table_name,
  '✅' as status
FROM information_schema.triggers
WHERE trigger_name IN (
  'update_competition_sets_updated_at',
  'update_alert_preferences_updated_at'
);

\echo ''
\echo '========================================'
\echo 'Schema Structure Summary'
\echo '========================================'

-- Table row counts (should be 0 for new tables after migration)
\echo ''
\echo 'Table row counts:'
SELECT 
  'competition_sets' as table_name,
  COUNT(*) as row_count
FROM competition_sets
UNION ALL
SELECT 
  'competition_set_competitors',
  COUNT(*)
FROM competition_set_competitors
UNION ALL
SELECT 
  'pricing_alerts',
  COUNT(*)
FROM pricing_alerts
UNION ALL
SELECT 
  'alert_preferences',
  COUNT(*)
FROM alert_preferences;

-- Column counts for new tables
\echo ''
\echo 'Table column counts:'
SELECT 
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name IN (
  'competition_sets',
  'competition_set_competitors',
  'pricing_alerts',
  'alert_preferences'
)
GROUP BY table_name
ORDER BY table_name;

\echo ''
\echo '========================================'
\echo 'Validation Complete!'
\echo '========================================'
\echo ''
\echo 'If all checks show ✅, the migration was successful.'
\echo 'If any checks show ❌, review the migration script.'
