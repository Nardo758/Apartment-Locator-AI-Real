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

type Step = 'account-type' | 'properties' | 'monitoring' | 'plan' | 'payment';

export default function LandlordOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('account-type');
  const [accountType, setAccountType] = useState<'landlord' | 'property-manager' | 'agent'>('landlord');
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

  const steps: Step[] = ['account-type', 'properties', 'monitoring', 'plan', 'payment'];
  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const stepTitles: Record<Step, string> = {
    'account-type': 'Account Type',
    'properties': 'Add Properties',
    'monitoring': 'Monitoring Areas',
    'plan': 'Choose Plan',
    'payment': 'Payment'
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
          {/* Step 1: Account Type */}
          {step === 'account-type' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                What best describes you?
              </h2>
              <p className="text-white/60 mb-8">
                This helps us customize your experience
              </p>

              <div className="grid gap-4">
                {[
                  {
                    id: 'landlord',
                    icon: <Home className="w-8 h-8" />,
                    title: 'Individual Landlord',
                    description: 'I own and rent out 1-10 properties'
                  },
                  {
                    id: 'property-manager',
                    icon: <Building className="w-8 h-8" />,
                    title: 'Property Manager',
                    description: 'I manage 10+ properties for owners'
                  },
                  {
                    id: 'agent',
                    icon: <DollarSign className="w-8 h-8" />,
                    title: 'Real Estate Agent/Broker',
                    description: 'I help clients find and lease properties'
                  }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setAccountType(type.id as typeof accountType)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      accountType === type.id
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-white/10 hover:border-white/30 bg-white/5'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        accountType === type.id
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-white/5 text-white/60'
                      }`}>
                        {type.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {type.title}
                        </h3>
                        <p className="text-white/60 text-sm">
                          {type.description}
                        </p>
                      </div>
                      {accountType === type.id && (
                        <CheckCircle className="w-6 h-6 text-blue-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Add Properties */}
          {step === 'properties' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Add Your Properties
                  </h2>
                  <p className="text-white/60">
                    We'll monitor market conditions for each property
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
              <div className="p-6 rounded-xl border-2 border-dashed border-white/20 text-center">
                <Upload className="w-8 h-8 text-white/40 mx-auto mb-3" />
                <p className="text-white/60 text-sm mb-2">
                  Have many properties? Upload a CSV file
                </p>
                <Button variant="outline" size="sm">
                  Upload CSV
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Monitoring Areas */}
          {step === 'monitoring' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Which areas should we monitor?
              </h2>
              <p className="text-white/60 mb-8">
                We'll track competitor activity and market trends in these locations
              </p>

              <div className="space-y-6">
                <div>
                  <label className="label mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    ZIP Codes to Monitor
                  </label>
                  <Input
                    placeholder="78701, 78702, 78703"
                    value={monitoringZips}
                    onChange={(e) => setMonitoringZips(e.target.value)}
                  />
                  <p className="text-xs text-white/50 mt-2">
                    Enter comma-separated ZIP codes. We'll automatically include areas where your properties are located.
                  </p>
                </div>

                {/* Auto-detected areas */}
                <Card variant="glass" className="p-6">
                  <h3 className="text-sm font-semibold text-white/70 mb-3">
                    Auto-detected from your properties:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(properties.map(p => p.zipCode).filter(Boolean))).map((zip) => (
                      <Badge key={zip} variant="primary">
                        {zip}
                      </Badge>
                    ))}
                    {properties.every(p => !p.zipCode) && (
                      <p className="text-white/50 text-sm">
                        No ZIP codes added yet
                      </p>
                    )}
                  </div>
                </Card>

                {/* What we'll monitor */}
                <Card variant="highlighted" className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    What we'll track in these areas:
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      'Competitor pricing changes',
                      'New concessions & deals',
                      'Market rent trends',
                      'Days on market',
                      'New listings',
                      'Vacancy rates'
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-white/80 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Step 4: Choose Plan */}
          {step === 'plan' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Choose Your Plan
              </h2>
              <p className="text-white/60 mb-8">
                All plans include a 14-day free trial
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                {[
                  {
                    id: 'starter',
                    name: 'Starter',
                    price: 49,
                    maxProperties: 10,
                    features: ['Portfolio dashboard', 'Market comparison', 'Pricing alerts']
                  },
                  {
                    id: 'professional',
                    name: 'Professional',
                    price: 99,
                    maxProperties: 50,
                    popular: true,
                    features: ['Everything in Starter', 'Competitive alerts', 'Renewal optimizer']
                  },
                  {
                    id: 'enterprise',
                    name: 'Enterprise',
                    price: 199,
                    maxProperties: null,
                    features: ['Everything in Pro', 'Unlimited properties', 'API access']
                  }
                ].map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id as typeof selectedPlan)}
                    className={`p-6 rounded-xl border-2 transition-all text-left relative ${
                      selectedPlan === plan.id
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-white/10 hover:border-white/30 bg-white/5'
                    }`}
                  >
                    {plan.popular && (
                      <Badge variant="success" size="sm" className="absolute -top-3 left-1/2 -translate-x-1/2">
                        Popular
                      </Badge>
                    )}

                    <h3 className="text-xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    <div className="text-3xl font-bold text-white mb-1">
                      ${plan.price}
                      <span className="text-base text-white/60">/mo</span>
                    </div>
                    <p className="text-sm text-white/60 mb-4">
                      {plan.maxProperties ? `Up to ${plan.maxProperties} properties` : 'Unlimited properties'}
                    </p>

                    <div className="space-y-2 mb-4">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-white/70 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {selectedPlan === plan.id && (
                      <div className="flex items-center justify-center gap-2 text-blue-400 font-semibold">
                        <CheckCircle className="w-5 h-5" />
                        <span>Selected</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Property count check */}
              {properties.length > 10 && selectedPlan === 'starter' && (
                <Card variant="glass" className="p-4 border-yellow-500/30">
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-400 font-semibold mb-1">
                        You have {properties.length} properties
                      </p>
                      <p className="text-white/70 text-sm">
                        Starter plan supports up to 10 properties. Consider upgrading to Professional.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Step 5: Payment (Placeholder) */}
          {step === 'payment' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Start Your Free Trial
              </h2>
              <p className="text-white/60 mb-8">
                No credit card required • Cancel anytime
              </p>

              <Card variant="highlighted" className="p-8 text-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  You're All Set!
                </h3>
                <p className="text-white/70 mb-6">
                  Your 14-day free trial starts now. No payment required.
                </p>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Plan:</span>
                    <span className="text-white font-semibold">
                      {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} (${
                        selectedPlan === 'starter' ? 49 :
                        selectedPlan === 'professional' ? 99 : 199
                      }/month)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-white/60">Properties:</span>
                    <span className="text-white font-semibold">{properties.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
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
                We'll send you a reminder before your trial ends. Add payment details anytime from your account settings.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={() => {
                const prevIndex = currentStepIndex - 1;
                if (prevIndex >= 0) {
                  setStep(steps[prevIndex]);
                } else {
                  navigate('/landlord-pricing');
                }
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={() => {
                const nextIndex = currentStepIndex + 1;
                if (nextIndex < steps.length) {
                  setStep(steps[nextIndex]);
                }
              }}
              disabled={
                (step === 'properties' && properties.some(p => !p.address || !p.city || !p.currentRent))
              }
            >
              {step === 'payment' ? 'Complete Setup' : 'Continue'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
