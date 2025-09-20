import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Target, Zap } from 'lucide-react';
import { designSystem } from '@/lib/design-system';
import ModernPageLayout from '@/components/modern/ModernPageLayout';
import ModernCard from '@/components/modern/ModernCard';
import Header from '@/components/Header';
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
    <div className={`${designSystem.backgrounds.page} ${designSystem.backgrounds.pageDark}`}>
      <Header />

      <ModernPageLayout
        title="Location Intelligence Demo"
        subtitle="Experience AI-powered location analysis and apartment discovery"
        showHeader={false}
        headerContent={
          <div className="flex gap-3">
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft size={16} />
                Back to Home
              </Button>
            </Link>
            <Link to="/auth">
              <Button className={`${designSystem.buttons.primary} ${designSystem.buttons.small} gap-2`}>
                <Zap size={16} />
                Get Full Access
              </Button>
            </Link>
          </div>
        }
      >
        {/* Demo Introduction */}
        <div className={`${designSystem.animations.entrance} mb-8`}>
          <div className="grid md:grid-cols-3 gap-6">
            <ModernCard 
              animate
              hover
              className="text-center"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className={`${designSystem.typography.subheadingLarge} mb-1`}>
                    Smart Location Analysis
                  </h3>
                  <p className={designSystem.typography.body}>
                    AI analyzes commute times, amenities, and lifestyle factors
                  </p>
                </div>
              </div>
            </ModernCard>

            <ModernCard 
              animate
              animationDelay={100}
              hover
              className="text-center"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className={`${designSystem.typography.subheadingLarge} mb-1`}>
                    Personalized Matching
                  </h3>
                  <p className={designSystem.typography.body}>
                    Properties ranked based on your unique preferences
                  </p>
                </div>
              </div>
            </ModernCard>

            <ModernCard 
              animate
              animationDelay={200}
              hover
              className="text-center"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className={`${designSystem.typography.subheadingLarge} mb-1`}>
                    Negotiation Intelligence
                  </h3>
                  <p className={designSystem.typography.body}>
                    Identify properties with the best savings potential
                  </p>
                </div>
              </div>
            </ModernCard>
          </div>
        </div>

        {/* Location Intelligence Component */}
        <div className={`${designSystem.animations.entrance}`} style={{ animationDelay: '300ms' }}>
          <LocationIntelligence userProfile={mockUserProfile} />
        </div>
      </ModernPageLayout>
    </div>
  );
};

export default LocationIntelligenceDemo;