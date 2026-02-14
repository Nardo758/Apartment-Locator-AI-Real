// ============================================
// UNIFIED AI CONTEXT
// Single source of truth for all AI inputs and scoring
// Replaces: LocationCostContext + userProfile fragments
// ============================================

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type {
  UnifiedAIInputs,
  UnifiedAIContext as UnifiedAIContextType,
  PointOfInterest,
  MarketContext,
  ScoredApartment,
  Concession,
} from '@/types/unifiedAI.types';
import { SETUP_STEPS } from '@/types/unifiedAI.types';

// Default inputs
const DEFAULT_INPUTS: UnifiedAIInputs = {
  budget: 2500,
  location: '',
  zipCode: '',
  pointsOfInterest: [],
  commutePreferences: {
    daysPerWeek: 5,
    vehicleMpg: 28,
    gasPrice: 3.50,
    transitPass: 100,
    timeValuePerHour: 25,
  },
  aiPreferences: {
    bedrooms: '1',
    amenities: [],
    dealBreakers: [],
    priorities: [],
  },
  hasCompletedSetup: false,
  setupProgress: 0,
  completedSteps: [],
  missingInputs: [],
};

// Storage key
const STORAGE_KEY = 'apartment_locator_unified_ai';

// Create context
const UnifiedAIContext = createContext<UnifiedAIContextType | undefined>(undefined);

// Provider component
interface UnifiedAIProviderProps {
  children: ReactNode;
}

