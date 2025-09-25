import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Calculator, 
  TrendingUp, 
  PiggyBank, 
  Clock,
  Check,
  X,
  ArrowRight,
  DollarSign
} from 'lucide-react';

interface RentVsBuyAnalyzerProps {
  propertyValue: number;
  currentRent: number;
  location: string;
  className?: string;
}

interface AnalysisResult {
  timeframe: number;
  downPayment: number;
  monthlyMortgage: number;
  totalRentCost: number;
  totalBuyCost: number;
  equityBuilt: number;
  breakEvenMonth: number;
  recommendation: 'rent' | 'buy' | 'neutral';
  monthlyDifference: number;
  upfrontCost: number;
  netWorthDifference: number;
}

export const RentVsBuyAnalyzer: React.FC<RentVsBuyAnalyzerProps> = ({
  propertyValue,
  currentRent,
  location,
  className = ""
}) => {
  const [timeframe, setTimeframe] = useState(5);
  const [downPaymentPercent, setDownPaymentPercent] = useState([20]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const calculateAnalysis = (): AnalysisResult => {
    const downPayment = propertyValue * (downPaymentPercent[0] / 100);
    const loanAmount = propertyValue - downPayment;
    const interestRate = 0.07; // 7% mortgage rate
    const monthlyRate = interestRate / 12;
    const totalPayments = timeframe * 12;
    
    // Monthly mortgage payment (principal + interest)
    const monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                           (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
    // Additional monthly costs for buying
    const propertyTax = (propertyValue * 0.015) / 12; // 1.5% annual
    const insurance = (propertyValue * 0.005) / 12; // 0.5% annual
    const maintenance = propertyValue * 0.01 / 12; // 1% annual
    const hoa = 150; // Average HOA
    
    const totalMonthlyBuyCost = monthlyMortgage + propertyTax + insurance + maintenance + hoa;
    
    // Closing costs and upfront expenses
    const closingCosts = propertyValue * 0.03; // 3%
    const upfrontCost = downPayment + closingCosts;
    
    // Total costs over timeframe
    const totalRentCost = currentRent * totalPayments;
    const totalBuyCost = (totalMonthlyBuyCost * totalPayments) + upfrontCost;
    
    // Equity calculation
    const principalPaid = loanAmount - (loanAmount * Math.pow(1 + monthlyRate, totalPayments) - 
                         monthlyMortgage * ((Math.pow(1 + monthlyRate, totalPayments) - 1) / monthlyRate));
    const appreciation = propertyValue * Math.pow(1.03, timeframe) - propertyValue; // 3% annual
    const equityBuilt = downPayment + principalPaid + appreciation;
    
    // Net worth difference (equity - extra costs)
    const netWorthDifference = equityBuilt - (totalBuyCost - totalRentCost);
    
    // Break-even calculation
    const monthlyDifference = totalMonthlyBuyCost - currentRent;
    const breakEvenMonth = monthlyDifference > 0 ? 
      Math.ceil(upfrontCost / monthlyDifference) : 0;
    
    // Recommendation logic
    let recommendation: 'rent' | 'buy' | 'neutral' = 'neutral';
    if (netWorthDifference > 50000 && breakEvenMonth < 60) {
      recommendation = 'buy';
    } else if (netWorthDifference < -20000 || breakEvenMonth > 84) {
      recommendation = 'rent';
    }
    
    return {
      timeframe,
      downPayment,
      monthlyMortgage: totalMonthlyBuyCost,
      totalRentCost,
      totalBuyCost,
      equityBuilt,
      breakEvenMonth,
      recommendation,
      monthlyDifference,
      upfrontCost,
      netWorthDifference
    };
  };

  useEffect(() => {
    setAnalysis(calculateAnalysis());
  }, [propertyValue, currentRent, timeframe, downPaymentPercent]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'buy': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'rent': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      default: return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
    }
  };

  const getRecommendationText = (rec: string) => {
    switch (rec) {
      case 'buy': return 'Buying is recommended';
      case 'rent': return 'Renting is recommended';
      default: return 'Consider your priorities';
    }
  };

  if (!analysis) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Calculator className="w-5 h-5 text-primary" />
                Rent vs Buy Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {location} • {formatCurrency(propertyValue)} property
              </p>
            </div>
            
            {/* Timeframe Selector */}
            <div className="flex gap-2">
              {[3, 5, 10].map((years) => (
                <Button
                  key={years}
                  variant={timeframe === years ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe(years)}
                  className="transition-all hover:scale-105"
                >
                  {years} years
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Down Payment Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Down Payment: {downPaymentPercent[0]}%
              </label>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(propertyValue * (downPaymentPercent[0] / 100))}
              </span>
            </div>
            <Slider
              value={downPaymentPercent}
              onValueChange={setDownPaymentPercent}
              max={30}
              min={5}
              step={5}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Banner */}
      <Card className={`${getRecommendationColor(analysis.recommendation)} border transition-all hover:shadow-lg`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">
                {getRecommendationText(analysis.recommendation)}
              </h3>
              <p className="text-sm opacity-80 mt-1">
                Based on {timeframe}-year analysis with {downPaymentPercent[0]}% down
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {analysis.netWorthDifference > 0 ? '+' : ''}
                {formatCurrency(Math.abs(analysis.netWorthDifference))}
              </div>
              <div className="text-sm opacity-80">
                {analysis.netWorthDifference > 0 ? 'Better' : 'Worse'} net worth
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rent Card */}
        <Card className="bg-card border-border transition-all hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Home className="w-5 h-5" />
              Continue Renting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Monthly rent</span>
                <span className="font-medium">{formatCurrency(currentRent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total over {timeframe} years</span>
                <span className="font-bold text-lg">{formatCurrency(analysis.totalRentCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Upfront cost</span>
                <span className="font-medium text-green-600">{formatCurrency(currentRent * 2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Equity built</span>
                <span className="font-medium text-red-600">{formatCurrency(0)}</span>
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
                  <span>More flexibility to move</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="w-4 h-4" />
                  <span>No maintenance costs</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buy Card */}
        <Card className="bg-card border-border transition-all hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-green-600">
              <PiggyBank className="w-5 h-5" />
              Purchase Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Monthly payment</span>
                <span className="font-medium">{formatCurrency(analysis.monthlyMortgage)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total over {timeframe} years</span>
                <span className="font-bold text-lg">{formatCurrency(analysis.totalBuyCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Upfront cost</span>
                <span className="font-medium text-red-600">{formatCurrency(analysis.upfrontCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Equity built</span>
                <span className="font-medium text-green-600">{formatCurrency(analysis.equityBuilt)}</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <h4 className="font-medium text-foreground mb-2">Advantages</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="w-4 h-4" />
                  <span>Build equity & wealth</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="w-4 h-4" />
                  <span>Tax deductions available</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="w-4 h-4" />
                  <span>Stable monthly payments</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Break-Even Analysis */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="w-5 h-5 text-primary" />
            Break-Even Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {Math.round(analysis.breakEvenMonth)}
              </div>
              <div className="text-sm text-muted-foreground">Months to break even</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {analysis.monthlyDifference > 0 ? '+' : ''}
                {formatCurrency(Math.abs(analysis.monthlyDifference))}
              </div>
              <div className="text-sm text-muted-foreground">Monthly difference</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {((analysis.equityBuilt / analysis.totalBuyCost) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Equity return rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Financial Requirements (Buy)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recommended income</span>
              <span className="font-medium">{formatCurrency(analysis.monthlyMortgage * 3 * 12)}/year</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Credit score needed</span>
              <span className="font-medium">680+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Debt-to-income ratio</span>
              <span className="font-medium">≤ 43%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Emergency fund</span>
              <span className="font-medium">{formatCurrency(analysis.monthlyMortgage * 6)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Key Considerations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 mt-1 text-primary" />
              <div>
                <div className="font-medium text-sm">Time horizon</div>
                <div className="text-xs text-muted-foreground">
                  Buying works better for {timeframe}+ year stays
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 mt-1 text-primary" />
              <div>
                <div className="font-medium text-sm">Market conditions</div>
                <div className="text-xs text-muted-foreground">
                  Current rates: ~7%, appreciation: ~3%
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Home className="w-4 h-4 mt-1 text-primary" />
              <div>
                <div className="font-medium text-sm">Lifestyle impact</div>
                <div className="text-xs text-muted-foreground">
                  Consider maintenance, location flexibility
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {analysis.recommendation === 'buy' ? (
          <>
            <Button className="flex-1 gap-2 transition-all hover:scale-105">
              <ArrowRight className="w-4 h-4" />
              Get Pre-approved for Mortgage
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <Calculator className="w-4 h-4" />
              Find Properties in Budget
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" className="flex-1 gap-2 transition-all hover:scale-105">
              <ArrowRight className="w-4 h-4" />
              Explore Rental Options
            </Button>
            <Button className="flex-1 gap-2">
              <TrendingUp className="w-4 h-4" />
              Build Credit & Savings
            </Button>
          </>
        )}
      </div>
    </div>
  );
};