/**
 * Market Intelligence Engine
 * Calculates market stats from scraped property data ONLY (no external APIs)
 * 
 * Data Sources:
 * - properties table (scraped properties)
 * - lease_rates table (pricing data)
 * - concessions table (move-in specials)
 * 
 * Calculations:
 * - Price trends by city/area
 * - Inventory metrics
 * - Concession analysis
 * - Market competitiveness
 */

import { supabase } from '@/integrations/supabase/client';

export interface MarketStats {
  location: string; // "Atlanta, GA"
  city: string;
  state: string;
  
  // Pricing
  avgRent: number;
  medianRent: number;
  minRent: number;
  maxRent: number;
  rentDistribution: { range: string; count: number }[];
  
  // Inventory
  totalProperties: number;
  totalUnits: number;
  avgUnitsPerProperty: number;
  propertiesWithVacancies: number;
  
  // Concessions
  propertiesWithConcessions: number;
  concessionRate: number; // % of properties
  avgSavings: number;
  commonConcessions: { type: string; count: number }[];
  
  // Market Competitiveness
  daysOnMarket: number; // Avg days since first scraped
  inventoryPressure: 'low' | 'medium' | 'high';
  
  // Property Management
  pmsSystems: { name: string; count: number }[];
  
  // Meta
  lastUpdated: Date;
  dataPoints: number; // # of properties in calculation
}

export interface MarketIntelOptions {
  enableCache?: boolean;
  cacheDurationMinutes?: number;
  debug?: boolean;
}

/**
 * Market Intelligence Engine
 * Calculates market data from scraped properties
 */
export class MarketIntelEngine {
  private options: MarketIntelOptions;
  private cacheKey = 'market_intel_cache';
  
  constructor(options: MarketIntelOptions = {}) {
    this.options = {
      enableCache: true,
      cacheDurationMinutes: 30, // Cache for 30 minutes
      debug: false,
      ...options,
    };
  }
  
  /**
   * Get market stats for a location
   */
  async getMarketStats(city: string, state: string): Promise<MarketStats | null> {
    try {
      if (this.options.debug) {
        console.log(`[MarketIntel] Getting stats for ${city}, ${state}`);
      }
      
      // Check cache first
      if (this.options.enableCache) {
        const cached = this.getFromCache(city, state);
        if (cached) {
          if (this.options.debug) {
            console.log(`[MarketIntel] Cache hit for ${city}, ${state}`);
          }
          return cached;
        }
      }
      
      // Calculate fresh stats
      const stats = await this.calculateStats(city, state);
      
      if (!stats) {
        return null;
      }
      
      // Save to cache
      if (this.options.enableCache) {
        this.saveToCache(city, state, stats);
      }
      
      return stats;
      
    } catch (error) {
      console.error('[MarketIntel] Error getting market stats:', error);
      return null;
    }
  }
  
  /**
   * Calculate market stats from database
   */
  private async calculateStats(city: string, state: string): Promise<MarketStats | null> {
    try {
      // Get all properties for this location
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('id, property_name, city, state, phone, pms_type, scraped_at')
        .ilike('city', city)
        .ilike('state', state);
      
      if (propError) throw propError;
      
      if (!properties || properties.length === 0) {
        if (this.options.debug) {
          console.log(`[MarketIntel] No properties found for ${city}, ${state}`);
        }
        return null;
      }
      
      const propertyIds = properties.map(p => p.id);
      
      // Get lease rates for pricing analysis
      const { data: leaseRates, error: ratesError } = await supabase
        .from('lease_rates')
        .select('property_id, price, sqft, lease_term')
        .in('property_id', propertyIds);
      
      if (ratesError) throw ratesError;
      
      // Get concessions for concession analysis
      const { data: concessions, error: concessionsError } = await supabase
        .from('concessions')
        .select('property_id, type, description')
        .in('property_id', propertyIds)
        .eq('active', true);
      
      if (concessionsError) throw concessionsError;
      
      // Calculate pricing stats
      const prices = (leaseRates || []).map(r => r.price / 100); // Convert cents to dollars
      const sortedPrices = prices.sort((a, b) => a - b);
      
      const avgRent = prices.length > 0
        ? prices.reduce((sum, p) => sum + p, 0) / prices.length
        : 0;
      
      const medianRent = prices.length > 0
        ? sortedPrices[Math.floor(sortedPrices.length / 2)]
        : 0;
      
      const minRent = prices.length > 0 ? Math.min(...prices) : 0;
      const maxRent = prices.length > 0 ? Math.max(...prices) : 0;
      
      // Rent distribution (buckets of $500)
      const distribution = this.calculateDistribution(prices, 500);
      
      // Inventory metrics
      const totalUnits = leaseRates?.length || 0;
      const avgUnitsPerProperty = properties.length > 0 ? totalUnits / properties.length : 0;
      const propertiesWithVacancies = new Set(leaseRates?.map(r => r.property_id)).size;
      
      // Concession analysis
      const propertiesWithConcessions = new Set(concessions?.map(c => c.property_id)).size;
      const concessionRate = properties.length > 0
        ? (propertiesWithConcessions / properties.length) * 100
        : 0;
      
      // Estimate avg savings (rough: 10% of avg rent if has concessions)
      const avgSavings = concessionRate > 0 ? avgRent * 0.1 : 0;
      
      // Common concessions
      const concessionCounts: Record<string, number> = {};
      concessions?.forEach(c => {
        concessionCounts[c.type] = (concessionCounts[c.type] || 0) + 1;
      });
      const commonConcessions = Object.entries(concessionCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Days on market (avg time since first scraped)
      const now = new Date();
      const avgDaysOnMarket = properties.length > 0
        ? properties.reduce((sum, p) => {
            const scrapedDate = new Date(p.scraped_at);
            const days = Math.floor((now.getTime() - scrapedDate.getTime()) / (1000 * 60 * 60 * 24));
            return sum + days;
          }, 0) / properties.length
        : 0;
      
      // Inventory pressure (based on units per property)
      const inventoryPressure: 'low' | 'medium' | 'high' = 
        avgUnitsPerProperty < 2 ? 'high' :
        avgUnitsPerProperty < 4 ? 'medium' : 'low';
      
      // PMS systems
      const pmsCounts: Record<string, number> = {};
      properties.forEach(p => {
        if (p.pms_type) {
          pmsCounts[p.pms_type] = (pmsCounts[p.pms_type] || 0) + 1;
        }
      });
      const pmsSystems = Object.entries(pmsCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
      
      // Build result
      const stats: MarketStats = {
        location: `${city}, ${state}`,
        city,
        state,
        avgRent: Math.round(avgRent),
        medianRent: Math.round(medianRent),
        minRent: Math.round(minRent),
        maxRent: Math.round(maxRent),
        rentDistribution: distribution,
        totalProperties: properties.length,
        totalUnits,
        avgUnitsPerProperty: Math.round(avgUnitsPerProperty * 10) / 10,
        propertiesWithVacancies,
        propertiesWithConcessions,
        concessionRate: Math.round(concessionRate * 10) / 10,
        avgSavings: Math.round(avgSavings),
        commonConcessions,
        daysOnMarket: Math.round(avgDaysOnMarket),
        inventoryPressure,
        pmsSystems,
        lastUpdated: new Date(),
        dataPoints: properties.length,
      };
      
      return stats;
      
    } catch (error) {
      console.error('[MarketIntel] Error calculating stats:', error);
      return null;
    }
  }
  
  /**
   * Calculate price distribution
   */
  private calculateDistribution(prices: number[], bucketSize: number): { range: string; count: number }[] {
    if (prices.length === 0) return [];
    
    const min = Math.floor(Math.min(...prices) / bucketSize) * bucketSize;
    const max = Math.ceil(Math.max(...prices) / bucketSize) * bucketSize;
    
    const buckets: Record<string, number> = {};
    
    for (let bucket = min; bucket <= max; bucket += bucketSize) {
      const rangeStart = bucket;
      const rangeEnd = bucket + bucketSize;
      const rangeKey = `$${rangeStart}-$${rangeEnd}`;
      
      const count = prices.filter(p => p >= rangeStart && p < rangeEnd).length;
      if (count > 0) {
        buckets[rangeKey] = count;
      }
    }
    
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }
  
  /**
   * Get from localStorage cache
   */
  private getFromCache(city: string, state: string): MarketStats | null {
    try {
      const cacheData = localStorage.getItem(this.cacheKey);
      if (!cacheData) return null;
      
      const cache = JSON.parse(cacheData);
      const key = `${city.toLowerCase()}_${state.toLowerCase()}`;
      const cached = cache[key];
      
      if (!cached) return null;
      
      // Check if expired
      const cachedDate = new Date(cached.lastUpdated);
      const now = new Date();
      const ageMinutes = (now.getTime() - cachedDate.getTime()) / (1000 * 60);
      
      if (ageMinutes > (this.options.cacheDurationMinutes || 30)) {
        return null; // Expired
      }
      
      return cached;
      
    } catch (error) {
      console.error('[MarketIntel] Cache read error:', error);
      return null;
    }
  }
  
  /**
   * Save to localStorage cache
   */
  private saveToCache(city: string, state: string, stats: MarketStats): void {
    try {
      const cacheData = localStorage.getItem(this.cacheKey);
      const cache = cacheData ? JSON.parse(cacheData) : {};
      
      const key = `${city.toLowerCase()}_${state.toLowerCase()}`;
      cache[key] = stats;
      
      localStorage.setItem(this.cacheKey, JSON.stringify(cache));
      
    } catch (error) {
      console.error('[MarketIntel] Cache write error:', error);
    }
  }
  
  /**
   * Clear cache
   */
  clearCache(): void {
    try {
      localStorage.removeItem(this.cacheKey);
      if (this.options.debug) {
        console.log('[MarketIntel] Cache cleared');
      }
    } catch (error) {
      console.error('[MarketIntel] Error clearing cache:', error);
    }
  }
  
  /**
   * Get stats for multiple locations
   */
  async getMultipleLocations(locations: { city: string; state: string }[]): Promise<MarketStats[]> {
    const results = await Promise.all(
      locations.map(({ city, state }) => this.getMarketStats(city, state))
    );
    
    return results.filter((s): s is MarketStats => s !== null);
  }
}
