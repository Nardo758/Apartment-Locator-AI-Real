# 💰 Concessions Calculation Logic

**Date:** Feb 3, 2026  
**Purpose:** Document how rental concessions affect True Cost calculation

---

## 📐 The Math

### Standard Concessions

**Formula:**
```
Effective Monthly Rent = Base Rent - (Total Concession Value ÷ 12)
```

### Examples

#### Example 1: 2 Weeks Free
```
Base Rent: $2,000/mo
Concession: 2 weeks free

Total Concession Value:
  $2,000 × 12 months = $24,000/year
  2 weeks = 14 days
  14 days ÷ 365 days = 0.0384 of year
  $24,000 × 0.0384 = $921.60

Effective Monthly Rent:
  ($24,000 - $921.60) ÷ 12 = $1,923.20/mo
  
  OR SIMPLER:
  $2,000 - ($2,000 × (2÷52)) = $1,923.08/mo
  
  OR SIMPLEST (Leon's method):
  Concession total = $2,000 × (2 weeks / 52 weeks) × 12 = $923
  $923 ÷ 12 = $77/mo discount
  $2,000 - $77 = $1,923/mo
```

#### Example 2: 1 Month Free
```
Base Rent: $2,000/mo
Concession: 1 month free

Total Concession Value:
  $2,000 × 1 month = $2,000

Effective Monthly Rent:
  $2,000 ÷ 12 = $166.67/mo discount
  $2,000 - $166.67 = $1,833.33/mo
```

#### Example 3: 6 Weeks Free
```
Base Rent: $1,850/mo
Concession: 6 weeks free

Concession Value:
  6 weeks ÷ 52 weeks = 0.1154 of year
  $1,850 × 12 × 0.1154 = $2,564.88
  
Monthly Discount:
  $2,564.88 ÷ 12 = $213.74/mo
  
Effective Monthly Rent:
  $1,850 - $213.74 = $1,636.26/mo
```

#### Example 4: 2 Months Free (Move-in Special)
```
Base Rent: $2,200/mo
Concession: First 2 months free

Total Concession Value:
  $2,200 × 2 = $4,400

Effective Monthly Rent:
  $4,400 ÷ 12 = $366.67/mo discount
  $2,200 - $366.67 = $1,833.33/mo
```

---

## 💻 TypeScript Implementation

```typescript
interface Concession {
  type: 'weeks_free' | 'months_free' | 'dollar_amount' | 'percent_off';
  value: number; // weeks, months, dollars, or percentage
  description: string; // "2 weeks free" or "50% off first month"
  duration?: number; // How many months the discount applies (default: 12)
}

interface ApartmentWithConcession {
  id: string;
  name: string;
  baseRent: number;
  concessions: Concession[];
}

/**
 * Calculate the effective monthly rent after concessions
 */
function calculateEffectiveRent(
  baseRent: number, 
  concessions: Concession[]
): {
  effectiveRent: number;
  totalConcessionValue: number;
  monthlySavings: number;
  annualSavings: number;
} {
  let totalConcessionValue = 0;
  
  concessions.forEach(concession => {
    const duration = concession.duration || 12; // Default to 12-month lease
    
    switch (concession.type) {
      case 'weeks_free':
        // Weeks free: value = number of weeks
        // Annual rent = baseRent × 12
        // Weeks in year = 52
        // Concession value = (weeks / 52) × annual rent
        totalConcessionValue += (concession.value / 52) * (baseRent * 12);
        break;
        
      case 'months_free':
        // Months free: value = number of months
        // Concession value = baseRent × months
        totalConcessionValue += baseRent * concession.value;
        break;
        
      case 'dollar_amount':
        // Direct dollar amount off (e.g., $500 off)
        totalConcessionValue += concession.value;
        break;
        
      case 'percent_off':
        // Percentage off for X months (e.g., 50% off first month)
        // value = percentage (e.g., 50 for 50%)
        // duration = how many months it applies
        const discountAmount = baseRent * (concession.value / 100);
        totalConcessionValue += discountAmount * (concession.duration || 1);
        break;
    }
  });
  
  // Spread the concession over 12 months
  const monthlySavings = totalConcessionValue / 12;
  const effectiveRent = baseRent - monthlySavings;
  const annualSavings = totalConcessionValue;
  
  return {
    effectiveRent: Math.round(effectiveRent * 100) / 100, // Round to cents
    totalConcessionValue: Math.round(totalConcessionValue * 100) / 100,
    monthlySavings: Math.round(monthlySavings * 100) / 100,
    annualSavings: Math.round(annualSavings * 100) / 100,
  };
}

/**
 * Calculate TRUE COST including concessions
 */
function calculateTrueCostWithConcessions(
  baseRent: number,
  concessions: Concession[],
  locationCosts: number // From commute, etc.
): {
  baseRent: number;
  effectiveRent: number;
  concessionSavings: number;
  locationCosts: number;
  trueCost: number;
  totalSavings: number;
} {
  const { effectiveRent, monthlySavings } = calculateEffectiveRent(baseRent, concessions);
  const trueCost = effectiveRent + locationCosts;
  
  return {
    baseRent,
    effectiveRent,
    concessionSavings: monthlySavings,
    locationCosts,
    trueCost: Math.round(trueCost * 100) / 100,
    totalSavings: monthlySavings,
  };
}
```

