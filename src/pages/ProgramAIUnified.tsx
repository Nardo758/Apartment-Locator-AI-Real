import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, MapPin, Navigation, Car, TrendingUp, 
  Home, DollarSign, Plus, X, Save, ArrowRight,
  Briefcase, Dumbbell, ShoppingCart, Baby, GraduationCap,
  Calendar, ChevronDown, ChevronRight,
  Building2, Zap, PawPrint, CarFront, Shield, Accessibility,
  FileText, MapPinned, Sparkles, Flame, Waves as WavesIcon,
  Bike, Package, DoorOpen, Coffee
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import { useUnifiedAI } from '@/contexts/UnifiedAIContext';
import type { PointOfInterest, AIPreferences } from '@/types/unifiedAI.types';
import { toast } from 'sonner';

const COMMON_DEALBREAKERS = ['No Parking', 'No Pets', 'Ground Floor', 'No A/C', 'No Laundry', 'No Elevator', 'Street Noise', 'No Dishwasher'];

const POI_CATEGORIES = [
  { value: 'work', label: 'Work', icon: Briefcase },
  { value: 'gym', label: 'Gym', icon: Dumbbell },
  { value: 'grocery', label: 'Grocery', icon: ShoppingCart },
  { value: 'daycare', label: 'Daycare', icon: Baby },
  { value: 'school', label: 'School', icon: GraduationCap },
];

