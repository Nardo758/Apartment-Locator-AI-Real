import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Eye, List, Brain, Target, Settings, Navigation, Clock, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ModernPOIManager from './LocationIntelligence/ModernPOIManager';
import SmartMap from './LocationIntelligence/SmartMap';
import SmartResults from './LocationIntelligence/SmartResults';
import EnhancedSearchSettings from './LocationIntelligence/EnhancedSearchSettings';
import { SearchSettings } from './LocationIntelligence/EnhancedSearchSettings';
import ApartmentResults from './LocationIntelligence/ApartmentResults';
import { useLocationIntelligence } from '@/hooks/useLocationIntelligence';
import CompactPropertyCard from '@/components/modern/CompactPropertyCard';

interface LocationIntelligenceProps {
  userProfile?: Record<string, unknown> | null;
}

const LocationIntelligence: React.FC<LocationIntelligenceProps> = ({ userProfile = null }) => {
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
    <div id="location-intelligence" className="w-full">
      {/* Main Container */}
      <div className="bg-background rounded-3xl p-6 md:p-8 shadow-xl border border-border">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-primary-foreground">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Apartment Search Settings</h2>
              <p className="text-sm text-muted-foreground">Configure your search criteria, budget, and important locations</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowPOIModal(true)}
            className="bg-primary hover:bg-primary/90 shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </div>

        {/* Location Search Section */}
        <div className="bg-muted/40 rounded-xl p-5 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Location Search</h3>
              <p className="text-xs text-muted-foreground">Search by city, neighborhood, or specific address</p>
            </div>
          </div>
          <div className="relative mb-3">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="30024" 
              defaultValue="30024"
              className="pl-10 border-2 focus:border-green-500"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="w-3 h-3" />
            <span>AI will find apartments optimized for your search area and POIs</span>
          </div>
        </div>

        {/* Search Settings Section */}
        <div className="bg-muted/30 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Search Settings</h3>
            </div>
            <Button variant="outline" size="sm">Reset</Button>
          </div>
          
          <EnhancedSearchSettings 
            onSettingsChange={setSearchSettings}
          />
        </div>

        {/* Points of Interest Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pointsOfInterest.map((poi) => (
            <Card key={poi.id} className={`border-t-4 ${
              poi.priority === 'high' ? 'border-t-blue-500' : 
              poi.priority === 'medium' ? 'border-t-orange-500' : 
              'border-t-gray-400'
            } hover:shadow-lg transition-all`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${
                    poi.category === 'work' ? 'bg-blue-500' : 
                    poi.category === 'gym' ? 'bg-green-500' : 
                    'bg-purple-500'
                  }`}>
                    {poi.category === 'work' ? '🏢' : poi.category === 'gym' ? '🏋️' : '📍'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-foreground mb-1">{poi.name}</h3>
                    <p className="text-xs text-muted-foreground mb-1">{poi.address.substring(0, 20)}...</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {poi.category === 'work' ? 'WORK & OFFICE' : poi.category === 'gym' ? 'FITNESS & GYM' : poi.category.toUpperCase()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={poi.priority === 'high' ? 'destructive' : 'secondary'} className={
                    poi.priority === 'high' ? 'bg-red-50 text-red-600 border-red-200' : 
                    'bg-orange-50 text-orange-600 border-orange-200'
                  }>
                    {poi.priority === 'high' ? 'High Priority' : poi.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Navigation className="w-4 h-4" />
                    <span>{poi.maxTime} min</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Navigation className="w-3 h-3" />
                  <span className="capitalize">{poi.transportMode}</span>
                </div>

                <Select 
                  value={poi.priority}
                  onValueChange={(value) => updatePOIPriority(poi.id, value as 'high' | 'medium' | 'low')}
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Change Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePOI(poi.id)}
                  className="w-full mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Live Market Intel - Compact Version */}
      <div className="w-full">
        <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              Live Market Intel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Market Data - Compact Grid */}
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Avg Rent</span>
                <div className="text-lg font-semibold text-foreground">$2,284</div>
                <div className="text-xs text-green-400">+2.3% vs last month</div>
              </div>
              
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">New Listings</span>
                <div className="text-lg font-semibold text-foreground">47</div>
                <div className="text-xs text-green-400">+8 this week</div>
              </div>
              
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Days on Market</span>
                <div className="text-lg font-semibold text-foreground">12</div>
                <div className="text-xs text-red-400">+2 vs last month</div>
              </div>
              
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Competition</span>
                <div className="text-lg font-semibold text-foreground">High</div>
                <div className="text-xs text-orange-400">85% occupancy</div>
              </div>
            </div>

            {/* Negotiation Intelligence - Compact Row */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-sm font-medium text-blue-400">Negotiation Intel</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Concessions</span>
                  <div className="text-lg font-semibold text-foreground">73%</div>
                  <div className="text-xs text-green-400">offering incentives</div>
                </div>
                
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Landlord Urgency</span>
                  <div className="text-lg font-semibold text-foreground">Moderate</div>
                  <div className="text-xs text-yellow-400">15% price drops</div>
                </div>
                
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Best Window</span>
                  <div className="text-lg font-semibold text-foreground">Next 2wks</div>
                  <div className="text-xs text-blue-400">optimal timing</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
      <div className="grid grid-cols-1 xl:grid-cols-6 gap-4 md:gap-6">
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
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-fit max-h-[600px] overflow-hidden">
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