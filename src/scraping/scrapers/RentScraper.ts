/**
 * Rent.com scraper implementation
 */

import { BaseScraperImpl } from '../core/BaseScraper';
import { ScrapedProperty, ScrapingOptions } from '../core/types';
import { scrapingLogger } from '../utils/Logger';

const RENT_CONFIG = {
  baseUrl: "https://www.rent.com",
  searchUrl: "https://www.rent.com/{city}-{state}",
  rateLimit: 2.0, // requests per second
  selectors: {
    propertyCards: ".property-listing, .listing-item",
    propertyName: ".property-title, .listing-title",
    price: ".price, .rent-price",
    address: ".address, .property-address",
    bedrooms: ".beds, .bedroom-count",
    bathrooms: ".baths, .bathroom-count",
    sqft: ".sqft, .square-feet",
    amenities: ".amenities li, .features li",
    availability: ".availability, .available-date",
    images: ".property-photos img, .listing-photos img",
    phone: ".phone-number, .contact-phone",
    website: ".website-link, .property-website"
  },
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none"
  }
};

export class RentScraper extends BaseScraperImpl {
  constructor() {
    super('rent.com', RENT_CONFIG);
  }

  async scrapeProperty(url: string): Promise<ScrapedProperty | null> {
    try {
      scrapingLogger.startTimer(`scrape_property_${url}`);
      
      const response = await this.makeRequest(url);
      const html = await response.text();
      const doc = this.parseHtml(html);

      const property = this.extractPropertyFromDetailPage(doc, url);
      
      scrapingLogger.endTimer(`scrape_property_${url}`, {
        propertyFound: !!property,
        url
      });

      return property;
    } catch (error) {
      scrapingLogger.error('Failed to scrape Rent.com property detail', error as Error, { url });
      return null;
    }
  }

  protected async getTotalPages(searchUrl: string): Promise<number> {
    try {
      const response = await this.makeRequest(searchUrl);
      const html = await response.text();
      const doc = this.parseHtml(html);

      // Look for pagination info
      const paginationElement = doc.querySelector('.pagination .page-numbers:last-child, .pager .last');
      if (paginationElement) {
        const lastPageText = this.extractText(paginationElement);
        const pageNumber = parseInt(lastPageText, 10);
        if (!isNaN(pageNumber)) {
          return pageNumber;
        }
      }

      // Fallback: look for result count
      const resultCountElement = doc.querySelector('.results-count, .total-results');
      if (resultCountElement) {
        const resultText = this.extractText(resultCountElement);
        const match = resultText.match(/(\d+)\s*(?:total|results?)/i);
        if (match) {
          const totalResults = parseInt(match[1], 10);
          return Math.ceil(totalResults / 25); // Assuming 25 results per page
        }
      }

      return 1;
    } catch (error) {
      scrapingLogger.warn('Could not determine total pages for Rent.com', { error: (error as Error).message });
      return 1;
    }
  }

  protected async scrapePage(pageUrl: string): Promise<Partial<ScrapedProperty>[]> {
    try {
      scrapingLogger.debug('Scraping Rent.com page', { url: pageUrl });
      
      const response = await this.makeRequest(pageUrl);
      const html = await response.text();
      const doc = this.parseHtml(html);

      const propertyCards = doc.querySelectorAll(this.config.selectors.propertyCards);
      const properties: Partial<ScrapedProperty>[] = [];

      for (const card of Array.from(propertyCards)) {
        try {
          const property = this.extractPropertyFromCard(card, pageUrl);
          if (property) {
            properties.push(property);
          }
        } catch (error) {
          scrapingLogger.warn('Failed to extract Rent.com property from card', { 
            error: (error as Error).message,
            pageUrl 
          });
        }
      }

      scrapingLogger.debug('Rent.com page scraping completed', {
        url: pageUrl,
        propertiesFound: properties.length
      });

      return properties;
    } catch (error) {
      scrapingLogger.error('Failed to scrape Rent.com page', error as Error, { url: pageUrl });
      return [];
    }
  }

