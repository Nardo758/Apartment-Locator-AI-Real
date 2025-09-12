/**
 * Apartments.com scraper implementation
 */

import { BaseScraperImpl } from '../core/BaseScraper';
import { ScrapedProperty, ScrapingOptions } from '../core/types';
import { siteConfigs } from '../config/settings';
import { scrapingLogger } from '../utils/Logger';

export class ApartmentsScraper extends BaseScraperImpl {
  constructor() {
    super('apartments.com', siteConfigs.APARTMENTS_COM);
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
      scrapingLogger.error('Failed to scrape property detail', error as Error, { url });
      return null;
    }
  }

  protected async getTotalPages(searchUrl: string): Promise<number> {
    try {
      const response = await this.makeRequest(searchUrl);
      const html = await response.text();
      const doc = this.parseHtml(html);

      // Look for pagination info
      const paginationText = doc.querySelector('.pageRange')?.textContent || '';
      const match = paginationText.match(/of (\d+)/);
      
      if (match) {
        return parseInt(match[1], 10);
      }

      // Fallback: count pagination links
      const pageLinks = doc.querySelectorAll('.paging a[data-page]');
      if (pageLinks.length > 0) {
        const lastPageLink = pageLinks[pageLinks.length - 1];
        const lastPage = lastPageLink.getAttribute('data-page');
        return lastPage ? parseInt(lastPage, 10) : 1;
      }

      return 1;
    } catch (error) {
      scrapingLogger.warn('Could not determine total pages, defaulting to 1', { error: (error as Error).message });
      return 1;
    }
  }

  protected async scrapePage(pageUrl: string): Promise<Partial<ScrapedProperty>[]> {
    try {
      scrapingLogger.debug('Scraping page', { url: pageUrl });
      
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
          scrapingLogger.warn('Failed to extract property from card', { 
            error: (error as Error).message,
            pageUrl 
          });
        }
      }

      scrapingLogger.debug('Page scraping completed', {
        url: pageUrl,
        propertiesFound: properties.length
      });

      return properties;
    } catch (error) {
      scrapingLogger.error('Failed to scrape page', error as Error, { url: pageUrl });
      return [];
    }
  }

  private extractPropertyFromCard(card: Element, sourceUrl: string): Partial<ScrapedProperty> | null {
    try {
      // Extract basic info
      const nameElement = card.querySelector(this.config.selectors.propertyName);
      const name = this.extractText(nameElement);
      
      if (!name) {
        return null; // Skip if no name found
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
      const imageElements = card.querySelectorAll('img[src]');
      const images = Array.from(imageElements)
        .map(img => img.getAttribute('src'))
        .filter(Boolean) as string[];

      // Get listing URL
      const linkElement = card.querySelector('a[href]');
      const relativeUrl = linkElement?.getAttribute('href') || '';
      const listingUrl = relativeUrl.startsWith('http') 
        ? relativeUrl 
        : `${this.config.baseUrl}${relativeUrl}`;

      // Generate external ID
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
      scrapingLogger.warn('Error extracting property from card', { 
        error: (error as Error).message 
      });
      return null;
    }
  }

  private extractPropertyFromDetailPage(doc: Document, url: string): ScrapedProperty | null {
    try {
      // Extract detailed information from property detail page
      const name = this.extractText(doc.querySelector('h1[data-testid="property-title"]')) ||
                   this.extractText(doc.querySelector('.propertyName')) ||
                   this.extractText(doc.querySelector('h1'));

      if (!name) {
        return null;
      }

      // Address information
      const addressElement = doc.querySelector('[data-testid="property-address"]') ||
                            doc.querySelector('.propertyAddress');
      const fullAddress = this.extractText(addressElement);
      const { address, city, state, zipCode } = this.parseAddress(fullAddress);

      // Pricing
      const priceElement = doc.querySelector('[data-testid="rent-range"]') ||
                          doc.querySelector('.rentRange') ||
                          doc.querySelector('.pricingColumn .rentInfoDetail');
      const priceText = this.extractText(priceElement);
      const currentPrice = this.extractPrice(priceText);

      // Property details
      const bedroomsElement = doc.querySelector('[data-testid="bed-range"]') ||
                             doc.querySelector('.bedroomRange');
      const bedrooms = this.extractBedroomCount(this.extractText(bedroomsElement));

      const bathroomsElement = doc.querySelector('[data-testid="bath-range"]') ||
                              doc.querySelector('.bathroomRange');
      const bathrooms = this.extractBathroomCount(this.extractText(bathroomsElement));

      const sqftElement = doc.querySelector('[data-testid="sqft-range"]') ||
                         doc.querySelector('.sqftRange');
      const sqft = this.extractNumber(this.extractText(sqftElement));

      // Availability
      const availabilityElement = doc.querySelector('[data-testid="availability"]') ||
                                 doc.querySelector('.availabilityInfo');
      const availability = this.extractText(availabilityElement) || 'Contact for availability';

      // Amenities and features
      const amenityElements = doc.querySelectorAll('.amenityList li, .featureList li, [data-testid="amenity-item"]');
      const amenities = Array.from(amenityElements)
        .map(el => this.extractText(el))
        .filter(Boolean);

      // Images
      const imageElements = doc.querySelectorAll('.gallery img, .photos img, [data-testid="photo"] img');
      const images = Array.from(imageElements)
        .map(img => img.getAttribute('src') || img.getAttribute('data-src'))
        .filter(Boolean) as string[];

      // Contact information
      const phoneElement = doc.querySelector('[data-testid="phone-number"]') ||
                          doc.querySelector('.phone-link');
      const phoneNumber = this.extractText(phoneElement);

      // Website
      const websiteElement = doc.querySelector('[data-testid="website-link"]') ||
                            doc.querySelector('.website-link');
      const websiteUrl = websiteElement?.getAttribute('href') || undefined;

      // Pet policy
      const petPolicyElement = doc.querySelector('[data-testid="pet-policy"]') ||
                              doc.querySelector('.petPolicy');
      const petPolicy = this.extractText(petPolicyElement);

      // Parking
      const parkingElement = doc.querySelector('[data-testid="parking-info"]') ||
                            doc.querySelector('.parkingInfo');
      const parking = this.extractText(parkingElement);

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
        websiteUrl,
        petPolicy,
        parking,
        scrapedAt: new Date(),
        lastUpdated: new Date(),
        isActive: true
      };

      return property;
    } catch (error) {
      scrapingLogger.error('Error extracting property from detail page', error as Error, { url });
      return null;
    }
  }

  private parseAddress(fullAddress: string): {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  } {
    // Parse address like "123 Main St, Austin, TX 78701"
    const parts = fullAddress.split(',').map(part => part.trim());
    
    if (parts.length >= 3) {
      const address = parts[0];
      const city = parts[1];
      const stateZip = parts[2];
      
      // Extract state and zip from "TX 78701"
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
    // Create a unique ID based on URL and name
    const urlPart = url.split('/').pop() || '';
    const namePart = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
    return `apt_${urlPart}_${namePart}`;
  }

  protected buildSearchUrl(city: string, state: string, options: ScrapingOptions): string {
    let url = this.config.searchUrl
      .replace('{city}', city.toLowerCase().replace(/\s+/g, '-'))
      .replace('{state}', state.toLowerCase());

    const params = new URLSearchParams();
    
    // Add filters based on options
    if (options.minPrice) params.append('min_rent', options.minPrice.toString());
    if (options.maxPrice) params.append('max_rent', options.maxPrice.toString());
    if (options.bedrooms?.length) {
      options.bedrooms.forEach(bed => params.append('bedrooms[]', bed.toString()));
    }
    if (options.bathrooms?.length) {
      options.bathrooms.forEach(bath => params.append('bathrooms[]', bath.toString()));
    }
    if (options.petFriendly) params.append('pet_friendly', 'true');

    if (params.toString()) {
      url += (url.includes('?') ? '&' : '?') + params.toString();
    }

    return url;
  }

  protected buildPageUrl(baseUrl: string, page: number): string {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}page=${page}`;
  }

  // Override rate limiting for Apartments.com specific requirements
  protected async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // Add random delay to appear more human-like
    await this.randomDelay(500, 2000);
    
    // Add Apartments.com specific headers
    const apartmentsHeaders = {
      'Referer': 'https://www.apartments.com/',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Cache-Control': 'no-cache',
      ...options.headers
    };

    return super.makeRequest(url, {
      ...options,
      headers: apartmentsHeaders
    });
  }
}