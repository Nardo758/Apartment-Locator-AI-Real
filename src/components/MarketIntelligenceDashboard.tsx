import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Home, 
  DollarSign, 
  Calculator, 
  BarChart3, 
  Brain, 
  MapPin,
  Calendar,
  Target,
  CheckCircle,
  RefreshCw,
  Building,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUnifiedRentalIntelligence } from '@/hooks/useUnifiedRentalIntelligence';

interface MarketIntelligenceDashboardProps {
  defaultLocation?: string;
  className?: string;
}

export const MarketIntelligenceDashboard: React.FC<MarketIntelligenceDashboardProps> = ({
  defaultLocation = "Austin, TX",
  className = ""
}) => {
  const [selectedLocation, setSelectedLocation] = useState(defaultLocation);
  const [currentRent] = useState(2200);
  const [propertyValue] = useState(450000);

  // Map location to region key for the hook
  const getRegionKey = (location: string): string => {
    const locationLower = location.toLowerCase();
    if (locationLower.includes('austin')) return 'austin';
    if (locationLower.includes('dallas')) return 'dallas';
    if (locationLower.includes('houston')) return 'houston';
    return 'austin'; // default
  };

  const regionKey = getRegionKey(selectedLocation);
  
  const { intelligence, loading, error, refresh } = useUnifiedRentalIntelligence(
    regionKey, currentRent, propertyValue
  );

  const getMarketMetrics = () => {
    if (!intelligence?.marketData[0]) return [];
    
    const latest = intelligence.marketData[0];
    return [
      {
        title: 'Median Rent',
        value: `$${Math.round(latest.medianRent).toLocaleString()}`,
        change: latest.rentYoYChange,
        icon: Home,
        color: latest.rentYoYChange > 5 ? 'text-red-500' : latest.rentYoYChange > 0 ? 'text-yellow-500' : 'text-green-500'
      },
      {
        title: 'Days on Market',
        value: Math.round(latest.daysOnMarket).toString(),
        change: latest.daysOnMarket,
        icon: Calendar,
        color: latest.daysOnMarket > 30 ? 'text-green-500' : latest.daysOnMarket > 15 ? 'text-yellow-500' : 'text-red-500'
      },
      {
        title: 'Market Inventory',
        value: Math.round(latest.inventoryLevel).toLocaleString(),
        change: latest.inventoryLevel,
        icon: Building,
        color: latest.inventoryLevel > 3 ? 'text-green-500' : latest.inventoryLevel > 2 ? 'text-yellow-500' : 'text-red-500'
      },
      {
        title: 'Leverage Score',
        value: `${intelligence.overallLeverageScore}/100`,
        change: intelligence.overallLeverageScore,
        icon: Target,
        color: intelligence.overallLeverageScore > 70 ? 'text-green-500' : intelligence.overallLeverageScore > 40 ? 'text-yellow-500' : 'text-red-500'
      }
    ];
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-500 mb-2">Error loading market data</div>
        <Button onClick={refresh} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Market Intelligence Dashboard
          </h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {selectedLocation}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button onClick={refresh} variant="outline" size="sm" className="gap-2">
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Market Metrics Grid */}
      {intelligence && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {getMarketMetrics().map((metric) => (
            <Card key={metric.title} className="relative overflow-hidden border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                  <Badge variant="outline" className="text-xs">
                    {typeof metric.change === 'number' && metric.title === 'Median Rent' ? 
                      `${metric.change > 0 ? '+' : ''}${metric.change.toFixed(1)}%` : 
                      typeof metric.change === 'number' ?
                      Math.round(metric.change).toString() :
                      String(metric.change)
                    }
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-1">{metric.title}</div>
                <div className="text-xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Market Overview Card */}
      {intelligence && (
        <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Market Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Market Strength */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Market Strength</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overall Score</span>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">{intelligence.overallLeverageScore}/100</div>
                    </div>
                  </div>
                  <Progress value={intelligence.overallLeverageScore} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Recommendation: {intelligence.recommendation.action.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>

              {/* Key Insights */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Key Insights</h4>
                <div className="space-y-2">
                  {intelligence.recommendation.reasons.slice(0, 3).map((reason, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Prediction */}
            <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI Market Prediction</span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Based on current trends, expect {intelligence.marketData[0]?.rentYoYChange > 3 ? 'continued rent growth' : 'stable rent prices'} 
                {' '}over the next 6 months in {selectedLocation}.
              </p>
            </div>

            {/* Last Updated */}
            <div className="pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground text-center">
                Last updated: {new Date().toLocaleString()} • Data refreshed every 2 hours
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};