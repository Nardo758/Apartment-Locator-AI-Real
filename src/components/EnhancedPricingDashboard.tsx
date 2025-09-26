import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Target, 
  BarChart3,
  Brain,
  Shield,
  Zap,
  Eye,
  Settings,
  Activity,
  Users,
  MapPin,
  Calendar,
  Lightbulb,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { usePricingIntelligence } from '@/hooks/usePricingIntelligence';
import { 
  PricingEngine, 
  MLPricingIntelligence, 
  type PricingRecommendation,
  type MLPricingModel,
  type CompetitorData,
  type RiskAssessment,
  type AutomationRule
} from '@/lib/pricing-engine';
import { designSystem, createCard, createHeading, createStatusBadge, getDataVizColor } from '@/lib/design-system';

interface EnhancedPricingDashboardProps {
  properties: Array<{
    id: string;
    apartmentIQData?: unknown;
    price?: number;
    daysOnMarket?: number;
    marketVelocity?: 'hot' | 'normal' | 'slow' | 'stale';
    concessionUrgency?: 'none' | 'standard' | 'aggressive' | 'desperate';
  }>;
  enableMLFeatures?: boolean;
  enableAutomation?: boolean;
}

export const EnhancedPricingDashboard: React.FC<EnhancedPricingDashboardProps> = ({ 
  properties, 
  enableMLFeatures = true,
  enableAutomation = true 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [mlEnabled, setMlEnabled] = useState(enableMLFeatures);
  const [automationEnabled, setAutomationEnabled] = useState(enableAutomation);
  const [refreshing, setRefreshing] = useState(false);
  const [competitorData, setCompetitorData] = useState<Map<string, CompetitorData[]>>(new Map());
  const [mlModels, setMlModels] = useState<Map<string, MLPricingModel>>(new Map());
  const [riskAssessments, setRiskAssessments] = useState<Map<string, RiskAssessment>>(new Map());
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);

  const {
    recommendations,
    portfolioSummary,
    loading,
    error,
    getPortfolioInsights,
    getRecommendationsByUrgency,
    getRecommendationsByStrategy
  } = usePricingIntelligence(properties);

  const mlIntelligence = useMemo(() => MLPricingIntelligence.getInstance(), []);

  // Initialize ML features and competitor monitoring
  const initializeMLFeatures = useCallback(async () => {
    setRefreshing(true);
    try {
      const newCompetitorData = new Map<string, CompetitorData[]>();
      const newMlModels = new Map<string, MLPricingModel>();
      const newRiskAssessments = new Map<string, RiskAssessment>();

      for (const property of properties) {
        const data = property.apartmentIQData;
        if (data && typeof data === 'object') {
          // treat as the expected ApartmentIQData at runtime
          const typedData = data as unknown as Parameters<typeof mlIntelligence.generateMLPricingModel>[0];

          // Fetch competitor data
          const competitors = await mlIntelligence.fetchCompetitorData(typedData);
          newCompetitorData.set(property.id, competitors);

          // Generate ML pricing model
          const mlModel = await mlIntelligence.generateMLPricingModel(typedData);
          newMlModels.set(property.id, mlModel);

          // Generate risk assessment
          const riskAssessment = mlIntelligence.generateRiskAssessment(
            typedData, 
            competitors
          );
          newRiskAssessments.set(property.id, riskAssessment);
        }
      }

      setCompetitorData(newCompetitorData);
      setMlModels(newMlModels);
      setRiskAssessments(newRiskAssessments);
    } catch (error) {
      console.error('Failed to initialize ML features:', error);
    } finally {
      setRefreshing(false);
    }
  }, [mlIntelligence, properties]);

  const initializeAutomationRules = useCallback(() => {
    const defaultRules: AutomationRule[] = [
      {
        id: 'urgent-reduction',
        name: 'Urgent Price Reduction',
        conditions: {
          daysOnMarket: 30,
          concessionLevel: ['desperate', 'aggressive']
        },
        actions: {
          priceAdjustment: -0.08,
          alertManagement: true,
          autoApply: false
        },
        enabled: true,
        priority: 10
      },
      {
        id: 'competitor-response',
        name: 'Competitor Response',
        conditions: {
          competitorActivity: true,
          marketVelocity: ['slow', 'stale']
        },
        actions: {
          priceAdjustment: -0.05,
          addConcessions: ['1 month free'],
          alertManagement: true,
          autoApply: false
        },
        enabled: true,
        priority: 8
      },
      {
        id: 'hot-market-premium',
        name: 'Hot Market Premium',
        conditions: {
          marketVelocity: ['hot'],
          daysOnMarket: 7
        },
        actions: {
          priceAdjustment: 0.03,
          alertManagement: true,
          autoApply: false
        },
        enabled: true,
        priority: 6
      }
    ];

    setAutomationRules(defaultRules);
    
    // Add rules to ML intelligence
    defaultRules.forEach(rule => {
      mlIntelligence.addAutomationRule(rule);
    });
  }, [mlIntelligence]);

  useEffect(() => {
    if (mlEnabled && properties.length > 0) {
      initializeMLFeatures();
    }
  }, [mlEnabled, properties, initializeMLFeatures]);

  // Initialize automation rules
  useEffect(() => {
    if (automationEnabled) {
      initializeAutomationRules();
    }
  }, [automationEnabled, initializeAutomationRules]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Analyzing pricing opportunities with AI...</span>
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

  // ML-enhanced insights
  const mlInsights = Array.from(mlModels.values()).map(model => ({
    confidence: model.confidence,
    optimalPrice: model.prediction.optimalPrice,
    riskScore: model.prediction.riskScore
  }));

  const averageMLConfidence = mlInsights.length > 0 
    ? mlInsights.reduce((sum, insight) => sum + insight.confidence, 0) / mlInsights.length 
    : 0;

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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      case 'critical': return 'text-red-700 font-bold';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={designSystem.spacing.content}>
      {/* Enhanced Header with ML Controls */}
      <div className={`${createCard('primary', false)} ${designSystem.spacing.cardPaddingLarge}`}>
        <div className={`${designSystem.layouts.flexBetween} ${designSystem.spacing.gapMedium} flex-col lg:flex-row`}>
          <div className={designSystem.layouts.stackSmall}>
            <div className={`${designSystem.layouts.flex} ${designSystem.spacing.gapSmall} items-center`}>
              <Brain className={`${designSystem.icons.large} ${designSystem.colors.secondary}`} />
              <h2 className={`${designSystem.typography.heading2} ${designSystem.colors.text}`}>
                AI-Powered Pricing Intelligence
              </h2>
            </div>
            <p className={`${designSystem.typography.bodyMuted}`}>
              Advanced ML algorithms with competitor monitoring and risk assessment
            </p>
          </div>
          
          <div className={`${designSystem.layouts.flex} ${designSystem.spacing.gapMedium} items-center flex-wrap`}>
            <div className={`${designSystem.layouts.flex} ${designSystem.spacing.gapSmall} items-center`}>
              <Brain className={designSystem.icons.small} />
              <span className={`${designSystem.typography.label} ${designSystem.colors.textMuted}`}>ML Engine</span>
              <Switch 
                checked={mlEnabled} 
                onCheckedChange={setMlEnabled}
              />
            </div>
            <div className={`${designSystem.layouts.flex} ${designSystem.spacing.gapSmall} items-center`}>
              <Zap className={designSystem.icons.small} />
              <span className={`${designSystem.typography.label} ${designSystem.colors.textMuted}`}>Automation</span>
              <Switch 
                checked={automationEnabled} 
                onCheckedChange={setAutomationEnabled}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={initializeMLFeatures}
              disabled={refreshing}
              className={`${designSystem.buttons.outline} ${designSystem.spacing.gapSmall}`}
            >
              <RefreshCw className={`${designSystem.icons.small} ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Portfolio Overview */}
      <div className={`${designSystem.layouts.gridFive} ${designSystem.spacing.gapMedium}`}>
        <div className={`${createCard('default', true)} ${designSystem.spacing.cardPadding}`}>
          <div className={`${designSystem.layouts.flexBetween} ${designSystem.spacing.itemsSmall}`}>
            <div className={designSystem.layouts.stackSmall}>
              <p className={`${designSystem.typography.labelSmall} ${designSystem.colors.textMuted}`}>Total Revenue Impact</p>
              <div className={`${designSystem.typography.heading4} ${designSystem.colors.text} font-bold`}>
                ${portfolioSummary.totalImpact.toLocaleString()}
              </div>
              <p className={`${designSystem.typography.captionSmall} ${designSystem.colors.textLight}`}>
                Annual revenue change
              </p>
            </div>
            <DollarSign className={`${designSystem.icons.medium} ${designSystem.colors.success}`} />
          </div>
        </div>

        <div className={`${createCard('default', true)} ${designSystem.spacing.cardPadding}`}>
          <div className={`${designSystem.layouts.flexBetween} ${designSystem.spacing.itemsSmall}`}>
            <div className={designSystem.layouts.stackSmall}>
              <p className={`${designSystem.typography.labelSmall} ${designSystem.colors.textMuted}`}>ML Confidence</p>
              <div className={`${designSystem.typography.heading4} ${designSystem.colors.text} font-bold`}>
                {Math.round(averageMLConfidence * 100)}%
              </div>
              <Progress 
                value={averageMLConfidence * 100} 
                className="mt-2 h-2"
                style={{ backgroundColor: getDataVizColor(0, 'primary') }}
              />
            </div>
            <Brain className={`${designSystem.icons.medium} ${designSystem.colors.secondary}`} />
          </div>
        </div>

        <div className={`${createCard('default', true)} ${designSystem.spacing.cardPadding}`}>
          <div className={`${designSystem.layouts.flexBetween} ${designSystem.spacing.itemsSmall}`}>
            <div className={designSystem.layouts.stackSmall}>
              <p className={`${designSystem.typography.labelSmall} ${designSystem.colors.textMuted}`}>Competitor Threats</p>
              <div className={`${designSystem.typography.heading4} ${designSystem.colors.text} font-bold`}>
                {Array.from(competitorData.values()).reduce((sum, competitors) => 
                  sum + competitors.filter(c => c.daysOnMarket < 14).length, 0)}
              </div>
              <p className={`${designSystem.typography.captionSmall} ${designSystem.colors.textLight}`}>
                Active competitors
              </p>
            </div>
            <Eye className={`${designSystem.icons.medium} ${designSystem.colors.warning}`} />
          </div>
        </div>

        <div className={`${createCard('default', true)} ${designSystem.spacing.cardPadding}`}>
          <div className={`${designSystem.layouts.flexBetween} ${designSystem.spacing.itemsSmall}`}>
            <div className={designSystem.layouts.stackSmall}>
              <p className={`${designSystem.typography.labelSmall} ${designSystem.colors.textMuted}`}>High Risk Units</p>
              <div className={`${designSystem.typography.heading4} ${designSystem.colors.text} font-bold`}>
                {Array.from(riskAssessments.values()).filter(r => 
                  r.overallRisk === 'high' || r.overallRisk === 'critical').length}
              </div>
              <p className={`${designSystem.typography.captionSmall} ${designSystem.colors.textLight}`}>
                Require attention
              </p>
            </div>
            <Shield className={`${designSystem.icons.medium} ${designSystem.colors.error}`} />
          </div>
        </div>

        <div className={`${createCard('default', true)} ${designSystem.spacing.cardPadding}`}>
          <div className={`${designSystem.layouts.flexBetween} ${designSystem.spacing.itemsSmall}`}>
            <div className={designSystem.layouts.stackSmall}>
              <p className={`${designSystem.typography.labelSmall} ${designSystem.colors.textMuted}`}>Automation Rules</p>
              <div className={`${designSystem.typography.heading4} ${designSystem.colors.text} font-bold`}>
                {automationRules.filter(r => r.enabled).length}
              </div>
              <p className={`${designSystem.typography.captionSmall} ${designSystem.colors.textLight}`}>
                Active rules
              </p>
            </div>
            <Zap className={`${designSystem.icons.medium} ${designSystem.colors.info}`} />
          </div>
        </div>
      </div>

      {/* Enhanced Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full grid-cols-3 lg:grid-cols-6 ${designSystem.backgrounds.card} ${designSystem.radius.large} ${designSystem.spacing.marginMedium}`}>
          <TabsTrigger value="overview" className={designSystem.typography.labelSmall}>Overview</TabsTrigger>
          <TabsTrigger value="ml-insights" className={designSystem.typography.labelSmall}>ML Insights</TabsTrigger>
          <TabsTrigger value="competitors" className={designSystem.typography.labelSmall}>Competitors</TabsTrigger>
          <TabsTrigger value="risk-analysis" className={designSystem.typography.labelSmall}>Risk Analysis</TabsTrigger>
          <TabsTrigger value="automation" className={designSystem.typography.labelSmall}>Automation</TabsTrigger>
          <TabsTrigger value="recommendations" className={designSystem.typography.labelSmall}>Actions</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Enhanced */}
        <TabsContent value="overview" className="space-y-4">
          {/* Key Insights with ML Enhancement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                AI-Enhanced Portfolio Insights
              </CardTitle>
              <CardDescription>
                Machine learning insights combined with traditional analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
                
                {mlEnabled && mlInsights.length > 0 && (
                  <>
                    <div className="flex items-start space-x-2">
                      <Brain className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                      <p className="text-sm">
                        ML models predict an average confidence of {Math.round(averageMLConfidence * 100)}% 
                        across all recommendations
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Brain className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                      <p className="text-sm">
                        Competitor activity detected in {Array.from(competitorData.values()).filter(c => c.length > 0).length} markets
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Immediate Actions with ML Enhancements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                AI-Prioritized Immediate Actions
              </CardTitle>
              <CardDescription>
                Units requiring action within 7 days based on ML analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {immediateActions.length === 0 ? (
                <p className="text-gray-500">No immediate actions required</p>
              ) : (
                <div className="space-y-3">
                  {immediateActions.slice(0, 10).map((rec) => {
                    const mlModel = mlModels.get(rec.unitId);
                    const riskAssessment = riskAssessments.get(rec.unitId);
                    
                    return (
                      <div key={rec.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">Unit {rec.unitId}</h4>
                            <p className="text-sm text-gray-600">{rec.reasoning.join(' • ')}</p>
                            {mlEnabled && mlModel && (
                              <div className="flex items-center gap-2 mt-1">
                                <Brain className="w-3 h-3 text-purple-500" />
                                <span className="text-xs text-purple-600">
                                  ML Optimal: ${mlModel.prediction.optimalPrice} 
                                  (Risk: {Math.round(mlModel.prediction.riskScore * 100)}%)
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={getStrategyColor(rec.strategy)}>
                              {rec.strategy.replace('_', ' ')}
                            </Badge>
                            {riskAssessment && (
                              <Badge className={`${getRiskColor(riskAssessment.overallRisk)} text-xs`}>
                                {riskAssessment.overallRisk} risk
                              </Badge>
                            )}
                          </div>
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
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ML Insights Tab */}
        <TabsContent value="ml-insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Machine Learning Analysis
              </CardTitle>
              <CardDescription>
                Advanced AI predictions and feature analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.from(mlModels.entries()).slice(0, 6).map(([unitId, model]) => (
                  <div key={unitId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium">Unit {unitId}</h4>
                      <Badge className="bg-purple-100 text-purple-800">
                        {Math.round(model.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>ML Optimal Price:</span>
                          <span className="font-medium">${model.prediction.optimalPrice}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Price Range:</span>
                          <span className="font-medium">
                            ${model.prediction.priceRange.min} - ${model.prediction.priceRange.max}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Risk Score:</span>
                          <span className={`font-medium ${getRiskColor(
                            model.prediction.riskScore > 0.7 ? 'high' : 
                            model.prediction.riskScore > 0.4 ? 'medium' : 'low'
                          )}`}>
                            {Math.round(model.prediction.riskScore * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">ML Features:</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Market Trend:</span>
                            <div className="font-medium">{Math.round(model.features.marketTrend * 100)}%</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Demand Signal:</span>
                            <div className="font-medium">{Math.round(model.features.demandSignal * 100)}%</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Seasonality:</span>
                            <div className="font-medium">{Math.round(model.features.seasonality * 100)}%</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Competition:</span>
                            <div className="font-medium">{Math.round(model.features.competitorActivity * 100)}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competitors Tab */}
        <TabsContent value="competitors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Competitor Intelligence
              </CardTitle>
              <CardDescription>
                Real-time competitor monitoring and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from(competitorData.entries()).slice(0, 5).map(([unitId, competitors]) => (
                  <div key={unitId} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Unit {unitId} - Competitor Analysis</h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {competitors.slice(0, 3).map((competitor, index) => (
                        <div key={competitor.propertyId} className="border rounded p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium">Competitor {index + 1}</span>
                            <Badge className="text-xs">
                              {Math.round(competitor.similarityScore * 100)}% match
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Distance:</span>
                              <span>{competitor.distance} miles</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Rent:</span>
                              <span className="font-medium">${competitor.currentRent}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Days on Market:</span>
                              <span className={competitor.daysOnMarket < 14 ? 'text-red-600 font-medium' : ''}>
                                {competitor.daysOnMarket} days
                              </span>
                            </div>
                            {competitor.concessions.length > 0 && (
                              <div className="mt-2">
                                <span className="text-gray-500 text-xs">Concessions:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {competitor.concessions.map((concession, idx) => (
                                    <Badge key={idx} className="text-xs bg-yellow-100 text-yellow-800">
                                      {concession}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risk-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                AI Risk Assessment
              </CardTitle>
              <CardDescription>
                Comprehensive risk analysis for each unit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.from(riskAssessments.entries()).slice(0, 6).map(([unitId, assessment]) => (
                  <div key={unitId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium">Unit {unitId}</h4>
                      <Badge className={`${getRiskColor(assessment.overallRisk)} capitalize`}>
                        {assessment.overallRisk} Risk
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium mb-2">Risk Factors:</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Market Volatility:</span>
                            <div className="font-medium">{Math.round(assessment.riskFactors.marketVolatility * 100)}%</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Competitor Pressure:</span>
                            <div className="font-medium">{Math.round(assessment.riskFactors.competitorPressure * 100)}%</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Seasonal Risk:</span>
                            <div className="font-medium">{Math.round(assessment.riskFactors.seasonalRisk * 100)}%</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Economic Indicators:</span>
                            <div className="font-medium">{Math.round(assessment.riskFactors.economicIndicators * 100)}%</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-2">Mitigation Strategies:</h5>
                        <div className="space-y-1">
                          {assessment.mitigationStrategies.slice(0, 2).map((strategy, index) => (
                            <div key={index} className="text-xs text-gray-600 flex items-start gap-1">
                              <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span>{strategy}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Pricing Automation Rules
              </CardTitle>
              <CardDescription>
                Configure automated pricing adjustments based on market conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{rule.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Priority: {rule.priority}/10
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {rule.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                        <Switch 
                          checked={rule.enabled}
                          onCheckedChange={(checked) => {
                            setAutomationRules(prev => 
                              prev.map(r => r.id === rule.id ? { ...r, enabled: checked } : r)
                            );
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium mb-2">Conditions:</h5>
                        <div className="space-y-1 text-xs">
                          {rule.conditions.daysOnMarket && (
                            <div>• Days on Market ≥ {rule.conditions.daysOnMarket}</div>
                          )}
                          {rule.conditions.marketVelocity && (
                            <div>• Market Velocity: {rule.conditions.marketVelocity.join(', ')}</div>
                          )}
                          {rule.conditions.concessionLevel && (
                            <div>• Concession Level: {rule.conditions.concessionLevel.join(', ')}</div>
                          )}
                          {rule.conditions.competitorActivity && (
                            <div>• Active competitor presence</div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Actions:</h5>
                        <div className="space-y-1 text-xs">
                          {rule.actions.priceAdjustment && (
                            <div>• Price adjustment: {rule.actions.priceAdjustment > 0 ? '+' : ''}{Math.round(rule.actions.priceAdjustment * 100)}%</div>
                          )}
                          {rule.actions.addConcessions && (
                            <div>• Add concessions: {rule.actions.addConcessions.join(', ')}</div>
                          )}
                          {rule.actions.alertManagement && (
                            <div>• Alert management team</div>
                          )}
                          <div>• Auto-apply: {rule.actions.autoApply ? 'Yes' : 'No'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Enhanced Pricing Recommendations</CardTitle>
              <CardDescription>
                Complete analysis with ML insights and competitor intelligence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.values(recommendations).map((rec) => {
                  const mlModel = mlModels.get(rec.unitId);
                  const competitors = competitorData.get(rec.unitId) || [];
                  const riskAssessment = riskAssessments.get(rec.unitId);
                  
                  return (
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
                            {riskAssessment && (
                              <Badge className={`${getRiskColor(riskAssessment.overallRisk)} text-xs`}>
                                {riskAssessment.overallRisk} risk
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            ${rec.currentRent} → ${rec.suggestedRent}
                          </div>
                          <div className="text-sm text-gray-600">
                            {rec.adjustmentPercent > 0 ? '+' : ''}{rec.adjustmentPercent}%
                          </div>
                          {mlModel && (
                            <div className="text-xs text-purple-600 mt-1">
                              ML: ${mlModel.prediction.optimalPrice}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
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
                        <div>
                          <span className="text-gray-500">Competitors:</span>
                          <div className="font-medium">{competitors.length} nearby</div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <strong>Reasoning:</strong> {rec.reasoning.join(' • ')}
                      </div>
                      
                      {mlEnabled && mlModel && (
                        <div className="mt-2 p-2 bg-purple-50 rounded text-xs">
                          <strong className="text-purple-700">ML Analysis:</strong> 
                          <span className="text-purple-600 ml-1">
                            {Math.round(mlModel.confidence * 100)}% confidence, 
                            Risk Score: {Math.round(mlModel.prediction.riskScore * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedPricingDashboard;