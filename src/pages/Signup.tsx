import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';

// Import step components
import CurrentLivingSituation from '@/components/signup/CurrentLivingSituation';
import BudgetAndIncome from '@/components/signup/BudgetAndIncome';
import ImportantLocations from '@/components/signup/ImportantLocations';
import HousingPreferences from '@/components/signup/HousingPreferences';
import FinalDetails from '@/components/signup/FinalDetails';

export interface SignupFormData {
  // Current Living Situation
  currentAddress: string;
  currentRent: number;
  leaseExpiration: string;
  leaseDuration: string;
  moveFlexibility: string;

  // Budget & Income
  grossIncome: number;
  maxBudget: number;
  creditScore: string;
  incomeVerified: boolean;

  // Important Locations
  workAddress: string;
  workSchedule: string;
  maxCommute: number;
  transportation: string;
  otherLocations: Array<{
    name: string;
    address: string;
    importance: 'high' | 'medium' | 'low';
  }>;
  employmentType: string;
  workFrequency: string;

  // Housing Preferences
  minBedrooms: string;
  householdSize: string;
  amenities: string[];
  dealBreakers: string[];
  petInfo: string;

  // Final Details
  neighborhoods: string;
  rentalHistory: string;
  negotiationComfort: string;
  communication: string[];
  additionalNotes: string;
}

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SignupFormData>({
    currentAddress: '',
    currentRent: 0,
    leaseExpiration: '',
    leaseDuration: '',
    moveFlexibility: '',
    grossIncome: 0,
    maxBudget: 0,
    creditScore: '',
    incomeVerified: false,
    workAddress: '',
    workSchedule: '',
    maxCommute: 30,
    transportation: '',
    otherLocations: [],
    employmentType: '',
    workFrequency: '',
    minBedrooms: '',
    householdSize: '',
    amenities: [],
    dealBreakers: [],
    petInfo: '',
    neighborhoods: '',
    rentalHistory: '',
    negotiationComfort: '',
    communication: [],
    additionalNotes: ''
  });

  const totalSteps = 5;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const stepTitles = [
    'Current Living Situation',
    'Budget & Income',
    'Important Locations',
    'Housing Preferences',
    'Almost Done!'
  ];

  const stepSubtitles = [
    'Tell us about your current rental so our AI can find you better deals',
    'Help us understand your financial situation to find the best deals within your range',
    'Tell us about places you visit regularly so we can optimize your commute times',
    'Your preferences help our AI find properties that truly fit your lifestyle',
    'A few final details to optimize your rental search experience'
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Handle form completion
    console.log('Form completed:', formData);
    // Redirect to dashboard or show success message
  };

  const updateFormData = (data: Partial<SignupFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <CurrentLivingSituation data={formData} onUpdate={updateFormData} />;
      case 2:
        return <BudgetAndIncome data={formData} onUpdate={updateFormData} />;
      case 3:
        return <ImportantLocations data={formData} onUpdate={updateFormData} />;
      case 4:
        return <HousingPreferences data={formData} onUpdate={updateFormData} />;
      case 5:
        return <FinalDetails data={formData} onUpdate={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-animated">{/* Static gradient background */}
      {/* Header */}
      <header className="pt-8 pb-4 px-6">
        <div className="max-w-2xl mx-auto">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft size={20} className="mr-2" />
            Back to home
          </Link>
          
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-foreground">
                {stepTitles[currentStep - 1]}
              </h1>
              <span className="text-sm text-muted-foreground">
                {currentStep} of {totalSteps}
              </span>
            </div>
            <p className="text-muted-foreground mb-6">
              {stepSubtitles[currentStep - 1]}
            </p>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </header>

      {/* Form Content */}
      <main className="pb-8 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="glass-dark rounded-xl p-8 mb-8">
            {renderCurrentStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="glass border-border/20 hover:bg-muted/20"
            >
              <ArrowLeft size={16} className="mr-2" />
              Previous
            </Button>

            {currentStep === totalSteps ? (
              <Button onClick={handleComplete} className="btn-primary">
                Complete Setup
                <ArrowRight size={16} className="ml-2" />
              </Button>
            ) : (
              <Button onClick={handleNext} className="btn-primary">
                Next
                <ArrowRight size={16} className="ml-2" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Signup;