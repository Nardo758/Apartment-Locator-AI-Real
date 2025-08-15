import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type PlanType = 'basic' | 'pro' | 'premium';

export const useStripePayment = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createPayment = async (planType: PlanType, email: string) => {
    setIsLoading(true);
    
    try {
      console.log(`Initiating payment for ${planType} plan with email: ${email}`);
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { planType, email }
      });

      if (error) {
        console.error('Payment error:', error);
        toast.error('Payment failed. Please try again.');
        return;
      }

      if (data?.url) {
        console.log('Redirecting to Stripe checkout:', data.url);
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPayment,
    isLoading
  };
};