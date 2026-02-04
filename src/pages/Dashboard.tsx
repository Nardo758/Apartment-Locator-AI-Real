import React from 'react';
import { designSystem } from '@/lib/design-system';
import Header from '@/components/Header';
import LocationIntelligence from '@/components/LocationIntelligence';
import SetupProgressBar from '@/components/dashboard/SetupProgressBar';
import MarketIntelCard from '@/components/dashboard/MarketIntelCard';
import ProfileSummaryCard from '@/components/dashboard/ProfileSummaryCard';
import { useUnifiedAI } from '@/contexts/UnifiedAIContext';

const Dashboard = () => {
  const unifiedAI = useUnifiedAI();

  // Convert UnifiedAI data to userProfile format for LocationIntelligence
  const userProfile = {
    id: 'unified-user',
    user_id: 'unified-user',
    email: 'user@example.com',
    location: unifiedAI.location || unifiedAI.zipCode || '',
    search_radius: 25,
    points_of_interest: unifiedAI.pointsOfInterest.map(poi => ({
      id: poi.id,
      name: poi.name,
      address: poi.address,
      category: poi.category,
      priority: poi.priority,
      coordinates: poi.coordinates,
      maxTime: poi.maxTime || 25,
      transportMode: poi.transportMode || 'driving',
    })),
    budget: unifiedAI.budget,
    bedrooms: unifiedAI.aiPreferences.bedrooms,
    amenities: unifiedAI.aiPreferences.amenities,
    deal_breakers: unifiedAI.aiPreferences.dealBreakers,
    lifestyle: unifiedAI.aiPreferences.lifestyle || '',
    work_schedule: unifiedAI.aiPreferences.workSchedule || '',
    priorities: unifiedAI.aiPreferences.priorities,
    bio: unifiedAI.aiPreferences.bio || '',
    use_case: unifiedAI.aiPreferences.useCase || '',
    additional_notes: unifiedAI.aiPreferences.additionalNotes || '',
    has_completed_ai_programming: unifiedAI.hasCompletedSetup,
  };

  return (
    <div className={`${designSystem.backgrounds.page} ${designSystem.backgrounds.pageDark}`}>
      <Header />

      <div className="container mx-auto px-4 pt-24 pb-8 min-h-screen space-y-6">
        {/* Setup Progress Bar */}
        <div className={designSystem.animations.entrance}>
          <SetupProgressBar />
        </div>

        {/* Intelligence Cards: Market Intel + Profile Summary */}
        <div className={`${designSystem.animations.entrance} grid md:grid-cols-2 gap-6`}>
          <MarketIntelCard />
          <ProfileSummaryCard />
        </div>

        {/* Location Intelligence Component */}
        <div className={`${designSystem.animations.entrance} w-full`}>
          <LocationIntelligence userProfile={userProfile} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;