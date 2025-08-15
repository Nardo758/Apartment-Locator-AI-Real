import React from 'react';
import { MapPin } from 'lucide-react';

interface PopularCitiesProps {
  onLocationSelect: (city: string, state: string) => void;
  currentLocation?: string;
}

const PopularCities: React.FC<PopularCitiesProps> = ({ onLocationSelect, currentLocation }) => {
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

  return (
    <div className="glass-dark rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center border border-green-500/30">
          <MapPin className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Popular Cities</h3>
          <p className="text-sm text-muted-foreground">Quick search in popular locations</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {popularCities.map((location) => (
          <button
            key={`${location.city}-${location.state}`}
            onClick={() => onLocationSelect(location.city, location.state)}
            className={`p-3 rounded-lg text-sm font-medium transition-all border ${
              currentLocation === `${location.city}, ${location.state}`
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                : 'bg-slate-800/30 border-slate-700/30 text-muted-foreground hover:bg-slate-700/50'
            }`}
          >
            {location.city}, {location.state}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PopularCities;