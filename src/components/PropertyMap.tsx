import React, { useState } from 'react';
import { MapPin, Filter } from 'lucide-react';
import { mapPoints } from '../data/mockData';

const PropertyMap: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-yellow-500';
    if (score >= 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="glass-dark rounded-xl p-6 h-[600px] relative">
      {/* Map Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Property Map</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-background/10 hover:bg-background/20 transition-colors"
        >
          <Filter size={16} />
          <span className="text-sm">Filters</span>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="absolute top-16 right-6 z-10 glass-dark rounded-lg p-4 w-64 animate-slide-up">
          <h4 className="text-sm font-medium text-foreground mb-3">Map Filters</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Properties</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Points of Interest</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Commute Routes</span>
            </label>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg h-full overflow-hidden">
        {/* Austin Map Background */}
        <div className="absolute inset-0 bg-muted/20 rounded-lg flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Interactive Map Loading...</span>
        </div>

        {/* Points of Interest */}
        {mapPoints.pointsOfInterest.map((poi) => (
          <div
            key={poi.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{
              left: `${((poi.lng + 97.8) * 100)}%`,
              top: `${(100 - (poi.lat - 30.2) * 1000)}%`
            }}title={poi.name}
          >
            <div className="text-2xl hover:scale-110 transition-transform">
              {poi.emoji}
            </div>
          </div>
        ))}

        {/* Property Markers */}
        {mapPoints.properties.map((property) => (
          <div
            key={property.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{
              left: `${((property.lng + 97.8) * 100)}%`,
              top: `${(100 - (property.lat - 30.2) * 1000)}%`
            }}onClick={() => setSelectedProperty(property.id === selectedProperty ? null : property.id)}
          >
            <div className={`w-6 h-6 rounded-full ${getMatchScoreColor(property.matchScore)} border-2 border-background hover:scale-110 transition-transform flex items-center justify-center`}>
              <MapPin size={12} className="text-primary-foreground" />
            </div>
            
            {/* Property Tooltip */}
            {selectedProperty === property.id && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 glass-dark rounded-lg p-3 w-48 animate-slide-up">
                <div className="text-sm font-medium text-foreground">{property.name}</div>
                <div className="text-xs text-muted-foreground mb-2">Match: {property.matchScore}%</div>
                <div className="text-sm font-bold gradient-secondary-text">
                  ${property.price.toLocaleString()}/mo
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass-dark rounded-lg p-3">
        <h4 className="text-xs font-medium text-foreground mb-2">Match Score</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-muted-foreground">90%+</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-muted-foreground">80-89%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-xs text-muted-foreground">70-79%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyMap;