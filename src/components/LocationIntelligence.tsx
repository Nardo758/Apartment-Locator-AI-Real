import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Eye, List, Brain, Target, Settings, Navigation, Clock, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import POIManager from './LocationIntelligence/POIManager';
import SmartMap from './LocationIntelligence/SmartMap';
import SmartResults from './LocationIntelligence/SmartResults';
import EnhancedSearchSettings, { SearchSettings } from './LocationIntelligence/EnhancedSearchSettings';
import ApartmentResults from './LocationIntelligence/ApartmentResults';
import { useLocationIntelligence } from '@/hooks/useLocationIntelligence';
import CompactPropertyCard from '@/components/modern/CompactPropertyCard';

interface LocationIntelligenceProps {
  userProfile: any;
}

const LocationIntelligence: React.FC<LocationIntelligenceProps> = ({ userProfile }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [showPOIModal, setShowPOIModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [searchSettings, setSearchSettings] = useState<SearchSettings | null>(null);
  
  const {
    pointsOfInterest,
    smartResults,
    addPOI,
    removePOI,
    updatePOIPriority,
    getAIPreferencesCount,
    getCombinedScore,
    loading
  } = useLocationIntelligence(userProfile);

  const preferencesCount = getAIPreferencesCount();
  const hasAIPreferences = preferencesCount > 0;

  console.log('🎯 Location Intelligence loaded:', { userProfile, preferencesCount, hasAIPreferences });

  return (
    <div id="location-intelligence" className="space-y-8">
      {/* Section Header */}
      <div className="glass-dark rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Location Intelligence</h2>
              <p className="text-muted-foreground text-lg">AI-powered apartment recommendations based on your lifestyle and location preferences</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* AI Status Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className={`w-2 h-2 rounded-full ${hasAIPreferences ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <Badge 
                variant={hasAIPreferences ? "default" : "outline"}
                className={hasAIPreferences ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}
              >
                <Brain className="w-3 h-3 mr-1" />
                {hasAIPreferences ? `AI Preferences Active (${preferencesCount})` : 'Setup AI Preferences'}
              </Badge>
            </div>

          </div>
        </div>
      </div>

      {/* Combined Location & Search Settings Panel */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6 items-stretch">
        {/* Combined Location & Search Settings */}
        <div className="w-full lg:w-[60%] flex flex-col h-full">
          <Card className="bg-slate-800/30 border border-slate-700/30 h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                Location & Search Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-6">
              {/* Preferred Location Search */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Preferred Location</h4>
                  <Button variant="outline" size="sm">
                    <Target className="w-3 h-3 mr-1" />
                    Reset
                  </Button>
                </div>
                <div className="relative">
                  <Input 
                    placeholder="City, State (e.g., Austin, TX)"
                    className="bg-slate-800/50 border-slate-600/50 pr-10"
                    defaultValue={userProfile?.location || "Austin, TX"}
                  />
                  <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Use this OR add points of interest below
                </p>
              </div>

              {/* Points of Interest */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    Your Points of Interest
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPOIModal(true)}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add POI
                  </Button>
                </div>

                {/* POI List */}
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {pointsOfInterest.length === 0 ? (
                    <div className="text-center py-6">
                      <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No points of interest added</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowPOIModal(true)}
                        className="mt-2 text-xs"
                      >
                        Add your first POI
                      </Button>
                    </div>
                  ) : (
                    pointsOfInterest.map((poi) => (
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
                    ))
                  )}
                </div>
              </div>

              {/* Search Settings */}
              <div className="space-y-4 pt-4 border-t border-slate-600/30">
                <h4 className="text-sm font-medium">Search Settings</h4>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Budget Range</span>
                    <span className="text-sm text-blue-400">${userProfile?.budget || 2500}/month</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full">
                    <div 
                      className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: `${((userProfile?.budget || 2500) / 5000) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$500</span>
                    <span>$5,000</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Max Drive Time</span>
                    <span className="text-sm text-blue-400">{userProfile?.max_drive_time || 30} minutes</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full">
                    <div 
                      className="h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                      style={{ width: `${((userProfile?.max_drive_time || 30) / 60) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium mb-2 block">Bedrooms</span>
                  <div className="grid grid-cols-4 gap-2">
                    {['Studio', '1 BR', '2 BR', '3+ BR'].map((bedroom, index) => (
                      <Button
                        key={bedroom}
                        size="sm"
                        variant={userProfile?.bedrooms === (index === 0 ? 'studio' : index.toString()) ? "default" : "outline"}
                        className="text-xs"
                      >
                        {bedroom}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Market Intel - Responsive width */}
        <div className="w-full lg:w-[20%] flex flex-col h-full">
          <Card className="bg-slate-800/30 border border-slate-700/30 w-full h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                Live Market Intel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Rent</span>
                <div className="text-right">
                  <div className="text-xl font-semibold text-foreground">$2,284</div>
                  <div className="text-xs text-green-400">+2.3% vs last month</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New Listings</span>
                <div className="text-right">
                  <div className="text-xl font-semibold text-foreground">47</div>
                  <div className="text-xs text-green-400">+8 this week</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Days on Market</span>
                <div className="text-right">
                  <div className="text-xl font-semibold text-foreground">12</div>
                  <div className="text-xs text-red-400">+2 vs last month</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Competition</span>
                <div className="text-right">
                  <div className="text-xl font-semibold text-foreground">High</div>
                  <div className="text-xs text-orange-400">85% occupancy</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Mode Toggle for Mobile */}
      <div className="flex justify-center mb-4 lg:hidden">
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-1 flex">
          <Button
            variant={viewMode === 'map' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="rounded-md"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Map
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-md"
          >
            <List className="w-4 h-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-6 gap-6 mb-8">
        {/* Dynamic View Content */}
        <div className={`transition-all duration-300 ${viewMode === 'map' ? 'xl:col-span-4' : 'xl:col-span-6'}`}>
          {viewMode === 'map' ? (
            <SmartMap
              pointsOfInterest={pointsOfInterest}
              smartResults={smartResults}
              userProfile={userProfile}
              selectedPropertyId={selectedPropertyId}
              onPropertySelect={setSelectedPropertyId}
            />
          ) : (
            <div className="space-y-6 animate-fade-in">
              <SmartResults
                smartResults={smartResults}
                pointsOfInterest={pointsOfInterest}
                userProfile={userProfile}
                getCombinedScore={getCombinedScore}
                onPropertySelect={setSelectedPropertyId}
                selectedPropertyId={selectedPropertyId}
              />
            </div>
          )}
        </div>

        {/* Map View Sidebar */}
        {viewMode === 'map' && (
          <div className="xl:col-span-2 space-y-6 animate-slide-in-right">
            <Card className="bg-slate-800/30 border border-slate-700/30 max-h-[600px] overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  Property Cards
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {smartResults.length} properties • Click to highlight on map
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-y-auto max-h-[500px] space-y-3 px-6 pb-6">
                  {smartResults.slice(0, 6).map((property) => (
                    <CompactPropertyCard
                      key={property.id}
                      property={{
                        id: property.id,
                        name: property.name,
                        address: property.address,
                        price: property.price,
                        aiMatchScore: property.aiMatchScore,
                        bedrooms: property.bedrooms,
                        bathrooms: property.bathrooms,
                        sqft: property.sqft,
                        isTopPick: property.isTopPick,
                        combinedScore: property.combinedScore,
                        savings: property.savings,
                        poiTimes: property.poiTimes
                      }}
                      isSelected={selectedPropertyId === property.id}
                      onClick={() => setSelectedPropertyId(property.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* List View Sidebar */}
        {viewMode === 'list' && (
        <div className="xl:col-span-1 space-y-6">

          {/* No AI Preferences Call-to-Action */}
          {!hasAIPreferences && (
            <Card className="border border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Unlock AI-Powered Recommendations</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete your AI preferences to get personalized apartment scores combining location and lifestyle factors.
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate('/program-ai')}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Setup AI
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default LocationIntelligence;