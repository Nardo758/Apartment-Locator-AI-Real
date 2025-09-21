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
  const [showSearchSettings, setShowSearchSettings] = useState(true);
  
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

  console.log('🎯 Location Intelligence loaded:', { userProfile, preferencesCount, hasAIPreferences, showSearchSettings });

  return (
    <div id="location-intelligence" className="w-full space-y-6">
      {/* Section Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
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
            {/* AI Status Indicator and Search Settings Toggle */}
            <div className="flex items-center gap-4">
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
              
              {/* Search Settings Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSearchSettings(!showSearchSettings)}
                className="flex items-center gap-2 lg:hidden"
              >
                <Settings className="w-4 h-4" />
                Search
              </Button>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Search Settings Panel - Top Right */}
      <div className="fixed top-20 right-4 z-50 w-80 lg:w-96 max-h-[calc(100vh-6rem)] overflow-hidden">
        <div className="bg-white dark:bg-slate-800 backdrop-blur-md border-2 border-orange-500 rounded-xl shadow-2xl">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-foreground">Search Settings</h3>
                </div>
                <button 
                  onClick={() => setShowSearchSettings(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Configure your search criteria</p>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              <EnhancedSearchSettings 
                onSettingsChange={setSearchSettings}
              />
            </div>
        </div>
      </div>

      {/* POI Management Panel - Full Width */}
      <div className={`w-full transition-all duration-300 ${showSearchSettings ? 'pr-0 lg:pr-[26rem]' : 'pr-0'}`}> {/* Dynamic right padding based on panel visibility */}
        <ModernPOIManager
          pointsOfInterest={pointsOfInterest}
          onAddPOI={addPOI}
          onRemovePOI={removePOI}
          onUpdatePriority={updatePOIPriority}
          showModal={showPOIModal}
          setShowModal={setShowPOIModal}
        />
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
      <div className={`grid grid-cols-1 xl:grid-cols-6 gap-4 md:gap-6 transition-all duration-300 ${showSearchSettings ? 'pr-0 lg:pr-[26rem]' : 'pr-0'}`}> {/* Dynamic right padding for floating panel */}
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

      {/* Live Market Intel - Prominent Bottom Card */}
      <div className={`w-full mt-8 transition-all duration-300 ${showSearchSettings ? 'pr-0 lg:pr-[26rem]' : 'pr-0'}`}> {/* Dynamic right padding and top margin */}
        <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
          {/* Orange Header Background */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-t-xl">
            <CardTitle className="flex items-center gap-2 text-white text-xl font-bold">
              <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
              Live Market Intel
            </CardTitle>
            <p className="text-orange-100 text-sm mt-1">Real-time market insights powered by AI</p>
          </div>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              {/* Market Data - Enhanced Grid */}
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground font-medium">Avg Rent</span>
                <div className="text-2xl font-bold text-foreground">$2,284</div>
                <div className="text-sm text-green-400 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  +2.3% vs last month
                </div>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground font-medium">New Listings</span>
                <div className="text-2xl font-bold text-foreground">47</div>
                <div className="text-sm text-green-400 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  +8 this week
                </div>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground font-medium">Days on Market</span>
                <div className="text-2xl font-bold text-foreground">12</div>
                <div className="text-sm text-red-400 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  +2 vs last month
                </div>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground font-medium">Competition</span>
                <div className="text-2xl font-bold text-foreground">High</div>
                <div className="text-sm text-orange-400 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  85% occupancy
                </div>
              </div>
            </div>

            {/* Negotiation Intelligence - Enhanced Section */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
                <span className="text-lg font-semibold text-blue-400">Negotiation Intelligence</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground font-medium">Concessions Available</span>
                  <div className="text-2xl font-bold text-foreground">73%</div>
                  <div className="text-sm text-green-400 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    offering incentives
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground font-medium">Landlord Urgency</span>
                  <div className="text-2xl font-bold text-foreground">Moderate</div>
                  <div className="text-sm text-yellow-400 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    15% price drops
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground font-medium">Best Negotiation Window</span>
                  <div className="text-2xl font-bold text-foreground">Next 2 weeks</div>
                  <div className="text-sm text-blue-400 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    optimal timing
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                  <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">AI Market Prediction</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  85% probability of 1-month free rent offers in luxury complexes within the next 7 days based on current market trends and inventory levels.
                </p>
              </div>
            </div>

            {/* Last Updated */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="text-xs text-muted-foreground text-center">
                <span className="inline-flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                  AI updated: 2 minutes ago
                </span>
                <span className="mx-2">•</span>
                <span className="inline-flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  Market data: 2 hours ago
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LocationIntelligence;