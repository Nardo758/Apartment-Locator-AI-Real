/**
 * Scraped Properties API v2 - Comprehensive Feature Queries
 * Enhanced endpoints with 50+ feature filters
 */

import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// =============================================
// SEARCH WITH COMPREHENSIVE FILTERS
// =============================================

/**
 * GET /api/v2/scraped-properties/search
 * Search properties with comprehensive filters
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const {
      // Basic filters
      city,
      state,
      min_price,
      max_price,
      bedrooms,
      bathrooms,
      min_sqft,
      max_sqft,
      furnished,
      
      // Building amenities
      pool_type,
      has_elevator,
      has_package_room,
      laundry_type,
      has_business_center,
      has_rooftop,
      has_courtyard,
      has_bike_storage,
      has_storage_units,
      has_controlled_access,
      has_doorman,
      has_concierge,
      
      // Utilities
      heat_included,
      water_included,
      electric_included,
      utilities_included, // "any" = at least one, "all" = all three
      
      // Pet policy
      dogs_allowed,
      cats_allowed,
      pet_friendly, // either dogs OR cats
      max_pet_weight,
      
      // Parking
      parking_included,
      parking_type,
      has_ev_charging,
      
      // Accessibility
      wheelchair_accessible,
      first_floor_available,
      
      // Security
      has_security_system,
      has_video_surveillance,
      is_gated,
      has_onsite_security,
      
      // Lease terms
      short_term_available,
      month_to_month,
      
      // Location
      near_transit,
      near_grocery,
      near_parks,
      quiet_neighborhood,
      min_walkability_score,
      
      // In-unit features
      ac_type,
      heating_type,
      has_dishwasher,
      has_disposal,
      washer_dryer,
      has_balcony,
      has_walk_in_closets,
      has_hardwood_floors,
      has_fireplace,
      has_high_ceilings,
      has_updated_kitchen,
      has_stainless_appliances,
      countertop_type,
      
      // Pagination
      limit = 50,
      offset = 0,
      
      // Sorting
      sort_by = 'price', // 'price', 'sqft', 'bedrooms', 'walkability'
      sort_order = 'asc', // 'asc', 'desc'
    } = req.query;
    
    // Build query
    let query = supabase
      .from('property_listings_comprehensive')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (city) query = query.ilike('city', `%${city}%`);
    if (state) query = query.ilike('state', state as string);
    if (min_price) query = query.gte('min_price', parseInt(min_price as string));
    if (max_price) query = query.lte('max_price', parseInt(max_price as string));
    if (bedrooms) query = query.gte('min_bedrooms', parseInt(bedrooms as string));
    if (bathrooms) query = query.gte('min_bathrooms', parseFloat(bathrooms as string));
    if (min_sqft) query = query.gte('min_sqft', parseInt(min_sqft as string));
    if (max_sqft) query = query.lte('max_sqft', parseInt(max_sqft as string));
    
    // Building amenities
    if (pool_type && pool_type !== 'none') query = query.eq('pool_type', pool_type);
    if (has_elevator === 'true') query = query.eq('has_elevator', true);
    if (laundry_type) query = query.eq('laundry_type', laundry_type);
    
    // Utilities
    if (heat_included === 'true') query = query.eq('heat_included', true);
    if (water_included === 'true') query = query.eq('water_included', true);
    if (electric_included === 'true') query = query.eq('electric_included', true);
    
    // Pet policy
    if (dogs_allowed === 'true') query = query.eq('dogs_allowed', true);
    if (cats_allowed === 'true') query = query.eq('cats_allowed', true);
    if (pet_friendly === 'true') {
      // Either dogs OR cats allowed
      query = query.or('dogs_allowed.eq.true,cats_allowed.eq.true');
    }
    
    // Parking
    if (parking_included === 'true') query = query.eq('parking_included', true);
    
    // Sorting
    let orderColumn = 'min_price';
    if (sort_by === 'sqft') orderColumn = 'min_sqft';
    else if (sort_by === 'bedrooms') orderColumn = 'min_bedrooms';
    
    query = query.order(orderColumn, { ascending: sort_order === 'asc' });
    
    // Pagination
    query = query.range(
      parseInt(offset as string),
      parseInt(offset as string) + parseInt(limit as string) - 1
    );
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    res.json({
      properties: data || [],
      total: count || 0,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      filters_applied: Object.keys(req.query).length - 2, // minus limit/offset
    });
    
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// GET PROPERTY WITH ALL FEATURES
// =============================================

/**
 * GET /api/v2/scraped-properties/:id
 * Get complete property details with all features
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get property details
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
    
    if (propError) throw propError;
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Get property features
    const { data: features, error: featError } = await supabase
      .from('property_features')
      .select('*')
      .eq('property_id', id)
      .maybeSingle();
    
    // Get lease rates with unit features
    const { data: leaseRates, error: lrError } = await supabase
      .from('lease_rates')
      .select(`
        *,
        unit_features (*)
      `)
      .eq('property_id', id)
      .order('price', { ascending: true });
    
    // Get concessions
    const { data: concessions, error: concError } = await supabase
      .from('concessions')
      .select('*')
      .eq('property_id', id)
      .eq('active', true);
    
    // Get amenities
    const { data: amenities, error: amenError } = await supabase
      .from('property_amenities')
      .select('amenities(name)')
      .eq('property_id', id);
    
    res.json({
      property,
      features: features || {},
      lease_rates: leaseRates || [],
      concessions: concessions || [],
      amenities: amenities?.map(a => (a as any).amenities.name) || [],
    });
    
  } catch (error: any) {
    console.error('Get property error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// FILTER OPTIONS (FOR DROPDOWNS)
// =============================================

/**
 * GET /api/v2/scraped-properties/filters/options
 * Get available filter options with counts
 */
