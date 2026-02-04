import { Router } from 'express';
import gasPriceService from '../services/gasPriceService';

const router = Router();

/**
 * GET /api/gas-prices/:state
 * Get current gas price for a state
 */
router.get('/:state', async (req, res) => {
  try {
    const { state } = req.params;
    const price = await gasPriceService.getStateGasPrice(state);
    
    res.json({
      state: state.toUpperCase(),
      regular: price,
      lastUpdated: new Date().toISOString(),
      source: 'AAA',
      cacheExpiry: '24h'
    });
  } catch (error) {
    console.error('Gas price API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch gas price',
      fallback: 3.50 
    });
  }
});

/**
 * GET /api/gas-prices/zip/:zipCode
 * Get gas price for a ZIP code
 */
router.get('/zip/:zipCode', async (req, res) => {
  try {
    const { zipCode } = req.params;
    const price = await gasPriceService.getZipGasPrice(zipCode);
    
    res.json({
      zipCode,
      regular: price,
      lastUpdated: new Date().toISOString(),
      source: 'AAA (state average)',
      note: 'Hyperlocal pricing coming soon with GasBuddy integration'
    });
  } catch (error) {
    console.error('Gas price API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch gas price',
      fallback: 3.50 
    });
  }
});

/**
 * GET /api/gas-prices
 * Get all state gas prices (admin)
 */
router.get('/', async (req, res) => {
  try {
    const prices = await gasPriceService.getAllStateGasPrices();
    
    res.json({
      prices,
      lastUpdated: new Date().toISOString(),
      source: 'AAA',
      count: prices.length
    });
  } catch (error) {
    console.error('Gas price API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch gas prices' 
    });
  }
});

export default router;
