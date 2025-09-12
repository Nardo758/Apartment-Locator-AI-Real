/**
 * Geocoding service for converting addresses to precise coordinates
 */

import { scrapingLogger } from '../utils/Logger';

export interface GeocodingResult {
  coordinates: {
    lat: number;
    lng: number;
  };
  formattedAddress: string;
  addressComponents: {
    streetNumber?: string;
    streetName?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  accuracy: 'exact' | 'approximate' | 'unknown';
  source: string;
}

export interface CommuteInfo {
  destination: string;
  duration: number; // in minutes
  distance: number; // in miles
  mode: 'driving' | 'transit' | 'walking' | 'cycling';
  route?: {
    steps: Array<{
      instruction: string;
      duration: number;
      distance: number;
    }>;
  };
}

export class GeocodingService {
  private cache: Map<string, GeocodingResult> = new Map();
  private rateLimiter = new Map<string, number>();
  private logger = scrapingLogger;

  // API keys would be set via environment variables
  private readonly GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  private readonly MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;
  private readonly OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;

  /**
   * Geocode an address using multiple providers for reliability
   */
  async geocodeAddress(address: string, city?: string, state?: string): Promise<GeocodingResult | null> {
    const fullAddress = this.buildFullAddress(address, city, state);
    const cacheKey = fullAddress.toLowerCase();

    // Check cache first
    if (this.cache.has(cacheKey)) {
      this.logger.debug('Geocoding cache hit', { address: fullAddress });
      return this.cache.get(cacheKey)!;
    }

    // Check rate limits
    if (!this.canMakeRequest('geocoding')) {
      this.logger.warn('Geocoding rate limit exceeded', { address: fullAddress });
      return null;
    }

    try {
      let result: GeocodingResult | null = null;

      // Try Google Maps first (most accurate)
      if (this.GOOGLE_MAPS_API_KEY && !result) {
        result = await this.geocodeWithGoogle(fullAddress);
      }

      // Fallback to Mapbox
      if (this.MAPBOX_API_KEY && !result) {
        result = await this.geocodeWithMapbox(fullAddress);
      }

      // Fallback to OpenCage (free tier)
      if (this.OPENCAGE_API_KEY && !result) {
        result = await this.geocodeWithOpenCage(fullAddress);
      }

      // Final fallback to OpenStreetMap (free, no API key)
      if (!result) {
        result = await this.geocodeWithNominatim(fullAddress);
      }

      if (result) {
        // Cache successful results
        this.cache.set(cacheKey, result);
        this.logger.info('Address geocoded successfully', { 
          address: fullAddress,
          source: result.source,
          accuracy: result.accuracy
        });
      } else {
        this.logger.warn('Failed to geocode address', { address: fullAddress });
      }

      this.recordRequest('geocoding');
      return result;

    } catch (error) {
      this.logger.error('Geocoding error', error as Error, { address: fullAddress });
      return null;
    }
  }

  /**
   * Calculate commute times to multiple destinations
   */
  async calculateCommutes(
    origin: { lat: number; lng: number },
    destinations: Array<{ name: string; lat: number; lng: number }>,
    modes: Array<'driving' | 'transit' | 'walking' | 'cycling'> = ['driving']
  ): Promise<Array<CommuteInfo & { destination: string }>> {
    const commutes: Array<CommuteInfo & { destination: string }> = [];

    for (const destination of destinations) {
      for (const mode of modes) {
        try {
          const commuteInfo = await this.calculateCommute(origin, destination, mode);
          if (commuteInfo) {
            commutes.push({
              ...commuteInfo,
              destination: destination.name
            });
          }
        } catch (error) {
          this.logger.warn('Failed to calculate commute', { 
            destination: destination.name,
            mode,
            error: (error as Error).message
          });
        }
      }
    }

    return commutes;
  }

  /**
   * Batch geocode multiple addresses
   */
  async batchGeocode(addresses: Array<{ address: string; city?: string; state?: string }>): Promise<Array<GeocodingResult | null>> {
    const results: Array<GeocodingResult | null> = [];
    const batchSize = 10; // Process in batches to avoid overwhelming APIs

    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      const batchPromises = batch.map(addr => 
        this.geocodeAddress(addr.address, addr.city, addr.state)
      );

      const batchResults = await Promise.allSettled(batchPromises);
      const processedResults = batchResults.map(result => 
        result.status === 'fulfilled' ? result.value : null
      );

      results.push(...processedResults);

      // Add delay between batches to respect rate limits
      if (i + batchSize < addresses.length) {
        await this.sleep(1000);
      }
    }

