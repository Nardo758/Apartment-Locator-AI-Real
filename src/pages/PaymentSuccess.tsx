import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home, Zap, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { designSystem } from '@/lib/design-system';
import ModernCard from '@/components/modern/ModernCard';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'pro';

  const planDetails = {
    basic: { 
      name: 'Basic', 
      duration: '7 days', 
      searches: '5 analyses',
      color: 'blue',
      features: ['5 AI property analyses', 'Basic market insights', 'Email templates', '7-day access']
    },
    pro: { 
      name: 'Pro', 
      duration: '30 days', 
      searches: 'Unlimited analyses',
      color: 'purple',
      features: ['Unlimited AI analyses', 'Advanced market intelligence', 'Email automation', 'Success probability scoring', '30-day access']
    },
    premium: { 
      name: 'Premium', 
      duration: '90 days', 
      searches: 'Everything + concierge',
      color: 'green',
      features: ['Everything in Pro', 'Personal AI concierge', 'Custom market reports', 'White-glove setup', '90-day access']
    }
  };

  const currentPlan = planDetails[plan as keyof typeof planDetails] || planDetails.pro;

  useEffect(() => {
    // Clear any trial data since user has upgraded
    localStorage.removeItem('apartmentiq_trial');
  }, []);

  return (
    <div className={`${designSystem.backgrounds.page} ${designSystem.backgrounds.pageDark} flex items-center justify-center p-4`}>
      <div className="max-w-2xl w-full">
        {/* Success Header */}
        <div className={`${designSystem.animations.entrance} text-center mb-8`}>
          <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className={`${designSystem.typography.hero} mb-4`}>
            🎉 <span className={designSystem.typography.heroGradient}>Payment Successful!</span>
          </h1>
          <p className={`${designSystem.typography.bodyLarge}`}>
            Welcome to Apartment Locator AI {currentPlan.name} Plan
          </p>
        </div>

        {/* Plan Features */}
        <ModernCard 
          className={`${designSystem.animations.entrance} mb-8`}
          style={{ animationDelay: '200ms' }}
          gradient
        >
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Badge className={`bg-gradient-to-r from-${currentPlan.color}-500 to-${currentPlan.color}-600 text-white px-4 py-2`}>
                {currentPlan.name} Plan Activated
              </Badge>
            </div>
            <h2 className={`${designSystem.typography.subheadingLarge} mb-2`}>
              Your Plan Features
            </h2>
          </div>

          <div className="grid gap-3 mb-6">
            {currentPlan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>

          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
            <div className="font-semibold text-blue-800 dark:text-blue-400 mb-1">
              Full Access for {currentPlan.duration}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-500">
              Start finding apartments with AI-powered negotiation advantages
            </div>
          </div>
        </ModernCard>

        {/* Action Buttons */}
        <div className={`${designSystem.animations.entrance} flex flex-col sm:flex-row gap-4 mb-8`} style={{ animationDelay: '400ms' }}>
          <Button asChild className={`${designSystem.buttons.primary} ${designSystem.buttons.large} flex-1 gap-2`}>
            <Link to="/dashboard">
              <Zap className="w-5 h-5" />
              Start Finding Apartments
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1 gap-2" size="lg">
            <Link to="/">
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Support Info */}
        <ModernCard className={`${designSystem.animations.entrance} text-center`} style={{ animationDelay: '600ms' }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-medium">Need Help Getting Started?</span>
          </div>
          <p className={`text-sm ${designSystem.colors.muted} mb-4`}>
            Our support team is here to help you maximize your apartment hunting success
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/help">
              <Button variant="outline" className="gap-2">
                <Star className="w-4 h-4" />
                Help Center
              </Button>
            </Link>
            <a href="mailto:support@apartmentlocatorai.com">
              <Button variant="outline" className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Contact Support
              </Button>
            </a>
          </div>
        </ModernCard>
      </div>
    </div>
  );
};

export default PaymentSuccess;