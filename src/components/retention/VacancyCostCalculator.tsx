import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Check } from "lucide-react";
import { formatCurrency, RetentionUnit } from "@/types/retention.types";

interface VacancyCostCalculatorProps {
  unit: RetentionUnit;
}

interface CostScenario {
  label: string;
  annualCost: number;
  note: string;
  recommended?: boolean;
}

export default function VacancyCostCalculator({ unit }: VacancyCostCalculatorProps) {
  const isVacant = unit.status === 'vacant';
  const priceDiff = unit.rent ? unit.rent - unit.marketRent : 0;
  const dailyVacancyCost = unit.marketRent / 30;
  const avgDaysToFill = 24;

  const scenarios: CostScenario[] = isVacant 
    ? [
        {
          label: `List at market rate (${formatCurrency(unit.marketRent)}/mo) with 1-mo free`,
          annualCost: unit.marketRent,
          note: `Est. 12 days to fill`,
          recommended: true,
        },
        {
          label: "Hold above-market list price",
          annualCost: Math.round(dailyVacancyCost * 60) + 1000,
          note: "Est. 60+ more days vacant",
        },
      ]
    : [
        {
          label: `Offer renewal at ${formatCurrency(unit.marketRent)}/mo`,
          annualCost: Math.max(0, priceDiff) * 12,
          note: priceDiff > 0 
            ? `${formatCurrency(priceDiff)}/mo discount × 12 months`
            : "Keep at current rate",
          recommended: true,
        },
        {
          label: "Lose tenant → relist at market",
          annualCost: Math.round(dailyVacancyCost * avgDaysToFill) + 1000,
          note: `~${avgDaysToFill} day vacancy + $1,000 turnover`,
        },
        {
          label: `Lose tenant → hold at ${formatCurrency(unit.rent)}/mo`,
          annualCost: Math.round(dailyVacancyCost * 50) + 1000,
          note: "~50 day vacancy (overpriced)",
        },
      ];

  return (
    <Card className="border-gray-200" data-testid="vacancy-cost-calculator">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Calculator className="h-4 w-4 text-gray-500" />
          {isVacant ? "What This Vacancy Is Costing You" : "What Would Turnover Cost?"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isVacant && (
          <div className="bg-red-50 rounded-lg p-4 border border-red-200" data-testid="current-vacancy-cost">
            <div className="text-[10px] text-red-700 font-semibold uppercase tracking-wide">
              VACANT {unit.daysVacant} DAYS
            </div>
            <div className="text-2xl font-extrabold text-red-600 mt-1" data-testid="text-vacancy-lost">
              {formatCurrency(Math.round(dailyVacancyCost * unit.daysVacant))} lost
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Lost rent: {formatCurrency(Math.round(dailyVacancyCost * unit.daysVacant))} · Prep & marketing: ~$1,000
            </div>
          </div>
        )}

        <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
          12-Month Cost Scenarios
        </div>

        <div className="space-y-2">
          {scenarios.map((s, i) => (
            <div
              key={i}
              className={`
                rounded-lg p-3 border-2
                ${s.recommended 
                  ? 'bg-green-50 border-green-500' 
                  : 'bg-gray-50 border-gray-200'
                }
              `}
              data-testid={`scenario-${i}-${s.recommended ? 'recommended' : 'alternative'}`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  {s.recommended && (
                    <Badge className="bg-green-600 text-white text-[9px] mb-1.5">
                      <Check className="h-3 w-3 mr-1" />
                      Recommended
                    </Badge>
                  )}
                  <div className={`text-sm font-semibold ${s.recommended ? 'text-green-800' : 'text-gray-700'}`}>
                    {s.label}
                  </div>
                  <div className={`text-xs mt-0.5 ${s.recommended ? 'text-green-600' : 'text-gray-500'}`}>
                    {s.note}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-xl font-extrabold ${s.recommended ? 'text-green-700' : 'text-red-600'}`}>
                    -{formatCurrency(s.annualCost)}
                  </div>
                  <div className={`text-[9px] ${s.recommended ? 'text-green-600' : 'text-red-500'}`}>
                    annual cost
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-gray-400 italic">
          Based on market data for comparable {unit.beds}BR units within 1 mile.
        </p>
      </CardContent>
    </Card>
  );
}
