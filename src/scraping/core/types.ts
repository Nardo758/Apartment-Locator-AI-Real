/**
 * Core types for the apartment scraping framework
 */

export interface ScrapedProperty {
  // Basic property info
  id?: string;
  externalId: string;
  source: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Pricing information
  originalPrice: number;
  currentPrice: number;
  priceHistory?: PriceHistoryEntry[];
  
  // Property details
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  yearBuilt?: number;
  
  // Availability
  availability: string;
  availabilityType: 'immediate' | 'soon' | 'waitlist' | 'unknown';
  daysOnMarket?: number;
  
  // Features and amenities
  features: string[];
  amenities: string[];
  petPolicy?: string;
  parking?: string;
  
  // Location data
  coordinates?: {
    lat: number;
    lng: number;
  };
  
  // Media
  images: string[];
  virtualTourUrl?: string;
  
  // Contact information
  phoneNumber?: string;
  websiteUrl?: string;
  listingUrl: string;
  
  // Metadata
  scrapedAt: Date;
  lastUpdated: Date;
  isActive: boolean;
  
  // AI-enhanced data (to be populated later)
  matchScore?: number;
  aiPrice?: number;
  concessions?: Concession[];
  marketVelocity?: 'hot' | 'normal' | 'slow';
}

export interface PriceHistoryEntry {
  price: number;
  date: Date;
  source: string;
}

export interface Concession {
  type: string;
  value: string;
  probability: number;
  color: 'green' | 'yellow' | 'orange' | 'red';
}

export interface ScrapingResult {
  success: boolean;
  properties: ScrapedProperty[];
  errors: ScrapingError[];
  metadata: ScrapingMetadata;
}

export interface ScrapingError {
  type: 'network' | 'parsing' | 'validation' | 'rate_limit' | 'blocked';
  message: string;
  url?: string;
  timestamp: Date;
  retryable: boolean;
}

export interface ScrapingMetadata {
  source: string;
  city: string;
  state: string;
  totalPages: number;
  currentPage: number;
  propertiesFound: number;
  propertiesProcessed: number;
  startTime: Date;
  endTime: Date;
  duration: number; // milliseconds
}

export interface ScrapingJob {
  id: string;
  source: string;
  city: string;
  state: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: number;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: ScrapingResult;
  retryCount: number;
  maxRetries: number;
}

export interface RateLimiter {
  canProceed(): Promise<boolean>;
  waitTime(): Promise<number>;
  recordRequest(): void;
}

export interface ProxyManager {
  getNextProxy(): string | null;
  markProxyFailed(proxy: string): void;
  getHealthyProxyCount(): number;
}

export interface DataValidator {
  validateProperty(property: Partial<ScrapedProperty>): ValidationResult;
  cleanProperty(property: Partial<ScrapedProperty>): ScrapedProperty;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export interface DeduplicationResult {
  isDuplicate: boolean;
  existingPropertyId?: string;
  confidence: number;
  matchedFields: string[];
}

export interface MarketData {
  city: string;
  state: string;
  medianRent: number;
  averageDaysOnMarket: number;
  occupancyRate: number;
  priceChangePercent: number;
  trendingConcessions: Array<{
    type: string;
    percentage: string;
  }>;
  lastUpdated: Date;
}

// Scraper interface that all site-specific scrapers must implement
export interface BaseScraper {
  readonly source: string;
  scrapeCity(city: string, state: string, options?: ScrapingOptions): Promise<ScrapingResult>;
  scrapeProperty(url: string): Promise<ScrapedProperty | null>;
  validateData(property: Partial<ScrapedProperty>): ValidationResult;
}

export interface ScrapingOptions {
  maxPages?: number;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number[];
  bathrooms?: number[];
  petFriendly?: boolean;
  amenities?: string[];
  forceRefresh?: boolean;
}

export interface ScrapingStats {
  totalPropertiesScraped: number;
  successRate: number;
  averageResponseTime: number;
  errorsByType: Record<string, number>;
  propertiesBySource: Record<string, number>;
  lastSuccessfulScrape: Date;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  expiresAt: Date;
  key: string;
}