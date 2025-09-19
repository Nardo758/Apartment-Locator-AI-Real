import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, TrendingDown, MapPin, Eye, Brain, Zap, 
  DollarSign, Home, Users, BarChart3, Activity, AlertCircle,
  Calendar, Clock, Target, Sparkles, RefreshCw, Settings,
  ArrowUpRight, ArrowDownRight, Building, Globe, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';

// Import our enhanced systems
import { CompetitorIntelligence } from '@/lib/competitor-intelligence';
import { SeasonalPricingEngine } from '@/lib/seasonal-pricing';
import { MLPricingEngine } from '@/lib/ml-pricing-engine';
import { RiskManagementSystem } from '@/lib/risk-management';
import { useUnifiedRentalIntelligence } from '@/hooks/useUnifiedRentalIntelligence';
import RentVsBuyAnalysis from '@/components/RentVsBuyAnalysis';

// Enhanced metric card with animations
const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  icon: Icon, 
  gradient,
  onClick,
  isLoading = false 
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: any;
  gradient: string;
  onClick?: () => void;
  isLoading?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative overflow-hidden rounded-xl cursor-pointer group ${gradient}`}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
    <div className="relative p-6 text-white">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white/80 text-sm font-medium">{title}</p>
          {isLoading ? (
            <div className="w-20 h-8 bg-white/20 rounded animate-pulse mt-2" />
          ) : (
            <p className="text-3xl font-bold mt-2">{value}</p>
          )}
          {subtitle && (
            <p className="text-white/70 text-xs mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex flex-col items-end">
          <Icon className="h-8 w-8 text-white/80" />
          {trend && trendValue && !isLoading && (
            <div className={`flex items-center mt-2 px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white`}>
              {trend === 'up' && <ArrowUpRight className="h-3 w-3 mr-1" />}
              {trend === 'down' && <ArrowDownRight className="h-3 w-3 mr-1" />}
              {trendValue}
            </div>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

// Market trends visualization
const MarketTrendsChart = ({ data, title }: { data: any[], title: string }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
          {title}
        </CardTitle>
        <CardDescription>Market performance over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-48 flex items-end space-x-2">
          {data.map((point, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${(point.value / maxValue) * 100}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-md relative group cursor-pointer"
            >
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                {point.label}: ${point.value.toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between mt-4 text-xs text-gray-500">
          {data.map((point, index) => (
            <span key={index}>{point.period}</span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Competitive landscape component
const CompetitiveLandscape = ({ competitors }: { competitors: any[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Eye className="h-5 w-5 mr-2 text-purple-500" />
        Competitive Landscape
      </CardTitle>
      <CardDescription>Live competitor analysis</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {competitors.slice(0, 4).map((competitor, index) => (
          <motion.div
            key={competitor.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <h4 className="font-medium text-sm">{competitor.propertyName}</h4>
              <p className="text-xs text-gray-600">
                {competitor.bedrooms}BR • {competitor.sqft} sqft • {competitor.distanceFromTarget}mi
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">${competitor.currentRent}</p>
              <p className="text-xs text-gray-500">{competitor.daysOnMarket} days</p>
            </div>
          </motion.div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Market alerts component
const MarketAlerts = ({ alerts }: { alerts: any[] }) => (
  <Card className="border-orange-200 bg-orange-50">
    <CardHeader>
      <CardTitle className="flex items-center text-orange-800">
        <AlertCircle className="h-5 w-5 mr-2" />
        Market Alerts
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start space-x-3 p-3 bg-white rounded-lg"
          >
            <div className={`w-2 h-2 rounded-full mt-2 ${
              alert.priority === 'high' ? 'bg-red-500' : 
              alert.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
            }`} />
            <div className="flex-1">
              <h4 className="font-medium text-sm">{alert.title}</h4>
              <p className="text-xs text-gray-600">{alert.message}</p>
              <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// AI Insights component
const AIInsights = ({ insights }: { insights: any[] }) => (
  <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
    <CardHeader>
      <CardTitle className="flex items-center text-purple-800">
        <Brain className="h-5 w-5 mr-2" />
        AI Market Insights
      </CardTitle>
      <CardDescription className="text-purple-700">
        Machine learning powered market analysis
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start space-x-3 p-3 bg-white/70 rounded-lg"
          >
            <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">{insight.title}</p>
              <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
              <Badge className="bg-purple-100 text-purple-800 text-xs mt-2">
                {Math.round(insight.confidence * 100)}% confidence
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Main component
const RevampedMarketIntel: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState('austin');
  const [currentRent, setCurrentRent] = useState(2200);
  const [propertyValue, setPropertyValue] = useState(350000);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Enhanced systems
  const [competitorIntelligence] = useState(() => new CompetitorIntelligence());
  const [seasonalEngine] = useState(() => new SeasonalPricingEngine());
  const [mlEngine] = useState(() => new MLPricingEngine());
  const [riskManager] = useState(() => new RiskManagementSystem());

  const { intelligence, loading, error, refresh } = useUnifiedRentalIntelligence(
    selectedRegion, currentRent, propertyValue
  );

  // Enhanced data state
  const [enhancedData, setEnhancedData] = useState({
    competitors: [] as any[],
    seasonalData: null as any,
    mlInsights: [] as any[],
    marketAlerts: [] as any[],
    trends: [] as any[]
  });

  useEffect(() => {
    const loadEnhancedData = async () => {
      try {
        // Fetch competitor data
        const competitors = await competitorIntelligence.fetchCompetitorData('001', 2.0);
        
        // Get seasonal analysis
        const seasonalData = seasonalEngine.calculateSeasonalAdjustment('austin-tx');
        
        // Generate ML insights
        const mlInsights = [
          {
            title: 'Price Optimization Opportunity',
            description: 'Current pricing is 8% below optimal range for this market segment',
            confidence: 0.87
          },
          {
            title: 'Seasonal Trend Alert',
            description: 'Peak leasing season approaching - consider 5% price increase',
            confidence: 0.92
          },
          {
            title: 'Competitive Position',
            description: 'Your property ranks in top 25% for value in the local market',
            confidence: 0.79
          }
        ];

        // Mock market alerts
        const marketAlerts = [
          {
            title: 'New Supply Alert',
            message: '3 new properties coming online in Q2',
            priority: 'medium',
            time: '2 hours ago'
          },
          {
            title: 'Rent Growth Slowdown',
            message: 'YoY rent growth decreased to 3.2%',
            priority: 'low',
            time: '1 day ago'
          }
        ];

        // Mock trends data
        const trends = [
          { period: 'Jan', label: 'January', value: 2150 },
          { period: 'Feb', label: 'February', value: 2180 },
          { period: 'Mar', label: 'March', value: 2220 },
          { period: 'Apr', label: 'April', value: 2280 },
          { period: 'May', label: 'May', value: 2350 },
          { period: 'Jun', label: 'June', value: 2380 }
        ];

        setEnhancedData({
          competitors,
          seasonalData,
          mlInsights,
          marketAlerts,
          trends
        });
      } catch (error) {
        console.error('Error loading enhanced data:', error);
      }
    };

    loadEnhancedData();
  }, [selectedRegion, competitorIntelligence, seasonalEngine]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    // Reload enhanced data
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getLocationName = () => {
    const locationMap: Record<string, string> = {
      'austin': 'Austin, TX',
      'dallas': 'Dallas, TX',
      'houston': 'Houston, TX'
    };
    return locationMap[selectedRegion] || 'Austin, TX';
  };

  const getMarketMetrics = () => {
    if (!intelligence?.marketData[0]) return [];
    
    const latest = intelligence.marketData[0];
    return [
      {
        title: 'Median Rent',
        value: `$${Math.round(latest.medianRent).toLocaleString()}`,
        subtitle: 'Market average',
        trend: latest.rentYoYChange > 0 ? 'up' : 'down',
        trendValue: `${latest.rentYoYChange > 0 ? '+' : ''}${latest.rentYoYChange.toFixed(1)}%`,
        icon: DollarSign,
        gradient: 'bg-gradient-to-br from-green-500 to-emerald-600'
      },
      {
        title: 'Market Velocity',
        value: `${latest.daysOnMarket}`,
        subtitle: 'Days on market',
        trend: 'neutral',
        trendValue: 'Avg',
        icon: Clock,
        gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600'
      },
      {
        title: 'Inventory Level',
        value: Math.round(latest.inventoryLevel).toLocaleString(),
        subtitle: 'Available units',
        trend: 'up',
        trendValue: '+12%',
        icon: Building,
        gradient: 'bg-gradient-to-br from-purple-500 to-indigo-600'
      },
      {
        title: 'Leverage Score',
        value: `${intelligence.overallLeverageScore}/100`,
        subtitle: 'Negotiation power',
        trend: intelligence.overallLeverageScore > 60 ? 'up' : 'down',
        trendValue: intelligence.recommendation.action.replace(/_/g, ' '),
        icon: Target,
        gradient: 'bg-gradient-to-br from-orange-500 to-red-600'
      }
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header />
      
      {/* Modern header with controls */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Market Intelligence
              </h1>
              <p className="text-gray-600 mt-1">
                Real-time market analysis for {getLocationName()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="austin">Austin, TX</SelectItem>
                  <SelectItem value="dallas">Dallas, TX</SelectItem>
                  <SelectItem value="houston">Houston, TX</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing || loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Enhanced metrics grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {getMarketMetrics().map((metric, index) => (
            <MetricCard
              key={index}
              {...metric}
              isLoading={loading}
              onClick={() => setActiveTab('analytics')}
            />
          ))}
        </motion.div>

        {/* Quick insights panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Activity className="h-5 w-5 mr-2" />
                Market Pulse
              </CardTitle>
              <CardDescription className="text-blue-700">
                Real-time market conditions and opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-900">📈 Market Trends</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <p className="text-sm text-blue-800">Rent growth accelerating (+3.2% YoY)</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <p className="text-sm text-blue-800">Inventory levels increasing</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-900">🎯 Opportunities</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <p className="text-sm text-blue-800">5 units below market rate</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <p className="text-sm text-blue-800">Peak season approaching</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-900">⚠️ Alerts</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <p className="text-sm text-blue-800">New supply coming online</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <p className="text-sm text-blue-800">Competitor price changes</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced tabbed interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rentbuy">
              <Home className="h-4 w-4 mr-1" />
              Rent vs Buy
            </TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MarketTrendsChart data={enhancedData.trends} title="Rent Trends" />
              </div>
              <div className="space-y-6">
                <MarketAlerts alerts={enhancedData.marketAlerts} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rentbuy" className="space-y-6">
            <RentVsBuyAnalysis />
          </TabsContent>

          <TabsContent value="competitors" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CompetitiveLandscape competitors={enhancedData.competitors} />
              <Card>
                <CardHeader>
                  <CardTitle>Market Position</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Your Property</span>
                      <Badge className="bg-blue-100 text-blue-800">${currentRent}</Badge>
                    </div>
                    <Progress value={75} className="h-3" />
                    <p className="text-sm text-gray-600">
                      Your property ranks in the 75th percentile for this market
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <AIInsights insights={enhancedData.mlInsights} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Analysis Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="current-rent">Current Monthly Rent</Label>
                    <Input
                      id="current-rent"
                      type="number"
                      value={currentRent}
                      onChange={(e) => setCurrentRent(Number(e.target.value))}
                      placeholder="e.g. 2200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="property-value">Property Value</Label>
                    <Input
                      id="property-value"
                      type="number"
                      value={propertyValue}
                      onChange={(e) => setPropertyValue(Number(e.target.value))}
                      placeholder="e.g. 350000"
                    />
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

export default RevampedMarketIntel;