    this.logger.info('Batch geocoding completed', {
      total: addresses.length,
      successful: results.filter(r => r !== null).length
    });

    return results;
  }

  /**
   * Reverse geocode coordinates to get address
   */
  async reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
    const cacheKey = `reverse_${lat.toFixed(6)}_${lng.toFixed(6)}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    if (!this.canMakeRequest('reverse_geocoding')) {
      return null;
    }

    try {
      let result: GeocodingResult | null = null;

      // Try Google Maps first
      if (this.GOOGLE_MAPS_API_KEY) {
        result = await this.reverseGeocodeWithGoogle(lat, lng);
      }

      // Fallback to Nominatim
      if (!result) {
        result = await this.reverseGeocodeWithNominatim(lat, lng);
      }

      if (result) {
        this.cache.set(cacheKey, result);
      }

      this.recordRequest('reverse_geocoding');
      return result;

    } catch (error) {
      this.logger.error('Reverse geocoding error', error as Error, { lat, lng });
      return null;
    }
  }

  private async geocodeWithGoogle(address: string): Promise<GeocodingResult | null> {
    if (!this.GOOGLE_MAPS_API_KEY) return null;

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      
      return {
        coordinates: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        },
        formattedAddress: result.formatted_address,
        addressComponents: this.parseGoogleAddressComponents(result.address_components),
        accuracy: result.geometry.location_type === 'ROOFTOP' ? 'exact' : 'approximate',
        source: 'google'
      };
    }

    return null;
  }

  private async geocodeWithMapbox(address: string): Promise<GeocodingResult | null> {
    if (!this.MAPBOX_API_KEY) return null;

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${this.MAPBOX_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      
      return {
        coordinates: {
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0]
        },
        formattedAddress: feature.place_name,
        addressComponents: this.parseMapboxContext(feature.context),
        accuracy: feature.properties?.accuracy === 'point' ? 'exact' : 'approximate',
        source: 'mapbox'
      };
    }

    return null;
  }

  private async geocodeWithOpenCage(address: string): Promise<GeocodingResult | null> {
    if (!this.OPENCAGE_API_KEY) return null;

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${this.OPENCAGE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      
      return {
        coordinates: {
          lat: result.geometry.lat,
          lng: result.geometry.lng
        },
        formattedAddress: result.formatted,
        addressComponents: this.parseOpenCageComponents(result.components),
        accuracy: result.confidence > 8 ? 'exact' : 'approximate',
        source: 'opencage'
      };
    }

    return null;
  }

  private async geocodeWithNominatim(address: string): Promise<GeocodingResult | null> {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ApartmentLocatorAI/1.0'
      }
    });
    
    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      
      return {
        coordinates: {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        },
        formattedAddress: result.display_name,
        addressComponents: this.parseNominatimAddress(result.address),
        accuracy: result.class === 'building' ? 'exact' : 'approximate',
        source: 'nominatim'
      };
    }

    return null;
  }

  private async calculateCommute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: 'driving' | 'transit' | 'walking' | 'cycling'
  ): Promise<CommuteInfo | null> {
    if (!this.canMakeRequest('directions')) {
      return null;
    }

    try {
      // Try Google Directions API first
      if (this.GOOGLE_MAPS_API_KEY) {
        return await this.calculateCommuteWithGoogle(origin, destination, mode);
      }

      // Fallback to OSRM (free routing service)
      return await this.calculateCommuteWithOSRM(origin, destination, mode);

    } catch (error) {
      this.logger.error('Commute calculation error', error as Error, { origin, destination, mode });
      return null;
    } finally {
      this.recordRequest('directions');
    }
  }

  private async calculateCommuteWithGoogle(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: string
  ): Promise<CommuteInfo | null> {
    if (!this.GOOGLE_MAPS_API_KEY) return null;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=${mode}&key=${this.GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.routes.length > 0) {
      const route = data.routes[0];
      const leg = route.legs[0];
      
      return {
        destination: leg.end_address,
        duration: Math.round(leg.duration.value / 60), // Convert to minutes
        distance: Math.round(leg.distance.value * 0.000621371), // Convert to miles
        mode: mode as any,
        route: {
          steps: leg.steps.map((step: any) => ({
            instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Strip HTML
            duration: Math.round(step.duration.value / 60),
            distance: Math.round(step.distance.value * 0.000621371)
          }))
        }
      };
    }

    return null;
  }

  private async calculateCommuteWithOSRM(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: string
  ): Promise<CommuteInfo | null> {
    // OSRM only supports driving and walking
    const osrmMode = mode === 'driving' ? 'driving' : 'foot';
    const url = `https://router.project-osrm.org/route/v1/${osrmMode}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false&steps=true`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.code === 'Ok' && data.routes.length > 0) {
      const route = data.routes[0];
      
