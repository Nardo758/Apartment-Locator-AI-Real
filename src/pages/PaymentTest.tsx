import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const PaymentTest: React.FC = () => {
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostic = async () => {
    setIsLoading(true);
    console.log('Running payment diagnostic...');
    
    try {
      const { data, error } = await supabase.functions.invoke('payment-diagnostic');
      
      console.log('Diagnostic result:', { data, error });
      setDiagnosticResult({ data, error });
      
      if (error) {
        console.error('Diagnostic error:', error);
      }
    } catch (err) {
      console.error('Diagnostic exception:', err);
      setDiagnosticResult({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const testStripePayment = async () => {
    console.log('Testing Stripe payment...');
    
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          planType: 'pro', 
          email: 'test@example.com' 
        }
      });
      
      console.log('Payment test result:', { data, error });
      
      if (error) {
        console.error('Payment test error:', error);
      }
      
      if (data?.url) {
        console.log('Got checkout URL:', data.url);
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Payment test exception:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        <h1 className="text-2xl font-bold text-center">Payment System Diagnostic</h1>
        
        <div className="space-y-4">
          <Button 
            onClick={runDiagnostic}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? 'Running Diagnostic...' : 'Run Environment Diagnostic'}
          </Button>
          
          <Button 
            onClick={testStripePayment}
            className="w-full bg-gradient-primary"
          >
            Test Stripe Payment Function
          </Button>
        </div>
        
        {diagnosticResult && (
          <div className="bg-card p-4 rounded border">
            <h3 className="font-semibold mb-2">Diagnostic Results:</h3>
            <pre className="text-xs overflow-auto bg-muted p-2 rounded">
              {JSON.stringify(diagnosticResult, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Step 1:</strong> Run diagnostic to check environment</p>
          <p><strong>Step 2:</strong> If diagnostic passes, test payment function</p>
          <p><strong>Step 3:</strong> Check browser console for detailed logs</p>
          <p><strong>Step 4:</strong> Check function logs in Supabase dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentTest;