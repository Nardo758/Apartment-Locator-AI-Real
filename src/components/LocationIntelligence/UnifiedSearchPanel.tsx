import React, { useState } from 'react';
import { Plus, X, MapPin, Search, Settings, DollarSign, Home, Clock, Route, Zap, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { PointOfInterest } from '@/hooks/useLocationIntelligence';
import { designSystem } from '@/lib/design-system';
import { dataTracker } from '@/lib/data-tracker';
import { format } from 'date-fns';

interface UnifiedSearchPanelProps {
  pointsOfInterest: PointOfInterest[];
  onAddPOI: (poi: Omit<PointOfInterest, 'id'>) => void;
  onRemovePOI: (id: string) => void;
  onUpdatePriority: (id: string, priority: 'high' | 'medium' | 'low') => void;
  onSettingsChange?: (settings: SearchSettings) => void;
}

export interface SearchSettings {
  location: string;
  budgetRange: [number, number];
  searchRadius: number;
  bedrooms: string[];
  petPolicy: string;
  parkingRequired: boolean;
  amenities: string[];
  moveInDate: Date | null;
}

const UnifiedSearchPanel: React.FC<UnifiedSearchPanelProps> = ({
  pointsOfInterest,
  onAddPOI,
  onRemovePOI,
  onUpdatePriority,
  onSettingsChange
}) => {
  const [showPOIModal, setShowPOIModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  const [settings, setSettings] = useState<SearchSettings>({
    location: 'Austin, TX',
    budgetRange: [2000, 2500],
    searchRadius: 25,
    bedrooms: ['1'],
    petPolicy: 'any',
    parkingRequired: true,
    amenities: ['Pool', 'Gym'],
    moveInDate: null
  });

  const [newPOI, setNewPOI] = useState<{
    name: string;
    address: string;
    category: 'work' | 'gym' | 'school' | 'shopping' | 'custom';
    priority: 'high' | 'medium' | 'low';
    maxTime: number;
    transportMode: 'driving' | 'transit' | 'walking' | 'biking';
  }>({
    name: '',
    address: '',
    category: 'work',
    priority: 'medium',
    maxTime: 30,
    transportMode: 'driving'
  });

  const updateSettings = (newSettings: Partial<SearchSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    onSettingsChange?.(updated);
    
    dataTracker.trackContent({
      contentType: 'search_settings',
      action: 'update',
      contentData: {
        changed_settings: Object.keys(newSettings),
        timestamp: new Date().toISOString()
      }
    });
  };

  const getCategoryConfig = (category: string) => {
    const configs = {
      work: { icon: '💼', label: 'Work & Office', colorClass: 'text-blue-400' },
      gym: { icon: '🏋️', label: 'Fitness & Gym', colorClass: 'text-emerald-400' },
      school: { icon: '🎓', label: 'Education', colorClass: 'text-amber-400' },
      shopping: { icon: '🛍️', label: 'Shopping & Retail', colorClass: 'text-pink-400' },
      custom: { icon: '📍', label: 'Custom Location', colorClass: 'text-purple-400' }
    };
    return configs[category as keyof typeof configs] || configs.custom;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: { label: 'High', class: 'bg-red-500/20 text-red-400 border-red-500/30' },
      medium: { label: 'Medium', class: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
      low: { label: 'Low', class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }
    };
    return variants[priority as keyof typeof variants] || variants.medium;
  };

  const getTransportIcon = (mode: string) => {
    const icons = {
      driving: '🚗',
      transit: '🚇',
      walking: '🚶',
      biking: '🚴'
    };
    return icons[mode as keyof typeof icons] || '🚗';
  };

  const handleAddPOI = () => {
    if (!newPOI.name || !newPOI.address) return;

    const coordinates = { lat: 30.2672, lng: -97.7431 };
    
    onAddPOI({
      name: newPOI.name,
      address: newPOI.address,
      category: newPOI.category,
      priority: newPOI.priority,
      coordinates,
      maxTime: newPOI.maxTime,
      transportMode: newPOI.transportMode
    });

    setNewPOI({
      name: '',
      address: '',
      category: 'work',
      priority: 'medium',
      maxTime: 30,
      transportMode: 'driving'
    });
    
    setShowPOIModal(false);
    
    dataTracker.trackContent({
      contentType: 'point_of_interest',
      action: 'create',
      contentData: { poi_name: newPOI.name, category: newPOI.category }
    });
  };

  const bedroomOptions = [
    { value: 'studio', label: 'Studio', icon: '🏠' },
    { value: '1', label: '1 BR', icon: '🛏️' },
    { value: '2', label: '2 BR', icon: '🛏️🛏️' },
    { value: '3+', label: '3+ BR', icon: '🏘️' }
  ];

  const amenityOptions = [
    'Pool', 'Gym', 'Parking', 'Pet-Friendly', 'Laundry', 'Balcony', 
    'Air Conditioning', 'Dishwasher', 'Walk-in Closet', 'Elevator'
  ];

  const toggleBedroom = (bedroom: string) => {
    const newBedrooms = settings.bedrooms.includes(bedroom)
      ? settings.bedrooms.filter(b => b !== bedroom)
      : [...settings.bedrooms, bedroom];
    updateSettings({ bedrooms: newBedrooms });
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = settings.amenities.includes(amenity)
      ? settings.amenities.filter(a => a !== amenity)
      : [...settings.amenities, amenity];
    updateSettings({ amenities: newAmenities });
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Search className="w-5 h-5 text-primary" />
          Search Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Location
          </label>
          <Input
            value={settings.location}
            onChange={(e) => updateSettings({ location: e.target.value })}
            placeholder="City, State"
            className="bg-background border-border"
          />
        </div>

        {/* Budget Range */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Budget Range: ${settings.budgetRange[0]} - ${settings.budgetRange[1]}
          </label>
          <Slider
            value={settings.budgetRange}
            min={500}
            max={5000}
            step={100}
            onValueChange={(value) => updateSettings({ budgetRange: value as [number, number] })}
            className="w-full"
          />
        </div>

        {/* Search Radius */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Search Radius: {settings.searchRadius} miles
          </label>
          <Slider
            value={[settings.searchRadius]}
            min={5}
            max={50}
            step={5}
            onValueChange={(value) => updateSettings({ searchRadius: value[0] })}
            className="w-full"
          />
        </div>

        {/* Bedrooms */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Home className="w-4 h-4 text-primary" />
            Bedrooms
          </label>
          <div className="flex flex-wrap gap-2">
            {bedroomOptions.map((option) => (
              <Button
                key={option.value}
                variant={settings.bedrooms.includes(option.value) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleBedroom(option.value)}
                className="gap-2"
              >
                <span>{option.icon}</span>
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {amenityOptions.map((amenity) => (
              <Badge
                key={amenity}
                variant={settings.amenities.includes(amenity) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => toggleAmenity(amenity)}
              >
                {amenity}
              </Badge>
            ))}
          </div>
        </div>

        {/* Points of Interest */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Points of Interest ({pointsOfInterest.length})
            </label>
            <Dialog open={showPOIModal} onOpenChange={setShowPOIModal}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Location
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Add Point of Interest</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Location name (e.g., My Office)"
                    value={newPOI.name}
                    onChange={(e) => setNewPOI({ ...newPOI, name: e.target.value })}
                    className="bg-background border-border"
                  />
                  <Input
                    placeholder="Address"
                    value={newPOI.address}
                    onChange={(e) => setNewPOI({ ...newPOI, address: e.target.value })}
                    className="bg-background border-border"
                  />
                  
                  <Select value={newPOI.category} onValueChange={(value: any) => setNewPOI({ ...newPOI, category: value })}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">💼 Work & Office</SelectItem>
                      <SelectItem value="gym">🏋️ Fitness & Gym</SelectItem>
                      <SelectItem value="school">🎓 Education</SelectItem>
                      <SelectItem value="shopping">🛍️ Shopping & Retail</SelectItem>
                      <SelectItem value="custom">📍 Custom Location</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={newPOI.priority} onValueChange={(value: any) => setNewPOI({ ...newPOI, priority: value })}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">🔴 High Priority</SelectItem>
                      <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                      <SelectItem value="low">🟢 Low Priority</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Travel Time: {newPOI.maxTime} min</label>
                    <Slider
                      value={[newPOI.maxTime]}
                      min={5}
                      max={120}
                      step={5}
                      onValueChange={(value) => setNewPOI({ ...newPOI, maxTime: value[0] })}
                    />
                  </div>

                  <Select value={newPOI.transportMode} onValueChange={(value: any) => setNewPOI({ ...newPOI, transportMode: value })}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="driving">🚗 Driving</SelectItem>
                      <SelectItem value="transit">🚇 Public Transit</SelectItem>
                      <SelectItem value="walking">🚶 Walking</SelectItem>
                      <SelectItem value="biking">🚴 Biking</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={handleAddPOI} className="w-full">
                    Add Location
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* POI List */}
          <div className="space-y-2">
            {pointsOfInterest.map((poi) => {
              const categoryConfig = getCategoryConfig(poi.category);
              const priorityBadge = getPriorityBadge(poi.priority);
              
              return (
                <div
                  key={poi.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{categoryConfig.icon}</span>
                      <span className="font-medium text-foreground">{poi.name}</span>
                      <Badge variant="outline" className={priorityBadge.class}>
                        {priorityBadge.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {poi.maxTime} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Route className="w-3 h-3" />
                        {getTransportIcon(poi.transportMode)} {poi.transportMode}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemovePOI(poi.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Move-in Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Move-in Date
          </label>
          <Popover open={showCalendar} onOpenChange={setShowCalendar}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left">
                {settings.moveInDate ? format(settings.moveInDate, 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={settings.moveInDate || undefined}
                onSelect={(date) => {
                  updateSettings({ moveInDate: date || null });
                  setShowCalendar(false);
                }}
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Additional Filters */}
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Parking Required</span>
            <Switch
              checked={settings.parkingRequired}
              onCheckedChange={(checked) => updateSettings({ parkingRequired: checked })}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Pet Policy</label>
            <Select value={settings.petPolicy} onValueChange={(value) => updateSettings({ petPolicy: value })}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="dogs">Dogs Allowed</SelectItem>
                <SelectItem value="cats">Cats Allowed</SelectItem>
                <SelectItem value="both">Dogs & Cats</SelectItem>
                <SelectItem value="none">No Pets</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button className="w-full" size="lg">
          <Search className="w-4 h-4 mr-2" />
          Search Apartments
        </Button>
      </CardContent>
    </Card>
  );
};

export default UnifiedSearchPanel;
