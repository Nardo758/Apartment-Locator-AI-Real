import React, { useState, useEffect, useMemo } from 'react';
import { Search, LayoutList, Map, Filter, Zap, Calendar } from 'lucide-react';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import PropertyCard from '../components/PropertyCard';
import PropertyMap from '../components/PropertyMap';
import UsageTracker from '../components/UsageTracker';
import QuickActions from '../components/QuickActions';
import MarketIntelligence from '../components/MarketIntelligence';
import LocationSearch from '../components/LocationSearch';

import { mockProperties, mockStats } from '../data/mockData';
import { useAIScanning } from '../hooks/useAIScanning';
import { useMarketData } from '../hooks/useMarketData';

interface PointOfInterest {
  id: string;
  name: string;
  address: string;
  maxTime: number;
  transportMode: 'driving' | 'transit' | 'walking' | 'biking';
  isWorkLocation?: boolean;
}
const Index = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filterMode, setFilterMode] = useState('Best Matches');
  const [isLeaseExpiring, setIsLeaseExpiring] = useState(true);
  const [daysUntilExpiration, setDaysUntilExpiration] = useState(47);
  const [searchLocation, setSearchLocation] = useState<{
    city: string;
    state: string;
    radius: number;
    maxDriveTime: number;
    pointsOfInterest: PointOfInterest[];
  }>({ 
    city: 'Austin', 
    state: 'TX', 
    radius: 25, 
    maxDriveTime: 30,
    pointsOfInterest: [
      { id: '1', name: 'Work', address: '123 Business St, Austin, TX', maxTime: 25, transportMode: 'driving', isWorkLocation: true },
      { id: '2', name: 'UT Campus', address: 'University of Texas, Austin, TX', maxTime: 20, transportMode: 'transit' },
      { id: '3', name: 'Airport', address: 'Austin-Bergstrom International Airport', maxTime: 45, transportMode: 'driving' }
    ]
  });
  
  const { propertiesScanned, isScanning } = useAIScanning();
  const marketData = useMarketData();

  // Countdown timer for lease expiration
  useEffect(() => {
    if (daysUntilExpiration > 0) {
      const timer = setInterval(() => {
        setDaysUntilExpiration(prev => prev - 1);
      }, 86400000); // Update daily
      return () => clearInterval(timer);
    }
  }, [daysUntilExpiration]);

  const filterOptions = ['Best Matches', 'Hidden Gems', 'Price Drops', 'Concession Opportunities', 'New Listings'];

  const filteredProperties = useMemo(() => {
    return mockProperties.sort((a, b) => {
      switch (filterMode) {
        case 'Best Matches':
          return b.matchScore - a.matchScore;
        case 'Hidden Gems':
          return a.daysVacant - b.daysVacant;
        case 'Price Drops':
          return b.savings - a.savings;
        default:
          return 0;
      }
    });
  }, [filterMode]);

  return (
    <div className="min-h-screen bg-background">{/* Dark solid background */}
      <Header />
      
      <main className="pt-20 px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Main Grid Layout */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Main Panel */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Greeting Section */}
              <div className="glass-dark rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      Good morning, <span className="gradient-text">John!</span>
                    </h1>
                    {isLeaseExpiring && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar size={16} className="text-yellow-400" />
                        <span className="text-muted-foreground">
                          Lease expires in <span className="text-yellow-400 font-medium">{daysUntilExpiration} days</span>
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-secondary ai-pulse' : 'bg-muted'}`}></div>
                    <span className="text-sm text-muted-foreground">
                      {isScanning ? '🤖 AI analyzing 1,247 properties' : '✅ Analysis complete - 73 matches found'}
                    </span>
                  </div>
                </div>
              </div>


              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  value="$312"
                  label="Monthly Savings"
                  sublabel="AI-Optimized Budget"
                  gradient="primary"
                />
                <StatsCard
                  value="73%"
                  label="Success Rate"
                  sublabel="AI Negotiations"
                  gradient="secondary"
                />
                <StatsCard
                  value="1,247"
                  label="Properties Analyzed"
                  sublabel="Last 24 Hours"
                  gradient="primary"
                />
                <StatsCard
                  value="$3,744"
                  label="Annual Savings"
                  sublabel="Projected Total"
                  gradient="secondary"
                />
              </div>

              {/* Property Recommendations */}
              <div className="glass-dark rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground">
                    🔮 AI Property Recommendations
                  </h2>
                  
                  {/* View Toggle */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-muted/20 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'text-muted-foreground'}`}
                      >
                        <LayoutList size={16} />
                      </button>
                      <button
                        onClick={() => setViewMode('map')}
                        className={`p-2 rounded ${viewMode === 'map' ? 'bg-primary text-white' : 'text-muted-foreground'}`}
                      >
                        <Map size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-3 mb-6">
                  <Filter size={16} className="text-muted-foreground" />
                  {filterOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => setFilterMode(option)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        filterMode === option
                          ? 'bg-primary text-white'
                          : 'bg-muted/20 text-muted-foreground hover:bg-muted/40'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {/* Content */}
                {viewMode === 'list' ? (
                  <div className="grid gap-6">
                    {filteredProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <PropertyMap />
                )}
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Location Search */}
              <LocationSearch 
                currentLocation={searchLocation}
                onLocationChange={(location) => setSearchLocation(location)}
              />

              {/* Usage Tracker */}
              <UsageTracker />

              {/* Quick Actions */}
              <QuickActions />

              {/* Market Intelligence */}
              <MarketIntelligence />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
