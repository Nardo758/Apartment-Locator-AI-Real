import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Eye, Star, MapPin, Car, Clock, Check, TrendingUp, Filter, ArrowUpDown, AlertTriangle, Target, DollarSign, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { PricingEngine, type ApartmentIQData } from '@/lib/pricing-engine';
import { usePricingIntelligence } from '@/hooks/usePricingIntelligence';

interface Apartment {
  id: string;
  name: string;
  address: string;
  price: number;
  aiMatchScore: number;
  image: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  amenities: string[];
  poiDistances: { [key: string]: { distance: string; driveTime: number } };
  available: boolean;
  listingAge: number; // days
  saved: boolean;
  isTopPick?: boolean;
  budgetMatch?: boolean;
  amenityMatch?: boolean;
  lifestyleMatch?: boolean;
  locationScore?: number;
  combinedScore?: number;
  savings?: number; // monthly savings compared to market average
  walkScore?: number;
  transitScore?: number;
  bikeScore?: number;
  yearBuilt?: number;
  petPolicy?: string;
  parking?: string;
  utilities?: string[];
  marketAverage?: number; // market average rent for comparison
  apartmentIQData: ApartmentIQData; // Complete ApartmentIQ data structure
}

interface ApartmentResultsProps {
  apartments?: Apartment[];
  pointsOfInterest: any[];
}

