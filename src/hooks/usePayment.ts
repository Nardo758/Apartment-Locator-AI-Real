import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentData {
  plan: 'basic' | 'pro' | 'premium';
  guestEmail?: string;
  guestName?: string;
}

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<'basic' | 'pro' | 'premium' | null>(null);
  const { toast } = useToast();

  const processPayment = useCallback(async (
    plan: 'basic' | 'pro' | 'premium',
    guestEmail?: string,
    guestName?: string
  ) => {
    try {
      setIsLoading(true);
      
      // Get current session (if user is logged in)
      const { data: { session } } = await supabase.auth.getSession();

      // Prepare headers and body
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (session) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const body: PaymentData = {
        plan,
        ...(guestEmail && { guestEmail }),
        ...(guestName && { guestName })
      };

      // Call the create-checkout-session edge function
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
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
        description: error instanceof Error ? error.message : "Failed to create payment session. Please try again."
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createPayment = useCallback(async (
    plan: 'basic' | 'pro' | 'premium' = 'pro', 
    guestEmail?: string,
    guestName?: string
  ) => {
    // Get current session (if user is logged in)
    const { data: { session } } = await supabase.auth.getSession();
    
    // If no session and no guest email, show guest modal
    if (!session && !guestEmail) {
      setPendingPlan(plan);
      setShowGuestModal(true);
      return null;
    }

    // Process payment directly
    return processPayment(plan, guestEmail, guestName);
  }, [processPayment]);

  const handleGuestSubmit = useCallback((email: string, name: string) => {
    if (pendingPlan) {
      setShowGuestModal(false);
      setPendingPlan(null);
      processPayment(pendingPlan, email, name);
    }
  }, [pendingPlan, processPayment]);

  const handleGuestCancel = useCallback(() => {
    setShowGuestModal(false);
    setPendingPlan(null);
  }, []);

  return {
    createPayment,
    processPayment,
    isLoading,
    showGuestModal,
    pendingPlan,
    handleGuestSubmit,
    handleGuestCancel
  };
};