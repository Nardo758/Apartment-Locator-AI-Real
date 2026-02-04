import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  Home, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  Filter,
  Download,
  Settings
} from 'lucide-react';
import { PropertyCard } from '@/components/landlord/PropertyCard';
import { MarketComparisonWidget } from '@/components/landlord/MarketComparisonWidget';

// Mock data - will be replaced with real API calls
const mockProperties = [
  {
    id: '1',
    address: '1234 Main St, Unit 203',
    city: 'Austin',
    state: 'TX',
    currentRent: 2200,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1100,
    marketAvgRent: 2100,
    vacancyRisk: 'high' as const,
    daysVacant: 0,
    lastUpdated: '2 hours ago',
    competitorConcessions: [
      { property: 'Riverside Apartments', type: '2 months free', value: '$4,400 value' },
      { property: 'Downtown Towers', type: '$500 off', value: 'move-in special' }
    ],
    recommendation: 'Drop rent to $2,100/mo OR offer 1 month free ($2,200 ÷ 12 = $183/mo value) to match market'
  },
  {
    id: '2',
    address: '5678 Oak Ave, Apt 12',
    city: 'Austin',
    state: 'TX',
    currentRent: 1800,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 750,
    marketAvgRent: 1950,
    vacancyRisk: 'low' as const,
    daysVacant: 0,
    lastUpdated: '1 day ago',
    competitorConcessions: [],
    recommendation: 'Property priced well below market - consider raising to $1,850/mo on next lease renewal'
  },
  {
    id: '3',
    address: '999 Congress Ave, Suite 4B',
    city: 'Austin',
    state: 'TX',
    currentRent: 3200,
    bedrooms: 3,
    bathrooms: 2.5,
    squareFeet: 1500,
    marketAvgRent: 3150,
    vacancyRisk: 'low' as const,
    daysVacant: 0,
    lastUpdated: '3 hours ago',
    competitorConcessions: [
      { property: 'Luxury Heights', type: 'Waived deposit', value: '$3,200 value' }
    ],
    recommendation: 'Priced at market rate - maintain current pricing'
  },
  {
    id: '4',
    address: '2468 Riverside Dr, #305',
    city: 'Austin',
    state: 'TX',
    currentRent: 2400,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1050,
    marketAvgRent: 2100,
    vacancyRisk: 'high' as const,
    daysVacant: 45,
    lastUpdated: '6 hours ago',
    competitorConcessions: [
      { property: 'River Oaks', type: '1 month free', value: '$2,100 value' },
      { property: 'The Domain', type: '50% off 1st month', value: '$1,200 value' }
    ],
    recommendation: 'URGENT: 45 days vacant + $300/mo overpriced. Drop to $2,100 OR offer 2 months free immediately'
  },
  {
    id: '5',
    address: '7890 South Lamar, Unit 8',
    city: 'Austin',
    state: 'TX',
    currentRent: 1600,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 650,
    marketAvgRent: 1700,
    vacancyRisk: 'medium' as const,
    daysVacant: 0,
    lastUpdated: '5 hours ago',
    competitorConcessions: [
      { property: 'South Park Lofts', type: '$400 off', value: 'first month' }
    ],
    recommendation: 'Slightly underpriced - could raise to $1,650/mo while remaining competitive'
  }
];

const mockMarketData = {
  avgRent: 2100,
  medianRent: 2050,
  minRent: 1200,
  maxRent: 4500,
  totalProperties: 1247,
  rentTrend7d: 0.3,
  rentTrend30d: 1.2,
  avgDaysOnMarket: 52,
  newListings30d: 87
};

