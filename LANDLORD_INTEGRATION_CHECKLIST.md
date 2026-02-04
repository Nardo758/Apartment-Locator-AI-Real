# Landlord Dashboard Integration Checklist

## Pre-Integration Setup

### ✅ Backend Setup
- [ ] Verify backend API endpoints are deployed:
  - `GET /api/landlord/portfolio/summary`
  - `GET /api/landlord/properties`
  - `GET /api/landlord/properties/cities`
  - `GET /api/landlord/competition-sets`
- [ ] Test endpoints with Postman/curl
- [ ] Confirm authentication middleware is working
- [ ] Check CORS configuration for frontend domain

### ✅ Frontend Dependencies
- [ ] Verify all shadcn/ui components installed:
  ```bash
  npx shadcn-ui@latest add card button badge select tabs table
  ```
- [ ] Check lucide-react is installed:
  ```bash
  npm install lucide-react
  ```
- [ ] Verify React Router is configured

---

## Component Integration

### Step 1: Import Types
```typescript
// src/types/landlord.types.ts already created ✅
import { 
  Property, 
  PropertyFilterOptions,
  PortfolioSummary 
} from '@/types/landlord.types';
```

### Step 2: Add Components to Exports
```typescript
// src/components/landlord/index.ts already created ✅
// Verify exports are working
import { 
  PortfolioSummaryWidget,
  PropertyFilters,
  PropertyCard 
} from '@/components/landlord';
```

### Step 3: Add Route
```typescript
// src/App.tsx or routes config
import LandlordDashboard from '@/pages/LandlordDashboard';

// Add route
<Route 
  path="/landlord/dashboard" 
  element={<LandlordDashboard />} 
/>

// Protect route (if needed)
<Route 
  path="/landlord/dashboard" 
  element={
    <ProtectedRoute requiredRole="landlord">
      <LandlordDashboard />
    </ProtectedRoute>
  } 
/>
```

### Step 4: Test Individual Components

#### PortfolioSummaryWidget
```typescript
// Test page: src/pages/TestPortfolioWidget.tsx
import { PortfolioSummaryWidget } from '@/components/landlord';

export default function TestPortfolioWidget() {
  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <PortfolioSummaryWidget />
    </div>
  );
}
```

**Checklist:**
- [ ] Widget loads without errors
- [ ] Loading spinner shows during fetch
- [ ] Data displays correctly
- [ ] Error state shows on API failure
- [ ] Occupancy rate color coding works
- [ ] Revenue trends display correctly
- [ ] At-risk alert appears when count > 0

#### PropertyFilters
```typescript
// Test page: src/pages/TestPropertyFilters.tsx
import { PropertyFilters } from '@/components/landlord';
import { useState } from 'react';

export default function TestPropertyFilters() {
  const [filters, setFilters] = useState({
    status: 'all',
    vacancyRisk: 'all',
  });

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <PropertyFilters
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={12}
      />
      <pre className="text-white mt-4">
        {JSON.stringify(filters, null, 2)}
      </pre>
    </div>
  );
}
```

**Checklist:**
- [ ] All dropdowns render correctly
- [ ] City dropdown populates from API
- [ ] Competition sets dropdown populates
- [ ] Filter changes update state
- [ ] Active filter badges display
- [ ] Clear filters button works
- [ ] Result count updates

#### PropertyCard
```typescript
// Test page: src/pages/TestPropertyCard.tsx
import { PropertyCard } from '@/components/landlord';

const mockProperty = {
  id: '1',
  address: '123 Main St',
  city: 'Atlanta',
  state: 'GA',
  currentRent: 1800,
  bedrooms: 2,
  bathrooms: 2,
  marketAvgRent: 1650,
  vacancyRisk: 'medium' as const,
  status: 'occupied' as const,
  lastUpdated: '2 hours ago',
  competitorConcessions: [],
  pricingRecommendation: {
    type: 'decrease' as const,
    amount: 100,
    confidence: 85,
    reasoning: 'Market avg is lower and 3 competitors offering concessions',
    expectedImpact: 'Reduce vacancy risk by 40%'
  }
};

export default function TestPropertyCard() {
  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="max-w-2xl">
        <PropertyCard 
          property={mockProperty}
          onEdit={(id) => console.log('Edit:', id)}
          onViewDetails={(id) => console.log('View:', id)}
        />
      </div>
    </div>
  );
}
```

**Checklist:**
- [ ] Card displays all property details
- [ ] Risk indicator stripe shows correct color
- [ ] Pricing comparison displays
- [ ] AI recommendation section renders
- [ ] Competitor comparison (if provided)
- [ ] Concession alerts (if any)
- [ ] Tenant info (if occupied)
- [ ] Edit and View Details buttons work

---

## Full Dashboard Integration

### Step 5: Test Complete Dashboard

