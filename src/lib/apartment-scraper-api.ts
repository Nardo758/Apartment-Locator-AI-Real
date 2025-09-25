// API integration for connecting to external Python scraper
const API_BASE_URL = import.meta.env.VITE_SCRAPER_API_URL || 'https://your-scraper-api.com/api';

export interface UnitData {
  id: string;
  property_name: string;
  address: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  availability_date: string;
  concessions?: string[];
  amenities?: string[];
  images?: string[];
  zip_code: string;
  listing_url?: string;
  last_updated: string;
}

interface ScraperResponse {
  units: UnitData[];
  metadata: {
    scrape_timestamp: string;
    total_units: number;
    properties_scraped: string[];
  };
}

interface ScrapeJob {
  success: boolean;
  jobId: string;
  estimatedDuration?: number;
}

interface UnitTracking {
  unit_id: string;
  price_history: Array<{
    date: string;
    rent: number;
    change_type: 'increase' | 'decrease' | 'stable';
  }>;
  availability_history: Array<{
    date: string;
    status: 'available' | 'unavailable';
  }>;
  concession_history: Array<{
    date: string;
    concessions: string[];
  }>;
}

interface MarketInsights {
  zip_codes: string[];
  average_rent: number;
  median_rent: number;
  rent_trend: 'increasing' | 'decreasing' | 'stable';
  availability_rate: number;
  common_concessions: Array<{
    type: string;
    frequency: number;
  }>;
  price_ranges: {
    min: number;
    max: number;
    percentile_25: number;
    percentile_75: number;
  };
  insights: string[];
}

export class ApartmentScraperAPI {
  
  static async triggerScrape(zipCodes: string[], targetBedrooms: string = '1'): Promise<ScrapeJob> {
    try {
      const response = await fetch(`${API_BASE_URL}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zip_codes: zipCodes,
          target_bedrooms: targetBedrooms
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to trigger scrape:', error);
      throw new Error('Failed to trigger scrape');
    }
  }
  
  static async getScrapedData(zipCodes: string[]): Promise<UnitData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/apartments?${new URLSearchParams({
        zip_codes: zipCodes.join(','),
        include_concessions: 'true'
      })}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ScraperResponse = await response.json();
      return data.units;
    } catch (error) {
      console.error('Failed to fetch scraped data:', error);
      throw new Error('Failed to fetch scraped data');
    }
  }
  
  static async getUnitTracking(unitId: string): Promise<UnitTracking> {
    try {
      const response = await fetch(`${API_BASE_URL}/units/${unitId}/tracking`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch unit tracking:', error);
      throw new Error('Failed to fetch unit tracking');
    }
  }
  
  static async getMarketInsights(zipCodes: string[]): Promise<MarketInsights> {
    try {
      const response = await fetch(`${API_BASE_URL}/insights?${new URLSearchParams({
        zip_codes: zipCodes.join(',')
      })}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch market insights:', error);
      throw new Error('Failed to fetch market insights');
    }
  }
  
  static async checkJobStatus(jobId: string): Promise<{status: string, progress?: number, completed?: boolean}> {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/status`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to check job status:', error);
      throw new Error('Failed to check job status');
    }
  }
}