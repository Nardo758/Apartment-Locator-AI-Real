/**
 * Scraped Properties API Routes
 * Queries the apartment-scraper-worker Supabase tables
 */

import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Initialize Supabase client (same database as apartment-scraper-worker)
const supabaseUrl = process.env.SUPABASE_URL || 'https://jdymvpasjsdbryatscux.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  console.error('Warning: SUPABASE_ANON_KEY not set. Scraped properties API will not work.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * GET /api/scraped-properties
 * Search for scraped properties with filters
 */
router.get('/', async (req, res) => {
  try {
    const {
      city,
      state,
      min_price,
      max_price,
      min_beds,
      amenity,
      limit = 50,
      offset = 0,
    } = req.query;

    let query = supabase
      .from('property_listings')
      .select('*')
      .order('min_price', { ascending: true })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    // Apply filters
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    if (state) {
      query = query.ilike('state', state as string);
    }
    if (min_price) {
      query = query.gte('min_price', Number(min_price) * 100); // Convert to cents
    }
    if (max_price) {
      query = query.lte('max_price', Number(max_price) * 100);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching properties:', error);
      return res.status(500).json({ error: 'Failed to fetch properties' });
    }

    // Convert prices back to dollars for display
    const properties = data?.map(p => ({
      ...p,
      min_price: p.min_price ? p.min_price / 100 : null,
      max_price: p.max_price ? p.max_price / 100 : null,
    })) || [];

    res.json({
      properties,
      total: count,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error: any) {
    console.error('Error in scraped properties search:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scraped-properties/:id
 * Get detailed property information including all lease rates
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get property details
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (propError || !property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Get lease rates
    const { data: leaseRates, error: ratesError } = await supabase
      .from('lease_rates')
      .select('*')
      .eq('property_id', id)
      .order('price', { ascending: true });

    if (ratesError) {
      console.error('Error fetching lease rates:', ratesError);
    }

    // Get concessions
    const { data: concessions, error: concessionsError } = await supabase
      .from('concessions')
      .select('*')
      .eq('property_id', id)
      .eq('active', true);

    if (concessionsError) {
      console.error('Error fetching concessions:', concessionsError);
    }

    // Get amenities
    const { data: amenities, error: amenitiesError } = await supabase
      .from('property_amenities')
      .select('amenity_id, amenities(name)')
      .eq('property_id', id);

    if (amenitiesError) {
      console.error('Error fetching amenities:', amenitiesError);
    }

    // Convert prices to dollars
    const formattedRates = leaseRates?.map(rate => ({
      ...rate,
      price: rate.price / 100,
    })) || [];

    res.json({
      property,
      lease_rates: formattedRates,
      concessions: concessions || [],
      amenities: amenities?.map((a: any) => a.amenities?.name).filter(Boolean) || [],
    });
  } catch (error: any) {
    console.error('Error fetching property details:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scraped-properties/:id/available-units
 * Get all available units for a property
 */
router.get('/:id/available-units', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('available_units')
      .select('*')
      .eq('id', id) // This queries using the property_id through the view
      .order('monthly_rent', { ascending: true });

    if (error) {
      console.error('Error fetching available units:', error);
      return res.status(500).json({ error: 'Failed to fetch available units' });
    }

    res.json({ units: data || [] });
  } catch (error: any) {
    console.error('Error in available units query:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scraped-properties/:id/concessions
 * Get active concessions for a property
 */
router.get('/:id/concessions', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('active_concessions')
      .select('*')
      .eq('id', id); // Through the view

    if (error) {
      console.error('Error fetching concessions:', error);
      return res.status(500).json({ error: 'Failed to fetch concessions' });
    }

    res.json({ concessions: data || [] });
  } catch (error: any) {
    console.error('Error in concessions query:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/scraped-properties/search
 * Advanced search with multiple filters
 */
router.post('/search', async (req, res) => {
  try {
    const {
      city,
      state,
      min_price,
      max_price,
      min_beds,
      amenity,
      limit = 50,
      offset = 0,
    } = req.body;

    // Use the stored procedure for complex searches
    const { data, error } = await supabase
      .rpc('search_properties', {
        p_city: city || null,
        p_state: state || null,
        p_min_price: min_price ? min_price * 100 : null, // Convert to cents
        p_max_price: max_price ? max_price * 100 : null,
        p_min_beds: min_beds || null,
        p_amenity: amenity || null,
      });

    if (error) {
      console.error('Error in property search:', error);
      return res.status(500).json({ error: 'Search failed' });
    }

    // Convert prices back to dollars
    const properties = data?.map((p: any) => ({
      ...p,
      min_price: p.min_price ? p.min_price / 100 : null,
      max_price: p.max_price ? p.max_price / 100 : null,
    })) || [];

    res.json({
      properties,
      total: properties.length,
    });
  } catch (error: any) {
    console.error('Error in advanced search:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scraped-properties/stats/summary
 * Get summary statistics of scraped properties
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const { data: totalProperties, error: propError } = await supabase
      .from('properties')
      .select('id', { count: 'exact', head: true });

    const { data: totalRates, error: ratesError } = await supabase
      .from('lease_rates')
      .select('id', { count: 'exact', head: true });

    const { data: totalConcessions, error: concessionsError } = await supabase
      .from('concessions')
      .select('id', { count: 'exact', head: true });

    // Get properties by city
    const { data: cityCounts, error: cityError } = await supabase
      .from('properties')
      .select('city')
      .not('city', 'is', null);

    const cityStats = cityCounts?.reduce((acc: any, curr: any) => {
      acc[curr.city] = (acc[curr.city] || 0) + 1;
      return acc;
    }, {});

    res.json({
      total_properties: (totalProperties as any)?.count || 0,
      total_lease_rates: (totalRates as any)?.count || 0,
      total_concessions: (totalConcessions as any)?.count || 0,
      properties_by_city: cityStats || {},
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
