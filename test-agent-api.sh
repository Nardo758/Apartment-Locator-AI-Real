#!/bin/bash

# Agent Commission Calculator & Analytics API Test Script
# Usage: ./test-agent-api.sh [BASE_URL] [TOKEN]
# Example: ./test-agent-api.sh http://localhost:5000 your_token_here

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${1:-http://localhost:5000}"
TOKEN="${2:-}"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Agent Commission & Analytics API Tests${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "Base URL: ${BASE_URL}"
echo ""

# Function to print test results
print_result() {
  local test_name=$1
  local status=$2
  local message=$3
  
  if [ "$status" = "pass" ]; then
    echo -e "${GREEN}✓ PASS${NC}: $test_name"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC}: $test_name"
    echo -e "${RED}  Error: $message${NC}"
    ((TESTS_FAILED++))
  fi
}

# Function to check if token is set
check_token() {
  if [ -z "$TOKEN" ]; then
    echo -e "${YELLOW}Warning: No token provided${NC}"
    echo -e "${YELLOW}Please provide a token as second argument or set AGENT_TOKEN environment variable${NC}"
    echo ""
    echo "To get a token:"
    echo "1. Sign up: curl -X POST $BASE_URL/api/auth/signup -H 'Content-Type: application/json' -d '{\"email\":\"agent@test.com\",\"password\":\"password123\",\"name\":\"Test Agent\"}'"
    echo "2. Update to agent: curl -X PATCH $BASE_URL/api/auth/user-type -H 'Authorization: Bearer TOKEN' -H 'Content-Type: application/json' -d '{\"userType\":\"agent\"}'"
    echo ""
    exit 1
  fi
}

# Check token
check_token

echo -e "${YELLOW}Running tests...${NC}"
echo ""

# Test 1: Simple Sale Commission
echo -e "${BLUE}Test 1: Calculate simple sale commission${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/agent/commission/calculate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "sale",
    "propertyValue": 500000,
    "commissionRate": 6.0,
    "commissionType": "percentage",
    "splits": [
      {
        "agentName": "Test Agent",
        "percentage": 100,
        "role": "listing_agent"
      }
    ]
  }')

if echo "$RESPONSE" | grep -q '"baseCommission":30000'; then
  print_result "Simple sale commission (6% of $500k = $30k)" "pass"
else
  print_result "Simple sale commission" "fail" "Expected baseCommission: 30000"
  echo "Response: $RESPONSE"
fi
echo ""

# Test 2: Commission with Splits
echo -e "${BLUE}Test 2: Calculate commission with 50/50 split${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/agent/commission/calculate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "sale",
    "propertyValue": 400000,
    "commissionRate": 6.0,
    "commissionType": "percentage",
    "splits": [
      {
        "agentName": "Listing Agent",
        "percentage": 50,
        "role": "listing_agent"
      },
      {
        "agentName": "Buyer Agent",
        "percentage": 50,
        "role": "buyer_agent"
      }
    ]
  }')

if echo "$RESPONSE" | grep -q '"baseCommission":24000'; then
  print_result "50/50 split commission (6% of $400k = $24k)" "pass"
else
  print_result "50/50 split commission" "fail" "Expected baseCommission: 24000"
fi
echo ""

# Test 3: Commission with Expenses and Bonuses
echo -e "${BLUE}Test 3: Calculate commission with expenses and bonuses${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/agent/commission/calculate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "sale",
    "propertyValue": 300000,
    "commissionRate": 5.0,
    "commissionType": "percentage",
    "splits": [
      {
        "agentName": "Agent",
        "percentage": 100,
        "role": "listing_agent"
      }
    ],
    "expenses": [
      {
        "description": "Marketing",
        "amount": 1000
      }
    ],
    "bonuses": [
      {
        "description": "Performance bonus",
        "amount": 500
      }
    ]
  }')

if echo "$RESPONSE" | grep -q '"netCommission":14500'; then
  print_result "Commission with expenses/bonuses ($15k - $1k + $500 = $14.5k)" "pass"
else
  print_result "Commission with expenses/bonuses" "fail" "Expected netCommission: 14500"
fi
echo ""

# Test 4: Rental Commission
echo -e "${BLUE}Test 4: Calculate rental commission${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/agent/commission/calculate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "rental",
    "propertyValue": 3000,
    "rentalMonths": 1,
    "commissionRate": 100,
    "commissionType": "percentage",
    "splits": [
      {
        "agentName": "Agent",
        "percentage": 80,
        "role": "listing_agent"
      },
      {
        "agentName": "Brokerage",
        "percentage": 20,
        "role": "brokerage"
      }
    ]
  }')

if echo "$RESPONSE" | grep -q '"baseCommission":3000'; then
  print_result "Rental commission (1 month rent = $3k)" "pass"
else
  print_result "Rental commission" "fail" "Expected baseCommission: 3000"
fi
echo ""

# Test 5: Flat Fee Commission
echo -e "${BLUE}Test 5: Calculate flat fee commission${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/agent/commission/calculate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "sale",
    "propertyValue": 250000,
    "commissionType": "flat_fee",
    "flatFeeAmount": 7500,
    "splits": [
      {
        "agentName": "Agent",
        "percentage": 100,
        "role": "listing_agent"
      }
    ]
  }')

