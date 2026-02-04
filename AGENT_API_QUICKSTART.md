# Agent Dashboard API - Quick Start Guide

Fast reference for testing and integrating the Agent Commission Calculator & Analytics endpoints.

## Quick Setup

### 1. Authentication

First, sign up and get an agent account:

```bash
# Sign up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@example.com",
    "password": "secure_password",
    "name": "Jane Agent"
  }'

# Response will include token
{
  "user": { "id": "...", "email": "...", "userType": "renter" },
  "token": "eyJhbGc..."
}

# Update user type to agent
curl -X PATCH http://localhost:5000/api/auth/user-type \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "userType": "agent" }'
```

### 2. Set Environment Variable

```bash
export AGENT_TOKEN="your_token_here"
```

---

## Quick Test Commands

### Calculate a Simple Sale Commission

```bash
curl -X POST http://localhost:5000/api/agent/commission/calculate \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "sale",
    "propertyValue": 500000,
    "commissionRate": 6.0,
    "commissionType": "percentage",
    "splits": [
      {
        "agentName": "Me",
        "percentage": 100,
        "role": "listing_agent"
      }
    ]
  }'
```

**Expected Result:** $30,000 commission (6% of $500,000)

---

### Calculate Commission with Splits

```bash
curl -X POST http://localhost:5000/api/agent/commission/calculate \
  -H "Authorization: Bearer $AGENT_TOKEN" \
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
    ],
    "expenses": [
      {
        "description": "Marketing",
        "amount": 1500
      }
    ],
    "bonuses": [
      {
        "description": "Performance bonus",
        "amount": 500
      }
    ]
  }'
```

**Expected Result:**
- Base: $24,000
- Each agent: $12,000
- Net after expenses/bonuses: $23,000

---

### Calculate Rental Commission

```bash
curl -X POST http://localhost:5000/api/agent/commission/calculate \
  -H "Authorization: Bearer $AGENT_TOKEN" \
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
  }'
```

**Expected Result:**
- Base: $3,000 (one month's rent)
- Agent: $2,400 (80%)
- Brokerage: $600 (20%)

---

### Get Commission Templates

```bash
curl -X GET http://localhost:5000/api/agent/commission/templates \
  -H "Authorization: Bearer $AGENT_TOKEN"
```

---

### Save a Template

```bash
curl -X POST http://localhost:5000/api/agent/commission/templates \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Standard Sale",
    "description": "My typical sale commission structure",
    "transactionType": "sale",
    "commissionRate": 5.5,
    "commissionType": "percentage",
    "splits": [
      {
        "agentName": "Me",
        "percentage": 75,
        "role": "listing_agent"
      },
      {
        "agentName": "My Brokerage",
        "percentage": 25,
        "role": "brokerage"
      }
    ],
    "isDefault": true
  }'
```

---

### Get Revenue Analytics

```bash
# Current year
curl -X GET "http://localhost:5000/api/agent/analytics/revenue" \
  -H "Authorization: Bearer $AGENT_TOKEN"

# Custom date range
curl -X GET "http://localhost:5000/api/agent/analytics/revenue?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $AGENT_TOKEN"
```

---

### Get Pipeline Metrics

```bash
curl -X GET http://localhost:5000/api/agent/analytics/pipeline \
  -H "Authorization: Bearer $AGENT_TOKEN"
```

---

### Get Monthly Report

```bash
# Current month
curl -X GET http://localhost:5000/api/agent/reports/monthly \
  -H "Authorization: Bearer $AGENT_TOKEN"

# Specific month
curl -X GET "http://localhost:5000/api/agent/reports/monthly?year=2024&month=1" \
  -H "Authorization: Bearer $AGENT_TOKEN"
```

---

## Common Use Cases

### Use Case 1: Commission Calculator Widget

**Goal:** Real-time commission calculator as user types

```javascript
// Frontend example
const calculateLive = async (propertyValue, rate) => {
  const response = await fetch('/api/agent/commission/calculate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transactionType: 'sale',
      propertyValue: parseFloat(propertyValue),
      commissionRate: parseFloat(rate),
      commissionType: 'percentage',
      splits: [{
        agentName: 'You',
        percentage: 100,
        role: 'listing_agent',
      }],
    }),
  });
  
  const data = await response.json();
  return data.calculation.baseCommission;
};

// Usage
const commission = await calculateLive(500000, 6.0);
console.log(`Commission: $${commission.toLocaleString()}`);
```

---

### Use Case 2: Revenue Dashboard

**Goal:** Display monthly revenue chart

```javascript
// Fetch revenue data
const getRevenueChart = async () => {
  const response = await fetch(
    '/api/agent/analytics/revenue?startDate=2024-01-01&endDate=2024-12-31',
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  const data = await response.json();
  
  // Format for chart library (e.g., Chart.js)
  return {
    labels: data.timeline.map(t => t.period),
    datasets: [
      {
        label: 'Sales',
        data: data.timeline.map(t => t.sales.totalCommission),
      },
      {
        label: 'Rentals',
        data: data.timeline.map(t => t.rentals.totalCommission),
      },
    ],
  };
};
```

---

### Use Case 3: Pipeline Funnel Visualization

**Goal:** Show conversion funnel

```javascript
const getPipelineFunnel = async () => {
  const response = await fetch('/api/agent/analytics/pipeline', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json();
  
  // Format for funnel chart
  return data.stages.map(stage => ({
    label: stage.name,
    value: stage.count,
    avgValue: stage.avgValue,
  }));
};
```

---

### Use Case 4: Template Selector

**Goal:** Quick-select saved templates

```javascript
const loadTemplates = async () => {
  const response = await fetch('/api/agent/commission/templates', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json();
  
  // Populate dropdown
  return data.templates.map(t => ({
    value: t.id,
    label: t.name,
    isDefault: t.isDefault,
  }));
};

const applyTemplate = (template, propertyValue) => {
  return {
    transactionType: template.transactionType,
    propertyValue,
    commissionRate: template.commissionRate,
    commissionType: template.commissionType,
    splits: template.splits,
  };
};
```

---

### Use Case 5: Monthly Performance Email

**Goal:** Send automated monthly report email

```javascript
const generateMonthlyEmail = async (year, month) => {
  const response = await fetch(
    `/api/agent/reports/monthly?year=${year}&month=${month}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  const data = await response.json();
  
  const { report } = data;
  
  return {
    subject: `${report.period.monthName} Performance Report`,
    body: `
      Total Revenue: $${report.summary.totalRevenue.toLocaleString()}
      Deals Closed: ${report.summary.totalDeals}
      Goal Progress: ${report.goals.revenue.progress.toFixed(1)}%
      
      Next Steps:
      ${report.recommendations.map(r => `- ${r.message}`).join('\n')}
    `,
  };
};
```

---

## Test Scenarios

### Test Scenario 1: Edge Cases

**Split Percentages Don't Total 100%**
```bash
curl -X POST http://localhost:5000/api/agent/commission/calculate \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "sale",
    "propertyValue": 500000,
    "commissionRate": 6.0,
    "commissionType": "percentage",
    "splits": [
      {"agentName": "Agent 1", "percentage": 50, "role": "listing_agent"},
      {"agentName": "Agent 2", "percentage": 30, "role": "buyer_agent"}
    ]
  }'
```
**Expected:** 400 error - "Split percentages must total 100%. Current total: 80.00%"

---

**Negative Property Value**
```bash
curl -X POST http://localhost:5000/api/agent/commission/calculate \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "sale",
    "propertyValue": -500000,
    "commissionRate": 6.0,
    "commissionType": "percentage"
  }'
