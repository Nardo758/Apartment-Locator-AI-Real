// ============================================
// LOCATION COST SERVICE
// Core calculation logic for True Monthly Cost
// ============================================

import type {
  UserLocationInputs,
  ApartmentLocationCost,
  CommuteCost,
  ParkingCost,
  GroceryCost,
  GymCost,
  TransitSavings,
  Coordinates,
  ApartmentComparison,
  GasPriceData,
  DistanceMatrixResult,
  PlaceInfo,
} from '@/types/locationCost.types';

// Constants
const WEEKS_PER_MONTH = 4.33;
const METERS_TO_MILES = 0.000621371;
const DEFAULT_GAS_PRICE = 3.50; // fallback
const DEFAULT_MPG = 28;
const DEFAULT_PARKING_COST = 150; // monthly estimate

// ============================================
// MAIN CALCULATION FUNCTION
// ============================================

export async function calculateApartmentCosts(
  userInputs: UserLocationInputs,
  apartments: Array<{
    id: string;
    address: string;
    coordinates: Coordinates;
    baseRent: number;
    parkingIncluded?: boolean;
  }>,
  googleMapsApiKey: string,
  gasPriceData?: GasPriceData
): Promise<ApartmentLocationCost[]> {
  const gasPrice = gasPriceData?.localAverage ?? gasPriceData?.stateAverage ?? DEFAULT_GAS_PRICE;
  const mpg = userInputs.vehicleMpg ?? DEFAULT_MPG;
  
  const results: ApartmentLocationCost[] = [];
  
  for (const apartment of apartments) {
    try {
      // Calculate commute cost
      const commuteCost = await calculateCommuteCost(
        apartment.coordinates,
        userInputs,
        gasPrice,
        mpg,
        googleMapsApiKey
      );
      
      // Calculate parking cost
      const parkingCost = calculateParkingCost(
        apartment.coordinates,
        apartment.parkingIncluded ?? false
      );
      
      // Calculate grocery cost
      const groceryCost = await calculateGroceryCost(
        apartment.coordinates,
        userInputs,
        gasPrice,
        mpg,
        googleMapsApiKey
      );
      
      // Calculate gym cost
      const gymCost = await calculateGymCost(
        apartment.coordinates,
        userInputs,
        gasPrice,
        mpg,
        googleMapsApiKey
      );
      
      // Calculate transit savings
      const transitSavings = await calculateTransitSavings(
        apartment.coordinates,
        userInputs,
        googleMapsApiKey
      );
      
      // Total location costs
      const totalLocationCosts = 
        commuteCost.totalMonthly +
        parkingCost.estimatedMonthly +
        groceryCost.additionalGasCost +
        gymCost.additionalGasCost -
        transitSavings.potentialMonthlySavings;
      
      const trueMonthlyCost = apartment.baseRent + totalLocationCosts;
      
      results.push({
        apartmentId: apartment.id,
        apartmentAddress: apartment.address,
        apartmentCoordinates: apartment.coordinates,
        baseRent: apartment.baseRent,
        commuteCost,
        parkingCost,
        groceryCost,
        gymCost,
        transitSavings,
        totalLocationCosts: Math.round(totalLocationCosts),
        trueMonthlyCost: Math.round(trueMonthlyCost),
        vsAverageRent: 0, // calculated after all apartments
        vsAverageTrue: 0, // calculated after all apartments
        calculatedAt: new Date(),
        confidence: determineConfidence(commuteCost, parkingCost, groceryCost),
      });
    } catch (error) {
      console.error(`Error calculating costs for ${apartment.address}:`, error);
    }
  }
  
  // Calculate comparison metrics
  if (results.length > 0) {
    const avgRent = results.reduce((sum, r) => sum + r.baseRent, 0) / results.length;
    const avgTrue = results.reduce((sum, r) => sum + r.trueMonthlyCost, 0) / results.length;
    
    results.forEach((result, index) => {
      result.vsAverageRent = Math.round(result.baseRent - avgRent);
      result.vsAverageTrue = Math.round(result.trueMonthlyCost - avgTrue);
    });
    
    // Assign savings rank
    const sortedByTrue = [...results].sort((a, b) => a.trueMonthlyCost - b.trueMonthlyCost);
    sortedByTrue.forEach((result, index) => {
      const original = results.find(r => r.apartmentId === result.apartmentId);
      if (original) original.savingsRank = index + 1;
    });
  }
  
  return results;
}

// ============================================
// COMMUTE COST CALCULATION
// ============================================

