/**
 * JEDI RE Integration API Routes
 * Provides market intelligence data for JEDI RE underwriting and analysis
 */

import { Router } from 'express';
import { db } from '../db';

const router = Router();

// Complete Market Data for JEDI RE
router.get('/market-data', async (req, res) => {
  try {
    const { city, state } = req.query;
    
    if (!city || !state) {
      return res.status(400).json({ 
        success: false, 
        error: 'City and state are required' 
      });
    }
    
    // Supply data
    const supplyQuery = await db.query(`
      SELECT 
        COUNT(DISTINCT id) as total_properties,
        SUM(total_units) as total_units,
        AVG(current_occupancy_percent) as avg_occupancy,
        COUNT(*) FILTER (WHERE property_class = 'A') as class_a,
        COUNT(*) FILTER (WHERE property_class = 'B') as class_b,
        COUNT(*) FILTER (WHERE property_class = 'C') as class_c
      FROM properties
      WHERE LOWER(city) = LOWER($1) AND LOWER(state) = LOWER($2)
    `, [city, state]);
    
    // Pricing data
    const pricingQuery = await db.query(`
      SELECT 
        lr.unit_type,
        AVG(lr.price) as avg_rent,
        COUNT(*) as unit_count
      FROM lease_rates lr
      JOIN properties p ON lr.property_id = p.id
      WHERE LOWER(p.city) = LOWER($1) AND LOWER(p.state) = LOWER($2)
      GROUP BY lr.unit_type
    `, [city, state]);
    
    // Growth data
    const growthQuery = await db.query(`
      SELECT 
        AVG(growth_90d_pct) as avg_growth_90d,
        AVG(growth_180d_pct) as avg_growth_180d
      FROM rent_growth_analysis
      WHERE LOWER(city) = LOWER($1) AND LOWER(state) = LOWER($2)
    `, [city, state]);
    
    // Concession data
    const concessionQuery = await db.query(`
      SELECT 
        COUNT(*) as total_concessions,
        AVG(avg_value) as avg_concession_value,
        AVG(concession_rate_pct) as concession_rate
      FROM concession_trends
      WHERE LOWER(city) = LOWER($1) AND LOWER(state) = LOWER($2)
    `, [city, state]);
    
    // Demand data (from renters)
    const demandQuery = await db.query(`
      SELECT 
        COUNT(*) as total_renters,
        AVG((data->>'maxBudget')::numeric) as avg_budget,
        COUNT(*) FILTER (WHERE (data->>'leaseEndDate')::date <= CURRENT_DATE + INTERVAL '90 days') as lease_expirations_90d
      FROM user_data_engines
      WHERE user_type = 'renter'
        AND LOWER(data->>'city') = LOWER($1)
        AND LOWER(data->>'state') = LOWER($2)
    `, [city, state]);
    
    // Forecast data
    const forecastQuery = await db.query(`
      SELECT 
        SUM(available_30d) as units_30d,
        SUM(available_60d) as units_60d,
        SUM(available_90d) as units_90d
      FROM unit_availability_forecast
      WHERE LOWER(city) = LOWER($1) AND LOWER(state) = LOWER($2)
    `, [city, state]);
    
    const supply = supplyQuery.rows[0];
    const pricing = pricingQuery.rows;
    const growth = growthQuery.rows[0];
    const concessions = concessionQuery.rows[0];
    const demand = demandQuery.rows[0];
    const forecast = forecastQuery.rows[0];
    
    const marketData = {
      location: { city, state },
      supply: {
        total_properties: parseInt(supply.total_properties) || 0,
        total_units: parseInt(supply.total_units) || 0,
        avg_occupancy: parseFloat(supply.avg_occupancy) || 0,
        class_distribution: {
          a: parseInt(supply.class_a) || 0,
          b: parseInt(supply.class_b) || 0,
          c: parseInt(supply.class_c) || 0
        }
      },
      pricing: {
        avg_rent_by_type: pricing.reduce((acc, row) => {
          acc[row.unit_type] = parseFloat(row.avg_rent);
          return acc;
        }, {} as { [key: string]: number }),
        rent_growth_90d: parseFloat(growth.avg_growth_90d) || 0,
        rent_growth_180d: parseFloat(growth.avg_growth_180d) || 0,
        concession_rate: parseFloat(concessions.concession_rate) || 0,
        avg_concession_value: parseFloat(concessions.avg_concession_value) || 0
      },
      demand: {
        total_renters: parseInt(demand.total_renters) || 0,
        avg_budget: parseFloat(demand.avg_budget) || 0,
        lease_expirations_90d: parseInt(demand.lease_expirations_90d) || 0
      },
      forecast: {
        units_delivering_30d: parseInt(forecast.units_30d) || 0,
        units_delivering_60d: parseInt(forecast.units_60d) || 0,
        units_delivering_90d: parseInt(forecast.units_90d) || 0
      }
    };
    
    res.json({
      success: true,
      data: marketData
    });
  } catch (error) {
    console.error('JEDI market data error:', error);
    res.status(500).json({ success: false, error: 'Failed to load market data' });
  }
});

// Rent Comparables for Underwriting
router.get('/rent-comps', async (req, res) => {
  try {
    const { city, state, unit_type, max_distance_miles = '5' } = req.query;
    
    if (!city || !state) {
      return res.status(400).json({ 
        success: false, 
        error: 'City and state are required' 
      });
    }
    
    let query = `
      SELECT 
        p.id as property_id,
        p.name as property_name,
        p.address,
        p.year_built,
        p.property_class,
        p.current_occupancy_percent as occupancy,
        lr.unit_type,
        lr.square_feet,
        lr.price as rent,
        CASE 
          WHEN lr.square_feet > 0 THEN ROUND(lr.price / lr.square_feet, 2)
          ELSE NULL
        END as rent_per_sqft,
        EXISTS(
          SELECT 1 FROM concessions c 
          WHERE c.property_id = p.id AND c.is_active = true
        ) as concessions_active
      FROM properties p
      JOIN lease_rates lr ON p.id = lr.property_id
      WHERE LOWER(p.city) = LOWER($1) 
        AND LOWER(p.state) = LOWER($2)
        AND lr.unit_status = 'available'
    `;
    
    const params: any[] = [city, state];
    let paramIndex = 3;
    
    if (unit_type) {
      query += ` AND lr.unit_type = $${paramIndex++}`;
      params.push(unit_type);
    }
    
    query += ` ORDER BY p.property_class, lr.price LIMIT 50`;
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Rent comps error:', error);
    res.status(500).json({ success: false, error: 'Failed to load rent comps' });
  }
});

// Supply Pipeline (properties coming online)
router.get('/supply-pipeline', async (req, res) => {
  try {
    const { city, state, days = '180' } = req.query;
    
    if (!city || !state) {
      return res.status(400).json({ 
        success: false, 
        error: 'City and state are required' 
      });
    }
    
    const result = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.address,
        p.total_units,
        p.property_class,
        lr.available_date,
        COUNT(DISTINCT lr.id) as units_delivering
      FROM properties p
      JOIN lease_rates lr ON p.id = lr.property_id
      WHERE LOWER(p.city) = LOWER($1)
        AND LOWER(p.state) = LOWER($2)
        AND lr.available_date IS NOT NULL
        AND lr.available_date <= CURRENT_DATE + INTERVAL '${days} days'
        AND lr.unit_status = 'coming_soon'
      GROUP BY p.id, p.name, p.address, p.total_units, p.property_class, lr.available_date
      ORDER BY lr.available_date
    `, [city, state]);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Supply pipeline error:', error);
    res.status(500).json({ success: false, error: 'Failed to load supply pipeline' });
  }
});

// Absorption Rate Analysis
router.get('/absorption-rate', async (req, res) => {
  try {
    const { city, state } = req.query;
    
    if (!city || !state) {
      return res.status(400).json({ 
        success: false, 
        error: 'City and state are required' 
      });
    }
    
    const result = await db.query(`
      SELECT 
        AVG(avg_days_to_lease) as avg_days_to_lease,
        COUNT(DISTINCT p.id) as properties_tracked
      FROM properties p
      WHERE LOWER(city) = LOWER($1)
        AND LOWER(state) = LOWER($2)
        AND avg_days_to_lease IS NOT NULL
    `, [city, state]);
    
    const absorption = result.rows[0];
    
    res.json({
      success: true,
      data: {
        avg_days_to_lease: parseFloat(absorption.avg_days_to_lease) || null,
        properties_tracked: parseInt(absorption.properties_tracked) || 0,
        monthly_absorption_rate: absorption.avg_days_to_lease ? 
          Math.round((30 / parseFloat(absorption.avg_days_to_lease)) * 100) / 100 : null
      }
    });
  } catch (error) {
    console.error('Absorption rate error:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate absorption rate' });
  }
});

export default router;
