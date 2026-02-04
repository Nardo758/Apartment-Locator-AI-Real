# 🔍 Landlord Dashboard API Gap Analysis

**Document Version:** 1.0  
**Created:** February 4, 2026  
**Last Updated:** February 4, 2026  
**Status:** Initial Analysis Complete

---

## 📋 Executive Summary

This document provides a comprehensive analysis of API endpoints needed for the Landlord Dashboard Redesign specification versus what currently exists in the backend. The analysis reveals **significant gaps** requiring substantial backend development work.

### Key Findings:
- **Total Features in Spec:** 15 major feature areas
- **Existing Endpoints:** ~15 endpoints (mostly renter-focused)
- **Missing Endpoints:** ~35+ new endpoints needed
- **Database Tables Missing:** 4 new tables required
- **Estimated Backend Effort:** 3-4 weeks for full implementation

---

## 📊 Current Backend State

### ✅ What EXISTS (General Infrastructure)

#### Authentication & User Management
```typescript
POST   /api/auth/signup          ✅ Implemented
POST   /api/auth/signin          ✅ Implemented
GET    /api/auth/me              ✅ Implemented
PATCH  /api/auth/user-type       ✅ Implemented
```

#### Properties (Basic CRUD)
```typescript
GET    /api/properties           ✅ Implemented (with filters)
GET    /api/properties/:id       ✅ Implemented
POST   /api/properties           ✅ Implemented
```

#### User Preferences & Data
```typescript
GET    /api/preferences/:userId          ✅ Implemented
POST   /api/preferences                  ✅ Implemented
GET    /api/saved-apartments/:userId     ✅ Implemented
POST   /api/saved-apartments             ✅ Implemented
DELETE /api/saved-apartments/:userId/:apartmentId  ✅ Implemented
GET    /api/pois/:userId                 ✅ Implemented
POST   /api/pois                         ✅ Implemented
DELETE /api/pois/:userId/:poiId          ✅ Implemented
```

#### Market Data
```typescript
GET    /api/market-snapshots/:city/:state  ✅ Implemented
POST   /api/market-snapshots               ✅ Implemented
```

#### Payments & Subscriptions
```typescript
POST   /api/payments/create-renter-checkout      ✅ Implemented
POST   /api/payments/create-subscription-checkout ✅ Implemented
POST   /api/payments/cancel-subscription         ✅ Implemented
GET    /api/payments/subscription-status/:userId ✅ Implemented
GET    /api/payments/status                      ✅ Implemented
POST   /api/webhooks/stripe                      ✅ Implemented
```

#### Lease Verification
```typescript
(Routes exist in lease-verification.ts)    ✅ Implemented
```

### ❌ What's MISSING (Landlord-Specific Features)

---

## 🏗️ Feature-by-Feature Gap Analysis

### 1. Portfolio Management

#### **Current State:** ❌ No landlord-owned property tracking
#### **Spec Requirements:**
- Track properties owned by landlord
- Occupancy status tracking
- Vacancy duration tracking
- Portfolio-level metrics and KPIs

#### **Missing Endpoints:**

```typescript
// Landlord Property Management
GET    /api/landlord/properties                    ❌ Missing
POST   /api/landlord/properties                    ❌ Missing
GET    /api/landlord/properties/:id                ❌ Missing
PATCH  /api/landlord/properties/:id                ❌ Missing
DELETE /api/landlord/properties/:id                ❌ Missing

// Occupancy & Status Management
PATCH  /api/landlord/properties/:id/occupancy      ❌ Missing
GET    /api/landlord/properties/:id/occupancy-history  ❌ Missing

// Portfolio Metrics
GET    /api/landlord/portfolio/summary             ❌ Missing
GET    /api/landlord/portfolio/revenue             ❌ Missing
GET    /api/landlord/portfolio/occupancy-rates     ❌ Missing
GET    /api/landlord/portfolio/vacancy-risk        ❌ Missing
```

#### **Database Changes Needed:**

```sql
-- Add landlord_id to properties table
ALTER TABLE properties ADD COLUMN landlord_id UUID REFERENCES users(id);
ALTER TABLE properties ADD COLUMN is_landlord_owned BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN occupancy_status VARCHAR(50) DEFAULT 'vacant';
ALTER TABLE properties ADD COLUMN current_tenant_id UUID;
ALTER TABLE properties ADD COLUMN lease_start_date TIMESTAMP;
ALTER TABLE properties ADD COLUMN lease_end_date TIMESTAMP;
ALTER TABLE properties ADD COLUMN days_vacant INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN last_occupied_date TIMESTAMP;
ALTER TABLE properties ADD COLUMN target_rent DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN actual_rent DECIMAL(10,2);
```

