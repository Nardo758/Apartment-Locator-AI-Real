import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Sparkles, MapPin, Home, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface SignupFormData {
  // Essential only - progressive disclosure
  email: string;
  budget: number;
  location: string;
  moveDate: string;
  // Optional advanced preferences
  workAddress?: string;
  bedrooms?: string;
  amenities?: string[];
  dealBreakers?: string[];
}

const SignupNew = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    budget: 0,
    location: '',
    moveDate: '',
    bedrooms: '1',
    amenities: [],
    dealBreakers: []
  });

  const totalSteps = 3; // Reduced from 5 to 3
  const progressPercentage = (currentStep / totalSteps) * 100;

  const steps = [
    {
      title: "Let's find your perfect home",
      subtitle: "Tell us your basic needs so our AI can get started",
      icon: Home,
      fields: ['email', 'budget', 'location', 'moveDate']
    },
    {
      title: "Optimize your search",
      subtitle: "Help our AI understand your lifestyle and priorities",
      icon: Sparkles,
      fields: ['workAddress', 'bedrooms', 'amenities']
    },
    {
      title: "Final touches",
      subtitle: "Set your deal-breakers so we don't waste your time",
      icon: CheckCircle,
      fields: ['dealBreakers']
    }
  ];

  // Smart defaults and suggestions
  const budgetRanges = [
    { label: 'Under $1,500', value: 1500 },
    { label: '$1,500 - $2,500', value: 2000 },
    { label: '$2,500 - $3,500', value: 3000 },
    { label: '$3,500 - $5,000', value: 4250 },
    { label: 'Over $5,000', value: 6000 }
  ];

  const popularAmenities = [
    'Parking', 'Pet-friendly', 'Gym', 'Pool', 'Laundry', 'Balcony',
    'AC/Heating', 'Dishwasher', 'Walk-in Closet', 'High-speed Internet'
  ];

  const commonDealBreakers = [
    'No parking', 'No pets', 'Ground floor', 'No AC', 'Shared laundry',
    'No dishwasher', 'Long commute', 'Noisy area'
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

  const updateFormData = (field: keyof SignupFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'amenities' | 'dealBreakers', item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.includes(item) 
        ? prev[field].filter(i => i !== item)
        : [...(prev[field] || []), item]
    }));
  };

  const handleComplete = async () => {
    try {
      // Simplified data structure for quicker onboarding
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          email: formData.email,
          max_budget: formData.budget,
          preferred_location: formData.location,
          move_date: formData.moveDate,
          work_address: formData.workAddress || '',
          min_bedrooms: formData.bedrooms || '1',
          amenities: formData.amenities || [],
          deal_breakers: formData.dealBreakers || [],
          ai_preferences: {
            quickStart: true,
            progressiveDisclosure: true,
            budgetOptimized: formData.budget > 0
          }
        });

      if (error) throw error;
      
      // Redirect to dashboard immediately
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const renderStep = () => {
    const currentStepData = steps[currentStep - 1];
    const StepIcon = currentStepData.icon;

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <StepIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{currentStepData.title}</h2>
              <p className="text-muted-foreground">{currentStepData.subtitle}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="your@email.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="budget">Monthly budget</Label>
                <Select onValueChange={(value) => updateFormData('budget', parseInt(value))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value.toString()}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Preferred area</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="e.g., Austin, TX or Downtown Seattle"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="moveDate">When do you want to move?</Label>
                <Select onValueChange={(value) => updateFormData('moveDate', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">ASAP (Next 30 days)</SelectItem>
                    <SelectItem value="flexible">Flexible (1-3 months)</SelectItem>
                    <SelectItem value="planning">Planning ahead (3+ months)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <StepIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{currentStepData.title}</h2>
              <p className="text-muted-foreground">{currentStepData.subtitle}</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="workAddress">Work or school address (optional)</Label>
                <Input
                  id="workAddress"
                  value={formData.workAddress || ''}
                  onChange={(e) => updateFormData('workAddress', e.target.value)}
                  placeholder="123 Main St, City, State"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Helps us find places with good commute times
                </p>
              </div>

              <div>
                <Label>Minimum bedrooms</Label>
                <div className="flex gap-2 mt-2">
                  {['Studio', '1', '2', '3+'].map((bed) => (
                    <Button
                      key={bed}
                      variant={formData.bedrooms === bed ? "default" : "outline"}
                      onClick={() => updateFormData('bedrooms', bed)}
                      className="flex-1"
                    >
                      {bed}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Must-have amenities (optional)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {popularAmenities.map((amenity) => (
                    <Badge
                      key={amenity}
                      variant={formData.amenities?.includes(amenity) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => toggleArrayItem('amenities', amenity)}
                    >
                      {amenity}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Select amenities you can't live without
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <StepIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{currentStepData.title}</h2>
              <p className="text-muted-foreground">{currentStepData.subtitle}</p>
            </div>

            <div>
              <Label>Deal breakers (optional)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {commonDealBreakers.map((dealBreaker) => (
                  <Badge
                    key={dealBreaker}
                    variant={formData.dealBreakers?.includes(dealBreaker) ? "destructive" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem('dealBreakers', dealBreaker)}
                  >
                    {dealBreaker}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                These will help us filter out unsuitable properties
              </p>
            </div>

            <div className="bg-muted/20 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-foreground mb-2">🎉 Almost done!</h3>
              <p className="text-sm text-muted-foreground">
                Our AI will start analyzing properties in your area immediately. 
                You can always update your preferences later from your dashboard.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="pt-8 pb-4 px-6">
        <div className="max-w-lg mx-auto">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft size={20} className="mr-2" />
            Back to home
          </Link>
          
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </header>

      {/* Form Content */}
      <main className="pb-8 px-6">
        <div className="max-w-lg mx-auto">
          <div className="glass-dark rounded-xl p-8 mb-8">
            {renderStep()}
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
                Start Finding Homes
                <Sparkles size={16} className="ml-2" />
              </Button>
            ) : (
              <Button onClick={handleNext} className="btn-primary">
                Continue
                <ArrowRight size={16} className="ml-2" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignupNew;