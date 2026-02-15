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

