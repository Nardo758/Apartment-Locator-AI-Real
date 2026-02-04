# Landlord Portfolio Management Components

## Overview

Three new components for the Landlord Dashboard, providing comprehensive portfolio management capabilities with market intelligence, competitor tracking, and AI-powered pricing recommendations.

## Components

### 1. PortfolioSummaryWidget

**Location:** `src/components/landlord/PortfolioSummaryWidget.tsx`

**Purpose:** High-level overview of the entire property portfolio with key metrics and alerts.

**Features:**
- Total properties count
- Occupied vs vacant units breakdown
- Real-time occupancy rate with color-coded status
- Revenue tracking with month-over-month changes
- Revenue efficiency (actual vs potential)
- Average rent per unit
- At-risk property alerts

**API Endpoint:** `GET /api/landlord/portfolio/summary`

**Response Shape:**
```typescript
{
  totalProperties: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  totalRevenue: number;
  potentialRevenue: number;
  atRiskCount: number;
  averageRent: number;
  revenueChange: number; // percentage
}
```

**Usage:**
```tsx
import { PortfolioSummaryWidget } from '@/components/landlord';

<PortfolioSummaryWidget 
  userId="optional-user-id"
  className="mb-6"
/>
```

**Styling:**
- Matches UnifiedDashboard dark theme
- Gradient backgrounds (blue/purple)
- Color-coded occupancy indicators:
  - Green (≥95%): Excellent
  - Yellow (≥85%): Good
  - Red (<85%): Needs attention
- Revenue trend indicators with TrendingUp/Down icons
- Alert badges for at-risk properties

---

### 2. PropertyFilters

**Location:** `src/components/landlord/PropertyFilters.tsx`

**Purpose:** Comprehensive filtering system for property portfolio with real-time updates.

