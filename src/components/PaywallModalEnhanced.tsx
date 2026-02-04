import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Lock, Sparkles, Zap, TrendingUp, FileText, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { logUserActionError } from '@/lib/errorLogger';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaywallModalEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  triggeredBy?: string;
  propertyViewCount?: number;
  guestEmail?: string;
  guestName?: string;
}

interface Feature {
  icon: React.ReactNode;
  name: string;
  free: boolean | string;
  premium: boolean | string;
}

const features: Feature[] = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    name: 'Property Search',
    free: '3 views',
    premium: 'Unlimited',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    name: 'AI Smart Scores',
    free: false,
    premium: true,
  },
  {
    icon: <FileText className="w-5 h-5" />,
    name: 'Offer Generation',
    free: false,
    premium: true,
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    name: 'Market Intelligence',
    free: 'Basic',
    premium: 'Advanced',
  },
  {
    icon: <FileText className="w-5 h-5" />,
    name: 'Negotiation Scripts',
    free: false,
    premium: true,
  },
  {
    icon: <Shield className="w-5 h-5" />,
    name: 'Email Templates',
    free: false,
    premium: true,
  },
  {
    icon: <Clock className="w-5 h-5" />,
    name: 'Lifetime Access',
    free: false,
    premium: true,
  },
];

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
        logUserActionError('Payment error', new Error(error.message || 'Payment failed'));
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Verify payment with backend
        try {
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
        } catch (err) {
          logUserActionError('Payment verification failed', err as Error);
          onError('Payment verification failed');
        }
      }
    } catch (err: any) {
      logUserActionError('Payment processing error', err);
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
        {isProcessing ? 'Processing...' : 'Pay $49 - Unlock Full Access'}
      </Button>
    </form>
  );
}

export function PaywallModalEnhanced({
  isOpen,
  onClose,
  onPaymentSuccess,
  triggeredBy = 'unknown',
  propertyViewCount = 0,
  guestEmail,
  guestName,
}: PaywallModalEnhancedProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    if (isOpen && !clientSecret) {
      // Track paywall view
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'paywall_view', {
          triggered_by: triggeredBy,
          property_view_count: propertyViewCount,
        });
      }
    }
  }, [isOpen, triggeredBy, propertyViewCount]);

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
          triggeredBy,
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
      logUserActionError('Payment initialization error', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Track conversion
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'purchase', {
        transaction_id: Date.now().toString(),
        value: 49,
        currency: 'USD',
        triggered_by: triggeredBy,
      });
    }

    onPaymentSuccess();
  };

  if (!isOpen) return null;

  const getTriggerMessage = () => {
    if (triggeredBy === 'property_view_limit') {
      return `You've viewed ${propertyViewCount} properties. Upgrade to see unlimited results!`;
    } else if (triggeredBy === 'ai_score_access') {
      return 'AI Smart Scores are a premium feature. Upgrade to access!';
    } else if (triggeredBy === 'offer_generation') {
      return 'Offer generation is a premium feature. Upgrade to create offers!';
    }
    return 'Unlock all premium features with a one-time payment!';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
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
              <h2 className="text-2xl font-bold text-gray-900">Unlock Full Access</h2>
              <p className="text-gray-600">One-time payment • Lifetime access • No subscriptions</p>
            </div>
          </div>

          {/* Trigger-specific message */}
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-900 font-medium">{getTriggerMessage()}</p>
          </div>

          {/* Price */}
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl text-gray-400 line-through">$99</span>
              <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                $49
              </span>
            </div>
            <p className="text-gray-600">Limited time offer • Save $50</p>
          </div>
        </div>

        {/* Features Comparison Toggle */}
        <div className="px-8 pt-6 pb-4 border-b border-gray-200">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              {showComparison ? 'Hide' : 'Show'} Feature Comparison
            </h3>
            <span className="text-blue-600">{showComparison ? '−' : '+'}</span>
          </button>
        </div>

        {/* Feature Comparison Table */}
        {showComparison && (
          <div className="px-8 py-6 border-b border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-3 font-semibold text-gray-600">Free</th>
                  <th className="text-center py-3 font-semibold text-blue-600">Premium</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-600">{feature.icon}</div>
                        <span className="font-medium text-gray-900">{feature.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      {typeof feature.free === 'boolean' ? (
                        feature.free ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-gray-600">{feature.free}</span>
                      )}
                    </td>
                    <td className="py-4 text-center">
                      {typeof feature.premium === 'boolean' ? (
                        feature.premium ? (
                          <CheckCircle className="w-5 h-5 text-blue-600 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm font-semibold text-blue-600">{feature.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* What You'll Get */}
        {!showComparison && (
          <div className="p-8 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll Get:</h3>
            
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'Unlimited property searches',
                'AI Smart Scores for all properties',
                'Personalized offer generation',
                'Detailed negotiation scripts',
                'Professional email templates',
                'Advanced market intelligence',
                'Concession recommendations',
                'Lifetime access - pay once, use forever',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              Continue to Payment
            </Button>
          )}

          {clientSecret && !loading && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm 
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
                onError={setError}
              />
            </Elements>
          )}

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Secure payment</span>
            </div>
            <span>•</span>
            <span>30-day money-back guarantee</span>
            <span>•</span>
            <span>One-time payment</span>
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
