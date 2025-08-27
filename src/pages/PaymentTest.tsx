import React from 'react';
import { Button } from '@/components/ui/button';
import { useStripePayment } from '@/hooks/useStripePayment';

const PaymentTest: React.FC = () => {
  const { createPayment, isLoading } = useStripePayment();

  const handleTestPayment = (plan: 'basic' | 'pro' | 'premium') => {
    createPayment(plan, 'test@example.com');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-8">Payment Test</h1>
        
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
        </div>
        
        {isLoading && (
          <p className="text-center mt-4 text-muted-foreground">
            Creating payment session...
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentTest;