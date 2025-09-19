import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, TrendingUp, TrendingDown, DollarSign, Clock, Target, 
  BarChart3, Brain, Shield, Settings, Bell, Zap, Eye, Users, Globe,
  ChevronRight, ArrowUpRight, ArrowDownRight, Activity, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Modern gradient backgrounds
const gradientClasses = {
  revenue: "bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600",
  ml: "bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600",
  risk: "bg-gradient-to-br from-rose-500 via-pink-500 to-red-600",
  automation: "bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-600",
  competitor: "bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600"
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Modern metric card component
const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  icon: Icon, 
  gradient,
  onClick 
}: {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: any;
  gradient: string;
  onClick?: () => void;
}) => (
  <motion.div
    variants={itemVariants}
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
          <p className="text-3xl font-bold mt-2">{value}</p>
          <p className="text-white/70 text-xs mt-1">{subtitle}</p>
        </div>
        <div className="flex flex-col items-end">
          <Icon className="h-8 w-8 text-white/80" />
          {trend && trendValue && (
            <div className={`flex items-center mt-2 px-2 py-1 rounded-full text-xs font-medium ${
              trend === 'up' ? 'bg-white/20 text-white' :
              trend === 'down' ? 'bg-white/20 text-white' :
              'bg-white/10 text-white/80'
            }`}>
              {trend === 'up' && <ArrowUpRight className="h-3 w-3 mr-1" />}
              {trend === 'down' && <ArrowDownRight className="h-3 w-3 mr-1" />}
              {trendValue}
            </div>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10">
        <Icon className="w-full h-full" />
      </div>
    </div>
  </motion.div>
);

// Modern alert component
const SmartAlert = ({ 
  type, 
  title, 
  message, 
  priority,
  timestamp,
  onAction 
}: {
  type: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  onAction?: () => void;
}) => {
  const priorityStyles = {
    high: "border-l-red-500 bg-red-50 text-red-900",
    medium: "border-l-orange-500 bg-orange-50 text-orange-900",
    low: "border-l-blue-500 bg-blue-50 text-blue-900"
  };

  const priorityIcons = {
    high: AlertTriangle,
    medium: Clock,
    low: Bell
  };

  const Icon = priorityIcons[priority];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`border-l-4 rounded-r-lg p-4 ${priorityStyles[priority]} shadow-sm`}
    >
      <div className="flex items-start space-x-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-sm opacity-90 mt-1">{message}</p>
          <p className="text-xs opacity-70 mt-2">{new Date(timestamp).toLocaleString()}</p>
        </div>
        {onAction && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onAction}
            className="flex-shrink-0"
          >
            Action
          </Button>
        )}
      </div>
    </motion.div>
  );
};

// Modern competitor card
const CompetitorCard = ({ competitor, isTopCompetitor = false }: { competitor: any, isTopCompetitor?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
      isTopCompetitor 
        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200' 
        : 'bg-white border border-gray-200'
    }`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <h4 className="font-semibold text-gray-900">{competitor.propertyName}</h4>
          {isTopCompetitor && (
            <Badge className="bg-blue-100 text-blue-800 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Top Match
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {competitor.bedrooms}BR/{competitor.bathrooms}BA • {competitor.sqft} sqft
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {competitor.distanceFromTarget} miles • {competitor.similarityScore * 100}% match
        </p>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold text-gray-900">${competitor.currentRent.toLocaleString()}</p>
        <p className="text-sm text-gray-600">{competitor.daysOnMarket} days</p>
        {competitor.rentChangePercent && (
          <Badge className={`mt-1 ${
            competitor.rentChangePercent > 0 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {competitor.rentChangePercent > 0 ? '+' : ''}{competitor.rentChangePercent}%
          </Badge>
        )}
      </div>
    </div>
    {competitor.concessions.length > 0 && (
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-600 mb-1">Concessions:</p>
        <div className="flex flex-wrap gap-1">
          {competitor.concessions.map((concession: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {concession}
            </Badge>
          ))}
        </div>
      </div>
    )}
  </motion.div>
);

