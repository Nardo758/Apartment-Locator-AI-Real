/**
 * Amenity Value Calculator
 * Calculates monthly dollar value of included amenities
 * 
 * Logic: If an amenity is included in rent, the renter doesn't pay for it elsewhere
 * This should REDUCE the True Monthly Cost
 */

// ============================================
// AMENITY MONTHLY VALUES
// ============================================

export const AMENITY_VALUES = {
  // Building Amenities (facilities you'd otherwise pay for)
  gym: 50,                    // Average gym membership
  pool: 0,                    // Recreational, no direct savings
  businessCenter: 0,          // Recreational/convenience
  rooftopDeck: 0,             // Recreational
  courtyard: 0,               // Recreational
  packageRoom: 5,             // Prevents missed deliveries, small value
  concierge: 0,               // Luxury convenience
  doorman: 0,                 // Security/convenience
  
  // Parking
  parkingIncluded: 150,       // Average parking spot rental
  garageParking: 200,         // Premium covered parking
  coveredParking: 175,        // Mid-tier covered
  
  // Laundry
  laundryInUnit: 40,          // Saves ~$40/mo laundromat trips
  laundryInBuilding: 20,      // Cheaper than laundromat, more than in-unit
  
  // Storage
  storageUnit: 100,           // External storage unit rental
  bikeStorage: 10,            // Bike parking alternative
  
  // Utilities (average monthly costs by region)
  heatIncluded: 80,           // Winter heating bills
  waterIncluded: 30,          // Water/sewer
  electricIncluded: 90,       // Electricity
  gasIncluded: 50,            // Natural gas
  trashIncluded: 15,          // Trash removal
  internetIncluded: 60,       // High-speed internet
  cableIncluded: 80,          // Cable TV
  
  // Pet-Related
  noPetDeposit: 0,            // One-time, not monthly
  noPetRent: 25,              // If property doesn't charge pet rent
  
  // Other
  elevatorAccess: 0,          // Convenience, no cost savings
} as const;

// ============================================
// TYPES
// ============================================

export interface AmenityValue {
  amenity: string;
  displayName: string;
  monthlySavings: number;
  category: 'facilities' | 'parking' | 'laundry' | 'storage' | 'utilities' | 'pets' | 'other';
  description: string;
}

export interface AmenitySavingsBreakdown {
  includedAmenities: AmenityValue[];
  totalMonthlySavings: number;
  byCategory: {
    facilities: number;
    parking: number;
    laundry: number;
    storage: number;
    utilities: number;
    pets: number;
    other: number;
  };
}

// ============================================
// AMENITY DETECTION
// ============================================

/**
 * Detect amenities from property features
 */
export function detectAmenities(property: {
  features?: string[];
  amenities?: string[];
  description?: string;
  utilities_included?: string[];
  parking_type?: string;
  laundry_type?: string;
  pet_policy?: any;
}): string[] {
  const detected: string[] = [];
  
  // Combine all text sources
  const allText = [
    ...(property.features || []),
    ...(property.amenities || []),
    property.description || '',
  ].join(' ').toLowerCase();
  
  // Building amenities
  if (allText.includes('gym') || allText.includes('fitness')) detected.push('gym');
  if (allText.includes('pool')) detected.push('pool');
  if (allText.includes('business center') || allText.includes('coworking')) detected.push('businessCenter');
  if (allText.includes('rooftop')) detected.push('rooftopDeck');
  if (allText.includes('courtyard') || allText.includes('garden')) detected.push('courtyard');
  if (allText.includes('package') || allText.includes('parcel locker')) detected.push('packageRoom');
  if (allText.includes('concierge')) detected.push('concierge');
  if (allText.includes('doorman')) detected.push('doorman');
  
  // Parking
  if (property.parking_type === 'included' || allText.includes('parking included')) {
    detected.push('parkingIncluded');
  }
  if (property.parking_type === 'garage' || allText.includes('garage parking')) {
    detected.push('garageParking');
  }
  if (property.parking_type === 'covered' || allText.includes('covered parking')) {
    detected.push('coveredParking');
  }
  
  // Laundry
  if (property.laundry_type === 'in-unit' || allText.includes('in-unit laundry') || allText.includes('washer dryer')) {
    detected.push('laundryInUnit');
  } else if (property.laundry_type === 'in-building' || allText.includes('on-site laundry')) {
    detected.push('laundryInBuilding');
  }
  
  // Storage
  if (allText.includes('storage unit') || allText.includes('additional storage')) detected.push('storageUnit');
  if (allText.includes('bike storage') || allText.includes('bike room')) detected.push('bikeStorage');
  
  // Utilities
  const utilitiesIncluded = property.utilities_included || [];
  if (utilitiesIncluded.includes('heat') || allText.includes('heat included')) detected.push('heatIncluded');
  if (utilitiesIncluded.includes('water') || allText.includes('water included')) detected.push('waterIncluded');
  if (utilitiesIncluded.includes('electric') || allText.includes('electric included')) detected.push('electricIncluded');
  if (utilitiesIncluded.includes('gas') || allText.includes('gas included')) detected.push('gasIncluded');
  if (utilitiesIncluded.includes('trash') || allText.includes('trash included')) detected.push('trashIncluded');
  if (utilitiesIncluded.includes('internet') || allText.includes('internet included')) detected.push('internetIncluded');
  if (utilitiesIncluded.includes('cable') || allText.includes('cable included')) detected.push('cableIncluded');
  
  // Pets
  if (property.pet_policy?.no_pet_rent || allText.includes('no pet rent')) detected.push('noPetRent');
  
  // Elevator
  if (allText.includes('elevator')) detected.push('elevatorAccess');
  
  return detected;
}