export default function PortfolioDashboard() {
  const [properties] = useState(mockProperties);
  const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredProperties = properties.filter(p => 
    filterRisk === 'all' || p.vacancyRisk === filterRisk
  );

  const stats = {
    total: properties.length,
    highRisk: properties.filter(p => p.vacancyRisk === 'high').length,
    mediumRisk: properties.filter(p => p.vacancyRisk === 'medium').length,
    lowRisk: properties.filter(p => p.vacancyRisk === 'low').length,
    totalRevenue: properties.reduce((sum, p) => sum + p.currentRent, 0),
    avgRent: Math.round(properties.reduce((sum, p) => sum + p.currentRent, 0) / properties.length),
    vacant: properties.filter(p => p.daysVacant && p.daysVacant > 0).length
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Portfolio Dashboard
              </h1>
              <p className="text-white/60">
                Monitor and optimize your rental properties
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="lg">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card variant="glass" className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Home className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-xs text-white/60">Properties</div>
                </div>
              </div>
            </Card>

            <Card variant="glass" className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    ${(stats.totalRevenue / 1000).toFixed(1)}k
                  </div>
                  <div className="text-xs text-white/60">Monthly Revenue</div>
                </div>
              </div>
            </Card>

            <Card variant="glass" className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    ${stats.avgRent}
                  </div>
                  <div className="text-xs text-white/60">Avg Rent</div>
                </div>
              </div>
            </Card>

            <Card 
              variant="glass" 
              className={`p-4 cursor-pointer ${filterRisk === 'high' ? 'ring-2 ring-red-500' : ''}`}
              onClick={() => setFilterRisk(filterRisk === 'high' ? 'all' : 'high')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.highRisk}</div>
                  <div className="text-xs text-white/60">High Risk</div>
                </div>
              </div>
            </Card>

            <Card 
              variant="glass" 
              className={`p-4 cursor-pointer ${filterRisk === 'medium' ? 'ring-2 ring-yellow-500' : ''}`}
              onClick={() => setFilterRisk(filterRisk === 'medium' ? 'all' : 'medium')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.mediumRisk}</div>
                  <div className="text-xs text-white/60">Medium Risk</div>
                </div>
              </div>
            </Card>

            <Card 
              variant="glass" 
              className={`p-4 cursor-pointer ${filterRisk === 'low' ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setFilterRisk(filterRisk === 'low' ? 'all' : 'low')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Home className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.lowRisk}</div>
                  <div className="text-xs text-white/60">Healthy</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Properties List - 2 columns */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Your Properties
                {filterRisk !== 'all' && (
                  <Badge variant="primary" size="sm" className="ml-3">
                    {filterRisk.charAt(0).toUpperCase() + filterRisk.slice(1)} risk only
                  </Badge>
                )}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterRisk('all')}
                className={filterRisk === 'all' ? 'opacity-50' : ''}
              >
                <Filter className="w-4 h-4 mr-2" />
                {filterRisk === 'all' ? 'All' : 'Clear Filter'}
              </Button>
            </div>

            <div className="space-y-6">
              {filteredProperties.length === 0 ? (
                <Card variant="glass" className="p-12 text-center">
                  <Home className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white/70 mb-2">
                    No properties found
                  </h3>
                  <p className="text-white/50 mb-4">
                    {filterRisk === 'all' 
                      ? 'Add your first property to get started'
                      : `No properties with ${filterRisk} risk`
                    }
                  </p>
                  {filterRisk !== 'all' && (
                    <Button
                      variant="outline"
                      onClick={() => setFilterRisk('all')}
                    >
                      Show all properties
                    </Button>
                  )}
                </Card>
              ) : (
                filteredProperties.map(property => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onEdit={(id) => console.log('Edit property:', id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Market Intelligence Sidebar - 1 column */}
          <div>
            <h2 className="text-xl font-bold text-white mb-6">
              Market Intelligence
            </h2>
            <div className="space-y-6">
              <MarketComparisonWidget
                city="Austin"
                state="TX"
                bedrooms={2}
                marketData={mockMarketData}
              />

              {/* Quick Actions */}
              <Card variant="elevated" className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Property
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Market Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Manage Alerts
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export Portfolio Data
                  </Button>
                </div>
              </Card>

              {/* Upgrade CTA */}
              <Card variant="highlighted" className="p-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Upgrade to Professional
                  </h3>
                  <p className="text-white/70 text-sm mb-4">
                    Get competitive alerts, renewal optimizer, and manage up to 50 properties
                  </p>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    Upgrade Now - $99/mo
                  </Button>
                  <p className="text-xs text-white/50 mt-3">
                    Currently on Starter ($49/mo)
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
