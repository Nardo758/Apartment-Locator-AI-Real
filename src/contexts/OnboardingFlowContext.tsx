import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingStep, OnboardingFlowData, defaultFlowData, defaultSteps, OnboardingFlowContextType } from './onboarding-flow-utils'
import { OnboardingFlowContext } from './onboarding-flow-context'

interface OnboardingFlowProviderProps {
  children: ReactNode;
}

function safeParseInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  try {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function safeParseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export const OnboardingFlowProvider: React.FC<OnboardingFlowProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(() => {
    return safeParseInt(localStorage.getItem('onboardingCurrentStep'), 0);
  });
  
  const [flowData, setFlowData] = useState<OnboardingFlowData>(() => {
    const saved = safeParseJSON<Partial<OnboardingFlowData>>(localStorage.getItem('onboardingFlowData'), {});
    return { ...defaultFlowData, ...saved };
  });
  
  const [steps, setSteps] = useState<OnboardingStep[]>(() => {
    return safeParseJSON<OnboardingStep[]>(localStorage.getItem('onboardingSteps'), defaultSteps);
  });
  
  const totalSteps = steps.length;
  const isComplete = steps.every(step => step.completed || !step.required);
  
  useEffect(() => {
    localStorage.setItem('onboardingCurrentStep', currentStep.toString());
  }, [currentStep]);
  
  useEffect(() => {
    localStorage.setItem('onboardingFlowData', JSON.stringify(flowData));
  }, [flowData]);
  
  useEffect(() => {
    localStorage.setItem('onboardingSteps', JSON.stringify(steps));
  }, [steps]);
  
  const canProceed = (() => {
    const currentStepData = steps[currentStep];
    if (!currentStepData) return false;
    
    switch (currentStepData.id) {
      case 'location':
        return flowData.location.length > 0;
      case 'points-of-interest':
        return flowData.pointsOfInterest.length >= 1;
      case 'budget-housing':
        return flowData.budget > 0 && flowData.bedrooms.length > 0;
      case 'preferences':
        return true;
      default:
        return true;
    }
  })();
  
  const nextStep = () => {
    if (currentStep < totalSteps - 1 && canProceed) {
      markStepComplete(steps[currentStep].id);
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      setCurrentStep(stepIndex);
    }
  };
  
  const markStepComplete = (stepId: string) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };
  
  const completeOnboarding = () => {
    setSteps(prevSteps => 
      prevSteps.map(step => ({ ...step, completed: true }))
    );
    
    localStorage.removeItem('onboardingCurrentStep');
    localStorage.removeItem('onboardingSteps');
    
    navigate('/dashboard');
  };
  
  const updateFlowData = (data: Partial<OnboardingFlowData>) => {
    setFlowData(prev => ({ ...prev, ...data }));
  };
  
  const resetFlow = () => {
    setCurrentStep(0);
    setFlowData(defaultFlowData);
    setSteps(defaultSteps);
    localStorage.removeItem('onboardingCurrentStep');
    localStorage.removeItem('onboardingFlowData');
    localStorage.removeItem('onboardingSteps');
  };
  
  const value: OnboardingFlowContextType = {
    currentStep,
    totalSteps,
    isComplete,
    flowData,
    nextStep,
    previousStep,
    goToStep,
    completeOnboarding,
    updateFlowData,
    resetFlow,
    steps,
    canProceed,
    markStepComplete
  };
  
  return (
    <OnboardingFlowContext.Provider value={value}>
      {children}
    </OnboardingFlowContext.Provider>
  );
};
