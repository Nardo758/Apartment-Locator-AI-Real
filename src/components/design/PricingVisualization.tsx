import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

// Interactive pricing chart component
export const PricingChart = ({ data, title }: { data: any[], title: string }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>Price trends over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end space-x-2">
          {data.map((point, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${(point.value / maxValue) * 100}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-md relative group cursor-pointer"
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-2 py-1 rounded text-xs">
                ${point.value.toLocaleString()}
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
                {point.label}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Revenue impact visualization
export const RevenueImpactViz = ({ 
  current, 
  projected, 
  timeline 
}: { 
  current: number; 
  projected: number; 
  timeline: any[] 
}) => {
  const improvement = ((projected - current) / current) * 100;
  
  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center text-green-800">
          <DollarSign className="h-5 w-5 mr-2" />
          Revenue Impact Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Current Annual</p>
            <p className="text-3xl font-bold text-gray-900">${current.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Projected Annual</p>
            <p className="text-3xl font-bold text-green-600">${projected.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Revenue Improvement</span>
            <Badge className="bg-green-100 text-green-800">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{improvement.toFixed(1)}%
            </Badge>
          </div>
          <Progress value={Math.min(improvement, 100)} className="h-3" />
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Monthly Progression</h4>
          <div className="grid grid-cols-6 gap-2">
            {timeline.slice(0, 6).map((month, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-600 mb-1">M{index + 1}</div>
                <div className="h-8 bg-gradient-to-t from-green-200 to-green-400 rounded relative">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 to-green-300 rounded"
                    style={{ height: `${(month.scenarioRevenue / month.baseRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Risk assessment visualization
export const RiskVisualization = ({ riskProfile }: { riskProfile: any }) => {
  const getRiskColor = (score: number) => {
    if (score >= 80) return 'from-red-500 to-red-600';
    if (score >= 60) return 'from-orange-500 to-orange-600';
    if (score >= 40) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  return (
    <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center text-red-800">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Portfolio Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Overall risk score */}
        <div className="text-center mb-6">
          <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getRiskColor(riskProfile.overallRiskScore)} mx-auto flex items-center justify-center`}>
            <span className="text-2xl font-bold text-white">{riskProfile.overallRiskScore}</span>
          </div>
          <p className="text-lg font-semibold mt-2">{getRiskLevel(riskProfile.overallRiskScore)} Risk</p>
        </div>

        {/* Risk categories */}
        <div className="space-y-3">
          {riskProfile.riskCategories?.map((category: any, index: number) => (
            <div key={index} className="bg-white rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium capitalize">{category.category}</span>
                <Badge className={`${
                  category.riskScore >= 60 ? 'bg-red-100 text-red-800' :
                  category.riskScore >= 40 ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {category.riskScore}
                </Badge>
              </div>
              <Progress value={category.riskScore} className="h-2 mb-1" />
              <p className="text-xs text-gray-600">{category.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ML Performance visualization
export const MLPerformanceViz = ({ metrics, predictions }: { metrics: any, predictions: any[] }) => {
  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center text-purple-800">
          <CheckCircle className="h-5 w-5 mr-2" />
          ML Model Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{(metrics.accuracy * 100).toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Model Accuracy</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{metrics.trainingDataSize}</p>
            <p className="text-sm text-gray-600">Training Samples</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Recent Predictions</h4>
          {predictions.slice(0, 3).map((prediction, index) => (
            <div key={index} className="bg-white rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Optimal Price</span>
                <Badge className="bg-purple-100 text-purple-800">
                  {Math.round(prediction.confidence * 100)}% confidence
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">${prediction.optimalPrice}</span>
                <span className="text-sm text-gray-600">{prediction.expectedDaysToLease} days</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Competitor comparison visualization
export const CompetitorComparison = ({ competitors, targetUnit }: { competitors: any[], targetUnit: any }) => {
  const sortedCompetitors = [...competitors].sort((a, b) => b.similarityScore - a.similarityScore);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Competitive Positioning</CardTitle>
        <CardDescription>Your position vs top competitors</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Target unit */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-blue-900">Your Unit</h4>
                <p className="text-sm text-blue-700">{targetUnit.bedrooms}BR • {targetUnit.sqft} sqft</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-900">${targetUnit.currentRent}</p>
                <Badge className="bg-blue-100 text-blue-800 mt-1">Target</Badge>
              </div>
            </div>
          </div>

          {/* Competitors */}
          {sortedCompetitors.slice(0, 4).map((competitor, index) => (
            <motion.div
              key={competitor.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{competitor.propertyName}</h4>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(competitor.similarityScore * 100)}% match
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {competitor.bedrooms}BR • {competitor.sqft} sqft • {competitor.distanceFromTarget}mi
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">${competitor.currentRent}</p>
                  <div className="flex items-center mt-1">
                    {competitor.currentRent > targetUnit.currentRent ? (
                      <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                    )}
                    <span className="text-xs text-gray-600">
                      {competitor.daysOnMarket} days
                    </span>
                  </div>
                </div>
              </div>
              
              {competitor.rentChangePercent && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <Badge className={`text-xs ${
                    competitor.rentChangePercent > 0 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    Recent: {competitor.rentChangePercent > 0 ? '+' : ''}{competitor.rentChangePercent}%
                  </Badge>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Automation status visualization
export const AutomationStatus = ({ automationStats, pendingActions }: { automationStats: any, pendingActions: any[] }) => {
  return (
    <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-800">
          <Clock className="h-5 w-5 mr-2" />
          Automation Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{automationStats?.executedToday || 15}</p>
            <p className="text-xs text-gray-600">Actions Today</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{automationStats?.successRate || 92}%</p>
            <p className="text-xs text-gray-600">Success Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{pendingActions?.length || 2}</p>
            <p className="text-xs text-gray-600">Pending</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Recent Automated Actions</h4>
          <div className="space-y-2">
            {[
              { unit: '001', action: 'Price reduced to $2,650', time: '2 mins ago', status: 'completed' },
              { unit: '003', action: 'Seasonal adjustment applied', time: '15 mins ago', status: 'completed' },
              { unit: '007', action: 'Awaiting approval for 8% reduction', time: '1 hour ago', status: 'pending' }
            ].map((action, index) => (
              <div key={index} className="flex items-center justify-between bg-white rounded p-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">Unit {action.unit}</p>
                  <p className="text-xs text-gray-600">{action.action}</p>
                </div>
                <div className="text-right">
                  <Badge className={
                    action.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }>
                    {action.status}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">{action.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};