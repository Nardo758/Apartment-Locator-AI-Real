import { useState, useEffect, useCallback } from 'react';
import { logUserActionError } from '@/lib/errorLogger';

/**
 * Paywall Hook
 * 
 * Manages paywall triggers and tracking:
 * - 3 property views limit for free users
 * - AI score access attempts
 * - Offer generation attempts
 * - Tracks paywall impressions
 */

interface PaywallState {
  propertyViewCount: number;
  paywallImpressions: number;
  lastImpressionTimestamp: number | null;
  hasShownPaywall: boolean;
  triggeredBy: string | null;
}

interface PaywallTrigger {
  type: 'property_view' | 'ai_score' | 'offer_generation' | 'advanced_feature';
  propertyId?: string;
  featureName?: string;
}

const STORAGE_KEY = 'apartmentiq-paywall-state';
const FREE_PROPERTY_VIEW_LIMIT = 3;

export function usePaywall() {
  const [paywallState, setPaywallState] = useState<PaywallState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
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
   * Check if user should see paywall
   */
  const shouldShowPaywall = useCallback((trigger: PaywallTrigger): boolean => {
    // TODO: Check user subscription status from UserContext
    // For now, assume user is free if they haven't subscribed
    const userIsSubscribed = false; // Replace with actual check
    
    if (userIsSubscribed) {
      return false;
    }

    switch (trigger.type) {
      case 'property_view':
        return paywallState.propertyViewCount >= FREE_PROPERTY_VIEW_LIMIT;
      
      case 'ai_score':
      case 'offer_generation':
      case 'advanced_feature':
        // Premium features always show paywall for free users
        return true;
      
      default:
        return false;
    }
  }, [paywallState.propertyViewCount]);

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

    // Send analytics event
    try {
      // TODO: Integrate with analytics service (Google Analytics, Mixpanel, etc.)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'paywall_impression', {
          triggered_by: triggeredBy,
          impression_count: paywallState.paywallImpressions + 1,
        });
      }

    } catch (error) {
      logUserActionError('Failed to track paywall impression', error as Error);
    }
  }, [paywallState.paywallImpressions]);

  /**
   * Close paywall
   */
  const closePaywall = useCallback(() => {
    setIsPaywallOpen(false);
    setCurrentTrigger(null);
  }, []);

  /**
   * Reset paywall state (after successful payment)
   */
  const resetPaywallState = useCallback(() => {
    const newState: PaywallState = {
      propertyViewCount: 0,
      paywallImpressions: 0,
      lastImpressionTimestamp: null,
      hasShownPaywall: false,
      triggeredBy: null,
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
    
    // Actions
    trackPropertyView,
    trackAIScoreAccess,
    trackOfferGeneration,
    trackAdvancedFeature,
    closePaywall,
    resetPaywallState,
    
    // Helpers
    getRemainingViews,
    shouldShowPaywall,
  };
}