#### **Business Logic Required:**
- Calculate days vacant (server-side scheduled job)
- Portfolio aggregation queries (total properties, occupancy rate, revenue)
- Vacancy risk scoring algorithm
- Revenue tracking per property
- Filtering by landlord ownership

#### **Implementation Priority:** 🔴 CRITICAL (P0)
#### **Effort Estimate:** 4-5 days

---

### 2. Competition Sets (NEW FEATURE)

#### **Current State:** ❌ Completely missing
#### **Spec Requirements:**
- Create named groups of competitor properties
- Add competitors manually or via search
- Track competition against specific owned properties
- Enable/disable alerts per set

#### **Missing Endpoints:**

```typescript
// Competition Sets CRUD
POST   /api/competition-sets                       ❌ Missing
GET    /api/competition-sets                       ❌ Missing
GET    /api/competition-sets/:id                   ❌ Missing
PATCH  /api/competition-sets/:id                   ❌ Missing
DELETE /api/competition-sets/:id                   ❌ Missing

// Competitor Management within Sets
POST   /api/competition-sets/:id/competitors       ❌ Missing
GET    /api/competition-sets/:id/competitors       ❌ Missing
DELETE /api/competition-sets/:id/competitors/:competitorId  ❌ Missing
PATCH  /api/competition-sets/:id/competitors/:competitorId  ❌ Missing

// Competitor Search & Discovery
GET    /api/competitors/search                     ❌ Missing
POST   /api/competitors                            ❌ Missing (manual entry)
```

#### **Database Changes Needed:**

```sql
-- Competition Sets Table
CREATE TABLE competition_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  own_property_ids UUID[] NOT NULL,
  alerts_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Competition Set Competitors Table
CREATE TABLE competition_set_competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  set_id UUID REFERENCES competition_sets(id) ON DELETE CASCADE,
  property_id UUID, -- Reference to properties table if scraped
  address VARCHAR(500) NOT NULL,
  coordinates POINT,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  square_feet INTEGER,
  current_rent DECIMAL(10,2),
  amenities TEXT[],
  concessions JSONB,
  last_updated TIMESTAMP DEFAULT NOW(),
  source VARCHAR(50) DEFAULT 'manual', -- 'manual' | 'scraper' | 'api'
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_competition_sets_user ON competition_sets(user_id);
CREATE INDEX idx_competitors_set ON competition_set_competitors(set_id);
CREATE INDEX idx_competitors_location ON competition_set_competitors USING GIST(coordinates);
```

#### **Business Logic Required:**
- Validate own_property_ids belong to user
- Competitor proximity search (geo-based)
- Duplicate competitor detection
- Bulk import from CSV
- Competition set cloning

#### **Implementation Priority:** 🟡 HIGH (P1)
#### **Effort Estimate:** 6-7 days

---

### 3. Comparison View & Market Benchmarking

#### **Current State:** ⚠️ Partial (market snapshots exist, but no comparison logic)
#### **Spec Requirements:**
- Side-by-side property comparisons
- Pricing comparison tables
- Amenities matrix comparison
- Market benchmark analysis
- Gap analysis (what landlord is missing)

#### **Missing Endpoints:**

```typescript
// Comparison Analysis
POST   /api/comparison/generate                    ❌ Missing
GET    /api/comparison/pricing/:propertyId         ❌ Missing
GET    /api/comparison/amenities/:propertyId       ❌ Missing
GET    /api/comparison/market-benchmark/:propertyId  ❌ Missing

// Gap Analysis
GET    /api/analysis/gaps/:propertyId              ❌ Missing
GET    /api/analysis/competitive-advantages/:propertyId  ❌ Missing
GET    /api/analysis/pricing-recommendations/:propertyId  ❌ Missing
```

#### **Database Changes Needed:**

```sql
-- Comparison Reports Table (Optional - for caching)
CREATE TABLE comparison_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  competitor_ids UUID[],
  report_data JSONB NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

#### **Business Logic Required:**
- **Pricing comparison algorithm:**
  - Calculate $/sqft comparisons
  - Factor in concessions (convert to monthly value)
  - Determine price positioning (above/below/at market)
  - Color-coding logic (green/yellow/red zones)

- **Amenities matrix:**
  - Cross-reference amenities across properties
  - Calculate market prevalence %
  - Identify missing amenities (gap analysis)

- **Market benchmark calculations:**
  - Median/average rent by bed/bath count
  - Percentile ranking
  - Market segment identification

- **Recommendations engine:**
  - Rule-based pricing suggestions
  - Concession value calculations
  - Vacancy risk mitigation strategies

#### **Implementation Priority:** 🟡 HIGH (P1)
#### **Effort Estimate:** 5-6 days

---

### 4. Pricing Alerts System

#### **Current State:** ❌ Completely missing
#### **Spec Requirements:**
- Real-time competitor price change alerts
- New concession notifications
- Vacancy risk warnings
- Market trend alerts
- Configurable alert preferences

#### **Missing Endpoints:**

```typescript
// Alerts Management
GET    /api/alerts                                 ❌ Missing
GET    /api/alerts/:id                             ❌ Missing
PATCH  /api/alerts/:id/read                        ❌ Missing
DELETE /api/alerts/:id                             ❌ Missing
POST   /api/alerts/dismiss-all                     ❌ Missing

