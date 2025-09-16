import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LocationIntelligence from '@/components/LocationIntelligence';

// Mock user profile for demo
const mockUserProfile = {
  id: 'demo-user',
  user_id: 'demo-user',
  email: 'demo@example.com',
  location: 'Austin, TX',
  search_radius: 25,
  max_drive_time: 30,
  points_of_interest: [
    {
      id: '1',
      name: 'My Office',
      address: '123 Main St, Austin, TX',
      category: 'work',
      priority: 'high',
      coordinates: { lat: 30.2672, lng: -97.7431 },
      maxTime: 25,
      transportMode: 'driving'
    },
    {
      id: '2', 
      name: 'Local Gym',
      address: '456 Fitness Ave, Austin, TX',
      category: 'gym',
      priority: 'medium',
      coordinates: { lat: 30.2580, lng: -97.7642 },
      maxTime: 15,
      transportMode: 'driving'
    }
  ],
  budget: 2500,
  bedrooms: '1',
  amenities: ['Pool', 'Gym', 'Parking', 'Pet-Friendly'],
  deal_breakers: ['No Parking', 'No Pets'],
  lifestyle: 'Active professional',
  work_schedule: 'Standard 9-5',
  priorities: ['Short Commute', 'Modern Amenities', 'Pet-Friendly'],
  bio: 'Young professional looking for convenient living',
  use_case: 'First apartment in Austin',
  additional_notes: 'Looking for dog-friendly places',
  has_completed_ai_programming: true
};

const LocationIntelligenceDemo = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Simplified Header */}
      <header className="bg-slate-900/50 border-b border-slate-700/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Interactive Demo</h1>
              <p className="text-sm text-muted-foreground">Experience AI-powered location intelligence</p>
            </div>
          </div>
          <Link to="/auth">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Get Full Access
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="xl:col-span-3">
              <LocationIntelligence userProfile={mockUserProfile} />
            </div>

            {/* Demo Sidebar */}
            <div className="xl:col-span-1 space-y-6">
              {/* AI Preferences Status */}
              <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-sm text-green-400 font-medium">AI Preferences Active (1)</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">3</div>
                  <div className="text-xs text-muted-foreground">new matches</div>
                </div>
              </div>

              {/* Smart Insights */}
              <div className="glass-dark rounded-xl border-l-4 border-l-green-400">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <h3 className="text-lg font-semibold text-foreground">Smart Insights</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">Price Alert</div>
                        <div className="text-xs text-muted-foreground">3 properties dropped price</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">Market Trend</div>
                        <div className="text-xs text-muted-foreground">Prices trending up 2.3%</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">New Matches</div>
                        <div className="text-xs text-muted-foreground">5 new properties found</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Market Intel */}
              <div className="glass-dark rounded-xl">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                    <h3 className="text-lg font-semibold text-foreground">Live Market Intel</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Median Rent</span>
                        <span className="text-sm font-semibold text-foreground">$2,340</span>
                      </div>
                      <div className="text-xs text-green-400">
                        +5.2% vs last month
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Days on Market</span>
                        <span className="text-sm font-semibold text-foreground">18 days</span>
                      </div>
                      <div className="text-xs text-red-400">
                        -2 days vs last month
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Occupancy Rate</span>
                        <span className="text-sm font-semibold text-foreground">94.2%</span>
                      </div>
                      <div className="text-xs text-green-400">
                        +1.8% vs last month
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">New Listings</span>
                        <span className="text-sm font-semibold text-foreground">23</span>
                      </div>
                      <div className="text-xs text-green-400">
                        +8 vs last week
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Settings */}
              <div className="glass-dark rounded-xl">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-semibold text-foreground">Search Settings</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Budget Range</span>
                      <span className="text-sm font-medium text-foreground">$2500</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Location</span>
                      <span className="text-sm font-medium text-foreground">atlanta, TX</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                    >
                      Update Preferences
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LocationIntelligenceDemo;