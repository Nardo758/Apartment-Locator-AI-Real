// ============================================
// SETUP PROGRESS BAR
// Shows user's progress through 5-step setup
// Displayed on Dashboard
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Car,
  TrendingUp,
  Brain,
  CheckCircle2,
  Circle,
  ChevronRight,
  X,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useSetupProgress } from '@/contexts/UnifiedAIContext';
import { SETUP_STEPS } from '@/types/unifiedAI.types';

const STEP_ICONS = {
  1: MapPin,
  2: Navigation,
  3: Car,
  4: TrendingUp,
  5: Brain,
};

export default function SetupProgressBar() {
  const { setupProgress, completedSteps, missingInputs, hasCompletedSetup } = useSetupProgress();
  const [isExpanded, setIsExpanded] = useState(!hasCompletedSetup);
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  // Don't show if dismissed or 100% complete
  if (isDismissed || (hasCompletedSetup && setupProgress === 100)) {
    return null;
  }

  const requiredSteps = SETUP_STEPS.filter(s => s.required);
  const completedRequired = completedSteps.filter(id => {
    const step = SETUP_STEPS.find(s => s.id === id);
    return step?.required;
  }).length;

  const totalOptional = SETUP_STEPS.filter(s => !s.required).length;
  const completedOptional = completedSteps.filter(id => {
    const step = SETUP_STEPS.find(s => s.id === id);
    return !step?.required;
  }).length;

  return (
    <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-lg">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              hasCompletedSetup 
                ? 'bg-green-500' 
                : 'bg-gradient-to-br from-blue-500 to-purple-500'
            }`}>
              {hasCompletedSetup ? (
                <CheckCircle2 className="w-5 h-5 text-white" />
              ) : (
                <Brain className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {hasCompletedSetup ? 'Setup Complete! 🎉' : 'AI Setup Progress'}
              </h3>
              <p className="text-sm text-gray-600">
                {hasCompletedSetup 
                  ? 'You\'re ready for smart recommendations'
                  : `${completedRequired}/${requiredSteps.length} required steps • ${completedOptional}/${totalOptional} optional`
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasCompletedSetup && (
              <Badge className="bg-green-500 text-white">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Ready
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </Button>
            {hasCompletedSetup && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDismissed(true)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">
              {setupProgress}% Complete
            </span>
            {!hasCompletedSetup && (
              <span className="text-xs text-gray-500">
                ~{SETUP_STEPS.filter(s => s.required && !completedSteps.includes(s.id))
                  .reduce((sum, s) => sum + s.estimatedMinutes, 0)} min remaining
              </span>
            )}
          </div>
          <Progress value={setupProgress} className="h-2" />
        </div>

        {/* Expanded: Step Details */}
        {isExpanded && (
          <div className="space-y-2">
            {/* Steps */}
            <div className="grid gap-2">
              {SETUP_STEPS.map((step) => {
                const isComplete = completedSteps.includes(step.id);
                const Icon = STEP_ICONS[step.id as keyof typeof STEP_ICONS];
                
                return (
                  <button
                    key={step.id}
                    onClick={() => navigate('/program-ai')}
                    className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all hover:scale-[1.02] ${
                      isComplete
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-white border border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {/* Status Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isComplete
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}>
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Step Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      isComplete
                        ? 'bg-green-500'
                        : 'bg-gradient-to-br from-blue-500 to-purple-500'
                    }`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    
                    {/* Step Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${
                          isComplete ? 'text-green-700' : 'text-gray-900'
                        }`}>
                          {step.title}
                        </span>
                        {!step.required && (
                          <Badge variant="outline" className="text-xs">
                            Optional
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{step.description}</p>
                      {!isComplete && (
                        <p className="text-xs text-gray-500 mt-1">
                          ~{step.estimatedMinutes} min
                        </p>
                      )}
                    </div>
                    
                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Missing Inputs Warning */}
            {missingInputs.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-1">
                      To get accurate recommendations:
                    </p>
                    <ul className="text-sm text-amber-800 space-y-1">
                      {missingInputs.map((input, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span>•</span>
                          <span>{input}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            {!hasCompletedSetup && (
              <Button
                onClick={() => navigate('/program-ai')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Brain className="w-4 h-4 mr-2" />
                Complete Setup ({setupProgress}%)
              </Button>
            )}

            {hasCompletedSetup && completedOptional < totalOptional && (
              <Button
                onClick={() => navigate('/program-ai')}
                variant="outline"
                className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Complete Optional Steps for Better Results
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
