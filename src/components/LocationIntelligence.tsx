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
  const [searchSettings, setSearchSettings] = useState(null);
  
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
    <div id="location-intelligence" className="w-full space-y-6">
      {/* Compact Section Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30">
              <Target className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Location Intelligence</h2>
              <p className="text-sm text-muted-foreground">AI-powered apartment recommendations</p>
            </div>
          </div>
          
          {/* Compact AI Status */}
          <Badge 
            variant={hasAIPreferences ? "default" : "outline"}
            className={`text-xs ${hasAIPreferences ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}`}
          >
            <Brain className="w-3 h-3 mr-1" />
            {hasAIPreferences ? `AI Active (${preferencesCount})` : 'Setup AI'}
          </Badge>
        </div>
      </div>

      {/* Compact POI Management and Search Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Compact POI Management */}
        <div className="flex flex-col">
          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="w-4 h-4 text-blue-400" />
                Points of Interest
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ModernPOIManager
                pointsOfInterest={pointsOfInterest}
                onAddPOI={addPOI}
                onRemovePOI={removePOI}
                onUpdatePriority={updatePOIPriority}
                showModal={showPOIModal}
                setShowModal={setShowPOIModal}
              />
            </CardContent>
          </Card>
        </div>

        {/* Compact Search Settings */}
        <div className="flex flex-col">
          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="w-4 h-4 text-blue-400" />
                Search Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <EnhancedSearchSettings 
                onSettingsChange={setSearchSettings}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ultra Compact Live Market Intel */}
      <div className="w-full">
        <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              Live Market Intel
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-4 lg:grid-cols-7 gap-3 text-center">
              {/* Market Data */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Avg Rent</div>
                <div className="text-sm font-semibold text-foreground">$2,284</div>
                <div className="text-xs text-green-400">+2.3%</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Listings</div>
                <div className="text-sm font-semibold text-foreground">47</div>
                <div className="text-xs text-green-400">+8</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Days</div>
                <div className="text-sm font-semibold text-foreground">12</div>
                <div className="text-xs text-red-400">+2</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Competition</div>
                <div className="text-sm font-semibold text-foreground">High</div>
                <div className="text-xs text-orange-400">85%</div>
              </div>
              
              {/* Negotiation Intel */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Concessions</div>
                <div className="text-sm font-semibold text-foreground">73%</div>
                <div className="text-xs text-green-400">offers</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Urgency</div>
                <div className="text-sm font-semibold text-foreground">Moderate</div>
                <div className="text-xs text-yellow-400">15%</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Best Window</div>
                <div className="text-sm font-semibold text-foreground">2wks</div>
                <div className="text-xs text-blue-400">optimal</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compact View Mode Toggle */}
      <div className="flex justify-center mb-2 lg:hidden">
        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 flex">
          <Button
            variant={viewMode === 'map' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="rounded-md text-xs"
          >
            <MapPin className="w-3 h-3 mr-1" />
            Map
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-md text-xs"
          >
            <List className="w-3 h-3 mr-1" />
            List
          </Button>
        </div>
      </div>

      {/* Main Content Area - Map Priority */}
      <div className="grid grid-cols-1 xl:grid-cols-6 gap-3">
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