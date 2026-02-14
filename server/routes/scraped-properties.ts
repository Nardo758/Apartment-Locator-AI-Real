import type { Express, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set");
  }
  return createClient(url, key);
}

export function registerScrapedPropertyRoutes(app: Express): void {
  app.get("/api/scraped-properties", async (_req: Request, res: Response) => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("scraped_properties")
        .select("*")
        .order("scraped_at", { ascending: false });

      if (error) {
        console.error("Supabase query error:", error);
        return res.status(500).json({ error: "Failed to fetch scraped properties" });
      }

      res.json(data || []);
    } catch (err) {
      console.error("Scraped properties error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/scraped-properties/stats", async (_req: Request, res: Response) => {
    try {
      const supabase = getSupabaseClient();
      const { data, error, count } = await supabase
        .from("scraped_properties")
        .select("*", { count: "exact" });

      if (error) {
        console.error("Supabase stats error:", error);
        return res.status(500).json({ error: "Failed to fetch stats" });
      }

      const properties = data || [];
      const withOffers = properties.filter((p: any) => p.special_offers);
      const rents = properties
        .map((p: any) => p.min_rent || p.max_rent)
        .filter((r: any) => r && r > 0);
      const avgRent = rents.length > 0
        ? Math.round(rents.reduce((a: number, b: number) => a + b, 0) / rents.length)
        : 0;

      res.json({
        totalProperties: count || properties.length,
        propertiesWithOffers: withOffers.length,
        averageRent: avgRent,
        cities: [...new Set(properties.map((p: any) => p.city).filter(Boolean))],
      });
    } catch (err) {
      console.error("Scraped properties stats error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/scraped-properties/:id", async (req: Request, res: Response) => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("scraped_properties")
        .select("*")
        .eq("id", req.params.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: "Property not found" });
        }
        console.error("Supabase query error:", error);
        return res.status(500).json({ error: "Failed to fetch property" });
      }

      res.json(data);
    } catch (err) {
      console.error("Scraped property detail error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}
