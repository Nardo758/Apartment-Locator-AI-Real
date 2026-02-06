import { db } from "./db";
import { eq, desc, and, gte, lte, ilike, or, sql, inArray } from "drizzle-orm";
import {
  properties,
  savedApartments,
  searchHistory,
  userPreferences,
  marketSnapshots,
  userPois,
  competitionSets,
  competitionSetCompetitors,
  pricingAlerts,
  alertPreferences,
  agentClients,
  clientActivity,
  deals,
  dealNotes,
  agentLeads,
  submarkets,
  apiKeys,
  renterProfiles,
  type Property,
  type SavedApartment,
  type SearchHistory,
  type UserPreferences,
  type MarketSnapshot,
  type UserPoi,
  type CompetitionSet,
  type CompetitionSetCompetitor,
  type PricingAlert,
  type AlertPreferences,
  type AgentClient,
  type ClientActivity,
  type Deal,
  type DealNote,
  type AgentLead,
  type Submarket,
  type ApiKey,
  type RenterProfile,
  type InsertProperty,
  type InsertSavedApartment,
  type InsertSearchHistory,
  type InsertUserPreferences,
  type InsertMarketSnapshot,
  type InsertUserPoi,
  type InsertCompetitionSet,
  type InsertCompetitionSetCompetitor,
  type InsertPricingAlert,
  type InsertAlertPreferences,
  type InsertAgentClient,
  type InsertClientActivity,
  type InsertDeal,
  type InsertDealNote,
  type InsertAgentLead,
  type InsertApiKey,
  type InsertRenterProfile,
} from "@shared/schema";

export interface IStorage {
  getProperties(filters?: {
    city?: string;
    state?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    limit?: number;
  }): Promise<Property[]>;
  getPropertyById(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, property: Partial<InsertProperty>): Promise<Property | undefined>;
  
  getSavedApartments(userId: string): Promise<SavedApartment[]>;
  saveApartment(data: InsertSavedApartment): Promise<SavedApartment>;
  removeSavedApartment(userId: string, apartmentId: string): Promise<void>;
  
  getSearchHistory(userId: string, limit?: number): Promise<SearchHistory[]>;
  addSearchHistory(data: InsertSearchHistory): Promise<SearchHistory>;
  
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  upsertUserPreferences(data: InsertUserPreferences): Promise<UserPreferences>;
  
  getMarketSnapshots(city: string, state: string, limit?: number): Promise<MarketSnapshot[]>;
  createMarketSnapshot(data: InsertMarketSnapshot): Promise<MarketSnapshot>;
  
  getUserPois(userId: string): Promise<UserPoi[]>;
  createUserPoi(data: InsertUserPoi): Promise<UserPoi>;
  deleteUserPoi(userId: string, poiId: string): Promise<void>;
  
  // Landlord Portfolio Management
  getLandlordProperties(landlordId: string, filters?: {
    city?: string;
    occupancyStatus?: string;
    sortBy?: 'daysVacant' | 'targetRent' | 'name' | 'city';
    limit?: number;
  }): Promise<Property[]>;
  getLandlordPropertyById(landlordId: string, propertyId: string): Promise<Property | undefined>;
  createLandlordProperty(property: InsertProperty): Promise<Property>;
  updateLandlordProperty(landlordId: string, propertyId: string, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteLandlordProperty(landlordId: string, propertyId: string): Promise<void>;
  getPortfolioSummary(landlordId: string): Promise<{
    totalProperties: number;
    occupiedUnits: number;
    vacantUnits: number;
    occupancyRate: number;
    totalRevenue: number;
    potentialRevenue: number;
    revenueChange: number;
    averageRent: number;
    atRiskCount: number;
    revenueEfficiency: number;
    avgDaysVacant: number;
    totalSquareFeet: number;
    avgRentPerSqFt: number;
  }>;
  
  // Lease Intelligence
  getLeaseIntelligence(landlordId: string, propertyIds: string[]): Promise<{
    propertyId: string;
    expiringNext30Days: number;
    expiringNext90Days: number;
    avgCurrentLease: number;
    marketRate: number;
    renewalRate: number;
    rolloverRiskScore: number;
  }[]>;

  getRenterLeaseIntelligence(propertyIds: string[]): Promise<{
    propertyId: string;
    expiringNext30Days: number;
    expiringNext90Days: number;
    avgCurrentLease: number;
    marketRate: number;
    renewalRate: number;
    rolloverRiskScore: number;
    totalUnits: number;
  }[]>;

  // Competition Sets
  getCompetitionSets(userId: string, options?: { limit?: number; offset?: number }): Promise<{ sets: (CompetitionSet & { competitorCount: number })[]; total: number }>;
  getCompetitionSetById(id: string, userId: string): Promise<CompetitionSet | undefined>;
  createCompetitionSet(data: InsertCompetitionSet): Promise<CompetitionSet>;
  updateCompetitionSet(id: string, userId: string, data: Partial<InsertCompetitionSet>): Promise<CompetitionSet | undefined>;
  deleteCompetitionSet(id: string, userId: string): Promise<void>;
  
  // Competition Set Competitors
  getCompetitorsForSet(setId: string): Promise<CompetitionSetCompetitor[]>;
  addCompetitorToSet(data: InsertCompetitionSetCompetitor): Promise<CompetitionSetCompetitor>;
  removeCompetitorFromSet(setId: string, competitorId: string, userId: string): Promise<void>;
  
  // Pricing Alerts
  getAlerts(userId: string, options?: { unreadOnly?: boolean; type?: string; severity?: string; limit?: number; offset?: number }): Promise<{ alerts: PricingAlert[]; total: number; unreadCount: number }>;
  getAlertById(id: string, userId: string): Promise<PricingAlert | undefined>;
  createAlert(data: InsertPricingAlert): Promise<PricingAlert>;
  markAlertAsRead(id: string, userId: string): Promise<PricingAlert | undefined>;
  deleteAlert(id: string, userId: string): Promise<void>;
  
  // Alert Preferences
  getAlertPreferences(userId: string): Promise<AlertPreferences | undefined>;
  upsertAlertPreferences(data: InsertAlertPreferences): Promise<AlertPreferences>;
  
  // Agent Lead Management
  getLeads(agentId: string, options?: {
    status?: string;
    leadSource?: string;
    search?: string;
    minScore?: number;
    maxScore?: number;
    tags?: string[];
    sortBy?: 'leadScore' | 'createdAt' | 'lastContactedAt' | 'nextFollowUpAt';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<{ leads: AgentLead[]; total: number }>;
  getLeadById(id: string, agentId: string): Promise<AgentLead | undefined>;
  createLead(data: InsertAgentLead): Promise<AgentLead>;
  updateLead(id: string, agentId: string, data: Partial<InsertAgentLead>): Promise<AgentLead | undefined>;
  convertLeadToClient(leadId: string, agentId: string): Promise<{ lead: AgentLead; client: AgentClient }>;
  deleteLead(id: string, agentId: string): Promise<void>;
  getLeadSources(agentId: string): Promise<Array<{ source: string; count: number; avgScore: number; conversionRate: number }>>;
  
  // Agent Client Management
  getClients(agentId: string, options?: { 
    status?: string; 
    stage?: string; 
    search?: string;
    sortBy?: 'name' | 'createdAt' | 'lastContact' | 'priority';
    sortOrder?: 'asc' | 'desc';
    limit?: number; 
    offset?: number;
  }): Promise<{ clients: AgentClient[]; total: number }>;
  getClientById(id: string, agentId: string): Promise<AgentClient | undefined>;
  createClient(data: InsertAgentClient): Promise<AgentClient>;
  updateClient(id: string, agentId: string, data: Partial<InsertAgentClient>): Promise<AgentClient | undefined>;
  archiveClient(id: string, agentId: string): Promise<AgentClient | undefined>;
  deleteClient(id: string, agentId: string): Promise<void>;
  
  // Client Activity
  getClientActivity(clientId: string, agentId: string, options?: { limit?: number; offset?: number }): Promise<{ activities: ClientActivity[]; total: number }>;
  createClientActivity(data: InsertClientActivity): Promise<ClientActivity>;
  
  // Agent Dashboard Summary
  getAgentDashboardSummary(agentId: string): Promise<{
    totalClients: number;
    activeClients: number;
    clientsByStage: Record<string, number>;
    clientsByPriority: Record<string, number>;
    recentActivities: ClientActivity[];
    upcomingFollowUps: AgentClient[];
  }>;
  
  // Agent Deal Pipeline
  getDeals(agentId: string, options?: { status?: string; stage?: string; clientId?: string; limit?: number; offset?: number }): Promise<{ deals: Deal[]; total: number }>;
  getDealById(id: string, agentId: string): Promise<Deal | undefined>;
  createDeal(data: InsertDeal): Promise<Deal>;
  updateDeal(id: string, agentId: string, data: Partial<InsertDeal>): Promise<Deal | undefined>;
  archiveDeal(id: string, agentId: string): Promise<Deal | undefined>;
  deleteDeal(id: string, agentId: string): Promise<void>;
  
  // Deal Notes
  getDealNotes(dealId: string, agentId: string): Promise<DealNote[]>;
  createDealNote(data: InsertDealNote): Promise<DealNote>;
  updateDealNote(id: string, userId: string, note: string): Promise<DealNote | undefined>;
  deleteDealNote(id: string, userId: string): Promise<void>;
  
  // Renter Profile
  getRenterProfile(userId: string): Promise<RenterProfile | undefined>;
  upsertRenterProfile(data: InsertRenterProfile): Promise<RenterProfile>;

  // JEDI API - Market Intelligence
  getPropertiesByCity(city: string, submarket?: string): Promise<Property[]>;
  getSubmarketsByCity(city: string): Promise<Submarket[]>;
  
  // JEDI API - API Keys
  getApiKeyByHash(keyHash: string): Promise<ApiKey | undefined>;
  createApiKey(data: InsertApiKey): Promise<ApiKey>;
  updateApiKeyUsage(keyId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getProperties(filters?: {
    city?: string;
    state?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    limit?: number;
  }): Promise<Property[]> {
    let query = db.select().from(properties).where(eq(properties.isActive, true));
    
    const conditions = [eq(properties.isActive, true)];
    
    if (filters?.city) {
      conditions.push(ilike(properties.city, `%${filters.city}%`));
    }
    if (filters?.state) {
      conditions.push(eq(properties.state, filters.state));
    }
    if (filters?.minPrice) {
      conditions.push(gte(properties.minPrice, filters.minPrice));
    }
    if (filters?.maxPrice) {
      conditions.push(lte(properties.maxPrice, filters.maxPrice));
    }
    if (filters?.bedrooms) {
      conditions.push(gte(properties.bedroomsMin, filters.bedrooms));
    }
    
    const results = await db.select()
      .from(properties)
      .where(and(...conditions))
      .orderBy(desc(properties.lastSeen))
      .limit(filters?.limit || 50);
    
    return results;
  }

  async getPropertyById(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [created] = await db.insert(properties).values(property).returning();
    return created;
  }

  async updateProperty(id: string, property: Partial<InsertProperty>): Promise<Property | undefined> {
    const [updated] = await db.update(properties)
      .set({ ...property, lastUpdated: new Date() })
      .where(eq(properties.id, id))
      .returning();
    return updated;
  }

  // Landlord Portfolio Management Methods
  async getLandlordProperties(landlordId: string, filters?: {
    city?: string;
    occupancyStatus?: string;
    sortBy?: 'daysVacant' | 'targetRent' | 'name' | 'city';
    limit?: number;
  }): Promise<Property[]> {
    const conditions = [
      eq(properties.landlordId, landlordId),
      eq(properties.isLandlordOwned, true)
    ];
    
    if (filters?.city) {
      conditions.push(ilike(properties.city, `%${filters.city}%`));
    }
    
    if (filters?.occupancyStatus) {
      conditions.push(eq(properties.occupancyStatus, filters.occupancyStatus));
    }
    
    let query = db.select()
      .from(properties)
      .where(and(...conditions));
    
    // Apply sorting
    if (filters?.sortBy === 'daysVacant') {
      query = query.orderBy(desc(properties.daysVacant));
    } else if (filters?.sortBy === 'targetRent') {
      query = query.orderBy(desc(properties.targetRent));
    } else if (filters?.sortBy === 'city') {
      query = query.orderBy(properties.city);
    } else {
      query = query.orderBy(properties.name);
    }
    
    query = query.limit(filters?.limit || 50);
    
    return await query;
  }

  async getLandlordPropertyById(landlordId: string, propertyId: string): Promise<Property | undefined> {
    const [property] = await db.select()
      .from(properties)
      .where(and(
        eq(properties.id, propertyId),
        eq(properties.landlordId, landlordId),
        eq(properties.isLandlordOwned, true)
      ));
    return property;
  }

  async createLandlordProperty(property: InsertProperty): Promise<Property> {
    const [created] = await db.insert(properties)
      .values({
        ...property,
        isLandlordOwned: true,
        isActive: true,
      })
      .returning();
    return created;
  }

  async updateLandlordProperty(
    landlordId: string, 
    propertyId: string, 
    property: Partial<InsertProperty>
  ): Promise<Property | undefined> {
    const [updated] = await db.update(properties)
      .set({ ...property, lastUpdated: new Date() })
      .where(and(
        eq(properties.id, propertyId),
        eq(properties.landlordId, landlordId),
        eq(properties.isLandlordOwned, true)
      ))
      .returning();
    return updated;
  }

  async deleteLandlordProperty(landlordId: string, propertyId: string): Promise<void> {
    await db.delete(properties)
      .where(and(
        eq(properties.id, propertyId),
        eq(properties.landlordId, landlordId),
        eq(properties.isLandlordOwned, true)
      ));
  }

  async getPortfolioSummary(landlordId: string): Promise<{
    totalProperties: number;
    occupied: number;
    vacant: number;
    occupancyRate: number;
    totalMonthlyRevenue: number;
    potentialMonthlyRevenue: number;
    revenueEfficiency: number;
    avgDaysVacant: number;
    totalSquareFeet: number;
    avgRentPerSqFt: number;
  }> {
    const result = await db.select({
      totalProperties: sql<number>`COUNT(*)::int`,
      occupied: sql<number>`COUNT(*) FILTER (WHERE ${properties.occupancyStatus} = 'occupied')::int`,
      vacant: sql<number>`COUNT(*) FILTER (WHERE ${properties.occupancyStatus} = 'vacant')::int`,
      totalMonthlyRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${properties.occupancyStatus} = 'occupied' THEN ${properties.actualRent} ELSE 0 END), 0)::numeric`,
      potentialMonthlyRevenue: sql<number>`COALESCE(SUM(${properties.targetRent}), 0)::numeric`,
      avgDaysVacant: sql<number>`COALESCE(AVG(${properties.daysVacant}) FILTER (WHERE ${properties.occupancyStatus} = 'vacant'), 0)::numeric`,
      totalSquareFeet: sql<number>`COALESCE(SUM(${properties.squareFeetMin}), 0)::int`,
    })
    .from(properties)
    .where(and(
      eq(properties.landlordId, landlordId),
      eq(properties.isLandlordOwned, true)
    ));
    
    const stats = result[0];
    const totalProperties = stats.totalProperties || 0;
    const occupied = stats.occupied || 0;
    const vacant = stats.vacant || 0;
    const totalMonthlyRevenue = Number(stats.totalMonthlyRevenue) || 0;
    const potentialMonthlyRevenue = Number(stats.potentialMonthlyRevenue) || 0;
    const avgDaysVacant = Number(stats.avgDaysVacant) || 0;
    const totalSquareFeet = stats.totalSquareFeet || 0;
    
    const occupancyRate = totalProperties > 0 
      ? (occupied / totalProperties) * 100 
      : 0;
    
    const revenueEfficiency = potentialMonthlyRevenue > 0
      ? (totalMonthlyRevenue / potentialMonthlyRevenue) * 100
      : 0;
    
    const avgRentPerSqFt = totalSquareFeet > 0 && totalMonthlyRevenue > 0
      ? totalMonthlyRevenue / totalSquareFeet
      : 0;
    
    const averageRent = occupied > 0 && totalMonthlyRevenue > 0
      ? totalMonthlyRevenue / occupied
      : 0;
    
    return {
      totalProperties,
      occupiedUnits: occupied,
      vacantUnits: vacant,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      totalRevenue: Math.round(totalMonthlyRevenue * 100) / 100,
      potentialRevenue: Math.round(potentialMonthlyRevenue * 100) / 100,
      revenueChange: 0,
      averageRent: Math.round(averageRent * 100) / 100,
      atRiskCount: vacant,
      revenueEfficiency: Math.round(revenueEfficiency * 100) / 100,
      avgDaysVacant: Math.round(avgDaysVacant * 100) / 100,
      totalSquareFeet,
      avgRentPerSqFt: Math.round(avgRentPerSqFt * 100) / 100,
    };
  }

  async getLeaseIntelligence(landlordId: string, propertyIds: string[]) {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const conditions = [
      eq(properties.landlordId, landlordId),
      eq(properties.isLandlordOwned, true),
    ];
    if (propertyIds.length > 0) {
      conditions.push(inArray(properties.id, propertyIds));
    }

    const props = await db.select()
      .from(properties)
      .where(and(...conditions));

    const grouped = new Map<string, typeof props>();
    for (const p of props) {
      const key = p.id;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(p);
    }

    const results: {
      propertyId: string;
      expiringNext30Days: number;
      expiringNext90Days: number;
      avgCurrentLease: number;
      marketRate: number;
      renewalRate: number;
      rolloverRiskScore: number;
    }[] = [];

    for (const [propertyId, units] of grouped) {
      let expiring30 = 0;
      let expiring90 = 0;
      let totalRent = 0;
      let rentCount = 0;
      let totalMarket = 0;
      let marketCount = 0;
      let occupiedCount = 0;
      let totalRiskScore = 0;
      let riskScoreCount = 0;

      for (const u of units) {
        if (u.leaseEndDate) {
          const end = new Date(u.leaseEndDate);
          if (end <= in30Days && end >= now) expiring30++;
          if (end <= in90Days && end >= now) expiring90++;
        }

        if (u.actualRent) {
          totalRent += Number(u.actualRent);
          rentCount++;
        }

        if (u.marketRent) {
          totalMarket += Number(u.marketRent);
          marketCount++;
        } else if (u.targetRent) {
          totalMarket += Number(u.targetRent);
          marketCount++;
        }

        if (u.occupancyStatus === 'occupied') {
          occupiedCount++;
        }

        if (u.retentionRiskScore !== null && u.retentionRiskScore !== undefined) {
          totalRiskScore += Number(u.retentionRiskScore);
          riskScoreCount++;
        }
      }

      const totalUnits = units.length;
      const renewalRate = totalUnits > 0 ? (occupiedCount / totalUnits) * 100 : 0;
      const avgRiskScore = riskScoreCount > 0 ? totalRiskScore / riskScoreCount : 0;

      results.push({
        propertyId,
        expiringNext30Days: expiring30,
        expiringNext90Days: expiring90,
        avgCurrentLease: rentCount > 0 ? Math.round((totalRent / rentCount) * 100) / 100 : 0,
        marketRate: marketCount > 0 ? Math.round((totalMarket / marketCount) * 100) / 100 : 0,
        renewalRate: Math.round(renewalRate * 100) / 100,
        rolloverRiskScore: Math.round(avgRiskScore * 100) / 100,
      });
    }

    return results;
  }

  async getRenterLeaseIntelligence(propertyIds: string[]) {
    if (propertyIds.length === 0) return [];

    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const props = await db.select()
      .from(properties)
      .where(inArray(properties.id, propertyIds));

    const grouped = new Map<string, typeof props>();
    for (const p of props) {
      const key = p.id;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(p);
    }

    const results: {
      propertyId: string;
      expiringNext30Days: number;
      expiringNext90Days: number;
      avgCurrentLease: number;
      marketRate: number;
      renewalRate: number;
      rolloverRiskScore: number;
      totalUnits: number;
    }[] = [];

    for (const [propertyId, units] of grouped) {
      let expiring30 = 0;
      let expiring90 = 0;
      let totalRent = 0;
      let rentCount = 0;
      let totalMarket = 0;
      let marketCount = 0;
      let occupiedCount = 0;
      let totalRiskScore = 0;
      let riskScoreCount = 0;

      for (const u of units) {
        if (u.leaseEndDate) {
          const end = new Date(u.leaseEndDate);
          if (end <= in30Days && end >= now) expiring30++;
          if (end <= in90Days && end >= now) expiring90++;
        }

        if (u.actualRent) {
          totalRent += Number(u.actualRent);
          rentCount++;
        }

        if (u.marketRent) {
          totalMarket += Number(u.marketRent);
          marketCount++;
        } else if (u.targetRent) {
          totalMarket += Number(u.targetRent);
          marketCount++;
        }

        if (u.occupancyStatus === 'occupied') {
          occupiedCount++;
        }

        if (u.retentionRiskScore !== null && u.retentionRiskScore !== undefined) {
          totalRiskScore += Number(u.retentionRiskScore);
          riskScoreCount++;
        }
      }

      const totalUnits = units.length;
      const renewalRate = totalUnits > 0 ? (occupiedCount / totalUnits) * 100 : 0;
      const avgRiskScore = riskScoreCount > 0 ? totalRiskScore / riskScoreCount : 0;

      results.push({
        propertyId,
        expiringNext30Days: expiring30,
        expiringNext90Days: expiring90,
        avgCurrentLease: rentCount > 0 ? Math.round((totalRent / rentCount) * 100) / 100 : 0,
        marketRate: marketCount > 0 ? Math.round((totalMarket / marketCount) * 100) / 100 : 0,
        renewalRate: Math.round(renewalRate * 100) / 100,
        rolloverRiskScore: Math.round(avgRiskScore * 100) / 100,
        totalUnits,
      });
    }

    return results;
  }

  async getSavedApartments(userId: string): Promise<SavedApartment[]> {
    return db.select()
      .from(savedApartments)
      .where(eq(savedApartments.userId, userId))
      .orderBy(desc(savedApartments.createdAt));
  }

  async saveApartment(data: InsertSavedApartment): Promise<SavedApartment> {
    const [saved] = await db.insert(savedApartments).values(data).returning();
    return saved;
  }

  async removeSavedApartment(userId: string, apartmentId: string): Promise<void> {
    await db.delete(savedApartments)
      .where(and(
        eq(savedApartments.userId, userId),
        eq(savedApartments.apartmentId, apartmentId)
      ));
  }

  async getSearchHistory(userId: string, limit = 20): Promise<SearchHistory[]> {
    return db.select()
      .from(searchHistory)
      .where(eq(searchHistory.userId, userId))
      .orderBy(desc(searchHistory.createdAt))
      .limit(limit);
  }

  async addSearchHistory(data: InsertSearchHistory): Promise<SearchHistory> {
    const [created] = await db.insert(searchHistory).values(data).returning();
    return created;
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [prefs] = await db.select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return prefs;
  }

  async upsertUserPreferences(data: InsertUserPreferences): Promise<UserPreferences> {
    const existing = await this.getUserPreferences(data.userId);
    if (existing) {
      const [updated] = await db.update(userPreferences)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userPreferences.userId, data.userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(userPreferences).values(data).returning();
    return created;
  }

  async getMarketSnapshots(city: string, state: string, limit = 30): Promise<MarketSnapshot[]> {
    return db.select()
      .from(marketSnapshots)
      .where(and(
        ilike(marketSnapshots.city, city),
        eq(marketSnapshots.state, state)
      ))
      .orderBy(desc(marketSnapshots.snapshotDate))
      .limit(limit);
  }

  async createMarketSnapshot(data: InsertMarketSnapshot): Promise<MarketSnapshot> {
    const [created] = await db.insert(marketSnapshots).values(data).returning();
    return created;
  }

  async getUserPois(userId: string): Promise<UserPoi[]> {
    return db.select()
      .from(userPois)
      .where(eq(userPois.userId, userId))
      .orderBy(desc(userPois.priority));
  }

  async createUserPoi(data: InsertUserPoi): Promise<UserPoi> {
    const [created] = await db.insert(userPois).values(data).returning();
    return created;
  }

  async deleteUserPoi(userId: string, poiId: string): Promise<void> {
    await db.delete(userPois)
      .where(and(
        eq(userPois.userId, userId),
        eq(userPois.id, poiId)
      ));
  }

  // Competition Sets Methods
  async getCompetitionSets(userId: string, options?: { limit?: number; offset?: number }): Promise<{ sets: (CompetitionSet & { competitorCount: number })[]; total: number }> {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    // Get total count
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` })
      .from(competitionSets)
      .where(eq(competitionSets.userId, userId));

    // Get sets with competitor count
    const sets = await db.select({
      id: competitionSets.id,
      userId: competitionSets.userId,
      name: competitionSets.name,
      description: competitionSets.description,
      ownPropertyIds: competitionSets.ownPropertyIds,
      alertsEnabled: competitionSets.alertsEnabled,
      createdAt: competitionSets.createdAt,
      updatedAt: competitionSets.updatedAt,
      competitorCount: sql<number>`(
        SELECT COUNT(*)::int 
        FROM ${competitionSetCompetitors} 
        WHERE ${competitionSetCompetitors.setId} = ${competitionSets.id}
      )`,
    })
    .from(competitionSets)
    .where(eq(competitionSets.userId, userId))
    .orderBy(desc(competitionSets.updatedAt))
    .limit(limit)
    .offset(offset);

    return { sets, total: count };
  }

  async getCompetitionSetById(id: string, userId: string): Promise<CompetitionSet | undefined> {
    const [set] = await db.select()
      .from(competitionSets)
      .where(and(
        eq(competitionSets.id, id),
        eq(competitionSets.userId, userId)
      ));
    return set;
  }

  async createCompetitionSet(data: InsertCompetitionSet): Promise<CompetitionSet> {
    const [created] = await db.insert(competitionSets).values(data).returning();
    return created;
  }

  async updateCompetitionSet(id: string, userId: string, data: Partial<InsertCompetitionSet>): Promise<CompetitionSet | undefined> {
    const [updated] = await db.update(competitionSets)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(competitionSets.id, id),
        eq(competitionSets.userId, userId)
      ))
      .returning();
    return updated;
  }

  async deleteCompetitionSet(id: string, userId: string): Promise<void> {
    await db.delete(competitionSets)
      .where(and(
        eq(competitionSets.id, id),
        eq(competitionSets.userId, userId)
      ));
  }

  async getCompetitorsForSet(setId: string): Promise<CompetitionSetCompetitor[]> {
    return db.select()
      .from(competitionSetCompetitors)
      .where(eq(competitionSetCompetitors.setId, setId))
      .orderBy(desc(competitionSetCompetitors.createdAt));
  }

  async addCompetitorToSet(data: InsertCompetitionSetCompetitor): Promise<CompetitionSetCompetitor> {
    const [created] = await db.insert(competitionSetCompetitors).values(data).returning();
    return created;
  }

  async removeCompetitorFromSet(setId: string, competitorId: string, userId: string): Promise<void> {
    // First verify the set belongs to the user
    const set = await this.getCompetitionSetById(setId, userId);
    if (!set) {
      throw new Error("Competition set not found or access denied");
    }
    
    await db.delete(competitionSetCompetitors)
      .where(and(
        eq(competitionSetCompetitors.setId, setId),
        eq(competitionSetCompetitors.id, competitorId)
      ));
  }

  // Pricing Alerts Methods
  async getAlerts(userId: string, options?: { unreadOnly?: boolean; type?: string; severity?: string; limit?: number; offset?: number }): Promise<{ alerts: PricingAlert[]; total: number; unreadCount: number }> {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    
    const conditions = [eq(pricingAlerts.userId, userId)];
    
    if (options?.unreadOnly) {
      conditions.push(eq(pricingAlerts.isRead, false));
    }
    if (options?.type) {
      conditions.push(eq(pricingAlerts.alertType, options.type));
    }
    if (options?.severity) {
      conditions.push(eq(pricingAlerts.severity, options.severity));
    }
    
    const alerts = await db.select()
      .from(pricingAlerts)
      .where(and(...conditions))
      .orderBy(desc(pricingAlerts.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` })
      .from(pricingAlerts)
      .where(and(...conditions));

    const [{ unreadCount }] = await db.select({ unreadCount: sql<number>`count(*)::int` })
      .from(pricingAlerts)
      .where(and(eq(pricingAlerts.userId, userId), eq(pricingAlerts.isRead, false)));

    return { alerts, total: count, unreadCount };
  }

  async getAlertById(id: string, userId: string): Promise<PricingAlert | undefined> {
    const [alert] = await db.select()
      .from(pricingAlerts)
      .where(and(eq(pricingAlerts.id, id), eq(pricingAlerts.userId, userId)));
    return alert;
  }

  async createAlert(data: InsertPricingAlert): Promise<PricingAlert> {
    const [created] = await db.insert(pricingAlerts).values(data).returning();
    return created;
  }

  async markAlertAsRead(id: string, userId: string): Promise<PricingAlert | undefined> {
    const [updated] = await db.update(pricingAlerts)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(pricingAlerts.id, id), eq(pricingAlerts.userId, userId)))
      .returning();
    return updated;
  }

  async deleteAlert(id: string, userId: string): Promise<void> {
    await db.delete(pricingAlerts)
      .where(and(eq(pricingAlerts.id, id), eq(pricingAlerts.userId, userId)));
  }

  // Alert Preferences Methods
  async getAlertPreferences(userId: string): Promise<AlertPreferences | undefined> {
    const [prefs] = await db.select()
      .from(alertPreferences)
      .where(eq(alertPreferences.userId, userId));
    return prefs;
  }

  async upsertAlertPreferences(data: InsertAlertPreferences): Promise<AlertPreferences> {
    const existing = await this.getAlertPreferences(data.userId);
    if (existing) {
      const [updated] = await db.update(alertPreferences)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(alertPreferences.userId, data.userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(alertPreferences).values(data).returning();
    return created;
  }

  // Agent Lead Management Methods
  async getLeads(agentId: string, options?: {
    status?: string;
    leadSource?: string;
    search?: string;
    minScore?: number;
    maxScore?: number;
    tags?: string[];
    sortBy?: 'leadScore' | 'createdAt' | 'lastContactedAt' | 'nextFollowUpAt';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<{ leads: AgentLead[]; total: number }> {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    
    const conditions = [eq(agentLeads.agentId, agentId)];
    
    if (options?.status) {
      conditions.push(eq(agentLeads.status, options.status));
    }
    if (options?.leadSource) {
      conditions.push(eq(agentLeads.leadSource, options.leadSource));
    }
    if (options?.minScore !== undefined) {
      conditions.push(gte(agentLeads.leadScore, options.minScore));
    }
    if (options?.maxScore !== undefined) {
      conditions.push(lte(agentLeads.leadScore, options.maxScore));
    }
    if (options?.search) {
      const searchTerm = `%${options.search}%`;
      conditions.push(
        or(
          ilike(agentLeads.firstName, searchTerm),
          ilike(agentLeads.lastName, searchTerm),
          ilike(agentLeads.email, searchTerm)
        )!
      );
    }
    
    const orderByField = options?.sortBy || 'createdAt';
    const orderByDirection = options?.sortOrder === 'asc' ? sql`ASC` : sql`DESC`;
    
    const leadsList = await db.select()
      .from(agentLeads)
      .where(and(...conditions))
      .orderBy(sql`${agentLeads[orderByField]} ${orderByDirection}`)
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` })
      .from(agentLeads)
      .where(and(...conditions));

    return { leads: leadsList, total: count };
  }

  async getLeadById(id: string, agentId: string): Promise<AgentLead | undefined> {
    const [lead] = await db.select()
      .from(agentLeads)
      .where(and(eq(agentLeads.id, id), eq(agentLeads.agentId, agentId)));
    return lead;
  }

  async createLead(data: InsertAgentLead): Promise<AgentLead> {
    // Calculate initial lead score
    const leadScore = this.calculateLeadScore(data);
    
    const [created] = await db.insert(agentLeads)
      .values({
        ...data,
        leadScore,
      })
      .returning();
    
    return created;
  }

  async updateLead(id: string, agentId: string, data: Partial<InsertAgentLead>): Promise<AgentLead | undefined> {
    // Recalculate lead score if relevant fields changed
    let updateData = { ...data, updatedAt: new Date() };
    
    const existing = await this.getLeadById(id, agentId);
    if (!existing) return undefined;
    
    const merged = { ...existing, ...data };
    const newScore = this.calculateLeadScore(merged as any);
    if (newScore !== existing.leadScore) {
      updateData = { ...updateData, leadScore: newScore };
    }
    
    const [updated] = await db.update(agentLeads)
      .set(updateData)
      .where(and(eq(agentLeads.id, id), eq(agentLeads.agentId, agentId)))
      .returning();
    
    return updated;
  }

