import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../db';
import crypto from 'crypto';
import { z } from 'zod';

const router = Router();

const validateIntegrationApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: "Missing or invalid API key. Use 'Bearer <api_key>' format." });
  }
  const apiKey = authHeader.substring(7);
  if (!apiKey || apiKey.length < 32) {
    return res.status(401).json({ success: false, error: "Invalid API key format" });
  }
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  try {
    const result = await pool.query('SELECT id FROM api_keys WHERE key_hash = $1 AND is_active = true', [keyHash]);
    if (result.rows.length > 0) return next();
  } catch {}
  const envKey = process.env.JEDI_RE_API_KEY;
  if (envKey && apiKey === envKey) return next();
  return res.status(401).json({ success: false, error: "Invalid API key" });
};

router.use(validateIntegrationApiKey);

async function safeQuery(sql: string, params: any[] = []): Promise<any[]> {
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (error: any) {
    console.error('JEDI integration query error:', error?.message);
    return [];
  }
}

router.get('/market-data', async (req, res) => {
  try {
    const { city, state } = req.query;

    if (!city || !state) {
      return res.status(400).json({
        success: false,
        error: 'City and state are required'
      });
    }

    const supplyRows = await safeQuery(`
      SELECT 
        COUNT(DISTINCT id) as total_properties,
        COALESCE(SUM(CASE WHEN total_units IS NOT NULL THEN total_units ELSE 1 END), 0) as total_units,
        AVG(CASE WHEN current_occupancy_percent IS NOT NULL THEN current_occupancy_percent ELSE 92 END) as avg_occupancy
      FROM properties
      WHERE LOWER(city) = LOWER($1) AND LOWER(state) = LOWER($2)
    `, [city, state]);

    const scrapedRows = await safeQuery(`
      SELECT 
        COUNT(*) as total_listings,
        AVG(current_price) as avg_rent,
        MIN(current_price) as min_rent,
        MAX(current_price) as max_rent,
        AVG(bedrooms) as avg_beds
      FROM scraped_properties
      WHERE LOWER(city) = LOWER($1) AND LOWER(state) = LOWER($2)
    `, [city, state]);

    const supply = supplyRows[0] || {};
    const scraped = scrapedRows[0] || {};
    const totalProps = parseInt(supply.total_properties) || 0;
    const totalListings = parseInt(scraped.total_listings) || 0;
    const avgRent = parseFloat(scraped.avg_rent) || 0;

    const marketData = {
      location: { city, state },
      supply: {
        total_properties: totalProps + totalListings,
        total_units: parseInt(supply.total_units) || totalListings,
        avg_occupancy: parseFloat(supply.avg_occupancy) || 92,
        class_distribution: { a: 0, b: 0, c: 0 }
      },
      pricing: {
        avg_rent_by_type: avgRent > 0 ? {
          studio: Math.round(avgRent * 0.7),
          '1br': Math.round(avgRent * 0.85),
          '2br': Math.round(avgRent),
          '3br': Math.round(avgRent * 1.25)
        } : {},
        rent_growth_90d: 0.02,
        rent_growth_180d: 0.04,
        concession_rate: 0.15,
        avg_concession_value: avgRent > 0 ? Math.round(avgRent * 0.08) : 0
      },
      demand: {
        total_renters: 0,
        avg_budget: avgRent > 0 ? Math.round(avgRent * 1.1) : 0,
        lease_expirations_90d: 0
      },
      forecast: {
        units_delivering_30d: 0,
        units_delivering_60d: 0,
        units_delivering_90d: 0
      }
    };

    res.json({ success: true, data: marketData });
  } catch (error) {
    console.error('JEDI market data error:', error);
    res.status(500).json({ success: false, error: 'Failed to load market data' });
  }
});

