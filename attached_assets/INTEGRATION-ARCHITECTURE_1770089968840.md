# ApartmentIQ - Complete Integration Architecture
## Location Cost Model + Moltworker Scraping

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                         APARTMENTIQ FULL STACK ARCHITECTURE                             │
│                                                                                         │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐                   │
│  │   MOLTWORKER    │     │  PYTHON SCRAPER │     │    FRONTEND     │                   │
│  │   (Cloudflare)  │     │   (Phase 2)     │     │    (React)      │                   │
│  │                 │     │                 │     │                 │                   │
│  │  Property Sites │     │  Aggregators    │     │  Location Cost  │                   │
│  │  Real-time data │     │  Bulk data      │     │  Calculator     │                   │
│  └────────┬────────┘     └────────┬────────┘     └────────┬────────┘                   │
│           │                       │                       │                            │
│           └───────────────────────┼───────────────────────┘                            │
│                                   │                                                     │
│                                   ▼                                                     │
│                          ┌─────────────────┐                                           │
│                          │    SUPABASE     │                                           │
│                          │   PostgreSQL    │                                           │
│                          └─────────────────┘                                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# PART 1: MOLTWORKER SCRAPING SETUP
## Deploy in 30 minutes, start scraping today

---

## Prerequisites Checklist

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  BEFORE YOU START - GET THESE READY                                                     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  [ ] Cloudflare Account (free to create)                                                │
│      → https://dash.cloudflare.com/sign-up                                              │
│                                                                                         │
│  [ ] Workers Paid Plan ($5/month)                                                       │
│      → Required for Sandbox containers                                                  │
│      → Dashboard → Workers & Pages → Plans → Subscribe to Paid                          │
│                                                                                         │
│  [ ] Anthropic API Key                                                                  │
│      → https://console.anthropic.com/settings/keys                                      │
│      → Or use Cloudflare AI Gateway for unified billing                                 │
│                                                                                         │
│  [ ] Node.js 18+ installed locally                                                      │
│      → node --version                                                                   │
│                                                                                         │
│  [ ] Wrangler CLI installed                                                             │
│      → npm install -g wrangler                                                          │
│      → wrangler login                                                                   │
│                                                                                         │
│  [ ] Your Supabase credentials                                                          │
│      → URL: https://jdymvpasjsdbryatscux.supabase.co                                    │
│      → Service Role Key (for writing data)                                              │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Step 1: Clone and Configure Moltworker

```bash
# Clone the repository
git clone https://github.com/cloudflare/moltworker.git
cd moltworker

# Install dependencies
npm install

# Copy environment template
cp .dev.vars.example .dev.vars
```

## Step 2: Configure Environment Variables

Edit `.dev.vars` for local development:

```bash
# .dev.vars

# Required: Anthropic API for Claude
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# Development mode (skip auth for local testing)
DEV_MODE=true

# Enable debug routes
DEBUG_ROUTES=true

# Gateway token (change in production!)
MOLTBOT_GATEWAY_TOKEN=dev-token-change-in-prod

# CDP for browser automation
CDP_SECRET=your-cdp-secret-here
```

## Step 3: Set Production Secrets

```bash
# Set secrets for production deployment
npx wrangler secret put ANTHROPIC_API_KEY
# Enter your Anthropic API key when prompted

npx wrangler secret put MOLTBOT_GATEWAY_TOKEN
# Enter a secure random token

npx wrangler secret put CDP_SECRET
# Enter a secret for browser automation auth

# Optional: R2 for persistent storage
npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_SECRET_ACCESS_KEY
npx wrangler secret put CF_ACCOUNT_ID
```

## Step 4: Deploy to Cloudflare

```bash
# Build and deploy
npm run deploy

# Your worker will be available at:
# https://moltworker.<your-subdomain>.workers.dev
```

## Step 5: Verify Deployment

```bash
# Check if the worker is running
curl https://moltworker.<your-subdomain>.workers.dev/debug/version

# Expected response:
# { "status": "ok", "version": "..." }
```

---

## Apartment Scraping Configuration

### Create Custom Scraping Agent

Create a file `apartment-scraper-config.json`:

