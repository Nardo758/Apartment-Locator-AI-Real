import React from 'react';
import { Button } from '@/components/ui/button';
import { useStripePayment } from '@/hooks/useStripePayment';
import { supabase } from '@/integrations/supabase/client';

const PaymentTest: React.FC = () => {
  const { createPayment, isLoading } = useStripePayment();

  const handleTestPayment = (plan: 'basic' | 'pro' | 'premium') => {
    createPayment(plan, 'test@example.com');
  };

  const handleDirectTest = async () => {
    console.log('Testing direct function call...');
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          planType: 'pro', 
          email: 'test@example.com' 
        }
      });
      
      console.log('Direct test result:', { data, error });
      
      if (error) {
        console.error('Direct test error:', error);
      }
      
      if (data?.url) {
        console.log('Got checkout URL:', data.url);
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Direct test exception:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-2xl font-bold text-center">Payment Test</h1>
        
        <div className="space-y-4">
          <Button 
            onClick={() => handleTestPayment('basic')} 
            disabled={isLoading}
            className="w-full"
          >
            Test Basic Plan ($9.99)
          </Button>
          
          <Button 
            onClick={() => handleTestPayment('pro')} 
            disabled={isLoading}
            className="w-full bg-gradient-primary"
          >
            Test Pro Plan ($29.99)
          </Button>
          
          <Button 
            onClick={() => handleTestPayment('premium')} 
            disabled={isLoading}
            className="w-full"
          >
            Test Premium Plan ($99.99)
          </Button>
          
          <hr className="my-4" />
          
          <Button 
            onClick={handleDirectTest}
            variant="outline" 
            className="w-full"
          >
            Direct Function Test
          </Button>
        </div>
        
        {isLoading && (
          <p className="text-center mt-4 text-muted-foreground">
            Creating payment session...
          </p>
        )}
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Check browser console for detailed logs</p>
          <p>Open DevTools → Network tab to see requests</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentTest;