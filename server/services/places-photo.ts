const PLACES_API_BASE = "https://places.googleapis.com/v1";

const photoCache = new Map<string, string | null>();

function getApiKey(): string | null {
  return process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || null;
}

function buildCacheKey(address: string, city: string, state: string): string {
  return `${address}|${city}|${state}`.toLowerCase().trim();
}

async function searchPlacePhoto(query: string, apiKey: string): Promise<string | null> {
  try {
    const searchRes = await fetch(`${PLACES_API_BASE}/places:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.photos",
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
    });

    if (!searchRes.ok) {
      console.error("Places search failed:", searchRes.status, await searchRes.text());
      return null;
    }

    const searchData = await searchRes.json();
    const photos = searchData?.places?.[0]?.photos;
    if (!photos || photos.length === 0) return null;

    const photoName = photos[0].name;
    const photoUrl = `${PLACES_API_BASE}/${photoName}/media?key=${apiKey}&maxWidthPx=800&skipHttpRedirect=true`;

    const photoRes = await fetch(photoUrl);
    if (!photoRes.ok) {
      console.error("Places photo fetch failed:", photoRes.status);
      return `${PLACES_API_BASE}/${photoName}/media?key=${apiKey}&maxWidthPx=800`;
    }

    const photoData = await photoRes.json();
    return photoData?.photoUri || `${PLACES_API_BASE}/${photoName}/media?key=${apiKey}&maxWidthPx=800`;
  } catch (err) {
    console.error("Places photo lookup error:", err);
    return null;
  }
}

export async function getPropertyPhoto(
  address: string,
  city: string,
  state: string,
  propertySource?: string
): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const cacheKey = buildCacheKey(address, city, state);

  if (photoCache.has(cacheKey)) {
    return photoCache.get(cacheKey) || null;
  }

  const sourceName = propertySource
    ? propertySource.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[._-]/g, " ")
    : "";

  const query = sourceName
    ? `${sourceName} apartments ${address} ${city} ${state}`
    : `apartments ${address} ${city} ${state}`;

  const photoUrl = await searchPlacePhoto(query, apiKey);
  photoCache.set(cacheKey, photoUrl);
  return photoUrl;
}

export async function enrichPropertiesWithPhotos(
  properties: any[],
  supabaseClient?: any
): Promise<any[]> {
  const apiKey = getApiKey();
  if (!apiKey) return properties;

  const addressGroups = new Map<string, { address: string; city: string; state: string; source: string; ids: number[] }>();

  for (const p of properties) {
    const addr = p.address || "";
    const city = p.city || "";
    const state = p.state || "";
    if (!addr || addr.startsWith("http")) continue;

    const key = buildCacheKey(addr, city, state);
    if (!addressGroups.has(key)) {
      addressGroups.set(key, { address: addr, city, state, source: p.source || "", ids: [] });
    }
    addressGroups.get(key)!.ids.push(p.id);
  }

  const lookupPromises: Promise<void>[] = [];

  for (const [key, group] of addressGroups) {
    if (photoCache.has(key)) continue;

    const hasExistingImage = properties.some(
      (p: any) => buildCacheKey(p.address || "", p.city || "", p.state || "") === key && p.image_url
    );
    if (hasExistingImage) {
      const existing = properties.find(
        (p: any) => buildCacheKey(p.address || "", p.city || "", p.state || "") === key && p.image_url
      );
      photoCache.set(key, existing.image_url);
      continue;
    }

    lookupPromises.push(
      getPropertyPhoto(group.address, group.city, group.state, group.source).then(async (photoUrl) => {
        if (photoUrl && supabaseClient) {
          try {
            await supabaseClient
              .from("scraped_properties")
              .update({ image_url: photoUrl })
              .in("id", group.ids);
          } catch (err) {
            console.error("Failed to cache photo URL in Supabase:", err);
          }
        }
      })
    );
  }

  if (lookupPromises.length > 0) {
    await Promise.all(lookupPromises);
  }

  return properties.map((p: any) => {
    if (p.image_url) return p;
    const key = buildCacheKey(p.address || "", p.city || "", p.state || "");
    const cachedUrl = photoCache.get(key);
    return cachedUrl ? { ...p, image_url: cachedUrl } : p;
  });
}
