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
    icon: <TrendingUp className="w-6 h-6 text-teal-600" />,
    iconBg: 'bg-teal-100',
    title: 'Market Intelligence',
    description: 'Real-time data on competitor pricing, concessions, and market trends'
  },
  {
    icon: <Users className="w-6 h-6 text-pink-600" />,
    iconBg: 'bg-pink-100',
    title: 'Tenant Retention',
    description: 'Optimize renewals and prevent costly turnovers with AI recommendations'
  },
  {
    icon: <Zap className="w-6 h-6 text-yellow-600" />,
    iconBg: 'bg-yellow-100',
    title: 'Instant Alerts',
    description: 'Get notified when competitors change pricing or add concessions'
  },
  {
    icon: <Shield className="w-6 h-6 text-emerald-600" />,
    iconBg: 'bg-emerald-100',
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
    savings: '$18,000/year',
    avatarBg: 'bg-purple-500'
  },
  {
    name: 'Michael Rodriguez',
    role: 'Real Estate Investor',
    properties: 8,
    quote: 'Caught competitors dropping prices before I lost tenants. The competitive alerts alone are worth it.',
    savings: '$6,400/year',
    avatarBg: 'bg-teal-500'
  },
  {
    name: 'Jennifer Williams',
    role: 'Landlord',
    properties: 4,
    quote: 'My renewal optimizer recommendations have a 92% success rate. No more guessing on renewal pricing.',
    savings: '$4,800/year',
    avatarBg: 'bg-emerald-500'
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Badge variant="primary" size="lg" className="mb-6">
            <Building className="w-4 h-4 mr-2" />
            For Property Managers & Landlords
          </Badge>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Never Lose Money to Vacancy Again
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Monitor your properties, track competitors, optimize pricing, and maximize renewals - all in one platform.
          </p>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-2 rounded-xl bg-white border border-gray-200 shadow-sm">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-2 rounded-lg font-medium transition-all relative ${
                billingPeriod === 'annual'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-gray-500 hover:text-gray-900'
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      ${billingPeriod === 'monthly' ? plan.price : Math.round(plan.priceAnnual / 12)}
                    </span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  {billingPeriod === 'annual' && (
                    <p className="text-sm text-green-600 mt-2">
                      ${plan.priceAnnual}/year - Save ${(plan.price * 12) - plan.priceAnnual}!
                    </p>
                  )}
                </div>

                {/* Properties Limit */}
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Properties</span>
                    <span className="text-gray-900 font-bold">
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
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Not Included */}
                {plan.notIncluded.length > 0 && (
                  <div className="pt-6 border-t border-gray-200 space-y-3">
                    {plan.notIncluded.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-400 text-sm">{feature}</span>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Landlords Love Us
            </h2>
            <p className="text-gray-600 text-lg">
              Tools that pay for themselves by preventing just one vacancy
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} variant="elevated" hover className="p-6 text-center">
                <div className={`w-12 h-12 rounded-full ${feature.iconBg} flex items-center justify-center mx-auto mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Real Results from Real Landlords
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} variant="elevated" className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full ${testimonial.avatarBg} flex items-center justify-center text-white font-bold`}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role} • {testimonial.properties} properties
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <DollarSign className="w-4 h-4" />
                  <span>{testimonial.savings} saved</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* ROI Calculator */}
        <Card variant="elevated" className="p-12 mb-20 text-center bg-gradient-to-br from-purple-50 to-blue-50">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            The Math is Simple
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            One prevented vacancy pays for 12+ months of service
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
              <div className="text-4xl font-bold text-red-500 mb-2">
                $1,200+
              </div>
              <div className="text-gray-600">
                Cost of one vacancy (turnover + lost rent)
              </div>
            </div>
            <div className="flex items-center justify-center">
              <ArrowRight className="w-8 h-8 text-gray-400" />
            </div>
            <div className="p-6 rounded-xl bg-green-50 border border-green-200">
              <div className="text-4xl font-bold text-green-600 mb-2">
                $49-199
              </div>
              <div className="text-gray-600">
                Monthly subscription cost
              </div>
            </div>
          </div>
        </Card>

        {/* FAQ */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <Card key={idx} variant="elevated" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Optimize Your Portfolio?
          </h2>
          <Link to="/auth?type=landlord&mode=signup&plan=professional">
            <Button size="xl" className="bg-gradient-to-r from-blue-600 to-purple-600">
              Start Free Trial - No Credit Card Required
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-gray-500 mt-4">
            Join 500+ landlords maximizing their rental income
          </p>
        </div>
      </div>
    </div>
  );
}