```json
{
  "name": "ApartmentIQ Scraper",
  "description": "Extracts apartment listings from property websites",
  
  "extraction_schema": {
    "property_name": "string - Name of the apartment complex",
    "address": "string - Full street address",
    "city": "string",
    "state": "string (2-letter code)",
    "zip_code": "string",
    "units": [
      {
        "unit_number": "string or null",
        "floor_plan": "string - e.g., '1BR/1BA', 'Studio'",
        "bedrooms": "number",
        "bathrooms": "number",
        "sqft": "number",
        "rent_min": "number - Monthly rent low end",
        "rent_max": "number - Monthly rent high end or same as min",
        "available_date": "string - ISO date or 'Now'",
        "deposit": "number or null",
        "amenities": ["string array"]
      }
    ],
    "community_amenities": ["string array"],
    "pet_policy": "string",
    "parking": {
      "available": "boolean",
      "type": "string - 'Garage', 'Surface', 'Street'",
      "cost": "number or null - monthly cost, null if included"
    },
    "contact_phone": "string",
    "website_url": "string - the URL being scraped",
    "last_scraped": "ISO timestamp"
  },
  
  "scraping_instructions": [
    "Navigate to the property website floor plans or pricing page",
    "Wait for dynamic content to load (React/Vue sites may need 2-3 seconds)",
    "Extract ALL available unit types and their current pricing",
    "If pricing shows a range ($1,200 - $1,400), capture both min and max",
    "Look for move-in specials or concessions and note them",
    "Extract the full address including zip code",
    "Capture all amenities listed (both unit and community)",
    "Note parking costs - many sites hide this in fees section",
    "If a unit shows 'Call for pricing', set rent_min and rent_max to null"
  ]
}
```

### CDP Browser Automation Script

Create `scrape-apartment.js` to send to Moltworker:

```javascript
// scrape-apartment.js
// Send this via CDP endpoint to scrape a property website

const scrapeApartment = async (url) => {
  const response = await fetch('https://moltworker.<your-subdomain>.workers.dev/cdp/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CDP_SECRET': 'your-cdp-secret-here'
    },
    body: JSON.stringify({
      url: url,
      waitFor: 3000, // Wait for JS to render
      extractionPrompt: `
        You are extracting apartment listing data from this property website.
        
        Extract and return a JSON object with:
        {
          "property_name": "...",
          "address": "...",
          "city": "...",
          "state": "...",
          "zip_code": "...",
          "units": [
            {
              "floor_plan": "1 Bedroom",
              "bedrooms": 1,
              "bathrooms": 1,
              "sqft": 750,
              "rent_min": 1200,
              "rent_max": 1400,
              "available_date": "2026-03-01"
            }
          ],
          "parking": {
            "available": true,
            "cost": 150
          },
          "pet_policy": "Cats and dogs allowed, $300 deposit",
          "community_amenities": ["Pool", "Gym", "Business Center"]
        }
        
        Return ONLY valid JSON, no markdown or explanation.
      `
    })
  });
  
  return response.json();
};

// Example usage:
// scrapeApartment('https://highlandsatsweetwatercreek.com/floorplans')
```

### Supabase Integration

Create `sync-to-supabase.js`:

```javascript
// sync-to-supabase.js
// After scraping, sync data to your Supabase database

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jdymvpasjsdbryatscux.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncApartmentData(scrapedData) {
  // Upsert property
  const { data: property, error: propError } = await supabase
    .from('properties')
    .upsert({
      external_id: generateExternalId(scrapedData.website_url),
      name: scrapedData.property_name,
      address: scrapedData.address,
      city: scrapedData.city,
      state: scrapedData.state,
      zip_code: scrapedData.zip_code,
      pet_policy: scrapedData.pet_policy,
      parking_available: scrapedData.parking?.available,
      parking_cost: scrapedData.parking?.cost,
      amenities: scrapedData.community_amenities,
      source_url: scrapedData.website_url,
      last_scraped: new Date().toISOString(),
      data_source: 'moltworker'
    }, {
      onConflict: 'external_id'
    })
    .select()
    .single();

  if (propError) throw propError;

  // Upsert units
  for (const unit of scrapedData.units) {
    await supabase
      .from('units')
      .upsert({
        property_id: property.id,
        floor_plan: unit.floor_plan,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        sqft: unit.sqft,
        rent_min: unit.rent_min,
        rent_max: unit.rent_max,
        available_date: unit.available_date,
        deposit: unit.deposit,
        amenities: unit.amenities,
        last_seen: new Date().toISOString()
      }, {
        onConflict: 'property_id,floor_plan'
      });
  }

  // Track price history
  for (const unit of scrapedData.units) {
    await supabase
      .from('price_history')
      .insert({
        property_id: property.id,
        floor_plan: unit.floor_plan,
        rent_min: unit.rent_min,
        rent_max: unit.rent_max,
        recorded_at: new Date().toISOString()
      });
  }

  return property;
}

function generateExternalId(url) {
  // Create consistent ID from URL
  return Buffer.from(url).toString('base64').slice(0, 32);
}
```

---

## Database Schema for Scraped Data

```sql
-- Run in Supabase SQL Editor

-- Properties table (apartment complexes)
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  pet_policy TEXT,
  parking_available BOOLEAN DEFAULT true,
  parking_cost DECIMAL(10, 2),
  amenities TEXT[],
  source_url TEXT,
  data_source TEXT DEFAULT 'moltworker',
  last_scraped TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Units table (individual floor plans)
CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  floor_plan TEXT NOT NULL,
  unit_number TEXT,
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  sqft INTEGER,
  rent_min DECIMAL(10, 2),
  rent_max DECIMAL(10, 2),
  deposit DECIMAL(10, 2),
  available_date DATE,
  amenities TEXT[],
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(property_id, floor_plan)
);

-- Price history for tracking changes
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  floor_plan TEXT,
  rent_min DECIMAL(10, 2),
  rent_max DECIMAL(10, 2),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraping job queue
CREATE TABLE IF NOT EXISTS scrape_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  priority INTEGER DEFAULT 5,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  last_attempt TIMESTAMP WITH TIME ZONE,
  attempts INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_properties_city_state ON properties(city, state);
CREATE INDEX idx_properties_zip ON properties(zip_code);
CREATE INDEX idx_units_property ON units(property_id);
CREATE INDEX idx_units_bedrooms ON units(bedrooms);
CREATE INDEX idx_units_rent ON units(rent_min, rent_max);
CREATE INDEX idx_price_history_property ON price_history(property_id, recorded_at);
CREATE INDEX idx_scrape_queue_status ON scrape_queue(status, priority);
```

---

## Scraping Workflow

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                         MOLTWORKER SCRAPING WORKFLOW                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│   1. ADD URLs TO QUEUE                                                                  │
│      ┌─────────────────────────────────────────────────────────────────────────────┐   │
│      │  INSERT INTO scrape_queue (url, priority)                                    │   │
│      │  VALUES                                                                      │   │
│      │    ('https://highlandsatsweetwatercreek.com/floorplans', 10),               │   │
│      │    ('https://camdenorangecourt.com/apartments', 10),                         │   │
│      │    ('https://ariummetrowest.com/floor-plans', 10);                          │   │
│      └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
│   2. WORKER PROCESSES QUEUE                                                             │
│      ┌────────────────┐      ┌────────────────┐      ┌────────────────┐               │
│      │ Fetch pending  │ ──▶  │ Moltworker     │ ──▶  │ Claude extracts│               │
│      │ URL from queue │      │ loads page via │      │ structured     │               │
│      │                │      │ CDP browser    │      │ apartment data │               │
│      └────────────────┘      └────────────────┘      └────────────────┘               │
│                                                             │                          │
│   3. SAVE TO SUPABASE                                       ▼                          │
│      ┌─────────────────────────────────────────────────────────────────────────────┐   │
│      │  properties table  ◀──  syncApartmentData(extractedJSON)                    │   │
│      │  units table       ◀──                                                       │   │
│      │  price_history     ◀──                                                       │   │
│      └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
│   4. FRONTEND DISPLAYS                                                                  │
│      ┌─────────────────────────────────────────────────────────────────────────────┐   │
│      │  React Query fetches from Supabase                                          │   │
│      │  Location Cost Model calculates TRUE COST for each listing                  │   │
│      │  User sees real apartments with real pricing + location costs               │   │
│      └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Scheduling (Cron via Cloudflare)

Add to `wrangler.toml`:

```toml
[triggers]
crons = ["0 6 * * *"]  # Run daily at 6 AM UTC
```

The worker will automatically process the scrape queue on schedule.

---

## Testing Your Setup

```bash
# 1. Test locally first
npm run dev

# 2. Open the gateway UI
# http://localhost:8787?token=dev-token-change-in-prod

# 3. Test a scrape via chat:
# "Scrape the apartment listings from https://highlandsatsweetwatercreek.com/floorplans"

# 4. Check the extracted data in the response

# 5. Once working, deploy to production
npm run deploy
```

---

# PART 2: LOCATION COST MODEL
## How it fits into ApartmentIQ

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                     LOCATION COST MODEL - INTEGRATION PLAN                              │
│                         "True Monthly Cost Calculator"                                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Where It Fits in User Flow

```
                                    ┌──────────────┐
                                    │   VISITOR    │
                                    └──────┬───────┘
                                           │
                                           ▼
                              ┌────────────────────────┐
                              │     LANDING PAGE       │
                              │   (LandingSSRSafe)     │
                              │                        │
                              │  ★ NEW: "See Your     │
                              │    True Monthly Cost"  │
                              │    CTA Button          │
                              └───────────┬────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
           ┌───────────────┐    ┌─────────────────┐    ┌───────────────┐
           │  SIGN IN/UP   │    │   ★ NEW DEMO    │    │   PRICING     │
           │   (/auth)     │    │ (/demo)         │    │  (/pricing)   │
           └───────┬───────┘    │                 │    │               │
                   │            │ Location Cost   │    │ ★ "Unlock     │
                   │            │ Calculator with │    │   Location    │
                   │            │ sample data     │    │   Intelligence│
                   │            └────────┬────────┘    │   Feature"    │
                   │                     │             └───────────────┘
                   └──────────┬──────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              DASHBOARD (/dashboard)                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │                         MAIN NAVIGATION                                          │    │
│  │  [Dashboard] [Search] [Saved] [Market Intel] [★ TRUE COST] [AI Formula]         │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  ┌──────────────────────────────────────────┐  ┌────────────────────────────────────┐   │
│  │ ★ LOCATION COST SETUP (One-time)         │  │ Property Search Results            │   │
│  │                                          │  │                                    │   │
│  │  📍 Work Address: [123 Main St...]       │  │  ┌────────────────────────────┐   │   │
│  │  🚗 Commute: [5] days/week               │  │  │ The Vue at Lake Eola       │   │   │
│  │  ⛽ Vehicle MPG: [28]                    │  │  │ $1,850/mo base rent        │   │   │
│  │  🛒 Grocery trips: [2]/week              │  │  │ ────────────────────────   │   │   │
│  │  🏋️ Gym: [✓] 3x/week                    │  │  │ ★ TRUE COST: $2,127/mo     │   │   │
│  │                                          │  │  │ +$277 location costs       │   │   │
│  │  [Calculate True Costs]                  │  │  └────────────────────────────┘   │   │
│  └──────────────────────────────────────────┘  │                                    │   │
│                                                 │  ┌────────────────────────────┐   │   │
│                                                 │  │ ARIUM MetroWest            │   │   │
│                                                 │  │ $1,275/mo base rent        │   │   │
│                                                 │  │ ────────────────────────   │   │   │
│                                                 │  │ ★ TRUE COST: $1,412/mo     │   │   │
│                                                 │  │ +$137 location costs       │   │   │
│                                                 │  │ 💰 SAVES $715/mo vs Vue    │   │   │
│                                                 │  └────────────────────────────┘   │   │
│                                                 └────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## New Page: Location Intelligence Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  LOCATION INTELLIGENCE (/location-intelligence)                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │                          YOUR LIFESTYLE INPUTS                                   │    │
│  │  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐        │    │
│  │  │ 📍 WORK COMMUTE     │ │ 🛒 GROCERIES        │ │ 🏋️ FITNESS          │        │    │
│  │  │                     │ │                     │ │                     │        │    │
│  │  │ Address:            │ │ Trips/week: [2]     │ │ [✓] I have a gym    │        │    │
│  │  │ [Google Autocomplete│ │                     │ │     membership      │        │    │
│  │  │  ________________]  │ │ Preferred store:    │ │                     │        │    │
│  │  │                     │ │ [Any ▼]             │ │ Visits/week: [3]    │        │    │
│  │  │ Days/week: [5]      │ │  • Whole Foods      │ │                     │        │    │
│  │  │                     │ │  • Trader Joe's     │ │ Gym address:        │        │    │
│  │  │ Mode: [🚗][🚇][🚴][🚶] │  • Kroger/Publix    │ │ [________________]  │        │    │
│  │  │                     │ │  • Walmart          │ │                     │        │    │
│  │  │ Vehicle MPG: [28]   │ │  • Costco           │ │ Or: Find nearest    │        │    │
│  │  └─────────────────────┘ └─────────────────────┘ └─────────────────────┘        │    │
│  │                                                                                  │    │
│  │  ┌─────────────────────┐ ┌─────────────────────┐                                │    │
│  │  │ 🅿️ PARKING          │ │ 🚇 TRANSIT          │  Current gas price:            │    │
│  │  │                     │ │                     │  $3.29/gal (FL avg)            │    │
│  │  │ [✓] I need parking  │ │ [ ] I use public    │  [Edit manually]               │    │
│  │  │                     │ │     transit         │                                │    │
│  │  │ Est. monthly: $150  │ │                     │                                │    │
│  │  │ (based on area)     │ │ Monthly pass: [$__] │                                │    │
│  │  └─────────────────────┘ └─────────────────────┘                                │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│                              [🔄 RECALCULATE ALL APARTMENTS]                            │
│                                                                                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                          TRUE COST COMPARISON MAP                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                                  │    │
│  │                    🏠 $1,412                                                     │    │
│  │                      ARIUM                      📍 WORK                         │    │
│  │                    (BEST VALUE)                  ⭐                              │    │
│  │         ┌─────────────────────────────────────────┐                             │    │
│  │         │                                         │                             │    │
│  │   🏠 $1,527                                  🏠 $2,127                          │    │
│  │    Baldwin                                    The Vue                           │    │
│  │                                              (Most Expensive)                   │    │
│  │                      🏠 $1,650                                                  │    │
│  │                       Camden                                                    │    │
│  │                                                                                  │    │
│  │   Legend: 🟢 Under avg  🟡 Average  🔴 Over avg                                 │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                          APARTMENT COMPARISON TABLE                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  APARTMENT          BASE RENT   COMMUTE   PARKING  GROCERY  GYM   TRUE COST    │    │
│  │  ─────────────────────────────────────────────────────────────────────────────  │    │
│  │  🥇 ARIUM MetroWest  $1,275     +$87      $0       +$32     +$18   $1,412 ✓    │    │
│  │  🥈 Baldwin Harbor   $1,350     +$112     $0       +$41     +$24   $1,527       │    │
│  │  🥉 Camden Orange    $1,650     +$0       $0       +$0      +$0    $1,650       │    │
│  │     Millenia Apts    $1,450     +$98      $0       +$28     +$15   $1,591       │    │
│  │     The Vue          $1,850     +$172     +$150    +$24     +$31   $2,127       │    │
│  │  ─────────────────────────────────────────────────────────────────────────────  │    │
│  │  AVERAGE:            $1,515                                        $1,661       │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  💡 INSIGHT: ARIUM MetroWest has the cheapest rent AND the lowest true cost.    │    │
│  │     You'd save $715/month vs The Vue — that's $8,580/year!                      │    │
│  │                                                                                  │    │
│  │     However, your commute would be 23 min longer each way (46 min/day).         │    │
│  │     That's ~17 extra hours/month. Is $42/hour worth your time?                  │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                         NEW COMPONENTS TO BUILD                                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  src/                                                                                    │
│  ├── pages/                                                                              │
│  │   └── LocationIntelligence.tsx          ★ NEW: Main page                             │
│  │                                                                                       │
│  ├── components/                                                                         │
│  │   └── location-cost/                    ★ NEW: Feature folder                        │
│  │       ├── index.ts                      # Barrel export                              │
│  │       ├── LocationCostProvider.tsx      # Context for persisting inputs             │
│  │       ├── LifestyleInputs.tsx           # Work, grocery, gym, transit inputs        │
│  │       ├── WorkCommuteInput.tsx          # Google Places autocomplete + mode         │
│  │       ├── GroceryPreferences.tsx        # Frequency + preferred chain               │
│  │       ├── GymPreferences.tsx            # Membership toggle + visits                │
│  │       ├── ParkingEstimate.tsx           # Auto-estimate based on area               │
│  │       ├── TransitPreferences.tsx        # Transit toggle + pass cost                │
│  │       ├── TrueCostCard.tsx              # Per-apartment cost breakdown              │
│  │       ├── TrueCostMap.tsx               # Map with cost overlays                    │
│  │       ├── CostComparisonTable.tsx       # Side-by-side comparison                   │
│  │       ├── CostBreakdownChart.tsx        # Visual breakdown (pie/bar)                │
│  │       ├── SavingsInsight.tsx            # AI-style insight card                     │
│  │       └── TrueCostBadge.tsx             # Small badge for PropertyCard              │
│  │                                                                                       │
│  ├── hooks/                                                                              │
│  │   ├── useLocationCost.ts                ★ NEW: Main calculation hook                 │
│  │   ├── useGooglePlaces.ts                ★ NEW: Address autocomplete                  │
│  │   ├── useDistanceMatrix.ts              ★ NEW: Drive time/distance                   │
│  │   └── useGasPrices.ts                   ★ NEW: EIA API integration                   │
│  │                                                                                       │
│  ├── services/                                                                           │
│  │   └── locationCostService.ts            ★ NEW: All calculation logic                 │
│  │                                                                                       │
│  ├── types/                                                                              │
│  │   └── locationCost.types.ts             ★ NEW: TypeScript interfaces                 │
│  │                                                                                       │
│  └── contexts/                                                                           │
│      └── LocationCostContext.tsx           ★ NEW: Persist user inputs                   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Integration with Existing Components

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                    INTEGRATION POINTS                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  1. App.tsx - Add new route                                                              │
│     ┌────────────────────────────────────────────────────────────────────────────┐      │
│     │  <Route path="/location-intelligence" element={<LocationIntelligence />} />│      │
│     └────────────────────────────────────────────────────────────────────────────┘      │
│                                                                                          │
│  2. App.tsx - Add LocationCostProvider to provider stack                                 │
│     ┌────────────────────────────────────────────────────────────────────────────┐      │
│     │  <QueryClientProvider>                                                      │      │
│     │    <UserProvider>                                                           │      │
│     │      <PropertyStateProvider>                                                │      │
│     │        <LocationCostProvider>  ← NEW                                        │      │
│     │          <OnboardingFlowProvider>                                           │      │
│     │            <Routes>...</Routes>                                             │      │
│     │          </OnboardingFlowProvider>                                          │      │
│     │        </LocationCostProvider>                                              │      │
│     │      </PropertyStateProvider>                                               │      │
│     │    </UserProvider>                                                          │      │
│     │  </QueryClientProvider>                                                     │      │
│     └────────────────────────────────────────────────────────────────────────────┘      │
│                                                                                          │
│  3. PropertyCard.tsx - Add TrueCostBadge                                                 │
│     ┌────────────────────────────────────────────────────────────────────────────┐      │
│     │  <Card>                                                                     │      │
│     │    <CardHeader>                                                             │      │
│     │      <h3>{property.name}</h3>                                               │      │
│     │      <p className="text-2xl">${property.rent}/mo</p>                        │      │
│     │      <TrueCostBadge                          ← NEW                          │      │
│     │        trueCost={locationCost?.trueMonthlyCost}                             │      │
│     │        delta={locationCost?.vsAverageTrue}                                  │      │
│     │      />                                                                     │      │
│     │    </CardHeader>                                                            │      │
│     │  </Card>                                                                    │      │
│     └────────────────────────────────────────────────────────────────────────────┘      │
│                                                                                          │
│  4. Dashboard.tsx - Add Location Cost Setup Card                                         │
│     ┌────────────────────────────────────────────────────────────────────────────┐      │
│     │  {!hasLocationInputs && (                                                   │      │
│     │    <LocationCostSetupPrompt                  ← NEW                          │      │
│     │      onSetup={() => navigate('/location-intelligence')}                     │      │
│     │    />                                                                       │      │
│     │  )}                                                                         │      │
│     └────────────────────────────────────────────────────────────────────────────┘      │
│                                                                                          │
│  5. Header.tsx - Add nav item                                                            │
│     ┌────────────────────────────────────────────────────────────────────────────┐      │
│     │  <NavLink to="/location-intelligence">                                      │      │
│     │    <MapPin className="w-4 h-4" />                                           │      │
│     │    True Cost                                                                │      │
│     │  </NavLink>                                                                 │      │
│     └────────────────────────────────────────────────────────────────────────────┘      │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow for Location Cost

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                         LOCATION COST DATA FLOW                                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│                                                                                          │
│   ┌─────────────────┐                                                                    │
│   │ User enters     │                                                                    │
│   │ lifestyle inputs│                                                                    │
│   └────────┬────────┘                                                                    │
│            │                                                                             │
│            ▼                                                                             │
│   ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐                │
│   │ LocationCost    │      │ Google Maps     │      │ Gas Price       │                │
│   │ Context         │─────►│ Distance Matrix │      │ API (EIA)       │                │
│   │                 │      │ API             │      │                 │                │
│   │ • workAddress   │      └────────┬────────┘      └────────┬────────┘                │
│   │ • commuteFreq   │               │                        │                         │
│   │ • vehicleMpg    │               │                        │                         │
│   │ • groceryFreq   │               ▼                        ▼                         │
│   │ • hasGym        │      ┌─────────────────────────────────────────┐                 │
│   └────────┬────────┘      │         locationCostService.ts          │                 │
│            │               │                                         │                 │
│            │               │  calculateApartmentCosts(                │                 │
│            └──────────────►│    userInputs,                          │                 │
│                            │    apartments[],                         │                 │
│                            │    gasPriceData                          │                 │
│                            │  )                                       │                 │
│                            │                                         │                 │
│                            │  Returns: ApartmentLocationCost[]       │                 │
│                            └─────────────────┬───────────────────────┘                 │
│                                              │                                          │
│                                              ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│   │                              UI COMPONENTS                                       │  │
│   │                                                                                  │  │
│   │   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌─────────────┐  │  │
│   │   │ TrueCostCard  │   │ TrueCostMap   │   │ Comparison    │   │ TrueCost    │  │  │
│   │   │               │   │               │   │ Table         │   │ Badge       │  │  │
│   │   │ Shows per-    │   │ Map with      │   │               │   │             │  │  │
│   │   │ apartment     │   │ cost markers  │   │ Side-by-side  │   │ Small badge │  │  │
│   │   │ breakdown     │   │ & work pin    │   │ all apts      │   │ on cards    │  │  │
│   │   └───────────────┘   └───────────────┘   └───────────────┘   └─────────────┘  │  │
│   │                                                                                  │  │
│   └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Database Schema Addition

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                    NEW DATABASE TABLE: user_location_preferences                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  CREATE TABLE user_location_preferences (                                                │
│    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),                     │
│    user_id               UUID REFERENCES users(id) ON DELETE CASCADE,                    │
│                                                                                          │
│    -- Work commute                                                                       │
│    work_address          TEXT,                                                           │
│    work_lat              DECIMAL(10, 7),                                                 │
│    work_lng              DECIMAL(10, 7),                                                 │
│    commute_frequency     INTEGER DEFAULT 5,        -- days per week                      │
│    commute_mode          TEXT DEFAULT 'driving',   -- driving/transit/bike/walk         │
│    vehicle_mpg           INTEGER DEFAULT 28,                                             │
│                                                                                          │
│    -- Grocery                                                                            │
│    grocery_frequency     INTEGER DEFAULT 2,        -- trips per week                     │
│    preferred_grocery     TEXT DEFAULT 'any',                                             │
│                                                                                          │
│    -- Gym                                                                                │
│    has_gym_membership    BOOLEAN DEFAULT false,                                          │
│    gym_address           TEXT,                                                           │
│    gym_lat               DECIMAL(10, 7),                                                 │
│    gym_lng               DECIMAL(10, 7),                                                 │
│    gym_visits_per_week   INTEGER DEFAULT 3,                                              │
│                                                                                          │
│    -- Transit                                                                            │
│    uses_public_transit   BOOLEAN DEFAULT false,                                          │
│    monthly_transit_pass  DECIMAL(10, 2),                                                 │
│                                                                                          │
│    -- Meta                                                                               │
│    created_at            TIMESTAMP DEFAULT NOW(),                                        │
│    updated_at            TIMESTAMP DEFAULT NOW(),                                        │
│                                                                                          │
│    UNIQUE(user_id)                                                                       │
│  );                                                                                      │
│                                                                                          │
│  -- Index for fast lookups                                                               │
│  CREATE INDEX idx_location_prefs_user ON user_location_preferences(user_id);            │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## API Endpoints to Add

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           NEW API ENDPOINTS                                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  Location Preferences                                                                    │
│  ├── GET  /api/location-preferences        → Get user's saved inputs                    │
│  ├── POST /api/location-preferences        → Save/update inputs                         │
│  └── DELETE /api/location-preferences      → Clear inputs                               │
│                                                                                          │
│  Cost Calculation                                                                        │
│  └── POST /api/calculate-location-costs    → Calculate costs for apartments             │
│      Body: {                                                                             │
│        userInputs: UserLocationInputs,                                                   │
│        apartmentIds: string[]              // or coordinates                             │
│      }                                                                                   │
│      Response: {                                                                         │
│        results: ApartmentLocationCost[],                                                 │
│        comparison: ApartmentComparison                                                   │
│      }                                                                                   │
│                                                                                          │
│  External Data (cached)                                                                  │
│  ├── GET /api/gas-prices?state=FL          → Current gas prices                         │
│  └── GET /api/parking-estimates?zip=32801  → Parking cost estimates                     │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Implementation Priority

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                         BUILD ORDER                                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  PHASE 1: Core Infrastructure (Day 1)                                                    │
│  ├── [x] types/locationCost.types.ts                                                    │
│  ├── [x] services/locationCostService.ts                                                │
│  ├── [x] hooks/useLocationCost.ts                                                       │
│  └── [ ] contexts/LocationCostContext.tsx                                               │
│                                                                                          │
│  PHASE 2: Input Components (Day 2)                                                       │
│  ├── [ ] components/location-cost/LifestyleInputs.tsx                                   │
│  ├── [ ] components/location-cost/WorkCommuteInput.tsx                                  │
│  ├── [ ] components/location-cost/GroceryPreferences.tsx                                │
│  ├── [ ] components/location-cost/GymPreferences.tsx                                    │
│  └── [ ] components/location-cost/TransitPreferences.tsx                                │
│                                                                                          │
│  PHASE 3: Output Components (Day 3)                                                      │
│  ├── [ ] components/location-cost/TrueCostCard.tsx                                      │
│  ├── [ ] components/location-cost/TrueCostBadge.tsx                                     │
│  ├── [ ] components/location-cost/CostComparisonTable.tsx                               │
│  └── [ ] components/location-cost/SavingsInsight.tsx                                    │
│                                                                                          │
│  PHASE 4: Map Integration (Day 4)                                                        │
│  └── [ ] components/location-cost/TrueCostMap.tsx                                       │
│                                                                                          │
│  PHASE 5: Page Assembly (Day 5)                                                          │
│  ├── [ ] pages/LocationIntelligence.tsx                                                 │
│  ├── [ ] Update App.tsx with route + provider                                           │
│  ├── [ ] Update Header.tsx with nav link                                                │
│  └── [ ] Update PropertyCard.tsx with TrueCostBadge                                     │
│                                                                                          │
│  PHASE 6: Backend Integration (Day 6-7)                                                  │
│  ├── [ ] Database migration                                                             │
│  ├── [ ] API endpoints                                                                  │
│  └── [ ] Google Maps API integration                                                    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Design System Compliance

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                    MATCHING YOUR DESIGN SYSTEM                                           │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  Colors (from index.css)                                                                 │
│  ├── Background: --background (dark: 0 0% 1%)                                           │
│  ├── Cards: --card (dark: 0 0% 8%) + glass effect                                       │
│  ├── Primary gradient: #667EEA → #764BA2                                                │
│  ├── Secondary gradient: #4ECDC4 → #44A08D                                              │
│  ├── Success: emerald-400/500                                                           │
│  ├── Warning: amber-400/500                                                             │
│  └── Error: red-400/500                                                                 │
│                                                                                          │
│  Typography                                                                              │
│  ├── Font: Inter (already loaded)                                                       │
│  ├── gradient-text class for headings                                                   │
│  └── muted-foreground for secondary text                                                │
│                                                                                          │
│  Components                                                                              │
│  ├── glass class for glassmorphism cards                                                │
│  ├── card-lift for hover effects                                                        │
│  ├── btn-primary / btn-secondary for buttons                                            │
│  └── Shadcn/UI base components                                                          │
│                                                                                          │
│  Animation                                                                               │
│  ├── animated-bg for gradient backgrounds                                               │
│  ├── ai-pulse for scanning effects                                                      │
│  └── progress-animate for loading bars                                                  │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

**Ready to build? I can now create the actual React components that follow this architecture and match your design system perfectly.**
