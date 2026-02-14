/**
 * Admin Panel API Routes
 * Provides analytics and monitoring for scraped property data
 */

import { Router } from 'express';
import { db } from '../db';

const router = Router();

// Dashboard Overview
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(DISTINCT p.id) as total_properties,
        SUM(p.total_units) as total_units,
        AVG(p.current_occupancy_percent) as avg_occupancy,
        COUNT(DISTINCT CASE WHEN p.last_scraped >= NOW() - INTERVAL '24 hours' THEN p.id END) as scraped_24h,
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT CASE WHEN u.user_type = 'renter' THEN u.id END) as renter_count,
        COUNT(DISTINCT CASE WHEN u.user_type = 'landlord' THEN u.id END) as landlord_count
      FROM properties p
      CROSS JOIN users u
    `);

    res.json({
      success: true,
      data: stats.rows[0]
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to load dashboard' });
  }
});

// Properties by Location
router.get('/properties', async (req, res) => {
  try {
    const { city, state, zip, class: propertyClass } = req.query;
    
    let query = `
      SELECT 
        p.*,
        COUNT(DISTINCT lr.id) as unit_count,
        AVG(lr.price) as avg_rent,
        MIN(lr.price) as min_rent,
        MAX(lr.price) as max_rent,
        COUNT(DISTINCT c.id) as concession_count
      FROM properties p
      LEFT JOIN lease_rates lr ON p.id = lr.property_id
      LEFT JOIN concessions c ON p.id = c.property_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (city) {
      query += ` AND LOWER(p.city) = LOWER($${paramIndex++})`;
      params.push(city);
    }
    if (state) {
      query += ` AND LOWER(p.state) = LOWER($${paramIndex++})`;
      params.push(state);
    }
    if (zip) {
      query += ` AND p.zip_code = $${paramIndex++}`;
      params.push(zip);
    }
    if (propertyClass) {
      query += ` AND p.property_class = $${paramIndex++}`;
      params.push(propertyClass);
    }
    
    query += ` GROUP BY p.id ORDER BY p.last_scraped DESC NULLS LAST LIMIT 100`;
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Properties query error:', error);
    res.status(500).json({ success: false, error: 'Failed to load properties' });
  }
});

// Properties Grouped by Location
router.get('/properties/grouped', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        city,
        state,
        COUNT(DISTINCT id) as property_count,
        SUM(total_units) as total_units,
        AVG(current_occupancy_percent) as avg_occupancy,
        MAX(last_scraped) as last_scraped
      FROM properties
      GROUP BY city, state
      ORDER BY property_count DESC
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Grouped properties error:', error);
    res.status(500).json({ success: false, error: 'Failed to load grouped data' });
  }
});

// Unit Mix Analysis
router.get('/units', async (req, res) => {
  try {
    const { city, state, zip, unit_type } = req.query;
    
    let query = `
      SELECT 
        lr.unit_type,
        COUNT(*) as unit_count,
        AVG(lr.price) as avg_rent,
        MIN(lr.price) as min_rent,
        MAX(lr.price) as max_rent,
        AVG(lr.square_feet) as avg_sqft,
        COUNT(*) FILTER (WHERE lr.unit_status = 'available') as available_count
      FROM lease_rates lr
      JOIN properties p ON lr.property_id = p.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (city) {
      query += ` AND LOWER(p.city) = LOWER($${paramIndex++})`;
      params.push(city);
    }
    if (state) {
      query += ` AND LOWER(p.state) = LOWER($${paramIndex++})`;
      params.push(state);
    }
    if (zip) {
      query += ` AND p.zip_code = $${paramIndex++}`;
      params.push(zip);
    }
    if (unit_type) {
      query += ` AND lr.unit_type = $${paramIndex++}`;
      params.push(unit_type);
    }
    
    query += ` GROUP BY lr.unit_type ORDER BY unit_count DESC`;
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Unit mix error:', error);
    res.status(500).json({ success: false, error: 'Failed to load unit mix' });
  }
});

// Availability Forecast
router.get('/availability-forecast', async (req, res) => {
  try {
    const { city, state, days = '90' } = req.query;
    
    let query = `
      SELECT * FROM unit_availability_forecast
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (city) {
      query += ` AND LOWER(city) = LOWER($${paramIndex++})`;
      params.push(city);
    }
    if (state) {
      query += ` AND LOWER(state) = LOWER($${paramIndex++})`;
      params.push(state);
    }
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Availability forecast error:', error);
    res.status(500).json({ success: false, error: 'Failed to load forecast' });
  }
});

// Rent Growth Trends
router.get('/rent-growth', async (req, res) => {
  try {
    const { city, state } = req.query;
    
    let query = `
      SELECT * FROM rent_growth_analysis
      WHERE growth_90d_pct IS NOT NULL
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (city) {
      query += ` AND LOWER(city) = LOWER($${paramIndex++})`;
      params.push(city);
    }
    if (state) {
      query += ` AND LOWER(state) = LOWER($${paramIndex++})`;
      params.push(state);
    }
    
    query += ` ORDER BY growth_90d_pct DESC`;
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Rent growth error:', error);
    res.status(500).json({ success: false, error: 'Failed to load rent growth' });
  }
});

// Demand Signals (from user data)
router.get('/demand-signals', async (req, res) => {
  try {
    const { city, state, days = '90' } = req.query;
    
    // Get renter data for demand analysis
    let query = `
      SELECT 
        ude.data->>'city' as city,
        ude.data->>'state' as state,
        COUNT(*) as renter_count,
        AVG((ude.data->>'maxBudget')::numeric) as avg_budget,
        COUNT(*) FILTER (WHERE (ude.data->>'leaseEndDate')::date <= CURRENT_DATE + INTERVAL '${days} days') as lease_expirations,
        ude.data->'apartmentPreferences'->>'bedrooms' as bedrooms_demand
      FROM user_data_engines ude
      WHERE ude.user_type = 'renter'
        AND ude.data->>'city' IS NOT NULL
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (city) {
      query += ` AND LOWER(ude.data->>'city') = LOWER($${paramIndex++})`;
      params.push(city);
    }
    if (state) {
      query += ` AND LOWER(ude.data->>'state') = LOWER($${paramIndex++})`;
      params.push(state);
    }
    
    query += ` GROUP BY ude.data->>'city', ude.data->>'state', ude.data->'apartmentPreferences'->>'bedrooms'`;
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Demand signals error:', error);
    res.status(500).json({ success: false, error: 'Failed to load demand signals' });
  }
});

// Scraping Stats
router.get('/scraping-stats', async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        source,
        COUNT(*) as property_count,
        MAX(last_scraped) as last_scrape,
        COUNT(*) FILTER (WHERE last_scraped >= NOW() - INTERVAL '24 hours') as scraped_24h,
        COUNT(*) FILTER (WHERE last_scraped >= NOW() - INTERVAL '7 days') as scraped_7d,
        ROUND(AVG(EXTRACT(EPOCH FROM (NOW() - last_scraped)) / 3600), 1) as avg_age_hours
      FROM properties
      WHERE source IS NOT NULL
      GROUP BY source
      ORDER BY property_count DESC
    `);
    
    res.json({
      success: true,
      data: stats.rows
    });
  } catch (error) {
    console.error('Scraping stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to load scraping stats' });
  }
});

export default router;
