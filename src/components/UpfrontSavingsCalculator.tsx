import { DollarSign, Gift, Calendar, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SavingsBreakdown } from '@/lib/savings-calculator';
import { formatMoney } from '@/lib/savings-calculator';

interface UpfrontSavingsCalculatorProps {
  savings: SavingsBreakdown;
  propertyName: string;
}

export default function UpfrontSavingsCalculator({ savings, propertyName }: UpfrontSavingsCalculatorProps) {
  return (
    <Card data-testid="card-upfront-savings">
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-500" />
          Savings Breakdown: {propertyName}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border p-3">
            <div className="flex items-center gap-1 mb-1">
              <Gift className="w-3 h-3 text-purple-500" />
              <span className="text-xs text-muted-foreground">Upfront Incentives</span>
            </div>
            <p className="text-lg font-bold text-purple-600">
              {savings.upfrontSavings > 0 ? formatMoney(savings.upfrontSavings) : 'None'}
            </p>
            {savings.specialOfferText && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{savings.specialOfferText}</p>
            )}
          </div>

          <div className="rounded-md border p-3">
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-muted-foreground">Monthly Concessions</span>
            </div>
            <p className="text-lg font-bold text-blue-600">
              {savings.monthlyConcessionsValue > 0 ? formatMoney(savings.monthlyConcessionsValue) + '/mo' : 'None'}
            </p>
          </div>
        </div>

        <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <TrendingDown className="w-3 h-3 text-green-600" />
                <span className="text-xs text-muted-foreground">vs. Market Median ({formatMoney(savings.marketMedianRent)})</span>
              </div>
              <p className="text-xl font-bold text-green-600">
                {formatMoney(savings.monthlySavings)}/mo savings
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Annual Total</p>
              <p className="font-bold text-green-600">{formatMoney(savings.annualSavings)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Deal Score</span>
            <Badge
              variant={savings.dealScore >= 70 ? 'default' : 'secondary'}
              className={savings.dealScore >= 70 ? 'bg-green-600' : ''}
            >
              {savings.dealScore}/100
            </Badge>
          </div>
          {savings.savingsPercentage > 0 && (
            <Badge variant="outline" className="text-green-600 border-green-300">
              {savings.savingsPercentage}% below market
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
