import { 
  TrendingDown, 
  TrendingUp, 
  Minus,
  Clock, 
  Zap, 
  Gift, 
  Target,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  type RenterLeaseIntelData,
  getNegotiationPower,
  getBestMoveInWindow,
  getBelowMarketGap,
  getIncentiveProbability,
  getUrgencyIndicator,
  predictRentTrend,
  calculateDealScore,
} from '@/lib/renter-lease-intel';

interface RenterLeaseIntelBadgesProps {
  data: RenterLeaseIntelData;
  compact?: boolean;
}

export function RenterLeaseIntelBadges({ data, compact = false }: RenterLeaseIntelBadgesProps) {
  const negotiation = getNegotiationPower(data);
  const moveTiming = getBestMoveInWindow(data);
  const belowMarketGap = getBelowMarketGap(data);
  const incentive = getIncentiveProbability(data);
  const urgency = getUrgencyIndicator(data);
  const trend = predictRentTrend(data);
  const dealScore = calculateDealScore(data);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5 mt-2" data-testid="display-renter-intel-compact">
        {dealScore >= 75 && (
          <Badge variant="default" className="bg-green-600 text-white text-xs" data-testid="badge-deal-score">
            <Target className="w-3 h-3 mr-1" />
            {dealScore}/100 Deal
          </Badge>
        )}
        {negotiation.level === 'high' && (
          <Badge variant="default" className="bg-green-600 text-white text-xs" data-testid="badge-negotiation-power">
            <TrendingDown className="w-3 h-3 mr-1" />
            Negotiate
          </Badge>
        )}
        {belowMarketGap > 100 && (
          <Badge variant="default" className="bg-blue-600 text-white text-xs" data-testid="badge-below-market">
            <ArrowDown className="w-3 h-3 mr-1" />
            ${Math.round(belowMarketGap)} Below
          </Badge>
        )}
        {urgency.show && urgency.level === 'high' && (
          <Badge variant="destructive" className="text-xs" data-testid="badge-urgency">
            <Zap className="w-3 h-3 mr-1" />
            Act Fast
          </Badge>
        )}
        {moveTiming.advice === 'wait' && (
          <Badge variant="secondary" className="text-xs" data-testid="badge-wait">
            <Clock className="w-3 h-3 mr-1" />
            Wait
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-3" data-testid="display-renter-intel-full">
      <div className="flex items-center justify-between p-3 rounded-lg border bg-card" data-testid="display-deal-score-bar">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-foreground" />
          <span className="text-sm font-medium">Deal Score</span>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={dealScore} className="w-20 h-2" />
          <span className="font-bold text-sm">{dealScore}/100</span>
        </div>
      </div>

      {negotiation.level === 'high' && (
        <Card className="border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30" data-testid="card-negotiation-power">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
              <div>
                <div className="font-semibold text-sm text-green-800 dark:text-green-300">High Negotiation Power</div>
                <div className="text-xs text-green-700 dark:text-green-400">
                  {negotiation.message}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {negotiation.level === 'medium' && (
        <Card className="border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/30" data-testid="card-good-timing">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0" />
              <div>
                <div className="font-semibold text-sm text-yellow-800 dark:text-yellow-300">Good Timing</div>
                <div className="text-xs text-yellow-700 dark:text-yellow-400">
                  {negotiation.message}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {belowMarketGap > 100 && (
        <Card className="border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30" data-testid="card-below-market">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <ArrowDown className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <div className="font-semibold text-sm text-blue-800 dark:text-blue-300">Below-Market Opportunity</div>
                <div className="text-xs text-blue-700 dark:text-blue-400">
                  Current residents paying ${Math.round(belowMarketGap)} less/mo - negotiate to match
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {moveTiming.advice === 'move_now' && (
        <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800" data-testid="display-move-now">
          <Zap className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
          <div>
            <span className="font-medium text-green-800 dark:text-green-300">Best Time to Move: Now</span>
            <span className="text-xs text-green-700 dark:text-green-400 ml-1">- {moveTiming.message}</span>
          </div>
        </div>
      )}

      {moveTiming.advice === 'wait' && (
        <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800" data-testid="display-wait-strategy">
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <div>
            <span className="font-medium text-blue-800 dark:text-blue-300">Wait Strategy</span>
            <span className="text-xs text-blue-700 dark:text-blue-400 ml-1">- {moveTiming.message}</span>
          </div>
        </div>
      )}

      {urgency.show && (
        <div className={`flex items-center gap-2 text-sm p-2 rounded-lg border ${
          urgency.level === 'high' 
            ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
            : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
        }`} data-testid="display-urgency">
          <Zap className={`w-4 h-4 shrink-0 ${
            urgency.level === 'high' ? 'text-amber-600 dark:text-amber-400' : 'text-yellow-600 dark:text-yellow-400'
          }`} />
          <div>
            <span className={`font-medium ${
              urgency.level === 'high' ? 'text-amber-800 dark:text-amber-300' : 'text-yellow-800 dark:text-yellow-300'
            }`}>
              {urgency.level === 'high' ? 'Low Availability - Act Fast' : 'Moderate Availability'}
            </span>
            <span className={`text-xs ml-1 ${
              urgency.level === 'high' ? 'text-amber-700 dark:text-amber-400' : 'text-yellow-700 dark:text-yellow-400'
            }`}>
              - {urgency.message}
            </span>
          </div>
        </div>
      )}

      <Card className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20" data-testid="card-incentive-probability">
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Incentive Probability</span>
            </div>
            <Badge variant="secondary" className={`text-xs ${
              incentive.probability === 'high' ? 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200' :
              incentive.probability === 'medium' ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' :
              ''
            }`}>
              {incentive.probability === 'high' ? 'High' : incentive.probability === 'medium' ? 'Medium' : 'Low'} ({incentive.percentChance}%)
            </Badge>
          </div>
          {incentive.probability !== 'low' && (
            <div className="mt-2">
              <p className="text-xs text-purple-700 dark:text-purple-400 mb-1">Likely available:</p>
              <ul className="text-xs text-purple-600 dark:text-purple-400 space-y-0.5 pl-4">
                {incentive.expectedIncentives.map((item, i) => (
                  <li key={i} className="list-disc">{item}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-sm p-2 rounded-lg border" data-testid="display-rent-trend">
        {trend.direction === 'down' ? (
          <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
        ) : trend.direction === 'up' ? (
          <TrendingUp className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
        ) : (
          <Minus className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <div>
          <span className="font-medium">Rent Trend: </span>
          <span className={
            trend.direction === 'down' ? 'text-green-600 dark:text-green-400' :
            trend.direction === 'up' ? 'text-red-500 dark:text-red-400' :
            'text-muted-foreground'
          }>
            {trend.direction === 'down' && (
              <><ArrowDown className="w-3 h-3 inline" /> Likely Decreasing</>
            )}
            {trend.direction === 'up' && (
              <><ArrowUp className="w-3 h-3 inline" /> Likely Increasing</>
            )}
            {trend.direction === 'stable' && 'Stable'}
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground -mt-2 pl-6">{trend.reason}</p>
    </div>
  );
}
