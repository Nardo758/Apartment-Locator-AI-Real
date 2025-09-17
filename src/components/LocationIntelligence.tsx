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

      {/* POI Management, Search Settings, and Live Market Intel */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6 items-stretch">
        {/* POI Management Panel - Responsive width */}
        <div className="w-full lg:w-[45%] flex flex-col h-full">
          <div className="w-full flex flex-col h-full">
            <POIManager
              pointsOfInterest={pointsOfInterest}
              onAddPOI={addPOI}
              onRemovePOI={removePOI}
              onUpdatePriority={updatePOIPriority}
              showModal={showPOIModal}
              setShowModal={setShowPOIModal}
            />
          </div>
        </div>

        {/* Enhanced Search Settings - Responsive width */}
        <div className="w-full lg:w-[35%] flex flex-col h-full">
          <EnhancedSearchSettings
            onSettingsChange={setSearchSettings}
          />
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