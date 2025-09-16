import React, { useState } from 'react';
import { Heart, MessageCircle, Eye, Star, MapPin, Car, Clock, Wifi, Dog, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [savedApartments, setSavedApartments] = useState<Set<string>>(new Set());

  // Mock apartment data for demo
  const mockApartments: Apartment[] = [
    {
      id: '1',
      name: 'Austin Skyline Apartments',
      address: '123 Downtown Ave, Austin, TX',
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
      saved: false
    },
    {
      id: '2',
      name: 'Riverside Modern Living',
      address: '456 River Road, Austin, TX',
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
      saved: false
    },
    {
      id: '3',
      name: 'Tech District Studios',
      address: '789 Innovation Blvd, Austin, TX',
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
      saved: false
    },
    {
      id: '4',
      name: 'Garden Heights Complex',
      address: '321 Garden St, Austin, TX',
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
      saved: false
    }
  ];

  const displayApartments = apartments.length > 0 ? apartments : mockApartments;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 80) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (score >= 70) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'pool': return '🏊';
      case 'gym': return '🏋️';
      case 'parking': return '🚗';
      case 'pet-friendly': return '🐕';
      case 'wifi': return '📶';
      case 'balcony': return '🏙️';
      case 'laundry': return '👕';
      case 'air conditioning': return '❄️';
      default: return '✨';
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
    switch (sortBy) {
      case 'aiScore':
        return b.aiMatchScore - a.aiMatchScore;
      case 'price':
        return a.price - b.price;
      case 'newest':
        return a.listingAge - b.listingAge;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            {displayApartments.length} Apartments Found
          </h3>
          <p className="text-sm text-muted-foreground">
            Showing results within your search criteria
          </p>
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="aiScore">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                AI Match Score
              </div>
            </SelectItem>
            <SelectItem value="price">
              <div className="flex items-center gap-2">
                <span className="text-green-400">$</span>
                Price (Low to High)
              </div>
            </SelectItem>
            <SelectItem value="newest">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                Newest First
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedApartments.map((apartment) => (
          <Card key={apartment.id} className="bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/40 transition-all duration-300 group">
            <CardContent className="p-0">
              {/* Image Placeholder */}
              <div className="relative h-48 bg-slate-700/50 rounded-t-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                  🏢
                </div>
                
                {/* AI Score Badge */}
                <Badge 
                  className={`absolute top-3 left-3 ${getScoreColor(apartment.aiMatchScore)} font-semibold`}
                >
                  <Star className="w-3 h-3 mr-1" />
                  {apartment.aiMatchScore}% Match
                </Badge>
                
                {/* Save Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleSaved(apartment.id)}
                  className={`absolute top-3 right-3 w-8 h-8 p-0 transition-all duration-200 ${
                    savedApartments.has(apartment.id)
                      ? 'bg-red-500/20 border-red-500/30 text-red-400'
                      : 'bg-slate-800/50 border-slate-600/50 text-slate-400 hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${savedApartments.has(apartment.id) ? 'fill-current' : ''}`} />
                </Button>

                {/* New Listing Badge */}
                {apartment.listingAge <= 3 && (
                  <Badge className="absolute top-3 right-14 bg-blue-500/20 text-blue-400 border-blue-500/30">
                    New
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Header */}
                <div>
                  <h4 className="font-semibold text-lg text-foreground group-hover:text-blue-400 transition-colors">
                    {apartment.name}
                  </h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {apartment.address}
                  </div>
                </div>

                {/* Price and Details */}
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-400">
                    ${apartment.price.toLocaleString()}
                    <span className="text-sm text-muted-foreground font-normal">/month</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {apartment.bedrooms}BR • {apartment.bathrooms}BA • {apartment.sqft} sqft
                  </div>
                </div>

                {/* POI Distances */}
                {pointsOfInterest.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {pointsOfInterest.slice(0, 2).map((poi) => {
                      const distance = apartment.poiDistances[poi.category];
                      if (!distance) return null;
                      
                      return (
                        <Badge 
                          key={poi.id} 
                          variant="outline"
                          className="text-xs bg-slate-700/30 border-slate-600/50"
                        >
                          <Car className="w-3 h-3 mr-1" />
                          {poi.name}: {distance.driveTime}min
                        </Badge>
                      );
                    })}
                  </div>
                )}

                {/* Amenities */}
                <div className="flex flex-wrap gap-1">
                  {apartment.amenities.slice(0, 4).map((amenity) => (
                    <Badge 
                      key={amenity}
                      variant="outline"
                      className="text-xs bg-blue-500/10 border-blue-500/30 text-blue-400"
                    >
                      {getAmenityIcon(amenity)} {amenity}
                    </Badge>
                  ))}
                  {apartment.amenities.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{apartment.amenities.length - 4} more
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Contact
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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