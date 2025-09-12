/**
 * Craigslist scraper implementation
 * Note: Craigslist has strict anti-bot measures, use with caution
 */

import { BaseScraperImpl } from '../core/BaseScraper';
import { ScrapedProperty, ScrapingOptions } from '../core/types';
import { scrapingLogger } from '../utils/Logger';

const CRAIGSLIST_CONFIG = {
  baseUrl: "https://craigslist.org",
  searchUrl: "https://{city}.craigslist.org/search/apa",
  rateLimit: 0.5, // Very conservative rate limit for Craigslist
  selectors: {
    propertyCards: ".result-row",
    propertyName: ".result-title",
    price: ".result-price",
    address: ".result-hood",
    bedrooms: ".housing",
    bathrooms: ".housing",
    sqft: ".housing",
    images: ".result-image img",
    postDate: ".result-date"
  },
  headers: {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1"
  }
};

export class CraigslistScraper extends BaseScraperImpl {
  private citySubdomains: Map<string, string> = new Map([
    ['austin', 'austin'],
    ['dallas', 'dallas'],
    ['houston', 'houston'],
    ['san-antonio', 'sanantonio'],
    ['atlanta', 'atlanta'],
    ['miami', 'miami'],
    ['denver', 'denver'],
    ['seattle', 'seattle'],
    ['phoenix', 'phoenix'],
    ['los-angeles', 'losangeles']
  ]);

  constructor() {
    super('craigslist.org', CRAIGSLIST_CONFIG);
  }

  async scrapeProperty(url: string): Promise<ScrapedProperty | null> {
    try {
      scrapingLogger.startTimer(`scrape_property_${url}`);
      
      // Add extra delay for Craigslist
      await this.sleep(3000 + Math.random() * 2000);
      
      const response = await this.makeRequest(url);
      const html = await response.text();
      
      // Check for blocked content
      if (html.includes('blocked') || html.includes('This IP has been automatically blocked')) {
        scrapingLogger.warn('IP blocked by Craigslist', { url });
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
      scrapingLogger.error('Failed to scrape Craigslist property detail', error as Error, { url });
      return null;
    }
  }

  protected async getTotalPages(searchUrl: string): Promise<number> {
    try {
      const response = await this.makeRequest(searchUrl);
      const html = await response.text();
      
      if (html.includes('blocked')) {
        scrapingLogger.warn('Blocked by Craigslist during page count');
        return 1;
      }

      const doc = this.parseHtml(html);

      // Look for pagination
      const paginationElement = doc.querySelector('.paginator .next');
      if (paginationElement) {
        // Craigslist uses offset-based pagination
        const totalCountElement = doc.querySelector('.totalcount');
        if (totalCountElement) {
          const totalText = this.extractText(totalCountElement);
          const totalCount = parseInt(totalText, 10);
          if (!isNaN(totalCount)) {
            return Math.ceil(totalCount / 120); // 120 results per page
          }
        }
      }

      return 1;
    } catch (error) {
      scrapingLogger.warn('Could not determine total pages for Craigslist', { error: (error as Error).message });
      return 1;
    }
  }

  protected async scrapePage(pageUrl: string): Promise<Partial<ScrapedProperty>[]> {
    try {
      scrapingLogger.debug('Scraping Craigslist page', { url: pageUrl });
      
      // Extra delay for Craigslist
      await this.sleep(5000 + Math.random() * 3000);
      
      const response = await this.makeRequest(pageUrl);
      const html = await response.text();
      
      if (html.includes('blocked') || html.includes('This IP has been automatically blocked')) {
        scrapingLogger.warn('IP blocked by Craigslist', { url: pageUrl });
        return [];
      }

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
          scrapingLogger.warn('Failed to extract Craigslist property from card', { 
            error: (error as Error).message,
            pageUrl 
          });
        }
      }

      scrapingLogger.debug('Craigslist page scraping completed', {
        url: pageUrl,
        propertiesFound: properties.length
      });

      return properties;
    } catch (error) {
      scrapingLogger.error('Failed to scrape Craigslist page', error as Error, { url: pageUrl });
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

      // Extract price
      const priceElement = card.querySelector(this.config.selectors.price);
      const priceText = this.extractText(priceElement);
      const currentPrice = this.extractPrice(priceText);

      // Extract location (Craigslist shows neighborhood)
      const hoodElement = card.querySelector(this.config.selectors.address);
      const hood = this.extractText(hoodElement);
      
      // Extract city from URL
      const urlMatch = sourceUrl.match(/https:\/\/([^.]+)\.craigslist/);
      const citySubdomain = urlMatch ? urlMatch[1] : '';
      const city = this.getFullCityName(citySubdomain);

      // Extract housing info (bedrooms/bathrooms/sqft)
      const housingElement = card.querySelector(this.config.selectors.bedrooms);
      const housingText = this.extractText(housingElement);
      const { bedrooms, bathrooms, sqft } = this.parseHousingInfo(housingText);

      // Extract post date
      const dateElement = card.querySelector(this.config.selectors.postDate);
      const postDate = this.extractText(dateElement);

      // Get listing URL
      const linkElement = card.querySelector('a[href]');
      const relativeUrl = linkElement?.getAttribute('href') || '';
      const listingUrl = relativeUrl.startsWith('http') 
        ? relativeUrl 
        : `https://${citySubdomain}.craigslist.org${relativeUrl}`;

      // Extract images
      const imageElements = card.querySelectorAll(this.config.selectors.images);
      const images = Array.from(imageElements)
        .map(img => img.getAttribute('src'))
        .filter(Boolean) as string[];

      const externalId = this.generateExternalId(listingUrl, name);

      const property: Partial<ScrapedProperty> = {
        externalId,
        source: this.source,
        name,
        address: hood || 'Location not specified',
        city,
        state: this.getStateFromCity(city),
        zipCode: '',
        currentPrice: currentPrice || 0,
        originalPrice: currentPrice || 0,
        bedrooms: bedrooms || 0,
        bathrooms: bathrooms || 0,
        sqft,
        availability: `Posted ${postDate}`,
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
      scrapingLogger.warn('Error extracting Craigslist property from card', { 
        error: (error as Error).message 
      });
      return null;
    }
  }

  private extractPropertyFromDetailPage(doc: Document, url: string): ScrapedProperty | null {
    try {
      // Extract title
      const name = this.extractText(doc.querySelector('#titletextonly, .postingtitletext #titletextonly'));

      if (!name) {
        return null;
      }

      // Extract price
      const priceElement = doc.querySelector('.price, .postingtitletext .price');
      const currentPrice = this.extractPrice(this.extractText(priceElement));

      // Extract housing attributes
      const attributesElement = doc.querySelector('.attrgroup');
      let bedrooms = 0, bathrooms = 0, sqft: number | undefined;
      
      if (attributesElement) {
        const attributeText = this.extractText(attributesElement);
        const housingInfo = this.parseHousingInfo(attributeText);
        bedrooms = housingInfo.bedrooms;
        bathrooms = housingInfo.bathrooms;
        sqft = housingInfo.sqft;
      }

      // Extract location
      const mapElement = doc.querySelector('#map');
      let city = '', state = '';
      if (mapElement) {
        const dataCity = mapElement.getAttribute('data-city');
        const dataState = mapElement.getAttribute('data-state');
        if (dataCity) city = dataCity;
        if (dataState) state = dataState;
      }

      // Fallback: extract from URL
      if (!city) {
        const urlMatch = url.match(/https:\/\/([^.]+)\.craigslist/);
        const citySubdomain = urlMatch ? urlMatch[1] : '';
        city = this.getFullCityName(citySubdomain);
        state = this.getStateFromCity(city);
      }

      // Extract body text for features/amenities
      const bodyElement = doc.querySelector('#postingbody, .postingbody');
      const bodyText = this.extractText(bodyElement);
      const amenities = this.extractAmenitiesFromText(bodyText);

      // Extract images
      const imageElements = doc.querySelectorAll('#thumbs img, .gallery img');
      const images = Array.from(imageElements)
        .map(img => img.getAttribute('src'))
        .filter(Boolean) as string[];

      // Extract contact info
      const phoneElement = doc.querySelector('.reply-tel-number');
      const phoneNumber = this.extractText(phoneElement);

      const externalId = this.generateExternalId(url, name);

      const property: ScrapedProperty = {
        externalId,
        source: this.source,
        name,
        address: 'See listing for address',
        city,
        state,
        zipCode: '',
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
      scrapingLogger.error('Error extracting Craigslist property from detail page', error as Error, { url });
      return null;
    }
  }

  private parseHousingInfo(text: string): {
    bedrooms: number;
    bathrooms: number;
    sqft: number | undefined;
  } {
    let bedrooms = 0, bathrooms = 0, sqft: number | undefined;

    // Look for bedroom count
    const bedroomMatch = text.match(/(\d+)BR|(\d+)\s*bed/i);
    if (bedroomMatch) {
      bedrooms = parseInt(bedroomMatch[1] || bedroomMatch[2], 10);
    }

    // Look for bathroom count
    const bathroomMatch = text.match(/(\d+(?:\.\d+)?)Ba|(\d+(?:\.\d+)?)\s*bath/i);
    if (bathroomMatch) {
      bathrooms = parseFloat(bathroomMatch[1] || bathroomMatch[2]);
    }

    // Look for square footage
    const sqftMatch = text.match(/(\d+)\s*ft²|(\d+)\s*sqft/i);
    if (sqftMatch) {
      sqft = parseInt(sqftMatch[1] || sqftMatch[2], 10);
    }

    return { bedrooms, bathrooms, sqft };
  }

  private extractAmenitiesFromText(text: string): string[] {
    const amenityKeywords = [
      'parking', 'garage', 'pool', 'gym', 'fitness', 'laundry', 'washer', 'dryer',
      'dishwasher', 'air conditioning', 'heating', 'balcony', 'patio', 'yard',
      'pet friendly', 'cats ok', 'dogs ok', 'no smoking', 'furnished'
    ];

    const lowerText = text.toLowerCase();
    return amenityKeywords.filter(keyword => lowerText.includes(keyword));
  }

  private getFullCityName(subdomain: string): string {
    const cityMap: Record<string, string> = {
      'austin': 'Austin',
      'dallas': 'Dallas',
      'houston': 'Houston',
      'sanantonio': 'San Antonio',
      'atlanta': 'Atlanta',
      'miami': 'Miami',
      'denver': 'Denver',
      'seattle': 'Seattle',
      'phoenix': 'Phoenix',
      'losangeles': 'Los Angeles'
    };

    return cityMap[subdomain] || subdomain;
  }

  private getStateFromCity(city: string): string {
    const stateMap: Record<string, string> = {
      'Austin': 'TX',
      'Dallas': 'TX',
      'Houston': 'TX',
      'San Antonio': 'TX',
      'Atlanta': 'GA',
      'Miami': 'FL',
      'Denver': 'CO',
      'Seattle': 'WA',
      'Phoenix': 'AZ',
      'Los Angeles': 'CA'
    };

    return stateMap[city] || '';
  }

  private generateExternalId(url: string, name: string): string {
    const urlMatch = url.match(/\/(\d+)\.html/);
    const postId = urlMatch ? urlMatch[1] : '';
    const namePart = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
    return `cl_${postId}_${namePart}`;
  }

  protected buildSearchUrl(city: string, state: string, options: ScrapingOptions): string {
    const citySubdomain = this.citySubdomains.get(city.toLowerCase()) || city.toLowerCase();
    let url = `https://${citySubdomain}.craigslist.org/search/apa`;

    const params = new URLSearchParams();
    
    if (options.minPrice) params.append('min_price', options.minPrice.toString());
    if (options.maxPrice) params.append('max_price', options.maxPrice.toString());
    if (options.bedrooms?.length) {
      params.append('bedrooms', Math.min(...options.bedrooms).toString());
    }
    if (options.bathrooms?.length) {
      params.append('bathrooms', Math.min(...options.bathrooms).toString());
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return url;
  }

  protected buildPageUrl(baseUrl: string, page: number): string {
    const offset = (page - 1) * 120; // 120 results per page
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}s=${offset}`;
  }

  // Override with extra conservative rate limiting for Craigslist
  protected async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // Extra long delay for Craigslist
    await this.sleep(8000 + Math.random() * 5000);
    
    const craigslistHeaders = {
      'User-Agent': this.getRandomUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
      ...options.headers
    };

    return super.makeRequest(url, {
      ...options,
      headers: craigslistHeaders
    });
  }

  private getRandomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
    ];

    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }
}