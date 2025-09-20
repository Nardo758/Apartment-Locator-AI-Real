import React, { useState } from 'react';
import { Search, Settings, MapPin, Filter, Plus, DollarSign, Home, Clock, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PointOfInterest } from '@/hooks/useLocationIntelligence';
import { designSystem } from '@/lib/design-system';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface UnifiedApartmentSearchProps {
  pointsOfInterest: PointOfInterest[];
  onAddPOI: (poi: Omit<PointOfInterest, 'id'>) => void;
  onRemovePOI: (id: string) => void;
  onUpdatePriority: (id: string, priority: 'high' | 'medium' | 'low') => void;
  onSettingsChange?: (settings: SearchSettings) => void;
  onSearch?: (location: string) => void;
}

export interface SearchSettings {
  budgetRange: [number, number];
  searchRadius: number;
  maxDriveTime: number;
  bedrooms: string[];
  petPolicy: string;
  parkingRequired: boolean;
  amenities: string[];
  moveInDate: Date | null;
}

const UnifiedApartmentSearch: React.FC<UnifiedApartmentSearchProps> = ({
  pointsOfInterest,
  onAddPOI,
  onRemovePOI,
  onUpdatePriority,
  onSettingsChange,
  onSearch
}) => {
  const [searchLocation, setSearchLocation] = useState('');
  const [showPOIModal, setShowPOIModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    search: true,
    filters: false,
    pois: false
  });
  
  const [settings, setSettings] = useState<SearchSettings>({
    budgetRange: [2000, 2500],
    searchRadius: 25,
    maxDriveTime: 30,
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
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSearch = () => {
    if (searchLocation.trim()) {
      onSearch?.(searchLocation);
    }
  };

  const handleAddPOI = () => {
    if (newPOI.name && newPOI.address) {
      const poiToAdd = {
        ...newPOI,
        coordinates: { lat: 30.2672, lng: -97.7431 }
      };
      onAddPOI(poiToAdd);
      setNewPOI({
        name: '',
        address: '',
        category: 'work',
        priority: 'medium',
        maxTime: 30,
        transportMode: 'driving'
      });
      setShowPOIModal(false);
    }
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

  const getCategoryIcon = (category: string) => {
    const icons = {
      work: '💼',
      gym: '🏋️',
      school: '🎓',
      shopping: '🛍️',
      custom: '📍'
    };
    return icons[category as keyof typeof icons] || '📍';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-amber-100 text-amber-700 border-amber-200',
      low: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  return (
    <Card className="bg-card border-border shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
            <Search className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-foreground">Apartment Search</div>
            <div className="text-sm text-muted-foreground font-normal">
              Location, preferences & filters
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Search Section */}
        <Collapsible open={expandedSections.search} onOpenChange={() => toggleSection('search')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-muted/50 hover:bg-muted">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <div className="font-semibold">Location Search</div>
                  <div className="text-sm text-muted-foreground">
                    {searchLocation || 'Enter city, neighborhood, or address'}
                  </div>
                </div>
              </div>
              <div className="text-muted-foreground">{expandedSections.search ? '−' : '+'}</div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="flex gap-3">
              <Input
                placeholder="Austin, TX or specific address"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} className="px-6">
                Search
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Search Filters Section */}
        <Collapsible open={expandedSections.filters} onOpenChange={() => toggleSection('filters')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-muted/50 hover:bg-muted">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <div className="font-semibold">Search Filters</div>
                  <div className="text-sm text-muted-foreground">
                    Budget: ${settings.budgetRange[0]}-${settings.budgetRange[1]}, {settings.bedrooms.length} bedroom types
                  </div>
                </div>
              </div>
              <div className="text-muted-foreground">{expandedSections.filters ? '−' : '+'}</div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-6 pt-4">
            <Tabs defaultValue="budget" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="budget">Budget & Size</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="timing">Timing</TabsTrigger>
              </TabsList>
              
              <TabsContent value="budget" className="space-y-4">
                {/* Budget Range */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <label className="text-sm font-medium">Monthly Budget</label>
                  </div>
                  <Slider
                    value={settings.budgetRange}
                    onValueChange={(value) => updateSettings({ budgetRange: value as [number, number] })}
                    min={500}
                    max={5000}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>${settings.budgetRange[0].toLocaleString()}</span>
                    <span>${settings.budgetRange[1].toLocaleString()}</span>
                  </div>
                </div>

                {/* Bedrooms */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-primary" />
                    <label className="text-sm font-medium">Bedrooms</label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {bedroomOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={settings.bedrooms.includes(option.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleBedroom(option.value)}
                        className="h-12 flex-col gap-1"
                      >
                        <span className="text-sm">{option.icon}</span>
                        <span className="text-xs">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Max Drive Time */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <label className="text-sm font-medium">Max Commute Time</label>
                  </div>
                  <Select 
                    value={settings.maxDriveTime.toString()} 
                    onValueChange={(value) => updateSettings({ maxDriveTime: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="amenities" className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {amenityOptions.map((amenity) => (
                    <Button
                      key={amenity}
                      variant={settings.amenities.includes(amenity) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAmenity(amenity)}
                      className="h-10 text-xs"
                    >
                      {amenity}
                    </Button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="timing" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <label className="text-sm font-medium">Move-in Date</label>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {settings.moveInDate ? format(settings.moveInDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={settings.moveInDate || undefined}
                        onSelect={(date) => updateSettings({ moveInDate: date || null })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </TabsContent>
            </Tabs>
          </CollapsibleContent>
        </Collapsible>

        {/* Points of Interest Section */}
        <Collapsible open={expandedSections.pois} onOpenChange={() => toggleSection('pois')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-muted/50 hover:bg-muted">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <div className="font-semibold">Points of Interest ({pointsOfInterest.length})</div>
                  <div className="text-sm text-muted-foreground">
                    {pointsOfInterest.length > 0 ? 'Important locations for commute optimization' : 'Add important locations'}
                  </div>
                </div>
              </div>
              <div className="text-muted-foreground">{expandedSections.pois ? '−' : '+'}</div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Add locations that matter to you for better recommendations
              </div>
              <Dialog open={showPOIModal} onOpenChange={setShowPOIModal}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add POI
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add Point of Interest</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input
                          placeholder="e.g., My Office"
                          value={newPOI.name}
                          onChange={(e) => setNewPOI({ ...newPOI, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Category</label>
                        <Select value={newPOI.category} onValueChange={(value: any) => setNewPOI({ ...newPOI, category: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="work">💼 Work</SelectItem>
                            <SelectItem value="gym">🏋️ Gym</SelectItem>
                            <SelectItem value="school">🎓 School</SelectItem>
                            <SelectItem value="shopping">🛍️ Shopping</SelectItem>
                            <SelectItem value="custom">📍 Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Address</label>
                      <Input
                        placeholder="Full address"
                        value={newPOI.address}
                        onChange={(e) => setNewPOI({ ...newPOI, address: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium">Priority</label>
                        <Select value={newPOI.priority} onValueChange={(value: any) => setNewPOI({ ...newPOI, priority: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Max Time</label>
                        <Input
                          type="number"
                          placeholder="30"
                          value={newPOI.maxTime}
                          onChange={(e) => setNewPOI({ ...newPOI, maxTime: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Transport</label>
                        <Select value={newPOI.transportMode} onValueChange={(value: any) => setNewPOI({ ...newPOI, transportMode: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="driving">🚗 Driving</SelectItem>
                            <SelectItem value="transit">🚌 Transit</SelectItem>
                            <SelectItem value="walking">🚶 Walking</SelectItem>
                            <SelectItem value="biking">🚴 Biking</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleAddPOI} className="flex-1">
                        Add POI
                      </Button>
                      <Button variant="outline" onClick={() => setShowPOIModal(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* POI List */}
            {pointsOfInterest.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {pointsOfInterest.map((poi) => (
                  <div key={poi.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getCategoryIcon(poi.category)}</span>
                      <div>
                        <div className="font-medium text-sm">{poi.name}</div>
                        <div className="text-xs text-muted-foreground">{poi.address}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(poi.priority)}`}>
                        {poi.priority}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemovePOI(poi.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <div className="text-sm text-muted-foreground">No points of interest added yet</div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              const defaultSettings: SearchSettings = {
                budgetRange: [1500, 3000],
                searchRadius: 25,
                maxDriveTime: 30,
                bedrooms: [],
                petPolicy: 'any',
                parkingRequired: false,
                amenities: [],
                moveInDate: null
              };
              setSettings(defaultSettings);
              onSettingsChange?.(defaultSettings);
            }}
            className="flex-1"
          >
            Reset Filters
          </Button>
          <Button onClick={handleSearch} className="flex-1">
            <Search className="w-4 h-4 mr-2" />
            Search Apartments
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnifiedApartmentSearch;