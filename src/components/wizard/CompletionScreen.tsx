// Completion Screen
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUnifiedAI } from '@/contexts/UnifiedAIContext';

interface CompletionScreenProps {
  onContinue: () => void;
}

export default function CompletionScreen({ onContinue }: CompletionScreenProps) {
  const { setupProgress, pointsOfInterest, budget, location } = useUnifiedAI();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-green-200 p-8 md:p-12 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          You're All Set! 🎉
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your AI-powered apartment search is ready to go
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-3xl font-bold text-blue-600">{setupProgress}%</p>
            <p className="text-sm text-gray-600">Setup Complete</p>
          </div>
          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
            <p className="text-3xl font-bold text-purple-600">{pointsOfInterest.length}</p>
            <p className="text-sm text-gray-600">Locations Added</p>
          </div>
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-3xl font-bold text-green-600">${(budget / 1000).toFixed(1)}k</p>
            <p className="text-sm text-gray-600">Monthly Budget</p>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 mb-8">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="text-left">
              <p className="font-semibold text-gray-900 mb-2">What's Next:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ We'll analyze apartments in {location || 'your area'}</li>
                <li>✓ Calculate True Costs (rent + location costs)</li>
                <li>✓ Rank by Smart Score (location + preferences + market)</li>
                <li>✓ Show you the best deals with negotiation tips</li>
              </ul>
            </div>
          </div>
        </div>

        <Button
          onClick={onContinue}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
