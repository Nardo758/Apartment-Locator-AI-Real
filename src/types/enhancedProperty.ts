/**
 * Enhanced Property Types for Market Intelligence
 * Extends base property types with financial data, characteristics, and availability tracking
 */

export type PropertyClass = 'A' | 'B' | 'C';
export type BuildingType = 'garden' | 'mid-rise' | 'high-rise' | 'townhome' | 'low-rise' | 'walk-up';
export type UnitStatus = 'available' | 'coming_soon' | 'leased' | 'unavailable';

export interface PublicIncomeData {
  parkingFeeMonthly?: number;
  petRentMonthly?: number;
  petDeposit?: number;
  applicationFee?: number;
  adminFee?: number;
  utilityReimbursements?: string[]; // ['water', 'trash', 'gas']
}

export interface PropertyCharacteristics {
  yearBuilt?: number;
  yearRenovated?: number;
  propertyClass?: PropertyClass;
  buildingType?: BuildingType;
  parkingSpaces?: number;
  parkingRatio?: number; // spaces per unit
  managementCompany?: string;
}

export interface OccupancyMetrics {
  totalUnits?: number;
  currentOccupancyPercent?: number;
  avgDaysToLease?: number;
}

export interface EnhancedLeaseRate {
  id: string;
  propertyId: string;
  unitType: string;
  rentAmount: number;
  squareFeet?: number;
  bedrooms?: number;
  bathrooms?: number;
  availableDate?: string; // ISO date
  unitStatus: UnitStatus;
  floorPlan?: string;
  leaseTerm?: number; // months
  createdAt: string;
}

export interface RentHistoryRecord {
  id: string;
  propertyId: string;
  unitType: string;
  rentAmount: number;
  recordedDate: string; // ISO date
  scrapeId?: string;
  createdAt: string;
}

export interface EnhancedProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  
  // Contact info
  phone?: string;
  email?: string;
  websiteUrl?: string;
  
  // Property characteristics
  yearBuilt?: number;
  yearRenovated?: number;
  propertyClass?: PropertyClass;
  buildingType?: BuildingType;
  parkingSpaces?: number;
  parkingRatio?: number;
  managementCompany?: string;
  
  // Occupancy
  totalUnits?: number;
  currentOccupancyPercent?: number;
  avgDaysToLease?: number;
  
  // Public income data
  parkingFeeMonthly?: number;
  petRentMonthly?: number;
  petDeposit?: number;
  applicationFee?: number;
  adminFee?: number;
  utilityReimbursements?: string[];
  
  // Features & amenities
  features?: string[];
  amenities?: string[];
  
  // Property management system
  pmsSystem?: string;
  
  // Scraping metadata
  lastScrapedAt?: string;
  sourceUrl?: string;
  
  // Relations (loaded separately)
  leaseRates?: EnhancedLeaseRate[];
  concessions?: any[];
  rentHistory?: RentHistoryRecord[];
}

export interface MarketOverview {
  city: string;
  state: string;
  zipCode?: string;
  totalProperties: number;
  totalUnits: number;
  avgOccupancy: number;
  avgDaysToLease: number;
  classACount: number;
  classBCount: number;
  classCCount: number;
  avgParkingFee: number;
  avgPetRent: number;
  lastUpdated: string;
}

export interface UnitAvailabilityForecast {
  city: string;
  state: string;
  zipCode?: string;
  unitType: string;
  availableDate: string;
  availabilityMonth: string;
  unitsAvailable: number;
  avgRent: number;
  minRent: number;
  maxRent: number;
}

export interface RentGrowthData {
  city: string;
  state: string;
  zipCode?: string;
  unitType: string;
  month: string;
  avgRent: number;
  momChangePercent?: number; // month-over-month
  yoyChangePercent?: number; // year-over-year
}

export interface ConcessionTrend {
  city: string;
  state: string;
  zipCode?: string;
  month: string;
  propertiesWithConcessions: number;
  totalConcessions: number;
  avgConcessionValue: number;
  concessionTypes: string[];
}

// Admin panel filter types
export interface MarketFilters {
  city?: string;
  state?: string;
  zipCode?: string;
  propertyClass?: PropertyClass[];
  minOccupancy?: number;
  maxOccupancy?: number;
  hasAvailableUnits?: boolean;
}

export interface UnitMixSummary {
  unitType: string;
  count: number;
  avgRent: number;
  minRent: number;
  maxRent: number;
  avgSqft?: number;
  availableCount: number;
  occupancyRate: number;
}

export interface PropertyDetailedStats extends EnhancedProperty {
  unitMix: UnitMixSummary[];
  recentRentChanges: RentGrowthData[];
  activeConcessions: any[];
  demandSignals?: {
    matchingRenters: number;
    avgBudget: number;
    commonPreferences: string[];
  };
}

// JEDI RE integration types
export interface JEDIMarketData {
  location: {
    city: string;
    state: string;
    zipCode?: string;
    submarket?: string;
  };
  supply: {
    totalProperties: number;
    totalUnits: number;
    availableUnits: number;
    avgOccupancy: number;
    classDistribution: { A: number; B: number; C: number };
  };
  pricing: {
    avgRentByType: Record<string, number>;
    rentGrowthYoY: number;
    rentGrowthMoM: number;
    concessionsPrevalence: number; // % of properties offering
  };
  demand: {
    rentersSearching: number;
    avgBudget: number;
    leaseExpirationsNext90Days: number;
    topPreferences: string[];
  };
  forecast: {
    unitsDeliveringNext90Days: number;
    unitsDeliveringNext180Days: number;
    projectedAbsorptionDays: number;
  };
}

export interface RentComparable {
  propertyId: string;
  propertyName: string;
  address: string;
  distance?: number; // miles from subject
  unitType: string;
  rent: number;
  sqft?: number;
  pricePerSqft?: number;
  amenities: string[];
  concessions?: string[];
  availableDate?: string;
  similarityScore?: number; // 0-100
}
