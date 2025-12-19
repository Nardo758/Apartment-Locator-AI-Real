import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  TrendingUp, 
  Handshake, 
  Briefcase,
  Dumbbell,
  ShoppingCart,
  Star,
  Bed,
  Bath,
  Maximize
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Sample data matching the reference design
const sampleProperties = [
  {
    id: 'prop-001',
    name: 'South Lamar Residences',
    address: '789 S Lamar Blvd, Austin, TX',
    rent: 2005,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1100,
    coordinates: { lat: 30.2500, lng: -97.7600 },
    score: 94,
    scoreBreakdown: { budget: 92, location: 96, market: 94 },
    daysOnMarket: 8,
    hasConcessions: true,
    concessionValue: 500,
    savings: '$545/mo',
    isTopPick: true,
    commuteTimes: [
      { name: 'Work', time: 12, mode: 'driving' },
      { name: 'Gym', time: 8, mode: 'walking' }
    ]
  },
  {
    id: 'prop-002',
    name: 'Mosaic Lake Apartments',
    address: '123 Lake View Dr, Austin, TX',
    rent: 1920,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 750,
    coordinates: { lat: 30.2800, lng: -97.7300 },
    score: 91,
    scoreBreakdown: { budget: 95, location: 88, market: 90 },
    daysOnMarket: 15,
    hasConcessions: true,
    concessionValue: 883,
    savings: '$883/mo',
    isTopPick: true,
    commuteTimes: [
      { name: 'Work', time: 18, mode: 'driving' },
      { name: 'Gym', time: 15, mode: 'walking' }
    ]
  },
  {
    id: 'prop-003',
    name: 'East Austin Lofts',
    address: '456 E 6th St, Austin, TX',
    rent: 2150,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 850,
    coordinates: { lat: 30.2650, lng: -97.7250 },
    score: 85,
    scoreBreakdown: { budget: 78, location: 92, market: 85 },
    daysOnMarket: 5,
    hasConcessions: false,
    savings: null,
    isTopPick: false,
    commuteTimes: [
      { name: 'Work', time: 8, mode: 'driving' },
      { name: 'Gym', time: 20, mode: 'walking' }
    ]
  }
];

const userLocations = [
  { id: 'work', name: 'My Office', type: 'work', coordinates: { lat: 30.2672, lng: -97.7431 }, priority: 'high' },
  { id: 'gym', name: 'Local Gym', type: 'gym', coordinates: { lat: 30.2682, lng: -97.7451 }, priority: 'medium' },
  { id: 'grocery', name: 'Whole Foods', type: 'grocery', coordinates: { lat: 30.2690, lng: -97.7400 }, priority: 'low' }
];

const marketIntel = {
  avgRent: 2284,
  rentTrend: '+2.3%',
  newListings: 47,
  listingsTrend: '+8',
  daysOnMarket: 12,
  domTrend: '+2',
  competition: 'High',
  occupancy: '85%',
  concessions: '73%',
  landlordUrgency: 'Moderate',
  bestWindow: 'Next 2wks'
};

