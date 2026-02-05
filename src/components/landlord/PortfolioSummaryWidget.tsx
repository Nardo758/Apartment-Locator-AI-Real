import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Home, 
  HomeIcon,
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Percent
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { authenticatedFetch } from '@/lib/authHelpers';
import type { PortfolioSummary, PortfolioSummaryWidgetProps } from '@/types/landlord.types';

export function PortfolioSummaryWidget({ userId, className = '' }: PortfolioSummaryWidgetProps) {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await authenticatedFetch('/api/landlord/portfolio/summary', {
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.status === 401) {
          return; // handleUnauthorized already called by authenticatedFetch
        }

        if (!response.ok) {
          throw new Error('Failed to fetch portfolio summary');
        }

        const data = await response.json();
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching portfolio summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [userId]);

  if (loading) {
    return (
      <Card variant="elevated" className={className}>
        <CardHeader>
          <CardTitle className="text-2xl">Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !summary) {
    return (
      <Card variant="elevated" className={className}>
        <CardHeader>
          <CardTitle className="text-2xl">Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-red-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3" />
            <p>{error || 'Failed to load portfolio data'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const occupancyColor = 
    summary.occupancyRate >= 95 ? 'text-green-400' : 
    summary.occupancyRate >= 85 ? 'text-yellow-400' : 
    'text-red-400';

  const revenueColor = summary.revenueChange >= 0 ? 'text-green-400' : 'text-red-400';
  const revenueEfficiency = (summary.totalRevenue / summary.potentialRevenue) * 100;

  return (
    <Card variant="elevated" className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-400" />
            Portfolio Overview
          </CardTitle>
          {summary.atRiskCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="w-3 h-3" />
              {summary.atRiskCount} At Risk
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Property Count Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {summary.totalProperties}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Properties</div>
          </div>

          <div className="p-4 rounded-xl bg-green-100 dark:bg-green-500/10 border border-green-300 dark:border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs text-green-700 dark:text-green-300">Occupied</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {summary.occupiedUnits}
            </div>
            <div className="text-xs text-green-700 dark:text-green-300 mt-1">Units</div>
          </div>

          <div className="p-4 rounded-xl bg-orange-100 dark:bg-orange-500/10 border border-orange-300 dark:border-orange-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-xs text-orange-700 dark:text-orange-300">Vacant</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {summary.vacantUnits}
            </div>
            <div className="text-xs text-orange-700 dark:text-orange-300 mt-1">Units</div>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Occupancy Rate</span>
            </div>
            <span className={`text-2xl font-bold ${occupancyColor}`}>
              {summary.occupancyRate.toFixed(1)}%
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                summary.occupancyRate >= 95 ? 'bg-green-500' : 
                summary.occupancyRate >= 85 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
              style={{ width: `${summary.occupancyRate}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{summary.occupiedUnits} / {summary.occupiedUnits + summary.vacantUnits} units</span>
            <span className={occupancyColor}>
              {summary.occupancyRate >= 95 ? 'Excellent' : 
               summary.occupancyRate >= 85 ? 'Good' : 
               'Needs Attention'}
            </span>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              ${summary.totalRevenue.toLocaleString()}
            </div>
            <div className={`flex items-center gap-1 text-sm ${revenueColor}`}>
              {summary.revenueChange >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{summary.revenueChange > 0 ? '+' : ''}{summary.revenueChange.toFixed(1)}% MoM</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <HomeIcon className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Avg Rent</span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              ${summary.averageRent.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              per unit/month
            </div>
          </div>
        </div>

        {/* Revenue Efficiency */}
        <div className="p-4 rounded-xl bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-green-700 dark:text-green-300 font-semibold mb-1">
                Revenue Efficiency
              </div>
              <div className="text-xs text-muted-foreground">
                Actual vs. Potential
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-foreground">
                {revenueEfficiency.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                ${summary.potentialRevenue.toLocaleString()} potential
              </div>
            </div>
          </div>
        </div>

        {/* At-Risk Alert */}
        {summary.atRiskCount > 0 && (
          <div className="p-4 rounded-xl bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-500/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">
                  {summary.atRiskCount} {summary.atRiskCount === 1 ? 'Property' : 'Properties'} Need Attention
                </div>
                <div className="text-xs text-muted-foreground">
                  High vacancy risk or below-market pricing detected. Review pricing strategy and competitor activity.
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
