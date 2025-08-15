import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Lock, AlertTriangle, Zap, CheckCircle, Shield } from 'lucide-react';
import { TeaserIntelligence, TrialStatus } from '@/hooks/useTrialManager';
import { useStripePayment } from '@/hooks/useStripePayment';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  intelligence: TeaserIntelligence;
  trialStatus: TrialStatus;
  timeRemaining: { hours: number; isUrgent: boolean };
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  intelligence,
  trialStatus,
  timeRemaining
}) => {
  const { createPayment, isLoading } = useStripePayment();
  const annualSavings = intelligence.potentialSavings * 12;
  const searchesRemaining = trialStatus.searchesLimit - trialStatus.searchesUsed;
  
  const handlePayment = (planType: 'basic' | 'pro' | 'premium') => {
    createPayment(planType, trialStatus.email);
  };

  const features = [
    'Unlimited apartment searches',
    'Exact savings calculations for each property',
    'Specific negotiation scripts and talking points',
    'Landlord and property manager contact info',
    'Optimal application timing strategies',
    'Property-specific pressure points',
    'Historical rent data and trends',
    'Direct application assistance'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-background border border-white/20 text-foreground">
        {/* Header */}
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold text-center">
            Unlock Apartment Negotiation Intelligence
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-0 top-0 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Value Proposition */}
          <div className="text-center p-6 rounded-xl bg-gradient-secondary/10 border border-secondary/20">
            <div className="text-3xl font-extrabold gradient-secondary-text mb-2">
              Save $400+ per month with proven negotiation tactics
            </div>
            <div className="text-lg text-muted-foreground">
              Your potential annual savings: $4,800+
            </div>
          </div>

          {/* Urgency Alert */}
          {timeRemaining.isUrgent && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-destructive mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">⚠️ Limited Time Remaining</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {searchesRemaining === 0 
                  ? 'No trial searches remaining'
                  : timeRemaining.hours === 0 
                    ? 'Trial has expired' 
                    : `Only ${timeRemaining.hours} hours and ${searchesRemaining} searches left in your trial`
                }
              </div>
            </div>
          )}

          {/* Features List */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">What you'll unlock:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Basic Plan */}
            <div className="glass-dark rounded-lg p-5 border border-white/10">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-foreground mb-2">Basic</h4>
                <div className="text-3xl font-bold text-foreground mb-1">$9.99</div>
                <div className="text-sm text-muted-foreground mb-4">one-time payment</div>
                <div className="text-xs text-muted-foreground mb-4">5 AI analyses • 7-day access</div>
                <Button 
                  className="w-full bg-muted hover:bg-muted/80" 
                  onClick={() => handlePayment('basic')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Get Basic'}
                </Button>
              </div>
            </div>

            {/* Pro Plan - Popular */}
            <div className="glass-dark rounded-lg p-5 border border-primary/40 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                  POPULAR
                </span>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-semibold text-foreground mb-2">Pro</h4>
                <div className="text-3xl font-bold text-foreground mb-1">$29.99</div>
                <div className="text-sm text-muted-foreground mb-4">one-time payment</div>
                <div className="text-xs text-muted-foreground mb-4">Unlimited analyses • 30-day access</div>
                <Button 
                  className="w-full bg-gradient-primary hover:opacity-90" 
                  onClick={() => handlePayment('pro')}
                  disabled={isLoading}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isLoading ? 'Processing...' : 'Get Pro Access'}
                </Button>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="glass-dark rounded-lg p-5 border border-white/10">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-foreground mb-2">Premium</h4>
                <div className="text-3xl font-bold text-foreground mb-1">$99.99</div>
                <div className="text-sm text-muted-foreground mb-4">one-time payment</div>
                <div className="text-xs text-muted-foreground mb-4">Everything + concierge • 90-day access</div>
                <Button 
                  className="w-full bg-muted hover:bg-muted/80" 
                  onClick={() => handlePayment('premium')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Go Premium'}
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-muted/20">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              Continue Trial
            </Button>
            <div className="flex items-center space-x-4">
              {/* Trust Elements */}
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Average user saves $400/month</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>95% successful negotiation rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Guarantee */}
          <div className="text-center mt-4 text-xs text-muted-foreground">
            💰 One-time payment • No recurring charges • 30-day money-back guarantee
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};