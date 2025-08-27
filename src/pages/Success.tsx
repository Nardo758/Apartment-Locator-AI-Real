import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home, ArrowRight } from 'lucide-react';

const Success = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Clear any trial data since user has made a purchase
    localStorage.removeItem('apartmentiq_trial_data');
  }, []);

  return (
    <div className="min-h-screen bg-background animated-bg flex items-center justify-center p-4">
      <Card className="glass max-w-2xl w-full">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
          <CardTitle className="text-3xl font-bold gradient-text">
            🎉 Payment Successful!
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Welcome to AI Apartment Locator! Your payment has been processed successfully.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {sessionId && (
            <div className="bg-muted/20 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Session ID</div>
              <div className="font-mono text-sm break-all">{sessionId}</div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">What happens next?</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-semibold text-xs">1</span>
                </div>
                <div>
                  <div className="font-medium text-foreground">Access Your Dashboard</div>
                  <div>Start using AI-powered apartment hunting tools immediately</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-semibold text-xs">2</span>
                </div>
                <div>
                  <div className="font-medium text-foreground">Set Your Preferences</div>
                  <div>Configure your search criteria and AI assistant</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-semibold text-xs">3</span>
                </div>
                <div>
                  <div className="font-medium text-foreground">Start Finding Apartments</div>
                  <div>Let AI analyze properties and help you negotiate better deals</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="btn-primary flex-1" size="lg">
              <Link to="/dashboard">
                <ArrowRight className="w-4 h-4 mr-2" />
                Start Using AI Apartment Locator
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1" size="lg">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Return to Home
              </Link>
            </Button>
          </div>

          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@apartmentlocatorai.com" className="text-primary hover:underline">
                support@apartmentlocatorai.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;