  async convertLeadToClient(leadId: string, agentId: string): Promise<{ lead: AgentLead; client: AgentClient }> {
    const lead = await this.getLeadById(leadId, agentId);
    if (!lead) {
      throw new Error("Lead not found");
    }
    
    // Create client from lead
    const clientData: InsertAgentClient = {
      agentId: lead.agentId,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone || undefined,
      status: 'active',
      stage: 'viewing',
      source: lead.leadSource,
      budget: {
        min: lead.budgetMin || undefined,
        max: lead.budgetMax || undefined,
      },
      preferredLocations: lead.preferredLocations || [],
      bedrooms: lead.bedrooms || undefined,
      bathrooms: lead.bathrooms || undefined,
      moveInDate: lead.moveInDate || undefined,
      notes: lead.notes || undefined,
      tags: lead.tags || [],
    };
    
    const [client] = await db.insert(agentClients)
      .values(clientData)
      .returning();
    
    // Update lead to mark as converted
    const [updatedLead] = await db.update(agentLeads)
      .set({
        status: 'converted',
        convertedToClientAt: new Date(),
        convertedClientId: client.id,
        updatedAt: new Date(),
      })
      .where(and(eq(agentLeads.id, leadId), eq(agentLeads.agentId, agentId)))
      .returning();
    
    return { lead: updatedLead, client };
  }

  async deleteLead(id: string, agentId: string): Promise<void> {
    await db.delete(agentLeads)
      .where(and(eq(agentLeads.id, id), eq(agentLeads.agentId, agentId)));
  }

  async getLeadSources(agentId: string): Promise<Array<{ source: string; count: number; avgScore: number; conversionRate: number }>> {
    const result = await db.select({
      source: agentLeads.leadSource,
      count: sql<number>`count(*)::int`,
      avgScore: sql<number>`COALESCE(avg(${agentLeads.leadScore}), 0)::int`,
      converted: sql<number>`count(CASE WHEN ${agentLeads.status} = 'converted' THEN 1 END)::int`,
    })
    .from(agentLeads)
    .where(eq(agentLeads.agentId, agentId))
    .groupBy(agentLeads.leadSource);
    
    return result.map(r => ({
      source: r.source || 'unknown',
      count: r.count,
      avgScore: r.avgScore,
      conversionRate: r.count > 0 ? Math.round((r.converted / r.count) * 100) : 0,
    }));
  }

  private calculateLeadScore(lead: Partial<InsertAgentLead>): number {
    let score = 0;
    const factors: any = {};
    
    // Budget factor (0-25 points)
    if (lead.budgetMin && lead.budgetMax) {
      const budgetRange = lead.budgetMax - lead.budgetMin;
      if (budgetRange < 500 && lead.budgetMin > 0) {
        // Specific budget = higher intent
        factors.budget = 25;
      } else if (lead.budgetMin > 0) {
        factors.budget = 15;
      }
    }
    
    // Timeline factor (0-20 points)
    switch (lead.timeline) {
      case 'immediate':
        factors.timeline = 20;
        break;
      case '1-3months':
        factors.timeline = 15;
        break;
      case '3-6months':
        factors.timeline = 10;
        break;
      case '6+months':
        factors.timeline = 5;
        break;
    }
    
    // Engagement factor (0-20 points)
    const totalInteractions = lead.totalInteractions || 0;
    const emailsOpened = lead.emailsOpened || 0;
    const propertiesViewed = lead.propertiesViewed || 0;
    
    factors.engagement = Math.min(20, 
      (totalInteractions * 2) + 
      (emailsOpened * 1) + 
      (propertiesViewed * 3)
    );
    
    // Motivation factor (0-20 points)
    if (lead.tourScheduled) {
      factors.motivation = 20;
    } else if (lead.nextFollowUpAt) {
      factors.motivation = 10;
    } else {
      factors.motivation = 5;
    }
    
    // Response rate factor (0-15 points)
    const emailsSent = lead.emailsSent || 0;
    if (emailsSent > 0) {
      const responseRate = emailsOpened / emailsSent;
      factors.responseRate = Math.round(responseRate * 15);
    }
    
    // Sum all factors
    score = Object.values(factors).reduce((sum: number, val: any) => sum + (val || 0), 0);
    
    // Cap at 100
    return Math.min(100, score);
  }

