import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentButton } from '@/components/PaymentButton';
import { Lock, Zap } from 'lucide-react';

interface FeatureGateProps {
  feature?: string;
  requiredPlan?: 'basic' | 'pro' | 'premium';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  requiredPlan = 'pro',
  fallback,
  children
}) => {
  const { hasAccess, subscription, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user has access to this feature
  if (hasAccess(feature)) {
    return <>{children}</>;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  const planFeatures = {
    basic: {
      name: 'Basic',
      price: '$9.99',
      features: ['5 AI property analyses', 'Basic market insights', 'Email templates', '7-day access']
    },
    pro: {
      name: 'Pro',
      price: '$29.99',
      features: ['Unlimited AI analyses', 'Advanced market intelligence', 'Email automation', 'Success probability scoring', '30-day access']
    },
    premium: {
      name: 'Premium',
      price: '$99.99',
      features: ['Everything in Pro', 'Personal AI concierge', 'Custom market reports', 'White-glove setup', '90-day access', 'Direct phone support']
    }
  };

  const plan = planFeatures[requiredPlan];

  return (
    <Card className="border-2 border-dashed border-muted-foreground/25">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl">Upgrade to {plan.name} Plan</CardTitle>
        <CardDescription>
          This feature requires a {plan.name} subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="text-3xl font-bold text-primary">{plan.price}</div>
        <div className="text-sm text-muted-foreground">one-time payment</div>
        
        <div className="space-y-2">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center text-sm text-muted-foreground">
              <Zap className="w-4 h-4 mr-2 text-primary" />
              {feature}
            </div>
          ))}
        </div>

        <PaymentButton 
          plan={requiredPlan}
          className="w-full mt-6"
          variant="default"
        >
          Upgrade to {plan.name} - {plan.price}
        </PaymentButton>

        {subscription && subscription.plan_end && (
          <div className="text-xs text-muted-foreground mt-4">
            Current plan: {subscription.plan_type} (expires {new Date(subscription.plan_end).toLocaleDateString()})
          </div>
        )}
      </CardContent>
    </Card>
  );
};