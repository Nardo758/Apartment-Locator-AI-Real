import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, DollarSign, TrendingUp, Calculator } from 'lucide-react';
import type { OwnershipAnalysis } from '@/lib/unified-rental-intelligence';

interface OwnershipAnalysisCardProps {
  ownershipAnalysis: OwnershipAnalysis;
  className?: string;
}

export const OwnershipAnalysisCard: React.FC<OwnershipAnalysisCardProps> = ({
  ownershipAnalysis,
  className = ''
}) => {
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'buy':
        return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'negotiate':
        return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      case 'rent':
        return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      default:
        return 'bg-muted/50 text-muted-foreground border-border';
    }
  };

  const formatRecommendation = (recommendation: string) => {
    switch (recommendation) {
      case 'buy':
        return 'Consider Buying';
      case 'negotiate':
        return 'Negotiate Aggressively';
      case 'rent':
        return 'Continue Renting';
      default:
        return recommendation;
    }
  };

  const rentToOwnershipRatio = ownershipAnalysis.currentRent / ownershipAnalysis.estimatedOwnershipCost;
  const monthlyDifference = ownershipAnalysis.currentRent - ownershipAnalysis.estimatedOwnershipCost;

  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="w-5 h-5 text-orange-500" />
          Rent vs Buy Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Current Rent</p>
            <p className="text-2xl font-bold text-foreground">
              ${ownershipAnalysis.currentRent.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Ownership Cost</p>
            <p className="text-2xl font-bold text-foreground">
              ${ownershipAnalysis.estimatedOwnershipCost.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Landlord Profit</p>
            <p className="text-2xl font-bold text-green-600">
              ${ownershipAnalysis.landlordMonthlyProfit.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Profit Margin</p>
            <p className="text-2xl font-bold text-foreground">
              {(ownershipAnalysis.landlordProfitMargin * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">landlord margin</p>
          </div>
        </div>

        {/* Financial Comparison */}
        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-blue-500" />
            <h4 className="font-semibold text-foreground">Financial Analysis</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Rent vs Ownership Ratio:</span>
              <span className="ml-2 font-semibold text-foreground">
                {rentToOwnershipRatio.toFixed(2)}x
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Monthly Difference:</span>
              <span className={`ml-2 font-semibold ${monthlyDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {monthlyDifference > 0 ? '+' : ''}${monthlyDifference.toFixed(0)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Break-even Rent:</span>
              <span className="ml-2 font-semibold text-foreground">
                ${ownershipAnalysis.breakEvenRent.toFixed(0)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Rent-to-Value Ratio:</span>
              <span className="ml-2 font-semibold text-foreground">
                {(ownershipAnalysis.rentToValueRatio * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className={`border rounded-lg p-4 ${getRecommendationColor(ownershipAnalysis.recommendation)}`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" />
            <h4 className="font-semibold">
              {formatRecommendation(ownershipAnalysis.recommendation)}
            </h4>
          </div>
          
          {ownershipAnalysis.recommendation === 'buy' && (
            <p className="text-sm mb-2">
              Ownership costs are significantly lower than rent. Consider buying if you can secure financing.
            </p>
          )}
          
          {ownershipAnalysis.recommendation === 'negotiate' && (
            <p className="text-sm mb-2">
              High landlord profit margin provides strong negotiation leverage. Target 15-25% rent reduction.
            </p>
          )}
          
          {ownershipAnalysis.recommendation === 'rent' && (
            <p className="text-sm mb-2">
              Current rent is close to market ownership costs. Focus on other factors for decisions.
            </p>
          )}
        </div>

        {/* Leverage Insights */}
        <div>
          <h4 className="font-semibold mb-3 text-foreground">Leverage Insights</h4>
          <ul className="space-y-2">
            {ownershipAnalysis.leverageInsights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Negotiation Score */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <span className="text-sm font-medium text-foreground">Negotiation Leverage Score</span>
          <Badge variant="outline" className="text-sm font-semibold">
            {ownershipAnalysis.negotiationLeverage.toFixed(0)}/100
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};