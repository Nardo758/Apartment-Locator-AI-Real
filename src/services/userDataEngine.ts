/**
 * User Data Engine - Base Class
 * Single source of truth for all user data across renter/landlord/agent types
 * 
 * Architecture:
 * - Supabase is source of truth
 * - localStorage is performance cache
 * - Priority: Database > Cache > Defaults
 * 
 * Usage:
 * const engine = new RenterDataEngine(userId);
 * await engine.load(); // Loads from DB → cache → defaults
 * await engine.save(data); // Saves to DB + updates cache
 * await engine.refresh(); // Force refresh from DB
 */

import { supabase } from '@/integrations/supabase/client';

export type UserType = 'renter' | 'landlord' | 'agent';

export interface BaseUserData {
  userId: string;
  userType: UserType;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataEngineOptions {
  enableCache?: boolean;
  autoRefresh?: boolean;
  debug?: boolean;
}

/**
 * Base User Data Engine
 * Abstract class - extend for each user type
 */
export abstract class UserDataEngine<T extends Record<string, any>> {
  protected userId: string;
  protected userType: UserType;
  protected cacheKey: string;
  protected options: DataEngineOptions;
  protected listeners: Set<(data: T) => void> = new Set();
  protected currentData: T | null = null;
  
  constructor(
    userId: string,
    userType: UserType,
    options: DataEngineOptions = {}
  ) {
    this.userId = userId;
    this.userType = userType;
    this.cacheKey = `user_data_engine_${userType}_${userId}`;
    this.options = {
      enableCache: true,
      autoRefresh: false,
      debug: false,
      ...options,
    };
    
    if (this.options.debug) {
      console.log(`[DataEngine] Initialized ${userType} engine for user ${userId}`);
    }
  }
  
  /**
   * Get default data structure
   * Must be implemented by each user type
   */
  protected abstract getDefaults(): T;
  
  /**
   * Validate data structure
   * Optional - override to add validation
   */
  protected validate(data: T): boolean {
    return true;
  }
  
  /**
   * Transform data before saving to DB
   * Optional - override to transform data
   */
  protected beforeSave(data: T): any {
    return data;
  }
  
  /**
   * Transform data after loading from DB
   * Optional - override to transform data
   */
  protected afterLoad(data: any): T {
    return data as T;
  }
  
  /**
   * Load user data
   * Priority: Supabase > localStorage > Defaults
   */
  async load(): Promise<T> {
    try {
      if (this.options.debug) {
        console.log(`[DataEngine] Loading data for ${this.userType}...`);
      }
      
      // Try Supabase first (source of truth)
      const dbData = await this.loadFromDatabase();
      if (dbData) {
        if (this.options.debug) {
          console.log(`[DataEngine] Loaded from database:`, dbData);
        }
        
        // Update cache
        if (this.options.enableCache) {
          this.saveToCache(dbData);
        }
        
        this.currentData = dbData;
        this.notifyListeners(dbData);
        return dbData;
      }
      
      // Fallback to cache
      if (this.options.enableCache) {
        const cachedData = this.loadFromCache();
        if (cachedData) {
          if (this.options.debug) {
            console.log(`[DataEngine] Loaded from cache:`, cachedData);
          }
          
          this.currentData = cachedData;
          this.notifyListeners(cachedData);
          return cachedData;
        }
      }
      
      // Final fallback to defaults
      const defaults = this.getDefaults();
      if (this.options.debug) {
        console.log(`[DataEngine] Using defaults:`, defaults);
      }
      
      this.currentData = defaults;
      this.notifyListeners(defaults);
      return defaults;
      
    } catch (error) {
      console.error(`[DataEngine] Error loading data:`, error);
      
      // Try cache as fallback
      if (this.options.enableCache) {
        const cachedData = this.loadFromCache();
        if (cachedData) {
          return cachedData;
        }
      }
      
      // Return defaults on error
      return this.getDefaults();
    }
  }
  
  /**
   * Save user data
   * Writes to Supabase + updates cache
   */
  async save(data: Partial<T>): Promise<void> {
    try {
      // Merge with current data
      const fullData: T = {
        ...this.currentData,
        ...data,
        updatedAt: new Date(),
      } as T;
      
      // Validate
      if (!this.validate(fullData)) {
        throw new Error('Data validation failed');
      }
      
      if (this.options.debug) {
        console.log(`[DataEngine] Saving data:`, fullData);
      }
      
      // Transform for DB
      const dbData = this.beforeSave(fullData);
      
      // Save to Supabase
      await this.saveToDatabase(dbData);
      
      // Update cache
      if (this.options.enableCache) {
        this.saveToCache(fullData);
      }
      
      // Update current
      this.currentData = fullData;
      
      // Notify listeners
      this.notifyListeners(fullData);
      
      if (this.options.debug) {
        console.log(`[DataEngine] Data saved successfully`);
      }
      
    } catch (error) {
      console.error(`[DataEngine] Error saving data:`, error);
      throw error;
    }
  }
  
  /**
   * Refresh from database
   * Forces reload from Supabase
   */
  async refresh(): Promise<T> {
    if (this.options.debug) {
      console.log(`[DataEngine] Forcing refresh from database...`);
    }
    
    const data = await this.loadFromDatabase();
    if (data) {
      if (this.options.enableCache) {
        this.saveToCache(data);
      }
      this.currentData = data;
      this.notifyListeners(data);
      return data;
    }
    
    // Fallback to current or defaults
    return this.currentData || this.getDefaults();
  }
  
  /**
   * Get current data (cached)
   */
  getCurrent(): T | null {
    return this.currentData;
  }
  
  /**
   * Subscribe to data changes
   */
  subscribe(callback: (data: T) => void): () => void {
    this.listeners.add(callback);
    
    // Immediately call with current data
    if (this.currentData) {
      callback(this.currentData);
    }
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }
  
  /**
   * Clear cache
   */
  clearCache(): void {
    if (this.options.enableCache) {
      try {
        localStorage.removeItem(this.cacheKey);
        if (this.options.debug) {
          console.log(`[DataEngine] Cache cleared`);
        }
      } catch (error) {
        console.error(`[DataEngine] Error clearing cache:`, error);
      }
    }
  }
  
  /**
   * Reset to defaults
   */
  reset(): void {
    const defaults = this.getDefaults();
    this.currentData = defaults;
    this.clearCache();
    this.notifyListeners(defaults);
  }
  
  // ============================================
  // PRIVATE METHODS
  // ============================================
  
  /**
   * Load from Supabase
   */
  private async loadFromDatabase(): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from('user_data_engines')
        .select('*')
        .eq('user_id', this.userId)
        .eq('user_type', this.userType)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No data found - not an error
          return null;
        }
        throw error;
      }
      
      if (!data) {
        return null;
      }
      
      // Transform and return
      return this.afterLoad(data.data);
      
    } catch (error) {
      console.error(`[DataEngine] Database load error:`, error);
      return null;
    }
  }
  
  /**
   * Save to Supabase
   */
  private async saveToDatabase(data: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_data_engines')
        .upsert({
          user_id: this.userId,
          user_type: this.userType,
          data: data,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,user_type'
        });
      
      if (error) {
        throw error;
      }
      
    } catch (error) {
      console.error(`[DataEngine] Database save error:`, error);
      throw error;
    }
  }
  
  /**
   * Load from localStorage cache
   */
  private loadFromCache(): T | null {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) {
        return null;
      }
      
      const parsed = JSON.parse(cached);
      
      // Check if cache is stale (optional: add TTL logic here)
      return parsed as T;
      
    } catch (error) {
      console.error(`[DataEngine] Cache load error:`, error);
      return null;
    }
  }
  
  /**
   * Save to localStorage cache
   */
  private saveToCache(data: T): void {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(data));
    } catch (error) {
      console.error(`[DataEngine] Cache save error:`, error);
    }
  }
  
  /**
   * Notify all listeners
   */
  private notifyListeners(data: T): void {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[DataEngine] Listener error:`, error);
      }
    });
  }
}
