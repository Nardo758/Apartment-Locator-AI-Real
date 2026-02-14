/**
 * Enhanced Property Types for Market Intelligence & Admin Panel
 * Extends base property schema with additional fields for JEDI RE integration
 */

export interface EnhancedProperty {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  
  // Property characteristics
  year_built?: number;
  year_renovated?: number;
  property_class?: 'A' | 'B' | 'C' | 'D';
  building_type?: string;
  parking_spaces?: number;
  management_company?: string;
  
  // Occupancy & operations
  total_units?: number;
  current_occupancy_percent?: number;
  avg_days_to_lease?: number;
  
  // Public income data
  parking_fee_monthly?: number;
  pet_rent_monthly?: number;
  application_fee?: number;
  admin_fee?: number;
  
  // Metadata
  last_scraped?: Date;
  source?: string;
  created_at?: Date;
}

export interface EnhancedLeaseRate {
  id: number;
  property_id: number;
  unit_type: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  price: number;
  lease_term?: string;
  available_date?: Date;
  unit_status?: 'available' | 'coming_soon' | 'leased';
  created_at?: Date;
}

export interface RentHistoryRecord {
  id: number;
  property_id: number;
  unit_type: string;
  rent_amount: number;
  recorded_date: Date;
  source?: string;
  created_at?: Date;
}

// View Types
export interface MarketOverview {
  city: string;
  state: string;
  zip_code?: string;
  property_count: number;
  total_units: number;
  avg_occupancy: number;
  class_a_count: number;
  class_b_count: number;
  class_c_count: number;
  avg_rent: number;
  active_concessions: number;
}

export interface UnitAvailabilityForecast {
  city: string;
  state: string;
  unit_type: string;
  available_30d: number;
  available_60d: number;
  available_90d: number;
  avg_rent: number;
  min_rent: number;
  max_rent: number;
}

export interface RentGrowthData {
  city: string;
  state: string;
  unit_type: string;
  current_avg_rent: number;
  rent_90d_ago?: number;
  rent_180d_ago?: number;
  growth_90d_pct?: number;
  growth_180d_pct?: number;
}

export interface ConcessionTrend {
  city: string;
  state: string;
  concession_type: string;
  concession_count: number;
  avg_value: number;
  concession_rate_pct: number;
}

// For JEDI RE Integration
export interface JEDIMarketData {
  location: {
    city: string;
    state: string;
  };
  supply: {
    total_properties: number;
    total_units: number;
    avg_occupancy: number;
    class_distribution: {
      a: number;
      b: number;
      c: number;
    };
  };
  pricing: {
    avg_rent_by_type: { [key: string]: number };
    rent_growth_90d: number;
    rent_growth_180d: number;
    concession_rate: number;
    avg_concession_value: number;
  };
  demand: {
    total_renters: number;
    avg_budget: number;
    lease_expirations_90d: number;
  };
  forecast: {
    units_delivering_30d: number;
    units_delivering_60d: number;
    units_delivering_90d: number;
  };
}

export interface RentComparable {
  property_id: number;
  property_name: string;
  address: string;
  distance_miles?: number;
  unit_type: string;
  square_feet?: number;
  rent: number;
  rent_per_sqft?: number;
  occupancy?: number;
  year_built?: number;
  property_class?: string;
  concessions_active: boolean;
}
