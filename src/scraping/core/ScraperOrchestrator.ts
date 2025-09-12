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
import { RentScraper } from '../scrapers/RentScraper';
import { CraigslistScraper } from '../scrapers/CraigslistScraper';
import { DataValidator, PropertyDeduplicator } from '../utils/DataValidator';
import { scrapingLogger, ScrapingLogger } from '../utils/Logger';
import { targetCities } from '../config/settings';
import { marketAnalyzer, MarketAnalyzer, PricePrediction, ConcessionPrediction } from '../ai/MarketAnalyzer';
import { geocodingService, GeocodingService } from '../services/GeocodingService';
import { notificationService, NotificationService } from '../services/NotificationService';

export class ScraperOrchestrator {
  private scrapers: Map<string, BaseScraper> = new Map();
  private activeJobs: Map<string, ScrapingJob> = new Map();
  private dataValidator: DataValidator;
  private deduplicator: PropertyDeduplicator;
  private logger: ScrapingLogger;
  private stats: ScrapingStats;
  private marketAnalyzer: MarketAnalyzer;
  private geocodingService: GeocodingService;
  private notificationService: NotificationService;
  private propertyHistory: Map<string, ScrapedProperty[]> = new Map();

  constructor() {
    this.dataValidator = new DataValidator();
    this.deduplicator = new PropertyDeduplicator();
    this.logger = scrapingLogger;
    this.stats = this.initializeStats();
    this.marketAnalyzer = marketAnalyzer;
    this.geocodingService = geocodingService;
    this.notificationService = notificationService;
    
    this.initializeScrapers();
  }

  private initializeScrapers(): void {
    this.scrapers.set('apartments.com', new ApartmentsScraper());
    this.scrapers.set('zillow.com', new ZillowScraper());
    this.scrapers.set('rent.com', new RentScraper());
    this.scrapers.set('craigslist.org', new CraigslistScraper());
    
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

  /**
   * Enhanced scraping with AI analysis and geocoding
   */
  async scrapeWithAIEnhancement(
    source: string, 
    city: string, 
    state: string, 
    options: ScrapingOptions = {}
  ): Promise<{
    result: ScrapingResult;
    analysis: any;
    predictions: PricePrediction[];
    concessions: ConcessionPrediction[];
  }> {
    // Perform basic scraping
    const result = await this.scrapeCity(source, city, state, options);
    
    if (!result.success || result.properties.length === 0) {
      return {
        result,
        analysis: null,
        predictions: [],
        concessions: []
      };
    }

    // Enhance properties with geocoding
    await this.enhancePropertiesWithGeocoding(result.properties);

    // Perform market analysis
    const analysis = this.marketAnalyzer.analyzeMarket(result.properties, city, state);

    // Generate price predictions
    const predictions = await this.generatePricePredictions(result.properties);

    // Generate concession predictions
    const concessions = await this.generateConcessionPredictions(result.properties, analysis);

    // Check for notifications
    await this.checkForNotifications(result.properties, city, state);

    return {
      result,
      analysis,
      predictions,
      concessions
    };
  }

  /**
   * Enhance properties with precise coordinates
   */
  async enhancePropertiesWithGeocoding(properties: ScrapedProperty[]): Promise<void> {
    this.logger.info('Enhancing properties with geocoding', { count: properties.length });

    const addressesToGeocode = properties
      .filter(p => !p.coordinates)
      .map(p => ({
        address: p.address,
        city: p.city,
        state: p.state
      }));

    if (addressesToGeocode.length === 0) {
      return;
    }

    const geocodingResults = await this.geocodingService.batchGeocode(addressesToGeocode);

    let geocodedCount = 0;
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      if (!property.coordinates && i < geocodingResults.length) {
        const result = geocodingResults[i];
        if (result) {
          property.coordinates = result.coordinates;
          geocodedCount++;
        }
      }
    }

    this.logger.info('Geocoding completed', {
      total: addressesToGeocode.length,
      successful: geocodedCount
    });
  }

