import React from 'react';
import { AdvancedPricingDashboard } from '@/components/pricing/AdvancedPricingDashboard';
import { PricingRecommendationCard } from '@/components/pricing/PricingRecommendationCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePricingIntelligence } from '@/hooks/usePricingIntelligence';
import type { ApartmentIQData } from '@/lib/pricing-engine';

// Sample data to demonstrate the advanced pricing capabilities
const mockProperties = [
  {
    id: 'unit-001',
    apartmentIQData: {
      unitId: '001',
      propertyName: 'Sunset Apartments',
      unitNumber: '2B',
      address: '123 Main St, Austin, TX',
      zipCode: '78701',
      currentRent: 2800,
      originalRent: 2900,
      effectiveRent: 2650,
      rentPerSqft: 3.2,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 875,
      floor: 3,
      floorPlan: 'B2',
      daysOnMarket: 45,
      firstSeen: '2024-08-01',
      marketVelocity: 'slow' as const,
      concessionValue: 150,
      concessionType: 'First month free',
      concessionUrgency: 'aggressive' as const,
      rentTrend: 'decreasing' as const,
      rentChangePercent: -3.5,
      concessionTrend: 'increasing' as const,
      marketPosition: 'above_market' as const,
      percentileRank: 75,
      amenityScore: 85,
      locationScore: 90,
      managementScore: 70,
      leaseProbability: 0.25,
      negotiationPotential: 8,
      urgencyScore: 9,
      dataFreshness: '2024-09-19',
      confidenceScore: 0.85
    } as ApartmentIQData
  },
  {
    id: 'unit-002',
    apartmentIQData: {
      unitId: '002',
      propertyName: 'Sunset Apartments',
      unitNumber: '1A',
      address: '123 Main St, Austin, TX',
      zipCode: '78701',
      currentRent: 2200,
      originalRent: 2200,
      effectiveRent: 2200,
      rentPerSqft: 3.1,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 710,
      floor: 1,
      floorPlan: 'A1',
      daysOnMarket: 8,
      firstSeen: '2024-09-11',
      marketVelocity: 'hot' as const,
      concessionValue: 0,
      concessionType: 'none',
      concessionUrgency: 'none' as const,
      rentTrend: 'increasing' as const,
      rentChangePercent: 2.1,
      concessionTrend: 'none' as const,
      marketPosition: 'below_market' as const,
      percentileRank: 35,
      amenityScore: 85,
      locationScore: 90,
      managementScore: 70,
      leaseProbability: 0.85,
      negotiationPotential: 3,
      urgencyScore: 2,
      dataFreshness: '2024-09-19',
      confidenceScore: 0.92
    } as ApartmentIQData
  },
  {
    id: 'unit-003',
    apartmentIQData: {
      unitId: '003',
      propertyName: 'Urban Heights',
      unitNumber: '3C',
      address: '456 Oak Ave, Austin, TX',
      zipCode: '78702',
      currentRent: 3200,
      originalRent: 3200,
      effectiveRent: 3200,
      rentPerSqft: 2.9,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1100,
      floor: 5,
      floorPlan: 'C3',
      daysOnMarket: 22,
      firstSeen: '2024-08-28',
      marketVelocity: 'normal' as const,
      concessionValue: 0,
      concessionType: 'none',
      concessionUrgency: 'standard' as const,
      rentTrend: 'stable' as const,
      rentChangePercent: 0.5,
      concessionTrend: 'none' as const,
      marketPosition: 'at_market' as const,
      percentileRank: 50,
      amenityScore: 75,
      locationScore: 80,
      managementScore: 85,
      leaseProbability: 0.45,
      negotiationPotential: 5,
      urgencyScore: 6,
      dataFreshness: '2024-09-19',
      confidenceScore: 0.78
    } as ApartmentIQData
  },
  {
    id: 'unit-004',
    apartmentIQData: {
      unitId: '004',
      propertyName: 'Downtown Lofts',
      unitNumber: 'L12',
      address: '789 Congress Ave, Austin, TX',
      zipCode: '78701',
      currentRent: 4500,
      originalRent: 4500,
      effectiveRent: 4200,
      rentPerSqft: 3.8,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      floor: 12,
      floorPlan: 'Loft',
      daysOnMarket: 65,
      firstSeen: '2024-07-15',
      marketVelocity: 'stale' as const,
      concessionValue: 300,
      concessionType: 'Two months free',
      concessionUrgency: 'desperate' as const,
      rentTrend: 'decreasing' as const,
      rentChangePercent: -6.7,
      concessionTrend: 'increasing' as const,
      marketPosition: 'above_market' as const,
      percentileRank: 85,
      amenityScore: 95,
      locationScore: 95,
      managementScore: 80,
      leaseProbability: 0.15,
      negotiationPotential: 9,
      urgencyScore: 10,
      dataFreshness: '2024-09-19',
      confidenceScore: 0.88
    } as ApartmentIQData
  },
  {
    id: 'unit-005',
    apartmentIQData: {
      unitId: '005',
      propertyName: 'Garden View',
      unitNumber: 'G4',
      address: '321 Garden St, Austin, TX',
      zipCode: '78703',
      currentRent: 1800,
      originalRent: 1800,
      effectiveRent: 1800,
      rentPerSqft: 2.4,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 750,
      floor: 1,
      floorPlan: 'Garden',
      daysOnMarket: 3,
      firstSeen: '2024-09-16',
      marketVelocity: 'hot' as const,
      concessionValue: 0,
      concessionType: 'none',
      concessionUrgency: 'none' as const,
      rentTrend: 'increasing' as const,
      rentChangePercent: 4.2,
      concessionTrend: 'none' as const,
      marketPosition: 'below_market' as const,
      percentileRank: 25,
      amenityScore: 60,
      locationScore: 85,
      managementScore: 75,
      leaseProbability: 0.95,
      negotiationPotential: 2,
      urgencyScore: 1,
      dataFreshness: '2024-09-19',
      confidenceScore: 0.91
    } as ApartmentIQData
  }
];

export const AdvancedPricingDemo: React.FC = () => {
  const { recommendations, loading } = usePricingIntelligence(mockProperties);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Advanced Pricing Intelligence
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI-powered pricing recommendations with specific dollar amounts, confidence scores, 
            urgency levels, and comprehensive revenue impact analysis
          </p>
          <div className="flex justify-center space-x-4">
            <Badge variant="outline" className="text-sm">
              Market Velocity Adjustments
            </Badge>
            <Badge variant="outline" className="text-sm">
              Progressive DOM Penalties
            </Badge>
            <Badge variant="outline" className="text-sm">
              Smart Lease Timelines
            </Badge>
            <Badge variant="outline" className="text-sm">
              Revenue Impact Analysis
            </Badge>
          </div>
        </div>

        {/* Key Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle>New Pricing Capabilities</CardTitle>
            <CardDescription>
              Your algorithm now tells users exactly what to charge, when to act, and what financial impact to expect
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-green-700">Market Velocity Adjustments</h3>
                <p className="text-sm text-gray-600">
                  Hot markets get 5% premium, stale markets get 8% discount
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-orange-700">Days-on-Market Penalties</h3>
                <p className="text-sm text-gray-600">
                  Progressive penalties from 2% at week 2 up to 20% after 2 months
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-700">Lease Probability Integration</h3>
                <p className="text-sm text-gray-600">
                  Units with &lt;30% probability get 5% reduction
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-purple-700">Smart Timeline Estimates</h3>
                <p className="text-sm text-gray-600">
                  Predicts 40% faster leasing with 5%+ rent cuts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Dashboard */}
        <AdvancedPricingDashboard properties={mockProperties} />

        {/* Individual Recommendation Cards */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Individual Unit Recommendations
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.values(recommendations).slice(0, 4).map((recommendation) => (
              <PricingRecommendationCard
                key={recommendation.unitId}
                recommendation={recommendation}
                unitName={`${mockProperties.find(p => p.apartmentIQData?.unitId === recommendation.unitId)?.apartmentIQData?.propertyName} - Unit ${recommendation.unitId}`}
              />
            ))}
          </div>
        </div>

        {/* Strategy Classification Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Strategy Classification System</CardTitle>
            <CardDescription>
              Automatic categorization of pricing strategies based on market conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">Aggressive Reduction</h3>
                <p className="text-sm text-red-700 mb-2">10%+ cuts</p>
                <p className="text-xs text-red-600">
                  For units 30+ days on market in challenging conditions
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-800 mb-2">Moderate Reduction</h3>
                <p className="text-sm text-orange-700 mb-2">3-10% cuts</p>
                <p className="text-xs text-orange-600">
                  For units with moderate market pressure
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Hold</h3>
                <p className="text-sm text-gray-700 mb-2">Minimal changes</p>
                <p className="text-xs text-gray-600">
                  For well-positioned units in stable markets
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Increase</h3>
                <p className="text-sm text-green-700 mb-2">3%+ increases</p>
                <p className="text-xs text-green-600">
                  For below-market units in hot markets
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Urgency Levels */}
        <Card>
          <CardHeader>
            <CardTitle>Urgency Level System</CardTitle>
            <CardDescription>
              Time-sensitive recommendations based on market conditions and days on market
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">Immediate</h3>
                <p className="text-sm text-red-700 mb-2">30+ days on market</p>
                <p className="text-xs text-red-600">
                  Requires action within 7 days to prevent further losses
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-800 mb-2">Soon</h3>
                <p className="text-sm text-orange-700 mb-2">14+ days on market</p>
                <p className="text-xs text-orange-600">
                  Should act within 2 weeks to optimize performance
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Moderate</h3>
                <p className="text-sm text-yellow-700 mb-2">7+ days on market</p>
                <p className="text-xs text-yellow-600">
                  Monitor closely, consider action within 30 days
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Low</h3>
                <p className="text-sm text-green-700 mb-2">&lt;7 days on market</p>
                <p className="text-xs text-green-600">
                  No immediate action needed, continue monitoring
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedPricingDemo;