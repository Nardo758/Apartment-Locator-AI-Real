# Landlord Dashboard Database Schema Documentation

**Migration:** 005_landlord_dashboard_foundation.sql  
**Created:** February 4, 2026  
**Status:** Production-Ready ✅

---

## 📋 Overview

This migration establishes the complete database foundation for the Landlord Dashboard feature, enabling landlords to:

- Track owned properties and occupancy status
- Create competition sets to monitor competitor pricing
- Receive automated pricing and market alerts
- Access market intelligence and benchmarking
- Manage alert preferences and notification settings

---

## 🗄️ Database Schema

### New Tables Created (4)

1. **competition_sets** - Groups of competitor properties
2. **competition_set_competitors** - Individual competitors within sets
3. **pricing_alerts** - Automated market change notifications
4. **alert_preferences** - User notification preferences

### Modified Tables (3)

1. **users** - Added profile fields (avatar, phone, company, role)
2. **properties** - Added landlord ownership and occupancy tracking
3. **market_snapshots** - Added landlord intelligence metrics

---

## 📊 Table Details

### 1. `competition_sets`

Stores named groups of competitor properties that landlords want to track.

**Key Fields:**
- `id` (UUID, PK) - Unique identifier
- `user_id` (UUID, FK → users) - Owner of the competition set
- `name` (VARCHAR) - Display name (e.g., "Downtown Competitors")
- `description` (TEXT) - Optional details about the set
- `own_property_ids` (JSONB) - Array of property IDs owned by landlord
- `alerts_enabled` (BOOLEAN) - Toggle for automated alerts

**Relationships:**
- Belongs to: `users` (via user_id)
- Has many: `competition_set_competitors`
- Has many: `pricing_alerts`

**Example Query:**
```sql
-- Get all competition sets for a landlord with competitor counts
SELECT 
  cs.*,
  COUNT(csc.id) as competitor_count
FROM competition_sets cs
LEFT JOIN competition_set_competitors csc ON csc.set_id = cs.id
WHERE cs.user_id = 'landlord-uuid'
GROUP BY cs.id;
```

---

### 2. `competition_set_competitors`

Individual competitor properties within a competition set.

**Key Fields:**
- `id` (UUID, PK) - Unique identifier
- `set_id` (UUID, FK → competition_sets) - Parent competition set
- `property_id` (UUID, FK → properties, nullable) - Link to scraped property
- `address` (VARCHAR) - Property address
- `latitude`, `longitude` (DECIMAL) - Geo coordinates
- `bedrooms`, `bathrooms`, `square_feet` (INT/DECIMAL) - Unit specs
- `current_rent` (DECIMAL) - Current rental price
- `amenities` (JSONB) - Array of amenity strings
- `concessions` (JSONB) - Array of concession objects
- `source` (VARCHAR) - 'manual' | 'scraper' | 'api'
- `is_active` (BOOLEAN) - Soft delete flag

**Relationships:**
- Belongs to: `competition_sets` (via set_id)
- Optionally belongs to: `properties` (via property_id)

**Concessions JSON Structure:**
```json
[
  {
    "type": "discount",
    "description": "First month free",
    "value": 2200
  },
  {
    "type": "amenity",
    "description": "Free parking for 3 months",
    "value": 450
  }
]
```

**Example Query:**
```sql
-- Get all active competitors in a set with effective rent calculation
SELECT 
  *,
  current_rent - COALESCE(
    (SELECT SUM((concession->>'value')::decimal / 12) 
     FROM jsonb_array_elements(concessions) AS concession),
    0
  ) as effective_monthly_rent
FROM competition_set_competitors
WHERE set_id = 'set-uuid' AND is_active = true;
```

---

### 3. `pricing_alerts`

Automated alerts generated when market conditions change.

**Key Fields:**
- `id` (UUID, PK) - Unique identifier
- `user_id` (UUID, FK → users) - Alert recipient
- `set_id` (UUID, FK → competition_sets) - Related competition set
- `property_id` (UUID, FK → properties) - Landlord's affected property
- `competitor_id` (UUID) - Competitor that triggered alert
- `alert_type` (VARCHAR) - 'price_change' | 'concession' | 'vacancy_risk' | 'market_trend'
- `severity` (VARCHAR) - 'info' | 'warning' | 'critical'
- `title` (VARCHAR) - Alert headline
- `message` (TEXT) - Detailed alert message
- `metadata` (JSONB) - Flexible data (old price, new price, etc.)
- `action_url` (TEXT) - Deep link to relevant page
- `is_read`, `is_dismissed` (BOOLEAN) - State flags

