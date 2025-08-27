import React, { useEffect, useRef } from 'react';
import { Shield } from 'lucide-react';

// Declare custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': {
        'pricing-table-id': string;
        'publishable-key': string;
      };
    }
  }
}

const Pricing = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Stripe pricing table script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/pricing-table.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

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

        {/* Stripe Pricing Table */}
        <div className="max-w-6xl mx-auto" ref={containerRef}>
          <stripe-pricing-table 
            pricing-table-id="prctbl_1S0nx0JICNabdVUwKOx2RWGd"
            publishable-key="pk_live_51S0WzPJICNabdVUwCQvFPftDN1549QZIlLz3fEUjXeepCENeGdzYJyFIAkqKGAu6bf3bhomdtWXvI4aI2pnrogaR00IXglNGcn"
          />
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