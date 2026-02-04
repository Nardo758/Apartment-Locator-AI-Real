// ============================================
// BASIC SEARCH STEP (Step 1)
// Location, budget, bedrooms, move-in date
// ============================================

import { useState } from 'react';
import { MapPin, DollarSign, Home, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUnifiedAI } from '@/contexts/UnifiedAIContext';

interface BasicSearchStepProps {
  onNext: () => void;
}

export default function BasicSearchStep({ onNext }: BasicSearchStepProps) {
  const { location, zipCode, budget, aiPreferences, updateInputs } = useUnifiedAI();
  
  const [formData, setFormData] = useState({
    location: location || '',
    zipCode: zipCode || '',
    budget: budget || 2500,
    bedrooms: aiPreferences.bedrooms || '1',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update context
    updateInputs({
      location: formData.location,
      zipCode: formData.zipCode,
      budget: formData.budget,
      aiPreferences: {
        ...aiPreferences,
        bedrooms: formData.bedrooms,
      },
    });
    
    onNext();
  };

  const isValid = (formData.location || formData.zipCode) && formData.budget > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Where are you looking for an apartment?
        </h2>
        <p className="text-gray-600">
          Tell us your location and budget to get started
        </p>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location" className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          City or Area
        </Label>
        <Input
          id="location"
          placeholder="Austin, TX"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="h-12"
        />
      </div>

      {/* Zip Code */}
      <div className="space-y-2">
        <Label htmlFor="zipCode" className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          Zip Code (Optional)
        </Label>
        <Input
          id="zipCode"
          placeholder="78701"
          value={formData.zipCode}
          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
          className="h-12"
        />
      </div>

      {/* Budget */}
      <div className="space-y-2">
        <Label htmlFor="budget" className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          Monthly Budget
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
          <Input
            id="budget"
            type="number"
            placeholder="2500"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
            className="h-12 pl-8 text-lg"
          />
        </div>
        <input
          type="range"
          min="500"
          max="5000"
          step="50"
          value={formData.budget}
          onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>$500</span>
          <span>${formData.budget.toLocaleString()}/mo</span>
          <span>$5,000</span>
        </div>
      </div>

      {/* Bedrooms */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Home className="w-4 h-4 text-purple-600" />
          Bedrooms
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {['Studio', '1', '2', '3+'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFormData({ ...formData, bedrooms: option })}
              className={`p-3 rounded-lg border-2 text-center font-semibold transition-all ${
                formData.bedrooms === option
                  ? 'border-purple-600 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Step 1 of 5 • Required
        </div>
        <Button
          type="submit"
          disabled={!isValid}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
        >
          Next: Add Locations
          <MapPin className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}
