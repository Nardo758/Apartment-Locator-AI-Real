import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Loader2 } from 'lucide-react';
import { useStripePayment } from '@/hooks/useStripePayment';

interface QuickPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: 'basic' | 'pro' | 'premium';
  planName: string;
  price: string;
}

export const QuickPurchaseModal: React.FC<QuickPurchaseModalProps> = ({
  isOpen,
  onClose,
  planType,
  planName,
  price
}) => {
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const { createPayment, isLoading } = useStripePayment();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsValidEmail(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
  };

  const handlePurchase = async () => {
    if (!isValidEmail) return;
    await createPayment(planType, email);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidEmail) {
      handlePurchase();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl max-w-md w-full p-8 border border-border shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-foreground">{planName} Plan</h3>
            <p className="text-3xl font-bold text-primary">{price}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Email Input */}
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Enter your email to continue
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={handleEmailChange}
              onKeyPress={handleKeyPress}
              className="w-full"
              disabled={isLoading}
            />
          </div>

          {/* Purchase Button */}
          <Button
            onClick={handlePurchase}
            disabled={!isValidEmail || isLoading}
            className="w-full bg-gradient-primary hover:opacity-90 h-12 text-lg font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Continue to Payment - ${price}`
            )}
          </Button>


          {/* Trust Elements */}
          <div className="text-xs text-center text-muted-foreground space-y-1">
            <p>🔒 Secure payment via Stripe</p>
            <p>💰 One-time payment • 30-day money-back guarantee</p>
          </div>
        </div>
      </div>
    </div>
  );
};