  // Agent Deal Pipeline Methods
  async getDeals(agentId: string, options?: { status?: string; stage?: string; clientId?: string; limit?: number; offset?: number }): Promise<{ deals: Deal[]; total: number }> {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    
    const conditions = [eq(deals.agentId, agentId)];
    
    if (options?.status) {
      conditions.push(eq(deals.status, options.status));
    }
    if (options?.stage) {
      conditions.push(eq(deals.stage, options.stage));
    }
    if (options?.clientId) {
      conditions.push(eq(deals.clientId, options.clientId));
    }
    
    const dealsList = await db.select()
      .from(deals)
      .where(and(...conditions))
      .orderBy(desc(deals.updatedAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` })
      .from(deals)
      .where(and(...conditions));

    return { deals: dealsList, total: count };
  }

  async getDealById(id: string, agentId: string): Promise<Deal | undefined> {
    const [deal] = await db.select()
      .from(deals)
      .where(and(eq(deals.id, id), eq(deals.agentId, agentId)));
    return deal;
  }

  async createDeal(data: InsertDeal): Promise<Deal> {
    const [created] = await db.insert(deals).values(data).returning();
    return created;
  }

  async updateDeal(id: string, agentId: string, data: Partial<InsertDeal>): Promise<Deal | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    
    // If stage is being updated, update stageChangedAt
    if (data.stage) {
      updateData.stageChangedAt = new Date();
    }
    
    const [updated] = await db.update(deals)
      .set(updateData)
      .where(and(eq(deals.id, id), eq(deals.agentId, agentId)))
      .returning();
    return updated;
  }

  async archiveDeal(id: string, agentId: string): Promise<Deal | undefined> {
    const [updated] = await db.update(deals)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(and(eq(deals.id, id), eq(deals.agentId, agentId)))
      .returning();
    return updated;
  }

  async deleteDeal(id: string, agentId: string): Promise<void> {
    await db.delete(deals)
      .where(and(eq(deals.id, id), eq(deals.agentId, agentId)));
  }

  // Deal Notes Methods
  async getDealNotes(dealId: string, agentId: string): Promise<DealNote[]> {
    // First verify the deal belongs to the agent
    const deal = await this.getDealById(dealId, agentId);
    if (!deal) {
      throw new Error("Deal not found or access denied");
    }
    
    const notes = await db.select()
      .from(dealNotes)
      .where(eq(dealNotes.dealId, dealId))
      .orderBy(desc(dealNotes.createdAt));
    
    return notes;
  }

  async createDealNote(data: InsertDealNote): Promise<DealNote> {
    const [created] = await db.insert(dealNotes).values(data).returning();
    return created;
  }

  async updateDealNote(id: string, userId: string, note: string): Promise<DealNote | undefined> {
    const [updated] = await db.update(dealNotes)
      .set({ note, updatedAt: new Date() })
      .where(and(eq(dealNotes.id, id), eq(dealNotes.userId, userId)))
      .returning();
    return updated;
  }

  async deleteDealNote(id: string, userId: string): Promise<void> {
    await db.delete(dealNotes)
      .where(and(eq(dealNotes.id, id), eq(dealNotes.userId, userId)));
  }

  // ============================================
  // AGENT CLIENT MANAGEMENT METHODS
  // ============================================

  async getClients(agentId: string, options?: { 
    status?: string; 
    stage?: string; 
    search?: string;
    sortBy?: 'name' | 'createdAt' | 'lastContact' | 'priority';
    sortOrder?: 'asc' | 'desc';
    limit?: number; 
    offset?: number;
  }): Promise<{ clients: AgentClient[]; total: number }> {
    const conditions = [eq(agentClients.agentId, agentId)];

    if (options?.status) {
      conditions.push(eq(agentClients.status, options.status));
    }

    if (options?.stage) {
      conditions.push(eq(agentClients.stage, options.stage));
    }

    if (options?.search) {
      const searchPattern = `%${options.search}%`;
      conditions.push(
        or(
          ilike(agentClients.firstName, searchPattern),
          ilike(agentClients.lastName, searchPattern),
          ilike(agentClients.email, searchPattern)
        )!
      );
    }

    // Count total
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(agentClients)
      .where(and(...conditions));
    const total = Number(countResult.count);

    // Build query
    let query = db.select().from(agentClients).where(and(...conditions));

    // Sorting
    const sortBy = options?.sortBy || 'createdAt';
    const sortOrder = options?.sortOrder || 'desc';
    
    if (sortBy === 'name') {
      query = query.orderBy(sortOrder === 'asc' ? agentClients.lastName : desc(agentClients.lastName));
    } else if (sortBy === 'lastContact') {
      query = query.orderBy(sortOrder === 'asc' ? agentClients.lastContact : desc(agentClients.lastContact));
    } else if (sortBy === 'priority') {
      query = query.orderBy(sortOrder === 'asc' ? agentClients.priority : desc(agentClients.priority));
    } else {
      query = query.orderBy(sortOrder === 'asc' ? agentClients.createdAt : desc(agentClients.createdAt));
    }

    // Pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.offset(options.offset);
    }

    const clients = await query;
    return { clients, total };
  }

  async getClientById(id: string, agentId: string): Promise<AgentClient | undefined> {
    const [client] = await db
      .select()
      .from(agentClients)
      .where(and(eq(agentClients.id, id), eq(agentClients.agentId, agentId)));
    return client;
  }

  async createClient(data: InsertAgentClient): Promise<AgentClient> {
    const [created] = await db.insert(agentClients).values(data).returning();
    return created;
  }

  async updateClient(id: string, agentId: string, data: Partial<InsertAgentClient>): Promise<AgentClient | undefined> {
    const [updated] = await db
      .update(agentClients)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(agentClients.id, id), eq(agentClients.agentId, agentId)))
      .returning();
    return updated;
  }

  async archiveClient(id: string, agentId: string): Promise<AgentClient | undefined> {
    const [archived] = await db
      .update(agentClients)
      .set({ 
        isArchived: true, 
        archivedAt: new Date(),
        status: 'archived',
        updatedAt: new Date() 
      })
      .where(and(eq(agentClients.id, id), eq(agentClients.agentId, agentId)))
      .returning();
    return archived;
  }

  async deleteClient(id: string, agentId: string): Promise<void> {
    await db
      .delete(agentClients)
      .where(and(eq(agentClients.id, id), eq(agentClients.agentId, agentId)));
  }

  async getClientActivity(
    clientId: string, 
    agentId: string, 
    options?: { limit?: number; offset?: number }
  ): Promise<{ activities: ClientActivity[]; total: number }> {
    // Verify client belongs to agent
    const client = await this.getClientById(clientId, agentId);
    if (!client) {
      return { activities: [], total: 0 };
    }

    // Count total
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(clientActivity)
      .where(eq(clientActivity.clientId, clientId));
    const total = Number(countResult.count);

    // Get activities
    let query = db
      .select()
      .from(clientActivity)
      .where(eq(clientActivity.clientId, clientId))
      .orderBy(desc(clientActivity.createdAt));

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.offset(options.offset);
    }

    const activities = await query;
    return { activities, total };
  }

  async createClientActivity(data: InsertClientActivity): Promise<ClientActivity> {
    const [created] = await db.insert(clientActivity).values(data).returning();
    
    // Update client's lastContact timestamp
    await db
      .update(agentClients)
      .set({ lastContact: new Date(), updatedAt: new Date() })
      .where(eq(agentClients.id, data.clientId));
    
    return created;
  }

  async getAgentDashboardSummary(agentId: string): Promise<{
    totalClients: number;
    activeClients: number;
    clientsByStage: Record<string, number>;
    clientsByPriority: Record<string, number>;
    recentActivities: ClientActivity[];
    upcomingFollowUps: AgentClient[];
  }> {
    // Count total clients (excluding archived)
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(agentClients)
      .where(and(
        eq(agentClients.agentId, agentId),
        eq(agentClients.isArchived, false)
      ));
    const totalClients = Number(totalResult.count);

    // Count active clients
    const [activeResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(agentClients)
      .where(and(
        eq(agentClients.agentId, agentId),
        eq(agentClients.status, 'active'),
        eq(agentClients.isArchived, false)
      ));
    const activeClients = Number(activeResult.count);

    // Get all clients for stage and priority breakdown
    const allClients = await db
      .select()
      .from(agentClients)
      .where(and(
        eq(agentClients.agentId, agentId),
        eq(agentClients.isArchived, false)
      ));

    // Group by stage
    const clientsByStage: Record<string, number> = {};
    allClients.forEach(client => {
      const stage = client.stage || 'unknown';
      clientsByStage[stage] = (clientsByStage[stage] || 0) + 1;
    });

    // Group by priority
    const clientsByPriority: Record<string, number> = {};
    allClients.forEach(client => {
      const priority = client.priority || 'medium';
      clientsByPriority[priority] = (clientsByPriority[priority] || 0) + 1;
    });

    // Get recent activities (last 10)
    const recentActivities = await db
      .select()
      .from(clientActivity)
      .where(eq(clientActivity.agentId, agentId))
      .orderBy(desc(clientActivity.createdAt))
      .limit(10);

    // Get upcoming follow-ups (next 7 days)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const upcomingFollowUps = await db
      .select()
      .from(agentClients)
      .where(and(
        eq(agentClients.agentId, agentId),
        eq(agentClients.isArchived, false),
        gte(agentClients.nextFollowUp, today),
        lte(agentClients.nextFollowUp, nextWeek)
      ))
      .orderBy(agentClients.nextFollowUp)
      .limit(10);

    return {
      totalClients,
      activeClients,
      clientsByStage,
      clientsByPriority,
      recentActivities,
      upcomingFollowUps,
    };
  }

  // JEDI API - Market Intelligence
  async getPropertiesByCity(city: string, submarket?: string): Promise<Property[]> {
    const conditions = [
      eq(properties.isActive, true),
      ilike(properties.city, city),
    ];

    const result = await db
      .select()
      .from(properties)
      .where(and(...conditions))
      .orderBy(desc(properties.lastUpdated))
      .limit(500);

    return result;
  }

  async getSubmarketsByCity(city: string): Promise<Submarket[]> {
    const result = await db
      .select()
      .from(submarkets)
      .where(ilike(submarkets.city, city))
      .orderBy(submarkets.name);

    return result;
  }

  // JEDI API - API Keys
  async getApiKeyByHash(keyHash: string): Promise<ApiKey | undefined> {
    const result = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyHash, keyHash))
      .limit(1);

    return result[0];
  }

  async createApiKey(data: InsertApiKey): Promise<ApiKey> {
    const [apiKey] = await db.insert(apiKeys).values(data).returning();
    return apiKey;
  }

  async updateApiKeyUsage(keyId: string): Promise<void> {
    await db
      .update(apiKeys)
      .set({
        lastUsedAt: new Date(),
        requestCount: sql`COALESCE(${apiKeys.requestCount}, 0) + 1`,
        updatedAt: new Date(),
      })
      .where(eq(apiKeys.id, keyId));
  }

  async getRenterProfile(userId: string): Promise<RenterProfile | undefined> {
    const result = await db
      .select()
      .from(renterProfiles)
      .where(eq(renterProfiles.userId, userId))
      .limit(1);

    return result[0];
  }

  async upsertRenterProfile(data: InsertRenterProfile): Promise<RenterProfile> {
    const existing = await this.getRenterProfile(data.userId);
    
    if (existing) {
      const [updated] = await db
        .update(renterProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(renterProfiles.userId, data.userId))
        .returning();
      return updated;
    }
    
    const [created] = await db
      .insert(renterProfiles)
      .values(data)
      .returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
