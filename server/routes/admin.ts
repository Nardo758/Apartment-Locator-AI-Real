/**
 * Admin Panel API Routes
 * Provides market intelligence, property management, and analytics
 */

import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Middleware: Check admin access (TODO: implement proper auth)
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // TODO: Verify user is admin via Supabase auth
  // For now, all authenticated users can access
  next();
};

/**
 * GET /api/admin/dashboard
 * Overview statistics for admin dashboard
 */
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    // Total properties
    const { count: totalProperties } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });

    // Total units
    const { data: unitData } = await supabase
      .from('properties')
      .select('total_units');
    const totalUnits = unitData?.reduce((sum, p) => sum + (p.total_units || 0), 0) || 0;

    // Properties scraped today
    const { count: scrapedToday } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .gte('last_scraped_at', new Date().toISOString().split('T')[0]);

    // Average occupancy
    const { data: occupancyData } = await supabase
      .from('properties')
      .select('current_occupancy_percent')
      .not('current_occupancy_percent', 'is', null);
    const avgOccupancy = occupancyData && occupancyData.length > 0
      ? occupancyData.reduce((sum, p) => sum + (p.current_occupancy_percent || 0), 0) / occupancyData.length
      : 0;

    // User counts by type
    const { data: userData } = await supabase
      .from('user_data_engines')
      .select('user_type');
    const usersByType = {
      renters: userData?.filter(u => u.user_type === 'renter').length || 0,
      landlords: userData?.filter(u => u.user_type === 'landlord').length || 0,
      agents: userData?.filter(u => u.user_type === 'agent').length || 0,
    };

    // Available units
    const { count: availableUnits } = await supabase
      .from('lease_rates')
      .select('*', { count: 'exact', head: true })
      .in('unit_status', ['available', 'coming_soon']);

    res.json({
      properties: {
        total: totalProperties || 0,
        scrapedToday: scrapedToday || 0,
      },
      units: {
        total: totalUnits,
        available: availableUnits || 0,
      },
      occupancy: {
        average: Math.round(avgOccupancy * 10) / 10,
      },
      users: usersByType,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

/**
 * GET /api/admin/properties
 * List all properties with filters and aggregations
 */
router.get('/properties', requireAdmin, async (req, res) => {
  try {
    const {
      city,
      state,
      zipCode,
      propertyClass,
      groupBy, // 'zip' | 'city' | 'state'
      page = '1',
      limit = '50'
    } = req.query;

    // Build query
    let query = supabase
      .from('properties')
      .select(`
        *,
        lease_rates(count),
        concessions(count)
      `);

    // Apply filters
    if (city) query = query.eq('city', city);
    if (state) query = query.eq('state', state);
    if (zipCode) query = query.eq('zip_code', zipCode);
    if (propertyClass) query = query.eq('property_class', propertyClass);

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    query = query.range((pageNum - 1) * limitNum, pageNum * limitNum - 1);

    const { data: properties, error, count } = await query;

    if (error) throw error;

    // If groupBy requested, aggregate data
    if (groupBy) {
      const grouped = await getGroupedProperties(groupBy as string, { city, state, zipCode, propertyClass });
      return res.json({ grouped, total: count });
    }

    res.json({
      properties,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        pages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error) {
    console.error('Properties list error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

/**
 * GET /api/admin/properties/grouped
 * Properties grouped by zip/city/state with unit counts
 */
router.get('/properties/grouped', requireAdmin, async (req, res) => {
  try {
    const { groupBy = 'city', state, city } = req.query;

    let query = supabase.from('market_overview').select('*');
    
    if (state) query = query.eq('state', state);
    if (city) query = query.eq('city', city);

    const { data, error } = await query;

    if (error) throw error;

    res.json({ markets: data });
  } catch (error) {
    console.error('Grouped properties error:', error);
    res.status(500).json({ error: 'Failed to fetch grouped data' });
  }
});

/**
 * GET /api/admin/units
 * Unit mix breakdown across all properties
 */
router.get('/units', requireAdmin, async (req, res) => {
  try {
    const { city, state, zipCode, unitType } = req.query;

    let query = supabase
      .from('lease_rates')
      .select(`
        *,
        properties!inner(city, state, zip_code)
      `);

    // Apply filters
    if (city) query = query.eq('properties.city', city);
    if (state) query = query.eq('properties.state', state);
    if (zipCode) query = query.eq('properties.zip_code', zipCode);
    if (unitType) query = query.eq('unit_type', unitType);

    const { data: units, error } = await query;

    if (error) throw error;

    // Aggregate by unit type
    const unitMix = units?.reduce((acc: any, unit: any) => {
      const type = unit.unit_type;
      if (!acc[type]) {
        acc[type] = {
          unitType: type,
          count: 0,
          available: 0,
          totalRent: 0,
          minRent: Infinity,
          maxRent: 0,
        };
      }
      acc[type].count++;
      if (unit.unit_status === 'available' || unit.unit_status === 'coming_soon') {
        acc[type].available++;
      }
      acc[type].totalRent += unit.rent_amount || 0;
      acc[type].minRent = Math.min(acc[type].minRent, unit.rent_amount || Infinity);
      acc[type].maxRent = Math.max(acc[type].maxRent, unit.rent_amount || 0);
      return acc;
    }, {});

    const summary = Object.values(unitMix || {}).map((mix: any) => ({
      ...mix,
      avgRent: Math.round(mix.totalRent / mix.count),
      occupancyRate: ((mix.count - mix.available) / mix.count * 100).toFixed(1),
    }));

    res.json({ unitMix: summary, total: units?.length || 0 });
  } catch (error) {
    console.error('Unit mix error:', error);
    res.status(500).json({ error: 'Failed to fetch unit data' });
  }
});

/**
 * GET /api/admin/availability-forecast
 * Units becoming available in next 90/180 days
 */
router.get('/availability-forecast', requireAdmin, async (req, res) => {
  try {
    const { city, state, days = '90' } = req.query;

    const { data, error } = await supabase
      .from('unit_availability_forecast')
      .select('*')
      .gte('available_date', new Date().toISOString().split('T')[0])
      .lte('available_date', new Date(Date.now() + parseInt(days as string) * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .eq('city', city || undefined)
      .eq('state', state || undefined);

    if (error) throw error;

    res.json({ forecast: data });
  } catch (error) {
    console.error('Availability forecast error:', error);
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

/**
 * GET /api/admin/rent-growth
 * Rent growth trends by market
 */
router.get('/rent-growth', requireAdmin, async (req, res) => {
  try {
    const { city, state, months = '12' } = req.query;

    let query = supabase
      .from('rent_growth_analysis')
      .select('*')
      .order('month', { ascending: false })
      .limit(parseInt(months as string));

    if (city) query = query.eq('city', city);
    if (state) query = query.eq('state', state);

    const { data, error } = await query;

    if (error) throw error;

    res.json({ rentGrowth: data });
  } catch (error) {
    console.error('Rent growth error:', error);
    res.status(500).json({ error: 'Failed to fetch rent growth' });
  }
});

/**
 * GET /api/admin/demand-signals
 * User demand data (lease expirations, budgets, preferences)
 */
router.get('/demand-signals', requireAdmin, async (req, res) => {
  try {
    const { city, state, days = '90' } = req.query;

    // Get renter data
    const { data: renters, error } = await supabase
      .from('user_data_engines')
      .select('engine_data')
      .eq('user_type', 'renter');

    if (error) throw error;

    // Analyze demand signals
    const signals = renters?.map(r => r.engine_data).filter(Boolean) || [];
    
    // Filter by location and lease expiration
    const relevantSignals = signals.filter((signal: any) => {
      const matchesLocation = !city || signal.locationPreferences?.preferredCities?.includes(city);
      const matchesState = !state || signal.locationPreferences?.preferredStates?.includes(state);
      
      if (signal.leaseExpiration) {
        const expirationDate = new Date(signal.leaseExpiration);
        const cutoffDate = new Date(Date.now() + parseInt(days as string) * 24 * 60 * 60 * 1000);
        const hasUpcomingExpiration = expirationDate <= cutoffDate && expirationDate >= new Date();
        return (matchesLocation || matchesState) && hasUpcomingExpiration;
      }
      
      return matchesLocation || matchesState;
    });

    // Aggregate demand data
    const demandSummary = {
      totalRenters: relevantSignals.length,
      leaseExpirationsNext90Days: relevantSignals.filter((s: any) => {
        if (!s.leaseExpiration) return false;
        const exp = new Date(s.leaseExpiration);
        return exp <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      }).length,
      avgBudget: relevantSignals.reduce((sum: number, s: any) => 
        sum + ((s.budget?.max || s.budget?.min || 0)), 0) / (relevantSignals.length || 1),
      bedroomDemand: relevantSignals.reduce((acc: any, s: any) => {
        const beds = s.propertyRequirements?.bedrooms || 'unknown';
        acc[beds] = (acc[beds] || 0) + 1;
        return acc;
      }, {}),
      topAmenities: getTopPreferences(relevantSignals, 'apartmentPreferences'),
    };

    res.json({ demand: demandSummary, signals: relevantSignals.slice(0, 100) });
  } catch (error) {
    console.error('Demand signals error:', error);
    res.status(500).json({ error: 'Failed to fetch demand data' });
  }
});

/**
 * GET /api/admin/scraping-stats
 * Scraping success rates and data quality metrics
 */
router.get('/scraping-stats', requireAdmin, async (req, res) => {
  try {
    const { data: properties } = await supabase
      .from('properties')
      .select('last_scraped_at, source_url, city, state');

    const stats = {
      totalProperties: properties?.length || 0,
      scrapedLast24h: properties?.filter(p => {
        const scraped = new Date(p.last_scraped_at);
        return scraped >= new Date(Date.now() - 24 * 60 * 60 * 1000);
      }).length || 0,
      scrapedLast7d: properties?.filter(p => {
        const scraped = new Date(p.last_scraped_at);
        return scraped >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }).length || 0,
      bySources: properties?.reduce((acc: any, p) => {
        const source = new URL(p.source_url || '').hostname || 'unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {}),
      byMarket: properties?.reduce((acc: any, p) => {
        const key = `${p.city}, ${p.state}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    };

    res.json({ stats });
  } catch (error) {
    console.error('Scraping stats error:', error);
    res.status(500).json({ error: 'Failed to fetch scraping stats' });
  }
});

// Helper functions
async function getGroupedProperties(groupBy: string, filters: any) {
  const { data } = await supabase
    .from('market_overview')
    .select('*');

  return data;
}

function getTopPreferences(signals: any[], field: string) {
  const allPrefs: any = {};
  signals.forEach(s => {
    const prefs = s[field];
    if (prefs) {
      Object.entries(prefs).forEach(([key, value]) => {
        if (value === true || (Array.isArray(value) && value.length > 0)) {
          allPrefs[key] = (allPrefs[key] || 0) + 1;
        }
      });
    }
  });
  
  return Object.entries(allPrefs)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 10)
    .map(([key, count]) => ({ preference: key, count }));
}

export default router;
