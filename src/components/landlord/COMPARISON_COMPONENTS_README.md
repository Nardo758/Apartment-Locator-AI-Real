# Comparison & Analytics Components

## Overview

Four comprehensive comparison and analytics components for the Landlord Dashboard that connect to the comparison API endpoints.

## Components

### 1. ComparisonView.tsx
Main tabbed interface component with five tabs:
- **Overview**: Summary cards, competitive advantages, market range
- **Pricing**: Detailed pricing comparison table
- **Amenities**: Amenity comparison matrix
- **Concessions**: Special offers comparison (placeholder for future)
- **Vs Market**: Gap analysis and competitive health score

**Props:**
```typescript
interface ComparisonViewProps {
  propertyId: string;           // Your property ID
  competitorIds: string[];      // Array of competitor property IDs
  onError?: (error: string) => void;  // Optional error handler
}
```

**Usage:**
```tsx
import ComparisonView from '@/components/landlord/ComparisonView';

<ComparisonView
  propertyId="your-property-id"
  competitorIds={["competitor-1", "competitor-2", "competitor-3"]}
  onError={(error) => console.error(error)}
/>
```

### 2. PricingComparisonTable.tsx
Detailed pricing table with:
- Color-coded variance indicators (green = below market, yellow = at market, red = above market)
- Rent per square foot calculations
- Market benchmark rows (average & median)
- Visual price distribution chart
- Your property highlighted

**Props:**
```typescript
interface PricingComparisonTableProps {
  property: Property;
  competitors: Property[];
  marketBenchmark: MarketBenchmark | null;
}
```

**Usage:**
```tsx
import PricingComparisonTable from '@/components/landlord/PricingComparisonTable';

<PricingComparisonTable
  property={propertyData}
  competitors={competitorData}
  marketBenchmark={benchmarkData}
/>
```

### 3. AmenitiesMatrix.tsx
Comprehensive amenity comparison grid with:
- ✓/✗ indicators for each property
- Prevalence badges (Essential, Common, Some, Rare)
- "Opportunity" highlighting for missing common amenities
- "Advantage" highlighting for rare amenities you have
- Summary statistics (coverage rate, missed opportunities, unique features)
- Sortable by name or prevalence

**Props:**
```typescript
interface AmenitiesMatrixProps {
  property: Property;
  competitors: Property[];
  amenityPrevalence: Array<{
    amenity: string;
    prevalence: number;
    yourPropertyHas: boolean;
  }>;
}
```

**Usage:**
```tsx
import AmenitiesMatrix from '@/components/landlord/AmenitiesMatrix';

<AmenitiesMatrix
  property={propertyData}
  competitors={competitorData}
  amenityPrevalence={analysisData.amenityPrevalence}
/>
```

### 4. GapAnalysis.tsx
What you're missing vs market with:
- **Competitive Health Score** (0-100)
- Gap categorization (Critical, High, Medium, Low priority)
- Detailed gap cards with:
  - Impact assessment
  - Actionable recommendations
  - Estimated cost (when applicable)
- Filterable by priority level
- Export report functionality

**Props:**
```typescript
interface GapAnalysisProps {
  property: Property;
  competitors: Property[];
  analysis: Analysis;
  marketBenchmark: MarketBenchmark | null;
}
```

**Usage:**
```tsx
import GapAnalysis from '@/components/landlord/GapAnalysis';

<GapAnalysis
  property={propertyData}
  competitors={competitorData}
  analysis={analysisData}
  marketBenchmark={benchmarkData}
/>
```

## API Integration

### POST /api/comparison
Generates comprehensive comparison report.

**Request:**
```json
{
  "propertyId": "uuid",
  "competitorIds": ["uuid1", "uuid2"],
  "includeMarketBenchmark": true
}
```

