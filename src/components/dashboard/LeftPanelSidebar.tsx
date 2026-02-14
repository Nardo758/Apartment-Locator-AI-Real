import { useState } from 'react';
import {
  MapPin,
  Briefcase,
  Dumbbell,
  ShoppingCart,
  Plus,
  ChevronDown,
  Calendar,
  DollarSign,
  ChevronRight,
  Trash2,
  Car,
  Train,
  Bike,
  Footprints,
  Fuel,
  Settings,
  Calculator,
  Coffee,
  Heart,
  Baby,
  GraduationCap,
  Stethoscope,
  Dog,
  Church,
  Utensils,
  Beer,
  Music,
  Palette,
  BookOpen,
  Building2,
  TreePine,
  Waves,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Coordinates } from '@/types/locationCost.types';

export type POICategory = 'work' | 'gym' | 'grocery' | 'daycare' | 'school' | 'medical' | 'pet' | 'religious' | 'dining' | 'nightlife' | 'entertainment' | 'library' | 'coworking' | 'park' | 'beach' | 'coffee' | 'other';

interface POI {
  id: string;
  name: string;
  address: string;
  category: POICategory;
  coordinates: Coordinates;
  frequency?: number;
  costPerVisit?: number;
}

export interface CostCategory {
  id: string;
  name: string;
  category: POICategory;
  enabled: boolean;
  frequency: number;
  costPerVisit: number;
  includeInCalculation: boolean;
}

export interface LifestyleInputs {
  workAddress: string;
  commuteDays: number;
  commuteMode: 'driving' | 'transit' | 'bicycling' | 'walking';
  vehicleMpg: number;
  groceryTrips: number;
  preferredStore: string;
  hasGym: boolean;
  gymVisits: number;
  customCategories: CostCategory[];
}

export interface FilterSettings {
  minBudget: number;
  maxBudget: number;
  bedrooms: number[];
  amenities: string[];
}

interface LeftPanelSidebarProps {
  pois: POI[];
  onAddPOI: (poi: Omit<POI, 'id'>) => void;
  onRemovePOI: (id: string) => void;
  lifestyleInputs: LifestyleInputs;
  onLifestyleChange: (inputs: LifestyleInputs) => void;
  filters: FilterSettings;
  onFiltersChange: (filters: FilterSettings) => void;
  onCalculate: () => void;
  isCalculating?: boolean;
  className?: string;
  currentRentalRate?: number | string;
  onCurrentRentalRateChange?: (value: string) => void;
  leaseExpirationDate?: string;
  onLeaseExpirationDateChange?: (value: string) => void;
}

const COMMUTE_MODES = [
  { value: 'driving', label: 'Driving', icon: Car },
  { value: 'transit', label: 'Transit', icon: Train },
  { value: 'bicycling', label: 'Biking', icon: Bike },
  { value: 'walking', label: 'Walking', icon: Footprints },
];

const GROCERY_STORES = [
  'Any nearby store',
  'Walmart',
  'Target',
  'Whole Foods',
  'H-E-B',
  'Kroger',
  "Trader Joe's",
  'Costco',
  'Aldi',
];

const AVAILABLE_CATEGORIES: { value: POICategory; label: string; icon: typeof Briefcase; color: string; defaultCost: number }[] = [
  { value: 'work', label: 'Work', icon: Briefcase, color: 'bg-red-500', defaultCost: 0 },
  { value: 'gym', label: 'Gym / Fitness', icon: Dumbbell, color: 'bg-blue-500', defaultCost: 0 },
  { value: 'grocery', label: 'Grocery Store', icon: ShoppingCart, color: 'bg-green-500', defaultCost: 100 },
  { value: 'daycare', label: 'Daycare / Childcare', icon: Baby, color: 'bg-pink-500', defaultCost: 50 },
  { value: 'school', label: 'School', icon: GraduationCap, color: 'bg-yellow-500', defaultCost: 0 },
  { value: 'medical', label: 'Doctor / Medical', icon: Stethoscope, color: 'bg-teal-500', defaultCost: 50 },
  { value: 'pet', label: 'Pet Services', icon: Dog, color: 'bg-orange-500', defaultCost: 30 },
  { value: 'religious', label: 'Place of Worship', icon: Church, color: 'bg-purple-500', defaultCost: 0 },
  { value: 'dining', label: 'Favorite Restaurant', icon: Utensils, color: 'bg-amber-500', defaultCost: 40 },
  { value: 'nightlife', label: 'Bar / Nightlife', icon: Beer, color: 'bg-indigo-500', defaultCost: 50 },
  { value: 'entertainment', label: 'Entertainment', icon: Music, color: 'bg-fuchsia-500', defaultCost: 30 },
  { value: 'library', label: 'Library', icon: BookOpen, color: 'bg-cyan-500', defaultCost: 0 },
  { value: 'coworking', label: 'Coworking Space', icon: Building2, color: 'bg-slate-500', defaultCost: 0 },
  { value: 'park', label: 'Park / Recreation', icon: TreePine, color: 'bg-emerald-500', defaultCost: 0 },
  { value: 'beach', label: 'Beach / Waterfront', icon: Waves, color: 'bg-sky-500', defaultCost: 0 },
  { value: 'coffee', label: 'Coffee Shop', icon: Coffee, color: 'bg-stone-500', defaultCost: 5 },
  { value: 'other', label: 'Other', icon: MapPin, color: 'bg-gray-500', defaultCost: 0 },
];

