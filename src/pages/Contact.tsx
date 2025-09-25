import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, Phone, Send, Clock, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { designSystem } from '@/lib/design-system';
import ModernPageLayout from '@/components/modern/ModernPageLayout';
import GradientSection from '@/components/modern/GradientSection';
import ModernCard from '@/components/modern/ModernCard';

const Contact: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({ name: '', email: '', subject: '', category: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email',
      detail: 'support@apartmentlocatorai.com',
      response: 'Response within 24 hours',
      color: 'text-blue-600'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our team',
      detail: 'Available 9 AM - 6 PM PST',
      response: 'Instant responses',
      color: 'text-green-600'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak with an expert',
      detail: '(555) 123-4567',
      response: 'Mon-Fri, 9 AM - 6 PM PST',
      color: 'text-purple-600'
    }
  ];

  return (
    <ModernPageLayout
      title="Contact Us"
      subtitle="We're here to help you find the perfect apartment with our AI-powered platform"
      headerContent={
        <Link to="/">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft size={16} />
            Back to Home
          </Button>
        </Link>
      }
    >
      {/* Contact Methods */}
      <div className={`${designSystem.layouts.gridThree} ${designSystem.spacing.marginLarge}`}>
        {contactMethods.map((method, index) => (
          <ModernCard
            key={method.title}
            animate
            animationDelay={index * 100}
            hover
            className="text-center"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className={`p-4 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20`}>
                <method.icon className={`${designSystem.icons.large} ${method.color}`} />
              </div>
              <div>
                <h3 className={`${designSystem.typography.subheadingLarge} mb-2`}>
                  {method.title}
                </h3>
                <p className={`${designSystem.typography.body} mb-3`}>
                  {method.description}
                </p>
                <p className={`font-medium ${designSystem.colors.dark} mb-2`}>
                  {method.detail}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className={designSystem.colors.muted}>
                    {method.response}
                  </span>
                </div>
              </div>
            </div>
          </ModernCard>
        ))}
      </div>

      {/* Contact Form */}
      <GradientSection variant="feature" className="mt-20">
        <div className="max-w-2xl mx-auto">
          <ModernCard title="Send us a Message" icon={<Send className="w-6 h-6 text-blue-600" />}>
            <form onSubmit={handleSubmit} className={designSystem.spacing.content}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="billing">Billing Question</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description of your inquiry"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please provide detailed information about your inquiry..."
                  rows={6}
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className={`w-full gap-2 ${designSystem.buttons.primary}`}
              >
                <Send size={16} />
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </ModernCard>
        </div>
      </GradientSection>

      {/* Additional Help */}
      <GradientSection variant="content" className="mt-20">
        <div className="max-w-2xl mx-auto">
          <ModernCard className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <Headphones className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className={`${designSystem.typography.subheadingLarge} mb-2`}>
                Need immediate assistance?
              </h3>
              <p className={`${designSystem.typography.body} mb-4`}>
                Check out our Help Center for instant answers to common questions.
              </p>
              <Link to="/help">
                <Button variant="outline" className="gap-2">
                  Visit Help Center
                </Button>
              </Link>
            </div>
          </ModernCard>
        </div>
      </GradientSection>
    </ModernPageLayout>
  );
};

export default Contact;