import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Map as MapIcon, ArrowUpDown, Plus, Download, Settings } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MarketIntelBar from '@/components/dashboard/MarketIntelBar';
import InteractivePropertyMap from '@/components/maps/InteractivePropertyMap';
import { PortfolioSummaryWidget } from '@/components/landlord/PortfolioSummaryWidget';
import { PropertyFilters } from '@/components/landlord/PropertyFilters';
import { PropertyCard } from '@/components/landlord/PropertyCard';
import { CompetitionSetManager } from '@/components/landlord/CompetitionSetManager';
import AlertsWidget from '@/components/landlord/AlertsWidget';
import { authenticatedFetch } from '@/lib/authHelpers';
import { useUser } from '@/hooks/useUser';
import type { Property, PropertyFilterOptions } from '@/types/landlord.types';

type SortField = 'vacancyRisk' | 'currentRent' | 'marketDiff';
type ViewMode = 'map' | 'list';

const MOCK_MARKET_DATA = {
  medianRent: 2100,
  rentChange: 1.2,
  daysOnMarket: 52,
  inventoryLevel: 3.2,
  leverageScore: 68,
  aiRecommendation: "Market slightly favors landlords. Consider adjusting rents on renewals.",
};

const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    address: '1234 Main St, Unit 203',
    city: 'Austin',
    state: 'TX',
    currentRent: 2200,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1100,
    marketAvgRent: 2100,
    status: 'occupied',
    vacancyRisk: 'high',
    daysVacant: 0,
    tenant: 'John Smith',
    leaseEndDate: '2026-06-30',
    lastUpdated: '2 hours ago',
    competitorConcessions: [
      { property: 'Riverside Apartments', type: '2 months free', value: '$4,400 value' },
      { property: 'Downtown Towers', type: '$500 off', value: 'move-in special' }
    ],
    pricingRecommendation: {
      type: 'decrease',
      amount: 100,
      confidence: 78,
      reasoning: 'Your rent is 4.8% above market average while competitors offer concessions.',
      expectedImpact: 'Reduce vacancy risk by ~40%'
    },
    recommendation: 'Drop rent to $2,100/mo OR offer 1 month free to match market'
  },
  {
    id: '2',
    address: '5678 Oak Ave, Apt 12',
    city: 'Austin',
    state: 'TX',
    currentRent: 1800,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 750,
    marketAvgRent: 1950,
    status: 'occupied',
    vacancyRisk: 'low',
    daysVacant: 0,
    tenant: 'Sarah Johnson',
    leaseEndDate: '2026-09-15',
    lastUpdated: '1 day ago',
    competitorConcessions: [],
    pricingRecommendation: {
      type: 'increase',
      amount: 50,
      confidence: 85,
      reasoning: 'Property is priced below market. Room for increase on renewal.',
      expectedImpact: 'Additional $600/year revenue'
    },
    recommendation: 'Consider raising to $1,850/mo on next lease renewal'
  },
  {
    id: '3',
    address: '999 Congress Ave, Suite 4B',
    city: 'Austin',
    state: 'TX',
    currentRent: 3200,
    bedrooms: 3,
    bathrooms: 2.5,
    squareFeet: 1500,
    marketAvgRent: 3150,
    status: 'occupied',
    vacancyRisk: 'low',
    daysVacant: 0,
    tenant: 'Mike Chen',
    leaseEndDate: '2026-12-01',
    lastUpdated: '3 hours ago',
    competitorConcessions: [
      { property: 'Luxury Heights', type: 'Waived deposit', value: '$3,200 value' }
    ],
    pricingRecommendation: {
      type: 'hold',
      confidence: 92,
      reasoning: 'Priced at market rate. Maintain current strategy.',
      expectedImpact: 'Stable occupancy expected'
    },
    recommendation: 'Priced at market rate - maintain current pricing'
  },
  {
    id: '4',
    address: '2468 Riverside Dr, #305',
    city: 'Austin',
    state: 'TX',
    currentRent: 2400,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1050,
    marketAvgRent: 2100,
    status: 'vacant',
    vacancyRisk: 'high',
    daysVacant: 45,
    lastUpdated: '6 hours ago',
    competitorConcessions: [
      { property: 'River Oaks', type: '1 month free', value: '$2,100 value' },
      { property: 'The Domain', type: '50% off 1st month', value: '$1,200 value' }
    ],
    competitorComparison: [
      { propertyName: 'River Oaks', distance: 0.3, rent: 2100, bedrooms: 2, bathrooms: 2, concessions: ['1 month free'] },
      { propertyName: 'The Domain', distance: 0.8, rent: 2200, bedrooms: 2, bathrooms: 2, concessions: ['50% off 1st month'] },
    ],
    pricingRecommendation: {
      type: 'decrease',
      amount: 300,
      confidence: 95,
      reasoning: 'URGENT: 45 days vacant and overpriced by $300/mo. Immediate action needed.',
      expectedImpact: 'Fill vacancy within 2 weeks'
    },
    recommendation: 'URGENT: Drop to $2,100 OR offer 2 months free immediately'
  },
  {
    id: '5',
    address: '7890 South Lamar, Unit 8',
    city: 'Austin',
    state: 'TX',
    currentRent: 1600,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 650,
    marketAvgRent: 1700,
    status: 'occupied',
    vacancyRisk: 'medium',
    daysVacant: 0,
    tenant: 'Lisa Williams',
    leaseEndDate: '2026-04-30',
    lastUpdated: '5 hours ago',
    competitorConcessions: [
      { property: 'South Park Lofts', type: '$400 off', value: 'first month' }
    ],
    pricingRecommendation: {
      type: 'increase',
      amount: 50,
      confidence: 72,
      reasoning: 'Slightly underpriced. Could raise modestly while staying competitive.',
      expectedImpact: 'Additional $600/year if accepted'
    },
    recommendation: 'Raise to $1,650/mo while remaining competitive'
  }
];

export default function LandlordDashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortField>('vacancyRisk');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [loading, setLoading] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<PropertyFilterOptions>({
    city: undefined,
    status: undefined,
    vacancyRisk: undefined,
    competitionSet: undefined,
  });

  useEffect(() => {
    fetchProperties();
    fetchCities();
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.vacancyRisk && filters.vacancyRisk !== 'all') params.append('vacancyRisk', filters.vacancyRisk);
      if (filters.competitionSet) params.append('competitionSetId', filters.competitionSet);

      const response = await authenticatedFetch(`/api/landlord/properties?${params.toString()}`);

      if (response.status === 401) {
        return;
      }

      if (!response.ok) {
        console.error('Failed to fetch properties, using mock data');
        setProperties(MOCK_PROPERTIES);
        return;
      }

      const data = await response.json();
      if (data.properties && data.properties.length > 0) {
        setProperties(data.properties);
      } else {
        setProperties(MOCK_PROPERTIES);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties(MOCK_PROPERTIES);
    } finally {
      setLoading(false);
    }
  };

  const MOCK_CITIES = ['Austin', 'Dallas', 'Houston', 'San Antonio'];

  const fetchCities = async () => {
    try {
      const response = await authenticatedFetch('/api/landlord/properties/cities');
      
      if (response.status === 401) {
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setAvailableCities(data.cities?.length > 0 ? data.cities : MOCK_CITIES);
      } else {
        setAvailableCities(MOCK_CITIES);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      setAvailableCities(MOCK_CITIES);
    }
  };

  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      if (filters.city && prop.city !== filters.city) return false;
      if (filters.status && prop.status !== filters.status) return false;
      if (filters.vacancyRisk && prop.vacancyRisk !== filters.vacancyRisk) return false;
      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'vacancyRisk':
          const riskOrder = { high: 0, medium: 1, low: 2 };
          return riskOrder[a.vacancyRisk] - riskOrder[b.vacancyRisk];
        case 'currentRent':
          return b.currentRent - a.currentRent;
        case 'marketDiff':
          const diffA = a.currentRent - a.marketAvgRent;
          const diffB = b.currentRent - b.marketAvgRent;
          return diffB - diffA;
        default:
          return 0;
      }
    });
  }, [properties, filters, sortBy]);

  const mapProperties = useMemo(() => {
    return filteredProperties.map(p => ({
      id: p.id,
      name: p.address,
      address: `${p.city}, ${p.state}`,
      coordinates: { lat: 30.2672 + Math.random() * 0.05, lng: -97.7431 + Math.random() * 0.05 },
      baseRent: p.currentRent,
      parkingIncluded: true,
    }));
  }, [filteredProperties]);

  const stats = useMemo(() => ({
    total: properties.length,
    highRisk: properties.filter(p => p.vacancyRisk === 'high').length,
    mediumRisk: properties.filter(p => p.vacancyRisk === 'medium').length,
    lowRisk: properties.filter(p => p.vacancyRisk === 'low').length,
    vacant: properties.filter(p => p.status === 'vacant').length,
    occupied: properties.filter(p => p.status === 'occupied').length,
  }), [properties]);

  const handlePropertyEdit = useCallback((propertyId: string) => {
    navigate(`/landlord/properties/${propertyId}/edit`);
  }, [navigate]);

  const handlePropertyDetails = useCallback((propertyId: string) => {
    setSelectedPropertyId(propertyId);
    navigate(`/landlord/properties/${propertyId}`);
  }, [navigate]);

  const handleAddProperty = () => {
    navigate('/landlord/properties/new');
  };

  const handleSettings = () => {
    navigate('/landlord/settings');
  };

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-gray-100">
      <Header />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        <MarketIntelBar
          location="Austin, TX"
          medianRent={MOCK_MARKET_DATA.medianRent}
          rentChange={MOCK_MARKET_DATA.rentChange}
          daysOnMarket={MOCK_MARKET_DATA.daysOnMarket}
          inventoryLevel={MOCK_MARKET_DATA.inventoryLevel}
          leverageScore={MOCK_MARKET_DATA.leverageScore}
          aiRecommendation={MOCK_MARKET_DATA.aiRecommendation}
          className="mb-4"
        />

        <div className="flex flex-col lg:flex-row gap-4">
          <aside className="w-full lg:w-80 shrink-0 space-y-4 [&_.card]:bg-gray-800/80 [&_.card]:border-gray-700">
            <PortfolioSummaryWidget userId={user?.id} />
            
            <PropertyFilters
              filters={filters}
              onFiltersChange={setFilters}
              availableCities={availableCities}
              resultCount={filteredProperties.length}
            />

            <CompetitionSetManager userId={user?.id} />

            <AlertsWidget />
          </aside>

          <main className="flex-1 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                  <TabsList>
                    <TabsTrigger value="map" data-testid="tab-map-view">
                      <MapIcon className="w-4 h-4 mr-1" />
                      Map
                    </TabsTrigger>
                    <TabsTrigger value="list" data-testid="tab-list-view">
                      <List className="w-4 h-4 mr-1" />
                      List
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <Badge variant="secondary" className="ml-2">
                  {filteredProperties.length} properties
                </Badge>

                {stats.highRisk > 0 && (
                  <Badge variant="destructive">
                    {stats.highRisk} high risk
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">Sort:</span>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortField)}>
                  <SelectTrigger className="w-[150px] h-8" data-testid="select-sort-by">
                    <ArrowUpDown className="w-3 h-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacancyRisk">Vacancy Risk</SelectItem>
                    <SelectItem value="currentRent">Rent (High-Low)</SelectItem>
                    <SelectItem value="marketDiff">Market Diff</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>

                <Button variant="outline" size="sm" onClick={handleSettings}>
                  <Settings className="w-4 h-4" />
                </Button>

                <Button size="sm" onClick={handleAddProperty} className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <Plus className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Add Property</span>
                </Button>
              </div>
            </div>

            {viewMode === 'map' ? (
              <InteractivePropertyMap
                properties={mapProperties}
                pois={[]}
                selectedPropertyId={selectedPropertyId}
                onPropertyClick={setSelectedPropertyId}
                onPropertyHover={setSelectedPropertyId}
                showConnections={false}
                className="h-[500px] rounded-lg"
              />
            ) : (
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                  </div>
                ) : filteredProperties.length === 0 ? (
                  <Card className="p-12 text-center">
                    <CardContent className="pt-6">
                      <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                      <p className="text-muted-foreground mb-6">
                        {Object.values(filters).some(v => v) 
                          ? 'Try adjusting your filters' 
                          : 'Get started by adding your first property'}
                      </p>
                      <div className="flex gap-2 justify-center">
                        {Object.values(filters).some(v => v) && (
                          <Button 
                            variant="outline"
                            onClick={() => setFilters({ city: undefined, status: undefined, vacancyRisk: undefined, competitionSet: undefined })}
                          >
                            Clear Filters
                          </Button>
                        )}
                        <Button onClick={handleAddProperty} className="bg-gradient-to-r from-purple-600 to-blue-600">
                          <Plus className="w-4 h-4 mr-1" />
                          Add Property
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  filteredProperties.map(property => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onEdit={handlePropertyEdit}
                      onViewDetails={handlePropertyDetails}
                      className={selectedPropertyId === property.id ? 'ring-2 ring-primary' : ''}
                    />
                  ))
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
