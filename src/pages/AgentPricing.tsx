import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  X,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Building,
  ArrowRight,
  DollarSign,
  Star,
  Calculator,
  FileText,
  BarChart3,
  Target,
  MessageSquare,
  Globe,
  Smartphone,
  Crown,
  User
} from 'lucide-react';

const plans = [
  {
    id: 'agent',
    name: 'Agent',
    price: 79,
    priceAnnual: 790, // ~17% discount
    description: 'Perfect for individual real estate agents',
    popular: false,
    maxClients: 25,
    features: [
      'Up to 25 active clients',
      'Lead capture forms',
      'Client portfolio management',
      'Commission calculator',
      'Basic report generation',
      'Email notifications',
      'Mobile app access',
      'Email support'
    ],
    notIncluded: [
      'Team collaboration',
      'Advanced analytics',
      'White-label reports',
      'API access',
      'Priority support'
    ]
  },
  {
    id: 'team',
    name: 'Team',
    price: 149,
    priceAnnual: 1490, // ~17% discount
    description: 'For growing agent teams',
    popular: true,
    maxClients: 100,
    features: [
      'Up to 100 active clients',
      'Everything in Agent, plus:',
      'Team collaboration (5 agents)',
      'Advanced analytics dashboard',
      'Custom branding',
      'Automated follow-ups',
      'CRM integrations',
      'Lead distribution',
      'Performance tracking',
      'Priority email support'
    ],
    notIncluded: [
      'White-label reports',
      'API access',
      'Dedicated account manager'
    ]
  },
  {
    id: 'brokerage',
    name: 'Brokerage',
    price: 299,
    priceAnnual: 2990, // ~17% discount
    description: 'For brokerages and large teams',
    popular: false,
    maxClients: null, // Unlimited
    features: [
      'Unlimited clients',
      'Everything in Team, plus:',
      'Unlimited team members',
      'White-label reports',
      'Full API access',
      'Custom integrations',
      'Advanced permissions',
      'Multi-office support',
      'Dedicated account manager',
      'Phone & priority support',
      'Custom training',
      'SLA guarantee'
    ],
    notIncluded: []
  }
];

const testimonials = [
  {
    name: 'Jennifer Martinez',
    role: 'Real Estate Agent',
    company: 'Coldwell Banker',
    quote: 'This platform has tripled my client management efficiency. The commission calculator alone pays for itself!',
    avatar: 'JM'
  },
  {
    name: 'Robert Chen',
    role: 'Broker',
    company: 'Century 21',
    quote: 'Managing 15 agents used to be chaos. Now we have complete visibility and our conversion rates are up 40%.',
    avatar: 'RC'
  },
  {
    name: 'Lisa Thompson',
    role: 'Team Leader',
    company: 'RE/MAX',
    quote: 'The automated reports save me hours every week. My clients love the professional presentations.',
    avatar: 'LT'
  }
];

