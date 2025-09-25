import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, MapPin, DollarSign, Home } from 'lucide-react';

interface PropertySearchFormProps {
  onAnalyze: (data: { location: string; currentRent: number; propertyValue: number }) => void;
  canMakeQuery: boolean;
  isLoading?: boolean;
  className?: string;
}

export const PropertySearchForm: React.FC<PropertySearchFormProps> = ({
  onAnalyze,
  canMakeQuery,
  isLoading = false,
  className
}) => {
  const [location, setLocation] = useState('');
  const [currentRent, setCurrentRent] = useState('');
  const [propertyValue, setPropertyValue] = useState('');

  const isFormValid = location.trim() && currentRent && propertyValue;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || !canMakeQuery) return;

    onAnalyze({
      location: location.trim(),
      currentRent: parseFloat(currentRent),
      propertyValue: parseFloat(propertyValue)
    });
  };

  return (
    <div className={`glass-dark rounded-xl p-6 border border-white/10 ${className}`}>
      <div className="flex items-center space-x-2 mb-6">
        <Search className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Property Analysis</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium text-foreground flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>Property Location</span>
          </Label>
          <Input
            id="location"
            type="text"
            placeholder="e.g., Austin, TX or specific address"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-muted/20 border-muted/40 focus:border-primary"
            disabled={!canMakeQuery || isLoading}
          />
        </div>

        {/* Current Rent */}
        <div className="space-y-2">
          <Label htmlFor="currentRent" className="text-sm font-medium text-foreground flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Current Rent (Monthly)</span>
          </Label>
          <Input
            id="currentRent"
            type="number"
            placeholder="2400"
            value={currentRent}
            onChange={(e) => setCurrentRent(e.target.value)}
            className="bg-muted/20 border-muted/40 focus:border-primary"
            disabled={!canMakeQuery || isLoading}
            min="0"
            step="50"
          />
        </div>

        {/* Property Value */}
        <div className="space-y-2">
          <Label htmlFor="propertyValue" className="text-sm font-medium text-foreground flex items-center space-x-2">
            <Home className="w-4 h-4" />
            <span>Property Value (Estimated)</span>
          </Label>
          <Input
            id="propertyValue"
            type="number"
            placeholder="450000"
            value={propertyValue}
            onChange={(e) => setPropertyValue(e.target.value)}
            className="bg-muted/20 border-muted/40 focus:border-primary"
            disabled={!canMakeQuery || isLoading}
            min="0"
            step="10000"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isFormValid || !canMakeQuery || isLoading}
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Opportunity'}
        </Button>

        {/* Helper Text */}
        {!canMakeQuery && (
          <p className="text-sm text-destructive text-center">
            Trial limit reached. Upgrade to continue analyzing properties.
          </p>
        )}
      </form>
    </div>
  );
};