**Alert Types:**
1. **price_change** - Competitor changed rent price
2. **concession** - New concession offered by competitor
3. **vacancy_risk** - Your property at risk of extended vacancy
4. **market_trend** - Significant market shift detected

**Metadata Examples:**
```json
// Price Change Alert
{
  "competitorName": "Riverside Apartments",
  "competitorAddress": "123 Main St",
  "oldPrice": 2200,
  "newPrice": 2100,
  "changePercent": -4.5,
  "yourPropertyId": "uuid",
  "yourCurrentPrice": 2200
}

// Vacancy Risk Alert
{
  "propertyAddress": "1234 Oak St #203",
  "daysVacant": 45,
  "threshold": 30,
  "marketAvgDaysVacant": 18,
  "recommendedAction": "Consider price adjustment or concessions"
}
```

**Example Query:**
```sql
-- Get unread alerts for a user, ordered by severity
SELECT * FROM pricing_alerts
WHERE user_id = 'user-uuid' AND is_read = false
ORDER BY 
  CASE severity 
    WHEN 'critical' THEN 1 
    WHEN 'warning' THEN 2 
    WHEN 'info' THEN 3 
  END,
  created_at DESC;
```

---

### 4. `alert_preferences`

User preferences for how and when to receive alerts.

**Key Fields:**
- `id` (UUID, PK) - Unique identifier
- `user_id` (UUID, FK → users, UNIQUE) - One preference row per user
- `price_changes`, `concessions`, `vacancy_risk`, `market_trends` (BOOLEAN) - Alert type toggles
- `delivery_email`, `delivery_sms`, `delivery_inapp`, `delivery_push` (BOOLEAN) - Delivery channels
- `frequency` (VARCHAR) - 'realtime' | 'daily' | 'weekly'
- `quiet_hours_start`, `quiet_hours_end` (VARCHAR) - Time strings (e.g., '22:00', '08:00')
- `price_threshold` (DECIMAL) - Only alert if price change > $X
- `vacancy_threshold` (INT) - Alert when vacant > X days

**Default Values:**
- All alert types: **enabled**
- Email + In-app: **enabled**
- SMS + Push: **disabled**
- Frequency: **realtime**
- Price threshold: **$50**
- Vacancy threshold: **30 days**

**Example Query:**
```sql
-- Check if user should receive an alert now
SELECT 
  CASE 
    WHEN quiet_hours_start IS NOT NULL AND quiet_hours_end IS NOT NULL THEN
      CASE 
        WHEN CURRENT_TIME BETWEEN quiet_hours_start::time AND quiet_hours_end::time 
        THEN false
        ELSE true
      END
    ELSE true
  END as should_send_now
FROM alert_preferences
WHERE user_id = 'user-uuid';
```

---

### 5. Modified: `properties` Table

**New Landlord Fields:**
- `landlord_id` (UUID, FK → users) - Property owner
- `is_landlord_owned` (BOOLEAN) - Quick filter flag
- `occupancy_status` (VARCHAR) - 'vacant' | 'occupied' | 'pending'
- `current_tenant_id` (UUID) - Current tenant reference
- `lease_start_date`, `lease_end_date` (TIMESTAMP) - Lease dates
- `days_vacant` (INT) - Auto-incremented daily by background job
- `last_occupied_date` (TIMESTAMP) - Last occupancy date
- `target_rent` (DECIMAL) - Desired rent amount
- `actual_rent` (DECIMAL) - Current/last achieved rent

**New Indexes:**
```sql
idx_properties_landlord        -- WHERE is_landlord_owned = true
idx_properties_occupancy       -- WHERE is_landlord_owned = true
idx_properties_days_vacant     -- WHERE is_landlord_owned = true
```

