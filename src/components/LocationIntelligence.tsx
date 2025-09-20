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
    <div id="location-intelligence" className="h-full">
      {/* Section Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

      {/* Main Layout with Sidebar */}
      <div className="flex h-[calc(100vh-250px)]">
        {/* Main Content Area */}
        <div className="flex-1 pr-6 space-y-6 overflow-y-auto">
          {/* POI Management */}
          <ModernPOIManager
            pointsOfInterest={pointsOfInterest}
            onAddPOI={addPOI}
            onRemovePOI={removePOI}
            onUpdatePriority={updatePOIPriority}
            showModal={showPOIModal}
            setShowModal={setShowPOIModal}
          />

          {/* Live Market Intel Card */}
          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                Live Market Intel
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">$2,284</div>
                <div className="text-sm text-muted-foreground">Avg Rent</div>
                <div className="text-xs text-green-400">+2.3%</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">47</div>
                <div className="text-sm text-muted-foreground">New Listings</div>
                <div className="text-xs text-green-400">+8 this week</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">12</div>
                <div className="text-sm text-muted-foreground">Days on Market</div>
                <div className="text-xs text-red-400">+2 vs last month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">73%</div>
                <div className="text-sm text-muted-foreground">Concessions</div>
                <div className="text-xs text-green-400">offering incentives</div>
              </div>
            </CardContent>
          </Card>

          {/* Content Based on View Mode */}
          {viewMode === 'map' ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden h-[500px]">
              <SmartMap
                pointsOfInterest={pointsOfInterest}
                smartResults={smartResults}
                userProfile={userProfile}
                selectedPropertyId={selectedPropertyId}
                onPropertySelect={setSelectedPropertyId}
              />
            </div>
          ) : (
            <SmartResults
              smartResults={smartResults}
              pointsOfInterest={pointsOfInterest}
              userProfile={userProfile}
              getCombinedScore={getCombinedScore}
              onPropertySelect={setSelectedPropertyId}
              selectedPropertyId={selectedPropertyId}
            />
          )}
        </div>

        {/* Search Settings Sidebar */}
        <div className="w-80 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* View Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <List className="w-4 h-4 mr-2 inline" />
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 ${
                  viewMode === 'map' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MapPin className="w-4 h-4 mr-2 inline" />
                Map
              </button>
            </div>

            {/* Search Settings */}
            <EnhancedSearchSettings onSettingsChange={(settings) => setSearchSettings(settings)} />

            {/* Property Cards for Map View */}
            {viewMode === 'map' && smartResults.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Top Properties</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {smartResults.slice(0, 4).map((property) => (
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
              </div>
            )}

            {/* AI Setup CTA */}
            {!hasAIPreferences && (
              <Card className="border border-yellow-500/30 bg-yellow-500/5 mt-6">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto rounded-lg bg-yellow-500/20 flex items-center justify-center mb-3">
                      <Zap className="w-5 h-5 text-yellow-400" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Unlock AI Recommendations</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get personalized scores by setting up your AI preferences
                    </p>
                    <Button 
                      onClick={() => navigate('/program-ai')}
                      className="bg-yellow-600 hover:bg-yellow-700 w-full"
                      size="sm"
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Setup AI
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationIntelligence;