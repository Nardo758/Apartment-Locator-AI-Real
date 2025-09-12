/**
 * Cache manager for optimizing scraping performance
 */

import { ScrapedProperty, ScrapingResult, CacheEntry } from '../core/types';
import { scrapingLogger } from './Logger';

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number; // Time to live in milliseconds
  cleanupInterval: number;
}

export class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;
  private logger = scrapingLogger;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 1000,
      defaultTTL: config.defaultTTL || 6 * 60 * 60 * 1000, // 6 hours
      cleanupInterval: config.cleanupInterval || 30 * 60 * 1000 // 30 minutes
    };

    this.startCleanupTimer();
  }

  /**
   * Get cached value
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt.getTime()) {
      this.cache.delete(key);
      this.logger.debug('Cache entry expired', { key });
      return null;
    }

    this.logger.debug('Cache hit', { key });
    return entry.data;
  }

  /**
   * Set cached value
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Check cache size limit
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    const expirationTime = ttl || this.config.defaultTTL;
    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + expirationTime)
    };

    this.cache.set(key, entry);
    this.logger.debug('Cache set', { key, ttl: expirationTime });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt.getTime()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete cached value
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.logger.debug('Cache entry deleted', { key });
    }
    return deleted;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    memoryUsage: number;
  } {
    // This would track hits/misses in a real implementation
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0.75, // Placeholder
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Cache scraping results with intelligent TTL
   */
  cacheScrapingResult(city: string, state: string, source: string, result: ScrapingResult): void {
    const key = this.buildScrapingKey(city, state, source);
    
    // Adjust TTL based on market velocity and success
    let ttl = this.config.defaultTTL;
    
    if (result.success) {
      // Successful results can be cached longer
      ttl = this.config.defaultTTL;
      
      // Hot markets get shorter cache time
      if (result.properties.some(p => p.daysOnMarket && p.daysOnMarket < 10)) {
        ttl = 2 * 60 * 60 * 1000; // 2 hours for hot markets
      }
    } else {
      // Failed results get shorter cache time
      ttl = 30 * 60 * 1000; // 30 minutes
    }

    this.set(key, result, ttl);
  }

  /**
   * Get cached scraping result
   */
  getCachedScrapingResult(city: string, state: string, source: string): ScrapingResult | null {
    const key = this.buildScrapingKey(city, state, source);
    return this.get<ScrapingResult>(key);
  }

  /**
   * Cache property details with longer TTL
   */
  cachePropertyDetails(propertyId: string, property: ScrapedProperty): void {
    const key = `property:${propertyId}`;
    // Property details change less frequently
    const ttl = 24 * 60 * 60 * 1000; // 24 hours
    this.set(key, property, ttl);
  }

  /**
   * Get cached property details
   */
  getCachedPropertyDetails(propertyId: string): ScrapedProperty | null {
    const key = `property:${propertyId}`;
    return this.get<ScrapedProperty>(key);
  }

  /**
   * Cache market analysis
   */
  cacheMarketAnalysis(city: string, state: string, analysis: any): void {
    const key = `market:${city}-${state}`;
    // Market analysis valid for 4 hours
    const ttl = 4 * 60 * 60 * 1000;
    this.set(key, analysis, ttl);
  }

  /**
   * Get cached market analysis
   */
  getCachedMarketAnalysis(city: string, state: string): any | null {
    const key = `market:${city}-${state}`;
    return this.get(key);
  }

  /**
   * Cache geocoding results (these rarely change)
   */
  cacheGeocodingResult(address: string, result: any): void {
    const key = `geocode:${address.toLowerCase()}`;
    // Geocoding results valid for 30 days
    const ttl = 30 * 24 * 60 * 60 * 1000;
    this.set(key, result, ttl);
  }

  /**
   * Get cached geocoding result
   */
  getCachedGeocodingResult(address: string): any | null {
    const key = `geocode:${address.toLowerCase()}`;
    return this.get(key);
  }

  /**
   * Intelligent cache warming for popular cities
   */
  async warmCache(popularCities: Array<{ city: string; state: string }>, sources: string[]): Promise<void> {
    this.logger.info('Starting cache warming', { 
      cities: popularCities.length, 
      sources: sources.length 
    });

    for (const { city, state } of popularCities) {
      for (const source of sources) {
        const key = this.buildScrapingKey(city, state, source);
        
        // Only warm if not already cached
        if (!this.has(key)) {
          try {
            // This would trigger actual scraping in a real implementation
            this.logger.debug('Cache warming placeholder', { city, state, source });
            
            // Add small delay to avoid overwhelming servers
            await this.sleep(1000);
          } catch (error) {
            this.logger.warn('Cache warming failed', { 
              city, 
              state, 
              source, 
              error: (error as Error).message 
            });
          }
        }
      }
    }

    this.logger.info('Cache warming completed');
  }

  /**
   * Preemptive cache refresh for expiring entries
   */
  async refreshExpiringEntries(): Promise<void> {
    const now = Date.now();
    const refreshThreshold = 30 * 60 * 1000; // 30 minutes before expiration
    const entriesToRefresh: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      const timeToExpiry = entry.expiresAt.getTime() - now;
      
      if (timeToExpiry > 0 && timeToExpiry < refreshThreshold) {
        entriesToRefresh.push(key);
      }
    }

    if (entriesToRefresh.length > 0) {
      this.logger.info('Refreshing expiring cache entries', { count: entriesToRefresh.length });
      
      for (const key of entriesToRefresh) {
        // In a real implementation, this would trigger appropriate refresh logic
        this.logger.debug('Refreshing cache entry', { key });
      }
    }
  }

  private buildScrapingKey(city: string, state: string, source: string): string {
    return `scraping:${source}:${city}-${state}`;
  }

  private evictLRU(): void {
    // Find the least recently used entry (oldest timestamp)
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp.getTime() < oldestTime) {
        oldestTime = entry.timestamp.getTime();
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.logger.debug('LRU eviction', { key: oldestKey });
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private cleanup(): void {
    const now = Date.now();
    let expiredCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt.getTime()) {
        this.cache.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      this.logger.debug('Cache cleanup completed', { 
        expired: expiredCount, 
        remaining: this.cache.size 
      });
    }
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage in bytes
    let totalSize = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      totalSize += key.length * 2; // UTF-16 characters
      totalSize += JSON.stringify(entry.data).length * 2;
      totalSize += 100; // Overhead for metadata
    }

    return totalSize;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Destroy cache manager and cleanup
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    
    this.clear();
    this.logger.info('Cache manager destroyed');
  }
}

// Global cache instance
export const cacheManager = new CacheManager({
  maxSize: 2000,
  defaultTTL: 6 * 60 * 60 * 1000, // 6 hours
  cleanupInterval: 15 * 60 * 1000 // 15 minutes
});