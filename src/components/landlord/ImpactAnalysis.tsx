import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Home,
  Target,
  PieChart,
  BarChart3
} from 'lucide-react';
import type { Alert } from './AlertCard';

interface ImpactAnalysisProps {
  alerts: Alert[];
}

interface PropertyImpact {
  propertyId: string;
  address: string;
  currentRent: number;
  isUndercut: boolean;
  undercutBy: number;
  competitorCount: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export function ImpactAnalysis({ alerts }: ImpactAnalysisProps) {
  // Calculate aggregate impact
  const totalAffectedProperties = new Set(
    alerts.flatMap(alert => 
      Array.from({ length: alert.impact.affectedProperties }, (_, i) => `prop-${alert.zipCode}-${i}`)
    )
  ).size;

  const totalRevenueRisk = alerts.reduce((sum, alert) => sum + alert.impact.revenueRisk, 0);
  
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const highAlerts = alerts.filter(a => a.severity === 'high').length;

  // Mock property impact data
  const propertyImpacts: PropertyImpact[] = [
    {
      propertyId: '1',
      address: '123 Oak Street #204',
      currentRent: 2100,
      isUndercut: true,
      undercutBy: 150,
      competitorCount: 3,
      riskLevel: 'critical'
    },
    {
      propertyId: '2',
      address: '456 Elm Avenue #102',
      currentRent: 1950,
      isUndercut: true,
      undercutBy: 100,
      competitorCount: 2,
      riskLevel: 'high'
    },
    {
      propertyId: '3',
      address: '789 Pine Road #305',
      currentRent: 2250,
      isUndercut: true,
      undercutBy: 200,
      competitorCount: 4,
      riskLevel: 'critical'
    },
    {
      propertyId: '4',
      address: '321 Maple Drive #101',
      currentRent: 1850,
      isUndercut: true,
      undercutBy: 75,
      competitorCount: 1,
      riskLevel: 'medium'
    },
    {
      propertyId: '5',
      address: '555 Cedar Lane #203',
      currentRent: 2050,
      isUndercut: true,
      undercutBy: 125,
      competitorCount: 2,
      riskLevel: 'high'
    }
  ];

  const riskColors = {
    critical: { bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'text-red-400', badge: 'destructive' as const },
    high: { bg: 'bg-orange-500/10', border: 'border-orange-500/50', text: 'text-orange-400', badge: 'warning' as const },
    medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', text: 'text-yellow-400', badge: 'secondary' as const },
    low: { bg: 'bg-green-500/10', border: 'border-green-500/50', text: 'text-green-400', badge: 'outline' as const }
  };

  return (
    <div className="space-y-6">
      {/* Overall Impact Summary */}
      <Card variant="elevated" className="overflow-hidden">
        <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Portfolio Impact Analysis</h2>
              <p className="text-red-300 text-sm">Competitive threats to your properties</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-black/30 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                <Home className="w-4 h-4" />
                Properties at Risk
              </div>
              <div className="text-3xl font-bold text-white">{totalAffectedProperties}</div>
              <div className="text-xs text-red-400 mt-1">
                {((totalAffectedProperties / 25) * 100).toFixed(0)}% of portfolio
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                <DollarSign className="w-4 h-4" />
                Revenue at Risk
              </div>
              <div className="text-3xl font-bold text-white">
                ${(totalRevenueRisk / 1000).toFixed(1)}K
              </div>
              <div className="text-xs text-red-400 mt-1">per month</div>
            </div>

            <div className="bg-black/30 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                <AlertTriangle className="w-4 h-4" />
                Critical Alerts
              </div>
              <div className="text-3xl font-bold text-red-400">{criticalAlerts}</div>
              <div className="text-xs text-white/60 mt-1">Immediate action needed</div>
            </div>

            <div className="bg-black/30 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                <Target className="w-4 h-4" />
                High Priority
              </div>
              <div className="text-3xl font-bold text-orange-400">{highAlerts}</div>
              <div className="text-xs text-white/60 mt-1">Action recommended</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Properties Being Undercut */}
      <Card variant="elevated">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Properties Being Undercut</h3>
                <p className="text-sm text-white/60">{propertyImpacts.length} properties now priced above competitors</p>
              </div>
            </div>
            <Badge variant="destructive">Action Required</Badge>
          </div>

          <div className="space-y-3">
            {propertyImpacts.map((property) => {
              const risk = riskColors[property.riskLevel];
              return (
                <div
                  key={property.propertyId}
                  className={`p-4 rounded-xl ${risk.bg} border ${risk.border} hover:bg-opacity-80 transition-all`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white">{property.address}</h4>
                        <Badge variant={risk.badge} size="sm">
                          {property.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-white/70">
                        {property.competitorCount} competitor{property.competitorCount !== 1 ? 's' : ''} nearby
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-white/60">Your Rent</div>
                      <div className="text-xl font-bold text-white">
                        ${property.currentRent.toLocaleString()}/mo
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-lg bg-black/30 border ${risk.border}`}>
                    <div className="flex items-center gap-2">
                      <TrendingDown className={`w-5 h-5 ${risk.text}`} />
                      <div>
                        <div className="text-sm text-white/60">Undercut by</div>
                        <div className={`text-lg font-bold ${risk.text}`}>
                          ${property.undercutBy.toLocaleString()}/mo
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-white/60">Suggested Price</div>
                      <div className="text-lg font-bold text-green-400">
                        ${(property.currentRent - property.undercutBy + 25).toLocaleString()}/mo
                      </div>
                    </div>
                  </div>

                  {/* Quick recommendations */}
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="text-xs text-white/60 mb-2">Quick Actions:</div>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-semibold transition-colors">
                        Match lowest price
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold transition-colors">
                        Add 1 month free
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-xs font-semibold transition-colors">
                        View competitors
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Market Position Summary */}
      <Card variant="elevated">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Competitive Position</h3>
              <p className="text-sm text-white/60">How your properties compare</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white/60">Priced Right</span>
              </div>
              <div className="text-3xl font-bold text-green-400">8</div>
              <div className="text-xs text-white/60 mt-1">32% of portfolio</div>
            </div>

            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-white/60">Need Adjustment</span>
              </div>
              <div className="text-3xl font-bold text-yellow-400">12</div>
              <div className="text-xs text-white/60 mt-1">48% of portfolio</div>
            </div>

            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-white/60">High Risk</span>
              </div>
              <div className="text-3xl font-bold text-red-400">5</div>
              <div className="text-xs text-white/60 mt-1">20% of portfolio</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
