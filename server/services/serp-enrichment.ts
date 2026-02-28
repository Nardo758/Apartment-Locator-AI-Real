import { pool } from "../db";

const SERP_API_BASE = "https://serpapi.com/search.json";

const AGGREGATOR_DOMAINS = [
  "apartments.com",
  "zillow.com",
  "trulia.com",
  "rent.com",
  "realtor.com",
  "apartmentguide.com",
  "apartmentfinder.com",
  "forrent.com",
  "hotpads.com",
  "padmapper.com",
  "zumper.com",
  "rentcafe.com",
  "apartmentlist.com",
  "apartmentratings.com",
  "cozy.co",
  "avail.co",
  "niche.com",
  "usnews.com",
  "facebook.com",
  "craigslist.org",
  "yelp.com",
  "bbb.org",
  "yellowpages.com",
  "google.com",
  "wikipedia.org",
  "linkedin.com",
  "instagram.com",
  "twitter.com",
  "tiktok.com",
  "youtube.com",
  "reddit.com",
  "bing.com",
  "mapquest.com",
];

interface SerpEnrichmentResult {
  directWebsiteUrl: string | null;
  amenities: string[];
  imageUrl: string | null;
  phone: string | null;
}

function isAggregatorUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return AGGREGATOR_DOMAINS.some((d) => hostname.includes(d));
  } catch {
    return true;
  }
}

function extractAmenitiesFromText(text: string): string[] {
  const amenityPatterns = [
    "pool", "swimming pool", "fitness center", "gym", "parking",
    "garage", "laundry", "washer", "dryer", "in-unit laundry",
    "dishwasher", "air conditioning", "a/c", "ac", "central air",
    "balcony", "patio", "pet friendly", "dog friendly", "cat friendly",
    "playground", "clubhouse", "business center", "concierge",
    "doorman", "elevator", "rooftop", "terrace", "bbq", "grill",
    "basketball", "tennis", "volleyball", "dog park",
    "ev charging", "electric vehicle", "package locker",
    "storage", "bike storage", "valet", "spa", "sauna", "hot tub",
    "movie theater", "screening room", "game room", "lounge",
    "co-working", "coworking", "work from home", "wifi",
    "stainless steel", "granite", "quartz", "hardwood",
    "walk-in closet", "ceiling fan", "fireplace",
    "gated", "controlled access", "security",
    "courtyard", "garden", "green space", "trail",
  ];

  const lower = text.toLowerCase();
  const found: string[] = [];

  for (const pattern of amenityPatterns) {
    if (lower.includes(pattern)) {
      const capitalized = pattern.split(" ").map(
        (w) => w.charAt(0).toUpperCase() + w.slice(1)
      ).join(" ");
      if (!found.includes(capitalized)) {
        found.push(capitalized);
      }
    }
  }

  return found;
}

