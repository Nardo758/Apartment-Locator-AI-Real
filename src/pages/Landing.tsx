import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Shield, Brain, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">{/* Dark solid background */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Main Message */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Never <span className="gradient-text">Overpay</span>
                <br />for Rent Again
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                Our AI discovers hidden rental opportunities and generates data-driven negotiation offers that save you an average of <span className="text-secondary font-semibold">$312/month</span>.
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="glass-dark rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-secondary mb-1">73%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div className="glass-dark rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">$312</div>
                  <div className="text-sm text-muted-foreground">Avg. Monthly Savings</div>
                </div>
                <div className="glass-dark rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold gradient-text mb-1">15K+</div>
                  <div className="text-sm text-muted-foreground">Happy Renters</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button size="lg" className="btn-primary text-lg px-8 py-4">
                    Start Saving Today
                  </Button>
                </Link>
                
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 glass border-border/20 hover:bg-muted/20">
                  See How It Works
                </Button>
              </div>
            </div>

            {/* Right Column - AI Analysis Demo */}
            <div className="relative">
              <div className="glass-dark rounded-xl p-6 border border-border/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">AI-Powered Property Analysis</h3>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">LIVE AI</span>
                </div>
                
                {/* Property Analysis Cards */}
                <div className="space-y-4">
                  <div className="glass rounded-lg p-4 border border-border/10">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-foreground">2547 Riverside Dr, Austin</h4>
                        <div className="text-2xl font-bold text-secondary mt-1">$2,190/mo</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-red-400 mb-1">87 days vacant</div>
                        <div className="bg-secondary/20 text-secondary px-2 py-1 rounded text-xs font-medium">
                          Save $230/mo
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-muted/20 rounded-full h-2">
                      <div className="bg-secondary h-2 rounded-full" style={{width: '84%'}}></div>
                    </div>
                    <div className="text-xs text-secondary mt-1">84% Success</div>
                  </div>

                  <div className="glass rounded-lg p-4 border border-border/10">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-foreground">987 Mueller District</h4>
                        <div className="text-2xl font-bold text-secondary mt-1">$1,890/mo</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-red-400 mb-1">63 days vacant</div>
                        <div className="bg-secondary/20 text-secondary px-2 py-1 rounded text-xs font-medium">
                          Save $180/mo
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-muted/20 rounded-full h-2">
                      <div className="bg-secondary h-2 rounded-full" style={{width: '91%'}}></div>
                    </div>
                    <div className="text-xs text-secondary mt-1">91% Success</div>
                  </div>
                </div>
              </div>
            </div>
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