const SearchDashboardDemo: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [budgetRange, setBudgetRange] = useState([2000, 2500]);
  const [bedrooms, setBedrooms] = useState('1+');
  const [sortBy, setSortBy] = useState('score');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const selectedPropertyData = sampleProperties.find(p => p.id === selectedProperty);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map
    const map = L.map(mapRef.current).setView([30.2672, -97.7431], 13);
    
    // Add CartoDB Voyager tiles (cleaner look)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add user location markers
    userLocations.forEach((loc) => {
      const colors: Record<string, string> = { work: '#ef4444', gym: '#f97316', grocery: '#22c55e' };
      const icons: Record<string, string> = { work: '💼', gym: '🏋️', grocery: '🛒' };
      
      const icon = L.divIcon({
        className: 'location-marker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: white;
            border: 3px solid ${colors[loc.type] || '#667eea'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            box-shadow: 0 3px 8px rgba(0,0,0,0.2);
          ">
            ${icons[loc.type] || '📍'}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker([loc.coordinates.lat, loc.coordinates.lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${loc.name}</b><br/>${loc.type} • ${loc.priority} priority`);

      // Add radius circle for high priority
      if (loc.priority === 'high') {
        L.circle([loc.coordinates.lat, loc.coordinates.lng], {
          radius: 1500,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.08,
          weight: 1,
          dashArray: '5, 5'
        }).addTo(map);
      }
    });

    // Add property markers
    sampleProperties.forEach((property) => {
      const color = property.score >= 90 ? '#22c55e' : property.score >= 80 ? '#eab308' : '#f97316';
      
      const icon = L.divIcon({
        className: 'property-marker',
        html: `
          <div style="
            width: 36px;
            height: 36px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            cursor: pointer;
          ">
            ${property.score}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([property.coordinates.lat, property.coordinates.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 180px;">
            <b>${property.name}</b><br/>
            <span style="color: #667eea; font-weight: bold; font-size: 16px;">$${property.rent}/mo</span><br/>
            <small>${property.bedrooms}bd • ${property.bathrooms}ba • ${property.sqft} sqft</small>
            ${property.savings ? `<br/><small style="color: #22c55e;">💰 Save ${property.savings}</small>` : ''}
          </div>
        `);

      marker.on('click', () => {
        setSelectedProperty(property.id);
      });

      markersRef.current.push(marker);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-muted">
      {/* Left Panel - 420px */}
      <div className="w-[420px] flex-shrink-0 flex flex-col h-full bg-background border-r border-border overflow-hidden">
        
        {/* Market Intel Header - Gradient */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 text-white p-5 flex-shrink-0">
          <h1 className="text-lg font-bold flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5" />
            Live Market Intel
          </h1>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="text-sm opacity-90">Avg Rent</div>
              <div className="text-xl font-bold flex items-center justify-between">
                ${marketIntel.avgRent}
                <span className="text-xs bg-green-400/20 text-green-200 px-2 py-0.5 rounded-full">
                  {marketIntel.rentTrend}
                </span>
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="text-sm opacity-90">New Listings</div>
              <div className="text-xl font-bold flex items-center justify-between">
                {marketIntel.newListings}
                <span className="text-xs bg-green-400/20 text-green-200 px-2 py-0.5 rounded-full">
                  {marketIntel.listingsTrend}
                </span>
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="text-sm opacity-90">Days on Market</div>
              <div className="text-xl font-bold flex items-center justify-between">
                {marketIntel.daysOnMarket}
                <span className="text-xs bg-yellow-400/20 text-yellow-200 px-2 py-0.5 rounded-full">
                  {marketIntel.domTrend}
                </span>
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="text-sm opacity-90">Competition</div>
              <div className="text-xl font-bold">
                {marketIntel.competition}
                <span className="text-xs opacity-70 ml-1">{marketIntel.occupancy} occ</span>
              </div>
            </div>
          </div>

          {/* Negotiation Intel */}
          <div className="bg-white/10 rounded-lg p-3">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Handshake className="w-4 h-4" />
              Negotiation Intel
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xs opacity-80">Concessions</div>
                <div className="font-bold">{marketIntel.concessions}</div>
                <div className="text-[10px] opacity-70">offering incentives</div>
              </div>
              <div>
                <div className="text-xs opacity-80">Urgency</div>
                <div className="font-bold">{marketIntel.landlordUrgency}</div>
                <div className="text-[10px] opacity-70">15% price drops</div>
              </div>
              <div>
                <div className="text-xs opacity-80">Best Window</div>
                <div className="font-bold">{marketIntel.bestWindow}</div>
                <div className="text-[10px] opacity-70">optimal timing</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Filters */}
        <div className="p-4 bg-muted/50 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Search Filters</h3>
            <Button variant="ghost" size="sm" className="text-xs h-7">Reset</Button>
          </div>
          
          {/* Budget Slider */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Budget</span>
              <span>${budgetRange[0]} - ${budgetRange[1]}</span>
            </div>
            <Slider
              value={budgetRange}
              onValueChange={setBudgetRange}
              min={1500}
              max={3500}
              step={50}
              className="w-full"
            />
          </div>

          {/* Bedroom Buttons */}
          <div className="flex gap-2 mb-3">
            {['Any', '1+', '2+', '3+'].map((bed) => (
              <Button
                key={bed}
                size="sm"
                variant={bedrooms === bed ? 'default' : 'outline'}
                onClick={() => setBedrooms(bed)}
                className="flex-1 h-8 text-xs"
              >
                {bed} {bed !== 'Any' && 'Bed'}
              </Button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Best Match</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="savings">Highest Savings</SelectItem>
            </SelectContent>
          </Select>

          {/* User Locations */}
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-2">Your Locations</div>
            <div className="space-y-1.5">
              {userLocations.map((loc) => (
                <div key={loc.id} className="flex items-center justify-between bg-background rounded-md px-2 py-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    {loc.type === 'work' && <Briefcase className="w-3 h-3 text-red-500" />}
                    {loc.type === 'gym' && <Dumbbell className="w-3 h-3 text-orange-500" />}
                    {loc.type === 'grocery' && <ShoppingCart className="w-3 h-3 text-green-500" />}
                    <span>{loc.name}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] px-1.5 py-0 ${
                      loc.priority === 'high' ? 'border-red-300 text-red-600 bg-red-50' :
                      loc.priority === 'medium' ? 'border-orange-300 text-orange-600 bg-orange-50' :
                      'border-green-300 text-green-600 bg-green-50'
                    }`}
                  >
                    {loc.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Property Cards - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-xs text-muted-foreground mb-2">
            {sampleProperties.length} properties found
          </div>
          
          {sampleProperties.map((property, index) => (
            <div
              key={property.id}
              onClick={() => setSelectedProperty(property.id)}
              className={`
                bg-background rounded-xl border p-4 cursor-pointer transition-all
                ${selectedProperty === property.id 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/50 hover:shadow-md'
                }
                ${property.isTopPick ? 'border-l-4 border-l-green-500' : ''}
              `}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">#{index + 1}</span>
                    {property.isTopPick && (
                      <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0">
                        <Star className="w-2.5 h-2.5 mr-0.5" /> Top Pick
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm mt-0.5">{property.name}</h3>
                  <p className="text-xs text-muted-foreground">{property.address}</p>
                </div>
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm
                  ${property.score >= 90 ? 'bg-green-500' : property.score >= 80 ? 'bg-yellow-500' : 'bg-orange-500'}
                `}>
                  {property.score}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xl font-bold text-primary">${property.rent}</span>
                <span className="text-xs text-muted-foreground">/mo</span>
                {property.savings && (
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">
                    Save {property.savings}
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Bed className="w-3 h-3" /> {property.bedrooms}bd
                </span>
                <span className="flex items-center gap-1">
                  <Bath className="w-3 h-3" /> {property.bathrooms}ba
                </span>
                <span className="flex items-center gap-1">
                  <Maximize className="w-3 h-3" /> {property.sqft} sqft
                </span>
              </div>

              {/* Score Breakdown Bar */}
              <div className="h-1.5 rounded-full overflow-hidden flex mb-2">
                <div 
                  className="bg-green-500" 
                  style={{ width: `${property.scoreBreakdown.budget * 0.4}%` }}
                  title="Budget Score"
                />
                <div 
                  className="bg-blue-500" 
                  style={{ width: `${property.scoreBreakdown.location * 0.35}%` }}
                  title="Location Score"
                />
                <div 
                  className="bg-orange-500" 
                  style={{ width: `${property.scoreBreakdown.market * 0.25}%` }}
                  title="Market Score"
                />
              </div>

              {/* Commute Times */}
              <div className="flex gap-2">
                {property.commuteTimes.map((commute) => (
                  <div 
                    key={commute.name}
                    className={`
                      text-[10px] px-2 py-1 rounded-full
                      ${commute.time <= 10 ? 'bg-green-100 text-green-700' :
                        commute.time <= 20 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'}
                    `}
                  >
                    {commute.name}: {commute.time}min
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Map */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="h-full w-full" />

        {/* Map Legend Overlay */}
        <div className="absolute bottom-6 left-6 bg-background/95 backdrop-blur-sm rounded-lg p-4 border shadow-lg z-[1000]">
          <div className="text-sm font-semibold mb-2">Score Legend</div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span>90%+ Top Picks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <span>80-89% Good Match</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500" />
              <span>70-79% Fair</span>
            </div>
          </div>
          <div className="border-t mt-3 pt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-3 h-1 bg-green-500 rounded" /> Budget (40%)
            </div>
            <div className="flex items-center gap-1 mb-1">
              <div className="w-3 h-1 bg-blue-500 rounded" /> Location (35%)
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1 bg-orange-500 rounded" /> Market (25%)
            </div>
          </div>
        </div>

        {/* Selected Property Detail Card */}
        {selectedPropertyData && (
          <div className="absolute top-6 right-6 bg-background/95 backdrop-blur-sm rounded-lg p-4 border shadow-lg z-[1000] w-72">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold">{selectedPropertyData.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedPropertyData.address}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setSelectedProperty(null)}
              >
                ×
              </Button>
            </div>
            <div className="text-2xl font-bold text-primary mb-2">
              ${selectedPropertyData.rent}
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </div>
            {selectedPropertyData.savings && (
              <div className="text-sm text-green-600 bg-green-50 rounded px-2 py-1 mb-3">
                💰 Save {selectedPropertyData.savings} with current concessions
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 text-xs text-center mb-3">
              <div className="bg-muted rounded p-2">
                <div className="font-bold">{selectedPropertyData.bedrooms}</div>
                <div className="text-muted-foreground">Beds</div>
              </div>
              <div className="bg-muted rounded p-2">
                <div className="font-bold">{selectedPropertyData.bathrooms}</div>
                <div className="text-muted-foreground">Baths</div>
              </div>
              <div className="bg-muted rounded p-2">
                <div className="font-bold">{selectedPropertyData.sqft}</div>
                <div className="text-muted-foreground">Sqft</div>
              </div>
            </div>
            <Button className="w-full" size="sm">View Details</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchDashboardDemo;
