import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { usePropertyState } from '@/contexts/PropertyStateContext';
import { Brain, MapPin, Target, Clock, Home, DollarSign, Heart, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface PointOfInterest {
  id: string;
  name: string;
  address: string;
  maxTime: number;
  transportMode: 'driving' | 'transit' | 'walking' | 'biking';
}

interface AIPreferences {
  // Location & Search
  location: string;
  searchRadius: number;
  maxDriveTime: number;
  pointsOfInterest: PointOfInterest[];
  
  // Budget & Housing
  budget: number;
  bedrooms: string;
  amenities: string[];
  dealBreakers: string[];
  
  // Lifestyle & Preferences
  lifestyle: string;
  workSchedule: string;
  priorities: string[];
  
  // Additional Info
  bio: string;
  useCase: string;
  additionalNotes: string;
}

const ProgramAI = () => {
  const navigate = useNavigate();
  const { searchFilters, setSearchFilters, userPreferences, setUserPreferences } = usePropertyState();
  const [saving, setSaving] = useState(false);
  const [isNewPOI, setIsNewPOI] = useState(false);
  const [newPOI, setNewPOI] = useState({ name: '', address: '', maxTime: 30, transportMode: 'driving' as const });
  
  const [preferences, setPreferences] = useState<AIPreferences>({
    location: searchFilters.location || 'Austin, TX',
    searchRadius: searchFilters.priceRange ? 25 : 25,
    maxDriveTime: 30,
    pointsOfInterest: [],
    budget: userPreferences.budget || 2500,
    bedrooms: '1',
    amenities: searchFilters.amenities || [],
    dealBreakers: [],
    lifestyle: '',
    workSchedule: '',
    priorities: [],
    bio: '',
    useCase: '',
    additionalNotes: ''
  });

  const commonAmenities = [
    'Pool', 'Gym/Fitness Center', 'Parking', 'Laundry', 'Pet-Friendly',
    'Balcony/Patio', 'In-Unit Washer/Dryer', 'Air Conditioning', 'Dishwasher',
    'Walk-in Closet', 'Rooftop Access', 'Concierge', 'Storage'
  ];

  const commonDealBreakers = [
    'No Parking', 'No Pets', 'Ground Floor', 'No AC', 'Shared Laundry',
    'No Dishwasher', 'Street Parking Only', 'No Elevator', 'Carpet Floors',
    'No Balcony', 'High Traffic Area', 'Far from Transit'
  ];

  const priorityOptions = [
    'Short Commute', 'Budget-Friendly', 'Modern Amenities', 'Pet-Friendly',
    'Nightlife Access', 'Family-Friendly', 'Transit Access', 'Quiet Area',
    'Walkable Neighborhood', 'Parking Available'
  ];

  const updatePreference = (key: keyof AIPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const addPOI = () => {
    if (newPOI.name && newPOI.address) {
      const poi: PointOfInterest = {
        id: Date.now().toString(),
        ...newPOI
      };
      updatePreference('pointsOfInterest', [...preferences.pointsOfInterest, poi]);
      setNewPOI({ name: '', address: '', maxTime: 30, transportMode: 'driving' });
      setIsNewPOI(false);
    }
  };

  const removePOI = (id: string) => {
    updatePreference('pointsOfInterest', preferences.pointsOfInterest.filter(poi => poi.id !== id));
  };

  const syncWithGlobalState = () => {
    // Sync search filters
    setSearchFilters({
      location: preferences.location,
      priceRange: [0, preferences.budget] as [number, number],
      bedrooms: parseInt(preferences.bedrooms) || 1,
      amenities: preferences.amenities
    });

    // Sync user preferences  
    setUserPreferences({
      budget: preferences.budget,
      location: preferences.location,
      moveInDate: userPreferences.moveInDate
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Sync with global state first
      syncWithGlobalState();

      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save preferences');
        return;
      }

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          location: preferences.location,
          search_radius: preferences.searchRadius,
          max_drive_time: preferences.maxDriveTime,
          points_of_interest: preferences.pointsOfInterest as any,
          budget: preferences.budget,
          bedrooms: preferences.bedrooms,
          amenities: preferences.amenities,
          deal_breakers: preferences.dealBreakers,
          lifestyle: preferences.lifestyle,
          work_schedule: preferences.workSchedule,
          priorities: preferences.priorities,
          bio: preferences.bio,
          use_case: preferences.useCase,
          additional_notes: preferences.additionalNotes,
          ai_preferences: {
            prioritizeCommute: preferences.maxDriveTime <= 20,
            budgetFocused: preferences.budget > 0,
            amenityImportant: preferences.amenities.length > 3,
            lifestyle: preferences.lifestyle,
            priorities: preferences.priorities
          },
          search_criteria: {
            maxBudget: preferences.budget,
            preferredAmenities: preferences.amenities,
            dealBreakers: preferences.dealBreakers,
            commutePriority: preferences.maxDriveTime,
            location: preferences.location,
            radius: preferences.searchRadius
          }
        });

      if (error) throw error;

      toast.success('AI preferences saved successfully!');
      navigate('/dashboard-new');
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Program Your AI</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Customize your AI assistant to find the perfect rental. These settings sync with your dashboard Quick Actions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location & Search Preferences */}
          <Card className="glass-dark border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                Location & Search
              </CardTitle>
              <CardDescription>Configure your search area and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Preferred Location</Label>
                <Input
                  placeholder="City, State"
                  value={preferences.location}
                  onChange={(e) => updatePreference('location', e.target.value)}
                  className="mt-1 bg-slate-800/50 border-slate-600/50"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Search Radius: {preferences.searchRadius} miles</Label>
                <Slider
                  value={[preferences.searchRadius]}
                  onValueChange={(value) => updatePreference('searchRadius', value[0])}
                  max={50}
                  min={5}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Max Drive Time: {preferences.maxDriveTime} minutes</Label>
                <Slider
                  value={[preferences.maxDriveTime]}
                  onValueChange={(value) => updatePreference('maxDriveTime', value[0])}
                  max={120}
                  min={10}
                  step={10}
                  className="mt-2"
                />
              </div>

              {/* Points of Interest */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Points of Interest</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsNewPOI(true)}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add POI
                  </Button>
                </div>

                {isNewPOI && (
                  <div className="bg-slate-800/30 rounded-lg p-3 mb-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Name (e.g., Work)"
                        value={newPOI.name}
                        onChange={(e) => setNewPOI({...newPOI, name: e.target.value})}
                        className="bg-slate-700/50 border-slate-600/50"
                      />
                      <Input
                        placeholder="Address"
                        value={newPOI.address}
                        onChange={(e) => setNewPOI({...newPOI, address: e.target.value})}
                        className="bg-slate-700/50 border-slate-600/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Max time (min)"
                        value={newPOI.maxTime}
                        onChange={(e) => setNewPOI({...newPOI, maxTime: Number(e.target.value)})}
                        className="bg-slate-700/50 border-slate-600/50"
                      />
                      <Select value={newPOI.transportMode} onValueChange={(value: any) => setNewPOI({...newPOI, transportMode: value})}>
                        <SelectTrigger className="bg-slate-700/50 border-slate-600/50">
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
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addPOI}>Add</Button>
                      <Button size="sm" variant="outline" onClick={() => setIsNewPOI(false)}>Cancel</Button>
                    </div>
                  </div>
                )}

                {preferences.pointsOfInterest.map((poi) => (
                  <div key={poi.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-700/30 mb-2">
                    <div>
                      <div className="text-sm font-medium">{poi.name}</div>
                      <div className="text-xs text-muted-foreground">{poi.address} • {poi.maxTime}min</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => removePOI(poi.id)} className="w-6 h-6 p-0">
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Budget & Housing */}
          <Card className="glass-dark border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5 text-green-400" />
                Budget & Housing
              </CardTitle>
              <CardDescription>Define your housing needs and budget</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Max Budget: ${preferences.budget}/month</Label>
                <Slider
                  value={[preferences.budget]}
                  onValueChange={(value) => updatePreference('budget', value[0])}
                  max={10000}
                  min={500}
                  step={100}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Bedrooms</Label>
                <Select value={preferences.bedrooms} onValueChange={(value) => updatePreference('bedrooms', value)}>
                  <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-600/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="1">1 Bedroom</SelectItem>
                    <SelectItem value="2">2 Bedrooms</SelectItem>
                    <SelectItem value="3">3+ Bedrooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Must-Have Amenities</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {commonAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={preferences.amenities.includes(amenity)}
                        onCheckedChange={() => 
                          updatePreference('amenities', toggleArrayItem(preferences.amenities, amenity))
                        }
                      />
                      <Label htmlFor={`amenity-${amenity}`} className="text-xs">{amenity}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Deal Breakers</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {commonDealBreakers.map((dealBreaker) => (
                    <div key={dealBreaker} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dealbreaker-${dealBreaker}`}
                        checked={preferences.dealBreakers.includes(dealBreaker)}
                        onCheckedChange={() => 
                          updatePreference('dealBreakers', toggleArrayItem(preferences.dealBreakers, dealBreaker))
                        }
                      />
                      <Label htmlFor={`dealbreaker-${dealBreaker}`} className="text-xs">{dealBreaker}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lifestyle & Priorities */}
          <Card className="glass-dark border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                Lifestyle & Priorities
              </CardTitle>
              <CardDescription>Help AI understand your lifestyle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Lifestyle</Label>
                <Select value={preferences.lifestyle} onValueChange={(value) => updatePreference('lifestyle', value)}>
                  <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-600/50">
                    <SelectValue placeholder="Select your lifestyle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active & Outdoorsy</SelectItem>
                    <SelectItem value="social">Social & Nightlife</SelectItem>
                    <SelectItem value="homebody">Homebody & Quiet</SelectItem>
                    <SelectItem value="professional">Professional & Focused</SelectItem>
                    <SelectItem value="family">Family-Oriented</SelectItem>
                    <SelectItem value="creative">Creative & Artistic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Work Schedule</Label>
                <Select value={preferences.workSchedule} onValueChange={(value) => updatePreference('workSchedule', value)}>
                  <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-600/50">
                    <SelectValue placeholder="Select work schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9-5">Traditional 9-5</SelectItem>
                    <SelectItem value="flexible">Flexible Hours</SelectItem>
                    <SelectItem value="remote">Fully Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="shift">Shift Work</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Top Priorities</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {priorityOptions.map((priority) => (
                    <div key={priority} className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${priority}`}
                        checked={preferences.priorities.includes(priority)}
                        onCheckedChange={() => 
                          updatePreference('priorities', toggleArrayItem(preferences.priorities, priority))
                        }
                      />
                      <Label htmlFor={`priority-${priority}`} className="text-xs">{priority}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="glass-dark border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-yellow-400" />
                Additional Information
              </CardTitle>
              <CardDescription>Optional details to further personalize your AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Bio / About You</Label>
                <Textarea
                  placeholder="Tell us about yourself..."
                  value={preferences.bio}
                  onChange={(e) => updatePreference('bio', e.target.value)}
                  className="mt-1 bg-slate-800/50 border-slate-600/50"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Use Case</Label>
                <Textarea
                  placeholder="How do you plan to use ApartmentIQ?"
                  value={preferences.useCase}
                  onChange={(e) => updatePreference('useCase', e.target.value)}
                  className="mt-1 bg-slate-800/50 border-slate-600/50"
                  rows={2}
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Additional Notes</Label>
                <Textarea
                  placeholder="Any other preferences or requirements..."
                  value={preferences.additionalNotes}
                  onChange={(e) => updatePreference('additionalNotes', e.target.value)}
                  className="mt-1 bg-slate-800/50 border-slate-600/50"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {saving ? 'Saving...' : 'Save AI Preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProgramAI;