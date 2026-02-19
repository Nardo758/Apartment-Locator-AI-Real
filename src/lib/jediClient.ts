/**
 * JEDI RE API Client
 * 
 * Connects Apartment Locator AI to JEDI RE for property intelligence
 */

const JEDI_RE_API_URL = import.meta.env.VITE_JEDI_RE_API_URL || 'http://localhost:4000/api/v1';
const JEDI_RE_API_KEY = 'aiq_2248e8fc535c5a9c4a09f9ed1c0d719bf0ad45f56b2c47841de6bc1421388f6b';

export interface PropertyIntelligence {
  id: string;
  address: string;
  county: string;
  parcelId?: string;
  ownerName?: string;
  totalAssessedValue?: number;
  lotSizeAcres?: number;
  units?: number;
  propertyType?: string;
  riskScore?: number;
  developmentScore?: number;
  zoning?: string;
  marketData?: {
    comparables?: any[];
    averageRent?: number;
    occupancyRate?: number;
  };
}

export interface PropertyAnalysisRequest {
  address: string;
  county?: string;
  state?: string;
}

class JediREClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = JEDI_RE_API_URL;
    this.apiKey = JEDI_RE_API_KEY;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`JEDI RE API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get property intelligence by property ID
   */
  async getPropertyById(propertyId: string): Promise<PropertyIntelligence> {
    return this.request<PropertyIntelligence>(`/properties/${propertyId}`);
  }

  /**
   * Analyze property by address
   */
  async analyzeProperty(data: PropertyAnalysisRequest): Promise<PropertyIntelligence> {
    return this.request<PropertyIntelligence>('/properties/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get properties by owner name
   */
  async getPropertiesByOwner(ownerName: string): Promise<PropertyIntelligence[]> {
    return this.request<PropertyIntelligence[]>(`/properties/search?owner=${encodeURIComponent(ownerName)}`);
  }

  /**
   * Bulk property lookup
   */
  async bulkLookup(propertyIds: string[]): Promise<PropertyIntelligence[]> {
    return this.request<PropertyIntelligence[]>('/properties/bulk', {
      method: 'POST',
      body: JSON.stringify({ propertyIds }),
    });
  }

  /**
   * Get market comparables for an address
   */
  async getComparables(address: string, radius: number = 1): Promise<any[]> {
    return this.request<any[]>(`/properties/comparables?address=${encodeURIComponent(address)}&radius=${radius}`);
  }

  /**
   * Check API health
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

// Export singleton instance
export const jediClient = new JediREClient();

// Export class for testing
export default JediREClient;
