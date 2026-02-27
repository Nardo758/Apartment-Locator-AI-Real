import type { ScrapedProperty, SavingsBreakdown } from './savings-calculator';
import type { AIPreferences, MarketContext, CommutePreferences, PointOfInterest } from '@/types/unifiedAI.types';

export interface SmartScoreResult {
  overall: number;
  locationScore: number;
  preferenceScore: number;
  marketScore: number;
  valueScore: number;
  amenityMatches: string[];
  amenityMisses: string[];
  dealBreakerViolations: string[];
  budgetMatch: boolean;
  bedroomMatch: boolean;
  highlights: string[];
  warnings: string[];
}

export const AMENITY_KEYWORDS: Record<string, string[]> = {
  'Gym': ['gym', 'fitness', 'exercise', 'workout'],
  'Pool': ['pool', 'swimming'],
  'Elevator': ['elevator'],
  'Washer/Dryer': ['washer', 'dryer', 'w/d', 'in-unit laundry', 'in unit laundry'],
  'In-Building Laundry': ['laundry', 'laundry room', 'on-site laundry'],
  'Package Room': ['package', 'parcel', 'mail room'],
  'Business Center': ['business center', 'coworking', 'co-working'],
  'Rooftop Deck': ['rooftop', 'roof deck', 'sky lounge'],
  'Courtyard': ['courtyard', 'garden', 'outdoor space'],
  'Bike Storage': ['bike', 'bicycle'],
  'Storage': ['storage'],
  'Controlled Access': ['controlled access', 'gated', 'key fob', 'keycard', 'secure entry'],
  'Concierge': ['concierge', 'doorman'],
  'Parking': ['parking'],
  'Garage Parking': ['garage', 'covered parking'],
  'Covered Parking': ['covered parking', 'carport'],
  'EV Charging': ['ev charging', 'electric vehicle', 'ev station'],
  'Pet-Friendly': ['pet', 'dog', 'cat', 'animal'],
  'Balcony': ['balcony', 'patio', 'terrace', 'deck'],
  'Dishwasher': ['dishwasher'],
  'A/C': ['air conditioning', 'a/c', 'ac', 'central air', 'hvac'],
  'In-Unit W/D': ['in-unit w/d', 'washer/dryer in unit', 'in-unit washer', 'in unit w/d'],
  'Hardwood Floors': ['hardwood', 'wood floor'],
  'Updated Kitchen': ['updated kitchen', 'renovated kitchen', 'modern kitchen', 'granite', 'quartz', 'stainless'],
  'Walk-in Closets': ['walk-in closet', 'walk in closet', 'walkin closet'],
  'High Ceilings': ['high ceiling', 'tall ceiling', 'vaulted', '9 foot', '10 foot', '9ft', '10ft'],
  'Fireplace': ['fireplace'],
  'Stainless Steel': ['stainless steel', 'stainless appliance'],
  'Granite/Quartz Countertops': ['granite', 'quartz', 'countertop'],
  'Garbage Disposal': ['garbage disposal', 'disposal'],
  'Heat Included': ['heat included', 'heating included'],
  'Water Included': ['water included'],
  'Electric Included': ['electric included', 'electricity included'],
  'Gas Included': ['gas included'],
  'Trash Included': ['trash included', 'trash removal'],
  'Internet': ['internet', 'wifi', 'wi-fi'],
  'Cable': ['cable'],
  'Security System': ['security system', 'alarm system'],
  'Gated Community': ['gated community', 'gated access', 'gated entrance'],
  'Wheelchair Accessible': ['wheelchair', 'accessible', 'ada', 'handicap'],
  'Near Transit': ['transit', 'bus', 'metro', 'subway', 'train', 'rail'],
  'Near Parks': ['park', 'green space', 'trail'],
  'Quiet Neighborhood': ['quiet', 'peaceful', 'residential'],
};

function propertyHasAmenity(property: ScrapedProperty, amenityKey: string): boolean {
  const keywords = AMENITY_KEYWORDS[amenityKey];
  if (!keywords) return false;

  const searchableText = [
    ...(property.amenities || []),
    property.pet_policy || '',
    property.name || '',
  ].join(' ').toLowerCase();

  return keywords.some(kw => searchableText.includes(kw));
}

function calculateLocationScore(
  property: ScrapedProperty,
  budget: number,
  _pois: PointOfInterest[],
  _commutePrefs: CommutePreferences,
  savings: SavingsBreakdown
): number {
  let commuteQuality = 50;
  let poiProximity = 50;

  const effectiveRent = savings.monthlyRent;
  const trueCostSavings = budget > 0 && effectiveRent <= budget
    ? Math.min(100, ((budget - effectiveRent) / budget) * 200)
    : effectiveRent > budget
      ? Math.max(0, 50 - ((effectiveRent - budget) / budget) * 100)
      : 50;

  return Math.round(
    commuteQuality * 0.40 +
    poiProximity * 0.30 +
    trueCostSavings * 0.30
  );
}

