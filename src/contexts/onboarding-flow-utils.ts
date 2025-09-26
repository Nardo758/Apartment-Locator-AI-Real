export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

export interface OnboardingFlowData {
  location: string;
  searchRadius: number;
  maxDriveTime: number;
  pointsOfInterest: Array<{
    id: string;
    name: string;
    address: string;
    category: 'work' | 'gym' | 'school' | 'shopping' | 'custom';
    priority: 'high' | 'medium' | 'low';
    maxTime: number;
    transportMode: 'driving' | 'transit' | 'walking' | 'biking';
  }>;
  budget: number;
  bedrooms: string;
  amenities: string[];
  dealBreakers: string[];
  lifestyle: string;
  workSchedule: string;
  priorities: string[];
  bio: string;
  useCase: string;
  additionalNotes: string;
}

export const defaultFlowData: OnboardingFlowData = {
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
}

export const defaultSteps: OnboardingStep[] = [
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
]

export interface OnboardingFlowContextType {
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
  flowData: OnboardingFlowData;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (stepIndex: number) => void;
  completeOnboarding: () => void;
  updateFlowData: (data: Partial<OnboardingFlowData>) => void;
  resetFlow: () => void;
  steps: OnboardingStep[];
  canProceed: boolean;
  markStepComplete: (stepId: string) => void;
}
