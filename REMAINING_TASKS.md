# Apartment Locator AI - Remaining Tasks & Roadmap

**Generated:** February 4, 2025  
**Last Updated:** February 4, 2025  
**Status:** Comprehensive Analysis Complete

---

## 📊 Executive Summary

### Project Health: 🟡 Good Foundation, Needs Critical Fixes

**What's Working Well:**
- ✅ Strong UI component library (271 TypeScript/TSX files)
- ✅ Well-organized feature separation (renter/landlord/agent)
- ✅ Modern tech stack (React 18, Vite, TailwindCSS, shadcn/ui)
- ✅ Clear monetization strategy defined
- ✅ Extensive documentation (30+ MD files)

**Critical Gaps:**
- 🔴 **No protected routes** - Major security vulnerability
- 🔴 **User type not persisted to backend** - Cross-device sync broken
- 🔴 **Stripe integration incomplete** - Can't collect payments
- 🔴 **No database backend** - All data is mocked
- ⚠️ **Theme inconsistency** - Jarring UX in onboarding flows
- ⚠️ **Overlapping contexts** - State management issues

**Estimated Time to Production:**
- **MVP (Renter Flow Only):** 2-3 weeks full-time
- **Full Platform (All User Types):** 6-8 weeks full-time
- **Advanced Features:** 12+ weeks full-time

---

## 🎯 Priority Classification

### 🔴 P0 - Critical (Must Fix Before Launch)
**Timeline:** Week 1-2  
**Blocker:** Can't launch without these

### ⚠️ P1 - High Priority (Launch Blockers)
**Timeline:** Week 3-4  
**Impact:** Core functionality broken or missing

### 💡 P2 - Medium Priority (Post-Launch)
**Timeline:** Week 5-8  
**Impact:** Significant UX improvements

### ✨ P3 - Low Priority (Enhancement)
**Timeline:** Week 9+  
**Impact:** Nice-to-have features

---

## 🔴 CRITICAL TASKS (P0) - Week 1-2

### 1. Implement Protected Routes 🚨
**Priority:** P0 | **Effort:** 4-6 hours | **Impact:** Security Critical

**Problem:**
- All authenticated routes are currently public
- Anyone can navigate to `/dashboard`, `/portfolio-dashboard`, `/billing`
- No user type enforcement (renter can access landlord features)

**Tasks:**
1. Create `ProtectedRoute` component
   - Check authentication status
   - Verify user type for role-specific routes
   - Redirect to login if unauthorized
   - Handle loading states

2. Wrap all authenticated routes in App.tsx
   - `/dashboard` - All authenticated users
   - `/portfolio-dashboard` - Landlords only
   - `/agent-dashboard` - Agents only
   - `/profile`, `/billing` - All authenticated users

3. Add role-based access control
   - Admin routes (future)
   - Feature flags per user type

**Files to Create/Update:**
```
src/components/routing/ProtectedRoute.tsx (NEW)
src/App.tsx (UPDATE - wrap routes)
src/utils/authRouter.ts (NEW - post-auth routing)
```

**Definition of Done:**
- [ ] Unauthenticated users redirected to `/auth`
- [ ] Renters can't access `/portfolio-dashboard`
- [ ] Landlords can't access renter-only features
- [ ] All routes tested with different user types

---

### 2. Backend User Type Persistence 🚨
**Priority:** P0 | **Effort:** 6-8 hours | **Impact:** Cross-Device Sync

**Problem:**
- User type stored only in localStorage
- Lost when user logs in from different device
- Not available in backend for authorization

**Tasks:**
1. Update User interface
   ```typescript
   interface User {
     id: string;
     email: string;
     name?: string;
     userType?: 'renter' | 'landlord' | 'agent';
     hasCompletedOnboarding?: boolean;
     subscriptionTier?: string;
     subscriptionStatus?: string;
   }
   ```

2. Create backend API endpoints
   - `PATCH /api/users/:id/profile` - Update user type
   - `GET /api/users/:id/onboarding-status` - Check completion

3. Update UserProvider
   - Add `updateUserType()` method
   - Sync with backend on change
   - Keep localStorage as fallback

4. Update UserTypeSelection page
   - Call `updateUserType()` instead of localStorage
   - Handle API errors gracefully

**Files to Update:**
```
src/hooks/useUser.tsx
src/lib/api.ts
src/pages/UserTypeSelection.tsx
server/routes.ts (ADD endpoint)
shared/schema.ts (UPDATE User model)
```

**Definition of Done:**
- [ ] User type saved to database on selection
- [ ] User type persists across devices
- [ ] Post-auth routing works correctly
- [ ] Onboarding state tracked properly

---

### 3. Stripe Payment Integration 💰
**Priority:** P0 | **Effort:** 8-12 hours | **Impact:** Revenue Blocker

**Problem:**
- Stripe UI components exist but not connected
- No payment processing backend
- Can't collect $49 one-time payments
- No refund processing for lease verification

**Tasks:**

#### A. Environment Setup
```bash
# Add to .env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### B. Backend Payment Endpoints
```typescript
// POST /api/create-checkout
// - Create Stripe checkout session
// - Store resultsData in metadata
// - Return sessionId

// POST /api/stripe-webhook
// - Verify webhook signature
// - Handle payment.succeeded
// - Create purchase record

