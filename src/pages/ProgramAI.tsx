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

interface AIPreferences {
  // Housing
  bedrooms: string;
  amenities: string[];
  dealBreakers: string[];
  
  // Transportation & Mobility
  publicTransitAccess: string[];
  walkabilityScoreRequirement: string;
  bikeFriendly: boolean;
  evChargingStations: boolean;
  rideShareAvailability: string;
  airportProximity: string;
  highwayAccess: boolean;
  
  // Neighborhood & Community
  schoolDistrictQuality: string;
  crimeRatePreference: string;
  noiseLevelTolerance: string;
  populationDensity: string;
  ageDemographics: string;
  diversityIndex: string;
  localCultureArts: boolean;
  
  // Safety & Security
  securitySystemRequired: boolean;
  gatedCommunityPreference: string;
  fireSafetyFeatures: string[];
  
  // Shopping & Services
  groceryStoreTypes: string[];
  shoppingMallAccess: boolean;
  farmersMarkets: boolean;
  bankingAccess: boolean;
  postOfficeProximity: boolean;
  dryCleaningServices: boolean;
  
  // Technology & Connectivity
  internetSpeedRequirement: string;
  cellTowerCoverage: string;
  smartHomeCompatibility: boolean;
  
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
  
  const [preferences, setPreferences] = useState<AIPreferences>({
    bedrooms: '1',
    amenities: searchFilters.amenities || [],
    dealBreakers: [],
    
    // Transportation & Mobility
    publicTransitAccess: [],
    walkabilityScoreRequirement: 'moderate',
    bikeFriendly: false,
    evChargingStations: false,
    rideShareAvailability: 'standard',
    airportProximity: 'moderate',
    highwayAccess: false,
    
    // Neighborhood & Community
    schoolDistrictQuality: 'no-preference',
    crimeRatePreference: 'low',
    noiseLevelTolerance: 'moderate',
    populationDensity: 'moderate',
    ageDemographics: 'mixed',
    diversityIndex: 'moderate',
    localCultureArts: false,
    
    // Safety & Security
    securitySystemRequired: false,
    gatedCommunityPreference: 'no-preference',
    fireSafetyFeatures: [],
    
    // Shopping & Services
    groceryStoreTypes: [],
    shoppingMallAccess: false,
    farmersMarkets: false,
    bankingAccess: false,
    postOfficeProximity: false,
    dryCleaningServices: false,
    
    // Technology & Connectivity
    internetSpeedRequirement: 'standard',
    cellTowerCoverage: 'good',
    smartHomeCompatibility: false,
    
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
          const profileAny = profile as any; // Type assertion for new columns
          setPreferences(prev => ({
            ...prev,
            bedrooms: profileAny.bedrooms || '1',
            amenities: profileAny.amenities || [],
            dealBreakers: profileAny.deal_breakers || [],
            
            // Load additional preferences from profile if they exist
            publicTransitAccess: profileAny.public_transit_access || [],
            walkabilityScoreRequirement: profileAny.walkability_score_requirement || 'moderate',
            bikeFriendly: profileAny.bike_friendly || false,
            evChargingStations: profileAny.ev_charging_stations || false,
            rideShareAvailability: profileAny.ride_share_availability || 'standard',
            airportProximity: profileAny.airport_proximity || 'moderate',
            highwayAccess: profileAny.highway_access || false,
            
            schoolDistrictQuality: profileAny.school_district_quality || 'no-preference',
            crimeRatePreference: profileAny.crime_rate_preference || 'low',
            noiseLevelTolerance: profileAny.noise_level_tolerance || 'moderate',
            populationDensity: profileAny.population_density || 'moderate',
            ageDemographics: profileAny.age_demographics || 'mixed',
            diversityIndex: profileAny.diversity_index || 'moderate',
            localCultureArts: profileAny.local_culture_arts || false,
            
            securitySystemRequired: profileAny.security_system_required || false,
            gatedCommunityPreference: profileAny.gated_community_preference || 'no-preference',
            emergencyServicesResponseTime: profileAny.emergency_services_response_time || 'standard',
            floodZoneAvoidance: profileAny.flood_zone_avoidance || false,
            fireSafetyFeatures: profileAny.fire_safety_features || [],
            
            groceryStoreTypes: profileAny.grocery_store_types || [],
            shoppingMallAccess: profileAny.shopping_mall_access || false,
            farmersMarkets: profileAny.farmers_markets || false,
            bankingAccess: profileAny.banking_access || false,
            postOfficeProximity: profileAny.post_office_proximity || false,
            dryCleaningServices: profileAny.dry_cleaning_services || false,
            
            internetSpeedRequirement: profileAny.internet_speed_requirement || 'standard',
            cellTowerCoverage: profileAny.cell_tower_coverage || 'good',
            smartHomeCompatibility: profileAny.smart_home_compatibility || false,
            cableStreamingOptions: profileAny.cable_streaming_options || [],
            
            lifestyle: profileAny.lifestyle || '',
            workSchedule: profileAny.work_schedule || '',
            priorities: profileAny.priorities || [],
            bio: profileAny.bio || '',
            useCase: profileAny.use_case || '',
            additionalNotes: profileAny.additional_notes || ''
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

  const syncWithGlobalState = () => {
    // Sync search filters with global state
    setSearchFilters({
      location: searchFilters.location || 'Austin, TX',
      priceRange: [0, userPreferences.budget || 2500] as [number, number],
      bedrooms: parseInt(preferences.bedrooms) || 1,
      amenities: preferences.amenities
    });

    // Sync user preferences with global state
    setUserPreferences({
      budget: userPreferences.budget || 2500,
      location: userPreferences.location || 'Austin, TX',
      moveInDate: userPreferences.moveInDate
    });
  };

  // Auto-sync when key preferences change
  useEffect(() => {
    syncWithGlobalState();
  }, [preferences.amenities, preferences.bedrooms]);

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
            bedrooms: preferences.bedrooms,
            amenities: preferences.amenities,
            deal_breakers: preferences.dealBreakers,
            
            // Transportation & Mobility
            public_transit_access: preferences.publicTransitAccess,
            walkability_score_requirement: preferences.walkabilityScoreRequirement,
            bike_friendly: preferences.bikeFriendly,
            ev_charging_stations: preferences.evChargingStations,
            ride_share_availability: preferences.rideShareAvailability,
            airport_proximity: preferences.airportProximity,
            highway_access: preferences.highwayAccess,
            
            // Neighborhood & Community
            school_district_quality: preferences.schoolDistrictQuality,
            crime_rate_preference: preferences.crimeRatePreference,
            noise_level_tolerance: preferences.noiseLevelTolerance,
            population_density: preferences.populationDensity,
            age_demographics: preferences.ageDemographics,
            diversity_index: preferences.diversityIndex,
            local_culture_arts: preferences.localCultureArts,
            
            // Safety & Security
            security_system_required: preferences.securitySystemRequired,
            gated_community_preference: preferences.gatedCommunityPreference,
            fire_safety_features: preferences.fireSafetyFeatures,
            
            // Shopping & Services
            grocery_store_types: preferences.groceryStoreTypes,
            shopping_mall_access: preferences.shoppingMallAccess,
            farmers_markets: preferences.farmersMarkets,
            banking_access: preferences.bankingAccess,
            post_office_proximity: preferences.postOfficeProximity,
            dry_cleaning_services: preferences.dryCleaningServices,
            
            // Technology & Connectivity
            internet_speed_requirement: preferences.internetSpeedRequirement,
            cell_tower_coverage: preferences.cellTowerCoverage,
            smart_home_compatibility: preferences.smartHomeCompatibility,
            
            lifestyle: preferences.lifestyle,
            work_schedule: preferences.workSchedule,
            priorities: preferences.priorities,
            bio: preferences.bio,
            use_case: preferences.useCase,
            additional_notes: preferences.additionalNotes,
            has_completed_ai_programming: true,
            ai_preferences: {
              amenityImportant: preferences.amenities.length > 3,
              transportationFocused: preferences.publicTransitAccess.length > 0 || preferences.bikeFriendly,
              safetyConscious: preferences.securitySystemRequired || preferences.crimeRatePreference === 'very-low',
              techSavvy: preferences.smartHomeCompatibility || preferences.internetSpeedRequirement === 'gigabit',
              lifestyle: preferences.lifestyle,
              priorities: preferences.priorities
            },
            search_criteria: {
              preferredAmenities: preferences.amenities,
              dealBreakers: preferences.dealBreakers,
              transportationNeeds: preferences.publicTransitAccess,
              safetyRequirements: preferences.fireSafetyFeatures,
              communityPreferences: {
                crimeRate: preferences.crimeRatePreference,
                noiseLevel: preferences.noiseLevelTolerance,
                demographics: preferences.ageDemographics
              }
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

        <div className="grid grid-cols-1 gap-6">
          {/* Housing */}
          <Card className="glass-dark border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5 text-green-400" />
                Housing
              </CardTitle>
              <CardDescription>Define your housing needs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

          {/* Transportation & Mobility */}
          <Card className="glass-dark border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                Transportation & Mobility
              </CardTitle>
              <CardDescription>How you'll get around and commute preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Public Transit Access</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['Subway', 'Bus', 'Light Rail', 'Commuter Train'].map((transit) => (
                    <div key={transit} className="flex items-center space-x-2">
                      <Checkbox
                        id={`transit-${transit}`}
                        checked={preferences.publicTransitAccess.includes(transit)}
                        onCheckedChange={() => 
                          updatePreference('publicTransitAccess', toggleArrayItem(preferences.publicTransitAccess, transit))
                        }
                      />
                      <Label htmlFor={`transit-${transit}`} className="text-xs">{transit}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Walkability Score Requirements</Label>
                <Select value={preferences.walkabilityScoreRequirement} onValueChange={(value) => updatePreference('walkabilityScoreRequirement', value)}>
                  <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-600/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority (Any Score)</SelectItem>
                    <SelectItem value="moderate">Moderate (50+ Score)</SelectItem>
                    <SelectItem value="high">High Priority (70+ Score)</SelectItem>
                    <SelectItem value="essential">Essential (90+ Score)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Ride-Share Availability</Label>
                <Select value={preferences.rideShareAvailability} onValueChange={(value) => updatePreference('rideShareAvailability', value)}>
                  <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-600/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-important">Not Important</SelectItem>
                    <SelectItem value="standard">Standard Availability</SelectItem>
                    <SelectItem value="high">High Availability</SelectItem>
                    <SelectItem value="essential">Essential</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bike-friendly"
                    checked={preferences.bikeFriendly}
                    onCheckedChange={(checked) => updatePreference('bikeFriendly', checked)}
                  />
                  <Label htmlFor="bike-friendly" className="text-sm">Bike-Friendly Infrastructure</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ev-charging"
                    checked={preferences.evChargingStations}
                    onCheckedChange={(checked) => updatePreference('evChargingStations', checked)}
                  />
                  <Label htmlFor="ev-charging" className="text-sm">Car Charging Stations (EV)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="highway-access"
                    checked={preferences.highwayAccess}
                    onCheckedChange={(checked) => updatePreference('highwayAccess', checked)}
                  />
                  <Label htmlFor="highway-access" className="text-sm">Highway Access</Label>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Airport Proximity</Label>
                <Select value={preferences.airportProximity} onValueChange={(value) => updatePreference('airportProximity', value)}>
                  <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-600/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="close">Close (0-30 min)</SelectItem>
                    <SelectItem value="moderate">Moderate (30-60 min)</SelectItem>
                    <SelectItem value="far">Far (60+ min acceptable)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Neighborhood & Community */}
          <Card className="glass-dark border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5 text-green-400" />
                Neighborhood & Community
              </CardTitle>
              <CardDescription>Community characteristics and environment preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">School District Quality</Label>
                <Select value={preferences.schoolDistrictQuality} onValueChange={(value) => updatePreference('schoolDistrictQuality', value)}>
                  <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-600/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-preference">No Preference</SelectItem>
                    <SelectItem value="average">Average Schools OK</SelectItem>
                    <SelectItem value="good">Good Schools</SelectItem>
                    <SelectItem value="excellent">Excellent Schools Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Crime Rate Preferences</Label>
                <Select value={preferences.crimeRatePreference} onValueChange={(value) => updatePreference('crimeRatePreference', value)}>
                  <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-600/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="very-low">Very Low Crime</SelectItem>
                    <SelectItem value="low">Low Crime</SelectItem>
                    <SelectItem value="moderate">Moderate Crime Acceptable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Noise Level Tolerance</Label>
                <Select value={preferences.noiseLevelTolerance} onValueChange={(value) => updatePreference('noiseLevelTolerance', value)}>
                  <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-600/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="very-quiet">Very Quiet</SelectItem>
                    <SelectItem value="quiet">Quiet</SelectItem>
                    <SelectItem value="moderate">Moderate Noise OK</SelectItem>
                    <SelectItem value="busy">Busy Area OK</SelectItem>
                    <SelectItem value="urban">Urban/City Noise OK</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Population Density</Label>
                <Select value={preferences.populationDensity} onValueChange={(value) => updatePreference('populationDensity', value)}>
                  <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-600/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suburban">Suburban</SelectItem>
                    <SelectItem value="moderate">Moderate Density</SelectItem>
                    <SelectItem value="urban">Urban/High Density</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Age Demographics</Label>
                <Select value={preferences.ageDemographics} onValueChange={(value) => updatePreference('ageDemographics', value)}>
                  <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-600/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="young-professionals">Young Professionals</SelectItem>
                    <SelectItem value="families">Family-Oriented</SelectItem>
                    <SelectItem value="mixed">Mixed Ages</SelectItem>
                    <SelectItem value="mature">Mature Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Diversity Index</Label>
                <Select value={preferences.diversityIndex} onValueChange={(value) => updatePreference('diversityIndex', value)}>
                  <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-600/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-important">Not Important</SelectItem>
                    <SelectItem value="moderate">Moderate Diversity</SelectItem>
                    <SelectItem value="high">High Diversity Preferred</SelectItem>
                    <SelectItem value="essential">Essential</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="culture-arts"
                  checked={preferences.localCultureArts}
                  onCheckedChange={(checked) => updatePreference('localCultureArts', checked)}
                />
                <Label htmlFor="culture-arts" className="text-sm">Local Culture & Arts Scene Important</Label>
              </div>
            </CardContent>
          </Card>

          {/* Safety & Security */}
          <Card className="glass-dark border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-400" />
                Safety & Security
              </CardTitle>
              <CardDescription>Security features and safety requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              <div>
                <Label className="text-sm font-medium">Gated Community Preference</Label>
                <Select value={preferences.gatedCommunityPreference} onValueChange={(value) => updatePreference('gatedCommunityPreference', value)}>
                  <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-600/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="required">Required</SelectItem>
                    <SelectItem value="preferred">Preferred</SelectItem>
                    <SelectItem value="no-preference">No Preference</SelectItem>
                    <SelectItem value="avoid">Prefer to Avoid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Fire Safety Features</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['Sprinkler System', 'Fire Extinguishers', 'Smoke Detectors', 'Fire Escape'].map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={`fire-${feature}`}
                        checked={preferences.fireSafetyFeatures.includes(feature)}
                        onCheckedChange={() => 
                          updatePreference('fireSafetyFeatures', toggleArrayItem(preferences.fireSafetyFeatures, feature))
                        }
                      />
                      <Label htmlFor={`fire-${feature}`} className="text-xs">{feature}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="security-system"
                    checked={preferences.securitySystemRequired}
                    onCheckedChange={(checked) => updatePreference('securitySystemRequired', checked)}
                  />
                  <Label htmlFor="security-system" className="text-sm">Security System Required</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shopping & Services */}
          <Card className="glass-dark border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                Shopping & Services
              </CardTitle>
              <CardDescription>Access to shopping and essential services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Preferred Grocery Stores</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['Whole Foods', "Trader Joe's", 'Kroger', 'Safeway', 'Local Markets', "Costco/Sam's"].map((store) => (
                    <div key={store} className="flex items-center space-x-2">
                      <Checkbox
                        id={`grocery-${store}`}
                        checked={preferences.groceryStoreTypes.includes(store)}
                        onCheckedChange={() => 
                          updatePreference('groceryStoreTypes', toggleArrayItem(preferences.groceryStoreTypes, store))
                        }
                      />
                      <Label htmlFor={`grocery-${store}`} className="text-xs">{store}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shopping-mall"
                    checked={preferences.shoppingMallAccess}
                    onCheckedChange={(checked) => updatePreference('shoppingMallAccess', checked)}
                  />
                  <Label htmlFor="shopping-mall" className="text-sm">Shopping Mall Access</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="farmers-markets"
                    checked={preferences.farmersMarkets}
                    onCheckedChange={(checked) => updatePreference('farmersMarkets', checked)}
                  />
                  <Label htmlFor="farmers-markets" className="text-sm">Farmer's Markets</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="banking-access"
                    checked={preferences.bankingAccess}
                    onCheckedChange={(checked) => updatePreference('bankingAccess', checked)}
                  />
                  <Label htmlFor="banking-access" className="text-sm">Banking/ATM Access</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="post-office"
                    checked={preferences.postOfficeProximity}
                    onCheckedChange={(checked) => updatePreference('postOfficeProximity', checked)}
                  />
                  <Label htmlFor="post-office" className="text-sm">Post Office Proximity</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dry-cleaning"
                    checked={preferences.dryCleaningServices}
                    onCheckedChange={(checked) => updatePreference('dryCleaningServices', checked)}
                  />
                  <Label htmlFor="dry-cleaning" className="text-sm">Dry Cleaning Services</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technology & Connectivity */}
          <Card className="glass-dark border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                Technology & Connectivity
              </CardTitle>
              <CardDescription>Internet, technology, and connectivity requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">High-Speed Internet Availability</Label>
                <Select value={preferences.internetSpeedRequirement} onValueChange={(value) => updatePreference('internetSpeedRequirement', value)}>
                  <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-600/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic (25+ Mbps)</SelectItem>
                    <SelectItem value="standard">Standard (100+ Mbps)</SelectItem>
                    <SelectItem value="high-speed">High-Speed (500+ Mbps)</SelectItem>
                    <SelectItem value="gigabit">Gigabit (1000+ Mbps)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Cell Tower Coverage</Label>
                <Select value={preferences.cellTowerCoverage} onValueChange={(value) => updatePreference('cellTowerCoverage', value)}>
                  <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-600/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic Coverage</SelectItem>
                    <SelectItem value="good">Good Coverage</SelectItem>
                    <SelectItem value="excellent">Excellent Coverage</SelectItem>
                    <SelectItem value="5g-required">5G Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>


              <div className="flex items-center space-x-2">
                <Checkbox
                  id="smart-home"
                  checked={preferences.smartHomeCompatibility}
                  onCheckedChange={(checked) => updatePreference('smartHomeCompatibility', checked)}
                />
                <Label htmlFor="smart-home" className="text-sm">Smart Home Compatibility</Label>
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
                    <SelectItem value="professional">Career-Focused</SelectItem>
                    <SelectItem value="family">Family-Oriented</SelectItem>
                    <SelectItem value="creative">Creative & Artistic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Work Schedule</Label>
                <Select value={preferences.workSchedule} onValueChange={(value) => updatePreference('workSchedule', value)}>
                  <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-600/50">
                    <SelectValue placeholder="Select your work schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="traditional">Traditional 9-5</SelectItem>
                    <SelectItem value="flexible">Flexible Hours</SelectItem>
                    <SelectItem value="remote">Remote Work</SelectItem>
                    <SelectItem value="hybrid">Hybrid Work</SelectItem>
                    <SelectItem value="shift">Shift Work</SelectItem>
                    <SelectItem value="freelance">Freelance/Gig</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Your Priorities</Label>
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
                <Label className="text-sm font-medium">Primary Use Case</Label>
                <Select value={preferences.useCase} onValueChange={(value) => updatePreference('useCase', value)}>
                  <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-600/50">
                    <SelectValue placeholder="What's your main reason for renting?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first-time">First-time Renter</SelectItem>
                    <SelectItem value="relocating">Relocating for Work</SelectItem>
                    <SelectItem value="downsizing">Downsizing</SelectItem>
                    <SelectItem value="upgrading">Upgrading Current Living</SelectItem>
                    <SelectItem value="temporary">Temporary Housing</SelectItem>
                    <SelectItem value="investment">Investment/Secondary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Additional Notes</Label>
                <Textarea
                  placeholder="Any other preferences or requirements..."
                  value={preferences.additionalNotes}
                  onChange={(e) => updatePreference('additionalNotes', e.target.value)}
                  className="mt-1 bg-slate-800/50 border-slate-600/50"
                  rows={3}
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