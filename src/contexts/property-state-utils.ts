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

export const defaultSearchFilters: SearchFilters = {
  location: 'Atlanta, GA',
  priceRange: [1000, 5000],
  bedrooms: 1,
  amenities: [],
  viewMode: 'map',
  sortBy: 'combinedScore',
  filterBy: 'all'
}

export const defaultUserPreferences: UserPreferences = {
  budget: 2500,
  location: 'Atlanta, GA',
  moveInDate: '',
  hasCompletedOnboarding: false,
  lastActiveDate: new Date().toISOString()
}

export const safeParseJSON = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key)
    return saved ? (JSON.parse(saved) as T) : defaultValue
  } catch (error) {
    // Log and return default
    console.error(`Error parsing localStorage key "${key}":`, error)
    return defaultValue
  }
}
