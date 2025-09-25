import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Home, 
  Calculator, 
  TrendingUp, 
  PiggyBank, 
  Clock,
  Check,
  X,
  ArrowRight,
  DollarSign,
  AlertTriangle,
  Target,
  BarChart3,
  Lightbulb,
  Shield,
  Zap,
  MapPin,
  Calendar,
  CreditCard,
  Briefcase,
  TrendingDown
} from 'lucide-react';
import { 
  RentVsBuyAnalyzer, 
  RenterProfile, 
  PropertyScenario, 
  MarketConditions,
  RentVsBuyResult,
  RentVsBuyUtils
} from '@/lib/rent-vs-buy-analysis';

interface RentVsBuyAnalysisProps {
  propertyValue?: number;
  currentRent?: number;
  location?: string;
  className?: string;
}

export const RentVsBuyAnalysis: React.FC<RentVsBuyAnalysisProps> = ({
  propertyValue = 400000,
  currentRent = 2500,
  location = "San Francisco, CA",
  className = ""
}) => {
  // State for user inputs
  const [renterProfile, setRenterProfile] = useState<RenterProfile>({
    income: 85000,
    creditScore: 720,
    currentRent: currentRent,
    savings: 100000,
    monthlyDebt: 800,
    employmentStability: 'stable',
    timeHorizon: 7,
    locationFlexibility: 'medium',
    riskTolerance: 'moderate'
  });

  const [propertyScenario, setPropertyScenario] = useState<PropertyScenario>({
    propertyValue: propertyValue,
    currentRent: currentRent,
    location: location,
    propertyTax: propertyValue * 0.015, // 1.5% annually
    hoaFees: 200,
    maintenanceCosts: propertyValue * 0.01, // 1% annually
    appreciationRate: 0.04, // 4% annually
    rentGrowthRate: 0.05, // 5% annually
    downPaymentOptions: [10, 15, 20, 25, 30]
  });

  const [marketConditions, setMarketConditions] = useState<MarketConditions>({
    mortgageRate: 0.07, // 7%
    inflationRate: 0.03, // 3%
    localMarketTrend: 'normal',
    inventoryLevels: 0.08,
    priceToRentRatio: propertyValue / (currentRent * 12),
    economicOutlook: 'stable',
    seasonality: 0.1
  });

  const [selectedDownPayment, setSelectedDownPayment] = useState([20]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Analysis results
  const analyzer = useMemo(() => RentVsBuyAnalyzer.getInstance(), []);
  
  const analysis = useMemo(() => {
    return analyzer.analyzeRentVsBuy(renterProfile, propertyScenario, marketConditions);
  }, [renterProfile, propertyScenario, marketConditions, analyzer]);

  const affordability = useMemo(() => {
    return analyzer.assessAffordability(renterProfile, propertyScenario, marketConditions);
  }, [renterProfile, propertyScenario, marketConditions, analyzer]);

  const taxImplications = useMemo(() => {
    return analyzer.calculateTaxImplications(propertyScenario, renterProfile, marketConditions);
  }, [propertyScenario, renterProfile, marketConditions, analyzer]);

  // Helper functions
  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'buy': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'rent': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      default: return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'buy': return <Home className="w-5 h-5" />;
      case 'rent': return <MapPin className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getRecommendationText = (rec: string) => {
    switch (rec) {
      case 'buy': return 'Buying is recommended';
      case 'rent': return 'Renting is recommended';
      default: return 'Consider your priorities';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const currentProjection = analysis.projections[renterProfile.timeHorizon - 1];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Key Metrics */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-none">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl text-foreground">
                <Calculator className="w-6 h-6 text-primary" />
                Smart Rent vs Buy Analysis
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {location} • {RentVsBuyUtils.formatCurrency(propertyScenario.propertyValue)} property
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Time Horizon</div>
                <div className="text-xl font-bold text-foreground">{renterProfile.timeHorizon} years</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Confidence</div>
                <div className="text-xl font-bold text-foreground">{Math.round(analysis.confidence * 100)}%</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Recommendation Banner */}
      <Card className={`${getRecommendationColor(analysis.recommendation)} border transition-all hover:shadow-lg`}>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              {getRecommendationIcon(analysis.recommendation)}
              <div>
                <h3 className="font-semibold text-lg">
                  {getRecommendationText(analysis.recommendation)}
                </h3>
                <p className="text-sm opacity-80 mt-1">
                  Based on {renterProfile.timeHorizon}-year analysis with {Math.round(analysis.confidence * 100)}% confidence
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold">
                {analysis.summary.netWorthAdvantage > 0 ? '+' : ''}
                {RentVsBuyUtils.formatCurrency(Math.abs(analysis.summary.netWorthAdvantage))}
              </div>
              <div className="text-sm opacity-80">
                {analysis.summary.netWorthAdvantage > 0 ? 'Better' : 'Worse'} net worth vs {analysis.recommendation === 'buy' ? 'renting' : 'buying'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="affordability">Affordability</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Difference</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analysis.summary.monthlyDifference > 0 ? '+' : ''}
                  {RentVsBuyUtils.formatCurrency(Math.abs(analysis.summary.monthlyDifference))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analysis.summary.monthlyDifference > 0 ? 'More to buy' : 'More to rent'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Break-Even Point</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analysis.breakEvenPoint} years
                </div>
                <p className="text-xs text-muted-foreground">
                  When buying becomes better
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Final Equity</CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {RentVsBuyUtils.formatCurrency(analysis.summary.finalEquity)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Home equity after {renterProfile.timeHorizon} years
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold capitalize ${getRiskColor(analysis.riskAnalysis.overallRiskLevel)}`}>
                  {analysis.riskAnalysis.overallRiskLevel}
                </div>
                <p className="text-xs text-muted-foreground">
                  Overall investment risk
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Side-by-Side Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rent Card */}
            <Card className="bg-card border-border transition-all hover:shadow-lg hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <MapPin className="w-5 h-5" />
                  Continue Renting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly rent</span>
                    <span className="font-medium">{RentVsBuyUtils.formatCurrency(renterProfile.currentRent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total over {renterProfile.timeHorizon} years</span>
                    <span className="font-bold text-lg">{RentVsBuyUtils.formatCurrency(analysis.summary.totalCostRent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Upfront cost</span>
                    <span className="font-medium text-green-600">{RentVsBuyUtils.formatCurrency(renterProfile.currentRent * 2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Equity built</span>
                    <span className="font-medium text-red-600">{RentVsBuyUtils.formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Investment opportunity</span>
                    <span className="font-medium text-green-600">
                      {RentVsBuyUtils.formatCurrency(currentProjection?.rentScenario.opportunityCost || 0)}
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium text-foreground mb-2">Advantages</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span>Lower upfront costs</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span>Maximum flexibility to move</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span>No maintenance responsibilities</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span>Investment diversification potential</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Buy Card */}
            <Card className="bg-card border-border transition-all hover:shadow-lg hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Home className="w-5 h-5" />
                  Purchase Property
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly payment</span>
                    <span className="font-medium">{RentVsBuyUtils.formatCurrency(analysis.summary.monthlyDifference + renterProfile.currentRent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total over {renterProfile.timeHorizon} years</span>
                    <span className="font-bold text-lg">{RentVsBuyUtils.formatCurrency(analysis.summary.totalCostBuy)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Upfront cost</span>
                    <span className="font-medium text-red-600">{RentVsBuyUtils.formatCurrency(affordability.recommendedDownPayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Equity built</span>
                    <span className="font-medium text-green-600">{RentVsBuyUtils.formatCurrency(analysis.summary.finalEquity)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tax savings</span>
                    <span className="font-medium text-green-600">
                      {RentVsBuyUtils.formatCurrency(taxImplications.totalTaxSavings)}
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium text-foreground mb-2">Advantages</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span>Build equity & long-term wealth</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span>Tax deductions available</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span>Stable monthly payments</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span>Complete control over property</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Affordability Tab */}
        <TabsContent value="affordability" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Qualification Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Can Afford Property</span>
                  <Badge className={affordability.canAfford ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'}>
                    {affordability.canAfford ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Qualification Probability</span>
                      <span className="font-medium">{Math.round(affordability.qualificationProbability * 100)}%</span>
                    </div>
                    <Progress value={affordability.qualificationProbability * 100} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Max Affordable Price:</span>
                      <div className="font-medium">{RentVsBuyUtils.formatCurrency(affordability.maxAffordablePrice)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Required Income:</span>
                      <div className="font-medium">{RentVsBuyUtils.formatCurrency(affordability.requiredIncome)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Debt-to-Income:</span>
                      <div className="font-medium">{RentVsBuyUtils.formatPercentage(affordability.debtToIncomeRatio)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Down Payment:</span>
                      <div className="font-medium">{RentVsBuyUtils.formatCurrency(affordability.recommendedDownPayment)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Financial Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emergency fund needed</span>
                  <span className="font-medium">{RentVsBuyUtils.formatCurrency(affordability.emergencyFundNeeded)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly payment range</span>
                  <span className="font-medium">
                    {RentVsBuyUtils.formatCurrency(affordability.monthlyPaymentRange.min)} - {RentVsBuyUtils.formatCurrency(affordability.monthlyPaymentRange.max)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current savings</span>
                  <span className="font-medium">{RentVsBuyUtils.formatCurrency(renterProfile.savings)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credit score</span>
                  <span className="font-medium">{renterProfile.creditScore}</span>
                </div>
                
                {!affordability.canAfford && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium text-yellow-800">Affordability Concerns</div>
                        <div className="text-yellow-700 mt-1">
                          Consider building savings, improving credit, or looking at lower-priced properties.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Affordability Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Adjust Your Profile</CardTitle>
              <p className="text-sm text-muted-foreground">
                Modify these values to see how they impact affordability
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Annual Income: {RentVsBuyUtils.formatCurrency(renterProfile.income)}
                    </label>
                    <Slider
                      value={[renterProfile.income]}
                      onValueChange={([value]) => setRenterProfile(prev => ({ ...prev, income: value }))}
                      max={200000}
                      min={30000}
                      step={5000}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Credit Score: {renterProfile.creditScore}
                    </label>
                    <Slider
                      value={[renterProfile.creditScore]}
                      onValueChange={([value]) => setRenterProfile(prev => ({ ...prev, creditScore: value }))}
                      max={850}
                      min={500}
                      step={10}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Savings: {RentVsBuyUtils.formatCurrency(renterProfile.savings)}
                    </label>
                    <Slider
                      value={[renterProfile.savings]}
                      onValueChange={([value]) => setRenterProfile(prev => ({ ...prev, savings: value }))}
                      max={300000}
                      min={10000}
                      step={5000}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Monthly Debt: {RentVsBuyUtils.formatCurrency(renterProfile.monthlyDebt)}
                    </label>
                    <Slider
                      value={[renterProfile.monthlyDebt]}
                      onValueChange={([value]) => setRenterProfile(prev => ({ ...prev, monthlyDebt: value }))}
                      max={3000}
                      min={0}
                      step={50}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projections Tab */}
        <TabsContent value="projections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {renterProfile.timeHorizon}-Year Financial Projections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Timeline Selector */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-sm font-medium">Time Horizon:</span>
                  {[5, 7, 10, 15].map((years) => (
                    <Button
                      key={years}
                      variant={renterProfile.timeHorizon === years ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRenterProfile(prev => ({ ...prev, timeHorizon: years }))}
                    >
                      {years} years
                    </Button>
                  ))}
                </div>

                {/* Projections Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Year</th>
                        <th className="text-right py-2">Rent Cost</th>
                        <th className="text-right py-2">Buy Cost</th>
                        <th className="text-right py-2">Home Value</th>
                        <th className="text-right py-2">Equity</th>
                        <th className="text-right py-2">Net Worth Diff</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.projections.map((projection, index) => (
                        <tr key={projection.year} className="border-b">
                          <td className="py-2 font-medium">{projection.year}</td>
                          <td className="text-right py-2">
                            {RentVsBuyUtils.formatCurrency(projection.rentScenario.cumulativeCost)}
                          </td>
                          <td className="text-right py-2">
                            {RentVsBuyUtils.formatCurrency(projection.buyScenario.totalPaid * projection.year)}
                          </td>
                          <td className="text-right py-2">
                            {RentVsBuyUtils.formatCurrency(projection.buyScenario.homeValue)}
                          </td>
                          <td className="text-right py-2">
                            {RentVsBuyUtils.formatCurrency(projection.buyScenario.equity)}
                          </td>
                          <td className={`text-right py-2 font-medium ${
                            projection.difference.netWorthDifference > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {projection.difference.netWorthDifference > 0 ? '+' : ''}
                            {RentVsBuyUtils.formatCurrency(Math.abs(projection.difference.netWorthDifference))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <MapPin className="w-5 h-5" />
                  Renting Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.riskAnalysis.rentRisks.map((risk, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{risk}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Home className="w-5 h-5" />
                  Buying Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.riskAnalysis.buyRisks.map((risk, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{risk}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Overall Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Risk Level</span>
                <Badge className={`${getRiskColor(analysis.riskAnalysis.overallRiskLevel)} capitalize`}>
                  {analysis.riskAnalysis.overallRiskLevel} Risk
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {analysis.riskAnalysis.overallRiskLevel === 'low' && 
                  "Low risk scenario - favorable conditions for either renting or buying based on personal preferences."}
                {analysis.riskAnalysis.overallRiskLevel === 'medium' && 
                  "Medium risk scenario - carefully consider market conditions and personal financial stability."}
                {analysis.riskAnalysis.overallRiskLevel === 'high' && 
                  "High risk scenario - proceed with caution and consider waiting for better conditions."}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Personalized Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.personalizedInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{insight}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.actionItems.map((action, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tax Implications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Tax Implications (Buying)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mortgage Interest Deduction:</span>
                  <span className="font-medium text-green-600">
                    {RentVsBuyUtils.formatCurrency(taxImplications.mortgageInterestDeduction)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property Tax Deduction:</span>
                  <span className="font-medium text-green-600">
                    {RentVsBuyUtils.formatCurrency(taxImplications.propertyTaxDeduction)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Annual Tax Savings:</span>
                  <span className="font-medium text-green-600">
                    {RentVsBuyUtils.formatCurrency(taxImplications.totalTaxSavings)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capital Gains Exemption:</span>
                  <span className="font-medium text-green-600">
                    {RentVsBuyUtils.formatCurrency(taxImplications.capitalGainsExemption)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {analysis.recommendation === 'buy' && affordability.canAfford ? (
          <>
            <Button className="flex-1 gap-2 transition-all hover:scale-105">
              <ArrowRight className="w-4 h-4" />
              Get Pre-approved for Mortgage
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <Home className="w-4 h-4" />
              Start House Hunting
            </Button>
          </>
        ) : analysis.recommendation === 'buy' && !affordability.canAfford ? (
          <>
            <Button variant="outline" className="flex-1 gap-2">
              <TrendingUp className="w-4 h-4" />
              Improve Financial Position
            </Button>
            <Button className="flex-1 gap-2">
              <Calculator className="w-4 h-4" />
              Explore Lower-Priced Options
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" className="flex-1 gap-2 transition-all hover:scale-105">
              <MapPin className="w-4 h-4" />
              Explore Rental Options
            </Button>
            <Button className="flex-1 gap-2">
              <PiggyBank className="w-4 h-4" />
              Build Savings & Credit
            </Button>
          </>
        )}
      </div>
    </div>
  );
};