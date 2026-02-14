/**
 * Upfront Savings Calculator
 * Separates upfront incentives from monthly concessions
 * 
 * UPFRONT SAVINGS (one-time):
 * - Application fee waivers
 * - Security deposit reductions
 * - Admin/processing fee waivers
 * - Move-in specials (gift cards, etc.)
 * 
 * MONTHLY SAVINGS (recurring):
 * - Concessions (X months free, % off, etc.)
 * - Reduced rent periods
 */

import React, { useMemo } from 'react';
import {
  DollarSign,
  TrendingDown,
  Calendar,
  Gift,
  CreditCard,
  FileText,
  Home,
  Percent,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface UpfrontIncentive {
  type: 'application_fee' | 'security_deposit' | 'admin_fee' | 'gift_card' | 'other';
  description: string;
  amount: number;
}

interface MonthlyConcession {
  type: 'free_months' | 'percent_off' | 'fixed_discount';
  description: string;
  value: string; // e.g., "2 months", "50%", "$200"
  monthsApplied: number; // How many months this applies to
  monthlySavings: number; // Calculated monthly savings
}

interface UpfrontSavingsCalculatorProps {
  baseRent: number;
  leaseTerm?: number; // months, default 12
  upfrontIncentives?: UpfrontIncentive[];
  monthlyConcessions?: MonthlyConcession[];
  className?: string;
}

export const UpfrontSavingsCalculator: React.FC<UpfrontSavingsCalculatorProps> = ({
  baseRent,
  leaseTerm = 12,
  upfrontIncentives = [],
  monthlyConcessions = [],
  className = '',
}) => {
  // Calculate total upfront savings
  const totalUpfrontSavings = useMemo(() => {
    return upfrontIncentives.reduce((sum, incentive) => sum + incentive.amount, 0);
  }, [upfrontIncentives]);

  // Calculate total monthly savings over lease term
  const { totalMonthlySavings, effectiveMonthlyRent, averageMonthlySavings } = useMemo(() => {
    const totalSavings = monthlyConcessions.reduce((sum, concession) => {
      return sum + (concession.monthlySavings * concession.monthsApplied);
    }, 0);
    
    const avgSavings = monthlyConcessions.length > 0 ? totalSavings / leaseTerm : 0;
    const effectiveRent = baseRent - avgSavings;
    
    return {
      totalMonthlySavings: totalSavings,
      effectiveMonthlyRent: effectiveRent,
      averageMonthlySavings: avgSavings,
    };
  }, [monthlyConcessions, baseRent, leaseTerm]);

  // Total savings over lease term
  const totalSavings = totalUpfrontSavings + totalMonthlySavings;

  // Icon mapping for incentive types
  const getIncentiveIcon = (type: UpfrontIncentive['type']) => {
    switch (type) {
      case 'application_fee':
        return FileText;
      case 'security_deposit':
        return CreditCard;
      case 'admin_fee':
        return FileText;
      case 'gift_card':
        return Gift;
      default:
        return DollarSign;
    }
  };

  const getConcessionIcon = (type: MonthlyConcession['type']) => {
    switch (type) {
      case 'free_months':
        return Calendar;
      case 'percent_off':
        return Percent;
      case 'fixed_discount':
        return TrendingDown;
      default:
        return DollarSign;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Total Savings Summary */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Total Savings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">
                ${totalSavings.toLocaleString()}
              </span>
              <Badge variant="secondary">
                {leaseTerm}-month lease
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Upfront Savings</div>
                <div className="font-semibold">${totalUpfrontSavings.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Monthly Savings</div>
                <div className="font-semibold">${totalMonthlySavings.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upfront Savings Detail */}
      {upfrontIncentives.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Upfront Incentives
            </CardTitle>
            <CardDescription>
              One-time savings when you move in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upfrontIncentives.map((incentive, index) => {
                const Icon = getIncentiveIcon(incentive.type);
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background rounded">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{incentive.description}</div>
                        <div className="text-xs text-muted-foreground">One-time savings</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        ${incentive.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <Separator />
              
              <div className="flex items-center justify-between px-3 pt-2">
                <span className="font-semibold">Total Upfront Savings</span>
                <span className="text-lg font-bold text-green-600">
                  ${totalUpfrontSavings.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Concessions Detail */}
      {monthlyConcessions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Concessions
            </CardTitle>
            <CardDescription>
              Recurring savings throughout your lease
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyConcessions.map((concession, index) => {
                const Icon = getConcessionIcon(concession.type);
                const totalConcessionSavings = concession.monthlySavings * concession.monthsApplied;
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background rounded">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{concession.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {concession.value} • Applied to {concession.monthsApplied} months
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        ${totalConcessionSavings.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${concession.monthlySavings.toLocaleString()}/mo
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3">
                  <span className="font-semibold">Total Monthly Savings</span>
                  <span className="text-lg font-bold text-green-600">
                    ${totalMonthlySavings.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 text-sm">
                  <span className="text-muted-foreground">Average Savings per Month</span>
                  <span className="font-medium">
                    ${averageMonthlySavings.toFixed(0)}/mo
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Effective Rent Calculation */}
      {monthlyConcessions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Home className="h-5 w-5" />
              Effective Monthly Rent
            </CardTitle>
            <CardDescription>
              Your actual average monthly cost after concessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Base Rent</div>
                  <div className="font-medium">${baseRent.toLocaleString()}/mo</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Avg Savings</div>
                  <div className="font-medium text-green-600">
                    -${averageMonthlySavings.toFixed(0)}/mo
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="font-semibold">Effective Rent</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-600">
                    ${effectiveMonthlyRent.toFixed(0)}
                  </span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Incentives Message */}
      {upfrontIncentives.length === 0 && monthlyConcessions.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No move-in specials or concessions currently available.</p>
              <p className="text-xs mt-2">Base rent: ${baseRent.toLocaleString()}/month</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UpfrontSavingsCalculator;
