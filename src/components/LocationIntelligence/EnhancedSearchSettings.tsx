import React, { useState } from 'react';
import { Settings, DollarSign, MapPin, Clock, Home, Car, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { dataTracker } from '@/lib/data-tracker';
import type { Json } from '../../../supabase/types';

interface SearchSettingsProps {
  onSettingsChange?: (settings: SearchSettings) => void;
}

export interface SearchSettings {
  budgetRange: number;
  searchRadius: number;
  bedrooms: number[];
  petPolicy: string;
  parkingRequired: boolean;
  amenities: string[];
  moveInDate: Date | null;
}

const EnhancedSearchSettings: React.FC<SearchSettingsProps> = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState<SearchSettings>({
    budgetRange: 2250,
    searchRadius: 25,
    bedrooms: [1],
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
    
    // Track search settings changes
    dataTracker.trackContent({
      contentType: 'search_settings',
      action: 'update',
      contentData: {
        changed_settings: Object.keys(newSettings),
        budget_range: updated.budgetRange,
        search_radius: updated.searchRadius,
        selected_amenities: updated.amenities,
        bedrooms_selected: updated.bedrooms,
        timestamp: new Date().toISOString()
      }
    });
  };

  const bedroomOptions = [
    { value: 0, label: 'Studio', icon: '🏠' },
    { value: 1, label: '1 BR', icon: '🛏️' },
    { value: 2, label: '2 BR', icon: '🛏️🛏️' },
    { value: 3, label: '3+ BR', icon: '🏘️' }
  ];

  const amenityOptions = [
    'Pool', 'Gym', 'Parking', 'Pet-Friendly', 'Laundry', 'Balcony', 
    'Air Conditioning', 'Dishwasher', 'Walk-in Closet', 'Elevator'
  ];

  const toggleBedroom = (bedroom: number) => {
    const newBedrooms = settings.bedrooms.includes(bedroom)
      ? settings.bedrooms.filter(b => b !== bedroom)
      : [...settings.bedrooms, bedroom];
    
    // Track bedroom filter change
    dataTracker.trackInteraction('toggle_bedroom_filter', bedroom.toString(), {
      action: settings.bedrooms.includes(bedroom) ? 'remove' : 'add',
      current_bedrooms: settings.bedrooms,
      new_bedrooms: newBedrooms
    });
    
    updateSettings({ bedrooms: newBedrooms });
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = settings.amenities.includes(amenity)
      ? settings.amenities.filter(a => a !== amenity)
      : [...settings.amenities, amenity];
    
    // Track amenity filter change
    dataTracker.trackInteraction('toggle_amenity_filter', amenity, {
      action: settings.amenities.includes(amenity) ? 'remove' : 'add',
      current_amenities: settings.amenities,
      new_amenities: newAmenities
    });
    
    updateSettings({ amenities: newAmenities });
  };

  const resetFilters = () => {
    const defaultSettings: SearchSettings = {
      budgetRange: 2250,
      searchRadius: 25,
      bedrooms: [],
      petPolicy: 'any',
      parkingRequired: false,
      amenities: [],
      moveInDate: null
    };
    
    // Track filter reset
    const payload = {
      previous_settings: {
        budgetRange: settings.budgetRange,
        searchRadius: settings.searchRadius,
        bedrooms: settings.bedrooms,
        petPolicy: settings.petPolicy,
        parkingRequired: settings.parkingRequired,
        amenities: settings.amenities,
        moveInDate: settings.moveInDate ? settings.moveInDate.toISOString() : null
      },
      reset_to: {
        budgetRange: defaultSettings.budgetRange,
        searchRadius: defaultSettings.searchRadius,
        bedrooms: defaultSettings.bedrooms,
        petPolicy: defaultSettings.petPolicy,
        parkingRequired: defaultSettings.parkingRequired,
        amenities: defaultSettings.amenities,
        moveInDate: defaultSettings.moveInDate
      },
      timestamp: new Date().toISOString()
    };

  dataTracker.trackInteraction('reset_search_filters', 'all_filters', payload as unknown as Json);
    
    setSettings(defaultSettings);
    onSettingsChange?.(defaultSettings);
  };

  return (
    <div className="space-y-6">
      
      <CardContent className="space-y-6">
        {/* Budget Range */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💰</span>
            <label className="text-sm font-medium text-foreground">Budget Range</label>
          </div>
          <div className="relative mb-2">
            <div className="absolute inset-0 h-1.5 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full" />
            <Slider
              value={[settings.budgetRange]}
              onValueChange={(value) => updateSettings({ budgetRange: value[0] })}
              min={2000}
              max={2500}
              step={50}
              className="relative z-10"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$2,000</span>
            <span>${settings.budgetRange.toLocaleString()}</span>
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🛏️</span>
            <label className="text-sm font-medium text-foreground">Bedrooms</label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={settings.bedrooms.includes(0) ? 'default' : 'secondary'}
              onClick={() => toggleBedroom(0)}
              className={`h-12 ${
                settings.bedrooms.includes(0) 
                  ? 'bg-slate-500 hover:bg-slate-600' 
                  : 'bg-slate-300 hover:bg-slate-400 text-slate-700'
              }`}
            >
              Studio
            </Button>
            <Button
              variant={settings.bedrooms.includes(1) ? 'default' : 'secondary'}
              onClick={() => toggleBedroom(1)}
              className={`h-12 ${
                settings.bedrooms.includes(1) 
                  ? 'bg-primary hover:bg-primary/90' 
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              1 BR
            </Button>
            <Button
              variant={settings.bedrooms.includes(2) ? 'default' : 'secondary'}
              onClick={() => toggleBedroom(2)}
              className={`h-12 ${
                settings.bedrooms.includes(2) 
                  ? 'bg-primary hover:bg-primary/90' 
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              2 BR
            </Button>
            <Button
              variant={settings.bedrooms.includes(3) ? 'default' : 'secondary'}
              onClick={() => toggleBedroom(3)}
              className={`h-12 ${
                settings.bedrooms.includes(3) 
                  ? 'bg-primary hover:bg-primary/90' 
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              3+ BR
            </Button>
          </div>
        </div>

      </CardContent>

    </div>
  );
};

export default EnhancedSearchSettings;