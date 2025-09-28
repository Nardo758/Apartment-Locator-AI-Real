import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Target, Zap } from 'lucide-react';
import { designSystem, createCard, createHeading } from '@/lib/design-system';
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
      <ModernPageLayout
        title="Location Intelligence Demo"
        subtitle="Experience AI-powered location analysis and apartment discovery"
        showHeader={true}
        headerContent={
          <div className={`${designSystem.layouts.flex} ${designSystem.spacing.gapMedium}`}>
            <Link to="/">
              <Button variant="outline" size="sm" className={`${designSystem.spacing.gapSmall} ${designSystem.buttons.outline}`}>
                <ArrowLeft className={designSystem.icons.small} />
                Back to Home
              </Button>
            </Link>
            <Link to="/auth">
              <Button className={`${designSystem.buttons.primarySmall} ${designSystem.spacing.gapSmall}`}>
                <Zap className={designSystem.icons.small} />
                Get Full Access
              </Button>
            </Link>
          </div>
        }
      >
        {/* Demo Introduction */}
        <div className={`${designSystem.animations.entrance} ${designSystem.spacing.marginMedium}`}>
          <div className={`${designSystem.layouts.gridThree} ${designSystem.spacing.gapLarge}`}>
            <div className={`${createCard('primary', true)} text-center ${designSystem.spacing.cardPaddingLarge}`}>
              <div className={`${designSystem.layouts.stackMedium} items-center`}>
                <div className="p-4 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/60">
                  <MapPin className={`${designSystem.icons.large} ${designSystem.colors.primary}`} />
                </div>
                <div className={designSystem.layouts.stackSmall}>
                  <h3 className={`${designSystem.typography.heading4} ${designSystem.colors.text} text-center`}>
                    Smart Location Analysis
                  </h3>
                  <p className={`${designSystem.typography.body} text-center`}>
                    AI analyzes commute times, amenities, and lifestyle factors with precision
                  </p>
                </div>
              </div>
            </div>

            <div className={`${createCard('success', true)} text-center ${designSystem.spacing.cardPaddingLarge}`}>
              <div className={`${designSystem.layouts.stackMedium} items-center`}>
                <div className="p-4 rounded-full bg-gradient-to-br from-green-50 to-green-100 border border-green-200/60">
                  <Target className={`${designSystem.icons.large} ${designSystem.colors.success}`} />
                </div>
                <div className={designSystem.layouts.stackSmall}>
                  <h3 className={`${designSystem.typography.heading4} ${designSystem.colors.text} text-center`}>
                    Personalized Matching
                  </h3>
                  <p className={`${designSystem.typography.body} text-center`}>
                    Properties ranked based on your unique preferences and requirements
                  </p>
                </div>
              </div>
            </div>

            <div className={`${createCard('warning', true)} text-center ${designSystem.spacing.cardPaddingLarge}`}>
              <div className={`${designSystem.layouts.stackMedium} items-center`}>
                <div className="p-4 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200/60">
                  <Zap className={`${designSystem.icons.large} ${designSystem.colors.warning}`} />
                </div>
                <div className={designSystem.layouts.stackSmall}>
                  <h3 className={`${designSystem.typography.heading4} ${designSystem.colors.text} text-center`}>
                    Negotiation Intelligence
                  </h3>
                  <p className={`${designSystem.typography.body} text-center`}>
                    Identify properties with the best savings potential and market insights
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Intelligence Component */}
        <div className={`${designSystem.animations.entrance} ${designSystem.spacing.marginLarge}`} >
          <div className={`${createCard('default', false)} ${designSystem.spacing.cardPadding} ${designSystem.radius.large}`}>
            <LocationIntelligence userProfile={mockUserProfile} />
          </div>
        </div>
      </ModernPageLayout>
    </div>
  );
};

export default LocationIntelligenceDemo;