async function calculateCommuteCost(
  apartmentCoords: Coordinates,
  userInputs: UserLocationInputs,
  gasPrice: number,
  mpg: number,
  apiKey: string
): Promise<CommuteCost> {
  if (!userInputs.workCoordinates) {
    return createEmptyCommuteCost();
  }
  
  const distanceResult = await getDistanceMatrix(
    apartmentCoords,
    userInputs.workCoordinates,
    userInputs.commuteMode,
    apiKey
  );
  
  const distanceMiles = distanceResult.distance.value * METERS_TO_MILES;
  const durationMinutes = distanceResult.duration.value / 60;
  const tripsPerMonth = userInputs.commuteFrequency * WEEKS_PER_MONTH * 2; // round trips
  
  let fuelCostPerMonth = 0;
  let gallonsPerMonth = 0;
  let transitCostPerMonth = 0;
  
  if (userInputs.commuteMode === 'driving') {
    const milesPerMonth = distanceMiles * tripsPerMonth;
    gallonsPerMonth = milesPerMonth / mpg;
    fuelCostPerMonth = gallonsPerMonth * gasPrice;
  } else if (userInputs.commuteMode === 'transit') {
    transitCostPerMonth = userInputs.monthlyTransitPass ?? 100;
  }
  
  const totalMonthly = fuelCostPerMonth + transitCostPerMonth;
  const hoursPerMonth = (durationMinutes * tripsPerMonth) / 60;
  
  return {
    distanceMiles: Math.round(distanceMiles * 10) / 10,
    durationMinutes: Math.round(durationMinutes),
    tripsPerMonth: Math.round(tripsPerMonth),
    gallonsPerMonth: Math.round(gallonsPerMonth * 10) / 10,
    gasPricePerGallon: gasPrice,
    fuelCostPerMonth: Math.round(fuelCostPerMonth),
    transitCostPerMonth: Math.round(transitCostPerMonth),
    totalMonthly: Math.round(totalMonthly),
    hoursPerMonth: Math.round(hoursPerMonth * 10) / 10,
  };
}

function createEmptyCommuteCost(): CommuteCost {
  return {
    distanceMiles: 0,
    durationMinutes: 0,
    tripsPerMonth: 0,
    totalMonthly: 0,
    hoursPerMonth: 0,
  };
}

// ============================================
// PARKING COST CALCULATION
// ============================================

function calculateParkingCost(
  apartmentCoords: Coordinates,
  parkingIncluded: boolean
): ParkingCost {
  if (parkingIncluded) {
    return {
      streetParkingAvailable: true,
      averageMonthlyParking: 0,
      parkingIncluded: true,
      estimatedMonthly: 0,
      confidence: 'high',
      source: 'listing',
    };
  }
  
  // TODO: Integrate with parking data scraper (SpotHero, ParkMe)
  // For now, use estimate based on coordinates (urban density proxy)
  const estimatedCost = estimateParkingByLocation(apartmentCoords);
  
  return {
    streetParkingAvailable: estimatedCost < 100,
    averageMonthlyParking: estimatedCost,
    parkingIncluded: false,
    estimatedMonthly: estimatedCost,
    confidence: 'medium',
    source: 'estimate',
  };
}

function estimateParkingByLocation(coords: Coordinates): number {
  // Simplified urban density estimation
  // In production, this would use census data or scraped parking prices
  // Higher values for known urban cores
  
  // Default suburban estimate
  return DEFAULT_PARKING_COST;
}

// ============================================
// GROCERY COST CALCULATION
// ============================================

async function calculateGroceryCost(
  apartmentCoords: Coordinates,
  userInputs: UserLocationInputs,
  gasPrice: number,
  mpg: number,
  apiKey: string
): Promise<GroceryCost> {
  // Find nearest grocery store
  const nearestGrocery = await findNearestPlace(
    apartmentCoords,
    'grocery_or_supermarket',
    userInputs.preferredGroceryChain,
    apiKey
  );
  
  if (!nearestGrocery) {
    return {
      nearestGroceryStore: createUnknownPlace('Grocery Store'),
      distanceMiles: 0,
      tripsPerMonth: userInputs.groceryFrequency * WEEKS_PER_MONTH,
      additionalGasCost: 0,
      timeCostMinutes: 0,
    };
  }
  
  const tripsPerMonth = userInputs.groceryFrequency * WEEKS_PER_MONTH;
  const milesPerMonth = nearestGrocery.distanceMiles * tripsPerMonth * 2; // round trip
  const gallons = milesPerMonth / mpg;
  const additionalGasCost = gallons * gasPrice;
  const timeCostMinutes = nearestGrocery.drivingMinutes * tripsPerMonth * 2;
  
  return {
    nearestGroceryStore: nearestGrocery,
    distanceMiles: nearestGrocery.distanceMiles,
    tripsPerMonth: Math.round(tripsPerMonth),
    additionalGasCost: Math.round(additionalGasCost),
    timeCostMinutes: Math.round(timeCostMinutes),
  };
}

