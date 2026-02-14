// ============================================
// UNIFIED AI TYPES
// Single source of truth for all AI inputs
// Combines: Location Intelligence + Program AI + Market Intel + Concessions
// ============================================

export interface Concession {
  type: 'weeks_free' | 'months_free' | 'dollar_amount' | 'percent_off';
  value: number; // weeks, months, dollars, or percentage
  description: string;
  duration?: number; // months the discount applies (default: 12)
}

export interface PointOfInterest {
  id: string;
  name: string;
  address: string;
  category: 'work' | 'gym' | 'grocery' | 'daycare' | 'school' | 'medical' | 'pet' | 'religious' | 'dining' | 'nightlife' | 'entertainment' | 'library' | 'coworking' | 'park' | 'beach' | 'coffee' | 'custom';
  priority: 'high' | 'medium' | 'low';
  coordinates?: { lat: number; lng: number };
  maxTime?: number; // max acceptable commute time in minutes
  transportMode?: 'driving' | 'transit' | 'walking' | 'biking';
}

export interface CommutePreferences {
  daysPerWeek: number;
  vehicleMpg: number;
  gasPrice: number;
  transitPass: number;
  timeValuePerHour?: number; // How much you value your time ($/hr)
}

export interface MarketContext {
  region: string;
  leverageScore: number; // 0-100
  daysOnMarket: number;
  inventoryLevel: number; // months of supply
  rentTrend: number; // % change YoY
  negotiationPower: 'weak' | 'moderate' | 'strong';
  rentVsBuyRecommendation: 'rent' | 'buy' | 'neutral';
  propertyValue?: number;
  timeHorizon?: number; // years
  annualIncome?: number;
  currentSavings?: number;
  medianRent?: number;
}

export interface AIPreferences {
  bedrooms: string;
  bathrooms?: string;
  sqft?: { min?: number; max?: number };
  furnished?: boolean;

  buildingAmenities?: {
    fitnessCenter?: boolean;
    pool?: 'none' | 'indoor' | 'outdoor' | 'both';
    elevator?: boolean;
    packageRoom?: boolean;
    laundry?: 'in-unit' | 'in-building' | 'shared' | 'none';
    businessCenter?: boolean;
    rooftopDeck?: boolean;
    courtyard?: boolean;
    bikeStorage?: boolean;
    storageUnits?: boolean;
    controlledAccess?: boolean;
    doorman?: boolean;
    conciergeService?: boolean;
  };

  inUnitFeatures?: {
    airConditioning?: 'central' | 'window' | 'none';
    heating?: 'central' | 'radiator' | 'heat-pump' | 'none';
    dishwasher?: boolean;
    garbageDisposal?: boolean;
    washerDryer?: 'in-unit' | 'hookups' | 'none';
    balcony?: boolean;
    patio?: boolean;
    walkInClosets?: boolean;
    hardwoodFloors?: boolean;
    fireplace?: boolean;
    highCeilings?: boolean;
    updatedKitchen?: boolean;
    stainlessSteelAppliances?: boolean;
    graniteCountertops?: boolean;
  };

  utilities?: {
    heatIncluded?: boolean;
    waterIncluded?: boolean;
    electricIncluded?: boolean;
    gasIncluded?: boolean;
    trashIncluded?: boolean;
    highSpeedInternet?: boolean;
    cableReady?: boolean;
  };

  petPolicy?: {
    dogsAllowed?: boolean;
    catsAllowed?: boolean;
    petSizeRestrictions?: 'none' | 'small' | 'medium' | 'large';
    maxPetDeposit?: number;
  };

  parking?: {
    parkingIncluded?: boolean;
    garageParking?: boolean;
    coveredParking?: boolean;
    streetParking?: boolean;
    evCharging?: boolean;
  };

  accessibility?: {
    wheelchairAccessible?: boolean;
    firstFloorAvailable?: boolean;
    elevatorAccess?: boolean;
  };

  safety?: {
    securitySystem?: boolean;
    videoSurveillance?: boolean;
    gatedCommunity?: boolean;
    onsiteSecurity?: boolean;
  };

  leaseTerms?: {
    shortTermLease?: boolean;
    monthToMonth?: boolean;
    flexibleLength?: boolean;
    preferredTerm?: 6 | 9 | 12 | 15 | 18 | 24;
  };

  locationPrefs?: {
    nearPublicTransit?: boolean;
    walkabilityScoreMin?: number;
    nearGroceryStores?: boolean;
    nearParks?: boolean;
    quietNeighborhood?: boolean;
  };

  amenities: string[];
  dealBreakers: string[];
  priorities: string[];

  walkabilityScore?: number;
  transitAccess?: string;
  crimeRate?: string;
  schoolQuality?: string;
  lifestyle?: string;
  workSchedule?: string;
  bio?: string;
  useCase?: string;
  additionalNotes?: string;
}

export interface UnifiedAIInputs {
  // Basic Search (Step 1)
  budget: number;
  location: string;
  zipCode?: string;
  moveInDate?: Date;
  
