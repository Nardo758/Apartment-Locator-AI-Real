import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskFactor, RetentionUnit } from "@/types/retention.types";
import { Shield } from "lucide-react";

interface RetentionScoreBreakdownProps {
  unit: RetentionUnit;
}

export default function RetentionScoreBreakdown({ unit }: RetentionScoreBreakdownProps) {
  const isVacant = unit.status === 'vacant';

  const getScoreColor = (score: number) => {
    if (score >= 25) return { bar: 'bg-red-500', text: 'text-red-600' };
    if (score >= 15) return { bar: 'bg-amber-500', text: 'text-amber-600' };
    return { bar: 'bg-green-500', text: 'text-green-600' };
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4 text-gray-500" />
          {isVacant ? "Vacancy Factors" : "Retention Risk Breakdown"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {unit.factors.map((f, i) => {
          const colors = getScoreColor(f.score);
          return (
            <div key={i}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-700">{f.name}</span>
                <span className={`text-xs font-bold ${colors.text}`}>{f.score}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(f.score, 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-gray-500 mt-1">{f.detail}</div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
