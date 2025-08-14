import React, { useState } from 'react';
import { Search, MapPin, Target, Plus, Minus } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface LocationSearchProps {
  onLocationChange: (location: { city: string; state: string; radius: number }) => void;
  currentLocation: { city: string; state: string; radius: number };
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationChange, currentLocation }) => {
  const [searchValue, setSearchValue] = useState(`${currentLocation.city}, ${currentLocation.state}`);
  const [radius, setRadius] = useState(currentLocation.radius);
  const [isSearching, setIsSearching] = useState(false);

  const popularCities = [
    { city: 'Austin', state: 'TX' },
    { city: 'Dallas', state: 'TX' },
    { city: 'Houston', state: 'TX' },
    { city: 'San Antonio', state: 'TX' },
    { city: 'Denver', state: 'CO' },
    { city: 'Phoenix', state: 'AZ' },
    { city: 'Nashville', state: 'TN' },
    { city: 'Atlanta', state: 'GA' }
  ];

  const handleSearch = () => {
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      const [city, state] = searchValue.split(', ');
      onLocationChange({ city: city || 'Austin', state: state || 'TX', radius });
      setIsSearching(false);
    }, 500);
  };

  const handleCitySelect = (city: string, state: string) => {
    setSearchValue(`${city}, ${state}`);
    onLocationChange({ city, state, radius });
  };

  const adjustRadius = (change: number) => {
    const newRadius = Math.max(5, Math.min(50, radius + change));
    setRadius(newRadius);
    const [city, state] = searchValue.split(', ');
    onLocationChange({ city: city || 'Austin', state: state || 'TX', radius: newRadius });
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

      {/* Location Search */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Enter city, state"
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

        {/* Radius Control */}
        <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Search Radius</span>
            <span className="text-sm text-blue-400 font-semibold">{radius} miles</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => adjustRadius(-5)}
              disabled={radius <= 5}
              className="w-8 h-8 p-0"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <div className="flex-1 relative">
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(radius - 5) / 45 * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>5mi</span>
                <span>50mi</span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => adjustRadius(5)}
              disabled={radius >= 50}
              className="w-8 h-8 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Popular Cities */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Popular Cities</h4>
        <div className="grid grid-cols-2 gap-2">
          {popularCities.map((location) => (
            <button
              key={`${location.city}-${location.state}`}
              onClick={() => handleCitySelect(location.city, location.state)}
              className={`p-2 rounded-lg text-sm font-medium transition-all border ${
                searchValue === `${location.city}, ${location.state}`
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                  : 'bg-slate-800/30 border-slate-700/30 text-muted-foreground hover:bg-slate-700/50'
              }`}
            >
              {location.city}, {location.state}
            </button>
          ))}
        </div>
      </div>

      {/* Current Search Summary */}
      <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg p-3 border border-blue-500/20">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span className="text-foreground">
            Searching <span className="font-semibold text-blue-400">{searchValue}</span> within <span className="font-semibold text-purple-400">{radius} miles</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LocationSearch;