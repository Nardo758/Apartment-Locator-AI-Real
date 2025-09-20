import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { designSystem } from '@/lib/design-system';
import ModernPageLayout from '@/components/modern/ModernPageLayout';
import ModernCard from '@/components/modern/ModernCard';

const PrivacyPolicy: React.FC = () => {
  const privacySections = [
    {
      title: "1. Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.",
      details: {
        personal: ["Name, email address, and contact information", "Housing preferences and search criteria", "Budget and income information (encrypted)", "Location and commute preferences"],
        usage: ["Search queries and property interactions", "Feature usage and click patterns", "Device information and IP address", "Browser type and operating system"]
      }
    },
    {
      title: "2. How We Use Your Information",
      content: "We use the information we collect to:",
      list: ["Provide personalized property recommendations", "Generate AI-powered rental offers and market insights", "Improve our algorithms and service quality", "Communicate with you about your account and services", "Process payments and manage subscriptions", "Comply with legal obligations and prevent fraud"]
    },
    {
      title: "3. Information Sharing",
      content: "We do not sell, trade, or rent your personal information to third parties. We may share your information only in these limited circumstances:",
      list: ["With your consent: When you explicitly authorize us to share information", "Service providers: Third-party companies that help us operate our service", "Legal requirements: When required by law or to protect our rights and safety", "Business transfers: In connection with a merger, acquisition, or sale of assets"]
    },
    {
      title: "4. Data Security", 
      content: "We implement industry-standard security measures to protect your information:",
      list: ["Encryption of sensitive data in transit and at rest", "Regular security audits and vulnerability assessments", "Access controls and authentication requirements", "Secure data centers with physical access controls", "Employee training on data privacy and security"]
    },
    {
      title: "5. Your Rights and Choices",
      content: "You have the following rights regarding your personal information:",
      list: ["Access: Request a copy of the personal information we hold about you", "Correction: Update or correct inaccurate information", "Deletion: Request deletion of your personal information", "Portability: Request a machine-readable copy of your data", "Opt-out: Unsubscribe from marketing communications"]
    },
    {
      title: "6. Contact Us",
      content: "If you have any questions about this privacy policy or our data practices, please contact us at:",
      contact: {
        email: "privacy@apartmentlocatorai.com",
        address: "123 Tech Street, San Francisco, CA 94105",
        phone: "(555) 123-4567"
      }
    }
  ];

  return (
    <ModernPageLayout
      title="Privacy Policy"
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
      {/* Privacy Notice */}
      <ModernCard className={`${designSystem.animations.entrance} mb-8`} gradient>
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/20">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className={`${designSystem.typography.subheadingLarge} mb-2`}>
              Your Privacy Matters
            </h2>
            <p className={designSystem.typography.body}>
              We are committed to protecting your personal information and being transparent about how we collect, use, and share your data.
            </p>
          </div>
        </div>
      </ModernCard>

      {/* Privacy Content */}
      <div className={designSystem.spacing.content}>
        {privacySections.map((section, index) => (
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
              
              {section.details && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Personal Information:</h3>
                    <ul className={`${designSystem.spacing.small} ml-6`}>
                      {section.details.personal.map((item, i) => (
                        <li key={i} className={`${designSystem.typography.body} list-disc`}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Usage Information:</h3>
                    <ul className={`${designSystem.spacing.small} ml-6`}>
                      {section.details.usage.map((item, i) => (
                        <li key={i} className={`${designSystem.typography.body} list-disc`}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
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
                    <p className="font-medium">Phone: {section.contact.phone}</p>
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
          <Link to="/terms">
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              Terms of Service
            </Button>
          </Link>
          <Link to="/contact">
            <Button className={`${designSystem.buttons.primary} gap-2`}>
              <Shield className="w-4 h-4" />
              Contact Privacy Team
            </Button>
          </Link>
        </div>
      </ModernCard>
    </ModernPageLayout>
  );
};

export default PrivacyPolicy;