**Example Query:**
```sql
-- Get portfolio summary for a landlord
SELECT 
  COUNT(*) as total_properties,
  COUNT(*) FILTER (WHERE occupancy_status = 'occupied') as occupied,
  COUNT(*) FILTER (WHERE occupancy_status = 'vacant') as vacant,
  ROUND(
    COUNT(*) FILTER (WHERE occupancy_status = 'occupied')::decimal / COUNT(*) * 100,
    2
  ) as occupancy_rate,
  SUM(CASE WHEN occupancy_status = 'occupied' THEN actual_rent ELSE 0 END) as monthly_revenue,
  AVG(days_vacant) FILTER (WHERE occupancy_status = 'vacant') as avg_days_vacant
FROM properties
WHERE landlord_id = 'landlord-uuid' AND is_landlord_owned = true;
```

---

### 6. Modified: `market_snapshots` Table

**New Intelligence Fields:**
- `inventory_level` (DECIMAL) - % of available supply
- `leverage_score` (INT 0-100) - Market leverage indicator
- `rent_change_1m`, `rent_change_3m`, `rent_change_12m` (DECIMAL) - Trend percentages
- `supply_trend`, `demand_trend` (VARCHAR) - 'increasing' | 'stable' | 'decreasing'
- `ai_recommendation` (TEXT) - AI-generated market insights

**Leverage Score Interpretation:**
- **0-40**: Tenant's market (high supply, low demand)
- **40-60**: Balanced market
- **60-100**: Landlord's market (low supply, high demand)

---

### 7. Modified: `users` Table

**New Profile Fields:**
- `avatar_url` (TEXT) - Profile picture URL (S3/Cloudinary)
- `phone_number` (VARCHAR) - Contact phone
- `company_name` (VARCHAR) - Property management company
- `role` (VARCHAR) - Job title

---

## 🔗 Relationships Diagram

```
users
  ├── owns → properties (landlord_id)
  ├── has_many → competition_sets
  ├── has_many → pricing_alerts
  └── has_one → alert_preferences

competition_sets
  ├── belongs_to → users
  ├── has_many → competition_set_competitors
  └── has_many → pricing_alerts

competition_set_competitors
  ├── belongs_to → competition_sets
  └── optionally_belongs_to → properties

pricing_alerts
  ├── belongs_to → users
  ├── belongs_to → competition_sets
  └── belongs_to → properties

properties
  ├── belongs_to → users (as landlord)
  └── has_many → competition_set_competitors (as competitor)
```

---

## 🚀 Running the Migration

### Method 1: Direct SQL Execution
```bash
psql -U your_user -d your_database -f database/migrations/005_landlord_dashboard_foundation.sql
```

### Method 2: Drizzle Kit (Recommended)
```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate

# Or push directly (dev only)
npm run db:push
```

### Method 3: Programmatic
```typescript
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './db';

await migrate(db, { migrationsFolder: './database/migrations' });
```

---

## 🔄 Rollback

If you need to undo this migration:

```bash
psql -U your_user -d your_database -f database/migrations/005_landlord_dashboard_foundation_rollback.sql
```

⚠️ **Warning:** Rollback will delete all data in the new tables!

---

## 🧪 Sample Data for Testing

```sql
-- Create a test landlord user
INSERT INTO users (email, password_hash, name, user_type)
VALUES ('landlord@test.com', 'hashed_password', 'John Landlord', 'landlord')
RETURNING id;

-- Add a landlord-owned property
INSERT INTO properties (
  external_id, source, name, address, city, state,
  landlord_id, is_landlord_owned, occupancy_status,
  target_rent, actual_rent, days_vacant
) VALUES (
  'landlord-prop-001', 'manual', 'My Downtown Apartment',
  '1234 Main St #203', 'Austin', 'TX',
  'landlord-user-id', true, 'vacant',
  2200.00, NULL, 15
);

-- Create a competition set
INSERT INTO competition_sets (user_id, name, own_property_ids, alerts_enabled)
VALUES (
  'landlord-user-id',
  'Downtown Competitors',
  '["property-uuid-1", "property-uuid-2"]'::jsonb,
  true
);

-- Add competitors
INSERT INTO competition_set_competitors (
  set_id, address, bedrooms, bathrooms, square_feet,
  current_rent, amenities, source
) VALUES (
  'set-uuid',
  'Riverside Apartments, 123 River Rd',
  2, 2.0, 1100,
  2100.00,
  '["pool", "gym", "parking"]'::jsonb,
  'manual'
);

-- Create alert preferences (auto-created on user signup ideally)
INSERT INTO alert_preferences (user_id)
VALUES ('landlord-user-id');

-- Generate a test alert
INSERT INTO pricing_alerts (
  user_id, set_id, property_id, alert_type,
  severity, title, message, metadata
) VALUES (
  'landlord-user-id', 'set-uuid', 'property-uuid',
  'price_change', 'warning',
  'Competitor Price Drop',
  'Riverside Apartments dropped rent from $2,200 to $2,100',
  '{"oldPrice": 2200, "newPrice": 2100}'::jsonb
);
```

