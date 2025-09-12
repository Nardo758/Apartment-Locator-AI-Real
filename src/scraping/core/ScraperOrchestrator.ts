/**
 * Scraper orchestrator to coordinate multiple scrapers and manage scraping jobs
 */

import { 
  BaseScraper, 
  ScrapedProperty, 
  ScrapingJob, 
  ScrapingResult, 
  ScrapingOptions,
  ScrapingStats,
  TargetCity 
} from './types';
import { ApartmentsScraper } from '../scrapers/ApartmentsScraper';
import { ZillowScraper } from '../scrapers/ZillowScraper';
import { DataValidator, PropertyDeduplicator } from '../utils/DataValidator';
import { scrapingLogger, ScrapingLogger } from '../utils/Logger';
import { targetCities } from '../config/settings';

export class ScraperOrchestrator {
  private scrapers: Map<string, BaseScraper> = new Map();
  private activeJobs: Map<string, ScrapingJob> = new Map();
  private dataValidator: DataValidator;
  private deduplicator: PropertyDeduplicator;
  private logger: ScrapingLogger;
  private stats: ScrapingStats;

  constructor() {
    this.dataValidator = new DataValidator();
    this.deduplicator = new PropertyDeduplicator();
    this.logger = scrapingLogger;
    this.stats = this.initializeStats();
    
    this.initializeScrapers();
  }

  private initializeScrapers(): void {
    this.scrapers.set('apartments.com', new ApartmentsScraper());
    this.scrapers.set('zillow.com', new ZillowScraper());
    
    this.logger.info('Scraper orchestrator initialized', {
      availableScrapers: Array.from(this.scrapers.keys())
    });
  }

  private initializeStats(): ScrapingStats {
    return {
      totalPropertiesScraped: 0,
      successRate: 0,
      averageResponseTime: 0,
      errorsByType: {},
      propertiesBySource: {},
      lastSuccessfulScrape: new Date()
    };
  }

  /**
   * Scrape all target cities using all available scrapers
   */
  async scrapeAllCities(options: ScrapingOptions = {}): Promise<ScrapingResult[]> {
    this.logger.info('Starting comprehensive scraping of all target cities');
    
    const results: ScrapingResult[] = [];
    const jobs: Promise<ScrapingResult>[] = [];

    // Create scraping jobs for all city-scraper combinations
    for (const city of targetCities) {
      if (city.priority <= (options.maxPriority || 4)) {
        for (const [source, scraper] of this.scrapers) {
          jobs.push(this.scrapeCity(source, city.city, city.state, options));
        }
      }
    }

    // Execute jobs with concurrency control
    const concurrency = options.concurrency || 3;
    for (let i = 0; i < jobs.length; i += concurrency) {
      const batch = jobs.slice(i, i + concurrency);
      const batchResults = await Promise.allSettled(batch);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          this.logger.error('Scraping job failed', result.reason);
        }
      }
      