router.get('/filters/options', async (req: Request, res: Response) => {
  try {
    // Get unique values for filter dropdowns
    const { data: properties } = await supabase
      .from('property_features')
      .select('pool_type, laundry_type, parking_type');
    
    const { data: units } = await supabase
      .from('unit_features')
      .select('ac_type, heating_type, washer_dryer, countertop_type');
    
    // Count occurrences
    const poolTypes = countOccurrences(properties, 'pool_type');
    const laundryTypes = countOccurrences(properties, 'laundry_type');
    const parkingTypes = countOccurrences(properties, 'parking_type');
    const acTypes = countOccurrences(units, 'ac_type');
    const heatingTypes = countOccurrences(units, 'heating_type');
    const washerDryerOptions = countOccurrences(units, 'washer_dryer');
    const countertopTypes = countOccurrences(units, 'countertop_type');
    
    res.json({
      building_amenities: {
        pool_type: poolTypes,
        laundry_type: laundryTypes,
        parking_type: parkingTypes,
      },
      unit_features: {
        ac_type: acTypes,
        heating_type: heatingTypes,
        washer_dryer: washerDryerOptions,
        countertop_type: countertopTypes,
      },
    });
    
  } catch (error: any) {
    console.error('Get filter options error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// MATCH PROPERTIES TO USER PREFERENCES
// =============================================

/**
 * POST /api/v2/scraped-properties/match
 * Match properties to user preferences
 * Body: { user_preferences: {...} }
 */
router.post('/match', async (req: Request, res: Response) => {
  try {
    const { user_preferences } = req.body;
    
    if (!user_preferences) {
      return res.status(400).json({ error: 'user_preferences required' });
    }
    
    // Build query based on preferences
    let query = supabase
      .from('property_listings_comprehensive')
      .select('*', { count: 'exact' });
    
    // Apply must-have filters
    const {
      city,
      state,
      max_budget,
      min_bedrooms,
      min_bathrooms,
      must_allow_dogs,
      must_allow_cats,
      must_have_parking,
      must_have_laundry_in_unit,
      must_have_pool,
      must_have_gym,
      must_have_balcony,
    } = user_preferences;
    
    // Location
    if (city) query = query.ilike('city', `%${city}%`);
    if (state) query = query.ilike('state', state);
    
    // Budget
    if (max_budget) query = query.lte('min_price', max_budget);
    
    // Bedrooms/bathrooms
    if (min_bedrooms) query = query.gte('min_bedrooms', min_bedrooms);
    if (min_bathrooms) query = query.gte('min_bathrooms', min_bathrooms);
    
    // Deal breakers (must-haves)
    if (must_allow_dogs) query = query.eq('dogs_allowed', true);
    if (must_allow_cats) query = query.eq('cats_allowed', true);
    if (must_have_parking) query = query.eq('parking_included', true);
    if (must_have_laundry_in_unit) query = query.eq('laundry_type', 'in-unit');
    if (must_have_pool) query = query.neq('pool_type', 'none');
    
    // Fetch matching properties
    const { data, error, count } = await query
      .order('min_price', { ascending: true })
      .limit(50);
    
    if (error) throw error;
    
    // Calculate match scores (0-100)
    const scoredProperties = (data || []).map((property: any) => {
      let score = 0;
      let maxScore = 0;
      
      // Nice-to-haves (each worth points)
      const preferences = user_preferences.nice_to_haves || [];
      
      preferences.forEach((pref: string) => {
        maxScore += 10;
        
        // Check if property has this feature
        if (pref === 'elevator' && property.has_elevator) score += 10;
        if (pref === 'balcony' && property.has_balcony) score += 10;
        if (pref === 'hardwood_floors' && property.has_hardwood_floors) score += 10;
        if (pref === 'updated_kitchen' && property.has_updated_kitchen) score += 10;
        if (pref === 'dishwasher' && property.has_dishwasher) score += 10;
        if (pref === 'high_ceilings' && property.has_high_ceilings) score += 10;
        if (pref === 'fireplace' && property.has_fireplace) score += 10;
        // Add more mappings as needed
      });
      
      // Utilities included (bonus points)
      if (property.heat_included) score += 5;
      if (property.water_included) score += 5;
      if (property.electric_included) score += 5;
      maxScore += 15;
      
      const matchPercentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      
      return {
        ...property,
        match_score: matchPercentage,
        matched_features: score / 10, // number of features matched
      };
    });
    
    // Sort by match score descending
    scoredProperties.sort((a, b) => b.match_score - a.match_score);
    
    res.json({
      properties: scoredProperties,
      total_matches: count || 0,
      preferences_applied: Object.keys(user_preferences).length,
    });
    
  } catch (error: any) {
    console.error('Match error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// STATISTICS
// =============================================

/**
 * GET /api/v2/scraped-properties/stats
 * Get aggregated statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { city, state } = req.query;
    
    // Build base query
    let query = supabase
      .from('property_listings_comprehensive')
      .select('*');
    
    if (city) query = query.ilike('city', `%${city}%`);
    if (state) query = query.ilike('state', state as string);
    
    const { data } = await query;
    
    if (!data || data.length === 0) {
      return res.json({
        total_properties: 0,
        avg_rent: 0,
        median_rent: 0,
        rent_range: { min: 0, max: 0 },
      });
    }
    
    // Calculate stats
    const prices = data.map(p => p.min_price).filter(Boolean).sort((a, b) => a - b);
    const avgRent = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const medianRent = prices[Math.floor(prices.length / 2)];
    
    // Feature stats
    const withPool = data.filter(p => p.pool_type && p.pool_type !== 'none').length;
    const withParking = data.filter(p => p.parking_included).length;
    const petFriendly = data.filter(p => p.dogs_allowed || p.cats_allowed).length;
    const withLaundryInUnit = data.filter(p => p.laundry_type === 'in-unit').length;
    
    res.json({
      total_properties: data.length,
      avg_rent: avgRent,
      median_rent: medianRent,
      rent_range: {
        min: Math.min(...prices),
        max: Math.max(...prices),
      },
      features: {
        with_pool: { count: withPool, percentage: Math.round((withPool / data.length) * 100) },
        with_parking: { count: withParking, percentage: Math.round((withParking / data.length) * 100) },
        pet_friendly: { count: petFriendly, percentage: Math.round((petFriendly / data.length) * 100) },
        laundry_in_unit: { count: withLaundryInUnit, percentage: Math.round((withLaundryInUnit / data.length) * 100) },
      },
    });
    
  } catch (error: any) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// HELPERS
// =============================================

function countOccurrences(data: any[], field: string): Record<string, number> {
  const counts: Record<string, number> = {};
  
  if (!data) return counts;
  
  data.forEach(item => {
    const value = item[field];
    if (value) {
      counts[value] = (counts[value] || 0) + 1;
    }
  });
  
  return counts;
}

export default router;
