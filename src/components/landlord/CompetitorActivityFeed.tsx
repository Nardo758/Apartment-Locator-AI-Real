import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingDown, 
  Gift, 
  Building,
  MapPin,
  DollarSign,
  ArrowRight,
  Activity
} from 'lucide-react';
import type { Alert, AlertSeverity } from './AlertCard';

interface CompetitorActivityFeedProps {
  alerts: Alert[];
  maxItems?: number;
}

export function CompetitorActivityFeed({ alerts, maxItems = 10 }: CompetitorActivityFeedProps) {
  const displayAlerts = maxItems ? alerts.slice(0, maxItems) : alerts;

  const getSeverityColor = (severity: AlertSeverity) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500'
    };
    return colors[severity];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'price_drop':
        return <TrendingDown className="w-4 h-4" />;
      case 'concession_added':
        return <Gift className="w-4 h-4" />;
      case 'competitor_vacancy':
        return <Building className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Competitor Activity Timeline</h2>
            <p className="text-sm text-white/60">Real-time market movements</p>
          </div>
        </div>

        {displayAlerts.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/60">No recent competitor activity</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-transparent" />

            <div className="space-y-6">
              {displayAlerts.map((alert, index) => (
                <div key={alert.id} className="relative pl-16">
                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-0 w-12 h-12 rounded-xl ${getSeverityColor(alert.severity)} bg-opacity-20 border-2 ${getSeverityColor(alert.severity).replace('bg-', 'border-')} flex items-center justify-center`}>
                    <span className="text-white">
                      {getTypeIcon(alert.type)}
                    </span>
                  </div>

                  {/* Activity card */}
                  <div className="bg-muted/50 rounded-xl border border-border p-4 hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant={alert.severity === 'critical' ? 'destructive' : alert.severity === 'high' ? 'warning' : 'outline'} 
                            size="sm"
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-white/50">{alert.timestamp}</span>
                        </div>
                        <h4 className="font-semibold text-white mb-1">{alert.title}</h4>
                        <p className="text-sm text-white/70">{alert.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="w-4 h-4 text-white/40" />
                        <span className="text-white/70">{alert.competitorProperty}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-white/40" />
                        <span className="text-white/70">ZIP {alert.zipCode}</span>
                      </div>
                    </div>

                    {/* Price change details */}
                    {alert.type === 'price_drop' && alert.details.oldValue && alert.details.newValue && (
                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-white/50">
                            ${alert.details.oldValue.toLocaleString()}
                          </span>
                          <ArrowRight className="w-4 h-4 text-white/30" />
                          <span className="text-white font-semibold">
                            ${alert.details.newValue.toLocaleString()}/mo
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-red-400 font-semibold text-sm">
                          <TrendingDown className="w-4 h-4" />
                          -${(alert.details.oldValue - alert.details.newValue).toLocaleString()}
                        </div>
                      </div>
                    )}

                    {/* Concession details */}
                    {alert.type === 'concession_added' && alert.details.concessionType && (
                      <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                        <Gift className="w-4 h-4 text-purple-400" />
                        <div className="text-sm">
                          <span className="text-white font-semibold">{alert.details.concessionType}</span>
                          <span className="text-white/50"> - {alert.details.concessionValue}</span>
                        </div>
                      </div>
                    )}

                    {/* Impact summary */}
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
                      <span className="text-white/50">
                        Impacts {alert.impact.affectedProperties} of your properties
                      </span>
                      <div className="flex items-center gap-1 text-red-400 font-semibold">
                        <DollarSign className="w-3 h-3" />
                        ${alert.impact.revenueRisk.toLocaleString()}/mo risk
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View more */}
        {alerts.length > maxItems && (
          <div className="mt-6 text-center">
            <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              View all {alerts.length} activities →
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
