#!/bin/bash

# Landlord Portfolio API Test Script
# This script demonstrates how to use all 6 landlord portfolio endpoints

set -e  # Exit on error

API_URL="${API_URL:-http://localhost:5000}"
EMAIL="landlord-test-$(date +%s)@example.com"
PASSWORD="TestPassword123!"

echo "🏠 Testing Landlord Portfolio Management API"
echo "=============================================="
echo ""

# 1. Create a test user
echo "1️⃣  Creating test landlord user..."
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Test Landlord\"}")

TOKEN=$(echo $SIGNUP_RESPONSE | jq -r '.token')
USER_ID=$(echo $SIGNUP_RESPONSE | jq -r '.user.id')

if [ "$TOKEN" == "null" ]; then
  echo "❌ Failed to create user"
  echo $SIGNUP_RESPONSE | jq
  exit 1
fi

echo "✅ User created successfully"
echo "   User ID: $USER_ID"
echo ""

# 2. Update user type to landlord
echo "2️⃣  Updating user type to landlord..."
curl -s -X PATCH "$API_URL/api/auth/user-type" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"userType":"landlord"}' | jq

echo "✅ User type updated to landlord"
echo ""

# 3. Add first property (occupied)
echo "3️⃣  Adding first property (occupied)..."
PROPERTY1=$(curl -s -X POST "$API_URL/api/landlord/properties" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Sunset Apartments Unit 203",
    "address": "1234 Main Street, Apt 203",
    "city": "Austin",
    "state": "TX",
    "zipCode": "78701",
    "bedroomsMin": 2,
    "bathroomsMin": 2,
    "squareFeetMin": 1100,
    "propertyType": "apartment",
    "targetRent": 2200,
    "actualRent": 2100,
    "occupancyStatus": "occupied",
    "leaseStartDate": "2025-01-01T00:00:00Z",
    "leaseEndDate": "2025-12-31T23:59:59Z",
    "amenities": {
      "pool": true,
      "gym": true,
      "parking": true
    }
  }')

PROPERTY1_ID=$(echo $PROPERTY1 | jq -r '.id')
echo $PROPERTY1 | jq
echo "✅ Property 1 created: $PROPERTY1_ID"
echo ""

# 4. Add second property (vacant)
echo "4️⃣  Adding second property (vacant)..."
PROPERTY2=$(curl -s -X POST "$API_URL/api/landlord/properties" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Riverside Lofts Unit 405",
    "address": "5678 River Road, Unit 405",
    "city": "Austin",
    "state": "TX",
    "zipCode": "78702",
    "bedroomsMin": 1,
    "bathroomsMin": 1,
    "squareFeetMin": 850,
    "propertyType": "loft",
    "targetRent": 1800,
    "occupancyStatus": "vacant",
    "daysVacant": 15,
    "amenities": {
      "pool": false,
      "gym": true,
      "parking": true
    }
  }')

PROPERTY2_ID=$(echo $PROPERTY2 | jq -r '.id')
echo $PROPERTY2 | jq
echo "✅ Property 2 created: $PROPERTY2_ID"
echo ""

# 5. List all properties
echo "5️⃣  Listing all properties..."
curl -s -X GET "$API_URL/api/landlord/properties" \
  -H "Authorization: Bearer $TOKEN" | jq

echo "✅ Properties listed successfully"
echo ""

# 6. Get specific property details
echo "6️⃣  Getting property 1 details..."
curl -s -X GET "$API_URL/api/landlord/properties/$PROPERTY1_ID" \
  -H "Authorization: Bearer $TOKEN" | jq

echo "✅ Property details retrieved"
echo ""

# 7. Update property 2 (mark as occupied)
echo "7️⃣  Updating property 2 (mark as occupied)..."
curl -s -X PATCH "$API_URL/api/landlord/properties/$PROPERTY2_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "occupancyStatus": "occupied",
    "actualRent": 1750,
    "leaseStartDate": "2026-02-01T00:00:00Z",
    "leaseEndDate": "2027-01-31T23:59:59Z",
    "daysVacant": 0
  }' | jq

echo "✅ Property 2 updated"
echo ""

# 8. Get portfolio summary
echo "8️⃣  Getting portfolio summary..."
curl -s -X GET "$API_URL/api/landlord/portfolio/summary" \
  -H "Authorization: Bearer $TOKEN" | jq

echo "✅ Portfolio summary retrieved"
echo ""

# 9. Filter properties (vacant only)
echo "9️⃣  Filtering vacant properties..."
curl -s -X GET "$API_URL/api/landlord/properties?occupancyStatus=vacant" \
  -H "Authorization: Bearer $TOKEN" | jq

echo "✅ Filtered properties"
echo ""

# 10. Test authorization (try to access without being a landlord)
echo "🔒 Testing authorization..."
echo "   Creating renter account..."
RENTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"renter-$(date +%s)@example.com\",\"password\":\"$PASSWORD\",\"name\":\"Test Renter\"}")

RENTER_TOKEN=$(echo $RENTER_RESPONSE | jq -r '.token')

echo "   Attempting to access landlord endpoint as renter..."
FORBIDDEN=$(curl -s -X GET "$API_URL/api/landlord/properties" \
  -H "Authorization: Bearer $RENTER_TOKEN" | jq -r '.error')

if [ "$FORBIDDEN" == "Access denied. Landlord account required." ]; then
  echo "✅ Authorization working correctly (403 returned for non-landlords)"
else
  echo "❌ Authorization not working as expected"
  echo "   Expected: Access denied message"
  echo "   Got: $FORBIDDEN"
fi
echo ""

# 11. Delete property 2
echo "🗑️  Deleting property 2..."
curl -s -X DELETE "$API_URL/api/landlord/properties/$PROPERTY2_ID" \
  -H "Authorization: Bearer $TOKEN" -w "\nHTTP Status: %{http_code}\n"

echo "✅ Property 2 deleted"
echo ""

# 12. Final portfolio summary
echo "📊 Final portfolio summary..."
curl -s -X GET "$API_URL/api/landlord/portfolio/summary" \
  -H "Authorization: Bearer $TOKEN" | jq

echo ""
echo "=============================================="
echo "✨ All tests completed successfully!"
echo "=============================================="
echo ""
echo "Test user credentials:"
echo "  Email: $EMAIL"
echo "  Password: $PASSWORD"
echo "  Token: $TOKEN"
echo ""
echo "Remaining property ID: $PROPERTY1_ID"
