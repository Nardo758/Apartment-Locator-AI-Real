/**
 * Renter Data Engine
 * Manages all renter-specific data from forms and user inputs
 */

import { UserDataEngine } from './userDataEngine';
import { ComprehensiveApartmentPreferences } from '../types/apartmentPreferences';

export interface POI {
  id: string;
  name: string;
  address: string;
  category: 'work' | 'gym' | 'grocery' | 'daycare' | 'school' | 'other';
  coordinates?: { lat: number; lng: number };
  priority: 'high' | 'medium' | 'low';
}

// Re-export for backward compatibility
export type RenterPreferences = ComprehensiveApartmentPreferences;

// Legacy simple preferences (for migration)
export interface LegacyRenterPreferences {
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

export interface SavedMarketSnapshot {
  id: string;
  location: string;
  city: string;
  state: string;
  avgRent: number;
  medianRent: number;
  concessionRate: number;
  savedAt: Date;
}

export interface MarketPreferences {
  trackedLocations: { city: string; state: string }[];
  priceAlerts: { location: string; maxPrice: number; enabled: boolean }[];
  savedSnapshots: SavedMarketSnapshot[];
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
  
  // Market Intelligence (USER INPUT DATA)
  marketPreferences: MarketPreferences;
  
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
        squareFootageMin: undefined,
        squareFootageMax: undefined,
        furnished: false,
        buildingAmenities: {},
        inUnitFeatures: {},
        utilities: {},
        petPolicy: {},
        parking: {},
        accessibility: {},
        safety: {},
        leaseTerms: {},
        location: {},
        dealBreakers: [],
        mustHaves: [],
        niceToHaves: [],
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
      marketPreferences: {
        trackedLocations: [],
        priceAlerts: [],
        savedSnapshots: [],
      },
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
  
  // ============================================
  // MARKET INTELLIGENCE METHODS
  // ============================================
  
  /**
   * Track a location for market intel
   */
  async trackLocation(city: string, state: string): Promise<void> {
    const current = await this.load();
    const exists = current.marketPreferences.trackedLocations.some(
      l => l.city.toLowerCase() === city.toLowerCase() && l.state.toLowerCase() === state.toLowerCase()
    );
    
    if (!exists) {
      const updated = {
        marketPreferences: {
          ...current.marketPreferences,
          trackedLocations: [...current.marketPreferences.trackedLocations, { city, state }],
        },
      };
      await this.save(updated as Partial<RenterData>);
    }
  }
  
  /**
   * Untrack a location
   */
  async untrackLocation(city: string, state: string): Promise<void> {
    const current = await this.load();
    const updated = {
      marketPreferences: {
        ...current.marketPreferences,
        trackedLocations: current.marketPreferences.trackedLocations.filter(
          l => !(l.city.toLowerCase() === city.toLowerCase() && l.state.toLowerCase() === state.toLowerCase())
        ),
      },
    };
    await this.save(updated as Partial<RenterData>);
  }
  
  /**
   * Add price alert
   */
  async addPriceAlert(location: string, maxPrice: number): Promise<void> {
    const current = await this.load();
    const updated = {
      marketPreferences: {
        ...current.marketPreferences,
        priceAlerts: [
          ...current.marketPreferences.priceAlerts,
          { location, maxPrice, enabled: true },
        ],
      },
    };
    await this.save(updated as Partial<RenterData>);
  }
  
  /**
   * Remove price alert
   */
  async removePriceAlert(location: string): Promise<void> {
    const current = await this.load();
    const updated = {
      marketPreferences: {
        ...current.marketPreferences,
        priceAlerts: current.marketPreferences.priceAlerts.filter(a => a.location !== location),
      },
    };
    await this.save(updated as Partial<RenterData>);
  }
  
  /**
   * Save market snapshot
   */
  async saveMarketSnapshot(snapshot: SavedMarketSnapshot): Promise<void> {
    const current = await this.load();
    const updated = {
      marketPreferences: {
        ...current.marketPreferences,
        savedSnapshots: [snapshot, ...current.marketPreferences.savedSnapshots].slice(0, 20), // Keep last 20
      },
    };
    await this.save(updated as Partial<RenterData>);
  }
  
  /**
   * Get tracked locations
   */
  async getTrackedLocations(): Promise<{ city: string; state: string }[]> {
    const current = await this.load();
    return current.marketPreferences.trackedLocations;
  }
  
  // ============================================
  // COMPREHENSIVE PREFERENCES HELPERS
  // ============================================
  
  /**
   * Apply a preference preset (budget-conscious, luxury, pet-owner, etc.)
   */
  async applyPreset(presetName: string, customizations?: Partial<RenterPreferences>): Promise<void> {
    // Import presets dynamically to avoid circular deps
    const { PREFERENCE_PRESETS } = await import('../types/apartmentPreferences');
    const preset = PREFERENCE_PRESETS[presetName as keyof typeof PREFERENCE_PRESETS];
    
    if (!preset) {
      throw new Error(`Unknown preset: ${presetName}`);
    }
    
    const preferences = {
      ...preset.preferences,
      ...customizations,
    };
    
    await this.updatePreferences(preferences as Partial<RenterPreferences>);
  }
  
