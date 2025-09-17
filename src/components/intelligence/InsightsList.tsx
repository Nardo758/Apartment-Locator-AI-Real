import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  BarChart3, 
  AlertCircle, 
  Zap, 
  Calendar,
  TrendingUp,
  Home
} from 'lucide-react';
import type { RenterInsight } from '@/lib/redfin-scraper';

interface InsightsListProps {
  insights: RenterInsight[];
  className?: string;
}

export const InsightsList: React.FC<InsightsListProps> = ({ insights, className = '' }) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'leverage':
        return <Target className="w-4 h-4 text-green-500" />;
      case 'timing':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'seasonal':
        return <BarChart3 className="w-4 h-4 text-purple-500" />;
      case 'ownership':
        return <Home className="w-4 h-4 text-orange-500" />;
      case 'geographic':
        return <TrendingUp className="w-4 h-4 text-indigo-500" />;
      default:
        return <Zap className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-600 border-green-500/30';
      default:
        return 'bg-muted/50 text-muted-foreground border-border';
    }
  };

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'leverage':
        return 'bg-green-500/10 text-green-600';
      case 'timing':
        return 'bg-blue-500/10 text-blue-600';
      case 'seasonal':
        return 'bg-purple-500/10 text-purple-600';
      case 'ownership':
        return 'bg-orange-500/10 text-orange-600';
      case 'geographic':
        return 'bg-indigo-500/10 text-indigo-600';
      default:
        return 'bg-yellow-500/10 text-yellow-600';
    }
  };

  const formatInsightType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (insights.length === 0) {
    return (
      <Card className={`bg-card border-border ${className}`}>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>No insights available at the moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-500" />
          AI Market Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className="p-4 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start gap-3 mb-3">
              {getInsightIcon(insight.insightType)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-foreground text-sm">{insight.title}</h4>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getSeverityColor(insight.severity)}`}
                  >
                    {insight.severity} impact
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getInsightTypeColor(insight.insightType)}`}
                  >
                    {formatInsightType(insight.insightType)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(insight.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              {insight.description}
            </p>

            {insight.actionable && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md mb-2">
                <p className="text-sm text-blue-600 font-medium">
                  💡 {insight.actionable}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              {insight.savingsPotential && (
                <span className="text-sm text-green-600 font-medium">
                  Potential savings: ${insight.savingsPotential.toFixed(0)}/month
                </span>
              )}
              
              {insight.expiresAt && (
                <span className="text-xs text-orange-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Expires: {insight.expiresAt.toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Intelligence Summary */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{insights.length} insights generated</span>
            <span>Updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};