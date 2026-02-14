import { Lock, Check, Sparkles, Crown, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName?: string;
  onUnlockSingle: () => void;
  onSelectPlan: (planType: 'basic' | 'pro' | 'premium') => void;
}

const plans = [
  {
    type: 'basic' as const,
    name: 'Basic',
    price: '$9.99',
    duration: '7 days',
    icon: Zap,
    features: ['5 AI property analyses', 'Basic market insights', '7-day access'],
  },
  {
    type: 'pro' as const,
    name: 'Pro',
    price: '$29.99',
    duration: '30 days',
    popular: true,
    icon: Sparkles,
    features: [
      'Unlimited AI analyses',
      'Advanced market intelligence',
      'Negotiation strategies',
      '30-day access',
    ],
  },
  {
    type: 'premium' as const,
    name: 'Premium',
    price: '$99.99',
    duration: '90 days',
    icon: Crown,
    features: [
      'Everything in Pro',
      'Personal AI concierge',
      'Custom market reports',
      '90-day access',
    ],
  },
];

export const UnlockModal: React.FC<UnlockModalProps> = ({
  isOpen,
  onClose,
  propertyName,
  onUnlockSingle,
  onSelectPlan,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-testid="unlock-modal"
      >
        <DialogHeader>
          <DialogTitle data-testid="text-unlock-modal-title">
            Unlock Deal Intelligence
          </DialogTitle>
          <DialogDescription data-testid="text-unlock-modal-description">
            {propertyName
              ? `See savings data for ${propertyName}`
              : 'Access savings data and negotiation insights'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <Card data-testid="card-single-unlock">
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">Single Property Unlock</p>
                  <p className="text-xs text-muted-foreground">
                    One-time access to this property's data
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={onUnlockSingle}
                data-testid="button-modal-unlock-single"
              >
                $1.99
              </Button>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or get a plan
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <Card
                  key={plan.type}
                  className={`relative ${plan.popular ? 'border-primary' : ''}`}
                  data-testid={`card-plan-${plan.type}`}
                >
                  {plan.popular && (
                    <Badge
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2"
                      data-testid="badge-most-popular"
                    >
                      Most Popular
                    </Badge>
                  )}
                  <CardContent className="p-4 pt-5 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold text-sm">{plan.name}</span>
                    </div>
                    <div>
                      <span className="text-xl font-bold">{plan.price}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        / {plan.duration}
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-1.5">
                          <Check className="w-3 h-3 mt-0.5 text-green-600 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={plan.popular ? 'default' : 'outline'}
                      size="sm"
                      className="w-full mt-auto"
                      onClick={() => onSelectPlan(plan.type)}
                      data-testid={`button-select-plan-${plan.type}`}
                    >
                      Select {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