function buildWantedFromStructured(preferences: AIPreferences): string[] {
  const extra: string[] = [];
  const ba = preferences.buildingAmenities;
  if (ba) {
    if (ba.fitnessCenter) extra.push('Gym');
    if (ba.pool && ba.pool !== 'none') extra.push('Pool');
    if (ba.elevator) extra.push('Elevator');
    if (ba.laundry === 'in-unit') extra.push('Washer/Dryer');
    if (ba.laundry === 'in-building') extra.push('In-Building Laundry');
    if (ba.packageRoom) extra.push('Package Room');
    if (ba.businessCenter) extra.push('Business Center');
    if (ba.rooftopDeck) extra.push('Rooftop Deck');
    if (ba.courtyard) extra.push('Courtyard');
    if (ba.bikeStorage) extra.push('Bike Storage');
    if (ba.storageUnits) extra.push('Storage');
    if (ba.controlledAccess) extra.push('Controlled Access');
    if (ba.conciergeService || ba.doorman) extra.push('Concierge');
  }
  const iu = preferences.inUnitFeatures;
  if (iu) {
    if (iu.airConditioning && iu.airConditioning !== 'none') extra.push('A/C');
    if (iu.dishwasher) extra.push('Dishwasher');
    if (iu.washerDryer === 'in-unit') extra.push('In-Unit W/D');
    if (iu.balcony || iu.patio) extra.push('Balcony');
    if (iu.hardwoodFloors) extra.push('Hardwood Floors');
    if (iu.walkInClosets) extra.push('Walk-in Closets');
    if (iu.highCeilings) extra.push('High Ceilings');
    if (iu.fireplace) extra.push('Fireplace');
    if (iu.updatedKitchen) extra.push('Updated Kitchen');
    if (iu.stainlessSteelAppliances) extra.push('Stainless Steel');
    if (iu.graniteCountertops) extra.push('Granite/Quartz Countertops');
    if (iu.garbageDisposal) extra.push('Garbage Disposal');
  }
  const ut = preferences.utilities;
  if (ut) {
    if (ut.heatIncluded) extra.push('Heat Included');
    if (ut.waterIncluded) extra.push('Water Included');
    if (ut.electricIncluded) extra.push('Electric Included');
    if (ut.gasIncluded) extra.push('Gas Included');
    if (ut.trashIncluded) extra.push('Trash Included');
    if (ut.highSpeedInternet) extra.push('Internet');
    if (ut.cableReady) extra.push('Cable');
  }
  const pk = preferences.parking;
  if (pk) {
    if (pk.parkingIncluded) extra.push('Parking');
    if (pk.garageParking) extra.push('Garage Parking');
    if (pk.coveredParking) extra.push('Covered Parking');
    if (pk.evCharging) extra.push('EV Charging');
  }
  const pet = preferences.petPolicy;
  if (pet) {
    if (pet.dogsAllowed || pet.catsAllowed) extra.push('Pet-Friendly');
  }
  const sf = preferences.safety;
  if (sf) {
    if (sf.securitySystem) extra.push('Security System');
    if (sf.gatedCommunity) extra.push('Gated Community');
  }
  const ac = preferences.accessibility;
  if (ac) {
    if (ac.wheelchairAccessible) extra.push('Wheelchair Accessible');
  }
  const lp = preferences.locationPrefs;
  if (lp) {
    if (lp.nearPublicTransit) extra.push('Near Transit');
    if (lp.nearParks) extra.push('Near Parks');
    if (lp.quietNeighborhood) extra.push('Quiet Neighborhood');
  }
  return extra;
}

function calculatePreferenceScore(
  property: ScrapedProperty,
  preferences: AIPreferences,
  budget: number,
  savings: SavingsBreakdown
): { score: number; amenityMatches: string[]; amenityMisses: string[]; dealBreakerViolations: string[]; budgetMatch: boolean; bedroomMatch: boolean } {
  const legacyAmenities = preferences.amenities || [];
  const structuredAmenities = buildWantedFromStructured(preferences);
  const wantedSet = new Set([...legacyAmenities, ...structuredAmenities]);
  const wantedAmenities = Array.from(wantedSet);
  const dealBreakers = preferences.dealBreakers || [];

  const amenityMatches: string[] = [];
  const amenityMisses: string[] = [];
  wantedAmenities.forEach(amenity => {
    if (propertyHasAmenity(property, amenity)) {
      amenityMatches.push(amenity);
    } else {
      amenityMisses.push(amenity);
    }
  });

  const amenityScore = wantedAmenities.length > 0
    ? (amenityMatches.length / wantedAmenities.length) * 35
    : 35;

  const effectiveRent = savings.monthlyRent;
  const budgetMatch = budget <= 0 || effectiveRent <= budget * 1.05;
  const budgetScore = budgetMatch ? 30 : Math.max(0, 30 - ((effectiveRent - budget) / budget) * 60);

  const dealBreakerViolations: string[] = [];
  dealBreakers.forEach(db => {
    const dbLower = db.toLowerCase();
    if (dbLower.includes('no pet') && !propertyHasAmenity(property, 'Pet-Friendly')) {
      dealBreakerViolations.push(db);
    }
    if (dbLower.includes('no parking') && !propertyHasAmenity(property, 'Parking')) {
      dealBreakerViolations.push(db);
    }
    if (dbLower.includes('no laundry') && !propertyHasAmenity(property, 'Washer/Dryer') && !propertyHasAmenity(property, 'In-Building Laundry')) {
      dealBreakerViolations.push(db);
    }
  });
  const dealBreakerScore = dealBreakerViolations.length > 0 ? 0 : 35;

  let bedroomMatch = true;
  const wantedBedrooms = preferences.bedrooms;
  if (wantedBedrooms && wantedBedrooms !== 'any' && property.bedrooms_min) {
    const wanted = wantedBedrooms === 'studio' ? 0 : parseInt(wantedBedrooms);
    if (!isNaN(wanted)) {
      const minBed = property.bedrooms_min;
      const maxBed = property.bedrooms_max || minBed;
      bedroomMatch = wanted >= minBed && wanted <= maxBed;
    }
  }

  const bedroomPenalty = bedroomMatch ? 0 : 15;

  const rawScore = Math.max(0, budgetScore + amenityScore + dealBreakerScore - bedroomPenalty);
  return {
    score: Math.round(Math.min(100, rawScore)),
    amenityMatches,
    amenityMisses,
    dealBreakerViolations,
    budgetMatch,
    bedroomMatch,
  };
}

