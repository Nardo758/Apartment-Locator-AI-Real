import { apiRequest } from "./queryClient";

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  subscriptionTier?: string | null;
  subscriptionStatus?: string | null;
  userType?: 'renter' | 'landlord' | 'agent' | 'admin' | null;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface Property {
  id: string;
  externalId: string;
  source: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  latitude?: string;
  longitude?: string;
  minPrice?: number;
  maxPrice?: number;
  priceRange?: string;
  bedroomsMin?: number;
  bedroomsMax?: number;
  bathroomsMin?: string;
  bathroomsMax?: string;
  squareFeetMin?: number;
  squareFeetMax?: number;
  amenities?: Record<string, unknown>;
  features?: Record<string, unknown>;
  petPolicy?: Record<string, unknown>;
  parking?: Record<string, unknown>;
  utilities?: Record<string, unknown>;
  images?: string[];
  virtualTourUrl?: string;
  description?: string;
  propertyType?: string;
  yearBuilt?: number;
  unitsCount?: number;
  phone?: string;
  email?: string;
  website?: string;
  managementCompany?: string;
  aiDescription?: string;
  aiTags?: string[];
  sentimentScore?: string;
  listingUrl: string;
  lastSeen?: string;
  firstScraped?: string;
  lastUpdated?: string;
  isActive?: boolean;
}

export interface SavedApartment {
  id: string;
  userId: string;
  apartmentId: string;
  notes?: string;
  rating?: number;
  createdAt?: string;
}

export interface SearchHistoryEntry {
  id: string;
  userId: string;
  searchParameters: Record<string, unknown>;
  resultsCount?: number;
  searchLocation?: Record<string, unknown>;
  radius?: number;
  createdAt?: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  preferredCities?: string[];
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: string;
  requiredAmenities?: string[];
  emailAlerts?: boolean;
  priceDropAlerts?: boolean;
  newListingAlerts?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPoi {
  id: string;
  userId: string;
  name: string;
  address: string;
  category: string;
  latitude: string;
  longitude: string;
  notes?: string;
  priority?: number;
  createdAt?: string;
}

export interface MarketSnapshot {
  id: string;
  city: string;
  state: string;
  totalProperties?: number;
  avgPrice?: number;
  medianPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  priceTrend7d?: string;
  priceTrend30d?: string;
  newListings7d?: number;
  newListings30d?: number;
  activeListings?: number;
  avgDaysOnMarket?: string;
  studiosCount?: number;
  oneBrCount?: number;
  twoBrCount?: number;
  threeBrCount?: number;
  snapshotDate?: string;
  createdAt?: string;
}

export const api = {
  async signUp(email: string, password: string, name?: string): Promise<AuthResponse> {
    const res = await apiRequest("POST", "/api/auth/signup", { email, password, name });
    return res.json();
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const res = await apiRequest("POST", "/api/auth/signin", { email, password });
    return res.json();
  },

  async googleAuth(credential: string): Promise<AuthResponse> {
    const res = await apiRequest("POST", "/api/auth/google", { credential });
    return res.json();
  },

  async getMe(token: string): Promise<{ user: AuthUser }> {
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to get user");
    return res.json();
  },

  async updateUserType(token: string, userType: 'renter' | 'landlord' | 'agent' | 'admin'): Promise<{ user: AuthUser }> {
    const res = await fetch("/api/auth/user-type", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userType }),
    });
    if (!res.ok) throw new Error("Failed to update user type");
    return res.json();
  },


  async getProperties(filters?: {
    city?: string;
    state?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    limit?: number;
  }): Promise<Property[]> {
    const params = new URLSearchParams();
    if (filters?.city) params.set("city", filters.city);
    if (filters?.state) params.set("state", filters.state);
    if (filters?.minPrice) params.set("minPrice", String(filters.minPrice));
    if (filters?.maxPrice) params.set("maxPrice", String(filters.maxPrice));
    if (filters?.bedrooms) params.set("bedrooms", String(filters.bedrooms));
    if (filters?.limit) params.set("limit", String(filters.limit));
    
    const url = `/api/properties${params.toString() ? `?${params}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch properties");
    return res.json();
  },

  async getPropertyById(id: string): Promise<Property> {
    const res = await fetch(`/api/properties/${id}`);
    if (!res.ok) throw new Error("Failed to fetch property");
    return res.json();
  },

  async getSavedApartments(userId: string): Promise<SavedApartment[]> {
    const res = await fetch(`/api/saved-apartments/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch saved apartments");
    return res.json();
  },

  async saveApartment(data: {
    userId: string;
    apartmentId: string;
    notes?: string;
    rating?: number;
  }): Promise<SavedApartment> {
    const res = await apiRequest("POST", "/api/saved-apartments", data);
    return res.json();
  },

  async removeSavedApartment(userId: string, apartmentId: string): Promise<void> {
    await apiRequest("DELETE", `/api/saved-apartments/${userId}/${apartmentId}`);
  },

  async getSearchHistory(userId: string, limit = 20): Promise<SearchHistoryEntry[]> {
    const res = await fetch(`/api/search-history/${userId}?limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch search history");
    return res.json();
  },

  async addSearchHistory(data: {
    userId: string;
    searchParameters: Record<string, unknown>;
    resultsCount?: number;
    searchLocation?: Record<string, unknown>;
    radius?: number;
  }): Promise<SearchHistoryEntry> {
    const res = await apiRequest("POST", "/api/search-history", data);
    return res.json();
  },

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const res = await fetch(`/api/preferences/${userId}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch preferences");
    return res.json();
  },

  async saveUserPreferences(data: {
    userId: string;
    preferredCities?: string[];
    maxPrice?: number;
    minBedrooms?: number;
    minBathrooms?: string;
    requiredAmenities?: string[];
    emailAlerts?: boolean;
    priceDropAlerts?: boolean;
    newListingAlerts?: boolean;
  }): Promise<UserPreferences> {
    const res = await apiRequest("POST", "/api/preferences", data);
    return res.json();
  },

  async getMarketSnapshots(city: string, state: string, limit = 30): Promise<MarketSnapshot[]> {
    const res = await fetch(`/api/market-snapshots/${city}/${state}?limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch market snapshots");
    return res.json();
  },

  async getUserPois(userId: string): Promise<UserPoi[]> {
    const res = await fetch(`/api/pois/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch POIs");
    return res.json();
  },

  async createUserPoi(data: {
    userId: string;
    name: string;
    address: string;
    category: string;
    latitude: number;
    longitude: number;
    notes?: string;
    priority?: number;
  }): Promise<UserPoi> {
    const res = await apiRequest("POST", "/api/pois", data);
    return res.json();
  },

  async deleteUserPoi(userId: string, poiId: string): Promise<void> {
    await apiRequest("DELETE", `/api/pois/${userId}/${poiId}`);
  },
};