  /**
   * Generate price predictions for properties
   */
  async generatePricePredictions(properties: ScrapedProperty[]): Promise<PricePrediction[]> {
    const predictions: PricePrediction[] = [];

    for (const property of properties) {
      // Find comparable properties
      const comparables = properties.filter(p => 
        p.externalId !== property.externalId &&
        p.city === property.city &&
        p.state === property.state &&
        Math.abs(p.bedrooms - property.bedrooms) <= 1 &&
        Math.abs(p.bathrooms - property.bathrooms) <= 0.5
      );

      if (comparables.length >= 3) {
        const prediction = this.marketAnalyzer.predictPrice(property, comparables);
        predictions.push(prediction);
      }
    }

    return predictions;
  }

  /**
   * Generate concession predictions
   */
  async generateConcessionPredictions(properties: ScrapedProperty[], marketAnalysis: any): Promise<ConcessionPrediction[]> {
    const concessions: ConcessionPrediction[] = [];

    for (const property of properties) {
      const propertyConcessions = this.marketAnalyzer.predictConcessions(property, marketAnalysis);
      concessions.push(...propertyConcessions);
    }

    return concessions;
  }

  /**
   * Check for price drops and new listings to send notifications
   */
  async checkForNotifications(currentProperties: ScrapedProperty[], city: string, state: string): Promise<void> {
    const historyKey = `${city}-${state}`;
    const previousProperties = this.propertyHistory.get(historyKey) || [];

    // Check for price drops
    if (previousProperties.length > 0) {
      await this.notificationService.checkPriceDrops(currentProperties, previousProperties);
    }

    // Check for new listings
    const newProperties = currentProperties.filter(current => 
      !previousProperties.some(prev => prev.externalId === current.externalId)
    );

    if (newProperties.length > 0) {
      await this.notificationService.checkNewListings(newProperties);
    }

    // Update history
    this.propertyHistory.set(historyKey, currentProperties);
  }

  /**
   * Calculate commute times for properties
   */
  async calculateCommutesForProperties(
    properties: ScrapedProperty[], 
    destinations: Array<{ name: string; lat: number; lng: number }>
  ): Promise<Map<string, any[]>> {
    const commuteMap = new Map<string, any[]>();

    for (const property of properties) {
      if (!property.coordinates) continue;

      try {
        const commutes = await this.geocodingService.calculateCommutes(
          property.coordinates,
          destinations,
          ['driving', 'transit']
        );

        commuteMap.set(property.externalId, commutes);
      } catch (error) {
        this.logger.warn('Failed to calculate commutes for property', {
          propertyId: property.externalId,
          error: (error as Error).message
        });
      }
    }

    return commuteMap;
  }

  /**
   * Get comprehensive market intelligence for a city
   */
  async getMarketIntelligence(city: string, state: string): Promise<{
    marketAnalysis: any;
    topProperties: ScrapedProperty[];
    priceDistribution: any;
    concessionTrends: any;
    recommendations: string[];
  }> {
    // Scrape from all sources
    const sources = Array.from(this.scrapers.keys());
    const results = await Promise.allSettled(
      sources.map(source => this.scrapeCity(source, city, state, { maxPages: 5 }))
    );

    // Combine all successful results
    const allProperties: ScrapedProperty[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success) {
        allProperties.push(...result.value.properties);
      }
    }

    if (allProperties.length === 0) {
      throw new Error(`No properties found for ${city}, ${state}`);
    }

    // Perform comprehensive analysis
    const marketAnalysis = this.marketAnalyzer.analyzeMarket(allProperties, city, state);
    
    // Find top properties based on various criteria
    const topProperties = this.findTopProperties(allProperties, marketAnalysis);

    // Calculate price distribution
    const priceDistribution = this.calculatePriceDistribution(allProperties);

    // Analyze concession trends
    const concessionTrends = this.analyzeConcessionTrends(allProperties, marketAnalysis);

    // Generate recommendations
    const recommendations = this.generateMarketRecommendations(marketAnalysis, allProperties);

