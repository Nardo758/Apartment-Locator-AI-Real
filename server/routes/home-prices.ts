import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { ZillowHomeDataService } from "../services/zillow-home-data";

const router = Router();

const homePriceLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many home price requests, please try again later" },
});

router.use(homePriceLimiter);

router.get("/market", async (req: Request, res: Response) => {
  try {
    const city = (req.query.city as string)?.trim();
    const state = ((req.query.state as string) || "GA").trim();

    if (!city) {
      return res.status(400).json({ error: "city parameter is required" });
    }

    const service = ZillowHomeDataService.getInstance();
    const data = await service.getMarketData(city, state);

    res.json({
      ...data,
      apiConfigured: service.isConfigured(),
    });
  } catch (err) {
    console.error("Home price market error:", err);
    res.status(500).json({ error: "Failed to fetch home price data" });
  }
});

router.get("/property", async (req: Request, res: Response) => {
  try {
    const address = (req.query.address as string)?.trim();
    const city = (req.query.city as string)?.trim();
    const state = ((req.query.state as string) || "GA").trim();

    if (!address || !city) {
      return res.status(400).json({ error: "address and city parameters are required" });
    }

    const service = ZillowHomeDataService.getInstance();
    const data = await service.getPropertyValuation(address, city, state);

    res.json({
      ...data,
      apiConfigured: service.isConfigured(),
    });
  } catch (err) {
    console.error("Property valuation error:", err);
    res.status(500).json({ error: "Failed to fetch property valuation" });
  }
});

export default router;
