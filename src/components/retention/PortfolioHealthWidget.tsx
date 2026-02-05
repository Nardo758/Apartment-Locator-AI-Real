import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, PortfolioHealth } from "@/types/retention.types";

interface PortfolioHealthWidgetProps {
  health: PortfolioHealth;
}

export default function PortfolioHealthWidget({ health }: PortfolioHealthWidgetProps) {
  const stats = [
    { label: "Total Units", value: health.totalUnits, color: "text-gray-900" },
    { label: "Occupied", value: health.occupiedUnits, color: "text-green-600" },
    { label: "Vacant", value: health.vacantUnits, color: "text-red-600" },
    { label: "At Risk", value: health.atRiskUnits, color: "text-amber-600" },
  ];

  return (
    <div className="p-4" data-testid="portfolio-health-widget">
      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200 mb-4">
        <div className="text-4xl font-extrabold text-green-700" data-testid="text-retention-rate">
          {health.retentionRate}%
        </div>
        <div className="text-sm font-semibold text-green-600 mt-1">
          Retention Rate
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Market avg: {health.marketRetentionRate}%
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {stats.map((s) => (
          <div 
            key={s.label} 
            className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100"
            data-testid={`stat-${s.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className={`text-xl font-bold ${s.color}`}>
              {s.value}
            </div>
            <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-red-50 rounded-lg p-3 border border-red-200" data-testid="vacancy-cost-callout">
        <div className="text-[10px] text-red-700 font-semibold uppercase tracking-wide">
          Vacancy Cost This Month
        </div>
        <div className="text-2xl font-extrabold text-red-600 mt-1" data-testid="text-vacancy-cost">
          {formatCurrency(health.vacancyCostThisMonth)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {health.vacantUnits} empty units
        </div>
      </div>
    </div>
  );
}