**Checklist:**
- [ ] Dashboard loads at `/landlord/dashboard`
- [ ] Portfolio summary displays at top
- [ ] Filters sidebar on left (desktop)
- [ ] Property cards grid on right
- [ ] Add Property button works
- [ ] Export button present (functionality TBD)
- [ ] Settings button present
- [ ] Filter changes update property list
- [ ] Empty state displays correctly
- [ ] Loading states work
- [ ] Edit property navigation works
- [ ] View details navigation works

### Step 6: Responsive Testing

**Desktop (1920x1080):**
- [ ] 2-column property grid
- [ ] Sidebar width: 320px
- [ ] All elements visible
- [ ] No horizontal scroll

**Tablet (768x1024):**
- [ ] Sidebar stacks above content
- [ ] 1-column property grid
- [ ] Touch-friendly hit areas

**Mobile (375x667):**
- [ ] Single column layout
- [ ] Filters accessible
- [ ] Cards readable
- [ ] Buttons accessible

---

## API Integration Testing

### Mock API Responses

Create mock data for testing without backend:

```typescript
// src/lib/mockLandlordData.ts
export const mockPortfolioSummary = {
  totalProperties: 12,
  occupiedUnits: 45,
  vacantUnits: 3,
  occupancyRate: 93.75,
  totalRevenue: 67500,
  potentialRevenue: 72000,
  atRiskCount: 2,
  averageRent: 1500,
  revenueChange: 2.3
};

export const mockProperties = [
  // ... see LANDLORD_COMPONENTS_README.md for structure
];
```

### API Testing Script

```bash
# Test portfolio summary
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/landlord/portfolio/summary

# Test properties list
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/landlord/properties

# Test with filters
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/landlord/properties?city=Atlanta&status=vacant"

# Test cities endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/landlord/properties/cities

# Test competition sets
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/landlord/competition-sets
```

---

## Performance Testing

### Metrics to Check

- [ ] Initial page load < 2s
- [ ] Portfolio summary fetch < 500ms
- [ ] Properties list fetch < 1s
- [ ] Filter change response < 300ms
- [ ] No layout shift on load
- [ ] Images lazy load
- [ ] Smooth animations (60fps)

### Load Testing

Test with varying property counts:
- [ ] 10 properties
- [ ] 50 properties
- [ ] 100 properties
- [ ] 500 properties (pagination recommended)

---

## Error Handling

### Test Scenarios

1. **Network Error:**
   - [ ] Disconnect network
   - [ ] Verify error message displays
   - [ ] Retry mechanism works

2. **Authentication Error:**
   - [ ] Clear token
   - [ ] Verify redirect to login
   - [ ] Return to dashboard after login

3. **Empty State:**
   - [ ] User with no properties
   - [ ] Empty state message shows
   - [ ] "Add Property" CTA visible

4. **Invalid Filter:**
   - [ ] Select city with no properties
   - [ ] Empty state with "adjust filters" message

5. **API Timeout:**
   - [ ] Slow API response (>30s)
   - [ ] Loading spinner continues
   - [ ] Timeout error message

---

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader compatible
- [ ] ARIA labels present
- [ ] Color contrast meets WCAG AA
- [ ] Form inputs labeled
- [ ] Error messages announced

---

## Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Pre-Production Checklist

### Code Quality
- [ ] No console.errors in production
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Proper error boundaries in place
- [ ] Loading states for all async operations

### Security
- [ ] Auth token stored securely
- [ ] API calls use HTTPS
- [ ] XSS prevention (no dangerouslySetInnerHTML)
- [ ] CSRF protection enabled
- [ ] Rate limiting on API

### Documentation
- [ ] Component props documented
- [ ] API endpoints documented
- [ ] Error codes documented
- [ ] README updated
- [ ] CHANGELOG updated

### Deployment
- [ ] Environment variables configured
- [ ] API URLs point to production
- [ ] Error tracking (Sentry) configured
- [ ] Analytics tracking added
- [ ] Feature flags enabled

---

## Post-Launch Monitoring

### Week 1
- [ ] Monitor error rates
- [ ] Check API response times
- [ ] Review user feedback
- [ ] Fix critical bugs

### Month 1
- [ ] Analyze usage patterns
- [ ] Identify slow queries
- [ ] Optimize heavy components
- [ ] Plan feature enhancements

---

## Known Issues & Workarounds

| Issue | Workaround | Fix ETA |
|-------|-----------|---------|
| Filter dropdown slow with 100+ cities | Implement search/autocomplete | Sprint 2 |
| Property cards cause re-renders | Use React.memo() | Sprint 1 |
| Large images slow load | Add image optimization | Sprint 2 |

---

## Support & Resources

- **Component Docs:** `LANDLORD_COMPONENTS_README.md`
- **Backend API:** `LANDLORD_BACKEND_README.md`
- **Type Definitions:** `src/types/landlord.types.ts`
- **Example Usage:** `src/pages/LandlordDashboard.tsx`
- **Design System:** Matches `UnifiedDashboard.tsx`

---

## Quick Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Format code
npm run format
```

---

**Integration Status:** ✅ Ready for Testing  
**Last Updated:** 2024-02-04  
**Assigned To:** Frontend Team
