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
            className={`w-full max-w-none bg-slate-900/95 backdrop-blur-sm border border-slate-600/50 hover:bg-slate-800/80 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/10 rounded-lg ${
              apartment.isTopPick ? 'ring-1 ring-green-500/30 bg-gradient-to-r from-green-500/5 to-transparent' : ''
            }`}
            onMouseEnter={() => setHoveredProperty(apartment.id)}
            onMouseLeave={() => setHoveredProperty(null)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Property Images Section - Scaled Down */}
                <div className="space-y-2">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center border border-slate-600/50">
                    <div className="text-center">
                      <div className="text-lg mb-0.5">🏢</div>
                      <div className="text-xs text-muted-foreground">Property</div>
                    </div>
                  </div>
                  
                  {/* Pictures Section - Compact */}
                  <div className="w-16">
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1">📸</h4>
                    <div className="grid grid-cols-3 gap-0.5">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div 
                          key={i}
                          className="w-4 h-4 rounded bg-slate-600/30 border border-slate-500/30 flex items-center justify-center cursor-pointer hover:bg-slate-600/50 transition-colors"
                        >
                          <div className="text-xs">📷</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 text-center">6 photos</div>
                  </div>
                </div>
                
                {/* Property Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">{apartment.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {apartment.address}
                      </p>
                    </div>
                    
                    {/* Top Pick Badge */}
                    {apartment.isTopPick && (
                      <Badge className="bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/50 text-green-400 text-sm font-semibold">
                        ⭐ AI TOP PICK
                      </Badge>
                    )}
                  </div>

                  {/* Price and Score Row - Compact */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <div className="text-xs line-through text-slate-400">${apartment.apartmentIQData.originalRent.toLocaleString()}</div>
                        <div className="text-lg font-bold text-green-400">${apartment.apartmentIQData.effectiveRent.toLocaleString()}/mo</div>
                      </div>
                      <div className="text-xs font-medium text-green-400">
                        {apartment.apartmentIQData.concessionType}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={`text-xs font-semibold ${
                        apartment.combinedScore >= 90 ? 'border-green-500/50 text-green-400 bg-green-500/10' :
                        apartment.combinedScore >= 80 ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' :
                        apartment.combinedScore >= 70 ? 'border-orange-500/50 text-orange-400 bg-orange-500/10' :
                        'border-red-500/50 text-red-400 bg-red-500/10'
                      }`}>
                        {apartment.combinedScore}% Match
                      </Badge>
                    </div>
                  </div>

                  {/* Property Stats Grid - Compact */}
                  <div className="grid grid-cols-4 gap-2 mb-3 text-center">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{apartment.aiMatchScore}%</div>
                      <div className="text-xs text-muted-foreground">AI Score</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{apartment.locationScore}%</div>
                      <div className="text-xs text-muted-foreground">Location</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-blue-400">{apartment.bedrooms}bd/{apartment.bathrooms}ba</div>
                      <div className="text-xs text-muted-foreground">{apartment.sqft} sqft</div>
                    </div>
                    <div>
                      <Badge variant="outline" className={`text-xs font-semibold ${
                        apartment.apartmentIQData.marketVelocity === 'hot' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        apartment.apartmentIQData.marketVelocity === 'normal' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}>
                        Days on Market {apartment.apartmentIQData.daysOnMarket}D
                      </Badge>
                    </div>
                  </div>

                  {/* Combined AI Pricing & Concession Analysis */}
                  {recommendations[apartment.id] && (
                    <div className="bg-slate-800/50 rounded-lg p-3 mb-4 border border-slate-600/30">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-green-400">💰 Monthly Savings Analysis</span>
                        <Badge variant="outline" className={`text-xs ${getUrgencyColor(recommendations[apartment.id].urgencyLevel)} border`}>
                          {recommendations[apartment.id].urgencyLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
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
                            <span className={`font-semibold ${getStrategyColor(recommendations[apartment.id].strategy)}`}>
                              {recommendations[apartment.id].strategy.replace('_', ' ')}
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
                    </div>
                  )}

                  {/* Landlord Loss Analysis */}
                  {recommendations[apartment.id] && (
                    <div className="bg-slate-800/50 rounded-lg p-3 mb-4 border border-slate-600/30">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-orange-400">📉 Landlord Loss Indicator</span>
                        <span className="text-xs text-muted-foreground">If unit stays vacant</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center bg-slate-700/30 rounded p-2">
                          <div className="font-semibold text-red-400">
                            ${Math.round(apartment.apartmentIQData.originalRent * 1.1).toLocaleString()}
                          </div>
                          <div className="text-muted-foreground">30 Days</div>
                        </div>
                        <div className="text-center bg-slate-700/30 rounded p-2">
                          <div className="font-semibold text-red-400">
                            ${Math.round(apartment.apartmentIQData.originalRent * 2.2).toLocaleString()}
                          </div>
                          <div className="text-muted-foreground">60 Days</div>
                        </div>
                        <div className="text-center bg-slate-700/30 rounded p-2">
                          <div className="font-semibold text-red-400">
                            ${Math.round(apartment.apartmentIQData.originalRent * 3.3).toLocaleString()}
                          </div>
                          <div className="text-muted-foreground">90 Days</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* POI Distance Times */}
                  {Object.keys(apartment.poiDistances).length > 0 && (
                    <div className="bg-slate-800/50 rounded-lg p-3 mb-4 border border-slate-600/30">
                      <div className="text-xs text-muted-foreground mb-2 font-medium">Commute Times:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(apartment.poiDistances).slice(0, 4).map(([key, poi]) => (
                          <div key={key} className="flex justify-between text-xs bg-slate-700/50 rounded p-2">
                            <span className="text-muted-foreground truncate flex-1 capitalize">{key}:</span>
                            <Badge variant="outline" className={`ml-2 text-xs ${
                              poi.driveTime <= 10 ? 'border-green-500/50 text-green-400' :
                              poi.driveTime <= 20 ? 'border-yellow-500/50 text-yellow-400' : 
                              'border-red-500/50 text-red-400'
                            }`}>
                              {poi.driveTime}min
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => toggleSaved(apartment.id)}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${savedApartments.has(apartment.id) ? 'fill-current text-red-400' : ''}`} />
                      {savedApartments.has(apartment.id) ? 'Saved' : 'Save'}
                    </Button>
                  </div>
                </div>
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