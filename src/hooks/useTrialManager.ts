import { useState, useEffect, useCallback } from 'react';

export interface TrialStatus {
  id: string;
  email: string;
  createdAt: string;
  queriesUsed: number;
  queriesLimit: number;
  hasSeenUpgradePrompt: boolean;
  lastQueryAt?: string;
}

export interface TeaserIntelligence {
  leverageScore: number; // Rounded to nearest 10 with "+" suffix
  savingsRange: { min: number; max: number };
  opportunityLevel: 'HIGH' | 'EXCEPTIONAL' | 'MODERATE' | 'LOW';
  insightsCount: number;
  advantages: {
    hasTimingAdvantage: boolean;
    hasSeasonalAdvantage: boolean;
    marketCondition: 'Favorable' | 'Neutral' | 'Challenging';
    hasOwnershipAdvantage: boolean;
  };
  blurredInsights: Array<{
    id: string;
    title: string;
    type: 'negotiation' | 'timing' | 'market' | 'financial';
  }>;
  potentialSavings: number; // For upgrade modal
}

const TRIAL_DURATION_HOURS = 72;
const QUERY_LIMIT = 3;

export const useTrialManager = () => {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Load trial from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('apartmentiq_trial');
    if (stored) {
      const trial = JSON.parse(stored) as TrialStatus;
      setTrialStatus(trial);
      
      // Check if expired
      const now = new Date();
      const createdAt = new Date(trial.createdAt);
      const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      setIsExpired(hoursElapsed >= TRIAL_DURATION_HOURS);
    }
  }, []);

  const initializeTrial = useCallback((email: string): TrialStatus => {
    const trial: TrialStatus = {
      id: `trial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      createdAt: new Date().toISOString(),
      queriesUsed: 0,
      queriesLimit: QUERY_LIMIT,
      hasSeenUpgradePrompt: false
    };

    localStorage.setItem('apartmentiq_trial', JSON.stringify(trial));
    setTrialStatus(trial);
    setIsExpired(false);
    return trial;
  }, []);

  const canMakeQuery = useCallback((): boolean => {
    if (!trialStatus || isExpired) return false;
    return trialStatus.queriesUsed < trialStatus.queriesLimit;
  }, [trialStatus, isExpired]);

  const recordQuery = useCallback((): boolean => {
    if (!trialStatus || !canMakeQuery()) return false;

    const updatedTrial = {
      ...trialStatus,
      queriesUsed: trialStatus.queriesUsed + 1,
      lastQueryAt: new Date().toISOString()
    };

    localStorage.setItem('apartmentiq_trial', JSON.stringify(updatedTrial));
    setTrialStatus(updatedTrial);
    return true;
  }, [trialStatus, canMakeQuery]);

  const markUpgradePromptSeen = useCallback(() => {
    if (!trialStatus) return;

    const updatedTrial = {
      ...trialStatus,
      hasSeenUpgradePrompt: true
    };

    localStorage.setItem('apartmentiq_trial', JSON.stringify(updatedTrial));
    setTrialStatus(updatedTrial);
  }, [trialStatus]);

  const getTimeRemaining = useCallback((): { hours: number; isUrgent: boolean } => {
    if (!trialStatus) return { hours: 0, isUrgent: true };

    const now = new Date();
    const createdAt = new Date(trialStatus.createdAt);
    const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    const hoursRemaining = Math.max(0, TRIAL_DURATION_HOURS - hoursElapsed);

    return {
      hours: Math.floor(hoursRemaining),
      isUrgent: hoursRemaining < 24 || trialStatus.queriesUsed >= trialStatus.queriesLimit - 1
    };
  }, [trialStatus]);

  const shouldShowUpgradePrompt = useCallback((): boolean => {
    if (!trialStatus) return false;
    
    const timeInfo = getTimeRemaining();
    return (
      trialStatus.queriesUsed >= 2 || 
      timeInfo.isUrgent || 
      trialStatus.queriesUsed >= trialStatus.queriesLimit ||
      isExpired
    );
  }, [trialStatus, getTimeRemaining, isExpired]);

  const convertToTeaserData = useCallback((fullIntelligence: any): TeaserIntelligence => {
    // Round leverage score to nearest 10
    const roundedScore = Math.round(fullIntelligence.overallLeverageScore / 10) * 10;
    
    // Create savings range (+/- 40% of actual)
    const actualSavings = fullIntelligence.recommendation?.monthlySavings || 300;
    const variance = actualSavings * 0.4;
    
    // Determine opportunity level based on score
    let opportunityLevel: TeaserIntelligence['opportunityLevel'] = 'MODERATE';
    if (roundedScore >= 90) opportunityLevel = 'EXCEPTIONAL';
    else if (roundedScore >= 70) opportunityLevel = 'HIGH';
    else if (roundedScore < 50) opportunityLevel = 'LOW';

    return {
      leverageScore: roundedScore,
      savingsRange: {
        min: Math.round(actualSavings - variance),
        max: Math.round(actualSavings + variance)
      },
      opportunityLevel,
      insightsCount: fullIntelligence.combinedInsights?.length || 3,
      advantages: {
        hasTimingAdvantage: fullIntelligence.dataStatus?.timing === 'favorable',
        hasSeasonalAdvantage: fullIntelligence.dataStatus?.seasonal === 'favorable',
        marketCondition: fullIntelligence.dataStatus?.market || 'Neutral',
        hasOwnershipAdvantage: fullIntelligence.dataStatus?.ownership === 'favorable'
      },
      blurredInsights: [
        { id: '1', title: 'Landlord Pressure Points Analysis', type: 'financial' },
        { id: '2', title: 'Optimal Negotiation Timing Strategy', type: 'timing' },
        { id: '3', title: 'Market-Based Leverage Tactics', type: 'market' }
      ],
      potentialSavings: actualSavings
    };
  }, []);

  return {
    trialStatus,
    isExpired,
    initializeTrial,
    canMakeQuery,
    recordQuery,
    markUpgradePromptSeen,
    getTimeRemaining,
    shouldShowUpgradePrompt,
    convertToTeaserData
  };
};