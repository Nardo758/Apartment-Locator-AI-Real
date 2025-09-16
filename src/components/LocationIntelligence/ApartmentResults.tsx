import React, { useState } from 'react';
import { SimplifiedDealCard } from '@/components/renter/SimplifiedDealCard';
import { type ApartmentIQData } from '@/lib/pricing-engine';

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
  const [sortBy, setSortBy] = useState('deals');

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

  const displayApartments = apartments.length > 0 ? apartments : mockApartments;

  // Sort by best deals first (highest days on market + concessions)
  const sortedApartments = [...displayApartments].sort((a, b) => {
    const aDealScore = a.apartmentIQData.daysOnMarket + (a.apartmentIQData.concessionValue / 1000);
    const bDealScore = b.apartmentIQData.daysOnMarket + (b.apartmentIQData.concessionValue / 1000);
    return bDealScore - aDealScore; // Best deals first
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">💰 Best Apartment Deals</h2>
        <p className="text-muted-foreground">Sorted by negotiation potential and savings opportunity</p>
      </div>

      {/* Property Results */}
      <div className="space-y-6 w-full">
        {sortedApartments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">No apartments found</h3>
            <p className="text-muted-foreground">No apartments match your current search criteria.</p>
          </div>
        ) : (
          sortedApartments.map((apartment) => (
            <SimplifiedDealCard key={apartment.id} property={apartment} />
          ))
        )}
      </div>
    </div>
  );
};

export default ApartmentResults;