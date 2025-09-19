import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import type { PricingRecommendation } from '@/lib/pricing-engine';

interface PricingRecommendationCardProps {
  recommendation: PricingRecommendation;
  unitName?: string;
}

export const PricingRecommendationCard: React.FC<PricingRecommendationCardProps> = ({ 
  recommendation, 
  unitName 
}) => {
  const getStrategyIcon = () => {
    switch (recommendation.strategy) {
      case 'aggressive_reduction':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'moderate_reduction':
        return <TrendingDown className="h-4 w-4 text-orange-500" />;
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStrategyColor = () => {
    switch (recommendation.strategy) {
      case 'aggressive_reduction': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate_reduction': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'hold': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'increase': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = () => {
    switch (recommendation.urgencyLevel) {
      case 'immediate': return 'bg-red-100 text-red-800 border-red-200';
      case 'soon': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyIcon = () => {
    switch (recommendation.urgencyLevel) {
      case 'immediate':
        return <AlertTriangle className="h-4 w-4" />;
      case 'soon':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center space-x-2">
              {getStrategyIcon()}
              <span>{unitName || `Unit ${recommendation.unitId}`}</span>
            </CardTitle>
            <CardDescription>
              {recommendation.strategy.replace('_', ' ').charAt(0).toUpperCase() + 
               recommendation.strategy.replace('_', ' ').slice(1)} strategy
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Badge className={getUrgencyColor()}>
              <div className="flex items-center space-x-1">
                {getUrgencyIcon()}
                <span>{recommendation.urgencyLevel}</span>
              </div>
            </Badge>
            <Badge className={getStrategyColor()}>
              {recommendation.strategy.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Pricing Recommendation */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-700">Pricing Recommendation</span>
            <span className="text-xs text-blue-600">
              {Math.round(recommendation.confidenceScore * 100)}% confidence
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-blue-900">
                ${recommendation.suggestedRent.toLocaleString()}
              </div>
              <div className="text-sm text-blue-700">
                from ${recommendation.currentRent.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xl font-bold ${
                recommendation.adjustmentPercent >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {recommendation.adjustmentPercent > 0 ? '+' : ''}{recommendation.adjustmentPercent}%
              </div>
              <div className="text-sm text-gray-600">
                ${Math.abs(recommendation.adjustmentAmount).toLocaleString()} change
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Impact */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Annual Revenue</span>
            </div>
            <div className="text-lg font-bold text-green-900">
              ${recommendation.revenueImpact.suggestedAnnualRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-green-700">
              vs ${recommendation.revenueImpact.currentAnnualRevenue.toLocaleString()} current
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Lease Timeline</span>
            </div>
            <div className="text-lg font-bold text-purple-900">
              {recommendation.expectedLeaseDays} days
            </div>
            {recommendation.leaseTimeline && (
              <div className="text-xs text-purple-700">
                {recommendation.leaseTimeline.accelerationFactor}x faster
              </div>
            )}
          </div>
        </div>

        {/* Net Benefit */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Net Annual Benefit</span>
            <span className="text-sm text-gray-600">
              includes vacancy savings
            </span>
          </div>
          <div className={`text-xl font-bold ${
            recommendation.revenueImpact.netBenefit >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            ${recommendation.revenueImpact.netBenefit.toLocaleString()}
          </div>
          <Progress 
            value={Math.min(100, Math.abs(recommendation.revenueImpact.netBenefit) / 10000 * 100)}
            className="mt-2"
          />
        </div>

        {/* Market Timing & Lease Probabilities */}
        {recommendation.leaseTimeline && (
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="text-sm font-medium text-yellow-700 mb-2">
              Lease Probability Timeline
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-center">
                <div className="font-medium">Week 1</div>
                <div className="text-yellow-800">
                  {Math.round(recommendation.leaseTimeline.probabilityByWeek.week1 * 100)}%
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium">Week 2</div>
                <div className="text-yellow-800">
                  {Math.round(recommendation.leaseTimeline.probabilityByWeek.week2 * 100)}%
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium">Week 4</div>
                <div className="text-yellow-800">
                  {Math.round(recommendation.leaseTimeline.probabilityByWeek.week4 * 100)}%
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium">Week 8</div>
                <div className="text-yellow-800">
                  {Math.round(recommendation.leaseTimeline.probabilityByWeek.week8 * 100)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reasoning */}
        <div className="border-t pt-3">
          <div className="text-sm font-medium text-gray-700 mb-1">AI Reasoning</div>
          <div className="text-sm text-gray-600">
            {recommendation.reasoning.join(' • ')}
          </div>
        </div>

        {/* Market Timing Badge */}
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-xs">
            Market Timing: {recommendation.marketTiming}
          </Badge>
          {recommendation.revenueImpact.breakEvenDays > 0 && (
            <span className="text-xs text-gray-500">
              Break-even: {recommendation.revenueImpact.breakEvenDays} days
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingRecommendationCard;