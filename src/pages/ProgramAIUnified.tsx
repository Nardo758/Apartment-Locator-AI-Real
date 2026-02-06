// ============================================
// PROGRAM AI - UNIFIED SETUP PAGE
// All user inputs in one place:
// - Basic Search, POIs, Lifestyle, Market Intel, Preferences
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, MapPin, Navigation, Car, TrendingUp, 
  Home, DollarSign, Plus, X, Save, ArrowRight,
  Briefcase, Dumbbell, ShoppingCart, Baby, GraduationCap,
  CheckCircle2, AlertCircle, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/Header';
import { useUnifiedAI } from '@/contexts/UnifiedAIContext';
import type { PointOfInterest } from '@/types/unifiedAI.types';
import { toast } from 'sonner';

const COMMON_AMENITIES = ['Pool', 'Gym', 'Parking', 'Pet-Friendly', 'Balcony', 'Washer/Dryer', 'Dishwasher', 'A/C', 'Elevator'];
const COMMON_DEALBREAKERS = ['No Parking', 'No Pets', 'Ground Floor', 'No A/C'];

const POI_CATEGORIES = [
  { value: 'work', label: 'Work', icon: Briefcase },
  { value: 'gym', label: 'Gym', icon: Dumbbell },
  { value: 'grocery', label: 'Grocery', icon: ShoppingCart },
  { value: 'daycare', label: 'Daycare', icon: Baby },
  { value: 'school', label: 'School', icon: GraduationCap },
];

export default function ProgramAIUnified() {
  const navigate = useNavigate();
  const {
    location, zipCode, budget, aiPreferences, pointsOfInterest,
    commutePreferences, marketContext, setupProgress, completedSteps,
    currentRentalRate, leaseExpirationDate,
    updateInputs, addPOI, removePOI, updateMarketContext
  } = useUnifiedAI();

  // Form state
  const [formData, setFormData] = useState({
    location: location || '',
    zipCode: zipCode || '',
    budget: budget || 2500,
    bedrooms: aiPreferences.bedrooms || '1',
    currentRentalRate: currentRentalRate || '',
    leaseExpirationDate: leaseExpirationDate || '',
  });

  const [newPOI, setNewPOI] = useState<Partial<PointOfInterest>>({
    name: '',
    address: '',
    category: 'work',
    priority: 'high',
  });

  const [lifestyleData, setLifestyleData] = useState({
    daysPerWeek: commutePreferences.daysPerWeek || 5,
    vehicleMpg: commutePreferences.vehicleMpg || 28,
    gasPrice: commutePreferences.gasPrice || 3.50,
    transitPass: commutePreferences.transitPass || 100,
    timeValuePerHour: commutePreferences.timeValuePerHour || 25,
  });

  const [marketData, setMarketData] = useState({
    annualIncome: marketContext?.annualIncome || 102000,
    currentSavings: marketContext?.currentSavings || 120000,
    timeHorizon: marketContext?.timeHorizon || 5,
  });

  const [amenities, setAmenities] = useState<string[]>(aiPreferences.amenities || []);
  const [dealBreakers, setDealBreakers] = useState<string[]>(aiPreferences.dealBreakers || []);
  const [additionalNotes, setAdditionalNotes] = useState(aiPreferences.additionalNotes || '');

  const [showPOIForm, setShowPOIForm] = useState(false);

  const handleSaveAll = () => {
    // Update all sections
    updateInputs({
      location: formData.location,
      zipCode: formData.zipCode,
      budget: formData.budget,
      currentRentalRate: formData.currentRentalRate ? Number(formData.currentRentalRate) : undefined,
      leaseExpirationDate: formData.leaseExpirationDate || undefined,
      aiPreferences: {
        ...aiPreferences,
        bedrooms: formData.bedrooms,
        amenities,
        dealBreakers,
        additionalNotes,
      },
      commutePreferences: {
        ...commutePreferences,
        daysPerWeek: lifestyleData.daysPerWeek,
        vehicleMpg: lifestyleData.vehicleMpg,
        gasPrice: lifestyleData.gasPrice,
        transitPass: lifestyleData.transitPass,
        timeValuePerHour: lifestyleData.timeValuePerHour,
      },
    });

    if (marketData.annualIncome > 0) {
      updateMarketContext({
        region: formData.location || 'Unknown',
        leverageScore: 72,
        daysOnMarket: 35,
        inventoryLevel: 2.8,
        rentTrend: 4.5,
        negotiationPower: 'strong',
        rentVsBuyRecommendation: 'rent',
        annualIncome: marketData.annualIncome,
        currentSavings: marketData.currentSavings,
        timeHorizon: marketData.timeHorizon,
        medianRent: 2200,
      });
    }

    toast.success('Setup saved successfully!');
    navigate('/dashboard');
  };

  const handleAddPOI = () => {
    if (newPOI.name && newPOI.address) {
      addPOI({
        id: `poi-${Date.now()}`,
        name: newPOI.name!,
        address: newPOI.address!,
        category: newPOI.category as any || 'work',
        priority: newPOI.priority as any || 'medium',
      });
      setNewPOI({ name: '', address: '', category: 'work', priority: 'high' });
      setShowPOIForm(false);
      toast.success('Location added!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            <Brain className="w-10 h-10 inline-block mr-3 text-purple-600" />
            Program Your AI
          </h1>
          <p className="text-lg text-gray-600">
            Tell us about yourself to get personalized apartment recommendations
          </p>
          
          {/* Progress */}
          <div className="mt-4 p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Setup Progress</span>
              <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {setupProgress}%
              </span>
            </div>
            <Progress value={setupProgress} className="h-2" />
            <div className="flex gap-2 mt-2 text-xs text-gray-600">
              {completedSteps.includes(1) && <Badge variant="outline" className="bg-green-50 text-green-700">✓ Basic</Badge>}
              {completedSteps.includes(2) && <Badge variant="outline" className="bg-green-50 text-green-700">✓ POIs</Badge>}
              {completedSteps.includes(3) && <Badge variant="outline" className="bg-green-50 text-green-700">✓ Lifestyle</Badge>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* SECTION 1: Basic Search */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              Basic Search
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City or Area</Label>
                <Input
                  placeholder="Austin, TX"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Zip Code (Optional)</Label>
                <Input
                  placeholder="78701"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="h-12"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label>Monthly Budget</Label>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                className="h-12"
              />
              <input
                type="range"
                min="500"
                max="5000"
                step="50"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>$500</span>
                <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  ${formData.budget.toLocaleString()}/mo
                </span>
                <span>$5,000</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label>Bedrooms</Label>
              <div className="grid grid-cols-4 gap-2">
                {['Studio', '1', '2', '3+'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData({ ...formData, bedrooms: option })}
                    className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                      formData.bedrooms === option
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Current Rental Rate
                </Label>
                <Input
                  type="number"
                  placeholder="e.g., 1800"
                  value={formData.currentRentalRate}
                  onChange={(e) => setFormData({ ...formData, currentRentalRate: e.target.value })}
                  className="h-12"
                  data-testid="input-current-rental-rate"
                />
                <p className="text-xs text-gray-500">What you currently pay per month</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  Lease Expiration Date
                </Label>
                <Input
                  type="date"
                  value={formData.leaseExpirationDate}
                  onChange={(e) => setFormData({ ...formData, leaseExpirationDate: e.target.value })}
                  className="h-12"
                  data-testid="input-lease-expiration"
                />
                <p className="text-xs text-gray-500">When your current lease ends</p>
              </div>
            </div>
          </div>

          {/* SECTION 2: Important Locations (POIs) */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Navigation className="w-6 h-6 text-green-600" />
              Your Important Locations
            </h2>
            <p className="text-gray-600 mb-4">
              Add places you visit often - we'll calculate commute times and costs
            </p>

            {/* Existing POIs */}
            {pointsOfInterest.length > 0 && (
              <div className="space-y-2 mb-4">
                {pointsOfInterest.map((poi) => {
                  const cat = POI_CATEGORIES.find(c => c.category === poi.category);
                  const Icon = cat?.icon || MapPin;
                  return (
                    <div key={poi.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <Icon className="w-5 h-5 text-gray-700" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{poi.name}</p>
                        <p className="text-sm text-gray-600">{poi.address}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removePOI(poi.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add POI Form */}
            {showPOIForm ? (
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-3">
                <Input placeholder="Name (e.g., My Office)" value={newPOI.name}
                  onChange={(e) => setNewPOI({ ...newPOI, name: e.target.value })} />
                <Input placeholder="Address" value={newPOI.address}
                  onChange={(e) => setNewPOI({ ...newPOI, address: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <Select value={newPOI.category} onValueChange={(v) => setNewPOI({ ...newPOI, category: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {POI_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={newPOI.priority} onValueChange={(v) => setNewPOI({ ...newPOI, priority: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddPOI} className="flex-1"><Plus className="w-4 h-4 mr-2" />Add</Button>
                  <Button variant="outline" onClick={() => setShowPOIForm(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowPOIForm(true)} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />Add Location
              </Button>
            )}
          </div>

          {/* SECTION 3: Lifestyle & Commute */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Car className="w-6 h-6 text-orange-600" />
              Lifestyle & Commute
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Commute Days per Week</Label>
                <Input type="number" value={lifestyleData.daysPerWeek}
                  onChange={(e) => setLifestyleData({ ...lifestyleData, daysPerWeek: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Vehicle MPG</Label>
                <Input type="number" value={lifestyleData.vehicleMpg}
                  onChange={(e) => setLifestyleData({ ...lifestyleData, vehicleMpg: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Gas Price ($/gal)</Label>
                <Input type="number" step="0.01" value={lifestyleData.gasPrice}
                  onChange={(e) => setLifestyleData({ ...lifestyleData, gasPrice: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Transit Pass ($/mo)</Label>
                <Input type="number" value={lifestyleData.transitPass}
                  onChange={(e) => setLifestyleData({ ...lifestyleData, transitPass: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          </div>

          {/* SECTION 4: Market Intelligence (Optional) */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              Market Intelligence
              <Badge variant="outline" className="ml-2">Optional</Badge>
            </h2>
            <p className="text-gray-600 mb-4">Get negotiation tips and leverage analysis</p>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Annual Income</Label>
                <Input type="number" value={marketData.annualIncome}
                  onChange={(e) => setMarketData({ ...marketData, annualIncome: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Current Savings</Label>
                <Input type="number" value={marketData.currentSavings}
                  onChange={(e) => setMarketData({ ...marketData, currentSavings: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Time Horizon (years)</Label>
                <Input type="number" value={marketData.timeHorizon}
                  onChange={(e) => setMarketData({ ...marketData, timeHorizon: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          </div>

          {/* SECTION 5: Preferences (Optional) */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Home className="w-6 h-6 text-purple-600" />
              Preferences
              <Badge variant="outline" className="ml-2">Optional</Badge>
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Must-Have Amenities</Label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_AMENITIES.map(item => (
                    <Badge
                      key={item}
                      variant={amenities.includes(item) ? 'default' : 'outline'}
                      className={`cursor-pointer ${amenities.includes(item) ? 'bg-green-500' : ''}`}
                      onClick={() => setAmenities(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])}
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Deal Breakers</Label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_DEALBREAKERS.map(item => (
                    <Badge
                      key={item}
                      variant={dealBreakers.includes(item) ? 'default' : 'outline'}
                      className={`cursor-pointer ${dealBreakers.includes(item) ? 'bg-red-500' : ''}`}
                      onClick={() => setDealBreakers(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])}
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Additional Notes</Label>
                <Textarea
                  placeholder="Looking for dog-friendly, quiet neighborhood..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="sticky bottom-4 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Ready to find your perfect apartment?</p>
                <p className="text-sm text-gray-600">{setupProgress}% complete</p>
              </div>
              <Button
                onClick={handleSaveAll}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Save className="w-5 h-5 mr-2" />
                Save & Start Searching
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
