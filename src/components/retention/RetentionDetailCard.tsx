import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { RetentionUnit, getRiskColors, formatCurrency } from "@/types/retention.types";
import RetentionScoreBreakdown from "./RetentionScoreBreakdown";
import VacancyCostCalculator from "./VacancyCostCalculator";
import NearbyMarketContext from "./NearbyMarketContext";

interface RetentionDetailCardProps {
  unit: RetentionUnit;
  onClose: () => void;
}

export default function RetentionDetailCard({ unit, onClose }: RetentionDetailCardProps) {
  const isVacant = unit.status === 'vacant';
  const c = getRiskColors(unit.risk, unit.status);
  const priceDiff = unit.rent ? unit.rent - unit.marketRent : 0;

  const getAIRecommendation = () => {
    if (isVacant) {
      return `This unit has been empty ${unit.daysVacant} days at above-market pricing. Listing at ${formatCurrency(unit.marketRent)}/mo with a 1-month-free concession would match the 42% of nearby units offering deals and should fill within ~12 days based on market velocity.`;
    }
    if (unit.risk >= 70) {
      return `High churn risk with lease expiring in ${unit.leaseExpiry} days. Offering renewal at market rate (${formatCurrency(unit.marketRent)}/mo) costs ${formatCurrency(priceDiff * 12)}/yr in reduced rent but saves an estimated $${Math.round((unit.marketRent / 30) * 24 + 1000).toLocaleString()} in turnover costs.`;
    }
    if (unit.risk >= 40) {
      return `Moderate risk — lease expires in ${unit.leaseExpiry} days. Unit is priced near market. Consider a small incentive (waived fee, minor upgrade) to secure early renewal.`;
    }
    return `Low risk. Tenant is well-retained at near-market pricing. No action needed — monitor for changes.`;
  };

  return (
    <div className="bg-white border-t-4 overflow-y-auto h-full" style={{ borderTopColor: c.dot.replace('bg-', '#').replace('red-500', 'EF4444').replace('amber-500', 'F59E0B').replace('green-500', '10B981').replace('gray-400', '9CA3AF') }}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">Unit {unit.unit}</span>
              <Badge className={`${c.bg} ${c.text} border ${c.border} text-[10px] font-bold uppercase`}>
                {isVacant ? "VACANT" : c.label} · {unit.risk}
              </Badge>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {unit.address} · {unit.beds}BR/{unit.baths}BA · {unit.sqft} sqft
            </div>
            {unit.tenant && (
              <div className="text-xs text-gray-400 mt-0.5">
                Tenant: {unit.tenant} · Lease expires in {unit.leaseExpiry} days
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-testid="button-close-detail"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <RetentionScoreBreakdown unit={unit} />
            <NearbyMarketContext unit={unit} />
          </div>
          
          <div className="space-y-4">
            <VacancyCostCalculator unit={unit} />
            
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span className="text-indigo-700">AI Recommendation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {getAIRecommendation()}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