```
**Expected:** 400 error - validation failure

---

### Test Scenario 2: Complex Splits

**Four-way split with expenses and bonuses**
```bash
curl -X POST http://localhost:5000/api/agent/commission/calculate \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "sale",
    "propertyValue": 800000,
    "commissionRate": 5.0,
    "commissionType": "percentage",
    "splits": [
      {"agentName": "Primary Agent", "percentage": 45, "role": "listing_agent"},
      {"agentName": "Co-Agent", "percentage": 20, "role": "buyer_agent"},
      {"agentName": "Team Lead", "percentage": 20, "role": "team_lead"},
      {"agentName": "Brokerage", "percentage": 15, "role": "brokerage"}
    ],
    "expenses": [
      {"description": "Professional photography", "amount": 800},
      {"description": "Staging", "amount": 3000},
      {"description": "Marketing materials", "amount": 1200}
    ],
    "bonuses": [
      {"description": "Quick close bonus", "amount": 2000}
    ]
  }'
```

**Expected Results:**
- Base: $40,000
- Primary: $18,000
- Co-Agent: $8,000
- Team Lead: $8,000
- Brokerage: $6,000
- Net: $37,000 (after $5,000 expenses + $2,000 bonus)

---

### Test Scenario 3: Flat Fee Commission

```bash
curl -X POST http://localhost:5000/api/agent/commission/calculate \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "sale",
    "propertyValue": 250000,
    "commissionType": "flat_fee",
    "flatFeeAmount": 7500,
    "splits": [
      {"agentName": "Agent", "percentage": 100, "role": "listing_agent"}
    ]
  }'
```
**Expected:** $7,500 commission regardless of property value

---

## Testing Checklist

### Commission Calculator
- [ ] Simple sale calculation (no splits)
- [ ] Sale with 50/50 split
- [ ] Rental with brokerage split
- [ ] Commission with expenses
- [ ] Commission with bonuses
- [ ] Flat fee commission
- [ ] Multi-month rental
- [ ] Invalid split percentages (error handling)
- [ ] Negative values (error handling)
- [ ] Non-agent user access (403 error)

### Templates
- [ ] List all templates
- [ ] Save new template
- [ ] Template with invalid splits (error)
- [ ] Template name validation
- [ ] Default template flag

### Revenue Analytics
- [ ] Current year revenue
- [ ] Custom date range
- [ ] YoY growth calculation
- [ ] Sales vs rentals composition
- [ ] Empty data handling

### Pipeline Analytics
- [ ] Pipeline stages display
- [ ] Conversion rate calculation
- [ ] Forecast accuracy
- [ ] Deal age distribution
- [ ] Bottleneck identification

### Monthly Report
- [ ] Current month report
- [ ] Historical month report
- [ ] Goal progress tracking
- [ ] Expense breakdown
- [ ] MoM comparison
- [ ] Recommendations generation

---

## Troubleshooting

### Error: "Access denied. Agent account required."

**Solution:** Make sure you've updated your user type to "agent":
```bash
curl -X PATCH http://localhost:5000/api/auth/user-type \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "userType": "agent" }'
```

---

### Error: "Invalid token"

**Solution:** Your token may have expired. Sign in again:
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@example.com",
    "password": "your_password"
  }'
```

---

### Error: "Split percentages must total 100%"

**Solution:** Ensure all split percentages add up to exactly 100:
```javascript
const splits = [
  { agentName: "Agent 1", percentage: 60, role: "listing_agent" },
  { agentName: "Agent 2", percentage: 40, role: "buyer_agent" },
];

const total = splits.reduce((sum, s) => sum + s.percentage, 0);
console.log(total); // Must be 100
```

---

## Performance Tips

1. **Cache Templates**: Load templates once on page load
2. **Debounce Calculations**: Wait 300ms after user stops typing
3. **Preload Analytics**: Fetch revenue/pipeline data in background
4. **Local Storage**: Store last used template locally
5. **Optimistic UI**: Show calculation immediately, validate in background

---

## Next Steps

1. **Build UI Components**: Use endpoints to create dashboard widgets
2. **Add Persistence**: Store calculation history for tax purposes
3. **Integrate CRM**: Sync deals with external systems
4. **Email Reports**: Automate monthly report delivery
5. **Mobile App**: Build native mobile commission calculator

---

## Additional Resources

- Full API Documentation: `AGENT_COMMISSION_ANALYTICS_API.md`
- Main API Docs: See project README
- Support: Contact development team

**Happy coding!** 🚀
