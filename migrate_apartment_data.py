"""
Quick migration for ~100 properties from Supabase to Postgres + MongoDB

Usage:
1. Update credentials below
2. Run: python migrate_apartment_data.py
"""

import asyncio
import asyncpg
from motor.motor_asyncio import AsyncIOMotorClient
from supabase import create_client
from datetime import datetime
import json

# ============================================================
# CONFIGURATION - UPDATE THESE
# ============================================================
OLD_SUPABASE_URL = "YOUR_SUPABASE_URL"
OLD_SUPABASE_KEY = "YOUR_SUPABASE_KEY"
NEW_POSTGRES_URL = "postgresql://user:pass@host:5432/jedi_re"
MONGODB_URL = "mongodb://localhost:27017"

async def migrate():
    print("🚀 Starting migration: Supabase → Postgres + MongoDB")
    print("=" * 60)
    
    # Connect to all databases
    print("\n📡 Connecting to databases...")
    supabase = create_client(OLD_SUPABASE_URL, OLD_SUPABASE_KEY)
    pg_conn = await asyncpg.connect(NEW_POSTGRES_URL)
    mongo_client = AsyncIOMotorClient(MONGODB_URL)
    mongo_db = mongo_client['apartment_locator']
    
    # Get all properties from Supabase
    print("📦 Fetching properties from Supabase...")
    response = supabase.table('properties').select('*').execute()
    properties = response.data
    
    print(f"✅ Found {len(properties)} properties\n")
    
    # Migrate each property
    print("🔄 Migrating properties...")
    for i, prop in enumerate(properties, 1):
        try:
            # Insert to Postgres
            await pg_conn.execute('''
                INSERT INTO properties (
                    id, external_id, source, name, address, city, state, zip_code,
                    latitude, longitude, min_price, max_price, price_range,
                    bedrooms_min, bedrooms_max, bathrooms_min, bathrooms_max,
                    square_feet_min, square_feet_max,
                    amenities, features, pet_policy, parking, utilities,
                    images, virtual_tour_url, description, property_type,
                    year_built, units_count, phone, email, website,
                    management_company, ai_description, ai_tags, sentiment_score,
                    listing_url, last_seen, first_scraped, last_updated, is_active
                )
                VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                    $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24,
                    $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35,
                    $36, $37, $38, $39, $40, $41, $42
                )
                ON CONFLICT (id) DO UPDATE SET
                    last_updated = EXCLUDED.last_updated,
                    last_seen = EXCLUDED.last_seen,
                    is_active = EXCLUDED.is_active
            ''',
                prop['id'], prop['external_id'], prop['source'], prop['name'],
                prop['address'], prop['city'], prop['state'], prop.get('zip_code'),
                prop.get('latitude'), prop.get('longitude'),
                prop.get('min_price'), prop.get('max_price'), prop.get('price_range'),
                prop.get('bedrooms_min'), prop.get('bedrooms_max'),
                prop.get('bathrooms_min'), prop.get('bathrooms_max'),
                prop.get('square_feet_min'), prop.get('square_feet_max'),
                json.dumps(prop.get('amenities', [])),
                json.dumps(prop.get('features', {})),
                json.dumps(prop.get('pet_policy', {})),
                json.dumps(prop.get('parking', {})),
                json.dumps(prop.get('utilities', {})),
                json.dumps(prop.get('images', [])),
                prop.get('virtual_tour_url'),
                prop.get('description'),
                prop.get('property_type'),
                prop.get('year_built'),
                prop.get('units_count'),
                prop.get('phone'),
                prop.get('email'),
                prop.get('website'),
                prop.get('management_company'),
                prop.get('ai_description'),
                json.dumps(prop.get('ai_tags', [])),
                prop.get('sentiment_score'),
                prop['listing_url'],
                prop.get('last_seen'),
                prop.get('first_scraped'),
                prop.get('last_updated'),
                prop.get('is_active', True)
            )
            
            # Insert to MongoDB (cache layer for fast searches)
            await mongo_db.properties.replace_one(
                {'_id': prop['id']},
                {
                    '_id': prop['id'],
                    **prop,
                    'migrated_at': datetime.utcnow()
                },
                upsert=True
            )
            
            print(f"  ✅ [{i}/{len(properties)}] {prop['name'][:50]}")
                
        except Exception as e:
            print(f"  ❌ [{i}/{len(properties)}] Failed: {prop.get('name', 'Unknown')} - {e}")
    
    # Migrate price_history if exists
    print("\n📊 Migrating price history...")
    try:
        price_response = supabase.table('price_history').select('*').execute()
        price_history = price_response.data
        
        for record in price_history:
            await pg_conn.execute('''
                INSERT INTO price_history (
                    id, property_id, min_price, max_price,
                    price_change, price_change_percentage, recorded_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (id) DO NOTHING
            ''',
                record['id'], record['property_id'],
                record.get('min_price'), record.get('max_price'),
                record.get('price_change'), record.get('price_change_percentage'),
                record.get('recorded_at')
            )
        
        print(f"  ✅ Migrated {len(price_history)} price history records")
    except Exception as e:
        print(f"  ⚠️  No price history found or error: {e}")
    
    print("\n" + "=" * 60)
    print("✅ Migration complete!")
    print(f"  📦 Properties: {len(properties)}")
    print(f"  🗄️  Postgres: ✅")
    print(f"  🍃 MongoDB: ✅")
    
    # Close connections
    await pg_conn.close()
    mongo_client.close()

if __name__ == "__main__":
    asyncio.run(migrate())
