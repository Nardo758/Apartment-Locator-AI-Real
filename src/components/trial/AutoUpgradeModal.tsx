import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ApartmentListing } from '@/data/mockApartments';
import { X, Zap, Clock, CheckCircle, MapPin, DollarSign } from 'lucide-react';

type TriggerType = 'trial_exhausted' | 'time_expired' | 'high_value_apartment' | 'return_visit' | 'premium_clicks';

interface AutoUpgradeModalProps {
  isOpen: boolean;
  trigger: TriggerType;
  apartmentData?: ApartmentListing;
  onClose?: () => void;
  onUpgrade: () => void;
}

export const AutoUpgradeModal: React.FC<AutoUpgradeModalProps> = ({
  isOpen,
  trigger,
  apartmentData,
  onClose,
  onUpgrade
}) => {
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [isPulsing, setIsPulsing] = useState(false);

  // Auto-close prevention for critical triggers
  const canClose = trigger !== 'trial_exhausted' && trigger !== 'time_expired';
  
  // Countdown timer for urgency
  useEffect(() => {
    if (trigger === 'high_value_apartment' && timeRemaining > 0 && isOpen) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, trigger, isOpen]);

  // Pulsing effect for critical urgency
  useEffect(() => {
    if (trigger === 'high_value_apartment') {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  const getModalContent = () => {
    switch (trigger) {
      case 'trial_exhausted':
        return {
          title: "Trial Complete! 🎉",
          subtitle: "You've discovered some amazing opportunities",
          message: "Continue finding apartments with negotiation advantages",
          ctaText: "Unlock Unlimited Searches",
          urgency: "high",
          gradient: "from-blue-500 to-purple-500"
        };
        
      case 'time_expired':
        return {
          title: "Trial Period Ended",
          subtitle: "72 hours of apartment discovery complete",
          message: "Keep the momentum going with full access",
          ctaText: "Continue Your Search",
          urgency: "high",
          gradient: "from-blue-500 to-purple-500"
        };
        
      case 'high_value_apartment':
        return {
          title: "🔥 EXCEPTIONAL Opportunity Detected!",
          subtitle: `Save $${apartmentData?.savingsRange.max}+/month on this apartment`,
          message: `This ${apartmentData?.bedrooms}BR has ${apartmentData?.leverageScore}+ leverage score - don't lose it!`,
          ctaText: `Unlock Negotiation Tactics (${timeRemaining}s)`,
          urgency: "critical",
          gradient: "from-red-500 to-pink-500"
        };
        
      case 'return_visit':
        return {
          title: "Welcome Back! 👋",
          subtitle: "Ready to secure your perfect apartment?",
          message: "Your saved apartments are waiting with negotiation strategies",
          ctaText: "Unlock Full Access",
          urgency: "medium",
          gradient: "from-green-500 to-blue-500"
        };

      case 'premium_clicks':
        return {
          title: "Unlock What You're Looking For",
          subtitle: "You've tried to access premium content multiple times",
          message: "Get instant access to all negotiation tactics and savings calculations",
          ctaText: "Unlock Premium Features",
          urgency: "medium",
          gradient: "from-purple-500 to-indigo-500"
        };

      default:
        return {
          title: "Upgrade Available",
          subtitle: "Unlock full apartment discovery",
          message: "Get unlimited access to all features",
          ctaText: "Upgrade Now",
          urgency: "medium",
          gradient: "from-blue-500 to-purple-500"
        };
    }
  };

  const content = getModalContent();

  const handleClose = () => {
    if (canClose && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={canClose ? handleClose : undefined}>
      <DialogContent 
        className={`max-w-lg bg-background border border-white/20 text-foreground overflow-hidden ${
          content.urgency === 'critical' && isPulsing ? 'animate-pulse' : ''
        }`}
      >
        {/* Header */}
        <div className={`p-6 -m-6 mb-0 bg-gradient-to-r ${content.gradient}`}>
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-1">{content.title}</h2>
              <p className="text-white/90">{content.subtitle}</p>
            </div>
            {canClose && onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:text-white/80 hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-8">
          
          {/* Apartment-specific content for high-value trigger */}
          {trigger === 'high_value_apartment' && apartmentData && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-4 mb-6 border border-orange-500/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">This Apartment:</h3>
                <Badge className="bg-orange-500 text-white font-bold">
                  {apartmentData.leverageScore}+ LEVERAGE
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-foreground">
                  <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                  {apartmentData.address}
                </div>
                <div className="flex items-center text-foreground">
                  <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                  ${apartmentData.rent}/month → Save ${apartmentData.savingsRange.min}-${apartmentData.savingsRange.max}/month
                </div>
                <div className="flex items-center text-orange-400">
                  <Clock className="w-4 h-4 mr-2" />
                  Someone else might apply soon!
                </div>
              </div>
            </div>
          )}

          {/* Main message */}
          <p className="text-lg text-foreground mb-6 text-center">
            {content.message}
          </p>

          {/* Value proposition */}
          <div className="glass-dark rounded-lg p-4 mb-6 border border-white/10">
            <h4 className="font-semibold text-foreground mb-3">What You Get Instantly:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-4 h-4 mr-2" />
                Unlimited searches
              </div>
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-4 h-4 mr-2" />
                Exact savings
              </div>
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-4 h-4 mr-2" />
                Negotiation scripts
              </div>
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-4 h-4 mr-2" />
                Landlord contacts
              </div>
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-4 h-4 mr-2" />
                Application timing
              </div>
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-4 h-4 mr-2" />
                Success guarantee
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="text-center mb-6">
            <div className="inline-block bg-primary rounded-lg p-4 border border-primary/20">
              <div className="text-3xl font-bold text-white">
                $29<span className="text-lg">/month</span>
              </div>
              <div className="text-primary-foreground/80 text-sm">Cancel anytime</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={onUpgrade}
              size="lg"
              className={`w-full font-bold text-lg ${
                content.urgency === 'critical' 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse text-white' 
                  : 'bg-gradient-primary hover:opacity-90'
              }`}
            >
              <Zap className="w-5 h-5 mr-2" />
              {content.ctaText}
            </Button>
            
            {canClose && onClose && (
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Maybe later
              </Button>
            )}
          </div>

          {/* Guarantee */}
          <div className="text-center mt-4 text-xs text-muted-foreground">
            💰 30-day money-back guarantee • Cancel anytime
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};