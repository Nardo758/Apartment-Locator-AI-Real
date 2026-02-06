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
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
        size="lg"
        data-testid="button-pay-submit"
      >
        {isProcessing ? 'Processing...' : `Pay ${amount}`}
      </Button>
    </form>
  );
}

type ModalStep = 'plans' | 'checkout';

interface PlanOption {
  id: string;
  name: string;
  price: string;
  priceLabel: string;
  description: string;
  features: string[];
  popular?: boolean;
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
  propertyId,
}: PaywallModalProps) {
  const [step, setStep] = useState<ModalStep>('plans');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans: PlanOption[] = [
    ...(propertyId
      ? [
          {
            id: 'per_property',
            name: 'This Property',
            price: '$1.99',
            priceLabel: 'one-time',
            description: 'Unlock savings data for this single property',
            features: ['Deal score', 'Savings estimate', 'Negotiation tips'],
          },
        ]
      : []),
    {
      id: 'basic',
      name: 'Basic',
      price: '$9.99',
      priceLabel: '7 days',
      description: '5 property analyses over 7 days',
      features: ['5 analyses', 'Deal scores', 'Savings estimates'],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$29.99',
      priceLabel: '30 days',
      description: 'Unlimited analyses for 30 days',
      features: ['Unlimited analyses', 'Negotiation scripts', 'Market intel'],
      popular: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$99.99',
      priceLabel: '90 days',
      description: 'Unlimited analyses + concierge support',
      features: ['Unlimited analyses', 'Concierge support', 'Priority access'],
    },
  ];

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    setStep('checkout');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
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
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover-elevate transition-colors z-10"
          data-testid="button-paywall-close"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-t-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold" data-testid="text-paywall-title">
                {step === 'plans' ? 'Unlock Savings Data' : `Checkout — ${selectedPlanData?.name}`}
              </h2>
              <p className="text-muted-foreground">
                {step === 'plans'
                  ? 'See deal scores, potential savings, and negotiation tips'
                  : `${selectedPlanData?.price} \u2022 ${selectedPlanData?.priceLabel}`}
              </p>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                {potentialSavings > 0 ? 'You could save' : 'Renters save an average of'}
              </p>
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                ${potentialSavings > 0 ? potentialSavings.toLocaleString() : '2,400'}/year
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {propertiesCount > 0
                  ? `across ${propertiesCount} properties`
                  : 'with AI-powered negotiation insights'}
              </p>
            </div>
          </div>
        </div>

        {step === 'plans' && (
          <div className="p-8">
            <div className="space-y-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all hover-elevate ${
                    plan.popular
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                      : 'border-border'
                  }`}
                  data-testid={`button-plan-${plan.id}`}
                >
                  <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{plan.name}</span>
                      {plan.popular && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Popular</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold">{plan.price}</span>
                      <span className="text-xs text-muted-foreground ml-1">{plan.priceLabel}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.features.map((f, i) => (
                      <span key={i} className="inline-flex items-center text-xs text-muted-foreground">
                        <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                        {f}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
                data-testid="button-continue-free"
              >
                Continue browsing for free
              </button>
              <p className="text-xs text-muted-foreground mt-1">
                You can still browse listings and see basic property info
              </p>
            </div>
          </div>
        )}

        {step === 'checkout' && (
          <div className="p-8">
            <button
              onClick={handleBack}
              className="mb-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
              data-testid="button-back-to-plans"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to plans
            </button>

            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300" data-testid="text-payment-error">{error}</p>
                <Button
                  onClick={() => selectedPlan && handleSelectPlan(selectedPlan)}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  data-testid="button-retry-payment"
                >
                  Try Again
                </Button>
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Initializing secure payment...</p>
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

            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Secure payment</span>
              </div>
              <span>&bull;</span>
              <span>Money-back guarantee</span>
            </div>
          </div>
        )}

        <div className="px-8 py-4 bg-muted/50 text-center text-sm text-muted-foreground rounded-b-2xl">
          <p>Payment processed securely by Stripe. Your information is encrypted and protected.</p>
        </div>
      </div>
    </div>
  );
}
