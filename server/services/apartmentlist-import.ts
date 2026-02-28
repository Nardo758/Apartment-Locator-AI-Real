import { db } from '../db';
import { sql } from 'drizzle-orm';
import type { ImportStats } from './apify-import';

interface ApartmentListUnit {
  bath?: number;
  bed?: number;
  photos?: string[];
  availability?: string;
  availableOn?: string;
  id?: number;
  name?: string;
  price?: number;
  priceMax?: number;
  sqft?: number;
  updatedAt?: string;
  applyOnlineUrl?: string;
}

interface ApartmentListListing {
  id?: string;
  url?: string;
  propertyName?: string;
  type?: string;
  description?: string;
  photos?: string[];
  coordinates?: { latitude?: number; longitude?: number };
  location?: {
    fullAddress?: string;
    streetAddress?: string;
    streedAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  amenities?: string[];
  units?: ApartmentListUnit[];
  depositFee?: string;
  applicationFee?: string;
  additionalFees?: string;
  moveInFees?: string;
  leaseTerms?: string;
  parkingDetails?: string;
  storageDetails?: string;
  isActive?: boolean;
  scrapedAt?: string;
  updatedAt?: string;
}

function parseNumberFromString(str: string | undefined | null): number | null {
  if (!str) return null;
  const match = str.match(/\$?([\d,]+)/);
  if (!match) return null;
  return parseInt(match[1].replace(/,/g, ''), 10) || null;
}

function derivePetPolicyFromAmenities(amenities: string[]): string {
  const petAmenities: string[] = [];
  for (const a of amenities) {
    const lower = a.toLowerCase();
    if (lower.includes('dog') || lower.includes('cat') || lower.includes('pet')) {
      petAmenities.push(a);
    }
  }
  if (petAmenities.length > 0) {
    return `Pets allowed - ${petAmenities.join(', ')}`;
  }
  return '';
}

function mapApartmentListToRow(listing: ApartmentListListing) {
  const loc = listing.location || {};
  const city = loc.city || '';
  const state = loc.state || '';
  const zipCode = loc.postalCode || '';
  const address = loc.streetAddress || loc.streedAddress || '';

  const availableUnits = (listing.units || []).filter(u => u.availability === 'available');
  const allUnits = listing.units || [];
  const unitsAvailable = availableUnits.length > 0 ? availableUnits.length : (allUnits.length > 0 ? allUnits.length : null);

  const pricedUnits = availableUnits.filter(u => u.price && u.price > 0);
  if (pricedUnits.length === 0) {
    const allPriced = allUnits.filter(u => u.price && u.price > 0);
    pricedUnits.push(...allPriced);
  }

  pricedUnits.sort((a, b) => (a.price || 0) - (b.price || 0));
  const cheapestUnit = pricedUnits[0];

  const currentPrice = cheapestUnit?.price || null;
  const bedrooms = cheapestUnit?.bed ?? (allUnits[0]?.bed ?? null);
  const bathrooms = cheapestUnit?.bath ?? (allUnits[0]?.bath ?? null);
  const sqft = cheapestUnit?.sqft ?? (allUnits[0]?.sqft ?? null);

  const imageUrl = listing.photos && listing.photos.length > 0 ? listing.photos[0] : null;

  const amenities = listing.amenities || [];
  const petPolicy = derivePetPolicyFromAmenities(amenities);
  const parkingInfo = listing.parkingDetails && listing.parkingDetails !== 'None' ? listing.parkingDetails : '';

  const applicationFee = parseNumberFromString(listing.applicationFee);
  const depositFee = parseNumberFromString(listing.depositFee);

  const propertyType = (listing.type || 'apartment')
    .replace(/\s*for\s*rent\s*/i, '')
    .trim();
  const capitalizedType = propertyType.charAt(0).toUpperCase() + propertyType.slice(1);

  return {
    externalId: listing.id || null,
    propertyId: listing.id || null,
    source: 'apartmentlist.com',
    name: listing.propertyName || '',
    address,
    city,
    state,
    zipCode,
    currentPrice,
    bedrooms,
    bathrooms: bathrooms != null ? String(bathrooms) : null,
    squareFeet: sqft,
    squareFootage: sqft,
    listingUrl: listing.url || null,
    imageUrl,
    amenities,
    unitFeatures: [] as string[],
    petPolicy: petPolicy || null,
    parkingInfo: parkingInfo || null,
    unitsAvailable,
    propertyType: capitalizedType,
    status: listing.isActive === false ? 'inactive' : 'active',
    freeRentConcessions: null as string | null,
    securityDeposit: depositFee,
    applicationFee,
    latitude: listing.coordinates?.latitude && listing.coordinates.latitude !== 0
      ? String(listing.coordinates.latitude) : null,
    longitude: listing.coordinates?.longitude && listing.coordinates.longitude !== 0
      ? String(listing.coordinates.longitude) : null,
  };
}

export class ApartmentListImportService {
  async importListings(listings: ApartmentListListing[]): Promise<ImportStats> {
    const stats: ImportStats = { inserted: 0, updated: 0, skipped: 0, errors: 0, total: listings.length };

    for (const listing of listings) {
      try {
        if (!listing.id && !listing.propertyName) {
          stats.skipped++;
          continue;
        }

        const row = mapApartmentListToRow(listing);

        if (!row.currentPrice || row.currentPrice < 200 || row.currentPrice > 15000) {
          stats.skipped++;
          continue;
        }

        const result = await db.execute(sql`
          INSERT INTO scraped_properties (
            external_id, property_id, source, name, address, city, state, zip_code,
            current_price, bedrooms, bathrooms, square_feet, square_footage,
            listing_url, image_url, amenities, unit_features,
            pet_policy, parking_info, units_available, property_type, status,
            free_rent_concessions, security_deposit, application_fee,
            latitude, longitude,
            scraped_at, first_seen_at, last_seen_at, created_at, updated_at
          ) VALUES (
            ${row.externalId}, ${row.propertyId}, ${row.source}, ${row.name}, ${row.address},
            ${row.city}, ${row.state}, ${row.zipCode},
            ${row.currentPrice}, ${row.bedrooms}, ${row.bathrooms},
            ${row.squareFeet}, ${row.squareFootage},
            ${row.listingUrl}, ${row.imageUrl},
            ${JSON.stringify(row.amenities)}::jsonb, ${JSON.stringify(row.unitFeatures)}::jsonb,
            ${row.petPolicy}, ${row.parkingInfo}, ${row.unitsAvailable}, ${row.propertyType}, ${row.status},
            ${row.freeRentConcessions}, ${row.securityDeposit}, ${row.applicationFee},
            ${row.latitude}, ${row.longitude},
            NOW(), NOW(), NOW(), NOW(), NOW()
          )
          ON CONFLICT (source, external_id)
          WHERE source IS NOT NULL AND external_id IS NOT NULL
          DO UPDATE SET
            name = EXCLUDED.name,
            address = EXCLUDED.address,
            city = EXCLUDED.city,
            state = EXCLUDED.state,
            zip_code = EXCLUDED.zip_code,
            current_price = EXCLUDED.current_price,
            bedrooms = EXCLUDED.bedrooms,
            bathrooms = EXCLUDED.bathrooms,
            square_feet = EXCLUDED.square_feet,
            square_footage = EXCLUDED.square_footage,
            listing_url = EXCLUDED.listing_url,
            image_url = COALESCE(EXCLUDED.image_url, scraped_properties.image_url),
            amenities = CASE
              WHEN EXCLUDED.amenities::text != '[]' THEN EXCLUDED.amenities
              ELSE scraped_properties.amenities
            END,
            unit_features = CASE
              WHEN EXCLUDED.unit_features::text != '[]' THEN EXCLUDED.unit_features
              ELSE scraped_properties.unit_features
            END,
            pet_policy = COALESCE(EXCLUDED.pet_policy, scraped_properties.pet_policy),
            parking_info = COALESCE(EXCLUDED.parking_info, scraped_properties.parking_info),
            units_available = COALESCE(EXCLUDED.units_available, scraped_properties.units_available),
            property_type = EXCLUDED.property_type,
            free_rent_concessions = EXCLUDED.free_rent_concessions,
            security_deposit = EXCLUDED.security_deposit,
            application_fee = COALESCE(EXCLUDED.application_fee, scraped_properties.application_fee),
            latitude = COALESCE(EXCLUDED.latitude, scraped_properties.latitude),
            longitude = COALESCE(EXCLUDED.longitude, scraped_properties.longitude),
            price_change_count = CASE
              WHEN EXCLUDED.current_price IS DISTINCT FROM scraped_properties.current_price
              THEN COALESCE(scraped_properties.price_change_count, 0) + 1
              ELSE COALESCE(scraped_properties.price_change_count, 0)
            END,
            last_price_change = CASE
              WHEN EXCLUDED.current_price IS DISTINCT FROM scraped_properties.current_price
              THEN NOW()
              ELSE scraped_properties.last_price_change
            END,
            volatility_score = CASE
              WHEN EXCLUDED.current_price IS DISTINCT FROM scraped_properties.current_price
              THEN LEAST(100, COALESCE(scraped_properties.volatility_score, 50) + 5)
              ELSE GREATEST(0, COALESCE(scraped_properties.volatility_score, 50) - 1)
            END,
            last_seen_at = NOW(),
            updated_at = NOW()
          RETURNING id, (xmax = 0) AS is_insert
        `);

        const rows = result.rows as any[];
        if (rows.length > 0) {
          const propertyId = rows[0].id;
          if (rows[0].is_insert) {
            stats.inserted++;
          } else {
            stats.updated++;
          }

          if (row.currentPrice || row.unitsAvailable) {
            await db.execute(sql`
              INSERT INTO property_snapshots (property_id, price, units_available, concession_type, concession_value, source)
              VALUES (${propertyId}, ${row.currentPrice}, ${row.unitsAvailable}, ${row.freeRentConcessions}, ${null}, ${'apartmentlist.com'})
            `);
          }
        }
      } catch (error) {
        console.error(`Failed to import ApartmentList listing ${listing.id || listing.propertyName}:`, error);
        stats.errors++;
      }
    }

    console.log(`ApartmentList import complete: ${stats.inserted} inserted, ${stats.updated} updated, ${stats.skipped} skipped, ${stats.errors} errors out of ${stats.total}`);
    return stats;
  }
}
