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
      <CardContent className="p-0 relative">
        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg border border-slate-600/50 p-2 space-y-1">
            <Button
              size="sm"
              variant={showIsochrones ? "default" : "outline"}
              onClick={() => setShowIsochrones(!showIsochrones)}
              className="w-full justify-start text-xs h-8 bg-slate-800/80 hover:bg-slate-700/80 border-slate-600/50"
            >
              <Clock className="w-3 h-3 mr-2" />
              Isochrones
            </Button>
            <Button
              size="sm"
              variant={showLayers ? "default" : "outline"}
              onClick={() => setShowLayers(!showLayers)}
              className="w-full justify-start text-xs h-8 bg-slate-800/80 hover:bg-slate-700/80 border-slate-600/50"
            >
              <Layers className="w-3 h-3 mr-2" />
              Layers
            </Button>
            <Button
              size="sm"
              variant={showTransit ? "default" : "outline"}
              onClick={() => setShowTransit(!showTransit)}
              className="w-full justify-start text-xs h-8 bg-slate-800/80 hover:bg-slate-700/80 border-slate-600/50"
            >
              <Navigation className="w-3 h-3 mr-2" />
              Transit
            </Button>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative rounded-lg h-[600px] overflow-hidden">
          {/* Sophisticated Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-lg">
            {/* Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}
            />
            
            {/* Map Info Overlay */}
            <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm rounded-lg border border-slate-600/50 p-4 z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-sm font-medium text-foreground">Smart Scoring Active</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{pointsOfInterest.length} POIs tracked</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🏠</span>
                  <span>{smartResults.filter(r => r.isTopPick).length} top picks found</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🎯</span>
                  <span>Location + AI combined</span>
                </div>
              </div>
            </div>

            {/* Center Map Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <div className="text-slate-400 text-lg font-medium mb-2">Interactive Map</div>
                <div className="text-slate-500 text-sm">AI-Powered Location Intelligence</div>
              </div>
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
              <div className="relative group">
                {/* Isochrone zones */}
                {showIsochrones && (
                  <>
                    <div className="absolute w-32 h-32 rounded-full bg-green-400/10 border border-green-400/20 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 animate-pulse"></div>
                    <div className="absolute w-20 h-20 rounded-full bg-yellow-400/15 border border-yellow-400/30 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 animate-pulse"></div>
                    <div className="absolute w-12 h-12 rounded-full bg-red-400/20 border border-red-400/40 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 animate-pulse"></div>
                  </>
                )}
                
                {/* POI Marker */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/50 border-2 border-blue-400 flex items-center justify-center text-lg hover:scale-110 transition-all duration-200 ${
                  poi.priority === 'high' ? 'ring-2 ring-red-400/60 shadow-lg shadow-red-400/30' : 
                  poi.priority === 'medium' ? 'ring-2 ring-yellow-400/60 shadow-lg shadow-yellow-400/30' : 
                  'ring-2 ring-green-400/60 shadow-lg shadow-green-400/30'
                } group-hover:shadow-xl`}>
                  {getCategoryIcon(poi.category)}
                </div>

                {/* POI Tooltip */}
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-slate-900/95 backdrop-blur-sm rounded-lg p-2 border border-slate-600/50 text-xs text-foreground whitespace-nowrap">
                    <div className="font-medium">{poi.name}</div>
                    <div className="text-muted-foreground">{poi.priority} priority</div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Property Markers */}
          {smartResults.slice(0, 12).map((property, index) => (
            <div
              key={property.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-15"
              style={{
                left: `${15 + (index % 4) * 20 + (index % 2) * 10}%`,
                top: `${20 + Math.floor(index / 4) * 25 + (index % 3) * 8}%`
              }}
              onClick={() => setSelectedProperty(property.id === selectedProperty ? null : property.id)}
            >
              <div className={`relative w-10 h-10 rounded-full ${getScoreColor(property.combinedScore)} border-3 border-background hover:scale-125 transition-all duration-200 flex items-center justify-center shadow-lg cursor-pointer group`}>
                <span className="text-xs font-bold text-white">{property.combinedScore}</span>
                
                {/* Top Pick Badge */}
                {property.isTopPick && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                    <span className="text-xs">⭐</span>
                  </div>
                )}
              </div>
              
              {/* Property Tooltip */}
              {selectedProperty === property.id && (
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm rounded-lg p-4 w-64 border border-slate-600/50 shadow-xl z-30 animate-in slide-in-from-bottom-2 duration-200">
                  <div className="text-sm font-medium text-foreground mb-1">{property.name}</div>
                  <div className="text-xs text-muted-foreground mb-3">{property.address}</div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-green-400">${property.price.toLocaleString()}/mo</span>
                    <Badge variant="outline" className={property.isTopPick ? "border-green-500/50 text-green-400 bg-green-500/10" : "border-blue-500/50 text-blue-400"}>
                      {property.isTopPick ? "AI TOP PICK" : `${property.combinedScore}% Match`}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">AI Score:</span>
                      <span className="font-medium text-foreground">{property.aiMatchScore}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium text-foreground">{property.locationScore}%</span>
                    </div>
                  </div>

                  {/* POI Times */}
                  {property.poiTimes.length > 0 && (
                    <div className="pt-3 border-t border-slate-600/50">
                      <div className="text-xs text-muted-foreground mb-2">Commute Times:</div>
                      <div className="space-y-1">
                        {property.poiTimes.slice(0, 3).map((poiTime) => (
                          <div key={poiTime.poiId} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{poiTime.poiName}:</span>
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
      </CardContent>
    </Card>
  );
};

export default SmartMap;