/**
 * Type definitions for Landlord Portfolio Management components
 * @module landlord.types
 */

// ============================================================================
// Portfolio Summary Types
// ============================================================================

export interface PortfolioSummary {
  totalProperties: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  totalRevenue: number;
  potentialRevenue: number;
  atRiskCount: number;
  averageRent: number;
  revenueChange: number; // percentage change (e.g., 2.3 for +2.3%)
}

// ============================================================================
// Property Types
// ============================================================================

export type PropertyStatus = 'occupied' | 'vacant';
export type VacancyRisk = 'low' | 'medium' | 'high';
export type PricingRecommendationType = 'increase' | 'decrease' | 'hold';

export interface PricingRecommendation {
  type: PricingRecommendationType;
  amount?: number; // dollar amount to adjust
  confidence: number; // 0-100
  reasoning: string;
  expectedImpact?: string;
}

export interface CompetitorConcession {
  property: string;
  type: string; // e.g., "1 month free", "Waived fees"
  value: string; // e.g., "$1,500", "50%"
}

export interface CompetitorComparison {
  propertyName: string;
  distance: number; // in miles
  rent: number;
  bedrooms: number;
  bathrooms: number;
  concessions: string[];
  occupancyRate?: number;
}

export interface Property {
  // Basic Information
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  
  // Property Details
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  yearBuilt?: number;
  propertyType?: string;
  
  // Financial
  currentRent: number;
  marketAvgRent: number;
  
  // Status
  status: PropertyStatus;
  vacancyRisk: VacancyRisk;
  daysVacant?: number;
  
  // Tenant Information (if occupied)
  tenant?: string;
  leaseEndDate?: string;
  
  // Intelligence
  pricingRecommendation?: PricingRecommendation;
  competitorComparison?: CompetitorComparison[];
  competitorConcessions: CompetitorConcession[];
  competitionSetId?: string;
  competitionSetName?: string;
  recommendation?: string; // Legacy text recommendation
  
  // Metadata
  imageUrl?: string;
  lastUpdated: string;
  createdAt?: string;
}

// ============================================================================
// Filter Types
// ============================================================================

export type StatusFilter = 'all' | PropertyStatus;
export type RiskFilter = 'all' | VacancyRisk;

export interface PropertyFilterOptions {
  city?: string;
  status?: StatusFilter;
  vacancyRisk?: RiskFilter;
  competitionSet?: string;
}

export interface CompetitionSet {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface PortfolioSummaryResponse {
  summary: PortfolioSummary;
}

export interface PropertiesListResponse {
  properties: Property[];
  total: number;
  page?: number;
  limit?: number;
}

export interface CitiesResponse {
  cities: string[];
}

export interface CompetitionSetsResponse {
  competitionSets: CompetitionSet[];
}

export interface PropertyDetailResponse {
  property: Property;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface PortfolioSummaryWidgetProps {
  userId?: string;
  className?: string;
  onRefresh?: () => void;
}

export interface PropertyFiltersProps {
  filters: PropertyFilterOptions;
  onFiltersChange: (filters: PropertyFilterOptions) => void;
  availableCities?: string[];
  availableCompetitionSets?: CompetitionSet[];
  resultCount?: number;
  className?: string;
}

export interface PropertyCardProps {
  property: Property;
  onEdit?: (propertyId: string) => void;
  onViewDetails?: (propertyId: string) => void;
  className?: string;
  showCompetitors?: boolean;
  maxCompetitorsInline?: number;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface PropertyStats {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  averageRent: number;
  totalRevenue: number;
}

export interface MarketMetrics {
  avgRent: number;
  medianRent: number;
  rentTrend7d: number;
  rentTrend30d: number;
  avgDaysOnMarket: number;
  competitorCount: number;
}

export interface RiskFactors {
  pricingRisk: boolean;
  competitionRisk: boolean;
  marketTrendRisk: boolean;
  vacancyDurationRisk: boolean;
  leaseExpirationRisk: boolean;
}

// ============================================================================
// API Query Parameters
// ============================================================================

export interface PropertiesQueryParams {
  city?: string;
  status?: PropertyStatus;
  vacancyRisk?: VacancyRisk;
  competitionSetId?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'rent' | 'risk' | 'updated' | 'occupancy';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  error: ApiError;
  timestamp: string;
  path: string;
}
