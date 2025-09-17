import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

interface LeverageScoreCardProps {
  leverageScore: number;
  recommendation: {
    action: string;
    reasoning: string;
    keyTactics: string[];
    expectedSavings: number;
  };
  dataStatus: {
    marketDataReliability: 'high' | 'medium' | 'low';
    ownershipDataReliability: 'high' | 'medium' | 'low';
    overallConfidence: number;
  };
}

export const LeverageScoreCard: React.FC<LeverageScoreCardProps> = ({
  leverageScore,
  recommendation,
  dataStatus
}) => {
  const getLeverageColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-600 border-green-500/30';
    if (score >= 60) return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
    if (score >= 40) return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
    return 'bg-red-500/20 text-red-600 border-red-500/30';
  };

  const getRecommendationColor = (action: string) => {
    switch (action) {
      case 'buy_immediately': return 'bg-purple-500/20 text-purple-600 border-purple-500/30';
      case 'negotiate_aggressively': return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'rent_and_negotiate': return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      default: return 'bg-muted/50 text-muted-foreground border-border';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'buy_immediately': return <TrendingUp className="w-5 h-5" />;
      case 'negotiate_aggressively': return <Target className="w-5 h-5" />;
      case 'rent_and_negotiate': return <Target className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const formatActionText = (action: string) => {
    return action.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Negotiation Intelligence
          </CardTitle>
          <Badge className={`text-sm font-semibold border ${getLeverageColor(leverageScore)}`}>
            {leverageScore}/100 Leverage
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Status */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>Market Data: {dataStatus.marketDataReliability}</span>
          <span>•</span>
          <span>Ownership Data: {dataStatus.ownershipDataReliability}</span>
          <span>•</span>
          <span>{dataStatus.overallConfidence}% Confidence</span>
        </div>

        {/* Main Recommendation */}
        <div className={`border rounded-lg p-4 ${getRecommendationColor(recommendation.action)}`}>
          <div className="flex items-center gap-2 mb-2">
            {getActionIcon(recommendation.action)}
            <h3 className="font-semibold text-lg">
              {formatActionText(recommendation.action)}
            </h3>
          </div>
          <p className="mb-3">{recommendation.reasoning}</p>
          <div className="text-sm font-medium">
            Expected Monthly Savings: ${recommendation.expectedSavings.toFixed(0)}
          </div>
        </div>

        {/* Key Tactics */}
        <div>
          <h4 className="font-semibold mb-3 text-foreground">Key Negotiation Tactics</h4>
          <ul className="space-y-2">
            {recommendation.keyTactics.map((tactic, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span className="text-sm text-foreground">{tactic}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Confidence Indicator */}
        {dataStatus.overallConfidence < 70 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-yellow-600">
              Lower data confidence. Recommendations are estimates based on available information.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};