async function searchSerp(query: string): Promise<any> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    throw new Error("SERPAPI_KEY not configured");
  }

  const params = new URLSearchParams({
    q: query,
    api_key: apiKey,
    engine: "google",
    num: "10",
    gl: "us",
    hl: "en",
  });

  const response = await fetch(`${SERP_API_BASE}?${params.toString()}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SerpApi error ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function enrichProperty(
  name: string,
  city: string,
  state: string
): Promise<SerpEnrichmentResult> {
  const result: SerpEnrichmentResult = {
    directWebsiteUrl: null,
    amenities: [],
    imageUrl: null,
    phone: null,
  };

  try {
    const query = `${name} apartments ${city} ${state}`;
    const serpData = await searchSerp(query);

    if (serpData.knowledge_graph) {
      const kg = serpData.knowledge_graph;

      if (kg.website && !isAggregatorUrl(kg.website)) {
        result.directWebsiteUrl = kg.website;
      }

      if (kg.phone) {
        result.phone = kg.phone;
      }

      if (kg.description) {
        result.amenities.push(...extractAmenitiesFromText(kg.description));
      }

      if (kg.amenities) {
        const kgAmenities = Array.isArray(kg.amenities)
          ? kg.amenities
          : typeof kg.amenities === "string"
            ? kg.amenities.split(",").map((a: string) => a.trim())
            : [];
        for (const a of kgAmenities) {
          if (a && !result.amenities.includes(a)) {
            result.amenities.push(a);
          }
        }
      }

      if (kg.thumbnail && !result.imageUrl) {
        result.imageUrl = kg.thumbnail;
      }
    }

    if (serpData.local_results?.places) {
      for (const place of serpData.local_results.places) {
        if (
          place.title?.toLowerCase().includes(name.toLowerCase().split(" ")[0])
        ) {
          if (place.website && !isAggregatorUrl(place.website) && !result.directWebsiteUrl) {
            result.directWebsiteUrl = place.website;
          }
          if (place.phone && !result.phone) {
            result.phone = place.phone;
          }
          if (place.thumbnail && !result.imageUrl) {
            result.imageUrl = place.thumbnail;
          }
          break;
        }
      }
    }

    if (!result.directWebsiteUrl && serpData.organic_results) {
      for (const r of serpData.organic_results) {
        if (r.link && !isAggregatorUrl(r.link)) {
          const linkLower = r.link.toLowerCase();
          const nameParts = name.toLowerCase().split(/\s+/);
          const matchesName = nameParts.some(
            (part: string) => part.length > 3 && linkLower.includes(part)
          );

          if (matchesName) {
            result.directWebsiteUrl = r.link;
            break;
          }
        }
      }
    }

    if (result.amenities.length === 0 && serpData.organic_results) {
      for (const r of serpData.organic_results) {
        const snippet = r.snippet || r.rich_snippet?.top?.detected_extensions?.join(" ") || "";
        if (snippet) {
          const found = extractAmenitiesFromText(snippet);
          for (const a of found) {
            if (!result.amenities.includes(a)) {
              result.amenities.push(a);
            }
          }
        }
        if (result.amenities.length >= 5) break;
      }
    }
  } catch (error) {
    console.error(`SerpApi enrichment error for "${name}":`, error);
  }

  return result;
}

interface EnrichmentProgress {
  total: number;
  processed: number;
  enriched: number;
  errors: number;
  skipped: number;
  results: Array<{
    id: number;
    name: string;
    directUrl: string | null;
    amenitiesCount: number;
    error?: string;
  }>;
}

export async function enrichPropertiesBatch(options: {
  city?: string;
  limit?: number;
  forceRefresh?: boolean;
  excludeIds?: number[];
}): Promise<EnrichmentProgress> {
  const { city, limit = 10, forceRefresh = false, excludeIds = [] } = options;

  let query = `
    SELECT id, name, city, state, direct_website_url, amenities, image_url
    FROM scraped_properties
    WHERE name IS NOT NULL AND city IS NOT NULL
      AND current_price >= 200 AND current_price <= 15000
  `;
  const params: any[] = [];
  let paramIdx = 0;

  if (!forceRefresh) {
    query += ` AND (direct_website_url IS NULL OR amenities IS NULL OR amenities::text = '[]' OR jsonb_array_length(COALESCE(amenities, '[]'::jsonb)) < 5)`;
  }

  if (excludeIds.length > 0) {
    paramIdx++;
    params.push(excludeIds);
    query += ` AND id != ALL($${paramIdx})`;
  }

  if (city) {
    paramIdx++;
    params.push(city);
    query += ` AND LOWER(city) = LOWER($${paramIdx})`;
  }

  paramIdx++;
  params.push(limit);
  query += ` ORDER BY CASE WHEN direct_website_url IS NULL THEN 0 ELSE 1 END, id ASC LIMIT $${paramIdx}`;

  const result = await pool.query(query, params);
  const rows = result.rows;
  const progress: EnrichmentProgress = {
    total: rows.length,
    processed: 0,
    enriched: 0,
    errors: 0,
    skipped: 0,
    results: [],
  };

  for (const row of rows) {
    progress.processed++;

    if (
      !forceRefresh &&
      row.direct_website_url &&
      row.amenities &&
      JSON.stringify(row.amenities) !== "[]"
    ) {
      progress.skipped++;
      continue;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const enrichment = await enrichProperty(
        row.name,
        row.city,
        row.state || ""
      );

      const setClauses: string[] = [];
      const updateParams: any[] = [];
      let pIdx = 0;

      if (enrichment.directWebsiteUrl) {
        pIdx++;
        updateParams.push(enrichment.directWebsiteUrl);
        setClauses.push(`direct_website_url = $${pIdx}`);
      }

      const existingAmenities: string[] = (row.amenities && JSON.stringify(row.amenities) !== "[]")
        ? (Array.isArray(row.amenities) ? row.amenities : [])
        : [];
      const hasRichAmenities = existingAmenities.length >= 5;

      if (enrichment.amenities.length > 0 && !hasRichAmenities) {
        const merged = [...new Set([...existingAmenities, ...enrichment.amenities])];
        pIdx++;
        updateParams.push(JSON.stringify(merged));
        setClauses.push(`amenities = $${pIdx}::jsonb`);
      }

      if (enrichment.imageUrl && !row.image_url) {
        pIdx++;
        updateParams.push(enrichment.imageUrl);
        setClauses.push(`image_url = $${pIdx}`);
      }

      if (setClauses.length > 0) {
        setClauses.push(`updated_at = NOW()`);
        pIdx++;
        updateParams.push(row.id);
        await pool.query(
          `UPDATE scraped_properties SET ${setClauses.join(", ")} WHERE id = $${pIdx}`,
          updateParams
        );
        progress.enriched++;
      }

      progress.results.push({
        id: row.id,
        name: row.name,
        directUrl: enrichment.directWebsiteUrl,
        amenitiesCount: enrichment.amenities.length,
      });
    } catch (error: any) {
      progress.errors++;
      progress.results.push({
        id: row.id,
        name: row.name,
        directUrl: null,
        amenitiesCount: 0,
        error: error.message,
      });
    }
  }

  return progress;
}
