import React from 'react';
import { ArrowLeft, Home, Target, TrendingDown, Brain, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { designSystem } from '@/lib/design-system';
import ModernPageLayout from '@/components/modern/ModernPageLayout';
import { RenterDashboard } from '@/components/renter/RenterDashboard';
import type { ApartmentIQData } from '@/lib/pricing-engine';

// Mock apartment data with various scenarios for demonstration
type MockUnit = {
  id: string;
  apartmentIQData: ApartmentIQData;
}

const mockApartmentData: MockUnit[] = [
  {
    id: 'apt-1',
    apartmentIQData: {
      unitId: 'apt-1',
      propertyName: 'Sunset Gardens',
      unitNumber: '204',
      address: '123 Main St, Austin, TX',
      zipCode: '78701',
      currentRent: 2100,
      originalRent: 2300,
      effectiveRent: 1900,
      rentPerSqft: 2.5,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 840,
      floor: 2,
      floorPlan: 'A1',
      daysOnMarket: 45, // Desperate landlord scenario
      firstSeen: '2024-01-15',
      marketVelocity: 'stale',
      concessionValue: 2300, // One month free
      concessionType: 'free_rent',
      concessionUrgency: 'desperate',
      rentTrend: 'decreasing',
      rentChangePercent: -8.7,
      concessionTrend: 'increasing',
      marketPosition: 'above_market',
      percentileRank: 85,
      amenityScore: 75,
      locationScore: 80,
      managementScore: 65,
      leaseProbability: 0.25,
      negotiationPotential: 9,
      urgencyScore: 9,
      dataFreshness: '2024-02-20T10:00:00Z',
      confidenceScore: 0.9
    }
  },
  {
    id: 'apt-2',
    apartmentIQData: {
      unitId: 'apt-2',
      propertyName: 'Downtown Lofts',
      unitNumber: '1205',
      address: '456 Congress Ave, Austin, TX',
      zipCode: '78701',
      currentRent: 2800,
      originalRent: 2800,
      effectiveRent: 2800,
      rentPerSqft: 3.2,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 875,
      floor: 12,
      floorPlan: 'B2',
      daysOnMarket: 3, // Hot market scenario
      firstSeen: '2024-02-17',
      marketVelocity: 'hot',
      concessionValue: 0,
      concessionType: 'none',
      concessionUrgency: 'none',
      rentTrend: 'increasing',
      rentChangePercent: 5.2,
      concessionTrend: 'none',
      marketPosition: 'at_market',
      percentileRank: 60,
      amenityScore: 95,
      locationScore: 95,
      managementScore: 90,
      leaseProbability: 0.9,
      negotiationPotential: 2,
      urgencyScore: 2,
      dataFreshness: '2024-02-20T10:00:00Z',
      confidenceScore: 0.95
    }
  },
  {
    id: 'apt-3',
    apartmentIQData: {
      unitId: 'apt-3',
      propertyName: 'Cedar Park Commons',
      unitNumber: '308B',
      address: '789 Park Rd, Cedar Park, TX',
      zipCode: '78613',
      currentRent: 1650,
      originalRent: 1750,
      effectiveRent: 1550,
      rentPerSqft: 1.8,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 920,
      floor: 3,
      floorPlan: 'C1',
      daysOnMarket: 21, // Motivated landlord scenario
      firstSeen: '2024-01-30',
      marketVelocity: 'slow',
      concessionValue: 875, // Half month free
      concessionType: 'free_rent',
      concessionUrgency: 'aggressive',
      rentTrend: 'stable',
      rentChangePercent: 0.5,
      concessionTrend: 'increasing',
      marketPosition: 'below_market',
      percentileRank: 35,
      amenityScore: 60,
      locationScore: 70,
      managementScore: 75,
      leaseProbability: 0.6,
      negotiationPotential: 7,
      urgencyScore: 6,
      dataFreshness: '2024-02-20T10:00:00Z',
      confidenceScore: 0.85
    }
  },
  {
    id: 'apt-4',
    apartmentIQData: {
      unitId: 'apt-4',
      propertyName: 'The Moderne',
      unitNumber: '715',
      address: '321 South Lamar, Austin, TX',
      zipCode: '78704',
      currentRent: 2450,
      originalRent: 2450,
      effectiveRent: 2450,
      rentPerSqft: 2.9,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 845,
      floor: 7,
      floorPlan: 'Studio Plus',
      daysOnMarket: 12, // Moderate negotiation scenario
      firstSeen: '2024-02-08',
      marketVelocity: 'normal',
      concessionValue: 300, // Admin fee waiver
      concessionType: 'fee_waiver',
      concessionUrgency: 'standard',
  rentTrend: 'stable',
      rentChangePercent: 1.2,
  concessionTrend: 'none',
      marketPosition: 'at_market',
      percentileRank: 55,
      amenityScore: 85,
      locationScore: 88,
      managementScore: 80,
      leaseProbability: 0.7,
      negotiationPotential: 5,
      urgencyScore: 4,
      dataFreshness: '2024-02-20T10:00:00Z',
      confidenceScore: 0.8
    }
  },
  {
    id: 'apt-5',
    apartmentIQData: {
      unitId: 'apt-5',
      propertyName: 'Riverside Plaza',
      unitNumber: '402',
      address: '555 Riverside Dr, Austin, TX',
      zipCode: '78741',
      currentRent: 1850,
      originalRent: 1950,
      effectiveRent: 1600,
      rentPerSqft: 2.1,
      bedrooms: 2,
      bathrooms: 1,
      sqft: 880,
      floor: 4,
      floorPlan: 'B1',
      daysOnMarket: 35, // Another great deal scenario
      firstSeen: '2024-01-16',
      marketVelocity: 'stale',
      concessionValue: 1850, // First month free
      concessionType: 'free_rent',
      concessionUrgency: 'desperate',
      rentTrend: 'decreasing',
      rentChangePercent: -5.1,
      concessionTrend: 'increasing',
      marketPosition: 'above_market',
      percentileRank: 78,
      amenityScore: 55,
      locationScore: 65,
      managementScore: 70,
      leaseProbability: 0.3,
      negotiationPotential: 8,
      urgencyScore: 8,
      dataFreshness: '2024-02-20T10:00:00Z',
      confidenceScore: 0.88
    }
  }
];

const RenterIntelligence = () => {
  return (
    <ModernPageLayout
      title="Renter Intelligence Dashboard"
      subtitle="AI-powered insights to help you find the perfect apartment with negotiation advantages"
      headerContent={
        <div className="flex gap-3">
          <Link to="/demo">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft size={16} />
              Back to Demo
            </Button>
          </Link>
          <Link to="/market-intel">
            <Button className={`${designSystem.buttons.primary} ${designSystem.buttons.small} gap-2`}>
              <BarChart size={16} />
              Market Intel
            </Button>
          </Link>
        </div>
      }
    >
      {/* Intelligence Overview */}
      <div className={`${designSystem.animations.entrance} mb-8`}>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className={`${designSystem.typography.subheadingLarge} mb-2`}>AI Analysis</h3>
            <p className={designSystem.typography.body}>
              Advanced algorithms analyze market conditions and property opportunities
            </p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <h3 className={`${designSystem.typography.subheadingLarge} mb-2`}>Smart Targeting</h3>
            <p className={designSystem.typography.body}>
              Identify properties with the highest negotiation potential and savings
            </p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
              <TrendingDown className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className={`${designSystem.typography.subheadingLarge} mb-2`}>Market Leverage</h3>
            <p className={designSystem.typography.body}>
              Capitalize on market conditions that favor renters and negotiation
            </p>
          </div>
        </div>
      </div>

      {/* Renter Dashboard Component */}
  <div className={`${designSystem.animations.entrance} delay-300`}>
        <RenterDashboard 
          properties={mockApartmentData}
        />
      </div>
    </ModernPageLayout>
  );
};

export default RenterIntelligence;