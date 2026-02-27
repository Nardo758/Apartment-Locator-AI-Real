import { useState, useEffect, useCallback } from 'react';
import { logUserActionError } from '@/lib/errorLogger';
import { useUser } from '@/hooks/useUser';

interface PaywallState {
  propertyViewCount: number;
  paywallImpressions: number;
  lastImpressionTimestamp: number | null;
  hasShownPaywall: boolean;
  triggeredBy: string | null;
  unlockedPropertyIds: string[];
  activePlan: string | null;
}

interface PaywallTrigger {
  type: 'property_view' | 'ai_score' | 'offer_generation' | 'advanced_feature';
  propertyId?: string;
  featureName?: string;
}

const STORAGE_KEY = 'apartmentiq-paywall-state';
const FREE_PROPERTY_VIEW_LIMIT = 999;

export function usePaywall() {
  const { user } = useUser();

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
      unlockedPropertyIds: [],
      activePlan: null,
    };
  });

  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [currentTrigger, setCurrentTrigger] = useState<PaywallTrigger | null>(null);
  const [paywallPropertyId, setPaywallPropertyId] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(paywallState));
    } catch (error) {
      logUserActionError('Failed to save paywall state', error as Error);
    }
  }, [paywallState]);

  const userIsSubscribed = !!(
    (user &&
      user.subscriptionTier &&
      user.subscriptionTier !== 'free' &&
      user.subscriptionStatus === 'active') ||
    paywallState.activePlan
  );

  const isPropertyUnlocked = useCallback(
    (propertyId: string): boolean => {
      if (userIsSubscribed) return true;
      return paywallState.unlockedPropertyIds.includes(propertyId);
    },
    [userIsSubscribed, paywallState.unlockedPropertyIds],
  );

  const shouldShowPaywall = useCallback(
    (trigger: PaywallTrigger): boolean => {
      if (userIsSubscribed) {
        return false;
      }

      if (trigger.propertyId && isPropertyUnlocked(trigger.propertyId)) {
        return false;
      }

      switch (trigger.type) {
        case 'property_view':
          return paywallState.propertyViewCount >= FREE_PROPERTY_VIEW_LIMIT;

        case 'ai_score':
        case 'offer_generation':
        case 'advanced_feature':
          return true;

        default:
          return false;
      }
    },
    [userIsSubscribed, paywallState.propertyViewCount, isPropertyUnlocked],
  );

  const trackPaywallImpression = useCallback(
    (triggeredBy: string) => {
      setPaywallState((prev) => ({
        ...prev,
        paywallImpressions: prev.paywallImpressions + 1,
        lastImpressionTimestamp: Date.now(),
        hasShownPaywall: true,
        triggeredBy,
      }));

      try {
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'paywall_impression', {
            triggered_by: triggeredBy,
            impression_count: paywallState.paywallImpressions + 1,
          });
        }
      } catch (error) {
        logUserActionError('Failed to track paywall impression', error as Error);
      }
    },
    [paywallState.paywallImpressions],
  );

  const trackPropertyView = useCallback(
    (propertyId: string) => {
      setPaywallState((prev) => ({
        ...prev,
        propertyViewCount: prev.propertyViewCount + 1,
      }));

      const trigger: PaywallTrigger = { type: 'property_view', propertyId };

      if (shouldShowPaywall(trigger)) {
        setCurrentTrigger(trigger);
        setPaywallPropertyId(propertyId);
        setIsPaywallOpen(true);
        trackPaywallImpression('property_view_limit');
      }
    },
    [shouldShowPaywall, trackPaywallImpression],
  );

  const trackAIScoreAccess = useCallback(
    (propertyId: string) => {
      const trigger: PaywallTrigger = { type: 'ai_score', propertyId };

      if (shouldShowPaywall(trigger)) {
        setCurrentTrigger(trigger);
        setPaywallPropertyId(propertyId);
        setIsPaywallOpen(true);
        trackPaywallImpression('ai_score_access');
        return false;
      }

      return true;
    },
    [shouldShowPaywall, trackPaywallImpression],
  );

  const trackOfferGeneration = useCallback(
    (propertyId: string) => {
      const trigger: PaywallTrigger = { type: 'offer_generation', propertyId };

      if (shouldShowPaywall(trigger)) {
        setCurrentTrigger(trigger);
        setPaywallPropertyId(propertyId);
        setIsPaywallOpen(true);
        trackPaywallImpression('offer_generation');
        return false;
      }

      return true;
    },
    [shouldShowPaywall, trackPaywallImpression],
  );

  const trackAdvancedFeature = useCallback(
    (featureName: string) => {
      const trigger: PaywallTrigger = { type: 'advanced_feature', featureName };

      if (shouldShowPaywall(trigger)) {
        setCurrentTrigger(trigger);
        setIsPaywallOpen(true);
        trackPaywallImpression(`advanced_feature_${featureName}`);
        return false;
      }

      return true;
    },
    [shouldShowPaywall, trackPaywallImpression],
  );

  const openPaywall = useCallback((propertyId?: string) => {
    setPaywallPropertyId(propertyId);
    setIsPaywallOpen(true);
    trackPaywallImpression(propertyId ? `unlock_property_${propertyId}` : 'open_paywall');
  }, [trackPaywallImpression]);

  const closePaywall = useCallback(() => {
    setIsPaywallOpen(false);
    setCurrentTrigger(null);
    setPaywallPropertyId(undefined);
  }, []);

  const unlockProperty = useCallback((propertyId: string) => {
    setPaywallState((prev) => ({
      ...prev,
      unlockedPropertyIds: [...new Set([...prev.unlockedPropertyIds, propertyId])],
    }));
  }, []);

  const activatePlan = useCallback((planId: string) => {
    setPaywallState((prev) => ({
      ...prev,
      activePlan: planId,
    }));
  }, []);

  const resetPaywallState = useCallback(() => {
    const newState: PaywallState = {
      propertyViewCount: 0,
      paywallImpressions: 0,
      lastImpressionTimestamp: null,
      hasShownPaywall: false,
      triggeredBy: null,
      unlockedPropertyIds: [],
      activePlan: null,
    };

    setPaywallState(newState);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      logUserActionError('Failed to reset paywall state', error as Error);
    }
  }, []);

  const getRemainingViews = useCallback(() => {
    return Math.max(0, FREE_PROPERTY_VIEW_LIMIT - paywallState.propertyViewCount);
  }, [paywallState.propertyViewCount]);

  return {
    isPaywallOpen,
    currentTrigger,
    paywallPropertyId,
    propertyViewCount: paywallState.propertyViewCount,
    paywallImpressions: paywallState.paywallImpressions,
    hasShownPaywall: paywallState.hasShownPaywall,
    unlockedPropertyIds: paywallState.unlockedPropertyIds,

    openPaywall,
    trackPropertyView,
    trackAIScoreAccess,
    trackOfferGeneration,
    trackAdvancedFeature,
    closePaywall,
    unlockProperty,
    activatePlan,
    resetPaywallState,

    getRemainingViews,
    shouldShowPaywall,
    isPropertyUnlocked,
    userIsSubscribed,
  };
}
