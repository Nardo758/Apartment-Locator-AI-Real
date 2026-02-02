import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/useUser';

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
  const { user, isAuthenticated } = useUser();

  const processPayment = useCallback(async (
    plan: 'basic' | 'pro' | 'premium',
    guestEmail?: string,
    guestName?: string
  ) => {
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const body: PaymentData = {
        plan,
        ...(guestEmail && { guestEmail }),
        ...(guestName && { guestName })
      };

      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      const data = await res.json();

      if (data?.url) {
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
    if (!isAuthenticated && !guestEmail) {
      setPendingPlan(plan);
      setShowGuestModal(true);
      return null;
    }

    return processPayment(plan, guestEmail, guestName);
  }, [isAuthenticated, processPayment]);

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
