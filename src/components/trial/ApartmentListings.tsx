import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ApartmentListing } from '@/data/mockApartments';
import { Lock, MapPin, Bed, Bath, Square, Car, Heart, Zap } from 'lucide-react';

interface ApartmentListingsProps {
  apartments: ApartmentListing[];
  onApartmentClick: (apartment: ApartmentListing) => void;
  onUpgrade: () => void;
  onHighValueClick?: (apartment: ApartmentListing) => void;
  onSort: (sortBy: string) => void;
  className?: string;
}

export const ApartmentListings: React.FC<ApartmentListingsProps> = ({
  apartments,
  onApartmentClick,
  onUpgrade,
  onHighValueClick,
  onSort,
  className
}) => {
  const [sortBy, setSortBy] = useState('best_leverage');

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSort(value);
  };

  const getOpportunityColor = (level: string) => {
    switch (level) {
      case 'exceptional': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'high': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'medium': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getOpportunityLabel = (level: string) => {
    switch (level) {
      case 'exceptional': return 'EXCEPTIONAL';
      case 'high': return 'HIGH POTENTIAL';
      case 'medium': return 'GOOD VALUE';
      default: return 'STANDARD';
    }
  };

  const averageSavings = apartments.reduce((acc, apt) => acc + (apt.savingsRange.min + apt.savingsRange.max) / 2, 0) / apartments.length;

  return (
    <div className={className}>
      {/* Header Summary */}
      <div className="glass-dark rounded-xl p-6 border border-white/10 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Found {apartments.length} apartments with negotiation potential
            </h2>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Favorable negotiation market</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Average savings: ${Math.round(averageSavings)}/month</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48 bg-muted/20 border-muted/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best_leverage">Best Leverage</SelectItem>
                <SelectItem value="highest_savings">Highest Savings</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Apartment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {apartments.map((apartment) => (
          <div
            key={apartment.id}
            className="glass-dark rounded-xl border border-white/10 overflow-hidden hover:border-primary/40 transition-all duration-300 cursor-pointer group"
            onClick={() => {
              // Trigger high-value modal for exceptional apartments
              if (apartment.leverageScore >= 85 && apartment.opportunityLevel === 'exceptional' && onHighValueClick) {
                onHighValueClick(apartment);
              } else {
                onApartmentClick(apartment);
              }
            }}
          >
            {/* Image */}
            <div className="relative h-48 bg-muted/20">
              <img
                src={apartment.images[0]}
                alt={apartment.address}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <Badge className={`${getOpportunityColor(apartment.opportunityLevel)} border font-semibold`}>
                  {getOpportunityLabel(apartment.opportunityLevel)}
                </Badge>
              </div>
              <div className="absolute top-3 right-3">
                <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1">
                  <div className="text-2xl font-bold text-foreground">{apartment.leverageScore}+</div>
                  <div className="text-xs text-muted-foreground">leverage</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Address & Neighborhood */}
              <div className="mb-3">
                <h3 className="font-semibold text-foreground mb-1">{apartment.address}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{apartment.neighborhood}</span>
                </div>
              </div>

              {/* Rent & Details */}
              <div className="mb-4">
                <div className="text-2xl font-bold text-foreground mb-2">${apartment.rent}/month</div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Bed className="w-4 h-4" />
                    <span>{apartment.bedrooms === 0 ? 'Studio' : `${apartment.bedrooms} bed`}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Bath className="w-4 h-4" />
                    <span>{apartment.bathrooms} bath</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Square className="w-4 h-4" />
                    <span>{apartment.sqft} sqft</span>
                  </div>
                </div>
              </div>

              {/* Savings Potential */}
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="text-green-400 font-semibold text-lg">
                  ${apartment.savingsRange.min}-${apartment.savingsRange.max}/month savings potential
                </div>
                <div className="text-sm text-green-300/80">
                  Based on market leverage analysis
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {apartment.amenities.slice(0, 3).map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {apartment.amenities.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{apartment.amenities.length - 3} more
                    </Badge>
                  )}
                  {apartment.parking && (
                    <Badge variant="outline" className="text-xs flex items-center space-x-1">
                      <Car className="w-3 h-3" />
                      <span>Parking</span>
                    </Badge>
                  )}
                </div>
              </div>

              {/* Market Factors */}
              <div className="mb-4 space-y-2">
                <div className="text-sm font-medium text-foreground">Negotiation Advantages:</div>
                <div className="space-y-1">
                  {apartment.marketFactors.highInventory && (
                    <div className="flex items-center text-sm text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      High inventory in area
                    </div>
                  )}
                  {apartment.marketFactors.seasonalAdvantage && (
                    <div className="flex items-center text-sm text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Seasonal advantage
                    </div>
                  )}
                  {apartment.marketFactors.propertyPressure && (
                    <div className="flex items-center text-sm text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Property pressure indicators
                    </div>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  // Check if this is exceptional apartment
                  if (apartment.leverageScore >= 85 && apartment.opportunityLevel === 'exceptional' && onHighValueClick) {
                    onHighValueClick(apartment);
                  } else {
                    onUpgrade();
                  }
                }}
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                <Lock className="w-4 h-4 mr-2" />
                View Negotiation Tactics
              </Button>
            </div>
          </div>
        ))}
      </div>

      {apartments.length === 0 && (
        <div className="glass-dark rounded-xl p-8 border border-white/10 text-center">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No apartments found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria to find more apartments
          </p>
        </div>
      )}
    </div>
  );
};