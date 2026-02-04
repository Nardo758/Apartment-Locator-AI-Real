# Competition Sets API Implementation

**Date:** February 4, 2026  
**Status:** ✅ Complete  

## Summary

Successfully implemented 7 API endpoints for Competition Sets functionality in the Landlord Dashboard, including TypeScript types, validation, and database schema.

## Files Modified/Created

### 1. Database Schema (`shared/schema.ts`)
- ✅ Added `competitionSets` table definition
- ✅ Added `competitionSetCompetitors` table definition
- ✅ Created insert schemas with Zod validation
- ✅ Exported TypeScript types

### 2. Storage Layer (`server/storage.ts`)
- ✅ Added imports for new tables and types
- ✅ Extended `IStorage` interface with 8 new methods
- ✅ Implemented all competition sets CRUD operations
- ✅ Implemented competitor management methods
- ✅ Added user authorization checks

### 3. API Routes (`server/routes.ts`)
- ✅ Added imports for competition set schemas
- ✅ Implemented 7 RESTful endpoints with authentication
- ✅ Added comprehensive validation
- ✅ Included error handling

### 4. Database Migration (`supabase/migrations/20260204000000_competition_sets.sql`)
- ✅ Created tables with proper foreign keys
- ✅ Added indexes for performance
- ✅ Enabled Row Level Security (RLS)
- ✅ Created RLS policies for user isolation
- ✅ Added automatic timestamp triggers
- ✅ Included documentation comments

## API Endpoints Implemented

### 1. **POST /api/competition-sets**
**Create a new competition set**

**Request:**
```json
{
  "name": "Downtown Premium Competitors",
  "description": "Track luxury apartments in downtown Austin",
  "ownPropertyIds": ["uuid1", "uuid2"],
  "alertsEnabled": true
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "Downtown Premium Competitors",
  "description": "...",
  "ownPropertyIds": ["uuid1", "uuid2"],
  "alertsEnabled": true,
  "createdAt": "2026-02-04T10:00:00Z",
  "updatedAt": "2026-02-04T10:00:00Z"
}
```

**Validation:**
- Name required, max 255 characters
- ownPropertyIds must be an array
- User must be authenticated

---

### 2. **GET /api/competition-sets**
**List all competition sets for authenticated user**

**Query Parameters:**
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)

**Response:** `200 OK`
```json
{
  "sets": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "Downtown Premium Competitors",
      "description": "...",
      "ownPropertyIds": ["uuid1", "uuid2"],
      "competitorCount": 12,
      "alertsEnabled": true,
      "createdAt": "2026-02-04T10:00:00Z",
      "updatedAt": "2026-02-04T10:00:00Z"
    }
  ],
  "total": 5,
  "limit": 50,
  "offset": 0
}
```

---

### 3. **GET /api/competition-sets/:id**
**Get competition set details with competitors**

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "Downtown Premium Competitors",
  "description": "...",
  "ownPropertyIds": ["uuid1", "uuid2"],
  "alertsEnabled": true,
  "createdAt": "2026-02-04T10:00:00Z",
  "updatedAt": "2026-02-04T10:00:00Z",
  "competitors": [
    {
      "id": "uuid",
      "setId": "uuid",
      "address": "123 Main St, Austin, TX",
      "bedrooms": 2,
      "bathrooms": 2.0,
      "squareFeet": 1100,
      "currentRent": 2200,
      "amenities": ["pool", "gym"],
      "concessions": [],
      "source": "manual",
      "isActive": true,
      "createdAt": "2026-02-04T10:00:00Z"
    }
  ]
}
```

**Error Responses:**
- `404 Not Found` - Competition set not found or access denied

---

### 4. **PATCH /api/competition-sets/:id**
**Update competition set**

**Request:**
```json
{
  "name": "Updated Name",
  "alertsEnabled": false
}
```

**Allowed Fields:**
- `name` (string, max 255 chars)
- `description` (string)
- `ownPropertyIds` (array of UUIDs)
- `alertsEnabled` (boolean)

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "Updated Name",
  "description": "...",
  "ownPropertyIds": ["uuid1"],
  "alertsEnabled": false,
  "createdAt": "2026-02-04T10:00:00Z",
  "updatedAt": "2026-02-04T11:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid field values or no fields provided
- `404 Not Found` - Competition set not found

---

### 5. **DELETE /api/competition-sets/:id**
**Delete competition set and all its competitors (cascade)**

**Response:** `204 No Content`

**Error Responses:**
- `404 Not Found` - Competition set not found

---

### 6. **POST /api/competition-sets/:id/competitors**
**Add a competitor to a competition set**

**Request:**
```json
{
  "propertyId": "uuid-if-existing",
  "address": "123 Main St, Austin, TX",
  "latitude": 30.2672,
  "longitude": -97.7431,
  "bedrooms": 2,
  "bathrooms": 2.0,
  "squareFeet": 1100,
  "currentRent": 2200,
  "amenities": ["pool", "gym", "parking"],
  "concessions": [
    {
      "type": "discount",
      "description": "First month free",
      "value": 2200
    }
  ],
  "source": "manual",
  "notes": "Direct competitor on same street"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "setId": "uuid",
  "propertyId": null,
  "address": "123 Main St, Austin, TX",
  "latitude": 30.2672,
  "longitude": -97.7431,
  "bedrooms": 2,
  "bathrooms": 2.0,
  "squareFeet": 1100,
  "currentRent": 2200,
  "amenities": ["pool", "gym", "parking"],
  "concessions": [...],
  "source": "manual",
  "isActive": true,
  "lastUpdated": "2026-02-04T10:00:00Z",
  "createdAt": "2026-02-04T10:00:00Z"
}
```

**Validation:**
- Address is required
- Prevents duplicate addresses within same set
- User must own the competition set

**Error Responses:**
- `400 Bad Request` - Invalid competitor data
- `404 Not Found` - Competition set not found
- `409 Conflict` - Duplicate address in set

---

### 7. **DELETE /api/competition-sets/:id/competitors/:competitorId**
**Remove a competitor from a competition set**

**Response:** `204 No Content`

**Error Responses:**
- `404 Not Found` - Competition set or competitor not found

---

## Database Schema

### `competition_sets` Table
```sql
CREATE TABLE public.competition_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  own_property_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  alerts_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### `competition_set_competitors` Table
```sql
CREATE TABLE public.competition_set_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID NOT NULL REFERENCES public.competition_sets(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id),
  address VARCHAR(500) NOT NULL,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  bedrooms INTEGER,
  bathrooms NUMERIC(3, 1),
  square_feet INTEGER,
  current_rent NUMERIC(10, 2),
  amenities JSONB DEFAULT '[]'::jsonb,
  concessions JSONB DEFAULT '[]'::jsonb,
  last_updated TIMESTAMPTZ DEFAULT now(),
  source VARCHAR(50) DEFAULT 'manual',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Indexes
- `idx_competition_sets_user_id` - Fast user-based queries
- `idx_competition_sets_updated_at` - Sort by recent updates
- `idx_competition_set_competitors_set_id` - Fast competitor lookups
- `idx_competition_set_competitors_created_at` - Sort by creation

### Row Level Security (RLS)
- Users can only access their own competition sets
- Users can only manage competitors in their own sets
- Automatic authorization checks via PostgreSQL policies

---

## TypeScript Types

### Main Types
```typescript
export type CompetitionSet = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  ownPropertyIds: string[];
  alertsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CompetitionSetCompetitor = {
  id: string;
  setId: string;
  propertyId: string | null;
  address: string;
  latitude: string | null;
  longitude: string | null;
  bedrooms: number | null;
  bathrooms: string | null;
  squareFeet: number | null;
  currentRent: string | null;
  amenities: string[];
  concessions: Array<{
    type: string;
    description: string;
    value: number;
  }>;
  lastUpdated: Date;
  source: string;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
};

