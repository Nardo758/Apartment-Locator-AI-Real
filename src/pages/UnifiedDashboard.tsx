import { useState, useMemo, useCallback, useEffect } from 'react';
import { List, Map as MapIcon, ArrowUpDown, TrendingDown, Star, Home, Lock, Target, Car, ParkingCircle, ShoppingCart, Dumbbell, Train, DollarSign, ChevronDown, ChevronUp, Sparkles, Brain, Heart, Gift } from 'lucide-react';
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
import { SavingsDataGate } from '@/components/SavingsDataGate';
import { PaywallModal } from '@/components/PaywallModal';
import { usePaywall } from '@/hooks/usePaywall';
import { useLocationCostContext } from '@/contexts/LocationCostContext';
import { useUnifiedAI } from '@/contexts/UnifiedAIContext';
import { calculateApartmentCosts, formatCurrency } from '@/services/locationCostService';
import type { ApartmentLocationCost } from '@/types/locationCost.types';
import { api } from '@/lib/api';
import { calculateSmartScore, type SmartScoreResult } from '@/lib/smart-score-engine';
import type { ScrapedProperty, SavingsBreakdown } from '@/lib/savings-calculator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSavedScrapedProperties } from '@/hooks/useSavedScrapedProperties';

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
  sqft?: number;
  imageUrl?: string;
  amenities?: string[];
  specialOffers?: string;
  concessionType?: string;
  concessionValue?: number;
  effectivePrice?: number;
  daysOnMarket?: number;
}

const MOCK_PROPERTIES: PropertyData[] = [
  { id: 'apt-1', name: 'The Broadstone at Midtown', address: '1015 Northside Dr NW, Atlanta, GA 30318', coordinates: { lat: 33.7866, lng: -84.4073 }, baseRent: 1850, parkingIncluded: false, bedrooms: 2, bathrooms: 2, sqft: 1050, amenities: ['gym', 'pool', 'in_unit_laundry', 'water'], specialOffers: '2 weeks free', concessionType: 'weeks_free', concessionValue: 2 },
  { id: 'apt-2', name: 'Camden Buckhead Square', address: '3060 Peachtree Rd NW, Atlanta, GA 30305', coordinates: { lat: 33.8404, lng: -84.3797 }, baseRent: 1650, parkingIncluded: true, bedrooms: 1, bathrooms: 1, sqft: 720, amenities: ['gym', 'trash', 'sewer'], specialOffers: '1 month free', concessionType: 'months_free', concessionValue: 1 },
  { id: 'apt-3', name: 'The Exchange at Vinings', address: '2800 Paces Ferry Rd SE, Atlanta, GA 30339', coordinates: { lat: 33.8627, lng: -84.4655 }, baseRent: 1450, parkingIncluded: true, bedrooms: 2, bathrooms: 1, sqft: 950, amenities: ['washer_dryer', 'water', 'trash'] },
  { id: 'apt-4', name: 'Cortland at the Battery', address: '875 Battery Ave SE, Atlanta, GA 30339', coordinates: { lat: 33.8896, lng: -84.4685 }, baseRent: 1350, parkingIncluded: true, bedrooms: 1, bathrooms: 1, sqft: 680, amenities: ['gym', 'pool', 'internet', 'water', 'trash'], specialOffers: '6 weeks free', concessionType: 'weeks_free', concessionValue: 6 },
  { id: 'apt-5', name: 'AMLI West Plano at Granite Park', address: '2175 E West Connector, Austell, GA 30106', coordinates: { lat: 33.8148, lng: -84.6327 }, baseRent: 1275, parkingIncluded: true, bedrooms: 1, bathrooms: 1, sqft: 650, amenities: [], specialOffers: '$500 off', concessionType: 'dollar_amount', concessionValue: 500 },
];

const MOCK_MARKET_DATA = {
  medianRent: 1847,
  rentChange: 2.3,
  daysOnMarket: 24,
  inventoryLevel: 3.2,
  leverageScore: 72,
  aiRecommendation: "Market conditions favor renters. Good time to negotiate!",
};

type SortField = 'trueCost' | 'baseRent' | 'commute' | 'smartScore';
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

