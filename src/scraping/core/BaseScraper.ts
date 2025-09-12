/**
 * Abstract base scraper class that provides common functionality
 * for all site-specific scrapers
 */

import { 
  BaseScraper, 
  ScrapedProperty, 
  ScrapingResult, 
  ScrapingOptions, 
  ValidationResult,
  ScrapingError,
  ScrapingMetadata,
  RateLimiter,
  ProxyManager
} from './types';
import { scrapingConfig, SiteConfig } from '../config/settings';
import { RateLimiterImpl } from '../utils/RateLimiter';
import { ProxyManagerImpl } from '../utils/ProxyManager';
import { DataValidator } from '../utils/DataValidator';
import { Logger } from '../utils/Logger';

export abstract class BaseScraperImpl implements BaseScraper {
  protected rateLimiter: RateLimiter;
  protected proxyManager: ProxyManager;
  protected dataValidator: DataValidator;
  protected logger: Logger;
  protected config: SiteConfig;

  constructor(
    public readonly source: string,
    config: SiteConfig
  ) {
    this.config = config;
    this.rateLimiter = new RateLimiterImpl(config.rateLimit);
    this.proxyManager = new ProxyManagerImpl();
    this.dataValidator = new DataValidator();
    this.logger = new Logger(`${source}Scraper`);
  }

  /**
   * Main method to scrape a city for properties
   */
  async scrapeCity(
    city: string, 
    state: string, 
    options: ScrapingOptions = {}
  ): Promise<ScrapingResult> {
    const startTime = new Date();
    const metadata: ScrapingMetadata = {
      source: this.source,
      city,
      state,
      totalPages: 0,
      currentPage: 0,
      propertiesFound: 0,
      propertiesProcessed: 0,
      startTime,
      endTime: new Date(),
      duration: 0
    };

    const result: ScrapingResult = {
      success: false,
      properties: [],
      errors: [],
      metadata
    };

    try {
      this.logger.info(`Starting scrape for ${city}, ${state}`);
      
      // Build search URL
      const searchUrl = this.buildSearchUrl(city, state, options);
      this.logger.debug(`Search URL: ${searchUrl}`);

      // Get total pages
      const totalPages = await this.getTotalPages(searchUrl);
      metadata.totalPages = totalPages;

      // Scrape each page
      for (let page = 1; page <= Math.min(totalPages, options.maxPages || 10); page++) {
        metadata.currentPage = page;
        
        try {
          // Rate limiting
          await this.rateLimiter.canProceed();
          
          const pageUrl = this.buildPageUrl(searchUrl, page);
          const pageProperties = await this.scrapePage(pageUrl);
          
          // Validate and clean properties
          for (const property of pageProperties) {
            const validationResult = this.validateData(property);
            if (validationResult.isValid) {
              const cleanProperty = this.dataValidator.cleanProperty(property);
              result.properties.push(cleanProperty);
              metadata.propertiesProcessed++;
            } else {
              this.logger.warn(`Invalid property data: ${validationResult.errors.map(e => e.message).join(', ')}`);
            }
          }
          
          metadata.propertiesFound += pageProperties.length;
          this.logger.info(`Scraped page ${page}/${totalPages}: ${pageProperties.length} properties`);
          
        } catch (error) {
          const scrapingError: ScrapingError = {
            type: this.classifyError(error),
            message: error instanceof Error ? error.message : 'Unknown error',
            url: this.buildPageUrl(searchUrl, page),
            timestamp: new Date(),
            retryable: this.isRetryableError(error)
          };
          result.errors.push(scrapingError);
          this.logger.error(`Error scraping page ${page}: ${scrapingError.message}`);
        }
      }

      result.success = result.properties.length > 0;
      this.logger.info(`Scraping completed: ${result.properties.length} properties found`);

    } catch (error) {
      const scrapingError: ScrapingError = {
        type: this.classifyError(error),
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        retryable: this.isRetryableError(error)
      };
      result.errors.push(scrapingError);
      this.logger.error(`Scraping failed: ${scrapingError.message}`);
    }

    // Update metadata
    const endTime = new Date();
    metadata.endTime = endTime;
    metadata.duration = endTime.getTime() - startTime.getTime();

    return result;
  }

  /**
   * Scrape a single property from its detail page
   */
  abstract scrapeProperty(url: string): Promise<ScrapedProperty | null>;

