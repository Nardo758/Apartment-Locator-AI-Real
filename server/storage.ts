import { db } from "./db";
import { eq, desc, and, gte, lte, ilike, or } from "drizzle-orm";
import {
  properties,
  savedApartments,
  searchHistory,
  userPreferences,
  marketSnapshots,
  userPois,
  type Property,
  type SavedApartment,
  type SearchHistory,
  type UserPreferences,
  type MarketSnapshot,
  type UserPoi,
  type InsertProperty,
  type InsertSavedApartment,
  type InsertSearchHistory,
  type InsertUserPreferences,
  type InsertMarketSnapshot,
  type InsertUserPoi,
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
}

export const storage = new DatabaseStorage();
