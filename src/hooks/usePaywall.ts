import { useState, useEffect, useCallback } from 'react';
import { logUserActionError } from '@/lib/errorLogger';
import { useUser } from '@/hooks/useUser';

/**
 * Paywall Hook
 *
 * Manages paywall triggers and tracking:
 * - Checks real subscription status from UserContext
 * - 3 property views limit for free users
 * - AI score access attempts
 * - Offer generation attempts
 * - Per-property unlock tracking
 */

interface PaywallState {
  propertyViewCount: number;
  paywallImpressions: number;
  lastImpressionTimestamp: number | null;
  hasShownPaywall: boolean;
  triggeredBy: string | null;
  unlockedPropertyIds: string[];
}

interface PaywallTrigger {
  type: 'property_view' | 'ai_score' | 'offer_generation' | 'advanced_feature' | 'savings_data';
  propertyId?: string;
  featureName?: string;
}

const STORAGE_KEY = 'apartmentiq-paywall-state';
const FREE_PROPERTY_VIEW_LIMIT = 3;

/** Subscription tiers that grant full savings data access */
const PAID_TIERS = ['basic', 'pro', 'premium', 'renter_paid'];

export function usePaywall() {
  const { user, isAuthenticated } = useUser();

  const [paywallState, setPaywallState] = useState<PaywallState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          unlockedPropertyIds: parsed.unlockedPropertyIds || [],
        };
      }
    } catch (error) {
      logUserActionError('Failed to load paywall state', error as Error);
    }

    return {
      propertyViewCount: 0,
      paywallImpressions: 0,
      lastImpressionTimestamp: null,
      hasShownPaywall: false,
      triggeredBy: null,
      unlockedPropertyIds: [],
    };
  });

  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [currentTrigger, setCurrentTrigger] = useState<PaywallTrigger | null>(null);

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(paywallState));
    } catch (error) {
      logUserActionError('Failed to save paywall state', error as Error);
    }
  }, [paywallState]);

  /**
   * Check if the current user has a paid subscription that grants savings access
   */
  const userHasPaidAccess = useCallback((): boolean => {
    if (!isAuthenticated || !user) return false;

    const tier = user.subscriptionTier?.toLowerCase() || 'free';
    const status = user.subscriptionStatus?.toLowerCase() || 'inactive';

    // User has paid if they have a paid tier AND an active status
    if (PAID_TIERS.includes(tier) && (status === 'active' || status === 'trialing')) {
      return true;
    }

    return false;
  }, [isAuthenticated, user]);

  /**
   * Check if a specific property has been individually unlocked ($1.99)
   */
  const isPropertyUnlocked = useCallback((propertyId: string): boolean => {
    return paywallState.unlockedPropertyIds.includes(propertyId);
  }, [paywallState.unlockedPropertyIds]);

  /**
   * Check if user can see savings data for a given property
   * - Paid users: always yes
   * - Free users: only if they've unlocked that specific property
   */
  const canViewSavingsData = useCallback((propertyId?: string): boolean => {
    if (userHasPaidAccess()) return true;
    if (propertyId && isPropertyUnlocked(propertyId)) return true;
    return false;
  }, [userHasPaidAccess, isPropertyUnlocked]);

  /**
   * Check if user should see paywall
   */
  const shouldShowPaywall = useCallback((trigger: PaywallTrigger): boolean => {
    if (userHasPaidAccess()) return false;

    // If this is about a specific property that's been unlocked, don't paywall
    if (trigger.propertyId && isPropertyUnlocked(trigger.propertyId)) {
      return false;
    }

    switch (trigger.type) {
      case 'property_view':
        return paywallState.propertyViewCount >= FREE_PROPERTY_VIEW_LIMIT;

      case 'savings_data':
      case 'ai_score':
      case 'offer_generation':
      case 'advanced_feature':
        // Premium features always show paywall for free users
        return true;

      default:
        return false;
    }
  }, [paywallState.propertyViewCount, userHasPaidAccess, isPropertyUnlocked]);

  /**
   * Track a property view
   */
  const trackPropertyView = useCallback((propertyId: string) => {
    setPaywallState((prev) => ({
      ...prev,
      propertyViewCount: prev.propertyViewCount + 1,
    }));

    const trigger: PaywallTrigger = { type: 'property_view', propertyId };

    if (shouldShowPaywall(trigger)) {
      setCurrentTrigger(trigger);
      setIsPaywallOpen(true);
      trackPaywallImpression('property_view_limit');
    }
  }, [shouldShowPaywall]);

  /**
   * Track AI score access attempt
   */
  const trackAIScoreAccess = useCallback((propertyId: string) => {
    const trigger: PaywallTrigger = { type: 'ai_score', propertyId };

    if (shouldShowPaywall(trigger)) {
      setCurrentTrigger(trigger);
      setIsPaywallOpen(true);
      trackPaywallImpression('ai_score_access');
      return false; // Blocked
    }

    return true; // Allowed
  }, [shouldShowPaywall]);

  /**
   * Track offer generation attempt
   */
  const trackOfferGeneration = useCallback((propertyId: string) => {
    const trigger: PaywallTrigger = { type: 'offer_generation', propertyId };

    if (shouldShowPaywall(trigger)) {
      setCurrentTrigger(trigger);
      setIsPaywallOpen(true);
      trackPaywallImpression('offer_generation');
      return false; // Blocked
    }

    return true; // Allowed
  }, [shouldShowPaywall]);

  /**
   * Track advanced feature access attempt
   */
  const trackAdvancedFeature = useCallback((featureName: string) => {
    const trigger: PaywallTrigger = { type: 'advanced_feature', featureName };

    if (shouldShowPaywall(trigger)) {
      setCurrentTrigger(trigger);
      setIsPaywallOpen(true);
      trackPaywallImpression(`advanced_feature_${featureName}`);
      return false; // Blocked
    }

    return true; // Allowed
  }, [shouldShowPaywall]);

  /**
   * Open the paywall for savings data gating
   */
  const triggerSavingsPaywall = useCallback((propertyId?: string) => {
    const trigger: PaywallTrigger = { type: 'savings_data', propertyId };
    setCurrentTrigger(trigger);
    setIsPaywallOpen(true);
    trackPaywallImpression('savings_data');
  }, []);

  /**
   * Track paywall impression
   */
  const trackPaywallImpression = useCallback((triggeredBy: string) => {
    setPaywallState((prev) => ({
      ...prev,
      paywallImpressions: prev.paywallImpressions + 1,
      lastImpressionTimestamp: Date.now(),
      hasShownPaywall: true,
      triggeredBy,
    }));
  }, []);

  /**
   * Close paywall
   */
  const closePaywall = useCallback(() => {
    setIsPaywallOpen(false);
    setCurrentTrigger(null);
  }, []);

  /**
   * Mark a specific property as unlocked (after $1.99 per-property purchase)
   */
  const unlockProperty = useCallback((propertyId: string) => {
    setPaywallState((prev) => ({
      ...prev,
      unlockedPropertyIds: [...new Set([...prev.unlockedPropertyIds, propertyId])],
    }));
  }, []);

  /**
   * Reset paywall state (after successful full-access payment)
   */
  const resetPaywallState = useCallback(() => {
    const newState: PaywallState = {
      propertyViewCount: 0,
      paywallImpressions: 0,
      lastImpressionTimestamp: null,
      hasShownPaywall: false,
      triggeredBy: null,
      unlockedPropertyIds: [],
    };

    setPaywallState(newState);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      logUserActionError('Failed to reset paywall state', error as Error);
    }
  }, []);

  /**
   * Get remaining free views
   */
  const getRemainingViews = useCallback(() => {
    return Math.max(0, FREE_PROPERTY_VIEW_LIMIT - paywallState.propertyViewCount);
  }, [paywallState.propertyViewCount]);

  return {
    // State
    isPaywallOpen,
    currentTrigger,
    propertyViewCount: paywallState.propertyViewCount,
    paywallImpressions: paywallState.paywallImpressions,
    hasShownPaywall: paywallState.hasShownPaywall,

    // Access checks
    userHasPaidAccess,
    canViewSavingsData,
    isPropertyUnlocked,

    // Actions
    trackPropertyView,
    trackAIScoreAccess,
    trackOfferGeneration,
    trackAdvancedFeature,
    triggerSavingsPaywall,
    closePaywall,
    unlockProperty,
    resetPaywallState,

    // Helpers
    getRemainingViews,
    shouldShowPaywall,
  };
}
