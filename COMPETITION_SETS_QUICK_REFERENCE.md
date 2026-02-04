# Competition Sets API - Quick Reference

## 🚀 Quick Start

### 1. Run Database Migration
```bash
cd apartment-locator-ai
# If using Supabase CLI:
supabase db push

# Or manually apply:
psql -d your_database -f supabase/migrations/20260204000000_competition_sets.sql
```

### 2. Start the Server
```bash
npm run dev
```

### 3. Test the API
```bash
./test-competition-sets.sh
```

---

## 📋 API Endpoints Cheat Sheet

All endpoints require authentication: `Authorization: Bearer <token>`

### Create Competition Set
```bash
POST /api/competition-sets
{
  "name": "My Competitors",
  "description": "Optional description",
  "ownPropertyIds": ["uuid1", "uuid2"],
  "alertsEnabled": true
}
```

### List All Sets
```bash
GET /api/competition-sets?limit=50&offset=0
```

### Get Set Details
```bash
GET /api/competition-sets/:id
```

### Update Set
```bash
PATCH /api/competition-sets/:id
{
  "name": "New Name",
  "alertsEnabled": false
}
```

### Delete Set
```bash
DELETE /api/competition-sets/:id
```

### Add Competitor
```bash
POST /api/competition-sets/:id/competitors
{
  "address": "123 Main St",
  "latitude": 30.2672,
  "longitude": -97.7431,
  "bedrooms": 2,
  "bathrooms": 2,
  "squareFeet": 1100,
  "currentRent": 2200,
  "amenities": ["pool", "gym"],
  "concessions": [{
    "type": "discount",
    "description": "First month free",
    "value": 2200
  }],
  "source": "manual"
}
```

### Remove Competitor
```bash
DELETE /api/competition-sets/:id/competitors/:competitorId
```

---

## 🔧 cURL Examples

### 1. Sign In
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### 2. Create Competition Set
```bash
curl -X POST http://localhost:5000/api/competition-sets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Competitors",
    "ownPropertyIds": [],
    "alertsEnabled": true
  }'
```

### 3. List Sets
```bash
curl -X GET http://localhost:5000/api/competition-sets \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Database Tables

### competition_sets
```
id                | UUID (PK)
user_id           | UUID (FK -> users)
name              | VARCHAR(255)
description       | TEXT
own_property_ids  | JSONB (array of UUIDs)
alerts_enabled    | BOOLEAN
created_at        | TIMESTAMPTZ
updated_at        | TIMESTAMPTZ
```

### competition_set_competitors
```
id            | UUID (PK)
set_id        | UUID (FK -> competition_sets)
property_id   | UUID (FK -> properties, nullable)
address       | VARCHAR(500)
latitude      | NUMERIC(10,8)
longitude     | NUMERIC(11,8)
bedrooms      | INTEGER
bathrooms     | NUMERIC(3,1)
square_feet   | INTEGER
current_rent  | NUMERIC(10,2)
amenities     | JSONB (array)
concessions   | JSONB (array of objects)
last_updated  | TIMESTAMPTZ
source        | VARCHAR(50)
notes         | TEXT
is_active     | BOOLEAN
created_at    | TIMESTAMPTZ
```

---

## ✅ What's Included

- ✅ 7 RESTful API endpoints
- ✅ Full CRUD operations for competition sets
- ✅ Competitor management (add/remove)
- ✅ TypeScript types and Zod validation
- ✅ Database schema with RLS
- ✅ User authorization checks
- ✅ Duplicate prevention
- ✅ Cascade deletes
- ✅ Pagination support
- ✅ Automatic timestamps
- ✅ Test script included

---

## 🔒 Security Features

- **Authentication Required** - All endpoints need valid JWT
- **Row Level Security** - Database enforces user isolation
- **Input Validation** - Zod schemas validate all inputs
- **Ownership Checks** - Users can only access their own data
- **Cascade Deletes** - Deleting a set removes all competitors
- **Duplicate Detection** - Prevents duplicate competitor addresses

---

## 🧪 Testing

Run the automated test script:
```bash
./test-competition-sets.sh
```

This will:
1. Create a test user (or sign in)
2. Create a competition set
3. List all sets
4. Get set details
5. Add a competitor
6. Update the set
7. Test duplicate prevention
8. Delete competitor
9. Delete the set

---

## 📝 TypeScript Usage

### In Your React/Frontend Code

```typescript
import type { 
  CompetitionSet, 
  CompetitionSetCompetitor,
  InsertCompetitionSet 
} from '@shared/schema';

// Create a new set
const createSet = async (data: InsertCompetitionSet) => {
  const response = await fetch('/api/competition-sets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json() as Promise<CompetitionSet>;
};

// List sets
const listSets = async () => {
  const response = await fetch('/api/competition-sets', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json() as Promise<{
    sets: (CompetitionSet & { competitorCount: number })[];
    total: number;
  }>;
};

// Add competitor
const addCompetitor = async (setId: string, data: InsertCompetitionSetCompetitor) => {
  const response = await fetch(`/api/competition-sets/${setId}/competitors`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json() as Promise<CompetitionSetCompetitor>;
};
```

---

## 🐛 Troubleshooting

### Migration fails
```bash
# Check if tables already exist
psql -d your_db -c "\dt competition_sets"

# Drop tables if needed (CAREFUL - this deletes data!)
psql -d your_db -c "DROP TABLE IF EXISTS competition_set_competitors CASCADE;"
psql -d your_db -c "DROP TABLE IF EXISTS competition_sets CASCADE;"

# Re-run migration
supabase db push
```

### Authentication issues
```bash
# Make sure you have a valid token
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test User"}'
```

### Server not starting
```bash
# Check if required dependencies are installed
npm install

# Check if database is running
psql -d your_db -c "SELECT 1"

# Check server logs
npm run dev
```

---

## 📚 Related Documentation

- **Full Implementation Details**: `COMPETITION_SETS_IMPLEMENTATION.md`
- **Gap Analysis**: `LANDLORD_API_GAP_ANALYSIS.md`
- **Database Migration**: `supabase/migrations/20260204000000_competition_sets.sql`
- **Schema Types**: `shared/schema.ts`
- **Storage Layer**: `server/storage.ts`
- **API Routes**: `server/routes.ts`

---

## 🎯 Next Steps

1. ✅ **Migration Applied** - Database tables created
2. ✅ **Server Running** - API endpoints available
3. ✅ **Tests Passing** - All 7 endpoints work
4. 🔲 **Frontend Integration** - Connect React components
5. 🔲 **Add Property Ownership** - Extend properties table
6. 🔲 **Implement Comparison View** - Build analytics endpoints
7. 🔲 **Add Pricing Alerts** - Build alert generation system

---

**Ready to use!** 🚀

For questions or issues, refer to `COMPETITION_SETS_IMPLEMENTATION.md` for detailed information.
