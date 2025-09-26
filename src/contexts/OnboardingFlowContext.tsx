import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingStep, OnboardingFlowData, defaultFlowData, defaultSteps, OnboardingFlowContextType } from './onboarding-flow-utils'
import { OnboardingFlowContext } from './onboarding-flow-context'

// use defaults from onboarding-flow-utils

// The context object is provided from `onboarding-flow-context.ts` to keep
// this file exporting only the provider component for fast-refresh safety.

interface OnboardingFlowProviderProps {
  children: ReactNode;
}

export const OnboardingFlowProvider: React.FC<OnboardingFlowProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  
  // Load from localStorage if available
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('onboardingCurrentStep');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [flowData, setFlowData] = useState<OnboardingFlowData>(() => {
    const saved = localStorage.getItem('onboardingFlowData');
    return saved ? { ...defaultFlowData, ...JSON.parse(saved) } : defaultFlowData;
  });
  
  const [steps, setSteps] = useState<OnboardingStep[]>(() => {
    const saved = localStorage.getItem('onboardingSteps');
    return saved ? JSON.parse(saved) : defaultSteps;
  });
  
  const totalSteps = steps.length;
  const isComplete = steps.every(step => step.completed || !step.required);
  
  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('onboardingCurrentStep', currentStep.toString());
  }, [currentStep]);
  
  useEffect(() => {
    localStorage.setItem('onboardingFlowData', JSON.stringify(flowData));
  }, [flowData]);
  
  useEffect(() => {
    localStorage.setItem('onboardingSteps', JSON.stringify(steps));
  }, [steps]);
  
  // Check if current step can proceed
  const canProceed = (() => {
    const currentStepData = steps[currentStep];
    if (!currentStepData) return false;
    
    switch (currentStepData.id) {
      case 'location':
        return flowData.location.length > 0;
      case 'points-of-interest':
        return flowData.pointsOfInterest.length >= 1; // At least one POI
      case 'budget-housing':
        return flowData.budget > 0 && flowData.bedrooms.length > 0;
      case 'preferences':
        return true; // Optional step
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
    // Mark all required steps as complete
    setSteps(prevSteps => 
      prevSteps.map(step => ({ ...step, completed: true }))
    );
    
    // Clear localStorage for onboarding
    localStorage.removeItem('onboardingCurrentStep');
    localStorage.removeItem('onboardingSteps');
    
    // Navigate to dashboard
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