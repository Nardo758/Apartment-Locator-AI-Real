import React, { useState, useEffect } from 'react';
import { useTrialManager, TeaserIntelligence } from '@/hooks/useTrialManager';
import { useUnifiedRentalIntelligence } from '@/hooks/useUnifiedRentalIntelligence';
import { TrialSignup } from '@/components/trial/TrialSignup';
import { TrialStatus } from '@/components/trial/TrialStatus';
import { PropertySearchForm } from '@/components/trial/PropertySearchForm';
import { TeaserDashboard } from '@/components/trial/TeaserDashboard';
import { UpgradeModal } from '@/components/trial/UpgradeModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Trial: React.FC = () => {
  const {
    trialStatus,
    isExpired,
    initializeTrial,
    canMakeQuery,
    recordQuery,
    markUpgradePromptSeen,
    getTimeRemaining,
    shouldShowUpgradePrompt,
    convertToTeaserData
  } = useTrialManager();

  const [searchData, setSearchData] = useState<{
    location: string;
    currentRent: number;
    propertyValue: number;
  } | null>(null);

  const [teaserIntelligence, setTeaserIntelligence] = useState<TeaserIntelligence | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Use the intelligence hook when we have search data
  const { intelligence, loading, error } = useUnifiedRentalIntelligence(
    searchData?.location || '',
    searchData?.currentRent || 0,
    searchData?.propertyValue || 0
  );

  const timeRemaining = getTimeRemaining();

  // Handle trial signup
  const handleTrialSignup = (email: string) => {
    initializeTrial(email);
  };

  // Handle property analysis
  const handleAnalyze = (data: { location: string; currentRent: number; propertyValue: number }) => {
    if (!canMakeQuery()) {
      setShowUpgradeModal(true);
      return;
    }

    if (recordQuery()) {
      setSearchData(data);
    }
  };

  // Convert full intelligence to teaser when available
  useEffect(() => {
    if (intelligence && !loading && !error) {
      const teaser = convertToTeaserData(intelligence);
      setTeaserIntelligence(teaser);
    }
  }, [intelligence, loading, error, convertToTeaserData]);

  // Auto-show upgrade modal when appropriate
  useEffect(() => {
    if (trialStatus && shouldShowUpgradePrompt() && !trialStatus.hasSeenUpgradePrompt) {
      setShowUpgradeModal(true);
      markUpgradePromptSeen();
    }
  }, [trialStatus, shouldShowUpgradePrompt, markUpgradePromptSeen]);

  // Show signup if no trial exists
  if (!trialStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Try <span className="gradient-text">ApartmentIQ</span> Free
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover hidden rental opportunities with AI-powered negotiation intelligence. 
              No credit card required.
            </p>
          </div>
          
          <TrialSignup onSignupComplete={handleTrialSignup} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-muted/20 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold gradient-text">
                ApartmentIQ
              </Link>
              <span className="text-sm text-muted-foreground">Free Trial</span>
            </div>
            <div className="flex items-center space-x-4">
              <TrialStatus
                trialStatus={trialStatus}
                timeRemaining={timeRemaining}
                onUpgrade={() => setShowUpgradeModal(true)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Search Form */}
          <div className="lg:col-span-1">
            <PropertySearchForm
              onAnalyze={handleAnalyze}
              canMakeQuery={canMakeQuery()}
              isLoading={loading}
            />

            {/* Trial Info */}
            <div className="mt-6 glass-dark rounded-xl p-4 border border-white/10">
              <h4 className="font-semibold text-foreground mb-2">Your Trial Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-foreground">{trialStatus.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Queries Used:</span>
                  <span className="text-foreground">{trialStatus.queriesUsed}/{trialStatus.queriesLimit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Left:</span>
                  <span className="text-foreground">
                    {timeRemaining.hours > 0 ? `${timeRemaining.hours} hours` : 'Expired'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            {loading && (
              <div className="glass-dark rounded-xl p-8 border border-white/10 text-center">
                <div className="animate-pulse space-y-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto"></div>
                  <h3 className="text-lg font-semibold text-foreground">Analyzing Property...</h3>
                  <p className="text-muted-foreground">
                    Our AI is processing market data and generating your negotiation intelligence
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="glass-dark rounded-xl p-8 border border-destructive/20 text-center">
                <h3 className="text-lg font-semibold text-destructive mb-2">Analysis Failed</h3>
                <p className="text-muted-foreground">{error}</p>
                <Button 
                  onClick={() => setSearchData(null)} 
                  className="mt-4"
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            )}

            {teaserIntelligence && !loading && !error && (
              <TeaserDashboard
                intelligence={teaserIntelligence}
                onUpgrade={() => setShowUpgradeModal(true)}
              />
            )}

            {!teaserIntelligence && !loading && !error && (
              <div className="glass-dark rounded-xl p-8 border border-white/10 text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Analyze</h3>
                <p className="text-muted-foreground">
                  Enter a property location and details to get started with your AI-powered analysis
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && teaserIntelligence && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          intelligence={teaserIntelligence}
          trialStatus={trialStatus}
          timeRemaining={timeRemaining}
        />
      )}
    </div>
  );
};

export default Trial;