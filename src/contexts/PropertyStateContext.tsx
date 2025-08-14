import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property } from '@/data/mockData';

interface PropertyStateContextType {
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  offerFormData: any;
  setOfferFormData: (data: any) => void;
  searchFilters: {
    location: string;
    priceRange: [number, number];
    bedrooms: number;
    amenities: string[];
  };
  setSearchFilters: (filters: any) => void;
  favoriteProperties: string[];
  setFavoriteProperties: (favorites: string[]) => void;
  userPreferences: {
    budget: number;
    location: string;
    moveInDate: string;
  };
  setUserPreferences: (preferences: any) => void;
}

const PropertyStateContext = createContext<PropertyStateContextType | undefined>(undefined);

export const PropertyStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [offerFormData, setOfferFormData] = useState<any>({});
  const [searchFilters, setSearchFilters] = useState({
    location: 'Austin, TX',
    priceRange: [1000, 5000] as [number, number],
    bedrooms: 1,
    amenities: []
  });
  const [favoriteProperties, setFavoriteProperties] = useState<string[]>([]);
  const [userPreferences, setUserPreferences] = useState({
    budget: 2500,
    location: 'Austin, TX',
    moveInDate: ''
  });

  // Persist state to localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('apartmentiq-favorites');
    if (savedFavorites) {
      setFavoriteProperties(JSON.parse(savedFavorites));
    }

    const savedPreferences = localStorage.getItem('apartmentiq-preferences');
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    }

    const savedFilters = localStorage.getItem('apartmentiq-filters');
    if (savedFilters) {
      setSearchFilters(JSON.parse(savedFilters));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('apartmentiq-favorites', JSON.stringify(favoriteProperties));
  }, [favoriteProperties]);

  useEffect(() => {
    localStorage.setItem('apartmentiq-preferences', JSON.stringify(userPreferences));
  }, [userPreferences]);

  useEffect(() => {
    localStorage.setItem('apartmentiq-filters', JSON.stringify(searchFilters));
  }, [searchFilters]);

  return (
    <PropertyStateContext.Provider
      value={{
        selectedProperty,
        setSelectedProperty,
        offerFormData,
        setOfferFormData,
        searchFilters,
        setSearchFilters,
        favoriteProperties,
        setFavoriteProperties,
        userPreferences,
        setUserPreferences,
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