// ============================================
// GYM COST CALCULATION
// ============================================

async function calculateGymCost(
  apartmentCoords: Coordinates,
  userInputs: UserLocationInputs,
  gasPrice: number,
  mpg: number,
  apiKey: string
): Promise<GymCost> {
  if (!userInputs.hasGymMembership) {
    return {
      tripsPerMonth: 0,
      additionalGasCost: 0,
      timeCostMinutes: 0,
    };
  }
  
  let gymLocation: Coordinates | null = userInputs.gymCoordinates ?? null;
  let nearestGym: PlaceInfo | undefined;
  
  // If user has a specific gym, calculate distance to it
  // Otherwise, find nearest gym
  if (!gymLocation) {
    const foundGym = await findNearestPlace(
      apartmentCoords,
      'gym',
      undefined,
      apiKey
    );
    
    if (foundGym) {
      nearestGym = foundGym;
      gymLocation = { lat: foundGym.distanceMiles, lng: 0 }; // placeholder
    }
  }
  
  if (!nearestGym) {
    nearestGym = createUnknownPlace('Gym');
  }
  
  const visitsPerMonth = (userInputs.gymVisitsPerWeek ?? 3) * WEEKS_PER_MONTH;
  const milesPerMonth = nearestGym.distanceMiles * visitsPerMonth * 2;
  const gallons = milesPerMonth / mpg;
  const additionalGasCost = gallons * gasPrice;
  const timeCostMinutes = nearestGym.drivingMinutes * visitsPerMonth * 2;
  
  return {
    nearestGym,
    distanceToPreferredGym: nearestGym.distanceMiles,
    tripsPerMonth: Math.round(visitsPerMonth),
    additionalGasCost: Math.round(additionalGasCost),
    timeCostMinutes: Math.round(timeCostMinutes),
  };
}

// ============================================
// TRANSIT SAVINGS CALCULATION
// ============================================

async function calculateTransitSavings(
  apartmentCoords: Coordinates,
  userInputs: UserLocationInputs,
  apiKey: string
): Promise<TransitSavings> {
  if (!userInputs.usesPublicTransit) {
    return {
      transitScore: 0,
      potentialMonthlySavings: 0,
      canReplaceCommute: false,
    };
  }
  
  // Find nearest transit stop
  const nearestTransit = await findNearestPlace(
    apartmentCoords,
    'transit_station',
    undefined,
    apiKey
  );
  
  if (!nearestTransit) {
    return {
      transitScore: 0,
      potentialMonthlySavings: 0,
      canReplaceCommute: false,
    };
  }
  
  // Calculate transit score (0-100)
  const walkingMinutes = nearestTransit.walkingMinutes;
  let transitScore = 100;
  
  if (walkingMinutes > 5) transitScore -= (walkingMinutes - 5) * 5;
  if (transitScore < 0) transitScore = 0;
  
  // Can transit replace the commute?
  const canReplaceCommute = walkingMinutes <= 15 && userInputs.workCoordinates !== undefined;
  
  // Calculate potential savings if transit replaces driving
  let potentialMonthlySavings = 0;
  if (canReplaceCommute && userInputs.monthlyTransitPass) {
    // Savings = (estimated driving cost - transit pass cost)
    // This is a simplified calculation
    potentialMonthlySavings = Math.max(0, 200 - userInputs.monthlyTransitPass);
  }
  
  return {
    nearestTransitStop: nearestTransit,
    walkingDistanceMinutes: walkingMinutes,
    transitScore,
    potentialMonthlySavings,
    canReplaceCommute,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getDistanceMatrix(
  origin: Coordinates,
  destination: Coordinates,
  mode: string,
  apiKey: string
): Promise<DistanceMatrixResult> {
  // In production, this calls Google Distance Matrix API
  // For now, return mock data that can be replaced
  
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&mode=${mode}&key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
      return {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        distance: data.rows[0].elements[0].distance,
        duration: data.rows[0].elements[0].duration,
        status: 'OK',
      };
    }
  } catch (error) {
    console.error('Distance Matrix API error:', error);
  }
  
  // Fallback: estimate based on straight-line distance
  const straightLine = calculateStraightLineDistance(origin, destination);
  const estimatedDriveDistance = straightLine * 1.3; // roads aren't straight
  const estimatedDuration = (estimatedDriveDistance / 30) * 60; // assume 30mph avg
  
  return {
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    distance: {
      text: `${Math.round(estimatedDriveDistance)} mi`,
      value: estimatedDriveDistance / METERS_TO_MILES,
    },
    duration: {
      text: `${Math.round(estimatedDuration)} mins`,
      value: estimatedDuration * 60,
    },
    status: 'ESTIMATED',
  };
}

