import { UserDataEngine } from './userDataEngine';

export interface RenterData {
  location: {
    city: string;
    state: string;
    neighborhoods: string[];
  };
  budget: {
    min: number;
    max: number;
    includesUtilities: boolean;
  };
  preferences: {
    bedrooms: number;
    bathrooms: number;
    petFriendly: boolean;
    parking: boolean;
    laundry: 'in-unit' | 'on-site' | 'none' | '';
    amenities: string[];
  };
  commute: {
    workAddress: string;
    maxCommuteMinutes: number;
    commuteMode: 'driving' | 'transit' | 'walking' | 'cycling';
    commuteDays: number;
  };
  moveInDate: string;
  currentRent: number;
  leaseExpiration: string;
  savedPropertyIds: string[];
  searchHistory: string[];
  dealAlerts: boolean;
}

export class RenterDataEngine extends UserDataEngine<RenterData> {
  constructor(userId: string) {
    super(userId, 'renter');
  }

  getDefaults(): RenterData {
    return {
      location: {
        city: '',
        state: '',
        neighborhoods: [],
      },
      budget: {
        min: 800,
        max: 2500,
        includesUtilities: false,
      },
      preferences: {
        bedrooms: 1,
        bathrooms: 1,
        petFriendly: false,
        parking: false,
        laundry: '',
        amenities: [],
      },
      commute: {
        workAddress: '',
        maxCommuteMinutes: 30,
        commuteMode: 'driving',
        commuteDays: 5,
      },
      moveInDate: '',
      currentRent: 0,
      leaseExpiration: '',
      savedPropertyIds: [],
      searchHistory: [],
      dealAlerts: false,
    };
  }

  async updateLocation(city: string, state: string, neighborhoods?: string[]): Promise<RenterData> {
    return this.save({
      location: {
        city,
        state,
        neighborhoods: neighborhoods || this.getData()?.location.neighborhoods || [],
      },
    });
  }

  async updateBudget(min: number, max: number, includesUtilities?: boolean): Promise<RenterData> {
    return this.save({
      budget: {
        min,
        max,
        includesUtilities: includesUtilities ?? this.getData()?.budget.includesUtilities ?? false,
      },
    });
  }

  async updateCommute(commute: Partial<RenterData['commute']>): Promise<RenterData> {
    const current = this.getData()?.commute || this.getDefaults().commute;
    return this.save({
      commute: { ...current, ...commute },
    });
  }

  async addSavedProperty(propertyId: string): Promise<RenterData> {
    const current = this.getData()?.savedPropertyIds || [];
    if (!current.includes(propertyId)) {
      return this.save({ savedPropertyIds: [...current, propertyId] });
    }
    return this.getData() || this.getDefaults();
  }

  async removeSavedProperty(propertyId: string): Promise<RenterData> {
    const current = this.getData()?.savedPropertyIds || [];
    return this.save({ savedPropertyIds: current.filter(id => id !== propertyId) });
  }
}