---

## 🎨 UI Display

### Apartment Card Example

```
┌────────────────────────────────────────────────┐
│  Camden Apartments                              │
│                                                 │
│  Base Rent: $2,000/mo (small, strikethrough)  │
│  🎉 Special: 2 weeks free                      │
│                                                 │
│  Effective Rent: $1,923/mo                     │
│  (medium, highlighted in green)                │
│                                                 │
│  Location Costs: +$161/mo                      │
│  ─────────────────────────                     │
│                                                 │
│  TRUE COST: $2,084/mo                          │
│  (LARGE gradient: blue-to-purple)              │
│                                                 │
│  💰 You Save: $77/mo from concession           │
│     ($924/year)                                │
└────────────────────────────────────────────────┘
```

### Comparison Table

```
┌─────────────────────────────────────────────────────────────────────┐
│ Apt Name    │ Base Rent │ Concession │ Eff. Rent │ TRUE COST        │
├─────────────────────────────────────────────────────────────────────┤
│ Camden ⭐   │ $2,000    │ 2 wks free │ $1,923    │ $2,084           │
│             │           │ (-$77/mo)  │           │                  │
├─────────────────────────────────────────────────────────────────────┤
│ Vue Eola    │ $2,200    │ 1 mo free  │ $2,033    │ $2,118           │
│             │           │ (-$167/mo) │           │                  │
├─────────────────────────────────────────────────────────────────────┤
│ Millenia    │ $1,650    │ None       │ $1,650    │ $2,570           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Scraping Concessions

### Common Patterns in Listings

**Text patterns to detect:**
- "2 weeks free"
- "1 month free rent"
- "First month free"
- "6 weeks free on select units"
- "50% off first month"
- "$500 off"
- "Move-in special: 2 months free"

### Structured Data

```typescript
interface ScrapedConcession {
  rawText: string; // "2 weeks free on 12-month lease"
  parsed: Concession;
  confidence: number; // 0-1
  source: 'listing' | 'website' | 'phone_call';
}
```

### Parsing Logic

```typescript
function parseConcessionText(text: string): Concession | null {
  const lowerText = text.toLowerCase();
  
  // Pattern: "X weeks free"
  const weeksMatch = lowerText.match(/(\d+)\s*weeks?\s*free/);
  if (weeksMatch) {
    return {
      type: 'weeks_free',
      value: parseInt(weeksMatch[1]),
      description: text,
    };
  }
  
  // Pattern: "X months free"
  const monthsMatch = lowerText.match(/(\d+)\s*months?\s*free/);
  if (monthsMatch) {
    return {
      type: 'months_free',
      value: parseInt(monthsMatch[1]),
      description: text,
    };
  }
  
  // Pattern: "$X off"
  const dollarMatch = lowerText.match(/\$(\d+)\s*off/);
  if (dollarMatch) {
    return {
      type: 'dollar_amount',
      value: parseInt(dollarMatch[1]),
      description: text,
    };
  }
  
  // Pattern: "X% off"
  const percentMatch = lowerText.match(/(\d+)%\s*off/);
  if (percentMatch) {
    return {
      type: 'percent_off',
      value: parseInt(percentMatch[1]),
      description: text,
      duration: 1, // Assume 1 month unless specified
    };
  }
  
  return null;
}
```

---

## 📊 Impact on Smart Score

### Concessions Affect Multiple Metrics

1. **True Cost** (Direct Impact)
   - Lower effective rent → Lower True Cost → Higher ranking

2. **Value Score** (New Metric)
   - Concession value ÷ Base Rent = Value %
   - 2 weeks free = ~3.8% value
   - 1 month free = ~8.3% value
   - Higher value % = Better deal

3. **Urgency Indicator**
   - Large concessions = Landlord motivated
   - Boost negotiation leverage score
   - Flag as "Act Now" opportunity

4. **Market Intelligence**
   - Track concession trends
   - "Concessions up 25% this quarter"
   - Predict future concessions

---

## 🎯 UI Components Needed

1. **Concession Badge** (on property cards)
   ```tsx
   <ConcessionBadge 
     concession={{ type: 'weeks_free', value: 2 }}
     savings={77}
   />
   // Renders: "🎉 2 Weeks Free • Save $77/mo"
   ```

2. **Effective Rent Display** (replace/alongside base rent)
   ```tsx
   <EffectiveRentDisplay 
     baseRent={2000}
     effectiveRent={1923}
     concessions={[...]}
   />
   ```

3. **Concession Input** (for manual entry/scraping)
   ```tsx
   <ConcessionInput 
     onAdd={(concession) => { ... }}
   />
   ```

4. **Concession Comparison Chart**
   ```tsx
   <ConcessionComparisonChart 
     apartments={[...]}
   />
   // Bar chart showing concession value by apartment
   ```

---

## 🚀 Implementation Checklist

- [ ] Create `Concession` type in `/types/locationCost.types.ts`
- [ ] Add `calculateEffectiveRent()` to `locationCostService.ts`
- [ ] Update `calculateTrueCostWithConcessions()` function
- [ ] Create `ConcessionBadge` component
- [ ] Create `EffectiveRentDisplay` component
- [ ] Add concession field to apartment scraping
- [ ] Create concession parser (`parseConcessionText()`)
- [ ] Update comparison table to show concessions
- [ ] Add concession tracking to Market Intel
- [ ] Create concession trend analysis

---

## 📝 Examples from Real Listings

### Apartments.com Example
```json
{
  "name": "Camden South Congress",
  "baseRent": 2150,
  "concessions": [
    {
      "type": "weeks_free",
      "value": 6,
      "description": "6 weeks free on 12-month lease",
      "duration": 12
    }
  ]
}

Result:
- Effective Rent: $1,900/mo
- Monthly Savings: $250
- Annual Savings: $3,000
```

### Zillow Example
```json
{
  "name": "Domain Apartments",
  "baseRent": 1950,
  "concessions": [
    {
      "type": "percent_off",
      "value": 50,
      "description": "50% off first 2 months",
      "duration": 2
    }
  ]
}

Result:
- Effective Rent: $1,787/mo
- Monthly Savings: $163
- Annual Savings: $1,950
```

---

**Status:** Ready to implement concessions into True Cost calculation!
