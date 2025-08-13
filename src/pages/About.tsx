import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const About = () => {
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
          <Link to="/" className="text-2xl font-extrabold" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>
            🏠 Apartment Locator AI
          </Link>
          <ul className="hidden md:flex gap-8 list-none">
            <li>
              <Link 
                to="/" 
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
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/#features" 
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
                Features
              </Link>
            </li>
            <li>
              <Link 
                to="/#pricing" 
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
                Pricing
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                className="font-medium relative transition-all duration-300"
                style={{ textDecoration: 'none', color: '#667eea' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                About
              </Link>
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

      {/* Main Content */}
      <main className="pt-32 pb-20 px-5">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <h1 
              className="text-5xl font-black leading-tight mb-6"
              style={{ 
                background: 'linear-gradient(135deg, #ffffff 0%, #667eea 50%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              About Apartment Locator AI
            </h1>
            <h2 className="text-3xl font-bold mb-8 text-white">
              Revolutionizing Apartment Hunting with AI Intelligence
            </h2>
            <p className="text-xl leading-relaxed" style={{ color: '#b0b0b0' }}>
              Apartment Locator AI is the world's first AI-powered apartment hunting platform that doesn't just help you find a place to live—it helps you win the negotiation game. We combine cutting-edge artificial intelligence with real-time market data to give renters the upper hand in today's competitive rental market.
            </p>
          </section>

          {/* What Makes Us Different */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-white">What Makes Us Different</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div 
                className="rounded-[20px] p-8 border"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="text-3xl mb-4">🧠</div>
                <h3 className="text-xl font-bold mb-4 text-white">AI-Powered Concession Strategies</h3>
                <p style={{ color: '#b0b0b0', lineHeight: 1.6 }}>
                  Our proprietary AI analyzes thousands of data points including property vacancy rates, market trends, landlord behavior patterns, and seasonal fluctuations to predict which concessions you're most likely to secure. We don't just show you apartments—we show you exactly how to negotiate the best deal.
                </p>
              </div>

              <div 
                className="rounded-[20px] p-8 border"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-4 text-white">Personalized Match Scoring</h3>
                <p style={{ color: '#b0b0b0', lineHeight: 1.6 }}>
                  Tell us what matters most to you. Whether it's your daily commute to work, proximity to your favorite gym, or staying close to family, our AI creates a personalized scoring system that ranks properties based on your unique lifestyle needs.
                </p>
              </div>

              <div 
                className="rounded-[20px] p-8 border"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="text-3xl mb-4">💰</div>
                <h3 className="text-xl font-bold mb-4 text-white">Real Savings, Real Results</h3>
                <p style={{ color: '#b0b0b0', lineHeight: 1.6 }}>
                  Our users save an average of $400+ per month through AI-optimized negotiations. That's over $4,800 per year back in your pocket. We track success rates for every recommendation, so you know exactly what to expect before you make an offer.
                </p>
              </div>

              <div 
                className="rounded-[20px] p-8 border"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-xl font-bold mb-4 text-white">Live Market Intelligence</h3>
                <p style={{ color: '#b0b0b0', lineHeight: 1.6 }}>
                  Stay ahead of the curve with real-time market data. Our platform continuously monitors rental trends, price drops, concession patterns, and vacancy rates across your target areas, giving you insider knowledge that was previously only available to industry professionals.
                </p>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-white">How It Works</h2>
            <div className="space-y-6">
              {[
                {
                  step: '1',
                  title: 'Smart Onboarding',
                  desc: 'Tell us about your lifestyle, budget, and must-haves. Connect your bank account (securely) to verify income and unlock premium features.'
                },
                {
                  step: '2',
                  title: 'AI Property Discovery',
                  desc: 'Our algorithms scan thousands of listings 24/7, identifying hidden gems, price drops, and properties ripe for negotiation.'
                },
                {
                  step: '3',
                  title: 'Concession Strategy',
                  desc: 'For each property, receive a detailed negotiation playbook with specific concessions to request, optimal timing, and predicted success rates.'
                },
                {
                  step: '4',
                  title: 'Automated Offers',
                  desc: 'Generate professional rental applications with AI-optimized terms that maximize your chances of acceptance while minimizing costs.'
                },
                {
                  step: '5',
                  title: 'Market Timing',
                  desc: 'Get notified when market conditions favor renters, when specific properties become more negotiable, or when better options become available.'
                }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-6 p-6 rounded-[15px] border"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                    <p style={{ color: '#b0b0b0', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Technology Edge */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-white">Our Technology Edge</h2>
            <div 
              className="rounded-[20px] p-8 border"
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <ul className="space-y-4">
                {[
                  'Machine Learning Models trained on millions of rental transactions',
                  'Natural Language Processing to analyze listing descriptions and identify negotiation opportunities',
                  'Predictive Analytics to forecast market trends and optimal negotiation timing',
                  'Real-Time Data Integration from MLS systems, public records, and proprietary sources',
                  'Computer Vision to assess property photos and neighborhood characteristics'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-lg font-bold mt-1" style={{ color: '#4ecdc4' }}>•</span>
                    <span style={{ color: '#b0b0b0', lineHeight: 1.6 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* For Every Renter */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-white">For Every Renter</h2>
            <div 
              className="rounded-[20px] p-8 border text-center"
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <p className="text-xl mb-8" style={{ color: '#b0b0b0', lineHeight: 1.6 }}>
                Whether you're a first-time renter learning the ropes, a seasoned apartment hunter looking for an edge, or someone facing a lease renewal, Apartment Locator AI levels the playing field. Our AI doesn't sleep, doesn't get emotional, and never leaves money on the table.
              </p>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="space-y-3">
                  <h4 className="font-bold text-white">Free Plan:</h4>
                  <p style={{ color: '#b0b0b0' }}>Get started with basic property analysis and limited AI offer generation.</p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-white">Pro Plan:</h4>
                  <p style={{ color: '#b0b0b0' }}>Unlock unlimited AI offers, advanced market insights, priority support, and early access to new features.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Built by Industry Insiders */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-white">Built by Industry Insiders</h2>
            <div 
              className="rounded-[20px] p-8 border"
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <p className="text-lg mb-6" style={{ color: '#b0b0b0', lineHeight: 1.6 }}>
                Apartment Locator AI was founded by former property managers, leasing agents, and real estate professionals who witnessed firsthand how information asymmetry puts renters at a disadvantage. After years of seeing tenants overpay simply because they didn't know what concessions were available or when to ask for them, our founding team decided to level the playing field.
              </p>
              <h4 className="text-xl font-bold mb-4 text-white">We've been on the other side of the negotiation table. We know:</h4>
              <ul className="space-y-3 mb-6">
                {[
                  'Which concessions property managers are authorized to offer (but won\'t volunteer)',
                  'How vacancy rates and seasonal patterns affect landlord flexibility',
                  'The exact language that gets applications approved faster',
                  'When properties become desperate to fill units',
                  'How to structure offers that seem win-win but save renters thousands'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="font-bold mt-1" style={{ color: '#4ecdc4' }}>✓</span>
                    <span style={{ color: '#b0b0b0', lineHeight: 1.6 }}>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-lg mb-6" style={{ color: '#b0b0b0', lineHeight: 1.6 }}>
                This isn't just another apartment search site—it's insider knowledge made accessible.
              </p>
              <p style={{ color: '#b0b0b0', lineHeight: 1.6 }}>
                Our team includes former executives from major property management companies, data scientists from top tech firms, and AI researchers who've worked with Fortune 500 real estate companies. We're using our combined 50+ years of industry experience to give renters the same advantages that industry professionals have always had.
              </p>
            </div>
          </section>

          {/* Our Mission */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-white">Our Mission</h2>
            <div 
              className="rounded-[20px] p-8 border"
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <p className="text-lg mb-6" style={{ color: '#b0b0b0', lineHeight: 1.6 }}>
                We believe that finding a great apartment at a fair price shouldn't be a game of chance or connections. The rental industry has operated with information asymmetry for too long—landlords and property managers hold all the cards while renters negotiate blind. By democratizing access to market intelligence and negotiation expertise that was previously only available to industry insiders, we're empowering renters to make confident, informed decisions that save money and improve their quality of life.
              </p>
              <p className="text-xl font-bold text-center" style={{ color: '#4ecdc4' }}>
                Join thousands of renters who've already saved over $2.3 million in rent through smarter negotiations.
              </p>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <h2 className="text-3xl font-bold mb-6 text-white">
              Ready to revolutionize your apartment search?
            </h2>
            <p className="text-xl mb-8" style={{ color: '#b0b0b0' }}>
              Start your free analysis today and discover what you could be saving
            </p>
            <Link to="/signup">
              <button 
                className="text-white px-8 py-4 border-0 rounded-[30px] text-lg font-semibold transition-all duration-300"
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
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
                Start Free Analysis Today
              </button>
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
};

export default About;