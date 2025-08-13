import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Brain, TrendingUp, CheckCircle, MapPin, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold gradient-text">
            Apartment Locator AI
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/signup">
              <Button className="btn-primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            How It <span className="gradient-text">Works</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our AI-powered platform uses advanced algorithms to find the perfect apartment and help you negotiate the best deal.
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <Card className="glass-dark border-border/20 card-lift">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={32} className="text-white" />
                </div>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white text-sm font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Tell Us Your Needs</h3>
                <p className="text-muted-foreground">
                  Share your preferences: budget, location, amenities, and lifestyle requirements.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="glass-dark border-border/20 card-lift">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain size={32} className="text-white" />
                </div>
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-white text-sm font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">AI Analysis</h3>
                <p className="text-muted-foreground">
                  Our AI scans thousands of listings and identifies properties that match your criteria.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="glass-dark border-border/20 card-lift">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp size={32} className="text-white" />
                </div>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white text-sm font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Market Intelligence</h3>
                <p className="text-muted-foreground">
                  We analyze market data, vacancy rates, and pricing trends to find negotiation opportunities.
                </p>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card className="glass-dark border-border/20 card-lift">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={32} className="text-white" />
                </div>
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-white text-sm font-bold">
                  4
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Get Results</h3>
                <p className="text-muted-foreground">
                  Receive curated listings and data-driven negotiation strategies to save money.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-foreground mb-16">
            Powered by Advanced AI Technology
          </h2>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column */}
            <div>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <MapPin size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Smart Location Matching</h3>
                    <p className="text-muted-foreground">
                      Our AI considers your commute patterns, nearby amenities, and lifestyle preferences to find the perfect neighborhood fit.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                    <DollarSign size={24} className="text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Price Optimization</h3>
                    <p className="text-muted-foreground">
                      Advanced algorithms analyze market conditions, vacancy rates, and comparable properties to identify negotiation opportunities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Clock size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Real-Time Updates</h3>
                    <p className="text-muted-foreground">
                      Get instant notifications when new properties matching your criteria become available or when prices drop.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Demo */}
            <div className="glass-dark rounded-xl p-8 border border-border/20">
              <h3 className="text-lg font-semibold text-foreground mb-6">Live AI Analysis Example</h3>
              
              <div className="space-y-4">
                <div className="glass rounded-lg p-4 border border-border/10">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-foreground">Downtown Loft</h4>
                      <div className="text-lg font-bold text-secondary">$2,400/mo</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-red-400 mb-1">95 days vacant</div>
                      <div className="bg-secondary/20 text-secondary px-2 py-1 rounded text-xs">
                        Save $285/mo
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">AI Confidence: 91%</div>
                  <div className="w-full bg-muted/20 rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full" style={{width: '91%'}}></div>
                  </div>
                </div>

                <div className="glass rounded-lg p-4 border border-border/10">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-foreground">Midtown Studio</h4>
                      <div className="text-lg font-bold text-secondary">$1,850/mo</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-red-400 mb-1">42 days vacant</div>
                      <div className="bg-secondary/20 text-secondary px-2 py-1 rounded text-xs">
                        Save $150/mo
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">AI Confidence: 78%</div>
                  <div className="w-full bg-muted/20 rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stats */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-dark rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-12">
              Proven Results
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">73%</div>
                <div className="text-lg font-semibold text-foreground mb-2">Success Rate</div>
                <div className="text-sm text-muted-foreground">
                  Of users successfully negotiate lower rent
                </div>
              </div>

              <div>
                <div className="text-4xl font-bold text-secondary mb-2">$312</div>
                <div className="text-lg font-semibold text-foreground mb-2">Average Savings</div>
                <div className="text-sm text-muted-foreground">
                  Monthly rent reduction per user
                </div>
              </div>

              <div>
                <div className="text-4xl font-bold gradient-text mb-2">15K+</div>
                <div className="text-lg font-semibold text-foreground mb-2">Happy Users</div>
                <div className="text-sm text-muted-foreground">
                  Successfully found their perfect home
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Find Your Perfect Apartment?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users who have saved money with our AI-powered apartment locator.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="btn-primary text-lg px-8 py-4">
                Start Saving Today
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            
            <Link to="/">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 glass border-border/20 hover:bg-muted/20">
                Back to Home
              </Button>
            </Link>
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

export default HowItWorks;