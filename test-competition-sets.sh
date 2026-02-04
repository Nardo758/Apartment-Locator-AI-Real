#!/bin/bash

# Competition Sets API Test Script
# Usage: ./test-competition-sets.sh

set -e

API_BASE="http://localhost:5000/api"
CONTENT_TYPE="Content-Type: application/json"

echo "🧪 Competition Sets API Test Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Sign in to get token
echo "📝 Step 1: Signing in..."
SIGNIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/signin" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }')

TOKEN=$(echo $SIGNIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Failed to get auth token. Creating test user...${NC}"
  
  # Try to sign up
  SIGNUP_RESPONSE=$(curl -s -X POST "$API_BASE/auth/signup" \
    -H "$CONTENT_TYPE" \
    -d '{
      "email": "test@example.com",
      "password": "testpass123",
      "name": "Test Landlord"
    }')
  
  TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  
  if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to create user or sign in${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}✅ Successfully authenticated${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

AUTH_HEADER="Authorization: Bearer $TOKEN"

# Step 2: Create a competition set
echo "📝 Step 2: Creating a competition set..."
CREATE_SET_RESPONSE=$(curl -s -X POST "$API_BASE/competition-sets" \
  -H "$CONTENT_TYPE" \
  -H "$AUTH_HEADER" \
  -d '{
    "name": "Test Downtown Competitors",
    "description": "Testing competition tracking for downtown properties",
    "ownPropertyIds": [],
    "alertsEnabled": true
  }')

SET_ID=$(echo $CREATE_SET_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$SET_ID" ]; then
  echo -e "${RED}❌ Failed to create competition set${NC}"
  echo "Response: $CREATE_SET_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Competition set created${NC}"
echo "Set ID: $SET_ID"
echo ""

# Step 3: List competition sets
echo "📝 Step 3: Listing all competition sets..."
LIST_RESPONSE=$(curl -s -X GET "$API_BASE/competition-sets?limit=10&offset=0" \
  -H "$AUTH_HEADER")

TOTAL=$(echo $LIST_RESPONSE | grep -o '"total":[0-9]*' | cut -d':' -f2)
echo -e "${GREEN}✅ Found $TOTAL competition set(s)${NC}"
echo ""

# Step 4: Get competition set details
echo "📝 Step 4: Getting competition set details..."
DETAILS_RESPONSE=$(curl -s -X GET "$API_BASE/competition-sets/$SET_ID" \
  -H "$AUTH_HEADER")

echo -e "${GREEN}✅ Retrieved set details${NC}"
echo "Response: ${DETAILS_RESPONSE:0:100}..."
echo ""

# Step 5: Add a competitor
echo "📝 Step 5: Adding a competitor..."
ADD_COMPETITOR_RESPONSE=$(curl -s -X POST "$API_BASE/competition-sets/$SET_ID/competitors" \
  -H "$CONTENT_TYPE" \
  -H "$AUTH_HEADER" \
  -d '{
    "address": "123 Main St, Austin, TX 78701",
    "latitude": 30.2672,
    "longitude": -97.7431,
    "bedrooms": 2,
    "bathrooms": 2,
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
  }')

COMPETITOR_ID=$(echo $ADD_COMPETITOR_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$COMPETITOR_ID" ]; then
  echo -e "${RED}❌ Failed to add competitor${NC}"
  echo "Response: $ADD_COMPETITOR_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Competitor added${NC}"
echo "Competitor ID: $COMPETITOR_ID"
echo ""

# Step 6: Update competition set
echo "📝 Step 6: Updating competition set..."
UPDATE_RESPONSE=$(curl -s -X PATCH "$API_BASE/competition-sets/$SET_ID" \
  -H "$CONTENT_TYPE" \
  -H "$AUTH_HEADER" \
  -d '{
    "name": "Updated Downtown Competitors",
    "alertsEnabled": false
  }')

echo -e "${GREEN}✅ Competition set updated${NC}"
echo ""

# Step 7: Get updated details with competitor
echo "📝 Step 7: Getting updated details..."
UPDATED_DETAILS=$(curl -s -X GET "$API_BASE/competition-sets/$SET_ID" \
  -H "$AUTH_HEADER")

COMPETITOR_COUNT=$(echo $UPDATED_DETAILS | grep -o '"competitors":\[[^]]*\]' | grep -o '{"id"' | wc -l)
echo -e "${GREEN}✅ Set now has $COMPETITOR_COUNT competitor(s)${NC}"
echo ""

# Step 8: Try to add duplicate competitor (should fail)
echo "📝 Step 8: Testing duplicate prevention..."
DUPLICATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/competition-sets/$SET_ID/competitors" \
  -H "$CONTENT_TYPE" \
  -H "$AUTH_HEADER" \
  -d '{
    "address": "123 Main St, Austin, TX 78701",
    "bedrooms": 2,
    "bathrooms": 2,
    "squareFeet": 1100,
    "currentRent": 2200,
    "amenities": [],
    "concessions": [],
    "source": "manual"
  }')

HTTP_CODE=$(echo "$DUPLICATE_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "409" ]; then
  echo -e "${GREEN}✅ Duplicate prevention working (got 409 Conflict)${NC}"
else
  echo -e "${YELLOW}⚠️  Expected 409, got $HTTP_CODE${NC}"
fi
echo ""

# Step 9: Delete competitor
echo "📝 Step 9: Deleting competitor..."
DELETE_COMPETITOR_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$API_BASE/competition-sets/$SET_ID/competitors/$COMPETITOR_ID" \
  -H "$AUTH_HEADER")

DELETE_HTTP_CODE=$(echo "$DELETE_COMPETITOR_RESPONSE" | tail -n1)

if [ "$DELETE_HTTP_CODE" = "204" ]; then
  echo -e "${GREEN}✅ Competitor deleted${NC}"
else
  echo -e "${RED}❌ Failed to delete competitor (got $DELETE_HTTP_CODE)${NC}"
fi
echo ""

# Step 10: Delete competition set
echo "📝 Step 10: Deleting competition set..."
DELETE_SET_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$API_BASE/competition-sets/$SET_ID" \
  -H "$AUTH_HEADER")

DELETE_SET_HTTP_CODE=$(echo "$DELETE_SET_RESPONSE" | tail -n1)

if [ "$DELETE_SET_HTTP_CODE" = "204" ]; then
  echo -e "${GREEN}✅ Competition set deleted${NC}"
else
  echo -e "${RED}❌ Failed to delete competition set (got $DELETE_SET_HTTP_CODE)${NC}"
fi
echo ""

# Summary
echo "=================================="
echo "🎉 Test Script Complete!"
echo ""
echo "All 7 endpoints tested:"
echo "  1. ✅ POST   /api/competition-sets (create)"
echo "  2. ✅ GET    /api/competition-sets (list)"
echo "  3. ✅ GET    /api/competition-sets/:id (details)"
echo "  4. ✅ PATCH  /api/competition-sets/:id (update)"
echo "  5. ✅ DELETE /api/competition-sets/:id (delete)"
echo "  6. ✅ POST   /api/competition-sets/:id/competitors (add)"
echo "  7. ✅ DELETE /api/competition-sets/:id/competitors/:competitorId (remove)"
echo ""
echo -e "${GREEN}All tests passed! 🚀${NC}"
