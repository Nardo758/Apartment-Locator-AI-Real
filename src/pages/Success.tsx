
import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, ArrowRight, Sparkles, Zap, Target } from 'lucide-react';
import { designSystem } from '@/lib/design-system';
import ModernCard from '@/components/modern/ModernCard';
import GradientSection from '@/components/modern/GradientSection';

const Success = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Clear any trial data since user has made a purchase
    localStorage.removeItem('apartmentiq_trial_data');
  }, []);

  const nextSteps = [
    {
      step: '1',
      icon: Target,
      title: 'Access Your Dashboard',
      description: 'Start using AI-powered apartment hunting tools immediately',
      color: 'text-blue-600'
    },
    {
      step: '2', 
      icon: Sparkles,
      title: 'Set Your Preferences',
      description: 'Configure your search criteria and AI assistant',
      color: 'text-purple-600'
    },
    {
      step: '3',
      icon: Zap,
      title: 'Start Finding Apartments',
      description: 'Let AI analyze properties and help you negotiate better deals',
      color: 'text-green-600'
    }
  ];

  return (
    <div className={`${designSystem.backgrounds.page} ${designSystem.backgrounds.pageDark} flex items-center justify-center p-4`}>
      <div className="max-w-4xl w-full">
        {/* Success Header */}
        <div className={`${designSystem.animations.entrance} text-center mb-8`}>
          <div className="mx-auto mb-6 w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className={`${designSystem.typography.hero} mb-4`}>
            🎉 <span className={designSystem.typography.heroGradient}>Payment Successful!</span>
          </h1>
          <p className={`${designSystem.typography.bodyLarge} max-w-2xl mx-auto`}>
            Welcome to Apartment Locator AI! Your payment has been processed successfully and you now have access to all premium features.
          </p>
        </div>

        {sessionId && (
          <ModernCard className={`${designSystem.animations.entrance} mb-8 max-w-2xl mx-auto`} >
            <div className="text-center">
              <div className={`text-sm ${designSystem.colors.muted} mb-1`}>Session ID</div>
              <div className="font-mono text-sm break-all bg-gray-50 dark:bg-gray-800/50 p-2 rounded">{sessionId}</div>
            </div>
          </ModernCard>
        )}

        {/* Next Steps */}
        <GradientSection variant="feature" title="What happens next?" className="mb-8">
          <div className={`${designSystem.layouts.gridThree} max-w-4xl mx-auto`}>
            {nextSteps.map((step, index) => (
              <ModernCard
                key={step.step}
                animate
                animationDelay={index * 100 + 300}
                hover
                className="text-center"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                      <step.icon className={`w-8 h-8 ${step.color}`} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {step.step}
                    </div>
                  </div>
                  <div>
                    <h3 className={`${designSystem.typography.subheadingLarge} mb-2`}>
                      {step.title}
                    </h3>
                    <p className={designSystem.typography.body}>
                      {step.description}
                    </p>
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>
        </GradientSection>

        {/* Action Buttons */}
        <div className={`${designSystem.animations.entrance} flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-8`} style={{ animationDelay: '600ms' }}>
          <Button asChild className={`${designSystem.buttons.primary} ${designSystem.buttons.large} flex-1 gap-2`}>
            <Link to="/dashboard">
              <ArrowRight className="w-5 h-5" />
              Start Using AI Apartment Locator
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 gap-2" size="lg">
            <Link to="/">
              <Home className="w-5 h-5" />
              Return to Home
            </Link>
          </Button>
        </div>

        {/* Support Info */}
        <ModernCard className={`${designSystem.animations.entrance} max-w-2xl mx-auto text-center`} style={{ animationDelay: '800ms' }}>
          <p className={`text-sm ${designSystem.colors.muted}`}>
            Need help getting started? Contact our support team at{' '}
            <a href="mailto:support@apartmentlocatorai.com" className="text-primary hover:underline font-medium">
              support@apartmentlocatorai.com
            </a>
          </p>
        </ModernCard>
      </div>
    </div>
  );
};

export default Success;
