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
            className={`w-full max-w-none bg-slate-900/40 backdrop-blur-md border-0 hover:bg-slate-800/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 rounded-3xl overflow-hidden group ${
              apartment.isTopPick ? 'bg-gradient-to-br from-green-500/10 via-slate-900/40 to-purple-500/10' : ''
            }`}
            onMouseEnter={() => setHoveredProperty(apartment.id)}
            onMouseLeave={() => setHoveredProperty(null)}
          >
            <CardContent className="p-0 relative">
              {/* Floating AI TOP PICK Badge */}
              {apartment.isTopPick && (
                <div className="absolute top-4 right-4 z-20">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-green-500/30 flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    AI TOP PICK
                  </div>
                </div>
              )}

              <div className="flex">
                {/* Left: Hero Image Section */}
                <div className="w-80 relative">
                  <div className="h-64 bg-gradient-to-br from-slate-600/50 via-slate-700/50 to-slate-800/50 relative overflow-hidden">
                    {/* Property Image Placeholder with Soft Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-slate-900/20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white/80">
                        <div className="text-4xl mb-2">🏢</div>
                        <div className="text-sm font-medium">Property View</div>
                      </div>
                    </div>
                    
                    {/* Floating Match Score Circle */}
                    <div className="absolute top-4 left-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5 shadow-xl shadow-blue-500/30">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-xl font-bold text-white">{apartment.combinedScore}</div>
                            <div className="text-xs text-blue-300">MATCH</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Photo Gallery Dots */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div 
                            key={i}
                            className="w-2 h-2 rounded-full bg-white/40 hover:bg-white/80 cursor-pointer transition-all duration-200"
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Content Flow */}
                <div className="flex-1 p-6 relative">
                  {/* Header Flow */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-1 leading-tight">{apartment.name}</h3>
                    <p className="text-slate-300 text-sm flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      {apartment.address}
                    </p>
                  </div>

                  {/* Hero Pricing Section with Gradient */}
                  <div className="mb-6 relative">
                    <div className="bg-gradient-to-r from-green-500/20 via-emerald-500/15 to-teal-500/20 rounded-2xl p-5 border border-green-500/30 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-lg line-through text-slate-400">${apartment.apartmentIQData.originalRent.toLocaleString()}</span>
                            <span className="text-3xl font-bold text-white">${apartment.apartmentIQData.effectiveRent.toLocaleString()}</span>
                            <span className="text-slate-300">/mo</span>
                          </div>
                          <div className="text-green-400 font-medium text-sm">
                            {apartment.apartmentIQData.concessionType}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">${apartment.apartmentIQData.originalRent - apartment.apartmentIQData.effectiveRent}</div>
                          <div className="text-xs text-green-300">monthly savings</div>
                        </div>
                      </div>
                      
                      {/* Savings Visualization */}
                      <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min((apartment.apartmentIQData.originalRent - apartment.apartmentIQData.effectiveRent) / apartment.apartmentIQData.originalRent * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>Market Rate</span>
                        <span>{Math.round((apartment.apartmentIQData.originalRent - apartment.apartmentIQData.effectiveRent) / apartment.apartmentIQData.originalRent * 100)}% Savings</span>
                      </div>
                    </div>
                  </div>

                  {/* Flowing Stats Dashboard */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30 backdrop-blur-sm">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">{apartment.bedrooms}bd/{apartment.bathrooms}ba</div>
                        <div className="text-xs text-slate-400">{apartment.sqft} sqft</div>
                      </div>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30 backdrop-blur-sm">
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-400">{apartment.locationScore}%</div>
                        <div className="text-xs text-slate-400">Location</div>
                      </div>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30 backdrop-blur-sm">
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">{apartment.apartmentIQData.daysOnMarket}d</div>
                        <div className="text-xs text-slate-400">On Market</div>
                      </div>
                    </div>
                  </div>

                  {/* Modern Landlord Timeline */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      Landlord Loss Timeline
                    </h4>
                    <div className="relative">
                      {/* Timeline Line */}
                      <div className="absolute left-4 top-6 w-0.5 h-16 bg-gradient-to-b from-orange-400 via-red-400 to-red-600"></div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-orange-500/20 border-2 border-orange-400 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                          </div>
                          <div className="flex-1 bg-slate-800/20 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-300">30 days</span>
                              <span className="text-sm font-medium text-orange-400">-$2,350</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                          </div>
                          <div className="flex-1 bg-slate-800/20 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-300">90 days</span>
                              <span className="text-sm font-medium text-red-400">-$7,050</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Flowing Commute Badges */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                      <Car className="w-4 h-4 text-blue-400" />
                      Commute Times
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full px-4 py-2 border border-blue-500/30">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          <span className="text-sm text-blue-300">Work • 18 min</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-full px-4 py-2 border border-purple-500/30">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                          <span className="text-sm text-purple-300">Gym • 12 min</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-full px-4 py-2 border border-green-500/30">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                          <span className="text-sm text-green-300">Airport • 35 min</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modern Action Flow */}
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 group"
                      onClick={() => {
                        // Navigate to make offer page
                        console.log('Make offer for:', apartment.id);
                      }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <DollarSign className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Make Offer
                      </div>
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 text-slate-200 font-medium py-3 rounded-xl transition-all duration-300"
                      onClick={() => toggleSaved(apartment.id)}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Heart className={`w-5 h-5 ${savedApartments.has(apartment.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        {savedApartments.has(apartment.id) ? 'Saved' : 'Save'}
                      </div>
                    </Button>
                    <Button 
                      variant="outline"
                      className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 text-slate-200 px-4 py-3 rounded-xl transition-all duration-300"
                    >
                      <Eye className="w-5 h-5" />
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