// Alert Preferences
GET    /api/alert-preferences                      ❌ Missing
POST   /api/alert-preferences                      ❌ Missing
PATCH  /api/alert-preferences                      ❌ Missing

// Alert Triggers (Internal/Background Jobs)
POST   /api/internal/alerts/trigger                ❌ Missing
POST   /api/internal/alerts/process                ❌ Missing
```

#### **Database Changes Needed:**

```sql
-- Pricing Alerts Table
CREATE TABLE pricing_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  set_id UUID REFERENCES competition_sets(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id), -- Your property affected
  competitor_id UUID, -- Competitor that triggered alert
  alert_type VARCHAR(50) NOT NULL, -- 'price_change' | 'concession' | 'vacancy_risk' | 'market_trend'
  severity VARCHAR(20) DEFAULT 'info', -- 'info' | 'warning' | 'critical'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB, -- Flexible data (old price, new price, etc.)
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  dismissed_at TIMESTAMP
);

-- Alert Preferences Table
CREATE TABLE alert_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  price_changes BOOLEAN DEFAULT true,
  concessions BOOLEAN DEFAULT true,
  vacancy_risk BOOLEAN DEFAULT true,
  market_trends BOOLEAN DEFAULT true,
  delivery_email BOOLEAN DEFAULT true,
  delivery_sms BOOLEAN DEFAULT false,
  delivery_inapp BOOLEAN DEFAULT true,
  delivery_push BOOLEAN DEFAULT false,
  frequency VARCHAR(20) DEFAULT 'realtime', -- 'realtime' | 'daily' | 'weekly'
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  price_threshold DECIMAL(10,2) DEFAULT 50.00,
  vacancy_threshold INTEGER DEFAULT 30, -- days
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_alerts_user ON pricing_alerts(user_id);
CREATE INDEX idx_alerts_type ON pricing_alerts(alert_type);
CREATE INDEX idx_alerts_unread ON pricing_alerts(user_id, is_read) WHERE is_read = false;
```

#### **Business Logic Required:**
- **Alert generation logic:**
  - Monitor competitor property changes (background job/cron)
  - Detect price drops/increases above threshold
  - Identify new concessions
  - Calculate vacancy risk scores daily
  - Track market trend changes

- **Alert delivery:**
  - Email notification service integration
  - SMS integration (Twilio/similar)
  - In-app notification system
  - Batching for daily/weekly digests
  - Respect quiet hours

- **Alert intelligence:**
  - Deduplicate similar alerts
  - Priority/severity assignment
  - Action recommendation generation

#### **Implementation Priority:** 🟡 HIGH (P1)
#### **Effort Estimate:** 7-8 days

---

### 5. Market Intelligence Bar (Landlord-Specific)

#### **Current State:** ⚠️ Partial (market snapshots exist, needs landlord metrics)
#### **Spec Requirements:**
- Market median rent
- Rent change % (month-over-month)
- Average days on market
- Inventory level (supply %)
- Market leverage score
- AI-generated recommendations

#### **Missing Endpoints:**

```typescript
// Market Intelligence
GET    /api/market-intel/:city/:state/landlord     ❌ Missing
GET    /api/market-intel/:city/:state/leverage-score  ❌ Missing
GET    /api/market-intel/:city/:state/supply-demand   ❌ Missing
GET    /api/market-intel/:city/:state/ai-recommendations  ❌ Missing
```

#### **Database Changes Needed:**

```sql
-- Extend market_snapshots table
ALTER TABLE market_snapshots ADD COLUMN inventory_level DECIMAL(5,2); -- %
ALTER TABLE market_snapshots ADD COLUMN leverage_score INTEGER; -- 0-100
ALTER TABLE market_snapshots ADD COLUMN rent_change_1m DECIMAL(5,2); -- %
ALTER TABLE market_snapshots ADD COLUMN rent_change_3m DECIMAL(5,2); -- %
ALTER TABLE market_snapshots ADD COLUMN rent_change_12m DECIMAL(5,2); -- %
ALTER TABLE market_snapshots ADD COLUMN supply_trend VARCHAR(50); -- 'increasing' | 'stable' | 'decreasing'
ALTER TABLE market_snapshots ADD COLUMN demand_trend VARCHAR(50);
ALTER TABLE market_snapshots ADD COLUMN ai_recommendation TEXT;
```

#### **Business Logic Required:**
- Calculate market leverage score (demand vs supply indicator)
- Compute inventory levels (active listings / total units)
- Trend analysis (month-over-month, quarter-over-quarter)
- AI recommendation generation (GPT integration or rule-based)
- Market sentiment analysis

#### **Implementation Priority:** 🟢 MEDIUM (P2)
#### **Effort Estimate:** 3-4 days

---

### 6. Profile Settings & Account Management

#### **Current State:** ⚠️ Partial (auth exists, but no profile settings UI/API)
#### **Spec Requirements:**
- Profile management (name, email, avatar)
- Notification preferences
- Alert settings (integrated with alerts system)
- Billing & subscription management
- Integration settings (future)

#### **Missing Endpoints:**

```typescript
// Profile Management
GET    /api/profile/:userId                        ❌ Missing (uses /api/auth/me)
PATCH  /api/profile/:userId                        ❌ Missing
POST   /api/profile/:userId/avatar                 ❌ Missing
DELETE /api/profile/:userId/avatar                 ❌ Missing

