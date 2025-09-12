/**
 * Main entry point for the apartment scraping framework
 */

// Core exports
export * from './core/types';
export * from './core/BaseScraper';
export * from './core/ScraperOrchestrator';

// Scraper implementations
export * from './scrapers/ApartmentsScraper';
export * from './scrapers/ZillowScraper';

// Utilities
export * from './utils/DataValidator';
export * from './utils/RateLimiter';
export * from './utils/ProxyManager';
export * from './utils/Logger';

// Configuration
export * from './config/settings';

// Main orchestrator instance
export { scraperOrchestrator } from './core/ScraperOrchestrator';

/**
 * Quick start function for scraping
 */
import { scraperOrchestrator } from './core/ScraperOrchestrator';
import { ScrapingOptions, ScrapingResult } from './core/types';

export async function scrapeApartments(options: ScrapingOptions = {}): Promise<ScrapingResult[]> {
  return scraperOrchestrator.scrapeAllCities(options);
}

export async function scrapeCityApartments(
  city: string, 
  state: string, 
  sources: string[] = ['apartments.com', 'zillow.com'],
  options: ScrapingOptions = {}
): Promise<ScrapingResult[]> {
  const results: ScrapingResult[] = [];
  
  for (const source of sources) {
    const result = await scraperOrchestrator.scrapeCity(source, city, state, options);
    results.push(result);
  }
  
  return results;
}

/**
 * Integration with the existing apartment AI system
 */
import { Property } from '../data/mockData';

export function convertToAIProperty(scrapedProperty: import('./core/types').ScrapedProperty): Property {
  return {
    id: scrapedProperty.externalId,
    name: scrapedProperty.name,
    address: scrapedProperty.address,
    city: scrapedProperty.city,
    state: scrapedProperty.state,
    zip: scrapedProperty.zipCode,
    originalPrice: scrapedProperty.originalPrice,
    aiPrice: scrapedProperty.currentPrice, // Will be enhanced by AI later
    effectivePrice: scrapedProperty.currentPrice,
    savings: 0, // Will be calculated by AI
    matchScore: 0, // Will be calculated by AI
    successRate: 0, // Will be calculated by AI
    daysVacant: scrapedProperty.daysOnMarket || 0,
    availability: scrapedProperty.availability,
    availabilityType: scrapedProperty.availabilityType,
    features: scrapedProperty.features,
    amenities: scrapedProperty.amenities,
    commutes: [], // Will be calculated based on user preferences
    concessions: scrapedProperty.concessions || [],
    coordinates: scrapedProperty.coordinates || { lat: 0, lng: 0 },
    images: scrapedProperty.images,
    bedrooms: scrapedProperty.bedrooms,
    bathrooms: scrapedProperty.bathrooms,
    sqft: scrapedProperty.sqft || 0,
    yearBuilt: scrapedProperty.yearBuilt || new Date().getFullYear(),
    petPolicy: scrapedProperty.petPolicy || 'Contact for pet policy',
    parking: scrapedProperty.parking || 'Contact for parking info'
  };
}

/**
 * Batch convert scraped properties to AI properties
 */
export function convertScrapedPropertiesToAI(scrapedProperties: import('./core/types').ScrapedProperty[]): Property[] {
  return scrapedProperties.map(convertToAIProperty);
}

/**
 * Enhanced scraping with AI integration
 */
export async function scrapeAndEnhanceProperties(
  city: string,
  state: string,
  options: ScrapingOptions = {}
): Promise<Property[]> {
  // Scrape properties from multiple sources
  const results = await scrapeCityApartments(city, state, undefined, options);
  
  // Combine all properties
  const allProperties = results.flatMap(result => result.properties);
  
  // Convert to AI format
  const aiProperties = convertScrapedPropertiesToAI(allProperties);
  
  // TODO: Enhance with AI analysis
  // - Calculate match scores
  // - Predict concessions
  // - Estimate market velocity
  // - Calculate commute times
  // - Determine negotiation strategies
  
  return aiProperties;
}