import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const [currentDemo, setCurrentDemo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo(prev => (prev + 1) % 2);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed top-0 left-0 w-full h-full z-[-1] opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary via-primary-dark to-primary animate-gradient-shift bg-[length:400%_400%]" />
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[repeating-linear-gradient(0deg,transparent,transparent_50px,rgba(255,255,255,0.03)_50px,rgba(255,255,255,0.03)_51px)] animate-[drift_20s_linear_infinite]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full bg-[rgba(10,10,10,0.95)] backdrop-blur-[10px] z-[1000] py-4 border-b border-white/10">
        <nav className="max-w-6xl mx-auto px-5 flex justify-between items-center">
          <div className="text-2xl font-bold gradient-text">🏠 ApartmentIQ</div>
          <ul className="hidden md:flex gap-8 list-none">
            <li><a href="#features" className="text-white font-medium hover:text-primary transition-all duration-300 hover:-translate-y-0.5" onClick={(e) => handleSmoothScroll(e, '#features')}>Features</a></li>
            <li><a href="#pricing" className="text-white font-medium hover:text-primary transition-all duration-300 hover:-translate-y-0.5" onClick={(e) => handleSmoothScroll(e, '#pricing')}>Pricing</a></li>
            <li><a href="#about" className="text-white font-medium hover:text-primary transition-all duration-300 hover:-translate-y-0.5">About</a></li>
          </ul>
          <Link to="/signup">
            <Button className="bg-gradient-primary hover:translate-y-[-3px] hover:shadow-[0_8px_25px_rgba(102,126,234,0.6)] transition-all duration-300 rounded-[25px] px-6">
              Start Free Trial
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 z-10">
          <div className="grid md:grid-cols-2 gap-15 items-center">
            <div className="animate-slide-up">
              <h1 className="text-4xl md:text-6xl font-black leading-[1.1] mb-6 bg-gradient-to-r from-white via-primary to-primary-dark bg-clip-text text-transparent">
                Never Overpay for Rent Again
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Our AI discovers hidden rental opportunities and generates data-driven negotiation offers that save you an average of $312/month.
              </p>
              
              <div className="grid grid-cols-3 gap-5 mb-10">
                <div className="text-center p-5 bg-white/5 rounded-2xl border border-white/10 hover:translate-y-[-5px] hover:bg-white/10 transition-all duration-300">
                  <span className="text-2xl font-black text-primary block">73%</span>
                  <span className="text-sm text-gray-400">Success Rate</span>
                </div>
                <div className="text-center p-5 bg-white/5 rounded-2xl border border-white/10 hover:translate-y-[-5px] hover:bg-white/10 transition-all duration-300">
                  <span className="text-2xl font-black text-primary block">$312</span>
                  <span className="text-sm text-gray-400">Avg. Monthly Savings</span>
                </div>
                <div className="text-center p-5 bg-white/5 rounded-2xl border border-white/10 hover:translate-y-[-5px] hover:bg-white/10 transition-all duration-300">
                  <span className="text-2xl font-black text-primary block">15K+</span>
                  <span className="text-sm text-gray-400">Happy Renters</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-5">
                <Link to="/signup">
                  <Button size="lg" className="bg-gradient-primary hover:translate-y-[-3px] hover:shadow-[0_10px_30px_rgba(102,126,234,0.6)] transition-all duration-300 rounded-[30px] px-8 py-4 text-lg font-semibold">
                    Start Saving Today
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-transparent border-2 border-white/30 hover:bg-white/10 hover:border-primary hover:translate-y-[-3px] transition-all duration-300 rounded-[30px] px-8 py-4 text-lg font-semibold"
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.querySelector('#demo');
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  See How It Works
                </Button>
              </div>
            </div>
            
            {/* Demo Interface */}
            <div 
              id="demo"
              className="bg-white/5 rounded-[20px] p-8 border border-white/10 backdrop-blur-[10px] relative overflow-hidden animate-[slideInRight_1s_ease-out]"
            >
              <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-transparent via-primary/10 to-transparent animate-[scanline_3s_linear_infinite]" />
              
              <div className="flex justify-between items-center mb-5 relative z-10">
                <div className="text-xl font-bold text-primary">AI-Powered Property Analysis</div>
                <div className="bg-gradient-primary text-white px-3 py-1 rounded-2xl text-sm font-semibold">LIVE AI</div>
              </div>
              
              <div className={`bg-white/8 rounded-2xl p-5 mb-4 border border-white/10 transition-all duration-500 ${currentDemo === 0 ? 'opacity-100 scale-[1.02]' : 'opacity-50 scale-100'}`}>
                <div className="flex justify-between items-center mb-3">
                  <div className="font-semibold text-white">2847 Riverside Dr, Austin</div>
                  <div className="text-red-400 text-sm font-medium">67 days vacant</div>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-gray-400 text-sm line-through">$2,400/mo</div>
                    <div className="text-2xl font-black text-secondary">$2,180/mo</div>
                  </div>
                  <div className="bg-gradient-secondary text-white px-2 py-1 rounded-lg text-sm font-semibold">Save $220/mo</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-secondary rounded-full w-[84%] animate-[progressFill_2s_ease-out]" />
                  </div>
                  <div className="text-sm font-semibold text-secondary">84% Success</div>
                </div>
              </div>
              
              <div className={`bg-white/8 rounded-2xl p-5 border border-white/10 transition-all duration-500 ${currentDemo === 1 ? 'opacity-100 scale-[1.02]' : 'opacity-50 scale-100'}`}>
                <div className="flex justify-between items-center mb-3">
                  <div className="font-semibold text-white">987 Mueller District</div>
                  <div className="text-red-400 text-sm font-medium">89 days vacant</div>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-gray-400 text-sm line-through">$2,200/mo</div>
                    <div className="text-2xl font-black text-secondary">$1,890/mo</div>
                  </div>
                  <div className="bg-gradient-secondary text-white px-2 py-1 rounded-lg text-sm font-semibold">Save $310/mo</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-secondary rounded-full w-[91%] animate-[progressFill_2s_ease-out]" />
                  </div>
                  <div className="text-sm font-semibold text-secondary">91% Success</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-gradient-to-b from-transparent to-primary/5">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-center text-5xl font-black mb-16 bg-gradient-to-r from-white to-primary bg-clip-text text-transparent">
            Powered by Advanced AI
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: '🔍', title: 'Hidden Inventory Discovery', desc: 'Our AI scans multiple sources including off-market listings to find 5-8% more rental opportunities than traditional platforms.' },
              { icon: '🧠', title: 'Smart Offer Generation', desc: 'Machine learning algorithms analyze 50+ market factors to calculate the optimal negotiation price with 73% success rate.' },
              { icon: '📧', title: 'Automated Outreach', desc: 'Professional email templates with personalized strategy based on property owner psychology and market conditions.' },
              { icon: '📊', title: 'Market Intelligence', desc: 'Real-time analytics on pricing trends, vacancy rates, and negotiation leverage points in your target area.' },
              { icon: '🎯', title: 'Success Tracking', desc: 'Monitor response rates, track savings achieved, and optimize your negotiation strategy with detailed analytics.' },
              { icon: '⚡', title: 'Lightning Fast', desc: 'Get comprehensive market analysis and AI-generated offers in under 30 seconds. No more hours of manual research.' }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white/5 rounded-[20px] p-10 border border-white/10 hover:translate-y-[-10px] hover:bg-white/10 hover:shadow-[0_20px_40px_rgba(102,126,234,0.2)] transition-all duration-400 relative overflow-hidden"
                style={{ animationDelay: `${index * 0.2}s`, animation: 'float 6s ease-in-out infinite' }}
              >
                <span className="text-5xl mb-6 block">{feature.icon}</span>
                <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-primary/2">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-center text-5xl font-black mb-5 text-white">Choose Your Plan</h2>
          <p className="text-center text-xl text-gray-300 mb-16">Start free, upgrade when you're ready to save serious money</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-white/5 rounded-[25px] p-10 border border-white/10 hover:translate-y-[-5px] hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(102,126,234,0.3)] transition-all duration-400 text-center">
              <div className="text-2xl font-bold text-white mb-3">Free</div>
              <div className="text-5xl font-black text-primary mb-3">
                <span className="text-2xl align-top">$</span>0
                <span className="text-base text-gray-300 font-medium">/month</span>
              </div>
              <ul className="list-none my-8 text-left space-y-2">
                <li className="text-gray-300 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-secondary before:font-bold">3 AI offers per month</li>
                <li className="text-gray-300 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-secondary before:font-bold">Basic market analytics</li>
                <li className="text-gray-300 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-secondary before:font-bold">Email templates</li>
                <li className="text-gray-300 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-secondary before:font-bold">Community support</li>
              </ul>
              <Button className="bg-gradient-primary hover:translate-y-[-2px] hover:shadow-[0_10px_25px_rgba(102,126,234,0.4)] transition-all duration-300 rounded-[25px] w-full text-lg font-semibold py-4">
                Get Started Free
              </Button>
            </div>

            {/* Pro Plan - Featured */}
            <div className="bg-gradient-to-br from-primary/20 to-primary-dark/20 rounded-[25px] p-10 border-2 border-primary hover:translate-y-[-5px] hover:scale-[1.07] hover:shadow-[0_20px_40px_rgba(102,126,234,0.3)] transition-all duration-400 text-center transform scale-105">
              <div className="text-2xl font-bold text-white mb-3">Pro</div>
              <div className="text-5xl font-black text-primary mb-3">
                <span className="text-2xl align-top">$</span>19.99
                <span className="text-base text-gray-300 font-medium">/month</span>
              </div>
              <ul className="list-none my-8 text-left space-y-2">
                <li className="text-gray-300 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-secondary before:font-bold">Unlimited AI offers</li>
                <li className="text-gray-300 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-secondary before:font-bold">Advanced market intelligence</li>
                <li className="text-gray-300 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-secondary before:font-bold">Email automation</li>
                <li className="text-gray-300 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-secondary before:font-bold">Success probability scoring</li>
                <li className="text-gray-300 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-secondary before:font-bold">Priority support</li>
                <li className="text-gray-300 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-secondary before:font-bold">Mobile app access</li>
              </ul>
              <Link to="/signup">
                <Button className="bg-gradient-primary hover:translate-y-[-2px] hover:shadow-[0_10px_25px_rgba(102,126,234,0.4)] transition-all duration-300 rounded-[25px] w-full text-lg font-semibold py-4">
                  Start Pro Trial
                </Button>
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-white/5 rounded-[25px] p-10 border border-white/10 hover:translate-y-[-5px] hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(102,126,234,0.3)] transition-all duration-400 text-center">
              <div className="text-2xl font-bold text-white mb-3">Premium</div>
              <div className="text-5xl font-black text-primary mb-3">
                <span className="text-2xl align-top">$</span>49.99
                <span className="text-base text-gray-300 font-medium">/month</span>
              </div>
              <ul className="list-none my-8 text-left space-y-2">
                <li className="text-gray-300 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-secondary before:font-bold">Everything in Pro</li>
                <li className="text-gray-300 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-secondary before:font-bold">Concierge negotiation service</li>
                <li className="text-gray-300 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-secondary before:font-bold">Custom market reports</li>
                <li className="text-gray-300 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-secondary before:font-bold">White-glove onboarding</li>
                <li className="text-gray-300 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-secondary before:font-bold">Direct phone support</li>
                <li className="text-gray-300 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-secondary before:font-bold">API access</li>
              </ul>
              <Button className="bg-gradient-primary hover:translate-y-[-2px] hover:shadow-[0_10px_25px_rgba(102,126,234,0.4)] transition-all duration-300 rounded-[25px] w-full text-lg font-semibold py-4">
                Go Premium
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;