// ============================================
// AMENITY VALUE MAPPING
// ============================================

const AMENITY_DISPLAY_NAMES: Record<string, string> = {
  gym: 'Fitness Center',
  pool: 'Swimming Pool',
  businessCenter: 'Business Center',
  rooftopDeck: 'Rooftop Deck',
  courtyard: 'Courtyard/Garden',
  packageRoom: 'Package Room',
  concierge: 'Concierge Service',
  doorman: 'Doorman',
  parkingIncluded: 'Parking Included',
  garageParking: 'Garage Parking',
  coveredParking: 'Covered Parking',
  laundryInUnit: 'In-Unit Laundry',
  laundryInBuilding: 'In-Building Laundry',
  storageUnit: 'Storage Unit',
  bikeStorage: 'Bike Storage',
  heatIncluded: 'Heat Included',
  waterIncluded: 'Water Included',
  electricIncluded: 'Electric Included',
  gasIncluded: 'Gas Included',
  trashIncluded: 'Trash Included',
  internetIncluded: 'Internet Included',
  cableIncluded: 'Cable Included',
  noPetRent: 'No Pet Rent',
  elevatorAccess: 'Elevator Access',
};

const AMENITY_DESCRIPTIONS: Record<string, string> = {
  gym: 'Save on gym membership',
  parkingIncluded: 'No additional parking fees',
  garageParking: 'Premium covered parking',
  coveredParking: 'Protected parking spot',
  laundryInUnit: 'No laundromat trips needed',
  laundryInBuilding: 'Cheaper than laundromat',
  storageUnit: 'Extra storage space included',
  bikeStorage: 'Secure bike parking',
  heatIncluded: 'Winter heating costs covered',
  waterIncluded: 'Water/sewer included',
  electricIncluded: 'Electricity costs covered',
  gasIncluded: 'Natural gas included',
  trashIncluded: 'Trash removal included',
  internetIncluded: 'High-speed internet',
  cableIncluded: 'Cable TV service',
  noPetRent: 'No monthly pet fee',
  packageRoom: 'Secure package delivery',
  pool: 'Recreational amenity',
  businessCenter: 'Work from home space',
  rooftopDeck: 'Outdoor gathering space',
  courtyard: 'Green space access',
  concierge: 'Concierge service',
  doorman: '24/7 doorman',
  elevatorAccess: 'Elevator building',
};

const AMENITY_CATEGORIES: Record<string, AmenityValue['category']> = {
  gym: 'facilities',
  pool: 'facilities',
  businessCenter: 'facilities',
  rooftopDeck: 'facilities',
  courtyard: 'facilities',
  packageRoom: 'facilities',
  concierge: 'facilities',
  doorman: 'facilities',
  parkingIncluded: 'parking',
  garageParking: 'parking',
  coveredParking: 'parking',
  laundryInUnit: 'laundry',
  laundryInBuilding: 'laundry',
  storageUnit: 'storage',
  bikeStorage: 'storage',
  heatIncluded: 'utilities',
  waterIncluded: 'utilities',
  electricIncluded: 'utilities',
  gasIncluded: 'utilities',
  trashIncluded: 'utilities',
  internetIncluded: 'utilities',
  cableIncluded: 'utilities',
  noPetRent: 'pets',
  elevatorAccess: 'other',
};

