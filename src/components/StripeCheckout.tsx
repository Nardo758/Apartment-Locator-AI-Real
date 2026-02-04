import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface StripeCheckoutProps {
  planType?: string; // For subscriptions: landlord_starter, agent_basic, etc.
  interval?: 'monthly' | 'annual'; // For subscriptions
  email: string;
  name?: string;
  userId?: string;
  isSubscription?: boolean; // true for landlord/agent, false for renter
  className?: string;
  children?: React.ReactNode;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  planType,
  interval = 'monthly',
  email,
  name,
  userId,
  isSubscription = false,
  className = '',
  children
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Email is required',
        variant: 'destructive'
      });
      return;
    }

    if (isSubscription && !planType) {
      toast({
        title: 'Error',
        description: 'Plan type is required for subscriptions',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      const endpoint = isSubscription 
        ? '/api/payments/create-subscription-checkout'
        : '/api/payments/create-renter-checkout';

      const body = isSubscription
        ? { email, name, userId, planType, interval }
        : { email, name, userId };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const data = await response.json();

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start checkout process',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children || 'Subscribe Now'
      )}
    </Button>
  );
};

export default StripeCheckout;
