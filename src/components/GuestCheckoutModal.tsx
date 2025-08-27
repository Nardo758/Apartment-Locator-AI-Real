import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Mail, User, X } from 'lucide-react';

interface GuestCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, name: string) => void;
  plan: 'basic' | 'pro' | 'premium';
  isLoading?: boolean;
}

const planDetails = {
  basic: { name: 'Basic', price: '$9.99', duration: '7 days' },
  pro: { name: 'Pro', price: '$29.99', duration: '30 days' },
  premium: { name: 'Premium', price: '$99.99', duration: '90 days' }
};

export const GuestCheckoutModal: React.FC<GuestCheckoutModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  plan,
  isLoading = false
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{ email?: string; name?: string }>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: { email?: string; name?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(email.trim(), name.trim());
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmail('');
      setName('');
      setErrors({});
      onClose();
    }
  };

  const currentPlan = planDetails[plan];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Complete Your Purchase
            </DialogTitle>
            {!isLoading && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-6 w-6 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Summary */}
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 border border-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{currentPlan.name} Plan</h3>
                <p className="text-sm text-muted-foreground">{currentPlan.duration} access</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{currentPlan.price}</div>
                <div className="text-xs text-muted-foreground">one-time payment</div>
              </div>
            </div>
          </div>

          {/* Guest Information Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guest-email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address *
              </Label>
              <Input
                id="guest-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                disabled={isLoading}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest-name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name *
              </Label>
              <Input
                id="guest-name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                disabled={isLoading}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                We'll use this information to send you access details and receipts. 
                No account creation required - you can start using the service immediately after payment.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-primary hover:opacity-90"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  `Continue to Payment`
                )}
              </Button>
            </div>
          </form>

          <div className="text-center text-xs text-muted-foreground border-t border-border pt-4">
            🔒 Your information is secure and encrypted. One-time payment, no recurring charges.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};