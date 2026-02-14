/**
 * Landlord Data Engine
 * Manages all landlord-specific data from forms and user inputs
 */

import { UserDataEngine } from './userDataEngine';

export interface LandlordProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  units: number;
  occupancyRate: number;
  avgRent: number;
  concessions: string[];
}

export interface PortfolioMetrics {
  totalProperties: number;
  totalUnits: number;
  occupancyRate: number;
  avgRent: number;
  monthlyRevenue: number;
  annualRevenue: number;
}

export interface PricingSettings {
  dynamicPricing: boolean;
  minimumPrice: number;
  maximumPrice: number;
  seasonalAdjustments: boolean;
  competitorTracking: boolean;
}

export interface LandlordAlert {
  id: string;
  type: 'vacancy' | 'maintenance' | 'lease_expiring' | 'payment_late' | 'market_change';
  propertyId?: string;
  unitId?: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  read: boolean;
}

export interface LandlordData {
  // Portfolio
  properties: LandlordProperty[];
  
  // Metrics
  portfolioMetrics: PortfolioMetrics;
  
  // Settings
  pricingSettings: PricingSettings;
  
  // Alerts
  alerts: LandlordAlert[];
  
  // Contact Preferences
  contactEmail: string;
  contactPhone?: string;
  preferredContactMethod: 'email' | 'phone' | 'both';
  
  // Business Info
  companyName?: string;
  licenseNumber?: string;
  
  // Setup
  hasCompletedOnboarding: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Landlord Data Engine
 */
export class LandlordDataEngine extends UserDataEngine<LandlordData> {
  constructor(userId: string) {
    super(userId, 'landlord', {
      enableCache: true,
      autoRefresh: false,
      debug: false,
    });
  }
  
  /**
   * Default landlord data structure
   */
  protected getDefaults(): LandlordData {
    return {
      properties: [],
      portfolioMetrics: {
        totalProperties: 0,
        totalUnits: 0,
        occupancyRate: 0,
        avgRent: 0,
        monthlyRevenue: 0,
        annualRevenue: 0,
      },
      pricingSettings: {
        dynamicPricing: false,
        minimumPrice: 0,
        maximumPrice: 10000,
        seasonalAdjustments: false,
        competitorTracking: false,
      },
      alerts: [],
      contactEmail: '',
      contactPhone: undefined,
      preferredContactMethod: 'email',
      companyName: undefined,
      licenseNumber: undefined,
      hasCompletedOnboarding: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  
  /**
   * Validate landlord data
   */
  protected validate(data: LandlordData): boolean {
    // Contact email required
    if (!data.contactEmail) {
      console.error('Contact email required');
      return false;
    }
    
    return true;
  }
  
  // ============================================
  // LANDLORD-SPECIFIC METHODS
  // ============================================
  
  /**
   * Add property
   */
  async addProperty(property: LandlordProperty): Promise<void> {
    const current = await this.load();
    const updated = {
      properties: [...current.properties, property],
    };
    await this.save(updated as Partial<LandlordData>);
    await this.recalculateMetrics();
  }
  
  /**
   * Remove property
   */
  async removeProperty(propertyId: string): Promise<void> {
    const current = await this.load();
    const updated = {
      properties: current.properties.filter(p => p.id !== propertyId),
    };
    await this.save(updated as Partial<LandlordData>);
    await this.recalculateMetrics();
  }
  
  /**
   * Update property
   */
  async updateProperty(propertyId: string, updates: Partial<LandlordProperty>): Promise<void> {
    const current = await this.load();
    const updated = {
      properties: current.properties.map(p =>
        p.id === propertyId ? { ...p, ...updates } : p
      ),
    };
    await this.save(updated as Partial<LandlordData>);
    await this.recalculateMetrics();
  }
  
  /**
   * Update pricing settings
   */
  async updatePricingSettings(settings: Partial<PricingSettings>): Promise<void> {
    const current = await this.load();
    const updated = {
      pricingSettings: {
        ...current.pricingSettings,
        ...settings,
      },
    };
    await this.save(updated as Partial<LandlordData>);
  }
  
  /**
   * Add alert
   */
  async addAlert(alert: LandlordAlert): Promise<void> {
    const current = await this.load();
    const updated = {
      alerts: [alert, ...current.alerts].slice(0, 100), // Keep last 100
    };
    await this.save(updated as Partial<LandlordData>);
  }
  
  /**
   * Mark alert as read
   */
  async markAlertRead(alertId: string): Promise<void> {
    const current = await this.load();
    const updated = {
      alerts: current.alerts.map(a =>
        a.id === alertId ? { ...a, read: true } : a
      ),
    };
    await this.save(updated as Partial<LandlordData>);
  }
  
  /**
   * Clear all alerts
   */
  async clearAlerts(): Promise<void> {
    await this.save({ alerts: [] } as Partial<LandlordData>);
  }
  
  /**
   * Update contact info
   */
  async updateContactInfo(updates: {
    contactEmail?: string;
    contactPhone?: string;
    preferredContactMethod?: 'email' | 'phone' | 'both';
  }): Promise<void> {
    await this.save(updates as Partial<LandlordData>);
  }
  
  /**
   * Mark onboarding complete
   */
  async completeOnboarding(): Promise<void> {
    await this.save({
      hasCompletedOnboarding: true,
    } as Partial<LandlordData>);
  }
  
  /**
   * Recalculate portfolio metrics
   */
  private async recalculateMetrics(): Promise<void> {
    const current = await this.load();
    
    const totalProperties = current.properties.length;
    const totalUnits = current.properties.reduce((sum, p) => sum + p.units, 0);
    const avgOccupancy = totalProperties > 0
      ? current.properties.reduce((sum, p) => sum + p.occupancyRate, 0) / totalProperties
      : 0;
    const avgRent = totalProperties > 0
      ? current.properties.reduce((sum, p) => sum + p.avgRent, 0) / totalProperties
      : 0;
    const monthlyRevenue = current.properties.reduce(
      (sum, p) => sum + (p.avgRent * p.units * (p.occupancyRate / 100)),
      0
    );
    
    const metrics: PortfolioMetrics = {
      totalProperties,
      totalUnits,
      occupancyRate: avgOccupancy,
      avgRent,
      monthlyRevenue,
      annualRevenue: monthlyRevenue * 12,
    };
    
    await this.save({ portfolioMetrics: metrics } as Partial<LandlordData>);
  }
}
