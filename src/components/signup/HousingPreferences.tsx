import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SignupFormData } from '@/pages/Signup';

interface HousingPreferencesProps {
  data: SignupFormData;
  onUpdate: (data: Partial<SignupFormData>) => void;
}

const HousingPreferences = ({ data, onUpdate }: HousingPreferencesProps) => {
  const amenityOptions = [
    'Parking', 'Pool', 'Gym/Fitness', 'Pet-Friendly', 'High-Speed WiFi',
    'In-Unit Laundry', 'Balcony/Patio', 'Dishwasher'
  ];

  const dealBreakerOptions = [
    'No Pets Allowed', 'Ground Floor', 'No Parking', 'Shared Bathroom',
    'Student Housing'
  ];

  const toggleAmenity = (amenity: string) => {
    const updatedAmenities = data.amenities.includes(amenity)
      ? data.amenities.filter(a => a !== amenity)
      : [...data.amenities, amenity];
    onUpdate({ amenities: updatedAmenities });
  };

  const toggleDealBreaker = (dealBreaker: string) => {
    const updatedDealBreakers = data.dealBreakers.includes(dealBreaker)
      ? data.dealBreakers.filter(d => d !== dealBreaker)
      : [...data.dealBreakers, dealBreaker];
    onUpdate({ dealBreakers: updatedDealBreakers });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minBedrooms" className="text-sm font-medium text-foreground mb-2 block">
            Minimum Bedrooms
          </Label>
          <Select value={data.minBedrooms} onValueChange={(value) => onUpdate({ minBedrooms: value })}>
            <SelectTrigger className="bg-input border-border text-foreground">
              <SelectValue placeholder="Studio" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="1">1 Bedroom</SelectItem>
              <SelectItem value="2">2 Bedrooms</SelectItem>
              <SelectItem value="3">3 Bedrooms</SelectItem>
              <SelectItem value="4+">4+ Bedrooms</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="householdSize" className="text-sm font-medium text-foreground mb-2 block">
            Household Size
          </Label>
          <Select value={data.householdSize} onValueChange={(value) => onUpdate({ householdSize: value })}>
            <SelectTrigger className="bg-input border-border text-foreground">
              <SelectValue placeholder="Just me" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="1">Just me</SelectItem>
              <SelectItem value="2">2 people</SelectItem>
              <SelectItem value="3">3 people</SelectItem>
              <SelectItem value="4">4 people</SelectItem>
              <SelectItem value="5+">5+ people</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preferred Amenities */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">
          Preferred Amenities
        </Label>
        <div className="flex flex-wrap gap-2">
          {amenityOptions.map((amenity) => (
            <Badge
              key={amenity}
              variant={data.amenities.includes(amenity) ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                data.amenities.includes(amenity)
                  ? 'bg-primary text-primary-foreground'
                  : 'border-border/20 hover:bg-muted/20'
              }`}
              onClick={() => toggleAmenity(amenity)}
            >
              {amenity}
            </Badge>
          ))}
        </div>
      </div>

      {/* Deal Breakers */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">
          Deal Breakers (Must Avoid)
        </Label>
        <div className="flex flex-wrap gap-2">
          {dealBreakerOptions.map((dealBreaker) => (
            <Badge
              key={dealBreaker}
              variant={data.dealBreakers.includes(dealBreaker) ? "destructive" : "outline"}
              className={`cursor-pointer transition-colors ${
                data.dealBreakers.includes(dealBreaker)
                  ? 'bg-destructive text-destructive-foreground'
                  : 'border-border/20 hover:bg-muted/20'
              }`}
              onClick={() => toggleDealBreaker(dealBreaker)}
            >
              {dealBreaker}
            </Badge>
          ))}
        </div>
      </div>

      {/* Pet Information */}
      <div>
        <Label htmlFor="petInfo" className="text-sm font-medium text-foreground mb-2 block">
          Pet Information (if applicable)
        </Label>
        <Textarea
          id="petInfo"
          value={data.petInfo}
          onChange={(e) => onUpdate({ petInfo: e.target.value })}
          placeholder="e.g. 1 medium dog, 2 cats or 'None'"
          className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
          rows={3}
        />
      </div>
    </div>
  );
};

export default HousingPreferences;