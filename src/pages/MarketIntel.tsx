import React, { useState, useEffect } from 'react';
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
  Activity
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Header from '@/components/Header';
import { useUnifiedRentalIntelligence } from '@/hooks/useUnifiedRentalIntelligence';
import { RentVsBuyAnalyzer, type RentVsBuyResult } from '@/lib/rent-vs-buy-analysis';

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

          {/* Other tabs */}
          <TabsContent value="competitors">
            <div className="space-y-6">
              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Regional Rent Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { bedroom: '1 BR', Austin: 1450, Dallas: 1280, Houston: 1150 },
                      { bedroom: '2 BR', Austin: 2200, Dallas: 1800, Houston: 1600 },
                      { bedroom: '3 BR', Austin: 2950, Dallas: 2400, Houston: 2100 }
                    ]} data-testid="chart-regional-rent">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bedroom" />
                      <YAxis tickFormatter={(v) => `$${v}`} />
                      <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                      <Legend />
                      <Bar dataKey="Austin" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Dallas" fill="#9333ea" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Houston" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg" data-testid="card-your-rent">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-muted-foreground">Your Rent</span>
                    </div>
                    <div className="text-2xl font-bold" data-testid="text-your-rent">${currentRent.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground mt-1">{getLocationName()}</div>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg" data-testid="card-market-median">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-purple-600" />
                      <span className="text-sm text-muted-foreground">Market Median</span>
                    </div>
                    <div className="text-2xl font-bold" data-testid="text-market-median">
                      ${Math.round(intelligence?.marketData[0]?.medianRent || 2000).toLocaleString()}
                    </div>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {currentRent > (intelligence?.marketData[0]?.medianRent || 2000) ? 'Above median' : 'Below median'}
                    </Badge>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg" data-testid="card-savings-potential">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-muted-foreground">Savings Potential</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600" data-testid="text-savings-potential">
                      ${Math.max(0, Math.round(currentRent - (intelligence?.marketData[0]?.medianRent || 2000) * 0.9)).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">per month</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-indigo-600" />
                    Nearby Competitor Listings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-competitors">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-3 font-medium">Property Name</th>
                          <th className="pb-3 font-medium">Rent</th>
                          <th className="pb-3 font-medium">Units</th>
                          <th className="pb-3 font-medium">Vacancy %</th>
                          <th className="pb-3 font-medium">Days on Market</th>
                          <th className="pb-3 font-medium">Concessions</th>
                          <th className="pb-3 font-medium">Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'The Domain at Eastside', rent: 2350, units: 312, vacancy: 8.2, dom: 42, concessions: '1 month free', trend: 'down' },
                          { name: 'Waterloo Residences', rent: 2180, units: 248, vacancy: 5.1, dom: 28, concessions: 'Waived app fee', trend: 'up' },
                          { name: 'Mueller Park Apartments', rent: 2050, units: 196, vacancy: 11.5, dom: 55, concessions: '6 weeks free', trend: 'down' },
                          { name: 'South Congress Flats', rent: 2420, units: 164, vacancy: 3.8, dom: 15, concessions: 'None', trend: 'up' },
                          { name: 'East Riverside Place', rent: 1890, units: 280, vacancy: 9.7, dom: 48, concessions: '$500 off move-in', trend: 'down' }
                        ].map((comp, i) => (
                          <tr key={i} className="border-b last:border-0" data-testid={`row-competitor-${i}`}>
                            <td className="py-3 font-medium">{comp.name}</td>
                            <td className="py-3">${comp.rent.toLocaleString()}</td>
                            <td className="py-3">{comp.units}</td>
                            <td className="py-3">
                              <Badge variant={comp.vacancy > 8 ? 'destructive' : 'outline'} className="text-xs">
                                {comp.vacancy}%
                              </Badge>
                            </td>
                            <td className="py-3">{comp.dom}</td>
                            <td className="py-3">{comp.concessions}</td>
                            <td className="py-3">
                              {comp.trend === 'down' ? (
                                <TrendingDown className="w-4 h-4 text-green-500" />
                              ) : (
                                <TrendingUp className="w-4 h-4 text-red-500" />
                              )}
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

          <TabsContent value="analytics">
            <div className="space-y-6">
              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    12-Month Rent Trends — {getLocationName()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={[
                      { month: 'Mar', min: 1650, median: 2050, avg: 2100, max: 2800 },
                      { month: 'Apr', min: 1680, median: 2080, avg: 2130, max: 2850 },
                      { month: 'May', min: 1720, median: 2120, avg: 2170, max: 2900 },
                      { month: 'Jun', min: 1750, median: 2180, avg: 2220, max: 2980 },
                      { month: 'Jul', min: 1780, median: 2220, avg: 2260, max: 3020 },
                      { month: 'Aug', min: 1760, median: 2250, avg: 2290, max: 3050 },
                      { month: 'Sep', min: 1730, median: 2200, avg: 2240, max: 2970 },
                      { month: 'Oct', min: 1700, median: 2160, avg: 2200, max: 2920 },
                      { month: 'Nov', min: 1660, median: 2100, avg: 2140, max: 2860 },
                      { month: 'Dec', min: 1620, median: 2040, avg: 2080, max: 2790 },
                      { month: 'Jan', min: 1600, median: 2000, avg: 2050, max: 2750 },
                      { month: 'Feb', min: 1610, median: 2020, avg: 2060, max: 2770 }
                    ]} data-testid="chart-rent-trends">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(v) => `$${v}`} />
                      <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                      <Legend />
                      <Area type="monotone" dataKey="max" stroke="#ef4444" fill="#ef4444" fillOpacity={0.08} name="Max" />
                      <Area type="monotone" dataKey="avg" stroke="#9333ea" fill="#9333ea" fillOpacity={0.12} name="Average" />
                      <Area type="monotone" dataKey="median" stroke="#2563eb" fill="#2563eb" fillOpacity={0.18} name="Median" />
                      <Area type="monotone" dataKey="min" stroke="#22c55e" fill="#22c55e" fillOpacity={0.12} name="Min" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-600" />
                    Supply & Demand (6 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={[
                      { month: 'Sep', newListings: 180, absorbed: 165 },
                      { month: 'Oct', newListings: 165, absorbed: 158 },
                      { month: 'Nov', newListings: 140, absorbed: 150 },
                      { month: 'Dec', newListings: 120, absorbed: 142 },
                      { month: 'Jan', newListings: 135, absorbed: 148 },
                      { month: 'Feb', newListings: 155, absorbed: 152 }
                    ]} data-testid="chart-supply-demand">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="newListings" fill="#2563eb" name="New Listings" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="absorbed" fill="#22c55e" name="Absorbed Units" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Avg Rent', value: `$${Math.round(intelligence?.marketData[0]?.medianRent || 2100).toLocaleString()}`, change: '-3.2%', positive: true, icon: DollarSign },
                  { label: 'Vacancy Rate', value: '7.4%', change: '+1.2%', positive: true, icon: Building },
                  { label: 'Days on Market', value: `${intelligence?.marketData[0]?.daysOnMarket || 42}`, change: '+8', positive: true, icon: Calendar },
                  { label: 'New Supply', value: `${intelligence?.marketData[0]?.newListings || 155}`, change: '+12%', positive: false, icon: Activity },
                  { label: 'Absorption Rate', value: '94%', change: '-2%', positive: false, icon: Target }
                ].map((stat, i) => (
                  <Card key={i} className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg" data-testid={`card-stat-${i}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <stat.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{stat.label}</span>
                      </div>
                      <div className="text-lg font-bold" data-testid={`text-stat-value-${i}`}>{stat.value}</div>
                      <Badge variant="outline" className={`text-xs mt-1 ${stat.positive ? 'text-green-600' : 'text-red-500'}`}>
                        {stat.change}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Seasonal Pricing Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { season: 'Spring (Mar–May)', rating: 'Moderate', desc: 'Market warming up. Negotiate before summer rush.', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
                      { season: 'Summer (Jun–Aug)', rating: 'Worst', desc: 'Peak demand and highest prices. Avoid signing leases.', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
                      { season: 'Fall (Sep–Nov)', rating: 'Good', desc: 'Demand cooling. Good time to start negotiations.', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
                      { season: 'Winter (Dec–Feb)', rating: 'Best', desc: 'Lowest demand. Maximum leverage for concessions.', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' }
                    ].map((s, i) => (
                      <div key={i} className={`p-4 rounded-lg ${s.bg}`} data-testid={`card-season-${i}`}>
                        <div className={`text-sm font-semibold ${s.color} mb-1`}>{s.season}</div>
                        <Badge variant="outline" className={`text-xs mb-2 ${s.color}`}>{s.rating}</Badge>
                        <p className="text-xs text-muted-foreground">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-insights">
            <div className="space-y-6">
              {intelligence?.recommendation ? (
                <Card className="border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg" data-testid="card-ai-recommendation">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-6 h-6" />
                      <h3 className="text-lg font-bold">AI Recommendation</h3>
                    </div>
                    <Badge className="bg-white/20 text-white mb-3">
                      {intelligence.recommendation.action.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                    <p className="opacity-90 mb-4" data-testid="text-recommendation-reasoning">{intelligence.recommendation.reasoning}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white/10 rounded-lg p-4">
                        <div className="text-sm opacity-80">Expected Savings</div>
                        <div className="text-2xl font-bold" data-testid="text-expected-savings">
                          ${Math.round(intelligence.recommendation.expectedSavings).toLocaleString()}/mo
                        </div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <div className="text-sm opacity-80">Annual Impact</div>
                        <div className="text-2xl font-bold" data-testid="text-annual-impact">
                          ${Math.round(intelligence.recommendation.expectedSavings * 12).toLocaleString()}/yr
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-2 opacity-90">Key Tactics</div>
                      <ul className="space-y-1">
                        {intelligence.recommendation.keyTactics.map((tactic, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm opacity-90" data-testid={`text-tactic-${i}`}>
                            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            {tactic}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-bold">AI Recommendation</h3>
                    </div>
                    <p className="text-muted-foreground">Generating personalized recommendations based on market data...</p>
                  </CardContent>
                </Card>
              )}

              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Negotiation Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { title: 'Leverage Competing Offers', desc: 'Present quotes from nearby properties to justify a lower rate. Landlords respond to competitive pressure.', icon: Target, color: 'text-blue-600' },
                      { title: 'Offer a Longer Lease', desc: 'Propose an 18–24 month lease in exchange for 8–12% rent reduction. Landlords value tenant stability.', icon: Calendar, color: 'text-purple-600' },
                      { title: 'Time Your Move', desc: 'Sign during winter months (Nov–Feb) when demand is lowest and landlords are eager to fill vacancies.', icon: Activity, color: 'text-indigo-600' },
                      { title: 'Negotiate Move-In Costs', desc: 'Ask for waived application fees, reduced deposits, or free parking. These are easier wins than rent reduction.', icon: DollarSign, color: 'text-green-500' },
                      { title: 'Highlight Your Profile', desc: 'Strong credit, stable income, and references give you leverage. Present yourself as a low-risk, long-term tenant.', icon: CheckCircle, color: 'text-yellow-500' }
                    ].map((tip, i) => (
                      <div key={i} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg" data-testid={`card-tip-${i}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <tip.icon className={`w-4 h-4 ${tip.color}`} />
                          <span className="text-sm font-semibold">{tip.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{tip.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    Market Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(intelligence?.combinedInsights && intelligence.combinedInsights.length > 0
                      ? intelligence.combinedInsights
                      : [
                          { insightType: 'leverage', severity: 'medium' as const, title: 'General Market Conditions', description: 'Market data loading. Check back shortly for real-time insights.', actionable: 'Monitor rent trends and vacancy rates in your target neighborhoods.', confidence: 0.6, savingsPotential: 150 },
                          { insightType: 'seasonal', severity: 'low' as const, title: 'Seasonal Opportunity', description: 'Winter months historically offer the best negotiation leverage.', actionable: 'Plan lease renewals for November through February for maximum savings.', confidence: 0.7, savingsPotential: 200 },
                          { insightType: 'timing', severity: 'medium' as const, title: 'End-of-Quarter Window', description: 'Property managers face leasing quotas at quarter end.', actionable: 'Submit applications in the last two weeks of March, June, September, or December.', confidence: 0.75, savingsPotential: 180 }
                        ]
                    ).map((insight, i) => (
                      <div key={i} className="p-4 border rounded-lg" data-testid={`card-insight-${i}`}>
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                          <div className="flex items-center gap-2">
                            {insight.severity === 'high' ? (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            ) : insight.severity === 'medium' ? (
                              <Info className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            <span className="text-sm font-semibold">{insight.title}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">{insight.insightType}</Badge>
                            {insight.confidence !== undefined && (
                              <Badge variant="outline" className="text-xs">{Math.round(insight.confidence * 100)}% confidence</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                        {insight.actionable && (
                          <div className="text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                            <span className="font-medium">Action:</span> {insight.actionable}
                          </div>
                        )}
                        {insight.savingsPotential !== undefined && insight.savingsPotential > 0 && (
                          <div className="text-xs text-green-600 font-medium mt-2" data-testid={`text-savings-${i}`}>
                            Potential savings: ${Math.round(insight.savingsPotential).toLocaleString()}/mo
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
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