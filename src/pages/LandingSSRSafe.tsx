import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, TrendingUp, Users, DollarSign, Clock, Zap, Target, BarChart, Brain, Search, Mail, Star, Building, MapPin, Calendar, Home, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HERO_PHOTOS = [
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
];

const LandingSSRSafe = () => {
  const [mounted, setMounted] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  // Only run client-side effects after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => {
      setActivePhoto((prev) => (prev + 1) % HERO_PHOTOS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [mounted]);

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
            <Link to="/auth" data-testid="link-signin">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">Sign In</Button>
            </Link>
            <Link to="/auth?type=renter&mode=signup" data-testid="link-get-started">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Search For Free
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
                <Link to="/auth?type=renter&mode=signup" data-testid="link-hero-cta">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg">
                    Search For Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Free account</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Unlimited searches</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="relative w-full h-64 rounded-lg mb-4 overflow-hidden" data-testid="hero-photo-carousel">
                  {HERO_PHOTOS.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Apartment photo ${i + 1}`}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                      style={{
                        opacity: activePhoto === i ? 1 : 0,
                        filter: 'contrast(1.1) saturate(1.3) sepia(0.15) brightness(1.05)',
                      }}
                      data-testid={`hero-photo-${i}`}
                    />
                  ))}
                  <div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                      background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.25) 100%)',
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(255,235,200,0.1) 0%, transparent 50%, rgba(0,0,0,0.08) 100%)',
                    }}
                  />
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

      {/* Key Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center mb-3">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions for Different Users */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Every Side of the Rental Market
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're searching, managing, or selling properties - we've got you covered
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Renters */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 hover:shadow-xl transition-shadow" data-testid="card-renter">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Home className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Renters</h3>
              <p className="text-gray-600 mb-6">
                Find your perfect home with AI-powered search and built-in negotiation leverage
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Smart apartment recommendations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Negotiation leverage scores for every listing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">True cost analysis (commute + lifestyle + hidden fees)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Save searches & track offers</span>
                </li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild data-testid="button-renter-cta">
                <Link to="/auth?type=renter&mode=signup">Search For Free</Link>
              </Button>
            </div>

            {/* Landlords */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 hover:shadow-xl transition-shadow" data-testid="card-landlord">
              <div className="bg-purple-600 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Building className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Landlords</h3>
              <p className="text-gray-600 mb-6">
                Reduce vacancy, retain tenants, and stop losing money to turnover
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Retention risk scores for every unit</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Vacancy cost calculator with action recommendations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Renewal deadline tracking & alerts</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Market context — see what renters actually want nearby</span>
                </li>
              </ul>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild data-testid="button-landlord-cta">
                <Link to="/auth?type=landlord&mode=signup">Protect Your Revenue</Link>
              </Button>
            </div>

            {/* Agents */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-8 hover:shadow-xl transition-shadow" data-testid="card-agent">
              <div className="bg-orange-600 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Agents & Brokers</h3>
              <p className="text-gray-600 mb-6">
                Manage clients and close more deals with AI-powered market intelligence
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Client portfolio management</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Lead capture & matching system</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Commission calculator & reports</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Market insights to advise clients better</span>
                </li>
              </ul>
              <Button className="w-full bg-orange-600 hover:bg-orange-700" asChild data-testid="button-agent-cta">
                <Link to="/auth?type=agent&mode=signup">Grow Your Business</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats + CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-8 mb-20">
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

          {/* CTA */}
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Find Your Perfect Apartment?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of successful renters who've found their ideal homes with AI-powered intelligence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Unlimited searches</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Free to join</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Pay only for savings data</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold">Apartment Locator AI</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Revolutionizing apartment hunting with AI-powered intelligence and market insights.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
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