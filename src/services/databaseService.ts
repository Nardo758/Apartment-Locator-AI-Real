import { supabase } from '@/integrations/supabase/client';

export interface PropertyWithSavings {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: string;
  listingDate: string;
  potentialSavings: number;
  savingsPercentage: number;
  marketValue: number;
  recommendationScore: number;
  features: string[];
  images: string[];
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  location?: string;
  minSavings?: number;
}

export class DatabaseService {
  /**
   * Get properties with potential savings above a threshold
   */
  static async getPropertiesWithSavings(minSavings: number = 0): Promise<PropertyWithSavings[]> {
    try {
      // For now, return mock data since we don't have the actual properties table structure
      // In a real implementation, this would query the database
      const mockProperties: PropertyWithSavings[] = [
        {
          id: '1',
          address: '123 Market St',
          city: 'Austin',
          state: 'TX',
          zipCode: '78701',
          price: 450000,
          bedrooms: 3,
          bathrooms: 2,
          sqft: 1800,
          propertyType: 'Single Family',
          listingDate: new Date().toISOString(),
          potentialSavings: 35000,
          savingsPercentage: 7.8,
          marketValue: 485000,
          recommendationScore: 92,
          features: ['Updated Kitchen', 'Hardwood Floors', 'Garage', 'Backyard'],
          images: ['/placeholder.svg'],
          description: 'Beautiful home in prime location with great investment potential.',
          coordinates: { lat: 30.2672, lng: -97.7431 }
        },
        {
          id: '2',
          address: '456 Oak Avenue',
          city: 'Austin',
          state: 'TX',
          zipCode: '78702',
          price: 320000,
          bedrooms: 2,
          bathrooms: 2,
          sqft: 1200,
          propertyType: 'Condo',
          listingDate: new Date().toISOString(),
          potentialSavings: 25000,
          savingsPercentage: 7.8,
          marketValue: 345000,
          recommendationScore: 88,
          features: ['Pool', 'Gym', 'Balcony', 'Parking'],
          images: ['/placeholder.svg'],
          description: 'Modern condo with amenities and great downtown access.',
          coordinates: { lat: 30.2849, lng: -97.7341 }
        },
        {
          id: '3',
          address: '789 Pine Street',
          city: 'Dallas',
          state: 'TX',
          zipCode: '75201',
          price: 280000,
          bedrooms: 2,
          bathrooms: 1.5,
          sqft: 1100,
          propertyType: 'Townhouse',
          listingDate: new Date().toISOString(),
          potentialSavings: 22000,
          savingsPercentage: 7.9,
          marketValue: 302000,
          recommendationScore: 85,
          features: ['Patio', 'Storage', 'Laundry', 'HOA'],
          images: ['/placeholder.svg'],
          description: 'Charming townhouse in established neighborhood.',
          coordinates: { lat: 32.7767, lng: -96.7970 }
        }
      ];

      // Filter by minimum savings
      return mockProperties.filter(property => property.potentialSavings >= minSavings);
    } catch (error) {
      console.error('Error fetching properties with savings:', error);
      throw new Error('Failed to fetch properties with savings');
    }
  }

  /**
   * Search properties with advanced filters
   */
  static async searchProperties(filters: SearchFilters): Promise<PropertyWithSavings[]> {
    try {
      const allProperties = await this.getPropertiesWithSavings(0);
      
      return allProperties.filter(property => {
        if (filters.minPrice && property.price < filters.minPrice) return false;
        if (filters.maxPrice && property.price > filters.maxPrice) return false;
        if (filters.bedrooms && property.bedrooms < filters.bedrooms) return false;
        if (filters.bathrooms && property.bathrooms < filters.bathrooms) return false;
        if (filters.propertyType && property.propertyType !== filters.propertyType) return false;
        if (filters.location && !property.city.toLowerCase().includes(filters.location.toLowerCase())) return false;
        if (filters.minSavings && property.potentialSavings < filters.minSavings) return false;
        
        return true;
      });
    } catch (error) {
      console.error('Error searching properties:', error);
      throw new Error('Failed to search properties');
    }
  }

  /**
   * Get property by ID
   */
  static async getPropertyById(id: string): Promise<PropertyWithSavings | null> {
    try {
      const properties = await this.getPropertiesWithSavings(0);
      return properties.find(property => property.id === id) || null;
    } catch (error) {
      console.error('Error fetching property by ID:', error);
      throw new Error('Failed to fetch property');
    }
  }

  /**
   * Calculate potential savings for a property
   */
  static calculatePotentialSavings(listPrice: number, marketValue: number): {
    savings: number;
    percentage: number;
    isGoodDeal: boolean;
  } {
    const savings = marketValue - listPrice;
    const percentage = (savings / listPrice) * 100;
    const isGoodDeal = percentage > 5; // Consider 5%+ savings a good deal
    
    return {
      savings: Math.max(0, savings),
      percentage: Math.max(0, percentage),
      isGoodDeal
    };
  }

  /**
   * Get market statistics for a location
   */
  static async getMarketStats(location: string): Promise<{
    averagePrice: number;
    medianPrice: number;
    totalListings: number;
    averageSavings: number;
    hotDeals: number;
  }> {
    try {
      const properties = await this.searchProperties({ location });
      
      if (properties.length === 0) {
        return {
          averagePrice: 0,
          medianPrice: 0,
          totalListings: 0,
          averageSavings: 0,
          hotDeals: 0
        };
      }

      const prices = properties.map(p => p.price).sort((a, b) => a - b);
      const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const medianPrice = prices[Math.floor(prices.length / 2)];
      const averageSavings = properties.reduce((sum, p) => sum + p.potentialSavings, 0) / properties.length;
      const hotDeals = properties.filter(p => p.savingsPercentage > 7).length;

      return {
        averagePrice: Math.round(averagePrice),
        medianPrice: Math.round(medianPrice),
        totalListings: properties.length,
        averageSavings: Math.round(averageSavings),
        hotDeals
      };
    } catch (error) {
      console.error('Error getting market stats:', error);
      throw new Error('Failed to get market statistics');
    }
  }
}