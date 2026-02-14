/**
 * Comprehensive Apartment Preferences Types
 * Used for property matching and filtering
 */

// ============================================
// BUILDING AMENITIES
// ============================================

export interface BuildingAmenities {
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
}

// ============================================
// IN-UNIT FEATURES
// ============================================

export interface InUnitFeatures {
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
  quartzCountertops?: boolean;
}

// ============================================
// UTILITIES & SERVICES
// ============================================

export interface UtilitiesServices {
  heatIncluded?: boolean;
  waterIncluded?: boolean;
  electricIncluded?: boolean;
  gasIncluded?: boolean;
  trashIncluded?: boolean;
  highSpeedInternet?: boolean;
  cableReady?: boolean;
}

// ============================================
// PET POLICY
// ============================================

export interface PetPolicy {
  dogsAllowed?: boolean;
  catsAllowed?: boolean;
  petSizeRestrictions?: 'none' | 'small' | 'medium' | 'large';
  maxPetWeight?: number;
  petDeposit?: number;
  petRent?: number;
  breedRestrictions?: boolean;
}

// ============================================
// PARKING
// ============================================

export interface ParkingOptions {
  parkingIncluded?: boolean;
  garageParking?: boolean;
  coveredParking?: boolean;
  streetParking?: boolean;
  evCharging?: boolean;
  parkingSpaces?: number;
  parkingFee?: number;
}

// ============================================
// ACCESSIBILITY
// ============================================

export interface AccessibilityFeatures {
  wheelchairAccessible?: boolean;
  firstFloorAvailable?: boolean;
  firstFloorRequired?: boolean;
  elevatorAccess?: boolean;
  wideDoorways?: boolean;
  rollInShower?: boolean;
}

// ============================================
// SAFETY & SECURITY
// ============================================

export interface SafetySecurity {
  securitySystem?: boolean;
  videoSurveillance?: boolean;
  gatedCommunity?: boolean;
  onsiteSecurity?: boolean;
  secureEntry?: boolean;
  fireAlarm?: boolean;
  sprinklerSystem?: boolean;
}

// ============================================
// LEASE TERMS
// ============================================

export interface LeaseTermPreferences {
  shortTermLeaseAvailable?: boolean;
  monthToMonthAvailable?: boolean;
  flexibleLeaseLength?: boolean;
  preferredLeaseTerm?: 6 | 9 | 12 | 15 | 18 | 24;
  moveInDateFlexibility?: 'flexible' | 'specific-date' | 'specific-month';
}

// ============================================
// LOCATION PREFERENCES
// ============================================

export interface LocationPreferences {
  nearPublicTransit?: boolean;
  maxTransitDistance?: number;
  walkabilityScoreMin?: number;
  nearGroceryStores?: boolean;
  maxGroceryDistance?: number;
  nearParks?: boolean;
  quietNeighborhood?: boolean;
  urbanSetting?: boolean;
  suburbanSetting?: boolean;
  maxCommuteTime?: number;
}

// ============================================
// COMPLETE PREFERENCES
// ============================================

export interface ComprehensiveApartmentPreferences {
  bedrooms: string;
  bathrooms?: string;
  squareFootageMin?: number;
  squareFootageMax?: number;
  furnished?: boolean;
  
  buildingAmenities?: BuildingAmenities;
  inUnitFeatures?: InUnitFeatures;
  utilities?: UtilitiesServices;
  petPolicy?: PetPolicy;
  parking?: ParkingOptions;
  accessibility?: AccessibilityFeatures;
  safety?: SafetySecurity;
  leaseTerms?: LeaseTermPreferences;
  location?: LocationPreferences;
  
  dealBreakers?: string[];
  mustHaves?: string[];
  niceToHaves?: string[];
}

// ============================================
// PREFERENCE MATCHING SCORE
// ============================================

export interface PreferenceMatchScore {
  totalScore: number;
  matchedFeatures: string[];
  missingFeatures: string[];
  dealBreakersPresent: string[];
  mustHavesMatched: number;
  niceToHavesMatched: number;
  breakdown: {
    basicRequirements: number;
    buildingAmenities: number;
    inUnitFeatures: number;
    location: number;
    petPolicy: number;
    parking: number;
  };
}

// ============================================
// PREFERENCE PRESETS
// ============================================

