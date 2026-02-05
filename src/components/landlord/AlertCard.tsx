import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingDown, 
  Gift, 
  DollarSign,
  MapPin,
  Clock,
  ArrowRight,
  Building,
  AlertTriangle,
  AlertCircle,
  Info
} from 'lucide-react';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertType = 'price_drop' | 'concession_added' | 'market_shift' | 'competitor_vacancy';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  competitorProperty: string;
  competitorAddress: string;
  zipCode: string;
  impact: {
    affectedProperties: number;
    revenueRisk: number;
    message: string;
  };
  details: {
    oldValue?: number;
    newValue?: number;
    concessionType?: string;
    concessionValue?: string;
  };
  recommendation: string;
  timestamp: string;
  read: boolean;
}

interface AlertCardProps {
  alert: Alert;
  onDismiss?: (alertId: string) => void;
  onTakeAction?: (alertId: string) => void;
}

const severityConfig = {
  critical: {
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/50',
    icon: <AlertTriangle className="w-5 h-5" />,
    label: 'CRITICAL',
    badgeVariant: 'destructive' as const
  },
  high: {
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/50',
    icon: <AlertCircle className="w-5 h-5" />,
    label: 'HIGH',
    badgeVariant: 'warning' as const
  },
  medium: {
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/50',
    icon: <AlertCircle className="w-5 h-5" />,
    label: 'MEDIUM',
    badgeVariant: 'secondary' as const
  },
  low: {
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/50',
    icon: <Info className="w-5 h-5" />,
    label: 'LOW',
    badgeVariant: 'outline' as const
  }
};

const typeConfig = {
  price_drop: {
    icon: <TrendingDown className="w-5 h-5" />,
    label: 'Price Drop',
    color: 'text-red-400'
  },
  concession_added: {
    icon: <Gift className="w-5 h-5" />,
    label: 'New Concession',
    color: 'text-purple-400'
  },
  market_shift: {
    icon: <Building className="w-5 h-5" />,
    label: 'Market Shift',
    color: 'text-blue-400'
  },
  competitor_vacancy: {
    icon: <Building className="w-5 h-5" />,
    label: 'Competitor Vacancy',
    color: 'text-orange-400'
  }
};

export function AlertCard({ alert, onDismiss, onTakeAction }: AlertCardProps) {
  const severity = severityConfig[alert.severity];
  const type = typeConfig[alert.type];

  return (
    <Card
      variant="elevated"
      hover
      className={`relative overflow-hidden ${severity.borderColor} border-2 ${!alert.read ? 'ring-2 ring-white/10' : ''}`}
    >
      {/* Severity stripe */}
      <div className={`absolute top-0 left-0 right-0 h-2 ${severity.bgColor}`} />

      <div className="p-6 pt-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg ${severity.bgColor}`}>
              <span className={severity.color}>{type.icon}</span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={severity.badgeVariant} size="sm">
                  {severity.label}
                </Badge>
                <Badge variant="outline" size="sm" className="text-white/60">
                  {type.label}
                </Badge>
                {!alert.read && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                )}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1">
                {alert.title}
              </h3>
              <p className="text-white/70 text-sm">
                {alert.description}
              </p>
            </div>
          </div>
        </div>

        {/* Competitor Info */}
        <div className="grid grid-cols-2 gap-3 mb-4 p-4 rounded-xl bg-muted/50 border border-border">
          <div>
            <div className="text-xs text-white/50 mb-1">Competitor Property</div>
            <div className="text-white font-semibold flex items-center gap-2">
              <Building className="w-4 h-4 text-white/60" />
              {alert.competitorProperty}
            </div>
          </div>
          <div>
            <div className="text-xs text-white/50 mb-1">Location</div>
            <div className="text-white font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-white/60" />
              ZIP {alert.zipCode}
            </div>
          </div>
        </div>

        {/* Details */}
        {(alert.details.oldValue || alert.details.concessionType) && (
          <div className={`p-4 rounded-xl ${severity.bgColor} ${severity.borderColor} border mb-4`}>
            {alert.type === 'price_drop' && alert.details.oldValue && alert.details.newValue && (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white/60 mb-1">Price Change</div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 line-through">
                      ${alert.details.oldValue.toLocaleString()}/mo
                    </span>
                    <ArrowRight className="w-4 h-4 text-white/40" />
                    <span className="text-xl font-bold text-white">
                      ${alert.details.newValue.toLocaleString()}/mo
                    </span>
                  </div>
                </div>
                <div className={`text-right ${severity.color}`}>
                  <div className="text-2xl font-bold">
                    -${(alert.details.oldValue - alert.details.newValue).toLocaleString()}
                  </div>
                  <div className="text-sm">
                    ({(((alert.details.oldValue - alert.details.newValue) / alert.details.oldValue) * 100).toFixed(1)}% drop)
                  </div>
                </div>
              </div>
            )}
            
            {alert.type === 'concession_added' && alert.details.concessionType && (
              <div className="flex items-center gap-3">
                <Gift className={`w-6 h-6 ${severity.color}`} />
                <div>
                  <div className="font-semibold text-white">{alert.details.concessionType}</div>
                  <div className="text-sm text-white/70">{alert.details.concessionValue}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Impact Analysis */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 mb-4">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-red-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-red-300 mb-1">Impact on Your Portfolio</div>
              <div className="text-white/90 text-sm mb-2">{alert.impact.message}</div>
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-white/50">Affected: </span>
                  <span className="text-white font-semibold">{alert.impact.affectedProperties} properties</span>
                </div>
                <div>
                  <span className="text-white/50">Risk: </span>
                  <span className="text-red-400 font-semibold">
                    ${alert.impact.revenueRisk.toLocaleString()}/mo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-blue-300 mb-1">Recommended Action</div>
              <div className="text-white/90 text-sm">{alert.recommendation}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Clock className="w-4 h-4" />
            <span>{alert.timestamp}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(alert.id)}
                className="text-white/60 hover:text-white"
              >
                Dismiss
              </Button>
            )}
            {onTakeAction && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onTakeAction(alert.id)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Take Action
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
