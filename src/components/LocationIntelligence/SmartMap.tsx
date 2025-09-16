import React, { useState } from 'react';
import { MapPin, Layers, Clock, Navigation, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PointOfInterest, SmartProperty } from '@/hooks/useLocationIntelligence';

interface SmartMapProps {
  pointsOfInterest: PointOfInterest[];
  smartResults: SmartProperty[];
  userProfile: any;
}

const SmartMap: React.FC<SmartMapProps> = ({
  pointsOfInterest,
  smartResults,
  userProfile
}) => {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [showIsochrones, setShowIsochrones] = useState(true);
  const [showLayers, setShowLayers] = useState(true);
  const [showTransit, setShowTransit] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-yellow-500';
    if (score >= 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work': return '💼';
      case 'gym': return '🏋️';
      case 'school': return '🎓';
      case 'shopping': return '🛍️';
      default: return '📍';
    }
  };

  const selectedPropertyData = smartResults.find(p => p.id === selectedProperty);

  return (
    <Card className="bg-slate-800/30 border border-slate-700/30">
      <CardContent className="p-0">
        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <div className="bg-slate-800/90 rounded-lg border border-slate-600/50 p-2 space-y-2">
            <Button
              size="sm"
              variant={showIsochrones ? "default" : "outline"}
              onClick={() => setShowIsochrones(!showIsochrones)}
              className="w-full justify-start text-xs"
            >
              <Clock className="w-3 h-3 mr-1" />
              Isochrones
            </Button>
            <Button
              size="sm"
              variant={showLayers ? "default" : "outline"}
              onClick={() => setShowLayers(!showLayers)}
              className="w-full justify-start text-xs"
            >
              <Layers className="w-3 h-3 mr-1" />
              Layers
            </Button>
            <Button
              size="sm"
              variant={showTransit ? "default" : "outline"}
              onClick={() => setShowTransit(!showTransit)}
              className="w-full justify-start text-xs"
            >
              <Navigation className="w-3 h-3 mr-1" />
              Transit
            </Button>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg h-[400px] overflow-hidden">
          {/* Map Placeholder */}
          <div className="absolute inset-0 bg-slate-700/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <span className="text-slate-400 text-sm">Interactive Map with Smart Scoring</span>
            </div>
          </div>

          {/* POI Markers */}
          {pointsOfInterest.map((poi, index) => (
            <div
              key={poi.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
              style={{
                left: `${25 + index * 15}%`,
                top: `${30 + index * 10}%`
              }}
              title={`${poi.name} - ${poi.priority} priority`}
            >
              <div className="relative">
                {/* Isochrone zones */}
                {showIsochrones && (
                  <>
                    <div className="absolute w-24 h-24 rounded-full bg-green-400/10 border border-green-400/20 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"></div>
                    <div className="absolute w-16 h-16 rounded-full bg-yellow-400/10 border border-yellow-400/20 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"></div>
                    <div className="absolute w-8 h-8 rounded-full bg-red-400/10 border border-red-400/20 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"></div>
                  </>
                )}
                
                {/* POI Marker */}
                <div className={`w-8 h-8 rounded-lg bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center text-lg hover:scale-110 transition-transform ${
                  poi.priority === 'high' ? 'ring-2 ring-red-400/50' : 
                  poi.priority === 'medium' ? 'ring-2 ring-yellow-400/50' : 
                  'ring-2 ring-green-400/50'
                }`}>
                  {getCategoryIcon(poi.category)}
                </div>
              </div>
            </div>
          ))}

          {/* Property Markers */}
          {smartResults.slice(0, 8).map((property, index) => (
            <div
              key={property.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
              style={{
                left: `${15 + index * 12 + (index % 2) * 20}%`,
                top: `${20 + index * 8 + (index % 3) * 15}%`
              }}
              onClick={() => setSelectedProperty(property.id === selectedProperty ? null : property.id)}
            >
              <div className={`w-8 h-8 rounded-full ${getScoreColor(property.combinedScore)} border-2 border-background hover:scale-110 transition-transform flex items-center justify-center relative`}>
                <span className="text-xs font-bold text-white">{property.combinedScore}</span>
                
                {/* Top Pick Badge */}
                {property.isTopPick && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <span className="text-xs">⭐</span>
                  </div>
                )}
              </div>
              
              {/* Property Tooltip */}
              {selectedProperty === property.id && (
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-slate-800/95 rounded-lg p-3 w-56 border border-slate-600 shadow-xl z-30">
                  <div className="text-sm font-medium text-foreground mb-1">{property.name}</div>
                  <div className="text-xs text-muted-foreground mb-2">{property.address}</div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-green-400">${property.price.toLocaleString()}/mo</span>
                    <Badge variant="outline" className={property.isTopPick ? "border-green-500/50 text-green-400" : ""}>
                      {property.isTopPick ? "AI TOP PICK" : `${property.combinedScore}% Match`}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>AI Score:</span>
                      <span className="font-medium">{property.aiMatchScore}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Location:</span>
                      <span className="font-medium">{property.locationScore}%</span>
                    </div>
                  </div>

                  {/* POI Times */}
                  {property.poiTimes.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-600/50">
                      <div className="text-xs text-muted-foreground mb-1">Commute Times:</div>
                      <div className="space-y-1">
                        {property.poiTimes.slice(0, 3).map((poiTime) => (
                          <div key={poiTime.poiId} className="flex justify-between text-xs">
                            <span>{poiTime.poiName}:</span>
                            <span className={`font-medium ${
                              poiTime.color === 'green' ? 'text-green-400' :
                              poiTime.color === 'yellow' ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {poiTime.time}min
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-slate-800/90 rounded-lg border border-slate-600/50 p-3 z-10">
          <h4 className="text-xs font-medium text-foreground mb-2">Combined AI Score</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-muted-foreground">90%+ (Top Picks)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-muted-foreground">80-89% (Good)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-xs text-muted-foreground">70-79% (Fair)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-muted-foreground">Below 70%</span>
            </div>
          </div>
        </div>

        {/* Map Info Panel */}
        <div className="absolute top-4 left-4 bg-slate-800/90 rounded-lg border border-slate-600/50 p-3 z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-xs font-medium text-foreground">Smart Scoring Active</span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>📍 {pointsOfInterest.length} POIs tracked</div>
            <div>🏠 {smartResults.filter(r => r.isTopPick).length} top picks found</div>
            <div>🎯 Location + AI preferences combined</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartMap;