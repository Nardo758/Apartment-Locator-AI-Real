# Apartment Feature Capture - Gap Analysis

**Date:** February 14, 2026  
**Current:** 52 properties with basic data  
**Goal:** Capture comprehensive 50+ features for property matching

---

## ✅ **What We Currently Scrape:**

### Properties Table:
- ✅ Property name
- ✅ Address (street, city, state, zip)
- ✅ Contact phone
- ✅ PMS type (Entrata, RealPage, etc.)
- ✅ Website URL

### Lease Rates Table:
- ✅ Unit type (Studio, 1BR, 2BR, etc.)
- ✅ Square footage
- ✅ Monthly rent
- ✅ Lease term
- ✅ Availability date

### Concessions Table:
- ✅ Concession type
- ✅ Description
- ✅ Value

### Amenities Table:
- ✅ Amenity names (basic list)

---

## ❌ **What's MISSING (37 Categories!):**

### Basic Requirements:
- ❌ **Bedrooms count** (parsed from unit_type but not stored separately)
- ❌ **Bathrooms count** (parsed from unit_type but not stored separately)
- ❌ **Furnished/Unfurnished status**

### Building Amenities (Detailed):
- ❌ **Pool type** (indoor/outdoor/both)
- ❌ **Elevator** (yes/no)
- ❌ **Package room/lockers**
- ❌ **Laundry type** (in-unit/in-building/shared)
- ❌ **Business center/co-working**
- ❌ **Rooftop deck/terrace**
- ❌ **Courtyard/garden**
- ❌ **Bike storage**
- ❌ **Storage units available**
- ❌ **Controlled access/doorman**
- ❌ **Concierge service**

### In-Unit Features (15 Missing):
- ❌ **Air conditioning type** (central/window/none)
- ❌ **Heating type** (central/radiator/heat pump)
- ❌ **Dishwasher**
- ❌ **Garbage disposal**
- ❌ **Washer/dryer** (in-unit/hookups/none)
- ❌ **Balcony/patio**
- ❌ **Walk-in closets**
- ❌ **Hardwood floors**
- ❌ **Fireplace**
- ❌ **High ceilings**
- ❌ **Updated kitchen**
- ❌ **Stainless steel appliances**
- ❌ **Granite/quartz countertops**

### Utilities & Services:
- ❌ **Heat included** (yes/no)
- ❌ **Water included**
- ❌ **Electric included**
- ❌ **Gas included**
- ❌ **Trash included**
- ❌ **High-speed internet available**
- ❌ **Cable ready**

### Pet Policy (Detailed):
- ❌ **Dogs allowed** (yes/no/conditional)
- ❌ **Cats allowed**
- ❌ **Pet size restrictions** (small/medium/large/weight limit)
- ❌ **Pet deposit amount**
- ❌ **Pet rent amount** (monthly)

### Parking (Detailed):
- ❌ **Parking included** (yes/no)
- ❌ **Parking type** (garage/covered/street)
- ❌ **EV charging available**
- ❌ **Parking fee** (if not included)

### Accessibility:
- ❌ **Wheelchair accessible**
- ❌ **First floor available**
- ❌ **Elevator access** (for accessibility)

### Safety & Security:
- ❌ **Security system**
- ❌ **Video surveillance**
- ❌ **Gated community**
- ❌ **On-site security**

### Lease Terms:
- ❌ **Short-term lease available**
- ❌ **Month-to-month option**
- ❌ **Flexible lease lengths**

### Location Preferences:
- ❌ **Near public transportation** (distance)
- ❌ **Walkability score**
- ❌ **Near grocery stores**
- ❌ **Near parks**
- ❌ **Quiet neighborhood** (subjective)

---

## 🎯 **Solution: Enhanced Schema + Scraper**

### **Phase 1: Database Schema Updates (30 min)**

Add new tables and columns:

