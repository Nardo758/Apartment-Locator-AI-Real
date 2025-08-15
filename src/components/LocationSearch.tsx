import React, { useState } from 'react';
import { Search, MapPin, Target, Plus, Minus, X, Clock, Navigation, Filter } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface PointOfInterest {
  id: string;
  name: string;
  address: string;
  maxTime: number;
  transportMode: 'driving' | 'transit' | 'walking' | 'biking';
  isWorkLocation?: boolean;
}

interface LocationSearchProps {
  onLocationChange: (location: { city: string; state: string; radius: number; maxDriveTime: number; pointsOfInterest: PointOfInterest[] }) => void;
  currentLocation: { city: string; state: string; radius: number; maxDriveTime: number; pointsOfInterest: PointOfInterest[] };
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationChange, currentLocation }) => {
  const [searchValue, setSearchValue] = useState(`${currentLocation.city}, ${currentLocation.state}`);
  const [radius, setRadius] = useState(currentLocation.radius);
  const [maxDriveTime, setMaxDriveTime] = useState(currentLocation.maxDriveTime);
  const [pointsOfInterest, setPointsOfInterest] = useState<PointOfInterest[]>(currentLocation.pointsOfInterest);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingPOI, setIsAddingPOI] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [newPOI, setNewPOI] = useState({ name: '', address: '', maxTime: 30, transportMode: 'driving' as const });


  const commonPOIs = ['Work', 'Gym', 'Family', 'Airport', 'School', 'Shopping', 'Healthcare', 'Nightlife'];

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      const [city, state] = searchValue.split(', ');
      onLocationChange({ 
        city: city || 'Austin', 
        state: state || 'TX', 
        radius, 
        maxDriveTime,
        pointsOfInterest 
      });
      setIsSearching(false);
    }, 500);
  };


  const adjustRadius = (change: number) => {
    const newRadius = Math.max(5, Math.min(50, radius + change));
    setRadius(newRadius);
    updateLocation({ radius: newRadius });
  };

  const adjustDriveTime = (change: number) => {
    const newDriveTime = Math.max(10, Math.min(120, maxDriveTime + change));
    setMaxDriveTime(newDriveTime);
    updateLocation({ maxDriveTime: newDriveTime });
  };

  const updateLocation = (updates: Partial<typeof currentLocation>) => {
    const [city, state] = searchValue.split(', ');
    onLocationChange({ 
      city: city || 'Austin', 
      state: state || 'TX', 
      radius, 
      maxDriveTime,
      pointsOfInterest,
      ...updates 
    });
  };

  const addPOI = () => {
    if (newPOI.name && newPOI.address) {
      const poi: PointOfInterest = {
        id: Date.now().toString(),
        ...newPOI
      };
      const updatedPOIs = [...pointsOfInterest, poi];
      setPointsOfInterest(updatedPOIs);
      updateLocation({ pointsOfInterest: updatedPOIs });
      setNewPOI({ name: '', address: '', maxTime: 30, transportMode: 'driving' });
      setIsAddingPOI(false);
    }
  };

  const removePOI = (id: string) => {
    const updatedPOIs = pointsOfInterest.filter(poi => poi.id !== id);
    setPointsOfInterest(updatedPOIs);
    updateLocation({ pointsOfInterest: updatedPOIs });
  };

  const quickAddPOI = (name: string) => {
    setNewPOI({ ...newPOI, name });
    setIsAddingPOI(true);
  };

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'driving': return '🚗';
      case 'transit': return '🚌';
      case 'walking': return '🚶';
      case 'biking': return '🚴';
      default: return '🚗';
    }
  };

  return (
    <div className="glass-dark rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30">
          <Target className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Search Area</h3>
          <p className="text-sm text-muted-foreground">Find properties in your preferred location</p>
        </div>
      </div>

      {/* Unified Search Bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Enter city, state or neighborhood"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 bg-slate-800/50 border-slate-600/50 focus:border-blue-500/50"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* More Filters Toggle */}
        <Collapsible open={showMoreFilters} onOpenChange={setShowMoreFilters}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-center">
              <Filter size={16} className="mr-2" />
              More Filters
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">

            {/* Search Controls */}
            <div className="grid grid-cols-2 gap-3">
              {/* Radius Control */}
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">Search Radius</span>
                  <span className="text-sm text-blue-400 font-semibold">{radius} miles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adjustRadius(-5)}
                    disabled={radius <= 5}
                    className="w-6 h-6 p-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <div className="flex-1 relative">
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-purple-400 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${(radius - 5) / 45 * 100}%` }}
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adjustRadius(5)}
                    disabled={radius >= 50}
                    className="w-6 h-6 p-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5mi</span>
                  <span>50mi</span>
                </div>
              </div>

              {/* Drive Time Control */}
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">Max Drive Time</span>
                  <span className="text-sm text-purple-400 font-semibold">{maxDriveTime} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adjustDriveTime(-10)}
                    disabled={maxDriveTime <= 10}
                    className="w-6 h-6 p-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <div className="flex-1 relative">
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-purple-400 to-pink-400 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${(maxDriveTime - 10) / 110 * 100}%` }}
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adjustDriveTime(10)}
                    disabled={maxDriveTime >= 120}
                    className="w-6 h-6 p-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>10min</span>
                  <span>120min</span>
                </div>
              </div>
            </div>

            {/* Points of Interest */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">Points of Interest</h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddingPOI(true)}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add POI
                </Button>
              </div>

              {/* Quick Add POI Buttons */}
              {!isAddingPOI && pointsOfInterest.length === 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {commonPOIs.map((poi) => (
                    <button
                      key={poi}
                      onClick={() => quickAddPOI(poi)}
                      className="p-2 rounded-lg text-xs font-medium bg-slate-800/30 border border-slate-700/30 text-muted-foreground hover:bg-slate-700/50 transition-all"
                    >
                      {poi}
                    </button>
                  ))}
                </div>
              )}

              {/* Add POI Form */}
              {isAddingPOI && (
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Location name"
                      value={newPOI.name}
                      onChange={(e) => setNewPOI({ ...newPOI, name: e.target.value })}
                      className="bg-slate-700/50 border-slate-600/50"
                    />
                    <Input
                      placeholder="Address"
                      value={newPOI.address}
                      onChange={(e) => setNewPOI({ ...newPOI, address: e.target.value })}
                      className="bg-slate-700/50 border-slate-600/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="Max time"
                        value={newPOI.maxTime}
                        onChange={(e) => setNewPOI({ ...newPOI, maxTime: Number(e.target.value) })}
                        className="bg-slate-700/50 border-slate-600/50"
                      />
                      <span className="text-xs text-muted-foreground">min</span>
                    </div>
                    <Select 
                      value={newPOI.transportMode} 
                      onValueChange={(value: any) => setNewPOI({ ...newPOI, transportMode: value })}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-slate-600/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="driving">🚗 Driving</SelectItem>
                        <SelectItem value="transit">🚌 Transit</SelectItem>
                        <SelectItem value="walking">🚶 Walking</SelectItem>
                        <SelectItem value="biking">🚴 Biking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={addPOI} className="flex-1">Add</Button>
                    <Button size="sm" variant="outline" onClick={() => setIsAddingPOI(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {/* POI List */}
              {pointsOfInterest.length > 0 && (
                <div className="space-y-2">
                  {pointsOfInterest.map((poi) => (
                    <div key={poi.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{poi.name}</div>
                          <div className="text-xs text-muted-foreground">{poi.address}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getTransportIcon(poi.transportMode)} {poi.maxTime}min
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removePOI(poi.id)}
                          className="w-6 h-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>


      {/* Current Search Summary */}
      <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg p-3 border border-blue-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-foreground">
              Searching <span className="font-semibold text-blue-400">{searchValue}</span> within <span className="font-semibold text-purple-400">{radius} miles</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-foreground">
              Max drive time: <span className="font-semibold text-purple-400">{maxDriveTime} minutes</span>
            </span>
          </div>
          {pointsOfInterest.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Navigation className="w-4 h-4 text-green-400" />
              <span className="text-foreground">
                <span className="font-semibold text-green-400">{pointsOfInterest.length}</span> points of interest
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationSearch;