// ============================================
// SETUP WIZARD
// 5-step guided onboarding for unified AI
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUnifiedAI } from '@/contexts/UnifiedAIContext';
import StepIndicator, { StepIndicatorText } from '@/components/wizard/StepIndicator';
import { SETUP_STEPS } from '@/types/unifiedAI.types';
import BasicSearchStep from '@/components/wizard/BasicSearchStep';
import POIStep from '@/components/wizard/POIStep';
import LifestyleStep from '@/components/wizard/LifestyleStep';
import MarketIntelStep from '@/components/wizard/MarketIntelStep';
import PreferencesStep from '@/components/wizard/PreferencesStep';
import CompletionScreen from '@/components/wizard/CompletionScreen';

export default function SetupWizard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setupProgress, completedSteps, updateInputs } = useUnifiedAI();
  
  // Start from specific step if passed via navigation state
  const startStep = location.state?.startStep || 1;
  const [currentStep, setCurrentStep] = useState(startStep);
  const [isComplete, setIsComplete] = useState(false);

  const currentStepData = SETUP_STEPS.find(s => s.id === currentStep);
  const progress = Math.round((currentStep / SETUP_STEPS.length) * 100);

  // Check if current step is valid
  useEffect(() => {
    if (currentStep > SETUP_STEPS.length) {
      setIsComplete(true);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < SETUP_STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsComplete(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExit = () => {
    navigate('/dashboard');
  };

  const handleComplete = () => {
    navigate('/dashboard');
  };

  if (isComplete) {
    return <CompletionScreen onContinue={handleComplete} />;
  }

  // Render current step component
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicSearchStep onNext={handleNext} />;
      case 2:
        return <POIStep onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <LifestyleStep onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <MarketIntelStep onNext={handleNext} onBack={handleBack} onSkip={handleSkip} />;
      case 5:
        return <PreferencesStep onNext={handleNext} onBack={handleBack} onSkip={handleSkip} />;
      default:
        return <BasicSearchStep onNext={handleNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                AI
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">AI Setup Wizard</h1>
                <p className="text-xs text-gray-600">Let's personalize your apartment search</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExit}
              className="text-gray-600"
            >
              <X className="w-4 h-4 mr-1" />
              Exit
            </Button>
          </div>

          {/* Desktop: Step Dots */}
          <div className="hidden md:block mb-3">
            <StepIndicator
              currentStep={currentStep}
              totalSteps={SETUP_STEPS.length}
              completedSteps={completedSteps}
              onStepClick={handleStepClick}
            />
          </div>

          {/* Mobile: Text */}
          <div className="md:hidden mb-3">
            <StepIndicatorText
              currentStep={currentStep}
              totalSteps={SETUP_STEPS.length}
            />
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">
                {currentStepData?.title}
                {!currentStepData?.required && (
                  <span className="text-gray-400 ml-1">(Optional)</span>
                )}
              </span>
              <span className="font-semibold text-gray-900">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500">
              ~{currentStepData?.estimatedMinutes || 0} min remaining in this step
            </p>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 md:p-8">
          {renderStep()}
        </div>
      </div>

      {/* Overall Progress (sticky bottom on mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-lg">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Overall Progress</span>
          <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            {setupProgress}% Complete
          </span>
        </div>
        <Progress value={setupProgress} className="h-1.5 mt-2" />
      </div>
    </div>
  );
}
