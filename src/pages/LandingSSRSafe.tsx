import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, TrendingUp, Users, DollarSign, Clock, Zap, Target, BarChart, Brain, Search, Mail, Star, Building, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

// SSR-Safe Landing Page - No external dependencies that could cause SSR issues
const LandingSSRSafe = () => {
  const [currentDemo, setCurrentDemo] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Only run client-side effects after component mounts
  useEffect(() => {
    setMounted(true);
    
    // Only set up intervals after mounting
    const interval = setInterval(() => {
      setCurrentDemo(prev => (prev + 1) % 2);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Prevent hydration mismatches by not rendering dynamic content until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900">Apartment Locator AI</h1>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: <Search className="w-8 h-8 text-blue-600" />,
      title: "AI-Powered Search",
      description: "Find the perfect apartment using advanced AI algorithms that understand your preferences and budget."
    },
    {
      icon: <BarChart className="w-8 h-8 text-green-600" />,
      title: "Market Intelligence",
      description: "Get real-time market insights and rent vs buy analysis to make informed decisions."
    },
    {
      icon: <Target className="w-8 h-8 text-purple-600" />,
      title: "Negotiation Tools",
      description: "Leverage market data and AI insights to negotiate better rental terms and prices."
    },
    {
      icon: <Brain className="w-8 h-8 text-orange-600" />,
      title: "Smart Recommendations",
      description: "Receive personalized apartment recommendations based on your lifestyle and preferences."
    }
  ];

  const stats = [
    { icon: <Users className="w-8 h-8 text-blue-600" />, value: "10K+", label: "Happy Renters" },
    { icon: <DollarSign className="w-8 h-8 text-green-600" />, value: "$2.3M", label: "Saved in Rent" },
    { icon: <Clock className="w-8 h-8 text-purple-600" />, value: "72%", label: "Faster Search" },
    { icon: <TrendingUp className="w-8 h-8 text-orange-600" />, value: "95%", label: "Success Rate" }
  ];

  const demos = [
    {
      title: "Market Intelligence Dashboard",
      description: "Real-time market data and trends",
      features: ["Live rent prices", "Market velocity", "Negotiation leverage"]
    },
    {
      title: "AI Apartment Matching",
      description: "Personalized apartment recommendations",
      features: ["Smart filtering", "Preference learning", "Location scoring"]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Apartment Locator AI</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/demo" className="text-gray-600 hover:text-gray-900 transition-colors" data-testid="link-demo">
              Demo
            </Link>
            <Link to="/auth" data-testid="link-signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/auth" data-testid="link-signup">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Find Your Perfect
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Apartment</span>
                  <br />with AI Intelligence
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Use advanced AI to discover the best apartments, negotiate better deals, and make smarter rental decisions with real-time market intelligence.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/demo">
                  <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50">
                    Watch Demo
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>14-day free trial</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg mb-4 flex items-center justify-center">
                  <Building className="w-16 h-16 text-blue-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Luxury Downtown Loft</h3>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                      Great Deal
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>Austin, TX</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">$2,400/mo</span>
                    <span className="text-sm text-gray-500 line-through">$2,700/mo</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium z-20">
                AI Recommended
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powered by Advanced AI Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our intelligent platform combines market data, user preferences, and AI algorithms to revolutionize apartment hunting.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-4 group-hover:shadow-lg transition-shadow duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Thousands of Renters
            </h2>
            <p className="text-xl text-blue-100">
              Join the community that's revolutionizing apartment hunting
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {React.cloneElement(stat.icon, { className: "w-8 h-8 text-blue-200" })}
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See Our AI in Action
            </h2>
            <p className="text-xl text-gray-600">
              Experience the power of intelligent apartment hunting
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 lg:p-12">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">{demos[currentDemo].title}</h3>
                  <p className="text-lg text-gray-600">{demos[currentDemo].description}</p>
                  <ul className="space-y-3">
                    {demos[currentDemo].features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/demo">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Try Interactive Demo
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 lg:p-12 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <BarChart className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-gray-600">Interactive demo loading...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Find Your Perfect Apartment?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of successful renters who've found their ideal homes with AI-powered intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/market-intel">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold">
                View Market Intel
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Apartment Locator AI</h3>
              <p className="text-gray-400 mb-4">
                Revolutionizing apartment hunting with AI-powered intelligence and market insights.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/demo" className="hover:text-white">Demo</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/market-intel" className="hover:text-white">Market Intel</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link to="/help" className="hover:text-white">Help</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Apartment Locator AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingSSRSafe;