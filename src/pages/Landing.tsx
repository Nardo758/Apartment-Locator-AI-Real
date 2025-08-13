import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="min-h-screen text-white overflow-x-hidden" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", lineHeight: 1.6, color: '#ffffff', background: '#0a0a0a' }}>
      {/* Animated Background */}
      <div className="fixed top-0 left-0 w-full h-full z-[-1]" style={{ background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)', opacity: 0.1 }}>
        <div 
          className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%]" 
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(255, 255, 255, 0.03) 50px, rgba(255, 255, 255, 0.03) 51px)',
            animation: 'drift 20s linear infinite'
          }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-[1000] py-4" style={{ background: 'rgba(10, 10, 10, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <nav className="max-w-[1200px] mx-auto px-5 flex justify-between items-center">
          <div className="text-2xl font-extrabold" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🏠 Apartment Locator AI
          </div>
          <ul className="hidden md:flex gap-8 list-none">
            <li>
              <a 
                href="#features" 
                className="text-white font-medium relative transition-all duration-300"
                style={{ textDecoration: 'none' }}
                onClick={(e) => handleSmoothScroll(e, '#features')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#667eea';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Features
              </a>
            </li>
            <li>
              <a 
                href="#pricing" 
                className="text-white font-medium relative transition-all duration-300"
                style={{ textDecoration: 'none' }}
                onClick={(e) => handleSmoothScroll(e, '#pricing')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#667eea';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Pricing
              </a>
            </li>
            <li>
              <a 
                href="/about" 
                className="text-white font-medium relative transition-all duration-300"
                style={{ textDecoration: 'none' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#667eea';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                About
              </a>
            </li>
          </ul>
          <Link to="/signup">
            <button 
              className="text-white px-6 py-3 border-0 rounded-[25px] font-semibold transition-all duration-300"
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }}
            >
              Start Free Trial
            </button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-5 z-10">
          <div className="grid md:grid-cols-2 gap-15 items-center">
            <div style={{ animation: 'slideInUp 1s ease-out' }}>
              <h1 
                className="text-6xl font-black leading-[1.1] mb-6"
                style={{ 
                  background: 'linear-gradient(135deg, #ffffff 0%, #667eea 50%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Never Overpay for Rent Again
              </h1>
              <p className="text-xl mb-8" style={{ color: '#b0b0b0' }}>
                Our AI discovers hidden rental opportunities and generates data-driven negotiation offers that save you an average of $312/month.
              </p>
              
              <div className="grid grid-cols-3 gap-5 mb-10" style={{ animation: 'slideInUp 1s ease-out 0.4s backwards' }}>
                <div 
                  className="text-center p-5 rounded-2xl border transition-all duration-300"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  <span className="text-2xl font-extrabold block" style={{ color: '#667eea' }}>73%</span>
                  <span className="text-sm" style={{ color: '#888' }}>Success Rate</span>
                </div>
                <div 
                  className="text-center p-5 rounded-2xl border transition-all duration-300"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  <span className="text-2xl font-extrabold block" style={{ color: '#667eea' }}>$312</span>
                  <span className="text-sm" style={{ color: '#888' }}>Avg. Monthly Savings</span>
                </div>
                <div 
                  className="text-center p-5 rounded-2xl border transition-all duration-300"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  <span className="text-2xl font-extrabold block" style={{ color: '#667eea' }}>15K+</span>
                  <span className="text-sm" style={{ color: '#888' }}>Happy Renters</span>
                </div>
              </div>
              
              <div className="flex gap-5" style={{ animation: 'slideInUp 1s ease-out 0.6s backwards' }}>
                <Link to="/signup">
                  <button 
                    className="text-white px-8 py-4 border-0 rounded-[30px] text-lg font-semibold transition-all duration-300"
                    style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                    }}
                  >
                    Start Saving Today
                  </button>
                </Link>
                <button 
                  className="text-white px-8 py-4 rounded-[30px] text-lg font-semibold transition-all duration-300"
                  style={{ 
                    background: 'transparent',
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.querySelector('#demo');
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  See How It Works
                </button>
              </div>
            </div>
            
            {/* Demo Interface */}
            <div 
              id="demo"
              className="rounded-[20px] p-8 border relative overflow-hidden ml-8"
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                animation: 'slideInRight 1s ease-out'
              }}
            >
              <div 
                className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%]"
                style={{
                  background: 'linear-gradient(45deg, transparent, rgba(102, 126, 234, 0.1), transparent)',
                  animation: 'scanline 3s linear infinite'
                }}
              />
              
              <div className="flex justify-between items-center mb-5 relative z-10">
                <div className="text-xl font-bold" style={{ color: '#667eea' }}>AI-Powered Property Analysis</div>
                <div 
                  className="text-white px-3 py-1 rounded-2xl text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                >
                  LIVE AI
                </div>
              </div>
              
              <div 
                className={`rounded-2xl p-5 mb-4 border transition-all duration-300 relative z-10 ${currentDemo === 0 ? 'opacity-100' : 'opacity-50'}`}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transform: currentDemo === 0 ? 'translateY(-3px)' : 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = currentDemo === 0 ? 'translateY(-3px)' : 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="font-semibold text-white">2847 Riverside Dr, Austin</div>
                  <div className="text-sm font-medium" style={{ color: '#ff6b6b' }}>67 days vacant</div>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-sm line-through" style={{ color: '#888' }}>$2,400/mo</div>
                    <div className="text-2xl font-extrabold" style={{ color: '#4ecdc4' }}>$2,180/mo</div>
                  </div>
                  <div 
                    className="text-white px-2 py-1 rounded-lg text-sm font-semibold"
                    style={{ background: 'linear-gradient(135deg, #4ecdc4, #44a08d)' }}
                  >
                    Save $220/mo
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
                        width: '84%',
                        animation: 'progressFill 2s ease-out'
                      }}
                    />
                  </div>
                  <div className="text-sm font-semibold" style={{ color: '#4ecdc4' }}>84% Success</div>
                </div>
              </div>
              
              <div 
                className={`rounded-2xl p-5 border transition-all duration-300 relative z-10 ${currentDemo === 1 ? 'opacity-100' : 'opacity-50'}`}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transform: currentDemo === 1 ? 'translateY(-3px)' : 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = currentDemo === 1 ? 'translateY(-3px)' : 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="font-semibold text-white">987 Mueller District</div>
                  <div className="text-sm font-medium" style={{ color: '#ff6b6b' }}>89 days vacant</div>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-sm line-through" style={{ color: '#888' }}>$2,200/mo</div>
                    <div className="text-2xl font-extrabold" style={{ color: '#4ecdc4' }}>$1,890/mo</div>
                  </div>
                  <div 
                    className="text-white px-2 py-1 rounded-lg text-sm font-semibold"
                    style={{ background: 'linear-gradient(135deg, #4ecdc4, #44a08d)' }}
                  >
                    Save $310/mo
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
                        width: '91%',
                        animation: 'progressFill 2s ease-out'
                      }}
                    />
                  </div>
                  <div className="text-sm font-semibold" style={{ color: '#4ecdc4' }}>91% Success</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(102, 126, 234, 0.05) 100%)' }}>
        <div className="max-w-6xl mx-auto px-5">
          <h2 
            className="text-center text-5xl font-extrabold mb-16"
            style={{ 
              background: 'linear-gradient(135deg, #ffffff 0%, #667eea 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
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
                className="rounded-[20px] p-10 border relative overflow-hidden transition-all duration-400"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  animationDelay: `${index * 0.2}s`,
                  animation: 'float 6s ease-in-out infinite'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span className="text-5xl mb-6 block">{feature.icon}</span>
                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p style={{ color: '#b0b0b0', lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32" style={{ background: 'rgba(102, 126, 234, 0.02)' }}>
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-center text-5xl font-extrabold mb-5 text-white">Choose Your Plan</h2>
          <p className="text-center text-xl mb-16" style={{ color: '#b0b0b0' }}>One-time payment for AI-powered apartment hunting</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div 
              className="rounded-[25px] p-10 border text-center transition-all duration-400"
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="text-2xl font-bold text-white mb-3">Basic</div>
              <div className="text-5xl font-black mb-3" style={{ color: '#667eea' }}>
                <span className="text-2xl align-top">$</span>9.99
                <span className="text-base font-medium" style={{ color: '#b0b0b0' }}> one-time</span>
              </div>
              <ul className="list-none my-8 text-left space-y-2">
                <li className="pl-6 relative" style={{ color: '#b0b0b0' }}>
                  <span className="absolute left-0 font-bold" style={{ color: '#4ecdc4' }}>✓</span>
                  5 AI property analyses
                </li>
                <li className="pl-6 relative" style={{ color: '#b0b0b0' }}>
                  <span className="absolute left-0 font-bold" style={{ color: '#4ecdc4' }}>✓</span>
                  Basic market insights
                </li>
                <li className="pl-6 relative" style={{ color: '#b0b0b0' }}>
                  <span className="absolute left-0 font-bold" style={{ color: '#4ecdc4' }}>✓</span>
                  Email templates
                </li>
                <li className="pl-6 relative" style={{ color: '#b0b0b0' }}>
                  <span className="absolute left-0 font-bold" style={{ color: '#4ecdc4' }}>✓</span>
                  7-day access
                </li>
              </ul>
              <button 
                className="text-white px-8 py-4 border-0 rounded-[25px] text-lg font-semibold w-full transition-all duration-300"
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Get Started
              </button>
            </div>

            {/* Pro Plan - Featured */}
            <div 
              className="rounded-[25px] p-10 text-center transition-all duration-400"
              style={{ 
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))',
                border: '2px solid #667eea',
                transform: 'scale(1.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.07)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1.05)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="text-2xl font-bold text-white mb-3">Pro</div>
              <div className="text-5xl font-black mb-3" style={{ color: '#667eea' }}>
                <span className="text-2xl align-top">$</span>29.99
                <span className="text-base font-medium" style={{ color: '#b0b0b0' }}> one-time</span>
              </div>
              <ul className="list-none my-8 text-left space-y-2">
                <li className="pl-6 relative" style={{ color: '#b0b0b0' }}>
                  <span className="absolute left-0 font-bold" style={{ color: '#4ecdc4' }}>✓</span>
                  Unlimited AI analyses
                </li>
                <li className="pl-6 relative" style={{ color: '#b0b0b0' }}>
                  <span className="absolute left-0 font-bold" style={{ color: '#4ecdc4' }}>✓</span>
                  Advanced market intelligence
                </li>
                <li className="pl-6 relative" style={{ color: '#b0b0b0' }}>
                  <span className="absolute left-0 font-bold" style={{ color: '#4ecdc4' }}>✓</span>
                  Email automation templates
                </li>
                <li className="pl-6 relative" style={{ color: '#b0b0b0' }}>
                  <span className="absolute left-0 font-bold" style={{ color: '#4ecdc4' }}>✓</span>
                  Success probability scoring
                </li>
                <li className="pl-6 relative" style={{ color: '#b0b0b0' }}>
                  <span className="absolute left-0 font-bold" style={{ color: '#4ecdc4' }}>✓</span>
                  30-day access
                </li>
                <li className="pl-6 relative" style={{ color: '#b0b0b0' }}>
                  <span className="absolute left-0 font-bold" style={{ color: '#4ecdc4' }}>✓</span>
                  Priority email support
                </li>
              </ul>
              <Link to="/signup">
                <button 
                  className="text-white px-8 py-4 border-0 rounded-[25px] text-lg font-semibold w-full transition-all duration-300"
                  style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Start Pro Analysis
                </button>
              </Link>
            </div>

            {/* Premium Plan */}
            <div 
              className="rounded-[25px] p-10 border text-center transition-all duration-400"
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="text-2xl font-bold text-white mb-3">Premium</div>
              <div className="text-5xl font-black mb-3" style={{ color: '#667eea' }}>
                <span className="text-2xl align-top">$</span>99.99
                <span className="text-base font-medium" style={{ color: '#b0b0b0' }}> one-time</span>
              </div>
              <ul className="list-none my-8 text-left space-y-2">
                <li className="pl-6 relative" style={{ color: '#b0b0b0' }}>
                  <span className="absolute left-0 font-bold" style={{ color: '#4ecdc4' }}>✓</span>
                  Everything in Pro
                </li>
                <li className="pl-6 relative" style={{ color: '#b0b0b0' }}>
                  <span className="absolute left-0 font-bold" style={{ color: '#4ecdc4' }}>✓</span>
                  Personal AI concierge
                </li>
                <li className="pl-6 relative" style={{ color: '#b0b0b0' }}>
                  <span className="absolute left-0 font-bold" style={{ color: '#4ecdc4' }}>✓</span>
                  Custom market reports
                </li>
                <li className="pl-6 relative" style={{ color: '#b0b0b0' }}>
                  <span className="absolute left-0 font-bold" style={{ color: '#4ecdc4' }}>✓</span>
                  White-glove setup
                </li>
                <li className="pl-6 relative" style={{ color: '#b0b0b0' }}>
                  <span className="absolute left-0 font-bold" style={{ color: '#4ecdc4' }}>✓</span>
                  90-day access
                </li>
                <li className="pl-6 relative" style={{ color: '#b0b0b0' }}>
                  <span className="absolute left-0 font-bold" style={{ color: '#4ecdc4' }}>✓</span>
                  Direct phone support
                </li>
              </ul>
              <button 
                className="text-white px-8 py-4 border-0 rounded-[25px] text-lg font-semibold w-full transition-all duration-300"
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Go Premium
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;