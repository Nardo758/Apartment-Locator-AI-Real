import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  plan_end: string | null;
  access_token?: string;
  name?: string;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const checkSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      console.warn('Feature not yet connected - using API routes');
      setSubscription(null);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const validateAccessToken = async (token: string): Promise<boolean> => {
    console.warn('Feature not yet connected - using API routes');
    return false;
  };

  const hasAccess = (feature?: string): boolean => {
    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    if (!subscription.plan_end) {
      return true;
    }

    const now = new Date();
    const endDate = new Date(subscription.plan_end);
    
    if (endDate < now) {
      return false;
    }

    if (feature) {
      switch (feature) {
        case 'unlimited_searches':
          return subscription.plan_type === 'pro' || subscription.plan_type === 'premium';
        case 'advanced_intelligence':
          return subscription.plan_type === 'pro' || subscription.plan_type === 'premium';
        case 'concierge':
          return subscription.plan_type === 'premium';
        case 'phone_support':
          return subscription.plan_type === 'premium';
        default:
          return true;
      }
    }

    return true;
  };

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  return {
    subscription,
    isLoading,
    checkSubscription,
    validateAccessToken,
    hasAccess,
    isActive: subscription?.status === 'active' && hasAccess(),
    planType: subscription?.plan_type,
    expiresAt: subscription?.plan_end
  };
};
