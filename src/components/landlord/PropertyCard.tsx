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
  MoreVertical,
  Building2,
  Percent,
  Target,
  Eye,
  ChevronRight
} from 'lucide-react';

interface CompetitorConcession {
  property: string;
  type: string;
  value: string;
}

interface CompetitorComparison {
  propertyName: string;
  distance: number; // in miles
  rent: number;
  bedrooms: number;
  bathrooms: number;
  concessions: string[];
  occupancyRate?: number;
}

interface PricingRecommendation {
  type: 'increase' | 'decrease' | 'hold';
  amount?: number;
  confidence: number; // 0-100
  reasoning: string;
  expectedImpact?: string;
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
  status: 'occupied' | 'vacant';
  leaseEndDate?: string;
  tenant?: string;
  // Enhanced fields
  pricingRecommendation?: PricingRecommendation;
  competitorComparison?: CompetitorComparison[];
  competitionSetName?: string;
  imageUrl?: string;
  yearBuilt?: number;
}

interface PropertyCardProps {
  property: PropertyData;
  onEdit?: (propertyId: string) => void;
  onViewDetails?: (propertyId: string) => void;
  className?: string;
}

export function PropertyCard({ property, onEdit, onViewDetails, className = '' }: PropertyCardProps) {
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

  const recommendationConfig = {
    increase: {
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-500/30',
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Raise Rent'
    },
    decrease: {
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-500/30',
      icon: <TrendingDown className="w-4 h-4" />,
      label: 'Lower Rent'
    },
    hold: {
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-500/30',
      icon: <Target className="w-4 h-4" />,
      label: 'Hold Steady'
    }
  };

  const risk = riskConfig[property.vacancyRisk];
  const recConfig = property.pricingRecommendation 
    ? recommendationConfig[property.pricingRecommendation.type]
    : null;

  // Calculate average competitor rent
  const avgCompetitorRent = property.competitorComparison?.length
    ? property.competitorComparison.reduce((sum, c) => sum + c.rent, 0) / property.competitorComparison.length
    : null;

  return (
    <Card 
      variant="elevated" 
      hover
      className={`relative overflow-hidden ${risk.borderColor} ${className}`}
    >
      {/* Risk indicator stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${risk.bgColor}`} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-white">
                {property.address}
              </h3>
              {property.status === 'occupied' ? (
                <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
                  Occupied
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Vacant {property.daysVacant ? `${property.daysVacant}d` : ''}
                </Badge>
              )}
            </div>
            <p className="text-white/60 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {property.city}, {property.state} • {property.bedrooms}bd/{property.bathrooms}ba
              {property.squareFeet && ` • ${property.squareFeet.toLocaleString()} sq ft`}
              {property.yearBuilt && ` • Built ${property.yearBuilt}`}
            </p>
            {property.competitionSetName && (
              <p className="text-purple-400 text-xs mt-1 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {property.competitionSetName}
              </p>
            )}
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
              {property.bedrooms}bd in {property.city}
            </div>
          </div>
        </div>

        {/* AI Pricing Recommendation */}
        {property.pricingRecommendation && recConfig && (
          <div className={`p-4 rounded-xl ${recConfig.bgColor} ${recConfig.borderColor} border mb-4`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${recConfig.bgColor}`}>
                {recConfig.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className={`font-semibold ${recConfig.color}`}>
                    {recConfig.label}
                    {property.pricingRecommendation.amount && (
                      <span className="ml-2">
                        ${property.pricingRecommendation.amount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Percent className="w-3 h-3 text-white/50" />
                    <span className="text-xs text-white/60">
                      {property.pricingRecommendation.confidence}% confidence
                    </span>
                  </div>
                </div>
                <p className="text-sm text-white/80 mb-2">
                  {property.pricingRecommendation.reasoning}
                </p>
                {property.pricingRecommendation.expectedImpact && (
                  <div className="text-xs text-white/60 flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Expected: {property.pricingRecommendation.expectedImpact}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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

        {/* Competitor Comparison */}
        {property.competitorComparison && property.competitorComparison.length > 0 && (
          <div className="mb-4 p-4 rounded-xl bg-purple-900/20 border border-purple-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-300">
                  Nearby Competition
                </span>
              </div>
              {avgCompetitorRent && (
                <div className="text-right">
                  <div className="text-xs text-white/60">Avg Competitor</div>
                  <div className="text-sm font-bold text-white">
                    ${avgCompetitorRent.toFixed(0)}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {property.competitorComparison.slice(0, 3).map((comp, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span className="font-medium text-white">{comp.propertyName}</span>
                    <span className="text-white/50 text-xs">
                      {comp.distance.toFixed(1)} mi
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/70">
                      {comp.bedrooms}bd/${comp.bathrooms}ba
                    </span>
                    <span className={`font-semibold ${
                      comp.rent > property.currentRent ? 'text-green-400' : 'text-orange-400'
                    }`}>
                      ${comp.rent.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {property.competitorComparison.length > 3 && (
              <button
                onClick={() => onViewDetails?.(property.id)}
                className="w-full mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center justify-center gap-1"
              >
                View all {property.competitorComparison.length} competitors
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Competitor Activity */}
        {property.competitorConcessions.length > 0 && (
          <div className="mb-4 p-4 rounded-xl bg-orange-900/20 border border-orange-500/30">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-orange-300">
                Active Concessions Nearby
              </span>
            </div>
            <div className="space-y-2">
              {property.competitorConcessions.map((concession, idx) => (
                <div key={idx} className="text-sm text-white/70 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
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

        {/* Tenant Info (if occupied) */}
        {property.status === 'occupied' && property.tenant && (
          <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-sm">
              <div className="text-white/60">Tenant: <span className="text-white font-medium">{property.tenant}</span></div>
              {property.leaseEndDate && (
                <div className="text-white/60">
                  Lease ends: <span className="text-white font-medium">{property.leaseEndDate}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Calendar className="w-4 h-4" />
            <span>Updated {property.lastUpdated}</span>
          </div>
          <div className="flex items-center gap-2">
            {onViewDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(property.id)}
                className="text-white/60 hover:text-white"
              >
                <Eye className="w-4 h-4 mr-1" />
                Details
              </Button>
            )}
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
      </div>
    </Card>
  );
}
