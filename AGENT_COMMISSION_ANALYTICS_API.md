# Agent Commission Calculator & Analytics API

Complete API documentation for the Agent Dashboard commission calculator and analytics endpoints.

## Overview

These endpoints provide comprehensive commission calculation, template management, revenue tracking, pipeline metrics, and performance reporting for real estate agents.

## Authentication

All endpoints require:
- Bearer token authentication
- User type: `agent` or `admin`
- Header: `Authorization: Bearer <token>`

## Endpoints

### 1. POST /api/agent/commission/calculate

Calculate commission with splits, expenses, and bonuses.

**Request Body:**
```json
{
  "transactionType": "sale",
  "propertyValue": 450000,
  "commissionRate": 6.0,
  "commissionType": "percentage",
  "rentalMonths": null,
  "flatFeeAmount": null,
  "splits": [
    {
      "agentName": "John Doe",
      "percentage": 50,
      "role": "listing_agent"
    },
    {
      "agentName": "Jane Smith",
      "percentage": 50,
      "role": "buyer_agent"
    }
  ],
  "expenses": [
    {
      "description": "Marketing materials",
      "amount": 500,
      "category": "marketing"
    }
  ],
  "bonuses": [
    {
      "description": "Performance bonus",
      "amount": 1000
    }
  ]
}
```

**Field Descriptions:**
- `transactionType`: "sale", "rental", or "lease"
- `propertyValue`: Property sale price or monthly rent amount
- `rentalMonths`: Number of months for rental commission (optional)
- `commissionRate`: Percentage (0-100)
- `commissionType`: "percentage" or "flat_fee"
- `flatFeeAmount`: Fixed commission amount (required if commissionType is "flat_fee")
- `splits`: Array of commission splits (must total 100%)
  - `role`: "listing_agent", "buyer_agent", "referral", "team_lead", or "brokerage"
- `expenses`: Array of transaction expenses
- `bonuses`: Array of additional bonuses

**Response:**
```json
{
  "calculation": {
    "transactionType": "sale",
    "propertyValue": 450000,
    "commissionRate": 6.0,
    "commissionType": "percentage",
    "baseCommission": 27000.00,
    "totalExpenses": 500.00,
    "totalBonuses": 1000.00,
    "netCommission": 27500.00,
    "effectiveRate": 6.0
  },
  "splits": [
    {
      "agentName": "John Doe",
      "percentage": 50,
      "role": "listing_agent",
      "amount": 13500.00
    },
    {
      "agentName": "Jane Smith",
      "percentage": 50,
      "role": "buyer_agent",
      "amount": 13500.00
    }
  ],
  "breakdownByRole": {
    "listing_agent": {
      "totalAmount": 13500.00,
      "agents": [
        {
          "name": "John Doe",
          "percentage": 50,
          "amount": 13500.00
        }
      ]
    },
    "buyer_agent": {
      "totalAmount": 13500.00,
      "agents": [
        {
          "name": "Jane Smith",
          "percentage": 50,
          "amount": 13500.00
        }
      ]
    }
  },
  "expenses": [...],
  "bonuses": [...],
  "summary": {
    "grossCommission": 27000.00,
    "netToAgent": 27500.00,
    "totalDeductions": 500.00,
    "totalAdditions": 1000.00,
    "numberOfSplits": 2
  },
  "calculatedAt": "2024-02-04T20:00:00.000Z"
}
```

**Business Logic:**
1. **Base Commission Calculation:**
   - Percentage: `propertyValue * (commissionRate / 100)`
   - Flat Fee: `flatFeeAmount`
   - Rental: `monthlyRent * rentalMonths * (commissionRate / 100)`

2. **Split Validation:**
   - Total split percentages must equal 100%
   - Each split receives: `baseCommission * (percentage / 100)`

3. **Net Commission:**
   - `netCommission = baseCommission + totalBonuses - totalExpenses`

4. **Effective Rate:**
   - Sale: `(baseCommission / propertyValue) * 100`
   - Rental: `(baseCommission / (monthlyRent * rentalMonths)) * 100`

**Error Responses:**
- `400`: Invalid data or split percentages don't total 100%
- `403`: Access denied (not an agent)

---

### 2. GET /api/agent/commission/templates

List saved commission templates.