// ============================================
// CALCULATE AMENITY VALUE
// ============================================

/**
 * Calculate total monthly savings from included amenities
 */
export function calculateAmenitySavings(detectedAmenities: string[]): AmenitySavingsBreakdown {
  const includedAmenities: AmenityValue[] = [];
  
  const byCategory = {
    facilities: 0,
    parking: 0,
    laundry: 0,
    storage: 0,
    utilities: 0,
    pets: 0,
    other: 0,
  };
  
  for (const amenity of detectedAmenities) {
    const value = AMENITY_VALUES[amenity as keyof typeof AMENITY_VALUES];
    
    if (value !== undefined) {
      const amenityValue: AmenityValue = {
        amenity,
        displayName: AMENITY_DISPLAY_NAMES[amenity] || amenity,
        monthlySavings: value,
        category: AMENITY_CATEGORIES[amenity] || 'other',
        description: AMENITY_DESCRIPTIONS[amenity] || '',
      };
      
      includedAmenities.push(amenityValue);
      byCategory[amenityValue.category] += value;
    }
  }
  
  const totalMonthlySavings = includedAmenities.reduce((sum, a) => sum + a.monthlySavings, 0);
  
  return {
    includedAmenities,
    totalMonthlySavings,
    byCategory,
  };
}

// ============================================
// CALCULATE TRUE COST WITH AMENITIES
// ============================================

/**
 * Calculate True Monthly Cost factoring in included amenities
 */
export function calculateTrueCostWithAmenities(
  baseRent: number,
  commuteCost: number,
  otherCosts: {
    parking?: number;
    gym?: number;
    grocery?: number;
    laundry?: number;
    utilities?: number;
  },
  property: {
    features?: string[];
    amenities?: string[];
    description?: string;
    utilities_included?: string[];
    parking_type?: string;
    laundry_type?: string;
    pet_policy?: any;
  }
): {
  baseRent: number;
  commuteCost: number;
  additionalCosts: number;
  amenitySavings: number;
  trueMonthlyCost: number;
  breakdown: AmenitySavingsBreakdown;
} {
  // Detect amenities
  const detectedAmenities = detectAmenities(property);
  
  // Calculate amenity savings
  const breakdown = calculateAmenitySavings(detectedAmenities);
  
  // Calculate additional costs (only if NOT included)
  let additionalCosts = 0;
  
  // Parking cost (if not included)
  if (!detectedAmenities.some(a => a.includes('parking')) && otherCosts.parking) {
    additionalCosts += otherCosts.parking;
  }
  
  // Gym cost (if no gym amenity)
  if (!detectedAmenities.includes('gym') && otherCosts.gym) {
    additionalCosts += otherCosts.gym;
  }
  
  // Laundry cost (if no in-unit/building laundry)
  if (!detectedAmenities.some(a => a.includes('laundry')) && otherCosts.laundry) {
    additionalCosts += otherCosts.laundry;
  }
  
  // Utilities cost (if not included)
  if (!detectedAmenities.some(a => a.includes('Included')) && otherCosts.utilities) {
    additionalCosts += otherCosts.utilities;
  }
  
  // Grocery cost (always applies)
  if (otherCosts.grocery) {
    additionalCosts += otherCosts.grocery;
  }
  
  // True cost = base rent + commute + additional costs - amenity savings
  const trueMonthlyCost = baseRent + commuteCost + additionalCosts - breakdown.totalMonthlySavings;
  
  return {
    baseRent,
    commuteCost,
    additionalCosts,
    amenitySavings: breakdown.totalMonthlySavings,
    trueMonthlyCost,
    breakdown,
  };
}

// ============================================
// HELPER: USER-FRIENDLY DISPLAY
// ============================================

/**
 * Format amenity savings for display
 */
export function formatAmenitySavings(breakdown: AmenitySavingsBreakdown): string {
  if (breakdown.includedAmenities.length === 0) {
    return 'No included amenities';
  }
  
  const topAmenities = breakdown.includedAmenities
    .filter(a => a.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)
    .slice(0, 3)
    .map(a => a.displayName);
  
  if (topAmenities.length === 0) {
    return `${breakdown.includedAmenities.length} amenities included`;
  }
  
  return `Save $${breakdown.totalMonthlySavings}/mo (${topAmenities.join(', ')})`;
}
