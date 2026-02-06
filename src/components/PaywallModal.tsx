import React, { useState } from 'react';
import { X, CheckCircle, Lock, Sparkles, ArrowRight } from 'lucide-react';
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
  propertyId?: string;
}

function CheckoutForm({
  clientSecret,
  onSuccess,
  onError,
  amount,
}: {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  amount: string;
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
        {isProcessing ? 'Processing...' : `Pay ${amount}`}
      </Button>
    </form>
  );
}

type ModalStep = 'plans' | 'checkout';

export function PaywallModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  guestEmail,
  guestName,
  searchCriteria,
  propertyId,
}: PaywallModalProps) {
  const [step, setStep] = useState<ModalStep>('plans');
  const [selectedPlan, setSelectedPlan] = useState<'per_property' | 'basic' | 'pro' | 'premium' | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const plans = [
    ...(propertyId
      ? [{ id: 'per_property' as const, name: 'This Property', price: '$1.99', priceLabel: 'one-time', description: 'Unlock savings data for this property only', features: ['Deal score & savings estimate', 'Negotiation tips', 'Timing advice'] }]
      : []),
    { id: 'basic' as const, name: 'Basic', price: '$9.99', priceLabel: '7 days', description: '5 property analyses', features: ['5 AI property analyses', 'Basic market insights', 'Email templates', '7-day access'] },
    { id: 'pro' as const, name: 'Pro', price: '$29.99', priceLabel: '30 days', description: 'Unlimited analyses', features: ['Unlimited AI analyses', 'Advanced market intelligence', 'Negotiation strategies', '30-day access'], popular: true },
    { id: 'premium' as const, name: 'Premium', price: '$99.99', priceLabel: '90 days', description: 'Full concierge service', features: ['Everything in Pro', 'Personal AI concierge', 'Custom market reports', '90-day access'] },
  ];

  const handleSelectPlan = async (planId: typeof plans[number]['id']) => {
    setSelectedPlan(planId);
    setStep('checkout');
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
          propertyId: planId === 'per_property' ? propertyId : undefined,
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

  const handleBack = () => {
    setStep('plans');
    setClientSecret(null);
    setError(null);
    setSelectedPlan(null);
  };

  if (!isOpen) return null;

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
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
              <h2 className="text-2xl font-bold text-gray-900">
                {step === 'plans' ? 'Unlock Savings Data' : `Checkout — ${selectedPlanData?.name}`}
              </h2>
              <p className="text-gray-600">
                {step === 'plans'
                  ? 'See deal scores, potential savings, and negotiation tips'
                  : `${selectedPlanData?.price} • ${selectedPlanData?.priceLabel}`}
              </p>
            </div>
          </div>

          {/* Value Prop — generic average, no actual computed data */}
          <div className="bg-white rounded-lg p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Renters save an average of</p>
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                $2,400/year
              </p>
              <p className="text-sm text-gray-600 mt-1">with AI-powered negotiation insights</p>
            </div>
          </div>
        </div>

        {/* Plan selection step */}
        {step === 'plans' && (
          <div className="p-8">
            <div className="space-y-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                    plan.popular
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{plan.name}</span>
                      {plan.popular && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Popular</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">{plan.price}</span>
                      <span className="text-xs text-gray-500 ml-1">{plan.priceLabel}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.features.map((f, i) => (
                      <span key={i} className="inline-flex items-center text-xs text-gray-600">
                        <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                        {f}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* Continue as Free */}
            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
              >
                Continue browsing for free
              </button>
              <p className="text-xs text-gray-400 mt-1">
                You can still browse listings and see basic property info
              </p>
            </div>
          </div>
        )}

        {/* Checkout step */}
        {step === 'checkout' && (
          <div className="p-8">
            <button
              onClick={handleBack}
              className="mb-4 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to plans
            </button>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
                <Button
                  onClick={() => selectedPlan && handleSelectPlan(selectedPlan)}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Initializing secure payment...</p>
              </div>
            )}

            {clientSecret && !loading && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                  clientSecret={clientSecret}
                  onSuccess={onPaymentSuccess}
                  onError={setError}
                  amount={selectedPlanData?.price || '$9.99'}
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
        )}

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 text-center text-sm text-gray-600 rounded-b-2xl">
          <p>Payment processed securely by Stripe. Your information is encrypted and protected.</p>
        </div>
      </div>
    </div>
  );
}