// Settings
GET    /api/settings/:userId                       ❌ Missing
PATCH  /api/settings/:userId                       ❌ Missing

// Notification Preferences
GET    /api/settings/:userId/notifications         ❌ Missing
PATCH  /api/settings/:userId/notifications         ❌ Missing
```

#### **Database Changes Needed:**

```sql
-- User Settings Table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  timezone VARCHAR(100) DEFAULT 'America/New_York',
  language VARCHAR(10) DEFAULT 'en',
  date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
  currency VARCHAR(3) DEFAULT 'USD',
  theme VARCHAR(20) DEFAULT 'light',
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User Avatars (or use external storage like S3)
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN phone_number VARCHAR(50);
ALTER TABLE users ADD COLUMN company_name VARCHAR(255);
ALTER TABLE users ADD COLUMN role VARCHAR(100);
```

#### **Business Logic Required:**
- Image upload handling (S3/Cloudinary integration)
- Email validation on profile update
- Notification preference cascading (global override per-feature settings)
- Settings validation

#### **Implementation Priority:** 🟢 MEDIUM (P2)
#### **Effort Estimate:** 2-3 days

---

### 7. Interactive Map (Landlord-Specific Data)

#### **Current State:** ⚠️ Frontend exists, needs backend data formatting
#### **Spec Requirements:**
- Return properties with landlord ownership flag
- Include competitor data
- Map markers differentiation (own vs competitor)
- Geo-based filtering

#### **Missing Endpoints:**

```typescript
// Map Data (Optimized)
GET    /api/map/properties                         ❌ Missing
GET    /api/map/properties/:city/:state            ❌ Missing
GET    /api/map/competitors/:latitude/:longitude   ❌ Missing
```

#### **Database Changes Needed:**
```sql
-- Spatial indexes (if not already exist)
CREATE INDEX idx_properties_location ON properties USING GIST(
  ST_MakePoint(longitude::double precision, latitude::double precision)::geography
);
```

#### **Business Logic Required:**
- Geo-bounding box queries for viewport
- Clustering for performance (thousands of markers)
- Filter owned vs competitor properties
- Distance calculations
- Radius search

#### **Implementation Priority:** 🟢 MEDIUM (P2)
#### **Effort Estimate:** 2-3 days

---

### 8. Property Performance Analytics

#### **Current State:** ❌ Missing
#### **Spec Requirements:** (Implied in spec)
- Historical rent tracking
- Occupancy history
- Revenue trends
- Performance scores

#### **Missing Endpoints:**

```typescript
// Analytics
GET    /api/analytics/property/:id/performance     ❌ Missing
GET    /api/analytics/property/:id/revenue-history ❌ Missing
GET    /api/analytics/property/:id/occupancy-trends  ❌ Missing
GET    /api/analytics/portfolio/performance        ❌ Missing
```

#### **Database Changes Needed:**

```sql
-- Property Performance History
CREATE TABLE property_performance_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP DEFAULT NOW(),
  rent DECIMAL(10,2),
  occupancy_status VARCHAR(50),
  days_vacant INTEGER,
  market_avg_rent DECIMAL(10,2),
  variance_from_market DECIMAL(10,2),
  concessions_active JSONB,
  notes TEXT
);

CREATE INDEX idx_performance_property ON property_performance_history(property_id, recorded_at);
```

#### **Business Logic Required:**
- Historical data tracking (daily snapshots)
- Trend calculations
- Performance scoring algorithm
- Revenue projections

#### **Implementation Priority:** 🟠 LOW (P3)
#### **Effort Estimate:** 4-5 days

---

### 9. Concessions Tracking

#### **Current State:** ⚠️ Data model supports it (JSONB), no dedicated endpoints
#### **Spec Requirements:**
- Track competitor concessions
- Monitor concession changes
- Calculate concession value
- Alert on new concessions

#### **Missing Endpoints:**

```typescript
// Concessions
GET    /api/concessions/competitor/:competitorId   ❌ Missing
POST   /api/concessions/competitor/:competitorId   ❌ Missing
GET    /api/concessions/market/:city/:state        ❌ Missing
```

#### **Business Logic Required:**
- Concession value calculation (convert "2 months free" to monthly cost)
- Effective rent calculation (actual monthly cost after concessions)
- Concession prevalence tracking
- Historical concession tracking

#### **Implementation Priority:** 🟠 LOW (P3)
#### **Effort Estimate:** 2-3 days

---

### 10. Filters & Sorting (Landlord Dashboard)

#### **Current State:** ⚠️ Basic property filters exist, need landlord-specific
#### **Spec Requirements:**
- Filter by city
- Filter by occupancy status
- Filter by vacancy risk
- Filter by competition set
- Sort by various metrics

#### **Missing Endpoints:**

```typescript
// Already exists but needs enhancement
GET    /api/properties  
// Need to add query params:
// - landlordId
// - occupancyStatus
// - vacancyRisk
// - sortBy (vacancy_risk, days_vacant, rent_variance, etc.)
```

#### **Database Changes Needed:**
None (just query enhancements)

#### **Business Logic Required:**
- Complex sorting logic (vacancy risk is calculated field)
- Multi-criteria filtering
- Performance optimization for large portfolios

#### **Implementation Priority:** 🟢 MEDIUM (P2)
#### **Effort Estimate:** 1-2 days

---

## 🗄️ Database Schema Summary

### New Tables Required:

1. **competition_sets** - Store competition set metadata
2. **competition_set_competitors** - Store competitor properties within sets
3. **pricing_alerts** - Store generated alerts
4. **alert_preferences** - Store user alert settings
5. **user_settings** - Store user preferences (optional, can extend users table)
6. **property_performance_history** - Track historical metrics (optional, P3)

### Tables to Modify:

1. **properties** - Add landlord ownership fields
2. **market_snapshots** - Add landlord-specific metrics
3. **users** - Add profile fields (avatar, phone, company)

---

## 📝 Detailed Endpoint Specifications

### Competition Sets API

#### `POST /api/competition-sets`
**Description:** Create a new competition set  
**Auth:** Required  
**Request Body:**
```json
{
  "name": "Downtown Premium Competitors",
  "description": "Track luxury apartments in downtown Austin",
  "ownPropertyIds": ["uuid1", "uuid2"],
  "alertsEnabled": true
}
```
**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "Downtown Premium Competitors",
  "description": "...",
  "ownPropertyIds": ["uuid1", "uuid2"],
  "alertsEnabled": true,
  "createdAt": "2026-02-04T10:00:00Z",
  "updatedAt": "2026-02-04T10:00:00Z"
}
```
**Validation:**
- Name required, max 255 chars
- ownPropertyIds must belong to authenticated user
- ownPropertyIds must exist in database

**Database Queries:**
```sql
-- Validate ownership
SELECT id FROM properties 
WHERE id = ANY($1) 
  AND landlord_id = $2 
  AND is_landlord_owned = true;

-- Insert set
INSERT INTO competition_sets (user_id, name, description, own_property_ids, alerts_enabled)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;
```

---

#### `GET /api/competition-sets`
**Description:** List all competition sets for authenticated user  
**Auth:** Required  
**Query Params:**
- `limit` (default: 50)
- `offset` (default: 0)

**Response:**
```json
{
  "sets": [
    {
      "id": "uuid",
      "name": "Downtown Premium Competitors",
      "description": "...",
      "ownPropertyIds": ["uuid1", "uuid2"],
      "competitorCount": 12,
      "alertsEnabled": true,
      "createdAt": "2026-02-04T10:00:00Z",
      "updatedAt": "2026-02-04T10:00:00Z"
    }
  ],
  "total": 5,
  "limit": 50,
  "offset": 0
}
```

**Database Queries:**
```sql
-- Get sets with competitor count
SELECT 
  cs.*,
  COUNT(csc.id) as competitor_count
FROM competition_sets cs
LEFT JOIN competition_set_competitors csc ON csc.set_id = cs.id
WHERE cs.user_id = $1
GROUP BY cs.id
ORDER BY cs.updated_at DESC
LIMIT $2 OFFSET $3;
```

---

