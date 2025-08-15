import React, { useState, useEffect } from 'react';
import { Search, Filter, Bell, Settings, ChevronRight, MapPin, DollarSign, Calendar, Zap, TrendingUp, Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '../components/Header';
import PropertyCard from '../components/PropertyCard';
import LocationSearch from '../components/LocationSearch';
import QuickActions from '../components/QuickActions';
import MarketIntelligence from '../components/MarketIntelligence';
import PopularCities from '../components/PopularCities';
import { mockProperties } from '../data/mockData';

const DashboardNew = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('recommended');
  const [showSearchArea, setShowSearchArea] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    city: 'Austin',
    state: 'TX',
    radius: 25,
    maxDriveTime: 30,
    pointsOfInterest: []
  });

  const handleLocationSelect = (city: string, state: string) => {
    setCurrentLocation(prev => ({ ...prev, city, state }));
  };

  // User state - would come from auth/profile
  const userState = {
    name: 'John',
    leaseExpiration: 47,
    budget: 2500,
    location: 'Austin, TX',
    savedProperties: 5,
    newMatches: 3,
    aiProcessing: false
  };

  const quickActions = [
    { id: 'schedule', label: 'Schedule Tours', icon: Calendar, count: 3 },
    { id: 'saved', label: 'Saved Properties', icon: Heart, count: userState.savedProperties },
    { id: 'applications', label: 'Applications', icon: TrendingUp, count: 1 },
    { id: 'alerts', label: 'Price Alerts', icon: Bell, count: 2 }
  ];

  const filters = [
    { id: 'recommended', label: '🎯 AI Recommended', count: 12 },
    { id: 'new', label: '✨ New Matches', count: userState.newMatches },
    { id: 'deals', label: '💰 Best Deals', count: 8 },
    { id: 'tours', label: '🏠 Tour Ready', count: 15 }
  ];

  const priorityInsights = [
    {
      type: 'urgent',
      title: 'Lease expiring soon',
      message: `Your lease expires in ${userState.leaseExpiration} days`,
      action: 'View timeline',
      icon: Calendar
    },
    {
      type: 'opportunity',
      title: 'New deal found',
      message: 'Property in your area dropped $200/month',
      action: 'View property',
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section - Simplified */}
          <div className="mb-8">
            <div className="glass-dark rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-1">
                    Welcome back, <span className="gradient-text">{userState.name}</span>! 👋
                  </h1>
                  <p className="text-muted-foreground">
                    {userState.aiProcessing ? 
                      '🤖 AI is analyzing new properties for you...' : 
                      `Found ${mockProperties.length} properties in ${userState.location}`
                    }
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold gradient-text">{userState.newMatches}</div>
                  <div className="text-sm text-muted-foreground">new matches</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Priority Insights */}
              {priorityInsights.length > 0 && (
                <div className="space-y-3">
                  {priorityInsights.map((insight, index) => {
                    const Icon = insight.icon;
                    return (
                      <div key={index} className={`glass-dark rounded-lg p-4 border-l-4 ${
                        insight.type === 'urgent' ? 'border-l-yellow-400' : 'border-l-secondary'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              insight.type === 'urgent' ? 'bg-yellow-400/20' : 'bg-secondary/20'
                            }`}>
                              <Icon size={16} className={insight.type === 'urgent' ? 'text-yellow-400' : 'text-secondary'} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{insight.title}</h3>
                              <p className="text-sm text-muted-foreground">{insight.message}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-primary">
                            {insight.action}
                            <ChevronRight size={16} className="ml-1" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Search Area Modal/Overlay */}
              {showSearchArea && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <LocationSearch 
                      onLocationChange={setCurrentLocation}
                      currentLocation={currentLocation}
                    />
                    <div className="mt-4 text-center">
                      <Button 
                        onClick={() => setShowSearchArea(false)}
                        variant="outline"
                        className="bg-slate-800/50"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Filter Tabs */}
              <div className="glass-dark rounded-xl p-6">
                <div className="flex flex-wrap gap-2 mb-6">
                  {filters.map((filter) => (
                    <Button
                      key={filter.id}
                      variant={activeFilter === filter.id ? "default" : "outline"}
                      onClick={() => setActiveFilter(filter.id)}
                      className="relative"
                    >
                      {filter.label}
                      {filter.count > 0 && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {filter.count}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>

                {/* Properties Grid */}
                <div className="space-y-4">
                  {mockProperties.slice(0, 6).map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                <div className="text-center mt-6">
                  <Button variant="outline">
                    Load More Properties
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <QuickActions onSearchAreaClick={() => setShowSearchArea(true)} />

              {/* Market Intelligence */}
              <MarketIntelligence />

              {/* Popular Cities */}
              <PopularCities 
                onLocationSelect={handleLocationSelect}
                currentLocation={`${currentLocation.city}, ${currentLocation.state}`}
              />

              {/* Search Preferences */}
              <Card className="glass-dark border-border/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Settings size={20} className="mr-2 text-muted-foreground" />
                    Search Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Budget Range</span>
                    <span className="text-sm font-medium">${userState.budget}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Location</span>
                    <span className="text-sm font-medium">{userState.location}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Update Preferences
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardNew;