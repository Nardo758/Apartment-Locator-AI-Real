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
  Activity,
  Tag
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
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import { RentVsBuyAnalyzer, type RentVsBuyResult } from '@/lib/rent-vs-buy-analysis';
import { formatMoney } from '@/lib/savings-calculator';
import { useZillowRentals, useMarketAnalytics } from '@/hooks/useHomePriceData';
import { Search, ExternalLink, Bed, Bath, Maximize2, Clock } from 'lucide-react';

interface MarketIntelStats {
  totalProperties: number;
  medianRent: number;
  avgRent: number;
  minRent: number;
  maxRent: number;
  propertiesWithConcessions: number;
  concessionRate: number;
  avgDaysOnMarket: number;
  cities: string[];
  competitors: Array<{
    name: string;
    rent: number;
    bedrooms: number | null;
    daysOnMarket: number;
    concession: string;
    effectivePrice: number | null;
    volatilityScore: number | null;
    city: string | null;
    address: string | null;
  }>;
}

const MarketIntel: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState('all');
  const [currentRent, setCurrentRent] = useState(2200);
  const [propertyValue, setPropertyValue] = useState(450000);
  const [downPaymentPercent, setDownPaymentPercent] = useState([20]);
  const [timeHorizon, setTimeHorizon] = useState([5]);
  const [annualIncome, setAnnualIncome] = useState(102000);
  const [currentSavings, setCurrentSavings] = useState(120000);
  const [activeTab, setActiveTab] = useState('overview');
  const [rentVsBuyResult, setRentVsBuyResult] = useState<RentVsBuyResult | null>(null);

  const rentalCity = selectedCity !== 'all' ? selectedCity : 'Atlanta';
  const { data: zillowRentals, isLoading: rentalsLoading } = useZillowRentals(rentalCity);
  const { data: marketAnalytics, isLoading: analyticsLoading } = useMarketAnalytics(rentalCity);

  const { data: marketStats, isLoading: statsLoading, refetch } = useQuery<MarketIntelStats>({
    queryKey: ['/api/market-intel/stats', selectedCity],
    queryFn: async () => {
      const params = selectedCity !== 'all' ? `?city=${encodeURIComponent(selectedCity)}` : '';
      const res = await fetch(`/api/market-intel/stats${params}`);
      if (!res.ok) throw new Error('Failed to fetch market intel');
      return res.json();
    },
  });

  const locationName = selectedCity !== 'all' ? selectedCity : 'All Markets';

  useEffect(() => {
    const analyzer = RentVsBuyAnalyzer.getInstance();

    const renterProfile = {
      income: annualIncome,
      creditScore: 750,
      currentRent,
      savings: currentSavings,
      monthlyDebt: 0,
      employmentStability: 'stable' as const,
      timeHorizon: timeHorizon[0],
      locationFlexibility: 'medium' as const,
      riskTolerance: 'moderate' as const
    };

    const propertyScenario = {
      propertyValue,
      currentRent,
      location: locationName,
      propertyTax: propertyValue * 0.018,
      hoaFees: 150,
      maintenanceCosts: propertyValue * 0.01,
      appreciationRate: 0.032,
      rentGrowthRate: 0.045,
      downPaymentOptions: [downPaymentPercent[0]]
    };

    const marketConditions = {
      mortgageRate: 0.072,
      inflationRate: 0.03,
      localMarketTrend: 'normal' as const,
      inventoryLevels: 2.5,
      priceToRentRatio: propertyValue / (currentRent * 12),
      economicOutlook: 'stable' as const,
      seasonality: 0
    };

    const result = analyzer.analyzeRentVsBuy(renterProfile, propertyScenario, marketConditions);
    setRentVsBuyResult(result);
  }, [currentRent, propertyValue, downPaymentPercent, timeHorizon, annualIncome, currentSavings, locationName]);

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

  const medianRent = marketStats?.medianRent || 0;
  const avgDOM = marketStats?.avgDaysOnMarket || 0;
  const concessionRate = marketStats?.concessionRate || 0;

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
                Real-time market analysis from {marketStats?.totalProperties || 0} scraped listings
                {locationName !== 'All Markets' && ` in ${locationName}`}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Markets</SelectItem>
                  {(marketStats?.cities || []).map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
                <RefreshCw size={16} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Quick Market Metrics */}
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                  <CardContent className="p-4">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-muted rounded w-2/3" />
                      <div className="h-6 bg-muted rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : marketStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  title: 'Median Rent',
                  value: medianRent > 0 ? formatMoney(medianRent) : 'N/A',
                  change: currentRent > medianRent ? `Your rent is ${formatMoney(currentRent - medianRent)} above median` : `${formatMoney(medianRent - currentRent)} below median`,
                  icon: Home,
                  color: currentRent > medianRent ? 'text-red-500' : 'text-green-500'
                },
                {
                  title: 'Properties Tracked',
                  value: String(marketStats.totalProperties),
                  change: `${marketStats.propertiesWithConcessions} with concessions`,
                  icon: Building,
                  color: 'text-blue-500'
                },
                {
                  title: 'Avg Days on Market',
                  value: String(avgDOM),
                  change: avgDOM > 30 ? 'High leverage (slow market)' : avgDOM > 15 ? 'Moderate leverage' : 'Low leverage (hot market)',
                  icon: Calendar,
                  color: avgDOM > 30 ? 'text-green-500' : avgDOM > 15 ? 'text-yellow-500' : 'text-red-500'
                },
                {
                  title: 'Concession Rate',
                  value: `${concessionRate}%`,
                  change: concessionRate > 30 ? 'Strong negotiation leverage' : concessionRate > 15 ? 'Moderate opportunity' : 'Few concessions',
                  icon: Tag,
                  color: concessionRate > 30 ? 'text-green-500' : concessionRate > 15 ? 'text-yellow-500' : 'text-red-500'
                }
              ].map((metric) => (
                <div
                  key={metric.title}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <Card className="relative overflow-hidden border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <metric.icon className={`w-5 h-5 ${metric.color}`} />
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">{metric.title}</div>
                      <div className="text-xl font-bold">{metric.value}</div>
                      <div className="text-xs text-muted-foreground mt-1">{metric.change}</div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 size={16} />
              Overview
            </TabsTrigger>
            <TabsTrigger value="zillow-rentals" className="gap-2" data-testid="tab-zillow-rentals">
              <Search size={16} />
              Zillow Rentals
            </TabsTrigger>
            <TabsTrigger value="rent-vs-buy" className="gap-2">
              <Calculator size={16} />
              Rent vs Buy
            </TabsTrigger>
            <TabsTrigger value="competitors" className="gap-2">
              <Building size={16} />
              Competitors
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
                  {marketStats ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                          <div className="text-sm text-muted-foreground">Median Rent</div>
                          <div className="text-2xl font-bold">{medianRent > 0 ? formatMoney(medianRent) : 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">
                            Range: {formatMoney(marketStats.minRent)} - {formatMoney(marketStats.maxRent)}
                          </div>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                          <div className="text-sm text-muted-foreground">Avg Days on Market</div>
                          <div className="text-2xl font-bold">{avgDOM}</div>
                          <div className="text-sm text-muted-foreground">
                            {avgDOM > 30 ? 'Slow market = leverage' : 'Active market'}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm text-muted-foreground">Concession Rate</div>
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                            {concessionRate}% of listings
                          </Badge>
                        </div>
                        <Progress value={concessionRate} className="mb-2" />
                        <div className="text-sm text-muted-foreground">
                          {marketStats.propertiesWithConcessions} of {marketStats.totalProperties} properties offering concessions
                        </div>
                      </div>
                    </>
                  ) : statsLoading ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-24 bg-muted rounded" />
                      <div className="h-16 bg-muted rounded" />
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No market data available. Try refreshing.</p>
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
                  {rentVsBuyResult ? (
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
                  ) : (
                    <div className="animate-pulse space-y-3">
                      <div className="h-20 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Zillow Rentals Tab */}
          <TabsContent value="zillow-rentals">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Live Zillow Rental Listings</h2>
                  <p className="text-muted-foreground text-sm">
                    Real-time rental data from Zillow for {rentalCity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {zillowRentals?.dataSource === 'zillow_api' ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" data-testid="badge-live-data">
                      <Activity size={12} className="mr-1" /> Live Zillow Data
                    </Badge>
                  ) : (
                    <Badge variant="secondary" data-testid="badge-fallback-data">
                      <Info size={12} className="mr-1" /> No Zillow Data Available
                    </Badge>
                  )}
                  {zillowRentals && (
                    <span className="text-xs text-muted-foreground">
                      {zillowRentals.totalCount} listings found
                    </span>
                  )}
                </div>
              </div>

              {marketAnalytics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">ZHVI (Home Value Index)</p>
                      <p className="text-2xl font-bold text-blue-600" data-testid="text-zhvi">
                        {marketAnalytics.zhvi > 0 ? `$${marketAnalytics.zhvi.toLocaleString()}` : 'N/A'}
                      </p>
                      {marketAnalytics.zhviYoy !== 0 && (
                        <p className={`text-xs ${marketAnalytics.zhviYoy > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {marketAnalytics.zhviYoy > 0 ? '+' : ''}{(marketAnalytics.zhviYoy * 100).toFixed(1)}% YoY
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">ZORI (Rent Index)</p>
                      <p className="text-2xl font-bold text-purple-600" data-testid="text-zori">
                        {marketAnalytics.zori > 0 ? `$${marketAnalytics.zori.toLocaleString()}` : 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">Zillow Observed Rent</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Days to Pending</p>
                      <p className="text-2xl font-bold text-amber-600" data-testid="text-days-pending">
                        {marketAnalytics.daysToPending > 0 ? marketAnalytics.daysToPending : 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">Median days</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Sale-to-List Ratio</p>
                      <p className="text-2xl font-bold text-indigo-600" data-testid="text-sale-list-ratio">
                        {marketAnalytics.saleToListRatio > 0 ? `${(marketAnalytics.saleToListRatio * 100).toFixed(1)}%` : 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {marketAnalytics.percentSoldAboveList > 0 && `${marketAnalytics.percentSoldAboveList.toFixed(0)}% above list`}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {rentalsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Card key={i} className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm animate-pulse">
                      <CardContent className="p-4 space-y-3">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : zillowRentals && zillowRentals.listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {zillowRentals.listings.map((listing, idx) => (
                    <Card key={listing.zpid || idx} className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow" data-testid={`card-zillow-rental-${listing.zpid || idx}`}>
                      {listing.photos.length > 0 && (
                        <div className="h-40 overflow-hidden rounded-t-lg">
                          <img
                            src={listing.photos[0]}
                            alt={listing.address}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <p className="text-lg font-bold text-green-600" data-testid={`text-price-${listing.zpid || idx}`}>
                            ${listing.price.toLocaleString()}/mo
                          </p>
                          {listing.daysOnZillow > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Clock size={10} className="mr-1" />
                              {listing.daysOnZillow}d
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium truncate" title={listing.address}>
                          <MapPin size={12} className="inline mr-1 text-muted-foreground" />
                          {listing.address}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {listing.bedrooms > 0 && (
                            <span className="flex items-center gap-1">
                              <Bed size={12} /> {listing.bedrooms} bd
                            </span>
                          )}
                          {listing.bathrooms > 0 && (
                            <span className="flex items-center gap-1">
                              <Bath size={12} /> {listing.bathrooms} ba
                            </span>
                          )}
                          {listing.sqft > 0 && (
                            <span className="flex items-center gap-1">
                              <Maximize2 size={12} /> {listing.sqft.toLocaleString()} sqft
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-muted-foreground capitalize">{listing.homeType.replace(/_/g, ' ')}</span>
                          {listing.listingUrl && (
                            <a
                              href={listing.listingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                              data-testid={`link-zillow-${listing.zpid || idx}`}
                            >
                              View on Zillow <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm">
                  <CardContent className="p-8 text-center">
                    <Search size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Zillow Rental Listings</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                      {zillowRentals?.dataSource === 'fallback_estimates'
                        ? 'Select a specific city from the dropdown above to search for live Zillow rental listings. The API key may need a plan that includes search endpoints.'
                        : 'No rental listings found for this area. Try selecting a different city.'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {marketAnalytics && marketAnalytics.historicalTimeSeries.length > 0 && (
                <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-blue-500" />
                      Market Trends — {rentalCity}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={marketAnalytics.historicalTimeSeries.filter(p => p.type === 'zhvi').slice(-24)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Home Value']} />
                        <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
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

          {/* Competitors Tab - Real Data */}
          <TabsContent value="competitors">
            <div className="space-y-6">
              {marketStats && marketStats.competitors.length > 0 ? (
                <>
                  <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-indigo-600" />
                        Live Competitor Listings ({marketStats.competitors.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm" data-testid="table-competitors">
                          <thead>
                            <tr className="border-b text-left text-muted-foreground">
                              <th className="pb-3 font-medium">Property</th>
                              <th className="pb-3 font-medium">Rent</th>
                              <th className="pb-3 font-medium">Eff. Rent</th>
                              <th className="pb-3 font-medium">Beds</th>
                              <th className="pb-3 font-medium">DOM</th>
                              <th className="pb-3 font-medium">Concession</th>
                            </tr>
                          </thead>
                          <tbody>
                            {marketStats.competitors.map((comp, i) => (
                              <tr key={i} className="border-b last:border-0" data-testid={`row-competitor-${i}`}>
                                <td className="py-3">
                                  <div className="font-medium">{comp.name}</div>
                                  {comp.city && <div className="text-xs text-muted-foreground">{comp.city}</div>}
                                </td>
                                <td className="py-3">{formatMoney(comp.rent)}</td>
                                <td className="py-3">
                                  {comp.effectivePrice && comp.effectivePrice !== comp.rent ? (
                                    <span className="text-green-600 font-medium">{formatMoney(comp.effectivePrice)}</span>
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </td>
                                <td className="py-3">{comp.bedrooms ?? '—'}</td>
                                <td className="py-3">
                                  <Badge variant={comp.daysOnMarket > 30 ? 'destructive' : 'outline'} className="text-xs">
                                    {comp.daysOnMarket}d
                                  </Badge>
                                </td>
                                <td className="py-3">
                                  {comp.concession !== 'None' ? (
                                    <Badge variant="secondary" className="text-green-600 text-xs">
                                      <Tag className="w-3 h-3 mr-1" />
                                      {comp.concession}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">None</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg" data-testid="card-your-rent">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-muted-foreground">Your Rent</span>
                        </div>
                        <div className="text-2xl font-bold" data-testid="text-your-rent">{formatMoney(currentRent)}</div>
                      </CardContent>
                    </Card>
                    <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg" data-testid="card-market-median">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-5 h-5 text-purple-600" />
                          <span className="text-sm text-muted-foreground">Market Median</span>
                        </div>
                        <div className="text-2xl font-bold" data-testid="text-market-median">
                          {medianRent > 0 ? formatMoney(medianRent) : 'N/A'}
                        </div>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {currentRent > medianRent ? 'Above median' : 'Below median'}
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
                          {formatMoney(Math.max(0, currentRent - medianRent * 0.9))}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">per month</div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : statsLoading ? (
                <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="animate-pulse space-y-4">
                      <div className="h-6 bg-muted rounded w-1/3 mx-auto" />
                      <div className="h-40 bg-muted rounded" />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                  <CardContent className="p-8 text-center">
                    <Building className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No competitor data available yet.</p>
                    <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-3">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights">
            <div className="space-y-6">
              {/* Dynamic insights based on real data */}
              {marketStats ? (
                <Card className="border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg" data-testid="card-ai-recommendation">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-6 h-6" />
                      <h3 className="text-lg font-bold">AI Market Analysis</h3>
                    </div>
                    <Badge className="bg-white/20 text-white mb-3">
                      {concessionRate > 30 ? 'NEGOTIATE AGGRESSIVELY' :
                       concessionRate > 15 ? 'GOOD OPPORTUNITY' :
                       avgDOM > 30 ? 'SLOW MARKET LEVERAGE' : 'STANDARD MARKET'}
                    </Badge>
                    <p className="opacity-90 mb-4" data-testid="text-recommendation-reasoning">
                      {concessionRate > 30
                        ? `${concessionRate}% of tracked properties are offering concessions — this is a strong buyer's market. Use competing offers as leverage.`
                        : concessionRate > 15
                        ? `${concessionRate}% of listings have concessions with ${avgDOM}-day average DOM. Moderate negotiation leverage available.`
                        : `Market is competitive with only ${concessionRate}% of listings offering concessions. Focus on timing and profile strength.`}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white/10 rounded-lg p-4">
                        <div className="text-sm opacity-80">Potential Monthly Savings</div>
                        <div className="text-2xl font-bold" data-testid="text-expected-savings">
                          {formatMoney(Math.max(0, currentRent - medianRent * 0.9))}/mo
                        </div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <div className="text-sm opacity-80">Annual Impact</div>
                        <div className="text-2xl font-bold" data-testid="text-annual-impact">
                          {formatMoney(Math.max(0, (currentRent - medianRent * 0.9) * 12))}/yr
                        </div>
                      </div>
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
                    <p className="text-muted-foreground">Loading market data for personalized recommendations...</p>
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
                      { title: 'Offer a Longer Lease', desc: 'Propose an 18-24 month lease in exchange for 8-12% rent reduction. Landlords value tenant stability.', icon: Calendar, color: 'text-purple-600' },
                      { title: 'Time Your Move', desc: 'Sign during winter months (Nov-Feb) when demand is lowest and landlords are eager to fill vacancies.', icon: Activity, color: 'text-indigo-600' },
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
                    {[
                      {
                        insightType: 'leverage',
                        severity: concessionRate > 30 ? 'high' as const : 'medium' as const,
                        title: 'Concession Leverage',
                        description: `${marketStats?.propertiesWithConcessions || 0} properties are currently offering concessions (${concessionRate}% of market). ${concessionRate > 30 ? 'This is unusually high — landlords are competing for tenants.' : 'Use these as data points in negotiations.'}`,
                        actionable: 'Reference specific concessions from competing properties when negotiating your lease.',
                        confidence: 0.85,
                        savingsPotential: Math.max(0, currentRent - medianRent * 0.9)
                      },
                      {
                        insightType: 'timing',
                        severity: avgDOM > 30 ? 'high' as const : 'medium' as const,
                        title: 'Days on Market Opportunity',
                        description: `Average listing stays on market for ${avgDOM} days. ${avgDOM > 30 ? 'Properties are sitting — landlords face vacancy costs and are more willing to negotiate.' : 'Market is moving at a normal pace.'}`,
                        actionable: 'Target properties that have been listed 30+ days for maximum negotiation leverage.',
                        confidence: 0.8,
                        savingsPotential: avgDOM > 30 ? 200 : 100
                      },
                      {
                        insightType: 'seasonal',
                        severity: 'low' as const,
                        title: 'Seasonal Opportunity',
                        description: 'Winter months historically offer the best negotiation leverage. Demand drops and landlords face pressure to fill vacancies before spring.',
                        actionable: 'Plan lease renewals for November through February for maximum savings.',
                        confidence: 0.7,
                        savingsPotential: 200
                      }
                    ].map((insight, i) => (
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
                            <Badge variant="outline" className="text-xs">{Math.round(insight.confidence * 100)}% confidence</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                        <div className="text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                          <span className="font-medium">Action:</span> {insight.actionable}
                        </div>
                        {insight.savingsPotential > 0 && (
                          <div className="text-xs text-green-600 font-medium mt-2" data-testid={`text-savings-${i}`}>
                            Potential savings: {formatMoney(insight.savingsPotential)}/mo
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
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Markets</SelectItem>
                        {(marketStats?.cities || []).map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
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