**Query Parameters:**
- None (all templates for authenticated user returned)

**Response:**
```json
{
  "templates": [
    {
      "id": "template-1",
      "userId": "user-uuid",
      "name": "Standard Sale - 50/50 Split",
      "description": "Standard sale commission with 50/50 buyer/seller split",
      "transactionType": "sale",
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
      ],
      "isDefault": true,
      "usageCount": 42,
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "total": 3
}
```

**Use Cases:**
- Quick access to frequently used commission structures
- Standardize calculations across team
- Track template usage for optimization

---

### 3. POST /api/agent/commission/templates

Save a new commission template.

**Request Body:**
```json
{
  "name": "Luxury Sale - Team Lead",
  "description": "High-value sale with team lead commission",
  "transactionType": "sale",
  "commissionRate": 5.0,
  "commissionType": "percentage",
  "splits": [
    {
      "agentName": "Primary Agent",
      "percentage": 60,
      "role": "listing_agent"
    },
    {
      "agentName": "Team Lead",
      "percentage": 25,
      "role": "team_lead"
    },
    {
      "agentName": "Brokerage",
      "percentage": 15,
      "role": "brokerage"
    }
  ],
  "isDefault": false
}
```

**Response:**
```json
{
  "id": "template-1234567890",
  "userId": "user-uuid",
  "name": "Luxury Sale - Team Lead",
  "description": "High-value sale with team lead commission",
  "transactionType": "sale",
  "commissionRate": 5.0,
  "commissionType": "percentage",
  "splits": [...],
  "isDefault": false,
  "usageCount": 0,
  "createdAt": "2024-02-04T20:00:00.000Z",
  "updatedAt": "2024-02-04T20:00:00.000Z"
}
```

**Validation Rules:**
- `name`: 1-255 characters, required
- `description`: Max 1000 characters, optional
- `splits`: Must total 100%
- Duplicate names allowed (different users)

---

### 4. GET /api/agent/analytics/revenue

Revenue tracking and analytics.

**Query Parameters:**
- `startDate` (optional): ISO 8601 date (default: Jan 1 of current year)
- `endDate` (optional): ISO 8601 date (default: today)
- `groupBy` (optional): "month" | "quarter" | "year" (default: "month")

**Example Request:**
```
GET /api/agent/analytics/revenue?startDate=2024-01-01&endDate=2024-12-31&groupBy=month
```

**Response:**
```json
{
  "period": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z",
    "groupBy": "month"
  },
  "summary": {
    "totalRevenue": 125450.00,
    "totalTransactions": 42,
    "avgMonthlyRevenue": 10454.17,
    "avgTransactionValue": 2987.38,
    "yoyGrowth": 15.3
  },
  "composition": {
    "sales": {
      "count": 15,
      "revenue": 89250.00,
      "percentage": 71.14
    },
    "rentals": {
      "count": 27,
      "revenue": 36200.00,
      "percentage": 28.86
    }
  },
  "timeline": [
    {
      "period": "2024-01",
      "sales": {
        "count": 2,
        "totalCommission": 18500.00,
        "avgCommission": 9250.00
      },
      "rentals": {
        "count": 4,
        "totalCommission": 6800.00,
        "avgCommission": 1700.00
      },
      "total": {
        "transactions": 6,
        "revenue": 25300.00
      }
    }
  ],
  "generatedAt": "2024-02-04T20:00:00.000Z"
}
```

**Key Metrics:**
- **Total Revenue**: Sum of all commissions
- **YoY Growth**: Year-over-year growth percentage
- **Composition**: Breakdown by transaction type
- **Timeline**: Period-by-period revenue data

**Use Cases:**
- Track income over time
- Identify seasonal trends
- Compare sales vs rental performance
- Calculate tax estimates

---

### 5. GET /api/agent/analytics/pipeline

Pipeline metrics and deal flow analysis.

**Query Parameters:**
- None