#### `POST /api/competition-sets/:id/competitors`
**Description:** Add a competitor to a competition set  
**Auth:** Required  
**Request Body:**
```json
{
  "propertyId": "uuid-if-existing",  // Optional if already in DB
  "address": "123 Main St, Austin, TX",
  "coordinates": { "lat": 30.2672, "lng": -97.7431 },
  "bedrooms": 2,
  "bathrooms": 2.0,
  "squareFeet": 1100,
  "currentRent": 2200,
  "amenities": ["pool", "gym", "parking"],
  "concessions": [
    { "type": "discount", "description": "First month free", "value": 2200 }
  ],
  "source": "manual"
}
```
**Response:**
```json
{
  "id": "uuid",
  "setId": "uuid",
  "propertyId": null,
  "address": "123 Main St, Austin, TX",
  "coordinates": { "lat": 30.2672, "lng": -97.7431 },
  "bedrooms": 2,
  "bathrooms": 2.0,
  "squareFeet": 1100,
  "currentRent": 2200,
  "amenities": ["pool", "gym", "parking"],
  "concessions": [...],
  "source": "manual",
  "lastUpdated": "2026-02-04T10:00:00Z"
}
```

**Validation:**
- Set must belong to authenticated user
- Address required
- Coordinates required
- Prevent duplicates (same address in same set)

---

### Alerts API

#### `GET /api/alerts`
**Description:** Get alerts for authenticated user  
**Auth:** Required  
**Query Params:**
- `unreadOnly` (boolean, default: false)
- `type` (filter by alert type)
- `severity` (filter by severity)
- `limit` (default: 50)
- `offset` (default: 0)

**Response:**
```json
{
  "alerts": [
    {
      "id": "uuid",
      "alertType": "price_change",
      "severity": "warning",
      "title": "Price Drop Alert",
      "message": "Riverside Apartments dropped rent from $2,200 to $2,100",
      "metadata": {
        "competitorId": "uuid",
        "competitorName": "Riverside Apartments",
        "oldPrice": 2200,
        "newPrice": 2100,
        "yourPropertyId": "uuid",
        "yourPropertyAddress": "1234 Main St #203"
      },
      "actionUrl": "/landlord/comparison?propertyId=uuid&competitorId=uuid",
      "isRead": false,
      "createdAt": "2026-02-04T09:30:00Z"
    }
  ],
  "total": 15,
  "unreadCount": 7
}
```

**Database Queries:**
```sql
SELECT * FROM pricing_alerts
WHERE user_id = $1
  AND ($2::boolean IS NULL OR is_read = false)
  AND ($3::varchar IS NULL OR alert_type = $3)
  AND ($4::varchar IS NULL OR severity = $4)
ORDER BY created_at DESC
LIMIT $5 OFFSET $6;

-- Get unread count
SELECT COUNT(*) FROM pricing_alerts
WHERE user_id = $1 AND is_read = false;
```

---

### Comparison API

#### `POST /api/comparison/generate`
**Description:** Generate a comparison report for a property vs competitors  
**Auth:** Required  
**Request Body:**
```json
{
  "propertyId": "uuid",
  "competitorIds": ["uuid1", "uuid2", "uuid3"],
  "includeMarketBenchmark": true
}
```
**Response:**
```json
{
  "property": {
    "id": "uuid",
    "address": "1234 Main St #203",
    "currentRent": 2200,
    "bedrooms": 2,
    "bathrooms": 2,
    "squareFeet": 1100,
    "pricePerSqFt": 2.0,
    "amenities": ["pool", "gym"]
  },
  "competitors": [
    {
      "id": "uuid1",
      "address": "Riverside Apartments",
      "currentRent": 2100,
      "bedrooms": 2,
      "bathrooms": 2,
      "squareFeet": 1100,
      "pricePerSqFt": 1.91,
      "amenities": ["pool"],
      "concessions": [{ "type": "2 months free", "value": 4200 }],
      "effectiveMonthlyRent": 1750
    }
  ],
  "marketBenchmark": {
    "medianRent": 2100,
    "avgRent": 2150,
    "minRent": 1800,
    "maxRent": 2500,
    "sampleSize": 24,
    "yourPercentile": 75
  },
  "analysis": {
    "pricingPosition": "above_market",
    "variance": 100,
    "variancePercent": 4.76,
    "competitiveAdvantages": ["In-unit laundry", "Balcony"],
    "gaps": ["Not pet-friendly (67% of competitors allow pets)"],
    "recommendation": "Drop rent to $2,100/mo OR offer 1 month free to match market"
  }
}
```

**Business Logic:**
1. Fetch property details
2. Fetch competitor details
3. Calculate market statistics from competitors
4. Perform amenity gap analysis
5. Calculate pricing position
6. Generate AI/rule-based recommendation

---

### Portfolio Summary API

