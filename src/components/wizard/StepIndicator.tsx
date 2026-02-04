// ============================================
// STEP INDICATOR
// Progress dots for setup wizard
// ============================================

import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
}

export default function StepIndicator({
  currentStep,
  totalSteps,
  completedSteps,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
        const isCompleted = completedSteps.includes(step);
        const isCurrent = step === currentStep;
        const isClickable = isCompleted || step <= currentStep;

        return (
          <button
            key={step}
            onClick={() => isClickable && onStepClick?.(step)}
            disabled={!isClickable}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              isCurrent
                ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white scale-110 shadow-lg'
                : isCompleted
                ? 'bg-green-500 text-white hover:scale-105'
                : 'bg-gray-200 text-gray-500'
            } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
          >
            {isCompleted ? <Check className="w-5 h-5" /> : step}
          </button>
        );
      })}
    </div>
  );
}

// Text version for mobile
export function StepIndicatorText({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="text-center">
      <p className="text-sm text-gray-600">
        Step <span className="font-bold text-gray-900">{currentStep}</span> of {totalSteps}
      </p>
    </div>
  );
}
