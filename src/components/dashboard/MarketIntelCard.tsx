// ============================================
// MARKET INTEL CARD
// Shows market intelligence on Dashboard
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Building,
  Target,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUnifiedAI } from '@/contexts/UnifiedAIContext';

export default function MarketIntelCard() {
  const { marketContext, location } = useUnifiedAI();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // If no market context, show setup prompt
  if (!marketContext || !marketContext.leverageScore) {
    return (
      <Card className="bg-white rounded-2xl shadow-2xl border border-gray-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-lg">Market Intelligence</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">
              Unlock negotiation insights and leverage analysis
            </p>
            <Button
              onClick={() => navigate('/market-intel')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              Analyze Market
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getLeverageColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLeverageBadge = (power: string) => {
    const colors = {
      strong: 'bg-green-50 text-green-700 border-green-200',
      moderate: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      weak: 'bg-red-50 text-red-700 border-red-200',
    };
    return colors[power as keyof typeof colors] || colors.moderate;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // TODO: Trigger market data refresh
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <Card className="bg-white rounded-2xl shadow-2xl border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Market Intelligence</CardTitle>
              <p className="text-sm text-gray-600">{marketContext.region || location}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Leverage Score */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Leverage Score</span>
            <Badge className={getLeverageBadge(marketContext.negotiationPower)}>
              {marketContext.negotiationPower.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className={`text-4xl font-bold ${getLeverageColor(marketContext.leverageScore)}`}>
              {marketContext.leverageScore}
            </span>
            <span className="text-xl text-gray-600 mb-1">/100</span>
          </div>
          <Progress value={marketContext.leverageScore} className="h-2 mb-2" />
          <p className="text-xs text-gray-600">
            {marketContext.leverageScore >= 70
              ? 'Excellent negotiating position - landlords motivated'
              : marketContext.leverageScore >= 40
              ? 'Moderate leverage - some room to negotiate'
              : 'Limited leverage - focus on other factors'}
          </p>
        </div>

        {/* Market Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Days on Market */}
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-600">Days on Market</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{marketContext.daysOnMarket}</div>
            <p className="text-xs text-gray-500">avg days</p>
          </div>

          {/* Inventory Level */}
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Building className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-gray-600">Inventory</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{marketContext.inventoryLevel}</div>
            <p className="text-xs text-gray-500">months supply</p>
          </div>

          {/* Rent Trend */}
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              {marketContext.rentTrend > 0 ? (
                <TrendingUp className="w-4 h-4 text-red-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-600" />
              )}
              <span className="text-xs text-gray-600">Rent Trend</span>
            </div>
            <div className={`text-2xl font-bold ${
              marketContext.rentTrend > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {marketContext.rentTrend > 0 ? '+' : ''}{marketContext.rentTrend.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500">YoY change</p>
          </div>

          {/* Median Rent */}
          {marketContext.medianRent && (
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-600">Median Rent</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ${(marketContext.medianRent / 1000).toFixed(1)}k
              </div>
              <p className="text-xs text-gray-500">per month</p>
            </div>
          )}
        </div>

        {/* Rent vs Buy Recommendation */}
        {marketContext.rentVsBuyRecommendation && (
          <div className={`p-3 rounded-lg border ${
            marketContext.rentVsBuyRecommendation === 'rent'
              ? 'bg-green-50 border-green-200'
              : marketContext.rentVsBuyRecommendation === 'buy'
              ? 'bg-blue-50 border-blue-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-start gap-2">
              <CheckCircle2 className={`w-5 h-5 mt-0.5 ${
                marketContext.rentVsBuyRecommendation === 'rent'
                  ? 'text-green-600'
                  : 'text-blue-600'
              }`} />
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  Recommendation: {marketContext.rentVsBuyRecommendation === 'rent' ? 'Keep Renting' : 'Consider Buying'}
                </p>
                <p className="text-xs text-gray-600">
                  {marketContext.rentVsBuyRecommendation === 'rent'
                    ? 'Current market conditions favor renting over buying'
                    : 'Market conditions may favor homeownership'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <Button
          variant="outline"
          className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
          onClick={() => navigate('/market-intel')}
        >
          View Full Analysis
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
