import { Lock, TrendingDown, DollarSign, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ScrapedProperty, SavingsBreakdown } from '@/lib/savings-calculator';
import { formatMoney } from '@/lib/savings-calculator';

interface BlurredPropertyCardProps {
  property: ScrapedProperty;
  savings: SavingsBreakdown;
  onUnlock: (propertyId: string) => void;
}

export default function BlurredPropertyCard({ property, savings, onUnlock }: BlurredPropertyCardProps) {
  return (
    <Card className="relative overflow-visible" data-testid={`card-blurred-property-${property.id}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
          <div>
            <h3 className="font-semibold text-foreground">{property.name}</h3>
            <p className="text-sm text-muted-foreground">{property.address}</p>
          </div>
          {savings.dealScore >= 70 && (
            <Badge variant="default" className="bg-green-600 shrink-0">
              <Sparkles className="w-3 h-3 mr-1" />
              Hot Deal
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 mb-3 flex-wrap">
          <div>
            <p className="text-xs text-muted-foreground">Listed Rent</p>
            <p className="font-medium text-foreground">
              {property.min_rent ? formatMoney(property.min_rent) : 'Contact'}
              {property.max_rent && property.min_rent && property.max_rent !== property.min_rent
                ? ` - ${formatMoney(property.max_rent)}`
                : ''}
            </p>
          </div>
          {property.bedrooms_min && (
            <Badge variant="outline">
              {property.bedrooms_min}
              {property.bedrooms_max && property.bedrooms_max !== property.bedrooms_min
                ? `-${property.bedrooms_max}`
                : ''} bd
            </Badge>
          )}
        </div>

        <div className="relative">
          <div className="select-none" style={{ filter: 'blur(6px)' }}>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="rounded-md bg-green-50 dark:bg-green-950/30 p-2">
                <p className="text-xs text-muted-foreground">Monthly Savings</p>
                <p className="font-bold text-green-600 text-lg">{formatMoney(savings.monthlySavings)}</p>
              </div>
              <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 p-2">
                <p className="text-xs text-muted-foreground">Annual Savings</p>
                <p className="font-bold text-blue-600 text-lg">{formatMoney(savings.annualSavings)}</p>
              </div>
            </div>
            {savings.upfrontSavings > 0 && (
              <div className="rounded-md bg-purple-50 dark:bg-purple-950/30 p-2 mb-3">
                <p className="text-xs text-muted-foreground">Upfront Incentive</p>
                <p className="font-bold text-purple-600">{formatMoney(savings.upfrontSavings)}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Deal Score: {savings.dealScore}/100</Badge>
              <Badge variant="secondary">Negotiation Power: High</Badge>
            </div>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-md">
            <Lock className="w-6 h-6 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground mb-1">Unlock Savings Data</p>
            <p className="text-xs text-muted-foreground mb-3 text-center px-4">
              See deal score, savings breakdown & negotiation tips
            </p>
            <Button
              size="sm"
              onClick={() => onUnlock(property.id)}
              data-testid={`button-unlock-${property.id}`}
            >
              <DollarSign className="w-3 h-3 mr-1" />
              Unlock for $1.99
            </Button>
          </div>
        </div>

        {savings.hasSpecialOffer && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-green-500" />
              <span className="text-xs font-medium text-green-600">Special Offer Available</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
