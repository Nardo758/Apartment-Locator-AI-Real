// ============================================
// LOCATION COST CONTEXT
// Persists user lifestyle inputs across the app
// ============================================

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { UserLocationInputs, ApartmentLocationCost, Coordinates } from '../types/locationCost.types';

// Default inputs
const DEFAULT_INPUTS: UserLocationInputs = {
  workAddress: '',
  workCoordinates: undefined,
  commuteFrequency: 5,
  commuteMode: 'driving',
  vehicleMpg: 28,
  groceryFrequency: 2,
  preferredGroceryChain: 'any',
  hasGymMembership: false,
  gymAddress: undefined,
  gymCoordinates: undefined,
  gymVisitsPerWeek: 3,
  usesPublicTransit: false,
  monthlyTransitPass: 100,
};

// Context type
interface LocationCostContextType {
  // User inputs
  inputs: UserLocationInputs;
  updateInputs: (updates: Partial<UserLocationInputs>) => void;
  resetInputs: () => void;
  hasInputs: boolean;
  
  // Calculated costs (cached)
  calculatedCosts: Map<string, ApartmentLocationCost>;
  setCostForApartment: (apartmentId: string, cost: ApartmentLocationCost) => void;
  getCostForApartment: (apartmentId: string) => ApartmentLocationCost | undefined;
  clearCosts: () => void;
  
  // Gas price
  gasPrice: number;
  setGasPrice: (price: number) => void;
  
  // UI state
  isCalculating: boolean;
  setIsCalculating: (calculating: boolean) => void;
  
  // Persistence
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

// Create context
const LocationCostContext = createContext<LocationCostContextType | undefined>(undefined);

// Storage key
const STORAGE_KEY = 'apartmentiq_location_inputs';

// Provider component
interface LocationCostProviderProps {
  children: ReactNode;
}

export function LocationCostProvider({ children }: LocationCostProviderProps) {
  const [inputs, setInputs] = useState<UserLocationInputs>(DEFAULT_INPUTS);
  const [calculatedCosts, setCalculatedCosts] = useState<Map<string, ApartmentLocationCost>>(new Map());
  const [gasPrice, setGasPrice] = useState(3.50);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Check if user has entered meaningful inputs
  const hasInputs = Boolean(inputs.workAddress && inputs.workCoordinates);
  
  // Update inputs
  const updateInputs = useCallback((updates: Partial<UserLocationInputs>) => {
    setInputs(prev => {
      const newInputs = { ...prev, ...updates };
      // Clear calculated costs when inputs change (they're now stale)
      setCalculatedCosts(new Map());
      return newInputs;
    });
  }, []);
  
  // Reset to defaults
  const resetInputs = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    setCalculatedCosts(new Map());
    localStorage.removeItem(STORAGE_KEY);
  }, []);
  
  // Cost caching
  const setCostForApartment = useCallback((apartmentId: string, cost: ApartmentLocationCost) => {
    setCalculatedCosts(prev => {
      const newMap = new Map(prev);
      newMap.set(apartmentId, cost);
      return newMap;
    });
  }, []);
  
  const getCostForApartment = useCallback((apartmentId: string) => {
    return calculatedCosts.get(apartmentId);
  }, [calculatedCosts]);
  
  const clearCosts = useCallback(() => {
    setCalculatedCosts(new Map());
  }, []);
  
  // Persistence
  const saveToStorage = useCallback(() => {
    try {
      const data = JSON.stringify({
        inputs,
        gasPrice,
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem(STORAGE_KEY, data);
    } catch (error) {
      console.error('Failed to save location inputs:', error);
    }
  }, [inputs, gasPrice]);
  
  const loadFromStorage = useCallback(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.inputs) {
          setInputs({ ...DEFAULT_INPUTS, ...parsed.inputs });
        }
        if (parsed.gasPrice) {
          setGasPrice(parsed.gasPrice);
        }
      }
    } catch (error) {
      console.error('Failed to load location inputs:', error);
    }
  }, []);
  
  // Load from storage on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);
  
  // Auto-save when inputs change
  useEffect(() => {
    if (hasInputs) {
      saveToStorage();
    }
  }, [inputs, gasPrice, hasInputs, saveToStorage]);
  
  const value: LocationCostContextType = {
    inputs,
    updateInputs,
    resetInputs,
    hasInputs,
    calculatedCosts,
    setCostForApartment,
    getCostForApartment,
    clearCosts,
    gasPrice,
    setGasPrice,
    isCalculating,
    setIsCalculating,
    saveToStorage,
    loadFromStorage,
  };
  
  return (
    <LocationCostContext.Provider value={value}>
      {children}
    </LocationCostContext.Provider>
  );
}

// Hook to use context
export function useLocationCostContext() {
  const context = useContext(LocationCostContext);
  if (context === undefined) {
    throw new Error('useLocationCostContext must be used within a LocationCostProvider');
  }
  return context;
}

// Convenience hook for checking if setup is complete
export function useHasLocationSetup() {
  const { hasInputs } = useLocationCostContext();
  return hasInputs;
}