export function UnifiedAIProvider({ children }: UnifiedAIProviderProps) {
  const [inputs, setInputs] = useState<UnifiedAIInputs>(DEFAULT_INPUTS);
  const [scoredApartments, setScoredApartments] = useState<ScoredApartment[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [lastCalculated, setLastCalculated] = useState<Date | undefined>(undefined);

  // Calculate setup progress
  const calculateSetupProgress = useCallback((currentInputs: UnifiedAIInputs): {
    progress: number;
    completedSteps: number[];
    missingInputs: string[];
  } => {
    const completed: number[] = [];
    const missing: string[] = [];
    
    // Step 1: Basic Search
    if (currentInputs.location && currentInputs.budget > 0) {
      completed.push(1);
    } else {
      if (!currentInputs.location) missing.push('Add your location');
      if (currentInputs.budget <= 0) missing.push('Set your budget');
    }
    
    // Step 2: POIs
    if (currentInputs.pointsOfInterest.length > 0) {
      completed.push(2);
    } else {
      missing.push('Add at least one important location (work, gym, etc.)');
    }
    
    // Step 3: Lifestyle & Commute
    if (currentInputs.commutePreferences.daysPerWeek > 0) {
      completed.push(3);
    }
    
    // Step 4: Market Intelligence (optional)
    if (currentInputs.marketContext && currentInputs.marketContext.leverageScore > 0) {
      completed.push(4);
    } else {
      missing.push('Complete market analysis for negotiation tips (optional)');
    }
    
    // Step 5: AI Preferences (optional)
    if (currentInputs.aiPreferences.amenities.length > 0 || currentInputs.aiPreferences.priorities.length > 0) {
      completed.push(5);
    } else {
      missing.push('Set your amenity preferences for better matching (optional)');
    }
    
    // Calculate progress (required steps only for main progress)
    const requiredSteps = SETUP_STEPS.filter(s => s.required).length;
    const completedRequired = completed.filter(id => {
      const step = SETUP_STEPS.find(s => s.id === id);
      return step?.required;
    }).length;
    
    const progress = Math.round((completedRequired / requiredSteps) * 100);
    
    return { progress, completedSteps: completed, missingInputs: missing };
  }, []);

  // Update inputs
  const updateInputs = useCallback((updates: Partial<UnifiedAIInputs>) => {
    setInputs(prev => {
      const newInputs: UnifiedAIInputs = { ...prev, ...updates, updatedAt: new Date() };
      
      // Recalculate setup progress
      const { progress, completedSteps, missingInputs } = calculateSetupProgress(newInputs);
      newInputs.setupProgress = progress;
      newInputs.completedSteps = completedSteps;
      newInputs.missingInputs = missingInputs;
      newInputs.hasCompletedSetup = completedSteps.includes(1) && completedSteps.includes(2) && completedSteps.includes(3);
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newInputs));
      } catch (err) {
        console.error('Failed to save unified AI inputs:', err);
      }
      
      return newInputs;
    });
  }, [calculateSetupProgress]);

  // Add POI
  const addPOI = useCallback((poi: PointOfInterest) => {
    updateInputs({
      pointsOfInterest: [...inputs.pointsOfInterest, poi],
    });
  }, [inputs.pointsOfInterest, updateInputs]);

  // Remove POI
  const removePOI = useCallback((poiId: string) => {
    updateInputs({
      pointsOfInterest: inputs.pointsOfInterest.filter(p => p.id !== poiId),
    });
  }, [inputs.pointsOfInterest, updateInputs]);

  // Update market context
  const updateMarketContext = useCallback((context: Partial<MarketContext>) => {
    updateInputs({
      marketContext: { ...inputs.marketContext, ...context } as MarketContext,
    });
  }, [inputs.marketContext, updateInputs]);

  // Calculate effective rent with concessions
  const calculateEffectiveRent = useCallback((baseRent: number, concessions: Concession[]): {
    effectiveRent: number;
    monthlySavings: number;
    annualSavings: number;
  } => {
    let totalConcessionValue = 0;
    
    concessions.forEach(concession => {
      switch (concession.type) {
        case 'weeks_free':
          // (weeks / 52) × annual rent
          totalConcessionValue += (concession.value / 52) * (baseRent * 12);
          break;
        case 'months_free':
          // baseRent × months
          totalConcessionValue += baseRent * concession.value;
          break;
        case 'dollar_amount':
          totalConcessionValue += concession.value;
          break;
        case 'percent_off': {
          // (percentage / 100) × baseRent × duration
          const discountAmount = baseRent * (concession.value / 100);
          totalConcessionValue += discountAmount * (concession.duration || 1);
          break;
        }
      }
    });
    
    // Spread over 12 months
    const monthlySavings = totalConcessionValue / 12;
    const effectiveRent = baseRent - monthlySavings;
    
    return {
      effectiveRent: Math.round(effectiveRent * 100) / 100,
      monthlySavings: Math.round(monthlySavings * 100) / 100,
      annualSavings: Math.round(totalConcessionValue * 100) / 100,
    };
  }, []);

  // Calculate scores for apartments
  const calculateScores = useCallback(async () => {
    setIsCalculating(true);
    setError(undefined);
    
    try {
      // TODO: Implement full scoring logic
      // This is a placeholder that will be expanded
      
      setScoredApartments([]);
      setLastCalculated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Scoring failed';
      console.error('Scoring error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsCalculating(false);
    }
  }, [inputs]);

  // Refresh from Supabase
  const refreshFromDatabase = useCallback(async () => {
    try {
      const { data: { session } } = await import('@/integrations/supabase/client').then(m => m.supabase.auth.getSession());
      
      if (session?.user) {
        const { data: userPrefs } = await import('@/integrations/supabase/client').then(m => 
          m.supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
        );

        if (userPrefs) {
          const mergedInputs: UnifiedAIInputs = {
            ...inputs,
            location: userPrefs.location || inputs.location,
            budget: userPrefs.budget || inputs.budget,
          };
          
          const { progress, completedSteps, missingInputs } = calculateSetupProgress(mergedInputs);
          mergedInputs.setupProgress = progress;
          mergedInputs.completedSteps = completedSteps;
          mergedInputs.missingInputs = missingInputs;
          
          setInputs(mergedInputs);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedInputs));
        }
      }
    } catch (err) {
      console.error('Failed to refresh from database:', err);
    }
  }, [inputs, calculateSetupProgress]);

  // Reset to defaults
  const reset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    setScoredApartments([]);
    setError(undefined);
    setLastCalculated(undefined);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Load from storage on mount (Supabase + localStorage)
  useEffect(() => {
    const loadData = async () => {
      try {
        // First, try to load from Supabase (source of truth)
        const { data: { session } } = await import('@/integrations/supabase/client').then(m => m.supabase.auth.getSession());
        
        if (session?.user) {
          const { data: userPrefs } = await import('@/integrations/supabase/client').then(m => 
            m.supabase
              .from('user_preferences')
              .select('*')
              .eq('user_id', session.user.id)
              .single()
          );

          if (userPrefs) {
            // Merge Supabase data with current inputs
            const mergedInputs: UnifiedAIInputs = {
              ...inputs,
              location: userPrefs.location || inputs.location,
              budget: userPrefs.budget || inputs.budget,
              // Add more fields as they exist in user_preferences
            };
            
            // Calculate progress
            const { progress, completedSteps, missingInputs } = calculateSetupProgress(mergedInputs);
            mergedInputs.setupProgress = progress;
            mergedInputs.completedSteps = completedSteps;
            mergedInputs.missingInputs = missingInputs;
            
            setInputs(mergedInputs);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedInputs));
            return; // Exit early if we loaded from Supabase
          }
        }
        
        // Fallback to localStorage if no Supabase data
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const { progress, completedSteps, missingInputs } = calculateSetupProgress(parsed);
          parsed.setupProgress = progress;
          parsed.completedSteps = completedSteps;
          parsed.missingInputs = missingInputs;
          setInputs(parsed);
        }
      } catch (err) {
        console.error('Failed to load unified AI inputs:', err);
        
        // Final fallback to localStorage
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            const { progress, completedSteps, missingInputs } = calculateSetupProgress(parsed);
            parsed.setupProgress = progress;
            parsed.completedSteps = completedSteps;
            parsed.missingInputs = missingInputs;
            setInputs(parsed);
          }
        } catch (localErr) {
          console.error('Failed to load from localStorage:', localErr);
        }
      }
    };
    
    loadData();
  }, [calculateSetupProgress]);

  const value: UnifiedAIContextType = {
    ...inputs,
    scoredApartments,
    isCalculating,
    lastCalculated,
    error,
    updateInputs,
    addPOI,
    removePOI,
    updateMarketContext,
    calculateScores,
    refreshFromDatabase,
    reset,
  };

  return (
    <UnifiedAIContext.Provider value={value}>
      {children}
    </UnifiedAIContext.Provider>
  );
}

// Hook to use context
export function useUnifiedAI() {
  const context = useContext(UnifiedAIContext);
  if (context === undefined) {
    throw new Error('useUnifiedAI must be used within a UnifiedAIProvider');
  }
  return context;
}

// Convenience hooks
export function useSetupProgress() {
  const { setupProgress, completedSteps, missingInputs, hasCompletedSetup } = useUnifiedAI();
  return { setupProgress, completedSteps, missingInputs, hasCompletedSetup };
}

export function useSmartScores() {
  const { scoredApartments, isCalculating, calculateScores } = useUnifiedAI();
  return { scoredApartments, isCalculating, calculateScores };
}

export default UnifiedAIContext;
