import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, DollarSign, Home, Calendar } from 'lucide-react';

interface MarketData {
  avgRent: number;
  medianRent: number;
  minRent: number;
  maxRent: number;
  totalProperties: number;
  rentTrend7d: number; // percentage
  rentTrend30d: number; // percentage
  avgDaysOnMarket: number;
  newListings30d: number;
}

interface MarketComparisonWidgetProps {
  city: string;
  state: string;
  bedrooms: number;
  marketData: MarketData;
}

export function MarketComparisonWidget({ 
  city, 
  state, 
  bedrooms, 
  marketData 
}: MarketComparisonWidgetProps) {
  const trend30d = marketData.rentTrend30d;
  const isIncreasing = trend30d > 0;
  const isFlat = Math.abs(trend30d) < 0.5;

  return (
    <Card variant="elevated" className="overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-primary/10 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white">
            Market Overview
          </h3>
          <div className="flex items-center gap-2">
            {isFlat ? (
              <Minus className="w-5 h-5 text-yellow-400" />
            ) : isIncreasing ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            <span className={`font-semibold ${
              isFlat ? 'text-yellow-400' : isIncreasing ? 'text-green-400' : 'text-red-400'
            }`}>
              {trend30d > 0 ? '+' : ''}{trend30d.toFixed(1)}%
            </span>
          </div>
        </div>
        <p className="text-sm text-white/60">
          {bedrooms}bd apartments in {city}, {state}
        </p>
      </div>

      <div className="p-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-sm text-white/60 mb-1">Average Rent</div>
            <div className="text-3xl font-bold text-white">
              ${marketData.avgRent.toLocaleString()}
            </div>
            <div className="text-xs text-white/50 mt-1">
              Median: ${marketData.medianRent.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="text-sm text-white/60 mb-1">Price Range</div>
            <div className="text-xl font-bold text-white">
              ${marketData.minRent.toLocaleString()} - ${marketData.maxRent.toLocaleString()}
            </div>
            <div className="text-xs text-white/50 mt-1">
              {marketData.totalProperties} properties
            </div>
          </div>
        </div>

        {/* Trends */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-white/60">7-Day</span>
            </div>
            <div className={`text-lg font-bold ${
              marketData.rentTrend7d > 0 ? 'text-green-400' : 
              marketData.rentTrend7d < 0 ? 'text-red-400' : 'text-white'
            }`}>
              {marketData.rentTrend7d > 0 ? '+' : ''}{marketData.rentTrend7d.toFixed(1)}%
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-white/60">30-Day</span>
            </div>
            <div className={`text-lg font-bold ${
              trend30d > 0 ? 'text-green-400' : 
              trend30d < 0 ? 'text-red-400' : 'text-white'
            }`}>
              {trend30d > 0 ? '+' : ''}{trend30d.toFixed(1)}%
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-4 h-4 text-green-400" />
              <span className="text-xs text-white/60">New</span>
            </div>
            <div className="text-lg font-bold text-white">
              {marketData.newListings30d}
            </div>
          </div>
        </div>

        {/* Market Velocity */}
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-300 font-semibold mb-1">
                Market Velocity
              </div>
              <div className="text-xs text-white/60">
                Average time on market
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">
                {marketData.avgDaysOnMarket}
              </div>
              <div className="text-sm text-white/60">days</div>
            </div>
          </div>

          {/* Velocity indicator */}
          <div className="mt-3 flex items-center gap-2">
            {marketData.avgDaysOnMarket > 60 ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400 font-medium">
                  High leverage - renters have time to negotiate
                </span>
              </>
            ) : marketData.avgDaysOnMarket > 30 ? (
              <>
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-xs text-yellow-400 font-medium">
                  Moderate - some negotiation possible
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-xs text-red-400 font-medium">
                  Hot market - less negotiation power
                </span>
              </>
            )}
          </div>
        </div>

        {/* Market Insight */}
        <div className="mt-4 p-3 rounded-lg bg-blue-900/20 border border-blue-500/20">
          <div className="flex items-start gap-2">
            <DollarSign className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-white/80">
              {isIncreasing ? (
                <>Market is <span className="text-green-400 font-semibold">heating up</span> - Consider raising rents or reducing concessions.</>
              ) : trend30d < -1 ? (
                <>Market is <span className="text-red-400 font-semibold">cooling</span> - May need competitive pricing or concessions.</>
              ) : (
                <>Market is <span className="text-yellow-400 font-semibold">stable</span> - Maintain current pricing strategy.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