if echo "$RESPONSE" | grep -q '"baseCommission":7500'; then
  print_result "Flat fee commission ($7,500)" "pass"
else
  print_result "Flat fee commission" "fail" "Expected baseCommission: 7500"
fi
echo ""

# Test 6: Invalid Split Percentages (Should Fail)
echo -e "${BLUE}Test 6: Invalid split percentages (should fail)${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/agent/commission/calculate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "sale",
    "propertyValue": 500000,
    "commissionRate": 6.0,
    "commissionType": "percentage",
    "splits": [
      {
        "agentName": "Agent 1",
        "percentage": 50,
        "role": "listing_agent"
      },
      {
        "agentName": "Agent 2",
        "percentage": 30,
        "role": "buyer_agent"
      }
    ]
  }')

if echo "$RESPONSE" | grep -q "Split percentages must total 100%"; then
  print_result "Invalid split validation (80% total should error)" "pass"
else
  print_result "Invalid split validation" "fail" "Expected error about split percentages"
fi
echo ""

# Test 7: Get Commission Templates
echo -e "${BLUE}Test 7: Get commission templates${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/agent/commission/templates" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q '"templates"'; then
  print_result "Get commission templates" "pass"
else
  print_result "Get commission templates" "fail" "Expected templates array"
fi
echo ""

# Test 8: Save Commission Template
echo -e "${BLUE}Test 8: Save commission template${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/agent/commission/templates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Template",
    "description": "Test template for automation",
    "transactionType": "sale",
    "commissionRate": 5.5,
    "commissionType": "percentage",
    "splits": [
      {
        "agentName": "Agent",
        "percentage": 100,
        "role": "listing_agent"
      }
    ]
  }')

if echo "$RESPONSE" | grep -q '"name":"Test Template"'; then
  print_result "Save commission template" "pass"
else
  print_result "Save commission template" "fail" "Expected template with name 'Test Template'"
fi
echo ""

# Test 9: Get Revenue Analytics
echo -e "${BLUE}Test 9: Get revenue analytics${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/agent/analytics/revenue" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q '"summary"' && echo "$RESPONSE" | grep -q '"timeline"'; then
  print_result "Get revenue analytics" "pass"
else
  print_result "Get revenue analytics" "fail" "Expected summary and timeline"
fi
echo ""

# Test 10: Get Revenue Analytics with Date Range
echo -e "${BLUE}Test 10: Get revenue analytics with custom date range${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/agent/analytics/revenue?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q '"startDate":"2024-01-01'; then
  print_result "Revenue analytics with date range" "pass"
else
  print_result "Revenue analytics with date range" "fail" "Expected custom date range"
fi
echo ""

# Test 11: Get Pipeline Metrics
echo -e "${BLUE}Test 11: Get pipeline metrics${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/agent/analytics/pipeline" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q '"stages"' && echo "$RESPONSE" | grep -q '"conversions"'; then
  print_result "Get pipeline metrics" "pass"
else
  print_result "Get pipeline metrics" "fail" "Expected stages and conversions"
fi
echo ""

# Test 12: Get Monthly Report (Current Month)
echo -e "${BLUE}Test 12: Get monthly report (current month)${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/agent/reports/monthly" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q '"report"' && echo "$RESPONSE" | grep -q '"summary"'; then
  print_result "Get monthly report" "pass"
else
  print_result "Get monthly report" "fail" "Expected report with summary"
fi
echo ""

# Test 13: Get Monthly Report (Specific Month)
echo -e "${BLUE}Test 13: Get monthly report for January 2024${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/agent/reports/monthly?year=2024&month=1" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q '"year":2024' && echo "$RESPONSE" | grep -q '"month":1'; then
  print_result "Get specific monthly report" "pass"
else
  print_result "Get specific monthly report" "fail" "Expected January 2024 report"
fi
echo ""

# Test 14: Complex Multi-Agent Split
echo -e "${BLUE}Test 14: Complex 4-way split${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/agent/commission/calculate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "sale",
    "propertyValue": 800000,
    "commissionRate": 5.0,
    "commissionType": "percentage",
    "splits": [
      {
        "agentName": "Primary Agent",
        "percentage": 45,
        "role": "listing_agent"
      },
      {
        "agentName": "Co-Agent",
        "percentage": 20,
        "role": "buyer_agent"
      },
      {
        "agentName": "Team Lead",
        "percentage": 20,
        "role": "team_lead"
      },
      {
        "agentName": "Brokerage",
        "percentage": 15,
        "role": "brokerage"
      }
    ]
  }')

if echo "$RESPONSE" | grep -q '"baseCommission":40000'; then
  print_result "Complex 4-way split ($40k base)" "pass"
else
  print_result "Complex 4-way split" "fail" "Expected baseCommission: 40000"
fi
echo ""

# Test 15: Access Control - Non-Agent User (if applicable)
# This test would require a non-agent token to properly test
# Skipping for now as it requires additional setup

# Summary
echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed! ✓${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed. Please review the errors above.${NC}"
  exit 1
fi
