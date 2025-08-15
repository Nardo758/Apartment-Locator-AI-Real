import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, HelpCircle, MessageCircle, Book, Video, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Help: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      id: 'getting-started',
      question: 'How do I get started with ApartmentIQ?',
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
      description: 'Learn the basics of using ApartmentIQ',
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="gap-2"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <HelpCircle className="text-primary" size={20} />
                <h1 className="text-xl font-semibold text-foreground">
                  Help & Support
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  placeholder="Search for help articles, FAQs, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Help Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {helpCategories.map((category) => (
              <Card key={category.title} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <category.icon className="text-primary" size={24} />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{category.description}</p>
                  <ul className="space-y-1">
                    {category.topics.map((topic, index) => (
                      <li key={index} className="text-sm text-muted-foreground">• {topic}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No results found for "{searchQuery}". Try different keywords or browse our help categories above.
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail size={20} />
                Still Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Can't find what you're looking for? Our support team is here to help you get the most out of ApartmentIQ.
              </p>
              <div className="flex gap-4">
                <Button onClick={() => navigate('/contact')} className="gap-2">
                  <MessageCircle size={16} />
                  Contact Support
                </Button>
                <Button variant="outline" className="gap-2">
                  <Video size={16} />
                  Schedule Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Help;