# Migration Guide: Supabase → Postgres + MongoDB

**Goal:** Move ~100 apartment properties from Supabase to new Postgres + MongoDB setup

---

## Prerequisites

1. **Install Python dependencies:**
```bash
pip install supabase asyncpg motor
```

2. **Postgres database ready** with credentials
3. **MongoDB running** (local or remote)

---

## Step 1: Create Postgres Schema

Run the schema file to set up tables:

```bash
psql -U your_user -d jedi_re -f postgres_schema.sql
```

**What it creates:**
- `properties` table (42 columns, full schema)
- `price_history` table
- Indexes for fast queries
- Auto-update triggers (search vector, geolocation)
- Views for common queries

**Verify schema created:**
```bash
psql -U your_user -d jedi_re -c "\dt"
```
Should show: `properties`, `price_history`

---

## Step 2: Configure Migration Script

Edit `migrate_apartment_data.py`:

```python
OLD_SUPABASE_URL = "https://YOUR_PROJECT.supabase.co"
OLD_SUPABASE_KEY = "your-anon-key-here"
NEW_POSTGRES_URL = "postgresql://user:pass@host:5432/jedi_re"
MONGODB_URL = "mongodb://localhost:27017"
```

**Where to find Supabase credentials:**
1. Go to Supabase dashboard
2. Settings → API
3. Copy: `URL` + `anon public` key

---

## Step 3: Run Migration

```bash
python migrate_apartment_data.py
```

**Expected output:**
```
🚀 Starting migration: Supabase → Postgres + MongoDB
================================================================
📡 Connecting to databases...
📦 Fetching properties from Supabase...
✅ Found 87 properties

🔄 Migrating properties...
  ✅ [1/87] Marquis at Buckhead
  ✅ [2/87] Camden Buckhead
  ✅ [3/87] Elora at Buckhead
  ...
  ✅ [87/87] Property Name

📊 Migrating price history...
  ✅ Migrated 12 price history records

================================================================
✅ Migration complete!
  📦 Properties: 87
  🗄️  Postgres: ✅
  🍃 MongoDB: ✅
```

---

## Step 4: Verify Migration

**Check Postgres:**
```sql
-- Count properties
SELECT COUNT(*) FROM properties;

-- View sample
SELECT name, city, min_price, max_price FROM properties LIMIT 5;

-- Check active properties
SELECT COUNT(*) FROM active_properties;
```

**Check MongoDB:**
```javascript
// From mongo shell
use apartment_locator
db.properties.countDocuments()
db.properties.findOne()
```

---

## What Happens During Migration

### Postgres (Primary Database)
- Stores structured data with full schema
- Enables spatial queries (PostGIS)
- Full-text search (tsvector)
- Price history tracking
- Used for: complex queries, joins, analytics

### MongoDB (Cache Layer)
- Stores full JSON documents
- Fast reads for property searches
- No schema constraints
- Used for: API responses, quick lookups, search results

### Safety Features
- ✅ **UPSERT** - Safe to re-run (won't duplicate)
- ✅ **Progress logging** - See what's migrating
- ✅ **Error handling** - Logs failures, continues
- ✅ **Original data preserved** - Supabase untouched

---

## Troubleshooting

### Error: "relation properties does not exist"
**Fix:** Run `postgres_schema.sql` first

### Error: "asyncpg.exceptions.InvalidAuthorizationSpecificationError"
**Fix:** Check Postgres credentials in `NEW_POSTGRES_URL`

### Error: "supabase.exceptions.AuthException"
**Fix:** Check Supabase `URL` and `KEY` are correct

### Error: Connection to MongoDB failed
**Fix:** Make sure MongoDB is running:
```bash
# Local MongoDB
sudo systemctl start mongodb

# Or Docker
docker run -d -p 27017:27017 mongo:latest
```

---

## After Migration

1. **Test API queries** against new Postgres database
2. **Update JEDI RE integration** to use new properties table
3. **Keep Supabase running** temporarily as backup
4. **Monitor performance** (MongoDB cache should be fast!)
5. **Decommission Supabase** after confirming everything works

---

## Files

- `postgres_schema.sql` - Database schema (run first)
- `migrate_apartment_data.py` - Migration script (run second)
- `MIGRATION_GUIDE.md` - This guide

---

**Questions?** Check logs, verify credentials, or ask for help!
