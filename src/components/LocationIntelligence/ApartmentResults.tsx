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
      combinedScore: 95
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
      combinedScore: 89
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
      combinedScore: 87
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
      combinedScore: 82
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
      <div className="space-y-4" key={`${filterBy}-${sortBy}`}>
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
              className="bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/60 transition-all duration-200"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {/* Left Section */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Property Image */}
                    <div className="w-16 h-16 rounded-lg bg-slate-700/50 border border-slate-600/50 flex items-center justify-center flex-shrink-0">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Property</div>
                        <div className="text-xs text-muted-foreground">Image</div>
                      </div>
                    </div>
                    
                    {/* Property Details */}
                    <div className="flex-1 min-w-0">
                      {/* Property Name and Address */}
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-foreground mb-1">{apartment.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                          <MapPin className="w-3 h-3" />
                          {apartment.address}
                        </p>
                        <div className="text-xl font-bold text-green-400 mb-2">${apartment.price.toLocaleString()}/mo</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                          <span>{apartment.bedrooms}bd</span>
                          <span>{apartment.bathrooms}ba</span>
                          <span>{apartment.sqft} sqft</span>
                        </div>
                      </div>

                      {/* Preference Matches */}
                      <div className="flex items-center gap-6 mb-4">
                        <div className="flex items-center gap-2">
                          <Check className={`w-4 h-4 ${apartment.budgetMatch ? 'text-green-400' : 'text-slate-500'}`} />
                          <span className={`text-sm ${apartment.budgetMatch ? 'text-foreground' : 'text-muted-foreground'}`}>
                            Budget Match
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className={`w-4 h-4 ${apartment.amenityMatch ? 'text-green-400' : 'text-slate-500'}`} />
                          <span className={`text-sm ${apartment.amenityMatch ? 'text-foreground' : 'text-muted-foreground'}`}>
                            Amenities Match
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className={`w-4 h-4 ${apartment.lifestyleMatch ? 'text-green-400' : 'text-slate-500'}`} />
                          <span className={`text-sm ${apartment.lifestyleMatch ? 'text-foreground' : 'text-muted-foreground'}`}>
                            Lifestyle Match
                          </span>
                        </div>
                      </div>

                      {/* Commute Times */}
                      <div>
                        <h4 className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Commute Times
                        </h4>
                        <div className="flex gap-2">
                          {pointsOfInterest.slice(0, 2).map((poi) => {
                            const distance = apartment.poiDistances[poi.category];
                            if (!distance) return null;
                            
                            const getTimeColor = (time: number) => {
                              if (time <= 10) return 'bg-green-500/20 text-green-400';
                              if (time <= 20) return 'bg-yellow-500/20 text-yellow-400';
                              return 'bg-red-500/20 text-red-400';
                            };
                            
                            return (
                              <div key={poi.id} className={`px-3 py-1 rounded-lg text-sm ${getTimeColor(distance.driveTime)}`}>
                                {poi.name} {distance.driveTime}min
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Scores and Actions */}
                  <div className="flex flex-col items-end gap-3 ml-6">
                    {/* Combined Score */}
                    <div className={`px-4 py-3 rounded-lg text-center ${getScoreBg(apartment.combinedScore || apartment.aiMatchScore)}`}>
                      <div className="text-xs text-muted-foreground mb-1">Combined Score</div>
                      <div className={`text-3xl font-bold ${getScoreColor(apartment.combinedScore || apartment.aiMatchScore)}`}>
                        {apartment.combinedScore || apartment.aiMatchScore}
                      </div>
                    </div>

                    {/* Individual Scores */}
                    <div className="space-y-1 text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">AI Match:</span>
                        <span className="text-sm font-medium text-orange-400">{apartment.aiMatchScore}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Location:</span>
                        <span className="text-sm font-medium text-green-400">{apartment.locationScore || 92}%</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1">
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
                      <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-slate-700/30 border-slate-600/50">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-slate-700/30 border-slate-600/50">
                        <MessageCircle className="w-4 h-4" />
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