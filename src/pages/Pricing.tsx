import React from 'react';
import { PricingCard } from '@/components/PricingCard';
import { Shield } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-background animated-bg">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            One-time payment for AI-powered apartment hunting with built-in negotiation advantages
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>30-day money-back guarantee</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <PricingCard
              key={plan.title}
              title={plan.title}
              price={plan.price}
              description={plan.description}
              features={plan.features}
              planType={plan.planType}
              isPopular={plan.isPopular}
              accessDays={plan.accessDays}
            />
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-16">
          <div className="glass rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Why Choose AI Apartment Locator?
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div>
                <div className="font-medium text-primary mb-1">🏆 Success Rate</div>
                <div>85% of users find apartments 40% faster</div>
              </div>
              <div>
                <div className="font-medium text-primary mb-1">💰 Money Saved</div>
                <div>Average savings of $2,400 per year</div>
              </div>
              <div>
                <div className="font-medium text-primary mb-1">🤖 AI Powered</div>
                <div>Advanced algorithms analyze 10,000+ properties</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;