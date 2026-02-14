// ============================================
// LOCATION COST MODEL - TYPE DEFINITIONS
// ApartmentIQ - True Monthly Cost Calculator
// ============================================

// User's lifestyle inputs for cost calculation
export interface UserLocationInputs {
  // Work commute
  workAddress: string;
  workCoordinates?: Coordinates;
  commuteFrequency: number; // days per week
  commuteMode: 'driving' | 'transit' | 'bicycling' | 'walking';
  
  // Vehicle (if driving)
  vehicleMpg?: number;
  
  // Grocery preferences
  groceryFrequency: number; // trips per week
  preferredGroceryChain?: 'any' | 'wholefoods' | 'traderjoes' | 'kroger' | 'walmart' | 'costco';
  
  // Gym preferences
  hasGymMembership: boolean;
  gymAddress?: string;
  gymCoordinates?: Coordinates;
  gymVisitsPerWeek?: number;
  
  // Transit preferences
  usesPublicTransit: boolean;
  monthlyTransitPass?: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

// Cost breakdown for a single apartment
export interface ApartmentLocationCost {
  apartmentId: string;
  apartmentAddress: string;
  apartmentCoordinates: Coordinates;
  
  // Base rent from listing
  baseRent: number;
  
  // Calculated costs
  commuteCost: CommuteCost;
  parkingCost: ParkingCost;
  groceryCost: GroceryCost;
  gymCost: GymCost;
  transitSavings: TransitSavings;
  
  // Amenity savings (gym, parking, utilities included in rent)
  amenitySavings: {
    totalMonthlyValue: number;
    amenityNames: string[];
  };
  
  // Totals
  totalLocationCosts: number;
  trueMonthlyCost: number;
  
  // Comparison metrics
  vsAverageRent: number; // +/- compared to area average
  vsAverageTrue: number; // +/- compared to average true cost
  savingsRank?: number; // 1 = cheapest true cost in search
  
  // Metadata
  calculatedAt: Date;
  confidence: 'high' | 'medium' | 'low';
}

export interface CommuteCost {
  distanceMiles: number;
  durationMinutes: number;
  tripsPerMonth: number; // commuteFrequency * 4.3 weeks * 2 (round trip)
  
  // For driving
  gallonsPerMonth?: number;
  gasPricePerGallon?: number;
  fuelCostPerMonth?: number;
  
  // For transit
  transitCostPerMonth?: number;
  
  // Total
  totalMonthly: number;
  
  // Time cost (opportunity cost)
  hoursPerMonth: number;
  impliedHourlyCost?: number; // if user provides salary
}

export interface ParkingCost {
  streetParkingAvailable: boolean;
  averageMonthlyParking: number;
  parkingIncluded: boolean;
  estimatedMonthly: number;
  confidence: 'high' | 'medium' | 'low';
  source: 'listing' | 'neighborhood_avg' | 'estimate';
}

export interface GroceryCost {
  nearestGroceryStore: PlaceInfo;
  distanceMiles: number;
  tripsPerMonth: number;
  additionalGasCost: number;
  timeCostMinutes: number;
}

export interface GymCost {
  nearestGym?: PlaceInfo;
  distanceToPreferredGym?: number;
  tripsPerMonth: number;
  additionalGasCost: number;
  timeCostMinutes: number;
}

export interface TransitSavings {
  nearestTransitStop?: PlaceInfo;
  walkingDistanceMinutes?: number;
  transitScore: number; // 0-100
  potentialMonthlySavings: number;
  canReplaceCommute: boolean;
}

export interface PlaceInfo {
  name: string;
  address: string;
  coordinates: Coordinates;
  rating?: number;
  distanceMiles: number;
  drivingMinutes: number;
  walkingMinutes: number;
}

// Google Maps API response types
export interface DistanceMatrixResult {
  origin: string;
  destination: string;
  distance: {
    text: string;
    value: number; // meters
  };
  duration: {
    text: string;
    value: number; // seconds
  };
  status: string;
}

export interface PlacesSearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  opening_hours?: {
    open_now: boolean;
  };
  types: string[];
}

// Gas price data
export interface GasPriceData {
  stateAverage: number;
  localAverage?: number;
  lastUpdated: Date;
  source: 'eia' | 'gasbuddy' | 'manual';
}

// Parking data by neighborhood
export interface NeighborhoodParkingData {
  zipCode: string;
  neighborhood: string;
  averageMonthlyParking: number;
  streetParkingAvailability: 'abundant' | 'moderate' | 'scarce' | 'none';
  permitRequired: boolean;
  permitCost?: number;
  lastUpdated: Date;
  source: 'scraped' | 'manual' | 'estimate';
}

// Comparison/ranking types
export interface ApartmentComparison {
  apartments: ApartmentLocationCost[];
  cheapestByRent: string; // apartmentId
  cheapestByTrueCost: string; // apartmentId
  biggestSavings: {
    apartmentId: string;
    savingsVsAverage: number;
  };
  averageRent: number;
  averageTrueCost: number;
  medianTrueCost: number;
}

// UI State types
export interface LocationCostCalculatorState {
  userInputs: UserLocationInputs | null;
  isCalculating: boolean;
  results: ApartmentLocationCost[];
  comparison: ApartmentComparison | null;
  error: string | null;
  
  // Map state
  mapCenter: Coordinates;
  mapZoom: number;
  selectedApartmentId: string | null;
  showCostOverlay: boolean;
}

// API request/response types
export interface CalculateCostRequest {
  userInputs: UserLocationInputs;
  apartments: {
    id: string;
    address: string;
    coordinates?: Coordinates;
    baseRent: number;
    parkingIncluded?: boolean;
  }[];
}

export interface CalculateCostResponse {
  success: boolean;
  results: ApartmentLocationCost[];
  comparison: ApartmentComparison;
  warnings?: string[];
}

// Saved user preferences (for returning users)
export interface SavedLocationPreferences {
  userId: string;
  inputs: UserLocationInputs;
  lastUsed: Date;
  savedLocations: {
    name: string;
    address: string;
    coordinates: Coordinates;
    type: 'work' | 'gym' | 'grocery' | 'other';
  }[];
}
