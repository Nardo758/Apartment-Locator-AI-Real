import { Router, Request, Response } from 'express';
import { ApifyImportService } from '../services/apify-import';

const router = Router();
const importService = new ApifyImportService();

const APIFY_ACTOR = 'memo23~apify-apartments-cheerio';
const APIFY_BASE = 'https://api.apify.com/v2';

function getApifyToken(): string | null {
  return process.env.APIFY_TOKEN || null;
}

router.post('/scrape/apartments-com', async (req: Request, res: Response) => {
  try {
    const token = getApifyToken();
    if (!token) {
      return res.status(400).json({ error: 'APIFY_TOKEN not configured' });
    }

    const { city = 'atlanta', state = 'ga', maxItems = 200 } = req.body;
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    const stateSlug = state.toLowerCase();
    const startUrl = `https://www.apartments.com/${citySlug}-${stateSlug}/`;

    console.log(`Starting Apify scrape for ${startUrl} (maxItems: ${maxItems})`);

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

export default router;