**Response:**
```json
{
  "summary": {
    "totalDeals": 67,
    "totalValue": 23500000.00,
    "avgDealValue": 350746.27,
    "overallConversionRate": 15.19,
    "avgDaysToClose": 63
  },
  "stages": [
    {
      "stage": "lead",
      "name": "New Leads",
      "count": 24,
      "totalValue": 8750000,
      "avgValue": 364583,
      "avgDaysInStage": 3
    },
    {
      "stage": "qualified",
      "name": "Qualified",
      "count": 18,
      "totalValue": 6200000,
      "avgValue": 344444,
      "avgDaysInStage": 7
    },
    {
      "stage": "showing",
      "name": "Showing Scheduled",
      "count": 12,
      "totalValue": 4100000,
      "avgValue": 341667,
      "avgDaysInStage": 5
    },
    {
      "stage": "offer",
      "name": "Offer Submitted",
      "count": 6,
      "totalValue": 2050000,
      "avgValue": 341667,
      "avgDaysInStage": 10
    },
    {
      "stage": "negotiation",
      "name": "Under Negotiation",
      "count": 4,
      "totalValue": 1400000,
      "avgValue": 350000,
      "avgDaysInStage": 8
    },
    {
      "stage": "contract",
      "name": "Under Contract",
      "count": 3,
      "totalValue": 1050000,
      "avgValue": 350000,
      "avgDaysInStage": 15
    }
  ],
  "conversions": [
    {
      "from": "lead",
      "to": "qualified",
      "rate": 75,
      "avgDays": 3
    },
    {
      "from": "qualified",
      "to": "showing",
      "rate": 67,
      "avgDays": 7
    },
    {
      "from": "showing",
      "to": "offer",
      "rate": 50,
      "avgDays": 5
    },
    {
      "from": "offer",
      "to": "contract",
      "rate": 50,
      "avgDays": 18
    },
    {
      "from": "contract",
      "to": "closed",
      "rate": 90,
      "avgDays": 30
    }
  ],
  "forecast": {
    "expectedClosedDeals": 10,
    "expectedRevenue": 3570000.00,
    "confidence": 75
  },
  "velocity": {
    "avgDaysToClose": 63,
    "ageDistribution": {
      "fresh": 26,
      "active": 23,
      "aging": 10,
      "stale": 6
    }
  },
  "topDeals": [
    {
      "id": "prop-1",
      "address": "123 Main St, Boston, MA",
      "stage": "contract",
      "value": 450000,
      "daysInPipeline": 42,
      "probability": 90
    }
  ],
  "insights": {
    "bottleneck": "showing",
    "recommendation": "Focus on improving showing-to-offer conversion rate (currently 50%)",
    "dealHealthScore": 78
  },
  "generatedAt": "2024-02-04T20:00:00.000Z"
}
```

**Key Metrics:**
- **Pipeline Value**: Total value of all deals in pipeline
- **Conversion Rates**: Stage-to-stage conversion percentages
- **Velocity**: Time metrics for deal progression
- **Forecast**: Predicted closed deals and revenue
- **Deal Health**: Age distribution and bottleneck identification

**Use Cases:**
- Identify conversion bottlenecks
- Forecast future revenue
- Prioritize deals by value and probability
- Optimize sales process
- Track deal velocity

---

### 6. GET /api/agent/reports/monthly

Comprehensive monthly performance report.

**Query Parameters:**
- `year` (optional): Year (default: current year)
- `month` (optional): Month 1-12 (default: current month)

**Example Request:**
```
GET /api/agent/reports/monthly?year=2024&month=1
```

