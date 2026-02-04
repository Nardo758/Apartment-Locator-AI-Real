import React, { useState } from 'react';
import { X, CheckCircle, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  potentialSavings: number;
  propertiesCount: number;
  onPaymentSuccess: () => void;
  guestEmail?: string;
  guestName?: string;
  searchCriteria?: Record<string, unknown>;
}

function CheckoutForm({ 
  clientSecret, 
  onSuccess, 
  onError 
}: { 
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Verify payment with backend
        const response = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        });

        if (response.ok) {
          onSuccess();
        } else {
          onError('Payment verification failed');
        }
      }
    } catch (err: any) {
      onError(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        size="lg"
      >
        {isProcessing ? 'Processing...' : 'Pay $49 - Unlock Full Results'}
      </Button>
    </form>
  );
}

export function PaywallModal({
  isOpen,
  onClose,
  potentialSavings,
  propertiesCount,
  onPaymentSuccess,
  guestEmail,
  guestName,
  searchCriteria,
}: PaywallModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen && !clientSecret) {
      initializePayment();
    }
  }, [isOpen]);

  const initializePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestEmail,
          guestName,
          searchCriteria,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to initialize payment');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="p-8 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Unlock Full Results</h2>
              <p className="text-gray-600">One-time payment • Lifetime access</p>
            </div>
          </div>

          {/* Value Prop */}
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">You could save</p>
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                ${potentialSavings.toLocaleString()}/year
              </p>
              <p className="text-sm text-gray-600 mt-1">
                across {propertiesCount} properties
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="p-8 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll Get:</h3>
          
          <div className="space-y-3">
            {[
              'Full property list with Smart Scores',
              'Detailed negotiation scripts for each property',
              'Email templates to send to landlords',
              'Market intelligence report',
              'Concession recommendations',
              'Lifetime access to your results',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Form */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Initializing secure payment...</p>
            </div>
          )}

          {!loading && !clientSecret && !error && (
            <Button 
              onClick={initializePayment}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
              size="lg"
            >
              Continue to Payment
            </Button>
          )}

          {clientSecret && !loading && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm 
                clientSecret={clientSecret}
                onSuccess={onPaymentSuccess}
                onError={setError}
              />
            </Elements>
          )}

          {/* Trust badges */}
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Secure payment</span>
            </div>
            <span>•</span>
            <span>Money-back guarantee</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 text-center text-sm text-gray-600">
          <p>
            Payment processed securely by Stripe. Your information is encrypted and protected.
          </p>
        </div>
      </div>
    </div>
  );
}
