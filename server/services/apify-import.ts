import { db } from '../db';
import { scrapedProperties } from '../../shared/schema';
import { sql } from 'drizzle-orm';

interface ApifyListing {
  listingId?: string;
  url?: string;
  streetAddress?: string;
  fullAddress?: string;
  propertyName?: string;
  listingName?: string;
  listingAddress?: string;
  listingCity?: string;
  listingState?: string;
  listingZip?: string;
  listingMinRent?: number;
  listingMaxRent?: number;
  beds?: number;
  bathrooms?: { min?: number; max?: number };
  squareFeet?: { min?: number; max?: number };
  priceRanges?: Array<{ beds: string; price: string }>;
  imageUrl?: string;
  carouselCollection?: Array<{ Uri?: string }>;
  phone?: string;
  phoneNumber?: string;
  propertyType?: string;
  hasRentSpecials?: string;
  specials?: string[];
  location?: { latitude?: number; longitude?: number };
  amenities?: Array<{ title?: string; value?: string[] }>;
  petFees?: Array<{ petType?: string; feeName?: string; feeAmount?: string }>;
  parkingFees?: Array<{ parkingType?: string; feeName?: string; feeAmount?: string }>;
  rentals?: Array<{
    UnitNumber?: string;
    Beds?: number;
    Baths?: number;
    Rent?: number;
    MaxRent?: number;
    Deposit?: number;
    SquareFeet?: number;
    AvailableDateText?: string;
    InteriorAmenities?: any;
  }>;
  scores?: { walkScore?: number; transitScore?: number; bikeScore?: number };
  itemPage?: { about?: { containsPlace?: { petsAllowed?: boolean } } };
  listingCountry?: string;
  monthlyRent?: { min?: number; max?: number };
  bedrooms?: { min?: number; max?: number };
}

export interface ImportStats {
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  total: number;
}

function parseCityStateFromUrl(url: string, propertyName?: string): { city: string; state: string } {
  const pathMatch = url.match(/apartments\.com\/([^/]+)-([a-z]{2})\/[^/]+\/?$/i);
  if (!pathMatch) return { city: '', state: '' };

  const slug = pathMatch[1];
  const state = pathMatch[2].toUpperCase();

  if (propertyName) {
    const nameSlug = propertyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let remaining = slug;
    if (remaining.startsWith(nameSlug + '-')) {
      remaining = remaining.slice(nameSlug.length + 1);
    } else {
      const nameWords = nameSlug.split('-');
      for (let len = nameWords.length; len >= 1; len--) {
        const prefix = nameWords.slice(0, len).join('-');
        if (remaining.startsWith(prefix + '-')) {
          remaining = remaining.slice(prefix.length + 1);
          break;
        }
      }
    }

    if (remaining) {
      const city = remaining
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      return { city, state };
    }
  }

  const words = slug.split('-');
  if (words.length >= 2) {
    const city = words.slice(-2).join(' ');
    return {
      city: city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      state
    };
  }

  return { city: '', state: '' };
}

function parseZipFromAddress(fullAddress: string): string {
  const zipMatch = fullAddress.match(/\b(\d{5})(?:-\d{4})?\b/);
  return zipMatch ? zipMatch[1] : '';
}

function flattenAmenities(amenities: ApifyListing['amenities']): string[] {
  if (!amenities || !Array.isArray(amenities)) return [];
  const flat: string[] = [];
  for (const group of amenities) {
    if (group.value && Array.isArray(group.value)) {
      flat.push(...group.value);
    }
  }
  return flat;
}

function derivePetPolicy(listing: ApifyListing): string {
  if (listing.itemPage?.about?.containsPlace?.petsAllowed === false) {
    return 'No pets allowed';
  }
  if (listing.petFees && listing.petFees.length > 0) {
    const pets = listing.petFees.map(f =>
      `${f.petType || 'Pet'}: ${f.feeAmount || 'Contact'}`
    ).join('; ');
    return `Pets allowed - ${pets}`;
  }
  return '';
}

function deriveParkingInfo(listing: ApifyListing): string {
  if (!listing.parkingFees || listing.parkingFees.length === 0) return '';
  return listing.parkingFees.map(f =>
    `${f.parkingType || 'Parking'}: ${f.feeAmount || 'Contact'}`
  ).join('; ');
}

function deriveUnitFeatures(listing: ApifyListing): string[] {
  const features: string[] = [];
  if (listing.rentals && listing.rentals.length > 0) {
    const rental = listing.rentals[0];
    if (rental.InteriorAmenities?.SubCategories) {
      for (const sub of rental.InteriorAmenities.SubCategories) {
        if (sub.Amenities && Array.isArray(sub.Amenities)) {
          for (const a of sub.Amenities) {
            if (a.Name) features.push(a.Name);
          }
        }
      }
    }
  }
  return features;
}

function mapListingToRow(listing: ApifyListing) {
  const propertyName = listing.propertyName || listing.listingName || '';
  const { city: parsedCity, state: parsedState } = listing.url
    ? parseCityStateFromUrl(listing.url, propertyName)
    : { city: '', state: '' };

  const city = listing.listingCity || parsedCity || '';
  const state = listing.listingState || parsedState || '';
  const zipCode = listing.listingZip || parseZipFromAddress(listing.fullAddress || '');

  const minRent = listing.listingMinRent || listing.monthlyRent?.min || 0;
  const maxRent = listing.listingMaxRent || listing.monthlyRent?.max || minRent;
  const price = minRent > 0 ? minRent : maxRent;

  const beds = listing.beds || listing.bedrooms?.min ||
    (listing.rentals?.[0]?.Beds) || null;
  const baths = listing.bathrooms?.min ||
    (listing.rentals?.[0]?.Baths) || null;
  const sqft = listing.squareFeet?.min ||
    (listing.rentals?.[0]?.SquareFeet) || null;

  const imageUrl = listing.imageUrl ||
    listing.carouselCollection?.[0]?.Uri || null;

  const amenities = flattenAmenities(listing.amenities);
  const unitFeatures = deriveUnitFeatures(listing);
  const petPolicy = derivePetPolicy(listing);
  const parkingInfo = deriveParkingInfo(listing);

  const unitsAvailable = listing.rentals && listing.rentals.length > 0
    ? listing.rentals.length : null;

  const propertyType = (listing.propertyType || '')
    .replace(/\s*for\s*rent\s*/i, '')
    .trim() || 'Apartment';

  const hasSpecials = listing.hasRentSpecials === 'Specials' ||
    (listing.specials && listing.specials.length > 0);
  const concessions = hasSpecials
    ? (listing.specials?.join(', ') || 'Rent specials available')
    : null;

  const deposit = listing.rentals?.[0]?.Deposit || null;

  return {
    externalId: listing.listingId || null,
    propertyId: listing.listingId || null,
    source: 'apartments.com',
    name: listing.propertyName || listing.listingName ||
      `${listing.streetAddress || listing.listingAddress || 'Unknown'}`,
    address: listing.streetAddress || listing.listingAddress || '',
    city,
    state,
    zipCode,
    currentPrice: price > 0 ? price : null,
    bedrooms: beds,
    bathrooms: baths ? String(baths) : null,
    squareFeet: sqft,
    squareFootage: sqft,
    listingUrl: listing.url || null,
    imageUrl,
    amenities: amenities.length > 0 ? amenities : [],
    unitFeatures: unitFeatures.length > 0 ? unitFeatures : [],
    petPolicy: petPolicy || null,
    parkingInfo: parkingInfo || null,
    unitsAvailable,
    propertyType,
    status: 'active',
    freeRentConcessions: concessions,
    securityDeposit: deposit,
    latitude: listing.location?.latitude && listing.location.latitude !== 0
      ? String(listing.location.latitude) : null,
    longitude: listing.location?.longitude && listing.location.longitude !== 0
      ? String(listing.location.longitude) : null,
    scrapedAt: new Date(),
    firstSeenAt: new Date(),
    lastSeenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export class ApifyImportService {
  async importListings(listings: ApifyListing[]): Promise<ImportStats> {
    const stats: ImportStats = { inserted: 0, updated: 0, skipped: 0, errors: 0, total: listings.length };

    for (const listing of listings) {
      try {
        if (!listing.listingId) {
          stats.skipped++;
          continue;
        }

        const row = mapListingToRow(listing);

        const result = await db.execute(sql`
          INSERT INTO scraped_properties (
            external_id, property_id, source, name, address, city, state, zip_code,
            current_price, bedrooms, bathrooms, square_feet, square_footage,
            listing_url, image_url, amenities, unit_features,
            pet_policy, parking_info, units_available, property_type, status,
            free_rent_concessions, security_deposit,
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
            ${row.freeRentConcessions}, ${row.securityDeposit},
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
            image_url = EXCLUDED.image_url,
            amenities = EXCLUDED.amenities,
            unit_features = EXCLUDED.unit_features,
            pet_policy = EXCLUDED.pet_policy,
            parking_info = EXCLUDED.parking_info,
            units_available = EXCLUDED.units_available,
            property_type = EXCLUDED.property_type,
            free_rent_concessions = EXCLUDED.free_rent_concessions,
            security_deposit = EXCLUDED.security_deposit,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            last_seen_at = NOW(),
            updated_at = NOW()
          RETURNING (xmax = 0) AS is_insert
        `);

        const rows = result.rows as any[];
        if (rows.length > 0 && rows[0].is_insert) {
          stats.inserted++;
        } else {
          stats.updated++;
        }
      } catch (error) {
        console.error(`Failed to import listing ${listing.listingId}:`, error);
        stats.errors++;
      }
    }

    console.log(`Apify import complete: ${stats.inserted} inserted, ${stats.updated} updated, ${stats.skipped} skipped, ${stats.errors} errors out of ${stats.total}`);
    return stats;
  }
}
