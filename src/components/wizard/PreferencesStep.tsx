// Preferences Step (Step 5) - Optional
import { useState } from 'react';
import { CheckCircle2, X, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useUnifiedAI } from '@/contexts/UnifiedAIContext';

interface PreferencesStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const COMMON_AMENITIES = ['Pool', 'Gym', 'Parking', 'Pet-Friendly', 'Balcony', 'Washer/Dryer', 'Dishwasher', 'A/C', 'Elevator'];
const COMMON_DEALBREAKERS = ['No Parking', 'No Pets', 'Ground Floor', 'No A/C', 'Noisy Area'];

export default function PreferencesStep({ onNext, onBack, onSkip }: PreferencesStepProps) {
  const { aiPreferences, updateInputs } = useUnifiedAI();
  const [amenities, setAmenities] = useState<string[]>(aiPreferences.amenities || []);
  const [dealBreakers, setDealBreakers] = useState<string[]>(aiPreferences.dealBreakers || []);
  const [notes, setNotes] = useState(aiPreferences.additionalNotes || '');

  const toggleAmenity = (item: string) => {
    setAmenities(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const toggleDealBreaker = (item: string) => {
    setDealBreakers(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleSubmit = () => {
    updateInputs({
      aiPreferences: {
        ...aiPreferences,
        amenities,
        dealBreakers,
        additionalNotes: notes,
      },
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          AI Preferences <span className="text-sm text-gray-500">(Optional)</span>
        </h2>
        <p className="text-gray-600">Fine-tune your search for better matches</p>
      </div>

      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          Must-have amenities:
        </Label>
        <div className="flex flex-wrap gap-2">
          {COMMON_AMENITIES.map(item => (
            <Badge
              key={item}
              variant={amenities.includes(item) ? 'default' : 'outline'}
              className={`cursor-pointer ${amenities.includes(item) ? 'bg-green-500' : ''}`}
              onClick={() => toggleAmenity(item)}
            >
              {item}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <X className="w-4 h-4 text-red-600" />
          Deal breakers:
        </Label>
        <div className="flex flex-wrap gap-2">
          {COMMON_DEALBREAKERS.map(item => (
            <Badge
              key={item}
              variant={dealBreakers.includes(item) ? 'default' : 'outline'}
              className={`cursor-pointer ${dealBreakers.includes(item) ? 'bg-red-500' : ''}`}
              onClick={() => toggleDealBreaker(item)}
            >
              {item}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Additional notes:</Label>
        <Textarea
          placeholder="Looking for dog-friendly, quiet neighborhood..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button variant="ghost" onClick={onSkip}>Skip</Button>
        <Button onClick={handleSubmit} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          Complete Setup <Brain className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