**Features:**
- City filter (auto-populated from user's properties)
- Status filter (occupied/vacant/all)
- Vacancy risk filter (low/medium/high)
- Competition set filter (from user's defined sets)
- Active filter badges with one-click removal
- Clear all filters button
- Result count display

**API Endpoints:**
- `GET /api/landlord/properties/cities` - Get available cities
- `GET /api/landlord/competition-sets` - Get competition sets

**Filter Interface:**
```typescript
interface PropertyFilterOptions {
  city?: string;
  status?: 'all' | 'occupied' | 'vacant';
  vacancyRisk?: 'all' | 'low' | 'medium' | 'high';
  competitionSet?: string;
}
```

**Usage:**
```tsx
import { PropertyFilters } from '@/components/landlord';

const [filters, setFilters] = useState<PropertyFilterOptions>({
  status: 'all',
  vacancyRisk: 'all',
});

<PropertyFilters
  filters={filters}
  onFiltersChange={setFilters}
  availableCities={cities}
  availableCompetitionSets={competitionSets}
  resultCount={properties.length}
  className="w-80"
/>
```

**Styling:**
- Sidebar-friendly compact design
- Icon-labeled sections
- Color-coded risk indicators
- Dismissible badge chips
- Responsive dropdown selects

---

### 3. PropertyCard (Enhanced)

**Location:** `src/components/landlord/PropertyCard.tsx` (replaces existing)

**Purpose:** Rich property card with pricing intelligence, competitor analysis, and AI recommendations.

**Features:**
- Property details (address, beds/baths, sq ft, year built)
- Current rent vs market average comparison
- Vacancy risk indicator with status badge
- AI pricing recommendations with confidence scores
- Competitor comparison (up to 3 inline, link to view all)
- Active concessions alerts from nearby properties
- Tenant information (for occupied units)
- Lease end date tracking
- Quick actions (Edit, View Details)

**Enhanced Data:**
```typescript
interface PropertyData {
  // Basic info
  id: string;
  address: string;
  city: string;
  state: string;
  currentRent: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  marketAvgRent: number;
  
  // Status
  status: 'occupied' | 'vacant';
  vacancyRisk: 'low' | 'medium' | 'high';
  daysVacant?: number;
  
  // Tenant (if occupied)
  tenant?: string;
  leaseEndDate?: string;
  
  // AI Recommendations
  pricingRecommendation?: {
    type: 'increase' | 'decrease' | 'hold';
    amount?: number;
    confidence: number;
    reasoning: string;
    expectedImpact?: string;
  };
  
  // Competitor Intelligence
  competitorComparison?: Array<{
    propertyName: string;
    distance: number;
    rent: number;
    bedrooms: number;
    bathrooms: number;
    concessions: string[];
    occupancyRate?: number;
  }>;
  
  competitorConcessions: Array<{
    property: string;
    type: string;
    value: string;
  }>;
  
  competitionSetName?: string;
  recommendation?: string;
  lastUpdated: string;
}
```

**Usage:**
```tsx
import { PropertyCard } from '@/components/landlord';

<PropertyCard
  property={propertyData}
  onEdit={(id) => navigate(`/properties/${id}/edit`)}
  onViewDetails={(id) => navigate(`/properties/${id}`)}
  className="col-span-1"
/>
```

**Styling:**
- Risk-based colored top stripe
- Gradient recommendation cards
- Color-coded pricing comparison:
  - Green: Below market (opportunity)
  - Red: Above market (risk)
- Purple-themed competitor sections
- Orange-themed concession alerts
- Glass-morphism effects
- Hover elevation

---

## API Integration

### Portfolio Summary Endpoint

```typescript
GET /api/landlord/portfolio/summary
Authorization: Bearer {token}

Response: {
  totalProperties: 12,
  occupiedUnits: 45,
  vacantUnits: 3,
  occupancyRate: 93.75,
  totalRevenue: 67500,
  potentialRevenue: 72000,
  atRiskCount: 2,
  averageRent: 1500,
  revenueChange: 2.3
}
```

### Properties List Endpoint

```typescript
GET /api/landlord/properties?city={city}&status={status}&vacancyRisk={risk}&competitionSetId={id}
Authorization: Bearer {token}

Response: {
  properties: Property[],
  total: number
}
```

### Cities Endpoint

```typescript
GET /api/landlord/properties/cities
Authorization: Bearer {token}

Response: {
  cities: string[]
}
```

### Competition Sets Endpoint

```typescript
GET /api/landlord/competition-sets
Authorization: Bearer {token}

Response: {
  competitionSets: Array<{
    id: string;
    name: string;
  }>
}
```

---

## Complete Integration Example

See `src/pages/LandlordDashboard.tsx` for a full working example that combines all three components.

**Key Features:**
1. Auto-refresh on filter changes
2. Loading states for all API calls
3. Empty state handling
4. Error boundaries
5. Responsive grid layout (1 col mobile, 2 col desktop)
6. Header actions (Add Property, Export, Settings)

---

## Styling Guide

### Theme Consistency

All components follow the UnifiedDashboard dark theme:

```typescript
// Color Palette
background: 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900'
cards: 'bg-white/5 border-white/10'
elevated: 'bg-white/8 border-white/15'
text-primary: 'text-white'
text-secondary: 'text-white/60'
text-muted: 'text-white/40'

// Status Colors
green: 'Low risk, good performance'
yellow: 'Medium risk, watch closely'
red: 'High risk, action needed'
blue: 'Informational'
purple: 'Competition/AI insights'
orange: 'Alerts/warnings'
```

### Component Variants

```typescript
// Card variants (from ui/card.tsx)
'default' | 'elevated' | 'highlighted' | 'glass'

// Badge variants
'default' | 'secondary' | 'destructive' | 'outline' | 'warning'

// Button variants
'default' | 'ghost' | 'outline'
```

### Icons (lucide-react)

Consistent icon usage across components:
- `Building2`: Properties
- `Home`: Units/housing
- `DollarSign`: Revenue/pricing
- `Percent`: Rates/percentages
- `AlertTriangle`: Warnings/risks
- `CheckCircle`: Success/occupied
- `TrendingUp/Down`: Trends
- `Users`: Competition
- `MapPin`: Location
- `Calendar`: Dates
- `Edit`: Edit actions
- `Eye`: View details

---

## Testing

### Component Tests

```bash
# Run component tests
npm test src/components/landlord/

# Specific component
npm test PortfolioSummaryWidget.test.tsx
```

### Integration Tests

```typescript
// Test full dashboard flow
1. Load with empty state
2. Add first property
3. Apply filters
4. View property details
5. Edit property
6. Export data
```

---

## Performance Considerations

1. **API Caching**: Components fetch their own data but cache is managed by React Query (if implemented)
2. **Debounced Filters**: Filter changes trigger immediate re-fetch (no debounce) for responsive UX
3. **Pagination**: Properties endpoint supports `?limit=` and `?offset=` for large portfolios
4. **Lazy Loading**: PropertyCard images lazy load with placeholder
5. **Memoization**: Use React.memo() for PropertyCard in large lists

---

## Future Enhancements

### Phase 2
- [ ] Bulk actions (select multiple properties)
- [ ] Property grouping/tagging
- [ ] Custom dashboard widgets
- [ ] CSV/PDF export with charts
- [ ] Mobile-optimized filters (bottom sheet)

### Phase 3
- [ ] Real-time price alerts (WebSocket)
- [ ] Predictive vacancy risk ML model
- [ ] Automated rent adjustment suggestions
- [ ] Market trend forecasting
- [ ] Competition heatmap visualization

---

## Troubleshooting

### Common Issues

**Components not loading:**
- Check API endpoint URLs match backend
- Verify auth token in localStorage
- Check CORS configuration

**Styling inconsistencies:**
- Ensure Tailwind config includes component paths
- Check CSS purge settings
- Verify shadcn/ui components installed

**Filter not working:**
- Confirm API supports query parameters
- Check filter state updates (React DevTools)
- Verify backend filter logic

**Performance issues:**
- Enable React Query for caching
- Add pagination for 50+ properties
- Use React.memo() on PropertyCard
- Lazy load images

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-router-dom": "^6.x",
    "lucide-react": "^0.x",
    "@radix-ui/react-*": "^1.x",
    "tailwindcss": "^3.x"
  }
}
```

---

## Support

For questions or issues:
1. Check existing PropertyCard.tsx and MarketComparisonWidget.tsx for reference
2. Review UnifiedDashboard.tsx for layout patterns
3. Consult `LANDLORD_BACKEND_README.md` for API documentation
4. Check component test files for usage examples

---

**Last Updated:** 2024-02-04  
**Version:** 1.0.0  
**Author:** RocketMan (Claude Sonnet 4.5)
