import { supabase } from '@/integrations/supabase/client';

export type EngineData = Record<string, any>;

export type EngineType = 'renter' | 'landlord' | 'agent';

type Subscriber<T> = (data: T) => void;

const CACHE_PREFIX = 'ude_cache_';

const db = supabase as any;

export abstract class UserDataEngine<T extends EngineData> {
  protected userId: string;
  protected engineType: EngineType;
  protected data: T | null = null;
  protected subscribers: Set<Subscriber<T>> = new Set();
  protected version: number = 1;

  constructor(userId: string, engineType: EngineType) {
    this.userId = userId;
    this.engineType = engineType;
  }

  abstract getDefaults(): T;

  protected getCacheKey(): string {
    return `${CACHE_PREFIX}${this.engineType}_${this.userId}`;
  }

  protected loadFromCache(): T | null {
    try {
      const cached = localStorage.getItem(this.getCacheKey());
      if (cached) {
        return JSON.parse(cached) as T;
      }
    } catch {
      // ignore
    }
    return null;
  }

  protected saveToCache(data: T): void {
    try {
      localStorage.setItem(this.getCacheKey(), JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  async load(): Promise<T> {
    try {
      const { data: row, error } = await db
        .from('user_data_engines')
        .select('data, version')
        .eq('user_id', this.userId)
        .eq('engine_type', this.engineType)
        .maybeSingle();

      if (!error && row?.data) {
        this.data = { ...this.getDefaults(), ...(row.data as Partial<T>) };
        this.version = row.version || 1;
        this.saveToCache(this.data);
        this.notifySubscribers();
        return this.data;
      }
    } catch {
      // fall through to cache
    }

    const cached = this.loadFromCache();
    if (cached) {
      this.data = { ...this.getDefaults(), ...cached };
      this.notifySubscribers();
      return this.data;
    }

    this.data = this.getDefaults();
    this.notifySubscribers();
    return this.data;
  }

  async save(updates: Partial<T>): Promise<T> {
    const current = this.data || this.getDefaults();
    this.data = { ...current, ...updates };
    this.version += 1;

    this.saveToCache(this.data);
    this.notifySubscribers();

    try {
      const { error } = await db
        .from('user_data_engines')
        .upsert(
          {
            user_id: this.userId,
            engine_type: this.engineType,
            data: this.data as unknown as Record<string, unknown>,
            version: this.version,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,engine_type' }
        );

      if (error) {
        console.error(`[${this.engineType}Engine] Save error:`, error);
      }
    } catch (err) {
      console.error(`[${this.engineType}Engine] Save failed:`, err);
    }

    return this.data;
  }

  subscribe(callback: Subscriber<T>): () => void {
    this.subscribers.add(callback);
    if (this.data) {
      callback(this.data);
    }
    return () => {
      this.subscribers.delete(callback);
    };
  }

  protected notifySubscribers(): void {
    if (this.data) {
      this.subscribers.forEach(cb => cb(this.data!));
    }
  }

  async refresh(): Promise<T> {
    return this.load();
  }

  getData(): T | null {
    return this.data;
  }

  getVersion(): number {
    return this.version;
  }

  clearCache(): void {
    try {
      localStorage.removeItem(this.getCacheKey());
    } catch {
      // ignore
    }
  }
}