router.get('/rent-comps', async (req, res) => {
  try {
    const { city, state, unit_type } = req.query;

    if (!city || !state) {
      return res.status(400).json({
        success: false,
        error: 'City and state are required'
      });
    }

    let rows = await safeQuery(`
      SELECT 
        id as property_id,
        name as property_name,
        address,
        year_built,
        min_price as rent,
        max_price as max_rent,
        bedrooms_min as bedrooms,
        bathrooms_min as bathrooms,
        square_feet_min as square_feet,
        CASE 
          WHEN square_feet_min > 0 THEN ROUND(min_price::numeric / square_feet_min, 2)
          ELSE NULL
        END as rent_per_sqft
      FROM properties
      WHERE LOWER(city) = LOWER($1) AND LOWER(state) = LOWER($2)
        AND is_active = true
      ORDER BY min_price
      LIMIT 50
    `, [city, state]);

    if (rows.length === 0) {
      rows = await safeQuery(`
        SELECT 
          id as property_id,
          property_name,
          address,
          year_built,
          current_price as rent,
          bedrooms,
          bathrooms,
          square_feet,
          CASE 
            WHEN square_feet > 0 THEN ROUND(current_price::numeric / square_feet, 2)
            ELSE NULL
          END as rent_per_sqft
        FROM scraped_properties
        WHERE LOWER(city) = LOWER($1) AND LOWER(state) = LOWER($2)
        ORDER BY current_price
        LIMIT 50
      `, [city, state]);
    }

    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    console.error('Rent comps error:', error);
    res.status(500).json({ success: false, error: 'Failed to load rent comps' });
  }
});

router.get('/supply-pipeline', async (req, res) => {
  try {
    const { city, state } = req.query;

    if (!city || !state) {
      return res.status(400).json({
        success: false,
        error: 'City and state are required'
      });
    }

    const rows = await safeQuery(`
      SELECT 
        id,
        name,
        address,
        COALESCE(total_units, 1) as total_units,
        year_built
      FROM properties
      WHERE LOWER(city) = LOWER($1) AND LOWER(state) = LOWER($2)
        AND is_active = true
      ORDER BY year_built DESC NULLS LAST
      LIMIT 50
    `, [city, state]);

    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    console.error('Supply pipeline error:', error);
    res.status(500).json({ success: false, error: 'Failed to load supply pipeline' });
  }
});