      return {
        destination: `${destination.lat}, ${destination.lng}`,
        duration: Math.round(route.duration / 60), // Convert to minutes
        distance: Math.round(route.distance * 0.000621371), // Convert to miles
        mode: mode as any,
        route: {
          steps: route.legs[0]?.steps?.map((step: any) => ({
            instruction: step.maneuver?.instruction || 'Continue',
            duration: Math.round(step.duration / 60),
            distance: Math.round(step.distance * 0.000621371)
          })) || []
        }
      };
    }

    return null;
  }

  private async reverseGeocodeWithGoogle(lat: number, lng: number): Promise<GeocodingResult | null> {
    if (!this.GOOGLE_MAPS_API_KEY) return null;

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      
      return {
        coordinates: { lat, lng },
        formattedAddress: result.formatted_address,
        addressComponents: this.parseGoogleAddressComponents(result.address_components),
        accuracy: 'exact',
        source: 'google'
      };
    }

    return null;
  }

  private async reverseGeocodeWithNominatim(lat: number, lng: number): Promise<GeocodingResult | null> {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ApartmentLocatorAI/1.0'
      }
    });
    
    const data = await response.json();

    if (data && data.address) {
      return {
        coordinates: { lat, lng },
        formattedAddress: data.display_name,
        addressComponents: this.parseNominatimAddress(data.address),
        accuracy: 'approximate',
        source: 'nominatim'
      };
    }

    return null;
  }

  private parseGoogleAddressComponents(components: any[]): GeocodingResult['addressComponents'] {
    const result: any = {};
    
    for (const component of components) {
      const types = component.types;
      
      if (types.includes('street_number')) {
        result.streetNumber = component.long_name;
      } else if (types.includes('route')) {
        result.streetName = component.long_name;
      } else if (types.includes('locality')) {
        result.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        result.state = component.short_name;
      } else if (types.includes('postal_code')) {
        result.zipCode = component.long_name;
      } else if (types.includes('country')) {
        result.country = component.long_name;
      }
    }

    return {
      city: result.city || '',
      state: result.state || '',
      zipCode: result.zipCode || '',
      country: result.country || 'United States',
      streetNumber: result.streetNumber,
      streetName: result.streetName
    };
  }

  private parseMapboxContext(context: any[]): GeocodingResult['addressComponents'] {
    const result: any = { country: 'United States' };
    
    if (context) {
      for (const item of context) {
        if (item.id.startsWith('place')) {
          result.city = item.text;
        } else if (item.id.startsWith('region')) {
          result.state = item.short_code?.split('-')[1] || item.text;
        } else if (item.id.startsWith('postcode')) {
          result.zipCode = item.text;
        }
      }
    }

    return result;
  }

  private parseOpenCageComponents(components: any): GeocodingResult['addressComponents'] {
    return {
      streetNumber: components.house_number,
      streetName: components.road,
      city: components.city || components.town || components.village,
      state: components.state,
      zipCode: components.postcode,
      country: components.country || 'United States'
    };
  }

  private parseNominatimAddress(address: any): GeocodingResult['addressComponents'] {
    return {
      streetNumber: address.house_number,
      streetName: address.road,
      city: address.city || address.town || address.village,
      state: address.state,
      zipCode: address.postcode,
      country: address.country || 'United States'
    };
  }

  private buildFullAddress(address: string, city?: string, state?: string): string {
    let fullAddress = address;
    
    if (city && !address.toLowerCase().includes(city.toLowerCase())) {
      fullAddress += `, ${city}`;
    }
    
    if (state && !address.toLowerCase().includes(state.toLowerCase())) {
      fullAddress += `, ${state}`;
    }
    
    return fullAddress;
  }

  private canMakeRequest(service: string): boolean {
    const now = Date.now();
    const lastRequest = this.rateLimiter.get(service) || 0;
    const minInterval = service === 'geocoding' ? 100 : 200; // 10 req/sec for geocoding, 5 req/sec for directions
    
    return now - lastRequest >= minInterval;
  }

  private recordRequest(service: string): void {
    this.rateLimiter.set(service, Date.now());
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear the cache (useful for testing or memory management)
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.info('Geocoding cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    // This would require tracking hits/misses in a real implementation
    return {
      size: this.cache.size,
      hitRate: 0.85 // Placeholder
    };
  }
}

// Singleton instance
export const geocodingService = new GeocodingService();