  private extractPropertyFromCard(card: Element, sourceUrl: string): Partial<ScrapedProperty> | null {
    try {
      // Extract basic info
      const nameElement = card.querySelector(this.config.selectors.propertyName);
      const name = this.extractText(nameElement);
      
      if (!name) {
        return null;
      }

      // Extract address
      const addressElement = card.querySelector(this.config.selectors.address);
      const fullAddress = this.extractText(addressElement);
      const { address, city, state, zipCode } = this.parseAddress(fullAddress);

      // Extract price
      const priceElement = card.querySelector(this.config.selectors.price);
      const priceText = this.extractText(priceElement);
      const currentPrice = this.extractPrice(priceText);

      // Extract bedrooms/bathrooms
      const bedroomsElement = card.querySelector(this.config.selectors.bedrooms);
      const bedroomsText = this.extractText(bedroomsElement);
      const bedrooms = this.extractBedroomCount(bedroomsText);

      const bathroomsElement = card.querySelector(this.config.selectors.bathrooms);
      const bathroomsText = this.extractText(bathroomsElement);
      const bathrooms = this.extractBathroomCount(bathroomsText);

      // Extract square footage
      const sqftElement = card.querySelector(this.config.selectors.sqft);
      const sqftText = this.extractText(sqftElement);
      const sqft = this.extractNumber(sqftText);

      // Extract availability
      const availabilityElement = card.querySelector(this.config.selectors.availability);
      const availability = this.extractText(availabilityElement) || 'Contact for availability';

      // Extract amenities
      const amenityElements = card.querySelectorAll(this.config.selectors.amenities);
      const amenities = Array.from(amenityElements).map(el => this.extractText(el)).filter(Boolean);

      // Extract images
      const imageElements = card.querySelectorAll(this.config.selectors.images);
      const images = Array.from(imageElements)
        .map(img => img.getAttribute('src') || img.getAttribute('data-src'))
        .filter(Boolean) as string[];

      // Get listing URL
      const linkElement = card.querySelector('a[href]');
      const relativeUrl = linkElement?.getAttribute('href') || '';
      const listingUrl = relativeUrl.startsWith('http') 
        ? relativeUrl 
        : `${this.config.baseUrl}${relativeUrl}`;

      const externalId = this.generateExternalId(listingUrl, name);

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
        availability,
        availabilityType: this.determineAvailabilityType(availability),
        features: [],
        amenities,
        images,
        listingUrl,
        scrapedAt: new Date(),
        lastUpdated: new Date(),
        isActive: true
      };

      return property;
    } catch (error) {
      scrapingLogger.warn('Error extracting Rent.com property from card', { 
        error: (error as Error).message 
      });
      return null;
    }
  }

  private extractPropertyFromDetailPage(doc: Document, url: string): ScrapedProperty | null {
    try {
      // Extract detailed information from property detail page
      const name = this.extractText(doc.querySelector('h1.property-title, .listing-title h1')) ||
                   this.extractText(doc.querySelector('h1'));

      if (!name) {
        return null;
      }

      // Address information
      const addressElement = doc.querySelector('.property-address, .listing-address');
      const fullAddress = this.extractText(addressElement);
      const { address, city, state, zipCode } = this.parseAddress(fullAddress);

      // Pricing
      const priceElement = doc.querySelector('.rent-price, .property-price');
      const priceText = this.extractText(priceElement);
      const currentPrice = this.extractPrice(priceText);

      // Property details
      const bedroomsElement = doc.querySelector('.bedroom-count, .beds-count');
      const bedrooms = this.extractBedroomCount(this.extractText(bedroomsElement));

      const bathroomsElement = doc.querySelector('.bathroom-count, .baths-count');
      const bathrooms = this.extractBathroomCount(this.extractText(bathroomsElement));

      const sqftElement = doc.querySelector('.square-feet, .sqft-count');
      const sqft = this.extractNumber(this.extractText(sqftElement));

      // Availability
      const availabilityElement = doc.querySelector('.availability-date, .available-date');
      const availability = this.extractText(availabilityElement) || 'Contact for availability';

      // Amenities and features
      const amenityElements = doc.querySelectorAll('.amenities-list li, .features-list li');
      const amenities = Array.from(amenityElements)
        .map(el => this.extractText(el))
        .filter(Boolean);

      // Images
      const imageElements = doc.querySelectorAll('.property-gallery img, .photo-gallery img');
      const images = Array.from(imageElements)
        .map(img => img.getAttribute('src') || img.getAttribute('data-src'))
        .filter(Boolean) as string[];

      // Contact information
      const phoneElement = doc.querySelector('.contact-phone, .phone-number');
      const phoneNumber = this.extractText(phoneElement);

      const externalId = this.generateExternalId(url, name);

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
        bedrooms: bedrooms || 0,
        bathrooms: bathrooms || 0,
        sqft,
        availability,
        availabilityType: this.determineAvailabilityType(availability),
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
      scrapingLogger.error('Error extracting Rent.com property from detail page', error as Error, { url });
      return null;
    }
  }

  private parseAddress(fullAddress: string): {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  } {
    const parts = fullAddress.split(',').map(part => part.trim());
    
    if (parts.length >= 3) {
      const address = parts[0];
      const city = parts[1];
      const stateZip = parts[2];
      
      const stateZipMatch = stateZip.match(/([A-Z]{2})\s*(\d{5})/);
      const state = stateZipMatch ? stateZipMatch[1] : '';
      const zipCode = stateZipMatch ? stateZipMatch[2] : '';
      
      return { address, city, state, zipCode };
    }
    
    return {
      address: fullAddress,
      city: '',
      state: '',
      zipCode: ''
    };
  }

  private extractBedroomCount(text: string): number {
    if (!text) return 0;
    
    const lowerText = text.toLowerCase();
    if (lowerText.includes('studio')) return 0;
    
    const match = text.match(/(\d+)\s*(?:bed|br|bedroom)/i);
    return match ? parseInt(match[1], 10) : 0;
  }

  private extractBathroomCount(text: string): number {
    if (!text) return 0;
    
    const match = text.match(/(\d+(?:\.\d+)?)\s*(?:bath|ba|bathroom)/i);
    return match ? parseFloat(match[1]) : 0;
  }

  private determineAvailabilityType(availability: string): ScrapedProperty['availabilityType'] {
    const lower = availability.toLowerCase();
    
    if (lower.includes('available now') || lower.includes('immediate')) {
      return 'immediate';
    }
    if (lower.includes('waitlist') || lower.includes('wait list')) {
      return 'waitlist';
    }
    if (lower.includes('soon') || lower.match(/\d+/)) {
      return 'soon';
    }
    
    return 'unknown';
  }

  private generateExternalId(url: string, name: string): string {
    const urlPart = url.split('/').pop() || '';
    const namePart = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
    return `rent_${urlPart}_${namePart}`;
  }

  protected buildSearchUrl(city: string, state: string, options: ScrapingOptions): string {
    let url = this.config.searchUrl
      .replace('{city}', city.toLowerCase().replace(/\s+/g, '-'))
      .replace('{state}', state.toLowerCase());

    const params = new URLSearchParams();
    
    if (options.minPrice) params.append('min_rent', options.minPrice.toString());
    if (options.maxPrice) params.append('max_rent', options.maxPrice.toString());
    if (options.bedrooms?.length) {
      params.append('bedrooms', options.bedrooms.join(','));
    }
    if (options.bathrooms?.length) {
      params.append('bathrooms', options.bathrooms.join(','));
    }
    if (options.petFriendly) params.append('pets', 'allowed');

    if (params.toString()) {
      url += (url.includes('?') ? '&' : '?') + params.toString();
    }

    return url;
  }

  protected buildPageUrl(baseUrl: string, page: number): string {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}page=${page}`;
  }
}