import { Router, Request, Response, NextFunction } from "express";
import { enrichPropertiesBatch, enrichProperty } from "../services/serp-enrichment";

const router = Router();

function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers["x-admin-key"] as string;

  const validAdminKey = process.env.APIFY_TOKEN;
  if (apiKey && validAdminKey && apiKey === validAdminKey) {
    return next();
  }

  if (authHeader?.startsWith("Bearer ") && validAdminKey) {
    const token = authHeader.slice(7);
    if (token === validAdminKey) {
      return next();
    }
  }

  res.status(401).json({
    error:
      "Authentication required. Provide x-admin-key header or Bearer token.",
  });
}

router.use(requireAdminAuth);

router.post("/enrich/serp", async (req: Request, res: Response) => {
  try {
    const { city, limit = 10, forceRefresh = false } = req.body;

    if (!process.env.SERPAPI_KEY) {
      return res.status(500).json({ error: "SERPAPI_KEY not configured" });
    }

    console.log(
      `[SERP Enrichment] Starting batch: city=${city || "all"}, limit=${limit}, force=${forceRefresh}`
    );

    const progress = await enrichPropertiesBatch({
      city,
      limit: Math.min(limit, 100),
      forceRefresh,
    });

    console.log(
      `[SERP Enrichment] Complete: ${progress.enriched}/${progress.total} enriched, ${progress.errors} errors`
    );

    res.json({
      success: true,
      summary: {
        total: progress.total,
        processed: progress.processed,
        enriched: progress.enriched,
        errors: progress.errors,
        skipped: progress.skipped,
      },
      results: progress.results,
    });
  } catch (error: any) {
    console.error("[SERP Enrichment] Error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/enrich/serp/all", async (req: Request, res: Response) => {
  try {
    if (!process.env.SERPAPI_KEY) {
      return res.status(500).json({ error: "SERPAPI_KEY not configured" });
    }

    const { batchSize = 20 } = req.body;

    res.json({ success: true, message: "Background enrichment started. Check server logs for progress." });

    (async () => {
      let totalEnriched = 0;
      let totalErrors = 0;
      let batch = 0;
      const unenrichableIds: number[] = [];

      while (true) {
        batch++;
        try {
          const progress = await enrichPropertiesBatch({
            limit: Math.min(batchSize, 50),
            forceRefresh: false,
            excludeIds: unenrichableIds,
          });

          totalEnriched += progress.enriched;
          totalErrors += progress.errors;

          for (const r of progress.results) {
            if (!r.directUrl && r.amenitiesCount === 0 && !r.error) {
              unenrichableIds.push(r.id);
            }
          }

          console.log(
            `[SERP Auto-Enrich] Batch ${batch}: ${progress.enriched} enriched, ${progress.errors} errors, ${progress.total} candidates (${unenrichableIds.length} skipped) | Cumulative: ${totalEnriched} enriched, ${totalErrors} errors`
          );

          if (progress.total === 0) {
            console.log(`[SERP Auto-Enrich] Complete! Total: ${totalEnriched} enriched, ${totalErrors} errors across ${batch} batches`);
            break;
          }

          if (progress.enriched === 0 && progress.total <= unenrichableIds.length) {
            console.log(`[SERP Auto-Enrich] Complete! All remaining candidates unenrichable. Total: ${totalEnriched} enriched, ${totalErrors} errors across ${batch} batches`);
            break;
          }

          await new Promise(r => setTimeout(r, 1000));
        } catch (err: any) {
          console.error(`[SERP Auto-Enrich] Batch ${batch} error: ${err.message}`);
          totalErrors++;
          if (totalErrors > 20) {
            console.error("[SERP Auto-Enrich] Too many errors, stopping.");
            break;
          }
          await new Promise(r => setTimeout(r, 5000));
        }
      }
    })();
  } catch (error: any) {
    console.error("[SERP Auto-Enrich] Error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/enrich/serp/single", async (req: Request, res: Response) => {
  try {
    const { name, city, state } = req.body;

    if (!name || !city) {
      return res.status(400).json({ error: "name and city are required" });
    }

    if (!process.env.SERPAPI_KEY) {
      return res.status(500).json({ error: "SERPAPI_KEY not configured" });
    }

    const result = await enrichProperty(name, city, state || "");
    res.json({ success: true, result });
  } catch (error: any) {
    console.error("[SERP Enrichment] Single error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
