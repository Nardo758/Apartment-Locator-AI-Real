/**
 * JEDI RE Integration API
 * Provides market intelligence data for real estate investment analysis
 */

import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

/**
 * GET /api/jedi/market-data
 * Comprehensive market intelligence for a location
 */
router.get('/market-data', async (req, res) => {
  try {
    const { city, state, zipCode, radius = '3' } = req.query;

    if (!city && !zipCode) {
      return res.status(400).json({ error: 'City or zipCode required' });
    }

    // Get market overview
    let overviewQuery = supabase.from('market_overview').select('*');
    if (city) overviewQuery = overviewQuery.eq('city', city);
    if (state) overviewQuery = overviewQuery.eq('state', state);
    if (zipCode) overviewQuery = overviewQuery.eq('zip_code', zipCode);

    const { data: overview, error: overviewError } = await overviewQuery;
    if (overviewError) throw overviewError;

    const marketData = overview?.[0] || {};

    // Get rent data by unit type
    const { data: rentData } = await supabase
      .from('lease_rates')
      .select(`
        unit_type,
        rent_amount,
        square_feet,
        available_date,
        unit_status,
        properties!inner(city, state, zip_code)
      `)
      .eq('properties.city', city || undefined)
      .eq('properties.state', state || undefined)
      .eq('properties.zip_code', zipCode || undefined);

    const avgRentByType = rentData?.reduce((acc: any, unit) => {
      const type = unit.unit_type;
      if (!acc[type]) {
        acc[type] = { total: 0, count: 0, available: 0 };
      }
      acc[type].total += unit.rent_amount;
      acc[type].count++;
      if (unit.unit_status === 'available' || unit.unit_status === 'coming_soon') {
        acc[type].available++;
      }
      return acc;
    }, {});

    const rentByType: any = {};
    Object.entries(avgRentByType || {}).forEach(([type, data]: any) => {
      rentByType[type] = Math.round(data.total / data.count);
    });

    // Get rent growth
    const { data: rentGrowth } = await supabase
      .from('rent_growth_analysis')
      .select('*')
      .eq('city', city || undefined)
      .eq('state', state || undefined)
      .order('month', { ascending: false })
      .limit(1);

    // Get concession prevalence
    const { data: properties } = await supabase
      .from('properties')
      .select('id, concessions(count)')
      .eq('city', city || undefined)
      .eq('state', state || undefined);

    const propertiesWithConcessions = properties?.filter(p => 
      (p.concessions as any)?.[0]?.count > 0
    ).length || 0;
    const concessionsPrevalence = properties && properties.length > 0
      ? (propertiesWithConcessions / properties.length) * 100
      : 0;

    // Get user demand data
    const { data: renters } = await supabase
      .from('user_data_engines')
      .select('engine_data')
      .eq('user_type', 'renter');

    const relevantRenters = renters?.filter(r => {
      const data = r.engine_data as any;
      return data?.locationPreferences?.preferredCities?.includes(city) ||
             data?.locationPreferences?.preferredStates?.includes(state);
    }) || [];

    const avgBudget = relevantRenters.reduce((sum, r) => {
      const data = r.engine_data as any;
      return sum + (data?.budget?.max || data?.budget?.min || 0);
    }, 0) / (relevantRenters.length || 1);

    const leaseExpirationsNext90Days = relevantRenters.filter(r => {
      const data = r.engine_data as any;
      if (!data?.leaseExpiration) return false;
      const exp = new Date(data.leaseExpiration);
      const cutoff = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      return exp <= cutoff && exp >= new Date();
    }).length;

    // Get supply forecast
    const { data: forecast } = await supabase
      .from('unit_availability_forecast')
      .select('*')
      .eq('city', city || undefined)
      .eq('state', state || undefined)
      .gte('available_date', new Date().toISOString().split('T')[0]);

    const unitsNext90Days = forecast?.filter(f => {
      const availDate = new Date(f.available_date);
      return availDate <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    }).reduce((sum, f) => sum + f.units_available, 0) || 0;

    const unitsNext180Days = forecast?.reduce((sum, f) => {
      const availDate = new Date(f.available_date);
      if (availDate <= new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)) {
        return sum + f.units_available;
      }
      return sum;
    }, 0) || 0;

    // Calculate projected absorption
    const avgDaysToLease = marketData.avg_days_to_lease || 45;
    const projectedAbsorptionDays = Math.round(
      (unitsNext90Days / (relevantRenters.length || 1)) * avgDaysToLease
    );

    // Compile response
    const response = {
      location: {
        city: city || marketData.city,
        state: state || marketData.state,
        zipCode: zipCode || marketData.zip_code,
      },
      supply: {
        totalProperties: marketData.total_properties || 0,
        totalUnits: marketData.total_units || 0,
        availableUnits: Object.values(avgRentByType || {}).reduce((sum: number, d: any) => sum + d.available, 0),
        avgOccupancy: marketData.avg_occupancy || 0,
        classDistribution: {
          A: marketData.class_a_count || 0,
          B: marketData.class_b_count || 0,
          C: marketData.class_c_count || 0,
        },
      },
      pricing: {
        avgRentByType: rentByType,
        rentGrowthYoY: rentGrowth?.[0]?.yoy_change_percent || 0,
        rentGrowthMoM: rentGrowth?.[0]?.mom_change_percent || 0,
        concessionsPrevalence: Math.round(concessionsPrevalence * 10) / 10,
      },
      demand: {
        rentersSearching: relevantRenters.length,
        avgBudget: Math.round(avgBudget),
        leaseExpirationsNext90Days,
        topPreferences: getTopAmenityPreferences(relevantRenters),
      },
      forecast: {
        unitsDeliveringNext90Days: unitsNext90Days,
        unitsDeliveringNext180Days: unitsNext180Days,
        projectedAbsorptionDays,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Market data error:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

/**
 * GET /api/jedi/rent-comps
 * Comparable rent data for underwriting
 */
router.get('/rent-comps', async (req, res) => {
  try {
    const { 
      city, 
      state, 
      zipCode,
      unitType,
      minSqft,
      maxSqft,
      radius = '3',
      limit = '10'
    } = req.query;

    // Build query
    let query = supabase
      .from('lease_rates')
      .select(`
        *,
        properties!inner(
          id,
          name,
          address,
          city,
          state,
          zip_code,
          latitude,
          longitude,
          amenities,
          property_class,
          year_built
        ),
        concessions(concession_type, description, value_amount)
      `)
      .in('unit_status', ['available', 'coming_soon']);

    if (city) query = query.eq('properties.city', city);
    if (state) query = query.eq('properties.state', state);
    if (zipCode) query = query.eq('properties.zip_code', zipCode);
    if (unitType) query = query.eq('unit_type', unitType);
    if (minSqft) query = query.gte('square_feet', minSqft);
    if (maxSqft) query = query.lte('square_feet', maxSqft);

    query = query.limit(parseInt(limit as string));

    const { data: comps, error } = await query;
    if (error) throw error;

    // Format response
    const comparables = comps?.map((comp: any) => ({
      propertyId: comp.properties.id,
      propertyName: comp.properties.name,
      address: comp.properties.address,
      city: comp.properties.city,
      state: comp.properties.state,
      zipCode: comp.properties.zip_code,
      unitType: comp.unit_type,
      rent: comp.rent_amount,
      sqft: comp.square_feet,
      pricePerSqft: comp.square_feet ? Math.round(comp.rent_amount / comp.square_feet * 100) / 100 : null,
      amenities: comp.properties.amenities || [],
      propertyClass: comp.properties.property_class,
      yearBuilt: comp.properties.year_built,
      concessions: comp.concessions?.map((c: any) => c.description) || [],
      availableDate: comp.available_date,
    })) || [];

    res.json({ comparables, total: comparables.length });
  } catch (error) {
    console.error('Rent comps error:', error);
    res.status(500).json({ error: 'Failed to fetch rent comparables' });
  }
});

/**
 * GET /api/jedi/supply-pipeline
 * Properties and units coming online (for competition analysis)
 */
router.get('/supply-pipeline', async (req, res) => {
  try {
    const { city, state, zipCode, days = '180' } = req.query;

    const cutoffDate = new Date(Date.now() + parseInt(days as string) * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('unit_availability_forecast')
      .select('*')
      .eq('city', city || undefined)
      .eq('state', state || undefined)
      .eq('zip_code', zipCode || undefined)
      .gte('available_date', new Date().toISOString().split('T')[0])
      .lte('available_date', cutoffDate.toISOString().split('T')[0])
      .order('available_date');

    if (error) throw error;

    // Group by month
    const byMonth = data?.reduce((acc: any, item) => {
      const month = item.availability_month;
      if (!acc[month]) {
        acc[month] = {
          month,
          totalUnits: 0,
          avgRent: 0,
          unitTypes: {},
        };
      }
      acc[month].totalUnits += item.units_available;
      acc[month].avgRent = ((acc[month].avgRent * (acc[month].totalUnits - item.units_available)) + (item.avg_rent * item.units_available)) / acc[month].totalUnits;
      acc[month].unitTypes[item.unit_type] = (acc[month].unitTypes[item.unit_type] || 0) + item.units_available;
      return acc;
    }, {});

    res.json({ 
      pipeline: Object.values(byMonth || {}),
      total: data?.reduce((sum, d) => sum + d.units_available, 0) || 0,
    });
  } catch (error) {
    console.error('Supply pipeline error:', error);
    res.status(500).json({ error: 'Failed to fetch supply pipeline' });
  }
});

/**
 * GET /api/jedi/absorption-rate
 * Historical absorption metrics for lease-up projections
 */
router.get('/absorption-rate', async (req, res) => {
  try {
    const { city, state, propertyClass } = req.query;

    let query = supabase
      .from('properties')
      .select('avg_days_to_lease, current_occupancy_percent, total_units, property_class, year_built');

    if (city) query = query.eq('city', city);
    if (state) query = query.eq('state', state);
    if (propertyClass) query = query.eq('property_class', propertyClass);

    const { data: properties, error } = await query;
    if (error) throw error;

    const avgDaysToLease = properties?.reduce((sum, p) => sum + (p.avg_days_to_lease || 0), 0) / (properties?.length || 1);
    const avgOccupancy = properties?.reduce((sum, p) => sum + (p.current_occupancy_percent || 0), 0) / (properties?.length || 1);

    // Calculate absorption rate (units per month)
    const totalUnits = properties?.reduce((sum, p) => sum + (p.total_units || 0), 0) || 0;
    const unitsPerMonth = totalUnits / (avgDaysToLease / 30);

    res.json({
      avgDaysToLease: Math.round(avgDaysToLease),
      avgOccupancy: Math.round(avgOccupancy * 10) / 10,
      unitsPerMonth: Math.round(unitsPerMonth * 10) / 10,
      sampleSize: properties?.length || 0,
    });
  } catch (error) {
    console.error('Absorption rate error:', error);
    res.status(500).json({ error: 'Failed to calculate absorption rate' });
  }
});

// Helper functions
function getTopAmenityPreferences(renters: any[]) {
  const amenityCounts: any = {};
  
  renters.forEach(renter => {
    const data = renter.engine_data as any;
    const prefs = data?.apartmentPreferences;
    
    if (prefs) {
      Object.entries(prefs).forEach(([key, value]) => {
        if (value === true) {
          amenityCounts[key] = (amenityCounts[key] || 0) + 1;
        }
      });
    }
  });

  return Object.entries(amenityCounts)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 10)
    .map(([amenity, count]) => amenity);
}

export default router;
