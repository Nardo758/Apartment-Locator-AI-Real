// ============================================
// USE LOCATION COST HOOK
// Main hook for Location Cost Calculator
// ============================================

import { useState, useCallback, useMemo } from 'react';
import type {
  UserLocationInputs,
  ApartmentLocationCost,
  ApartmentComparison,
  Coordinates,
  LocationCostCalculatorState,
  GasPriceData,
} from '@/types/locationCost.types';
import {
  calculateApartmentCosts,
  createComparison,
  formatCurrency,
  formatSavings,
} from '@/services/locationCostService';

// Default user inputs
const DEFAULT_INPUTS: UserLocationInputs = {
  workAddress: '',
  commuteFrequency: 5,
  commuteMode: 'driving',
  vehicleMpg: 28,
  groceryFrequency: 2,
  preferredGroceryChain: 'any',
  hasGymMembership: false,
  gymVisitsPerWeek: 3,
  usesPublicTransit: false,
  monthlyTransitPass: 100,
};

interface UseLocationCostOptions {
  googleMapsApiKey: string;
  autoCalculate?: boolean;
}

interface UseLocationCostReturn {
  // State
  userInputs: UserLocationInputs;
  results: ApartmentLocationCost[];
  comparison: ApartmentComparison | null;
  isCalculating: boolean;
  error: string | null;
  
  // Actions
  updateInputs: (inputs: Partial<UserLocationInputs>) => void;
  setWorkAddress: (address: string, coordinates?: Coordinates) => void;
  setGymAddress: (address: string, coordinates?: Coordinates) => void;
  calculateCosts: (apartments: ApartmentForCalculation[]) => Promise<void>;
  clearResults: () => void;
  
  // Derived data
  cheapestApartment: ApartmentLocationCost | null;
  bestValueApartment: ApartmentLocationCost | null;
  totalPotentialSavings: number;
  
  // Formatting helpers
  formatCost: (amount: number) => string;
  formatDelta: (amount: number) => string;
}

interface ApartmentForCalculation {
  id: string;
  address: string;
  coordinates: Coordinates;
  baseRent: number;
  parkingIncluded?: boolean;
}

export function useLocationCost(
  options: UseLocationCostOptions
): UseLocationCostReturn {
  const { googleMapsApiKey, autoCalculate = false } = options;
  
  // State
  const [userInputs, setUserInputs] = useState<UserLocationInputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<ApartmentLocationCost[]>([]);
  const [comparison, setComparison] = useState<ApartmentComparison | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gasPriceData, setGasPriceData] = useState<GasPriceData | null>(null);
  
  // Update inputs
  const updateInputs = useCallback((newInputs: Partial<UserLocationInputs>) => {
    setUserInputs(prev => ({ ...prev, ...newInputs }));
  }, []);
  
  // Set work address with geocoding
  const setWorkAddress = useCallback(async (
    address: string,
    coordinates?: Coordinates
  ) => {
    updateInputs({
      workAddress: address,
      workCoordinates: coordinates,
    });
  }, [updateInputs]);
  
  // Set gym address with geocoding
  const setGymAddress = useCallback(async (
    address: string,
    coordinates?: Coordinates
  ) => {
    updateInputs({
      gymAddress: address,
      gymCoordinates: coordinates,
    });
  }, [updateInputs]);
  
  // Main calculation function
  const calculateCosts = useCallback(async (
    apartments: ApartmentForCalculation[]
  ) => {
    if (apartments.length === 0) {
      setError('No apartments to calculate');
      return;
    }
    
    setIsCalculating(true);
    setError(null);
    
    try {
      const calculatedResults = await calculateApartmentCosts(
        userInputs,
        apartments,
        googleMapsApiKey,
        gasPriceData ?? undefined
      );
      
      setResults(calculatedResults);
      setComparison(createComparison(calculatedResults));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
    } finally {
      setIsCalculating(false);
    }
  }, [userInputs, googleMapsApiKey, gasPriceData]);
  
  // Clear results
  const clearResults = useCallback(() => {
    setResults([]);
    setComparison(null);
    setError(null);
  }, []);
  
  // Derived data
  const cheapestApartment = useMemo(() => {
    if (results.length === 0) return null;
    return results.reduce((min, apt) => 
      apt.trueMonthlyCost < min.trueMonthlyCost ? apt : min
    );
  }, [results]);
  
  const bestValueApartment = useMemo(() => {
    if (results.length === 0) return null;
    return results.reduce((best, apt) => 
      apt.vsAverageTrue < best.vsAverageTrue ? apt : best
    );
  }, [results]);
  
  const totalPotentialSavings = useMemo(() => {
    if (!comparison || results.length === 0) return 0;
    const maxTrue = Math.max(...results.map(r => r.trueMonthlyCost));
    const minTrue = Math.min(...results.map(r => r.trueMonthlyCost));
    return maxTrue - minTrue;
  }, [comparison, results]);
  
  return {
    // State
    userInputs,
    results,
    comparison,
    isCalculating,
    error,
    
    // Actions
    updateInputs,
    setWorkAddress,
    setGymAddress,
    calculateCosts,
    clearResults,
    
    // Derived data
    cheapestApartment,
    bestValueApartment,
    totalPotentialSavings,
    
    // Formatting helpers
    formatCost: formatCurrency,
    formatDelta: formatSavings,
  };
}