**Response:**
```json
{
  "report": {
    "period": {
      "year": 2024,
      "month": 1,
      "monthName": "January 2024"
    },
    "summary": {
      "totalRevenue": 46200.00,
      "totalDeals": 10,
      "netIncome": 42600.00,
      "profitMargin": 92.21
    },
    "closedDeals": {
      "sales": {
        "count": 3,
        "totalVolume": 1050000,
        "avgPrice": 350000,
        "totalCommission": 31500.00,
        "avgCommission": 10500.00
      },
      "rentals": {
        "count": 7,
        "totalVolume": 21000,
        "avgRent": 3000,
        "totalCommission": 14700.00,
        "avgCommission": 2100.00
      },
      "total": {
        "deals": 10,
        "volume": 1071000,
        "commission": 46200.00
      }
    },
    "activities": {
      "newLeads": 28,
      "showingsScheduled": 42,
      "showingsCompleted": 38,
      "offersSubmitted": 8,
      "offersAccepted": 5,
      "contractsSigned": 10,
      "dealsLost": 3,
      "lossReasons": [
        {
          "reason": "Price too high",
          "count": 1
        }
      ]
    },
    "performance": {
      "conversionRate": {
        "leadToShowing": 150.00,
        "showingToOffer": 21.05,
        "offerToContract": 125.00,
        "overallLeadToClose": 35.71
      },
      "avgDaysToClose": {
        "sales": 42,
        "rentals": 18,
        "overall": 32
      },
      "clientSatisfaction": {
        "avgRating": 4.7,
        "reviewsReceived": 8,
        "nps": 85
      }
    },
    "goals": {
      "revenue": {
        "goal": 50000,
        "achieved": 46200.00,
        "progress": 92.40,
        "remaining": 3800.00
      },
      "deals": {
        "goal": 12,
        "achieved": 10,
        "progress": 83.33,
        "remaining": 2
      }
    },
    "marketInsights": {
      "avgDaysOnMarket": 28,
      "medianSalePrice": 365000,
      "medianRent": 2800,
      "inventoryLevel": "low",
      "competitionLevel": "high",
      "marketTrend": "seller's market"
    },
    "topListings": [
      {
        "id": "listing-1",
        "address": "123 Main St, Boston, MA",
        "type": "sale",
        "listPrice": 450000,
        "soldPrice": 465000,
        "daysOnMarket": 12,
        "commission": 13950,
        "status": "sold_above_asking"
      }
    ],
    "expenses": {
      "breakdown": {
        "marketing": 2500,
        "transportation": 400,
        "professional": 350,
        "software": 200,
        "other": 150,
        "total": 3600
      },
      "totalExpenses": 3600.00
    },
    "comparison": {
      "monthOverMonth": {
        "commissionChange": 7700.00,
        "commissionChangePercent": 20.00,
        "dealsChange": 2,
        "dealsChangePercent": 25.00
      },
      "ytd": {
        "totalCommission": 46200.00,
        "totalDeals": 10,
        "avgMonthlyCommission": 46200.00,
        "avgMonthlyDeals": 10
      }
    },
    "recommendations": [
      {
        "category": "Performance",
        "priority": "high",
        "message": "Focus on closing the remaining pipeline to meet revenue goals."
      },
      {
        "category": "Lead Generation",
        "priority": "medium",
        "message": "Consider increasing marketing spend to generate more qualified leads."
      }
    ]
  },
  "generatedAt": "2024-02-04T20:00:00.000Z"
}
```

**Report Sections:**

1. **Summary**: High-level performance metrics
2. **Closed Deals**: Revenue breakdown by type
3. **Activities**: Funnel metrics and activity counts
4. **Performance**: Conversion rates, time metrics, satisfaction
5. **Goals**: Progress toward targets
6. **Market Insights**: Local market conditions
7. **Top Listings**: Best performing properties
8. **Expenses**: Cost breakdown
9. **Comparison**: MoM and YTD trends
10. **Recommendations**: AI-generated insights

**Use Cases:**
- Monthly performance reviews
- Goal tracking and accountability
- Expense management
- Market trend analysis
- Team/broker reporting
- Tax preparation

---

## Business Logic Details

### Commission Calculation Formula

**Sales:**
```
baseCommission = propertyValue × (commissionRate / 100)
```

**Rentals:**
```
baseCommission = monthlyRent × rentalMonths × (commissionRate / 100)
```

**Flat Fee:**
```
baseCommission = flatFeeAmount
```

**Net Commission:**
```
netCommission = baseCommission + bonuses - expenses
```

### Split Distribution

Each split must specify:
- Agent name
- Percentage (0-100)
- Role (listing_agent, buyer_agent, referral, team_lead, brokerage)

Total percentages must equal 100%.

Split calculation:
```
splitAmount = baseCommission × (splitPercentage / 100)
```

### Conversion Rate Calculation

```
conversionRate = (deals_at_stage_B / deals_at_stage_A) × 100
```

Example:
- 28 leads
- 8 offers submitted
- Conversion: (8 / 28) × 100 = 28.57%

### Pipeline Forecasting

```
forecastedClosedDeals = totalDealsInPipeline × (overallConversionRate / 100)
forecastedRevenue = totalPipelineValue × (overallConversionRate / 100)
```

### Deal Health Score

Calculated based on:
- Age distribution (40%)
- Conversion rates (30%)
- Pipeline velocity (20%)
- Deal value (10%)

Score: 0-100, where:
- 80-100: Excellent
- 60-79: Good
- 40-59: Fair
- 0-39: Needs attention

---

## Error Handling

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "error": "Invalid commission calculation data",
  "details": [
    {
      "code": "invalid_type",
      "message": "Expected number, received string",
      "path": ["propertyValue"]
    }
  ]
}
```

**403 Forbidden:**
```json
{
  "error": "Access denied. Agent account required."
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to calculate commission"
}
```

---

## Example Workflows

### Workflow 1: Calculate Commission for a Sale

1. Agent closes a $500,000 sale
2. POST to `/api/agent/commission/calculate`:
```json
{
  "transactionType": "sale",
  "propertyValue": 500000,
  "commissionRate": 6.0,
  "commissionType": "percentage",
  "splits": [
    {
      "agentName": "Me",
      "percentage": 70,
      "role": "listing_agent"
    },
    {
      "agentName": "Brokerage",
      "percentage": 30,
      "role": "brokerage"
    }
  ],
  "expenses": [
    {
      "description": "Staging",
      "amount": 2000
    }
  ]
}
```
3. Receive breakdown:
   - Base: $30,000
   - My share: $21,000
   - Brokerage: $9,000
   - After expenses: $28,000 net

### Workflow 2: Track Monthly Performance

1. End of month arrives
2. GET `/api/agent/reports/monthly?year=2024&month=1`
3. Review:
   - Total revenue: $46,200
   - Deals closed: 10
   - Goal progress: 92.4%
4. Use insights to adjust strategy

### Workflow 3: Pipeline Management

1. Weekly pipeline review
2. GET `/api/agent/analytics/pipeline`
3. Identify:
   - Bottleneck: "showing" stage (50% conversion)
   - Top deals by probability
   - Deals aging over 60 days
4. Take action on insights

---

## Integration Tips

### Frontend Integration

**Commission Calculator Component:**
```typescript
const calculateCommission = async (data: CommissionInput) => {
  const response = await fetch('/api/agent/commission/calculate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};
```

**Revenue Chart Component:**
```typescript
const fetchRevenueData = async (startDate: string, endDate: string) => {
  const response = await fetch(
    `/api/agent/analytics/revenue?startDate=${startDate}&endDate=${endDate}`,
    {
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );
  const data = await response.json();
  return data.timeline; // Use for chart data
};
```

### Dashboard Widgets

**Revenue Summary Widget:**
- Endpoint: `/api/agent/analytics/revenue`
- Update frequency: Daily
- Display: Total revenue, YoY growth, composition chart

**Pipeline Widget:**
- Endpoint: `/api/agent/analytics/pipeline`
- Update frequency: Hourly
- Display: Stage funnel, top deals, conversion rates

**Monthly Report Widget:**
- Endpoint: `/api/agent/reports/monthly`
- Update frequency: Monthly
- Display: Goals progress, activity summary, recommendations

---

## Performance Considerations

- **Caching**: Revenue and pipeline data can be cached for 1-5 minutes
- **Pagination**: Templates endpoint may need pagination for high-volume users
- **Async Processing**: Monthly reports can be generated async for heavy computations
- **Rate Limiting**: Consider limiting calculations to prevent abuse

---

## Future Enhancements

### Planned Features:
1. **Template Management:**
   - PATCH `/api/agent/commission/templates/:id` - Update template
   - DELETE `/api/agent/commission/templates/:id` - Delete template
   - GET `/api/agent/commission/templates/:id` - Get single template

2. **Historical Tracking:**
   - Store calculation history
   - Compare commissions over time
   - Export for accounting systems

3. **Team Management:**
   - Share templates within team
   - Team performance comparisons
   - Leaderboards

4. **Advanced Analytics:**
   - Predictive revenue forecasting
   - Deal probability scoring with ML
   - Market opportunity analysis
   - Client lifetime value

5. **Integrations:**
   - CRM sync (Salesforce, HubSpot)
   - Accounting software (QuickBooks, Xero)
   - MLS data integration
   - Email/calendar integration

---

## Support

For questions or issues with these endpoints, contact the development team or refer to the main API documentation.

**Last Updated:** February 4, 2024
**API Version:** 1.0.0
