import { useState, useEffect, useCallback } from 'react';
import { TrialStatus } from './useTrialManager';
import { ApartmentListing } from '@/data/mockApartments';

type TriggerType = 'trial_exhausted' | 'time_expired' | 'high_value_apartment' | 'return_visit' | 'premium_clicks';

interface ActiveModal {
  trigger: TriggerType;
  data?: ApartmentListing;
  timestamp: number;
}

export const useAutoUpgradeTriggers = (trialStatus: TrialStatus | null) => {
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);
  const [premiumClickCount, setPremiumClickCount] = useState(0);
  const [lastPremiumClick, setLastPremiumClick] = useState<number | null>(null);

  // Calculate time remaining in hours
  const calculateTimeRemaining = useCallback((): number => {
    if (!trialStatus) return 0;
    const now = new Date();
    const createdAt = new Date(trialStatus.createdAt);
    const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return Math.max(0, 72 - hoursElapsed);
  }, [trialStatus]);

  // Check for auto-upgrade conditions
  const checkUpgradeTriggers = useCallback(() => {
    if (!trialStatus) return;

    // Don't show multiple modals within 30 seconds
    if (activeModal && Date.now() - activeModal.timestamp < 30000) {
      return;
    }

    // 1. Trial exhausted (highest priority)
    if (trialStatus.searchesUsed >= trialStatus.searchesLimit) {
      setActiveModal({ 
        trigger: 'trial_exhausted',
        timestamp: Date.now()
      });
      return;
    }

    // 2. Time expired
    const hoursRemaining = calculateTimeRemaining();
    if (hoursRemaining <= 0) {
      setActiveModal({ 
        trigger: 'time_expired',
        timestamp: Date.now()
      });
      return;
    }

    // 3. Return visit after 24+ hours
    if (trialStatus.lastSearchAt) {
      const lastSearchTime = new Date(trialStatus.lastSearchAt).getTime();
      const hoursSinceLastSearch = (Date.now() - lastSearchTime) / (1000 * 60 * 60);
      
      if (hoursSinceLastSearch >= 24 && trialStatus.searchesUsed > 0) {
        setActiveModal({ 
          trigger: 'return_visit',
          timestamp: Date.now()
        });
        return;
      }
    }

    // 4. Multiple premium clicks
    if (premiumClickCount >= 3 && lastPremiumClick) {
      const timeSinceLastClick = Date.now() - lastPremiumClick;
      // Show modal if user clicked premium content 3+ times in last 5 minutes
      if (timeSinceLastClick < 5 * 60 * 1000) {
        setActiveModal({
          trigger: 'premium_clicks',
          timestamp: Date.now()
        });
        // Reset count after showing modal
        setPremiumClickCount(0);
        setLastPremiumClick(null);
        return;
      }
    }
  }, [trialStatus, calculateTimeRemaining, activeModal, premiumClickCount, lastPremiumClick]);

  // Run trigger checks periodically and on status changes
  useEffect(() => {
    checkUpgradeTriggers();
    
    // Check every 30 seconds for time-based triggers
    const interval = setInterval(checkUpgradeTriggers, 30000);
    return () => clearInterval(interval);
  }, [checkUpgradeTriggers]);

  // Trigger for high-value apartment viewing
  const triggerHighValueModal = useCallback((apartmentData: ApartmentListing) => {
    // Only trigger for exceptional apartments with high leverage
    if (apartmentData.leverageScore >= 85 && apartmentData.opportunityLevel === 'exceptional') {
      // Don't show if already shown recently
      if (activeModal && Date.now() - activeModal.timestamp < 60000) {
        return;
      }

      setActiveModal({ 
        trigger: 'high_value_apartment',
        data: apartmentData,
        timestamp: Date.now()
      });
    }
  }, [activeModal]);

  // Track premium content clicks
  const trackPremiumClick = useCallback(() => {
    const now = Date.now();
    
    // Reset count if more than 5 minutes since last click
    if (lastPremiumClick && now - lastPremiumClick > 5 * 60 * 1000) {
      setPremiumClickCount(1);
    } else {
      setPremiumClickCount(prev => prev + 1);
    }
    
    setLastPremiumClick(now);
  }, [lastPremiumClick]);

  // Close modal
  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  // Check if user can make searches
  const canMakeSearch = useCallback((): boolean => {
    if (!trialStatus) return false;
    const hoursRemaining = calculateTimeRemaining();
    return trialStatus.searchesUsed < trialStatus.searchesLimit && hoursRemaining > 0;
  }, [trialStatus, calculateTimeRemaining]);

  return {
    activeModal,
    closeModal,
    triggerHighValueModal,
    trackPremiumClick,
    canMakeSearch,
    timeRemaining: calculateTimeRemaining(),
    searchesRemaining: trialStatus ? trialStatus.searchesLimit - trialStatus.searchesUsed : 0
  };
};