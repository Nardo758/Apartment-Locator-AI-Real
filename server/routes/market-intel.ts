import type { Express, Request, Response } from "express";
import { db } from "../db";
import { scrapedProperties } from "../../shared/schema";
import { sql } from "drizzle-orm";

export function registerMarketIntelRoutes(app: Express): void {
  // Market Intel stats aggregated from real scraped properties
  app.get("/api/market-intel/stats", async (req: Request, res: Response) => {
    try {
      const city = (req.query.city as string) || undefined;

      const data = await db.select().from(scrapedProperties);

      const filtered = city
        ? data.filter(
            (p) =>
              p.city &&
              p.city.toLowerCase().includes(city.toLowerCase())
          )
        : data;

      const rents = filtered
        .map((p) => p.currentPrice)
        .filter((r): r is number => r != null && r > 0);

      const sortedRents = [...rents].sort((a, b) => a - b);
      const medianRent =
        sortedRents.length > 0
          ? sortedRents[Math.floor(sortedRents.length / 2)]
          : 0;
      const avgRent =
        rents.length > 0
          ? Math.round(rents.reduce((a, b) => a + b, 0) / rents.length)
          : 0;
      const minRent = sortedRents.length > 0 ? sortedRents[0] : 0;
      const maxRent =
        sortedRents.length > 0 ? sortedRents[sortedRents.length - 1] : 0;

      const withConcessions = filtered.filter(
        (p) =>
          p.concessionType ||
          p.concessionValue ||
          p.freeRentConcessions
      );

      const avgDaysOnMarket = (() => {
        const doms = filtered
          .map((p) => p.daysOnMarket)
          .filter((d): d is number => d != null && d > 0);
        return doms.length > 0
          ? Math.round(doms.reduce((a, b) => a + b, 0) / doms.length)
          : 0;
      })();

      const cities = [
        ...new Set(data.map((p) => p.city).filter(Boolean)),
      ] as string[];

      // Build competitor-style listing for top properties
      const competitors = filtered
        .filter((p) => p.currentPrice && p.currentPrice > 0)
        .slice(0, 10)
        .map((p) => ({
          name: p.name || p.unitNumber || "Unknown",
          rent: p.currentPrice || 0,
          bedrooms: p.bedrooms,
          daysOnMarket: p.daysOnMarket || 0,
          concession:
            p.freeRentConcessions ||
            (p.concessionType && p.concessionValue
              ? `${p.concessionType}: $${p.concessionValue}`
              : "None"),
          effectivePrice: p.effectivePrice,
          volatilityScore: p.volatilityScore,
          city: p.city,
          address: p.address,
        }));

      res.json({
        totalProperties: filtered.length,
        medianRent,
        avgRent,
        minRent,
        maxRent,
        propertiesWithConcessions: withConcessions.length,
        concessionRate: filtered.length > 0
          ? Math.round((withConcessions.length / filtered.length) * 100)
          : 0,
        avgDaysOnMarket,
        cities,
        competitors,
      });
    } catch (err) {
      console.error("Market intel stats error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}
