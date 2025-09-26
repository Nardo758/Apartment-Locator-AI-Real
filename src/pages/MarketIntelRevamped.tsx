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
import Header from '@/components/Header';
import { useUnifiedRentalIntelligence } from '@/hooks/useUnifiedRentalIntelligence';
import { RentVsBuyAnalyzer, type RentVsBuyResult } from '@/lib/rent-vs-buy-analysis';

const MarketIntelRevamped: React.FC = () => {
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
                                ${Math.round(rentVsBuyResult.summary.monthlyDifference + currentRent).toLocaleString()}
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

          {/* Other tabs can be added here */}
          <TabsContent value="competitors">
            <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-8 text-center">
                <Building className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Competitor Analysis</h3>
                <p className="text-muted-foreground">Coming soon - Real-time competitor monitoring and pricing intelligence.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-8 text-center">
                <LineChart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground">Coming soon - Market trends, predictive analytics, and investment insights.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-insights">
            <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-8 text-center">
                <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">AI-Powered Insights</h3>
                <p className="text-muted-foreground">Coming soon - Machine learning predictions and personalized recommendations.</p>
              </CardContent>
            </Card>
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

export default MarketIntelRevamped;