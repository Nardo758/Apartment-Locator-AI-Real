// Market Intel Step (Step 4) - Optional
import { useState } from 'react';
import { TrendingUp, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUnifiedAI } from '@/contexts/UnifiedAIContext';

interface MarketIntelStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function MarketIntelStep({ onNext, onBack, onSkip }: MarketIntelStepProps) {
  const { marketContext, location, updateMarketContext } = useUnifiedAI();
  const [formData, setFormData] = useState({
    annualIncome: marketContext?.annualIncome || 102000,
    currentSavings: marketContext?.currentSavings || 120000,
    timeHorizon: marketContext?.timeHorizon || 5,
  });

  const handleSubmit = () => {
    updateMarketContext({
      region: location || 'Unknown',
      leverageScore: 72,
      daysOnMarket: 35,
      inventoryLevel: 2.8,
      rentTrend: 4.5,
      negotiationPower: 'strong',
      rentVsBuyRecommendation: 'rent',
      annualIncome: formData.annualIncome,
      currentSavings: formData.currentSavings,
      timeHorizon: formData.timeHorizon,
      medianRent: 2200,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Market Intelligence <span className="text-sm text-gray-500">(Optional)</span>
        </h2>
        <p className="text-gray-600">
          Get negotiation tips and leverage analysis
        </p>
      </div>

      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">We'll analyze:</p>
            <ul className="space-y-1 text-xs">
              <li>• Your negotiation leverage</li>
              <li>• Best time to move</li>
              <li>• Rent vs buy recommendation</li>
              <li>• Predicted rent increases</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label><DollarSign className="w-4 h-4 inline mr-1" />Annual Income</Label>
          <Input type="number" value={formData.annualIncome}
            onChange={(e) => setFormData({ ...formData, annualIncome: parseInt(e.target.value) || 0 })} />
        </div>

        <div className="space-y-2">
          <Label><DollarSign className="w-4 h-4 inline mr-1" />Current Savings</Label>
          <Input type="number" value={formData.currentSavings}
            onChange={(e) => setFormData({ ...formData, currentSavings: parseInt(e.target.value) || 0 })} />
        </div>

        <div className="space-y-2">
          <Label><Calendar className="w-4 h-4 inline mr-1" />How long do you plan to stay?</Label>
          <Input type="number" value={formData.timeHorizon}
            onChange={(e) => setFormData({ ...formData, timeHorizon: parseInt(e.target.value) || 0 })} />
          <p className="text-xs text-gray-500">years</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button variant="ghost" onClick={onSkip}>Skip</Button>
        <Button onClick={handleSubmit} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          Analyze <TrendingUp className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