async function findNearestPlace(
  origin: Coordinates,
  placeType: string,
  preferredName: string | undefined,
  apiKey: string
): Promise<PlaceInfo | null> {
  // In production, this calls Google Places API
  // For now, return mock data
  
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${origin.lat},${origin.lng}&radius=5000&type=${placeType}&key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      let result = data.results[0];
      
      // If preferred name specified, try to find it
      if (preferredName) {
        const preferred = data.results.find((r: any) => 
          r.name.toLowerCase().includes(preferredName.toLowerCase())
        );
        if (preferred) result = preferred;
      }
      
      const placeCoords: Coordinates = {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      };
      
      const distance = calculateStraightLineDistance(origin, placeCoords);
      
      return {
        name: result.name,
        address: result.vicinity || result.formatted_address,
        coordinates: placeCoords,
        rating: result.rating,
        distanceMiles: Math.round(distance * 10) / 10,
        drivingMinutes: Math.round((distance / 25) * 60), // assume 25mph
        walkingMinutes: Math.round((distance / 3) * 60), // assume 3mph walking
      };
    }
  } catch (error) {
    console.error('Places API error:', error);
  }
  
  return null;
}

function calculateStraightLineDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  // Haversine formula
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

function createUnknownPlace(type: string): PlaceInfo {
  return {
    name: `Nearest ${type}`,
    address: 'Unknown',
    coordinates: { lat: 0, lng: 0 },
    distanceMiles: 0,
    drivingMinutes: 0,
    walkingMinutes: 0,
  };
}

function determineConfidence(
  commute: CommuteCost,
  parking: ParkingCost,
  grocery: GroceryCost
): 'high' | 'medium' | 'low' {
  let score = 0;
  
  if (commute.distanceMiles > 0) score += 2;
  if (parking.source === 'listing') score += 2;
  else if (parking.source === 'neighborhood_avg') score += 1;
  if (grocery.nearestGroceryStore.address !== 'Unknown') score += 1;
  
  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

// ============================================
// COMPARISON UTILITIES
// ============================================

export function createComparison(results: ApartmentLocationCost[]): ApartmentComparison {
  if (results.length === 0) {
    return {
      apartments: [],
      cheapestByRent: '',
      cheapestByTrueCost: '',
      biggestSavings: { apartmentId: '', savingsVsAverage: 0 },
      averageRent: 0,
      averageTrueCost: 0,
      medianTrueCost: 0,
    };
  }
  
  const sortedByRent = [...results].sort((a, b) => a.baseRent - b.baseRent);
  const sortedByTrue = [...results].sort((a, b) => a.trueMonthlyCost - b.trueMonthlyCost);
  const sortedBySavings = [...results].sort((a, b) => a.vsAverageTrue - b.vsAverageTrue);
  
  const avgRent = results.reduce((sum, r) => sum + r.baseRent, 0) / results.length;
  const avgTrue = results.reduce((sum, r) => sum + r.trueMonthlyCost, 0) / results.length;
  
  const sortedForMedian = [...results].sort((a, b) => a.trueMonthlyCost - b.trueMonthlyCost);
  const medianTrue = sortedForMedian[Math.floor(sortedForMedian.length / 2)].trueMonthlyCost;
  
  return {
    apartments: results,
    cheapestByRent: sortedByRent[0].apartmentId,
    cheapestByTrueCost: sortedByTrue[0].apartmentId,
    biggestSavings: {
      apartmentId: sortedBySavings[0].apartmentId,
      savingsVsAverage: Math.abs(sortedBySavings[0].vsAverageTrue),
    },
    averageRent: Math.round(avgRent),
    averageTrueCost: Math.round(avgTrue),
    medianTrueCost: Math.round(medianTrue),
  };
}

// ============================================
// FORMATTING UTILITIES
// ============================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSavings(amount: number): string {
  const prefix = amount >= 0 ? '+' : '';
  return `${prefix}${formatCurrency(amount)}`;
}

export function formatDistance(miles: number): string {
  return `${miles.toFixed(1)} mi`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}
