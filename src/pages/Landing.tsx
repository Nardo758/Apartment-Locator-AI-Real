import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Shield, Brain, MapPin, Zap, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Powered by <span className="gradient-text">Advanced AI</span>
          </h1>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-dark rounded-xl p-6 text-left">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Brain size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Smart Property Discovery</h3>
              <p className="text-sm text-muted-foreground">
                AI-driven search algorithms find properties that match your specific needs and preferences.
              </p>
            </div>

            <div className="glass-dark rounded-xl p-6 text-left">
              <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-4">
                <Shield size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Instant Verification</h3>
              <p className="text-sm text-muted-foreground">
                Verify your income instantly through secure banking connections for faster applications.
              </p>
            </div>

            <div className="glass-dark rounded-xl p-6 text-left">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <MapPin size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Automated Outreach</h3>
              <p className="text-sm text-muted-foreground">
                Automatically contact landlords and property managers with personalized inquiries.
              </p>
            </div>

            <div className="glass-dark rounded-xl p-6 text-left">
              <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-4">
                <Target size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Market Intelligence</h3>
              <p className="text-sm text-muted-foreground">
                Get real-time market insights and pricing data to make informed decisions.
              </p>
            </div>

            <div className="glass-dark rounded-xl p-6 text-left">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <TrendingUp size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Success Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor application progress and optimize your strategy with detailed analytics.
              </p>
            </div>

            <div className="glass-dark rounded-xl p-6 text-left">
              <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-4">
                <Zap size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Complete your apartment search in days, not months, with our AI-powered platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-muted-foreground">
              Start free, upgrade when you're ready to save serious money
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="glass-dark rounded-xl p-8 text-center">
              <h3 className="text-xl font-bold text-foreground mb-4">Free</h3>
              <div className="text-4xl font-bold text-primary mb-4">$0</div>
              <p className="text-sm text-muted-foreground mb-6">per month</p>
              
              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center space-x-2">
                  <Check size={16} className="text-secondary" />
                  <span className="text-sm text-foreground">5 AI-based searches</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check size={16} className="text-secondary" />
                  <span className="text-sm text-foreground">Basic market insights</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check size={16} className="text-secondary" />
                  <span className="text-sm text-foreground">Email support</span>
                </div>
              </div>

              <Button variant="outline" size="lg" className="w-full">
                Get Started Free
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="glass-dark rounded-xl p-8 text-center border border-primary/40">
              <h3 className="text-xl font-bold text-foreground mb-4">Pro</h3>
              <div className="text-4xl font-bold text-primary mb-4">$19.99</div>
              <p className="text-sm text-muted-foreground mb-6">per month</p>
              
              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center space-x-2">
                  <Check size={16} className="text-secondary" />
                  <span className="text-sm text-foreground">Unlimited AI data</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check size={16} className="text-secondary" />
                  <span className="text-sm text-foreground">Advanced analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check size={16} className="text-secondary" />
                  <span className="text-sm text-foreground">Real-time notifications</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check size={16} className="text-secondary" />
                  <span className="text-sm text-foreground">Priority support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check size={16} className="text-secondary" />
                  <span className="text-sm text-foreground">API integrations</span>
                </div>
              </div>

              <Link to="/signup">
                <Button size="lg" className="btn-primary w-full">
                  Start Pro Trial
                </Button>
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="glass-dark rounded-xl p-8 text-center">
              <h3 className="text-xl font-bold text-foreground mb-4">Premium</h3>
              <div className="text-4xl font-bold text-primary mb-4">$49.99</div>
              <p className="text-sm text-muted-foreground mb-6">per month</p>
              
              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center space-x-2">
                  <Check size={16} className="text-secondary" />
                  <span className="text-sm text-foreground">Everything in Pro</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check size={16} className="text-secondary" />
                  <span className="text-sm text-foreground">White-label solutions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check size={16} className="text-secondary" />
                  <span className="text-sm text-foreground">Custom integrations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check size={16} className="text-secondary" />
                  <span className="text-sm text-foreground">Dedicated manager</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check size={16} className="text-secondary" />
                  <span className="text-sm text-foreground">SLA guarantee</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check size={16} className="text-secondary" />
                  <span className="text-sm text-foreground">All future</span>
                </div>
              </div>

              <Button variant="outline" size="lg" className="w-full">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-2xl font-bold gradient-text mb-4">Apartment Locator AI</div>
          <p className="text-muted-foreground">
            The future of apartment hunting is here.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;