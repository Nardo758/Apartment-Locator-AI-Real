// ============================================
// LIFESTYLE STEP (Step 3)
// Commute frequency, vehicle, transit
// ============================================

import { useState } from 'react';
import { Car, Bus, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useUnifiedAI } from '@/contexts/UnifiedAIContext';

interface LifestyleStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function LifestyleStep({ onNext, onBack }: LifestyleStepProps) {
  const { commutePreferences, updateInputs } = useUnifiedAI();
  
  const [formData, setFormData] = useState({
    daysPerWeek: commutePreferences.daysPerWeek || 5,
    vehicleMpg: commutePreferences.vehicleMpg || 28,
    gasPrice: commutePreferences.gasPrice || 3.50,
    transitPass: commutePreferences.transitPass || 100,
    timeValuePerHour: commutePreferences.timeValuePerHour || 25,
    useTransit: false,
  });

  const handleSubmit = () => {
    updateInputs({
      commutePreferences: {
        daysPerWeek: formData.daysPerWeek,
        vehicleMpg: formData.vehicleMpg,
        gasPrice: formData.gasPrice,
        transitPass: formData.transitPass,
        timeValuePerHour: formData.timeValuePerHour,
      },
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tell us about your commute
        </h2>
        <p className="text-gray-600">
          This helps us calculate your true monthly costs
        </p>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Car className="w-4 h-4 text-blue-600" />
          How often do you commute?
        </Label>
        <Input
          type="number"
          value={formData.daysPerWeek}
          onChange={(e) => setFormData({ ...formData, daysPerWeek: parseInt(e.target.value) || 0 })}
          className="h-12"
        />
        <p className="text-xs text-gray-500">days per week</p>
      </div>

      <div className="space-y-2">
        <Label>Vehicle fuel efficiency</Label>
        <Input
          type="number"
          value={formData.vehicleMpg}
          onChange={(e) => setFormData({ ...formData, vehicleMpg: parseInt(e.target.value) || 0 })}
          className="h-12"
        />
        <p className="text-xs text-gray-500">miles per gallon (MPG)</p>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          Current gas price
        </Label>
        <Input
          type="number"
          step="0.01"
          value={formData.gasPrice}
          onChange={(e) => setFormData({ ...formData, gasPrice: parseFloat(e.target.value) || 0 })}
          className="h-12"
        />
        <p className="text-xs text-gray-500">per gallon</p>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
        <Checkbox
          checked={formData.useTransit}
          onCheckedChange={(checked) => setFormData({ ...formData, useTransit: !!checked })}
        />
        <Label className="flex items-center gap-2 cursor-pointer">
          <Bus className="w-4 h-4 text-blue-600" />
          I use public transit
        </Label>
      </div>

      {formData.useTransit && (
        <div className="space-y-2">
          <Label>Monthly transit pass cost</Label>
          <Input
            type="number"
            value={formData.transitPass}
            onChange={(e) => setFormData({ ...formData, transitPass: parseInt(e.target.value) || 0 })}
            className="h-12"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-600" />
          How much is your time worth?
        </Label>
        <Input
          type="number"
          value={formData.timeValuePerHour}
          onChange={(e) => setFormData({ ...formData, timeValuePerHour: parseInt(e.target.value) || 0 })}
          className="h-12"
        />
        <p className="text-xs text-gray-500">$/hour (for commute calculations)</p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <div className="text-sm text-gray-600">Step 3 of 5 • Required</div>
        <Button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
