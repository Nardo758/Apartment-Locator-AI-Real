import React from 'react';
import { TrendingDown, Clock, DollarSign, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRenterIntelligence } from '@/hooks/useRenterIntelligence';
import { RenterUnitCard } from './RenterUnitCard';
import { PaywallModal } from '@/components/PaywallModal';
import { usePaywall } from '@/hooks/usePaywall';
import type { ApartmentIQData } from '@/lib/pricing-engine';

interface Property {
  id: string;
  apartmentIQData?: ApartmentIQData;
}

interface RenterDashboardProps {
  properties: Property[];
  className?: string;
}

export const RenterDashboard: React.FC<RenterDashboardProps> = ({ properties, className }) => {
  const {
    dealIntelligence,
    marketSummary,
    loading,
    error,
    sortedByDealScore,
    greatDeals,
    immediateOpportunities,
    getTotalPotentialSavings,
    getAverageDealScore
  } = useRenterIntelligence(properties);

  const {
    isPaywallOpen,
    paywallPropertyId,
    openPaywall,
    closePaywall,
    isPropertyUnlocked,
    unlockProperty,
    activatePlan,
    resetPaywallState,
  } = usePaywall();

  const handlePaymentSuccess = (planId?: string) => {
    if (planId === 'per_property' && paywallPropertyId) {
      unlockProperty(paywallPropertyId);
    } else if (planId && ['basic', 'pro', 'premium'].includes(planId)) {
      activatePlan(planId);
    } else if (paywallPropertyId) {
      unlockProperty(paywallPropertyId);
    } else {
      resetPaywallState();
    }
    closePaywall();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analyzing market opportunities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
            <p>Error loading market intelligence: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!marketSummary) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-4" />
            <p>No properties available for analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMarketTrendColor = (trend: string) => {
    switch (trend) {
      case 'renter_friendly': return 'text-green-600 bg-green-50 border-green-200';
      case 'competitive': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getMarketTrendText = (trend: string) => {
    switch (trend) {
      case 'renter_friendly': return 'Renter\'s Market';
      case 'competitive': return 'Competitive Market';
      default: return 'Balanced Market';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Great Deals</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{marketSummary.greatDeals}</div>
            <p className="text-xs text-muted-foreground">
              out of {marketSummary.totalUnits} units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Negotiable Units</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{marketSummary.negotiableUnits}</div>
            <p className="text-xs text-muted-foreground">
              high leverage opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Potential Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${Math.round(marketSummary.averageSavings)}/mo
            </div>
            <p className="text-xs text-muted-foreground">
              through negotiation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Condition</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getMarketTrendColor(marketSummary.marketTrend)}>
              {getMarketTrendText(marketSummary.marketTrend)}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {marketSummary.marketTrend === 'renter_friendly' ? 'Good time to negotiate' :
               marketSummary.marketTrend === 'competitive' ? 'Move quickly on deals' :
               'Mixed opportunities'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Deal Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Great Deals</span>
              <span className="text-sm text-green-600 font-semibold">
                {marketSummary.dealDistribution.great_deal} units
              </span>
            </div>
            <Progress 
              value={(marketSummary.dealDistribution.great_deal / marketSummary.totalUnits) * 100} 
              className="h-2"
            />
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Good Deals</span>
              <span className="text-sm text-blue-600 font-semibold">
                {marketSummary.dealDistribution.good_deal} units
              </span>
            </div>
            <Progress 
              value={(marketSummary.dealDistribution.good_deal / marketSummary.totalUnits) * 100} 
              className="h-2"
            />
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Fair Market</span>
              <span className="text-sm text-yellow-600 font-semibold">
                {marketSummary.dealDistribution.fair_deal} units
              </span>
            </div>
            <Progress 
              value={(marketSummary.dealDistribution.fair_deal / marketSummary.totalUnits) * 100} 
              className="h-2"
            />
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Hot Market</span>
              <span className="text-sm text-red-600 font-semibold">
                {marketSummary.dealDistribution.hot_market} units
              </span>
            </div>
            <Progress 
              value={(marketSummary.dealDistribution.hot_market / marketSummary.totalUnits) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {immediateOpportunities.length > 0 && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              Immediate Opportunities ({immediateOpportunities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700 dark:text-green-300 mb-4">
              These units are ready for negotiation right now. Landlords are motivated and timing is optimal.
            </p>
            <div className="grid gap-4">
              {immediateOpportunities.slice(0, 3).map(propertyId => {
                const property = properties.find(p => p.id === propertyId);
                const unlocked = isPropertyUnlocked(propertyId);
                return property ? (
                  <RenterUnitCard 
                    key={propertyId} 
                    property={property} 
                    dealIntelligence={dealIntelligence[propertyId]}
                    compact
                    locked={!unlocked}
                    onUnlockClick={() => openPaywall(propertyId)}
                  />
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Best Deals First
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Units ranked by negotiation potential and deal quality
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedByDealScore.map(propertyId => {
              const property = properties.find(p => p.id === propertyId);
              const unlocked = isPropertyUnlocked(propertyId);
              return property ? (
                <RenterUnitCard 
                  key={propertyId} 
                  property={property} 
                  dealIntelligence={dealIntelligence[propertyId]}
                  locked={!unlocked}
                  onUnlockClick={() => openPaywall(propertyId)}
                />
              ) : null;
            })}
          </div>
        </CardContent>
      </Card>

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={closePaywall}
        potentialSavings={getTotalPotentialSavings()}
        propertiesCount={properties.length}
        onPaymentSuccess={handlePaymentSuccess}
        propertyId={paywallPropertyId}
      />
    </div>
  );
};
