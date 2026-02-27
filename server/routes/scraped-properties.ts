import type { Express, Request, Response } from "express";
import { db } from "../db";
import { scrapedProperties } from "../../shared/schema";
import { eq, desc } from "drizzle-orm";
import { getPropertyPhoto } from "../services/places-photo";

function buildSpecialOffers(raw: any): string | undefined {
  const parts: string[] = [];

  const concessionType = raw.concessionType || raw.concession_type;
  const concessionValue = raw.concessionValue || raw.concession_value;
  const freeRent = raw.freeRentConcessions || raw.free_rent_concessions;

  if (freeRent) {
    parts.push(String(freeRent));
  } else if (concessionType && concessionValue) {
    const type = String(concessionType).toLowerCase();
    if (type.includes('month') || type.includes('free')) {
      parts.push(`${concessionValue} months free`);
    } else if (type.includes('week')) {
      parts.push(`${concessionValue} weeks free`);
    } else if (type.includes('percent') || type.includes('%')) {
      parts.push(`${concessionValue}% off`);
    } else if (type.includes('fixed') || type.includes('discount') || type.includes('dollar')) {
      parts.push(`$${concessionValue} off`);
    } else {
      parts.push(`${concessionType}: $${concessionValue}`);
    }
  }

  return parts.length > 0 ? parts.join(' • ') : undefined;
}

function mapProperty(raw: any) {
  return {
    id: String(raw.id),
    property_id: raw.propertyId || raw.property_id,
    unit_number: raw.unitNumber || raw.unit_number,
    external_id: raw.externalId || raw.external_id,
    source: raw.source,
    name: raw.name || raw.unitNumber || raw.unit_number || 'Unknown',
    address: raw.address || '',
    city: raw.city || '',
    state: raw.state || '',
    zip_code: raw.zipCode || raw.zip_code,
    min_rent: raw.currentPrice || raw.current_price || undefined,
    max_rent: raw.currentPrice || raw.current_price || undefined,
    bedrooms_min: raw.bedrooms ?? undefined,
    bedrooms_max: raw.bedrooms ?? undefined,
    bathrooms_min: raw.bathrooms ?? undefined,
    bathrooms_max: raw.bathrooms ?? undefined,
    special_offers: buildSpecialOffers(raw),
    concession_type: raw.concessionType || raw.concession_type || undefined,
    concession_value: raw.concessionValue || raw.concession_value || undefined,
    effective_price: raw.effectivePrice || raw.effective_price || undefined,
    amenities: raw.amenities || raw.unitFeatures || raw.unit_features || [],
    pet_policy: raw.petPolicy || raw.pet_policy || undefined,
    phone: undefined,
    website_url: raw.listingUrl || raw.listing_url || undefined,
    image_url: raw.imageUrl || raw.image_url || undefined,
    latitude: raw.latitude ?? undefined,
    longitude: raw.longitude ?? undefined,
    sqft: raw.squareFeet || raw.square_feet || raw.squareFootage || raw.square_footage || undefined,
    scraped_at: raw.scrapedAt || raw.scraped_at || undefined,
    status: raw.status,
    volatility_score: raw.volatilityScore || raw.volatility_score,
    price_change_count: raw.priceChangeCount || raw.price_change_count,
  };
}

const NON_APARTMENT_KEYWORDS = [
  'homeowners', 'hoa', 'assn ', 'assoc', 'association',
  'llc', 'inc', 'corp', 'ltd', 'trust',
  'church', 'school', 'hospital', 'clinic',
  'storage', 'warehouse', 'office', 'retail',
  'parking', 'garage only', 'lot ',
];

const MIN_VALID_RENT = 200;
const MAX_VALID_RENT = 15000;

function isValidApartment(p: any): boolean {
  const rent = p.min_rent || p.max_rent || 0;
  if (rent < MIN_VALID_RENT || rent > MAX_VALID_RENT) return false;

  const name = (p.name || '').toLowerCase();
  if (NON_APARTMENT_KEYWORDS.some(kw => name.includes(kw))) return false;

  const address = (p.address || '').toLowerCase();
  if (!address || address === '0' || address.length < 5) return false;

  return true;
}

export function registerScrapedPropertyRoutes(app: Express): void {
  app.get("/api/scraped-properties", async (_req: Request, res: Response) => {
    try {
      const data = await db
        .select()
        .from(scrapedProperties)
        .orderBy(desc(scrapedProperties.scrapedAt));

      const mapped = data.map(mapProperty);

      const valid = mapped.filter(isValidApartment);

      const enriched = await Promise.all(
        valid.map(async (p: any) => {
          if (p.image_url) return p;
          if (p.address && !p.address.startsWith("http")) {
            try {
              const photoUrl = await getPropertyPhoto(p.address, p.city || "", p.state || "", p.source);
              if (photoUrl) {
                await db
                  .update(scrapedProperties)
                  .set({ imageUrl: photoUrl })
                  .where(eq(scrapedProperties.id, Number(p.id)));
                return { ...p, image_url: photoUrl };
              }
            } catch (err) {
              // silently skip photo enrichment failures
            }
          }
          return p;
        })
      );

      res.json(enriched);
    } catch (err) {
      console.error("Scraped properties error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/scraped-properties/stats", async (_req: Request, res: Response) => {
    try {
      const data = await db.select().from(scrapedProperties);

      const allMapped = data.map(mapProperty);
      const properties = allMapped.filter(isValidApartment);

      const withOffers = properties.filter((p: any) =>
        p.special_offers || p.concession_type || p.concession_value || p.effective_price
      );

      const rents = properties
        .map((p: any) => p.min_rent || p.max_rent)
        .filter((r: any) => r && r >= MIN_VALID_RENT && r <= MAX_VALID_RENT);

      const avgRent = rents.length > 0
        ? Math.round(rents.reduce((a: number, b: number) => a + b, 0) / rents.length)
        : 0;

      res.json({
        totalProperties: properties.length,
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
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid property ID" });
      }

      const [data] = await db
        .select()
        .from(scrapedProperties)
        .where(eq(scrapedProperties.id, id))
        .limit(1);

      if (!data) {
        return res.status(404).json({ error: "Property not found" });
      }

      const mapped = mapProperty(data);

      if (!mapped.image_url && mapped.address && !mapped.address.startsWith("http")) {
        const photoUrl = await getPropertyPhoto(
          mapped.address,
          mapped.city || "",
          mapped.state || "",
          data.source || ""
        );
        if (photoUrl) {
          mapped.image_url = photoUrl;
          try {
            await db
              .update(scrapedProperties)
              .set({ imageUrl: photoUrl })
              .where(eq(scrapedProperties.id, id));
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
