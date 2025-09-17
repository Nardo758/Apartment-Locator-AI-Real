import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'pro';

  const planDetails = {
    basic: { name: 'Basic', duration: '7 days', searches: '5 analyses' },
    pro: { name: 'Pro', duration: '30 days', searches: 'Unlimited analyses' },
    premium: { name: 'Premium', duration: '90 days', searches: 'Everything + concierge' }
  };

  const currentPlan = planDetails[plan as keyof typeof planDetails] || planDetails.pro;

  useEffect(() => {
    // Clear any trial data since user has upgraded
    localStorage.removeItem('apartmentiq_trial');
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-card rounded-lg p-6 md:p-8 border border-border shadow-lg">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Payment Successful! 🎉
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Welcome to Apartment Locator AI {currentPlan.name}
          </p>

          {/* Plan Details */}
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-4 mb-6 border border-primary/10">
            <h3 className="font-semibold text-foreground mb-3">Your Plan Features:</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                {currentPlan.searches}
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                {currentPlan.duration} access
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                AI-powered negotiation strategies
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Landlord contact information
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Market intelligence insights
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button asChild className="w-full bg-gradient-primary hover:opacity-90">
              <Link to="/dashboard">
                Start Finding Apartments
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link to="/">
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Contact Info */}
          <div className="mt-6 text-xs text-muted-foreground">
            Questions? Contact support@apartmentlocatorai.com
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;