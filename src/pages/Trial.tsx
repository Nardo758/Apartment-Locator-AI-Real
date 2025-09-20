import React, { useState, useEffect } from 'react';
import { useTrialManager, TeaserIntelligence } from '@/hooks/useTrialManager';
import { TrialSignup } from '@/components/trial/TrialSignup';
import { TrialStatus } from '@/components/trial/TrialStatus';
import { ApartmentSearchForm } from '@/components/trial/ApartmentSearchForm';
import { ApartmentListings } from '@/components/trial/ApartmentListings';
import { ApartmentDetailModal } from '@/components/trial/ApartmentDetailModal';
import { UpgradeModal } from '@/components/trial/UpgradeModal';
import { AutoUpgradeModal } from '@/components/trial/AutoUpgradeModal';
import { useAutoUpgradeTriggers } from '@/hooks/useAutoUpgradeTriggers';
import { mockApartments, filterApartments, sortApartments, ApartmentListing } from '@/data/mockApartments';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, Search, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { designSystem } from '@/lib/design-system';
import ModernCard from '@/components/modern/ModernCard';

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

  // Auto-upgrade triggers
  const {
    activeModal,
    closeModal,
    triggerHighValueModal,
    trackPremiumClick
  } = useAutoUpgradeTriggers(trialStatus);

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

  // Handle manual upgrade button clicks
  const handleManualUpgrade = () => {
    setShowUpgradeModal(true);
  };

  // Handle upgrade from auto-modal
  const handleAutoUpgrade = () => {
    // Close auto modal and show regular upgrade flow
    closeModal();
    setShowUpgradeModal(true);
  };


  // Auto-show upgrade modal when appropriate (reduced frequency due to auto-triggers)
  useEffect(() => {
    if (trialStatus && shouldShowUpgradePrompt() && !trialStatus.hasSeenUpgradePrompt && apartments.length > 0) {
      // Only show manual modal if no auto-modal is active
      if (!activeModal) {
        setShowUpgradeModal(true);
        markUpgradePromptSeen();
      }
    }
  }, [trialStatus, shouldShowUpgradePrompt, markUpgradePromptSeen, apartments.length, activeModal]);

  const trialFeatures = [
    {
      icon: Search,
      title: "AI-Powered Search",
      description: "Find hidden opportunities with advanced algorithms"
    },
    {
      icon: TrendingUp,
      title: "Leverage Analysis",
      description: "Discover properties with negotiation advantages"
    },
    {
      icon: DollarSign,
      title: "Savings Potential",
      description: "See exact savings estimates for each property"
    }
  ];

  // Show signup if no trial exists
  if (!trialStatus) {
    return (
      <div className={`${designSystem.backgrounds.page} ${designSystem.backgrounds.pageDark} flex items-center justify-center p-6`}>
        <div className="w-full max-w-6xl">
          {/* Back Link */}
          <div className="mb-8">
            <Link to="/" className={`inline-flex items-center space-x-2 ${designSystem.colors.muted} hover:text-foreground ${designSystem.animations.transition} mb-6`}>
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Features */}
            <div className={`${designSystem.animations.entrance} space-y-8`}>
              <div>
                <h1 className={`${designSystem.typography.hero} mb-4`}>
                  Find <span className={designSystem.typography.heroGradient}>Smart Apartments</span>
                </h1>
                <p className={`${designSystem.typography.bodyLarge} mb-8`}>
                  Discover apartments with built-in negotiation advantages and savings potential. 
                  No credit card required.
                </p>
              </div>

              <div className={designSystem.spacing.content}>
                {trialFeatures.map((feature, index) => (
                  <ModernCard
                    key={feature.title}
                    animate
                    animationDelay={index * 100}
                    hover
                    className="flex items-start gap-4"
                  >
                    <div className="p-3 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                      <feature.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className={`${designSystem.typography.subheadingLarge} mb-1`}>
                        {feature.title}
                      </h3>
                      <p className={designSystem.typography.body}>
                        {feature.description}
                      </p>
                    </div>
                  </ModernCard>
                ))}
              </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className={`${designSystem.animations.entrance}`} style={{ animationDelay: '300ms' }}>
              <TrialSignup onSignupComplete={handleTrialSignup} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${designSystem.backgrounds.page} ${designSystem.backgrounds.pageDark}`}>
      {/* Header */}
      <header className={`border-b border-white/10 ${designSystem.backgrounds.card} backdrop-blur-md sticky top-0 z-50`}>
        <div className={`${designSystem.layouts.container} py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className={`text-2xl font-bold ${designSystem.typography.headingGradient}`}>
                Apartment Locator AI
              </Link>
              <span className={`text-sm px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium`}>
                Free Trial
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <TrialStatus
                trialStatus={trialStatus}
                timeRemaining={timeRemaining}
                onUpgrade={handleManualUpgrade}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`${designSystem.layouts.container} ${designSystem.layouts.sectionSmall}`}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Search Form */}
          <div className="lg:col-span-1">
            <ApartmentSearchForm
              onSearch={handleSearch}
              canMakeSearch={canMakeSearch()}
              isLoading={loading}
            />

            {/* Trial Info */}
            <ModernCard 
              title="Your Trial Status" 
              icon={<Clock className="w-5 h-5 text-blue-600" />}
              className="mt-6"
            >
              <div className={`${designSystem.spacing.small} text-sm`}>
                <div className="flex justify-between">
                  <span className={designSystem.colors.muted}>Email:</span>
                  <span className={designSystem.colors.dark}>{trialStatus.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className={designSystem.colors.muted}>Searches Used:</span>
                  <span className={designSystem.colors.dark}>{trialStatus.searchesUsed}/{trialStatus.searchesLimit}</span>
                </div>
                <div className="flex justify-between">
                  <span className={designSystem.colors.muted}>Time Left:</span>
                  <span className={`font-medium ${timeRemaining.hours > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {timeRemaining.hours > 0 ? `${timeRemaining.hours} hours` : 'Expired'}
                  </span>
                </div>
              </div>
            </ModernCard>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-3">
            {loading && (
              <ModernCard className="text-center p-8">
                <div className="animate-pulse space-y-4">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mx-auto flex items-center justify-center">
                    <Search className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className={`${designSystem.typography.subheadingLarge} mb-2`}>Finding Apartments...</h3>
                  <p className={designSystem.typography.body}>
                    Searching for apartments with negotiation advantages in your area
                  </p>
                </div>
              </ModernCard>
            )}

            {apartments.length > 0 && !loading && (
              <ApartmentListings
                apartments={apartments}
                onApartmentClick={handleApartmentClick}
                onUpgrade={handleManualUpgrade}
                onHighValueClick={triggerHighValueModal}
                onSort={handleSort}
              />
            )}

            {apartments.length === 0 && !loading && searchData && (
              <ModernCard className="text-center p-8">
                <h3 className={`${designSystem.typography.subheadingLarge} mb-2`}>No Apartments Found</h3>
                <p className={designSystem.typography.body}>
                  Try adjusting your search criteria to find apartments with negotiation potential
                </p>
              </ModernCard>
            )}

            {!searchData && !loading && (
              <ModernCard className="text-center p-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <Search className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className={`${designSystem.typography.subheadingLarge} mb-2`}>Ready to Find Apartments</h3>
                  <p className={`${designSystem.typography.body} mb-4`}>
                    Enter your search criteria to discover apartments with built-in negotiation advantages
                  </p>
                  <Button
                    onClick={handleManualUpgrade}
                    className={`${designSystem.buttons.primary} gap-2`}
                  >
                    <Zap className="w-4 h-4" />
                    Upgrade for Unlimited Access
                  </Button>
                </div>
              </ModernCard>
            )}
          </div>
        </div>
      </main>

      {/* Auto-Upgrade Modal */}
      {activeModal && (
        <AutoUpgradeModal
          isOpen={true}
          trigger={activeModal.trigger}
          apartmentData={activeModal.data}
          onClose={closeModal}
          onUpgrade={handleAutoUpgrade}
          userEmail={trialStatus?.email || ''}
        />
      )}

      {/* Apartment Detail Modal */}
      <ApartmentDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        apartment={selectedApartment}
        onUpgrade={() => {
          setShowDetailModal(false);
          setShowUpgradeModal(true);
        }}
        onPremiumClick={trackPremiumClick}
      />

      {/* Manual Upgrade Modal */}
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