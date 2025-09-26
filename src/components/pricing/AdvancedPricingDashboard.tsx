import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Clock, Target, BarChart3 } from 'lucide-react';
import { usePricingIntelligence } from '@/hooks/usePricingIntelligence';
import type { PricingRecommendation, ApartmentIQData } from '@/lib/pricing-engine';

interface AdvancedPricingDashboardProps {
  properties: Array<{
    id: string;
    apartmentIQData?: ApartmentIQData;
    price?: number;
    daysOnMarket?: number;
    marketVelocity?: 'hot' | 'normal' | 'slow' | 'stale';
    concessionUrgency?: 'none' | 'standard' | 'aggressive' | 'desperate';
  }>;
}

export const AdvancedPricingDashboard: React.FC<AdvancedPricingDashboardProps> = ({ properties }) => {
  const {
    recommendations,
    portfolioSummary,
    loading,
    error,
    getPortfolioInsights,
    getRecommendationsByUrgency,
    getRecommendationsByStrategy
  } = usePricingIntelligence(properties);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Analyzing pricing opportunities...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>Error: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!portfolioSummary) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">No pricing data available</p>
        </CardContent>
      </Card>
    );
  }

  const insights = getPortfolioInsights();
  const immediateActions = getRecommendationsByUrgency('immediate');
  const aggressiveReductions = getRecommendationsByStrategy('aggressive_reduction');
  const increases = getRecommendationsByStrategy('increase');

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'aggressive_reduction': return 'bg-red-100 text-red-800';
      case 'moderate_reduction': return 'bg-orange-100 text-orange-800';
      case 'hold': return 'bg-gray-100 text-gray-800';
      case 'increase': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'bg-red-100 text-red-800';
      case 'soon': return 'bg-orange-100 text-orange-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue Impact</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${portfolioSummary.totalImpact.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Annual revenue change
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacancy Savings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${portfolioSummary.totalVacancySavings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Reduced vacancy costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Benefit</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${portfolioSummary.totalNetBenefit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total optimization value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidence Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(portfolioSummary.averageConfidenceScore * 100)}%
            </div>
            <Progress 
              value={portfolioSummary.averageConfidenceScore * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Insights</CardTitle>
          <CardDescription>
            AI-generated insights based on market analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="urgent" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="urgent">Urgent Actions ({immediateActions.length})</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="recommendations">All Recommendations</TabsTrigger>
          <TabsTrigger value="timeline">Lease Timelines</TabsTrigger>
        </TabsList>

        <TabsContent value="urgent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                Immediate Action Required
              </CardTitle>
              <CardDescription>
                Units that need pricing adjustments within 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {immediateActions.length === 0 ? (
                <p className="text-gray-500">No immediate actions required</p>
              ) : (
                <div className="space-y-3">
                  {immediateActions.slice(0, 10).map((rec) => (
                    <div key={rec.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">Unit {rec.unitId}</h4>
                          <p className="text-sm text-gray-600">{rec.reasoning.join(' • ')}</p>
                        </div>
                        <Badge className={getStrategyColor(rec.strategy)}>
                          {rec.strategy.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Current Rent:</span>
                          <div className="font-medium">${rec.currentRent}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Suggested Rent:</span>
                          <div className="font-medium">${rec.suggestedRent}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Adjustment:</span>
                          <div className="font-medium">
                            {rec.adjustmentPercent > 0 ? '+' : ''}{rec.adjustmentPercent}%
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Expected Lease:</span>
                          <div className="font-medium">{rec.expectedLeaseDays} days</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingDown className="h-5 w-5 mr-2 text-red-500" />
                  Aggressive Reductions ({aggressiveReductions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {aggressiveReductions.slice(0, 5).map((rec) => (
                    <div key={rec.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <span className="font-medium">Unit {rec.unitId}</span>
                      <span className="text-red-600 font-bold">{rec.adjustmentPercent}%</span>
                    </div>
                  ))}
                  {aggressiveReductions.length > 5 && (
                    <p className="text-sm text-gray-500">+{aggressiveReductions.length - 5} more units</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  Price Increases ({increases.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {increases.slice(0, 5).map((rec) => (
                    <div key={rec.id} className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span className="font-medium">Unit {rec.unitId}</span>
                      <span className="text-green-600 font-bold">+{rec.adjustmentPercent}%</span>
                    </div>
                  ))}
                  {increases.length > 5 && (
                    <p className="text-sm text-gray-500">+{increases.length - 5} more units</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Pricing Recommendations</CardTitle>
              <CardDescription>
                Complete analysis of all units in your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.values(recommendations).map((rec) => (
                  <div key={rec.unitId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">Unit {rec.unitId}</h4>
                        <div className="flex space-x-2 mt-1">
                          <Badge className={getStrategyColor(rec.strategy)}>
                            {rec.strategy.replace('_', ' ')}
                          </Badge>
                          <Badge className={getUrgencyColor(rec.urgencyLevel)}>
                            {rec.urgencyLevel}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          ${rec.currentRent} → ${rec.suggestedRent}
                        </div>
                        <div className="text-sm text-gray-600">
                          {rec.adjustmentPercent > 0 ? '+' : ''}{rec.adjustmentPercent}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Revenue Impact:</span>
                        <div className="font-medium">
                          ${rec.revenueImpact.totalImpact.toLocaleString()}/year
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Expected Lease:</span>
                        <div className="font-medium">{rec.expectedLeaseDays} days</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Confidence:</span>
                        <div className="font-medium">{Math.round(rec.confidenceScore * 100)}%</div>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Reasoning:</strong> {rec.reasoning.join(' • ')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Smart Lease Timeline Estimates</CardTitle>
              <CardDescription>
                Predicted lease timelines with and without pricing adjustments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.values(recommendations)
                  .filter(rec => rec.leaseTimeline)
                  .slice(0, 10)
                  .map((rec) => (
                    <div key={rec.unitId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">Unit {rec.unitId}</h4>
                        <Badge className={getUrgencyColor(rec.urgencyLevel)}>
                          {rec.urgencyLevel}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <span className="text-sm text-gray-500">Current Trajectory:</span>
                          <div className="font-medium">{rec.leaseTimeline.currentTrajectoryDays} days</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">With Adjustment:</span>
                          <div className="font-medium">{rec.leaseTimeline.suggestedTrajectoryDays} days</div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-sm text-gray-500">Acceleration Factor:</span>
                        <div className="font-medium text-green-600">
                          {rec.leaseTimeline.accelerationFactor}x faster
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-500 mb-2 block">Lease Probability by Week:</span>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-medium">Week 1</div>
                            <div>{Math.round(rec.leaseTimeline.probabilityByWeek.week1 * 100)}%</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">Week 2</div>
                            <div>{Math.round(rec.leaseTimeline.probabilityByWeek.week2 * 100)}%</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">Week 4</div>
                            <div>{Math.round(rec.leaseTimeline.probabilityByWeek.week4 * 100)}%</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">Week 8</div>
                            <div>{Math.round(rec.leaseTimeline.probabilityByWeek.week8 * 100)}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedPricingDashboard;