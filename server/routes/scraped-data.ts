/**
 * Scraped Property Data Routes
 * Query scraped properties and lease rates from the apartment-scraper-worker
 */

import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://jdymvpasjsdbryatscux.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  console.error('Warning: SUPABASE_ANON_KEY not set');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * GET /api/scraped-data/properties
 * Get scraped properties with their lease rates
 */
router.get('/properties', async (req, res) => {
  try {
    const { city, state, limit = 50 } = req.query;

    let query = supabase
      .from('properties')
      .select(`
        id,
        name,
        address,
        city,
        state,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (city) query = query.ilike('city', `%${city}%`);
    if (state) query = query.ilike('state', state as string);

    const { data: properties, error } = await query;

    if (error) {
      console.error('Error fetching properties:', error);
      return res.status(500).json({ error: 'Failed to fetch properties' });
    }

    res.json({ properties: properties || [] });
  } catch (error: any) {
    console.error('Error in scraped properties query:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scraped-data/properties/:id
 * Get property details with all lease rates
 */
router.get('/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get property
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
      .from('scraped_lease_rates')
      .select('*')
      .eq('property_id', id)
      .order('price', { ascending: true });

    if (ratesError) {
      console.error('Error fetching lease rates:', ratesError);
    }

    res.json({
      property,
      lease_rates: leaseRates || [],
    });
  } catch (error: any) {
    console.error('Error fetching property details:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scraped-data/lease-rates
 * Get all scraped lease rates with property info
 */
router.get('/lease-rates', async (req, res) => {
  try {
    const { min_price, max_price, limit = 100 } = req.query;

    let query = supabase
      .from('scraped_lease_rates')
      .select(`
        id,
        unit_type,
        sqft,
        price,
        lease_term,
        available,
        scraped_at,
        property_id,
        properties (
          name,
          address,
          city,
          state
        )
      `)
      .order('price', { ascending: true })
      .limit(Number(limit));

    if (min_price) query = query.gte('price', Number(min_price) * 100);
    if (max_price) query = query.lte('price', Number(max_price) * 100);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching lease rates:', error);
      return res.status(500).json({ error: 'Failed to fetch lease rates' });
    }

    // Convert prices to dollars
    const rates = data?.map((rate: any) => ({
      ...rate,
      price: rate.price / 100,
    })) || [];

    res.json({ lease_rates: rates });
  } catch (error: any) {
    console.error('Error in lease rates query:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
