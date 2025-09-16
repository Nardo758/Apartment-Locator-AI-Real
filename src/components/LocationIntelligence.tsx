import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Eye, List, Brain, Target, Settings, Navigation, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import POIManager from './LocationIntelligence/POIManager';
import SmartMap from './LocationIntelligence/SmartMap';
import SmartResults from './LocationIntelligence/SmartResults';
import { useLocationIntelligence } from '@/hooks/useLocationIntelligence';

interface LocationIntelligenceProps {
  userProfile: any;
}

const LocationIntelligence: React.FC<LocationIntelligenceProps> = ({ userProfile }) => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [showPOIModal, setShowPOIModal] = useState(false);
  
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

            {/* View Toggle */}
            <div className="flex rounded-lg bg-slate-800/50 border border-slate-700/50 p-1">
              <Button
                size="sm"
                variant={viewMode === 'map' ? "default" : "ghost"}
                onClick={() => setViewMode('map')}
                className={`h-9 px-4 ${viewMode === 'map' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-slate-700/50'}`}
              >
                <Eye className="w-4 h-4 mr-2" />
                Map View
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? "default" : "ghost"}
                onClick={() => setViewMode('list')}
                className={`h-9 px-4 ${viewMode === 'list' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-slate-700/50'}`}
              >
                <List className="w-4 h-4 mr-2" />
                List View
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* POI Management and Search Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* POI Management Panel - 2/3 width */}
        <div className="lg:col-span-2">
          <POIManager
            pointsOfInterest={pointsOfInterest}
            onAddPOI={addPOI}
            onRemovePOI={removePOI}
            onUpdatePriority={updatePOIPriority}
            showModal={showPOIModal}
            setShowModal={setShowPOIModal}
          />
        </div>

        {/* Search Settings - 1/3 width */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-800/30 border border-slate-700/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                Search Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Budget Range</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    defaultValue="2000" 
                    className="w-20 px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-foreground"
                  />
                  <span className="text-xs text-muted-foreground self-center">-</span>
                  <input 
                    type="number" 
                    defaultValue="2500" 
                    className="w-20 px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-foreground"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Search Radius</label>
                <select className="w-full px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-foreground">
                  <option value="10">10 miles</option>
                  <option value="15">15 miles</option>
                  <option value="25" selected>25 miles</option>
                  <option value="50">50 miles</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Max Drive Time</label>
                <select className="w-full px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-foreground">
                  <option value="15">15 minutes</option>
                  <option value="20">20 minutes</option>
                  <option value="30" selected>30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Bedrooms</label>
                <select className="w-full px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-foreground">
                  <option value="studio">Studio</option>
                  <option value="1" selected>1 bedroom</option>
                  <option value="2">2 bedrooms</option>
                  <option value="3">3 bedrooms</option>
                  <option value="4+">4+ bedrooms</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Map or List View */}
        <div className="xl:col-span-3">
          {viewMode === 'map' ? (
            <SmartMap
              pointsOfInterest={pointsOfInterest}
              smartResults={smartResults}
              userProfile={userProfile}
            />
          ) : (
            <SmartResults
              smartResults={smartResults}
              pointsOfInterest={pointsOfInterest}
              userProfile={userProfile}
              getCombinedScore={getCombinedScore}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-6">

          {/* Live Market Intel */}
          <Card className="bg-slate-800/30 border border-slate-700/30">
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

          {/* Smart Insights */}
          <Card className="bg-slate-800/30 border border-slate-700/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                Smart Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <div className="text-sm font-medium text-foreground mb-1">Best Time to Apply</div>
                <div className="text-xs text-muted-foreground">Weekday mornings have 23% higher response rates</div>
              </div>
              
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <div className="text-sm font-medium text-foreground mb-1">Negotiation Potential</div>
                <div className="text-xs text-muted-foreground">Medium - 47% of similar properties negotiated</div>
              </div>
              
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <div className="text-sm font-medium text-foreground mb-1">Market Trend</div>
                <div className="text-xs text-muted-foreground">Prices rising 2.3% monthly - act quickly</div>
              </div>
            </CardContent>
          </Card>

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
                    onClick={() => window.location.href = '/program-ai'}
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
      </div>
    </div>
  );
};

export default LocationIntelligence;