export default function AgentPricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getMonthlyPrice = (plan: typeof plans[0]) => {
    if (billingCycle === 'annual') {
      return plan.priceAnnual / 12;
    }
    return plan.price;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="outline">
                ← Back to Home
              </Button>
            </Link>
            <Badge variant="primary">
              <Star className="w-3 h-3 mr-1" />
              Agent Tools
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="primary" className="mb-4">
            <TrendingUp className="w-3 h-3 mr-1" />
            Professional Agent Tools
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Grow Your Real Estate Business
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Powerful tools to manage clients, track commissions, and close more deals. 
            Join thousands of successful agents and brokers.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-lg ${billingCycle === 'monthly' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-16 h-8 bg-gray-200 rounded-full transition-colors hover:bg-gray-300"
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-8' : ''
                }`}
              />
            </button>
            <span className={`text-lg ${billingCycle === 'annual' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
              Annual
            </span>
            {billingCycle === 'annual' && (
              <Badge variant="success">
                Save ~17%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              variant={plan.popular ? 'highlighted' : 'elevated'}
              className={`relative ${
                plan.popular ? 'border-2 border-purple-500/50 shadow-2xl shadow-purple-500/20' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pt-8">
                <div className="flex items-center gap-2 mb-2">
                  {plan.id === 'brokerage' && <Crown className="w-5 h-5 text-yellow-500" />}
                  {plan.id === 'team' && <Users className="w-5 h-5 text-purple-500" />}
                  {plan.id === 'agent' && <User className="w-5 h-5 text-blue-500" />}
                  <CardTitle className="text-2xl text-gray-900">{plan.name}</CardTitle>
                </div>
                <CardDescription className="text-base text-gray-500">{plan.description}</CardDescription>
                
                <div className="mt-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatCurrency(getMonthlyPrice(plan))}
                    </span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  {billingCycle === 'annual' && (
                    <p className="text-sm text-gray-500 mt-2">
                      Billed annually at {formatCurrency(plan.priceAnnual)}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    {plan.maxClients ? `Up to ${plan.maxClients} clients` : 'Unlimited clients'}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Link to={`/auth?type=agent&mode=signup&plan=${plan.id}`}>
                  <Button 
                    className={`w-full py-6 text-lg font-semibold ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                        : ''
                    }`}
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">What's included:</p>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.notIncluded.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-400">Not included:</p>
                    {plan.notIncluded.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-400">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features for Agents</h2>
            <p className="text-gray-600 text-lg">Everything you need to manage your real estate business</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                title: 'Client Management',
                description: 'Track all your clients and deals in one place'
              },
              {
                icon: Calculator,
                title: 'Commission Calculator',
                description: 'Instantly calculate earnings and splits'
              },
              {
                icon: FileText,
                title: 'Professional Reports',
                description: 'Generate beautiful client reports'
              },
              {
                icon: BarChart3,
                title: 'Analytics Dashboard',
                description: 'Track performance and conversion rates'
              },
              {
                icon: Target,
                title: 'Lead Capture',
                description: 'Convert prospects into clients faster'
              },
              {
                icon: MessageSquare,
                title: 'Automated Follow-ups',
                description: 'Never miss a follow-up opportunity'
              },
              {
                icon: Smartphone,
                title: 'Mobile Access',
                description: 'Work from anywhere with our mobile app'
              },
              {
                icon: Shield,
                title: 'Secure & Compliant',
                description: 'Bank-level security for your data'
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} variant="elevated" hover>
                  <CardContent className="p-6">
                    <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Top Agents</h2>
            <p className="text-gray-600 text-lg">See what industry professionals are saying</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} variant="elevated">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                      <p className="text-xs text-gray-400">{testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ROI Calculator */}
        <Card variant="elevated" className="mb-20 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardContent className="p-8 md:p-12">
            <div className="text-center max-w-3xl mx-auto">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Calculate Your ROI</h2>
              <p className="text-gray-600 text-lg mb-8">
                Close just one extra deal per month and the platform pays for itself 10x over.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <p className="text-4xl font-bold text-green-600 mb-2">$6,300</p>
                  <p className="text-gray-600">Avg. commission per deal</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <p className="text-4xl font-bold text-purple-600 mb-2">$79</p>
                  <p className="text-gray-600">Monthly platform cost</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <p className="text-4xl font-bold text-yellow-600 mb-2">79x</p>
                  <p className="text-gray-600">Return on investment</p>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-6 text-lg">
                <Calculator className="w-5 h-5 mr-2" />
                Start Closing More Deals
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: 'Can I switch plans anytime?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.'
              },
              {
                q: 'Is there a free trial?',
                a: 'We offer a 14-day free trial with full access to all features. No credit card required.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, debit cards, and ACH bank transfers for annual plans.'
              },
              {
                q: 'Do you offer refunds?',
                a: 'Yes, we offer a 30-day money-back guarantee if you\'re not satisfied with the platform.'
              }
            ].map((faq, idx) => (
              <Card key={idx} variant="elevated" hover>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card variant="elevated" className="text-center bg-gradient-to-br from-purple-50 to-blue-50">
          <CardContent className="p-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Grow Your Business?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of successful agents and brokers today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?type=agent&mode=signup&plan=team">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg">
                  <Zap className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="px-8 py-6 text-lg">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
