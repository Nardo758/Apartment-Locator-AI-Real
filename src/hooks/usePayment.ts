import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createPayment = async (plan: 'basic' | 'pro' | 'premium' = 'pro', guestEmail?: string) => {
    try {
      setIsLoading(true);
      
      // Get current session (if user is logged in)
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no session and no guest email, require email
      if (!session && !guestEmail) {
        const email = prompt('Please enter your email address to continue with payment:');
        if (!email) {
          toast({
            variant: "destructive",
            title: "Email Required",
            description: "Email address is required to process payment."
          });
          return null;
        }
        guestEmail = email;
      }

      // Prepare headers and body
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (session) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const body = {
        plan,
        ...(guestEmail && { guestEmail })
      };

      // Call the create-payment edge function
      const { data, error } = await supabase.functions.invoke('create-payment', {
        headers,
        body
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        return data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error.message || "Failed to create payment session"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPayment,
    isLoading
  };
};