```sql
-- Add columns to lease_rates
ALTER TABLE lease_rates ADD COLUMN bedrooms INTEGER;
ALTER TABLE lease_rates ADD COLUMN bathrooms DECIMAL(2,1);
ALTER TABLE lease_rates ADD COLUMN furnished BOOLEAN DEFAULT FALSE;

-- New table: property_features
CREATE TABLE property_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Building Amenities
  pool_type VARCHAR(20), -- 'none', 'indoor', 'outdoor', 'both'
  has_elevator BOOLEAN DEFAULT FALSE,
  has_package_room BOOLEAN DEFAULT FALSE,
  laundry_type VARCHAR(20), -- 'in-unit', 'in-building', 'shared', 'none'
  has_business_center BOOLEAN DEFAULT FALSE,
  has_rooftop_deck BOOLEAN DEFAULT FALSE,
  has_courtyard BOOLEAN DEFAULT FALSE,
  has_bike_storage BOOLEAN DEFAULT FALSE,
  has_storage_units BOOLEAN DEFAULT FALSE,
  has_controlled_access BOOLEAN DEFAULT FALSE,
  has_doorman BOOLEAN DEFAULT FALSE,
  has_concierge BOOLEAN DEFAULT FALSE,
  
  -- Utilities Included
  heat_included BOOLEAN DEFAULT FALSE,
  water_included BOOLEAN DEFAULT FALSE,
  electric_included BOOLEAN DEFAULT FALSE,
  gas_included BOOLEAN DEFAULT FALSE,
  trash_included BOOLEAN DEFAULT FALSE,
  internet_included BOOLEAN DEFAULT FALSE,
  cable_included BOOLEAN DEFAULT FALSE,
  
  -- Pet Policy
  dogs_allowed BOOLEAN DEFAULT FALSE,
  cats_allowed BOOLEAN DEFAULT FALSE,
  pet_size_limit VARCHAR(20), -- 'none', 'small', 'medium', 'large', 'weight_limit'
  pet_weight_limit INTEGER, -- in lbs
  pet_deposit INTEGER, -- in dollars
  pet_rent INTEGER, -- monthly in dollars
  
  -- Parking
  parking_included BOOLEAN DEFAULT FALSE,
  parking_type VARCHAR(20), -- 'garage', 'covered', 'street', 'mixed'
  has_ev_charging BOOLEAN DEFAULT FALSE,
  parking_fee INTEGER, -- monthly in dollars if not included
  
  -- Accessibility
  wheelchair_accessible BOOLEAN DEFAULT FALSE,
  first_floor_available BOOLEAN DEFAULT FALSE,
  
  -- Safety & Security
  has_security_system BOOLEAN DEFAULT FALSE,
  has_video_surveillance BOOLEAN DEFAULT FALSE,
  is_gated_community BOOLEAN DEFAULT FALSE,
  has_onsite_security BOOLEAN DEFAULT FALSE,
  
  -- Lease Terms
  short_term_available BOOLEAN DEFAULT FALSE,
  month_to_month_available BOOLEAN DEFAULT FALSE,
  
  -- Location Info
  walkability_score INTEGER, -- 0-100
  near_public_transit BOOLEAN,
  transit_distance_miles DECIMAL(4,2),
  
  -- Timestamps
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_property_features UNIQUE(property_id)
);

-- New table: unit_features (per lease rate)
CREATE TABLE unit_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lease_rate_id UUID NOT NULL REFERENCES lease_rates(id) ON DELETE CASCADE,
  
  -- In-Unit Features
  ac_type VARCHAR(20), -- 'central', 'window', 'none'
  heating_type VARCHAR(20), -- 'central', 'radiator', 'heat_pump'
  has_dishwasher BOOLEAN DEFAULT FALSE,
  has_garbage_disposal BOOLEAN DEFAULT FALSE,
  washer_dryer VARCHAR(20), -- 'in-unit', 'hookups', 'none'
  has_balcony BOOLEAN DEFAULT FALSE,
  has_patio BOOLEAN DEFAULT FALSE,
  has_walk_in_closets BOOLEAN DEFAULT FALSE,
  has_hardwood_floors BOOLEAN DEFAULT FALSE,
  has_fireplace BOOLEAN DEFAULT FALSE,
  has_high_ceilings BOOLEAN DEFAULT FALSE,
  has_updated_kitchen BOOLEAN DEFAULT FALSE,
  has_stainless_appliances BOOLEAN DEFAULT FALSE,
  countertop_type VARCHAR(20), -- 'granite', 'quartz', 'laminate', 'other'
  
  -- Timestamps
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_unit_features UNIQUE(lease_rate_id)
);

-- Indexes for common queries
CREATE INDEX idx_property_features_property ON property_features(property_id);
CREATE INDEX idx_property_features_dogs ON property_features(dogs_allowed);
CREATE INDEX idx_property_features_cats ON property_features(cats_allowed);
CREATE INDEX idx_property_features_parking ON property_features(parking_included);
CREATE INDEX idx_property_features_laundry ON property_features(laundry_type);
CREATE INDEX idx_unit_features_lease_rate ON unit_features(lease_rate_id);
CREATE INDEX idx_unit_features_washer_dryer ON unit_features(washer_dryer);
```

---

### **Phase 2: Scraper Updates (2-3 hours)**

#### Update `src/types.ts`:

```typescript
export interface PropertyFeatures {
  // Building Amenities
  poolType?: 'none' | 'indoor' | 'outdoor' | 'both';
  hasElevator?: boolean;
  hasPackageRoom?: boolean;
  laundryType?: 'in-unit' | 'in-building' | 'shared' | 'none';
  hasBusinessCenter?: boolean;
  hasRooftopDeck?: boolean;
  hasCourtyard?: boolean;
  hasBikeStorage?: boolean;
  hasStorageUnits?: boolean;
  hasControlledAccess?: boolean;
  hasDoorman?: boolean;
  hasConcierge?: boolean;
  
  // Utilities
  heatIncluded?: boolean;
  waterIncluded?: boolean;
  electricIncluded?: boolean;
  gasIncluded?: boolean;
  trashIncluded?: boolean;
  internetIncluded?: boolean;
  cableIncluded?: boolean;
  
  // Pet Policy
  dogsAllowed?: boolean;
  catsAllowed?: boolean;
  petSizeLimit?: string;
  petWeightLimit?: number;
  petDeposit?: number;
  petRent?: number;
  
  // Parking
  parkingIncluded?: boolean;
  parkingType?: string;
  hasEvCharging?: boolean;
  parkingFee?: number;
  
  // Accessibility
  wheelchairAccessible?: boolean;
  firstFloorAvailable?: boolean;
  
  // Safety
  hasSecuritySystem?: boolean;
  hasVideoSurveillance?: boolean;
  isGatedCommunity?: boolean;
  hasOnsiteSecurity?: boolean;
  
  // Lease Terms
  shortTermAvailable?: boolean;
  monthToMonthAvailable?: boolean;
}

export interface UnitFeatures {
  acType?: 'central' | 'window' | 'none';
  heatingType?: 'central' | 'radiator' | 'heat_pump';
  hasDishwasher?: boolean;
  hasGarbageDisposal?: boolean;
  washerDryer?: 'in-unit' | 'hookups' | 'none';
  hasBalcony?: boolean;
  hasPatio?: boolean;
  hasWalkInClosets?: boolean;
  hasHardwoodFloors?: boolean;
  hasFireplace?: boolean;
  hasHighCeilings?: boolean;
  hasUpdatedKitchen?: boolean;
  hasStainlessAppliances?: boolean;
  countertopType?: string;
}
```

#### Add Feature Detection Logic:

```typescript
// In scraper.ts - Add feature extraction
async function extractPropertyFeatures(page: Page): Promise<PropertyFeatures> {
  return await page.evaluate(() => {
    const features: PropertyFeatures = {};
    const text = document.body.innerText.toLowerCase();
    
    // Pool detection
    if (text.includes('indoor pool') && text.includes('outdoor pool')) {
      features.poolType = 'both';
    } else if (text.includes('indoor pool')) {
      features.poolType = 'indoor';
    } else if (text.includes('outdoor pool') || text.includes('swimming pool')) {
      features.poolType = 'outdoor';
    }
    
    // Elevator
    features.hasElevator = text.includes('elevator');
    
    // Package room
    features.hasPackageRoom = text.includes('package') && (text.includes('room') || text.includes('locker'));
    
    // Laundry
    if (text.includes('washer') && text.includes('in unit')) {
      features.laundryType = 'in-unit';
    } else if (text.includes('laundry') && text.includes('building')) {
      features.laundryType = 'in-building';
    } else if (text.includes('shared laundry')) {
      features.laundryType = 'shared';
    }
    
    // Business center
    features.hasBusinessCenter = text.includes('business center') || text.includes('coworking');
    
    // Rooftop
    features.hasRooftopDeck = text.includes('rooftop');
    
    // Courtyard
    features.hasCourtyard = text.includes('courtyard') || text.includes('garden');
    
    // Bike storage
    features.hasBikeStorage = text.includes('bike storage') || text.includes('bike room');
    
    // Storage units
    features.hasStorageUnits = text.includes('storage units') || text.includes('extra storage');
    
    // Access control
    features.hasControlledAccess = text.includes('controlled access') || text.includes('gated');
    features.hasDoorman = text.includes('doorman');
    features.hasConcierge = text.includes('concierge');
    
    // Utilities included
    features.heatIncluded = text.includes('heat included') || text.includes('heating included');
    features.waterIncluded = text.includes('water included');
    features.electricIncluded = text.includes('electric included') || text.includes('electricity included');
    features.gasIncluded = text.includes('gas included');
    features.trashIncluded = text.includes('trash included');
    features.internetIncluded = text.includes('internet included') || text.includes('wifi included');
    features.cableIncluded = text.includes('cable included');
    
    // Pets
    features.dogsAllowed = text.includes('dogs allowed') || text.includes('dog friendly');
    features.catsAllowed = text.includes('cats allowed') || text.includes('cat friendly');
    
    // Parking
    features.parkingIncluded = text.includes('parking included');
    if (text.includes('garage parking')) {
      features.parkingType = 'garage';
    } else if (text.includes('covered parking')) {
      features.parkingType = 'covered';
    } else if (text.includes('street parking')) {
      features.parkingType = 'street';
    }
    features.hasEvCharging = text.includes('ev charging') || text.includes('electric vehicle');
    
    // Accessibility
    features.wheelchairAccessible = text.includes('wheelchair') || text.includes('ada compliant');
    features.firstFloorAvailable = text.includes('first floor');
    
    // Security
    features.hasSecuritySystem = text.includes('security system');
    features.hasVideoSurveillance = text.includes('surveillance') || text.includes('security camera');
    features.isGatedCommunity = text.includes('gated');
    features.hasOnsiteSecurity = text.includes('onsite security') || text.includes('24-hour security');
    
    // Lease terms
    features.shortTermAvailable = text.includes('short term') || text.includes('short-term');
    features.monthToMonthAvailable = text.includes('month to month') || text.includes('month-to-month');
    
    return features;
  });
}
```

---

## 📋 **Implementation Plan:**

### **Week 1: Database Migration (Days 1-2)**
- [ ] Run enhanced schema migration on Supabase
- [ ] Test new tables with sample data
- [ ] Update API endpoints to return new fields

### **Week 2: Scraper Enhancement (Days 3-5)**
- [ ] Add feature detection logic to scraper
- [ ] Test on 10 properties manually
- [ ] Deploy updated worker to Cloudflare

### **Week 3: Re-scrape + Validation (Days 6-7)**
- [ ] Re-scrape all 52 existing properties
- [ ] Validate feature detection accuracy
- [ ] Fix any missed patterns

### **Week 4: Frontend Integration (Days 8-10)**
- [ ] Update property cards to show new features
- [ ] Add detailed filters for all 50+ features
- [ ] Build preference matching algorithm

---

## 💰 **Cost Impact:**

**Scraping time per property:**
- Current: ~20 seconds
- With enhanced features: ~25-30 seconds (+5-10 seconds)

**Storage per property:**
- Current: ~10 KB
- With enhanced features: ~15 KB (+5 KB)

**Impact on 52 properties:**
- Extra scraping time: 260-520 seconds (4-9 minutes total)
- Extra storage: 260 KB
- **Still FREE on both Cloudflare and Supabase!** ✅

---

## 🎯 **Priority Features to Capture First:**

### **High Priority (Week 1):**
1. Bedrooms/bathrooms (parsed from unit_type)
2. Laundry type (in-unit/building/shared)
3. Pet policy (dogs/cats allowed)
4. Parking (included/type)
5. Utilities included (heat/water/electric)

### **Medium Priority (Week 2):**
6. Pool type
7. Elevator
8. Dishwasher
9. Washer/dryer details
10. Balcony/patio

### **Lower Priority (Week 3):**
11. Countertop type
12. Fireplace
13. High ceilings
14. Security features
15. Walkability score

---

## ✅ **Success Metrics:**

- [ ] 90%+ feature detection accuracy
- [ ] All 52 properties have comprehensive data
- [ ] User can filter by any of the 50+ features
- [ ] Preference matching scores properties correctly
- [ ] Scraping time stays under 30 seconds per property

---

**Ready to implement! Start with Phase 1 schema migration?** 🚀