---

## 📈 Performance Considerations

### Indexes Created

| Table | Index | Purpose |
|-------|-------|---------|
| properties | `idx_properties_landlord` | Fast landlord property lookups |
| properties | `idx_properties_occupancy` | Filter by occupancy status |
| properties | `idx_properties_days_vacant` | Sort by vacancy duration |
| competition_sets | `idx_competition_sets_user` | User's competition sets |
| competition_set_competitors | `idx_competitors_set` | Competitors in a set |
| competition_set_competitors | `idx_competitors_location` | Geo-based queries (PostGIS) |
| pricing_alerts | `idx_alerts_user` | User's alerts |
| pricing_alerts | `idx_alerts_unread` | Unread alerts (filtered index) |
| alert_preferences | `idx_alert_preferences_user` | Unique user preferences |

### Query Optimization Tips

1. **Always filter landlord queries by `is_landlord_owned = true`**
2. **Use prepared statements for repeated queries**
3. **Leverage JSONB GIN indexes for amenities/concessions searches**
4. **Batch alert creation/updates in background jobs**
5. **Use `EXPLAIN ANALYZE` for slow queries**

---

## 🔒 Security Considerations

### Row-Level Security (Optional)

```sql
-- Enable RLS on tables
ALTER TABLE competition_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY user_isolation ON competition_sets
  FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY user_isolation ON pricing_alerts
  FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY user_isolation ON alert_preferences
  FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);
```

### API Authorization

Always verify:
```typescript
// Middleware example
async function requireLandlordOwnership(req, res, next) {
  const property = await db.getProperty(req.params.propertyId);
  
  if (property.landlordId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  next();
}
```

---

## 🎯 Next Steps After Migration

### 1. Backend API Endpoints

Create routes for:
- `POST /api/competition-sets` - Create competition set
- `GET /api/competition-sets` - List sets
- `POST /api/competition-sets/:id/competitors` - Add competitor
- `GET /api/alerts` - Get alerts
- `PATCH /api/alerts/:id/read` - Mark as read
- `GET /api/landlord/portfolio/summary` - Portfolio KPIs

### 2. Background Jobs

Implement cron jobs for:
- **Alert Generation** (every 15 min) - Detect price changes
- **Vacancy Tracker** (daily) - Increment `days_vacant`
- **Market Data Update** (daily) - Update market snapshots

### 3. Testing

- [ ] Unit tests for all new queries
- [ ] Integration tests for API endpoints
- [ ] Performance tests with 1000+ properties
- [ ] Load tests for alert generation

---

## 📚 Additional Resources

- **Gap Analysis Document:** `LANDLORD_API_GAP_ANALYSIS.md`
- **Drizzle ORM Docs:** https://orm.drizzle.team
- **PostgreSQL JSONB:** https://www.postgresql.org/docs/current/datatype-json.html
- **PostGIS (Geo Queries):** https://postgis.net

---

## ✅ Migration Checklist

- [x] Users table updated with profile fields
- [x] Properties table updated with landlord fields
- [x] Market snapshots updated with intelligence fields
- [x] Competition sets table created
- [x] Competition set competitors table created
- [x] Pricing alerts table created
- [x] Alert preferences table created
- [x] All indexes created
- [x] Drizzle relations defined
- [x] Triggers for updated_at created
- [x] Comments added for documentation
- [x] Rollback script created
- [x] Sample data queries provided

---

**Migration Status:** ✅ **COMPLETE & PRODUCTION-READY**

For questions or issues, contact the development team or refer to the main gap analysis document.
