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
      {/* Header */}
      <header className="bg-slate-900/50 border-b border-slate-700/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Landing
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Location Intelligence Demo</h1>
              <p className="text-sm text-muted-foreground">Experience AI-powered apartment recommendations</p>
            </div>
          </div>
          <Link to="/auth">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Sign Up for Full Access
            </Button>
          </Link>
        </div>
      </header>

      {/* Demo Content */}
      <main className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* Demo Notice */}
          <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 text-blue-400 font-medium mb-1">
              🎯 Interactive Demo
            </div>
            <p className="text-sm text-muted-foreground">
              This is a fully interactive demo with sample POIs and AI preferences. Sign up to add your own locations and preferences!
            </p>
          </div>

          {/* Location Intelligence Component */}
          <LocationIntelligence userProfile={mockUserProfile} />
        </div>
      </main>
    </div>
  );
};

export default LocationIntelligenceDemo;