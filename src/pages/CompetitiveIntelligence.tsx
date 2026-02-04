import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle,
  Filter,
  Search,
  RefreshCw,
  TrendingDown,
  Gift,
  Building,
  MapPin,
  CheckCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { AlertCard, type Alert } from '@/components/landlord/AlertCard';
import { CompetitorActivityFeed } from '@/components/landlord/CompetitorActivityFeed';
import { ImpactAnalysis } from '@/components/landlord/ImpactAnalysis';

// Mock alert data
const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'price_drop',
    severity: 'critical',
    title: 'Major Price Drop at Competing Property',
    description: 'Riverside Apartments dropped rent by $200/month for 2BR units',
    competitorProperty: 'Riverside Apartments',
    competitorAddress: '456 River Road',
    zipCode: '78704',
    impact: {
      affectedProperties: 8,
      revenueRisk: 1600,
      message: '8 of your properties are now overpriced. You could lose 3 tenants this month.'
    },
    details: {
      oldValue: 2200,
      newValue: 2000
    },
    recommendation: 'Drop rent to $2,050/month or add "1 month free" concession to remain competitive',
    timestamp: '2 hours ago',
    read: false
  },
  {
    id: '2',
    type: 'concession_added',
    severity: 'high',
    title: 'Competitor Added Major Concession',
    description: 'Park Place Residences now offering 2 months free rent on 1BR units',
    competitorProperty: 'Park Place Residences',
    competitorAddress: '123 Park Avenue',
    zipCode: '78704',
    impact: {
      affectedProperties: 5,
      revenueRisk: 950,
      message: '5 properties in same area. Expected 20% increase in vacancy if no action taken.'
    },
    details: {
      concessionType: '2 Months Free Rent',
      concessionValue: 'On 12+ month leases'
    },
    recommendation: 'Consider matching with "1 month free" or reduce rent by $100/month',
    timestamp: '5 hours ago',
    read: false
  },
  {
    id: '3',
    type: 'price_drop',
    severity: 'critical',
    title: 'Aggressive Pricing by New Competitor',
    description: 'Newly renovated complex undercuts market by 15%',
    competitorProperty: 'Austin Modern Lofts',
    competitorAddress: '789 South Congress',
    zipCode: '78704',
    impact: {
      affectedProperties: 12,
      revenueRisk: 2400,
      message: '12 properties now overpriced by $150-200. High risk of tenant loss.'
    },
    details: {
      oldValue: 2500,
      newValue: 2100
    },
    recommendation: 'Urgent: Drop rent to $2,200 or offer premium upgrades to justify pricing',
    timestamp: '1 day ago',
    read: true
  },
  {
    id: '4',
    type: 'concession_added',
    severity: 'medium',
    title: 'Limited Time Concession Announced',
    description: 'Downtown Heights offering waived application fees + $500 move-in credit',
    competitorProperty: 'Downtown Heights',
    competitorAddress: '321 Congress Ave',
    zipCode: '78701',
    impact: {
      affectedProperties: 3,
      revenueRisk: 450,
      message: '3 downtown properties affected. Moderate impact expected.'
    },
    details: {
      concessionType: 'Move-in Special',
      concessionValue: '$500 credit + No application fee'
    },
    recommendation: 'Monitor closely. Consider similar move-in incentives if inquiries drop.',
    timestamp: '1 day ago',
    read: true
  },
  {
    id: '5',
    type: 'price_drop',
    severity: 'high',
    title: 'Competitor Vacancy Push',
    description: 'Sunset Towers reduced rents across all unit types',
    competitorProperty: 'Sunset Towers',
    competitorAddress: '555 Sunset Blvd',
    zipCode: '78705',
    impact: {
      affectedProperties: 6,
      revenueRisk: 1200,
      message: '6 properties in West Campus area. Likely experiencing high vacancy.'
    },
    details: {
      oldValue: 1900,
      newValue: 1750
    },
    recommendation: 'Match pricing at $1,800/month to stay competitive in this submarket',
    timestamp: '2 days ago',
    read: true
  },
  {
    id: '6',
    type: 'concession_added',
    severity: 'high',
    title: 'Pet Policy Concession',
    description: 'Competitor waiving all pet fees and deposits',
    competitorProperty: 'Pet-Friendly Estates',
    competitorAddress: '888 Animal Way',
    zipCode: '78702',
    impact: {
      affectedProperties: 4,
      revenueRisk: 600,
      message: '4 properties competing for pet owners. Could lose pet-owning tenants.'
    },
    details: {
      concessionType: 'Pet Fee Waiver',
      concessionValue: 'No deposit, no monthly pet rent'
    },
    recommendation: 'Consider reducing pet deposit to $200 and monthly pet rent to $25',
    timestamp: '3 days ago',
    read: true
  },
  {
    id: '7',
    type: 'price_drop',
    severity: 'medium',
    title: 'Seasonal Pricing Adjustment',
    description: 'Multiple properties reducing rates for slower leasing season',
    competitorProperty: 'Cedar Park Commons',
    competitorAddress: '999 Cedar Park Dr',
    zipCode: '78613',
    impact: {
      affectedProperties: 7,
      revenueRisk: 875,
      message: '7 suburban properties. Normal seasonal adjustment pattern.'
    },
    details: {
      oldValue: 1700,
      newValue: 1575
    },
    recommendation: 'Consider modest $50-75 reduction for winter season',
    timestamp: '4 days ago',
    read: true
  },
  {
    id: '8',
    type: 'concession_added',
    severity: 'low',
    title: 'Loyalty Program Introduced',
    description: 'Competitor offering renewal bonuses for existing tenants',
    competitorProperty: 'Loyalty Residences',
    competitorAddress: '777 Faithful Lane',
    zipCode: '78704',
    impact: {
      affectedProperties: 2,
      revenueRisk: 200,
      message: '2 properties. May impact tenant retention rates.'
    },
    details: {
      concessionType: 'Renewal Bonus',
      concessionValue: '$500 rent credit on 12+ month renewal'
    },
    recommendation: 'Consider implementing similar tenant retention program',
    timestamp: '5 days ago',
    read: true
  },
  {
    id: '9',
    type: 'competitor_vacancy',
    severity: 'low',
    title: 'Competitor High Vacancy Reported',
    description: 'Industry report shows 25% vacancy at major complex',
    competitorProperty: 'Struggling Towers',
    competitorAddress: '111 Hard Times St',
    zipCode: '78748',
    impact: {
      affectedProperties: 3,
      revenueRisk: 0,
      message: '3 nearby properties. This is an opportunity - competitors are weak.'
    },
    details: {},
    recommendation: 'Opportunity: Maintain pricing. Target their unsatisfied tenants with marketing.',
    timestamp: '6 days ago',
    read: true
  },
  {
    id: '10',
    type: 'price_drop',
    severity: 'low',
    title: 'Minor Price Adjustment',
    description: 'Small reduction on limited unit types',
    competitorProperty: 'Bargain Apartments',
    competitorAddress: '222 Budget Blvd',
    zipCode: '78719',
    impact: {
      affectedProperties: 2,
      revenueRisk: 150,
      message: '2 properties. Minimal impact expected.'
    },
    details: {
      oldValue: 1400,
      newValue: 1350
    },
    recommendation: 'Monitor only. No immediate action required.',
    timestamp: '1 week ago',
    read: true
  }
];

