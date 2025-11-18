import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Crown, Zap } from 'lucide-react';

export const SubscriptionStatus: React.FC = () => {
  const { subscription, isLoading, isActive } = useSubscription();

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription || !isActive) {
    return (
      <Card className="w-full border-dashed border-muted-foreground/25">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Crown className="w-5 h-5" />
            No Active Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Upgrade to access premium features and unlimited apartment analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'basic':
        return <Zap className="w-5 h-5 text-blue-500" />;
      case 'pro':
        return <Zap className="w-5 h-5 text-purple-500" />;
      case 'premium':
        return <Crown className="w-5 h-5 text-yellow-500" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'basic':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'pro':
        return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      case 'premium':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = subscription.plan_end ? getDaysRemaining(subscription.plan_end) : null;
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getPlanIcon(subscription.plan_type)}
          Your {subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)} Plan
          <Badge className={getPlanColor(subscription.plan_type)}>
            Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription.plan_end && (
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Expires:</span>
            <span className={isExpiringSoon ? 'text-destructive font-medium' : 'text-foreground'}>
              {formatDate(subscription.plan_end)}
            </span>
            {isExpiringSoon && daysRemaining !== null && (
              <Badge variant="destructive" className="text-xs">
                {daysRemaining} days left
              </Badge>
            )}
          </div>
        )}

        {subscription.name && (
          <div className="text-sm">
            <span className="text-muted-foreground">Account:</span>
            <span className="ml-2 text-foreground">{subscription.name}</span>
          </div>
        )}

        <div className="pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Plan ID: {subscription.id.slice(0, 8)}...
          </div>
        </div>
      </CardContent>
    </Card>
  );
};