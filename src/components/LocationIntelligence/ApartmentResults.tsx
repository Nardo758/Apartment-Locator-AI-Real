import React, { useState } from 'react';
import { Heart, MessageCircle, Eye, Star, MapPin, Car, Clock, Check, TrendingUp, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

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

  // Enhanced mock apartment data for demo with list view design elements
  const mockApartments: Apartment[] = [
    {
      id: '1',
      name: 'Austin Skyline Apartments',
      address: '123 Downtown Ave, Austin, TX 78701',
      price: 2200,
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
      utilities: ['Water', 'Trash', 'Internet']
    },
    {
      id: '2',
      name: 'Riverside Modern Living',
      address: '456 River Road, Austin, TX 78704',
      price: 2350,
      aiMatchScore: 89,
      image: '/placeholder-apartment.jpg',
      bedrooms: 1,
      bathrooms: 1,
      sqft: 820,
      amenities: ['Pool', 'Gym', 'Balcony', 'Laundry'],
      poiDistances: {
        'work': { distance: '1.2 mi', driveTime: 8 },
        'gym': { distance: '0.5 mi', driveTime: 3 }
      },
      available: true,
      listingAge: 5,
      saved: false,
      isTopPick: false,
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
      utilities: ['Water', 'Trash']
    },
    {
      id: '3',
      name: 'Tech District Studios',
      address: '789 Innovation Blvd, Austin, TX 78702',
      price: 1950,
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
      isTopPick: true,
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
      utilities: ['Internet']
    },
    {
      id: '4',
      name: 'Garden Heights Complex',
      address: '321 Garden St, Austin, TX 78703',
      price: 2450,
      aiMatchScore: 82,
      image: '/placeholder-apartment.jpg',
      bedrooms: 1,
      bathrooms: 1,
      sqft: 900,
      amenities: ['Pool', 'Parking', 'Balcony', 'Air Conditioning'],
      poiDistances: {
        'work': { distance: '1.8 mi', driveTime: 12 },
        'gym': { distance: '0.4 mi', driveTime: 2 }
      },
      available: true,
      listingAge: 7,
      saved: false,
      isTopPick: false,
      budgetMatch: false,
      amenityMatch: true,
      lifestyleMatch: true,
      locationScore: 78,
      combinedScore: 82,
      savings: 34,
      marketAverage: 2484,
      walkScore: 76,
      transitScore: 71,
      bikeScore: 80,
      yearBuilt: 2018,
      petPolicy: 'Dogs Welcome',
      parking: 'Valet Parking',
      utilities: ['Water', 'Trash', 'Internet', 'Cable']
    }
  ];

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
                    <div className="flex items-start gap-3 mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-1">{apartment.name}</h3>
                        <p className="text-muted-foreground mb-3 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {apartment.address}
                        </p>
                        <div className="text-2xl font-bold text-green-400 mb-2">${apartment.price.toLocaleString()}/mo</div>
                        {apartment.savings && apartment.savings > 0 && (
                          <div className="space-y-1 mb-2">
                            <div className="text-sm font-semibold text-green-400">
                              Save ${apartment.savings}/mo vs market avg
                            </div>
                            {apartment.marketAverage && (
                              <div className="text-xs text-muted-foreground bg-slate-700/30 rounded p-2">
                                <div className="flex justify-between">
                                  <span>Market Average:</span>
                                  <span>${apartment.marketAverage.toLocaleString()}/mo</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>This Property:</span>
                                  <span>${apartment.price.toLocaleString()}/mo</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-600/30 pt-1 mt-1 font-semibold text-green-400">
                                  <span>Your Savings:</span>
                                  <span>${apartment.savings}/mo</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                          <span>{apartment.bedrooms}bd</span>
                          <span>{apartment.bathrooms}ba</span>
                          <span>{apartment.sqft} sqft</span>
                        </div>
                      </div>
                      {apartment.isTopPick && (
                        <Badge className="bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border-green-500/30 px-3 py-1">
                          <Star className="w-4 h-4 mr-1" />
                          AI TOP PICK
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scores and Actions */}
                <div className="text-right space-y-3">
                  <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl border ${getScoreBg(apartment.combinedScore || apartment.aiMatchScore)}`}>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">AI Match Score</div>
                      <div className={`text-3xl font-bold ${getScoreColor(apartment.combinedScore || apartment.aiMatchScore)}`}>
                        {apartment.combinedScore || apartment.aiMatchScore}
                      </div>
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