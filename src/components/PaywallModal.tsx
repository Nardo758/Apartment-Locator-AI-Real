import { useState, useCallback } from 'react';
import { X, CheckCircle, Lock, Sparkles, ArrowRight, Zap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { authenticatedFetch, isAuthenticated } from '@/lib/authHelpers';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  potentialSavings: number;
  propertiesCount: number;
  onPaymentSuccess: (planId?: string) => void;
  guestEmail?: string;
  guestName?: string;
  searchCriteria?: Record<string, unknown>;
  propertyId?: string;
}

type ModalStep = 'plans' | 'checkout' | 'processing' | 'success' | 'error';

interface PlanOption {
  id: string;
  name: string;
  price: string;
  priceLabel: string;
  description: string;
  features: string[];
  popular?: boolean;
}

interface StripeCheckoutFormProps {
  onSuccess: () => void;
  onError: (msg: string) => void;
  planLabel: string;
}

function StripeCheckoutForm({ onSuccess, onError, planLabel }: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message || 'Payment failed');
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        });
        if (!verifyRes.ok) {
          const data = await verifyRes.json().catch(() => ({}));
          throw new Error(data.error || 'Payment verification failed');
        }
      } catch (verifyErr: any) {
        onError(verifyErr.message || 'Payment verification failed. Please contact support.');
        setProcessing(false);
        return;
      }
      onSuccess();
    } else {
      onError('Payment was not completed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full"
        data-testid="button-stripe-pay"
      >
        {processing ? 'Processing...' : `Pay for ${planLabel}`}
      </Button>
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4" />
          <span>Secure payment</span>
        </div>
        <span>&bull;</span>
        <span>Money-back guarantee</span>
      </div>
    </form>
  );
}

export function PaywallModal({
  isOpen,
  onClose,
  potentialSavings,
  propertiesCount,
  onPaymentSuccess,
  propertyId,
}: PaywallModalProps) {
  const [step, setStep] = useState<ModalStep>('plans');
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const stripeConfigured = !!(stripePublishableKey && stripePromise);

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
    setError(null);

    if (stripeConfigured) {
      setStep('processing');
      try {
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId,
            propertyId: planId === 'per_property' ? propertyId : undefined,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to initialize payment');
        }

        const { clientSecret: secret } = await response.json();
        setClientSecret(secret);
        setStep('checkout');
      } catch (err: any) {
        setError(err.message);
        setStep('plans');
      }
    } else {
      await handleDemoUnlock(planId);
    }
  };

  const handleDemoUnlock = async (planId: string) => {
    setStep('processing');
    setError(null);

    if (!isAuthenticated()) {
      setError('Please sign in to unlock savings data. Your unlocks will be saved to your account.');
      setStep('error');
      return;
    }

    try {
      if (planId === 'per_property' && propertyId) {
        const res = await authenticatedFetch('/api/access/unlock-property', {
          method: 'POST',
          body: JSON.stringify({ propertyId }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to unlock property');
        }
      } else if (['basic', 'pro', 'premium'].includes(planId)) {
        const res = await authenticatedFetch('/api/access/activate-plan', {
          method: 'POST',
          body: JSON.stringify({ planType: planId }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to activate plan');
        }
      }

      await new Promise(resolve => setTimeout(resolve, 600));

      setStep('success');

      setTimeout(() => {
        onPaymentSuccess(planId);
        resetModal();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStep('error');
    }
  };

  const handleStripeSuccess = useCallback(() => {
    setStep('success');
    setTimeout(() => {
      if (selectedPlan) {
        onPaymentSuccess(selectedPlan);
      }
      resetModal();
    }, 1500);
  }, [selectedPlan, onPaymentSuccess]);

  const handleStripeError = useCallback((msg: string) => {
    setError(msg);
    setStep('error');
  }, []);

  const resetModal = () => {
    setStep('plans');
    setSelectedPlan(null);
    setClientSecret(null);
    setError(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover-elevate transition-colors z-10"
          data-testid="button-paywall-close"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-t-2xl">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold" data-testid="text-paywall-title">
                {step === 'plans' ? 'Unlock Savings Data' :
                 step === 'processing' ? 'Unlocking...' :
                 step === 'success' ? 'Unlocked!' :
                 step === 'error' ? 'Unable to Unlock' :
                 `Checkout — ${selectedPlanData?.name}`}
              </h2>
              <p className="text-muted-foreground">
                {step === 'plans'
                  ? 'See deal scores, potential savings, and negotiation tips'
                  : step === 'processing'
                  ? 'Setting up your access...'
                  : step === 'success'
                  ? 'Your savings data is now available'
                  : step === 'error'
                  ? 'There was a problem with your request'
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

        {step === 'processing' && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-lg font-medium" data-testid="text-processing">Activating your access...</p>
            <p className="text-sm text-muted-foreground mt-2">This will only take a moment</p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <p className="text-xl font-bold" data-testid="text-unlock-success">Savings Data Unlocked!</p>
            <p className="text-muted-foreground mt-2">
              {selectedPlan === 'per_property'
                ? 'You can now see the full savings analysis for this property.'
                : `Your ${selectedPlanData?.name} plan is now active.`}
            </p>
          </div>
        )}

        {step === 'error' && (
          <div className="p-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <p className="text-lg font-semibold" data-testid="text-unlock-error">Something went wrong</p>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={handleClose}
                data-testid="button-error-close"
              >
                Close
              </Button>
              <Button
                onClick={() => { setError(null); setStep('plans'); }}
                data-testid="button-error-retry"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {step === 'plans' && (
          <div className="p-8">
            {!stripeConfigured && (
              <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Preview mode — select a plan to unlock savings data instantly.
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300" data-testid="text-payment-error">{error}</p>
              </div>
            )}

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
                        <Badge variant="default">Popular</Badge>
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
                onClick={handleClose}
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

        {step === 'checkout' && stripeConfigured && clientSecret && (
          <div className="p-8">
            <button
              onClick={() => { setStep('plans'); setError(null); setSelectedPlan(null); setClientSecret(null); }}
              className="mb-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
              data-testid="button-back-to-plans"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to plans
            </button>

            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripeCheckoutForm
                onSuccess={handleStripeSuccess}
                onError={handleStripeError}
                planLabel={selectedPlanData?.name || 'Plan'}
              />
            </Elements>
          </div>
        )}

        <div className="px-8 py-4 bg-muted/50 text-center text-sm text-muted-foreground rounded-b-2xl">
          {stripeConfigured
            ? <p>Payment processed securely by Stripe. Your information is encrypted and protected.</p>
            : <p>Savings insights powered by ApartmentIQ market intelligence.</p>
          }
        </div>
      </div>
    </div>
  );
}
