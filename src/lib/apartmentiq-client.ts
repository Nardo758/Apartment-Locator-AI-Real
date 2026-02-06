import { authenticatedFetch } from './authHelpers';

export interface LeaseIntelligence {
  propertyId: string;
  expiringNext30Days: number;
  expiringNext90Days: number;
  avgCurrentLease: number;
  marketRate: number;
  renewalRate: number;
  rolloverRiskScore: number;
}

export class ApartmentIQClient {
  private baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  async fetchLeaseIntel(propertyIds: string[]): Promise<LeaseIntelligence[]> {
    const response = await authenticatedFetch(`${this.baseUrl}/api/landlord/lease-intel`, {
      method: 'POST',
      body: JSON.stringify({ propertyIds }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch lease intelligence (${response.status})`);
    }

    return response.json();
  }
}

export const apartmentIQClient = new ApartmentIQClient();
