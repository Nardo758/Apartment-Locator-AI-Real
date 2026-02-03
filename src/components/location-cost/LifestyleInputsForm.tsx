import { useState } from 'react';
import { 
  Briefcase, 
  Car, 
  Train,
  ShoppingCart,
  Dumbbell,
  MapPin,
  Fuel,
  Calculator,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocationCostContext } from '@/contexts/LocationCostContext';

interface LifestyleInputsFormProps {
  onComplete?: () => void;
  compact?: boolean;
}

export function LifestyleInputsForm({ onComplete, compact = false }: LifestyleInputsFormProps) {
  const { inputs, updateInputs, hasInputs, isCalculating } = useLocationCostContext();
  const [workAddressInput, setWorkAddressInput] = useState(inputs.workAddress);

  const handleWorkAddressChange = (address: string) => {
    setWorkAddressInput(address);
    updateInputs({ 
      workAddress: address,
      workCoordinates: { lat: 28.5383, lng: -81.3792 }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onComplete) onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="glass border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-400" />
            Work Commute
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="work-address">Work Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="work-address"
                placeholder="Enter your work address..."
                value={workAddressInput}
                onChange={(e) => handleWorkAddressChange(e.target.value)}
                className="pl-10"
                data-testid="input-work-address"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Days per week</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[inputs.commuteFrequency]}
                  onValueChange={([value]) => updateInputs({ commuteFrequency: value })}
                  min={1}
                  max={7}
                  step={1}
                  className="flex-1"
                  data-testid="slider-commute-days"
                />
                <span className="text-sm font-medium w-8 text-center">{inputs.commuteFrequency}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Commute mode</Label>
              <Select
                value={inputs.commuteMode}
                onValueChange={(value: 'driving' | 'transit' | 'bicycling' | 'walking') => 
                  updateInputs({ commuteMode: value })
                }
              >
                <SelectTrigger data-testid="select-commute-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="driving">
                    <span className="flex items-center gap-2">
                      <Car className="w-4 h-4" /> Driving
                    </span>
                  </SelectItem>
                  <SelectItem value="transit">
                    <span className="flex items-center gap-2">
                      <Train className="w-4 h-4" /> Transit
                    </span>
                  </SelectItem>
                  <SelectItem value="bicycling">Bicycling</SelectItem>
                  <SelectItem value="walking">Walking</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {inputs.commuteMode === 'driving' && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Fuel className="w-4 h-4" />
                Vehicle MPG
              </Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[inputs.vehicleMpg || 28]}
                  onValueChange={([value]) => updateInputs({ vehicleMpg: value })}
                  min={10}
                  max={60}
                  step={1}
                  className="flex-1"
                  data-testid="slider-mpg"
                />
                <span className="text-sm font-medium w-12 text-center">{inputs.vehicleMpg || 28} mpg</span>
              </div>
            </div>
          )}

          {inputs.commuteMode === 'transit' && (
            <div className="space-y-2">
              <Label>Monthly Transit Pass Cost</Label>
              <Input
                type="number"
                value={inputs.monthlyTransitPass || 100}
                onChange={(e) => updateInputs({ monthlyTransitPass: parseInt(e.target.value) || 0 })}
                placeholder="100"
                className="w-full"
                data-testid="input-transit-pass"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            Groceries
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Trips per week</Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[inputs.groceryFrequency]}
                onValueChange={([value]) => updateInputs({ groceryFrequency: value })}
                min={0}
                max={7}
                step={1}
                className="flex-1"
                data-testid="slider-grocery-trips"
              />
              <span className="text-sm font-medium w-8 text-center">{inputs.groceryFrequency}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Preferred Store</Label>
            <Select
              value={inputs.preferredGroceryChain || 'any'}
              onValueChange={(value) => updateInputs({ preferredGroceryChain: value as any })}
            >
              <SelectTrigger data-testid="select-grocery-store">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any nearby store</SelectItem>
                <SelectItem value="wholefoods">Whole Foods</SelectItem>
                <SelectItem value="traderjoes">Trader Joe's</SelectItem>
                <SelectItem value="kroger">Kroger / Publix</SelectItem>
                <SelectItem value="walmart">Walmart</SelectItem>
                <SelectItem value="costco">Costco</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-orange-400" />
            Fitness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="has-gym" className="text-sm">I have a gym membership</Label>
            <Switch
              id="has-gym"
              checked={inputs.hasGymMembership}
              onCheckedChange={(checked) => updateInputs({ hasGymMembership: checked })}
              data-testid="switch-gym-membership"
            />
          </div>
          
          {inputs.hasGymMembership && (
            <>
              <div className="space-y-2">
                <Label>Gym visits per week</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[inputs.gymVisitsPerWeek || 3]}
                    onValueChange={([value]) => updateInputs({ gymVisitsPerWeek: value })}
                    min={1}
                    max={7}
                    step={1}
                    className="flex-1"
                    data-testid="slider-gym-visits"
                  />
                  <span className="text-sm font-medium w-8 text-center">{inputs.gymVisitsPerWeek || 3}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gym-address">Gym Address (optional)</Label>
                <Input
                  id="gym-address"
                  placeholder="Your gym's address..."
                  value={inputs.gymAddress || ''}
                  onChange={(e) => updateInputs({ gymAddress: e.target.value })}
                  data-testid="input-gym-address"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Train className="w-5 h-5 text-purple-400" />
            Public Transit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="uses-transit" className="text-sm">I use public transit regularly</Label>
            <Switch
              id="uses-transit"
              checked={inputs.usesPublicTransit}
              onCheckedChange={(checked) => updateInputs({ usesPublicTransit: checked })}
              data-testid="switch-public-transit"
            />
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        disabled={!workAddressInput || isCalculating}
        data-testid="button-calculate-costs"
      >
        {isCalculating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Calculating...
          </>
        ) : (
          <>
            <Calculator className="w-4 h-4 mr-2" />
            Calculate True Costs
          </>
        )}
      </Button>
    </form>
  );
}

export default LifestyleInputsForm;