// ============================================
// USE GOOGLE PLACES AUTOCOMPLETE HOOK
// ============================================

interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface UseGooglePlacesReturn {
  predictions: PlacePrediction[];
  isLoading: boolean;
  error: string | null;
  search: (query: string) => void;
  getPlaceDetails: (placeId: string) => Promise<{
    address: string;
    coordinates: Coordinates;
  } | null>;
  clearPredictions: () => void;
}

export function useGooglePlaces(apiKey: string): UseGooglePlacesReturn {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const search = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setPredictions([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In production, this calls Google Places Autocomplete API
      // You'd typically proxy this through your backend
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=address&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK') {
        setPredictions(data.predictions);
      } else {
        setPredictions([]);
      }
    } catch (err) {
      setError('Failed to fetch suggestions');
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);
  
  const getPlaceDetails = useCallback(async (placeId: string) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,geometry&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.result) {
        return {
          address: data.result.formatted_address,
          coordinates: {
            lat: data.result.geometry.location.lat,
            lng: data.result.geometry.location.lng,
          },
        };
      }
    } catch (err) {
      console.error('Failed to get place details:', err);
    }
    return null;
  }, [apiKey]);
  
  const clearPredictions = useCallback(() => {
    setPredictions([]);
  }, []);
  
  return {
    predictions,
    isLoading,
    error,
    search,
    getPlaceDetails,
    clearPredictions,
  };
}

// ============================================
// USE GAS PRICES HOOK
// ============================================

interface UseGasPricesReturn {
  gasPrice: number;
  stateAverage: number | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  setManualPrice: (price: number) => void;
}

export function useGasPrices(stateCode?: string): UseGasPricesReturn {
  const [gasPrice, setGasPrice] = useState(3.50); // default
  const [stateAverage, setStateAverage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchGasPrices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // EIA API for gas prices
      // In production, you'd use: https://api.eia.gov/v2/petroleum/pri/gnd/data/
      // For now, use approximate state averages
      
      const stateAverages: Record<string, number> = {
        CA: 4.89,
        TX: 2.89,
        NY: 3.49,
        FL: 3.29,
        WA: 4.19,
        CO: 3.19,
        // ... more states
      };
      
      const avg = stateCode ? stateAverages[stateCode] : null;
      if (avg) {
        setStateAverage(avg);
        setGasPrice(avg);
      }
    } catch (err) {
      setError('Failed to fetch gas prices');
    } finally {
      setIsLoading(false);
    }
  }, [stateCode]);
  
  const setManualPrice = useCallback((price: number) => {
    setGasPrice(price);
  }, []);
  
  return {
    gasPrice,
    stateAverage,
    isLoading,
    error,
    refresh: fetchGasPrices,
    setManualPrice,
  };
}

// ============================================
// MOCK DATA HOOK (for development)
// ============================================

interface MockApartment extends ApartmentForCalculation {
  name: string;
  imageUrl?: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
}

export function useMockApartments(): MockApartment[] {
  return useMemo(() => [
    {
      id: 'apt-1',
      name: 'The Broadstone at Midtown',
      address: '1015 Northside Dr NW, Atlanta, GA 30318',
      coordinates: { lat: 33.7866, lng: -84.4073 },
      baseRent: 1850,
      parkingIncluded: false,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 750,
    },
    {
      id: 'apt-2',
      name: 'Camden Buckhead Square',
      address: '3060 Peachtree Rd NW, Atlanta, GA 30305',
      coordinates: { lat: 33.8404, lng: -84.3797 },
      baseRent: 1650,
      parkingIncluded: true,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 680,
    },
    {
      id: 'apt-3',
      name: 'The Exchange at Vinings',
      address: '2800 Paces Ferry Rd SE, Atlanta, GA 30339',
      coordinates: { lat: 33.8627, lng: -84.4655 },
      baseRent: 1450,
      parkingIncluded: true,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 720,
    },
    {
      id: 'apt-4',
      name: 'Cortland at the Battery',
      address: '875 Battery Ave SE, Atlanta, GA 30339',
      coordinates: { lat: 33.8896, lng: -84.4685 },
      baseRent: 1350,
      parkingIncluded: true,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 695,
    },
    {
      id: 'apt-5',
      name: 'AMLI West Plano at Granite Park',
      address: '2175 E West Connector, Austell, GA 30106',
      coordinates: { lat: 33.8148, lng: -84.6327 },
      baseRent: 1275,
      parkingIncluded: true,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 710,
    },
  ], []);
}