// GET /api/verify-payment?session_id=xyz
// - Verify payment status
// - Return unlocked results
```

#### C. Database Migration
```sql
CREATE TABLE purchases (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  stripe_session_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  amount INTEGER,
  status VARCHAR(50),
  results_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### D. Frontend Integration
1. Update `FreeSavingsCalculator.tsx`
   - Connect to Stripe on "Unlock Results"
   - Show loading state during payment

2. Update `PaymentSuccess.tsx`
   - Verify payment with backend
   - Display unlocked results
   - Track conversion

**Files to Create/Update:**
```
server/routes.ts (ADD payment endpoints)
shared/schema.ts (ADD purchases table)
src/components/FreeSavingsCalculator.tsx
src/pages/PaymentSuccess.tsx
src/components/PaywallModal.tsx (NEW)
```

**Definition of Done:**
- [ ] Test payment succeeds with test card
- [ ] Purchase record created in database
- [ ] User sees unlocked results
- [ ] Webhook confirms payment
- [ ] Refund processing works for lease verification

**Testing Checklist:**
- [ ] Stripe test mode configured
- [ ] Test card (4242 4242 4242 4242) works
- [ ] Webhook endpoint reachable
- [ ] Payment success page shows correct data
- [ ] Failed payments handled gracefully

---

### 4. Database Backend Integration 💾
**Priority:** P0 | **Effort:** 16-24 hours | **Impact:** All Features Blocked

**Problem:**
- All data is currently mocked/hardcoded
- No persistence across sessions
- Can't track user preferences
- No analytics or reporting possible

**Tasks:**

#### A. Choose & Configure Database
**Options:**
1. **Supabase** (Recommended - already partially configured)
   - PostgreSQL hosted
   - Built-in auth
   - Real-time subscriptions
   - Free tier: 500MB storage

2. **Replit PostgreSQL** (Easier for Replit deployment)
   - Built into Replit
   - One-click setup
   - Limited to Replit environment

**Recommendation:** Use Supabase for production, Replit for development

#### B. Core Schemas (Priority Order)
```sql
-- Already defined in shared/schema.ts, need to implement:

1. users (CRITICAL)
   - Authentication
   - User type storage
   - Subscription tracking

2. landlord_properties (HIGH)
   - Property management
   - Portfolio tracking

3. purchases (CRITICAL)
   - Payment tracking
   - Revenue analytics

4. saved_apartments (HIGH)
   - User favorites
   - Tracking feature

5. preferences (HIGH)
   - User search criteria
   - AI inputs

6. lease_verifications (MEDIUM)
   - Lease upload
   - Refund processing

7. email_templates (MEDIUM)
   - Landlord features
   - Renewal optimizer
```

#### C. API Layer Implementation
**Create service layers:**
```
src/services/
  ├── propertyService.ts   - Property CRUD
  ├── userService.ts       - User management
  ├── preferenceService.ts - Preferences
  ├── purchaseService.ts   - Payment tracking
  └── analyticsService.ts  - Usage tracking
```

**Update existing API:**
```
src/lib/api.ts
  - Add type-safe API client
  - Error handling
  - Request/response types
  - Retry logic
```

#### D. Migration Strategy
```typescript
// Use Drizzle ORM migrations
npm run db:push  // Push schema changes

// Or write custom migrations
migrations/
  ├── 001_initial_schema.sql
  ├── 002_add_user_type.sql
  └── 003_add_purchases.sql
```

**Files to Create/Update:**
```
server/db.ts (UPDATE - add connection)
server/storage.ts (REFACTOR - use real DB)
shared/schema.ts (UPDATE - complete all tables)
src/services/* (NEW - service layer)
src/lib/api.ts (UPDATE - add endpoints)
migrations/* (NEW - database migrations)
```

**Definition of Done:**
- [ ] Database connected and accessible
- [ ] All critical tables created
- [ ] CRUD operations work for properties
- [ ] User data persists across sessions
- [ ] Saved apartments feature functional
- [ ] Purchases tracked correctly

---

### 5. Theme Consistency Fix 🎨
**Priority:** P0 | **Effort:** 2-4 hours | **Impact:** UX Critical

**Problem:**
- Jarring theme switch: Light → Dark → Light
- Inconsistent between onboarding flows
- Unprofessional user experience

**Current State:**
```
UserTypeSelection.tsx:   Light theme ☀️
  ↓
LandlordOnboarding.tsx:  DARK theme 🌙 ← JARRING!
  ↓
AgentOnboarding.tsx:     Light theme ☀️
```

**Tasks:**
1. **Decision Required:** Choose one consistent theme
   - Option A: All light (recommended for onboarding)
   - Option B: All dark
   - Option C: User preference toggle (more work)

2. **Update LandlordOnboarding.tsx**
   ```tsx
   // FROM (dark):
   <div className="min-h-screen bg-[#0a0a0a]">
     <Card variant="elevated" className="bg-black/40">
   
   // TO (light):
   <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
     <Card className="bg-white shadow-2xl">
   ```

3. **Standardize Button Styles**
   - Create `PrimaryButton` component
   - Create `SecondaryButton` component
   - Apply consistently across all flows

**Files to Update:**
```
src/pages/LandlordOnboarding.tsx
src/components/ui/PrimaryButton.tsx (NEW)
src/components/ui/SecondaryButton.tsx (NEW)
src/lib/design-system.ts (UPDATE)
```

**Definition of Done:**
- [ ] All onboarding flows use same theme
- [ ] Smooth visual transitions
- [ ] Button styles consistent
- [ ] Colors match design system

---

## ⚠️ HIGH PRIORITY (P1) - Week 3-4

### 6. Context Provider Consolidation 🔄
**Priority:** P1 | **Effort:** 8-12 hours | **Impact:** State Management

**Problem:**
- `UnifiedAIProvider` and `LocationCostProvider` both manage commute preferences
- `commutePreferences` duplicated in two contexts
- Different localStorage keys cause desyncs
- Confusion about single source of truth

**Current Overlap:**
```typescript
// UnifiedAIContext.tsx
commutePreferences: {
  daysPerWeek: number;
  vehicleMpg: number;
  gasPrice: number;
  // ...
}

// LocationCostContext.tsx
commuteFrequency: number;  // DUPLICATE
vehicleMpg: number;        // DUPLICATE
// ...
```

**Tasks:**
1. **Analyze Dependencies**
   - List all components using each context
   - Map data flow
   - Identify actual overlaps

2. **Design Unified Architecture**
   ```typescript
   // Option 1: Single context for everything
   UnifiedAIProvider (all user inputs)
     └─ No separate LocationCostProvider
   
   // Option 2: Clear separation
   UnifiedAIProvider (user inputs ONLY)
   LocationCostService (pure calculation, no state)
   ```

3. **Implementation**
   - Choose architecture option
   - Migrate components one by one
   - Test after each migration
   - Remove deprecated context

**Files to Update:**
```
src/contexts/UnifiedAIContext.tsx (UPDATE or MERGE)
src/contexts/LocationCostContext.tsx (UPDATE or REMOVE)
src/pages/UnifiedDashboard.tsx (UPDATE usage)
src/services/locationCostService.ts (NEW - if pure service)
```

**Definition of Done:**
- [ ] Single source of truth for user inputs
- [ ] No duplicate data storage
- [ ] All calculations work correctly
- [ ] No state sync issues

---

### 7. OnboardingFlowProvider Cleanup 🗑️
**Priority:** P1 | **Effort:** 2-4 hours | **Impact:** Code Quality

**Problem:**
- `OnboardingFlowProvider` exists but appears unused
- Wraps all routes in App.tsx
- New onboarding flows don't use it
- Dead code causing confusion

**Tasks:**
1. **Search for All Usages**
   ```bash
   grep -r "useOnboardingFlow\|OnboardingFlowContext" src/
   grep -r "OnboardingFlowProvider" src/
   ```

2. **Decision Point:**
   - If **unused**: Remove completely
   - If **used**: Document why dual system exists

3. **Clean Up localStorage**
   ```typescript
   // Remove unused keys:
   - onboardingCurrentStep
   - onboardingFlowData
   - onboardingSteps
   ```

**Files to Update:**
```
src/contexts/OnboardingFlowContext.tsx (REMOVE if unused)
src/App.tsx (REMOVE provider wrapper)
src/pages/* (VERIFY no dependencies)
```

**Definition of Done:**
- [ ] Usage audit complete
- [ ] Unused code removed OR documented
- [ ] localStorage cleaned up
- [ ] No broken dependencies

---

### 8. Unified Storage Manager 📦
**Priority:** P1 | **Effort:** 6-8 hours | **Impact:** Data Integrity

**Problem:**
- 7+ different localStorage keys
- No versioning (breaking changes = broken app)
- No cleanup on logout
- No cross-tab synchronization

**Current State:**
```typescript
// Scattered localStorage usage:
localStorage.setItem('auth_token', token);
localStorage.setItem('userType', type);
localStorage.setItem('apartment_locator_unified_ai', JSON.stringify(inputs));
localStorage.setItem('apartmentiq_location_inputs', JSON.stringify(inputs));
localStorage.setItem('onboardingCurrentStep', step);
// ... 3+ more keys
```

**Tasks:**
1. **Create Storage Manager**
   ```typescript
   // src/utils/storageManager.ts
   const STORAGE_VERSION = '1.0';
   const STORAGE_PREFIX = 'apartment_locator_v1_';
   
   interface StorageSchema {
     version: string;
     auth: { token?: string };
     user: { type?: string; profile?: UserProfile };
     ai: UnifiedAIInputs;
     onboarding?: OnboardingFlowData;
   }
   
   export const storage = {
     get<K extends keyof StorageSchema>(key: K): StorageSchema[K] | null,
     set<K extends keyof StorageSchema>(key: K, value: StorageSchema[K]): void,
     remove(key: keyof StorageSchema): void,
     clear(): void,
     migrate(oldVersion: string): void
   };
   ```

2. **Implement Versioning**
   - Detect version mismatches
   - Run migrations automatically
   - Handle schema changes gracefully

3. **Add Cleanup Logic**
   ```typescript
   // On logout:
   storage.clear();
   
   // On login from different device:
   storage.migrate(oldVersion);
   ```

4. **Cross-Tab Sync**
   ```typescript
   window.addEventListener('storage', (e) => {
     if (e.key.startsWith(STORAGE_PREFIX)) {
       // Sync state across tabs
     }
   });
   ```

**Files to Create/Update:**
```
src/utils/storageManager.ts (NEW)
src/hooks/useUser.tsx (UPDATE to use manager)
src/contexts/UnifiedAIContext.tsx (UPDATE to use manager)
```

**Definition of Done:**
- [ ] All localStorage calls use manager
- [ ] Versioning works
- [ ] Migration tested
- [ ] Cleanup on logout verified
- [ ] Cross-tab sync functional

---

### 9. Missing Pages & Components 📄
**Priority:** P1 | **Effort:** 12-16 hours | **Impact:** Feature Complete

**A. Combined "Saved & Offers" Page**
**File:** `src/pages/SavedProperties.tsx` (UPDATE)

**Tasks:**
- Add tab interface (Saved | Offers)
- Merge content from OffersMade.tsx
- Create empty states
- Add filters/sorting

**Components Needed:**
```
src/components/EmptyState.tsx (NEW)
src/components/OfferCard.tsx (NEW)
```

**B. Paywall Modal**
**File:** `src/components/PaywallModal.tsx` (NEW)

**Features:**
- Shows after free calculator results
- $49 pricing display
- Feature list (what's unlocked)
- Stripe checkout integration
- Loading states

**C. Payment Success Page**
**File:** `src/pages/PaymentSuccess.tsx` (UPDATE)

**Features:**
- Verify Stripe payment
- Display unlocked results
- Download PDF option
- Email results option
- Track conversion

**Files to Create/Update:**
```
src/pages/SavedProperties.tsx (UPDATE - add tabs)
src/pages/PaymentSuccess.tsx (UPDATE - add verification)
src/components/EmptyState.tsx (NEW)
src/components/OfferCard.tsx (NEW)
src/components/PaywallModal.tsx (NEW)
```

**Definition of Done:**
- [ ] Saved & Offers page functional
- [ ] Tabs switch correctly
- [ ] Empty states show when no data
- [ ] Paywall modal displays correctly
- [ ] Payment success page verifies payment

---

### 10. Market Data Integration 📊
**Priority:** P1 | **Effort:** 16-20 hours | **Impact:** Core Feature

**Problem:**
- All property data is mocked
- No real market intelligence
- Can't provide accurate recommendations
- Landlord features impossible without real data

**Options:**

#### Option A: Build Scrapers (High Effort, Full Control)
**Pros:**
- No API costs
- Full control over data
- Can scrape any site

**Cons:**
- High maintenance (sites change)
- Rate limiting issues
- Legal gray area
- 20-30 hours setup + ongoing maintenance

**Implementation:**
```typescript
// server/services/scrapers/
├── apartmentsScraper.ts
├── zillowScraper.ts
├── rentScraper.ts
├── proxyManager.ts
└── dataProcessor.ts
```

#### Option B: Use Paid APIs (Low Effort, Ongoing Cost)
**Pros:**
- Reliable data
- No maintenance
- Legal/terms compliant
- 4-6 hours setup

**Cons:**
- Monthly costs ($29-$99/mo)
- Data limitations
- Dependent on third party

**Options:**
1. **RentCast API** - $99/mo
   - 10,000 requests/day
   - National coverage
   - Rent estimates, comps

2. **Realty Mole API** - $29/mo
   - 5,000 requests/mo
   - Property data
   - Market trends

3. **Zillow API** (if available)
   - Official data
   - Pricing varies

**Recommendation:** Start with paid API (RentCast or Realty Mole), build scrapers later if needed

**Tasks:**
1. Choose data provider
2. Set up API credentials
3. Create service layer
   ```typescript
   // src/services/marketDataService.ts
   export async function getPropertyData(address: string)
   export async function getMarketStats(zipCode: string)
   export async function getComparables(property: Property)
   ```
4. Cache responses (Redis or in-memory)
5. Rate limit handling

**Files to Create/Update:**
```
server/services/marketDataService.ts (NEW)
server/utils/cache.ts (NEW)
src/lib/api.ts (UPDATE - add market endpoints)
```

**Definition of Done:**
- [ ] Real property data flowing
- [ ] Market stats displayed correctly
- [ ] Rate limiting respected
- [ ] Caching reduces API calls
- [ ] Error handling for API failures

---

## 💡 MEDIUM PRIORITY (P2) - Week 5-8

### 11. Portfolio Dashboard (Landlord) 🏘️
**Priority:** P2 | **Effort:** 20-24 hours | **Impact:** Revenue Stream

**Features:**
1. Add/manage properties
2. Compare to market averages
3. Pricing recommendations
4. Vacancy risk scoring
5. Competitive intelligence alerts

**Database Schema:**
```sql
CREATE TABLE landlord_properties (
  id UUID PRIMARY KEY,
  landlord_id UUID REFERENCES users(id),
  address VARCHAR(500),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  current_rent INTEGER,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  square_feet INTEGER,
  market_avg_rent INTEGER,
  vacancy_risk VARCHAR(20),
  days_vacant INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**UI Components:**
```
src/pages/PortfolioDashboard.tsx (EXISTS - needs backend)
src/components/landlord/PropertyCard.tsx (NEW)
src/components/landlord/AddPropertyModal.tsx (NEW)
src/components/landlord/PricingRecommendation.tsx (NEW)
```

**Files to Create/Update:**
```
shared/schema.ts (ADD landlord_properties table)
server/routes.ts (ADD /api/landlord/properties endpoints)
src/pages/PortfolioDashboard.tsx (UPDATE - connect to real data)
src/components/landlord/* (NEW components)
```

**Definition of Done:**
- [ ] Landlords can add properties
- [ ] Market comparison shows
- [ ] Pricing recommendations accurate
- [ ] Vacancy risk calculated
- [ ] Mobile responsive

---

### 12. Email Template System 📧
**Priority:** P2 | **Effort:** 12-16 hours | **Impact:** Landlord Value

**Features:**
1. Pre-built templates (renewal, offers)
2. Token replacement ({{tenant_name}}, etc.)
3. Send tracking (opens, clicks)
4. Success rate analytics

**Database Schema:**
```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255),
  category VARCHAR(100),
  subject TEXT,
  body TEXT,
  tokens_used TEXT[],
  usage_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sent_emails (
  id UUID PRIMARY KEY,
  template_id UUID REFERENCES email_templates(id),
  user_id UUID,
  recipient_email VARCHAR(255),
  sent_at TIMESTAMP DEFAULT NOW(),
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP
);
```

**Integration:**
- **SendGrid** ($15/mo for 10k emails) - OR -
- **Resend** ($20/mo for 50k emails)

**Files to Create/Update:**
```
shared/schema.ts (ADD email tables)
server/routes.ts (ADD /api/email-templates endpoints)
server/services/emailService.ts (NEW)
src/pages/EmailTemplates.tsx (EXISTS - connect backend)
```

**Definition of Done:**
- [ ] Templates saved to database
- [ ] Token replacement works
- [ ] Emails send successfully
- [ ] Opens/clicks tracked
- [ ] Success rate displayed

---

### 13. Renewal Optimizer 🔄
**Priority:** P2 | **Effort:** 16-20 hours | **Impact:** Landlord Retention

**Features:**
1. Tenant lease tracking
2. Renewal recommendations
3. Optimal pricing calculator
4. Email automation

**Algorithm:**
```typescript
interface RenewalRecommendation {
  recommendedRent: number;
  incentive?: string;
  successProbability: number;
  reasoning: string;
}

function calculateRenewal(lease: TenantLease): RenewalRecommendation {
  const marketAvg = getMarketAvgRent(lease.propertyId);
  const tenantScore = calculateTenantScore(lease);
  const marketTrend = getMarketTrend(lease.propertyId);
  const turnoverCost = 1200; // Average cost to re-rent
  
  // Algorithm:
  // - Perfect tenants (100% payment) → flat or small increase
  // - Good tenants (95%+) → moderate increase
  // - Longer tenure = more valuable
  // - Factor in turnover cost
  
  return {
    recommendedRent: calculateOptimalRent(...),
    incentive: suggestIncentive(...),
    successProbability: predictSuccess(...),
    reasoning: generateExplanation(...)
  };
}
```

**Database Schema:**
```sql
CREATE TABLE tenant_leases (
  id UUID PRIMARY KEY,
  landlord_id UUID REFERENCES users(id),
  property_id UUID REFERENCES landlord_properties(id),
  tenant_name VARCHAR(255),
  tenant_email VARCHAR(255),
  current_rent INTEGER,
  lease_start DATE,
  lease_end DATE,
  time_in_unit INTEGER,
  payment_history_percent INTEGER,
  renewal_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Files to Create/Update:**
```
shared/schema.ts (ADD tenant_leases table)
server/services/renewalService.ts (NEW)
src/pages/RenewalOptimizer.tsx (EXISTS - connect backend)
```

**Definition of Done:**
- [ ] Tenants tracked in database
- [ ] Renewal recommendations generated
- [ ] Email integration works
- [ ] Success tracking functional

---

### 14. Competitive Intelligence Scraper 🕵️
**Priority:** P2 | **Effort:** 24-30 hours | **Impact:** Landlord Differentiation

**Features:**
1. Daily scraping of competitor properties
2. Price drop alerts
3. Concession tracking
4. Market share analysis

**Implementation Options:**

#### Option A: Build In-House
```typescript
// server/services/scrapers/apartmentsScraper.ts
import puppeteer from 'puppeteer';

export async function scrapeApartments(zipCode: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto(`https://www.apartments.com/${zipCode}`);
  
  const properties = await page.$$eval('.property-card', cards => 
    cards.map(card => ({
      name: card.querySelector('.name')?.textContent,
      address: card.querySelector('.address')?.textContent,
      rent: parseRent(card.querySelector('.price')?.textContent),
      concessions: extractConcessions(card)
    }))
  );
  
  await browser.close();
  return properties;
}
```

**Challenges:**
- Site structure changes
- Rate limiting
- IP blocking
- Legal concerns

#### Option B: Use Scraping Service
- **Bright Data** ($500+/mo) - Enterprise
- **ScraperAPI** ($29-149/mo) - Mid-tier
- **Apify** ($49+/mo) - Flexible

**Database Schema:**
```sql
CREATE TABLE competitor_properties (
  id UUID PRIMARY KEY,
  name VARCHAR(500),
  address VARCHAR(500),
  zip_code VARCHAR(20),
  rent_min INTEGER,
  rent_max INTEGER,
  concessions JSONB[],
  source VARCHAR(100),
  last_scraped TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE competitive_alerts (
  id UUID PRIMARY KEY,
  landlord_id UUID,
  competitor_property_id UUID REFERENCES competitor_properties(id),
  alert_type VARCHAR(50),
  old_value INTEGER,
  new_value INTEGER,
  impact_score INTEGER,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Files to Create/Update:**
```
server/services/scrapers/* (NEW)
server/services/alertService.ts (NEW)
shared/schema.ts (ADD competitor tables)
src/pages/CompetitiveIntelligence.tsx (NEW)
```

**Definition of Done:**
- [ ] Daily scraping runs
- [ ] Data stored correctly
- [ ] Alerts generated accurately
- [ ] Dashboard displays insights
- [ ] Rate limiting handled

---

### 15. Offer Heatmap Feature 🗺️
**Priority:** P2 | **Effort:** 12-16 hours | **Impact:** Viral Marketing

**Features:**
1. Geographic visualization of offer success rates
2. Success rate by ZIP code
3. Average savings by area
4. "Hot zones" for deals

**Implementation:**
```typescript
interface HeatmapData {
  zipCode: string;
  coordinates: { lat: number; lng: number };
  offersCount: number;
  successRate: number;
  avgSavings: number;
  timeframe: string;
}

// src/components/heatmap/OfferHeatmap.tsx
import MapGL, { Marker } from 'react-map-gl';

export function OfferHeatmap({ data }: { data: HeatmapData[] }) {
  return (
    <MapGL
      initialViewState={{
        latitude: 30.2672,
        longitude: -97.7431,
        zoom: 10
      }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
    >
      {data.map(zone => (
        <Marker
          key={zone.zipCode}
          latitude={zone.coordinates.lat}
          longitude={zone.coordinates.lng}
        >
          <HeatmapMarker
            successRate={zone.successRate}
            offersCount={zone.offersCount}
          />
        </Marker>
      ))}
    </MapGL>
  );
}
```

**Database Schema:**
```sql
CREATE TABLE offer_heatmap_data (
  id UUID PRIMARY KEY,
  zip_code VARCHAR(20),
  city VARCHAR(100),
  state VARCHAR(50),
  coordinates JSONB,
  offers_count INTEGER DEFAULT 0,
  accepted_count INTEGER DEFAULT 0,
  declined_count INTEGER DEFAULT 0,
  avg_savings INTEGER,
  last_updated TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Files to Create/Update:**
```
shared/schema.ts (ADD offer_heatmap_data table)
server/services/heatmapAggregation.ts (NEW)
src/components/heatmap/OfferHeatmap.tsx (EXISTS - connect real data)
src/pages/OfferHeatmap.tsx (NEW)
```

**Definition of Done:**
- [ ] Map displays correctly
- [ ] Markers show accurate data
- [ ] Colors represent success rates
- [ ] Click for details works
- [ ] Data updates daily

---

## ✨ LOW PRIORITY (P3) - Week 9+

### 16. Agent Tools & CRM 🤝
**Priority:** P3 | **Effort:** 24-30 hours | **Impact:** New Revenue Stream

**Features:**
1. Client management
2. Search on behalf of clients
3. Professional reports (PDF)
4. Commission tracking
5. Lead capture forms

**Database Schema:**
```sql
CREATE TABLE agent_clients (
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES users(id),
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  budget INTEGER,
  bedrooms INTEGER,
  location VARCHAR(255),
  move_in_date DATE,
  status VARCHAR(50),
  lead_source VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE agent_commissions (
  id UUID PRIMARY KEY,
  agent_id UUID,
  client_id UUID REFERENCES agent_clients(id),
  property_id UUID,
  lease_value INTEGER,
  commission_rate DECIMAL(5,2),
  commission_amount INTEGER,
  status VARCHAR(50),
  paid_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Files to Create/Update:**
```
shared/schema.ts (ADD agent tables)
server/routes.ts (ADD /api/agent/* endpoints)
src/pages/AgentDashboard.tsx (EXISTS - connect backend)
src/components/agent/* (UPDATE with real data)
```

**Definition of Done:**
- [ ] Agents can add clients
- [ ] Search on behalf of clients works
- [ ] PDF reports generate
- [ ] Commission tracking accurate
- [ ] Lead capture forms functional

---

### 17. Advanced Analytics & Insights 📈
**Priority:** P3 | **Effort:** 20-24 hours | **Impact:** Product Differentiation

**Features:**
1. User behavior tracking
2. Feature usage analytics
3. Conversion funnels
4. A/B testing framework
5. Revenue dashboards

**Implementation:**
```typescript
// Use Mixpanel, Amplitude, or PostHog
import mixpanel from 'mixpanel-browser';

mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN);

// Track events
mixpanel.track('Property Viewed', {
  propertyId: property.id,
  source: 'search_results',
  userType: user.userType
});

// User properties
mixpanel.people.set({
  $email: user.email,
  userType: user.userType,
  signupDate: user.createdAt
});
```

**Files to Create/Update:**
```
src/lib/analytics.ts (NEW)
src/hooks/useAnalytics.ts (NEW)
server/routes.ts (ADD analytics endpoints)
```

**Definition of Done:**
- [ ] Key events tracked
- [ ] Conversion funnels visible
- [ ] Revenue metrics calculated
- [ ] A/B tests can be run
- [ ] Dashboard displays insights

---

### 18. Mobile App (React Native) 📱
**Priority:** P3 | **Effort:** 60-80 hours | **Impact:** Market Expansion

**Features:**
1. Native iOS/Android apps
2. Push notifications
3. Offline mode
4. Camera integration (lease photos)
5. Location-based search

**Technology:**
- React Native
- Expo (for rapid development)
- Shared API endpoints

**Timeline:** 8-12 weeks as separate project

---

### 19. API & Integrations 🔌
**Priority:** P3 | **Effort:** 16-24 hours | **Impact:** Partnership Opportunities

**Features:**
1. Public API for property data
2. Webhook system
3. OAuth for third-party apps
4. Zapier integration
5. CRM integrations (HubSpot, Salesforce)

**API Design:**
```
GET /api/v1/properties
POST /api/v1/webhooks/subscribe
GET /api/v1/market-stats/:zipCode
POST /api/v1/offers
```

**Files to Create/Update:**
```
server/api/v1/* (NEW - versioned API)
server/middleware/rateLimit.ts (NEW)
server/middleware/apiAuth.ts (NEW)
docs/API.md (NEW - API documentation)
```

---

### 20. White-Label Solution 🏷️
**Priority:** P3 | **Effort:** 40-50 hours | **Impact:** Enterprise Revenue

**Features:**
1. Custom branding per client
2. Custom domains
3. Feature flags per tenant
4. Usage-based billing
5. Admin panel for white-label management

**Architecture:**
```
Multi-tenant database with tenant_id
Route: /:tenantSlug/* or custom domains
Branding stored in tenant_config table
```

---

## 🧪 TESTING & QUALITY (Ongoing)

### Unit Testing 🧩
**Priority:** P1 | **Effort:** Ongoing

**Current State:** Tests exist but need expansion

**Tasks:**
1. Increase coverage to >80%
2. Test critical paths (payment, auth)
3. Test edge cases
4. Mock external APIs

**Tools:**
- Jest
- React Testing Library
- MSW (Mock Service Worker)

**Files to Create/Update:**
```
src/__tests__/* (EXPAND)
src/lib/*.test.ts (ADD)
server/__tests__/* (ADD)
```

---

### E2E Testing 🎭
**Priority:** P2 | **Effort:** 12-16 hours

**Tools:**
- Playwright or Cypress

**Critical Flows to Test:**
1. Signup → Onboarding → Dashboard
2. Search → Save → Offer
3. Payment → Success
4. Landlord add property

**Files to Create:**
```
e2e/
  ├── auth.spec.ts
  ├── search.spec.ts
  ├── payment.spec.ts
  └── landlord.spec.ts
```

---

### Performance Optimization ⚡
**Priority:** P2 | **Effort:** 8-12 hours

**Tasks:**
1. Code splitting (React.lazy)
2. Image optimization
3. Bundle size analysis
4. Lazy loading components
5. Caching strategies

**Tools:**
- Lighthouse
- Bundle analyzer
- React DevTools Profiler

**Target Metrics:**
- First Contentful Paint: <1.5s
- Time to Interactive: <3.0s
- Lighthouse Score: >90

---

## 🚀 DEPLOYMENT & DEVOPS

### CI/CD Pipeline 🔄
**Priority:** P1 | **Effort:** 6-8 hours

**Tasks:**
1. GitHub Actions workflow
2. Automated testing on PR
3. Staging deployment
4. Production deployment
5. Rollback strategy

**Files to Create:**
```
.github/workflows/
  ├── ci.yml (test on PR)
  ├── deploy-staging.yml
  └── deploy-production.yml
```

---

### Monitoring & Logging 📊
**Priority:** P1 | **Effort:** 4-6 hours

**Tools:**
- **Error Tracking:** Sentry
- **Logging:** Logtail or Papertrail
- **Uptime:** UptimeRobot
- **Performance:** Vercel Analytics or Cloudflare Analytics

**Tasks:**
1. Set up error tracking
2. Configure logging
3. Set up alerts
4. Create status page

---

### Security Hardening 🔒
**Priority:** P1 | **Effort:** 8-12 hours

**Tasks:**
1. Implement rate limiting
2. Add CORS properly
3. Secure environment variables
4. SQL injection prevention
5. XSS protection
6. CSRF tokens

**Tools:**
- Helmet.js
- Express rate limit
- Bcrypt (already used)

---

## 📋 DOCUMENTATION

### User Documentation 📖
**Priority:** P2 | **Effort:** 8-12 hours

**Pages Needed:**
1. Getting Started Guide
2. Feature Tutorials
3. FAQ per user type
4. Video walkthroughs
5. Troubleshooting

---

### Developer Documentation 💻
**Priority:** P2 | **Effort:** 6-8 hours

**Pages Needed:**
1. Setup guide (CONTRIBUTING.md)
2. Architecture overview
3. API documentation (OpenAPI/Swagger)
4. Database schema diagrams
5. Component library (Storybook)

---

## 🎯 SUCCESS METRICS

### Technical Metrics
- [ ] API response time <200ms (p95)
- [ ] Uptime >99.5%
- [ ] Error rate <1%
- [ ] Test coverage >80%
- [ ] Lighthouse score >90

### Business Metrics
- [ ] Payment success rate >95%
- [ ] Email delivery rate >95%
- [ ] User activation (complete onboarding) >60%
- [ ] Feature usage (weekly active) >40%
- [ ] Conversion (free → paid) >15%

### User Experience Metrics
- [ ] Page load time <2s
- [ ] Zero WCAG accessibility violations
- [ ] Mobile-friendly score 100%
- [ ] No console errors
- [ ] Smooth animations (60fps)

---

## 🗓️ RECOMMENDED TIMELINE

### Week 1: Critical Fixes
- [ ] Protected routes (#1)
- [ ] User type backend (#2)
- [ ] Theme consistency (#5)

### Week 2: Payment & Database
- [ ] Stripe integration (#3)
- [ ] Database setup (#4)
- [ ] Core tables migration

### Week 3: State Management
- [ ] Context consolidation (#6)
- [ ] Storage manager (#8)
- [ ] OnboardingFlow cleanup (#7)

### Week 4: Missing Pages
- [ ] Combined Saved & Offers (#9)
- [ ] Payment success page (#9)
- [ ] Paywall modal (#9)

### Week 5: Market Data
- [ ] Market data integration (#10)
- [ ] API setup
- [ ] Caching layer

### Week 6-8: Landlord Features
- [ ] Portfolio dashboard (#11)
- [ ] Email templates (#12)
- [ ] Renewal optimizer (#13)

### Week 9+: Advanced Features
- [ ] Competitive intelligence (#14)
- [ ] Offer heatmap (#15)
- [ ] Agent tools (#16)

---

## 🤔 KEY DECISIONS NEEDED

### Decision 1: Database Provider
**Options:**
- **Supabase** (recommended) - More features, external
- **Replit PostgreSQL** - Simpler, integrated

**Recommendation:** Supabase for production

---

### Decision 2: Market Data Source
**Options:**
- **Build scrapers** - Free, high maintenance
- **RentCast API** - $99/mo, reliable
- **Realty Mole API** - $29/mo, limited

**Recommendation:** Start with RentCast API

---

### Decision 3: Theme Strategy
**Options:**
- **All light theme** - Better for onboarding
- **All dark theme** - More modern
- **User preference** - Most work

**Recommendation:** All light for onboarding, dark for dashboard

---

### Decision 4: MVP Scope
**Options:**
- **Renter only** - 2-3 weeks to launch
- **Renter + Landlord** - 6-8 weeks
- **Full platform** - 12+ weeks

**Recommendation:** Launch with renter MVP, add landlord features post-launch

---

## 📞 TECHNICAL DEBT TRACKING

### Known Issues
1. ⚠️ No TypeScript strict mode enabled
2. ⚠️ Some components missing prop types
3. ⚠️ Inconsistent error handling
4. ⚠️ No loading states in some components
5. ⚠️ Mixed class/functional components

### Refactoring Opportunities
1. Extract common UI patterns
2. Consolidate duplicate code
3. Improve type safety
4. Add JSDoc comments
5. Standardize naming conventions

---

## 🎉 LAUNCH CHECKLIST

### Pre-Launch (2 Weeks Before)
- [ ] All P0 tasks complete
- [ ] Payment flow tested end-to-end
- [ ] Database migrations run
- [ ] Security audit complete
- [ ] Performance optimized
- [ ] Analytics set up

### Launch Week
- [ ] Staging environment tested
- [ ] Production environment ready
- [ ] Monitoring configured
- [ ] Error tracking active
- [ ] Backup strategy in place
- [ ] Rollback plan documented

### Post-Launch (Week 1)
- [ ] Monitor error rates
- [ ] Track conversion metrics
- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Update documentation

---

## 📝 NOTES

### Architecture Decisions
- Using localStorage for client state (short-term)
- Backend persistence for critical data
- Stripe for payments (industry standard)
- PostgreSQL for database (future-proof)

### Known Limitations
- No offline mode (future: PWA)
- No real-time updates (future: WebSockets)
- Limited mobile optimization (future: React Native)

### Future Considerations
- Internationalization (i18n)
- Multi-language support
- Accessibility improvements (WCAG AAA)
- Dark mode toggle
- Advanced search filters

---

## 🆘 GETTING HELP

**For technical questions:**
- Review existing documentation files
- Check ARCHITECTURAL_REVIEW.md
- See BACKEND_INTEGRATION_PLAN.md

**For design questions:**
- Review UX_UI_ANALYSIS.md
- Check design-system.ts
- See DESIGN_AUDIT.md

**For business questions:**
- Review MONETIZATION_STRATEGY.md
- Check PAGES_TO_BUILD.md

---

**Last Updated:** February 4, 2025  
**Next Review:** After Week 2 completion  
**Owner:** Development Team

---

**Total Estimated Effort:**
- **P0 (Critical):** 36-54 hours (1-1.5 weeks)
- **P1 (High):** 76-104 hours (2-3 weeks)
- **P2 (Medium):** 116-156 hours (3-4 weeks)
- **P3 (Low):** 160-240 hours (4-6 weeks)

**Grand Total:** 388-554 hours (10-14 weeks full-time)

**For MVP Launch (P0 + P1 only):** 112-158 hours (3-4 weeks full-time)
