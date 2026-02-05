import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { formatCurrency, RetentionMetrics } from "@/types/retention.types";

interface RetentionHealthBarProps {
  market: string;
  metrics: RetentionMetrics;
}

export default function RetentionHealthBar({ market, metrics }: RetentionHealthBarProps) {
  const metricsDisplay = [
    {
      label: "Portfolio Retention",
      value: `${metrics.portfolioRetention}%`,
      sub: `vs ${metrics.marketRetention}% market`,
      good: metrics.portfolioRetention >= metrics.marketRetention,
      icon: TrendingUp,
    },
    {
      label: "Units at Risk",
      value: metrics.unitsAtRisk.toString(),
      sub: `of ${metrics.totalUnits} total`,
      good: metrics.unitsAtRisk === 0,
      icon: AlertTriangle,
    },
    {
      label: "Vacancy Cost / Mo",
      value: formatCurrency(metrics.vacancyCostPerMonth),
      sub: `${metrics.vacantUnits} units empty`,
      good: metrics.vacancyCostPerMonth === 0,
      icon: DollarSign,
    },
    {
      label: "Renewals Due",
      value: metrics.renewalsDue.toString(),
      sub: "within 90 days",
      good: null,
      icon: Calendar,
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm" data-testid="retention-health-bar">
      <div className="flex items-center gap-3 px-5 py-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-gray-600 text-xs font-semibold tracking-wide uppercase" data-testid="text-market-name">
            {market}
          </span>
        </div>
        
        <div className="w-px h-7 bg-gray-200 shrink-0" />
        
        <div className="flex gap-6 flex-1 overflow-x-auto">
          {metricsDisplay.map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="flex flex-col min-w-[100px] shrink-0" data-testid={`metric-${m.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">
                    {m.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className={`text-lg font-bold ${
                    m.good === false ? 'text-red-600' : 
                    m.good === true ? 'text-green-600' : 
                    'text-gray-900'
                  }`}>
                    {m.value}
                  </span>
                  <span className={`text-[11px] ${m.good ? 'text-green-600' : 'text-gray-500'}`}>
                    {m.sub}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 px-4 py-2 max-w-sm shrink-0" data-testid="card-ai-insight">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-indigo-600 tracking-wide uppercase">
                AI INSIGHT
              </span>
              <p className="text-xs text-gray-700 leading-relaxed mt-0.5" data-testid="text-ai-insight">
                {metrics.aiInsight}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
