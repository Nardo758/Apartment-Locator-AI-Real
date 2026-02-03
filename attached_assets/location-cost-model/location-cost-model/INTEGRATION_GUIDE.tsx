// ============================================
// INTEGRATION GUIDE
// How to add Location Cost Model to ApartmentIQ
// ============================================

/*
================================================================================
STEP 1: Copy Files to Your Project
================================================================================

Copy these folders/files to your src/ directory:

FROM: location-cost-model/
TO:   your-project/src/

├── components/
│   └── location-cost/
│       ├── index.ts
│       ├── LocationCostWidget.tsx
│       └── TrueCostCard.tsx
├── contexts/
│   └── LocationCostContext.tsx
├── hooks/
│   └── useLocationCost.ts
├── services/
│   └── locationCostService.ts
├── types/
│   └── locationCost.types.ts
└── pages/
    └── LocationIntelligence.tsx

================================================================================
STEP 2: Update App.tsx
================================================================================
*/

// Your current App.tsx structure:
// ─────────────────────────────────────────────────────────────────────────────

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PropertyStateProvider } from "./contexts";
import { OnboardingFlowProvider } from "./contexts/OnboardingFlowContext";
import { UserProvider } from "./hooks/useUser";

// ADD THIS IMPORT ↓
import { LocationCostProvider } from "./contexts/LocationCostContext";
import LocationIntelligence from "./pages/LocationIntelligence";

// ... your existing page imports ...

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <PropertyStateProvider>
        {/* ADD LocationCostProvider HERE ↓ */}
        <LocationCostProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <OnboardingFlowProvider>
                <Routes>
                  {/* ... your existing routes ... */}
                  
                  {/* ADD THIS ROUTE ↓ */}
                  <Route path="/location-intelligence" element={<LocationIntelligence />} />
                  <Route path="/true-cost" element={<LocationIntelligence />} /> {/* alias */}
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </OnboardingFlowProvider>
            </BrowserRouter>
          </TooltipProvider>
        </LocationCostProvider>
        {/* END LocationCostProvider */}
      </PropertyStateProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;

/*
================================================================================
STEP 3: Add Widget to Dashboard
================================================================================

In your Dashboard.tsx, add the LocationCostWidget:
*/

// In Dashboard.tsx:
import { LocationCostWidget } from "@/components/location-cost";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  
  return (
    <div className="dashboard-layout">
      {/* Your existing dashboard content */}
      
      {/* Add the widget in your sidebar or main area */}
      <LocationCostWidget 
        onViewFullAnalysis={() => navigate('/location-intelligence')}
        className="mb-4"
      />
      
      {/* Rest of dashboard */}
    </div>
  );
};

/*
================================================================================
STEP 4: Add TrueCostCard to PropertyDetails
================================================================================

In your PropertyDetails.tsx:
*/

// In PropertyDetails.tsx:
import { TrueCostCard } from "@/components/location-cost";
import { useLocationCostContext } from "@/contexts/LocationCostContext";

const PropertyDetails = ({ property }) => {
  // Get user's saved preferences
  const { preferences, hasSetWorkAddress } = useLocationCostContext();
  
  return (
    <div className="property-details">
      {/* Your existing property info */}
      
      {/* Add True Cost Card */}
      <TrueCostCard
        baseRent={property.rent}
        propertyAddress={property.address}
        userPreferences={hasSetWorkAddress ? {
          workAddress: preferences.workAddress,
          commuteMode: preferences.commuteMode,
          vehicleMpg: preferences.vehicleMpg,
          hasGym: preferences.hasGymMembership,
        } : undefined}
        comparison={{
          vsAverageRent: -50,
          vsAverageTrueCost: -120,
          rank: 2,
          totalInSearch: 15,
        }}
      />
      
      {/* Rest of property details */}
    </div>
  );
};

/*
================================================================================
STEP 5: Add Navigation Link
================================================================================

In your Header.tsx or navigation component:
*/

// Add to your navigation items:
const navigationItems = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'Search', path: '/search', icon: Search },
  { label: 'True Cost', path: '/location-intelligence', icon: Calculator }, // NEW
  { label: 'Saved', path: '/saved-properties', icon: Heart },
  { label: 'Market Intel', path: '/market-intel', icon: TrendingUp },
];

/*
================================================================================
STEP 6: Environment Variables
================================================================================

Add to your .env file:

VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

Make sure these Google APIs are enabled in your Google Cloud Console:
- Distance Matrix API
- Places API
- Geocoding API
- Maps JavaScript API

================================================================================
STEP 7: Test the Integration
================================================================================

1. Start your dev server: npm run dev
2. Navigate to /location-intelligence
3. Enter a work address
4. Click "Calculate True Costs"
5. Verify apartments are ranked by true cost

================================================================================
OPTIONAL: Connect to Real Apartment Data
================================================================================

Replace the MOCK_APARTMENTS in LocationIntelligence.tsx with your real data:
*/

// In LocationIntelligence.tsx, replace mock data with:
import { useQuery } from '@tanstack/react-query';
import { fetchProperties } from '@/lib/api';

const LocationIntelligence = () => {
  // Fetch real apartments from your API
  const { data: apartments, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties,
  });
  
  // Use apartments instead of MOCK_APARTMENTS
  // ...
};

/*
================================================================================
QUESTIONS? ISSUES?
================================================================================

Common issues:

1. "LocationCostContext not found"
   → Make sure LocationCostProvider wraps your routes in App.tsx

2. "Google Maps API errors"
   → Check your API key and enabled APIs in Google Cloud Console

3. "Styles don't match"
   → Ensure you're using the same Tailwind config and CSS variables

4. "Costs seem wrong"
   → The calculation uses estimates; integrate real Google Distance Matrix API
     for accurate distances and times
*/
