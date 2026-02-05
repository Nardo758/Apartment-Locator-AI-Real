import React from 'react';
import { Link } from 'react-router-dom';
import { PricingCard } from '@/components/PricingCard';
import { Shield, ArrowLeft, CheckCircle, TrendingUp, DollarSign, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { designSystem } from '@/lib/design-system';
import ModernPageLayout from '@/components/modern/ModernPageLayout';
import GradientSection from '@/components/modern/GradientSection';
import ModernCard from '@/components/modern/ModernCard';

const Pricing = () => {
  const plans = [
    {
      title: "Basic",
      price: "$9.99",
      description: "Perfect for casual apartment hunters looking for basic AI assistance",
      planType: 'basic' as const,
      accessDays: 7,
      features: [
        "5 AI property analyses",
        "Basic market insights",
        "Email templates for landlords",
        "Property comparison tool",
        "7-day access",
        "Email support"
      ]
    },
    {
      title: "Pro",
      price: "$29.99",
      description: "Ideal for serious apartment hunters who want comprehensive AI assistance",
      planType: 'pro' as const,
      isPopular: true,
      accessDays: 30,
      features: [
        "Unlimited AI property analyses",
        "Advanced market intelligence",
        "Email automation templates",
        "Success probability scoring",
        "Negotiation strategy recommendations",
        "30-day access",
        "Priority email support",
        "Market trend alerts"
      ]
    },
    {
      title: "Premium",
      price: "$99.99",
      description: "Complete white-glove service with personal AI concierge",
      planType: 'premium' as const,
      accessDays: 90,
      features: [
        "Everything in Pro plan",
        "Personal AI concierge",
        "Custom market reports",
        "White-glove setup assistance",
        "Direct phone support",
        "90-day access",
        "Priority property alerts",
        "One-on-one strategy sessions"
      ]
    }
  ];

  const trustMetrics = [
    {
      icon: TrendingUp,
      title: "Success Rate",
      value: "85%",
      description: "of users find apartments 40% faster",
      color: "text-green-600"
    },
    {
      icon: DollarSign,
      title: "Money Saved",
      value: "$2,400",
      description: "average savings per year",
      color: "text-blue-600"
    },
    {
      icon: Brain,
      title: "AI Powered",
      value: "10,000+",
      description: "properties analyzed by advanced algorithms",
      color: "text-purple-600"
    }
  ];

  return (
    <ModernPageLayout 
      title="Choose Your Plan"
      subtitle="One-time payment for AI-powered apartment hunting with built-in negotiation advantages"
      headerContent={
        <Link to="/">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft size={16} />
            Back to Home
          </Button>
        </Link>
      }
    >
      {/* Trust Badge */}
      <div className={`${designSystem.animations.entrance} text-center mb-12`}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <Shield className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            30-day money-back guarantee
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className={`${designSystem.layouts.gridThree} ${designSystem.spacing.marginLarge} max-w-6xl mx-auto`}>
        {plans.map((plan, index) => (
          <div
            key={plan.title}
            className={designSystem.animations.entrance}
            style={{ animationDelay: `${index * 100}ms` }}>
            <PricingCard
              title={plan.title}
              price={plan.price}
              description={plan.description}
              features={plan.features}
              planType={plan.planType}
              isPopular={plan.isPopular}
              accessDays={plan.accessDays}
            />
          </div>
        ))}
      </div>

      {/* Trust Indicators */}
      <GradientSection variant="feature" className="mt-20">
        <div className="text-center mb-12">
          <h2 className={`${designSystem.typography.heading} mb-4`}>
            Why Choose Apartment Locator AI?
          </h2>
          <p className={designSystem.typography.subheading}>
            Join thousands of successful renters who've transformed their apartment hunting experience
          </p>
        </div>

        <div className={`${designSystem.layouts.gridThree} max-w-4xl mx-auto`}>
          {trustMetrics.map((metric, index) => (
            <ModernCard
              key={metric.title}
              animate
              animationDelay={index * 100}
              hover
              className="text-center"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className={`p-4 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20`}>
                  <metric.icon className={`${designSystem.icons.large} ${metric.color}`} />
                </div>
                <div>
                  <div className={`text-3xl font-bold ${metric.color} mb-1`}>
                    {metric.value}
                  </div>
                  <div className={`font-semibold ${designSystem.colors.dark} mb-2`}>
                    {metric.title}
                  </div>
                  <p className={designSystem.typography.body}>
                    {metric.description}
                  </p>
                </div>
              </div>
            </ModernCard>
          ))}
        </div>
      </GradientSection>

      {/* Additional Features */}
      <GradientSection variant="content" className="mt-20">
        <div className="max-w-4xl mx-auto">
          <ModernCard gradient className="text-center p-8">
            <h3 className={`${designSystem.typography.subheadingLarge} mb-6`}>
              What Makes Our AI Different?
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Negotiation Intelligence</h4>
                    <p className={designSystem.typography.body}>
                      AI analyzes landlord behavior patterns and market conditions to suggest optimal negotiation strategies
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Hidden Inventory Discovery</h4>
                    <p className={designSystem.typography.body}>
                      Access off-market listings and properties before they hit major platforms
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Personalized Matching</h4>
                    <p className={designSystem.typography.body}>
                      Machine learning algorithms understand your preferences and lifestyle needs
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Real-time Market Data</h4>
                    <p className={designSystem.typography.body}>
                      Stay ahead with live pricing trends, vacancy rates, and market insights
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link to="/auth?mode=signup">
                <Button className={`${designSystem.buttons.primary} ${designSystem.buttons.large}`}>
                  Start Your Free Trial Today
                </Button>
              </Link>
            </div>
          </ModernCard>
        </div>
      </GradientSection>
    </ModernPageLayout>
  );
};

export default Pricing;