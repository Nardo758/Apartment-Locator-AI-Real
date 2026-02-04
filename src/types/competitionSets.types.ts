/**
 * Competition Sets TypeScript Type Definitions
 * 
 * Shared types for Competition Sets UI components and API integration
 */

/**
 * Base Competition Set
 * Represents a group of competitor properties tracked against user's properties
 */
export interface CompetitionSet {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  ownPropertyIds: string[];
  alertsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  // Optional - included in list view
  competitorCount?: number;
  // Optional - included in detail view
  competitors?: CompetitionSetCompetitor[];
}

/**
 * Competitor Property
 * A competitor property within a competition set
 */
export interface CompetitionSetCompetitor {
  id: string;
  setId: string;
  propertyId?: string | null;
  address: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  bedrooms?: number | null;
  bathrooms?: number | string | null;
  squareFeet?: number | null;
  currentRent?: number | string | null;
  amenities?: string[];
  concessions?: Concession[];
  lastUpdated: string;
  source?: string;
  notes?: string | null;
  isActive?: boolean;
  createdAt: string;
  // Optional - for search results
  distance?: number;
}

/**
 * Concession/Deal offered by a competitor
 */
export interface Concession {
  type: string;
  description: string;
  value: number;
}

/**
 * User Property
 * Represents a property owned by the landlord
 */
export interface Property {
  id: string;
  address: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  currentRent?: number;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number | string;
  longitude?: number | string;
}

/**
 * Form Data for Creating/Updating Competition Set
 */
export interface CompetitionSetFormData {
  name: string;
  description: string;
  ownPropertyIds: string[];
  alertsEnabled: boolean;
  competitors: CompetitorData[];
}

/**
 * Competitor Data for Form
 */
export interface CompetitorData {
  id?: string;
  propertyId?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  currentRent?: number;
  amenities?: string[];
  concessions?: Concession[];
  source?: string;
  notes?: string;
  isActive?: boolean;
}

/**
 * API Response Types
 */

export interface CompetitionSetsListResponse {
  sets: CompetitionSet[];
  total: number;
  limit: number;
  offset: number;
}

export interface CompetitionSetDetailResponse extends CompetitionSet {
  competitors: CompetitionSetCompetitor[];
}

export interface CompetitionSetCreateRequest {
  name: string;
  description?: string;
  ownPropertyIds: string[];
  alertsEnabled: boolean;
}

export interface CompetitionSetUpdateRequest {
  name?: string;
  description?: string;
  ownPropertyIds?: string[];
  alertsEnabled?: boolean;
}

export interface CompetitorCreateRequest {
  propertyId?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  currentRent?: number;
  amenities?: string[];
  concessions?: Concession[];
  source?: string;
  notes?: string;
}

export interface PropertiesListResponse {
  properties: Property[];
  total?: number;
}

/**
 * Component Props Types
 */

export interface CompetitionSetManagerProps {
  userId: string;
  authToken: string;
}

export interface CompetitionSetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CompetitionSetFormData) => Promise<void>;
  editData?: CompetitionSetEditData;
  userProperties?: Property[];
  isLoading?: boolean;
}

export interface CompetitionSetEditData {
  id: string;
  name: string;
  description?: string;
  ownPropertyIds: string[];
  alertsEnabled: boolean;
  competitors?: CompetitorData[];
}

export interface CompetitorSearchResultProps {
  property: CompetitorProperty;
  onAdd: (property: CompetitorProperty) => void;
  isAdded?: boolean;
  isLoading?: boolean;
}

export interface CompetitorProperty {
  id?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  currentRent?: number;
  amenities?: string[];
  distance?: number;
  source?: string;
}

/**
 * API Error Response
 */
export interface APIError {
  error: string;
  details?: string[];
  statusCode?: number;
}

/**
 * Form Validation Errors
 */
export interface ValidationErrors {
  name?: string;
  description?: string;
  ownPropertyIds?: string;
  competitors?: string;
  [key: string]: string | undefined;
}

/**
 * Competition Set Statistics
 */
export interface CompetitionSetStats {
  totalSets: number;
  totalCompetitors: number;
  activeSets: number;
  averageCompetitorsPerSet: number;
  setsWithAlertsEnabled: number;
}

/**
 * Alert Configuration
 */
export interface AlertConfiguration {
  priceChanges: boolean;
  concessions: boolean;
  vacancyChanges: boolean;
  amenityChanges: boolean;
  deliveryEmail: boolean;
  deliverySms: boolean;
  deliveryInApp: boolean;
  frequency: 'realtime' | 'daily' | 'weekly';
  priceThreshold?: number;
}

/**
 * Search Filters for Competitors
 */
export interface CompetitorSearchFilters {
  query?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // miles
  minBedrooms?: number;
  maxBedrooms?: number;
  minRent?: number;
  maxRent?: number;
  amenities?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Type Guards
 */

export function isCompetitionSet(obj: any): obj is CompetitionSet {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.userId === 'string' &&
    typeof obj.name === 'string' &&
    Array.isArray(obj.ownPropertyIds) &&
    typeof obj.alertsEnabled === 'boolean'
  );
}

export function isCompetitor(obj: any): obj is CompetitionSetCompetitor {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.setId === 'string' &&
    typeof obj.address === 'string'
  );
}

export function isProperty(obj: any): obj is Property {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.address === 'string'
  );
}

/**
 * Utility Types
 */

export type CompetitionSetSortField = 'name' | 'createdAt' | 'updatedAt' | 'competitorCount';
export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: CompetitionSetSortField;
  direction: SortDirection;
}

export type CompetitionSetStatus = 'active' | 'inactive' | 'archived';

export interface CompetitionSetFilters {
  status?: CompetitionSetStatus;
  alertsEnabled?: boolean;
  search?: string;
  propertyId?: string;
  minCompetitors?: number;
  maxCompetitors?: number;
}

/**
 * Bulk Operations
 */

export interface BulkCompetitorImport {
  setId: string;
  competitors: CompetitorCreateRequest[];
}

export interface BulkImportResult {
  success: number;
  failed: number;
  errors: Array<{
    address: string;
    error: string;
  }>;
}

/**
 * Export/Report Types
 */

export interface CompetitionSetExport {
  setName: string;
  setDescription?: string;
  ownProperties: Property[];
  competitors: CompetitionSetCompetitor[];
  exportedAt: string;
  exportedBy: string;
}

export type ExportFormat = 'csv' | 'json' | 'xlsx';

export interface ExportOptions {
  format: ExportFormat;
  includeInactive?: boolean;
  includeNotes?: boolean;
}

/**
 * Webhook/Event Types (for future use)
 */

export type CompetitionSetEventType = 
  | 'set.created'
  | 'set.updated'
  | 'set.deleted'
  | 'competitor.added'
  | 'competitor.removed'
  | 'competitor.updated'
  | 'alert.triggered';

export interface CompetitionSetEvent {
  type: CompetitionSetEventType;
  setId: string;
  competitorId?: string;
  timestamp: string;
  data: Record<string, any>;
}
