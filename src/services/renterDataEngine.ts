/**
 * Renter Data Engine
 * Manages all renter-specific data from forms and user inputs
 */

import { UserDataEngine } from './userDataEngine';

export interface POI {
  id: string;
  name: string;
  address: string;
  category: 'work' | 'gym' | 'grocery' | 'daycare' | 'school' | 'other';
  coordinates?: { lat: number; lng: number };
  priority: 'high' | 'medium' | 'low';
}

export interface RenterPreferences {
  bedrooms: string;
  bathrooms?: string;
  amenities: string[];
  dealBreakers: string[];
  petPolicy?: string;
  parkingNeeded?: boolean;
}

export interface CommuteSettings {
  daysPerWeek: number;
  vehicleMpg: number;
  gasPrice: number;
  transitPass: number;
  timeValuePerHour?: number;
}

export interface SearchHistory {
  id: string;
  query: string;
  location: string;
  budget: number;
  timestamp: Date;
  resultCount: number;
}

export interface RenterData {
  // Basic Info
  location: string;
  budget: number;
  zipCode?: string;
  moveInDate?: string;
  
  // Points of Interest
  pointsOfInterest: POI[];
  
  // Preferences
  preferences: RenterPreferences;
  
  // Commute
  commuteSettings: CommuteSettings;
  
  // Search History
  searchHistory: SearchHistory[];
  
  // Saved Properties
  savedPropertyIds: string[];
  
  // Setup Progress
  hasCompletedOnboarding: boolean;
  setupProgress: number;
  completedSteps: number[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Renter Data Engine
 */
export class RenterDataEngine extends UserDataEngine<RenterData> {
  constructor(userId: string) {
    super(userId, 'renter', {
      enableCache: true,
      autoRefresh: false,
      debug: false,
    });
  }
  
  /**
   * Default renter data structure
   */
  protected getDefaults(): RenterData {
    return {
      location: '',
      budget: 2500,
      zipCode: '',
      moveInDate: undefined,
      pointsOfInterest: [],
      preferences: {
        bedrooms: '1',
        bathrooms: '1',
        amenities: [],
        dealBreakers: [],
        petPolicy: undefined,
        parkingNeeded: false,
      },
      commuteSettings: {
        daysPerWeek: 5,
        vehicleMpg: 28,
        gasPrice: 3.50,
        transitPass: 100,
        timeValuePerHour: 25,
      },
      searchHistory: [],
      savedPropertyIds: [],
      hasCompletedOnboarding: false,
      setupProgress: 0,
      completedSteps: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  
  /**
   * Validate renter data
   */
  protected validate(data: RenterData): boolean {
    // Budget must be positive
    if (data.budget <= 0) {
      console.error('Budget must be greater than 0');
      return false;
    }
    
    // Bedrooms must be valid
    if (!data.preferences.bedrooms) {
      console.error('Bedrooms preference required');
      return false;
    }
    
    return true;
  }
  
  // ============================================
  // RENTER-SPECIFIC METHODS
  // ============================================
  
  /**
   * Update location
   */
  async updateLocation(location: string): Promise<void> {
    await this.save({ location } as Partial<RenterData>);
  }
  
  /**
   * Update budget
   */
  async updateBudget(budget: number): Promise<void> {
    await this.save({ budget } as Partial<RenterData>);
  }
  
  /**
   * Add point of interest
   */
  async addPOI(poi: POI): Promise<void> {
    const current = await this.load();
    const updated = {
      pointsOfInterest: [...current.pointsOfInterest, poi],
    };
    await this.save(updated as Partial<RenterData>);
  }
  
  /**
   * Remove point of interest
   */
  async removePOI(poiId: string): Promise<void> {
    const current = await this.load();
    const updated = {
      pointsOfInterest: current.pointsOfInterest.filter(p => p.id !== poiId),
    };
    await this.save(updated as Partial<RenterData>);
  }
  
  /**
   * Update preferences
   */
  async updatePreferences(preferences: Partial<RenterPreferences>): Promise<void> {
    const current = await this.load();
    const updated = {
      preferences: {
        ...current.preferences,
        ...preferences,
      },
    };
    await this.save(updated as Partial<RenterData>);
  }
  
  /**
   * Update commute settings
   */
  async updateCommuteSettings(settings: Partial<CommuteSettings>): Promise<void> {
    const current = await this.load();
    const updated = {
      commuteSettings: {
        ...current.commuteSettings,
        ...settings,
      },
    };
    await this.save(updated as Partial<RenterData>);
  }
  
  /**
   * Add to search history
   */
  async addSearchHistory(search: SearchHistory): Promise<void> {
    const current = await this.load();
    const updated = {
      searchHistory: [search, ...current.searchHistory].slice(0, 50), // Keep last 50
    };
    await this.save(updated as Partial<RenterData>);
  }
  
  /**
   * Save property
   */
  async saveProperty(propertyId: string): Promise<void> {
    const current = await this.load();
    if (!current.savedPropertyIds.includes(propertyId)) {
      const updated = {
        savedPropertyIds: [...current.savedPropertyIds, propertyId],
      };
      await this.save(updated as Partial<RenterData>);
    }
  }
  
  /**
   * Unsave property
   */
  async unsaveProperty(propertyId: string): Promise<void> {
    const current = await this.load();
    const updated = {
      savedPropertyIds: current.savedPropertyIds.filter(id => id !== propertyId),
    };
    await this.save(updated as Partial<RenterData>);
  }
  
  /**
   * Mark onboarding complete
   */
  async completeOnboarding(): Promise<void> {
    await this.save({
      hasCompletedOnboarding: true,
      setupProgress: 100,
    } as Partial<RenterData>);
  }
  
  /**
   * Update setup progress
   */
  async updateProgress(progress: number, completedSteps: number[]): Promise<void> {
    await this.save({
      setupProgress: progress,
      completedSteps,
    } as Partial<RenterData>);
  }
}
