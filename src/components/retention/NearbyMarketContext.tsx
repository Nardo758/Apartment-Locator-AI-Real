import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { formatCurrency, RetentionUnit } from "@/types/retention.types";

interface NearbyMarketContextProps {
  unit: RetentionUnit;
}

export default function NearbyMarketContext({ unit }: NearbyMarketContextProps) {
  const avgRent = unit.marketRent;
  const avgDaysToFill = 24;
  const concessionRate = 42;
  const commonConcessions = ["1 month free (28%)", "Waived app fee (35%)", "Free parking 6mo (15%)"];
  const topSearches = ["Pet-friendly", "In-unit laundry", "Under $2k", "EV charging"];

  const rentMin = avgRent - 300;
  const rentMax = avgRent + 300;
  const yourPosition = unit.rent > 0 
    ? Math.min(95, Math.max(5, ((unit.rent - rentMin) / (rentMax - rentMin)) * 100))
    : 50;

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-gray-500" />
          Nearby Market · {unit.beds}BR within 1mi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{formatCurrency(avgRent)}</div>
            <div className="text-[9px] text-gray-500 uppercase">Avg Rent</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{avgDaysToFill}d</div>
            <div className="text-[9px] text-gray-500 uppercase">Days to Fill</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-600">{concessionRate}%</div>
            <div className="text-[9px] text-gray-500 uppercase">Offering Deals</div>
          </div>
        </div>

        <div>
          <div className="relative h-2 rounded-full overflow-hidden" 
               style={{ background: 'linear-gradient(90deg, #10B981, #F59E0B, #EF4444)' }}>
            {unit.rent > 0 && (
              <div 
                className="absolute w-3 h-3 rounded-full bg-white border-2 border-indigo-600 -top-0.5 shadow-md"
                style={{ left: `${yourPosition}%`, transform: 'translateX(-50%)' }}
              />
            )}
          </div>
          <div className="flex justify-between text-[9px] text-gray-500 mt-1">
            <span>{formatCurrency(rentMin)}</span>
            <span className="text-gray-600 font-medium">
              Your unit: {unit.rent > 0 ? formatCurrency(unit.rent) : "Not listed"}
            </span>
            <span>{formatCurrency(rentMax)}</span>
          </div>
        </div>

        <div>
          <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-2">
            Concessions Being Offered Nearby
          </div>
          <div className="flex flex-wrap gap-1.5">
            {commonConcessions.map((c) => (
              <Badge key={c} variant="outline" className="text-[9px] bg-white">
                {c}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-2">
            Top Renter Searches Here
          </div>
          <div className="flex flex-wrap gap-1.5">
            {topSearches.map((s) => (
              <Badge key={s} variant="secondary" className="text-[9px]">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
