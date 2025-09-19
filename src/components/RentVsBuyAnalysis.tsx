import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Home, DollarSign, TrendingUp, TrendingDown, Calculator, 
  PiggyBank, Shield, Clock, Target, AlertTriangle, CheckCircle,
  ArrowRight, BarChart3, Zap, Brain, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RentVsBuyAnalyzer, type RentVsBuyInputs, type RentVsBuyAnalysis } from '@/lib/rent-vs-buy-analysis';

// Recommendation card component
const RecommendationCard = ({ analysis }: { analysis: RentVsBuyAnalysis }) => {
  const getRecommendationColor = () => {
    switch (analysis.recommendation) {
      case 'buy': return 'from-green-500 to-emerald-600';
      case 'rent': return 'from-blue-500 to-cyan-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const getRecommendationIcon = () => {
    switch (analysis.recommendation) {
      case 'buy': return Home;
      case 'rent': return PiggyBank;
      default: return Target;
    }
  };

  const Icon = getRecommendationIcon();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br ${getRecommendationColor()} rounded-xl p-6 text-white`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon className="h-8 w-8" />
          <div>
            <h3 className="text-xl font-bold capitalize">
              {analysis.recommendation === 'neutral' ? 'Both Options Viable' : `${analysis.recommendation} Recommended`}
            </h3>
            <p className="text-white/80 text-sm">
              {Math.round(analysis.confidence * 100)}% confidence
            </p>
          </div>
        </div>
        <Badge className="bg-white/20 text-white border-white/30">
          AI Analysis
        </Badge>
      </div>
      
      <div className="space-y-2">
        {analysis.reasoning.map((reason, index) => (
          <div key={index} className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-white/90">{reason}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Cost comparison component
const CostComparison = ({ analysis }: { analysis: RentVsBuyAnalysis }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Calculator className="h-5 w-5 mr-2 text-blue-500" />
        Cost Comparison
      </CardTitle>
      <CardDescription>
        Total costs over your {analysis.timeline.length} year horizon
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Renting costs */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <PiggyBank className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-blue-800">Renting</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Monthly Payment:</span>
              <span className="font-semibold">${analysis.totalCostComparison.rentingCosts.monthlyPayment}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Upfront Costs:</span>
              <span className="font-semibold">${analysis.totalCostComparison.rentingCosts.upfrontCosts.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Cost:</span>
              <span className="font-bold text-lg">${analysis.totalCostComparison.rentingCosts.totalOverTimeHorizon.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Buying costs */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Home className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-green-800">Buying</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Monthly Payment:</span>
              <span className="font-semibold">${analysis.totalCostComparison.buyingCosts.monthlyPayment}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Upfront Costs:</span>
              <span className="font-semibold">${analysis.totalCostComparison.buyingCosts.upfrontCosts.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Cost:</span>
              <span className="font-bold text-lg">${analysis.totalCostComparison.buyingCosts.totalOverTimeHorizon.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm text-gray-600">Equity Built:</span>
              <span className="font-semibold text-green-600">+${analysis.totalCostComparison.buyingCosts.equityBuilt?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Net difference */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Net Difference:</span>
          <span className={`font-bold text-lg ${
            analysis.totalCostComparison.netDifference < 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {analysis.totalCostComparison.netDifference < 0 ? 'Buying saves ' : 'Renting saves '}
            ${Math.abs(analysis.totalCostComparison.netDifference).toLocaleString()}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Break-even point: {analysis.totalCostComparison.breakEvenPoint} years
        </p>
      </div>
    </CardContent>
  </Card>
);

// Timeline visualization
const TimelineVisualization = ({ timeline }: { timeline: any[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Calendar className="h-5 w-5 mr-2 text-purple-500" />
        Financial Timeline
      </CardTitle>
      <CardDescription>
        How costs and equity change over time
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {timeline.slice(0, 5).map((year, index) => (
          <motion.div
            key={year.year}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border rounded-lg p-4"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold">Year {year.year}</h4>
              <Badge className={
                year.recommendation === 'buy' ? 'bg-green-100 text-green-800' :
                year.recommendation === 'rent' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }>
                {year.recommendation} better
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Renting</p>
                <p className="font-semibold">Monthly: ${year.rentingCosts.monthlyRent}</p>
                <p className="text-gray-600">Cumulative: ${year.rentingCosts.cumulativeCost.toLocaleString()}</p>
                <p className="text-green-600">Investments: ${year.rentingCosts.investmentValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Buying</p>
                <p className="font-semibold">Monthly: ${year.buyingCosts.monthlyPayment}</p>
                <p className="text-gray-600">Cumulative: ${year.buyingCosts.cumulativeCost.toLocaleString()}</p>
                <p className="text-green-600">Equity: ${year.buyingCosts.equityBuilt.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Net Difference:</span>
                <span className={`font-semibold ${
                  year.netDifference < 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${Math.abs(year.netDifference).toLocaleString()} {year.netDifference < 0 ? 'saved' : 'extra'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Personalized insights component
const PersonalizedInsights = ({ insights }: { insights: any[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Brain className="h-5 w-5 mr-2 text-purple-500" />
        Personalized Insights
      </CardTitle>
      <CardDescription>
        AI analysis based on your specific situation
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border-l-4 ${
              insight.impact === 'positive' ? 'border-green-500 bg-green-50' :
              insight.impact === 'negative' ? 'border-red-500 bg-red-50' :
              'border-blue-500 bg-blue-50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-sm capitalize">{insight.category} Insight</h4>
              <div className="flex items-center space-x-1">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full mr-1 ${
                        i < insight.weight / 2 ? 'bg-yellow-400' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">Weight</span>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-2">{insight.insight}</p>
            {insight.recommendation && (
              <div className="bg-white/70 rounded p-2 mt-2">
                <p className="text-xs font-medium text-gray-800">💡 Recommendation:</p>
                <p className="text-xs text-gray-700">{insight.recommendation}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Scenario comparison component
const ScenarioComparison = ({ scenarios }: { scenarios: any[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <BarChart3 className="h-5 w-5 mr-2 text-orange-500" />
        Market Scenarios
      </CardTitle>
      <CardDescription>
        How different market conditions affect your decision
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {scenarios.map((scenario, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold">{scenario.name}</h4>
                <p className="text-sm text-gray-600">Probability: {Math.round(scenario.probability * 100)}%</p>
              </div>
              <Badge className={
                scenario.recommendation === 'buy' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }>
                {scenario.recommendation} better
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <p className="text-gray-600">Renting Outcome:</p>
                <p className="font-semibold">${scenario.rentingOutcome.totalCost.toLocaleString()}</p>
                <p className="text-green-600 text-xs">
                  +${scenario.rentingOutcome.investmentGains.toLocaleString()} investments
                </p>
              </div>
              <div>
                <p className="text-gray-600">Buying Outcome:</p>
                <p className="font-semibold">${scenario.buyingOutcome.totalCost.toLocaleString()}</p>
                <p className="text-green-600 text-xs">
                  +${scenario.buyingOutcome.equityGained.toLocaleString()} equity
                </p>
              </div>
            </div>
            
            <div className="text-xs text-gray-600">
              <p className="font-medium mb-1">Assumptions:</p>
              <ul className="space-y-1">
                {scenario.assumptions.map((assumption: string, i: number) => (
                  <li key={i}>• {assumption}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Affordability analysis component
const AffordabilityAnalysis = ({ inputs, analyzer }: { inputs: RentVsBuyInputs, analyzer: RentVsBuyAnalyzer }) => {
  const affordability = analyzer.getAffordabilityAnalysis(inputs);
  const marketTiming = analyzer.getMarketTiming(inputs);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-500" />
            Affordability Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Rent Affordability</span>
                <span className="font-semibold">{affordability.rentAffordability}%</span>
              </div>
              <Progress value={affordability.rentAffordability} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Buy Affordability</span>
                <span className="font-semibold">{affordability.buyAffordability}%</span>
              </div>
              <Progress value={affordability.buyAffordability} className="h-2" />
            </div>
            
            <div className="bg-gray-50 rounded p-3">
              <p className="text-sm font-medium">Budget Status: 
                <Badge className={`ml-2 ${
                  affordability.budgetStrain === 'comfortable' ? 'bg-green-100 text-green-800' :
                  affordability.budgetStrain === 'stretched' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {affordability.budgetStrain}
                </Badge>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Recommended budget: ${affordability.recommendedBudget.toLocaleString()}/month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-orange-500" />
            Market Timing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Buyer's Market:</span>
              <Badge className={marketTiming.buyerMarket ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {marketTiming.buyerMarket ? 'Yes' : 'No'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Rental Market:</span>
              <Badge className={
                marketTiming.rentalMarket === 'favorable' ? 'bg-green-100 text-green-800' :
                marketTiming.rentalMarket === 'tight' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }>
                {marketTiming.rentalMarket}
              </Badge>
            </div>
            
            <div className="bg-blue-50 rounded p-3">
              <p className="text-sm font-medium text-blue-800">Market Timing:</p>
              <p className="text-xs text-blue-700 mt-1">{marketTiming.timingRecommendation}</p>
              <p className="text-xs text-blue-600 mt-2">
                Confidence: {Math.round(marketTiming.confidence * 100)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main rent vs buy component
export const RentVsBuyAnalysis: React.FC = () => {
  const [inputs, setInputs] = useState<RentVsBuyInputs>({
    // Rental Information
    monthlyRent: 2200,
    rentalDeposit: 4400,
    rentalFees: 500,
    expectedRentIncrease: 4,
    
    // Purchase Information
    homePrice: 450000,
    downPaymentPercent: 20,
    mortgageRate: 6.8,
    loanTermYears: 30,
    
    // Additional Costs
    propertyTaxRate: 1.8,
    homeInsurance: 1200,
    hoaFees: 150,
    maintenancePercent: 1.5,
    closingCosts: 9000,
    
    // Personal Situation
    currentSavings: 120000,
    monthlyIncome: 8500,
    timeHorizon: 5,
    riskTolerance: 'moderate',
    
    // Market Assumptions
    homeAppreciationRate: 3.5,
    investmentReturn: 7,
    taxBracket: 24
  });

  const [analysis, setAnalysis] = useState<RentVsBuyAnalysis | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [analyzer] = useState(() => new RentVsBuyAnalyzer());

  const calculateAnalysis = async () => {
    setIsCalculating(true);
    // Simulate calculation time
    await new Promise(resolve => setTimeout(resolve, 1000));
    const result = analyzer.calculateAnalysis(inputs);
    setAnalysis(result);
    setIsCalculating(false);
  };

  useEffect(() => {
    calculateAnalysis();
  }, [inputs, analyzer]);

  const updateInput = (field: keyof RentVsBuyInputs, value: number | string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Rent vs Buy Analysis
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Make an informed decision with our comprehensive financial analysis tailored to your situation
        </p>
      </motion.div>

      {/* Input form */}
      <Card>
        <CardHeader>
          <CardTitle>Your Situation</CardTitle>
          <CardDescription>
            Enter your details for a personalized analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="monthlyRent">Monthly Rent</Label>
              <Input
                id="monthlyRent"
                type="number"
                value={inputs.monthlyRent}
                onChange={(e) => updateInput('monthlyRent', Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="homePrice">Home Price</Label>
              <Input
                id="homePrice"
                type="number"
                value={inputs.homePrice}
                onChange={(e) => updateInput('homePrice', Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="monthlyIncome">Monthly Income</Label>
              <Input
                id="monthlyIncome"
                type="number"
                value={inputs.monthlyIncome}
                onChange={(e) => updateInput('monthlyIncome', Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="currentSavings">Current Savings</Label>
              <Input
                id="currentSavings"
                type="number"
                value={inputs.currentSavings}
                onChange={(e) => updateInput('currentSavings', Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="timeHorizon">Time Horizon (years)</Label>
              <div className="mt-2">
                <Slider
                  value={[inputs.timeHorizon]}
                  onValueChange={(value) => updateInput('timeHorizon', value[0])}
                  max={15}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 year</span>
                  <span className="font-medium">{inputs.timeHorizon} years</span>
                  <span>15 years</span>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="riskTolerance">Risk Tolerance</Label>
              <Select value={inputs.riskTolerance} onValueChange={(value) => updateInput('riskTolerance', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button 
              onClick={calculateAnalysis} 
              disabled={isCalculating}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Analyze My Situation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis results */}
      <AnimatePresence>
        {analysis && !isCalculating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Recommendation */}
            <RecommendationCard analysis={analysis} />

            {/* Tabs for detailed analysis */}
            <Tabs defaultValue="costs" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="costs">Costs</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="affordability">Affordability</TabsTrigger>
              </TabsList>

              <TabsContent value="costs" className="space-y-6">
                <CostComparison analysis={analysis} />
              </TabsContent>

              <TabsContent value="timeline" className="space-y-6">
                <TimelineVisualization timeline={analysis.timeline} />
              </TabsContent>

              <TabsContent value="scenarios" className="space-y-6">
                <ScenarioComparison scenarios={analysis.scenarios} />
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <PersonalizedInsights insights={analysis.personalizedInsights} />
              </TabsContent>

              <TabsContent value="affordability" className="space-y-6">
                <AffordabilityAnalysis inputs={inputs} analyzer={analyzer} />
              </TabsContent>
            </Tabs>

            {/* Quick summary */}
            <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <Target className="h-5 w-5 mr-2" />
                  Bottom Line
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-900">
                      {analysis.totalCostComparison.breakEvenPoint} years
                    </p>
                    <p className="text-sm text-blue-700">Break-even point</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-900">
                      ${Math.abs(analysis.totalCostComparison.netDifference).toLocaleString()}
                    </p>
                    <p className="text-sm text-blue-700">
                      {analysis.totalCostComparison.netDifference < 0 ? 'Buying saves' : 'Renting saves'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-900">
                      {Math.round(analysis.confidence * 100)}%
                    </p>
                    <p className="text-sm text-blue-700">Confidence level</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RentVsBuyAnalysis;