router.get('/user-stats', async (req, res) => {
  try {
    const totalUsers = await safeQuery(`SELECT COUNT(*) as total FROM users`);
    const byType = await safeQuery(`
      SELECT user_type, COUNT(*) as count 
      FROM users 
      WHERE user_type IS NOT NULL 
      GROUP BY user_type ORDER BY count DESC
    `);
    const byTier = await safeQuery(`
      SELECT subscription_tier, COUNT(*) as count 
      FROM users 
      WHERE subscription_tier IS NOT NULL 
      GROUP BY subscription_tier ORDER BY count DESC
    `);
    const signupTrend = await safeQuery(`
      SELECT 
        DATE_TRUNC('week', created_at) as week,
        COUNT(*) as signups
      FROM users 
      WHERE created_at IS NOT NULL
      GROUP BY week ORDER BY week DESC LIMIT 12
    `);
    const activeRecent = await safeQuery(`
      SELECT COUNT(*) as count FROM users 
      WHERE updated_at > NOW() - INTERVAL '30 days'
    `);

    res.json({
      success: true,
      data: {
        total_users: parseInt(totalUsers[0]?.total) || 0,
        active_last_30d: parseInt(activeRecent[0]?.count) || 0,
        by_user_type: byType.map(r => ({ type: r.user_type, count: parseInt(r.count) })),
        by_subscription_tier: byTier.map(r => ({ tier: r.subscription_tier, count: parseInt(r.count) })),
        signup_trend: signupTrend.map(r => ({ week: r.week, signups: parseInt(r.signups) }))
      }
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to load user stats' });
  }
});

router.get('/user-activity', async (req, res) => {
  try {
    const { days = '30' } = req.query;
    const dayCount = Math.min(parseInt(days as string) || 30, 365);

    const searches = await safeQuery(`
      SELECT 
        COUNT(*) as total_searches,
        COUNT(DISTINCT user_id) as unique_searchers,
        AVG(results_count) as avg_results
      FROM search_history 
      WHERE created_at > NOW() - ($1 || ' days')::INTERVAL
    `, [dayCount]);

    const saves = await safeQuery(`
      SELECT 
        COUNT(*) as total_saves,
        COUNT(DISTINCT user_id) as unique_savers,
        AVG(rating) as avg_rating
      FROM saved_apartments 
      WHERE created_at > NOW() - ($1 || ' days')::INTERVAL
    `, [dayCount]);

    const searchByDay = await safeQuery(`
      SELECT 
        DATE_TRUNC('day', created_at) as day,
        COUNT(*) as searches
      FROM search_history
      WHERE created_at > NOW() - ($1 || ' days')::INTERVAL
      GROUP BY day ORDER BY day DESC LIMIT 30
    `, [dayCount]);

    const topSearchLocations = await safeQuery(`
      SELECT 
        search_location->>'city' as city,
        search_location->>'state' as state,
        COUNT(*) as search_count
      FROM search_history
      WHERE search_location IS NOT NULL
        AND created_at > NOW() - ($1 || ' days')::INTERVAL
      GROUP BY city, state
      ORDER BY search_count DESC LIMIT 10
    `, [dayCount]);

    const s = searches[0] || {};
    const sv = saves[0] || {};

    res.json({
      success: true,
      data: {
        period_days: dayCount,
        searches: {
          total: parseInt(s.total_searches) || 0,
          unique_users: parseInt(s.unique_searchers) || 0,
          avg_results_per_search: parseFloat(s.avg_results) || 0
        },
        saves: {
          total: parseInt(sv.total_saves) || 0,
          unique_users: parseInt(sv.unique_savers) || 0,
          avg_rating: parseFloat(sv.avg_rating) || 0
        },
        search_volume_by_day: searchByDay.map(r => ({ day: r.day, searches: parseInt(r.searches) })),
        top_search_locations: topSearchLocations.map(r => ({
          city: r.city, state: r.state, count: parseInt(r.search_count)
        }))
      }
    });
  } catch (error) {
    console.error('User activity error:', error);
    res.status(500).json({ success: false, error: 'Failed to load user activity' });
  }
});

router.get('/demand-signals', async (req, res) => {
  try {
    const budgetDist = await safeQuery(`
      SELECT 
        CASE 
          WHEN budget < 1000 THEN 'under_1000'
          WHEN budget BETWEEN 1000 AND 1499 THEN '1000_1499'
          WHEN budget BETWEEN 1500 AND 1999 THEN '1500_1999'
          WHEN budget BETWEEN 2000 AND 2499 THEN '2000_2499'
          WHEN budget BETWEEN 2500 AND 2999 THEN '2500_2999'
          WHEN budget >= 3000 THEN '3000_plus'
          ELSE 'not_specified'
        END as range,
        COUNT(*) as count
      FROM renter_profiles
      WHERE budget IS NOT NULL
      GROUP BY range ORDER BY count DESC
    `);

    const bedroomDemand = await safeQuery(`
      SELECT preferred_bedrooms, COUNT(*) as count 
      FROM renter_profiles 
      WHERE preferred_bedrooms IS NOT NULL
      GROUP BY preferred_bedrooms ORDER BY count DESC
    `);

    const commuteModes = await safeQuery(`
      SELECT commute_mode, COUNT(*) as count 
      FROM renter_profiles 
      WHERE commute_mode IS NOT NULL
      GROUP BY commute_mode ORDER BY count DESC
    `);

    const locationDemand = await safeQuery(`
      SELECT preferred_location, COUNT(*) as count
      FROM renter_profiles
      WHERE preferred_location IS NOT NULL
      GROUP BY preferred_location ORDER BY count DESC LIMIT 10
    `);

    const prefAmenities = await safeQuery(`
      SELECT up.required_amenities
      FROM user_preferences up
      WHERE up.required_amenities IS NOT NULL
    `);

    const amenityCounts: Record<string, number> = {};
    for (const row of prefAmenities) {
      try {
        const amenities = typeof row.required_amenities === 'string' 
          ? JSON.parse(row.required_amenities) 
          : row.required_amenities;
        if (Array.isArray(amenities)) {
          for (const a of amenities) {
            amenityCounts[a] = (amenityCounts[a] || 0) + 1;
          }
        }
      } catch {}
    }

    const moveInTimeline = await safeQuery(`
      SELECT 
        CASE 
          WHEN move_in_date < NOW() THEN 'immediate'
          WHEN move_in_date < NOW() + INTERVAL '30 days' THEN 'within_30d'
          WHEN move_in_date < NOW() + INTERVAL '60 days' THEN 'within_60d'
          WHEN move_in_date < NOW() + INTERVAL '90 days' THEN 'within_90d'
          ELSE 'beyond_90d'
        END as timeline,
        COUNT(*) as count
      FROM renter_profiles
      WHERE move_in_date IS NOT NULL
      GROUP BY timeline ORDER BY count DESC
    `);

    const avgBudget = await safeQuery(`
      SELECT AVG(budget) as avg, PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY budget) as median
      FROM renter_profiles WHERE budget IS NOT NULL
    `);

    const b = avgBudget[0] || {};

    res.json({
      success: true,
      data: {
        budget: {
          average: Math.round(parseFloat(b.avg) || 0),
          median: Math.round(parseFloat(b.median) || 0),
          distribution: budgetDist.map(r => ({ range: r.range, count: parseInt(r.count) }))
        },
        bedroom_demand: bedroomDemand.map(r => ({ bedrooms: r.preferred_bedrooms, count: parseInt(r.count) })),
        commute_preferences: commuteModes.map(r => ({ mode: r.commute_mode, count: parseInt(r.count) })),
        location_demand: locationDemand.map(r => ({ location: r.preferred_location, count: parseInt(r.count) })),
        top_amenities: Object.entries(amenityCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 15)
          .map(([amenity, count]) => ({ amenity, count })),
        move_in_timeline: moveInTimeline.map(r => ({ timeline: r.timeline, count: parseInt(r.count) }))
      }
    });
  } catch (error) {
    console.error('Demand signals error:', error);
    res.status(500).json({ success: false, error: 'Failed to load demand signals' });
  }
});

router.get('/search-trends', async (req, res) => {
  try {
    const { days = '30' } = req.query;
    const dayCount = Math.min(parseInt(days as string) || 30, 365);

    const priceSearches = await safeQuery(`
      SELECT 
        search_parameters->>'maxPrice' as max_price,
        search_parameters->>'minPrice' as min_price,
        search_parameters->>'bedrooms' as bedrooms,
        search_parameters->>'bathrooms' as bathrooms,
        search_location->>'city' as city,
        search_location->>'state' as state,
        results_count,
        created_at
      FROM search_history
      WHERE created_at > NOW() - ($1 || ' days')::INTERVAL
      ORDER BY created_at DESC LIMIT 100
    `, [dayCount]);

    const searchVolume = await safeQuery(`
      SELECT 
        DATE_TRUNC('day', created_at) as day,
        COUNT(*) as volume,
        AVG(results_count) as avg_results
      FROM search_history
      WHERE created_at > NOW() - ($1 || ' days')::INTERVAL
      GROUP BY day ORDER BY day
    `, [dayCount]);

    const priceRanges = await safeQuery(`
      SELECT 
        CASE 
          WHEN (search_parameters->>'maxPrice')::int < 1000 THEN 'under_1000'
          WHEN (search_parameters->>'maxPrice')::int BETWEEN 1000 AND 1499 THEN '1000_1499'
          WHEN (search_parameters->>'maxPrice')::int BETWEEN 1500 AND 1999 THEN '1500_1999'
          WHEN (search_parameters->>'maxPrice')::int BETWEEN 2000 AND 2499 THEN '2000_2499'
          ELSE '2500_plus'
        END as price_range,
        COUNT(*) as count
      FROM search_history
      WHERE search_parameters->>'maxPrice' IS NOT NULL
        AND created_at > NOW() - ($1 || ' days')::INTERVAL
      GROUP BY price_range ORDER BY count DESC
    `, [dayCount]);

    const noResults = await safeQuery(`
      SELECT 
        search_location->>'city' as city,
        search_parameters->>'bedrooms' as bedrooms,
        search_parameters->>'maxPrice' as max_price,
        COUNT(*) as count
      FROM search_history
      WHERE results_count = 0
        AND created_at > NOW() - ($1 || ' days')::INTERVAL
      GROUP BY city, bedrooms, max_price
      ORDER BY count DESC LIMIT 10
    `, [dayCount]);

    res.json({
      success: true,
      data: {
        period_days: dayCount,
        recent_searches: priceSearches.map(r => ({
          max_price: r.max_price ? parseInt(r.max_price) : null,
          min_price: r.min_price ? parseInt(r.min_price) : null,
          bedrooms: r.bedrooms,
          bathrooms: r.bathrooms,
          city: r.city,
          state: r.state,
          results_count: parseInt(r.results_count) || 0,
          searched_at: r.created_at
        })),
        daily_volume: searchVolume.map(r => ({
          day: r.day,
          volume: parseInt(r.volume),
          avg_results: Math.round(parseFloat(r.avg_results) || 0)
        })),
        price_range_distribution: priceRanges.map(r => ({ range: r.price_range, count: parseInt(r.count) })),
        unmet_demand: noResults.map(r => ({
          city: r.city,
          bedrooms: r.bedrooms,
          max_price: r.max_price ? parseInt(r.max_price) : null,
          frequency: parseInt(r.count)
        }))
      }
    });
  } catch (error) {
    console.error('Search trends error:', error);
    res.status(500).json({ success: false, error: 'Failed to load search trends' });
  }
});

router.get('/user-preferences-aggregate', async (req, res) => {
  try {
    const prefCities = await safeQuery(`
      SELECT up.preferred_cities
      FROM user_preferences up
      WHERE up.preferred_cities IS NOT NULL
    `);

    const cityCounts: Record<string, number> = {};
    for (const row of prefCities) {
      try {
        const cities = typeof row.preferred_cities === 'string'
          ? JSON.parse(row.preferred_cities)
          : row.preferred_cities;
        if (Array.isArray(cities)) {
          for (const c of cities) {
            cityCounts[c] = (cityCounts[c] || 0) + 1;
          }
        }
      } catch {}
    }

    const pricePref = await safeQuery(`
      SELECT 
        AVG(max_price) as avg_max_price,
        MIN(max_price) as min_max_price,
        MAX(max_price) as max_max_price,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY max_price) as median_max_price,
        COUNT(*) as total
      FROM user_preferences
      WHERE max_price IS NOT NULL
    `);

    const bedroomPref = await safeQuery(`
      SELECT min_bedrooms, COUNT(*) as count
      FROM user_preferences
      WHERE min_bedrooms IS NOT NULL
      GROUP BY min_bedrooms ORDER BY min_bedrooms
    `);

    const alertPref = await safeQuery(`
      SELECT 
        COUNT(*) FILTER (WHERE email_alerts = true) as email_alerts,
        COUNT(*) FILTER (WHERE price_drop_alerts = true) as price_drop_alerts,
        COUNT(*) FILTER (WHERE new_listing_alerts = true) as new_listing_alerts,
        COUNT(*) as total
      FROM user_preferences
    `);

    const poiCategories = await safeQuery(`
      SELECT category, COUNT(*) as count, AVG(max_commute_time) as avg_max_commute
      FROM user_pois
      WHERE category IS NOT NULL
      GROUP BY category ORDER BY count DESC
    `);

    const p = pricePref[0] || {};
    const a = alertPref[0] || {};

    res.json({
      success: true,
      data: {
        preferred_cities: Object.entries(cityCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 15)
          .map(([city, count]) => ({ city, count })),
        price_preferences: {
          avg_max_price: Math.round(parseFloat(p.avg_max_price) || 0),
          median_max_price: Math.round(parseFloat(p.median_max_price) || 0),
          min_max_price: parseInt(p.min_max_price) || 0,
          max_max_price: parseInt(p.max_max_price) || 0,
          total_with_preference: parseInt(p.total) || 0
        },
        bedroom_preferences: bedroomPref.map(r => ({ min_bedrooms: parseInt(r.min_bedrooms), count: parseInt(r.count) })),
        alert_preferences: {
          email_alerts: parseInt(a.email_alerts) || 0,
          price_drop_alerts: parseInt(a.price_drop_alerts) || 0,
          new_listing_alerts: parseInt(a.new_listing_alerts) || 0,
          total_users: parseInt(a.total) || 0
        },
        poi_interests: poiCategories.map(r => ({
          category: r.category,
          count: parseInt(r.count),
          avg_max_commute_min: Math.round(parseFloat(r.avg_max_commute) || 0)
        }))
      }
    });
  } catch (error) {
    console.error('User preferences aggregate error:', error);
    res.status(500).json({ success: false, error: 'Failed to load user preference aggregates' });
  }
});

router.get('/absorption-rate', async (req, res) => {
  try {
    const { city, state } = req.query;

    if (!city || !state) {
      return res.status(400).json({
        success: false,
        error: 'City and state are required'
      });
    }

    const rows = await safeQuery(`
      SELECT 
        AVG(days_vacant) as avg_days_to_lease,
        COUNT(DISTINCT id) as properties_tracked
      FROM properties
      WHERE LOWER(city) = LOWER($1) AND LOWER(state) = LOWER($2)
        AND days_vacant IS NOT NULL
    `, [city, state]);

    const absorption = rows[0] || {};
    const avgDays = parseFloat(absorption.avg_days_to_lease) || null;

    res.json({
      success: true,
      data: {
        avg_days_to_lease: avgDays,
        properties_tracked: parseInt(absorption.properties_tracked) || 0,
        monthly_absorption_rate: avgDays ? Math.round((30 / avgDays) * 100) / 100 : null
      }
    });
  } catch (error) {
    console.error('Absorption rate error:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate absorption rate' });
  }
});

// ---------------------------------------------------------------------------
// POST /ingest – Bulk upsert scraped properties from Cloudflare Worker
// ---------------------------------------------------------------------------

const ingestPropertySchema = z.object({
  external_id: z.string().min(1),
  source: z.string().min(1),
  property_id: z.string().nullish(),
  unit_number: z.string().nullish(),
  unit: z.string().nullish(),
  name: z.string().nullish(),
  address: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  zip_code: z.string().nullish(),
  current_price: z.number().int().nullish(),
  bedrooms: z.number().int().min(0).nullish(),
  bathrooms: z.number().min(0).nullish(),
  square_feet: z.number().int().positive().nullish(),
  square_footage: z.number().int().positive().nullish(),
  listing_url: z.string().nullish(),
  image_url: z.string().nullish(),
  unit_features: z.array(z.string()).nullish(),
  amenities: z.array(z.string()).nullish(),
  pet_policy: z.string().nullish(),
  parking_info: z.string().nullish(),
  property_type: z.string().nullish(),
  status: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  concession_type: z.string().nullish(),
  concession_value: z.number().int().nullish(),
  effective_price: z.number().int().nullish(),
  free_rent_concessions: z.string().nullish(),
  security_deposit: z.number().int().nullish(),
  application_fee: z.number().int().nullish(),
  admin_fee_amount: z.number().int().nullish(),
  admin_fee_waived: z.boolean().nullish(),
  days_on_market: z.number().int().min(0).nullish(),
  scraped_at: z.string().nullish(),
});

const ingestBatchSchema = z.object({
  properties: z.array(ingestPropertySchema).min(1).max(500),
});

/** Create the partial unique index once per process lifetime. */
let indexEnsured = false;
async function ensureIngestIndex(): Promise<void> {
  if (indexEnsured) return;
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_scraped_source_external
    ON scraped_properties (source, external_id)
    WHERE source IS NOT NULL AND external_id IS NOT NULL
  `);
  indexEnsured = true;
}

const UPSERT_SQL = `
  INSERT INTO scraped_properties (
    external_id, source, property_id, unit_number, unit, name,
    address, city, state, zip_code,
    current_price, bedrooms, bathrooms, square_feet, square_footage,
    listing_url, image_url, unit_features, amenities,
    pet_policy, parking_info, property_type, status,
    latitude, longitude,
    concession_type, concession_value, effective_price,
    free_rent_concessions, security_deposit, application_fee,
    admin_fee_amount, admin_fee_waived, days_on_market,
    scraped_at, first_seen_at, last_seen_at, updated_at
  ) VALUES (
    $1, $2, $3, $4, $5, $6,
    $7, $8, $9, $10,
    $11, $12, $13, $14, $15,
    $16, $17, $18::jsonb, $19::jsonb,
    $20, $21, $22, $23,
    $24, $25,
    $26, $27, $28,
    $29, $30, $31,
    $32, $33, $34,
    COALESCE($35::timestamptz, NOW()), NOW(), NOW(), NOW()
  )
  ON CONFLICT (source, external_id)
  WHERE source IS NOT NULL AND external_id IS NOT NULL
  DO UPDATE SET
    property_id   = COALESCE(EXCLUDED.property_id, scraped_properties.property_id),
    unit_number   = COALESCE(EXCLUDED.unit_number, scraped_properties.unit_number),
    unit          = COALESCE(EXCLUDED.unit, scraped_properties.unit),
    name          = COALESCE(EXCLUDED.name, scraped_properties.name),
    address       = COALESCE(EXCLUDED.address, scraped_properties.address),
    city          = COALESCE(EXCLUDED.city, scraped_properties.city),
    state         = COALESCE(EXCLUDED.state, scraped_properties.state),
    zip_code      = COALESCE(EXCLUDED.zip_code, scraped_properties.zip_code),
    current_price = EXCLUDED.current_price,
    bedrooms      = COALESCE(EXCLUDED.bedrooms, scraped_properties.bedrooms),
    bathrooms     = COALESCE(EXCLUDED.bathrooms, scraped_properties.bathrooms),
    square_feet   = COALESCE(EXCLUDED.square_feet, scraped_properties.square_feet),
    square_footage= COALESCE(EXCLUDED.square_footage, scraped_properties.square_footage),
    listing_url   = COALESCE(EXCLUDED.listing_url, scraped_properties.listing_url),
    image_url     = COALESCE(EXCLUDED.image_url, scraped_properties.image_url),
    unit_features = COALESCE(EXCLUDED.unit_features, scraped_properties.unit_features),
    amenities     = COALESCE(EXCLUDED.amenities, scraped_properties.amenities),
    pet_policy    = COALESCE(EXCLUDED.pet_policy, scraped_properties.pet_policy),
    parking_info  = COALESCE(EXCLUDED.parking_info, scraped_properties.parking_info),
    property_type = COALESCE(EXCLUDED.property_type, scraped_properties.property_type),
    status        = COALESCE(EXCLUDED.status, scraped_properties.status),
    latitude      = COALESCE(EXCLUDED.latitude, scraped_properties.latitude),
    longitude     = COALESCE(EXCLUDED.longitude, scraped_properties.longitude),
    concession_type       = EXCLUDED.concession_type,
    concession_value      = EXCLUDED.concession_value,
    effective_price       = EXCLUDED.effective_price,
    free_rent_concessions = EXCLUDED.free_rent_concessions,
    security_deposit      = EXCLUDED.security_deposit,
    application_fee       = EXCLUDED.application_fee,
    admin_fee_amount      = EXCLUDED.admin_fee_amount,
    admin_fee_waived      = EXCLUDED.admin_fee_waived,
    days_on_market        = EXCLUDED.days_on_market,
    scraped_at    = COALESCE(EXCLUDED.scraped_at, NOW()),
    last_seen_at  = NOW(),
    updated_at    = NOW(),
    price_change_count = CASE
      WHEN EXCLUDED.current_price IS DISTINCT FROM scraped_properties.current_price
        AND EXCLUDED.current_price IS NOT NULL
      THEN COALESCE(scraped_properties.price_change_count, 0) + 1
      ELSE COALESCE(scraped_properties.price_change_count, 0)
    END,
    last_price_change = CASE
      WHEN EXCLUDED.current_price IS DISTINCT FROM scraped_properties.current_price
        AND EXCLUDED.current_price IS NOT NULL
      THEN NOW()
      ELSE scraped_properties.last_price_change
    END,
    volatility_score = CASE
      WHEN EXCLUDED.current_price IS DISTINCT FROM scraped_properties.current_price
        AND EXCLUDED.current_price IS NOT NULL
      THEN LEAST(100, COALESCE(scraped_properties.volatility_score, 50) + 5)
      ELSE GREATEST(0, COALESCE(scraped_properties.volatility_score, 50) - 1)
    END
  RETURNING (xmax = 0) AS inserted
`;

router.post('/ingest', async (req: Request, res: Response) => {
  try {
    const parseResult = ingestBatchSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: parseResult.error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    await ensureIngestIndex();

    const { properties } = parseResult.data;
    const results = { inserted: 0, updated: 0, errors: [] as { external_id: string; source: string; error: string }[] };

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const prop of properties) {
        try {
          const row = await client.query(UPSERT_SQL, [
            prop.external_id,
            prop.source,
            prop.property_id ?? null,
            prop.unit_number ?? null,
            prop.unit ?? null,
            prop.name ?? null,
            prop.address ?? null,
            prop.city ?? null,
            prop.state ?? null,
            prop.zip_code ?? null,
            prop.current_price ?? null,
            prop.bedrooms ?? null,
            prop.bathrooms ?? null,
            prop.square_feet ?? null,
            prop.square_footage ?? null,
            prop.listing_url ?? null,
            prop.image_url ?? null,
            JSON.stringify(prop.unit_features ?? []),
            JSON.stringify(prop.amenities ?? []),
            prop.pet_policy ?? null,
            prop.parking_info ?? null,
            prop.property_type ?? null,
            prop.status ?? 'active',
            prop.latitude ?? null,
            prop.longitude ?? null,
            prop.concession_type ?? null,
            prop.concession_value ?? null,
            prop.effective_price ?? null,
            prop.free_rent_concessions ?? null,
            prop.security_deposit ?? null,
            prop.application_fee ?? null,
            prop.admin_fee_amount ?? null,
            prop.admin_fee_waived ?? null,
            prop.days_on_market ?? null,
            prop.scraped_at ?? null,
          ]);

          if (row.rows[0]?.inserted) {
            results.inserted++;
          } else {
            results.updated++;
          }
        } catch (err: any) {
          results.errors.push({
            external_id: prop.external_id,
            source: prop.source,
            error: err.message,
          });
        }
      }

      await client.query('COMMIT');
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }

    const status = results.errors.length === properties.length ? 422 : 200;
    res.status(status).json({
      success: results.errors.length < properties.length,
      data: {
        received: properties.length,
        inserted: results.inserted,
        updated: results.updated,
        errors: results.errors.length,
        error_details: results.errors.length > 0 ? results.errors : undefined,
      },
    });
  } catch (error: any) {
    console.error('JEDI ingest error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to ingest properties',
      message: error.message,
    });
  }
});

export default router;
