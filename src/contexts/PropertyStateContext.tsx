import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Property } from '@/data/mockData';
import { toast } from 'sonner';

export interface SearchFilters {
  location: string;
  priceRange: [number, number];
  bedrooms: number;
  amenities: string[];
  viewMode?: 'map' | 'list';
  sortBy?: 'combinedScore' | 'locationScore' | 'price';
  filterBy?: 'all' | 'topPicks' | 'budgetMatch';
}

export interface UserPreferences {
  budget: number;
  location: string;
  moveInDate: string;
  hasCompletedOnboarding?: boolean;
  lastActiveDate?: string;
}

interface PropertyStateContextType {
  // Property management
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  favoriteProperties: string[];
  setFavoriteProperties: (favorites: string[]) => void;
  toggleFavorite: (propertyId: string) => void;
  
  // Form data
  offerFormData: any;
  setOfferFormData: (data: any) => void;
  clearOfferFormData: () => void;
  
  // Search & filters
  searchFilters: SearchFilters;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  resetSearchFilters: () => void;
  
  // User preferences
  userPreferences: UserPreferences;
  setUserPreferences: (preferences: Partial<UserPreferences>) => void;
  
  // State management
  clearAllData: () => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

const PropertyStateContext = createContext<PropertyStateContextType | undefined>(undefined);

const defaultSearchFilters: SearchFilters = {
  location: 'Austin, TX',
  priceRange: [1000, 5000],
  bedrooms: 1,
  amenities: [],
  viewMode: 'map',
  sortBy: 'combinedScore',
  filterBy: 'all'
};

const defaultUserPreferences: UserPreferences = {
  budget: 2500,
  location: 'Austin, TX',
  moveInDate: '',
  hasCompletedOnboarding: false,
  lastActiveDate: new Date().toISOString()
};

// Helper function to safely parse localStorage
const safeParseJSON = (key: string, defaultValue: any) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return defaultValue;
  }
};

export const PropertyStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [offerFormData, setOfferFormData] = useState<any>({});
  const [favoriteProperties, setFavoriteProperties] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [searchFilters, setSearchFiltersState] = useState<SearchFilters>(() => 
    safeParseJSON('apartmentiq-filters', defaultSearchFilters)
  );
  
  const [userPreferences, setUserPreferencesState] = useState<UserPreferences>(() => 
    safeParseJSON('apartmentiq-preferences', defaultUserPreferences)
  );

  // Load favorites on mount
  useEffect(() => {
    const savedFavorites = safeParseJSON('apartmentiq-favorites', []);
    setFavoriteProperties(savedFavorites);
  }, []);

  // Persist state to localStorage with error handling
  useEffect(() => {
    try {
      localStorage.setItem('apartmentiq-favorites', JSON.stringify(favoriteProperties));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
      toast.error('Failed to save favorites');
    }
  }, [favoriteProperties]);

  useEffect(() => {
    try {
      localStorage.setItem('apartmentiq-preferences', JSON.stringify(userPreferences));
    } catch (error) {
      console.error('Error saving preferences to localStorage:', error);
      toast.error('Failed to save preferences');
    }
  }, [userPreferences]);

  useEffect(() => {
    try {
      localStorage.setItem('apartmentiq-filters', JSON.stringify(searchFilters));
    } catch (error) {
      console.error('Error saving filters to localStorage:', error);
      toast.error('Failed to save search filters');
    }
  }, [searchFilters]);

  // Enhanced setter functions
  const setSearchFilters = useCallback((filters: Partial<SearchFilters>) => {
    setSearchFiltersState(prev => ({ ...prev, ...filters }));
    setHasUnsavedChanges(true);
  }, []);

  const setUserPreferences = useCallback((preferences: Partial<UserPreferences>) => {
    setUserPreferencesState(prev => ({ 
      ...prev, 
      ...preferences,
      lastActiveDate: new Date().toISOString()
    }));
    setHasUnsavedChanges(true);
  }, []);

  const toggleFavorite = useCallback((propertyId: string) => {
    setFavoriteProperties(prev => {
      const isFavorited = prev.includes(propertyId);
      const newFavorites = isFavorited 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId];
      
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
      return newFavorites;
    });
  }, []);

  const clearOfferFormData = useCallback(() => {
    setOfferFormData({});
  }, []);

  const resetSearchFilters = useCallback(() => {
    setSearchFiltersState(defaultSearchFilters);
  }, []);

  const clearAllData = useCallback(() => {
    setSelectedProperty(null);
    setOfferFormData({});
    setFavoriteProperties([]);
    setSearchFiltersState(defaultSearchFilters);
    setUserPreferencesState(defaultUserPreferences);
    setHasUnsavedChanges(false);
    
    // Clear localStorage
    localStorage.removeItem('apartmentiq-favorites');
    localStorage.removeItem('apartmentiq-preferences');
    localStorage.removeItem('apartmentiq-filters');
    
    toast.success('All data cleared');
  }, []);

  return (
    <PropertyStateContext.Provider
      value={{
        // Property management
        selectedProperty,
        setSelectedProperty,
        favoriteProperties,
        setFavoriteProperties,
        toggleFavorite,
        
        // Form data
        offerFormData,
        setOfferFormData,
        clearOfferFormData,
        
        // Search & filters
        searchFilters,
        setSearchFilters,
        resetSearchFilters,
        
        // User preferences
        userPreferences,
        setUserPreferences,
        
        // State management
        clearAllData,
        hasUnsavedChanges,
        setHasUnsavedChanges,
      }}
    >
      {children}
    </PropertyStateContext.Provider>
  );
};

export const usePropertyState = () => {
  const context = useContext(PropertyStateContext);
  if (context === undefined) {
    throw new Error('usePropertyState must be used within a PropertyStateProvider');
  }
  return context;
};