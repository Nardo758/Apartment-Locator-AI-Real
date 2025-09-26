import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  plan_end: string;
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
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.email) {
        setSubscription(null);
        return;
      }

      // Query subscriber data
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('email', session.user.email)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking subscription:', error);
        return;
      }

      if (data) {
        // Check if subscription is expired
        const now = new Date();
        const endDate = new Date(data.plan_end);
        
        if (endDate < now) {
          // Subscription expired, update status
          await supabase
            .from('subscribers')
            .update({ status: 'expired' })
            .eq('id', data.id);
          
          setSubscription(null);
          toast({
            variant: "destructive",
            title: "Subscription Expired",
            description: "Your plan has expired. Please upgrade to continue using our services."
          });
        } else {
          setSubscription(data);
        }
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const validateAccessToken = async (token: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('access_tokens')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .single();

      if (error || !data) {
        return false;
      }

      // Check if token is expired
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (expiresAt < now) {
        return false;
      }

      // Mark token as used (optional, depending on your business logic)
      // await supabase.from('access_tokens').update({ used: true }).eq('id', data.id);
      
      return true;
    } catch (error) {
      console.error('Error validating access token:', error);
      return false;
    }
  };

  const hasAccess = (feature?: string): boolean => {
    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    const now = new Date();
    const endDate = new Date(subscription.plan_end);
    
    if (endDate < now) {
      return false;
    }

    // Feature-based access control
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

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          checkSubscription();
        } else if (event === 'SIGNED_OUT') {
          setSubscription(null);
        }
      }
    );

    return () => {
      authSubscription.unsubscribe();
    };
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