  // Current Lease Info (Step 1)
  currentRentalRate?: number;
  leaseExpirationDate?: string; // ISO date string (YYYY-MM-DD)
  
  // POIs (Step 2)
  pointsOfInterest: PointOfInterest[];
  
  // Lifestyle & Commute (Step 3)
  commutePreferences: CommutePreferences;
  
  // Market Intelligence (Step 4)
  marketContext?: MarketContext;
  
  // AI Preferences (Step 5)
  aiPreferences: AIPreferences;
  
  // Setup tracking
  hasCompletedSetup: boolean;
  setupProgress: number; // 0-100
  completedSteps: number[]; // [1, 2, 3, 4, 5]
  missingInputs: string[];
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  lastUsedAt?: Date;
}

export interface ApartmentWithConcessions {
  id: string;
  name: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  
  // Rent info
  baseRent: number;
  concessions: Concession[];
  effectiveRent?: number; // Calculated
  
  // Property details
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  amenities: string[];
  
  // Additional costs
  parkingIncluded: boolean;
  parkingCost?: number;
  petDeposit?: number;
  applicationFee?: number;
  
  // Metadata
  yearBuilt?: number;
  daysOnMarket?: number;
  available?: boolean;
  images?: string[];
}

export interface SmartScore {
  overall: number; // 0-100
  
  // Component scores
  locationScore: number; // 0-100
  preferenceScore: number; // 0-100
  marketScore: number; // 0-100
  valueScore: number; // 0-100 (concessions, deals)
  
  // Breakdown
  components: {
    location: {
      score: number;
      commuteTime: number; // minutes
      commuteCost: number; // $/month
      trueCost: number; // effective rent + location costs
      savings: number; // vs average
      poiDistances: Array<{
        poiId: string;
        poiName: string;
        distance: number; // miles
        time: number; // minutes
        cost: number; // monthly
      }>;
    };
    preferences: {
      score: number;
      budgetMatch: boolean;
      amenityMatches: string[];
      amenityMisses: string[];
      dealBreakerViolations: string[];
      walkabilityMatch: boolean;
      transitMatch: boolean;
    };
    market: {
      score: number;
      leverageScore: number;
      negotiationPower: string;
      recommendedDiscount: number; // $/month
      rentVsBuy: string;
      urgency: 'low' | 'medium' | 'high';
    };
    value: {
      score: number;
      concessionValue: number; // $/month
      concessionPercent: number; // %
      totalAnnualSavings: number;
    };
  };
  
  // Explanation
  reasoning: string;
  topReasons: string[];
  warnings: string[];
  negotiationTips: string[];
  
  // Ranking
  rank?: number;
  isTopPick: boolean;
}

export interface ScoredApartment extends ApartmentWithConcessions {
  smartScore: SmartScore;
  trueCost: number;
  effectiveRent: number;
}

export interface UnifiedAIContext extends UnifiedAIInputs {
  // Calculated results
  scoredApartments: ScoredApartment[];
  
  // State management
  isCalculating: boolean;
  lastCalculated?: Date;
  error?: string;
  
  // Actions
  updateInputs: (updates: Partial<UnifiedAIInputs>) => void;
  addPOI: (poi: PointOfInterest) => void;
  removePOI: (poiId: string) => void;
  updateMarketContext: (context: Partial<MarketContext>) => void;
  calculateScores: () => Promise<void>;
  reset: () => void;
}

// Setup wizard step definitions
export interface SetupStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  required: boolean;
  estimatedMinutes: number;
  fields: string[];
}

export const SETUP_STEPS: SetupStep[] = [
  {
    id: 1,
    title: 'Basic Search',
    description: 'Location, budget, and move-in date',
    icon: 'MapPin',
    required: true,
    estimatedMinutes: 2,
    fields: ['location', 'zipCode', 'budget', 'bedrooms', 'moveInDate', 'currentRentalRate', 'leaseExpirationDate'],
  },
  {
    id: 2,
    title: 'Important Locations',
    description: 'Work, gym, grocery, and other frequent destinations',
    icon: 'Navigation',
    required: true,
    estimatedMinutes: 5,
    fields: ['pointsOfInterest'],
  },
  {
    id: 3,
    title: 'Lifestyle & Commute',
    description: 'Commute frequency, vehicle, and transit preferences',
    icon: 'Car',
    required: true,
    estimatedMinutes: 3,
    fields: ['commutePreferences'],
  },
  {
    id: 4,
    title: 'Market Intelligence',
    description: 'Income, savings, and negotiation leverage analysis',
    icon: 'TrendingUp',
    required: false,
    estimatedMinutes: 4,
    fields: ['marketContext'],
  },
  {
    id: 5,
    title: 'AI Preferences',
    description: 'Amenities, walkability, and lifestyle preferences',
    icon: 'Brain',
    required: false,
    estimatedMinutes: 5,
    fields: ['aiPreferences'],
  },
];

export default UnifiedAIInputs;