**Response:**
```json
{
  "property": { /* Property details */ },
  "competitors": [ /* Array of competitor properties */ ],
  "marketBenchmark": {
    "medianRent": 2500,
    "avgRent": 2600,
    "minRent": 1800,
    "maxRent": 3500,
    "sampleSize": 45,
    "yourPercentile": 62
  },
  "analysis": {
    "pricingPosition": "at_market",
    "variance": 50,
    "variancePercent": 2.1,
    "competitiveAdvantages": ["rooftopDeck", "coworkingSpace"],
    "gaps": ["Pool (75% of competitors have it)"],
    "recommendation": "Your rent is well-positioned...",
    "amenityPrevalence": [ /* Amenity statistics */ ]
  },
  "generatedAt": "2024-02-04T18:00:00Z"
}
```

### GET /api/comparison/market-benchmark
Get market benchmark data for a location.

**Query Parameters:**
- `city` (required)
- `state` (required)
- `bedrooms` (optional)
- `minSqFt` (optional)
- `maxSqFt` (optional)

**Response:**
```json
{
  "location": { "city": "Austin", "state": "TX" },
  "sampleSize": 156,
  "pricing": {
    "median": 2400,
    "average": 2550,
    "min": 1600,
    "max": 4200,
    "q1": 2100,
    "q3": 2900,
    "pricePerSqFt": 2.35
  },
  "topAmenities": [
    { "amenity": "parking", "prevalence": 95 },
    { "amenity": "pool", "prevalence": 78 }
  ]
}
```

## Color Coding

### Pricing Indicators
- 🔴 **Red/Above Market**: +5% or more above average
- 🟡 **Yellow/At Market**: Within ±5% of average
- 🟢 **Green/Below Market**: -5% or more below average

### Gap Priority
- 🔴 **Critical**: Immediate action required (score -25 each)
- 🟠 **High**: Important issues (score -15 each)
- 🟡 **Medium**: Moderate issues (score -8 each)
- 🔵 **Low**: Minor opportunities (score -3 each)

## Features

✅ **Real-time comparison** - Fetches latest market data  
✅ **Color-coded insights** - Visual indicators for quick scanning  
✅ **Responsive design** - Works on desktop and mobile  
✅ **Tabbed interface** - Organized by category  
✅ **Export functionality** - Download gap analysis reports  
✅ **Competitive scoring** - 0-100 health score algorithm  
✅ **Actionable recommendations** - Specific next steps  
✅ **Loading states** - Smooth UX during data fetch  
✅ **Error handling** - User-friendly error messages  

## Example Integration in Dashboard

```tsx
import { useState, useEffect } from 'react';
import ComparisonView from '@/components/landlord/ComparisonView';
import { Button } from '@/components/ui/button';

export default function LandlordDashboard() {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [competitorIds, setCompetitorIds] = useState<string[]>([]);

  // Load property and competitors
  useEffect(() => {
    // Fetch your property and competition set
    fetchPropertyAndCompetitors();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Market Analysis</h1>
      
      {selectedProperty && competitorIds.length > 0 ? (
        <ComparisonView
          propertyId={selectedProperty}
          competitorIds={competitorIds}
          onError={(error) => {
            console.error('Comparison error:', error);
            // Show toast notification
          }}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Select a property and add competitors to see analysis
          </p>
          <Button>Get Started</Button>
        </div>
      )}
    </div>
  );
}
```

## Dependencies

All components use shadcn/ui components:
- `@/components/ui/card`
- `@/components/ui/table`
- `@/components/ui/tabs`
- `@/components/ui/badge`
- `@/components/ui/button`
- `@/components/ui/progress`
- `@/components/ui/alert`

All dependencies are already installed and configured.

## Type Safety

All components are fully typed with TypeScript interfaces. The API response types match the backend endpoints.

## Next Steps

1. **Competition Sets Integration**: Connect to competition sets API to auto-populate competitor IDs
2. **Concessions Tracking**: Implement move-in specials and promotional offer tracking
3. **Historical Trends**: Add time-series analysis to show pricing trends over time
4. **Automated Alerts**: Set up notifications when gaps are identified
5. **Action Items**: Add task management for addressing identified gaps

---

Built for **Apartment Locator AI** Landlord Dashboard  
Last Updated: 2024-02-04
