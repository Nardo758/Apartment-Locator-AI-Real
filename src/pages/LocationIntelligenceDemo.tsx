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
            <div>
              <h1 className="text-xl font-bold text-foreground">Location Intelligence Dashboard</h1>
              <p className="text-sm text-muted-foreground">AI-powered apartment recommendations based on your preferences</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/renter-intelligence">
              <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950">
                Try RenterIQ
              </Button>
            </Link>
            <Link to="/program-ai">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Setup AI Preferences
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <LocationIntelligence userProfile={mockUserProfile} />
        </div>
      </main>
    </div>
  );
};

export default LocationIntelligenceDemo;