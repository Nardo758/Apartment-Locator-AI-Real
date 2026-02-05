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
    status: 'occupied' as const,
    vacancyRisk: 'high' as const,
    daysVacant: 0,
    tenant: 'John Smith',
    leaseEndDate: '2026-06-30',
    lastUpdated: '2 hours ago',
    competitorConcessions: [
      { property: 'Riverside Apartments', type: '2 months free', value: '$4,400 value' },
      { property: 'Downtown Towers', type: '$500 off', value: 'move-in special' }
    ],
    recommendation: 'Drop rent to $2,100/mo OR offer 1 month free ($2,200 / 12 = $183/mo value) to match market'
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
    status: 'occupied' as const,
    vacancyRisk: 'low' as const,
    daysVacant: 0,
    tenant: 'Sarah Johnson',
    leaseEndDate: '2026-09-15',
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
    status: 'occupied' as const,
    vacancyRisk: 'low' as const,
    daysVacant: 0,
    tenant: 'Mike Chen',
    leaseEndDate: '2026-12-01',
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
    status: 'vacant' as const,
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
    status: 'occupied' as const,
    vacancyRisk: 'medium' as const,
    daysVacant: 0,
    tenant: 'Lisa Williams',
    leaseEndDate: '2026-04-30',
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Portfolio Dashboard
              </h1>
              <p className="text-gray-600">
                Monitor and optimize your rental properties
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="lg" className="border-gray-300">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="lg" className="border-gray-300">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="p-4 border border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Home className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-xs text-gray-500">Properties</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 border border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${(stats.totalRevenue / 1000).toFixed(1)}k
                  </div>
                  <div className="text-xs text-gray-500">Monthly Revenue</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 border border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${stats.avgRent}
                  </div>
                  <div className="text-xs text-gray-500">Avg Rent</div>
                </div>
              </div>
            </Card>

            <Card 
              className={`p-4 cursor-pointer border border-gray-200 bg-white hover:shadow-md transition-shadow ${filterRisk === 'high' ? 'ring-2 ring-red-500' : ''}`}
              onClick={() => setFilterRisk(filterRisk === 'high' ? 'all' : 'high')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.highRisk}</div>
                  <div className="text-xs text-gray-500">High Risk</div>
                </div>
              </div>
            </Card>

            <Card 
              className={`p-4 cursor-pointer border border-gray-200 bg-white hover:shadow-md transition-shadow ${filterRisk === 'medium' ? 'ring-2 ring-yellow-500' : ''}`}
              onClick={() => setFilterRisk(filterRisk === 'medium' ? 'all' : 'medium')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.mediumRisk}</div>
                  <div className="text-xs text-gray-500">Medium Risk</div>
                </div>
              </div>
            </Card>

            <Card 
              className={`p-4 cursor-pointer border border-gray-200 bg-white hover:shadow-md transition-shadow ${filterRisk === 'low' ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setFilterRisk(filterRisk === 'low' ? 'all' : 'low')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Home className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.lowRisk}</div>
                  <div className="text-xs text-gray-500">Healthy</div>
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
              <h2 className="text-xl font-bold text-gray-900">
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
                <Card className="p-12 text-center border border-gray-200 bg-white">
                  <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No properties found
                  </h3>
                  <p className="text-gray-500 mb-4">
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
            <h2 className="text-xl font-bold text-gray-900 mb-6">
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
              <Card className="p-6 border border-gray-200 bg-white">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start border-gray-300">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Property
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-300">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Market Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-300">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Manage Alerts
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-300">
                    <Download className="w-4 h-4 mr-2" />
                    Export Portfolio Data
                  </Button>
                </div>
              </Card>

              {/* Upgrade CTA */}
              <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Upgrade to Professional
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Get competitive alerts, renewal optimizer, and manage up to 50 properties
                  </p>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    Upgrade Now - $99/mo
                  </Button>
                  <p className="text-xs text-gray-500 mt-3">
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