// ─── Concession Monthly Value Calculator ───
function calculateConcessionMonthly(property: PropertyData): number {
  // If we have a pre-calculated effective price, use it
  if (property.effectivePrice && property.effectivePrice < property.baseRent) {
    return property.baseRent - property.effectivePrice;
  }

  // If we have concession type + value, calculate
  if (property.concessionType && property.concessionValue) {
    const type = property.concessionType.toLowerCase();
    const value = property.concessionValue;
    const rent = property.baseRent;

    if (type.includes('weeks_free') || type.includes('weeks free')) {
      const annualRent = rent * 12;
      const fraction = value / 52;
      return Math.round((annualRent * fraction) / 12);
    }

    if (type.includes('months_free') || type.includes('months free') || type.includes('month_free')) {
      return Math.round((rent * value) / 12);
    }

    if (type.includes('dollar') || type.includes('flat')) {
      return Math.round(value / 12);
    }

    if (type.includes('percent')) {
      return Math.round(rent * (value / 100));
    }
  }

  // Try to parse from special_offers text
  if (property.specialOffers) {
    return parseSpecialOfferToMonthly(property.specialOffers, property.baseRent);
  }

  return 0;
}

function parseSpecialOfferToMonthly(offer: string, rent: number): number {
  const text = offer.toLowerCase();

  // "X weeks free"
  const weeksMatch = text.match(/(\d+)\s*weeks?\s*free/);
  if (weeksMatch) {
    const weeks = parseInt(weeksMatch[1], 10);
    return Math.round((rent * 12 * (weeks / 52)) / 12);
  }

  // "X months free"
  const monthsMatch = text.match(/(\d+)\s*months?\s*free/);
  if (monthsMatch) {
    const months = parseInt(monthsMatch[1], 10);
    return Math.round((rent * months) / 12);
  }

  // "$X off"
  const dollarMatch = text.match(/\$(\d[\d,]*)\s*off/);
  if (dollarMatch) {
    const amount = parseInt(dollarMatch[1].replace(/,/g, ''), 10);
    if (amount > 500) return Math.round(amount / 12);
    return amount;
  }

  // "X% off"
  const percentMatch = text.match(/(\d+)%\s*off/);
  if (percentMatch) {
    const pct = parseInt(percentMatch[1], 10);
    return Math.round((rent * pct / 100) / 12);
  }

  // Common offer phrases
  if (text.includes('look') && text.includes('lease')) return Math.round(500 / 12);
  if (text.includes('move') && text.includes('special')) return Math.round(300 / 12);
  if (text.includes('waiv')) return Math.round(250 / 12);

  return 0;
}