export const PREFERENCE_PRESETS = {
  budget_conscious: {
    name: 'Budget Conscious',
    description: 'Focus on essentials, minimal amenities',
    preferences: {
      bedrooms: '1',
      bathrooms: '1',
      utilities: {
        heatIncluded: true,
        waterIncluded: true,
      },
      mustHaves: ['in-building laundry', 'heat included'],
      niceToHaves: ['parking'],
    },
  },
  
  luxury_seeker: {
    name: 'Luxury Seeker',
    description: 'Premium features and amenities',
    preferences: {
      bedrooms: '2',
      bathrooms: '2',
      squareFootageMin: 1000,
      buildingAmenities: {
        fitnessCenter: true,
        pool: 'both',
        conciergeService: true,
        packageRoom: true,
      },
      inUnitFeatures: {
        airConditioning: 'central',
        washerDryer: 'in-unit',
        hardwoodFloors: true,
        graniteCountertops: true,
        stainlessSteelAppliances: true,
      },
      parking: {
        garageParking: true,
      },
      mustHaves: ['in-unit laundry', 'gym', 'parking', 'modern kitchen'],
    },
  },
  
  pet_owner: {
    name: 'Pet Owner',
    description: 'Pet-friendly with outdoor space',
    preferences: {
      bedrooms: '1',
      petPolicy: {
        dogsAllowed: true,
        catsAllowed: true,
      },
      buildingAmenities: {
        courtyard: true,
      },
      location: {
        nearParks: true,
      },
      mustHaves: ['pets allowed', 'near parks'],
      dealBreakers: ['no_pets'],
    },
  },
  
  remote_worker: {
    name: 'Remote Worker',
    description: 'Home office features',
    preferences: {
      bedrooms: '2',
      squareFootageMin: 800,
      buildingAmenities: {
        businessCenter: true,
      },
      inUnitFeatures: {
        airConditioning: 'central',
      },
      utilities: {
        highSpeedInternet: true,
      },
      location: {
        quietNeighborhood: true,
      },
      mustHaves: ['extra room', 'high-speed internet', 'quiet neighborhood'],
    },
  },
  
  car_free: {
    name: 'Car Free',
    description: 'Public transit focused',
    preferences: {
      bedrooms: '1',
      location: {
        nearPublicTransit: true,
        maxTransitDistance: 0.5,
        walkabilityScoreMin: 80,
        nearGroceryStores: true,
      },
      mustHaves: ['near transit', 'walkable'],
      niceToHaves: ['bike storage'],
    },
  },
} as const;

// ============================================
// HELPER TYPES
// ============================================

export type PresetKey = keyof typeof PREFERENCE_PRESETS;

export interface PreferenceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  fields: string[];
}

export const PREFERENCE_CATEGORIES: PreferenceCategory[] = [
  {
    id: 'basic',
    name: 'Basic Requirements',
    icon: 'home',
    description: 'Bedrooms, bathrooms, size',
    fields: ['bedrooms', 'bathrooms', 'squareFootage', 'furnished'],
  },
  {
    id: 'building',
    name: 'Building Amenities',
    icon: 'building',
    description: 'Gym, pool, common areas',
    fields: ['fitnessCenter', 'pool', 'elevator', 'businessCenter'],
  },
  {
    id: 'unit',
    name: 'In-Unit Features',
    icon: 'home',
    description: 'Kitchen, appliances, flooring',
    fields: ['airConditioning', 'washerDryer', 'dishwasher', 'hardwoodFloors'],
  },
  {
    id: 'utilities',
    name: 'Utilities & Services',
    icon: 'zap',
    description: 'What\'s included in rent',
    fields: ['heatIncluded', 'waterIncluded', 'highSpeedInternet'],
  },
  {
    id: 'pets',
    name: 'Pet Policy',
    icon: 'paw-print',
    description: 'Dogs, cats, restrictions',
    fields: ['dogsAllowed', 'catsAllowed', 'petSizeRestrictions'],
  },
  {
    id: 'parking',
    name: 'Parking',
    icon: 'car',
    description: 'Garage, covered, street',
    fields: ['parkingIncluded', 'garageParking', 'evCharging'],
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    icon: 'accessibility',
    description: 'Wheelchair, elevator access',
    fields: ['wheelchairAccessible', 'firstFloorAvailable', 'elevatorAccess'],
  },
  {
    id: 'safety',
    name: 'Safety & Security',
    icon: 'shield',
    description: 'Security system, gated community',
    fields: ['securitySystem', 'videoSurveillance', 'gatedCommunity'],
  },
  {
    id: 'lease',
    name: 'Lease Terms',
    icon: 'file-text',
    description: 'Short-term, flexible, month-to-month',
    fields: ['shortTermLeaseAvailable', 'monthToMonthAvailable'],
  },
  {
    id: 'location',
    name: 'Location Preferences',
    icon: 'map-pin',
    description: 'Transit, walkability, neighborhood',
    fields: ['nearPublicTransit', 'walkabilityScoreMin', 'nearParks'],
  },
];
