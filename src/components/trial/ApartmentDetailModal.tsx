import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ApartmentListing } from '@/data/mockApartments';
import { X, Lock, MapPin, Bed, Bath, Square, Car, Phone, Mail, Calendar, Zap, CheckCircle } from 'lucide-react';

interface ApartmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  apartment: ApartmentListing | null;
  onUpgrade: () => void;
}

export const ApartmentDetailModal: React.FC<ApartmentDetailModalProps> = ({
  isOpen,
  onClose,
  apartment,
  onUpgrade
}) => {
  if (!apartment) return null;

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
      case 'exceptional': return 'EXCEPTIONAL POTENTIAL';
      case 'high': return 'HIGH POTENTIAL';
      case 'medium': return 'GOOD VALUE';
      default: return 'STANDARD';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border border-white/20 text-foreground">
        {/* Header */}
        <DialogHeader className="relative pb-4 border-b border-muted/20">
          <DialogTitle className="text-2xl font-bold pr-8">
            {apartment.address}
          </DialogTitle>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{apartment.neighborhood}, {apartment.city}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-0 top-0 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
          {/* Left Side - Apartment Details */}
          <div className="space-y-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="h-64 bg-muted/20 rounded-lg overflow-hidden">
                <img
                  src={apartment.images[0]}
                  alt={apartment.address}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {apartment.images.slice(1, 4).map((image, index) => (
                  <div key={index} className="h-20 bg-muted/20 rounded overflow-hidden">
                    <img
                      src={image}
                      alt={`${apartment.address} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Basic Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Property Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-dark rounded-lg p-4 border border-white/10">
                  <div className="text-2xl font-bold text-foreground">${apartment.rent}</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
                <div className="glass-dark rounded-lg p-4 border border-white/10">
                  <div className="text-2xl font-bold text-foreground">{apartment.sqft}</div>
                  <div className="text-sm text-muted-foreground">square feet</div>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Bed className="w-5 h-5" />
                  <span>{apartment.bedrooms === 0 ? 'Studio' : `${apartment.bedrooms} bedrooms`}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bath className="w-5 h-5" />
                  <span>{apartment.bathrooms} bathrooms</span>
                </div>
                {apartment.parking && (
                  <div className="flex items-center space-x-2">
                    <Car className="w-5 h-5" />
                    <span>Parking included</span>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {apartment.amenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary">
                    {amenity}
                  </Badge>
                ))}
                {apartment.petFriendly && (
                  <Badge variant="outline" className="border-green-500/30 text-green-400">
                    Pet-Friendly
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Negotiation Intelligence */}
          <div className="space-y-6">
            {/* Opportunity Overview */}
            <div className="glass-dark rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-foreground">Negotiation Intelligence</h3>
                <Badge className={`${getOpportunityColor(apartment.opportunityLevel)} border font-semibold`}>
                  {getOpportunityLabel(apartment.opportunityLevel)}
                </Badge>
              </div>

              {/* Leverage Score */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Leverage Score</span>
                  <span className="text-2xl font-bold text-foreground">{apartment.leverageScore}+/100</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-3">
                  <div 
                    className="bg-gradient-primary h-3 rounded-full transition-all duration-500"
                    style={{ width: `${apartment.leverageScore}%` }}
                  />
                </div>
              </div>

              {/* Savings Potential */}
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="text-green-400 font-bold text-xl mb-1">
                  ${apartment.savingsRange.min}-${apartment.savingsRange.max}/month
                </div>
                <div className="text-sm text-green-300/80">
                  Potential savings with negotiation
                </div>
              </div>

              {/* Market Factors */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Market Advantages</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">High inventory in area</span>
                    <div className={`w-4 h-4 rounded-full ${apartment.marketFactors.highInventory ? 'bg-green-500' : 'bg-muted/40'}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Seasonal advantage</span>
                    <div className={`w-4 h-4 rounded-full ${apartment.marketFactors.seasonalAdvantage ? 'bg-green-500' : 'bg-muted/40'}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Property pressure indicators</span>
                    <div className={`w-4 h-4 rounded-full ${apartment.marketFactors.propertyPressure ? 'bg-green-500' : 'bg-muted/40'}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Locked Premium Content */}
            <div className="relative">
              <div className="glass-dark rounded-xl p-6 border border-white/10 blur-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">Premium Negotiation Tactics</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-foreground">Specific negotiation scripts</div>
                      <div className="text-sm text-muted-foreground">Proven talking points for this property</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-foreground">Optimal application timing</div>
                      <div className="text-sm text-muted-foreground">{apartment.optimalTiming.bestApplicationDate}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-foreground">Landlord contact information</div>
                      <div className="text-sm text-muted-foreground">{apartment.landlordContact.name}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center bg-background/90 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-foreground mb-2">Premium Insights Locked</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get exact savings: ${apartment.exactSavings}/month
                  </p>
                  <Button
                    onClick={onUpgrade}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Unlock Negotiation Tactics
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};