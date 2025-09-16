import React from 'react';
import { ArrowLeft, Home, Target, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RenterDashboard } from '@/components/renter/RenterDashboard';

// Mock apartment data with various scenarios for demonstration
const mockApartmentData = [
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
      concessionTrend: 'stable',
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link to="/demo">
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-green-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Demo
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-white text-green-600 hover:bg-gray-100">
                Get Full Access
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Home className="w-8 h-8" />
              <h1 className="text-3xl font-bold">RenterIQ Intelligence</h1>
            </div>
            <p className="text-xl text-green-100 mb-2">
              Flip the Script. Use Landlord Intelligence to Find Great Deals.
            </p>
            <p className="text-green-200">
              Real-time market analysis to help you negotiate better rent and find desperate landlords
            </p>
          </div>
        </div>
      </header>

      {/* Key Features Banner */}
      <div className="border-b bg-muted/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              <span className="font-medium">Identify Desperate Landlords</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <TrendingDown className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Calculate Negotiation Leverage</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Home className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Time Your Application</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Austin Market Intelligence</h2>
          <p className="text-muted-foreground">
            Live market data showing which landlords are desperate and ready to negotiate. 
            Green deals = major leverage, Red deals = move fast.
          </p>
        </div>
        
        <RenterDashboard properties={mockApartmentData} />
      </main>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <h3 className="text-xl font-bold mb-2">Ready to Beat the Market?</h3>
          <p className="text-green-100 mb-4">
            Get access to live data on 10,000+ units across Texas and negotiate like a pro
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              Start Finding Deals
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RenterIntelligence;