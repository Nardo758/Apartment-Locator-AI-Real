import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Shield, Brain, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">{/* Dark solid background */}
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-tight">
            Find Your Perfect
            <span className="gradient-text block">Rental Home</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            AI-powered apartment hunting with verified income and instant approvals. 
            Skip the paperwork, get the keys faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="btn-primary text-lg px-8 py-4">
                Get Started
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 glass border-border/20 hover:bg-muted/20">
                View Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose Apartment Locator AI?
            </h2>
            <p className="text-xl text-muted-foreground">
              The smartest way to find and secure your next home
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-dark rounded-xl p-8 text-center card-lift">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">AI-Powered Matching</h3>
              <p className="text-muted-foreground">
                Our AI analyzes thousands of properties to find perfect matches based on your preferences and lifestyle.
              </p>
            </div>

            <div className="glass-dark rounded-xl p-8 text-center card-lift">
              <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Verified Income</h3>
              <p className="text-muted-foreground">
                Instant income verification through Plaid gives you an edge with landlords and speeds up approvals.
              </p>
            </div>

            <div className="glass-dark rounded-xl p-8 text-center card-lift">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Location Intelligence</h3>
              <p className="text-muted-foreground">
                Find homes that perfectly fit your commute, lifestyle, and neighborhood preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-dark rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Skip the Hassle, Get Approved Faster
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center mt-1">
                    <Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Instant Income Verification</h4>
                    <p className="text-muted-foreground">Connect your bank account securely and prove your income instantly.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center mt-1">
                    <Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Smart Recommendations</h4>
                    <p className="text-muted-foreground">AI finds hidden gems and properties that match your exact needs.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center mt-1">
                    <Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Negotiation Support</h4>
                    <p className="text-muted-foreground">Get expert help to negotiate the best terms and pricing.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1">
                    <Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Faster Applications</h4>
                    <p className="text-muted-foreground">Pre-verified profiles speed up the application process significantly.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1">
                    <Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Market Insights</h4>
                    <p className="text-muted-foreground">Real-time data on pricing trends and neighborhood dynamics.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1">
                    <Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Secure & Private</h4>
                    <p className="text-muted-foreground">Bank-level security protects your financial information.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link to="/signup">
                <Button size="lg" className="btn-secondary text-lg px-8 py-4">
                  Start Your Search Today
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
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