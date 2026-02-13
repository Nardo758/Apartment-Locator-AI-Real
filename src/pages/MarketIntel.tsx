import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Home,
  DollarSign,
  Calculator,
  BarChart3,
  Brain,
  Settings,
  MapPin,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  RefreshCw,
  Building,
  PieChart,
  LineChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Shield,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { useUnifiedRentalIntelligence } from '@/hooks/useUnifiedRentalIntelligence';
import { RentVsBuyAnalyzer, type RentVsBuyResult } from '@/lib/rent-vs-buy-analysis';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart as RechartsPie, Pie, Cell } from 'recharts';

const MarketIntel: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState('austin');
  const [currentRent, setCurrentRent] = useState(2200);
  const [propertyValue, setPropertyValue] = useState(450000);
  const [downPaymentPercent, setDownPaymentPercent] = useState([20]);
  const [timeHorizon, setTimeHorizon] = useState([5]);
  const [annualIncome, setAnnualIncome] = useState(102000);
  const [currentSavings, setCurrentSavings] = useState(120000);
  const [activeTab, setActiveTab] = useState('overview');
  const [rentVsBuyResult, setRentVsBuyResult] = useState<RentVsBuyResult | null>(null);

  const { intelligence, loading, error, refresh } = useUnifiedRentalIntelligence(
    selectedRegion, currentRent, propertyValue
  );

  // Calculate rent vs buy analysis
  const locationMap: Record<string, string> = {
    'austin': 'Austin, TX',
    'dallas': 'Dallas, TX',
    'houston': 'Houston, TX'
  };

  const locationName = locationMap[selectedRegion] || 'Austin, TX';

  useEffect(() => {
    const analyzer = RentVsBuyAnalyzer.getInstance();
    
    const renterProfile = {
      income: annualIncome,
      creditScore: 750, // Default good credit
      currentRent,
      savings: currentSavings,
      monthlyDebt: 0, // Default no debt
      employmentStability: 'stable' as const,
      timeHorizon: timeHorizon[0],
      locationFlexibility: 'medium' as const,
      riskTolerance: 'moderate' as const
    };
    
    const propertyScenario = {
      propertyValue,
      currentRent,
      location: locationName,
      propertyTax: propertyValue * 0.018, // 1.8%
      hoaFees: 150,
      maintenanceCosts: propertyValue * 0.01, // 1%
      appreciationRate: 0.032, // 3.2%
      rentGrowthRate: 0.045, // 4.5%
      downPaymentOptions: [downPaymentPercent[0]]
    };
    
    const marketConditions = {
      mortgageRate: 0.072, // 7.2%
      inflationRate: 0.03, // 3%
      localMarketTrend: 'normal' as const,
      inventoryLevels: 2.5,
      priceToRentRatio: propertyValue / (currentRent * 12),
      economicOutlook: 'stable' as const,
      seasonality: 0
    };
    
    const result = analyzer.analyzeRentVsBuy(renterProfile, propertyScenario, marketConditions);
    setRentVsBuyResult(result);
  }, [currentRent, propertyValue, downPaymentPercent, timeHorizon, annualIncome, currentSavings, locationName, selectedRegion]);

  // helper kept for external usage within this module
  const getLocationName = () => locationName;

  const getMarketMetrics = () => {
    if (!intelligence?.marketData[0]) return [];
    
    const latest = intelligence.marketData[0];
    return [
      {
        title: 'Median Rent',
        value: `$${Math.round(latest.medianRent).toLocaleString()}`,
        change: latest.rentYoYChange,
        icon: Home,
        color: latest.rentYoYChange > 5 ? 'text-red-500' : latest.rentYoYChange > 0 ? 'text-yellow-500' : 'text-green-500'
      },
      {
        title: 'Market Inventory',
        value: Math.round(latest.inventoryLevel).toLocaleString(),
        change: latest.daysOnMarket,
        icon: Building,
        color: latest.daysOnMarket > 30 ? 'text-green-500' : latest.daysOnMarket > 15 ? 'text-yellow-500' : 'text-red-500'
      },
      {
        title: 'Price-to-Rent Ratio',
        value: Math.round(propertyValue / (currentRent * 12)),
        change: propertyValue / (currentRent * 12) > 20 ? 'High' : propertyValue / (currentRent * 12) > 15 ? 'Moderate' : 'Low',
        icon: Calculator,
        color: propertyValue / (currentRent * 12) > 20 ? 'text-red-500' : 'text-green-500'
      },
      {
        title: 'Leverage Score',
        value: `${intelligence.overallLeverageScore}/100`,
        change: intelligence.recommendation.action.replace(/_/g, ' '),
        icon: Target,
        color: intelligence.overallLeverageScore > 70 ? 'text-green-500' : intelligence.overallLeverageScore > 40 ? 'text-yellow-500' : 'text-red-500'
      }
    ];
  };

  const getRentVsBuyRecommendation = () => {
    if (!rentVsBuyResult) return null;
    
    return {
      decision: rentVsBuyResult.recommendation,
      confidence: rentVsBuyResult.confidence,
      reasoning: rentVsBuyResult.personalizedInsights[0] || 'Analysis completed',
      totalCostDifference: Math.abs(rentVsBuyResult.summary.totalCostRent - rentVsBuyResult.summary.totalCostBuy),
      breakEvenYears: rentVsBuyResult.breakEvenPoint,
      monthlyDifference: rentVsBuyResult.summary.monthlyDifference
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header Section */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Market Intelligence Hub
              </h1>
              <p className="text-muted-foreground">
                Comprehensive market analysis and rent vs buy intelligence for {getLocationName()}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
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
              <Button onClick={refresh} variant="outline" size="sm" className="gap-2">
                <RefreshCw size={16} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Quick Market Metrics */}
          {!loading && intelligence && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {getMarketMetrics().map((metric) => (
                <div
                  key={metric.title}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <Card className="relative overflow-hidden border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <metric.icon className={`w-5 h-5 ${metric.color}`} />
                        <Badge variant="outline" className="text-xs">
                          {typeof metric.change === 'number' ? 
                            `${metric.change > 0 ? '+' : ''}${metric.change.toFixed(1)}%` : 
                            String(metric.change)
                          }
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">{metric.title}</div>
                      <div className="text-xl font-bold">{metric.value}</div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 size={16} />
              Overview
            </TabsTrigger>
            <TabsTrigger value="rent-vs-buy" className="gap-2">
              <Calculator size={16} />
              Rent vs Buy
            </TabsTrigger>
            <TabsTrigger value="competitors" className="gap-2">
              <Building size={16} />
              Competitors
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <LineChart size={16} />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="ai-insights" className="gap-2">
              <Brain size={16} />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings size={16} />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Market Overview */}
              <Card className="lg:col-span-2 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Market Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {intelligence && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                          <div className="text-sm text-muted-foreground">Median Rent</div>
                          <div className="text-2xl font-bold">${Math.round(intelligence.marketData[0]?.medianRent || 0).toLocaleString()}</div>
                          <div className="text-sm text-green-600">+{intelligence.marketData[0]?.rentYoYChange.toFixed(1)}% YoY</div>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                          <div className="text-sm text-muted-foreground">Days on Market</div>
                          <div className="text-2xl font-bold">{intelligence.marketData[0]?.daysOnMarket || 0}</div>
                          <div className="text-sm text-muted-foreground">Average</div>
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm text-muted-foreground">Leverage Score</div>
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                            {intelligence.overallLeverageScore}/100
                          </Badge>
                        </div>
                        <Progress value={intelligence.overallLeverageScore} className="mb-2" />
                        <div className="text-sm text-muted-foreground">
                          {intelligence.recommendation.action.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Quick Rent vs Buy Summary */}
              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-500" />
                    Rent vs Buy Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {rentVsBuyResult && (
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">AI Recommendation</div>
                        <div className="text-xl font-bold mb-2">
                          {getRentVsBuyRecommendation()?.decision === 'rent' ? 'RENT' : 'BUY'}
                        </div>
                        <Badge variant="outline">
                          {getRentVsBuyRecommendation()?.confidence}% confidence
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Break-even:</span>
                          <span className="text-sm font-medium">
                            {getRentVsBuyRecommendation()?.breakEvenYears.toFixed(1)} years
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total difference:</span>
                          <span className="text-sm font-medium">
                            ${Math.abs(getRentVsBuyRecommendation()?.totalCostDifference || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => setActiveTab('rent-vs-buy')} 
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                      >
                        View Full Analysis
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rent vs Buy Tab */}
          <TabsContent value="rent-vs-buy">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Settings Panel */}
              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Analysis Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="current-rent">Monthly Rent</Label>
                    <Input
                      id="current-rent"
                      type="number"
                      value={currentRent}
                      onChange={(e) => setCurrentRent(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="home-price">Home Price</Label>
                    <Input
                      id="home-price"
                      type="number"
                      value={propertyValue}
                      onChange={(e) => setPropertyValue(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="annual-income">Annual Income</Label>
                    <Input
                      id="annual-income"
                      type="number"
                      value={annualIncome}
                      onChange={(e) => setAnnualIncome(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="savings">Current Savings</Label>
                    <Input
                      id="savings"
                      type="number"
                      value={currentSavings}
                      onChange={(e) => setCurrentSavings(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Down Payment: {downPaymentPercent[0]}%</Label>
                    <Slider
                      value={downPaymentPercent}
                      onValueChange={setDownPaymentPercent}
                      max={30}
                      min={5}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label>Time Horizon: {timeHorizon[0]} years</Label>
                    <Slider
                      value={timeHorizon}
                      onValueChange={setTimeHorizon}
                      max={15}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Results */}
              <div className="lg:col-span-3 space-y-6">
                {rentVsBuyResult && (
                  <>
                    {/* Main Recommendation */}
                    <Card className="border-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-2xl font-bold mb-2">
                              AI Recommendation: {getRentVsBuyRecommendation()?.decision === 'rent' ? 'RENT' : 'BUY'}
                            </h3>
                            <div className="flex items-center gap-2">
                              <CheckCircle size={16} />
                              <span>{getRentVsBuyRecommendation()?.confidence}% confidence</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm opacity-80">Total Difference</div>
                            <div className="text-2xl font-bold">
                              ${Math.abs(getRentVsBuyRecommendation()?.totalCostDifference || 0).toLocaleString()}
                            </div>
                            <div className="text-sm opacity-80">over {timeHorizon[0]} years</div>
                          </div>
                        </div>
                        <p className="opacity-90">
                          {getRentVsBuyRecommendation()?.reasoning}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Financial Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Renting Costs */}
                      <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-blue-600">
                            <Home size={20} />
                            Renting Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-sm text-muted-foreground">Total Cost ({timeHorizon[0]} years)</div>
                            <div className="text-2xl font-bold text-blue-600">
                              ${rentVsBuyResult.summary.totalCostRent.toLocaleString()}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Monthly rent payments:</span>
                              <span className="text-sm font-medium">
                                ${(currentRent * 12 * timeHorizon[0]).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Renter's insurance:</span>
                              <span className="text-sm font-medium">
                                ${(200 * timeHorizon[0]).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Moving costs:</span>
                              <span className="text-sm font-medium">$3,000</span>
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t">
                            <div className="flex justify-between font-medium">
                              <span>Net worth advantage:</span>
                              <span className="text-green-600">
                                ${Math.abs(rentVsBuyResult.summary.netWorthAdvantage).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Buying Costs */}
                      <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-green-600">
                            <Building size={20} />
                            Buying Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-sm text-muted-foreground">Total Cost ({timeHorizon[0]} years)</div>
                            <div className="text-2xl font-bold text-green-600">
                              ${rentVsBuyResult.summary.totalCostBuy.toLocaleString()}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Down payment:</span>
                              <span className="text-sm font-medium">
                                ${(propertyValue * downPaymentPercent[0] / 100).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Monthly mortgage:</span>
                              <span className="text-sm font-medium">
                                ${Math.round(Math.abs(rentVsBuyResult.summary.monthlyDifference) + currentRent).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Property taxes & insurance:</span>
                              <span className="text-sm font-medium">
                                ${Math.round(propertyValue * 0.018 / 12 + 1200 / 12).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Maintenance & repairs:</span>
                              <span className="text-sm font-medium">
                                ${Math.round(propertyValue * 0.01 / 12).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t">
                            <div className="flex justify-between font-medium">
                              <span>Final equity:</span>
                              <span className="text-green-600">
                                +${rentVsBuyResult.summary.finalEquity.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Break-even Analysis */}
                    <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5" />
                          Break-even Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                            <div className="text-sm text-muted-foreground">Break-even Point</div>
                            <div className="text-2xl font-bold text-orange-600">
                              {rentVsBuyResult.breakEvenPoint.toFixed(1)} years
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {rentVsBuyResult.breakEvenPoint > timeHorizon[0] ? 
                                `${(rentVsBuyResult.breakEvenPoint - timeHorizon[0]).toFixed(1)} years beyond timeline` :
                                'Within your timeline'
                              }
                            </div>
                          </div>
                          
                          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                            <div className="text-sm text-muted-foreground">Monthly Difference</div>
                            <div className="text-2xl font-bold text-blue-600">
                              ${Math.abs(rentVsBuyResult.summary.monthlyDifference).toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {rentVsBuyResult.summary.monthlyDifference > 0 ? 
                                'Buying costs more' : 'Renting costs more'
                              }
                            </div>
                          </div>
                          
                          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                            <div className="text-sm text-muted-foreground">Price-to-Rent Ratio</div>
                            <div className="text-2xl font-bold text-green-600">
                              {Math.round(propertyValue / (currentRent * 12))}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {propertyValue / (currentRent * 12) > 20 ? 'Favor renting' : 
                               propertyValue / (currentRent * 12) > 15 ? 'Neutral' : 'Favor buying'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Competitors Tab */}
          <TabsContent value="competitors">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pricing Comparison */}
              <Card className="lg:col-span-2 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-500" />
                    Regional Rent Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={[
                      { name: 'Studio', austin: 1350, dallas: 1150, houston: 1050 },
                      { name: '1 BR', austin: 1650, dallas: 1350, houston: 1200 },
                      { name: '2 BR', austin: 2200, dallas: 1750, houston: 1550 },
                      { name: '3 BR', austin: 2900, dallas: 2300, houston: 2050 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(v) => `$${v}`} />
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="austin" name="Austin" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="dallas" name="Dallas" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="houston" name="Houston" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Market Position */}
              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-500" />
                    Market Position
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPie>
                      <Pie
                        data={[
                          { name: 'Below Market', value: 35, color: '#22c55e' },
                          { name: 'At Market', value: 45, color: '#6366f1' },
                          { name: 'Above Market', value: 20, color: '#ef4444' },
                        ]}
                        cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: 'Below Market', value: 35, color: '#22c55e' },
                          { name: 'At Market', value: 45, color: '#6366f1' },
                          { name: 'Above Market', value: 20, color: '#ef4444' },
                        ].map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${v}%`} />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {[
                      { label: 'Below Market', pct: 35, color: 'bg-green-500' },
                      { label: 'At Market', pct: 45, color: 'bg-indigo-500' },
                      { label: 'Above Market', pct: 20, color: 'bg-red-500' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <span>{item.label}</span>
                        </div>
                        <span className="font-medium">{item.pct}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Competitor Listings Table */}
              <Card className="lg:col-span-3 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Top Competitors in {getLocationName()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Property</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Avg Rent</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Units</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Vacancy</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Days on Market</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Concessions</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'The Domain at Midtown', rent: 2450, units: 320, vacancy: '4.2%', dom: 18, concessions: '1 month free', trend: 'up' },
                          { name: 'Mueller Flats', rent: 2100, units: 180, vacancy: '6.8%', dom: 28, concessions: '$500 off', trend: 'down' },
                          { name: 'South Congress Lofts', rent: 2800, units: 95, vacancy: '2.1%', dom: 12, concessions: 'None', trend: 'up' },
                          { name: 'East Riverside Place', rent: 1850, units: 250, vacancy: '8.5%', dom: 35, concessions: '2 months free', trend: 'down' },
                          { name: 'North Loop Studios', rent: 1650, units: 140, vacancy: '5.5%', dom: 22, concessions: 'Waived fees', trend: 'stable' },
                        ].map((comp) => (
                          <tr key={comp.name} className="border-b hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="py-3 px-4 font-medium">{comp.name}</td>
                            <td className="py-3 px-4">${comp.rent.toLocaleString()}</td>
                            <td className="py-3 px-4">{comp.units}</td>
                            <td className="py-3 px-4">{comp.vacancy}</td>
                            <td className="py-3 px-4">{comp.dom} days</td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="text-xs">{comp.concessions}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              {comp.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-red-500" />}
                              {comp.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-green-500" />}
                              {comp.trend === 'stable' && <Minus className="w-4 h-4 text-yellow-500" />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rent Trends Over Time */}
              <Card className="lg:col-span-2 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Rent Trends - {getLocationName()} (12 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={[
                      { month: 'Mar', median: 1980, avg: 2050, min: 1200, max: 3200 },
                      { month: 'Apr', median: 2010, avg: 2080, min: 1220, max: 3250 },
                      { month: 'May', median: 2050, avg: 2120, min: 1250, max: 3300 },
                      { month: 'Jun', median: 2120, avg: 2180, min: 1280, max: 3400 },
                      { month: 'Jul', median: 2150, avg: 2210, min: 1300, max: 3450 },
                      { month: 'Aug', median: 2180, avg: 2240, min: 1310, max: 3500 },
                      { month: 'Sep', median: 2140, avg: 2200, min: 1290, max: 3420 },
                      { month: 'Oct', median: 2100, avg: 2170, min: 1270, max: 3380 },
                      { month: 'Nov', median: 2080, avg: 2140, min: 1250, max: 3350 },
                      { month: 'Dec', median: 2060, avg: 2120, min: 1230, max: 3300 },
                      { month: 'Jan', median: 2090, avg: 2150, min: 1260, max: 3350 },
                      { month: 'Feb', median: 2120, avg: 2180, min: 1270, max: 3380 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(v) => `$${v}`} />
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                      <Legend />
                      <Area type="monotone" dataKey="max" stroke="#fca5a5" fill="#fef2f2" name="Max" />
                      <Area type="monotone" dataKey="avg" stroke="#818cf8" fill="#eef2ff" name="Average" />
                      <Area type="monotone" dataKey="median" stroke="#6366f1" fill="#e0e7ff" name="Median" strokeWidth={2} />
                      <Area type="monotone" dataKey="min" stroke="#86efac" fill="#f0fdf4" name="Min" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Supply & Demand */}
              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-orange-500" />
                    Supply & Demand
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={[
                      { month: 'Sep', listings: 420, demand: 380 },
                      { month: 'Oct', listings: 390, demand: 350 },
                      { month: 'Nov', listings: 350, demand: 310 },
                      { month: 'Dec', listings: 280, demand: 260 },
                      { month: 'Jan', listings: 320, demand: 340 },
                      { month: 'Feb', listings: 380, demand: 390 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="listings" name="New Listings" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="demand" name="Searches/Demand" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-300">
                      <AlertTriangle className="w-4 h-4" />
                      Demand exceeds supply - strong renter competition expected
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Market Stats */}
              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-indigo-500" />
                    Market Stats Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Avg Days on Market', value: '22 days', change: -3, desc: 'Properties leasing faster' },
                    { label: 'Vacancy Rate', value: '5.2%', change: -0.8, desc: 'Tightening market' },
                    { label: 'Concessions Prevalence', value: '32%', change: 5, desc: 'More properties offering deals' },
                    { label: 'YoY Rent Growth', value: '+4.5%', change: 1.2, desc: 'Accelerating rent increases' },
                    { label: 'New Construction', value: '2,800 units', change: 12, desc: 'Coming online this quarter' },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                        <div className="text-lg font-bold">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.desc}</div>
                      </div>
                      <Badge variant="outline" className={stat.change > 0 ? 'text-red-600 border-red-200' : 'text-green-600 border-green-200'}>
                        {stat.change > 0 ? '+' : ''}{stat.change}%
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Seasonal Pricing Insights */}
              <Card className="lg:col-span-2 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Seasonal Pricing Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { season: 'Spring (Mar-May)', premium: '+3-5%', icon: '🌱', tip: 'High demand, limited concessions' },
                      { season: 'Summer (Jun-Aug)', premium: '+5-8%', icon: '☀️', tip: 'Peak season, strongest pricing' },
                      { season: 'Fall (Sep-Nov)', premium: '+1-3%', icon: '🍂', tip: 'Demand cooling, negotiate harder' },
                      { season: 'Winter (Dec-Feb)', premium: '-2-5%', icon: '❄️', tip: 'Best deals, most concessions' },
                    ].map((s) => (
                      <div key={s.season} className="p-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-700 dark:to-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div className="text-2xl mb-2">{s.icon}</div>
                        <div className="font-semibold text-sm mb-1">{s.season}</div>
                        <div className={`text-lg font-bold mb-2 ${s.premium.startsWith('-') ? 'text-green-600' : 'text-red-600'}`}>
                          {s.premium}
                        </div>
                        <div className="text-xs text-muted-foreground">{s.tip}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI Recommendation Panel */}
              <Card className="lg:col-span-2 border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-8 h-8" />
                    <div>
                      <h3 className="text-xl font-bold">AI Market Analysis</h3>
                      <p className="text-white/80 text-sm">Powered by rental intelligence engine</p>
                    </div>
                  </div>
                  {intelligence ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                        <div className="text-sm text-white/80 mb-1">Overall Recommendation</div>
                        <div className="text-lg font-bold">
                          {intelligence.recommendation.action.replace(/_/g, ' ').toUpperCase()}
                        </div>
                        <div className="text-sm text-white/80 mt-2">
                          Leverage Score: {intelligence.overallLeverageScore}/100 —
                          {intelligence.overallLeverageScore > 70 ? ' Strong negotiation position' :
                           intelligence.overallLeverageScore > 40 ? ' Moderate leverage available' :
                           ' Limited negotiation room'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white/10 rounded-lg">
                          <div className="text-sm text-white/80">Data Confidence</div>
                          <div className="text-lg font-bold">{intelligence.dataStatus.overallConfidence}%</div>
                        </div>
                        <div className="p-3 bg-white/10 rounded-lg">
                          <div className="text-sm text-white/80">Insights Generated</div>
                          <div className="text-lg font-bold">{intelligence.combinedInsights.length}</div>
                        </div>
                      </div>
                    </div>
                  ) : loading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin text-white/60" />
                      <span className="ml-2 text-white/80">Analyzing market data...</span>
                    </div>
                  ) : (
                    <p className="text-white/80">Select a region to generate AI insights.</p>
                  )}
                </CardContent>
              </Card>

              {/* Negotiation Tips */}
              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    Negotiation Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { tip: 'Target properties with 30+ days on market for best leverage', priority: 'high' },
                    { tip: 'Highlight competing offers from lower-priced units nearby', priority: 'high' },
                    { tip: 'Request concessions (free parking, waived fees) before rent reduction', priority: 'medium' },
                    { tip: 'Offer longer lease terms (18-24 mo) for lower monthly rate', priority: 'medium' },
                    { tip: 'Time your search in winter months for maximum savings', priority: 'low' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <Lightbulb className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        item.priority === 'high' ? 'text-green-500' :
                        item.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                      }`} />
                      <div className="text-sm">{item.tip}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AI-Generated Insights */}
              <Card className="lg:col-span-3 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Key Market Insights for {getLocationName()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {intelligence && intelligence.combinedInsights.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {intelligence.combinedInsights.map((insight, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border ${
                            insight.impact === 'positive' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700' :
                            insight.impact === 'negative' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700' :
                            'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {insight.impact === 'positive' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : insight.impact === 'negative' ? (
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            ) : (
                              <Info className="w-4 h-4 text-blue-600" />
                            )}
                            <span className="font-medium text-sm capitalize">{insight.category.replace(/_/g, ' ')}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{insight.insight}</p>
                          {insight.actionItem && (
                            <div className="mt-2 pt-2 border-t border-current/10">
                              <p className="text-xs font-medium text-muted-foreground">
                                Action: {insight.actionItem}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { category: 'Market Timing', insight: 'Current market conditions favor renters with winter pricing dips. Expect 2-5% savings compared to summer peaks.', impact: 'positive' },
                        { category: 'Inventory Alert', insight: 'New construction adding 2,800 units this quarter. Increased supply may soften pricing in Q2.', impact: 'positive' },
                        { category: 'Price Forecast', insight: 'Rents projected to increase 4-6% YoY. Locking in now avoids future increases.', impact: 'negative' },
                        { category: 'Negotiation Window', insight: '32% of properties currently offering concessions - highest rate in 6 months.', impact: 'positive' },
                        { category: 'Submarket Tip', insight: 'East Riverside shows highest vacancy (8.5%), offering best negotiation leverage.', impact: 'positive' },
                        { category: 'Competition', insight: 'Demand is outpacing supply by 3% - act quickly on well-priced listings.', impact: 'negative' },
                      ].map((insight, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border ${
                            insight.impact === 'positive' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700' :
                            'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {insight.impact === 'positive' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            )}
                            <span className="font-medium text-sm">{insight.category}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{insight.insight}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle>Analysis Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location-setting">Location</Label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="austin">Austin, TX</SelectItem>
                        <SelectItem value="dallas">Dallas, TX</SelectItem>
                        <SelectItem value="houston">Houston, TX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="currency-setting">Currency</Label>
                    <Select defaultValue="usd">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Default Analysis Parameters</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Interest Rate</Label>
                      <Input defaultValue="7.2" className="mt-1" />
                    </div>
                    <div>
                      <Label>Property Tax Rate</Label>
                      <Input defaultValue="1.8" className="mt-1" />
                    </div>
                    <div>
                      <Label>Home Appreciation Rate</Label>
                      <Input defaultValue="3.2" className="mt-1" />
                    </div>
                    <div>
                      <Label>Investment Return Rate</Label>
                      <Input defaultValue="7.0" className="mt-1" />
                    </div>
                  </div>
                </div>
                
                <Button className="w-full">Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MarketIntel;