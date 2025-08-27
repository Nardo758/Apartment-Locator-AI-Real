import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createPayment = async (
    plan: 'basic' | 'pro' | 'premium' = 'pro', 
    guestEmail?: string,
    guestName?: string
  ) => {
    try {
      setIsLoading(true);
      
      // Get current session (if user is logged in)
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no session and no guest email, collect guest information
      if (!session && !guestEmail) {
        const email = prompt('Please enter your email address to continue with payment:');
        if (!email || !email.includes('@')) {
          toast({
            variant: "destructive",
            title: "Valid Email Required",
            description: "Please enter a valid email address to process payment."
          });
          return null;
        }
        
        const name = prompt('Please enter your name for the receipt (optional):');
        guestEmail = email;
        guestName = name || "";
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
        ...(guestEmail && { guestEmail }),
        ...(guestName && { guestName })
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
        
        toast({
          title: "Payment Started",
          description: "You've been redirected to our secure payment page."
        });
        
        return data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error.message || "Failed to create payment session. Please try again."
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