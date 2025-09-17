import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

export interface OnboardingFlowData {
  // Location & Search
  location: string;
  searchRadius: number;
  maxDriveTime: number;
  
  // Points of Interest
  pointsOfInterest: Array<{
    id: string;
    name: string;
    address: string;
    category: 'work' | 'gym' | 'school' | 'shopping' | 'custom';
    priority: 'high' | 'medium' | 'low';
    maxTime: number;
    transportMode: 'driving' | 'transit' | 'walking' | 'biking';
  }>;
  
  // Budget & Housing
  budget: number;
  bedrooms: string;
  amenities: string[];
  dealBreakers: string[];
  
  // Lifestyle & Preferences
  lifestyle: string;
  workSchedule: string;
  priorities: string[];
  
  // Additional Info
  bio: string;
  useCase: string;
  additionalNotes: string;
}

interface OnboardingFlowContextType {
  // Flow state
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
  flowData: OnboardingFlowData;
  
  // Flow control
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (stepIndex: number) => void;
  completeOnboarding: () => void;
  
  // Data management
  updateFlowData: (data: Partial<OnboardingFlowData>) => void;
  resetFlow: () => void;
  
  // Step management
  steps: OnboardingStep[];
  canProceed: boolean;
  markStepComplete: (stepId: string) => void;
}

const defaultFlowData: OnboardingFlowData = {
  location: '',
  searchRadius: 25,
  maxDriveTime: 30,
  pointsOfInterest: [],
  budget: 2500,
  bedrooms: '1',
  amenities: [],
  dealBreakers: [],
  lifestyle: '',
  workSchedule: '',
  priorities: [],
  bio: '',
  useCase: '',
  additionalNotes: ''
};

const defaultSteps: OnboardingStep[] = [
  {
    id: 'location',
    title: 'Search Location',
    description: 'Set your preferred area and search radius',
    completed: false,
    required: true
  },
  {
    id: 'points-of-interest',
    title: 'Important Places',
    description: 'Add your work, gym, and other key locations',
    completed: false,
    required: true
  },
  {
    id: 'budget-housing',
    title: 'Budget & Housing',
    description: 'Set your budget and housing preferences',
    completed: false,
    required: true
  },
  {
    id: 'preferences',
    title: 'Lifestyle & Preferences',
    description: 'Tell us about your lifestyle and priorities',
    completed: false,
    required: false
  }
];

const OnboardingFlowContext = createContext<OnboardingFlowContextType | null>(null);

export const useOnboardingFlow = () => {
  const context = useContext(OnboardingFlowContext);
  if (!context) {
    throw new Error('useOnboardingFlow must be used within OnboardingFlowProvider');
  }
  return context;
};

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