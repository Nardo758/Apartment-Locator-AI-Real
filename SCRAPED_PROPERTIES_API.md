# Scraped Properties API

Integration between apartment-scraper-worker and Apartment Locator AI

## Overview

The Apartment Locator AI app now has API endpoints to query scraped property data from the apartment-scraper-worker Cloudflare Worker.

**Data flow:**
1. apartment-scraper-worker scrapes properties → saves to Supabase
2. Apartment Locator AI queries Supabase → displays to users

## Prerequisites

1. **Run the Supabase schema** (`apartment-scraper-worker/schema-v2.sql`)
2. **Set environment variables** in Apartment Locator AI `.env`:
   ```
   SUPABASE_URL=https://jdymvpasjsdbryatscux.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

## API Endpoints

### 1. Search Properties

**GET** `/api/scraped-properties`

Search for properties with filters.

**Query Parameters:**
- `city` (string, optional) - City name (case-insensitive)
- `state` (string, optional) - 2-letter state code
- `min_price` (number, optional) - Minimum monthly rent in dollars
- `max_price` (number, optional) - Maximum monthly rent in dollars
- `limit` (number, optional, default: 50) - Results per page
- `offset` (number, optional, default: 0) - Pagination offset

**Example:**
```bash
GET /api/scraped-properties?city=Atlanta&state=GA&min_price=1500&max_price=3000
```

**Response:**
```json
{
  "properties": [
    {
      "id": "uuid",
      "property_name": "Elora at Buckhead",
      "address": "3372 Peachtree Road NE, Atlanta, GA 30326",
      "city": "Atlanta",
      "state": "GA",
      "phone": "888-823-4518",
      "pms_type": "entrata",
      "min_price": 1637,
      "max_price": 3177,
      "available_units": 15,
      "scraped_at": "2026-02-13T19:48:52.281Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

### 2. Get Property Details

**GET** `/api/scraped-properties/:id`

Get full details for a property including all lease rates and concessions.

**Example:**
```bash
GET /api/scraped-properties/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "property": {
    "id": "uuid",
    "property_name": "Elora at Buckhead",
    "address": "3372 Peachtree Road NE, Atlanta, GA 30326",
    "phone": "888-823-4518",
    "pms_type": "entrata",
    "website_url": "https://www.eloraatbuckhead.com/floor-plans/"
  },
  "lease_rates": [
    {
      "id": "uuid",
      "unit_type": "Studio",
      "sqft": 637,
      "price": 1500,
      "lease_term": "12 month",
      "available": "Now"
    },
    {
      "id": "uuid",
      "unit_type": "1 Bed 1 Bath",
      "sqft": 862,
      "price": 2862,
      "lease_term": "12 month",
      "available": "02.14.2026"
    }
  ],
  "concessions": [
    {
      "id": "uuid",
      "type": "free_rent",
      "description": "1 month free on 12-month lease",
      "value": "1 month free"
    }
  ],
  "amenities": [
    "Pool",
    "Gym",
    "Pet Friendly"
  ]
}
```

### 3. Get Available Units

**GET** `/api/scraped-properties/:id/available-units`

Get all available units for a specific property.

**Response:**
```json
{
  "units": [
    {
      "id": "uuid",
      "property_name": "Elora at Buckhead",
      "unit_type": "Studio",
      "unit_number": "A101",
      "monthly_rent": 1500,
      "sqft": 637,
      "lease_term": "12 month",
      "available": "Now"
    }
  ]
}
```

### 4. Get Concessions

**GET** `/api/scraped-properties/:id/concessions`

Get active concessions/specials for a property.

**Response:**
```json
{
  "concessions": [
    {
      "id": "uuid",
      "property_name": "Elora at Buckhead",
      "type": "free_rent",
      "description": "1 month free on select units",
      "value": "1 month free"
    }
  ]
}
```

### 5. Advanced Search

**POST** `/api/scraped-properties/search`

Advanced property search using the stored procedure.

**Request Body:**
```json
{
  "city": "Atlanta",
  "state": "GA",
  "min_price": 1500,
  "max_price": 3000,
  "min_beds": 1,
  "amenity": "pool"
}
```

**Response:**
```json
{
  "properties": [...],
  "total": 10
}
```

### 6. Get Stats

**GET** `/api/scraped-properties/stats/summary`

Get summary statistics of all scraped properties.

**Response:**
```json
{
  "total_properties": 45,
  "total_lease_rates": 678,
  "total_concessions": 23,
  "properties_by_city": {
    "Atlanta": 15,
    "Marietta": 12,
    "Alpharetta": 8
  }
}
```

## Usage in Frontend

### Example React Hook

```typescript
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export function useScrapedProperties(filters: {
  city?: string;
  state?: string;
  min_price?: number;
  max_price?: number;
}) {
  return useQuery({
    queryKey: ['scraped-properties', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.state) params.append('state', filters.state);
      if (filters.min_price) params.append('min_price', String(filters.min_price));
      if (filters.max_price) params.append('max_price', String(filters.max_price));
      
      const res = await fetch(`/api/scraped-properties?${params}`);
      if (!res.ok) throw new Error('Failed to fetch properties');
      return res.json();
    },
  });
}

export function usePropertyDetails(propertyId: string) {
  return useQuery({
    queryKey: ['property-details', propertyId],
    queryFn: async () => {
      const res = await fetch(`/api/scraped-properties/${propertyId}`);
      if (!res.ok) throw new Error('Failed to fetch property details');
      return res.json();
    },
    enabled: !!propertyId,
  });
}
```

### Example Component

```tsx
import { useScrapedProperties } from './hooks/useScrapedProperties';

export function PropertySearch() {
  const [filters, setFilters] = useState({
    city: 'Atlanta',
    state: 'GA',
    min_price: 1000,
    max_price: 3000,
  });

  const { data, isLoading } = useScrapedProperties(filters);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Available Properties</h2>
      {data?.properties.map((property: any) => (
        <div key={property.id} className="property-card">
          <h3>{property.property_name}</h3>
          <p>{property.address}</p>
          <p>From ${property.min_price}/mo</p>
          <p>{property.available_units} units available</p>
        </div>
      ))}
    </div>
  );
}
```

## Integration Steps

### 1. Run Database Schema

In Supabase SQL Editor:
```sql
-- Copy/paste content from apartment-scraper-worker/schema-v2.sql
```

### 2. Configure Environment

Add to `.env`:
```
SUPABASE_URL=https://jdymvpasjsdbryatscux.supabase.co
SUPABASE_ANON_KEY=your-key-here
```

### 3. Test the Integration

```bash
# 1. Scrape a property and save to Supabase
curl -X POST https://apartment-scraper.m-dixon5030.workers.dev/scrape-and-save \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.eloraatbuckhead.com/floor-plans/"}'

# 2. Query from Apartment Locator AI
curl http://localhost:5000/api/scraped-properties?city=Atlanta&state=GA
```

### 4. Create Frontend Pages

Suggested pages to add:
- `/properties/browse` - Search scraped properties
- `/properties/:id` - Property detail page with all units
- `/properties/:id/compare` - Compare to competition set
- Dashboard widget showing "Recently Scraped Properties"

## Data Freshness

- Properties are updated every time apartment-scraper-worker scrapes them
- Use `scraped_at` timestamp to show data freshness
- Consider running cleanup job weekly: `/api/scraped-properties/cleanup`

## Next Steps

1. ✅ Database schema created (`schema-v2.sql`)
2. ✅ Supabase integration built (`supabase-v2.ts`)
3. ✅ Scrape-and-save endpoint created (`/scrape-and-save`)
4. ✅ API routes added to Apartment Locator AI
5. ⏳ **TODO:** Create frontend components to display scraped properties
6. ⏳ **TODO:** Add "Import from Scraped Properties" to landlord dashboard
7. ⏳ **TODO:** Build comparison feature (scraped property vs competition set)

## Support

Issues? Check:
1. Supabase schema is deployed
2. Environment variables are set correctly
3. apartment-scraper-worker is successfully saving data
4. Network connectivity between services

---

**Created:** 2026-02-13  
**Last Updated:** 2026-02-13
