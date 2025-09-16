import React, { useState } from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CompactApartmentCard from '../CompactApartmentCard';

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
          filteredApartments.map((apartment) => {
            // Convert apartment data to CompactApartmentCard format
            const apartmentData = {
              id: apartment.id,
              name: apartment.name,
              address: apartment.address,
              price: apartment.price,
              bedrooms: apartment.bedrooms,
              bathrooms: apartment.bathrooms,
              sqft: apartment.sqft,
              aiMatchScore: apartment.aiMatchScore,
              combinedScore: apartment.combinedScore || apartment.aiMatchScore,
              locationScore: apartment.locationScore,
              budgetMatch: apartment.budgetMatch,
              amenityMatch: apartment.amenityMatch,
              lifestyleMatch: apartment.lifestyleMatch,
              isTopPick: apartment.isTopPick
            };

            return (
              <CompactApartmentCard
                key={apartment.id}
                apartment={apartmentData}
                onFavorite={toggleSaved}
                onViewDetails={() => console.log('View details:', apartment.id)}
                onShare={() => console.log('Share:', apartment.id)}
                isFavorited={savedApartments.has(apartment.id)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default ApartmentResults;