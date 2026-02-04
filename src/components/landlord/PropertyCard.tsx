import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Users,
  Calendar,
  Edit,
  MoreVertical
} from 'lucide-react';

interface CompetitorConcession {
  property: string;
  type: string;
  value: string;
}

interface PropertyData {
  id: string;
  address: string;
  city: string;
  state: string;
  currentRent: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  marketAvgRent: number;
  vacancyRisk: 'low' | 'medium' | 'high';
  daysVacant?: number;
  lastUpdated: string;
  competitorConcessions: CompetitorConcession[];
  recommendation?: string;
}

interface PropertyCardProps {
  property: PropertyData;
  onEdit?: (propertyId: string) => void;
}

export function PropertyCard({ property, onEdit }: PropertyCardProps) {
  const priceDiff = property.currentRent - property.marketAvgRent;
  const priceDiffPercent = ((priceDiff / property.marketAvgRent) * 100).toFixed(1);
  const isOverpriced = priceDiff > 0;
  const isUnderpriced = priceDiff < -50;

  const riskConfig = {
    low: { 
      color: 'text-green-400', 
      bgColor: 'bg-green-500/10', 
      borderColor: 'border-green-500/30',
      icon: <CheckCircle className="w-5 h-5" />,
      label: 'PRICED RIGHT'
    },
    medium: { 
      color: 'text-yellow-400', 
      bgColor: 'bg-yellow-500/10', 
      borderColor: 'border-yellow-500/30',
      icon: <AlertTriangle className="w-5 h-5" />,
      label: 'WATCH CLOSELY'
    },
    high: { 
      color: 'text-red-400', 
      bgColor: 'bg-red-500/10', 
      borderColor: 'border-red-500/30',
      icon: <AlertTriangle className="w-5 h-5" />,
      label: 'HIGH RISK'
    }
  };

  const risk = riskConfig[property.vacancyRisk];

  return (
    <Card 
      variant="elevated" 
      hover
      className={`relative overflow-hidden ${risk.borderColor}`}
    >
      {/* Risk indicator stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${risk.bgColor}`} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">
              {property.address}
            </h3>
            <p className="text-white/60 text-sm">
              {property.city}, {property.state} • {property.bedrooms}bd/{property.bathrooms}ba
              {property.squareFeet && ` • ${property.squareFeet} sq ft`}
            </p>
          </div>
          
          <button
            onClick={() => onEdit?.(property.id)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Pricing Section */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className={`p-4 rounded-xl ${risk.bgColor} ${risk.borderColor} border`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">Your Rent</span>
              {isOverpriced && <TrendingUp className="w-4 h-4 text-red-400" />}
              {isUnderpriced && <TrendingDown className="w-4 h-4 text-green-400" />}
            </div>
            <div className="text-2xl font-bold text-white">
              ${property.currentRent.toLocaleString()}/mo
            </div>
            <div className={`text-sm mt-1 ${isOverpriced ? 'text-red-400' : isUnderpriced ? 'text-green-400' : 'text-white/60'}`}>
              {isOverpriced ? '+' : ''}{priceDiffPercent}% vs market
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-sm text-white/60 mb-2">Market Avg</div>
            <div className="text-2xl font-bold text-white">
              ${property.marketAvgRent.toLocaleString()}/mo
            </div>
            <div className="text-sm text-white/60 mt-1">
              {property.bedrooms}bd in area
            </div>
          </div>
        </div>

        {/* Risk Badge */}
        <div className={`flex items-center gap-2 p-3 rounded-lg ${risk.bgColor} ${risk.borderColor} border mb-4`}>
          <span className={risk.color}>{risk.icon}</span>
          <div className="flex-1">
            <div className={`font-semibold ${risk.color}`}>{risk.label}</div>
            {property.daysVacant && property.daysVacant > 0 && (
              <div className="text-sm text-white/60">
                Vacant for {property.daysVacant} days
              </div>
            )}
          </div>
          {isOverpriced && (
            <Badge variant="warning" size="sm">
              Overpriced {Math.abs(Number(priceDiffPercent))}%
            </Badge>
          )}
        </div>

        {/* Competitor Activity */}
        {property.competitorConcessions.length > 0 && (
          <div className="mb-4 p-4 rounded-xl bg-purple-900/20 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-purple-300">
                Competitor Activity
              </span>
            </div>
            <div className="space-y-2">
              {property.competitorConcessions.map((concession, idx) => (
                <div key={idx} className="text-sm text-white/70 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span className="font-medium text-white">{concession.property}:</span>
                  <span>{concession.type} ({concession.value})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation */}
        {property.recommendation && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-blue-300 mb-1">
                  Recommended Action
                </div>
                <div className="text-white/80 text-sm">
                  {property.recommendation}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between text-sm text-white/50 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Updated {property.lastUpdated}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(property.id)}
            className="text-white/60 hover:text-white"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
      </div>
    </Card>
  );
}
