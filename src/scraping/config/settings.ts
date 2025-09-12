/**
 * Configuration settings for the apartment scraping framework
 */

export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
}

export interface ScrapingConfig {
  // Rate limiting
  requestsPerSecond: number;
  requestsPerMinute: number;
  concurrentRequests: number;
  
  // Timeouts
  requestTimeout: number;
  pageLoadTimeout: number;
  
  // Retry settings
  maxRetries: number;
  retryDelay: number;
  backoffFactor: number;
  
  // User agents rotation
  rotateUserAgents: boolean;
  
  // Proxy settings
  useProxies: boolean;
  proxyRotationInterval: number;
  
  // Data freshness
  cacheDurationHours: number;
  staleDataThresholdDays: number;
  
  // Browser settings
  headlessBrowser: boolean;
  browserWindowSize: [number, number];
}

export interface SiteConfig {
  baseUrl: string;
  searchUrl: string;
  rateLimit: number;
  selectors: {
    [key: string]: string;
  };
  headers: {
    [key: string]: string;
  };
}

export interface SiteConfigs {
  APARTMENTS_COM: SiteConfig;
  ZILLOW: SiteConfig;
  RENTALS_COM: SiteConfig;
}

export const siteConfigs: SiteConfigs = {
  APARTMENTS_COM: {
    baseUrl: "https://www.apartments.com",
    searchUrl: "https://www.apartments.com/{city}-{state}",
    rateLimit: 1.5, // requests per second
    selectors: {
      propertyCards: ".placard",
      propertyName: ".js-placardTitle",
      price: ".altRentDisplay",
      address: ".js-address",
      bedrooms: ".bed-range",
      bathrooms: ".bath-range",
      sqft: ".sqft",
      amenities: ".amenityList li",
      availability: ".available-date",
      images: ".carouselInner img",
      phone: ".phone-link",
      website: ".website-link"
    },
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Connection": "keep-alive",
      "Upgrade-Insecure-Requests": "1"
    }
  },
  
  ZILLOW: {
    baseUrl: "https://www.zillow.com",
    searchUrl: "https://www.zillow.com/{city}-{state}/rentals",
    rateLimit: 1.0, // requests per second
    selectors: {
      propertyCards: "[data-testid='property-card']",
      propertyName: "h3[data-testid='property-card-addr']",
      price: "[data-testid='property-card-price']",
      address: "[data-testid='property-card-addr']",
      bedrooms: "[data-testid='property-card-details'] span:first-child",
      bathrooms: "[data-testid='property-card-details'] span:nth-child(2)",
      sqft: "[data-testid='property-card-details'] span:last-child",
      images: "[data-testid='property-card-photos'] img",
      listingUrl: "[data-testid='property-card-link']"
    },
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Connection": "keep-alive"
    }
  },
  
  RENTALS_COM: {
    baseUrl: "https://www.rentals.com",
    searchUrl: "https://www.rentals.com/{city}-{state}",
    rateLimit: 2.0,
    selectors: {
      propertyCards: ".listing-item",
      propertyName: ".listing-title",
      price: ".listing-price",
      address: ".listing-address",
      bedrooms: ".listing-beds",
      bathrooms: ".listing-baths",
      sqft: ".listing-sqft"
    },
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  }
};

export const scrapingConfig: ScrapingConfig = {
  requestsPerSecond: 2.0,
  requestsPerMinute: 60,
  concurrentRequests: 10,
  requestTimeout: 30000,
  pageLoadTimeout: 45000,
  maxRetries: 3,
  retryDelay: 2000,
  backoffFactor: 2.0,
  rotateUserAgents: true,
  useProxies: false,
  proxyRotationInterval: 100,
  cacheDurationHours: 6,
  staleDataThresholdDays: 7,
  headlessBrowser: true,
  browserWindowSize: [1920, 1080]
};

export interface TargetCity {
  city: string;
  state: string;
  priority: number;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export const targetCities: TargetCity[] = [
  { city: "austin", state: "tx", priority: 1 },
  { city: "dallas", state: "tx", priority: 1 },
  { city: "houston", state: "tx", priority: 1 },
  { city: "san-antonio", state: "tx", priority: 2 },
  { city: "atlanta", state: "ga", priority: 2 },
  { city: "miami", state: "fl", priority: 2 },
  { city: "denver", state: "co", priority: 3 },
  { city: "seattle", state: "wa", priority: 3 },
  { city: "phoenix", state: "az", priority: 3 },
  { city: "los-angeles", state: "ca", priority: 4 }
];