export type InsertCompetitionSet = Omit<CompetitionSet, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertCompetitionSetCompetitor = Omit<CompetitionSetCompetitor, 'id' | 'createdAt' | 'lastUpdated'>;
```

---

## Security Features

1. **Authentication Required** - All endpoints require valid JWT token
2. **User Isolation** - Users can only access their own data
3. **Database-Level Security** - RLS policies enforce authorization
4. **Input Validation** - Zod schemas validate all inputs
5. **Duplicate Prevention** - Checks for duplicate competitor addresses
6. **Cascade Deletes** - Deleting a set removes all competitors
7. **Ownership Verification** - All updates verify user ownership

---

## Testing the API

### Prerequisites
```bash
# Make sure the database is running and migration is applied
cd apartment-locator-ai
npm run db:migrate # or supabase db push
npm run dev
```

### Example: Create a Competition Set
```bash
# First, get an auth token by signing in
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "landlord@example.com",
    "password": "password123"
  }'

# Use the token in subsequent requests
export TOKEN="your-jwt-token-here"

# Create a competition set
curl -X POST http://localhost:5000/api/competition-sets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Competitors",
    "description": "Tracking premium apartments in downtown",
    "ownPropertyIds": [],
    "alertsEnabled": true
  }'
```

### Example: Add a Competitor
```bash
curl -X POST http://localhost:5000/api/competition-sets/{setId}/competitors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "123 Main St, Austin, TX 78701",
    "latitude": 30.2672,
    "longitude": -97.7431,
    "bedrooms": 2,
    "bathrooms": 2,
    "squareFeet": 1100,
    "currentRent": 2200,
    "amenities": ["pool", "gym", "parking"],
    "concessions": [],
    "source": "manual"
  }'
```

---

## Next Steps

### Immediate TODO:
1. **Run the migration** - Apply the SQL migration to create tables
2. **Test endpoints** - Use Postman/curl to validate all 7 endpoints
3. **Frontend integration** - Connect React components to new API

### Future Enhancements (from Gap Analysis):
1. **Property Ownership** - Add `landlord_id` to properties table
2. **Competitor Search** - Implement geo-based competitor discovery
3. **Bulk Import** - CSV upload for multiple competitors
4. **Comparison Analytics** - Implement comparison/benchmarking endpoints
5. **Pricing Alerts** - Build alert generation system
6. **Historical Tracking** - Track competitor price changes over time

---

## Performance Considerations

- **Pagination** - List endpoints support limit/offset
- **Indexes** - Key columns indexed for fast queries
- **Cascade Deletes** - Database handles cleanup automatically
- **JSON Validation** - Consider adding CHECK constraints for JSONB columns
- **Query Optimization** - Consider materialized views for competitor counts

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Human-readable error message",
  "details": [/* Validation errors if applicable */]
}
```

HTTP Status Codes:
- `200 OK` - Success
- `201 Created` - Resource created
- `204 No Content` - Success with no response body
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource
- `500 Internal Server Error` - Server error

---

## Documentation

All endpoints follow RESTful conventions:
- **GET** - Retrieve resources
- **POST** - Create resources
- **PATCH** - Partial update
- **DELETE** - Remove resources

Authentication: `Authorization: Bearer <jwt-token>`

---

**Implementation Complete!** ✅

Ready for testing and frontend integration.
