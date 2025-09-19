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
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 ${className}`}>
      {/* Modern Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Revenue Intelligence Hub
              </h1>
              <p className="text-gray-600 mt-1">
                AI-powered pricing optimization and market analysis
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button variant="outline" size="sm" className="gap-2 relative">
                <Bell className="w-4 h-4" />
                {notifications > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-red-500">
                    {notifications}
                  </Badge>
                )}
              </Button>
              
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
              <div className="flex items-center mt-2 text-sm opacity-90">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+{metrics.monthlyGrowth}% from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Occupancy Rate */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Occupancy Rate</CardTitle>
              <Home className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.occupancyRate}%</div>
              <Progress value={metrics.occupancyRate} className="mt-2 bg-green-400/30" />
            </CardContent>
          </Card>

          {/* Average Rent */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Average Rent</CardTitle>
              <Target className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.averageRent)}</div>
              <div className="flex items-center mt-2 text-sm opacity-90">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+2.1% vs market avg</span>
              </div>
            </CardContent>
          </Card>

          {/* Pending Actions */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Pending Actions</CardTitle>
              <Activity className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.pendingActions}</div>
              <div className="text-sm opacity-90 mt-2">
                {metrics.pendingActions > 10 ? 'High priority' : 'Normal priority'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.portfolioValue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total asset value
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Units Managed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.unitsManaged}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all properties
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeListings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently marketing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2">
              <Brain className="w-4 h-4" />
              AI Pricing
            </TabsTrigger>
            <TabsTrigger value="rent-vs-buy" className="gap-2">
              <Target className="w-4 h-4" />
              Rent vs Buy
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <Activity className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card className="hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start gap-2" variant="outline">
                    <Eye className="w-4 h-4" />
                    Review Pricing Recommendations
                  </Button>
                  <Button className="w-full justify-start gap-2" variant="outline">
                    <Shield className="w-4 h-4" />
                    Check Risk Assessments
                  </Button>
                  <Button className="w-full justify-start gap-2" variant="outline">
                    <Calendar className="w-4 h-4" />
                    Schedule Market Analysis
                  </Button>
                  <Button className="w-full justify-start gap-2" variant="outline">
                    <Users className="w-4 h-4" />
                    Generate Tenant Reports
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="text-sm">
                      <div className="font-medium">Unit 301 - Rent Optimized</div>
                      <div className="text-muted-foreground">Increased from $2,800 to $2,950 • 2 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="text-sm">
                      <div className="font-medium">Market Analysis Complete</div>
                      <div className="text-muted-foreground">Downtown district report ready • 4 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div className="text-sm">
                      <div className="font-medium">Risk Alert - Unit 205</div>
                      <div className="text-muted-foreground">45+ days on market, action needed • 6 hours ago</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Market Insights */}
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  AI Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Market Trend</div>
                    <div className="text-2xl font-bold text-green-600">Bullish</div>
                    <div className="text-sm">
                      Rental demand up 12% this quarter with limited inventory driving price growth
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Optimal Pricing Window</div>
                    <div className="text-2xl font-bold text-blue-600">2-3 Weeks</div>
                    <div className="text-sm">
                      Current market conditions favor slight price increases for quality units
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Competitor Activity</div>
                    <div className="text-2xl font-bold text-orange-600">Moderate</div>
                    <div className="text-sm">
                      3 new listings in target area, average 15 days on market
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Pricing Tab */}
          <TabsContent value="pricing">
            <Card className="hover:shadow-lg transition-all">
              <CardContent className="p-0">
                <EnhancedPricingDashboard 
                  properties={mockProperties}
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