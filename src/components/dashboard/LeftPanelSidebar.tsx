import { useState } from 'react';
import {
  MapPin,
  Briefcase,
  Dumbbell,
  ShoppingCart,
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2,
  Car,
  Train,
  Bike,
  Footprints,
  Fuel,
  Settings,
  Calculator,
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
import type { Coordinates } from '@/types/locationCost.types';

interface POI {
  id: string;
  name: string;
  address: string;
  category: 'work' | 'gym' | 'grocery' | 'other';
  coordinates: Coordinates;
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

const POI_ICONS: Record<string, typeof Briefcase> = {
  work: Briefcase,
  gym: Dumbbell,
  grocery: ShoppingCart,
  other: MapPin,
};

const POI_COLORS: Record<string, string> = {
  work: 'bg-red-500',
  gym: 'bg-blue-500',
  grocery: 'bg-green-500',
  other: 'bg-purple-500',
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
}: LeftPanelSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    locations: true,
    trueCost: true,
    filters: false,
  });

  const [newPOIAddress, setNewPOIAddress] = useState('');

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddWorkLocation = () => {
    if (newPOIAddress.trim()) {
      onAddPOI({
        name: 'Work',
        address: newPOIAddress,
        category: 'work',
        coordinates: { lat: 0, lng: 0 },
      });
      setNewPOIAddress('');
    }
  };

  const updateLifestyle = (key: keyof LifestyleInputs, value: LifestyleInputs[keyof LifestyleInputs]) => {
    onLifestyleChange({ ...lifestyleInputs, [key]: value });
  };

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
                {expandedSections.locations ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">
              {pois.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No locations added yet
                </p>
              ) : (
                <div className="space-y-2">
                  {pois.map((poi) => {
                    const IconComponent = POI_ICONS[poi.category] || MapPin;
                    return (
                      <div
                        key={poi.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                        data-testid={`poi-${poi.id}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${POI_COLORS[poi.category]}`}>
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

              <div className="flex gap-2">
                <Input
                  placeholder="Add work address..."
                  value={newPOIAddress}
                  onChange={(e) => setNewPOIAddress(e.target.value)}
                  className="text-sm h-8"
                  data-testid="input-new-poi-address"
                />
                <Button
                  size="sm"
                  onClick={handleAddWorkLocation}
                  disabled={!newPOIAddress.trim()}
                  data-testid="button-add-poi"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
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
                  True Cost Inputs
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
              <div className="space-y-3">
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
    </div>
  );
}
