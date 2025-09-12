/**
 * Data validation and cleaning utilities for scraped property data
 */

import { 
  ScrapedProperty, 
  ValidationResult, 
  ValidationError, 
  ValidationWarning,
  DataValidator as IDataValidator
} from '../core/types';

export class DataValidator implements IDataValidator {
  private readonly requiredFields: (keyof ScrapedProperty)[] = [
    'externalId',
    'source',
    'name',
    'address',
    'city',
    'state',
    'currentPrice',
    'bedrooms',
    'bathrooms',
    'listingUrl',
    'scrapedAt'
  ];

  private readonly numericFields: (keyof ScrapedProperty)[] = [
    'originalPrice',
    'currentPrice',
    'bedrooms',
    'bathrooms',
    'sqft',
    'yearBuilt'
  ];

  validateProperty(property: Partial<ScrapedProperty>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check required fields
    for (const field of this.requiredFields) {
      if (!property[field]) {
        errors.push({
          field: field as string,
          message: `Required field '${field}' is missing`,
          code: 'REQUIRED_FIELD_MISSING'
        });
      }
    }

    // Validate specific fields
    this.validatePrice(property, errors, warnings);
    this.validateLocation(property, errors, warnings);
    this.validatePropertyDetails(property, errors, warnings);
    this.validateDates(property, errors, warnings);
    this.validateUrls(property, errors, warnings);
    this.validateCoordinates(property, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  cleanProperty(property: Partial<ScrapedProperty>): ScrapedProperty {
    const cleaned: Partial<ScrapedProperty> = { ...property };

    // Clean text fields
    if (cleaned.name) cleaned.name = this.cleanText(cleaned.name);
    if (cleaned.address) cleaned.address = this.cleanText(cleaned.address);
    if (cleaned.city) cleaned.city = this.cleanText(cleaned.city);
    if (cleaned.state) cleaned.state = this.cleanState(cleaned.state);
    if (cleaned.zipCode) cleaned.zipCode = this.cleanZipCode(cleaned.zipCode);

    // Clean numeric fields
    if (cleaned.originalPrice) cleaned.originalPrice = this.cleanPrice(cleaned.originalPrice);
    if (cleaned.currentPrice) cleaned.currentPrice = this.cleanPrice(cleaned.currentPrice);
    if (cleaned.bedrooms) cleaned.bedrooms = this.cleanNumber(cleaned.bedrooms);
    if (cleaned.bathrooms) cleaned.bathrooms = this.cleanNumber(cleaned.bathrooms);
    if (cleaned.sqft) cleaned.sqft = this.cleanNumber(cleaned.sqft);
    if (cleaned.yearBuilt) cleaned.yearBuilt = this.cleanYear(cleaned.yearBuilt);

    // Clean arrays
    if (cleaned.features) cleaned.features = this.cleanStringArray(cleaned.features);
    if (cleaned.amenities) cleaned.amenities = this.cleanStringArray(cleaned.amenities);
    if (cleaned.images) cleaned.images = this.cleanUrlArray(cleaned.images);

    // Set default values
    cleaned.isActive = cleaned.isActive !== false;
    cleaned.lastUpdated = cleaned.lastUpdated || new Date();
    cleaned.scrapedAt = cleaned.scrapedAt || new Date();

    // Determine availability type if not set
    if (!cleaned.availabilityType && cleaned.availability) {
      cleaned.availabilityType = this.determineAvailabilityType(cleaned.availability);
    }

    return cleaned as ScrapedProperty;
  }

  private validatePrice(
    property: Partial<ScrapedProperty>, 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): void {
    if (property.currentPrice !== undefined) {
      if (typeof property.currentPrice !== 'number' || property.currentPrice <= 0) {
        errors.push({
          field: 'currentPrice',
          message: 'Current price must be a positive number',
          code: 'INVALID_PRICE'
        });
      } else if (property.currentPrice < 100) {
        warnings.push({
          field: 'currentPrice',
          message: 'Price seems unusually low',
          code: 'SUSPICIOUS_PRICE'
        });
      } else if (property.currentPrice > 50000) {
        warnings.push({
          field: 'currentPrice',
          message: 'Price seems unusually high',
          code: 'SUSPICIOUS_PRICE'
        });
      }
    }

    if (property.originalPrice && property.currentPrice) {
      if (property.originalPrice < property.currentPrice) {
        warnings.push({
          field: 'originalPrice',
          message: 'Original price is lower than current price',
          code: 'PRICE_INCONSISTENCY'
        });
      }
    }
  }

  private validateLocation(
    property: Partial<ScrapedProperty>, 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): void {
    if (property.state && !this.isValidState(property.state)) {
      errors.push({
        field: 'state',
        message: 'Invalid state code',
        code: 'INVALID_STATE'
      });
    }

    if (property.zipCode && !this.isValidZipCode(property.zipCode)) {
      warnings.push({
        field: 'zipCode',
        message: 'Invalid zip code format',
        code: 'INVALID_ZIP_FORMAT'
      });
    }

    if (property.city && property.city.length < 2) {
      errors.push({
        field: 'city',
        message: 'City name too short',
        code: 'INVALID_CITY'
      });
    }
  }

  private validatePropertyDetails(
    property: Partial<ScrapedProperty>, 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): void {
    if (property.bedrooms !== undefined) {
      if (!Number.isInteger(property.bedrooms) || property.bedrooms < 0 || property.bedrooms > 20) {
        errors.push({
          field: 'bedrooms',
          message: 'Bedrooms must be an integer between 0 and 20',
          code: 'INVALID_BEDROOMS'
        });
      }
    }

    if (property.bathrooms !== undefined) {
      if (typeof property.bathrooms !== 'number' || property.bathrooms < 0 || property.bathrooms > 20) {
        errors.push({
          field: 'bathrooms',
          message: 'Bathrooms must be a number between 0 and 20',
          code: 'INVALID_BATHROOMS'
        });
      }
    }

    if (property.sqft !== undefined) {
      if (!Number.isInteger(property.sqft) || property.sqft < 100 || property.sqft > 50000) {
        if (property.sqft < 100 || property.sqft > 50000) {
          warnings.push({
            field: 'sqft',
            message: 'Square footage seems unusual',
            code: 'SUSPICIOUS_SQFT'
          });
        }
      }
    }

    if (property.yearBuilt !== undefined) {
      const currentYear = new Date().getFullYear();
      if (!Number.isInteger(property.yearBuilt) || 
          property.yearBuilt < 1800 || 
          property.yearBuilt > currentYear + 5) {
        errors.push({
          field: 'yearBuilt',
          message: 'Year built must be between 1800 and current year + 5',
          code: 'INVALID_YEAR_BUILT'
        });
      }
    }
  }

  private validateDates(
    property: Partial<ScrapedProperty>, 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): void {
    const now = new Date();

    if (property.scrapedAt) {
      if (!(property.scrapedAt instanceof Date) || property.scrapedAt > now) {
        errors.push({
          field: 'scrapedAt',
          message: 'Scraped date must be a valid date not in the future',
          code: 'INVALID_SCRAPED_DATE'
        });
      }
    }

    if (property.lastUpdated) {
      if (!(property.lastUpdated instanceof Date) || property.lastUpdated > now) {
        errors.push({
          field: 'lastUpdated',
          message: 'Last updated date must be a valid date not in the future',
          code: 'INVALID_UPDATED_DATE'
        });
      }
    }
  }

  private validateUrls(
    property: Partial<ScrapedProperty>, 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): void {
    if (property.listingUrl && !this.isValidUrl(property.listingUrl)) {
      errors.push({
        field: 'listingUrl',
        message: 'Invalid listing URL format',
        code: 'INVALID_URL'
      });
    }

    if (property.websiteUrl && !this.isValidUrl(property.websiteUrl)) {
      warnings.push({
        field: 'websiteUrl',
        message: 'Invalid website URL format',
        code: 'INVALID_URL'
      });
    }

    if (property.virtualTourUrl && !this.isValidUrl(property.virtualTourUrl)) {
      warnings.push({
        field: 'virtualTourUrl',
        message: 'Invalid virtual tour URL format',
        code: 'INVALID_URL'
      });
    }
  }

  private validateCoordinates(
    property: Partial<ScrapedProperty>, 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): void {
    if (property.coordinates) {
      const { lat, lng } = property.coordinates;
      
      if (typeof lat !== 'number' || lat < -90 || lat > 90) {
        errors.push({
          field: 'coordinates.lat',
          message: 'Latitude must be between -90 and 90',
          code: 'INVALID_LATITUDE'
        });
      }

      if (typeof lng !== 'number' || lng < -180 || lng > 180) {
        errors.push({
          field: 'coordinates.lng',
          message: 'Longitude must be between -180 and 180',
          code: 'INVALID_LONGITUDE'
        });
      }
    }
  }

  private cleanText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-.,#]/g, '');
  }

  private cleanState(state: string): string {
    return state.trim().toUpperCase().substring(0, 2);
  }

  private cleanZipCode(zip: string): string {
    return zip.replace(/\D/g, '').substring(0, 5);
  }

  private cleanPrice(price: number | string): number {
    if (typeof price === 'string') {
      const cleaned = price.replace(/[^\d.]/g, '');
      return parseFloat(cleaned) || 0;
    }
    return Math.round(price);
  }

  private cleanNumber(value: number | string): number {
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d.]/g, '');
      return parseFloat(cleaned) || 0;
    }
    return value;
  }

  private cleanYear(year: number | string): number {
    const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;
    const currentYear = new Date().getFullYear();
    
    if (yearNum < 100) {
      // Assume 2-digit years
      return yearNum < 50 ? 2000 + yearNum : 1900 + yearNum;
    }
    
    return yearNum;
  }

  private cleanStringArray(arr: string[]): string[] {
    return arr
      .map(item => this.cleanText(item))
      .filter(item => item.length > 0)
      .filter((item, index, self) => self.indexOf(item) === index); // Remove duplicates
  }

  private cleanUrlArray(urls: string[]): string[] {
    return urls
      .filter(url => this.isValidUrl(url))
      .filter((url, index, self) => self.indexOf(url) === index); // Remove duplicates
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

  private isValidState(state: string): boolean {
    const validStates = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
      'DC'
    ];
    return validStates.includes(state.toUpperCase());
  }

  private isValidZipCode(zip: string): boolean {
    return /^\d{5}(-\d{4})?$/.test(zip);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Deduplication utility to identify and handle duplicate properties
 */
export class PropertyDeduplicator {
  private readonly similarityThreshold = 0.85;

  findDuplicates(
    newProperty: ScrapedProperty, 
    existingProperties: ScrapedProperty[]
  ): Array<{
    property: ScrapedProperty;
    similarity: number;
    matchedFields: string[];
  }> {
    return existingProperties
      .map(existing => ({
        property: existing,
        ...this.calculateSimilarity(newProperty, existing)
      }))
      .filter(result => result.similarity >= this.similarityThreshold)
      .sort((a, b) => b.similarity - a.similarity);
  }

  private calculateSimilarity(
    prop1: ScrapedProperty, 
    prop2: ScrapedProperty
  ): { similarity: number; matchedFields: string[] } {
    const matchedFields: string[] = [];
    let totalWeight = 0;
    let matchedWeight = 0;

    // Address similarity (high weight)
    const addressWeight = 0.4;
    totalWeight += addressWeight;
    if (this.areAddressesSimilar(prop1.address, prop2.address)) {
      matchedFields.push('address');
      matchedWeight += addressWeight;
    }

    // Name similarity (medium weight)
    const nameWeight = 0.2;
    totalWeight += nameWeight;
    if (this.areNamesSimilar(prop1.name, prop2.name)) {
      matchedFields.push('name');
      matchedWeight += nameWeight;
    }

    // Price similarity (medium weight)
    const priceWeight = 0.15;
    totalWeight += priceWeight;
    if (this.arePricesSimilar(prop1.currentPrice, prop2.currentPrice)) {
      matchedFields.push('price');
      matchedWeight += priceWeight;
    }

    // Property details (medium weight)
    const detailsWeight = 0.15;
    totalWeight += detailsWeight;
    if (prop1.bedrooms === prop2.bedrooms && prop1.bathrooms === prop2.bathrooms) {
      matchedFields.push('details');
      matchedWeight += detailsWeight;
    }

    // Coordinates (low weight but high precision)
    const coordWeight = 0.1;
    totalWeight += coordWeight;
    if (prop1.coordinates && prop2.coordinates && 
        this.areCoordinatesSimilar(prop1.coordinates, prop2.coordinates)) {
      matchedFields.push('coordinates');
      matchedWeight += coordWeight;
    }

    return {
      similarity: matchedWeight / totalWeight,
      matchedFields
    };
  }

  private areAddressesSimilar(addr1: string, addr2: string): boolean {
    const normalize = (addr: string) => 
      addr.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\b(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const norm1 = normalize(addr1);
    const norm2 = normalize(addr2);
    
    return this.calculateStringSimilarity(norm1, norm2) > 0.8;
  }

  private areNamesSimilar(name1: string, name2: string): boolean {
    const normalize = (name: string) =>
      name.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\b(apartments|apartment|apt|complex|homes|home|residences|residence)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const norm1 = normalize(name1);
    const norm2 = normalize(name2);
    
    return this.calculateStringSimilarity(norm1, norm2) > 0.7;
  }

  private arePricesSimilar(price1: number, price2: number): boolean {
    const difference = Math.abs(price1 - price2);
    const average = (price1 + price2) / 2;
    const percentageDifference = difference / average;
    
    return percentageDifference < 0.05; // 5% difference threshold
  }

  private areCoordinatesSimilar(
    coord1: { lat: number; lng: number }, 
    coord2: { lat: number; lng: number }
  ): boolean {
    const latDiff = Math.abs(coord1.lat - coord2.lat);
    const lngDiff = Math.abs(coord1.lng - coord2.lng);
    
    // Within ~100 meters (rough approximation)
    return latDiff < 0.001 && lngDiff < 0.001;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    // Simple Levenshtein distance-based similarity
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1;
    
    const distance = this.levenshteinDistance(str1, str2);
    return 1 - (distance / maxLength);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + substitutionCost // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}