import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Home, 
  Calendar, 
  Building, 
  Target, 
  Brain,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface MarketMetric {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  status: 'good' | 'neutral' | 'warning';
  icon: typeof Home;
}

interface MarketIntelBarProps {
  location: string;
  medianRent: number;
  rentChange: number;
  daysOnMarket: number;
  inventoryLevel: number;
  leverageScore: number;
  aiRecommendation?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

export default function MarketIntelBar({
  location,
  medianRent,
  rentChange,
  daysOnMarket,
  inventoryLevel,
  leverageScore,
  aiRecommendation = "Market conditions favor renters. Good time to negotiate!",
  onRefresh,
  isLoading = false,
  className = '',
}: MarketIntelBarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const metrics: MarketMetric[] = [
    {
      title: 'Median Rent',
      value: `$${medianRent.toLocaleString()}`,
      change: rentChange,
      changeLabel: `${rentChange > 0 ? '+' : ''}${rentChange.toFixed(1)}% YoY`,
      status: rentChange > 5 ? 'warning' : rentChange < 0 ? 'good' : 'neutral',
      icon: Home,
    },
    {
      title: 'Days on Market',
      value: `${daysOnMarket}`,
      changeLabel: 'avg days',
      status: daysOnMarket > 30 ? 'good' : daysOnMarket > 15 ? 'neutral' : 'warning',
      icon: Calendar,
    },
    {
      title: 'Inventory',
      value: `${inventoryLevel.toFixed(1)} mo`,
      changeLabel: 'supply',
      status: inventoryLevel > 3 ? 'good' : inventoryLevel > 2 ? 'neutral' : 'warning',
      icon: Building,
    },
    {
      title: 'Leverage Score',
      value: `${leverageScore}/100`,
      changeLabel: leverageScore > 70 ? 'Strong' : leverageScore > 40 ? 'Moderate' : 'Weak',
      status: leverageScore > 70 ? 'good' : leverageScore > 40 ? 'neutral' : 'warning',
      icon: Target,
    },
  ];

  const statusColors = {
    good: 'text-green-500',
    neutral: 'text-yellow-500',
    warning: 'text-red-500',
  };

  const statusBg = {
    good: 'bg-gradient-to-br from-green-50 to-emerald-50',
    neutral: 'bg-gradient-to-br from-yellow-50 to-amber-50',
    warning: 'bg-gradient-to-br from-red-50 to-orange-50',
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden ${className}`} data-testid="market-intel-bar">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover-elevate">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Live Market Intel</h3>
                <p className="text-xs text-muted-foreground">{location}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isExpanded && (
                <div className="hidden md:flex items-center gap-4 mr-4">
                  <span className="text-sm">
                    <span className="text-muted-foreground">Median:</span>{' '}
                    <span className="font-medium">${medianRent.toLocaleString()}</span>
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`${statusColors[leverageScore > 70 ? 'good' : leverageScore > 40 ? 'neutral' : 'warning']}`}
                  >
                    Leverage: {leverageScore}/100
                  </Badge>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onRefresh?.();
                }}
                disabled={isLoading}
                data-testid="button-refresh-market"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {metrics.map((metric) => (
                <div 
                  key={metric.title}
                  className={`p-3 rounded-lg ${statusBg[metric.status]} border border-border/50`}
                  data-testid={`metric-${metric.title.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <metric.icon className={`w-4 h-4 ${statusColors[metric.status]}`} />
                    <span className="text-xs text-muted-foreground">{metric.title}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">{metric.value}</span>
                    {metric.changeLabel && (
                      <span className={`text-xs ${statusColors[metric.status]}`}>
                        {metric.change !== undefined && (
                          metric.change > 0 ? (
                            <TrendingUp className="w-3 h-3 inline mr-0.5" />
                          ) : metric.change < 0 ? (
                            <TrendingDown className="w-3 h-3 inline mr-0.5" />
                          ) : null
                        )}
                        {metric.changeLabel}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <div 
                className="p-3 rounded-lg bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 md:col-span-2 lg:col-span-1"
                data-testid="metric-ai-recommendation"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-muted-foreground">AI Says</span>
                </div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  {aiRecommendation}
                </p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
