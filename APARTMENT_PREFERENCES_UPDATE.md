# Apartment Preferences Enhancement

## Overview
Adding comprehensive apartment feature preferences to RenterDataEngine for detailed property matching.

## Changes Made

### 1. Enhanced RenterPreferences Interface

Added 8 major categories with 50+ preference fields:

#### Basic Requirements
- bedrooms: Studio, 1BR, 2BR, 3BR, 4BR+
- bathrooms: 1, 1.5, 2, 2.5, 3+
- squareFootageMin/Max
- furnished: boolean

#### Building Amenities
- fitnessCenter, pool (indoor/outdoor), elevator
- packageRoom, laundry (in-unit/building/shared)
- businessCenter, rooftopDeck, courtyard
- bikeStorage, storageUnits, controlledAccess
- conciergeService

#### In-Unit Features
- airConditioning, heating (types)
- dishwasher, garbageDisposal
- washerDryer (in-unit/hookups)
- balcony, walkInClosets
- hardwoodFloors, fireplace, highCeilings
- updatedKitchen, stainlessSteelAppliances
- graniteCountertops

#### Utilities & Services
- utilitiesIncluded (heat/water/electric/gas/trash)
- highSpeedInternet, cableReady

#### Pet Policy
- dogsAllowed, catsAllowed
- petSizeRestrictions, petDeposit

#### Parking
- parkingIncluded, garageParking
- coveredParking, streetParking
- evCharging

#### Accessibility
- wheelchairAccessible, firstFloorAvailable
- elevatorAccess

#### Safety & Security
- securitySystem, videoSurveillance
- gatedCommunity, onsiteSecurity

#### Lease Terms
- shortTermLease, monthToMonth
- flexibleLeaseLength

#### Location Preferences
- nearPublicTransit, walkabilityScore
- nearGrocery, nearParks
- quietNeighborhood

## Usage Example

```typescript
const renterEngine = new RenterDataEngine(userId);

// Update preferences
await renterEngine.updatePreferences({
  bedrooms: '2',
  bathrooms: '2',
  squareFootageMin: 900,
  squareFootageMax: 1200,
  amenities: {
    buildingAmenities: {
      fitnessCenter: true,
      pool: 'outdoor',
      laundry: 'in-unit',
    },
    inUnitFeatures: {
      airConditioning: 'central',
      washerDryer: 'in-unit',
      balcony: true,
      hardwoodFloors: true,
    },
    petPolicy: {
      dogsAllowed: true,
      catsAllowed: true,
    },
    parking: {
      parkingIncluded: true,
      evCharging: false,
    },
  },
  dealBreakers: [
    'no_pets',
    'no_parking',
    'ground_floor_only',
  ],
});
```

## Data Storage

All stored in `user_data_engines` table under `data` JSONB column:

```json
{
  "preferences": {
    "bedrooms": "2",
    "bathrooms": "2",
    "squareFootageMin": 900,
    "squareFootageMax": 1200,
    "furnished": false,
    "amenities": {
      "buildingAmenities": {
        "fitnessCenter": true,
        "pool": "outdoor",
        ...
      },
      "inUnitFeatures": {...},
      "petPolicy": {...},
      "parking": {...},
      "utilities": {...},
      "accessibility": {...},
      "safety": {...},
      "leaseTerms": {...},
      "location": {...}
    },
    "dealBreakers": ["no_pets", "no_parking"]
  }
}
```

## Integration Points

### 1. Onboarding Flow
- Multi-step preference collection
- Smart defaults based on user type
- Progressive disclosure (basic → advanced)

### 2. Property Matching
```typescript
// Match properties to user preferences
const renterData = await renterEngine.load();
const matches = await propertyService.findMatches({
  preferences: renterData.preferences,
  budget: renterData.budget,
  location: renterData.location,
});
```

### 3. Search Filters
- Convert preferences to search filters
- Enable/disable filters dynamically
- Save common filter combinations

### 4. Recommendations
- Score properties based on preference matching
- Highlight matched features
- Show "why we picked this" reasoning

## Files Modified

1. `src/services/renterDataEngine.ts` - Enhanced RenterPreferences interface
2. `src/types/preferences.ts` (NEW) - Complete type definitions
3. `src/components/onboarding/PreferencesStep.tsx` (UPDATE) - Multi-category form
4. `src/services/propertyMatching.ts` (NEW) - Matching algorithm

## Next Steps

1. Build onboarding preference collection UI
2. Implement property matching algorithm
3. Add preference-based search filters
4. Create "Edit Preferences" page in dashboard
5. Build recommendation scoring system
