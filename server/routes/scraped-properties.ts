import type { Express, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { enrichPropertiesWithPhotos, getPropertyPhoto } from "../services/places-photo";

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set");
  }
  return createClient(url, key);
}

function mapProperty(raw: any) {
  return {
    id: String(raw.id),
    property_id: raw.property_id,
    unit_number: raw.unit_number,
    external_id: raw.external_id,
    source: raw.source,
    name: raw.name || raw.unit_number || 'Unknown',
    address: raw.address || '',
    city: raw.city || '',
    state: raw.state || '',
    zip_code: raw.zip_code,
    min_rent: raw.min_rent ?? raw.current_price ?? undefined,
    max_rent: raw.max_rent ?? raw.current_price ?? undefined,
    bedrooms_min: raw.bedrooms_min ?? raw.bedrooms ?? undefined,
    bedrooms_max: raw.bedrooms_max ?? raw.bedrooms ?? undefined,
    bathrooms_min: raw.bathrooms_min ?? raw.bathrooms ?? undefined,
    bathrooms_max: raw.bathrooms_max ?? raw.bathrooms ?? undefined,
    special_offers: raw.special_offers ?? raw.specials ?? undefined,
    amenities: raw.amenities ?? raw.unit_features ?? undefined,
    pet_policy: raw.pet_policy ?? undefined,
    phone: raw.phone ?? undefined,
    website_url: raw.website_url ?? raw.listing_url ?? undefined,
    image_url: raw.image_url ?? undefined,
    latitude: raw.latitude ?? undefined,
    longitude: raw.longitude ?? undefined,
    sqft: raw.sqft ?? raw.square_feet ?? undefined,
    scraped_at: raw.scraped_at ?? raw.last_seen_at ?? undefined,
    status: raw.status,
    volatility_score: raw.volatility_score,
    price_change_count: raw.price_change_count,
  };
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

      const mapped = (data || []).map(mapProperty);
      const enriched = await enrichPropertiesWithPhotos(data || [], supabase);
      const result = mapped.map((p: any) => {
        if (p.image_url) return p;
        const match = enriched.find((e: any) => String(e.id) === String(p.id));
        return match?.image_url ? { ...p, image_url: match.image_url } : p;
      });
      res.json(result);
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

      const properties = (data || []).map(mapProperty);
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

  app.get("/api/places-photo", async (req: Request, res: Response) => {
    try {
      const address = req.query.address as string;
      const city = req.query.city as string;
      const state = req.query.state as string;
      const source = req.query.source as string | undefined;

      if (!address) {
        return res.status(400).json({ error: "address query parameter is required" });
      }

      const photoUrl = await getPropertyPhoto(address, city || "", state || "", source);
      res.json({ photo_url: photoUrl });
    } catch (err) {
      console.error("Places photo lookup error:", err);
      res.status(500).json({ error: "Failed to look up photo" });
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

      const mapped = mapProperty(data);
      if (!mapped.image_url && mapped.address && !mapped.address.startsWith("http")) {
        const photoUrl = await getPropertyPhoto(
          mapped.address,
          mapped.city || "",
          mapped.state || "",
          data.source
        );
        if (photoUrl) {
          mapped.image_url = photoUrl;
          try {
            await supabase
              .from("scraped_properties")
              .update({ image_url: photoUrl })
              .eq("id", req.params.id);
          } catch (err) {
            console.error("Failed to cache photo URL:", err);
          }
        }
      }
      res.json(mapped);
    } catch (err) {
      console.error("Scraped property detail error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}