      // Brief pause between batches to avoid overwhelming servers
      if (i + concurrency < jobs.length) {
        await this.sleep(2000);
      }
    }

    await this.processResults(results);
    this.updateStats(results);
    
    this.logger.info('Comprehensive scraping completed', {
      totalResults: results.length,
      totalProperties: results.reduce((sum, r) => sum + r.properties.length, 0)
    });

    return results;
  }

  /**
   * Scrape a specific city using a specific scraper
   */
  async scrapeCity(
    source: string, 
    city: string, 
    state: string, 
    options: ScrapingOptions = {}
  ): Promise<ScrapingResult> {
    const jobId = this.generateJobId(source, city, state);
    
    const job: ScrapingJob = {
      id: jobId,
      source,
      city,
      state,
      status: 'pending',
      priority: this.getCityPriority(city, state),
      scheduledAt: new Date(),
      retryCount: 0,
      maxRetries: 3
    };

    this.activeJobs.set(jobId, job);

    try {
      this.logger.logScrapingStart(source, city, state);
      
      job.status = 'running';
      job.startedAt = new Date();
      
      const scraper = this.scrapers.get(source);
      if (!scraper) {
        throw new Error(`Scraper not found for source: ${source}`);
      }

      const result = await scraper.scrapeCity(city, state, options);
      
      job.status = 'completed';
      job.completedAt = new Date();
      job.result = result;

      this.logger.logScrapingEnd(
        result.properties.length,
        result.properties.length,
        result.errors.length
      );

      return result;

    } catch (error) {
      job.status = 'failed';
      job.completedAt = new Date();
      
      this.logger.error('Scraping job failed', error as Error, {
        jobId,
        source,
        city,
        state
      });

      // Create failed result
      const failedResult: ScrapingResult = {
        success: false,
        properties: [],
        errors: [{
          type: 'validation',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
          retryable: true
        }],
        metadata: {
          source,
          city,
          state,
          totalPages: 0,
          currentPage: 0,
          propertiesFound: 0,
          propertiesProcessed: 0,
          startTime: job.startedAt!,
          endTime: new Date(),
          duration: Date.now() - job.startedAt!.getTime()
        }
      };

      return failedResult;
    } finally {
      this.activeJobs.delete(jobId);
    }
  }

  /**
   * Process and deduplicate scraped results
   */
  private async processResults(results: ScrapingResult[]): Promise<void> {
    this.logger.info('Processing scraping results for deduplication');
    
    const allProperties: ScrapedProperty[] = [];
    const processedProperties: ScrapedProperty[] = [];

    // Collect all properties
    for (const result of results) {
      allProperties.push(...result.properties);
    }

    // Deduplicate properties
    for (const property of allProperties) {
      const duplicates = this.deduplicator.findDuplicates(property, processedProperties);
      
      if (duplicates.length === 0) {
        // No duplicates found, add property
        processedProperties.push(property);
      } else {
        // Handle duplicate - merge or skip based on data quality
        const bestDuplicate = duplicates[0];
        if (this.shouldReplaceProperty(property, bestDuplicate.property)) {
          // Replace existing with new property
          const index = processedProperties.indexOf(bestDuplicate.property);
          processedProperties[index] = property;
        }
        
        this.logger.debug('Duplicate property handled', {
          propertyId: property.externalId,
          duplicateId: bestDuplicate.property.externalId,
          similarity: bestDuplicate.similarity
        });
      }
    }

    // Update results with deduplicated properties
    const propertiesPerResult = Math.ceil(processedProperties.length / results.length);
    for (let i = 0; i < results.length; i++) {
      const start = i * propertiesPerResult;
      const end = Math.min(start + propertiesPerResult, processedProperties.length);
      results[i].properties = processedProperties.slice(start, end);
    }

    this.logger.info('Deduplication completed', {
      originalCount: allProperties.length,
      deduplicatedCount: processedProperties.length,
      duplicatesRemoved: allProperties.length - processedProperties.length
    });
  }

  private shouldReplaceProperty(newProperty: ScrapedProperty, existingProperty: ScrapedProperty): boolean {
    // Replace if new property has more complete data
    const newScore = this.calculatePropertyCompleteness(newProperty);
    const existingScore = this.calculatePropertyCompleteness(existingProperty);
    
    // Also consider recency
    const isNewer = newProperty.scrapedAt > existingProperty.scrapedAt;
    
    return newScore > existingScore || (newScore === existingScore && isNewer);
  }

  private calculatePropertyCompleteness(property: ScrapedProperty): number {
    let score = 0;
    
    // Required fields
    if (property.name) score += 10;
    if (property.address) score += 10;
    if (property.currentPrice > 0) score += 15;
    if (property.bedrooms >= 0) score += 5;
    if (property.bathrooms >= 0) score += 5;
    
    // Optional but valuable fields
    if (property.sqft) score += 5;
    if (property.amenities.length > 0) score += 5;
    if (property.images.length > 0) score += 5;
    if (property.coordinates) score += 10;
    if (property.phoneNumber) score += 5;
    if (property.availability && property.availability !== 'Contact for availability') score += 5;
    
    return score;
  }

  /**
   * Get scraping statistics
   */
  getStats(): ScrapingStats {
    return { ...this.stats };
  }

  /**
   * Get active scraping jobs
   */
  getActiveJobs(): ScrapingJob[] {
    return Array.from(this.activeJobs.values());
  }

  /**
   * Cancel a scraping job
   */
  cancelJob(jobId: string): boolean {
    const job = this.activeJobs.get(jobId);
    if (job && job.status === 'running') {
      job.status = 'cancelled';
      job.completedAt = new Date();
      this.activeJobs.delete(jobId);
      return true;
    }
    return false;
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<ScrapingResult | null> {
    const job = this.activeJobs.get(jobId);
    if (!job || job.status !== 'failed' || job.retryCount >= job.maxRetries) {
      return null;
    }

    job.retryCount++;
    return this.scrapeCity(job.source, job.city, job.state);
  }

  /**
   * Add a new scraper
   */
  addScraper(source: string, scraper: BaseScraper): void {
    this.scrapers.set(source, scraper);
    this.logger.info('New scraper added', { source });
  }

  /**
   * Remove a scraper
   */
  removeScraper(source: string): boolean {
    const removed = this.scrapers.delete(source);
    if (removed) {
      this.logger.info('Scraper removed', { source });
    }
    return removed;
  }

  /**
   * Get available scrapers
   */
  getAvailableScrapers(): string[] {
    return Array.from(this.scrapers.keys());
  }

  /**
   * Health check for all scrapers
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};
    
    for (const [source, scraper] of this.scrapers) {
      try {
        // Simple health check - try to access the base URL
        const response = await fetch(scraper.source.includes('apartments') 
          ? 'https://www.apartments.com' 
          : 'https://www.zillow.com', 
          { method: 'HEAD', timeout: 5000 }
        );
        health[source] = response.ok;
      } catch {
        health[source] = false;
      }
    }
    
    return health;
  }

  private updateStats(results: ScrapingResult[]): void {
    const totalProperties = results.reduce((sum, r) => sum + r.properties.length, 0);
    const successfulResults = results.filter(r => r.success);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
    
    this.stats.totalPropertiesScraped += totalProperties;
    this.stats.successRate = successfulResults.length / results.length;
    this.stats.lastSuccessfulScrape = new Date();

    // Update error statistics
    for (const result of results) {
      for (const error of result.errors) {
        this.stats.errorsByType[error.type] = (this.stats.errorsByType[error.type] || 0) + 1;
      }
    }

    // Update properties by source
    for (const result of results) {
      const source = result.metadata.source;
      this.stats.propertiesBySource[source] = (this.stats.propertiesBySource[source] || 0) + result.properties.length;
    }

    // Calculate average response time
    const totalDuration = results.reduce((sum, r) => sum + r.metadata.duration, 0);
    this.stats.averageResponseTime = totalDuration / results.length;
  }

  private generateJobId(source: string, city: string, state: string): string {
    return `${source}_${city}_${state}_${Date.now()}`;
  }

  private getCityPriority(city: string, state: string): number {
    const targetCity = targetCities.find(c => 
      c.city.toLowerCase() === city.toLowerCase() && 
      c.state.toLowerCase() === state.toLowerCase()
    );
    return targetCity?.priority || 5;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const scraperOrchestrator = new ScraperOrchestrator();