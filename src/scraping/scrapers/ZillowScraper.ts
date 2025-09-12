/**
 * Zillow scraper implementation with anti-detection measures
 */

import { BaseScraperImpl } from '../core/BaseScraper';
import { ScrapedProperty, ScrapingOptions } from '../core/types';
import { siteConfigs } from '../config/settings';
import { scrapingLogger } from '../utils/Logger';

export class ZillowScraper extends BaseScraperImpl {
  private sessionCookies: string = '';
  private userAgentRotation: string[] = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
  ];

  constructor() {
    super('zillow.com', siteConfigs.ZILLOW);
  }

  async scrapeProperty(url: string): Promise<ScrapedProperty | null> {
    try {
      scrapingLogger.startTimer(`scrape_property_${url}`);
      
      // Zillow often requires session establishment
      await this.establishSession();
      
      const response = await this.makeRequest(url);
      const html = await response.text();
      
      // Check for bot detection
      if (this.detectBotBlocking(html)) {
        scrapingLogger.warn('Bot detection triggered', { url });
        await this.handleBotDetection();
        return null;
      }

      const doc = this.parseHtml(html);
      const property = this.extractPropertyFromDetailPage(doc, url);
      
      scrapingLogger.endTimer(`scrape_property_${url}`, {
        propertyFound: !!property,
        url
      });

      return property;
    } catch (error) {
      scrapingLogger.error('Failed to scrape Zillow property', error as Error, { url });
      return null;
    }
  }

  protected async getTotalPages(searchUrl: string): Promise<number> {
    try {
      const response = await this.makeRequest(searchUrl);
      const html = await response.text();
      
      if (this.detectBotBlocking(html)) {
        scrapingLogger.warn('Bot detection on search page');
        return 1;
      }

      const doc = this.parseHtml(html);

      // Zillow uses different pagination structures
      const resultCountElement = doc.querySelector('[data-testid="result-count"]') ||
                                doc.querySelector('.search-page-react-content .result-count');
      
      if (resultCountElement) {
        const resultText = this.extractText(resultCountElement);
        const match = resultText.match(/(\d+)\s*results?/i);
        if (match) {
          const totalResults = parseInt(match[1], 10);
          // Zillow typically shows ~40 results per page
          return Math.ceil(totalResults / 40);
        }
      }

      // Fallback: look for pagination
      const paginationElements = doc.querySelectorAll('[aria-label="Pagination"] a, .zsg-pagination a');
      if (paginationElements.length > 0) {
        const lastPageElement = paginationElements[paginationElements.length - 1];
        const lastPageText = this.extractText(lastPageElement);
        const pageNumber = parseInt(lastPageText, 10);
        if (!isNaN(pageNumber)) {
          return pageNumber;
        }
      }

      return 1;
    } catch (error) {
      scrapingLogger.warn('Could not determine total pages for Zillow', { error: (error as Error).message });
      return 1;
    }
  }

  protected async scrapePage(pageUrl: string): Promise<Partial<ScrapedProperty>[]> {
    try {
      scrapingLogger.debug('Scraping Zillow page', { url: pageUrl });
      
      const response = await this.makeRequest(pageUrl);
      const html = await response.text();
      
      if (this.detectBotBlocking(html)) {
        scrapingLogger.warn('Bot detection triggered on page', { url: pageUrl });
        await this.handleBotDetection();
        return [];
      }

      const doc = this.parseHtml(html);

      // Zillow often loads content dynamically, so we look for multiple selectors
      const propertyCards = doc.querySelectorAll(
        this.config.selectors.propertyCards + ', .list-card, .ListItem-c11n-8-84-3__sc-10e22w8-0'
      );
      
      const properties: Partial<ScrapedProperty>[] = [];

      for (const card of Array.from(propertyCards)) {
        try {
          const property = this.extractPropertyFromCard(card, pageUrl);
          if (property) {
            properties.push(property);
          }
        } catch (error) {
          scrapingLogger.warn('Failed to extract Zillow property from card', { 
            error: (error as Error).message,
            pageUrl 
          });
        }
      }

      scrapingLogger.debug('Zillow page scraping completed', {
        url: pageUrl,
        propertiesFound: properties.length
      });

      return properties;
    } catch (error) {
      scrapingLogger.error('Failed to scrape Zillow page', error as Error, { url: pageUrl });
      return [];
    }
  }

  private async establishSession(): Promise<void> {
    try {
      // Make an initial request to establish session
      const response = await this.makeRequest(this.config.baseUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      // Extract cookies from response
      const setCookieHeaders = response.headers.get('set-cookie');
      if (setCookieHeaders) {
        this.sessionCookies = setCookieHeaders;
      }

      scrapingLogger.debug('Zillow session established');
    } catch (error) {
      scrapingLogger.warn('Failed to establish Zillow session', { error: (error as Error).message });
    }
  }

  private detectBotBlocking(html: string): boolean {
    const botIndicators = [
      'captcha',
      'blocked',
      'security check',
      'unusual traffic',
      'robot',
      'automation'
    ];

    const lowerHtml = html.toLowerCase();
    return botIndicators.some(indicator => lowerHtml.includes(indicator));
  }

  private async handleBotDetection(): Promise<void> {
    scrapingLogger.warn('Bot detection triggered, implementing countermeasures');
    
    // Increase delay
    await this.sleep(10000 + Math.random() * 10000); // 10-20 seconds
    
    // Clear session
    this.sessionCookies = '';
    
    // This could trigger proxy rotation if available
    if (this.proxyManager.getHealthyProxyCount() > 0) {
      scrapingLogger.info('Rotating proxy due to bot detection');
    }
  }

  private extractPropertyFromCard(card: Element, sourceUrl: string): Partial<ScrapedProperty> | null {
    try {
      // Zillow has multiple card formats, so we try different selectors
      const nameElement = card.querySelector(this.config.selectors.propertyName) ||
                         card.querySelector('[data-test="property-card-addr"]') ||
                         card.querySelector('.list-card-addr');
      
      const name = this.extractText(nameElement);
      if (!name) {
        return null;
      }

      // Extract price
      const priceElement = card.querySelector(this.config.selectors.price) ||
                          card.querySelector('[data-test="property-card-price"]') ||
                          card.querySelector('.list-card-price');
      const priceText = this.extractText(priceElement);
      const currentPrice = this.extractPrice(priceText);

      // Extract address (Zillow often combines name and address)
      const { address, city, state, zipCode } = this.parseZillowAddress(name);

      // Extract property details
      const detailsElement = card.querySelector('[data-test="property-card-details"]') ||
                            card.querySelector('.list-card-details');
      const detailsText = this.extractText(detailsElement);
      const { bedrooms, bathrooms, sqft } = this.parseZillowDetails(detailsText);

      // Extract images
      const imageElements = card.querySelectorAll('img[src]');
      const images = Array.from(imageElements)
        .map(img => img.getAttribute('src'))
        .filter(Boolean)
        .filter(src => src!.includes('photos')) as string[];

      // Get listing URL
      const linkElement = card.querySelector('a[href]');
      const relativeUrl = linkElement?.getAttribute('href') || '';
      const listingUrl = relativeUrl.startsWith('http') 
        ? relativeUrl 
        : `${this.config.baseUrl}${relativeUrl}`;

      const externalId = this.generateZillowId(listingUrl, name);

      const property: Partial<ScrapedProperty> = {
        externalId,
        source: this.source,
        name,
        address,
        city,
        state,
        zipCode,
        currentPrice: currentPrice || 0,
        originalPrice: currentPrice || 0,
        bedrooms: bedrooms || 0,
        bathrooms: bathrooms || 0,
        sqft,
        availability: 'Contact for availability',
        availabilityType: 'unknown',
        features: [],
        amenities: [],
        images,
        listingUrl,
        scrapedAt: new Date(),
        lastUpdated: new Date(),
        isActive: true
      };

      return property;
    } catch (error) {
      scrapingLogger.warn('Error extracting Zillow property from card', { 
        error: (error as Error).message 
      });
      return null;
    }
  }

  private extractPropertyFromDetailPage(doc: Document, url: string): ScrapedProperty | null {
    try {
      // Zillow detail pages have complex structure
      const nameElement = doc.querySelector('h1[data-testid="bdp-building-name"]') ||
                         doc.querySelector('.ds-address-container h1') ||
                         doc.querySelector('h1');
      
      const name = this.extractText(nameElement);
      if (!name) {
        return null;
      }

      // Address
      const { address, city, state, zipCode } = this.parseZillowAddress(name);

      // Price
      const priceElement = doc.querySelector('[data-testid="price"]') ||
                          doc.querySelector('.ds-price .ds-value') ||
                          doc.querySelector('.price');
      const currentPrice = this.extractPrice(this.extractText(priceElement));

      // Property facts
      const factsContainer = doc.querySelector('[data-testid="bdp-facts-container"]') ||
                           doc.querySelector('.ds-home-fact-list');
      
      let bedrooms = 0, bathrooms = 0, sqft: number | undefined;
      
      if (factsContainer) {
        const facts = factsContainer.querySelectorAll('.ds-home-fact, [data-testid="bdp-fact"]');
        for (const fact of Array.from(facts)) {
          const factText = this.extractText(fact).toLowerCase();
          if (factText.includes('bed')) {
            bedrooms = this.extractNumber(factText) || 0;
          } else if (factText.includes('bath')) {
            bathrooms = this.extractNumber(factText) || 0;
          } else if (factText.includes('sqft') || factText.includes('sq ft')) {
            sqft = this.extractNumber(factText) || undefined;
          }
        }
      }

      // Amenities
      const amenityElements = doc.querySelectorAll('.ds-amenity-group li, [data-testid="amenity-item"]');
      const amenities = Array.from(amenityElements)
        .map(el => this.extractText(el))
        .filter(Boolean);

      // Images
      const imageElements = doc.querySelectorAll('.media-stream img, [data-testid="photo"] img');
      const images = Array.from(imageElements)
        .map(img => img.getAttribute('src') || img.getAttribute('data-src'))
        .filter(Boolean) as string[];

      // Contact info
      const phoneElement = doc.querySelector('[data-testid="phone-number"]');
      const phoneNumber = this.extractText(phoneElement);

      const externalId = this.generateZillowId(url, name);

      const property: ScrapedProperty = {
        externalId,
        source: this.source,
        name,
        address,
        city,
        state,
        zipCode,
        currentPrice: currentPrice || 0,
        originalPrice: currentPrice || 0,
        bedrooms,
        bathrooms,
        sqft,
        availability: 'Contact for availability',
        availabilityType: 'unknown',
        features: [],
        amenities,
        images,
        listingUrl: url,
        phoneNumber,
        scrapedAt: new Date(),
        lastUpdated: new Date(),
        isActive: true
      };

      return property;
    } catch (error) {
      scrapingLogger.error('Error extracting Zillow property from detail page', error as Error, { url });
      return null;
    }
  }

  private parseZillowAddress(addressText: string): {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  } {
    // Zillow addresses can be in various formats
    const parts = addressText.split(',').map(part => part.trim());
    
    if (parts.length >= 2) {
      const address = parts[0];
      const lastPart = parts[parts.length - 1];
      
      // Look for state and zip in last part
      const stateZipMatch = lastPart.match(/([A-Z]{2})\s*(\d{5})/);
      if (stateZipMatch) {
        const state = stateZipMatch[1];
        const zipCode = stateZipMatch[2];
        const city = parts.length > 2 ? parts[parts.length - 2] : '';
        
        return { address, city, state, zipCode };
      }
    }
    
    return {
      address: addressText,
      city: '',
      state: '',
      zipCode: ''
    };
  }

  private parseZillowDetails(detailsText: string): {
    bedrooms: number;
    bathrooms: number;
    sqft: number | undefined;
  } {
    let bedrooms = 0, bathrooms = 0, sqft: number | undefined;
    
    // Look for patterns like "2 bds, 1 ba, 800 sqft"
    const bedroomMatch = detailsText.match(/(\d+)\s*bds?/i);
    if (bedroomMatch) {
      bedrooms = parseInt(bedroomMatch[1], 10);
    }
    
    const bathroomMatch = detailsText.match(/(\d+(?:\.\d+)?)\s*ba/i);
    if (bathroomMatch) {
      bathrooms = parseFloat(bathroomMatch[1]);
    }
    
    const sqftMatch = detailsText.match(/([\d,]+)\s*sqft/i);
    if (sqftMatch) {
      sqft = parseInt(sqftMatch[1].replace(/,/g, ''), 10);
    }
    
    return { bedrooms, bathrooms, sqft };
  }

  private generateZillowId(url: string, name: string): string {
    // Extract Zillow property ID from URL if available
    const zillowIdMatch = url.match(/\/(\d+)_zpid/);
    if (zillowIdMatch) {
      return `zillow_${zillowIdMatch[1]}`;
    }
    
    // Fallback to name-based ID
    const namePart = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
    return `zillow_${namePart}_${Date.now()}`;
  }

  protected buildSearchUrl(city: string, state: string, options: ScrapingOptions): string {
    let url = this.config.searchUrl
      .replace('{city}', city.toLowerCase().replace(/\s+/g, '-'))
      .replace('{state}', state.toLowerCase());

    const params = new URLSearchParams();
    
    // Zillow-specific parameters
    params.append('searchQueryState', JSON.stringify({
      pagination: {},
      usersSearchTerm: `${city}, ${state}`,
      mapBounds: {},
      regionSelection: [{ regionId: 0, regionType: 6 }],
      isMapVisible: false,
      filterState: {
        isForRent: { value: true },
        ...(options.minPrice && { price: { min: options.minPrice } }),
        ...(options.maxPrice && { price: { max: options.maxPrice } }),
        ...(options.bedrooms?.length && { beds: { min: Math.min(...options.bedrooms) } }),
        ...(options.bathrooms?.length && { baths: { min: Math.min(...options.bathrooms) } }),
        ...(options.petFriendly && { petPolicy: { value: 'cats,dogs' } })
      },
      isListVisible: true
    }));

    return `${url}?${params.toString()}`;
  }

  protected buildPageUrl(baseUrl: string, page: number): string {
    // Zillow uses different pagination
    const url = new URL(baseUrl);
    const searchState = JSON.parse(url.searchParams.get('searchQueryState') || '{}');
    searchState.pagination = { currentPage: page };
    url.searchParams.set('searchQueryState', JSON.stringify(searchState));
    return url.toString();
  }

  // Override with Zillow-specific anti-detection measures
  protected async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // Rotate user agent
    const userAgent = this.userAgentRotation[Math.floor(Math.random() * this.userAgentRotation.length)];
    
    // Add Zillow-specific headers
    const zillowHeaders = {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0',
      ...(this.sessionCookies && { 'Cookie': this.sessionCookies }),
      ...options.headers
    };

    // Add random delay (longer for Zillow due to stricter detection)
    await this.randomDelay(2000, 5000);

    return super.makeRequest(url, {
      ...options,
      headers: zillowHeaders
    });
  }
}