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
import Header from '@/components/Header';

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
    searchRadius: 25,
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

  // Load user profile data on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading profile:', error);
          return;
        }

        if (profile) {
          setPreferences(prev => ({
            ...prev,
            location: profile.location || 'Austin, TX',
            searchRadius: profile.search_radius || 25,
            maxDriveTime: profile.max_drive_time || 30,
            pointsOfInterest: (profile.points_of_interest as any) || [],
            budget: profile.budget || 2500,
            bedrooms: profile.bedrooms || '1',
            amenities: profile.amenities || [],
            dealBreakers: profile.deal_breakers || [],
            lifestyle: profile.lifestyle || '',
            workSchedule: profile.work_schedule || '',
            priorities: profile.priorities || [],
            bio: profile.bio || '',
            useCase: profile.use_case || '',
            additionalNotes: profile.additional_notes || ''
          }));
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, []);

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
    // Sync search filters with global state
    setSearchFilters({
      location: preferences.location,
      priceRange: [0, preferences.budget] as [number, number],
      bedrooms: parseInt(preferences.bedrooms) || 1,
      amenities: preferences.amenities
    });

    // Sync user preferences with global state
    setUserPreferences({
      budget: preferences.budget,
      location: preferences.location,
      moveInDate: userPreferences.moveInDate
    });
  };

  // Auto-sync when key preferences change
  useEffect(() => {
    syncWithGlobalState();
  }, [preferences.location, preferences.budget, preferences.amenities, preferences.bedrooms]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Sync with global state first
      syncWithGlobalState();

      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save preferences');
        navigate('/auth');
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
            has_completed_ai_programming: true,
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
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 p-4">
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
          {/* Combined Location & Search Settings */}
          <Card className="glass-dark border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                Location & Search Settings
              </CardTitle>
              <CardDescription>Configure your preferred location or points of interest</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preferred Location Search */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Preferred Location</Label>
                <Input
                  placeholder="City, State (e.g., Austin, TX)"
                  value={preferences.location}
                  onChange={(e) => updatePreference('location', e.target.value)}
                  className="bg-slate-800/50 border-slate-600/50"
                />
                <p className="text-xs text-muted-foreground">
                  Use this OR add points of interest below
                </p>
              </div>

              {/* Points of Interest */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    Your Points of Interest
                  </Label>
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

                {/* POI List */}
                <div className="grid grid-cols-1 gap-2">
                  {preferences.pointsOfInterest.map((poi) => (
                    <div key={poi.id} className="bg-slate-800/30 border border-slate-600/30 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {poi.transportMode === 'driving' ? '🚗' : 
                               poi.transportMode === 'transit' ? '🚌' : 
                               poi.transportMode === 'walking' ? '🚶' : '🚴'}
                            </Badge>
                            <span className="font-medium text-sm">{poi.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{poi.address}</p>
                          <p className="text-xs text-blue-400">Max {poi.maxTime} min</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removePOI(poi.id)}
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add POI Form */}
                {isNewPOI && (
                  <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Name (e.g., My Office)"
                        value={newPOI.name}
                        onChange={(e) => setNewPOI(prev => ({ ...prev, name: e.target.value }))}
                        className="text-sm"
                      />
                      <Input
                        placeholder="Address"
                        value={newPOI.address}
                        onChange={(e) => setNewPOI(prev => ({ ...prev, address: e.target.value }))}
                        className="text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Max Time (min)</Label>
                        <Input
                          type="number"
                          value={newPOI.maxTime}
                          onChange={(e) => setNewPOI(prev => ({ ...prev, maxTime: parseInt(e.target.value) || 30 }))}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Transport</Label>
                        <Select
                          value={newPOI.transportMode}
                          onValueChange={(value: any) => setNewPOI(prev => ({ ...prev, transportMode: value }))}
                        >
                          <SelectTrigger className="text-sm">
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
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addPOI} className="flex-1">
                        Add POI
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsNewPOI(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Search Settings */}
              <div className="space-y-4 pt-4 border-t border-slate-600/30">
                <Label className="text-sm font-medium">Search Settings</Label>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm">Budget Range</Label>
                    <span className="text-sm text-blue-400">${preferences.budget}/month</span>
                  </div>
                  <Slider
                    value={[preferences.budget]}
                    onValueChange={(value) => updatePreference('budget', value[0])}
                    max={5000}
                    min={500}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$500</span>
                    <span>$5,000</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm">Max Drive Time</Label>
                    <span className="text-sm text-blue-400">{preferences.maxDriveTime} minutes</span>
                  </div>
                  <Slider
                    value={[preferences.maxDriveTime]}
                    onValueChange={(value) => updatePreference('maxDriveTime', value[0])}
                    max={120}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Bedrooms</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {['studio', '1', '2', '3+'].map((bedroom) => (
                      <Button
                        key={bedroom}
                        size="sm"
                        variant={preferences.bedrooms === bedroom ? "default" : "outline"}
                        onClick={() => updatePreference('bedrooms', bedroom)}
                        className="text-xs"
                      >
                        {bedroom === 'studio' ? 'Studio' : 
                         bedroom === '3+' ? '3+ BR' : `${bedroom} BR`}
                      </Button>
                    ))}
                  </div>
                </div>
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
                  placeholder="How do you plan to use Apartment Locator AI?"
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
    </div>
  );
};

export default ProgramAI;