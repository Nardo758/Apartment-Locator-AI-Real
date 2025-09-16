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
                className="h-9 px-4"
              >
                <Eye className="w-4 h-4 mr-2" />
                Map View
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? "default" : "ghost"}
                onClick={() => setViewMode('list')}
                className="h-9 px-4"
              >
                <List className="w-4 h-4 mr-2" />
                List View
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* POI Management Panel */}
      <POIManager
        pointsOfInterest={pointsOfInterest}
        onAddPOI={addPOI}
        onRemovePOI={removePOI}
        onUpdatePriority={updatePOIPriority}
        showModal={showPOIModal}
        setShowModal={setShowPOIModal}
      />

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
          {/* AI Insights Panel */}
          {hasAIPreferences && (
            <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="w-5 h-5 text-blue-400" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Budget Priority</div>
                  <div className="text-foreground font-medium">
                    Properties under ${userProfile?.budget?.toLocaleString() || '2,500'}/month prioritized
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Location Focus</div>
                  <div className="text-foreground font-medium">
                    {pointsOfInterest.length} POIs with commute optimization
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Lifestyle Match</div>
                  <div className="text-foreground font-medium">
                    {userProfile?.amenities?.length || 0} preferred amenities tracked
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scoring Legend */}
          <Card className="bg-slate-800/30 border border-slate-700/30">
            <CardHeader>
              <CardTitle className="text-lg">Combined AI Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-sm text-muted-foreground">90%+ (AI Top Picks)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-muted-foreground">80-89% (Good Match)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                <span className="text-sm text-muted-foreground">70-79% (Fair Match)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-sm text-muted-foreground">Below 70%</span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-600/30">
                <div className="text-xs text-muted-foreground">
                  Scores combine location (35%), budget (25%), lifestyle (20%), and amenities (20%)
                </div>
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