    return {
      marketAnalysis,
      topProperties,
      priceDistribution,
      concessionTrends,
      recommendations
    };
  }

  private findTopProperties(properties: ScrapedProperty[], marketAnalysis: any): ScrapedProperty[] {
    // Score properties based on multiple factors
    const scoredProperties = properties.map(property => {
      let score = 0;

      // Price value score (lower price relative to market = higher score)
      const priceRatio = property.currentPrice / marketAnalysis.medianPrice;
      score += Math.max(0, (2 - priceRatio) * 30); // Up to 30 points for good value

      // Amenity score
      score += property.amenities.length * 2;

      // Availability score
      if (property.availabilityType === 'immediate') score += 10;
      else if (property.availabilityType === 'soon') score += 5;

      // Square footage score
      if (property.sqft) {
        const pricePerSqft = property.currentPrice / property.sqft;
        const avgPricePerSqft = marketAnalysis.pricePerSqft;
        if (pricePerSqft < avgPricePerSqft) {
          score += (avgPricePerSqft - pricePerSqft) * 10;
        }
      }

      return { property, score };
    });

    // Sort by score and return top 10
    return scoredProperties
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(item => item.property);
  }

  private calculatePriceDistribution(properties: ScrapedProperty[]): any {
    const prices = properties.map(p => p.currentPrice).sort((a, b) => a - b);
    
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      median: prices[Math.floor(prices.length / 2)],
      q1: prices[Math.floor(prices.length * 0.25)],
      q3: prices[Math.floor(prices.length * 0.75)],
      average: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      distribution: {
        under1000: prices.filter(p => p < 1000).length,
        '1000-1500': prices.filter(p => p >= 1000 && p < 1500).length,
        '1500-2000': prices.filter(p => p >= 1500 && p < 2000).length,
        '2000-2500': prices.filter(p => p >= 2000 && p < 2500).length,
        '2500-3000': prices.filter(p => p >= 2500 && p < 3000).length,
        over3000: prices.filter(p => p >= 3000).length
      }
    };
  }

  private analyzeConcessionTrends(properties: ScrapedProperty[], marketAnalysis: any): any {
    // This would analyze historical concession data
    // For now, return mock trends based on market conditions
    const trends = [];

    if (marketAnalysis.competitiveness < 50) {
      trends.push({
        type: 'First Month Free',
        trend: 'increasing',
        change: '+15%',
        probability: 75
      });
    }

    if (marketAnalysis.marketVelocity === 'slow') {
      trends.push({
        type: 'Reduced Deposits',
        trend: 'increasing',
        change: '+22%',
        probability: 60
      });
    }

    return trends;
  }

  private generateMarketRecommendations(marketAnalysis: any, properties: ScrapedProperty[]): string[] {
    const recommendations = [];

    if (marketAnalysis.marketVelocity === 'hot') {
      recommendations.push('💡 Act quickly on properties you like - this is a fast-moving market');
      recommendations.push('📱 Set up instant notifications for new listings in your price range');
    } else if (marketAnalysis.marketVelocity === 'slow') {
      recommendations.push('⏰ Take your time to negotiate - landlords are motivated');
      recommendations.push('💰 Ask for concessions like waived fees or free months');
    }

    if (marketAnalysis.competitiveness < 40) {
      recommendations.push('🎯 Great time to negotiate - market favors renters');
      recommendations.push('📋 Consider touring multiple units at the same property for better deals');
    }

    const avgPricePerSqft = marketAnalysis.pricePerSqft;
    if (avgPricePerSqft > 2.5) {
      recommendations.push('🏙️ Premium market - focus on amenities and location value');
    } else if (avgPricePerSqft < 1.5) {
      recommendations.push('💵 Value market - opportunity for more space at lower cost');
    }

    const seasonalMonth = new Date().getMonth();
    if (seasonalMonth >= 10 || seasonalMonth <= 2) {
      recommendations.push('❄️ Winter rental season - expect better deals and concessions');
    } else if (seasonalMonth >= 3 && seasonalMonth <= 5) {
      recommendations.push('🌸 Spring rental season - competition increases, act fast');
    }

    return recommendations;
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