  /**
   * Validate property data
   */
  validateData(property: Partial<ScrapedProperty>): ValidationResult {
    return this.dataValidator.validateProperty(property);
  }

  /**
   * Build search URL for the given city and state
   */
  protected buildSearchUrl(city: string, state: string, options: ScrapingOptions): string {
    let url = this.config.searchUrl
      .replace('{city}', city.toLowerCase().replace(/\s+/g, '-'))
      .replace('{state}', state.toLowerCase());

    // Add query parameters for filtering
    const params = new URLSearchParams();
    
    if (options.minPrice) params.append('min_price', options.minPrice.toString());
    if (options.maxPrice) params.append('max_price', options.maxPrice.toString());
    if (options.bedrooms?.length) params.append('bedrooms', options.bedrooms.join(','));
    if (options.bathrooms?.length) params.append('bathrooms', options.bathrooms.join(','));
    if (options.petFriendly) params.append('pet_friendly', 'true');

    if (params.toString()) {
      url += (url.includes('?') ? '&' : '?') + params.toString();
    }

    return url;
  }

  /**
   * Build URL for a specific page
   */
  protected buildPageUrl(baseUrl: string, page: number): string {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}page=${page}`;
  }

  /**
   * Get total number of pages for the search
   */
  protected abstract getTotalPages(searchUrl: string): Promise<number>;

  /**
   * Scrape properties from a single page
   */
  protected abstract scrapePage(pageUrl: string): Promise<Partial<ScrapedProperty>[]>;

  /**
   * Make HTTP request with retry logic and proxy support
   */
  protected async makeRequest(
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= scrapingConfig.maxRetries; attempt++) {
      try {
        // Apply rate limiting
        await this.rateLimiter.canProceed();
        
        // Get proxy if enabled
        const proxy = scrapingConfig.useProxies ? this.proxyManager.getNextProxy() : null;
        
        // Prepare request options
        const requestOptions: RequestInit = {
          ...options,
          headers: {
            ...this.config.headers,
            ...options.headers
          },
          timeout: scrapingConfig.requestTimeout
        };

        // Add proxy to request if available
        if (proxy) {
          // Note: In a real implementation, you'd configure the proxy here
          // This depends on your HTTP client library
        }

        const response = await fetch(url, requestOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        this.rateLimiter.recordRequest();
        return response;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        this.logger.warn(`Request attempt ${attempt} failed: ${lastError.message}`);
        
        if (attempt < scrapingConfig.maxRetries) {
          const delay = scrapingConfig.retryDelay * Math.pow(scrapingConfig.backoffFactor, attempt - 1);
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Parse HTML content using a simple DOM parser
   */
  protected parseHtml(html: string): Document {
    // In a real implementation, you'd use a proper HTML parser like jsdom
    // For now, we'll use the browser's DOMParser
    if (typeof DOMParser !== 'undefined') {
      return new DOMParser().parseFromString(html, 'text/html');
    }
    throw new Error('HTML parsing not available in this environment');
  }

  /**
   * Extract text content from element
   */
  protected extractText(element: Element | null): string {
    return element?.textContent?.trim() || '';
  }

  /**
   * Extract numeric value from text
   */
  protected extractNumber(text: string): number | null {
    const match = text.match(/[\d,]+/);
    if (match) {
      return parseInt(match[0].replace(/,/g, ''), 10);
    }
    return null;
  }

  /**
   * Extract price from text
   */
  protected extractPrice(text: string): number | null {
    const match = text.match(/\$?([\d,]+)/);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''), 10);
    }
    return null;
  }

  /**
   * Classify error type
   */
  protected classifyError(error: any): ScrapingError['type'] {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return 'network';
    }
    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      return 'rate_limit';
    }
    if (error.message?.includes('blocked') || error.message?.includes('403')) {
      return 'blocked';
    }
    if (error.message?.includes('parse') || error.message?.includes('selector')) {
      return 'parsing';
    }
    return 'validation';
  }

  /**
   * Check if error is retryable
   */
  protected isRetryableError(error: any): boolean {
    const errorType = this.classifyError(error);
    return ['network', 'rate_limit'].includes(errorType);
  }

  /**
   * Sleep for specified milliseconds
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate random delay to avoid detection
   */
  protected async randomDelay(min: number = 1000, max: number = 3000): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    await this.sleep(delay);
  }
}