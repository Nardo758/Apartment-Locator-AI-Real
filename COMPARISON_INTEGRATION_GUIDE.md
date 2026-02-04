# 🔌 Comparison Components Integration Guide

## Quick Start (5 minutes)

### Step 1: Add Route
```tsx
// src/App.tsx or your router config
import ComparisonView from '@/components/landlord/ComparisonView';

<Route 
  path="/landlord/properties/:propertyId/comparison" 
  element={<ComparisonPage />} 
/>
```

### Step 2: Create Comparison Page
```tsx
// src/pages/landlord/ComparisonPage.tsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ComparisonView from '@/components/landlord/ComparisonView';

export default function ComparisonPage() {
  const { propertyId } = useParams();
  const [competitorIds, setCompetitorIds] = useState<string[]>([]);

  useEffect(() => {
    // Fetch competition set for this property
    fetchCompetitionSet(propertyId);
  }, [propertyId]);

  const fetchCompetitionSet = async (propId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/competition-sets', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const { competitionSets } = await response.json();
      
      // Find set containing this property
      const set = competitionSets.find(s => 
        s.ownPropertyIds.includes(propId)
      );
      
      if (set) {
        // Extract competitor property IDs
        const competitors = await fetch(
          `/api/competition-sets/${set.id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const data = await competitors.json();
        const competitorPropertyIds = data.competitors.map(c => c.propertyId);
        setCompetitorIds(competitorPropertyIds);
      }
    } catch (error) {
      console.error('Error loading competition set:', error);
    }
  };

  if (!propertyId) {
    return <div>Property not found</div>;
  }

  if (competitorIds.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Market Comparison</h1>
        <p className="text-muted-foreground">
          No competition set found for this property.
          <a href="/landlord/competition-sets" className="text-primary ml-2">
            Create one now
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Market Comparison</h1>
      <ComparisonView
        propertyId={propertyId}
        competitorIds={competitorIds}
        onError={(error) => {
          console.error('Comparison error:', error);
          // Optional: Show toast notification
        }}
      />
    </div>
  );
}
```

### Step 3: Add Navigation Link
```tsx
// In your property card or dashboard
import { Link } from 'react-router-dom';
import { BarChart } from 'lucide-react';

<Link to={`/landlord/properties/${property.id}/comparison`}>
  <Button variant="outline" size="sm">
    <BarChart className="h-4 w-4 mr-2" />
    View Comparison
  </Button>
</Link>
```

---

## Full Integration Example

### Dashboard Integration
```tsx
// src/pages/landlord/Dashboard.tsx
import { useState, useEffect } from 'react';
import ComparisonView from '@/components/landlord/ComparisonView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LandlordDashboard() {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [competitorIds, setCompetitorIds] = useState<string[]>([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/landlord/properties', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    setProperties(data.properties);
    
    // Auto-select first property
    if (data.properties.length > 0) {
      setSelectedProperty(data.properties[0].id);
      await loadCompetitors(data.properties[0].id);
    }
  };

  const loadCompetitors = async (propertyId: string) => {
    // Load from competition sets or use default competitors
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/competition-sets', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const { competitionSets } = await response.json();
    
    const set = competitionSets.find(s => 
      s.ownPropertyIds.includes(propertyId)
    );
    
    if (set) {
      const detailResponse = await fetch(
        `/api/competition-sets/${set.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await detailResponse.json();
      setCompetitorIds(data.competitors.map(c => c.propertyId));
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Market Analysis</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Your existing dashboard content */}
        </TabsContent>

        <TabsContent value="comparison">
          {selectedProperty && competitorIds.length > 0 ? (
            <ComparisonView
              propertyId={selectedProperty}
              competitorIds={competitorIds}
            />
          ) : (
            <div className="text-center py-12">
              <p>Select a property and add competitors to see analysis</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="portfolio">
          {/* Portfolio view */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## API Integration Patterns

### Pattern 1: Direct API Call (Simplest)
```tsx
const [data, setData] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/comparison', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        propertyId: 'your-id',
        competitorIds: ['comp-1', 'comp-2'],
        includeMarketBenchmark: true,
      }),
    });
    const result = await response.json();
    setData(result);
  };
  
  fetchData();
}, []);
```

### Pattern 2: With React Query (Recommended)
```tsx
import { useQuery } from '@tanstack/react-query';

const useComparison = (propertyId: string, competitorIds: string[]) => {
  return useQuery({
    queryKey: ['comparison', propertyId, competitorIds],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/comparison', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId,
          competitorIds,
          includeMarketBenchmark: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch comparison');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Usage
function ComparisonPage() {
  const { data, isLoading, error } = useComparison(propertyId, competitorIds);
  
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <ComparisonView {...data} />;
}
```

### Pattern 3: With Custom Hook
```tsx
// hooks/useComparison.ts
import { useState, useEffect } from 'react';

export function useComparison(propertyId: string, competitorIds: string[]) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchComparison = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/comparison', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            propertyId,
            competitorIds,
            includeMarketBenchmark: true,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchComparison();

    return () => {
      isMounted = false;
    };
  }, [propertyId, competitorIds]);

  return { data, loading, error };
}

