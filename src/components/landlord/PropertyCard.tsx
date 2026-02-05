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
import type { Property, PropertyCardProps } from '@/types/landlord.types';

export function PropertyCard({ property, onEdit, onViewDetails, className = '' }: PropertyCardProps) {
  const priceDiff = (property.currentRent || 0) - (property.marketAvgRent || 0);
  const priceDiffPercent = property.marketAvgRent 
    ? ((priceDiff / property.marketAvgRent) * 100).toFixed(1)
    : '0.0';
  const isOverpriced = priceDiff > 0;
  const isUnderpriced = priceDiff < -50;

  const riskConfig = {
    low: { 
      color: 'text-green-700 dark:text-green-400', 
      bgColor: 'bg-green-100 dark:bg-green-500/10', 
      borderColor: 'border-green-300 dark:border-green-500/30',
      icon: <CheckCircle className="w-5 h-5" />,
      label: 'PRICED RIGHT'
    },
    medium: { 
      color: 'text-yellow-700 dark:text-yellow-400', 
      bgColor: 'bg-yellow-100 dark:bg-yellow-500/10', 
      borderColor: 'border-yellow-300 dark:border-yellow-500/30',
      icon: <AlertTriangle className="w-5 h-5" />,
      label: 'WATCH CLOSELY'
    },
    high: { 
      color: 'text-red-700 dark:text-red-400', 
      bgColor: 'bg-red-100 dark:bg-red-500/10', 
      borderColor: 'border-red-300 dark:border-red-500/30',
      icon: <AlertTriangle className="w-5 h-5" />,
      label: 'HIGH RISK'
    }
  };

  const recommendationConfig = {
    increase: {
      color: 'text-green-700 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      borderColor: 'border-green-300 dark:border-green-500/30',
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Raise Rent'
    },
    decrease: {
      color: 'text-orange-700 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      borderColor: 'border-orange-300 dark:border-orange-500/30',
      icon: <TrendingDown className="w-4 h-4" />,
      label: 'Lower Rent'
    },
    hold: {
      color: 'text-blue-700 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      borderColor: 'border-blue-300 dark:border-blue-500/30',
      icon: <Target className="w-4 h-4" />,
      label: 'Hold Steady'
    }
  };

  const risk = riskConfig[property.vacancyRisk] || riskConfig.low;
  const recConfig = property.pricingRecommendation 
    ? recommendationConfig[property.pricingRecommendation.type]
    : null;

  // Calculate average competitor rent
  const avgCompetitorRent = property.competitorComparison?.length
    ? property.competitorComparison?.reduce((sum, c) => sum + (c.rent || 0), 0) / (property.competitorComparison?.length || 1)
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
              <h3 className="text-xl font-bold text-foreground">
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
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {property.city}, {property.state} • {property.bedrooms}bd/{property.bathrooms}ba
              {property.squareFeet && ` • ${property.squareFeet?.toLocaleString()} sq ft`}
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
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Pricing Section */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className={`p-4 rounded-xl ${risk.bgColor} ${risk.borderColor} border`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Your Rent</span>
              {isOverpriced && <TrendingUp className="w-4 h-4 text-destructive" />}
              {isUnderpriced && <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400" />}
            </div>
            <div className="text-2xl font-bold text-foreground">
              ${property.currentRent?.toLocaleString() || '0'}/mo
            </div>
            <div className={`text-sm mt-1 ${isOverpriced ? 'text-destructive' : isUnderpriced ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
              {isOverpriced ? '+' : ''}{priceDiffPercent}% vs market
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-border">
            <div className="text-sm text-muted-foreground mb-2">Market Avg</div>
            <div className="text-2xl font-bold text-foreground">
              ${property.marketAvgRent?.toLocaleString() || '0'}/mo
            </div>
            <div className="text-sm text-muted-foreground mt-1">
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
                    <Percent className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {property.pricingRecommendation.confidence}% confidence
                    </span>
                  </div>
                </div>
                <p className="text-sm text-foreground/80 mb-2">
                  {property.pricingRecommendation.reasoning}
                </p>
                {property.pricingRecommendation.expectedImpact && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
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
              <div className="text-sm text-muted-foreground">
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
        {property.competitorComparison && (property.competitorComparison?.length || 0) > 0 && (
          <div className="mb-4 p-4 rounded-xl bg-primary/10 border border-primary/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  Nearby Competition
                </span>
              </div>
              {avgCompetitorRent && (
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Avg Competitor</div>
                  <div className="text-sm font-bold text-foreground">
                    ${avgCompetitorRent.toFixed(0)}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {property.competitorComparison?.slice(0, 3).map((comp, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-gray-100 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="font-medium text-foreground">{comp.propertyName}</span>
                    <span className="text-muted-foreground text-xs">
                      {comp.distance.toFixed(1)} mi
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      {comp.bedrooms}bd/${comp.bathrooms}ba
                    </span>
                    <span className={`font-semibold ${
                      (comp.rent || 0) > (property.currentRent || 0) ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      ${comp.rent?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {(property.competitorComparison?.length || 0) > 3 && (
              <button
                onClick={() => onViewDetails?.(property.id)}
                className="w-full mt-2 text-xs text-primary hover:text-primary/80 flex items-center justify-center gap-1"
              >
                View all {property.competitorComparison?.length} competitors
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Competitor Activity */}
        {(property.competitorConcessions?.length || 0) > 0 && (
          <div className="mb-4 p-4 rounded-xl bg-orange-100 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-500/30">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                Active Concessions Nearby
              </span>
            </div>
            <div className="space-y-2">
              {property.competitorConcessions?.map((concession, idx) => (
                <div key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-600 dark:bg-orange-400" />
                  <span className="font-medium text-foreground">{concession.property}:</span>
                  <span>{concession.type} ({concession.value})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation */}
        {property.recommendation && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <div className="text-sm font-semibold text-primary mb-1">
                  Recommended Action
                </div>
                <div className="text-foreground/80 text-sm">
                  {property.recommendation}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tenant Info (if occupied) */}
        {property.status === 'occupied' && property.tenant && (
          <div className="mb-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-border">
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">Tenant: <span className="text-foreground font-medium">{property.tenant}</span></div>
              {property.leaseEndDate && (
                <div className="text-muted-foreground">
                  Lease ends: <span className="text-foreground font-medium">{property.leaseEndDate}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Updated {property.lastUpdated}</span>
          </div>
          <div className="flex items-center gap-2">
            {onViewDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(property.id)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Details
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(property.id)}
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