export default function UnifiedDashboard() {
  const { inputs, gasPrice, isCalculating, setIsCalculating } = useLocationCostContext();
  const unifiedAI = useUnifiedAI();
  const {
    isPaywallOpen,
    paywallPropertyId,
    openPaywall,
    closePaywall,
    unlockProperty,
    activatePlan,
    isPropertyUnlocked,
    userIsSubscribed,
  } = usePaywall();
  
  const { isSaved, toggleSaveDashboard } = useSavedScrapedProperties();

  useEffect(() => {
    document.title = 'Renter Dashboard | Apartment Locator AI';
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      setDataError(null);
      const defaultCity = 'Atlanta';
      const defaultState = 'GA';

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
                amenities: (Array.isArray(property.amenities) ? property.amenities : []) as string[],
                specialOffers: property.specialOffers || undefined,
                concessionType: property.concessionType || undefined,
                concessionValue: property.concessionValue || undefined,
                effectivePrice: property.effectivePrice || undefined,
                daysOnMarket: property.daysOnMarket || undefined,
              } as PropertyData;
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
  }, []);
  
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [sortBy, setSortBy] = useState<SortField>('trueCost');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [results, setResults] = useState<ApartmentLocationCost[]>([]);
  const [properties, setProperties] = useState<PropertyData[]>(MOCK_PROPERTIES);
  const [marketData, setMarketData] = useState(MOCK_MARKET_DATA);
  const [dataError, setDataError] = useState<string | null>(null);

  const propertyIds = useMemo(() => properties.map(p => p.id), [properties]);

  const [pois, setPois] = useState<POI[]>([
    { id: '1', name: 'My Office', address: '191 Peachtree St NE, Atlanta, GA', category: 'work', coordinates: { lat: 33.7590, lng: -84.3880 } },
  ]);
  
  const [lifestyleInputs, setLifestyleInputs] = useState<LifestyleInputs>({
    workAddress: '',
    commuteDays: 5,
    commuteMode: 'driving',
    vehicleMpg: 28,
    groceryTrips: 2,
    preferredStore: 'Any nearby store',
    hasGym: false,
    gymVisits: 3,
    customCategories: [],
  });
  
  const [currentRentalRate, setCurrentRentalRate] = useState('');
  const [preferredBedrooms, setPreferredBedrooms] = useState(1);
  const [preferredBathrooms, setPreferredBathrooms] = useState(1);
  const [preferredMinSqft, setPreferredMinSqft] = useState(0);

  const [filters, setFilters] = useState<{
    minBudget: number;
    maxBudget: number;
    bedrooms: number[];
    amenities: string[];
  }>({
    minBudget: 1000,
    maxBudget: 2500,
    bedrooms: [1, 2],
    amenities: [],
  });

  useEffect(() => {
    const cp = unifiedAI.commutePreferences;
    const aiPois = unifiedAI.pointsOfInterest;

    if (cp) {
      setLifestyleInputs(prev => ({
        ...prev,
        commuteDays: cp.daysPerWeek || prev.commuteDays,
        vehicleMpg: cp.vehicleMpg || prev.vehicleMpg,
      }));
    }

    if (unifiedAI.currentRentalRate) {
      setCurrentRentalRate(String(unifiedAI.currentRentalRate));
    }

    const aiPrefs = unifiedAI.aiPreferences;
    if (aiPrefs?.bedrooms) {
      setPreferredBedrooms(Number(aiPrefs.bedrooms) || 1);
    }
    if (aiPrefs?.bathrooms) {
      setPreferredBathrooms(Number(aiPrefs.bathrooms) || 1);
    }
    if (aiPrefs?.sqft?.min) {
      setPreferredMinSqft(aiPrefs.sqft.min);
    }

    if (unifiedAI.budget && unifiedAI.budget > 0) {
      setFilters(prev => ({
        ...prev,
        maxBudget: unifiedAI.budget,
      }));
    }

    if (aiPois && aiPois.length > 0) {
      const mappedPois: POI[] = aiPois.map(p => ({
        id: p.id,
        name: p.name,
        address: p.address,
        category: (p.category || 'other') as POICategory,
        coordinates: p.coordinates || { lat: 33.7490, lng: -84.3880 },
      }));
      setPois(mappedPois);

      const workPoi = aiPois.find(p => p.category === 'work');
      if (workPoi) {
        setLifestyleInputs(prev => ({
          ...prev,
          workAddress: workPoi.address,
        }));
      }
    }
  }, []);

  useEffect(() => {
    unifiedAI.updateInputs({
      commutePreferences: {
        ...unifiedAI.commutePreferences,
        daysPerWeek: lifestyleInputs.commuteDays,
        vehicleMpg: lifestyleInputs.vehicleMpg,
      },
    });
  }, [lifestyleInputs.commuteDays, lifestyleInputs.vehicleMpg]);

  useEffect(() => {
    unifiedAI.updateInputs({
      aiPreferences: {
        ...unifiedAI.aiPreferences,
        bedrooms: String(preferredBedrooms),
        bathrooms: String(preferredBathrooms),
        sqft: { ...unifiedAI.aiPreferences?.sqft, min: preferredMinSqft || undefined },
      },
    });
  }, [preferredBedrooms, preferredBathrooms, preferredMinSqft]);

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
    const aiPrefs = unifiedAI.aiPreferences;
    const aiBudget = unifiedAI.budget || 0;
    const aiMarket = unifiedAI.marketContext;
    const aiPoisList = unifiedAI.pointsOfInterest || [];
    const aiCommute = unifiedAI.commutePreferences;

    const mapped = calculationProperties.map(prop => {
      const costResult = results.find(r => r.apartmentId === prop.id);

      // Calculate concession value for this property
      const concessionMonthly = calculateConcessionMonthly(prop);
      const effectiveRent = prop.baseRent - concessionMonthly;

      const addressParts = prop.address.split(',').map(s => s.trim());
      const scrapedAdapter: ScrapedProperty = {
        id: prop.id,
        name: prop.name,
        address: prop.address,
        city: addressParts.length >= 2 ? addressParts[addressParts.length - 2] : '',
        state: addressParts.length >= 1 ? (addressParts[addressParts.length - 1].split(' ')[0] || '') : '',
        min_rent: prop.baseRent,
        max_rent: prop.baseRent,
        bedrooms_min: prop.bedrooms,
        bedrooms_max: prop.bedrooms,
        bathrooms_min: prop.bathrooms,
        bathrooms_max: prop.bathrooms,
        amenities: prop.amenities,
        latitude: prop.coordinates?.lat,
        longitude: prop.coordinates?.lng,
      };

      const medianRent = marketData?.medianRent || 1700;
      const savingsAdapter: SavingsBreakdown = {
        monthlyRent: prop.baseRent,
        marketMedianRent: medianRent,
        monthlySavings: Math.max(0, medianRent - effectiveRent),
        annualSavings: Math.max(0, (medianRent - effectiveRent) * 12),
        upfrontSavings: 0,
        monthlyConcessionsValue: concessionMonthly,
        dealScore: effectiveRent < medianRent
          ? Math.min(100, Math.round(((medianRent - effectiveRent) / medianRent) * 200))
          : 30,
        hasSpecialOffer: concessionMonthly > 0,
        specialOfferText: prop.specialOffers || '',
        savingsPercentage: medianRent > 0
          ? Math.round(((medianRent - effectiveRent) / medianRent) * 100)
          : 0,
      };

      const smartScore = calculateSmartScore(
        scrapedAdapter,
        savingsAdapter,
        aiPrefs,
        aiBudget,
        aiMarket,
        aiPoisList,
        aiCommute,
      );

      // True cost uses effective rent (base rent - concession) + location costs
      const locationCosts = costResult?.totalLocationCosts || 0;
      const trueCost = costResult
        ? effectiveRent + locationCosts
        : undefined;

      return {
        ...prop,
        concessionMonthly,
        effectiveRent,
        trueCost,
        commuteMinutes: costResult?.commuteCost.durationMinutes,
        savingsRank: costResult?.savingsRank,
        locationCosts,
        savingsVsMax: undefined as number | undefined,
        smartScore,
        costBreakdown: costResult ? {
          commute: costResult.commuteCost.totalMonthly,
          commuteMinutes: costResult.commuteCost.durationMinutes,
          commuteMiles: costResult.commuteCost.distanceMiles,
          parking: costResult.parkingCost.estimatedMonthly,
          parkingIncluded: costResult.parkingCost.parkingIncluded,
          grocery: costResult.groceryCost.additionalGasCost,
          groceryStore: costResult.groceryCost.nearestGroceryStore?.name,
          groceryMiles: costResult.groceryCost.distanceMiles,
          gym: costResult.gymCost.additionalGasCost,
          gymMiles: costResult.gymCost.distanceToPreferredGym,
          transitSavings: costResult.transitSavings.potentialMonthlySavings,
          transitScore: costResult.transitSavings.transitScore,
          amenitySavings: costResult.amenitySavings.totalMonthlyValue,
          amenityNames: costResult.amenitySavings.amenityNames,
          totalLocationCosts: costResult.totalLocationCosts,
        } : undefined,
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
        case 'smartScore':
          return (b.smartScore?.overall ?? -1) - (a.smartScore?.overall ?? -1);
        default:
          return 0;
      }
    });

    const filteredTrueCosts = mapped.filter(p => p.trueCost != null).map(p => p.trueCost!);
    const maxTrueCost = filteredTrueCosts.length > 0 ? Math.max(...filteredTrueCosts) : 0;
    mapped.forEach(p => {
      if (p.trueCost != null && maxTrueCost > 0) {
        p.savingsVsMax = maxTrueCost - p.trueCost;
      }
    });

    return mapped;
  }, [results, filters, sortBy, calculationProperties, unifiedAI.aiPreferences, unifiedAI.budget, unifiedAI.marketContext, unifiedAI.pointsOfInterest, unifiedAI.commutePreferences, marketData]);

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
          location="Atlanta, GA"
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
              currentRentalRate={currentRentalRate}
              onCurrentRentalRateChange={setCurrentRentalRate}
              preferredBedrooms={preferredBedrooms}
              onPreferredBedroomsChange={setPreferredBedrooms}
              preferredBathrooms={preferredBathrooms}
              onPreferredBathroomsChange={setPreferredBathrooms}
              preferredMinSqft={preferredMinSqft}
              onPreferredMinSqftChange={setPreferredMinSqft}
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
                    <SelectItem value="smartScore">Smart Score</SelectItem>
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
                className="h-[550px]"
              />
            ) : null}

            {(viewMode === 'list' || results.length > 0) && (
              <SavingsDataGate
                isUnlocked={true}
                onUnlockClick={() => openPaywall()}
                hint="Full cost comparison available"
              >
                <Card data-testid="cost-comparison-table">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-green-500" />
                        Cost Comparison
                      </CardTitle>
                      {(() => {
                        const avgTrueCost = marketData?.medianRent || 1847;
                        const bestTrueCost = Math.min(
                          ...propertiesWithCosts
                            .filter(p => p.trueCost != null)
                            .map(p => p.trueCost!)
                        );
                        const maxSavings = propertiesWithCosts.length > 0 ? avgTrueCost - bestTrueCost : 0;
                        if (maxSavings <= 0) return null;
                        return (
                          <Badge variant="default" className="bg-green-500 border-green-600">
                            Save up to {formatCurrency(maxSavings)}/mo vs market!
                          </Badge>
                        );
                      })()}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10"></TableHead>
                          <TableHead>Property</TableHead>
                          <TableHead className="text-center" data-testid="header-smart-score">Score</TableHead>
                          <TableHead className="text-right">Rent</TableHead>
                          <TableHead className="text-right">Concession</TableHead>
                          <TableHead className="text-right">Eff. Rent</TableHead>
                          <TableHead className="text-right">Loc. Cost</TableHead>
                          <TableHead className="text-right">True Cost</TableHead>
                          <TableHead className="text-right">vs Market</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {propertiesWithCosts.map((property) => {
                          const concession = property.concessionMonthly || 0;
                          const effRent = property.effectiveRent || property.baseRent;
                          const locCost = property.costBreakdown?.totalLocationCosts || 0;
                          const trueCost = property.trueCost || property.baseRent;
                          const avgTrueCost = marketData?.medianRent || 1847;
                          const vsMarket = avgTrueCost - trueCost;

                          return (
                          <TableRow
                            key={property.id}
                            className={`cursor-pointer transition-colors ${
                              property.savingsRank === 1
                                ? 'bg-green-500/10 border-l-2 border-l-green-500'
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => setSelectedPropertyId(property.id)}
                            data-testid={`row-property-${property.id}`}
                          >
                            <TableCell className="w-10">
                              <Button
                                size="icon"
                                variant="ghost"
                                data-testid={`button-save-property-${property.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSaveDashboard({
                                    id: property.id,
                                    name: property.name,
                                    address: property.address,
                                    baseRent: property.baseRent,
                                    bedrooms: property.bedrooms,
                                    bathrooms: property.bathrooms,
                                    sqft: property.sqft,
                                    imageUrl: property.imageUrl,
                                    amenities: property.amenities,
                                  });
                                }}
                              >
                                <Heart
                                  className={`w-4 h-4 ${isSaved(property.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
                                />
                              </Button>
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {property.savingsRank === 1 && (
                                  <Star className="w-4 h-4 text-green-500 shrink-0" />
                                )}
                                <div>
                                  <span className="text-sm">{property.name}</span>
                                  {property.specialOffers && (
                                    <p className="text-xs text-emerald-500 font-medium mt-0.5">
                                      {property.specialOffers}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {property.smartScore && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      data-testid={`badge-smart-score-${property.id}`}
                                      variant="outline"
                                      className={`cursor-default ${
                                        property.smartScore.overall >= 70
                                          ? 'border-green-500 text-green-600 bg-green-500/10'
                                          : property.smartScore.overall >= 40
                                          ? 'border-amber-500 text-amber-600 bg-amber-500/10'
                                          : 'border-red-400 text-red-500 bg-red-500/10'
                                      }`}
                                    >
                                      <Brain className="w-3 h-3 mr-1" />
                                      {property.smartScore.overall}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom" className="max-w-[220px]">
                                    <div className="space-y-1 text-xs">
                                      <div className="flex justify-between gap-3"><span>Location</span><span className="font-medium">{property.smartScore.locationScore}/100</span></div>
                                      <div className="flex justify-between gap-3"><span>Preferences</span><span className="font-medium">{property.smartScore.preferenceScore}/100</span></div>
                                      <div className="flex justify-between gap-3"><span>Market Intel</span><span className="font-medium">{property.smartScore.marketScore}/100</span></div>
                                      <div className="flex justify-between gap-3"><span>Value</span><span className="font-medium">{property.smartScore.valueScore}/100</span></div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {formatCurrency(property.baseRent)}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {concession > 0 ? (
                                <span className="text-emerald-500 font-medium">
                                  -{formatCurrency(concession)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">&mdash;</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium">
                              {concession > 0 ? (
                                <span>{formatCurrency(effRent)}</span>
                              ) : (
                                <span className="text-muted-foreground">{formatCurrency(effRent)}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              <span className={`font-medium ${
                                locCost <= 100 ? 'text-emerald-500' :
                                locCost <= 250 ? 'text-amber-500' :
                                'text-red-500'
                              }`}>
                                +{formatCurrency(locCost)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-base font-bold text-primary">
                                {formatCurrency(trueCost)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {vsMarket > 0 ? (
                                <span className="font-semibold text-green-600">
                                  Save {formatCurrency(vsMarket)}/mo
                                </span>
                              ) : vsMarket < 0 ? (
                                <span className="text-red-500">
                                  +{formatCurrency(Math.abs(vsMarket))}/mo
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">Market avg</span>
                              )}
                            </TableCell>
                          </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </SavingsDataGate>
            )}

            {selectedPropertyId && (() => {
              const selectedProp = propertiesWithCosts.find(p => p.id === selectedPropertyId);
              if (!selectedProp?.costBreakdown) return null;
              const bd = selectedProp.costBreakdown;
              const costItems = [
                { icon: Car, label: 'Commute', value: bd.commute, detail: bd.commuteMiles ? `${bd.commuteMiles.toFixed(1)} mi, ${Math.round(bd.commuteMinutes || 0)} min each way` : undefined, color: 'text-blue-600' },
                { icon: ParkingCircle, label: 'Parking', value: bd.parkingIncluded ? 0 : bd.parking, detail: bd.parkingIncluded ? 'Included in rent' : undefined, color: 'text-purple-600' },
                { icon: ShoppingCart, label: 'Grocery Trips', value: bd.grocery, detail: bd.groceryStore ? `${bd.groceryStore} (${bd.groceryMiles?.toFixed(1)} mi)` : undefined, color: 'text-amber-600' },
                { icon: Dumbbell, label: 'Gym Trips', value: bd.gym, detail: bd.gymMiles ? `${bd.gymMiles.toFixed(1)} mi away` : undefined, color: 'text-pink-600' },
              ];
              const totalExtras = bd.totalLocationCosts;

              return (
                <SavingsDataGate
                  isUnlocked={true}
                  onUnlockClick={() => openPaywall(selectedPropertyId)}
                  hint="Full cost breakdown"
                >
                  <Card data-testid="card-cost-breakdown">
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Cost Breakdown: {selectedProp.name}
                        </CardTitle>
                        {(() => {
                          const detailAvgTrueCost = marketData?.medianRent || 1847;
                          const detailVsMarket = detailAvgTrueCost - (selectedProp.trueCost || selectedProp.baseRent);
                          if (detailVsMarket <= 0) return null;
                          return (
                            <Badge variant="default" className="bg-green-500 border-green-600">
                              Save {formatCurrency(detailVsMarket)}/mo vs market
                            </Badge>
                          );
                        })()}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Base Rent</span>
                        </div>
                        <span className="text-sm font-semibold">{formatCurrency(selectedProp.baseRent)}</span>
                      </div>

                      {(selectedProp.concessionMonthly || 0) > 0 && (
                        <div className="flex items-center justify-between py-2 border-b border-dashed">
                          <div className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-emerald-500" />
                            <div>
                              <span className="text-sm font-medium text-emerald-600">Concession Discount</span>
                              <p className="text-xs text-muted-foreground">
                                {selectedProp.specialOffers || selectedProp.concessionType || 'Special offer'}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-emerald-500">
                            -{formatCurrency(selectedProp.concessionMonthly)}
                          </span>
                        </div>
                      )}

                      {(selectedProp.concessionMonthly || 0) > 0 && (
                        <div className="flex items-center justify-between py-1 bg-muted/30 px-2 rounded">
                          <span className="text-sm text-muted-foreground">Effective Rent</span>
                          <span className="text-sm font-semibold">{formatCurrency(selectedProp.effectiveRent || selectedProp.baseRent)}</span>
                        </div>
                      )}

                      {costItems.map((item) => (
                        <div key={item.label} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2">
                            <item.icon className={`w-4 h-4 ${item.color}`} />
                            <div>
                              <span className="text-sm">{item.label}</span>
                              {item.detail && (
                                <p className="text-xs text-muted-foreground">{item.detail}</p>
                              )}
                            </div>
                          </div>
                          <span className={`text-sm ${(item.value || 0) > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                            {(item.value || 0) > 0 ? `+${formatCurrency(item.value || 0)}` : 'Free'}
                          </span>
                        </div>
                      ))}

                      {bd.transitSavings > 0 && (
                        <div className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2">
                            <Train className="w-4 h-4 text-green-600" />
                            <div>
                              <span className="text-sm">Transit Savings</span>
                              <p className="text-xs text-muted-foreground">Transit score: {bd.transitScore}/100</p>
                            </div>
                          </div>
                          <span className="text-sm text-green-600">-{formatCurrency(bd.transitSavings)}</span>
                        </div>
                      )}

                      {bd.amenitySavings > 0 && (
                        <div className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            <div>
                              <span className="text-sm">Amenity Savings</span>
                              <p className="text-xs text-muted-foreground">
                                {bd.amenityNames && bd.amenityNames.length > 0
                                  ? bd.amenityNames.slice(0, 3).join(', ') + (bd.amenityNames.length > 3 ? ` +${bd.amenityNames.length - 3} more` : '')
                                  : 'Included amenities'}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm text-emerald-600">-{formatCurrency(bd.amenitySavings)}</span>
                        </div>
                      )}

                      <div className="border-t pt-3 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Location costs</span>
                          <span className="text-sm text-orange-500">+{formatCurrency(totalExtras)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-semibold">True Monthly Cost</span>
                          <span className="font-bold text-primary text-lg">{formatCurrency(selectedProp.trueCost || selectedProp.baseRent)}</span>
                        </div>
                        {(() => {
                          const annualAvgTrueCost = marketData?.medianRent || 1847;
                          const annualVsMarket = annualAvgTrueCost - (selectedProp.trueCost || selectedProp.baseRent);
                          if (annualVsMarket <= 0) return null;
                          return (
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm text-green-600 font-medium">Annual savings vs market</span>
                              <span className="text-sm font-bold text-green-600">{formatCurrency(annualVsMarket * 12)}/yr</span>
                            </div>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </SavingsDataGate>
              );
            })()}

          </main>
        </div>
      </div>

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={closePaywall}
        potentialSavings={potentialSavings * 12}
        propertiesCount={propertiesWithCosts.length}
        onPaymentSuccess={(planId?: string) => {
          if (planId === 'per_property' && paywallPropertyId) {
            unlockProperty(paywallPropertyId);
          } else if (planId && ['basic', 'pro', 'premium'].includes(planId)) {
            activatePlan(planId);
          } else if (paywallPropertyId) {
            unlockProperty(paywallPropertyId);
          }
          closePaywall();
        }}
        propertyId={paywallPropertyId}
      />
    </div>
  );
}
