import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

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
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft size={16} />
                Back to Home
              </Button>
              <div className="flex items-center gap-2">
                <Shield className="text-primary" size={20} />
                <h1 className="text-xl font-semibold text-foreground">
                  Privacy Policy
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground">
              Last updated: August 15, 2024
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-3">1. Information We Collect</h2>
              <p className="text-muted-foreground mb-3">
                We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
              </p>
              
              <h3 className="font-medium mb-2">Personal Information:</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Name, email address, and contact information</li>
                <li>Housing preferences and search criteria</li>
                <li>Budget and income information (encrypted)</li>
                <li>Location and commute preferences</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="font-medium mb-2 mt-4">Usage Information:</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Search queries and property interactions</li>
                <li>Feature usage and click patterns</li>
                <li>Device information and IP address</li>
                <li>Browser type and operating system</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">2. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Provide personalized property recommendations</li>
                <li>Generate AI-powered rental offers and market insights</li>
                <li>Improve our algorithms and service quality</li>
                <li>Communicate with you about your account and services</li>
                <li>Process payments and manage subscriptions</li>
                <li>Comply with legal obligations and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">3. Information Sharing</h2>
              <p className="text-muted-foreground mb-3">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in these limited circumstances:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>With your consent:</strong> When you explicitly authorize us to share information</li>
                <li><strong>Service providers:</strong> Third-party companies that help us operate our service (payment processors, analytics providers)</li>
                <li><strong>Legal requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">4. Data Security</h2>
              <p className="text-muted-foreground mb-3">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure data centers with physical access controls</li>
                <li>Employee training on data privacy and security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">5. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. When you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal purposes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">6. Your Rights and Choices</h2>
              <p className="text-muted-foreground mb-3">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a machine-readable copy of your data</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">7. Cookies and Tracking</h2>
              <p className="text-muted-foreground mb-3">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Remember your preferences and settings</li>
                <li>Analyze usage patterns and improve our service</li>
                <li>Provide personalized content and recommendations</li>
                <li>Enable social media features and integrations</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">8. Third-Party Services</h2>
              <p className="text-muted-foreground">
                Our service may contain links to third-party websites or integrate with third-party services. This privacy policy applies only to ApartmentIQ. We are not responsible for the privacy practices of third-party services and encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">9. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our service is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you become aware that a child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">10. International Data Transfers</h2>
              <p className="text-muted-foreground">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">11. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">12. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this privacy policy or our data practices, please contact us at:
              </p>
              <div className="mt-2 text-muted-foreground">
                <p>Email: privacy@apartmentiq.com</p>
                <p>Address: 123 Tech Street, San Francisco, CA 94105</p>
                <p>Phone: (555) 123-4567</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PrivacyPolicy;