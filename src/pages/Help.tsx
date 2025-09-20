import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, HelpCircle, MessageCircle, Book, Video, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { designSystem } from '@/lib/design-system';
import ModernPageLayout from '@/components/modern/ModernPageLayout';
import ModernCard from '@/components/modern/ModernCard';

const Help: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      id: 'getting-started',
      question: 'How do I get started with Apartment Locator AI?',
      answer: 'Getting started is easy! Sign up for an account, complete your housing preferences, and our AI will immediately begin analyzing properties that match your criteria. You can start browsing recommendations right away.'
    },
    {
      id: 'ai-recommendations',
      question: 'How does the AI property recommendation work?',
      answer: 'Our AI analyzes over 200 data points including your preferences, budget, lifestyle, commute requirements, and market conditions to recommend properties that best match your needs. The algorithm learns from your interactions to improve recommendations over time.'
    },
    {
      id: 'offer-generation',
      question: 'What is AI offer generation?',
      answer: 'Our AI analyzes market data, property specifics, and your profile to generate competitive rental offers. It considers factors like market rent, property condition, lease terms, and negotiation opportunities to create offers that maximize your chances of approval.'
    },
    {
      id: 'pricing',
      question: 'What are the different pricing plans?',
      answer: 'We offer three plans: Basic ($27/month) with 50 searches and 10 offers, Pro ($47/month) with 150 searches and 25 offers, and Premium ($97/month) with unlimited searches and 50 offers. All plans include market intelligence and AI recommendations.'
    },
    {
      id: 'search-limits',
      question: 'What happens when I reach my search limit?',
      answer: 'When you reach your monthly search limit, you can either wait for the next billing cycle or upgrade your plan for immediate access to more searches. We\'ll send you notifications as you approach your limit.'
    },
    {
      id: 'market-intel',
      question: 'What kind of market intelligence do you provide?',
      answer: 'Our market intelligence includes rental trends, neighborhood analysis, leverage scores, ownership analysis, price predictions, and investment opportunities. This data helps you make informed decisions about where and when to rent.'
    },
    {
      id: 'data-accuracy',
      question: 'How accurate is your property data?',
      answer: 'We aggregate data from multiple reliable sources including MLS, property management companies, and public records. Our data is updated in real-time and verified through automated quality checks to ensure accuracy.'
    },
    {
      id: 'saved-properties',
      question: 'How do I save and organize properties?',
      answer: 'Click the heart icon on any property card to save it to your favorites. You can view all saved properties in the "Saved Properties" section and organize them with notes and comparisons.'
    }
  ];

  const helpCategories = [
    {
      title: 'Getting Started',
      icon: Book,
      description: 'Learn the basics of using Apartment Locator AI',
      topics: ['Account setup', 'Profile configuration', 'First search']
    },
    {
      title: 'AI Features',
      icon: HelpCircle,
      description: 'Understanding our AI-powered tools',
      topics: ['Recommendations', 'Offer generation', 'Market analysis']
    },
    {
      title: 'Video Tutorials',
      icon: Video,
      description: 'Watch step-by-step guides',
      topics: ['Platform walkthrough', 'Advanced features', 'Tips & tricks']
    },
    {
      title: 'Contact Support',
      icon: MessageCircle,
      description: 'Get direct help from our team',
      topics: ['Live chat', 'Email support', 'Phone support']
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ModernPageLayout
      title="Help & Support"
      subtitle="Find answers to common questions and get the help you need"
      headerContent={
        <Link to="/">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft size={16} />
            Back to Home
          </Button>
        </Link>
      }
    >
      {/* Search */}
      <ModernCard className={`${designSystem.animations.entrance} mb-8`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Search for help articles, FAQs, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </ModernCard>

      {/* Help Categories */}
      <div className={`${designSystem.layouts.gridTwo} mb-12`}>
        {helpCategories.map((category, index) => (
          <ModernCard
            key={category.title}
            title={category.title}
            icon={<category.icon className="w-6 h-6 text-blue-600" />}
            animate
            animationDelay={index * 100}
            hover
            className="cursor-pointer"
          >
            <div>
              <p className={`${designSystem.typography.body} mb-3`}>{category.description}</p>
              <ul className={designSystem.spacing.small}>
                {category.topics.map((topic, index) => (
                  <li key={index} className={`text-sm ${designSystem.colors.muted}`}>• {topic}</li>
                ))}
              </ul>
            </div>
          </ModernCard>
        ))}
      </div>

      {/* FAQ Section */}
      <ModernCard title="Frequently Asked Questions" className="mb-8">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-8">
            <div className={`${designSystem.typography.body} mb-4`}>
              No results found for "{searchQuery}"
            </div>
            <p className={designSystem.colors.muted}>
              Try different keywords or browse our help categories above.
            </p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className={designSystem.colors.muted}>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </ModernCard>

      {/* Contact Support */}
      <ModernCard 
        title="Still Need Help?"
        icon={<Mail className="w-6 h-6 text-blue-600" />}
      >
        <div className={designSystem.spacing.content}>
          <p className={designSystem.typography.body}>
            Can't find what you're looking for? Our support team is here to help you get the most out of Apartment Locator AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/contact">
              <Button className={`${designSystem.buttons.primary} gap-2`}>
                <MessageCircle size={16} />
                Contact Support
              </Button>
            </Link>
            <Button variant="outline" className="gap-2">
              <Video size={16} />
              Schedule Demo
            </Button>
          </div>
        </div>
      </ModernCard>
    </ModernPageLayout>
  );
};

export default Help;