function calculateMarketScore(marketContext?: MarketContext): number {
  if (!marketContext) return 50;
  return Math.round(Math.min(100, Math.max(0, marketContext.leverageScore || 50)));
}

function calculateValueScore(savings: SavingsBreakdown): number {
  if (!savings.hasSpecialOffer || savings.monthlyRent <= 0) {
    return Math.min(100, savings.dealScore);
  }
  const concessionPercent = (savings.monthlySavings / savings.monthlyRent) * 100;
  const rawValue = Math.min(100, concessionPercent * 10 + savings.dealScore * 0.5);
  return Math.round(rawValue);
}

const DEFAULT_PREFERENCES: AIPreferences = {
  bedrooms: 'any',
  amenities: [],
  dealBreakers: [],
  priorities: [],
};

export function calculateSmartScore(
  property: ScrapedProperty,
  savings: SavingsBreakdown,
  preferences?: AIPreferences | null,
  budget: number = 0,
  marketContext?: MarketContext,
  pois: PointOfInterest[] = [],
  commutePrefs?: CommutePreferences,
): SmartScoreResult {
  const prefs = preferences || DEFAULT_PREFERENCES;
  const locationScore = calculateLocationScore(
    property,
    budget,
    pois,
    commutePrefs || { daysPerWeek: 5, vehicleMpg: 25, gasPrice: 3.5, transitPass: 0 },
    savings
  );

  const prefResult = calculatePreferenceScore(property, prefs, budget, savings);
  const marketScore = calculateMarketScore(marketContext);
  const valueScore = calculateValueScore(savings);

  const overall = Math.round(
    locationScore * 0.25 +
    prefResult.score * 0.25 +
    marketScore * 0.25 +
    valueScore * 0.25
  );

  const highlights: string[] = [];
  const warnings: string[] = [];

  if (prefResult.budgetMatch) highlights.push('Within budget');
  else warnings.push('Over budget');

  if (prefResult.bedroomMatch) highlights.push('Bedroom match');
  else warnings.push('Bedroom mismatch');

  if (prefResult.amenityMatches.length > 0) {
    highlights.push(`${prefResult.amenityMatches.length} amenity match${prefResult.amenityMatches.length > 1 ? 'es' : ''}`);
  }
  if (prefResult.amenityMisses.length > 0) {
    warnings.push(`Missing: ${prefResult.amenityMisses.slice(0, 3).join(', ')}`);
  }
  if (prefResult.dealBreakerViolations.length > 0) {
    warnings.push(`Deal breaker: ${prefResult.dealBreakerViolations.join(', ')}`);
  }
  if (savings.hasSpecialOffer) highlights.push('Has special offer');
  if (valueScore >= 70) highlights.push('Great value');
  if (marketScore >= 70) highlights.push('Strong leverage');

  return {
    overall: Math.min(100, Math.max(0, overall)),
    locationScore,
    preferenceScore: prefResult.score,
    marketScore,
    valueScore,
    amenityMatches: prefResult.amenityMatches,
    amenityMisses: prefResult.amenityMisses,
    dealBreakerViolations: prefResult.dealBreakerViolations,
    budgetMatch: prefResult.budgetMatch,
    bedroomMatch: prefResult.bedroomMatch,
    highlights,
    warnings,
  };
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-100 dark:bg-green-950/30 border-green-300 dark:border-green-800';
  if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-800';
  if (score >= 40) return 'bg-orange-100 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800';
  return 'bg-red-100 dark:bg-red-950/30 border-red-300 dark:border-red-800';
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Top Pick';
  if (score >= 80) return 'Great Match';
  if (score >= 70) return 'Good Match';
  if (score >= 60) return 'Decent';
  if (score >= 40) return 'Fair';
  return 'Low Match';
}
