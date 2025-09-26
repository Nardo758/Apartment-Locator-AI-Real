import { Property } from '@/data/mockData'
import { PartialOfferFormData } from '@/data/OfferFormTypes'

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

export interface PropertyStateContextType {
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  favoriteProperties: string[];
  setFavoriteProperties: (favorites: string[]) => void;
  toggleFavorite: (propertyId: string) => void;
  offerFormData: PartialOfferFormData;
  setOfferFormData: (data: PartialOfferFormData) => void;
  clearOfferFormData: () => void;
  searchFilters: SearchFilters;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  resetSearchFilters: () => void;
  userPreferences: UserPreferences;
  setUserPreferences: (preferences: Partial<UserPreferences>) => void;
  clearAllData: () => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}
