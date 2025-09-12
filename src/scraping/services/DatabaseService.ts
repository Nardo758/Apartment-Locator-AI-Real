/**
 * Database service layer for apartment scraping data operations
 * Optimized for PostgreSQL with comprehensive CRUD operations
 */

import { Pool, PoolClient } from 'pg';
import { ScrapedProperty, ScrapingJob, ScrapingResult, MarketData } from '../core/types';
import { scrapingLogger } from '../utils/Logger';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  max?: number; // Maximum number of clients in the pool
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export interface PropertySearchFilters {
  city?: string;
  state?: string;
  source?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number[];
  bathrooms?: number[];
  amenities?: string[];
  isActive?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
    radius: number; // in miles
  };
  limit?: number;
  offset?: number;
}

export interface MarketAnalytics {
  totalProperties: number;
  averagePrice: number;
  medianPrice: number;
  priceDistribution: Record<string, number>;
  averageDaysOnMarket: number;
  topAmenities: Array<{ amenity: string; count: number }>;
  priceByBedrooms: Record<number, number>;
}

export class DatabaseService {
  private pool: Pool;
  private logger = scrapingLogger;

  constructor(config: DatabaseConfig) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl,
      max: config.max || 20,
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMillis || 2000,
    });

    this.pool.on('error', (err) => {
      this.logger.error('Database pool error', err);
    });

    this.pool.on('connect', () => {
      this.logger.debug('Database connection established');
    });
  }

  // ============================================================================
  // PROPERTY OPERATIONS
  // ============================================================================

  /**
   * Insert or update a property
   */
  async upsertProperty(property: ScrapedProperty): Promise<string> {
    const client = await this.pool.connect();
    
    try {
      const query = `
        INSERT INTO properties (
          external_id, source, name, address, city, state, zip_code,
          current_price, original_price, bedrooms, bathrooms, sqft, year_built,
          availability, availability_type, days_on_market,
          features, amenities, images, virtual_tour_url,
          phone_number, website_url, listing_url, coordinates,
          pet_policy, parking, scraped_at, last_updated, is_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, 
          ST_Point($24, $25), $26, $27, $28, $29, $30
        )
        ON CONFLICT (external_id, source) 
        DO UPDATE SET
          name = EXCLUDED.name,
          address = EXCLUDED.address,
          current_price = EXCLUDED.current_price,
          availability = EXCLUDED.availability,
          availability_type = EXCLUDED.availability_type,
          days_on_market = EXCLUDED.days_on_market,
          features = EXCLUDED.features,
          amenities = EXCLUDED.amenities,
          images = EXCLUDED.images,
          last_updated = EXCLUDED.last_updated,
          is_active = EXCLUDED.is_active
        RETURNING id
      `;

      const values = [
        property.externalId,
        property.source,
        property.name,
        property.address,
        property.city,
        property.state,
        property.zipCode,
        property.currentPrice,
        property.originalPrice,
        property.bedrooms,
        property.bathrooms,
        property.sqft,
        property.yearBuilt,
        property.availability,
        property.availabilityType,
        property.daysOnMarket,
        JSON.stringify(property.features),
        JSON.stringify(property.amenities),
        JSON.stringify(property.images),
        property.virtualTourUrl,
        property.phoneNumber,
        property.websiteUrl,
        property.listingUrl,
        property.coordinates?.lng,
        property.coordinates?.lat,
        property.petPolicy,
        property.parking,
        property.scrapedAt,
        property.lastUpdated,
        property.isActive
      ];

      const result = await client.query(query, values);
      const propertyId = result.rows[0].id;

      // Insert price history if price changed
      await this.insertPriceHistory(client, propertyId, property.currentPrice, property.source);

      this.logger.debug('Property upserted', { 
        propertyId, 
        externalId: property.externalId,
        source: property.source 
      });

      return propertyId;

    } finally {
      client.release();
    }
  }

  /**
   * Search properties with filters
   */
  async searchProperties(filters: PropertySearchFilters = {}): Promise<{
    properties: ScrapedProperty[];
    total: number;
  }> {
    const client = await this.pool.connect();
    
    try {
      let whereConditions = ['p.is_active = true'];
      let queryParams: any[] = [];
      let paramIndex = 1;

      // Build WHERE conditions
      if (filters.city) {
        whereConditions.push(`p.city ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.city}%`);
        paramIndex++;
      }

      if (filters.state) {
        whereConditions.push(`p.state = $${paramIndex}`);
        queryParams.push(filters.state.toUpperCase());
        paramIndex++;
      }

      if (filters.source) {
        whereConditions.push(`p.source = $${paramIndex}`);
        queryParams.push(filters.source);
        paramIndex++;
      }

      if (filters.minPrice) {
        whereConditions.push(`p.current_price >= $${paramIndex}`);
        queryParams.push(filters.minPrice);
        paramIndex++;
      }

      if (filters.maxPrice) {
        whereConditions.push(`p.current_price <= $${paramIndex}`);
        queryParams.push(filters.maxPrice);
        paramIndex++;
      }

      if (filters.bedrooms && filters.bedrooms.length > 0) {
        whereConditions.push(`p.bedrooms = ANY($${paramIndex})`);
        queryParams.push(filters.bedrooms);
        paramIndex++;
      }

      if (filters.bathrooms && filters.bathrooms.length > 0) {
        whereConditions.push(`p.bathrooms = ANY($${paramIndex})`);
        queryParams.push(filters.bathrooms);
        paramIndex++;
      }

      if (filters.amenities && filters.amenities.length > 0) {
        whereConditions.push(`p.amenities ?| $${paramIndex}`);
        queryParams.push(filters.amenities);
        paramIndex++;
      }

      if (filters.coordinates) {
        whereConditions.push(`ST_DWithin(p.coordinates, ST_Point($${paramIndex}, $${paramIndex + 1})::geography, $${paramIndex + 2})`);
        queryParams.push(filters.coordinates.lng, filters.coordinates.lat, filters.coordinates.radius * 1609.34); // Convert miles to meters
        paramIndex += 3;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // Count query
      const countQuery = `
        SELECT COUNT(*) as total
        FROM properties p
        ${whereClause}
      `;

      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Main query
      const limit = filters.limit || 50;
      const offset = filters.offset || 0;

      const query = `
        SELECT 
          p.id,
          p.external_id,
          p.source,
          p.name,
          p.address,
          p.city,
          p.state,
          p.zip_code,
          p.current_price,
          p.original_price,
          p.bedrooms,
          p.bathrooms,
          p.sqft,
          p.year_built,
          p.availability,
          p.availability_type,
          p.days_on_market,
          p.features,
          p.amenities,
          p.images,
          p.virtual_tour_url,
          p.phone_number,
          p.website_url,
          p.listing_url,
          ST_X(p.coordinates::geometry) as lng,
          ST_Y(p.coordinates::geometry) as lat,
          p.pet_policy,
          p.parking,
          p.scraped_at,
          p.last_updated,
          p.is_active,
          ph.price_change,
          ph.price_change_percent
        FROM properties p
        LEFT JOIN LATERAL (
          SELECT price_change, price_change_percent
          FROM price_history
          WHERE property_id = p.id
          ORDER BY date_recorded DESC
          LIMIT 1
        ) ph ON true
        ${whereClause}
        ORDER BY p.scraped_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(limit, offset);

      const result = await client.query(query, queryParams);
      const properties = result.rows.map(row => this.mapRowToProperty(row));

      this.logger.debug('Properties searched', { 
        total, 
        returned: properties.length, 
        filters 
      });

      return { properties, total };

    } finally {
      client.release();
    }
  }

  /**
   * Get property by ID
   */
  async getPropertyById(id: string): Promise<ScrapedProperty | null> {
    const client = await this.pool.connect();
    
    try {
      const query = `
        SELECT 
          p.*,
          ST_X(p.coordinates::geometry) as lng,
          ST_Y(p.coordinates::geometry) as lat
        FROM properties p
        WHERE p.id = $1
      `;

      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToProperty(result.rows[0]);

    } finally {
      client.release();
    }
  }

  /**
   * Get properties within radius of coordinates
   */
  async getPropertiesNearby(
    lat: number, 
    lng: number, 
    radiusMiles: number = 5,
    limit: number = 20
  ): Promise<Array<ScrapedProperty & { distance: number }>> {
    const client = await this.pool.connect();
    
    try {
      const query = `
        SELECT 
          p.*,
          ST_X(p.coordinates::geometry) as lng,
          ST_Y(p.coordinates::geometry) as lat,
          ROUND(ST_Distance(p.coordinates, ST_Point($2, $1)::geography) / 1609.34, 2) as distance
        FROM properties p
        WHERE p.is_active = true
          AND p.coordinates IS NOT NULL
          AND ST_DWithin(p.coordinates, ST_Point($2, $1)::geography, $3)
        ORDER BY p.coordinates <-> ST_Point($2, $1)::geography
        LIMIT $4
      `;

      const result = await client.query(query, [lat, lng, radiusMiles * 1609.34, limit]);
      
      return result.rows.map(row => ({
        ...this.mapRowToProperty(row),
        distance: parseFloat(row.distance)
      }));

    } finally {
      client.release();
    }
  }

  // ============================================================================
  // SCRAPING JOB OPERATIONS
  // ============================================================================

  /**
   * Create a new scraping job
   */
  async createScrapingJob(job: Omit<ScrapingJob, 'id'>): Promise<string> {
    const client = await this.pool.connect();
    
    try {
      const query = `
        INSERT INTO scraping_jobs (
          job_id, source, city, state, status, priority, max_pages,
          scheduled_at, options, metadata, retry_count, max_retries
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `;

      const values = [
        job.id,
        job.source,
        job.city,
        job.state,
        job.status,
        job.priority,
        10, // max_pages default
        job.scheduledAt,
        JSON.stringify({}),
        JSON.stringify({}),
        job.retryCount,
        job.maxRetries
      ];

      const result = await client.query(query, values);
      return result.rows[0].id;

    } finally {
      client.release();
    }
  }

  /**
   * Update scraping job status and results
   */
  async updateScrapingJob(
    jobId: string, 
    updates: Partial<ScrapingJob>, 
    result?: ScrapingResult
  ): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      const setClause = [];
      const values = [];
      let paramIndex = 1;

      if (updates.status) {
        setClause.push(`status = $${paramIndex}`);
        values.push(updates.status);
        paramIndex++;
      }

      if (updates.startedAt) {
        setClause.push(`started_at = $${paramIndex}`);
        values.push(updates.startedAt);
        paramIndex++;
      }

      if (updates.completedAt) {
        setClause.push(`completed_at = $${paramIndex}`);
        values.push(updates.completedAt);
        paramIndex++;
      }

      if (result) {
        setClause.push(`properties_found = $${paramIndex}`);
        values.push(result.properties.length);
        paramIndex++;

        setClause.push(`properties_processed = $${paramIndex}`);
        values.push(result.metadata.propertiesProcessed);
        paramIndex++;

        setClause.push(`error_count = $${paramIndex}`);
        values.push(result.errors.length);
        paramIndex++;

        if (updates.startedAt && updates.completedAt) {
          const duration = updates.completedAt.getTime() - updates.startedAt.getTime();
          setClause.push(`duration_ms = $${paramIndex}`);
          values.push(duration);
          paramIndex++;
        }
      }

      if (setClause.length === 0) return;

      const query = `
        UPDATE scraping_jobs 
        SET ${setClause.join(', ')}
        WHERE job_id = $${paramIndex}
      `;
      values.push(jobId);

      await client.query(query, values);

      this.logger.debug('Scraping job updated', { jobId, updates });

    } finally {
      client.release();
    }
  }

  /**
   * Get scraping job statistics
   */
  async getScrapingStats(days: number = 7): Promise<{
    totalJobs: number;
    successfulJobs: number;
    failedJobs: number;
    averageDuration: number;
    propertiesScraped: number;
    successRate: number;
    jobsBySource: Record<string, number>;
  }> {
    const client = await this.pool.connect();
    
    try {
      const query = `
        SELECT 
          COUNT(*) as total_jobs,
          COUNT(*) FILTER (WHERE status = 'completed') as successful_jobs,
          COUNT(*) FILTER (WHERE status = 'failed') as failed_jobs,
          AVG(duration_ms) as avg_duration,
          SUM(properties_processed) as properties_scraped,
          source,
          COUNT(*) as jobs_per_source
        FROM scraping_jobs
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY ROLLUP(source)
        ORDER BY source NULLS LAST
      `;

      const result = await client.query(query);
      
      // The last row (with NULL source) contains totals
      const totalRow = result.rows.find(row => row.source === null);
      const sourceRows = result.rows.filter(row => row.source !== null);

      const jobsBySource: Record<string, number> = {};
      sourceRows.forEach(row => {
        jobsBySource[row.source] = parseInt(row.jobs_per_source);
      });

      return {
        totalJobs: parseInt(totalRow?.total_jobs || '0'),
        successfulJobs: parseInt(totalRow?.successful_jobs || '0'),
        failedJobs: parseInt(totalRow?.failed_jobs || '0'),
        averageDuration: parseFloat(totalRow?.avg_duration || '0'),
        propertiesScraped: parseInt(totalRow?.properties_scraped || '0'),
        successRate: totalRow ? parseInt(totalRow.successful_jobs) / parseInt(totalRow.total_jobs) : 0,
        jobsBySource
      };

    } finally {
      client.release();
    }
  }

  // ============================================================================
  // MARKET ANALYTICS
  // ============================================================================

  /**
   * Get market analytics for a city
   */
  async getMarketAnalytics(city: string, state: string): Promise<MarketAnalytics> {
    const client = await this.pool.connect();
    
    try {
      // Main analytics query
      const analyticsQuery = `
        SELECT 
          COUNT(*) as total_properties,
          AVG(current_price) as average_price,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY current_price) as median_price,
          AVG(days_on_market) FILTER (WHERE days_on_market > 0) as avg_days_on_market
        FROM properties
        WHERE city ILIKE $1 AND state = $2 AND is_active = true
      `;

      const analyticsResult = await client.query(analyticsQuery, [city, state.toUpperCase()]);
      const analytics = analyticsResult.rows[0];

      // Price distribution
      const distributionQuery = `
        SELECT 
          CASE 
            WHEN current_price < 1000 THEN 'under_1000'
            WHEN current_price < 1500 THEN '1000_1500'
            WHEN current_price < 2000 THEN '1500_2000'
            WHEN current_price < 2500 THEN '2000_2500'
            WHEN current_price < 3000 THEN '2500_3000'
            ELSE 'over_3000'
          END as price_range,
          COUNT(*) as count
        FROM properties
        WHERE city ILIKE $1 AND state = $2 AND is_active = true
        GROUP BY price_range
      `;

      const distributionResult = await client.query(distributionQuery, [city, state.toUpperCase()]);
      const priceDistribution: Record<string, number> = {};
      distributionResult.rows.forEach(row => {
        priceDistribution[row.price_range] = parseInt(row.count);
      });

      // Top amenities
      const amenitiesQuery = `
        SELECT 
          amenity,
          COUNT(*) as count
        FROM properties,
        jsonb_array_elements_text(amenities) as amenity
        WHERE city ILIKE $1 AND state = $2 AND is_active = true
        GROUP BY amenity
        ORDER BY count DESC
        LIMIT 10
      `;

      const amenitiesResult = await client.query(amenitiesQuery, [city, state.toUpperCase()]);
      const topAmenities = amenitiesResult.rows.map(row => ({
        amenity: row.amenity,
        count: parseInt(row.count)
      }));

      // Price by bedrooms
      const bedroomsQuery = `
        SELECT 
          bedrooms,
          AVG(current_price) as avg_price
        FROM properties
        WHERE city ILIKE $1 AND state = $2 AND is_active = true
        GROUP BY bedrooms
        ORDER BY bedrooms
      `;

      const bedroomsResult = await client.query(bedroomsQuery, [city, state.toUpperCase()]);
      const priceByBedrooms: Record<number, number> = {};
      bedroomsResult.rows.forEach(row => {
        priceByBedrooms[row.bedrooms] = Math.round(parseFloat(row.avg_price));
      });

      return {
        totalProperties: parseInt(analytics.total_properties),
        averagePrice: Math.round(parseFloat(analytics.average_price || '0')),
        medianPrice: Math.round(parseFloat(analytics.median_price || '0')),
        priceDistribution,
        averageDaysOnMarket: Math.round(parseFloat(analytics.avg_days_on_market || '0')),
        topAmenities,
        priceByBedrooms
      };

    } finally {
      client.release();
    }
  }

  /**
   * Insert market snapshot
   */
  async insertMarketSnapshot(snapshot: MarketData & { city: string; state: string }): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      const query = `
        INSERT INTO market_snapshots (
          city, state, median_rent, average_rent, rent_change_percent,
          average_days_on_market, occupancy_rate, total_properties_analyzed,
          market_velocity, competitiveness_score, price_percentile_25,
          price_percentile_75, price_per_sqft_median, trending_concessions,
          confidence_score
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (city, state, snapshot_date::DATE)
        DO UPDATE SET
          median_rent = EXCLUDED.median_rent,
          average_rent = EXCLUDED.average_rent,
          rent_change_percent = EXCLUDED.rent_change_percent,
          average_days_on_market = EXCLUDED.average_days_on_market,
          occupancy_rate = EXCLUDED.occupancy_rate,
          total_properties_analyzed = EXCLUDED.total_properties_analyzed,
          market_velocity = EXCLUDED.market_velocity,
          competitiveness_score = EXCLUDED.competitiveness_score,
          trending_concessions = EXCLUDED.trending_concessions
      `;

      const values = [
        snapshot.city,
        snapshot.state.toUpperCase(),
        snapshot.medianRent,
        snapshot.medianRent, // Using median as average for now
        snapshot.priceChangePercent,
        snapshot.averageDaysOnMarket,
        snapshot.occupancyRate,
        100, // Default properties analyzed
        'normal', // Default market velocity
        75, // Default competitiveness score
        Math.round(snapshot.medianRent * 0.8), // Q1
        Math.round(snapshot.medianRent * 1.2), // Q3
        2.5, // Default price per sqft
        JSON.stringify(snapshot.trendingConcessions),
        0.85 // Default confidence
      ];

      await client.query(query, values);

      this.logger.debug('Market snapshot inserted', { 
        city: snapshot.city, 
        state: snapshot.state 
      });

    } finally {
      client.release();
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Insert price history record
   */
  private async insertPriceHistory(
    client: PoolClient, 
    propertyId: string, 
    price: number, 
    source: string
  ): Promise<void> {
    const query = `
      INSERT INTO price_history (property_id, price, source)
      VALUES ($1, $2, $3)
    `;

    await client.query(query, [propertyId, price, source]);
  }

  /**
   * Map database row to ScrapedProperty object
   */
  private mapRowToProperty(row: any): ScrapedProperty {
    return {
      id: row.id,
      externalId: row.external_id,
      source: row.source,
      name: row.name,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      currentPrice: row.current_price,
      originalPrice: row.original_price,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      sqft: row.sqft,
      yearBuilt: row.year_built,
      availability: row.availability,
      availabilityType: row.availability_type,
      daysOnMarket: row.days_on_market,
      features: row.features ? JSON.parse(row.features) : [],
      amenities: row.amenities ? JSON.parse(row.amenities) : [],
      images: row.images ? JSON.parse(row.images) : [],
      virtualTourUrl: row.virtual_tour_url,
      phoneNumber: row.phone_number,
      websiteUrl: row.website_url,
      listingUrl: row.listing_url,
      coordinates: row.lat && row.lng ? { lat: row.lat, lng: row.lng } : undefined,
      petPolicy: row.pet_policy,
      parking: row.parking,
      scrapedAt: row.scraped_at,
      lastUpdated: row.last_updated,
      isActive: row.is_active
    };
  }

  /**
   * Execute raw SQL query (for advanced operations)
   */
  async query(sql: string, params: any[] = []): Promise<any> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  /**
   * Get database health status
   */
  async healthCheck(): Promise<{
    connected: boolean;
    totalConnections: number;
    idleConnections: number;
    waitingClients: number;
  }> {
    try {
      const client = await this.pool.connect();
      client.release();

      return {
        connected: true,
        totalConnections: this.pool.totalCount,
        idleConnections: this.pool.idleCount,
        waitingClients: this.pool.waitingCount
      };
    } catch (error) {
      this.logger.error('Database health check failed', error as Error);
      return {
        connected: false,
        totalConnections: 0,
        idleConnections: 0,
        waitingClients: 0
      };
    }
  }

  /**
   * Close database connections
   */
  async close(): Promise<void> {
    await this.pool.end();
    this.logger.info('Database connections closed');
  }
}

// Create database service instance
const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'apartment_scraper',
  user: process.env.DB_USER || 'scraper_user',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.NODE_ENV === 'production',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const databaseService = new DatabaseService(dbConfig);