#### `GET /api/landlord/portfolio/summary`
**Description:** Get portfolio-wide KPIs  
**Auth:** Required  
**Response:**
```json
{
  "totalProperties": 12,
  "occupied": 10,
  "vacant": 2,
  "occupancyRate": 83.33,
  "totalMonthlyRevenue": 22400,
  "potentialMonthlyRevenue": 26800,
  "revenueEfficiency": 83.58,
  "atRiskProperties": 3,
  "avgDaysVacant": 18,
  "totalSquareFeet": 14500,
  "avgRentPerSqFt": 1.95,
  "portfolioValue": 2800000
}
```

**Database Queries:**
```sql
SELECT 
  COUNT(*) as total_properties,
  COUNT(*) FILTER (WHERE occupancy_status = 'occupied') as occupied,
  COUNT(*) FILTER (WHERE occupancy_status = 'vacant') as vacant,
  ROUND(AVG(CASE WHEN occupancy_status = 'occupied' THEN actual_rent ELSE 0 END), 2) as avg_rent,
  SUM(CASE WHEN occupancy_status = 'occupied' THEN actual_rent ELSE 0 END) as total_monthly_revenue,
  SUM(target_rent) as potential_monthly_revenue,
  AVG(days_vacant) as avg_days_vacant,
  SUM(square_feet_min) as total_square_feet
FROM properties
WHERE landlord_id = $1 AND is_landlord_owned = true;
```

---

## ⚙️ Background Jobs & Scheduled Tasks

Several features require background processing:

### 1. **Alert Generation Job**
**Frequency:** Every 15 minutes  
**Purpose:** Detect competitor price changes, new concessions, vacancy risks  
**Pseudo-code:**
```typescript
async function generateAlerts() {
  // Get all users with active competition sets
  const users = await getActiveCompetitionSetUsers();
  
  for (const user of users) {
    const prefs = await getAlertPreferences(user.id);
    if (!prefs.enabled) continue;
    
    // Check for price changes
    if (prefs.priceChanges) {
      await detectPriceChanges(user.id);
    }
    
    // Check for new concessions
    if (prefs.concessions) {
      await detectNewConcessions(user.id);
    }
    
    // Calculate vacancy risk
    if (prefs.vacancyRisk) {
      await checkVacancyRisk(user.id);
    }
  }
}
```

### 2. **Market Data Update Job**
**Frequency:** Daily at 2 AM  
**Purpose:** Update market snapshots, trends, leverage scores  

### 3. **Vacancy Tracker Job**
**Frequency:** Daily at midnight  
**Purpose:** Increment days_vacant for vacant properties  

### 4. **Email Digest Job**
**Frequency:** Daily/Weekly (based on user pref)  
**Purpose:** Send batched alert emails  

---

## 🎯 Implementation Roadmap

### **Phase 1: Foundation (Week 1)**
**Priority:** CRITICAL  
**Effort:** 5-6 days

- [ ] Add landlord ownership fields to properties table
- [ ] Create landlord property endpoints (CRUD)
- [ ] Implement portfolio summary endpoint
- [ ] Add occupancy status management
- [ ] Basic filtering & sorting for landlord properties

**Deliverable:** Landlords can add/manage their properties and see portfolio overview

---

### **Phase 2: Competition Sets (Week 2)**
**Priority:** HIGH  
**Effort:** 6-7 days

- [ ] Create competition_sets and competition_set_competitors tables
- [ ] Implement competition sets CRUD endpoints
- [ ] Build competitor management endpoints
- [ ] Add competitor search functionality
- [ ] Implement manual competitor entry

**Deliverable:** Landlords can create competition sets and track competitors

---

### **Phase 3: Comparison & Analytics (Week 3)**
**Priority:** HIGH  
**Effort:** 5-6 days

- [ ] Build comparison report generation endpoint
- [ ] Implement pricing comparison logic
- [ ] Create amenities gap analysis
- [ ] Build market benchmark calculations
- [ ] Develop recommendation engine

**Deliverable:** Landlords can compare properties and get pricing recommendations

---

### **Phase 4: Alerts System (Week 4)**
**Priority:** HIGH  
**Effort:** 7-8 days

- [ ] Create pricing_alerts and alert_preferences tables
- [ ] Build alerts CRUD endpoints
- [ ] Implement alert preferences management
- [ ] Create alert generation background job
- [ ] Integrate email notification service
- [ ] Build alert delivery system (in-app + email)

**Deliverable:** Landlords receive automated alerts for market changes

---

### **Phase 5: Polish & Optimization (Week 5)**
**Priority:** MEDIUM  
**Effort:** 4-5 days

- [ ] Enhance market intelligence endpoints
- [ ] Add profile settings endpoints
- [ ] Optimize map data queries
- [ ] Implement performance analytics (P3)
- [ ] Add concessions tracking (P3)

**Deliverable:** All features polished and performant

---