const CompetitiveIntelligence: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [zipFilter, setZipFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('alerts');

  // Get unique zip codes
  const zipCodes = useMemo(() => {
    const codes = new Set(alerts.map(a => a.zipCode));
    return Array.from(codes).sort();
  }, [alerts]);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          alert.title.toLowerCase().includes(query) ||
          alert.description.toLowerCase().includes(query) ||
          alert.competitorProperty.toLowerCase().includes(query) ||
          alert.zipCode.includes(query);
        if (!matchesSearch) return false;
      }

      // Severity filter
      if (severityFilter !== 'all' && alert.severity !== severityFilter) {
        return false;
      }

      // Zip code filter
      if (zipFilter !== 'all' && alert.zipCode !== zipFilter) {
        return false;
      }

      return true;
    });
  }, [alerts, searchQuery, severityFilter, zipFilter]);

  const unreadCount = alerts.filter(a => !a.read).length;
  const criticalCount = filteredAlerts.filter(a => a.severity === 'critical').length;
  const highCount = filteredAlerts.filter(a => a.severity === 'high').length;

  const handleDismiss = (alertId: string) => {
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  const handleTakeAction = (alertId: string) => {
    // In a real app, this would open an action modal or navigate to property management
    console.log('Taking action on alert:', alertId);
    alert('Action modal would open here');
  };

  const handleMarkAllRead = () => {
    setAlerts(alerts.map(a => ({ ...a, read: true })));
  };

  const handleRefresh = () => {
    // In a real app, this would fetch new data
    alert('Refreshing competitor data...');
  };

  return (
    <div className="min-h-screen bg-[#0f0035]">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Competitive Intelligence
                </h1>
                <p className="text-white/70 text-lg">
                  Real-time alerts on competitor pricing, concessions, and market moves
                </p>
              </div>
            </div>

            <Button
              onClick={handleRefresh}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4">
            <Card variant="elevated" className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{unreadCount}</div>
                  <div className="text-sm text-white/60">Unread Alerts</div>
                </div>
              </div>
            </Card>

            <Card variant="elevated" className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{criticalCount}</div>
                  <div className="text-sm text-white/60">Critical</div>
                </div>
              </div>
            </Card>

            <Card variant="elevated" className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/50 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{highCount}</div>
                  <div className="text-sm text-white/60">High Priority</div>
                </div>
              </div>
            </Card>

            <Card variant="elevated" className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{filteredAlerts.length}</div>
                  <div className="text-sm text-white/60">Total Alerts</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card variant="elevated" className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                placeholder="Search alerts, properties, or zip codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical Only</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={zipFilter} onValueChange={setZipFilter}>
              <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ZIP Codes</SelectItem>
                {zipCodes.map(zip => (
                  <SelectItem key={zip} value={zip}>ZIP {zip}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                onClick={handleMarkAllRead}
                className="text-white/60 hover:text-white"
              >
                Mark All Read
              </Button>
            )}
          </div>

          {(searchQuery || severityFilter !== 'all' || zipFilter !== 'all') && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
              <span className="text-sm text-white/60">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{searchQuery}"
                </Badge>
              )}
              {severityFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Severity: {severityFilter}
                </Badge>
              )}
              {zipFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  ZIP: {zipFilter}
                </Badge>
              )}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSeverityFilter('all');
                  setZipFilter('all');
                }}
                className="text-xs text-blue-400 hover:text-blue-300 ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="alerts">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Active Alerts ({filteredAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <Building className="w-4 h-4 mr-2" />
              Activity Timeline
            </TabsTrigger>
            <TabsTrigger value="impact">
              <TrendingDown className="w-4 h-4 mr-2" />
              Impact Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts">
            {filteredAlerts.length === 0 ? (
              <Card variant="elevated" className="p-12">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">No Alerts Found</h3>
                  <p className="text-white/60">
                    {searchQuery || severityFilter !== 'all' || zipFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'All your properties are competitively priced!'}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAlerts.map(alert => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onDismiss={handleDismiss}
                    onTakeAction={handleTakeAction}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline">
            <CompetitorActivityFeed alerts={filteredAlerts} maxItems={20} />
          </TabsContent>

          <TabsContent value="impact">
            <ImpactAnalysis alerts={filteredAlerts} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CompetitiveIntelligence;
