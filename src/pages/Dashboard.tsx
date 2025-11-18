import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, Database } from 'lucide-react';
import { designSystem } from '@/lib/design-system';
import ModernPageLayout from '@/components/modern/ModernPageLayout';
import Header from '@/components/Header';
import LocationIntelligence from '@/components/LocationIntelligence';

// Mock user profile for the dashboard
const mockUserProfile = {
  id: 'dashboard-user',
  user_id: 'dashboard-user',
  email: 'user@example.com',
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

const Dashboard = () => {
  return (
    <div className={`${designSystem.backgrounds.page} ${designSystem.backgrounds.pageDark}`}>
      <Header />

      <div className="container mx-auto px-4 pt-24 pb-8 min-h-screen space-y-8">
        {/* Quick Actions */}
        <div className="flex gap-4 flex-wrap">
          <Link to="/data-management">
            <Button variant="outline" className="gap-2">
              <Database className="h-4 w-4" />
              Manage Database
            </Button>
          </Link>
        </div>

        {/* Location Intelligence Component */}
        <div className={`${designSystem.animations.entrance} w-full`}>
          <LocationIntelligence userProfile={mockUserProfile} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;