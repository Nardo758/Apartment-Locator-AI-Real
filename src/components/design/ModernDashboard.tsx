import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Home, 
  MapPin, 
  Clock,
  Target,
  BarChart3,
  Brain,
  Zap,
  Shield,
  Eye,
  Calendar,
  Users,
  Activity,
  ArrowRight,
  Bell,
  Settings,
  Filter,
  RefreshCw
} from 'lucide-react';
import { EnhancedPricingDashboard } from '@/components/EnhancedPricingDashboard';
import { RentVsBuyAnalysis } from '@/components/RentVsBuyAnalysis';
import { designSystem, createCard, createHeading, createStatusBadge } from '@/lib/design-system';

interface ModernDashboardProps {
  className?: string;
  userRole?: 'owner' | 'manager' | 'analyst';
}

interface DashboardMetrics {
  totalRevenue: number;
  occupancyRate: number;
  averageRent: number;
  portfolioValue: number;
  monthlyGrowth: number;
  unitsManaged: number;
  activeListings: number;
  pendingActions: number;
}

export const ModernDashboard: React.FC<ModernDashboardProps> = ({ 
  className = "",
  userRole = 'manager'
}) => {
  const [activeView, setActiveView] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(3);
  
  // Mock data - in production, this would come from API
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 2450000,
    occupancyRate: 94.5,
    averageRent: 2850,
    portfolioValue: 45000000,
    monthlyGrowth: 3.2,
    unitsManaged: 156,
    activeListings: 8,
    pendingActions: 12
  });

  const mockProperties = [
    {
      id: 'unit-001',
      apartmentIQData: {
        unitId: 'unit-001',
        propertyName: 'Sunset Plaza',
        currentRent: 3200,
        daysOnMarket: 35,
        marketVelocity: 'slow' as const,
        concessionUrgency: 'aggressive' as const,
        amenityScore: 85,
        locationScore: 92,
        confidenceScore: 0.87
      },
      price: 3200,
      daysOnMarket: 35,
      marketVelocity: 'slow' as const,
      concessionUrgency: 'aggressive' as const
    },
    {
      id: 'unit-002',
      apartmentIQData: {
        unitId: 'unit-002',
        propertyName: 'Marina Heights',
        currentRent: 2800,
        daysOnMarket: 12,
        marketVelocity: 'normal' as const,
        concessionUrgency: 'standard' as const,
        amenityScore: 78,
        locationScore: 88,
        confidenceScore: 0.92
      },
      price: 2800,
      daysOnMarket: 12,
      marketVelocity: 'normal' as const,
      concessionUrgency: 'standard' as const
    }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const getMetricChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0,
      isNegative: change < 0
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`${designSystem.backgrounds.page} ${className}`}>
      {/* Enhanced Header */}
      <div className={`sticky top-0 z-50 ${createCard('default', false)} border-b ${designSystem.colors.border} backdrop-blur-lg`}>
        <div className={`${designSystem.layouts.container} ${designSystem.spacing.paddingMedium}`}>
          <div className={`${designSystem.layouts.flexBetween} ${designSystem.spacing.gapMedium} flex-col lg:flex-row`}>
            <div className={designSystem.layouts.stackSmall}>
              <h1 className={`${designSystem.typography.heading1} ${designSystem.colors.text}`}>
                Revenue Intelligence Hub
              </h1>
              <p className={`${designSystem.typography.bodyMuted}`}>
                AI-powered pricing optimization and market analysis
              </p>
            </div>
            
            <div className={`${designSystem.layouts.flex} ${designSystem.spacing.gapSmall}`}>
              <Button variant="outline" size="sm" className={`${designSystem.buttons.outline} ${designSystem.spacing.gapSmall}`}>
                <Filter className={designSystem.icons.small} />
                Filters
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={refreshing}
                className={`${designSystem.buttons.outline} ${designSystem.spacing.gapSmall}`}
              >
                <RefreshCw className={`${designSystem.icons.small} ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button variant="outline" size="sm" className={`${designSystem.buttons.outline} ${designSystem.spacing.gapSmall} relative`}>
                <Bell className={designSystem.icons.small} />
                {notifications > 0 && (
                  <Badge className={`absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center ${createStatusBadge('error')}`}>
                    {notifications}
                  </Badge>
                )}
              </Button>
              
              <Button variant="outline" size="sm" className={designSystem.buttons.outline}>
                <Settings className={designSystem.icons.small} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className={`${designSystem.layouts.container} ${designSystem.spacing.content}`}>
        {/* Enhanced Key Metrics Cards */}
        <div className={`${designSystem.layouts.gridFour} ${designSystem.spacing.gapMedium}`}>
          {/* Total Revenue */}
          <div className={`bg-gradient-to-br from-blue-600 to-blue-700 text-white ${designSystem.radius.large} ${designSystem.shadows.large} ${designSystem.animations.hoverCard} ${designSystem.spacing.cardPadding}`}>
            <div className={`${designSystem.layouts.flexBetween} ${designSystem.spacing.itemsSmall}`}>
              <div className={designSystem.layouts.stackSmall}>
                <p className={`${designSystem.typography.labelSmall} text-blue-100`}>Total Revenue</p>
                <div className={`${designSystem.typography.heading2} text-white font-bold`}>
                  {formatCurrency(metrics.totalRevenue)}
                </div>
                <div className={`${designSystem.layouts.flex} ${designSystem.spacing.gapSmall} items-center text-blue-100`}>
                  <TrendingUp className={designSystem.icons.small} />
                  <span className={designSystem.typography.captionSmall}>+{metrics.monthlyGrowth}% from last month</span>
                </div>
              </div>
              <DollarSign className={`${designSystem.icons.large} text-blue-200`} />
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className={`bg-gradient-to-br from-green-600 to-green-700 text-white ${designSystem.radius.large} ${designSystem.shadows.large} ${designSystem.animations.hoverCard} ${designSystem.spacing.cardPadding}`}>
            <div className={`${designSystem.layouts.flexBetween} ${designSystem.spacing.itemsSmall}`}>
              <div className={designSystem.layouts.stackSmall}>
                <p className={`${designSystem.typography.labelSmall} text-green-100`}>Occupancy Rate</p>
                <div className={`${designSystem.typography.heading2} text-white font-bold`}>
                  {metrics.occupancyRate}%
                </div>
                <Progress value={metrics.occupancyRate} className="mt-2 bg-green-400/30" />
              </div>
              <Home className={`${designSystem.icons.large} text-green-200`} />
            </div>
          </div>

          {/* Average Rent */}
          <div className={`bg-gradient-to-br from-indigo-600 to-indigo-700 text-white ${designSystem.radius.large} ${designSystem.shadows.large} ${designSystem.animations.hoverCard} ${designSystem.spacing.cardPadding}`}>
            <div className={`${designSystem.layouts.flexBetween} ${designSystem.spacing.itemsSmall}`}>
              <div className={designSystem.layouts.stackSmall}>
                <p className={`${designSystem.typography.labelSmall} text-indigo-100`}>Average Rent</p>
                <div className={`${designSystem.typography.heading2} text-white font-bold`}>
                  {formatCurrency(metrics.averageRent)}
                </div>
                <div className={`${designSystem.layouts.flex} ${designSystem.spacing.gapSmall} items-center text-indigo-100`}>
                  <TrendingUp className={designSystem.icons.small} />
                  <span className={designSystem.typography.captionSmall}>+2.1% vs market avg</span>
                </div>
              </div>
              <Target className={`${designSystem.icons.large} text-indigo-200`} />
            </div>
          </div>

          {/* Pending Actions */}
          <div className={`bg-gradient-to-br from-amber-600 to-amber-700 text-white ${designSystem.radius.large} ${designSystem.shadows.large} ${designSystem.animations.hoverCard} ${designSystem.spacing.cardPadding}`}>
            <div className={`${designSystem.layouts.flexBetween} ${designSystem.spacing.itemsSmall}`}>
              <div className={designSystem.layouts.stackSmall}>
                <p className={`${designSystem.typography.labelSmall} text-amber-100`}>Pending Actions</p>
                <div className={`${designSystem.typography.heading2} text-white font-bold`}>
                  {metrics.pendingActions}
                </div>
                <div className={`${designSystem.typography.captionSmall} text-amber-100 mt-2`}>
                  {metrics.pendingActions > 10 ? 'High priority' : 'Normal priority'}
                </div>
              </div>
              <Activity className={`${designSystem.icons.large} text-amber-200`} />
            </div>
          </div>
        </div>

        {/* Enhanced Secondary Metrics */}
        <div className={`${designSystem.layouts.gridThree} ${designSystem.spacing.gapMedium}`}>
          <div className={`${createCard('default', true)} ${designSystem.spacing.cardPadding}`}>
            <div className={`${designSystem.layouts.flexBetween} ${designSystem.spacing.itemsSmall}`}>
              <div className={designSystem.layouts.stackSmall}>
                <p className={`${designSystem.typography.label} ${designSystem.colors.textMuted}`}>Portfolio Value</p>
                <div className={`${designSystem.typography.heading3} ${designSystem.colors.text}`}>
                  {formatCurrency(metrics.portfolioValue)}
                </div>
                <p className={`${designSystem.typography.captionSmall} ${designSystem.colors.textLight}`}>
                  Total asset value
                </p>
              </div>
              <BarChart3 className={`${designSystem.icons.medium} ${designSystem.colors.textSubtle}`} />
            </div>
          </div>

          <div className={`${createCard('default', true)} ${designSystem.spacing.cardPadding}`}>
            <div className={`${designSystem.layouts.flexBetween} ${designSystem.spacing.itemsSmall}`}>
              <div className={designSystem.layouts.stackSmall}>
                <p className={`${designSystem.typography.label} ${designSystem.colors.textMuted}`}>Units Managed</p>
                <div className={`${designSystem.typography.heading3} ${designSystem.colors.text}`}>
                  {metrics.unitsManaged}
                </div>
                <p className={`${designSystem.typography.captionSmall} ${designSystem.colors.textLight}`}>
                  Across all properties
                </p>
              </div>
              <Users className={`${designSystem.icons.medium} ${designSystem.colors.textSubtle}`} />
            </div>
          </div>

          <div className={`${createCard('default', true)} ${designSystem.spacing.cardPadding}`}>
            <div className={`${designSystem.layouts.flexBetween} ${designSystem.spacing.itemsSmall}`}>
              <div className={designSystem.layouts.stackSmall}>
                <p className={`${designSystem.typography.label} ${designSystem.colors.textMuted}`}>Active Listings</p>
                <div className={`${designSystem.typography.heading3} ${designSystem.colors.text}`}>
                  {metrics.activeListings}
                </div>
                <p className={`${designSystem.typography.captionSmall} ${designSystem.colors.textLight}`}>
                  Currently marketing
                </p>
              </div>
              <MapPin className={`${designSystem.icons.medium} ${designSystem.colors.textSubtle}`} />
            </div>
          </div>
        </div>

        {/* Enhanced Main Content Tabs */}
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList className={`grid w-full grid-cols-2 lg:grid-cols-4 ${designSystem.spacing.marginMedium} ${designSystem.backgrounds.card} ${designSystem.radius.large}`}>
            <TabsTrigger value="overview" className={`${designSystem.spacing.gapSmall} ${designSystem.typography.label}`}>
              <BarChart3 className={designSystem.icons.small} />
              Overview
            </TabsTrigger>
            <TabsTrigger value="pricing" className={`${designSystem.spacing.gapSmall} ${designSystem.typography.label}`}>
              <Brain className={designSystem.icons.small} />
              AI Pricing
            </TabsTrigger>
            <TabsTrigger value="rent-vs-buy" className={`${designSystem.spacing.gapSmall} ${designSystem.typography.label}`}>
              <Target className={designSystem.icons.small} />
              Rent vs Buy
            </TabsTrigger>
            <TabsTrigger value="analytics" className={`${designSystem.spacing.gapSmall} ${designSystem.typography.label}`}>
              <Activity className={designSystem.icons.small} />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Overview Tab */}
          <TabsContent value="overview" className={designSystem.spacing.content}>
            <div className={`${designSystem.layouts.gridTwo} ${designSystem.spacing.gapLarge}`}>
              {/* Enhanced Quick Actions */}
              <div className={`${createCard('primary', true)} ${designSystem.spacing.cardPadding}`}>
                <div className={`${designSystem.layouts.stackSmall} ${designSystem.spacing.marginSmall}`}>
                  <div className={`${designSystem.layouts.flex} ${designSystem.spacing.gapSmall} items-center`}>
                    <Zap className={`${designSystem.icons.medium} ${designSystem.colors.warning}`} />
                    <h3 className={`${designSystem.typography.heading5} ${designSystem.colors.text}`}>Quick Actions</h3>
                  </div>
                </div>
                <div className={designSystem.spacing.content}>
                  <Button className={`w-full justify-start ${designSystem.spacing.gapSmall} ${designSystem.buttons.outline}`} variant="outline">
                    <Eye className={designSystem.icons.small} />
                    Review Pricing Recommendations
                  </Button>
                  <Button className={`w-full justify-start ${designSystem.spacing.gapSmall} ${designSystem.buttons.outline}`} variant="outline">
                    <Shield className={designSystem.icons.small} />
                    Check Risk Assessments
                  </Button>
                  <Button className={`w-full justify-start ${designSystem.spacing.gapSmall} ${designSystem.buttons.outline}`} variant="outline">
                    <Calendar className={designSystem.icons.small} />
                    Schedule Market Analysis
                  </Button>
                  <Button className={`w-full justify-start ${designSystem.spacing.gapSmall} ${designSystem.buttons.outline}`} variant="outline">
                    <Users className={designSystem.icons.small} />
                    Generate Tenant Reports
                  </Button>
                </div>
              </div>

              {/* Enhanced Recent Activity */}
              <div className={`${createCard('default', true)} ${designSystem.spacing.cardPadding}`}>
                <div className={`${designSystem.layouts.stackSmall} ${designSystem.spacing.marginSmall}`}>
                  <div className={`${designSystem.layouts.flex} ${designSystem.spacing.gapSmall} items-center`}>
                    <Activity className={`${designSystem.icons.medium} ${designSystem.colors.info}`} />
                    <h3 className={`${designSystem.typography.heading5} ${designSystem.colors.text}`}>Recent Activity</h3>
                  </div>
                </div>
                <div className={designSystem.spacing.content}>
                  <div className={`${designSystem.layouts.flex} ${designSystem.spacing.gapSmall} items-start`}>
                    <div className={`w-2 h-2 ${designSystem.colors.success} rounded-full mt-2 flex-shrink-0`}></div>
                    <div className={designSystem.layouts.stackTight}>
                      <div className={`${designSystem.typography.bodySmall} ${designSystem.colors.text} font-medium`}>
                        Unit 301 - Rent Optimized
                      </div>
                      <div className={`${designSystem.typography.captionSmall} ${designSystem.colors.textLight}`}>
                        Increased from $2,800 to $2,950 • 2 hours ago
                      </div>
                    </div>
                  </div>
                  <div className={`${designSystem.layouts.flex} ${designSystem.spacing.gapSmall} items-start`}>
                    <div className={`w-2 h-2 ${designSystem.colors.info} rounded-full mt-2 flex-shrink-0`}></div>
                    <div className={designSystem.layouts.stackTight}>
                      <div className={`${designSystem.typography.bodySmall} ${designSystem.colors.text} font-medium`}>
                        Market Analysis Complete
                      </div>
                      <div className={`${designSystem.typography.captionSmall} ${designSystem.colors.textLight}`}>
                        Downtown district report ready • 4 hours ago
                      </div>
                    </div>
                  </div>
                  <div className={`${designSystem.layouts.flex} ${designSystem.spacing.gapSmall} items-start`}>
                    <div className={`w-2 h-2 ${designSystem.colors.warning} rounded-full mt-2 flex-shrink-0`}></div>
                    <div className={designSystem.layouts.stackTight}>
                      <div className={`${designSystem.typography.bodySmall} ${designSystem.colors.text} font-medium`}>
                        Risk Alert - Unit 205
                      </div>
                      <div className={`${designSystem.typography.captionSmall} ${designSystem.colors.textLight}`}>
                        45+ days on market, action needed • 6 hours ago
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Market Insights */}
            <div className={`${createCard('secondary', true)} ${designSystem.spacing.cardPaddingLarge}`}>
              <div className={`${designSystem.layouts.stackSmall} ${designSystem.spacing.marginMedium}`}>
                <div className={`${designSystem.layouts.flex} ${designSystem.spacing.gapSmall} items-center`}>
                  <Brain className={`${designSystem.icons.medium} ${designSystem.colors.secondary}`} />
                  <h3 className={`${designSystem.typography.heading4} ${designSystem.colors.text}`}>AI Market Insights</h3>
                </div>
              </div>
              <div className={`${designSystem.layouts.gridThree} ${designSystem.spacing.gapLarge}`}>
                <div className={designSystem.layouts.stackSmall}>
                  <div className={`${designSystem.typography.labelMuted} ${designSystem.colors.textLight}`}>Market Trend</div>
                  <div className={`${designSystem.typography.heading3} ${designSystem.colors.success}`}>Bullish</div>
                  <div className={`${designSystem.typography.bodySmall} ${designSystem.colors.textMuted}`}>
                    Rental demand up 12% this quarter with limited inventory driving price growth
                  </div>
                </div>
                <div className={designSystem.layouts.stackSmall}>
                  <div className={`${designSystem.typography.labelMuted} ${designSystem.colors.textLight}`}>Optimal Pricing Window</div>
                  <div className={`${designSystem.typography.heading3} ${designSystem.colors.info}`}>2-3 Weeks</div>
                  <div className={`${designSystem.typography.bodySmall} ${designSystem.colors.textMuted}`}>
                    Current market conditions favor slight price increases for quality units
                  </div>
                </div>
                <div className={designSystem.layouts.stackSmall}>
                  <div className={`${designSystem.typography.labelMuted} ${designSystem.colors.textLight}`}>Competitor Activity</div>
                  <div className={`${designSystem.typography.heading3} ${designSystem.colors.warning}`}>Moderate</div>
                  <div className={`${designSystem.typography.bodySmall} ${designSystem.colors.textMuted}`}>
                    3 new listings in target area, average 15 days on market
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* AI Pricing Tab */}
          <TabsContent value="pricing">
            <Card className="hover:shadow-lg transition-all">
              <CardContent className="p-0">
                <EnhancedPricingDashboard 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  properties={mockProperties as any}
                  enableMLFeatures={true}
                  enableAutomation={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rent vs Buy Tab */}
          <TabsContent value="rent-vs-buy">
            <Card className="hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <RentVsBuyAnalysis 
                  propertyValue={450000}
                  currentRent={2800}
                  location="San Francisco, CA"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Average Days to Lease</span>
                        <span className="font-medium">18 days</span>
                      </div>
                      <Progress value={75} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">25% better than market average</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Renewal Rate</span>
                        <span className="font-medium">87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">Above industry benchmark</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Price Optimization Success</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">AI recommendations accepted</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">This Month</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-green-600">+$24,500</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last Quarter</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-green-600">+$67,200</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Year to Date</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-green-600">+$184,300</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="text-sm text-muted-foreground">
                        AI optimization has increased portfolio revenue by{' '}
                        <span className="font-medium text-green-600">7.8%</span> this year
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle>Market Intelligence Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">156</div>
                    <div className="text-sm text-blue-700">Units Analyzed</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">$2.4M</div>
                    <div className="text-sm text-green-700">Revenue Optimized</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">94%</div>
                    <div className="text-sm text-purple-700">AI Accuracy Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};