  /**
   * Add a must-have feature
   */
  async addMustHave(feature: string): Promise<void> {
    const current = await this.load();
    if (!current.preferences.mustHaves) {
      current.preferences.mustHaves = [];
    }
    
    if (!current.preferences.mustHaves.includes(feature)) {
      const updated = {
        preferences: {
          ...current.preferences,
          mustHaves: [...current.preferences.mustHaves, feature],
        },
      };
      await this.save(updated as Partial<RenterData>);
    }
  }
  
  /**
   * Remove a must-have feature
   */
  async removeMustHave(feature: string): Promise<void> {
    const current = await this.load();
    const updated = {
      preferences: {
        ...current.preferences,
        mustHaves: (current.preferences.mustHaves || []).filter(f => f !== feature),
      },
    };
    await this.save(updated as Partial<RenterData>);
  }
  
  /**
   * Add a nice-to-have feature
   */
  async addNiceToHave(feature: string): Promise<void> {
    const current = await this.load();
    if (!current.preferences.niceToHaves) {
      current.preferences.niceToHaves = [];
    }
    
    if (!current.preferences.niceToHaves.includes(feature)) {
      const updated = {
        preferences: {
          ...current.preferences,
          niceToHaves: [...current.preferences.niceToHaves, feature],
        },
      };
      await this.save(updated as Partial<RenterData>);
    }
  }
  
  /**
   * Add a deal breaker
   */
  async addDealBreaker(dealBreaker: string): Promise<void> {
    const current = await this.load();
    if (!current.preferences.dealBreakers) {
      current.preferences.dealBreakers = [];
    }
    
    if (!current.preferences.dealBreakers.includes(dealBreaker)) {
      const updated = {
        preferences: {
          ...current.preferences,
          dealBreakers: [...current.preferences.dealBreakers, dealBreaker],
        },
      };
      await this.save(updated as Partial<RenterData>);
    }
  }
  
  /**
   * Remove a deal breaker
   */
  async removeDealBreaker(dealBreaker: string): Promise<void> {
    const current = await this.load();
    const updated = {
      preferences: {
        ...current.preferences,
        dealBreakers: (current.preferences.dealBreakers || []).filter(d => d !== dealBreaker),
      },
    };
    await this.save(updated as Partial<RenterData>);
  }
  
  /**
   * Update building amenities
   */
  async updateBuildingAmenities(amenities: Partial<RenterPreferences['buildingAmenities']>): Promise<void> {
    const current = await this.load();
    const updated = {
      preferences: {
        ...current.preferences,
        buildingAmenities: {
          ...current.preferences.buildingAmenities,
          ...amenities,
        },
      },
    };
    await this.save(updated as Partial<RenterData>);
  }
  
  /**
   * Update in-unit features
   */
  async updateInUnitFeatures(features: Partial<RenterPreferences['inUnitFeatures']>): Promise<void> {
    const current = await this.load();
    const updated = {
      preferences: {
        ...current.preferences,
        inUnitFeatures: {
          ...current.preferences.inUnitFeatures,
          ...features,
        },
      },
    };
    await this.save(updated as Partial<RenterData>);
  }
  
  /**
   * Update parking preferences
   */
  async updateParkingPreferences(parking: Partial<RenterPreferences['parking']>): Promise<void> {
    const current = await this.load();
    const updated = {
      preferences: {
        ...current.preferences,
        parking: {
          ...current.preferences.parking,
          ...parking,
        },
      },
    };
    await this.save(updated as Partial<RenterData>);
  }
  
  /**
   * Update pet policy preferences
   */
  async updatePetPolicyPreferences(petPolicy: Partial<RenterPreferences['petPolicy']>): Promise<void> {
    const current = await this.load();
    const updated = {
      preferences: {
        ...current.preferences,
        petPolicy: {
          ...current.preferences.petPolicy,
          ...petPolicy,
        },
      },
    };
    await this.save(updated as Partial<RenterData>);
  }
  
  /**
   * Update location preferences
   */
  async updateLocationPreferences(location: Partial<RenterPreferences['location']>): Promise<void> {
    const current = await this.load();
    const updated = {
      preferences: {
        ...current.preferences,
        location: {
          ...current.preferences.location,
          ...location,
        },
      },
    };
    await this.save(updated as Partial<RenterData>);
  }
  
  /**
   * Get all preferences as a readable summary
   */
  async getPreferencesSummary(): Promise<{
    basics: string[];
    mustHaves: string[];
    niceToHaves: string[];
    dealBreakers: string[];
  }> {
    const current = await this.load();
    const prefs = current.preferences;
    
    const basics: string[] = [];
    if (prefs.bedrooms) basics.push(`${prefs.bedrooms} bedrooms`);
    if (prefs.bathrooms) basics.push(`${prefs.bathrooms} bathrooms`);
    if (prefs.squareFootageMin) basics.push(`Min ${prefs.squareFootageMin} sq ft`);
    if (prefs.squareFootageMax) basics.push(`Max ${prefs.squareFootageMax} sq ft`);
    
    return {
      basics,
      mustHaves: prefs.mustHaves || [],
      niceToHaves: prefs.niceToHaves || [],
      dealBreakers: prefs.dealBreakers || [],
    };
  }
}
