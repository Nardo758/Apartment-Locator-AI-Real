import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, DollarSign, Home, Calendar } from 'lucide-react';

interface ApartmentSearchFormProps {
  onSearch: (data: {
    location: string;
    minRent: number;
    maxRent: number;
    bedrooms?: number;
    bathrooms?: number;
    moveInTimeline: string;
  }) => void;
  canMakeSearch: boolean;
  isLoading?: boolean;
  className?: string;
}

export const ApartmentSearchForm: React.FC<ApartmentSearchFormProps> = ({
  onSearch,
  canMakeSearch,
  isLoading = false,
  className
}) => {
  const [location, setLocation] = useState('');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [bedrooms, setBedrooms] = useState<string>('');
  const [bathrooms, setBathrooms] = useState<string>('');
  const [moveInTimeline, setMoveInTimeline] = useState('');

  const isFormValid = location.trim() && minRent && maxRent && moveInTimeline;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || !canMakeSearch) return;

    onSearch({
      location: location.trim(),
      minRent: parseFloat(minRent),
      maxRent: parseFloat(maxRent),
      bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
      bathrooms: bathrooms ? parseFloat(bathrooms) : undefined,
      moveInTimeline
    });
  };

  return (
    <div className={`glass-dark rounded-xl p-6 border border-white/10 ${className}`}>
      <div className="flex items-center space-x-2 mb-6">
        <Search className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Find Apartments</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium text-foreground flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>Location</span>
          </Label>
          <Input
            id="location"
            type="text"
            placeholder="Austin, TX or neighborhood"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-muted/20 border-muted/40 focus:border-primary"
            disabled={!canMakeSearch || isLoading}
          />
        </div>

        {/* Rent Budget */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Monthly Rent Budget</span>
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min ($1500)"
              value={minRent}
              onChange={(e) => setMinRent(e.target.value)}
              className="bg-muted/20 border-muted/40 focus:border-primary"
              disabled={!canMakeSearch || isLoading}
              min="0"
              step="100"
            />
            <Input
              type="number"
              placeholder="Max ($3000)"
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
              className="bg-muted/20 border-muted/40 focus:border-primary"
              disabled={!canMakeSearch || isLoading}
              min="0"
              step="100"
            />
          </div>
        </div>

        {/* Bedrooms & Bathrooms */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
              <Home className="w-4 h-4" />
              <span>Bedrooms</span>
            </Label>
            <Select value={bedrooms} onValueChange={setBedrooms} disabled={!canMakeSearch || isLoading}>
              <SelectTrigger className="bg-muted/20 border-muted/40 focus:border-primary">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Studio</SelectItem>
                <SelectItem value="1">1 BR</SelectItem>
                <SelectItem value="2">2 BR</SelectItem>
                <SelectItem value="3">3+ BR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              <span>Bathrooms</span>
            </Label>
            <Select value={bathrooms} onValueChange={setBathrooms} disabled={!canMakeSearch || isLoading}>
              <SelectTrigger className="bg-muted/20 border-muted/40 focus:border-primary">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="1.5">1.5+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="2.5">2.5+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Move-in Timeline */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Move-in Timeline</span>
          </Label>
          <Select value={moveInTimeline} onValueChange={setMoveInTimeline} disabled={!canMakeSearch || isLoading}>
            <SelectTrigger className="bg-muted/20 border-muted/40 focus:border-primary">
              <SelectValue placeholder="Select timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asap">ASAP</SelectItem>
              <SelectItem value="1month">Within 1 month</SelectItem>
              <SelectItem value="2months">Within 2 months</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isFormValid || !canMakeSearch || isLoading}
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading ? 'Finding Apartments...' : 'Find Apartments'}
        </Button>

        {/* Helper Text */}
        {!canMakeSearch && (
          <p className="text-sm text-destructive text-center">
            Trial limit reached. Upgrade to continue searching apartments.
          </p>
        )}
      </form>
    </div>
  );
};