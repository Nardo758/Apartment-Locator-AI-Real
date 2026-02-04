import { db } from "./db";
import { eq, desc, and, gte, lte, ilike, or, sql } from "drizzle-orm";
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
    occupied: number;
    vacant: number;
    occupancyRate: number;
    totalMonthlyRevenue: number;
    potentialMonthlyRevenue: number;
    revenueEfficiency: number;
    avgDaysVacant: number;
    totalSquareFeet: number;
    avgRentPerSqFt: number;
  }>;
  
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
    
    return {
      totalProperties,
      occupied,
      vacant,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      totalMonthlyRevenue: Math.round(totalMonthlyRevenue * 100) / 100,
      potentialMonthlyRevenue: Math.round(potentialMonthlyRevenue * 100) / 100,
      revenueEfficiency: Math.round(revenueEfficiency * 100) / 100,
      avgDaysVacant: Math.round(avgDaysVacant * 100) / 100,
      totalSquareFeet,
      avgRentPerSqFt: Math.round(avgRentPerSqFt * 100) / 100,
    };
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
}

export const storage = new DatabaseStorage();