// Usage
function ComparisonPage() {
  const { data, loading, error } = useComparison(propertyId, competitorIds);
  
  // Use data, loading, error states
}
```

---

## Context Provider Pattern

For global comparison state management:

```tsx
// context/ComparisonContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface ComparisonContextType {
  selectedProperty: string | null;
  setSelectedProperty: (id: string) => void;
  competitors: string[];
  setCompetitors: (ids: string[]) => void;
  refreshComparison: () => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshComparison = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <ComparisonContext.Provider
      value={{
        selectedProperty,
        setSelectedProperty,
        competitors,
        setCompetitors,
        refreshComparison,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within ComparisonProvider');
  }
  return context;
}

// Usage in App.tsx
<ComparisonProvider>
  <App />
</ComparisonProvider>

// Usage in components
const { selectedProperty, setSelectedProperty } = useComparison();
```

---

## Error Handling Examples

### Toast Notifications (with sonner)
```tsx
import { toast } from 'sonner';

<ComparisonView
  propertyId={propertyId}
  competitorIds={competitorIds}
  onError={(error) => {
    toast.error('Comparison failed', {
      description: error,
      action: {
        label: 'Retry',
        onClick: () => window.location.reload(),
      },
    });
  }}
/>
```

### Custom Error Boundary
```tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="text-center p-6">
      <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
      <pre className="text-sm text-muted-foreground">{error.message}</pre>
      <Button onClick={resetErrorBoundary} className="mt-4">
        Try again
      </Button>
    </div>
  );
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <ComparisonView {...props} />
</ErrorBoundary>
```

---

## Performance Optimization

### Memoization
```tsx
import { useMemo } from 'react';

const ComparisonWrapper = ({ propertyId, competitorIds }) => {
  const memoizedCompetitorIds = useMemo(
    () => competitorIds,
    [competitorIds.join(',')]
  );

  return (
    <ComparisonView
      propertyId={propertyId}
      competitorIds={memoizedCompetitorIds}
    />
  );
};
```

### Lazy Loading
```tsx
import { lazy, Suspense } from 'react';

const ComparisonView = lazy(() => import('@/components/landlord/ComparisonView'));

<Suspense fallback={<Spinner />}>
  <ComparisonView {...props} />
</Suspense>
```

### Debounced Updates
```tsx
import { useDebounce } from '@/hooks/useDebounce';

const [competitorIds, setCompetitorIds] = useState([]);
const debouncedIds = useDebounce(competitorIds, 500);

<ComparisonView
  propertyId={propertyId}
  competitorIds={debouncedIds}
/>
```

---

## Testing Examples

### Unit Test (Vitest + React Testing Library)
```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ComparisonView from './ComparisonView';

describe('ComparisonView', () => {
  it('displays loading state initially', () => {
    render(
      <ComparisonView
        propertyId="test-id"
        competitorIds={['comp-1']}
      />
    );
    
    expect(screen.getByText(/analyzing market data/i)).toBeInTheDocument();
  });

  it('calls onError when fetch fails', async () => {
    const onError = vi.fn();
    global.fetch = vi.fn(() => Promise.reject(new Error('API Error')));
    
    render(
      <ComparisonView
        propertyId="test-id"
        competitorIds={['comp-1']}
        onError={onError}
      />
    );
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.stringContaining('API Error'));
    });
  });
});
```

---

## Common Issues & Solutions

### Issue: "Cannot find module '@/components/ui/tabs'"
**Solution:** Ensure path alias is configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: "localStorage is not defined"
**Solution:** Check for SSR environment:
```tsx
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};
```

### Issue: "Hook called outside of component"
**Solution:** Ensure hooks are only called in React components or custom hooks, not in regular functions.

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] API endpoints accessible
- [ ] Authentication working
- [ ] Competition sets feature enabled
- [ ] Error boundaries in place
- [ ] Loading states tested
- [ ] Mobile responsive
- [ ] Performance optimized
- [ ] Analytics tracking added
- [ ] User feedback mechanism

---

## Next Steps

1. **Add to existing dashboard** - Follow integration patterns above
2. **Test with real data** - Use actual property and competitor IDs
3. **Add analytics** - Track usage with Mixpanel/GA
4. **Gather feedback** - Show to beta users
5. **Iterate** - Improve based on feedback

---

*For questions or issues, check the README or contact the development team.*
