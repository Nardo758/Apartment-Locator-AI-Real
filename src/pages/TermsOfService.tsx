import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Scale, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { designSystem } from '@/lib/design-system';
import ModernPageLayout from '@/components/modern/ModernPageLayout';
import ModernCard from '@/components/modern/ModernCard';

const TermsOfService: React.FC = () => {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using Apartment Locator AI (\"the Service\"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
    },
    {
      title: "2. Description of Service", 
      content: "Apartment Locator AI is an AI-powered rental property discovery and analysis platform that provides:",
      list: [
        "Property recommendations based on user preferences",
        "Market intelligence and rental data analysis", 
        "AI-generated rental offers and negotiation assistance",
        "Property comparison and evaluation tools"
      ]
    },
    {
      title: "3. User Accounts",
      content: "To access certain features of the Service, you must register for an account. You agree to:",
      list: [
        "Provide accurate, current, and complete information",
        "Maintain and update your account information",
        "Keep your login credentials secure and confidential", 
        "Accept responsibility for all activities under your account"
      ]
    },
    {
      title: "4. Subscription and Payment",
      content: "Apartment Locator AI offers subscription-based access to premium features:",
      list: [
        "Subscriptions are billed monthly or annually as selected",
        "Payments are processed securely through third-party payment processors",
        "Refunds are handled on a case-by-case basis",
        "You may cancel your subscription at any time"
      ]
    },
    {
      title: "5. Use Guidelines",
      content: "You agree not to:",
      list: [
        "Use the Service for any unlawful purpose or activity",
        "Attempt to gain unauthorized access to our systems",
        "Share your account credentials with others",
        "Use automated scripts or bots to access the Service",
        "Reverse engineer or attempt to copy our algorithms"
      ]
    },
    {
      title: "6. Data and Privacy",
      content: "Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference."
    },
    {
      title: "7. AI-Generated Content",
      content: "Apartment Locator AI uses artificial intelligence to generate recommendations and offers. While we strive for accuracy:",
      list: [
        "AI-generated content is for informational purposes only",
        "We do not guarantee the accuracy of AI recommendations",
        "Users should verify all information independently",
        "Final rental decisions remain the user's responsibility"
      ]
    },
    {
      title: "8. Intellectual Property",
      content: "The Service and its original content, features, and functionality are owned by Apartment Locator AI and are protected by international copyright, trademark, and other intellectual property laws."
    },
    {
      title: "9. Disclaimers and Limitations", 
      content: "THE SERVICE IS PROVIDED \"AS IS\" WITHOUT WARRANTIES OF ANY KIND. We disclaim all warranties, express or implied, including but not limited to implied warranties of merchantability and fitness for a particular purpose."
    },
    {
      title: "10. Termination",
      content: "We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or the Service."
    },
    {
      title: "11. Changes to Terms",
      content: "We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or through the Service. Continued use of the Service after such modifications constitutes acceptance of the updated Terms."
    },
    {
      title: "12. Contact Information",
      content: "If you have any questions about these Terms, please contact us at:",
      contact: {
        email: "legal@apartmentlocatorai.com",
        address: "123 Tech Street, San Francisco, CA 94105"
      }
    }
  ];

  return (
    <ModernPageLayout
      title="Terms of Service"
      subtitle="Last updated: August 15, 2024"
      headerContent={
        <Link to="/">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft size={16} />
            Back to Home
          </Button>
        </Link>
      }
    >
      {/* Legal Notice */}
      <ModernCard className={`${designSystem.animations.entrance} mb-8`} gradient>
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Scale className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className={`${designSystem.typography.subheadingLarge} mb-2`}>
              Legal Agreement
            </h2>
            <p className={designSystem.typography.body}>
              Please read these terms carefully before using our service. By using Apartment Locator AI, you agree to these terms and conditions.
            </p>
          </div>
        </div>
      </ModernCard>

      {/* Terms Content */}
      <div className={designSystem.spacing.content}>
        {sections.map((section, index) => (
          <ModernCard
            key={section.title}
            animate
            animationDelay={index * 50}
            className="mb-6"
          >
            <div className={designSystem.spacing.content}>
              <h2 className={`${designSystem.typography.subheadingLarge} mb-4`}>
                {section.title}
              </h2>
              
              <p className={`${designSystem.typography.body} mb-4`}>
                {section.content}
              </p>
              
              {section.list && (
                <ul className={`${designSystem.spacing.small} ml-6`}>
                  {section.list.map((item, i) => (
                    <li key={i} className={`${designSystem.typography.body} list-disc`}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              
              {section.contact && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                  <div className={designSystem.spacing.small}>
                    <p className="font-medium">Email: {section.contact.email}</p>
                    <p className="font-medium">Address: {section.contact.address}</p>
                  </div>
                </div>
              )}
            </div>
          </ModernCard>
        ))}
      </div>

      {/* Footer Actions */}
      <ModernCard className="mt-12 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/privacy">
            <Button variant="outline" className="gap-2">
              <Shield className="w-4 h-4" />
              Privacy Policy
            </Button>
          </Link>
          <Link to="/contact">
            <Button className={`${designSystem.buttons.primary} gap-2`}>
              <FileText className="w-4 h-4" />
              Contact Legal Team
            </Button>
          </Link>
        </div>
      </ModernCard>
    </ModernPageLayout>
  );
};

export default TermsOfService;