## 📊 API Endpoint Count Summary

| Category | Existing | Missing | Total Needed |
|----------|----------|---------|--------------|
| Authentication | 4 | 0 | 4 |
| Properties (General) | 3 | 0 | 3 |
| **Landlord Properties** | **0** | **6** | **6** |
| **Portfolio Management** | **0** | **4** | **4** |
| **Competition Sets** | **0** | **8** | **8** |
| **Comparison & Analysis** | **0** | **7** | **7** |
| **Alerts** | **0** | **7** | **7** |
| **Market Intelligence** | **2** | **4** | **6** |
| **Profile & Settings** | **1** | **6** | **7** |
| **Map Data** | **0** | **3** | **3** |
| **Analytics** | **0** | **4** | **4** |
| Payments | 6 | 0 | 6 |
| **TOTAL** | **16** | **49** | **65** |

---

## 🔐 Security Considerations

### Authorization Rules:
1. **Landlord properties:** User can only access/modify their own properties
2. **Competition sets:** User can only CRUD their own sets
3. **Alerts:** User can only view/manage their own alerts
4. **Portfolio data:** Must validate landlord_id matches authenticated user

### Recommended Middleware:
```typescript
async function requireLandlordOwnership(req, res, next) {
  const { propertyId } = req.params;
  const property = await db.getProperty(propertyId);
  
  if (!property || property.landlordId !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  
  next();
}
```

---

## 📈 Performance Optimization

### Query Optimization:
- Add indexes on landlord_id, occupancy_status, days_vacant
- Use database views for complex portfolio queries
- Implement caching for market benchmarks (Redis)
- Paginate all list endpoints

### Caching Strategy:
- Market snapshots: Cache for 1 hour
- Portfolio summary: Cache for 5 minutes
- Comparison reports: Cache for 15 minutes
- Alert counts: Real-time (no cache)

---

## 🧪 Testing Requirements

For each new endpoint:
- [ ] Unit tests for business logic
- [ ] Integration tests for database queries
- [ ] API endpoint tests (request/response validation)
- [ ] Authorization tests (ensure proper access control)
- [ ] Performance tests (query optimization)

---

## 📋 API Documentation Needs

All new endpoints should be documented with:
- Request/response schemas (TypeScript types)
- Authentication requirements
- Query parameter descriptions
- Error response codes
- Example requests/responses
- Rate limiting info

Recommended: Generate OpenAPI/Swagger docs

---

## 🚨 Critical Path Items

**Must-Have for MVP:**
1. Landlord property CRUD
2. Portfolio summary
3. Competition sets CRUD
4. Basic comparison view
5. Alert preferences (even if alerts aren't generated yet)

**Can Be Phased:**
1. Automated alert generation (manual creation initially)
2. Performance analytics
3. Advanced market intelligence
4. Email/SMS notifications (in-app only first)

---

## 💰 Estimated Development Timeline

**Total Backend Development Time:** 4-5 weeks (1 senior backend engineer)

- **Week 1:** Foundation (landlord properties, portfolio)
- **Week 2:** Competition sets
- **Week 3:** Comparison & analytics
- **Week 4:** Alerts system
- **Week 5:** Polish, testing, optimization

**Parallel Work Possible:**
- Frontend can build UI components using mock data while backend is in progress
- Database migrations can be done early
- Background jobs can be added after core endpoints

---

## 🎓 Key Learnings & Recommendations

### 1. **Database Design:**
- Use PostgreSQL JSONB for flexible metadata (concessions, amenities)
- Implement proper indexes from the start
- Consider partitioning for high-volume tables (alerts, performance history)

### 2. **API Design:**
- Follow RESTful conventions
- Version the API (`/api/v1/...`)
- Return consistent error responses
- Include pagination metadata in list responses

### 3. **Background Jobs:**
- Use a job queue system (Bull, BullMQ, or similar)
- Implement retry logic with exponential backoff
- Monitor job failures
- Log all alert generation attempts

### 4. **External Services:**
- Email: SendGrid, Mailgun, or AWS SES
- SMS: Twilio or SNS
- File storage: AWS S3 or Cloudinary (for avatars)

### 5. **Monitoring:**
- Track API response times
- Monitor alert generation success rate
- Alert on failed background jobs
- Track user engagement with alerts (read/dismiss rates)

---

## 📞 Next Steps

1. **Review & Approve** this analysis with Leon
2. **Prioritize** features (confirm P0, P1, P2, P3)
3. **Create Database Migration Scripts** for new tables
4. **Set Up Development Environment** for backend work
5. **Start Phase 1** (Foundation) implementation
6. **Weekly Progress Reviews** to stay on track

---

**Document Status:** Ready for Review  
**Last Updated:** February 4, 2026  
**Next Review:** After Phase 1 completion
