import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain, Target, DollarSign, BarChart, CheckCircle, Users, TrendingUp } from 'lucide-react';
import { designSystem } from '@/lib/design-system';
import ModernPageLayout from '@/components/modern/ModernPageLayout';
import GradientSection from '@/components/modern/GradientSection';
import ModernCard from '@/components/modern/ModernCard';

const About = () => {
  return (
    <ModernPageLayout 
      title="About Apartment Locator AI"
      subtitle="Revolutionizing Apartment Hunting with AI Intelligence"
      headerContent={
        <Link to="/">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft size={16} />
            Back to Home
          </Button>
        </Link>
      }
    >

      {/* Introduction */}
      <div className={`${designSystem.animations.entrance} text-center ${designSystem.spacing.marginLarge}`}>
        <p className={`${designSystem.typography.bodyLarge} max-w-4xl mx-auto`}>
          Apartment Locator AI is the world's first AI-powered apartment hunting platform that doesn't just help you find a place to live—it helps you win the negotiation game. We combine cutting-edge artificial intelligence with real-time market data to give renters the upper hand in today's competitive rental market.
        </p>
      </div>

      {/* What Makes Us Different */}
      <GradientSection variant="feature" title="What Makes Us Different">
        <div className={designSystem.layouts.gridTwo}>
          {[
            {
              icon: Brain,
              title: "AI-Powered Concession Strategies",
              description: "Our proprietary AI analyzes thousands of data points including property vacancy rates, market trends, landlord behavior patterns, and seasonal fluctuations to predict which concessions you're most likely to secure."
            },
            {
              icon: Target,
              title: "Personalized Match Scoring", 
              description: "Tell us what matters most to you. Whether it's your daily commute to work, proximity to your favorite gym, or staying close to family, our AI creates a personalized scoring system that ranks properties based on your unique lifestyle needs."
            },
            {
              icon: DollarSign,
              title: "Real Savings, Real Results",
              description: "Our users save an average of $400+ per month through AI-optimized negotiations. That's over $4,800 per year back in your pocket. We track success rates for every recommendation."
            },
            {
              icon: BarChart,
              title: "Live Market Intelligence",
              description: "Stay ahead of the curve with real-time market data. Our platform continuously monitors rental trends, price drops, concession patterns, and vacancy rates across your target areas."
            }
          ].map((feature, index) => (
            <ModernCard
              key={feature.title}
              title={feature.title}
              icon={<feature.icon className={`${designSystem.icons.large} text-blue-600`} />}
              animate
              animationDelay={index * 100}
              hover
            >
              <p className={designSystem.typography.body}>
                {feature.description}
              </p>
            </ModernCard>
          ))}
        </div>
      </GradientSection>

      {/* How It Works */}
      <GradientSection variant="content" title="How It Works" className="mt-20">
        <div className={`${designSystem.spacing.content} max-w-4xl mx-auto`}>
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
            <ModernCard
              key={index}
              animate
              animationDelay={index * 100}
              hover
              className="flex items-start gap-6"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 text-xl font-bold text-white">
                {item.step}
              </div>
              <div>
                <h3 className={`${designSystem.typography.subheadingLarge} mb-2`}>{item.title}</h3>
                <p className={designSystem.typography.body}>{item.desc}</p>
              </div>
            </ModernCard>
          ))}
        </div>
      </GradientSection>

      {/* Technology Edge */}
      <GradientSection variant="feature" title="Our Technology Edge" className="mt-20">
        <ModernCard className="max-w-4xl mx-auto">
          <ul className={designSystem.spacing.items}>
            {[
              'Machine Learning Models trained on millions of rental transactions',
              'Natural Language Processing to analyze listing descriptions and identify negotiation opportunities', 
              'Predictive Analytics to forecast market trends and optimal negotiation timing',
              'Real-Time Data Integration from MLS systems, public records, and proprietary sources',
              'Computer Vision to assess property photos and neighborhood characteristics'
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className={designSystem.typography.body}>{item}</span>
              </li>
            ))}
          </ul>
        </ModernCard>
      </GradientSection>

      {/* Built by Industry Insiders */}
      <GradientSection variant="content" title="Built by Industry Insiders" className="mt-20">
        <div className="max-w-4xl mx-auto">
          <ModernCard>
            <div className={designSystem.spacing.content}>
              <p className={`${designSystem.typography.bodyLarge} mb-6`}>
                Apartment Locator AI was founded by former real estate professionals who witnessed firsthand how information asymmetry puts renters at a disadvantage. After years of seeing tenants overpay simply because they didn't know what concessions were available or when to ask for them, our founding team decided to level the playing field.
              </p>
              
              <h4 className={`${designSystem.typography.subheadingLarge} mb-4`}>
                We've been on the other side of the negotiation table. We know:
              </h4>
              
              <ul className={`${designSystem.spacing.items} mb-6`}>
                {[
                  'Which concessions property managers are authorized to offer (but won\'t volunteer)',
                  'How vacancy rates and seasonal patterns affect landlord flexibility', 
                  'The exact language that gets applications approved faster',
                  'When properties become desperate to fill units',
                  'How to structure offers that seem win-win but save renters thousands'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className={designSystem.typography.body}>{item}</span>
                  </li>
                ))}
              </ul>
              
              <p className={`${designSystem.typography.bodyLarge} mb-6 font-semibold text-blue-600`}>
                This isn't just another apartment search site—it's insider knowledge made accessible.
              </p>
              
              <p className={designSystem.typography.body}>
                Our team includes former executives from major property management companies, data scientists from top tech firms, and AI researchers who've worked with Fortune 500 real estate companies. We're using our combined 50+ years of industry experience to give renters the same advantages that industry professionals have always had.
              </p>
            </div>
          </ModernCard>
        </div>
      </GradientSection>

      {/* Success Stats */}
      <GradientSection variant="stats" className="mt-20" centered>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`${designSystem.typography.heading} text-white mb-8`}>
            Our Mission in Action
          </h2>
          <div className={`${designSystem.layouts.gridThree} mb-8`}>
            {[
              { icon: Users, value: "15,000+", label: "Happy Renters" },
              { icon: DollarSign, value: "$2.3M+", label: "Total Savings" }, 
              { icon: TrendingUp, value: "73%", label: "Success Rate" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
          <p className={`${designSystem.typography.bodyLarge} text-blue-100 mb-8`}>
            We believe that finding a great apartment at a fair price shouldn't be a game of chance or connections. By democratizing access to market intelligence and negotiation expertise, we're empowering renters to make confident, informed decisions that save money and improve their quality of life.
          </p>
        </div>
      </GradientSection>

      {/* CTA Section */}
      <GradientSection variant="content" className="mt-20">
        <div className="max-w-2xl mx-auto text-center">
          <ModernCard className="p-8">
            <h2 className={`${designSystem.typography.heading} mb-6`}>
              Ready to revolutionize your apartment search?
            </h2>
            <p className={`${designSystem.typography.bodyLarge} mb-8`}>
              Start your free analysis today and discover what you could be saving
            </p>
            <Link to="/auth">
              <Button className={`${designSystem.buttons.primary} ${designSystem.buttons.large}`}>
                Start Free Analysis Today
              </Button>
            </Link>
          </ModernCard>
        </div>
      </GradientSection>
    </ModernPageLayout>
  );
};

export default About;