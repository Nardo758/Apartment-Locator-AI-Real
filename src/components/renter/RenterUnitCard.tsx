import React from 'react';
import { 
  Clock, 
  DollarSign, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Home,
  MapPin,
  Users,
  Calendar,
  Lightbulb,
  Timer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RenterDealIntelligence } from '@/lib/renter-intelligence';
import type { ApartmentIQData } from '@/lib/pricing-engine';
import { LockedSavingsOverlay } from './LockedSavingsOverlay';

interface Property {
  id: string;
  apartmentIQData?: ApartmentIQData;
}

interface RenterUnitCardProps {
  property: Property;
  dealIntelligence: RenterDealIntelligence;
  compact?: boolean;
  locked?: boolean;
  onUnlockSingle?: () => void;
  onGetPlan?: () => void;
}

export const RenterUnitCard: React.FC<RenterUnitCardProps> = ({ 
  property, 
  dealIntelligence, 
  compact = false,
  locked = false,
  onUnlockSingle,
  onGetPlan,
}) => {
  const { apartmentIQData } = property;
  
  if (!apartmentIQData || !dealIntelligence) return null;

  const getDealLevelColor = (level: string) => {
    switch (level) {
      case 'great_deal': return 'bg-green-100 text-green-800 border-green-300';
      case 'good_deal': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'fair_deal': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'hot_market': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDealLevelText = (level: string) => {
    switch (level) {
      case 'great_deal': return 'Great Deal';
      case 'good_deal': return 'Good Deal';
      case 'fair_deal': return 'Fair Market';
      case 'hot_market': return 'Hot Market';
      default: return 'Unknown';
    }
  };

  const getDealLevelIcon = (level: string) => {
    switch (level) {
      case 'great_deal': return <CheckCircle className="w-4 h-4" />;
      case 'good_deal': return <Target className="w-4 h-4" />;
      case 'fair_deal': return <Clock className="w-4 h-4" />;
      case 'hot_market': return <AlertTriangle className="w-4 h-4" />;
      default: return <Home className="w-4 h-4" />;
    }
  };

  const getNegotiationColor = (potential: string) => {
    switch (potential) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTimingAdviceColor = (advice: string) => {
    switch (advice) {
      case 'wait': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'negotiate_now': return 'text-green-600 bg-green-50 border-green-200';
      case 'apply_immediately': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTimingAdviceText = (advice: string) => {
    switch (advice) {
      case 'wait': return 'Wait & Watch';
      case 'negotiate_now': return 'Negotiate Now';
      case 'apply_immediately': return 'Apply ASAP';
      default: return 'Consider';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className={`${compact ? 'border-l-4' : 'border-l-4'} ${
      dealIntelligence.dealLevel === 'great_deal' ? 'border-l-green-500' :
      dealIntelligence.dealLevel === 'good_deal' ? 'border-l-blue-500' :
      dealIntelligence.dealLevel === 'fair_deal' ? 'border-l-yellow-500' :
      'border-l-red-500'
    }`}>
      <CardHeader className={compact ? 'pb-3' : 'pb-4'}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{apartmentIQData.propertyName}</CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Unit {apartmentIQData.unitNumber} • {apartmentIQData.bedrooms}BR/{apartmentIQData.bathrooms}BA
            </p>
          </div>
          <div className="text-right">
            <Badge className={getDealLevelColor(dealIntelligence.dealLevel)}>
              {getDealLevelIcon(dealIntelligence.dealLevel)}
              {getDealLevelText(dealIntelligence.dealLevel)}
            </Badge>
            <p className="text-lg font-bold mt-1">{formatCurrency(apartmentIQData.currentRent)}/mo</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Deal Score */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Deal Score</span>
          <div className={`flex items-center gap-2 ${locked ? 'filter blur-[8px] select-none pointer-events-none' : ''}`} data-testid="display-deal-score">
            <Progress value={dealIntelligence.dealScore} className="w-20 h-2" />
            <span className="font-bold text-sm">{dealIntelligence.dealScore}/100</span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm ${locked ? 'filter blur-[8px] select-none pointer-events-none' : ''}`} data-testid="display-key-metrics">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Vacant</span>
            </div>
            <p className="font-semibold">{apartmentIQData.daysOnMarket} days</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Target className="w-3 h-3" />
              <span>Negotiation</span>
            </div>
            <p className={`font-semibold capitalize ${getNegotiationColor(dealIntelligence.negotiationPotential)}`}>
              {dealIntelligence.negotiationPotential}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>Competition</span>
            </div>
            <p className={`font-semibold capitalize ${
              dealIntelligence.competitionLevel === 'low' ? 'text-green-600' :
              dealIntelligence.competitionLevel === 'medium' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {dealIntelligence.competitionLevel}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Timer className="w-3 h-3" />
              <span>Leverage</span>
            </div>
            <p className="font-semibold">{dealIntelligence.vacancyWeakness}/10</p>
          </div>
        </div>

        {/* Potential Savings */}
        <div className="relative" data-testid="section-potential-savings">
          <div className={`bg-green-50 border border-green-200 rounded-lg p-3 ${locked ? 'filter blur-[8px] select-none pointer-events-none' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Potential Savings</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-green-700">Monthly Range</p>
                <p className="font-bold text-green-800">
                  {formatCurrency(dealIntelligence.potentialSavings.monthlyRange[0])} - {formatCurrency(dealIntelligence.potentialSavings.monthlyRange[1])}
                </p>
              </div>
              <div>
                <p className="text-green-700">Annual Savings</p>
                <p className="font-bold text-green-800">
                  {formatCurrency(dealIntelligence.potentialSavings.annualSavings)}
                </p>
              </div>
            </div>
            {dealIntelligence.potentialSavings.oneTimeConcessions > 0 && (
              <p className="text-xs text-green-700 mt-1">
                + {formatCurrency(dealIntelligence.potentialSavings.oneTimeConcessions)} in existing concessions
              </p>
            )}
          </div>
          {locked && onUnlockSingle && onGetPlan && (
            <LockedSavingsOverlay
              onUnlockSingle={onUnlockSingle}
              onGetPlan={onGetPlan}
              savingsHint="Savings data available"
            />
          )}
        </div>

        {/* Timing Advice */}
        <div className={`flex items-center justify-between p-3 rounded-lg border ${locked ? 'filter blur-[8px] select-none pointer-events-none' : ''}`} data-testid="display-timing-advice">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Timing Advice</span>
          </div>
          <Badge className={getTimingAdviceColor(dealIntelligence.timing.advice)}>
            {getTimingAdviceText(dealIntelligence.timing.advice)}
          </Badge>
        </div>

        {!compact && (
          <>
            {/* Negotiation Tips */}
            {dealIntelligence.negotiationTips.length > 0 && (
              <div className={`space-y-2 ${locked ? 'filter blur-[8px] select-none pointer-events-none' : ''}`} data-testid="display-negotiation-tips">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium">Negotiation Tips</span>
                </div>
                <ul className="text-sm space-y-1 pl-6">
                  {dealIntelligence.negotiationTips.slice(0, 3).map((tip, index) => (
                    <li key={index} className="list-disc text-muted-foreground">{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Landlord Desperation Indicator */}
            <div className={`flex items-center justify-between text-sm ${locked ? 'filter blur-[8px] select-none pointer-events-none' : ''}`} data-testid="display-landlord-status">
              <span className="text-muted-foreground">Landlord Status</span>
              <span className={`font-medium capitalize ${
                dealIntelligence.landlordDesperation === 'desperate' ? 'text-green-600' :
                dealIntelligence.landlordDesperation === 'motivated' ? 'text-blue-600' :
                dealIntelligence.landlordDesperation === 'standard' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {dealIntelligence.landlordDesperation}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                className={
                  dealIntelligence.timing.advice === 'apply_immediately' ? 'bg-red-600 hover:bg-red-700' :
                  dealIntelligence.timing.advice === 'negotiate_now' ? 'bg-green-600 hover:bg-green-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }
                data-testid="button-primary-action"
              >
                {dealIntelligence.timing.advice === 'apply_immediately' ? 'Apply Now' :
                 dealIntelligence.timing.advice === 'negotiate_now' ? 'Negotiate' :
                 'Monitor'}
              </Button>
              <Button variant="outline" size="sm" data-testid="button-view-details">
                View Details
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};