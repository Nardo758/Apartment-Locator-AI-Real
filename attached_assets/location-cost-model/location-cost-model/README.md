# Location Cost Model - ApartmentIQ Integration

## Overview

This module adds **True Monthly Cost** calculations to ApartmentIQ, transforming simple apartment search into location-aware financial intelligence.

```
RENT ALONE:        $1,450/month  ← What Zillow shows
                        +
LOCATION COSTS:    +$285/month   ← Commute, parking, groceries, gym
                        =
TRUE COST:         $1,735/month  ← What you ACTUALLY pay
```

## Installation

Copy these folders into your existing `src/` directory:

```
src/
├── components/
│   └── location-cost/          ← NEW: Copy this folder
├── hooks/
│   └── useLocationCost.ts      ← NEW: Copy this file
├── services/
│   └── locationCostService.ts  ← NEW: Copy this file
├── types/
│   └── locationCost.types.ts   ← NEW: Copy this file
└── pages/
    └── LocationIntelligence.tsx ← NEW: Copy this file (or update existing)
```

## Add Route to App.tsx

```tsx
// In App.tsx, add import:
import LocationIntelligence from "./pages/LocationIntelligence";

// Add route (inside <Routes>):
<Route path="/location-intelligence" element={<LocationIntelligence />} />
```

## Environment Variables

Add to your `.env`:

```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Google Maps APIs Required

Enable these in Google Cloud Console:
- Distance Matrix API
- Places API
- Geocoding API
- Maps JavaScript API

## Usage

### Basic Integration (Dashboard Widget)

```tsx
import { LocationCostCalculator } from '@/components/location-cost';

// In your Dashboard.tsx
<LocationCostCalculator
  apartments={searchResults}
  onResultsChange={(results) => setApartmentsWithCosts(results)}
/>
```

### Full Page Integration

The `LocationIntelligence.tsx` page provides the complete experience with:
- User input form (work address, commute frequency, etc.)
- Interactive map with cost overlays
- Apartment comparison table sorted by true cost
- Savings insights and recommendations