// Modern pricing recommendation card
const ModernPricingCard = ({ recommendation, unitName }: { recommendation: any, unitName: string }) => {
  const getStrategyColor = () => {
    switch (recommendation.strategy) {
      case 'aggressive_reduction': return 'from-red-500 to-rose-600';
      case 'moderate_reduction': return 'from-orange-500 to-amber-600';
      case 'hold': return 'from-gray-500 to-slate-600';
      case 'increase': return 'from-green-500 to-emerald-600';
      default: return 'from-blue-500 to-indigo-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${getStrategyColor()} p-6 text-white`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">{unitName}</h3>
            <p className="text-white/80 text-sm mt-1">
              {recommendation.strategy.replace('_', ' ').charAt(0).toUpperCase() + 
               recommendation.strategy.replace('_', ' ').slice(1)} Strategy
            </p>
          </div>
          <Badge className="bg-white/20 text-white border-white/30">
            {Math.round(recommendation.confidenceScore * 100)}% confidence
          </Badge>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-white/70 text-sm">Current Rent</p>
            <p className="text-2xl font-bold">${recommendation.currentRent.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white/70 text-sm">Recommended</p>
            <p className="text-2xl font-bold">${recommendation.suggestedRent.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {recommendation.adjustmentPercent > 0 ? '+' : ''}{recommendation.adjustmentPercent}%
            </p>
            <p className="text-xs text-gray-600">Price Change</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{recommendation.expectedLeaseDays}</p>
            <p className="text-xs text-gray-600">Days to Lease</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              ${Math.abs(recommendation.revenueImpact.netBenefit).toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">Net Benefit</p>
          </div>
        </div>

        {/* Progress indicators */}
        {recommendation.leaseTimeline && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Lease Probability Timeline</p>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(recommendation.leaseTimeline.probabilityByWeek).map(([period, prob]: [string, any]) => (
                <div key={period} className="text-center">
                  <div className="text-xs text-gray-600 mb-1">
                    {period.replace('week', 'Wk ')}
                  </div>
                  <Progress value={prob * 100} className="h-2" />
                  <div className="text-xs font-medium text-gray-800 mt-1">
                    {Math.round(prob * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reasoning */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-700 mb-1">AI Reasoning</p>
          <p className="text-sm text-gray-600">{recommendation.reasoning.join(' • ')}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Main dashboard component with modern design
export const ModernPricingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  const mockMetrics = {
    totalImpact: 127500,
    mlAccuracy: 84.7,
    riskScore: 45,
    automationRate: 92,
    activeAlerts: 3
  };

  const mockAlerts = [
    {
      type: 'urgent_action',
      title: 'Unit 001 Requires Immediate Action',
      message: '45 days on market - recommend 8% price reduction',
      priority: 'high' as const,
      timestamp: new Date().toISOString()
    },
    {
      type: 'competitor_alert',
      title: 'Competitor Price Drop Detected',
      message: 'Riverside Commons reduced rent by 5% - monitor impact',
      priority: 'medium' as const,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ];

  const mockCompetitors = [
    {
      id: 'comp-001',
      propertyName: 'Riverside Commons',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 900,
      currentRent: 2650,
      rentChangePercent: -3.6,
      daysOnMarket: 28,
      concessions: ['First month free'],
      distanceFromTarget: 0.3,
      similarityScore: 0.92
    },
    {
      id: 'comp-002',
      propertyName: 'Urban Oaks',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 850,
      currentRent: 2850,
      daysOnMarket: 12,
      concessions: [],
      distanceFromTarget: 0.5,
      similarityScore: 0.88
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse mb-4 mx-auto" />
          <p className="text-lg font-semibold text-gray-700">Initializing AI Pricing Intelligence...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Modern header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Pricing Intelligence
              </h1>
              <p className="text-gray-600 mt-1">Complete revenue optimization platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <Activity className="h-3 w-3 mr-1" />
                All Systems Active
              </Badge>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Modern metrics grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          <MetricCard
            title="Revenue Impact"
            value={`$${mockMetrics.totalImpact.toLocaleString()}`}
            subtitle="Annual optimization gain"
            trend="up"
            trendValue="+8.5%"
            icon={DollarSign}
            gradient={gradientClasses.revenue}
            onClick={() => setActiveTab('revenue')}
          />
          <MetricCard
            title="ML Accuracy"
            value={`${mockMetrics.mlAccuracy}%`}
            subtitle="Model performance"
            trend="up"
            trendValue="+2.3%"
            icon={Brain}
            gradient={gradientClasses.ml}
            onClick={() => setActiveTab('ml')}
          />
          <MetricCard
            title="Risk Score"
            value={mockMetrics.riskScore}
            subtitle="Portfolio risk level"
            trend="down"
            trendValue="-5pts"
            icon={Shield}
            gradient={gradientClasses.risk}
            onClick={() => setActiveTab('risk')}
          />
          <MetricCard
            title="Automation"
            value={`${mockMetrics.automationRate}%`}
            subtitle="Success rate"
            trend="up"
            trendValue="+3%"
            icon={Zap}
            gradient={gradientClasses.automation}
            onClick={() => setActiveTab('automation')}
          />
          <MetricCard
            title="Active Alerts"
            value={mockMetrics.activeAlerts}
            subtitle="Requiring attention"
            icon={Bell}
            gradient="bg-gradient-to-br from-slate-500 via-gray-500 to-zinc-600"
            onClick={() => setActiveTab('alerts')}
          />
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
                <Sparkles className="h-5 w-5 mr-2" />
                AI Insights Dashboard
              </CardTitle>
              <CardDescription className="text-blue-700">
                Real-time intelligence from all system components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-900">🎯 Strategic Opportunities</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <p className="text-sm text-blue-800">3 units ready for price increases</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <p className="text-sm text-blue-800">Seasonal adjustment window opens next week</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-900">⚡ Automation Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <p className="text-sm text-blue-800">15 pricing adjustments today</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <p className="text-sm text-blue-800">2 pending approvals</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-900">🔍 Market Intelligence</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <p className="text-sm text-blue-800">Competitor price drop detected</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <p className="text-sm text-blue-800">Market velocity: Normal</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modern tabbed interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white">Overview</TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-white">
              <Bell className="h-4 w-4 mr-1" />
              Alerts ({mockAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="competitors" className="data-[state=active]:bg-white">
              <Eye className="h-4 w-4 mr-1" />
              Competitors
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-white">
              <Target className="h-4 w-4 mr-1" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white">
              <BarChart3 className="h-4 w-4 mr-1" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {mockAlerts.map((alert, index) => (
                <SmartAlert
                  key={index}
                  {...alert}
                  onAction={() => console.log('Action taken for alert:', alert.title)}
                />
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="competitors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-blue-500" />
                  Live Competitor Intelligence
                </CardTitle>
                <CardDescription>
                  Real-time competitive monitoring with AI-powered insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCompetitors.map((competitor, index) => (
                    <CompetitorCard
                      key={competitor.id}
                      competitor={competitor}
                      isTopCompetitor={index === 0}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-white to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-500" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <Brain className="h-4 w-4 mr-2 text-purple-500" />
                        ML Engine
                      </span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-2 text-blue-500" />
                        Competitor Monitoring
                      </span>
                      <Badge className="bg-green-100 text-green-800">Live</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                        Automated Pricing
                      </span>
                      <Badge className="bg-green-100 text-green-800">Running</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-red-500" />
                        Risk Management
                      </span>
                      <Badge className="bg-green-100 text-green-800">Monitoring</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm">Phase 1 & 2 implementation completed</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-sm">ML model trained on 500+ outcomes</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                      <span className="text-sm">Real-time competitor monitoring active</span>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ModernPricingDashboard;