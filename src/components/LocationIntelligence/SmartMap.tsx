import React, { useState, useEffect } from 'react';
import { MapPin, Layers, Clock, Navigation, Brain, Target, Timer, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PointOfInterest, SmartProperty } from '@/hooks/useLocationIntelligence';
import POIManager from './POIManager';

interface UserProfileShape {
  has_completed_ai_programming?: boolean;
  amenities?: unknown[];
  priorities?: unknown[];
  budget?: unknown;
}

interface SmartMapProps {
  pointsOfInterest: PointOfInterest[];
  smartResults: SmartProperty[];
  userProfile: UserProfileShape | null;
  selectedPropertyId?: string | null;
  onPropertySelect?: (id: string) => void;
}

const isUserProfileArray = (val: unknown): val is unknown[] => Array.isArray(val);

const SmartMap: React.FC<SmartMapProps> = ({
  pointsOfInterest,
  smartResults,
  userProfile,
  selectedPropertyId,
  onPropertySelect
}) => {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(selectedPropertyId);
  const [selectedPOI, setSelectedPOI] = useState<string | null>(null);
  const [showIsochrones, setShowIsochrones] = useState(true);
  const [showLayers, setShowLayers] = useState(true);
  const [showTransit, setShowTransit] = useState(false);
  const [showPOIModal, setShowPOIModal] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 30.2672, lng: -97.7431 });
  const [mapZoom, setMapZoom] = useState(12);

  // Sync with parent selection
  useEffect(() => {
    setSelectedProperty(selectedPropertyId);
  }, [selectedPropertyId]);

  // Check if AI preferences are active
  const hasAIPreferences = Boolean(
    (userProfile && (userProfile.has_completed_ai_programming === true)) ||
    (userProfile && isUserProfileArray(userProfile.amenities) && userProfile.amenities.length > 0) ||
    (userProfile && isUserProfileArray(userProfile.priorities) && userProfile.priorities.length > 0) ||
    (userProfile && !!userProfile.budget)
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500 border-green-400 text-white shadow-green-500/30';
    if (score >= 80) return 'bg-yellow-500 border-yellow-400 text-white shadow-yellow-500/30';
    if (score >= 70) return 'bg-orange-500 border-orange-400 text-white shadow-orange-500/30';
    return 'bg-red-500 border-red-400 text-white shadow-red-500/30';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Top Pick';
    if (score >= 80) return 'Good Match';
    if (score >= 70) return 'Fair Match';
    return 'Poor Match';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work': return { icon: '💼', color: 'bg-blue-500/30 border-blue-400' };
      case 'gym': return { icon: '🏋️', color: 'bg-green-500/30 border-green-400' };
      case 'school': return { icon: '🎓', color: 'bg-orange-500/30 border-orange-400' };
      case 'shopping': return { icon: '🛍️', color: 'bg-red-500/30 border-red-400' };
      default: return { icon: '📍', color: 'bg-purple-500/30 border-purple-400' };
    }
  };

  const getPriorityRing = (priority: string) => {
    switch (priority) {
      case 'high': return 'ring-4 ring-red-400/60 shadow-xl shadow-red-400/40';
      case 'medium': return 'ring-3 ring-yellow-400/60 shadow-lg shadow-yellow-400/30';
      case 'low': return 'ring-2 ring-green-400/60 shadow-md shadow-green-400/20';
      default: return '';
    }
  };

  const selectedPropertyData = smartResults.find(p => p.id === selectedProperty);
  const selectedPOIData = pointsOfInterest.find(p => p.id === selectedPOI);

  // Generate realistic marker positions
  const getMarkerPosition = (index: number, total: number, type: 'poi' | 'property') => {
    if (type === 'poi') {
      const angle = (index / Math.max(total - 1, 1)) * Math.PI * 2;
      const radius = 0.15 + (index % 3) * 0.05;
      return {
        left: `${50 + Math.cos(angle) * radius * 100}%`,
        top: `${50 + Math.sin(angle) * radius * 100}%`
      };
    } else {
      // Distribute properties in a more organic pattern
      const gridSize = Math.ceil(Math.sqrt(total));
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      const scatter = (index % 5) * 2 - 4; // Random scatter
      
      return {
        left: `${20 + (col / (gridSize - 1)) * 60 + scatter}%`,
        top: `${25 + (row / (gridSize - 1)) * 50 + scatter}%`
      };
    }
  };

  const handlePOIAdd = (poi: Omit<PointOfInterest, 'id'>) => {
    // This would normally be handled by the parent component
    console.log('Adding POI:', poi);
  };

  const handlePOIRemove = (id: string) => {
    console.log('Removing POI:', id);
  };

  const handlePOIUpdatePriority = (id: string, priority: 'high' | 'medium' | 'low') => {
    console.log('Updating POI priority:', id, priority);
  };

  return (
    <div className="space-y-6">
      {/* Interactive Map */}
      <Card className="bg-slate-800/30 border border-slate-700/30 overflow-hidden">
        <CardContent className="p-0 relative">
          {/* Map Controls - Top Right */}
          <div className="absolute top-6 right-6 z-30 space-y-3">
            {/* AI Status Indicator */}
            <div className="bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-600/50 p-3">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${hasAIPreferences ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  {hasAIPreferences ? 'AI Preferences Active' : 'Setup AI Preferences'}
                </span>
              </div>
            </div>

            {/* Map Control Buttons */}
            <div className="bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-600/50 p-2 space-y-2">
              <Button
                size="sm"
                variant={showIsochrones ? "default" : "outline"}
                onClick={() => setShowIsochrones(!showIsochrones)}
                className={`w-full justify-start text-xs h-9 transition-all duration-200 ${
                  showIsochrones 
                    ? 'bg-purple-600/80 hover:bg-purple-700/80 text-white border-purple-500/50' 
                    : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-600/50'
                }`}
              >
                <Timer className="w-3.5 h-3.5 mr-2" />
                Isochrones
              </Button>
              <Button
                size="sm"
                variant={showLayers ? "default" : "outline"}
                onClick={() => setShowLayers(!showLayers)}
                className={`w-full justify-start text-xs h-9 transition-all duration-200 ${
                  showLayers 
                    ? 'bg-blue-600/80 hover:bg-blue-700/80 text-white border-blue-500/50' 
                    : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-600/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5 mr-2" />
                Layers
              </Button>
              <Button
                size="sm"
                variant={showTransit ? "default" : "outline"}
                onClick={() => setShowTransit(!showTransit)}
                className={`w-full justify-start text-xs h-9 transition-all duration-200 ${
                  showTransit 
                    ? 'bg-green-600/80 hover:bg-green-700/80 text-white border-green-500/50' 
                    : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-600/50'
                }`}
              >
                <Navigation className="w-3.5 h-3.5 mr-2" />
                Transit
              </Button>
            </div>
          </div>

          {/* Mobile zoom controls */}
          <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-2 lg:hidden">
            <Button
              size="sm"
              variant="outline"
              className="w-10 h-10 p-0 bg-slate-900/95 backdrop-blur-sm border-slate-600/50"
              onClick={() => setMapZoom(prev => Math.min(prev + 2, 18))}
            >
              <span className="text-lg font-bold">+</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-10 h-10 p-0 bg-slate-900/95 backdrop-blur-sm border-slate-600/50"
              onClick={() => setMapZoom(prev => Math.max(prev - 2, 8))}
            >
              <span className="text-lg font-bold">−</span>
            </Button>
          </div>

          {/* Map Container with overflow visible for popups */}
          <div className="relative h-[400px] md:h-[500px] lg:h-[600px] rounded-lg touch-pan-y overflow-visible">
            {/* Enhanced Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
              {/* Sophisticated Grid Pattern */}
              <div className="absolute inset-0 opacity-8 map-grid-pattern" />
              
              {/* Map Info Overlay - Left Side */}
              <div className="absolute top-6 left-6 bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-600/50 p-4 z-20 max-w-xs">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold text-foreground">Interactive Map with Smart Scoring</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Target className="w-3 h-3 text-blue-400" />
                    <span>{pointsOfInterest.length} POIs tracked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">🏠</span>
                    <span>{smartResults.filter(r => r.isTopPick).length} AI top picks found</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">🎯</span>
                    <span>Real-time preference scoring</span>
                  </div>
                </div>
              </div>

              {/* Combined AI Score Legend - Bottom Left */}
              <div className="absolute bottom-6 left-6 bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-600/50 p-4 z-20">
                <div className="text-sm font-semibold text-foreground mb-3">Combined AI Score</div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg"></div>
                    <span className="text-muted-foreground">90%+ (Top Picks)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-lg"></div>
                    <span className="text-muted-foreground">80-89% (Good)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-orange-500 shadow-lg"></div>
                    <span className="text-muted-foreground">70-79% (Fair)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg"></div>
                    <span className="text-muted-foreground">Below 70%</span>
                  </div>
                </div>
              </div>

              {/* Center Message for Empty State */}
              {pointsOfInterest.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-6">
                      <MapPin className="w-10 h-10 text-slate-400" />
                    </div>
                    <div className="text-slate-300 text-xl font-semibold mb-3">Start Your Smart Search</div>
                    <div className="text-slate-400 text-sm mb-6">Add your points of interest to see AI-powered apartment recommendations with real-time scoring</div>
                    <Button 
                      onClick={() => setShowPOIModal(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First POI
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* POI Markers */}
            {pointsOfInterest.map((poi, index) => {
              const position = getMarkerPosition(index, pointsOfInterest.length, 'poi');
              const categoryStyle = getCategoryIcon(poi.category);
              const priorityRing = getPriorityRing(poi.priority);
              const isSelected = selectedPOI === poi.id;

              return (
                <div
                  key={poi.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-25"
                  /* eslint-disable-next-line */
                  style={position}
                  onClick={() => setSelectedPOI(isSelected ? null : poi.id)}
                >
                  <div className="relative group">
                    {/* Isochrone zones */}
                    {showIsochrones && (
                      <>
                        <div className="absolute w-40 h-40 rounded-full bg-green-400/5 border border-green-400/10 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 animate-pulse"></div>
                        <div className="absolute w-28 h-28 rounded-full bg-yellow-400/8 border border-yellow-400/15 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 animate-pulse"></div>
                        <div className="absolute w-16 h-16 rounded-full bg-red-400/10 border border-red-400/20 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 animate-pulse"></div>
                      </>
                    )}
                    
                    {/* POI Marker */}
                    <div className={`w-14 h-14 rounded-2xl ${categoryStyle.color} border-3 flex items-center justify-center text-2xl hover:scale-110 transition-all duration-300 ${priorityRing} ${isSelected ? 'scale-125 z-30' : ''} cursor-pointer shadow-xl`}>
                      {categoryStyle.icon}
                    </div>

                    {/* Distance/Time Badge */}
                    <div className="absolute -top-2 -right-2 bg-slate-900/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-semibold text-foreground border border-slate-600/50 whitespace-nowrap">
                      {poi.maxTime}min
                    </div>

                    {/* POI Tooltip */}
                    <div className={`absolute bottom-16 left-1/2 transform -translate-x-1/2 transition-all duration-200 pointer-events-none ${isSelected || selectedPOI === poi.id ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'}`}>
                      <div className="bg-slate-900/95 backdrop-blur-sm rounded-lg p-3 border border-slate-600/50 text-xs text-foreground whitespace-nowrap shadow-xl">
                        <div className="font-semibold text-sm">{poi.name}</div>
                        <div className="text-muted-foreground">{poi.address}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={`text-xs ${
                            poi.priority === 'high' ? 'border-red-500/50 text-red-400' :
                            poi.priority === 'medium' ? 'border-yellow-500/50 text-yellow-400' :
                            'border-green-500/50 text-green-400'
                          }`}>
                            {poi.priority.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Property Markers */}
            {smartResults.slice(0, 15).map((property, index) => {
              const position = getMarkerPosition(index, Math.min(smartResults.length, 15), 'property');
              const scoreColorClass = getScoreColor(property.combinedScore);
              const isSelected = selectedProperty === property.id;

              return (
                <div
                  key={property.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 touch-manipulation"
                  /* eslint-disable-next-line react/forbid-dom-props */
                  style={position}
                  onClick={() => {
                    const newSelected = isSelected ? null : property.id;
                    setSelectedProperty(newSelected);
                    onPropertySelect?.(newSelected || '');
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    const newSelected = isSelected ? null : property.id;
                    setSelectedProperty(newSelected);
                    onPropertySelect?.(newSelected || '');
                  }}
                >
                  <div className={`relative w-12 h-12 rounded-full ${scoreColorClass} border-3 hover:scale-125 transition-all duration-300 flex items-center justify-center shadow-xl cursor-pointer group ${isSelected ? 'scale-130 z-30' : ''}`}>
                    <span className="text-sm font-bold">{property.combinedScore}</span>
                    
                    {/* Top Pick Star */}
                    {property.isTopPick && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg animate-pulse">
                        <span className="text-xs">⭐</span>
                      </div>
                    )}

                    {/* Connecting lines to nearby POIs */}
                    {pointsOfInterest.slice(0, 2).map((poi, poiIndex) => (
                      <div key={poi.id} className="absolute top-1/2 left-1/2 w-px bg-slate-500/30 origin-left transform -translate-y-1/2 opacity-50 group-hover:opacity-80 transition-opacity" 
                           /* eslint-disable-next-line */
                           style={{ 
                             width: `${20 + poiIndex * 10}px`, 
                             transform: `translate(-50%, -50%) rotate(${45 + poiIndex * 30}deg)` 
                           }} />
                    ))}
                  </div>
                  
                  {/* Property Popup - Smart positioning */}
                  {isSelected && (
                    <div className="fixed bg-slate-900/98 backdrop-blur-sm rounded-xl p-5 border border-slate-600/50 shadow-2xl z-50 animate-in slide-in-from-bottom-4 duration-300"
                         /* eslint-disable-next-line react/forbid-dom-props */
                         style={{
                           top: '50%',
                           left: '50%',
                           transform: 'translate(-50%, -50%)',
                           width: '320px',
                           maxHeight: '80vh',
                           overflowY: 'auto'
                         }}>
                      {/* Close button */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="text-base font-semibold text-foreground mb-1">{property.name}</div>
                          <div className="text-xs text-muted-foreground mb-2">{property.address}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProperty(null);
                          }}
                          className="w-6 h-6 p-0 hover:bg-slate-700/50"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-lg font-bold text-green-400">${property.price.toLocaleString()}/mo</div>
                          <div className="text-xs text-muted-foreground">Base Rent</div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={property.isTopPick ? 
                            "border-green-500/50 text-green-400 bg-green-500/10 text-sm font-semibold" : 
                            "border-blue-500/50 text-blue-400 text-sm"
                          }>
                            {property.isTopPick ? "AI TOP PICK" : `${property.combinedScore}% Match`}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-foreground">{property.aiMatchScore}%</div>
                          <div className="text-xs text-muted-foreground">AI Score</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-foreground">{property.locationScore}%</div>
                          <div className="text-xs text-muted-foreground">Location</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-blue-400">{property.bedrooms}bd/{property.bathrooms}ba</div>
                          <div className="text-xs text-muted-foreground">{property.sqft} sqft</div>
                        </div>
                      </div>

                      {/* POI Distance Times */}
                      {property.poiTimes.length > 0 && (
                        <div className="pt-4 border-t border-slate-600/50">
                          <div className="text-xs text-muted-foreground mb-2 font-medium">Commute Times:</div>
                          <div className="grid grid-cols-2 gap-2">
                            {property.poiTimes.slice(0, 4).map((poiTime) => (
                              <div key={poiTime.poiId} className="flex justify-between text-xs bg-slate-800/50 rounded-lg p-2">
                                <span className="text-muted-foreground truncate flex-1">{poiTime.poiName}:</span>
                                <Badge variant="outline" className={`ml-2 text-xs ${
                                  poiTime.color === 'green' ? 'border-green-500/50 text-green-400' :
                                  poiTime.color === 'yellow' ? 'border-yellow-500/50 text-yellow-400' : 
                                  'border-red-500/50 text-red-400'
                                }`}>
                                  {poiTime.time}min
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Save Property
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartMap;