import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building,
  Home,
  DollarSign,
  MapPin,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Upload
} from 'lucide-react';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  currentRent: string;
  bedrooms: string;
  bathrooms: string;
}

type Step = 'properties' | 'complete';

export default function LandlordOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('properties');
  // Get account type from user type selection (stored in localStorage)
  const accountType = localStorage.getItem('userType') || 'landlord';
  const [properties, setProperties] = useState<Property[]>([
    {
      id: '1',
      address: '',
      city: '',
      state: 'TX',
      zipCode: '',
      currentRent: '',
      bedrooms: '2',
      bathrooms: '2'
    }
  ]);
  const [monitoringZips, setMonitoringZips] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional' | 'enterprise'>('starter');

  const addProperty = () => {
    setProperties([
      ...properties,
      {
        id: Date.now().toString(),
        address: '',
        city: '',
        state: 'TX',
        zipCode: '',
        currentRent: '',
        bedrooms: '2',
        bathrooms: '2'
      }
    ]);
  };

  const removeProperty = (id: string) => {
    if (properties.length > 1) {
      setProperties(properties.filter(p => p.id !== id));
    }
  };

  const updateProperty = (id: string, field: keyof Property, value: string) => {
    setProperties(properties.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const steps: Step[] = ['properties', 'complete'];
  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const stepTitles: Record<Step, string> = {
    'properties': 'Setup Your Account',
    'complete': 'All Set!'
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">
              Get Started
            </h1>
            <Badge variant="primary">
              Step {currentStepIndex + 1} of {steps.length}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step Labels */}
          <div className="flex items-center justify-between mt-3 text-xs text-white/50">
            {steps.map((s, idx) => (
              <div
                key={s}
                className={`${
                  idx <= currentStepIndex ? 'text-blue-400 font-semibold' : ''
                }`}
              >
                {stepTitles[s]}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card variant="elevated" className="p-8">
          {/* Step 1: Add Properties & Monitoring */}
          {step === 'properties' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Add Your Properties (Optional)
                  </h2>
                  <p className="text-white/60">
                    We'll monitor market conditions for each property. You can add these later.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addProperty}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another
                </Button>
              </div>

              <div className="space-y-6 mb-6">
                {properties.map((property, idx) => (
                  <Card key={property.id} variant="glass" className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Property {idx + 1}
                      </h3>
                      {properties.length > 1 && (
                        <button
                          onClick={() => removeProperty(property.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="label mb-2">Street Address</label>
                        <Input
                          placeholder="1234 Main St, Unit 205"
                          value={property.address}
                          onChange={(e) => updateProperty(property.id, 'address', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="label mb-2">City</label>
                        <Input
                          placeholder="Austin"
                          value={property.city}
                          onChange={(e) => updateProperty(property.id, 'city', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="label mb-2">ZIP Code</label>
                        <Input
                          placeholder="78701"
                          value={property.zipCode}
                          onChange={(e) => updateProperty(property.id, 'zipCode', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="label mb-2">Current Rent</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">$</span>
                          <Input
                            type="number"
                            placeholder="2000"
                            value={property.currentRent}
                            onChange={(e) => updateProperty(property.id, 'currentRent', e.target.value)}
                            className="pl-8"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label mb-2">Bedrooms</label>
                          <select
                            value={property.bedrooms}
                            onChange={(e) => updateProperty(property.id, 'bedrooms', e.target.value)}
                            className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/20 text-white"
                          >
                            <option value="studio">Studio</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4+">4+</option>
                          </select>
                        </div>
                        <div>
                          <label className="label mb-2">Bathrooms</label>
                          <select
                            value={property.bathrooms}
                            onChange={(e) => updateProperty(property.id, 'bathrooms', e.target.value)}
                            className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/20 text-white"
                          >
                            <option value="1">1</option>
                            <option value="1.5">1.5</option>
                            <option value="2">2</option>
                            <option value="2.5">2.5</option>
                            <option value="3+">3+</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Bulk Upload */}
              <div className="p-6 rounded-xl border-2 border-dashed border-white/20 text-center mb-8">
                <Upload className="w-8 h-8 text-white/40 mx-auto mb-3" />
                <p className="text-white/60 text-sm mb-2">
                  Have many properties? Upload a CSV file
                </p>
                <Button variant="outline" size="sm">
                  Upload CSV
                </Button>
              </div>

              {/* Monitoring Areas */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Which areas should we monitor? (Optional)
                  </h3>
                  <p className="text-white/60 text-sm mb-4">
                    We'll track competitor activity and market trends
                  </p>
                  <label className="label mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Additional ZIP Codes to Monitor
                  </label>
                  <Input
                    placeholder="78701, 78702, 78703"
                    value={monitoringZips}
                    onChange={(e) => setMonitoringZips(e.target.value)}
                  />
                  <p className="text-xs text-white/50 mt-2">
                    We'll automatically monitor areas where your properties are located
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Complete */}
          {step === 'complete' && (
            <div>
              <Card variant="highlighted" className="p-8 text-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  You're All Set!
                </h3>
                <p className="text-white/70 mb-6">
                  Your 14-day free trial starts now. No credit card required.
                </p>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-6 text-left">
                  {properties.some(p => p.address) && (
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-white/60">Properties added:</span>
                      <span className="text-white font-semibold">
                        {properties.filter(p => p.address).length}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Trial ends:</span>
                    <span className="text-white font-semibold">
                      {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                  onClick={() => navigate('/portfolio-dashboard')}
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Card>

              <p className="text-xs text-white/50 text-center">
                You can add properties, choose a plan, and add payment details later from your dashboard.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          {step !== 'complete' && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={() => navigate('/user-type')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setStep('complete')}
                >
                  Skip for Now
                </Button>
                <Button
                  onClick={() => setStep('complete')}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
