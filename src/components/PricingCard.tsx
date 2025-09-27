
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  planType: 'basic' | 'pro' | 'premium';
  isPopular?: boolean;
  accessDays: number;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  description,
  features,
  planType,
  isPopular = false,
  accessDays
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePurchase = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { planType }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error.message || "Failed to create checkout session. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`relative bg-card/50 backdrop-blur-sm border border-border/50 ${isPopular ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''} h-full flex flex-col hover:shadow-xl transition-all duration-300`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground flex items-center gap-1 px-3 py-1">
            <Star className="h-3 w-3 fill-current" />
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">{price}</span>
          <div className="text-sm text-muted-foreground mt-1">
            One-time payment • {accessDays} days access
          </div>
        </div>
        <CardDescription className="text-muted-foreground mt-2">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-6">
        <Button
          onClick={handlePurchase}
          disabled={isLoading}
          className={`w-full ${isPopular ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20' : 'bg-card border border-border hover:bg-accent'} transition-all duration-200`}
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Get ${title} Access`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
