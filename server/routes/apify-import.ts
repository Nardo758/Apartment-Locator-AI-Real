import { Router, Request, Response, NextFunction } from 'express';
import { ApifyImportService } from '../services/apify-import';
import { ApartmentListImportService } from '../services/apartmentlist-import';

const router = Router();
const importService = new ApifyImportService();
const apartmentListImportService = new ApartmentListImportService();

const APIFY_ACTOR = 'memo23~apify-apartments-cheerio';
const APIFY_APARTMENTLIST_ACTOR_ID = 'rcYy6tgVjoEsFgj0O';
const APIFY_BASE = 'https://api.apify.com/v2';

function getApifyToken(): string | null {
  return process.env.APIFY_TOKEN || null;
}

function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-admin-key'] as string;

  const validAdminKey = process.env.APIFY_TOKEN;
  if (apiKey && validAdminKey && apiKey === validAdminKey) {
    return next();
  }

  if (authHeader?.startsWith('Bearer ') && validAdminKey) {
    const token = authHeader.slice(7);
    if (token === validAdminKey) {
      return next();
    }
  }

  res.status(401).json({ error: 'Authentication required. Provide valid x-admin-key header or Bearer token.' });
}

router.use(requireAdminAuth);

router.post('/scrape/apartments-com', async (req: Request, res: Response) => {
  try {
    const token = getApifyToken();
    if (!token) {
      return res.status(400).json({ error: 'APIFY_TOKEN not configured' });
    }

    const { city = 'atlanta', state = 'ga', maxItems = 200, includeDetails = true } = req.body;
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    const stateSlug = state.toLowerCase();
    const startUrl = `https://www.apartments.com/${citySlug}-${stateSlug}/`;

    console.log(`Starting Apify scrape for ${startUrl} (maxItems: ${maxItems}, includeDetails: ${includeDetails})`);

    const runResponse = await fetch(
      `${APIFY_BASE}/acts/${APIFY_ACTOR}/runs?token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startUrls: [startUrl],
          maxItems,
          maxConcurrency: 20,
          minConcurrency: 1,
          maxRequestRetries: 50,
          moreResults: false,
          includeDetailPage: includeDetails,
          proxy: {
            useApifyProxy: true,
            apifyProxyGroups: ['RESIDENTIAL'],
          },
        }),
      }
    );

    if (!runResponse.ok) {
      const errText = await runResponse.text();
      throw new Error(`Apify run failed (${runResponse.status}): ${errText}`);
    }

    const runData = await runResponse.json() as any;
    const runId = runData.data?.id;

    if (!runId) {
      throw new Error('No run ID returned from Apify');
    }

    console.log(`Apify run started: ${runId}. Polling for completion...`);

    let status = runData.data?.status;
    let attempts = 0;
    const maxAttempts = 60;

    while (status !== 'SUCCEEDED' && status !== 'FAILED' && status !== 'ABORTED' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      attempts++;

      const statusResponse = await fetch(
        `${APIFY_BASE}/actor-runs/${runId}?token=${token}`
      );
      if (statusResponse.ok) {
        const statusData = await statusResponse.json() as any;
        status = statusData.data?.status;
        console.log(`Apify run ${runId} status: ${status} (attempt ${attempts}/${maxAttempts})`);
      }
    }

    if (status !== 'SUCCEEDED') {
      return res.status(500).json({
        error: `Apify run did not succeed. Final status: ${status}`,
        runId,
      });
    }

    const datasetId = runData.data?.defaultDatasetId;
    if (!datasetId) {
      throw new Error('No dataset ID found in run data');
    }

    const dataResponse = await fetch(
      `${APIFY_BASE}/datasets/${datasetId}/items?format=json&clean=true`
    );

    if (!dataResponse.ok) {
      throw new Error(`Failed to fetch dataset: ${dataResponse.status}`);
    }

    const listings = await dataResponse.json() as any[];
    console.log(`Fetched ${listings.length} listings from Apify dataset ${datasetId}`);

    const stats = await importService.importListings(listings);

    res.json({
      success: true,
      runId,
      datasetId,
      scrapeUrl: startUrl,
      listingsFound: listings.length,
      importStats: stats,
    });
  } catch (error) {
    console.error('Apify scrape error:', error);
    res.status(500).json({ error: `Scrape failed: ${(error as Error).message}` });
  }
});

router.post('/import/apify-dataset', async (req: Request, res: Response) => {
  try {
    const { datasetId, datasetUrl } = req.body;

    let fetchUrl: string;
    if (datasetUrl) {
      if (!datasetUrl.startsWith('https://api.apify.com/')) {
        return res.status(400).json({ error: 'datasetUrl must be an Apify API URL (https://api.apify.com/...)' });
      }
      fetchUrl = datasetUrl;
    } else if (datasetId) {
      fetchUrl = `${APIFY_BASE}/datasets/${datasetId}/items?format=json&clean=true`;
    } else {
      return res.status(400).json({ error: 'datasetId or datasetUrl is required' });
    }

    console.log(`Fetching Apify dataset from: ${fetchUrl}`);

    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch dataset: ${response.status} ${response.statusText}`);
    }

    const listings = await response.json() as any[];
    console.log(`Fetched ${listings.length} listings from dataset`);

    const stats = await importService.importListings(listings);

    res.json({
      success: true,
      source: fetchUrl,
      listingsFound: listings.length,
      importStats: stats,
    });
  } catch (error) {
    console.error('Apify dataset import error:', error);
    res.status(500).json({ error: `Import failed: ${(error as Error).message}` });
  }
});

router.post('/import/apify', async (req: Request, res: Response) => {
  try {
    const { listings } = req.body;

    if (!listings || !Array.isArray(listings)) {
      return res.status(400).json({ error: 'listings array is required in request body' });
    }

    console.log(`Importing ${listings.length} listings from direct POST`);

    const stats = await importService.importListings(listings);

    res.json({
      success: true,
      listingsProvided: listings.length,
      importStats: stats,
    });
  } catch (error) {
    console.error('Apify direct import error:', error);
    res.status(500).json({ error: `Import failed: ${(error as Error).message}` });
  }
});

router.post('/import/apartmentlist-dataset', async (req: Request, res: Response) => {
  try {
    const { datasetId } = req.body;
    const token = getApifyToken();

    if (!datasetId) {
      return res.status(400).json({ error: 'datasetId is required' });
    }
    if (!token) {
      return res.status(400).json({ error: 'APIFY_TOKEN not configured' });
    }

    const fetchUrl = `${APIFY_BASE}/datasets/${datasetId}/items?token=${token}&format=json&clean=true`;
    console.log(`Fetching ApartmentList dataset: ${datasetId}`);

    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch dataset: ${response.status} ${response.statusText}`);
    }

    const listings = await response.json() as any[];
    console.log(`Fetched ${listings.length} ApartmentList listings from dataset ${datasetId}`);

    const stats = await apartmentListImportService.importListings(listings);

    res.json({
      success: true,
      source: 'apartmentlist.com',
      datasetId,
      listingsFound: listings.length,
      importStats: stats,
    });
  } catch (error) {
    console.error('ApartmentList dataset import error:', error);
    res.status(500).json({ error: `Import failed: ${(error as Error).message}` });
  }
});

router.post('/scrape/apartmentlist', async (req: Request, res: Response) => {
  try {
    const token = getApifyToken();
    if (!token) {
      return res.status(400).json({ error: 'APIFY_TOKEN not configured' });
    }

    const { city = 'atlanta', state = 'ga', maxItems = 50 } = req.body;

    console.log(`Starting ApartmentList scrape for ${city}, ${state} (maxItems: ${maxItems})`);

    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    const stateSlug = state.toLowerCase();
    const startUrl = `https://www.apartmentlist.com/${stateSlug}/${citySlug}`;

    console.log(`Starting ApartmentList scrape: ${startUrl} (maxItems: ${maxItems})`);

    const runResponse = await fetch(
      `${APIFY_BASE}/acts/${APIFY_APARTMENTLIST_ACTOR_ID}/runs?token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startUrls: [startUrl],
          maxItems,
          endPage: 3,
          proxy: { useApifyProxy: true },
          customMapFunction: '(object) => { return {...object} }',
          extendOutputFunction: '($) => { return {} }',
        }),
      }
    );

    if (!runResponse.ok) {
      const errText = await runResponse.text();
      throw new Error(`Apify run failed (${runResponse.status}): ${errText}`);
    }

    const runData = await runResponse.json() as any;
    const runId = runData.data?.id;

    if (!runId) {
      throw new Error('No run ID returned from Apify');
    }

    console.log(`ApartmentList scrape started: ${runId}. Polling for completion...`);

    let status = runData.data?.status;
    let attempts = 0;
    const maxAttempts = 60;

    while (status !== 'SUCCEEDED' && status !== 'FAILED' && status !== 'ABORTED' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      attempts++;

      const statusResponse = await fetch(
        `${APIFY_BASE}/actor-runs/${runId}?token=${token}`
      );
      if (statusResponse.ok) {
        const statusData = await statusResponse.json() as any;
        status = statusData.data?.status;
        console.log(`ApartmentList run ${runId} status: ${status} (attempt ${attempts}/${maxAttempts})`);
      }
    }

    if (status !== 'SUCCEEDED') {
      return res.status(500).json({
        error: `ApartmentList scrape did not succeed. Final status: ${status}`,
        runId,
      });
    }

    const datasetId = runData.data?.defaultDatasetId;
    if (!datasetId) {
      throw new Error('No dataset ID found in run data');
    }

    const dataResponse = await fetch(
      `${APIFY_BASE}/datasets/${datasetId}/items?token=${token}&format=json&clean=true`
    );

    if (!dataResponse.ok) {
      throw new Error(`Failed to fetch dataset: ${dataResponse.status}`);
    }

    const listings = await dataResponse.json() as any[];
    console.log(`Fetched ${listings.length} ApartmentList listings from dataset ${datasetId}`);

    const stats = await apartmentListImportService.importListings(listings);

    res.json({
      success: true,
      source: 'apartmentlist.com',
      runId,
      datasetId,
      city,
      state,
      listingsFound: listings.length,
      importStats: stats,
    });
  } catch (error) {
    console.error('ApartmentList scrape error:', error);
    res.status(500).json({ error: `Scrape failed: ${(error as Error).message}` });
  }
});

const SCRAPE_MARKETS = [
  { city: 'atlanta', state: 'ga' },
  { city: 'charlotte', state: 'nc' },
  { city: 'raleigh', state: 'nc' },
  { city: 'durham', state: 'nc' },
  { city: 'nashville', state: 'tn' },
  { city: 'tampa', state: 'fl' },
  { city: 'orlando', state: 'fl' },
  { city: 'jacksonville', state: 'fl' },
  { city: 'miami', state: 'fl' },
  { city: 'charleston', state: 'sc' },
  { city: 'savannah', state: 'ga' },
  { city: 'houston', state: 'tx' },
  { city: 'dallas', state: 'tx' },
  { city: 'austin', state: 'tx' },
  { city: 'san antonio', state: 'tx' },
  { city: 'frisco', state: 'tx' },
];

async function scrapeAndImportApartmentList(
  token: string,
  city: string,
  state: string,
  maxItems: number = 50
): Promise<{ city: string; state: string; status: string; listings?: number; imported?: any; error?: string }> {
  try {
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    const stateSlug = state.toLowerCase();
    const startUrl = `https://www.apartmentlist.com/${stateSlug}/${citySlug}`;

    console.log(`[Refresh] Starting ApartmentList scrape: ${startUrl}`);

    const runResponse = await fetch(
      `${APIFY_BASE}/acts/${APIFY_APARTMENTLIST_ACTOR_ID}/runs?token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startUrls: [startUrl],
          maxItems,
          endPage: 3,
          proxy: { useApifyProxy: true },
          customMapFunction: '(object) => { return {...object} }',
          extendOutputFunction: '($) => { return {} }',
        }),
      }
    );

    if (!runResponse.ok) {
      const errText = await runResponse.text();
      throw new Error(`Apify run failed (${runResponse.status}): ${errText}`);
    }

    const runData = await runResponse.json() as any;
    const runId = runData.data?.id;
    if (!runId) throw new Error('No run ID returned');

    let status = runData.data?.status;
    let attempts = 0;
    const maxAttempts = 30;

    while (status !== 'SUCCEEDED' && status !== 'FAILED' && status !== 'ABORTED' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      attempts++;
      const statusResponse = await fetch(`${APIFY_BASE}/actor-runs/${runId}?token=${token}`);
      if (statusResponse.ok) {
        const statusData = await statusResponse.json() as any;
        status = statusData.data?.status;
      }
    }

    if (status !== 'SUCCEEDED') {
      return { city, state, status: 'failed', error: `Run status: ${status}` };
    }

    const datasetId = runData.data?.defaultDatasetId;
    if (!datasetId) throw new Error('No dataset ID');

    const dataResponse = await fetch(
      `${APIFY_BASE}/datasets/${datasetId}/items?token=${token}&format=json&clean=true`
    );
    if (!dataResponse.ok) throw new Error(`Dataset fetch failed: ${dataResponse.status}`);

    const listings = await dataResponse.json() as any[];
    const stats = await apartmentListImportService.importListings(listings);

    console.log(`[Refresh] ${city}, ${state.toUpperCase()}: ${listings.length} listings, ${stats.inserted} new, ${stats.updated} updated`);
    return { city, state, status: 'success', listings: listings.length, imported: stats };
  } catch (error: any) {
    console.error(`[Refresh] Failed ${city}, ${state}:`, error.message);
    return { city, state, status: 'error', error: error.message };
  }
}

router.post('/scrape/refresh-all', async (req: Request, res: Response) => {
  try {
    const token = getApifyToken();
    if (!token) {
      return res.status(400).json({ error: 'APIFY_TOKEN not configured' });
    }

    const { maxItems = 50, concurrency = 2, markets } = req.body;
    const targetMarkets = markets && Array.isArray(markets)
      ? markets
      : SCRAPE_MARKETS;

    console.log(`[Refresh] Starting refresh for ${targetMarkets.length} markets (concurrency: ${concurrency}, maxItems: ${maxItems})`);

    res.json({
      success: true,
      message: `Refresh started for ${targetMarkets.length} markets. Running in background.`,
      markets: targetMarkets.map((m: any) => `${m.city}, ${m.state.toUpperCase()}`),
    });

    const results: any[] = [];
    for (let i = 0; i < targetMarkets.length; i += concurrency) {
      const batch = targetMarkets.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map((m: any) => scrapeAndImportApartmentList(token, m.city, m.state, maxItems))
      );
      results.push(...batchResults);

      const succeeded = results.filter(r => r.status === 'success').length;
      const totalListings = results.reduce((sum, r) => sum + (r.listings || 0), 0);
      console.log(`[Refresh] Progress: ${results.length}/${targetMarkets.length} markets done (${succeeded} succeeded, ${totalListings} total listings)`);
    }

    const summary = {
      total: results.length,
      succeeded: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status !== 'success').length,
      totalListings: results.reduce((sum, r) => sum + (r.listings || 0), 0),
      results,
    };
    console.log(`[Refresh] Complete:`, JSON.stringify(summary, null, 2));
  } catch (error) {
    console.error('[Refresh] Error:', error);
  }
});

router.get('/markets', async (_req: Request, res: Response) => {
  try {
    const { db: database } = await import('../db');
    const { sql: sqlTag } = await import('drizzle-orm');
    const result = await database.execute(sqlTag`
      SELECT 
        source, city, state,
        COUNT(*) as property_count,
        COUNT(CASE WHEN direct_website_url IS NOT NULL THEN 1 END) as with_direct_url,
        COUNT(CASE WHEN units_available IS NOT NULL THEN 1 END) as with_units,
        ROUND(AVG(current_price)) as avg_price,
        MAX(last_seen_at) as last_refreshed
      FROM scraped_properties
      WHERE current_price >= 200 AND current_price <= 15000
      GROUP BY source, city, state
      ORDER BY city, state, source
    `);
    res.json({ markets: result.rows, configured: SCRAPE_MARKETS });
  } catch (error) {
    console.error('Markets list error:', error);
    res.status(500).json({ error: 'Failed to fetch markets' });
  }
});

export default router;