function CollapsibleSection({ 
  title, icon: Icon, children, defaultOpen = false, count 
}: { 
  title: string; icon: typeof Home; children: React.ReactNode; defaultOpen?: boolean; count?: number 
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-visible">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 p-3 text-left hover-elevate rounded-lg"
        data-testid={`toggle-section-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-purple-600" />
          <span className="font-semibold text-sm text-foreground">{title}</span>
          {count !== undefined && count > 0 && (
            <Badge variant="secondary" className="text-xs">{count}</Badge>
          )}
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-3 pb-3 space-y-3">{children}</div>}
    </div>
  );
}

function ToggleRow({ label, checked, onChange, testId }: { label: string; checked: boolean; onChange: (v: boolean) => void; testId: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} data-testid={testId} />
    </div>
  );
}

export default function ProgramAIUnified() {
  const navigate = useNavigate();
  const {
    location, zipCode, budget, aiPreferences, pointsOfInterest,
    commutePreferences, marketContext, setupProgress, completedSteps,
    currentRentalRate, leaseExpirationDate,
    updateInputs, addPOI, removePOI, updateMarketContext
  } = useUnifiedAI();

  const [formData, setFormData] = useState({
    location: location || '',
    zipCode: zipCode || '',
    budget: budget || 2500,
    bedrooms: aiPreferences.bedrooms || '1',
    bathrooms: aiPreferences.bathrooms || '1',
    currentRentalRate: currentRentalRate || '',
    leaseExpirationDate: leaseExpirationDate || '',
    sqftMin: aiPreferences.sqft?.min || 0,
    sqftMax: aiPreferences.sqft?.max || 0,
    furnished: aiPreferences.furnished || false,
  });

  const [newPOI, setNewPOI] = useState<Partial<PointOfInterest>>({
    name: '', address: '', category: 'work', priority: 'high',
  });

  const [lifestyleData, setLifestyleData] = useState({
    daysPerWeek: commutePreferences.daysPerWeek || 5,
    vehicleMpg: commutePreferences.vehicleMpg || 28,
    gasPrice: commutePreferences.gasPrice || 3.50,
    transitPass: commutePreferences.transitPass || 100,
    timeValuePerHour: commutePreferences.timeValuePerHour || 25,
  });

  const [marketData, setMarketData] = useState({
    timeHorizon: marketContext?.timeHorizon || 5,
  });

  const [buildingAmenities, setBuildingAmenities] = useState(aiPreferences.buildingAmenities || {});
  const [inUnitFeatures, setInUnitFeatures] = useState(aiPreferences.inUnitFeatures || {});
  const [utilities, setUtilities] = useState(aiPreferences.utilities || {});
  const [petPolicy, setPetPolicy] = useState(aiPreferences.petPolicy || {});
  const [parking, setParking] = useState(aiPreferences.parking || {});
  const [accessibility, setAccessibility] = useState(aiPreferences.accessibility || {});
  const [safety, setSafety] = useState(aiPreferences.safety || {});
  const [leaseTerms, setLeaseTerms] = useState(aiPreferences.leaseTerms || {});
  const [locationPrefs, setLocationPrefs] = useState(aiPreferences.locationPrefs || {});

  const [dealBreakers, setDealBreakers] = useState<string[]>(aiPreferences.dealBreakers || []);
  const [additionalNotes, setAdditionalNotes] = useState(aiPreferences.additionalNotes || '');
  const [showPOIForm, setShowPOIForm] = useState(false);

  const countSelected = (obj: Record<string, any>): number => {
    return Object.values(obj).filter(v => v === true || (typeof v === 'string' && v !== 'none' && v !== '')).length;
  };

  const handleSaveAll = () => {
    const builtAmenities: string[] = [];
    if (buildingAmenities.fitnessCenter) builtAmenities.push('Gym');
    if (buildingAmenities.pool && buildingAmenities.pool !== 'none') builtAmenities.push('Pool');
    if (buildingAmenities.elevator) builtAmenities.push('Elevator');
    if (buildingAmenities.laundry === 'in-unit') builtAmenities.push('Washer/Dryer');
    if (buildingAmenities.laundry === 'in-building') builtAmenities.push('In-Building Laundry');
    if (buildingAmenities.packageRoom) builtAmenities.push('Package Room');
    if (buildingAmenities.businessCenter) builtAmenities.push('Business Center');
    if (buildingAmenities.rooftopDeck) builtAmenities.push('Rooftop Deck');
    if (buildingAmenities.courtyard) builtAmenities.push('Courtyard');
    if (buildingAmenities.bikeStorage) builtAmenities.push('Bike Storage');
    if (buildingAmenities.storageUnits) builtAmenities.push('Storage');
    if (buildingAmenities.controlledAccess) builtAmenities.push('Controlled Access');
    if (buildingAmenities.conciergeService) builtAmenities.push('Concierge');
    if (parking.parkingIncluded) builtAmenities.push('Parking');
    if (parking.garageParking) builtAmenities.push('Garage Parking');
    if (parking.coveredParking) builtAmenities.push('Covered Parking');
    if (parking.evCharging) builtAmenities.push('EV Charging');
    if (petPolicy.dogsAllowed || petPolicy.catsAllowed) builtAmenities.push('Pet-Friendly');
    if (inUnitFeatures.balcony || inUnitFeatures.patio) builtAmenities.push('Balcony');
    if (inUnitFeatures.dishwasher) builtAmenities.push('Dishwasher');
    if (inUnitFeatures.airConditioning && inUnitFeatures.airConditioning !== 'none') builtAmenities.push('A/C');
    if (inUnitFeatures.washerDryer === 'in-unit') builtAmenities.push('In-Unit W/D');
    if (inUnitFeatures.hardwoodFloors) builtAmenities.push('Hardwood Floors');
    if (inUnitFeatures.updatedKitchen) builtAmenities.push('Updated Kitchen');
    if (inUnitFeatures.walkInClosets) builtAmenities.push('Walk-in Closets');
    if (inUnitFeatures.highCeilings) builtAmenities.push('High Ceilings');
    if (inUnitFeatures.fireplace) builtAmenities.push('Fireplace');
    if (inUnitFeatures.stainlessSteelAppliances) builtAmenities.push('Stainless Steel');
    if (inUnitFeatures.graniteCountertops) builtAmenities.push('Granite/Quartz Countertops');
    if (inUnitFeatures.garbageDisposal) builtAmenities.push('Garbage Disposal');
    if (utilities.heatIncluded) builtAmenities.push('Heat Included');
    if (utilities.waterIncluded) builtAmenities.push('Water Included');
    if (utilities.electricIncluded) builtAmenities.push('Electric Included');
    if (utilities.gasIncluded) builtAmenities.push('Gas Included');
    if (utilities.trashIncluded) builtAmenities.push('Trash Included');
    if (utilities.highSpeedInternet) builtAmenities.push('Internet');
    if (utilities.cableReady) builtAmenities.push('Cable');
    if (safety.securitySystem) builtAmenities.push('Security System');
    if (safety.gatedCommunity) builtAmenities.push('Gated Community');
    if (accessibility.wheelchairAccessible) builtAmenities.push('Wheelchair Accessible');
    if (locationPrefs.nearPublicTransit) builtAmenities.push('Near Transit');
    if (locationPrefs.nearParks) builtAmenities.push('Near Parks');
    if (locationPrefs.quietNeighborhood) builtAmenities.push('Quiet Neighborhood');

    updateInputs({
      location: formData.location,
      zipCode: formData.zipCode,
      budget: formData.budget,
      currentRentalRate: formData.currentRentalRate ? Number(formData.currentRentalRate) : undefined,
      leaseExpirationDate: formData.leaseExpirationDate || undefined,
      aiPreferences: {
        ...aiPreferences,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        sqft: { min: formData.sqftMin || undefined, max: formData.sqftMax || undefined },
        furnished: formData.furnished,
        buildingAmenities,
        inUnitFeatures,
        utilities,
        petPolicy,
        parking,
        accessibility,
        safety,
        leaseTerms,
        locationPrefs,
        amenities: builtAmenities,
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

    if (marketData.timeHorizon > 0) {
      updateMarketContext({
        ...(marketContext || {}),
        region: formData.location || marketContext?.region || 'Unknown',
        leverageScore: marketContext?.leverageScore ?? 72,
        daysOnMarket: marketContext?.daysOnMarket ?? 35,
        inventoryLevel: marketContext?.inventoryLevel ?? 2.8,
        rentTrend: marketContext?.rentTrend ?? 4.5,
        negotiationPower: marketContext?.negotiationPower ?? 'strong',
        rentVsBuyRecommendation: marketContext?.rentVsBuyRecommendation ?? 'rent',
        timeHorizon: marketData.timeHorizon,
        medianRent: marketContext?.medianRent ?? 2200,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Header />

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            <Brain className="w-10 h-10 inline-block mr-3 text-purple-600" />
            Program Your AI
          </h1>
          <p className="text-lg text-muted-foreground">
            Tell us about yourself to get personalized apartment recommendations
          </p>
          
          <div className="mt-4 p-4 rounded-lg bg-background border shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-semibold text-foreground">Setup Progress</span>
              <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {setupProgress}%
              </span>
            </div>
            <Progress value={setupProgress} className="h-2" />
            <div className="flex flex-wrap gap-2 mt-2 text-xs">
              {completedSteps.includes(1) && <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400">Basic</Badge>}
              {completedSteps.includes(2) && <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400">POIs</Badge>}
              {completedSteps.includes(3) && <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400">Lifestyle</Badge>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* SECTION 1: Basic Search */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
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
                  data-testid="input-location"
                />
              </div>
              <div className="space-y-2">
                <Label>Zip Code (Optional)</Label>
                <Input
                  placeholder="78701"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  data-testid="input-zipcode"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label>Monthly Budget</Label>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                data-testid="input-budget"
              />
              <input
                type="range" min="500" max="5000" step="50"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                className="w-full"
                data-testid="input-budget-range"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$500</span>
                <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  ${formData.budget.toLocaleString()}/mo
                </span>
                <span>$5,000</span>
              </div>
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Current Rental Rate
                </Label>
                <Input
                  type="number" placeholder="e.g., 1800"
                  value={formData.currentRentalRate}
                  onChange={(e) => setFormData({ ...formData, currentRentalRate: e.target.value })}
                  data-testid="input-current-rental-rate"
                />
                <p className="text-xs text-muted-foreground">What you currently pay per month</p>
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
                  data-testid="input-lease-expiration"
                />
                <p className="text-xs text-muted-foreground">When your current lease ends</p>
              </div>
            </div>
          </Card>

          {/* SECTION 2: Important Locations */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Navigation className="w-6 h-6 text-green-600" />
              Your Important Locations
            </h2>
            <p className="text-muted-foreground mb-4">
              Add places you visit often - we'll calculate commute times and costs
            </p>

            {pointsOfInterest.length > 0 && (
              <div className="space-y-2 mb-4">
                {pointsOfInterest.map((poi) => {
                  const cat = POI_CATEGORIES.find(c => c.value === poi.category);
                  const Icon = cat?.icon || MapPin;
                  return (
                    <div key={poi.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border" data-testid={`poi-item-${poi.id}`}>
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{poi.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{poi.address}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removePOI(poi.id)} data-testid={`button-remove-poi-${poi.id}`}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {showPOIForm ? (
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-3">
                <Input placeholder="Name (e.g., My Office)" value={newPOI.name}
                  onChange={(e) => setNewPOI({ ...newPOI, name: e.target.value })} data-testid="input-poi-name" />
                <Input placeholder="Address" value={newPOI.address}
                  onChange={(e) => setNewPOI({ ...newPOI, address: e.target.value })} data-testid="input-poi-address" />
                <div className="grid grid-cols-2 gap-2">
                  <Select value={newPOI.category} onValueChange={(v) => setNewPOI({ ...newPOI, category: v as any })}>
                    <SelectTrigger data-testid="select-poi-category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {POI_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={newPOI.priority} onValueChange={(v) => setNewPOI({ ...newPOI, priority: v as any })}>
                    <SelectTrigger data-testid="select-poi-priority"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddPOI} className="flex-1" data-testid="button-add-poi"><Plus className="w-4 h-4 mr-2" />Add</Button>
                  <Button variant="outline" onClick={() => setShowPOIForm(false)} data-testid="button-cancel-poi">Cancel</Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowPOIForm(true)} variant="outline" className="w-full" data-testid="button-show-poi-form">
                <Plus className="w-4 h-4 mr-2" />Add Location
              </Button>
            )}
          </Card>

          {/* SECTION 3: Lifestyle & Commute */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Car className="w-6 h-6 text-orange-600" />
              Lifestyle & Commute
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Commute Days per Week</Label>
                <Input type="number" value={lifestyleData.daysPerWeek}
                  onChange={(e) => setLifestyleData({ ...lifestyleData, daysPerWeek: parseInt(e.target.value) || 0 })}
                  data-testid="input-commute-days" />
              </div>
              <div className="space-y-2">
                <Label>Vehicle MPG</Label>
                <Input type="number" value={lifestyleData.vehicleMpg}
                  onChange={(e) => setLifestyleData({ ...lifestyleData, vehicleMpg: parseInt(e.target.value) || 0 })}
                  data-testid="input-vehicle-mpg" />
              </div>
              <div className="space-y-2">
                <Label>Gas Price ($/gal)</Label>
                <Input type="number" step="0.01" value={lifestyleData.gasPrice}
                  onChange={(e) => setLifestyleData({ ...lifestyleData, gasPrice: parseFloat(e.target.value) || 0 })}
                  data-testid="input-gas-price" />
              </div>
              <div className="space-y-2">
                <Label>Transit Pass ($/mo)</Label>
                <Input type="number" value={lifestyleData.transitPass}
                  onChange={(e) => setLifestyleData({ ...lifestyleData, transitPass: parseInt(e.target.value) || 0 })}
                  data-testid="input-transit-pass" />
              </div>
            </div>
          </Card>

          {/* SECTION 4: Market Intelligence */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              Market Intelligence
              <Badge variant="outline" className="ml-2">Optional</Badge>
            </h2>
            <p className="text-muted-foreground mb-4">Get negotiation tips and leverage analysis</p>
            
            <div className="space-y-2">
              <Label>Time Horizon (years)</Label>
              <p className="text-xs text-muted-foreground">How long do you plan to rent in this area?</p>
              <Input type="number" value={marketData.timeHorizon}
                onChange={(e) => setMarketData({ ...marketData, timeHorizon: parseInt(e.target.value) || 0 })}
                data-testid="input-time-horizon" />
            </div>
          </Card>

          {/* SECTION 5: Apartment Features & Preferences */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Home className="w-6 h-6 text-purple-600" />
              Apartment Features & Preferences
            </h2>
            <p className="text-muted-foreground mb-4">Select what matters most to you — we'll match properties and calculate your True Monthly Cost</p>

            <div className="space-y-3">
              {/* Basic Requirements */}
              <CollapsibleSection title="Basic Requirements" icon={Home} defaultOpen={true} count={formData.bedrooms !== '1' || formData.bathrooms !== '1' || formData.furnished ? 1 : 0}>
                <div className="space-y-3">
                  <div>
                    <Label className="mb-2 block text-sm">Bedrooms</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {['Studio', '1', '2', '3', '4+'].map((option) => (
                        <button key={option} type="button"
                          onClick={() => setFormData({ ...formData, bedrooms: option })}
                          className={`p-2 rounded-md border-2 font-semibold text-sm transition-all ${
                            formData.bedrooms === option
                              ? 'border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                              : 'border-border hover:border-purple-300'
                          }`}
                          data-testid={`button-bedrooms-${option}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block text-sm">Bathrooms</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {['1', '1.5', '2', '2.5', '3+'].map((option) => (
                        <button key={option} type="button"
                          onClick={() => setFormData({ ...formData, bathrooms: option })}
                          className={`p-2 rounded-md border-2 font-semibold text-sm transition-all ${
                            formData.bathrooms === option
                              ? 'border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                              : 'border-border hover:border-purple-300'
                          }`}
                          data-testid={`button-bathrooms-${option}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-sm">Min Sq Ft</Label>
                      <Input type="number" placeholder="e.g. 600" value={formData.sqftMin || ''}
                        onChange={(e) => setFormData({ ...formData, sqftMin: parseInt(e.target.value) || 0 })}
                        data-testid="input-sqft-min" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">Max Sq Ft</Label>
                      <Input type="number" placeholder="e.g. 1200" value={formData.sqftMax || ''}
                        onChange={(e) => setFormData({ ...formData, sqftMax: parseInt(e.target.value) || 0 })}
                        data-testid="input-sqft-max" />
                    </div>
                  </div>
                  <ToggleRow label="Furnished" checked={formData.furnished} onChange={(v) => setFormData({ ...formData, furnished: v })} testId="toggle-furnished" />
                </div>
              </CollapsibleSection>

              {/* Building Amenities */}
              <CollapsibleSection title="Building Amenities" icon={Building2} count={countSelected(buildingAmenities)}>
                <div className="space-y-1">
                  <ToggleRow label="Fitness Center / Gym" checked={!!buildingAmenities.fitnessCenter} onChange={(v) => setBuildingAmenities({ ...buildingAmenities, fitnessCenter: v })} testId="toggle-fitness" />
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-foreground">Pool</span>
                    <Select value={buildingAmenities.pool || 'none'} onValueChange={(v) => setBuildingAmenities({ ...buildingAmenities, pool: v as any })}>
                      <SelectTrigger className="w-32" data-testid="select-pool"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="indoor">Indoor</SelectItem>
                        <SelectItem value="outdoor">Outdoor</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <ToggleRow label="Elevator" checked={!!buildingAmenities.elevator} onChange={(v) => setBuildingAmenities({ ...buildingAmenities, elevator: v })} testId="toggle-elevator" />
                  <ToggleRow label="Package Room / Lockers" checked={!!buildingAmenities.packageRoom} onChange={(v) => setBuildingAmenities({ ...buildingAmenities, packageRoom: v })} testId="toggle-package-room" />
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-foreground">Laundry</span>
                    <Select value={buildingAmenities.laundry || 'none'} onValueChange={(v) => setBuildingAmenities({ ...buildingAmenities, laundry: v as any })}>
                      <SelectTrigger className="w-32" data-testid="select-laundry"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="in-unit">In-Unit</SelectItem>
                        <SelectItem value="in-building">In-Building</SelectItem>
                        <SelectItem value="shared">Shared</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <ToggleRow label="Business Center / Co-working" checked={!!buildingAmenities.businessCenter} onChange={(v) => setBuildingAmenities({ ...buildingAmenities, businessCenter: v })} testId="toggle-business-center" />
                  <ToggleRow label="Rooftop Deck / Terrace" checked={!!buildingAmenities.rooftopDeck} onChange={(v) => setBuildingAmenities({ ...buildingAmenities, rooftopDeck: v })} testId="toggle-rooftop" />
                  <ToggleRow label="Courtyard / Garden" checked={!!buildingAmenities.courtyard} onChange={(v) => setBuildingAmenities({ ...buildingAmenities, courtyard: v })} testId="toggle-courtyard" />
                  <ToggleRow label="Bike Storage" checked={!!buildingAmenities.bikeStorage} onChange={(v) => setBuildingAmenities({ ...buildingAmenities, bikeStorage: v })} testId="toggle-bike-storage" />
                  <ToggleRow label="Storage Units Available" checked={!!buildingAmenities.storageUnits} onChange={(v) => setBuildingAmenities({ ...buildingAmenities, storageUnits: v })} testId="toggle-storage" />
                  <ToggleRow label="Controlled Access / Doorman" checked={!!buildingAmenities.controlledAccess} onChange={(v) => setBuildingAmenities({ ...buildingAmenities, controlledAccess: v })} testId="toggle-controlled-access" />
                  <ToggleRow label="Concierge Service" checked={!!buildingAmenities.conciergeService} onChange={(v) => setBuildingAmenities({ ...buildingAmenities, conciergeService: v })} testId="toggle-concierge" />
                </div>
              </CollapsibleSection>

              {/* In-Unit Features */}
              <CollapsibleSection title="In-Unit Features" icon={Sparkles} count={countSelected(inUnitFeatures)}>
                <div className="space-y-1">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-foreground">Air Conditioning</span>
                    <Select value={inUnitFeatures.airConditioning || 'none'} onValueChange={(v) => setInUnitFeatures({ ...inUnitFeatures, airConditioning: v as any })}>
                      <SelectTrigger className="w-32" data-testid="select-ac"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="central">Central</SelectItem>
                        <SelectItem value="window">Window</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-foreground">Heating</span>
                    <Select value={inUnitFeatures.heating || 'none'} onValueChange={(v) => setInUnitFeatures({ ...inUnitFeatures, heating: v as any })}>
                      <SelectTrigger className="w-32" data-testid="select-heating"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="central">Central</SelectItem>
                        <SelectItem value="radiator">Radiator</SelectItem>
                        <SelectItem value="heat-pump">Heat Pump</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <ToggleRow label="Dishwasher" checked={!!inUnitFeatures.dishwasher} onChange={(v) => setInUnitFeatures({ ...inUnitFeatures, dishwasher: v })} testId="toggle-dishwasher" />
                  <ToggleRow label="Garbage Disposal" checked={!!inUnitFeatures.garbageDisposal} onChange={(v) => setInUnitFeatures({ ...inUnitFeatures, garbageDisposal: v })} testId="toggle-disposal" />
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-foreground">Washer/Dryer</span>
                    <Select value={inUnitFeatures.washerDryer || 'none'} onValueChange={(v) => setInUnitFeatures({ ...inUnitFeatures, washerDryer: v as any })}>
                      <SelectTrigger className="w-32" data-testid="select-washer-dryer"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="in-unit">In-Unit</SelectItem>
                        <SelectItem value="hookups">Hookups Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <ToggleRow label="Balcony" checked={!!inUnitFeatures.balcony} onChange={(v) => setInUnitFeatures({ ...inUnitFeatures, balcony: v })} testId="toggle-balcony" />
                  <ToggleRow label="Patio" checked={!!inUnitFeatures.patio} onChange={(v) => setInUnitFeatures({ ...inUnitFeatures, patio: v })} testId="toggle-patio" />
                  <ToggleRow label="Walk-in Closets" checked={!!inUnitFeatures.walkInClosets} onChange={(v) => setInUnitFeatures({ ...inUnitFeatures, walkInClosets: v })} testId="toggle-walkin-closets" />
                  <ToggleRow label="Hardwood Floors" checked={!!inUnitFeatures.hardwoodFloors} onChange={(v) => setInUnitFeatures({ ...inUnitFeatures, hardwoodFloors: v })} testId="toggle-hardwood" />
                  <ToggleRow label="Fireplace" checked={!!inUnitFeatures.fireplace} onChange={(v) => setInUnitFeatures({ ...inUnitFeatures, fireplace: v })} testId="toggle-fireplace" />
                  <ToggleRow label="High Ceilings" checked={!!inUnitFeatures.highCeilings} onChange={(v) => setInUnitFeatures({ ...inUnitFeatures, highCeilings: v })} testId="toggle-high-ceilings" />
                  <ToggleRow label="Updated Kitchen" checked={!!inUnitFeatures.updatedKitchen} onChange={(v) => setInUnitFeatures({ ...inUnitFeatures, updatedKitchen: v })} testId="toggle-updated-kitchen" />
                  <ToggleRow label="Stainless Steel Appliances" checked={!!inUnitFeatures.stainlessSteelAppliances} onChange={(v) => setInUnitFeatures({ ...inUnitFeatures, stainlessSteelAppliances: v })} testId="toggle-stainless" />
                  <ToggleRow label="Granite/Quartz Countertops" checked={!!inUnitFeatures.graniteCountertops} onChange={(v) => setInUnitFeatures({ ...inUnitFeatures, graniteCountertops: v })} testId="toggle-countertops" />
                </div>
              </CollapsibleSection>

              {/* Utilities & Services */}
              <CollapsibleSection title="Utilities & Services" icon={Zap} count={countSelected(utilities)}>
                <p className="text-xs text-muted-foreground mb-2">Select utilities you want included in rent</p>
                <div className="space-y-1">
                  <ToggleRow label="Heat Included" checked={!!utilities.heatIncluded} onChange={(v) => setUtilities({ ...utilities, heatIncluded: v })} testId="toggle-heat" />
                  <ToggleRow label="Water Included" checked={!!utilities.waterIncluded} onChange={(v) => setUtilities({ ...utilities, waterIncluded: v })} testId="toggle-water" />
                  <ToggleRow label="Electric Included" checked={!!utilities.electricIncluded} onChange={(v) => setUtilities({ ...utilities, electricIncluded: v })} testId="toggle-electric" />
                  <ToggleRow label="Gas Included" checked={!!utilities.gasIncluded} onChange={(v) => setUtilities({ ...utilities, gasIncluded: v })} testId="toggle-gas" />
                  <ToggleRow label="Trash Included" checked={!!utilities.trashIncluded} onChange={(v) => setUtilities({ ...utilities, trashIncluded: v })} testId="toggle-trash" />
                  <ToggleRow label="High-Speed Internet Available" checked={!!utilities.highSpeedInternet} onChange={(v) => setUtilities({ ...utilities, highSpeedInternet: v })} testId="toggle-internet" />
                  <ToggleRow label="Cable Ready" checked={!!utilities.cableReady} onChange={(v) => setUtilities({ ...utilities, cableReady: v })} testId="toggle-cable" />
                </div>
              </CollapsibleSection>

              {/* Pet Policy */}
              <CollapsibleSection title="Pet Policy" icon={PawPrint} count={countSelected(petPolicy)}>
                <div className="space-y-1">
                  <ToggleRow label="Dogs Allowed" checked={!!petPolicy.dogsAllowed} onChange={(v) => setPetPolicy({ ...petPolicy, dogsAllowed: v })} testId="toggle-dogs" />
                  <ToggleRow label="Cats Allowed" checked={!!petPolicy.catsAllowed} onChange={(v) => setPetPolicy({ ...petPolicy, catsAllowed: v })} testId="toggle-cats" />
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-foreground">Pet Size Restrictions</span>
                    <Select value={petPolicy.petSizeRestrictions || 'none'} onValueChange={(v) => setPetPolicy({ ...petPolicy, petSizeRestrictions: v as any })}>
                      <SelectTrigger className="w-32" data-testid="select-pet-size"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Preference</SelectItem>
                        <SelectItem value="small">Small Only</SelectItem>
                        <SelectItem value="medium">Up to Medium</SelectItem>
                        <SelectItem value="large">Large OK</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Max Pet Deposit ($)</Label>
                    <Input type="number" placeholder="e.g. 500" value={petPolicy.maxPetDeposit || ''}
                      onChange={(e) => setPetPolicy({ ...petPolicy, maxPetDeposit: parseInt(e.target.value) || 0 })}
                      data-testid="input-pet-deposit" />
                  </div>
                </div>
              </CollapsibleSection>

              {/* Parking */}
              <CollapsibleSection title="Parking" icon={CarFront} count={countSelected(parking)}>
                <div className="space-y-1">
                  <ToggleRow label="Parking Included" checked={!!parking.parkingIncluded} onChange={(v) => setParking({ ...parking, parkingIncluded: v })} testId="toggle-parking-included" />
                  <ToggleRow label="Garage Parking" checked={!!parking.garageParking} onChange={(v) => setParking({ ...parking, garageParking: v })} testId="toggle-garage" />
                  <ToggleRow label="Covered Parking" checked={!!parking.coveredParking} onChange={(v) => setParking({ ...parking, coveredParking: v })} testId="toggle-covered-parking" />
                  <ToggleRow label="Street Parking" checked={!!parking.streetParking} onChange={(v) => setParking({ ...parking, streetParking: v })} testId="toggle-street-parking" />
                  <ToggleRow label="EV Charging Available" checked={!!parking.evCharging} onChange={(v) => setParking({ ...parking, evCharging: v })} testId="toggle-ev-charging" />
                </div>
              </CollapsibleSection>

              {/* Accessibility */}
              <CollapsibleSection title="Accessibility" icon={Accessibility} count={countSelected(accessibility)}>
                <div className="space-y-1">
                  <ToggleRow label="Wheelchair Accessible" checked={!!accessibility.wheelchairAccessible} onChange={(v) => setAccessibility({ ...accessibility, wheelchairAccessible: v })} testId="toggle-wheelchair" />
                  <ToggleRow label="First Floor Available" checked={!!accessibility.firstFloorAvailable} onChange={(v) => setAccessibility({ ...accessibility, firstFloorAvailable: v })} testId="toggle-first-floor" />
                  <ToggleRow label="Elevator Access" checked={!!accessibility.elevatorAccess} onChange={(v) => setAccessibility({ ...accessibility, elevatorAccess: v })} testId="toggle-elevator-access" />
                </div>
              </CollapsibleSection>

              {/* Safety & Security */}
              <CollapsibleSection title="Safety & Security" icon={Shield} count={countSelected(safety)}>
                <div className="space-y-1">
                  <ToggleRow label="Security System" checked={!!safety.securitySystem} onChange={(v) => setSafety({ ...safety, securitySystem: v })} testId="toggle-security-system" />
                  <ToggleRow label="Video Surveillance" checked={!!safety.videoSurveillance} onChange={(v) => setSafety({ ...safety, videoSurveillance: v })} testId="toggle-surveillance" />
                  <ToggleRow label="Gated Community" checked={!!safety.gatedCommunity} onChange={(v) => setSafety({ ...safety, gatedCommunity: v })} testId="toggle-gated" />
                  <ToggleRow label="On-Site Security" checked={!!safety.onsiteSecurity} onChange={(v) => setSafety({ ...safety, onsiteSecurity: v })} testId="toggle-onsite-security" />
                </div>
              </CollapsibleSection>

              {/* Lease Terms */}
              <CollapsibleSection title="Lease Terms" icon={FileText} count={countSelected(leaseTerms)}>
                <div className="space-y-1">
                  <ToggleRow label="Short-Term Lease Available" checked={!!leaseTerms.shortTermLease} onChange={(v) => setLeaseTerms({ ...leaseTerms, shortTermLease: v })} testId="toggle-short-term" />
                  <ToggleRow label="Month-to-Month Option" checked={!!leaseTerms.monthToMonth} onChange={(v) => setLeaseTerms({ ...leaseTerms, monthToMonth: v })} testId="toggle-month-to-month" />
                  <ToggleRow label="Flexible Lease Length" checked={!!leaseTerms.flexibleLength} onChange={(v) => setLeaseTerms({ ...leaseTerms, flexibleLength: v })} testId="toggle-flexible-lease" />
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-foreground">Preferred Lease Term</span>
                    <Select value={String(leaseTerms.preferredTerm || '')} onValueChange={(v) => setLeaseTerms({ ...leaseTerms, preferredTerm: parseInt(v) as any })}>
                      <SelectTrigger className="w-32" data-testid="select-lease-term"><SelectValue placeholder="Any" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="9">9 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="15">15 months</SelectItem>
                        <SelectItem value="18">18 months</SelectItem>
                        <SelectItem value="24">24 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Location Preferences */}
              <CollapsibleSection title="Location Preferences" icon={MapPinned} count={countSelected(locationPrefs)}>
                <div className="space-y-2">
                  <ToggleRow label="Near Public Transportation" checked={!!locationPrefs.nearPublicTransit} onChange={(v) => setLocationPrefs({ ...locationPrefs, nearPublicTransit: v })} testId="toggle-transit" />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Min Walkability Score</span>
                      <span className="text-sm font-semibold text-purple-600">{locationPrefs.walkabilityScoreMin || 0}</span>
                    </div>
                    <Slider
                      value={[locationPrefs.walkabilityScoreMin || 0]}
                      onValueChange={([v]) => setLocationPrefs({ ...locationPrefs, walkabilityScoreMin: v })}
                      min={0} max={100} step={5}
                      data-testid="slider-walkability"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Car-Dependent</span>
                      <span>Walker's Paradise</span>
                    </div>
                  </div>
                  <ToggleRow label="Near Grocery Stores" checked={!!locationPrefs.nearGroceryStores} onChange={(v) => setLocationPrefs({ ...locationPrefs, nearGroceryStores: v })} testId="toggle-near-grocery" />
                  <ToggleRow label="Near Parks" checked={!!locationPrefs.nearParks} onChange={(v) => setLocationPrefs({ ...locationPrefs, nearParks: v })} testId="toggle-near-parks" />
                  <ToggleRow label="Quiet Neighborhood" checked={!!locationPrefs.quietNeighborhood} onChange={(v) => setLocationPrefs({ ...locationPrefs, quietNeighborhood: v })} testId="toggle-quiet" />
                </div>
              </CollapsibleSection>

              {/* Deal Breakers */}
              <div className="pt-2">
                <Label className="mb-2 block font-semibold">Deal Breakers</Label>
                <p className="text-xs text-muted-foreground mb-2">Select anything that would be an automatic disqualifier</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_DEALBREAKERS.map(item => (
                    <Badge
                      key={item}
                      variant={dealBreakers.includes(item) ? 'default' : 'outline'}
                      className={`cursor-pointer ${dealBreakers.includes(item) ? 'bg-red-500 dark:bg-red-600 text-white border-red-500' : ''}`}
                      onClick={() => setDealBreakers(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])}
                      data-testid={`badge-dealbreaker-${item.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="pt-2">
                <Label className="mb-2 block font-semibold">Additional Notes</Label>
                <Textarea
                  placeholder="Looking for dog-friendly, quiet neighborhood..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={3}
                  data-testid="textarea-additional-notes"
                />
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="sticky bottom-4 bg-background rounded-2xl shadow-2xl border p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-semibold text-foreground">Ready to find your perfect apartment?</p>
                <p className="text-sm text-muted-foreground">{setupProgress}% complete</p>
              </div>
              <Button
                onClick={handleSaveAll}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                data-testid="button-save-and-search"
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
