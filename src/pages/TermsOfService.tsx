import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsOfService: React.FC = () => {
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
                <FileText className="text-primary" size={20} />
                <h1 className="text-xl font-semibold text-foreground">
                  Terms of Service
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
            <CardTitle>Terms of Service</CardTitle>
            <p className="text-sm text-muted-foreground">
              Last updated: August 15, 2024
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using ApartmentIQ ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">2. Description of Service</h2>
              <p className="text-muted-foreground">
                ApartmentIQ is an AI-powered rental property discovery and analysis platform that provides:
              </p>
              <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
                <li>Property recommendations based on user preferences</li>
                <li>Market intelligence and rental data analysis</li>
                <li>AI-generated rental offers and negotiation assistance</li>
                <li>Property comparison and evaluation tools</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">3. User Accounts</h2>
              <p className="text-muted-foreground">
                To access certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Keep your login credentials secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">4. Subscription and Payment</h2>
              <p className="text-muted-foreground">
                ApartmentIQ offers subscription-based access to premium features:
              </p>
              <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
                <li>Subscriptions are billed monthly or annually as selected</li>
                <li>Payments are processed securely through third-party payment processors</li>
                <li>Refunds are handled on a case-by-case basis</li>
                <li>You may cancel your subscription at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">5. Use Guidelines</h2>
              <p className="text-muted-foreground">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
                <li>Use the Service for any unlawful purpose or activity</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Share your account credentials with others</li>
                <li>Use automated scripts or bots to access the Service</li>
                <li>Reverse engineer or attempt to copy our algorithms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">6. Data and Privacy</h2>
              <p className="text-muted-foreground">
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">7. AI-Generated Content</h2>
              <p className="text-muted-foreground">
                ApartmentIQ uses artificial intelligence to generate recommendations and offers. While we strive for accuracy:
              </p>
              <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
                <li>AI-generated content is for informational purposes only</li>
                <li>We do not guarantee the accuracy of AI recommendations</li>
                <li>Users should verify all information independently</li>
                <li>Final rental decisions remain the user's responsibility</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">8. Intellectual Property</h2>
              <p className="text-muted-foreground">
                The Service and its original content, features, and functionality are owned by ApartmentIQ and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">9. Disclaimers and Limitations</h2>
              <p className="text-muted-foreground">
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We disclaim all warranties, express or implied, including but not limited to implied warranties of merchantability and fitness for a particular purpose.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">10. Termination</h2>
              <p className="text-muted-foreground">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">11. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or through the Service. Continued use of the Service after such modifications constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">12. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="mt-2 text-muted-foreground">
                <p>Email: legal@apartmentiq.com</p>
                <p>Address: 123 Tech Street, San Francisco, CA 94105</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TermsOfService;