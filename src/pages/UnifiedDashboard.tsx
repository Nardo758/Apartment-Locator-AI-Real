import { useState, useMemo, useCallback, useEffect } from 'react';
import { List, Map as MapIcon, ArrowUpDown, TrendingDown, Star, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Header from '@/components/Header';
import MarketIntelBar from '@/components/dashboard/MarketIntelBar';
import LeftPanelSidebar, { type LifestyleInputs, type CostCategory, type POICategory } from '@/components/dashboard/LeftPanelSidebar';
import InteractivePropertyMap from '@/components/maps/InteractivePropertyMap';
import { useLocationCostContext } from '@/contexts/LocationCostContext';
import { useUnifiedAI } from '@/contexts/UnifiedAIContext';
import { calculateApartmentCosts, formatCurrency } from '@/services/locationCostService';
import type { ApartmentLocationCost } from '@/types/locationCost.types';
import { api } from '@/lib/api';

interface POI {
  id: string;
  name: string;
  address: string;
  category: POICategory;
  coordinates: { lat: number; lng: number };
}

interface PropertyData {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  baseRent: number;
  parkingIncluded: boolean;
  bedrooms: number;
  bathrooms: number;
  imageUrl?: string;
}

const MOCK_PROPERTIES: PropertyData[] = [
  { id: 'apt-1', name: 'The Vue at Lake Eola', address: '101 E Pine St, Orlando, FL 32801', coordinates: { lat: 28.5420, lng: -81.3729 }, baseRent: 1850, parkingIncluded: false, bedrooms: 2, bathrooms: 2 },
  { id: 'apt-2', name: 'Camden Orange Court', address: '601 N Orange Ave, Orlando, FL 32801', coordinates: { lat: 28.5478, lng: -81.3792 }, baseRent: 1650, parkingIncluded: true, bedrooms: 1, bathrooms: 1 },
  { id: 'apt-3', name: 'Millenia Apartments', address: '4950 Millenia Blvd, Orlando, FL 32839', coordinates: { lat: 28.4859, lng: -81.4284 }, baseRent: 1450, parkingIncluded: true, bedrooms: 2, bathrooms: 1 },
  { id: 'apt-4', name: 'Baldwin Harbor', address: '4225 S John Young Pkwy, Orlando, FL 32839', coordinates: { lat: 28.4612, lng: -81.4098 }, baseRent: 1350, parkingIncluded: true, bedrooms: 1, bathrooms: 1 },
  { id: 'apt-5', name: 'ARIUM MetroWest', address: '2300 S Hiawassee Rd, Orlando, FL 32835', coordinates: { lat: 28.5089, lng: -81.4567 }, baseRent: 1275, parkingIncluded: true, bedrooms: 1, bathrooms: 1 },
];

const MOCK_MARKET_DATA = {
  medianRent: 1847,
  rentChange: 2.3,
  daysOnMarket: 24,
  inventoryLevel: 3.2,
  leverageScore: 72,
  aiRecommendation: "Market conditions favor renters. Good time to negotiate!",
};

type SortField = 'trueCost' | 'baseRent' | 'commute';
type ViewMode = 'map' | 'list';

const GROCERY_STORE_MAP: Record<string, 'walmart' | 'wholefoods' | 'traderjoes' | 'kroger' | 'costco' | undefined> = {
  'Any nearby store': undefined,
  'Walmart': 'walmart',
  'Target': undefined,
  'Whole Foods': 'wholefoods',
  'H-E-B': undefined,
  'Kroger': 'kroger',
  "Trader Joe's": 'traderjoes',
  'Costco': 'costco',
  'Aldi': undefined,
};

export default function UnifiedDashboard() {
  const { inputs, gasPrice, isCalculating, setIsCalculating } = useLocationCostContext();
  const unifiedAI = useUnifiedAI();
  
  // Set page title
  useEffect(() => {
    document.title = 'Renter Dashboard | Apartment Locator AI';
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      setDataError(null);
      // Use location from UnifiedAI context if available (NO hardcoded default)
      if (!unifiedAI.location) {
        console.log('No location set - user needs to complete profile');
        return; // Don't load properties if no location set
      }
      
      const locationParts = unifiedAI.location.split(',').map(s => s.trim());
      const defaultCity = locationParts[0];
      const defaultState = locationParts[1];

      try {
        const fetched = await api.getProperties({ city: defaultCity, state: defaultState, limit: 25 });
        if (fetched.length > 0) {
          const mapped = fetched
            .map((property) => {
              const lat = property.latitude ? parseFloat(property.latitude) : null;
              const lng = property.longitude ? parseFloat(property.longitude) : null;
              const rent = property.minPrice && property.maxPrice
                ? (property.minPrice + property.maxPrice) / 2
                : property.minPrice || property.maxPrice || 0;

              if (!lat || !lng) {
                return null;
              }

              return {
                id: property.id,
                name: property.name,
                address: property.address,
                coordinates: { lat, lng },
                baseRent: rent,
                parkingIncluded: false,
                bedrooms: property.bedroomsMin || property.bedroomsMax || 0,
                bathrooms: Number(property.bathroomsMin || property.bathroomsMax || 0),
                imageUrl: property.images?.[0],
              };
            })
            .filter((prop): prop is PropertyData => prop !== null);

          if (mapped.length > 0) {
            setProperties(mapped);
          }
        }
      } catch (error) {
        setDataError(error instanceof Error ? error.message : 'Failed to load properties');
      }

      try {
        const snapshots = await api.getMarketSnapshots(defaultCity, defaultState, 1);
        if (snapshots.length > 0) {
          const latest = snapshots[0];
          const rentChange = latest.priceTrend30d
            ? parseFloat(String(latest.priceTrend30d))
            : latest.priceTrend7d
              ? parseFloat(String(latest.priceTrend7d))
              : 0;
          const inventoryLevel = latest.activeListings ?? latest.totalProperties ?? 0;
          const daysOnMarket = Number(latest.avgDaysOnMarket || 0);
          const leverageScore = Math.min(100, Math.max(0, Math.round((daysOnMarket / 2) + (inventoryLevel / 20))));
          const aiRecommendation = rentChange < 0
            ? 'Market conditions favor renters. Good time to negotiate!'
            : rentChange > 3
              ? 'Market is heating up. Act quickly and be competitive.'
              : 'Stable market conditions. Negotiate based on property specifics.';

          setMarketData((prev) => ({
            medianRent: latest.medianPrice || latest.avgPrice || prev.medianRent,
            rentChange: Number.isNaN(rentChange) ? prev.rentChange : rentChange,
            daysOnMarket,
            inventoryLevel,
            leverageScore,
            aiRecommendation,
          }));
        }
      } catch (error) {
        setDataError(error instanceof Error ? error.message : 'Failed to load market data');
      }
    };

    loadDashboardData();
  }, [unifiedAI.location]); // Reload when user's location changes
  
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [sortBy, setSortBy] = useState<SortField>('trueCost');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [results, setResults] = useState<ApartmentLocationCost[]>([]);
  const [properties, setProperties] = useState<PropertyData[]>(MOCK_PROPERTIES);
  const [marketData, setMarketData] = useState(MOCK_MARKET_DATA);
  const [dataError, setDataError] = useState<string | null>(null);
  // Initialize POIs from UnifiedAI context
  const [pois, setPois] = useState<POI[]>(() => {
    if (unifiedAI.pointsOfInterest.length > 0) {
      return unifiedAI.pointsOfInterest.map(poi => ({
        id: poi.id || `poi-${Date.now()}-${Math.random()}`,
        name: poi.name,
        address: poi.address,
        category: poi.category as POICategory,
        coordinates: poi.coordinates || { lat: 28.5383, lng: -81.3792 }, // Default coords if missing
      }));
    }
    // Default POI if none saved
    return [
      { id: '1', name: 'My Office', address: '123 Main St, Orlando, FL', category: 'work', coordinates: { lat: 28.5383, lng: -81.3792 } },
    ];
  });
  
  // Initialize state from UnifiedAI context (data from Program Your AI)
  const [lifestyleInputs, setLifestyleInputs] = useState<LifestyleInputs>(() => {
    const workPOI = unifiedAI.pointsOfInterest.find(poi => poi.category === 'work');
    return {
      workAddress: workPOI?.address || '',
      commuteDays: unifiedAI.commutePreferences.daysPerWeek,
      commuteMode: 'driving',
      vehicleMpg: unifiedAI.commutePreferences.vehicleMpg,
      groceryTrips: 2,
      preferredStore: 'Any nearby store',
      hasGym: false,
      gymVisits: 3,
      customCategories: [],
    };
  });
  
  const [filters, setFilters] = useState<{
    minBudget: number;
    maxBudget: number;
    bedrooms: number[];
    amenities: string[];
  }>(() => ({
    minBudget: Math.max(1000, unifiedAI.budget - 500),
    maxBudget: unifiedAI.budget || 2500,
    bedrooms: unifiedAI.aiPreferences.bedrooms ? [parseInt(unifiedAI.aiPreferences.bedrooms)] : [1, 2],
    amenities: unifiedAI.aiPreferences.amenities || [],
  }));

  const calculationProperties = useMemo(
    () => (properties.length > 0 ? properties : MOCK_PROPERTIES),
    [properties]
  );

  const handleAddPOI = useCallback((poi: Omit<POI, 'id'>) => {
    const newPOI: POI = { ...poi, id: `poi-${Date.now()}` };
    setPois(prev => [...prev, newPOI]);
  }, []);

  const handleRemovePOI = useCallback((id: string) => {
    setPois(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleCalculate = useCallback(async () => {
    setIsCalculating(true);
    try {
      const calculatedResults = await calculateApartmentCosts(
        {
          ...inputs,
          commuteFrequency: lifestyleInputs.commuteDays,
          commuteMode: lifestyleInputs.commuteMode,
          vehicleMpg: lifestyleInputs.vehicleMpg,
          groceryFrequency: lifestyleInputs.groceryTrips,
          preferredGroceryChain: GROCERY_STORE_MAP[lifestyleInputs.preferredStore],
          hasGymMembership: lifestyleInputs.hasGym,
          gymVisitsPerWeek: lifestyleInputs.gymVisits,
        },
        calculationProperties,
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        { stateAverage: gasPrice, lastUpdated: new Date(), source: 'manual' }
      );
      setResults(calculatedResults);
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [inputs, lifestyleInputs, gasPrice, setIsCalculating, calculationProperties]);

  const propertiesWithCosts = useMemo(() => {
    return calculationProperties.map(prop => {
      const costResult = results.find(r => r.apartmentId === prop.id);
      return {
        ...prop,
        trueCost: costResult?.trueMonthlyCost,
        commuteMinutes: costResult?.commuteCost.durationMinutes,
        savingsRank: costResult?.savingsRank,
        locationCosts: costResult?.totalLocationCosts,
      };
    }).filter(prop => {
      if (prop.baseRent < filters.minBudget || prop.baseRent > filters.maxBudget) return false;
      if (filters.bedrooms.length > 0 && !filters.bedrooms.includes(prop.bedrooms)) return false;
      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'trueCost':
          return (a.trueCost ?? a.baseRent) - (b.trueCost ?? b.baseRent);
        case 'baseRent':
          return a.baseRent - b.baseRent;
        case 'commute':
          return (a.commuteMinutes ?? 999) - (b.commuteMinutes ?? 999);
        default:
          return 0;
      }
    });
  }, [results, filters, sortBy, calculationProperties]);

  const mapProperties = useMemo(() => {
    return propertiesWithCosts.map(p => ({
      id: p.id,
      name: p.name,
      address: p.address,
      coordinates: p.coordinates,
      baseRent: p.baseRent,
      trueCost: p.trueCost,
      commuteMinutes: p.commuteMinutes,
      parkingIncluded: p.parkingIncluded,
    }));
  }, [propertiesWithCosts]);

  const bestDeal = useMemo(() => {
    return propertiesWithCosts.find(p => p.savingsRank === 1);
  }, [propertiesWithCosts]);

  const potentialSavings = useMemo(() => {
    if (results.length < 2) return 0;
    const trueCosts = results.map(r => r.trueMonthlyCost);
    return Math.max(...trueCosts) - Math.min(...trueCosts);
  }, [results]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-foreground" data-testid="renter-dashboard-title">
            Renter Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Apartment search, true-cost comparisons, and negotiation insights.
          </p>
        </div>
        {dataError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            Failed to load live data: {dataError}
          </div>
        )}
        <MarketIntelBar
          location="Orlando, FL"
          medianRent={marketData.medianRent}
          rentChange={marketData.rentChange}
          daysOnMarket={marketData.daysOnMarket}
          inventoryLevel={marketData.inventoryLevel}
          leverageScore={marketData.leverageScore}
          aiRecommendation={marketData.aiRecommendation}
          className="mb-4"
        />

        <div className="flex flex-col lg:flex-row gap-4">
          <aside className="w-full lg:w-80 shrink-0">
            <LeftPanelSidebar
              pois={pois}
              onAddPOI={handleAddPOI}
              onRemovePOI={handleRemovePOI}
              lifestyleInputs={lifestyleInputs}
              onLifestyleChange={setLifestyleInputs}
              filters={filters}
              onFiltersChange={setFilters}
              onCalculate={handleCalculate}
              isCalculating={isCalculating}
            />
          </aside>

          <main className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
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
                  {propertiesWithCosts.length} properties
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortField)}>
                  <SelectTrigger className="w-[140px] h-8" data-testid="select-sort-by">
                    <ArrowUpDown className="w-3 h-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trueCost">True Cost</SelectItem>
                    <SelectItem value="baseRent">Base Rent</SelectItem>
                    <SelectItem value="commute">Commute Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {viewMode === 'map' ? (
              <InteractivePropertyMap
                properties={mapProperties}
                pois={pois}
                selectedPropertyId={selectedPropertyId}
                onPropertyClick={setSelectedPropertyId}
                onPropertyHover={setSelectedPropertyId}
                showConnections={true}
                className="h-[500px]"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {propertiesWithCosts.map((property) => (
                  <Card 
                    key={property.id}
                    className={`cursor-pointer transition-all hover-elevate ${selectedPropertyId === property.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedPropertyId(property.id)}
                    data-testid={`card-property-${property.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {property.name}
                            {property.savingsRank === 1 && (
                              <Badge variant="default" className="bg-green-500">
                                <Star className="w-3 h-3 mr-1" />
                                Best Deal
                              </Badge>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">{property.address}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Base Rent</p>
                          <p className="font-medium">{formatCurrency(property.baseRent)}</p>
                        </div>
                        
                        {property.trueCost && (
                          <div className="border-l pl-4">
                            <p className="text-xs text-muted-foreground">True Cost</p>
                            <p className="font-bold text-primary text-lg">{formatCurrency(property.trueCost)}</p>
                          </div>
                        )}

                        {property.locationCosts && property.locationCosts > 0 && (
                          <div className="border-l pl-4">
                            <p className="text-xs text-muted-foreground">Location Costs</p>
                            <p className="text-sm text-orange-500">+{formatCurrency(property.locationCosts)}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline">{property.bedrooms} bd / {property.bathrooms} ba</Badge>
                        {property.commuteMinutes && (
                          <Badge variant="secondary">{property.commuteMinutes} min commute</Badge>
                        )}
                        {property.parkingIncluded && (
                          <Badge variant="outline">P incl.</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {results.length > 0 && (
              <Card data-testid="cost-comparison-table">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-green-500" />
                      Cost Comparison
                    </CardTitle>
                    {potentialSavings > 0 && (
                      <Badge variant="default" className="bg-green-500">
                        Save up to {formatCurrency(potentialSavings)}/mo!
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead className="text-right">Rent</TableHead>
                        <TableHead className="text-right">Location Costs</TableHead>
                        <TableHead className="text-right">True Cost</TableHead>
                        <TableHead className="text-right">Commute</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {propertiesWithCosts.map((property) => (
                        <TableRow 
                          key={property.id}
                          className={`cursor-pointer ${property.savingsRank === 1 ? 'bg-green-500/10' : ''}`}
                          onClick={() => setSelectedPropertyId(property.id)}
                          data-testid={`row-property-${property.id}`}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {property.savingsRank === 1 && <Star className="w-4 h-4 text-green-500" />}
                              {property.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(property.baseRent)}</TableCell>
                          <TableCell className="text-right text-orange-500">
                            {property.locationCosts ? `+${formatCurrency(property.locationCosts)}` : '-'}
                          </TableCell>
                          <TableCell className="text-right font-bold text-primary">
                            {property.trueCost ? formatCurrency(property.trueCost) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {property.commuteMinutes ? `${property.commuteMinutes} min` : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
