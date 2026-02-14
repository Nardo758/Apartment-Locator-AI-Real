/**
 * Agent Data Engine
 * Manages all agent-specific data from forms and user inputs
 */

import { UserDataEngine } from './userDataEngine';

export interface AgentClient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: 'buyer' | 'renter' | 'seller' | 'landlord';
  budget?: number;
  location?: string;
  status: 'lead' | 'active' | 'inactive' | 'closed';
  createdAt: Date;
  lastContact?: Date;
}

export interface AgentDeal {
  id: string;
  clientId: string;
  propertyId?: string;
  propertyAddress?: string;
  dealType: 'rental' | 'sale';
  amount: number;
  commission: number;
  stage: 'prospecting' | 'touring' | 'negotiating' | 'under_contract' | 'closed' | 'lost';
  probability: number; // 0-100
  expectedCloseDate?: Date;
  createdAt: Date;
  closedAt?: Date;
}

export interface AgentCommission {
  id: string;
  dealId: string;
  amount: number;
  percentage: number;
  status: 'pending' | 'paid' | 'disputed';
  paidDate?: Date;
  createdAt: Date;
}

export interface AgentPipeline {
  prospecting: AgentDeal[];
  touring: AgentDeal[];
  negotiating: AgentDeal[];
  underContract: AgentDeal[];
  closed: AgentDeal[];
  lost: AgentDeal[];
}

export interface AgentStats {
  totalClients: number;
  activeClients: number;
  totalDeals: number;
  closedDeals: number;
  totalCommissions: number;
  pendingCommissions: number;
  avgDealSize: number;
  closeRate: number;
}

export interface AgentMarketTracking {
  trackedMarkets: { city: string; state: string }[];
  targetClientTypes: ('buyer' | 'renter' | 'seller' | 'landlord')[];
  pricingInsights: { location: string; avgCommission: number; dealCount: number }[];
}

export interface AgentData {
  // Clients
  clients: AgentClient[];
  
  // Deals
  deals: AgentDeal[];
  
  // Commissions
  commissions: AgentCommission[];
  
  // Stats (calculated)
  stats: AgentStats;
  
  // Settings
  commissionRate: number; // Default commission %
  preferredAreas: string[];
  
  // Market Intelligence (USER INPUT DATA)
  marketTracking: AgentMarketTracking;
  
  // Contact Info
  contactEmail: string;
  contactPhone?: string;
  licenseNumber?: string;
  brokerage?: string;
  
  // Setup
  hasCompletedOnboarding: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Agent Data Engine
 */
export class AgentDataEngine extends UserDataEngine<AgentData> {
  constructor(userId: string) {
    super(userId, 'agent', {
      enableCache: true,
      autoRefresh: false,
      debug: false,
    });
  }
  
  /**
   * Default agent data structure
   */
  protected getDefaults(): AgentData {
    return {
      clients: [],
      deals: [],
      commissions: [],
      stats: {
        totalClients: 0,
        activeClients: 0,
        totalDeals: 0,
        closedDeals: 0,
        totalCommissions: 0,
        pendingCommissions: 0,
        avgDealSize: 0,
        closeRate: 0,
      },
      commissionRate: 6.0, // 6% default
      preferredAreas: [],
      marketTracking: {
        trackedMarkets: [],
        targetClientTypes: ['renter'], // Default focus
        pricingInsights: [],
      },
      contactEmail: '',
      contactPhone: undefined,
      licenseNumber: undefined,
      brokerage: undefined,
      hasCompletedOnboarding: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  
  /**
   * Validate agent data
   */
  protected validate(data: AgentData): boolean {
    // Contact email required
    if (!data.contactEmail) {
      console.error('Contact email required');
      return false;
    }
    
    // Commission rate must be valid
    if (data.commissionRate < 0 || data.commissionRate > 100) {
      console.error('Commission rate must be between 0 and 100');
      return false;
    }
    
    return true;
  }
  
  // ============================================
  // AGENT-SPECIFIC METHODS
  // ============================================
  
  /**
   * Add client
   */
  async addClient(client: AgentClient): Promise<void> {
    const current = await this.load();
    const updated = {
      clients: [...current.clients, client],
    };
    await this.save(updated as Partial<AgentData>);
    await this.recalculateStats();
  }
  
  /**
   * Update client
   */
  async updateClient(clientId: string, updates: Partial<AgentClient>): Promise<void> {
    const current = await this.load();
    const updated = {
      clients: current.clients.map(c =>
        c.id === clientId ? { ...c, ...updates } : c
      ),
    };
    await this.save(updated as Partial<AgentData>);
    await this.recalculateStats();
  }
  
  /**
   * Remove client
   */
  async removeClient(clientId: string): Promise<void> {
    const current = await this.load();
    const updated = {
      clients: current.clients.filter(c => c.id !== clientId),
      deals: current.deals.filter(d => d.clientId !== clientId),
    };
    await this.save(updated as Partial<AgentData>);
    await this.recalculateStats();
  }
  
  /**
   * Add deal
   */
  async addDeal(deal: AgentDeal): Promise<void> {
    const current = await this.load();
    const updated = {
      deals: [...current.deals, deal],
    };
    await this.save(updated as Partial<AgentData>);
    await this.recalculateStats();
  }
  
  /**
   * Update deal
   */
  async updateDeal(dealId: string, updates: Partial<AgentDeal>): Promise<void> {
    const current = await this.load();
    const updated = {
      deals: current.deals.map(d =>
        d.id === dealId ? { ...d, ...updates } : d
      ),
    };
    await this.save(updated as Partial<AgentData>);
    await this.recalculateStats();
  }
  
  /**
   * Move deal to stage
   */
  async moveDealToStage(dealId: string, stage: AgentDeal['stage']): Promise<void> {
    await this.updateDeal(dealId, { stage });
  }
  
  /**
   * Close deal
   */
  async closeDeal(dealId: string, commission: number): Promise<void> {
    const current = await this.load();
    const deal = current.deals.find(d => d.id === dealId);
    
    if (!deal) {
      throw new Error('Deal not found');
    }
    
    // Update deal
    await this.updateDeal(dealId, {
      stage: 'closed',
      closedAt: new Date(),
      commission,
    });
    
    // Create commission record
    const commissionRecord: AgentCommission = {
      id: `comm-${Date.now()}`,
      dealId,
      amount: commission,
      percentage: (commission / deal.amount) * 100,
      status: 'pending',
      createdAt: new Date(),
    };
    
    const updatedCommissions = {
      commissions: [...current.commissions, commissionRecord],
    };
    
    await this.save(updatedCommissions as Partial<AgentData>);
    await this.recalculateStats();
  }
  
  /**
   * Mark commission as paid
   */
  async markCommissionPaid(commissionId: string): Promise<void> {
    const current = await this.load();
    const updated = {
      commissions: current.commissions.map(c =>
        c.id === commissionId
          ? { ...c, status: 'paid' as const, paidDate: new Date() }
          : c
      ),
    };
    await this.save(updated as Partial<AgentData>);
    await this.recalculateStats();
  }
  
  /**
   * Get pipeline
   */
  getPipeline(data?: AgentData): AgentPipeline {
    const current = data || this.getCurrent();
    if (!current) {
      return {
        prospecting: [],
        touring: [],
        negotiating: [],
        underContract: [],
        closed: [],
        lost: [],
      };
    }
    
    return {
      prospecting: current.deals.filter(d => d.stage === 'prospecting'),
      touring: current.deals.filter(d => d.stage === 'touring'),
      negotiating: current.deals.filter(d => d.stage === 'negotiating'),
      underContract: current.deals.filter(d => d.stage === 'under_contract'),
      closed: current.deals.filter(d => d.stage === 'closed'),
      lost: current.deals.filter(d => d.stage === 'lost'),
    };
  }
  
  /**
   * Update commission rate
   */
  async updateCommissionRate(rate: number): Promise<void> {
    await this.save({ commissionRate: rate } as Partial<AgentData>);
  }
  
  /**
   * Update preferred areas
   */
  async updatePreferredAreas(areas: string[]): Promise<void> {
    await this.save({ preferredAreas: areas } as Partial<AgentData>);
  }
  
  /**
   * Mark onboarding complete
   */
  async completeOnboarding(): Promise<void> {
    await this.save({
      hasCompletedOnboarding: true,
    } as Partial<AgentData>);
  }
  
  /**
   * Recalculate stats
   */
  private async recalculateStats(): Promise<void> {
    const current = await this.load();
    
    const totalClients = current.clients.length;
    const activeClients = current.clients.filter(c => c.status === 'active').length;
    const totalDeals = current.deals.length;
    const closedDeals = current.deals.filter(d => d.stage === 'closed').length;
    const totalCommissions = current.commissions.reduce((sum, c) => sum + c.amount, 0);
    const pendingCommissions = current.commissions
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + c.amount, 0);
    const avgDealSize = closedDeals > 0
      ? current.deals
          .filter(d => d.stage === 'closed')
          .reduce((sum, d) => sum + d.amount, 0) / closedDeals
      : 0;
    const closeRate = totalDeals > 0 ? (closedDeals / totalDeals) * 100 : 0;
    
    const stats: AgentStats = {
      totalClients,
      activeClients,
      totalDeals,
      closedDeals,
      totalCommissions,
      pendingCommissions,
      avgDealSize,
      closeRate,
    };
    
    await this.save({ stats } as Partial<AgentData>);
  }
  
  // ============================================
  // MARKET INTELLIGENCE METHODS
  // ============================================
  
  /**
   * Track market
   */
  async trackMarket(city: string, state: string): Promise<void> {
    const current = await this.load();
    const exists = current.marketTracking.trackedMarkets.some(
      m => m.city.toLowerCase() === city.toLowerCase() && m.state.toLowerCase() === state.toLowerCase()
    );
    
    if (!exists) {
      const updated = {
        marketTracking: {
          ...current.marketTracking,
          trackedMarkets: [...current.marketTracking.trackedMarkets, { city, state }],
        },
      };
      await this.save(updated as Partial<AgentData>);
    }
  }
  
  /**
   * Set target client types
   */
  async setTargetClientTypes(types: ('buyer' | 'renter' | 'seller' | 'landlord')[]): Promise<void> {
    const current = await this.load();
    const updated = {
      marketTracking: {
        ...current.marketTracking,
        targetClientTypes: types,
      },
    };
    await this.save(updated as Partial<AgentData>);
  }
  
  /**
   * Save pricing insight
   */
  async savePricingInsight(location: string, avgCommission: number, dealCount: number): Promise<void> {
    const current = await this.load();
    const existing = current.marketTracking.pricingInsights.findIndex(i => i.location === location);
    
    let insights;
    if (existing >= 0) {
      insights = current.marketTracking.pricingInsights.map((i, idx) =>
        idx === existing ? { location, avgCommission, dealCount } : i
      );
    } else {
      insights = [...current.marketTracking.pricingInsights, { location, avgCommission, dealCount }];
    }
    
    const updated = {
      marketTracking: {
        ...current.marketTracking,
        pricingInsights: insights,
      },
    };
    await this.save(updated as Partial<AgentData>);
  }
}
