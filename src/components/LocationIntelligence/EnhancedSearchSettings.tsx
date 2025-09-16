import React, { useState } from 'react';
import { Settings, DollarSign, MapPin, Clock, Home, Car, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface SearchSettingsProps {
  onSettingsChange?: (settings: SearchSettings) => void;
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

const EnhancedSearchSettings: React.FC<SearchSettingsProps> = ({ onSettingsChange }) => {
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

  const [showCalendar, setShowCalendar] = useState(false);

  const updateSettings = (newSettings: Partial<SearchSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    onSettingsChange?.(updated);
  };

  const bedroomOptions = [
    { value: 'studio', label: 'Studio', icon: '🏠' },
    { value: '1', label: '1 BR', icon: '🛏️' },
    { value: '2', label: '2 BR', icon: '🛏️🛏️' },
    { value: '3', label: '3 BR', icon: '🛏️🛏️🛏️' }
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

  const resetFilters = () => {
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
  };

  return (
    <Card className="bg-slate-800/30 border border-slate-700/30 w-full flex flex-col h-full">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="w-5 h-5 text-blue-400" />
            Search Settings
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetFilters}
            className="text-xs hover:bg-slate-700/50"
          >
            Reset
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-6 overflow-y-auto">
        {/* Budget Range */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <label className="text-sm font-medium text-foreground">Budget Range</label>
          </div>
          <div className="px-3">
            <Slider
              value={settings.budgetRange}
              onValueChange={(value) => updateSettings({ budgetRange: value as [number, number] })}
              min={500}
              max={5000}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>${settings.budgetRange[0].toLocaleString()}</span>
              <span>${settings.budgetRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Max Drive Time */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" />
            <label className="text-sm font-medium text-foreground">Max Drive Time</label>
          </div>
          <Select 
            value={settings.maxDriveTime.toString()} 
            onValueChange={(value) => updateSettings({ maxDriveTime: Number(value) })}
          >
            <SelectTrigger className="bg-slate-700/50 border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="15">⏱️ 15 minutes</SelectItem>
              <SelectItem value="20">⏱️ 20 minutes</SelectItem>
              <SelectItem value="30">⏱️ 30 minutes</SelectItem>
              <SelectItem value="45">⏱️ 45 minutes</SelectItem>
              <SelectItem value="60">⏱️ 60 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bedrooms */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-purple-400" />
            <label className="text-sm font-medium text-foreground">Bedrooms</label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {bedroomOptions.map((option) => (
              <Button
                key={option.value}
                variant={settings.bedrooms.includes(option.value) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleBedroom(option.value)}
                className={`h-12 flex-col gap-1 transition-all duration-200 ${
                  settings.bedrooms.includes(option.value)
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500'
                    : 'bg-slate-700/30 hover:bg-slate-600/50 border-slate-600/50'
                }`}
              >
                <span className="text-sm">{option.icon}</span>
                <span className="text-xs">{option.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Move-in Date */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-yellow-400" />
            <label className="text-sm font-medium text-foreground">Move-in Date</label>
          </div>
          <Popover open={showCalendar} onOpenChange={setShowCalendar}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal bg-slate-700/50 border-slate-600"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {settings.moveInDate ? format(settings.moveInDate, 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600" align="start">
              <CalendarComponent
                mode="single"
                selected={settings.moveInDate || undefined}
                onSelect={(date) => {
                  updateSettings({ moveInDate: date || null });
                  setShowCalendar(false);
                }}
                disabled={(date) => date < new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedSearchSettings;