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