const getCategoryInfo = (category: POICategory) => {
  return AVAILABLE_CATEGORIES.find(c => c.value === category) || AVAILABLE_CATEGORIES[AVAILABLE_CATEGORIES.length - 1];
};

export default function LeftPanelSidebar({
  pois,
  onAddPOI,
  onRemovePOI,
  lifestyleInputs,
  onLifestyleChange,
  filters,
  onFiltersChange,
  onCalculate,
  isCalculating = false,
  className = '',
  currentRentalRate,
  onCurrentRentalRateChange,
  leaseExpirationDate,
  onLeaseExpirationDateChange,
}: LeftPanelSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    locations: true,
    trueCost: true,
    customCosts: false,
    filters: false,
  });

  const [newPOI, setNewPOI] = useState({ address: '', category: 'work' as POICategory, name: '' });
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddPOI = () => {
    if (newPOI.address.trim()) {
      const categoryInfo = getCategoryInfo(newPOI.category);
      onAddPOI({
        name: newPOI.name || categoryInfo.label,
        address: newPOI.address,
        category: newPOI.category,
        coordinates: { lat: 0, lng: 0 },
      });
      setNewPOI({ address: '', category: 'work', name: '' });
      setShowAddLocation(false);
    }
  };

  const handleAddCustomCategory = (category: POICategory) => {
    const categoryInfo = getCategoryInfo(category);
    const newCategory: CostCategory = {
      id: `cat-${Date.now()}`,
      name: categoryInfo.label,
      category,
      enabled: true,
      frequency: 2,
      costPerVisit: categoryInfo.defaultCost,
      includeInCalculation: true,
    };
    onLifestyleChange({
      ...lifestyleInputs,
      customCategories: [...(lifestyleInputs.customCategories || []), newCategory],
    });
    setShowAddCategory(false);
  };

  const handleRemoveCustomCategory = (id: string) => {
    onLifestyleChange({
      ...lifestyleInputs,
      customCategories: (lifestyleInputs.customCategories || []).filter(c => c.id !== id),
    });
  };

  const handleUpdateCustomCategory = (id: string, updates: Partial<CostCategory>) => {
    onLifestyleChange({
      ...lifestyleInputs,
      customCategories: (lifestyleInputs.customCategories || []).map(c =>
        c.id === id ? { ...c, ...updates } : c
      ),
    });
  };

  const updateLifestyle = (key: keyof LifestyleInputs, value: LifestyleInputs[keyof LifestyleInputs]) => {
    onLifestyleChange({ ...lifestyleInputs, [key]: value });
  };

  const usedCategories = new Set([
    ...pois.map(p => p.category),
    ...(lifestyleInputs.customCategories || []).map(c => c.category),
  ]);

  const availableToAdd = AVAILABLE_CATEGORIES.filter(c => !usedCategories.has(c.value) || c.value === 'other');

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <Collapsible open={expandedSections.locations} onOpenChange={() => toggleSection('locations')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover-elevate py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  My Locations
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{pois.length}</Badge>
                  {expandedSections.locations ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">
              {pois.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Add locations that matter to your lifestyle
                </p>
              ) : (
                <div className="space-y-2">
                  {pois.map((poi) => {
                    const categoryInfo = getCategoryInfo(poi.category);
                    const IconComponent = categoryInfo.icon;
                    return (
                      <div
                        key={poi.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                        data-testid={`poi-${poi.id}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${categoryInfo.color}`}>
                            <IconComponent className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{poi.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                              {poi.address}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onRemovePOI(poi.id)}
                          data-testid={`button-remove-poi-${poi.id}`}
                        >
                          <Trash2 className="w-3 h-3 text-muted-foreground" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              <Dialog open={showAddLocation} onOpenChange={setShowAddLocation}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full" data-testid="button-add-location">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Location
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add a Location</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Location Type</Label>
                      <Select
                        value={newPOI.category}
                        onValueChange={(value) => setNewPOI(prev => ({ ...prev, category: value as POICategory }))}
                      >
                        <SelectTrigger data-testid="select-poi-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              <div className="flex items-center gap-2">
                                <div className={`p-1 rounded ${cat.color}`}>
                                  <cat.icon className="w-3 h-3 text-white" />
                                </div>
                                {cat.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Name (optional)</Label>
                      <Input
                        placeholder="e.g., My Office, Planet Fitness..."
                        value={newPOI.name}
                        onChange={(e) => setNewPOI(prev => ({ ...prev, name: e.target.value }))}
                        data-testid="input-poi-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input
                        placeholder="Enter address..."
                        value={newPOI.address}
                        onChange={(e) => setNewPOI(prev => ({ ...prev, address: e.target.value }))}
                        data-testid="input-poi-address"
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleAddPOI}
                      disabled={!newPOI.address.trim()}
                      data-testid="button-confirm-add-poi"
                    >
                      Add Location
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={expandedSections.trueCost} onOpenChange={() => toggleSection('trueCost')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover-elevate py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-primary" />
                  Cost Inputs
                </CardTitle>
                {expandedSections.trueCost ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {onCurrentRentalRateChange && onLeaseExpirationDateChange && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <DollarSign className="w-3 h-3" />
                    CURRENT LEASE
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Current Rent ($/mo)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 1800"
                      value={currentRentalRate || ''}
                      onChange={(e) => onCurrentRentalRateChange(e.target.value)}
                      className="h-8 text-sm"
                      data-testid="input-sidebar-current-rent"
                    />
                  </div>

                </div>
              )}

              <div className="border-t pt-3 space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Car className="w-3 h-3" />
                  COMMUTE
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Days per week</Label>
                    <span className="text-xs font-medium">{lifestyleInputs.commuteDays}</span>
                  </div>
                  <Slider
                    value={[lifestyleInputs.commuteDays]}
                    onValueChange={([value]) => updateLifestyle('commuteDays', value)}
                    min={1}
                    max={7}
                    step={1}
                    className="w-full"
                    data-testid="slider-commute-days"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Commute mode</Label>
                  <Select
                    value={lifestyleInputs.commuteMode}
                    onValueChange={(value) => updateLifestyle('commuteMode', value as LifestyleInputs['commuteMode'])}
                  >
                    <SelectTrigger className="h-8 text-sm" data-testid="select-commute-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMUTE_MODES.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          <div className="flex items-center gap-2">
                            <mode.icon className="w-3 h-3" />
                            {mode.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {lifestyleInputs.commuteMode === 'driving' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs flex items-center gap-1">
                        <Fuel className="w-3 h-3" />
                        Vehicle MPG
                      </Label>
                      <span className="text-xs font-medium">{lifestyleInputs.vehicleMpg}</span>
                    </div>
                    <Slider
                      value={[lifestyleInputs.vehicleMpg]}
                      onValueChange={([value]) => updateLifestyle('vehicleMpg', value)}
                      min={15}
                      max={50}
                      step={1}
                      data-testid="slider-vehicle-mpg"
                    />
                  </div>
                )}
              </div>

              <div className="border-t pt-3 space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <ShoppingCart className="w-3 h-3" />
                  GROCERIES
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Trips per week</Label>
                    <span className="text-xs font-medium">{lifestyleInputs.groceryTrips}</span>
                  </div>
                  <Slider
                    value={[lifestyleInputs.groceryTrips]}
                    onValueChange={([value]) => updateLifestyle('groceryTrips', value)}
                    min={1}
                    max={7}
                    step={1}
                    data-testid="slider-grocery-trips"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Preferred store</Label>
                  <Select
                    value={lifestyleInputs.preferredStore}
                    onValueChange={(value) => updateLifestyle('preferredStore', value)}
                  >
                    <SelectTrigger className="h-8 text-sm" data-testid="select-grocery-store">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GROCERY_STORES.map((store) => (
                        <SelectItem key={store} value={store}>
                          {store}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-3 space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Dumbbell className="w-3 h-3" />
                  FITNESS
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Has gym membership</Label>
                  <Switch
                    checked={lifestyleInputs.hasGym}
                    onCheckedChange={(checked) => updateLifestyle('hasGym', checked)}
                    data-testid="switch-has-gym"
                  />
                </div>

                {lifestyleInputs.hasGym && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Visits per week</Label>
                      <span className="text-xs font-medium">{lifestyleInputs.gymVisits}</span>
                    </div>
                    <Slider
                      value={[lifestyleInputs.gymVisits]}
                      onValueChange={([value]) => updateLifestyle('gymVisits', value)}
                      min={1}
                      max={7}
                      step={1}
                      data-testid="slider-gym-visits"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={expandedSections.customCosts} onOpenChange={() => toggleSection('customCosts')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover-elevate py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  Lifestyle Costs
                </CardTitle>
                <div className="flex items-center gap-2">
                  {(lifestyleInputs.customCategories?.length || 0) > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {lifestyleInputs.customCategories?.length}
                    </Badge>
                  )}
                  {expandedSections.customCosts ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">
              <p className="text-xs text-muted-foreground">
                Add activities and places you visit regularly to calculate their impact on your monthly costs.
              </p>

              {(lifestyleInputs.customCategories || []).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2 italic">
                  No custom costs added yet
                </p>
              ) : (
                <div className="space-y-3">
                  {(lifestyleInputs.customCategories || []).map((category) => {
                    const categoryInfo = getCategoryInfo(category.category);
                    const IconComponent = categoryInfo.icon;
                    const monthlyCost = category.frequency * 4 * category.costPerVisit;
                    return (
                      <div
                        key={category.id}
                        className="p-3 rounded-lg bg-muted/50 space-y-3"
                        data-testid={`custom-category-${category.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded ${categoryInfo.color}`}>
                              <IconComponent className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm font-medium">{category.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              ~${monthlyCost}/mo
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleRemoveCustomCategory(category.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Visits/week</Label>
                            <Slider
                              value={[category.frequency]}
                              onValueChange={([value]) => handleUpdateCustomCategory(category.id, { frequency: value })}
                              min={1}
                              max={7}
                              step={1}
                            />
                            <span className="text-xs text-muted-foreground">{category.frequency}x</span>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Cost/visit</Label>
                            <Input
                              type="number"
                              value={category.costPerVisit}
                              onChange={(e) => handleUpdateCustomCategory(category.id, { costPerVisit: Number(e.target.value) })}
                              className="h-7 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full" data-testid="button-add-cost-category">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Cost Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add a Lifestyle Cost</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-2 pt-4">
                    {availableToAdd.map((cat) => (
                      <Button
                        key={cat.value}
                        variant="outline"
                        className="h-auto py-3 flex flex-col items-center gap-2"
                        onClick={() => handleAddCustomCategory(cat.value)}
                        data-testid={`button-add-category-${cat.value}`}
                      >
                        <div className={`p-2 rounded ${cat.color}`}>
                          <cat.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs">{cat.label}</span>
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={expandedSections.filters} onOpenChange={() => toggleSection('filters')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover-elevate py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" />
                  Filters
                </CardTitle>
                {expandedSections.filters ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Budget Range</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minBudget}
                    onChange={(e) => onFiltersChange({ ...filters, minBudget: Number(e.target.value) })}
                    className="h-8 text-sm"
                    data-testid="input-min-budget"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxBudget}
                    onChange={(e) => onFiltersChange({ ...filters, maxBudget: Number(e.target.value) })}
                    className="h-8 text-sm"
                    data-testid="input-max-budget"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Bedrooms</Label>
                <div className="flex gap-1">
                  {[1, 2, 3].map((num) => (
                    <Badge
                      key={num}
                      variant={filters.bedrooms.includes(num) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        const newBedrooms = filters.bedrooms.includes(num)
                          ? filters.bedrooms.filter((b) => b !== num)
                          : [...filters.bedrooms, num];
                        onFiltersChange({ ...filters, bedrooms: newBedrooms });
                      }}
                      data-testid={`badge-bedroom-${num}`}
                    >
                      {num === 3 ? '3+' : num} bd
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Button
        className="w-full"
        onClick={onCalculate}
        disabled={isCalculating}
        data-testid="button-calculate-true-cost"
      >
        {isCalculating ? (
          <>
            <Settings className="w-4 h-4 mr-2 animate-spin" />
            Calculating...
          </>
        ) : (
          <>
            <Calculator className="w-4 h-4 mr-2" />
            Calculate True Costs
          </>
        )}
      </Button>
    </div>
  );
}
