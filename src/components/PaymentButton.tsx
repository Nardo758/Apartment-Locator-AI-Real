import React from 'react';
import { Button } from '@/components/ui/button';
import { usePayment } from '@/hooks/usePayment';
import { Zap, Loader2 } from 'lucide-react';

interface PaymentButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  style?: React.CSSProperties;
  plan?: 'basic' | 'pro' | 'premium';
  children?: React.ReactNode;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  variant = "default",
  size = "default",
  className = "",
  style,
  plan = 'pro',
  children
}) => {
  const { createPayment, isLoading } = usePayment();

  const handlePayment = async () => {
    await createPayment(plan);
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
      style={style}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Zap className="w-4 h-4 mr-2" />
      )}
      {children || (isLoading ? "Processing..." : `Get ${plan.charAt(0).toUpperCase() + plan.slice(1)} Access`)}
    </Button>
  );
};