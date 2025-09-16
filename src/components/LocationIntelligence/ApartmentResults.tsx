import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Eye, Star, MapPin, Car, Clock, Check, TrendingUp, Filter, ArrowUpDown, AlertTriangle, Target, DollarSign, Calendar } from 'lucide-react';
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-500/20 border-green-500/30';
    if (score >= 80) return 'bg-yellow-500/20 border-yellow-500/30';
    if (score >= 70) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'soon': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'moderate': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'aggressive_reduction': return 'text-red-400';
      case 'moderate_reduction': return 'text-orange-400';
      case 'hold': return 'text-blue-400';
      case 'increase': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

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
            className={`w-full max-w-none bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/40 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 ${
              apartment.isTopPick ? 'ring-1 ring-green-500/30 bg-gradient-to-r from-green-500/5 to-transparent' : ''
            }`}
            onMouseEnter={() => setHoveredProperty(apartment.id)}
            onMouseLeave={() => setHoveredProperty(null)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-6">
                  {/* Property Image */}
                  <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center border border-slate-600/50">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🏢</div>
                      <div className="text-xs text-muted-foreground">Property</div>
                      <div className="text-xs text-muted-foreground">Image</div>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-1">{apartment.name}</h3>
                        <p className="text-muted-foreground mb-3 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {apartment.address}
                        </p>
                        
                        {/* Enhanced ApartmentIQ Pricing with Recommendations */}
                        <div className="mb-4">
                          <div className="flex items-baseline gap-3 mb-2">
                            <div className="text-lg line-through text-slate-400">${apartment.apartmentIQData.originalRent.toLocaleString()}/mo</div>
                            <div className="text-2xl font-bold text-green-400">${apartment.apartmentIQData.effectiveRent.toLocaleString()}/mo</div>
                            {recommendations[apartment.id] && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">→ Rec: </span>
                                <span className={`font-bold ${getStrategyColor(recommendations[apartment.id].strategy)}`}>
                                  ${recommendations[apartment.id].suggestedRent.toLocaleString()}/mo
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-sm font-semibold text-green-400 mb-2">
                            {apartment.apartmentIQData.concessionType}
                          </div>
                          
                          {/* Combined AI Pricing & Concession Analysis */}
                          {recommendations[apartment.id] && (
                            <div className="text-xs text-muted-foreground bg-slate-700/30 rounded p-3 space-y-2 mb-3">
                              <div className="flex justify-between font-semibold text-green-400 border-b border-slate-600/30 pb-1 mb-2">
                                <span>💰 Monthly Savings Analysis</span>
                                <span className={`${getUrgencyColor(recommendations[apartment.id].urgencyLevel)} px-2 py-1 rounded text-xs border`}>
                                  {recommendations[apartment.id].urgencyLevel.toUpperCase()}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span>AI Rent Reduction:</span>
                                    <span className="font-semibold text-green-400">
                                      ${Math.abs(recommendations[apartment.id].adjustmentAmount).toLocaleString()}/mo
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Concession Value:</span>
                                    <span className="font-semibold text-green-400">
                                      ${Math.round(apartment.apartmentIQData.concessionValue / 12).toLocaleString()}/mo
                                    </span>
                                  </div>
                                  <div className="flex justify-between border-t border-slate-600/30 pt-1 font-bold text-green-300">
                                    <span>Total Monthly Savings:</span>
                                    <span>
                                      ${(Math.abs(recommendations[apartment.id].adjustmentAmount) + Math.round(apartment.apartmentIQData.concessionValue / 12)).toLocaleString()}/mo
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span>Strategy:</span>
                                    <span className={`font-semibold capitalize ${getStrategyColor(recommendations[apartment.id].strategy)}`}>
                                      {recommendations[apartment.id].strategy.replace('_', ' ')}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Days on Market:</span>
                                    <span className="font-semibold text-orange-400">
                                      {apartment.apartmentIQData.daysOnMarket} days
                                    </span>
                                  </div>
                                  <div className="flex justify-between border-t border-slate-600/30 pt-1 font-bold text-green-300">
                                    <span>Annual Savings:</span>
                                    <span>
                                      ${((Math.abs(recommendations[apartment.id].adjustmentAmount) + Math.round(apartment.apartmentIQData.concessionValue / 12)) * 12).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* AI Reasoning */}
                              {recommendations[apartment.id].reasoning.length > 0 && (
                                <div className="border-t border-slate-600/30 pt-2 mt-2">
                                  <div className="text-xs font-semibold text-purple-400 mb-1">🧠 AI Reasoning</div>
                                  <div className="text-xs text-slate-300">
                                    {recommendations[apartment.id].reasoning.slice(0, 2).join(' • ')}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Landlord Revenue Impact Analysis */}
                          {recommendations[apartment.id] && (
                            <div className="text-xs text-muted-foreground bg-red-900/20 border border-red-500/30 rounded p-3 space-y-2 mb-3">
                              <div className="flex justify-between font-semibold text-red-400 border-b border-red-500/30 pb-1 mb-2">
                                <span>📉 Landlord Loss Analysis</span>
                                <span className="text-xs text-red-300">If unit stays empty</span>
                              </div>
                              <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="space-y-1 bg-red-900/30 rounded p-2">
                                  <div className="text-red-300 font-semibold">30 Days</div>
                                  <div className="text-red-400 font-bold">
                                    ${apartment.apartmentIQData.currentRent.toLocaleString()}
                                  </div>
                                  <div className="text-xs text-red-300">Lost Revenue</div>
                                </div>
                                <div className="space-y-1 bg-red-900/30 rounded p-2">
                                  <div className="text-red-300 font-semibold">60 Days</div>
                                  <div className="text-red-400 font-bold">
                                    ${(apartment.apartmentIQData.currentRent * 2).toLocaleString()}
                                  </div>
                                  <div className="text-xs text-red-300">Lost Revenue</div>
                                </div>
                                <div className="space-y-1 bg-red-900/30 rounded p-2">
                                  <div className="text-red-300 font-semibold">90 Days</div>
                                  <div className="text-red-400 font-bold">
                                    ${(apartment.apartmentIQData.currentRent * 3).toLocaleString()}
                                  </div>
                                  <div className="text-xs text-red-300">Lost Revenue</div>
                                </div>
                              </div>
                              <div className="pt-2 border-t border-red-500/30 text-center">
                                <div className="text-red-300 text-xs">
                                  Total Impact: ${recommendations[apartment.id].revenueImpact.totalImpact.toLocaleString()} annual loss potential
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Enhanced Math Breakdown */}
                          <div className="text-xs text-muted-foreground bg-slate-700/30 rounded p-3 space-y-1">
                            <div className="flex justify-between font-semibold text-green-400 border-b border-slate-600/30 pb-1 mb-2">
                              <span>🎯 Concession Analysis:</span>
                              <span>{Math.round((apartment.apartmentIQData.concessionValue / apartment.apartmentIQData.originalRent) * 100)}% Value</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Base Rent:</span>
                              <span>${apartment.apartmentIQData.originalRent.toLocaleString()}/mo</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Effective Rent:</span>
                              <span>${apartment.apartmentIQData.effectiveRent.toLocaleString()}/mo</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Concession Value:</span>
                              <span className="text-green-400 font-semibold">${apartment.apartmentIQData.concessionValue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Monthly Savings:</span>
                              <span className="text-green-400 font-semibold">${apartment.apartmentIQData.originalRent - apartment.apartmentIQData.effectiveRent}/mo</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                          <span>{apartment.bedrooms}bd</span>
                          <span>{apartment.bathrooms}ba</span>
                          <span>{apartment.sqft} sqft</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {apartment.isTopPick && (
                          <Badge className="bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border-green-500/30 px-3 py-1">
                            <Star className="w-4 h-4 mr-1" />
                            AI TOP PICK
                          </Badge>
                        )}
                        {/* Market Velocity and Urgency Badges */}
                        <Badge className={`px-3 py-1 text-xs ${
                          apartment.apartmentIQData.marketVelocity === 'hot' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          apartment.apartmentIQData.marketVelocity === 'normal' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                          {apartment.apartmentIQData.marketVelocity.toUpperCase()} • {apartment.apartmentIQData.daysOnMarket}d
                        </Badge>
                        
                        {/* Pricing Strategy Badge */}
                        {recommendations[apartment.id] && (
                          <Badge className={`px-3 py-1 text-xs border ${getUrgencyColor(recommendations[apartment.id].urgencyLevel)}`}>
                            <Target className="w-3 h-3 mr-1" />
                            {recommendations[apartment.id].strategy.replace('_', ' ').toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced ApartmentIQ Scores & Pricing Intelligence */}
                <div className="text-right space-y-3">
                  <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl border ${getScoreBg(apartment.apartmentIQData.amenityScore)}`}>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">🧠 ApartmentIQ Score</div>
                      <div className={`text-3xl font-bold ${getScoreColor(apartment.apartmentIQData.amenityScore)}`}>
                        {apartment.apartmentIQData.amenityScore}
                      </div>
                      <div className="text-xs text-muted-foreground">/100</div>
                    </div>
                  </div>
                  
                  {/* Pricing Intelligence Summary */}
                  {recommendations[apartment.id] && (
                    <div className="bg-slate-700/30 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">💡 AI Strategy:</span>
                        <span className={`font-bold capitalize ${getStrategyColor(recommendations[apartment.id].strategy)}`}>
                          {recommendations[apartment.id].strategy.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">🎯 Price Target:</span>
                        <span className={`font-bold ${getStrategyColor(recommendations[apartment.id].strategy)}`}>
                          ${recommendations[apartment.id].suggestedRent.toLocaleString()}/mo
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">⏱️ Expected Lease:</span>
                        <span className="text-blue-400 font-bold">
                          {recommendations[apartment.id].expectedLeaseDays} days
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">📈 Revenue Impact:</span>
                        <span className={`font-bold ${recommendations[apartment.id].revenueImpact.totalImpact >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {recommendations[apartment.id].revenueImpact.totalImpact >= 0 ? '+' : ''}${recommendations[apartment.id].revenueImpact.totalImpact.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Market Intelligence */}
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Negotiation Potential:</span>
                      <span className={`font-semibold ${getScoreColor(apartment.apartmentIQData.negotiationPotential * 10)}`}>
                        {apartment.apartmentIQData.negotiationPotential}/10
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Market Position:</span>
                      <span className={`font-semibold capitalize ${
                        apartment.apartmentIQData.marketPosition === 'below_market' ? 'text-green-400' :
                        apartment.apartmentIQData.marketPosition === 'at_market' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {apartment.apartmentIQData.marketPosition.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lease Probability:</span>
                      <span className={`font-semibold ${getScoreColor(apartment.apartmentIQData.leaseProbability * 100)}`}>
                        {Math.round(apartment.apartmentIQData.leaseProbability * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleSaved(apartment.id)}
                      className={`w-8 h-8 p-0 transition-all duration-200 ${
                        savedApartments.has(apartment.id)
                          ? 'bg-red-500/20 border-red-500/30 text-red-400'
                          : 'bg-slate-700/30 border-slate-600/50 text-slate-400 hover:text-red-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${savedApartments.has(apartment.id) ? 'fill-current' : ''}`} />
                    </Button>
                    <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Preference Matches */}
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Check className={`w-5 h-5 ${apartment.budgetMatch ? 'text-green-400' : 'text-slate-500'}`} />
                  <span className={`text-sm font-medium ${apartment.budgetMatch ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Budget Match
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className={`w-5 h-5 ${apartment.amenityMatch ? 'text-green-400' : 'text-slate-500'}`} />
                  <span className={`text-sm font-medium ${apartment.amenityMatch ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Amenities Match
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className={`w-5 h-5 ${apartment.lifestyleMatch ? 'text-green-400' : 'text-slate-500'}`} />
                  <span className={`text-sm font-medium ${apartment.lifestyleMatch ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Lifestyle Match
                  </span>
                </div>
              </div>

              {/* POI Commute Times */}
              {pointsOfInterest.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Commute Times
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {pointsOfInterest.slice(0, 2).map((poi) => {
                      const distance = apartment.poiDistances[poi.category];
                      if (!distance) return null;
                      
                      const getTimeColor = (time: number) => {
                        if (time <= 10) return 'border-green-500/50 text-green-400 bg-green-500/10';
                        if (time <= 20) return 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10';
                        return 'border-red-500/50 text-red-400 bg-red-500/10';
                      };
                      
                      return (
                        <div key={poi.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                          <span className="text-sm text-muted-foreground truncate mr-2">{poi.name}</span>
                          <Badge 
                            variant="outline" 
                            className={getTimeColor(distance.driveTime)}
                          >
                            {distance.driveTime}min
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Additional Property Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Walkability Scores */}
                <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <h5 className="text-sm font-semibold text-foreground mb-2">Walkability</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Walk Score:</span>
                      <span className="font-medium text-foreground">{apartment.walkScore || 85}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transit:</span>
                      <span className="font-medium text-foreground">{apartment.transitScore || 78}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bike Score:</span>
                      <span className="font-medium text-foreground">{apartment.bikeScore || 82}/100</span>
                    </div>
                  </div>
                </div>

                {/* Property Info */}
                <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <h5 className="text-sm font-semibold text-foreground mb-2">Property Info</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Year Built:</span>
                      <span className="font-medium text-foreground">{apartment.yearBuilt || 2020}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pet Policy:</span>
                      <span className="font-medium text-foreground">{apartment.petPolicy || 'Contact for details'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Parking:</span>
                      <span className="font-medium text-foreground">{apartment.parking || 'Available'}</span>
                    </div>
                  </div>
                </div>

                {/* Utilities & Features */}
                <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <h5 className="text-sm font-semibold text-foreground mb-2">Included</h5>
                  <div className="space-y-1">
                    {apartment.utilities && apartment.utilities.length > 0 ? (
                      apartment.utilities.map((utility, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                          <span className="text-xs text-muted-foreground">{utility}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">Contact for details</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Score Breakdown on Hover */}
              {hoveredProperty === apartment.id && (
                <div className="mt-6 p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <h4 className="text-sm font-semibold text-foreground mb-4">Detailed Score Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Budget Match (25%)</span>
                      <div className="flex items-center gap-3">
                        <Progress value={apartment.budgetMatch ? 85 : 60} className="w-20 h-2" />
                        <span className="text-sm font-medium w-10 text-right">{apartment.budgetMatch ? '85' : '60'}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Location/Commute (35%)</span>
                      <div className="flex items-center gap-3">
                        <Progress value={apartment.locationScore || 75} className="w-20 h-2" />
                        <span className="text-sm font-medium w-10 text-right">{apartment.locationScore || 75}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Lifestyle (20%)</span>
                      <div className="flex items-center gap-3">
                        <Progress value={apartment.lifestyleMatch ? 80 : 65} className="w-20 h-2" />
                        <span className="text-sm font-medium w-10 text-right">{apartment.lifestyleMatch ? '80' : '65'}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Amenities (20%)</span>
                      <div className="flex items-center gap-3">
                        <Progress value={apartment.amenityMatch ? 90 : 70} className="w-20 h-2" />
                        <span className="text-sm font-medium w-10 text-right">{apartment.amenityMatch ? '90' : '70'}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="bg-slate-800/30 border-slate-700/30">
          Load More Results
        </Button>
      </div>
    </div>
  );
};

export default ApartmentResults;