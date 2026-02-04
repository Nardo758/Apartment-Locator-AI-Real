import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  DollarSign
} from 'lucide-react';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    priceAnnual: 470, // 20% discount
    description: 'Perfect for individual landlords',
    maxProperties: 10,
    popular: false,
    features: [
      'Up to 10 properties',
      'Portfolio dashboard',
      'Market comparison',
      'Pricing recommendations',
      'Vacancy risk alerts',
      'Monthly market reports',
      'Email support'
    ],
    notIncluded: [
      'Competitive intelligence alerts',
      'Renewal optimizer',
      'API access',
      'White-label reports'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    priceAnnual: 950, // 20% discount
    description: 'For growing property managers',
    maxProperties: 50,
    popular: true,
    features: [
      'Up to 50 properties',
      'Everything in Starter, plus:',
      'Real-time competitor alerts',
      'Renewal optimizer',
      'Tenant retention tools',
      'Market share analysis',
      'Email templates',
      'Priority support',
      'Advanced analytics'
    ],
    notIncluded: [
      'API access',
      'White-label reports'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    priceAnnual: 1910, // 20% discount
    description: 'For professional property managers',
    maxProperties: null, // Unlimited
    popular: false,
    features: [
      'Unlimited properties',
      'Everything in Professional, plus:',
      'API access',
      'White-label reports',
      'Custom integrations',
      'Dedicated account manager',
      'Phone support',
      'Training & onboarding',
      'Custom analytics'
    ],
    notIncluded: []
  }
];

const features = [
  {
    icon: <TrendingUp className="w-6 h-6 text-blue-400" />,
    title: 'Market Intelligence',
    description: 'Real-time data on competitor pricing, concessions, and market trends'
  },
  {
    icon: <Users className="w-6 h-6 text-purple-400" />,
    title: 'Tenant Retention',
    description: 'Optimize renewals and prevent costly turnovers with AI recommendations'
  },
  {
    icon: <Zap className="w-6 h-6 text-yellow-400" />,
    title: 'Instant Alerts',
    description: 'Get notified when competitors change pricing or add concessions'
  },
  {
    icon: <Shield className="w-6 h-6 text-green-400" />,
    title: 'Risk Management',
    description: 'Identify vacancy risks before they become problems'
  }
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Property Manager',
    properties: 23,
    quote: 'Reduced vacancy days by 40% and increased renewal rates to 85%. This tool pays for itself.',
    savings: '$18,000/year'
  },
  {
    name: 'Michael Rodriguez',
    role: 'Real Estate Investor',
    properties: 8,
    quote: 'Caught competitors dropping prices before I lost tenants. The competitive alerts alone are worth it.',
    savings: '$6,400/year'
  },
  {
    name: 'Jennifer Williams',
    role: 'Landlord',
    properties: 4,
    quote: 'My renewal optimizer recommendations have a 92% success rate. No more guessing on renewal pricing.',
    savings: '$4,800/year'
  }
];

const faqs = [
  {
    question: 'What counts as a property?',
    answer: 'Each unique rental unit counts as one property. A duplex with 2 units = 2 properties.'
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes! All plans are month-to-month with no long-term contracts. Cancel anytime from your dashboard.'
  },
  {
    question: 'Do you offer a free trial?',
    answer: 'Yes! All plans include a 14-day free trial. No credit card required to start.'
  },
  {
    question: 'What markets do you cover?',
    answer: 'We currently cover major metros in Texas, Florida, California, and more. Coverage expanding monthly.'
  },
  {
    question: 'How accurate is your market data?',
    answer: 'We scrape 1M+ listings daily from major rental platforms. Data refreshes every 24 hours.'
  },
  {
    question: 'Can I upgrade or downgrade later?',
    answer: 'Absolutely! Change plans anytime. Upgrades are instant, downgrades take effect next billing cycle.'
  }
];

export default function LandlordPricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-blue-900/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Badge variant="primary" size="lg" className="mb-6">
            <Building className="w-4 h-4 mr-2" />
            For Property Managers & Landlords
          </Badge>
          
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Never Lose Money to Vacancy Again
          </h1>
          
          <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
            Monitor your properties, track competitors, optimize pricing, and maximize renewals - all in one platform.
          </p>

          <div className="flex items-center justify-center gap-6 text-sm text-white/60 mb-8">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-2 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-2 rounded-lg font-medium transition-all relative ${
                billingPeriod === 'annual'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Annual
              <Badge variant="success" size="sm" className="ml-2">
                Save 20%
              </Badge>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              variant={plan.popular ? 'highlighted' : 'elevated'}
              className={`relative ${plan.popular ? 'scale-105 z-10' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="success" size="lg">
                    ⭐ Most Popular
                  </Badge>
                </div>
              )}

              <div className="p-8">
                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-white/60 text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      ${billingPeriod === 'monthly' ? plan.price : Math.round(plan.priceAnnual / 12)}
                    </span>
                    <span className="text-white/60">/month</span>
                  </div>
                  {billingPeriod === 'annual' && (
                    <p className="text-sm text-green-400 mt-2">
                      ${plan.priceAnnual}/year - Save ${(plan.price * 12) - plan.priceAnnual}!
                    </p>
                  )}
                </div>

                {/* Properties Limit */}
                <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Properties</span>
                    <span className="text-white font-bold">
                      {plan.maxProperties ? `Up to ${plan.maxProperties}` : 'Unlimited'}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link to={`/auth?type=landlord&mode=signup&plan=${plan.id}`}>
                  <Button
                    size="lg"
                    className={`w-full mb-6 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                        : ''
                    }`}
                  >
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-white/80 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Not Included */}
                {plan.notIncluded.length > 0 && (
                  <div className="pt-6 border-t border-white/10 space-y-3">
                    {plan.notIncluded.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <X className="w-5 h-5 text-white/30 flex-shrink-0 mt-0.5" />
                        <span className="text-white/40 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Landlords Love Us
            </h2>
            <p className="text-white/60 text-lg">
              Tools that pay for themselves by preventing just one vacancy
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} variant="glass" hover className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/60 text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Real Results from Real Landlords
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} variant="elevated" className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-white/60">
                      {testimonial.role} • {testimonial.properties} properties
                    </div>
                  </div>
                </div>
                <p className="text-white/80 mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-2 text-green-400 font-semibold">
                  <DollarSign className="w-4 h-4" />
                  <span>{testimonial.savings} saved</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* ROI Calculator */}
        <Card variant="highlighted" className="p-12 mb-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            The Math is Simple
          </h2>
          <p className="text-white/70 text-lg mb-8">
            One prevented vacancy pays for 12+ months of service
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="text-4xl font-bold text-red-400 mb-2">
                $1,200+
              </div>
              <div className="text-white/60">
                Cost of one vacancy (turnover + lost rent)
              </div>
            </div>
            <div className="flex items-center justify-center">
              <ArrowRight className="w-8 h-8 text-white/40" />
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30">
              <div className="text-4xl font-bold text-green-400 mb-2">
                $49-199
              </div>
              <div className="text-white/60">
                Monthly subscription cost
              </div>
            </div>
          </div>
        </Card>

        {/* FAQ */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <Card key={idx} variant="glass" className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-white/70">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Optimize Your Portfolio?
          </h2>
          <Link to="/auth?type=landlord&mode=signup&plan=professional">
            <Button size="xl" className="bg-gradient-to-r from-blue-600 to-purple-600">
              Start Free Trial - No Credit Card Required
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-white/50 mt-4">
            Join 500+ landlords maximizing their rental income
          </p>
        </div>
      </div>
    </div>
  );
}