const ApartmentResults: React.FC<ApartmentResultsProps> = ({ 
  apartments = [], 
  pointsOfInterest = [] 
}) => {
  const [sortBy, setSortBy] = useState('aiScore');
  const [filterBy, setFilterBy] = useState('all');
  const [savedApartments, setSavedApartments] = useState<Set<string>>(new Set());
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);

  // Enhanced mock apartment data with comprehensive ApartmentIQ integration
  const mockApartments: Apartment[] = [
    {
      id: '1',
      name: 'Portiva Unit A218',
      address: '123 Downtown Ave, Austin, TX 78701',
      price: 1200,
      aiMatchScore: 95,
      image: '/placeholder-apartment.jpg',
      bedrooms: 1,
      bathrooms: 1,
      sqft: 750,
      amenities: ['Pool', 'Gym', 'Parking', 'Pet-Friendly'],
      poiDistances: {
        'work': { distance: '0.8 mi', driveTime: 5 },
        'gym': { distance: '0.3 mi', driveTime: 2 }
      },
      available: true,
      listingAge: 2,
      saved: false,
      isTopPick: true,
      budgetMatch: true,
      amenityMatch: true,
      lifestyleMatch: true,
      locationScore: 92,
      combinedScore: 95,
      savings: 284,
      marketAverage: 2484,
      walkScore: 95,
      transitScore: 88,
      bikeScore: 92,
      yearBuilt: 2019,
      petPolicy: 'Dogs & Cats Welcome',
      parking: 'Covered Garage',
      utilities: ['Water', 'Trash', 'Internet'],
      apartmentIQData: {
        unitId: 'portiva-a218',
        propertyName: 'Portiva',
        unitNumber: 'A218',
        address: '123 Downtown Ave, Austin, TX 78701',
        zipCode: '78701',
        currentRent: 1200,
        originalRent: 1200,
        effectiveRent: 1000,
        rentPerSqft: 1.60,
        bedrooms: 1,
        bathrooms: 1,
        sqft: 750,
        floor: 2,
        floorPlan: 'A2',
        daysOnMarket: 21,
        firstSeen: '2024-08-26',
        marketVelocity: 'stale' as const,
        concessionValue: 2400,
        concessionType: '2 months free on 12-month lease',
        concessionUrgency: 'aggressive' as const,
        rentTrend: 'stable' as const,
        rentChangePercent: 0,
        concessionTrend: 'increasing' as const,
        marketPosition: 'at_market' as const,
        percentileRank: 75,
        amenityScore: 85,
        locationScore: 92,
        managementScore: 78,
        leaseProbability: 0.65,
        negotiationPotential: 9,
        urgencyScore: 8,
        dataFreshness: '2024-09-16T10:00:00Z',
        confidenceScore: 0.95
      }
    },
    {
      id: '2',
      name: 'SkyLoft Unit C105',
      address: '456 River Road, Austin, TX 78704',
      price: 1500,
      aiMatchScore: 89,
      image: '/placeholder-apartment.jpg',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1000,
      amenities: ['Pool', 'Gym', 'Balcony', 'Laundry'],
      poiDistances: {
        'work': { distance: '1.2 mi', driveTime: 8 },
        'gym': { distance: '0.5 mi', driveTime: 3 }
      },
      available: true,
      listingAge: 5,
      saved: false,
      isTopPick: true,
      budgetMatch: true,
      amenityMatch: false,
      lifestyleMatch: true,
      locationScore: 85,
      combinedScore: 89,
      savings: 134,
      marketAverage: 2484,
      walkScore: 89,
      transitScore: 82,
      bikeScore: 85,
      yearBuilt: 2021,
      petPolicy: 'Cats Only',
      parking: 'Assigned Spot',
      utilities: ['Water', 'Trash'],
      apartmentIQData: {
        unitId: 'skyloft-c105',
        propertyName: 'SkyLoft',
        unitNumber: 'C105',
        address: '456 River Road, Austin, TX 78704',
        zipCode: '78704',
        currentRent: 1500,
        originalRent: 1500,
        effectiveRent: 1250,
        rentPerSqft: 1.50,
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1000,
        floor: 10,
        floorPlan: 'C1',
        daysOnMarket: 8,
        firstSeen: '2024-09-08',
        marketVelocity: 'normal' as const,
        concessionValue: 4500,
        concessionType: '3 months free on 15-month lease',
        concessionUrgency: 'standard' as const,
        rentTrend: 'increasing' as const,
        rentChangePercent: 2.5,
        concessionTrend: 'none' as const,
        marketPosition: 'below_market' as const,
        percentileRank: 25,
        amenityScore: 95,
        locationScore: 88,
        managementScore: 92,
        leaseProbability: 0.85,
        negotiationPotential: 7,
        urgencyScore: 4,
        dataFreshness: '2024-09-16T10:00:00Z',
        confidenceScore: 0.92
      }
    },
    {
      id: '3',
      name: 'Tech District Unit 2314',
      address: '789 Innovation Blvd, Austin, TX 78702',
      price: 1800,
      aiMatchScore: 87,
      image: '/placeholder-apartment.jpg',
      bedrooms: 1,
      bathrooms: 1,
      sqft: 680,
      amenities: ['Gym', 'Parking', 'Pet-Friendly', 'WiFi'],
      poiDistances: {
        'work': { distance: '0.5 mi', driveTime: 3 },
        'gym': { distance: '0.7 mi', driveTime: 4 }
      },
      available: true,
      listingAge: 1,
      saved: false,
      isTopPick: false,
      budgetMatch: true,
      amenityMatch: true,
      lifestyleMatch: false,
      locationScore: 88,
      combinedScore: 87,
      savings: 534,
      marketAverage: 2484,
      walkScore: 92,
      transitScore: 95,
      bikeScore: 88,
      yearBuilt: 2020,
      petPolicy: 'No Pets',
      parking: 'Street Parking',
      utilities: ['Internet'],
      apartmentIQData: {
        unitId: 'tech-2314',
        propertyName: 'Tech District',
        unitNumber: '2314',
        address: '789 Innovation Blvd, Austin, TX 78702',
        zipCode: '78702',
        currentRent: 1800,
        originalRent: 1800,
        effectiveRent: 1650,
        rentPerSqft: 2.65,
        bedrooms: 1,
        bathrooms: 1,
        sqft: 680,
        floor: 23,
        floorPlan: 'B1',
        daysOnMarket: 3,
        firstSeen: '2024-09-13',
        marketVelocity: 'hot' as const,
        concessionValue: 1800,
        concessionType: '1 month free on 12-month lease',
        concessionUrgency: 'none' as const,
        rentTrend: 'increasing' as const,
        rentChangePercent: 5.2,
        concessionTrend: 'none' as const,
        marketPosition: 'above_market' as const,
        percentileRank: 90,
        amenityScore: 75,
        locationScore: 95,
        managementScore: 88,
        leaseProbability: 0.92,
        negotiationPotential: 3,
        urgencyScore: 2,
        dataFreshness: '2024-09-16T10:00:00Z',
        confidenceScore: 0.98
      }
    }
  ];

  // Use pricing intelligence hook
  const { recommendations, loading: pricingLoading } = usePricingIntelligence(
    mockApartments.map(apt => ({ id: apt.id, apartmentIQData: apt.apartmentIQData }))
  );

  const displayApartments = apartments.length > 0 ? apartments : mockApartments;

  const toggleSaved = (apartmentId: string) => {
    const newSaved = new Set(savedApartments);
    if (newSaved.has(apartmentId)) {
      newSaved.delete(apartmentId);
    } else {
      newSaved.add(apartmentId);
    }
    setSavedApartments(newSaved);
  };

  const sortedApartments = [...displayApartments].sort((a, b) => {
    // Always prioritize AI Top Picks first
    if (a.isTopPick && !b.isTopPick) return -1;
    if (!a.isTopPick && b.isTopPick) return 1;
    
    // Then sort by selected criteria
    switch (sortBy) {
      case 'aiScore':
        return (b.combinedScore || b.aiMatchScore) - (a.combinedScore || a.aiMatchScore);
      case 'price':
        return a.price - b.price;
      case 'newest':
        return a.listingAge - b.listingAge;
      default:
        return 0;
    }
  });

  const filteredApartments = sortedApartments.filter(apartment => {
    switch (filterBy) {
      case 'topPicks':
        return apartment.isTopPick;
      case 'budgetMatch':
        return apartment.budgetMatch;
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Apartment Results</h2>
          <p className="text-sm text-muted-foreground">{filteredApartments.length} properties found</p>
        </div>
        <div className="flex gap-3">
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="topPicks">AI Top Picks</SelectItem>
              <SelectItem value="budgetMatch">Budget Match</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="aiScore">AI Score</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Property Results */}
      <div className="space-y-4 w-full">
        {filteredApartments.length === 0 ? (
          <Card className="bg-slate-800/30 border border-slate-700/30">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No apartments found</h3>
              <p className="text-muted-foreground mb-4">
                {filterBy === 'topPicks' 
                  ? 'No top picks match your current criteria. Try adjusting your filters.'
                  : filterBy === 'budgetMatch'
                  ? 'No apartments match your budget criteria. Try expanding your search.'
                  : 'No apartments match your current search criteria.'
                }
              </p>
              <Button 
                variant="outline" 
                onClick={() => setFilterBy('all')}
                className="bg-slate-700/30 border-slate-600/50"
              >
                Show All Results
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredApartments.map((apartment) => (
          <Card 
            key={apartment.id}
            className={`w-full max-w-md bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 rounded-2xl overflow-hidden group ${
              apartment.isTopPick ? 'border-green-500/30' : ''
            }`}
            onMouseEnter={() => setHoveredProperty(apartment.id)}
            onMouseLeave={() => setHoveredProperty(null)}
          >
            <CardContent className="p-4 relative">
              {/* Header with Property Info and Match Score */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
                    <div className="text-lg">🏢</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{apartment.name}</h3>
                    <p className="text-sm text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-400" />
                      {apartment.address}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {apartment.isTopPick && (
                    <Badge className="bg-yellow-500 text-yellow-900 px-2 py-1 text-xs font-bold">
                      ⭐ AI TOP PICK
                    </Badge>
                  )}
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-sm font-bold text-white">{apartment.combinedScore}%</div>
                      <div className="text-xs text-white">Match</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Section with Purple Gradient */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-purple-200 line-through mb-1">
                      ${apartment.apartmentIQData.originalRent.toLocaleString()}
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      ${apartment.apartmentIQData.effectiveRent.toLocaleString()}/mo
                    </div>
                    <div className="text-sm text-purple-200">
                      {apartment.apartmentIQData.concessionType}
                    </div>
                  </div>
                  <div className="text-right text-sm text-purple-200">
                    <div>Days on Market: {apartment.apartmentIQData.daysOnMarket}</div>
                    <div>{apartment.bedrooms}bd/{apartment.bathrooms}ba {apartment.sqft} sqft</div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700/30">
                  <div className="text-lg font-bold text-green-400">{apartment.aiMatchScore}%</div>
                  <div className="text-xs text-slate-400 uppercase">AI Score</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700/30">
                  <div className="text-lg font-bold text-blue-400">{apartment.locationScore}%</div>
                  <div className="text-xs text-slate-400 uppercase">Location</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700/30">
                  <div className="text-lg font-bold text-yellow-400">{apartment.sqft}</div>
                  <div className="text-xs text-slate-400 uppercase">Sq Ft</div>
                </div>
              </div>

              {/* Monthly Savings Analysis */}
              <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 border border-green-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-green-400">Monthly Savings Analysis</span>
                  </div>
                  <Badge className="bg-green-500 text-green-900 px-2 py-1 text-xs font-bold uppercase">
                    Aggressive Reduction
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-green-400">
                      $204/mo
                    </div>
                    <div className="text-xs text-green-300">AI Rent Reduction</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-400">
                      $200/mo
                    </div>
                    <div className="text-xs text-green-300">Concession Value</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-400">
                      $404/mo
                    </div>
                    <div className="text-xs text-green-300">Total Monthly Savings</div>
                  </div>
                </div>
                
                <div className="text-center mt-3 pt-3 border-t border-green-500/30">
                  <div className="text-2xl font-bold text-green-400">$4,848</div>
                  <div className="text-sm text-green-300">Annual Savings</div>
                </div>
              </div>

              {/* Landlord Loss Indicator */}
              <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-500 rounded-sm flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-orange-400">Landlord Loss Indicator</span>
                  </div>
                  <div className="text-xs text-orange-300">If unit stays vacant</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-orange-400">$1,320</div>
                    <div className="text-xs text-orange-300">30 Days</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-400">$2,640</div>
                    <div className="text-xs text-orange-300">60 Days</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-400">$3,960</div>
                    <div className="text-xs text-red-300">90 Days</div>
                  </div>
                </div>
              </div>

              {/* Commute Times */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Commute Times:</h4>
                <div className="flex gap-2">
                  <Badge className="bg-blue-600/20 border-blue-500/30 text-blue-300 px-3 py-1">
                    🏢 Work: 8min
                  </Badge>
                  <Badge className="bg-green-600/20 border-green-500/30 text-green-300 px-3 py-1">
                    🏃 Gym: 2min
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-300"
                  onClick={() => {
                    console.log('View details for:', apartment.id);
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button 
                  variant="outline"
                  className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 text-slate-200 px-4 py-3 rounded-lg transition-all duration-300"
                  onClick={() => toggleSaved(apartment.id)}
                >
                  <div className="flex items-center gap-2">
                    <Heart className={`w-4 h-4 ${savedApartments.has(apartment.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    Save
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
        )}
      </div>
    </div>
  );
};

export default ApartmentResults;