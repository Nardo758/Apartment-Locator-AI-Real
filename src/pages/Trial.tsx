import React, { useState, useEffect } from 'react';
import { useTrialManager, TeaserIntelligence } from '@/hooks/useTrialManager';
import { TrialSignup } from '@/components/trial/TrialSignup';
import { TrialStatus } from '@/components/trial/TrialStatus';
import { ApartmentSearchForm } from '@/components/trial/ApartmentSearchForm';
import { ApartmentListings } from '@/components/trial/ApartmentListings';
import { ApartmentDetailModal } from '@/components/trial/ApartmentDetailModal';
import { UpgradeModal } from '@/components/trial/UpgradeModal';
import { mockApartments, filterApartments, sortApartments, ApartmentListing } from '@/data/mockApartments';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Trial: React.FC = () => {
  const {
    trialStatus,
    isExpired,
    initializeTrial,
    canMakeSearch,
    recordSearch,
    markUpgradePromptSeen,
    getTimeRemaining,
    shouldShowUpgradePrompt,
    convertToTeaserData
  } = useTrialManager();

  const [searchData, setSearchData] = useState<{
    location: string;
    minRent: number;
    maxRent: number;
    bedrooms?: number;
    bathrooms?: number;
    moveInTimeline: string;
  } | null>(null);

  const [apartments, setApartments] = useState<ApartmentListing[]>([]);
  const [selectedApartment, setSelectedApartment] = useState<ApartmentListing | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle apartment search
  const handleSearch = (data: {
    location: string;
    minRent: number;
    maxRent: number;
    bedrooms?: number;
    bathrooms?: number;
    moveInTimeline: string;
  }) => {
    if (!canMakeSearch()) {
      setShowUpgradeModal(true);
      return;
    }

    if (recordSearch()) {
      setLoading(true);
      setSearchData(data);
      
      // Simulate API call and filter apartments
      setTimeout(() => {
        const filtered = filterApartments(mockApartments, {
          location: data.location,
          minRent: data.minRent,
          maxRent: data.maxRent,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms
        });
        
        const sorted = sortApartments(filtered, 'best_leverage');
        setApartments(sorted);
        setLoading(false);
      }, 1500);
    }
  };

  const timeRemaining = getTimeRemaining();

  // Handle trial signup
  const handleTrialSignup = (email: string) => {
    initializeTrial(email);
  };

  // Handle apartment click
  const handleApartmentClick = (apartment: ApartmentListing) => {
    setSelectedApartment(apartment);
    setShowDetailModal(true);
  };

  // Handle sorting
  const handleSort = (sortBy: string) => {
    const sorted = sortApartments(apartments, sortBy);
    setApartments(sorted);
  };


  // Auto-show upgrade modal when appropriate
  useEffect(() => {
    if (trialStatus && shouldShowUpgradePrompt() && !trialStatus.hasSeenUpgradePrompt && apartments.length > 0) {
      setShowUpgradeModal(true);
      markUpgradePromptSeen();
    }
  }, [trialStatus, shouldShowUpgradePrompt, markUpgradePromptSeen, apartments.length]);

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
              Find <span className="gradient-text">Smart Apartments</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover apartments with built-in negotiation advantages and savings potential. 
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Search Form */}
          <div className="lg:col-span-1">
            <ApartmentSearchForm
              onSearch={handleSearch}
              canMakeSearch={canMakeSearch()}
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
                  <span className="text-muted-foreground">Searches Used:</span>
                  <span className="text-foreground">{trialStatus.searchesUsed}/{trialStatus.searchesLimit}</span>
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
          <div className="lg:col-span-3">
            {loading && (
              <div className="glass-dark rounded-xl p-8 border border-white/10 text-center">
                <div className="animate-pulse space-y-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto"></div>
                  <h3 className="text-lg font-semibold text-foreground">Finding Apartments...</h3>
                  <p className="text-muted-foreground">
                    Searching for apartments with negotiation advantages in your area
                  </p>
                </div>
              </div>
            )}

            {apartments.length > 0 && !loading && (
              <ApartmentListings
                apartments={apartments}
                onApartmentClick={handleApartmentClick}
                onUpgrade={() => setShowUpgradeModal(true)}
                onSort={handleSort}
              />
            )}

            {apartments.length === 0 && !loading && searchData && (
              <div className="glass-dark rounded-xl p-8 border border-white/10 text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">No Apartments Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria to find apartments with negotiation potential
                </p>
              </div>
            )}

            {!searchData && !loading && (
              <div className="glass-dark rounded-xl p-8 border border-white/10 text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Find Apartments</h3>
                <p className="text-muted-foreground">
                  Enter your search criteria to discover apartments with built-in negotiation advantages
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Apartment Detail Modal */}
      <ApartmentDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        apartment={selectedApartment}
        onUpgrade={() => {
          setShowDetailModal(false);
          setShowUpgradeModal(true);
        }}
      />

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          intelligence={{
            leverageScore: 80,
            savingsRange: { min: 200, max: 500 },
            opportunityLevel: 'HIGH',
            insightsCount: 3,
            advantages: {
              hasTimingAdvantage: true,
              hasSeasonalAdvantage: true,
              marketCondition: 'Favorable',
              hasOwnershipAdvantage: true
            },
            blurredInsights: [],
            potentialSavings: 400
          }}
          trialStatus={trialStatus}
          timeRemaining={timeRemaining}
        />
      )}
    </div>
  );
};

export default Trial;