# Upfront Savings Calculator

**Feature:** Separates upfront move-in incentives from monthly concessions  
**Created:** February 14, 2026, 04:30 AM EST  
**Status:** ✅ Complete and integrated

---

## Overview

The savings calculator properly categorizes apartment incentives into two types:

### 1. **Upfront Savings** (One-time)
Savings you get when you move in:
- Application fee waivers ($25-$100)
- Security deposit reductions (up to full month's rent)
- Admin/processing fee waivers ($50-$200)
- Gift cards/move-in bonuses ($100-$500)

### 2. **Monthly Concessions** (Recurring)
Savings applied to your monthly rent:
- Free months (e.g., "2 months free")
- Percentage discounts (e.g., "50% off first 3 months")
- Fixed discounts (e.g., "$200 off per month")

---

## Components

### 1. `UpfrontSavingsCalculator` Component
**File:** `/src/components/UpfrontSavingsCalculator.tsx`

**Features:**
- Total savings summary card
- Detailed upfront incentives breakdown
- Monthly concessions breakdown
- Effective monthly rent calculation
- Responsive design with icons

**Props:**
```tsx
interface UpfrontSavingsCalculatorProps {
  baseRent: number;               // Monthly base rent
  leaseTerm?: number;             // Lease duration (default: 12 months)
  upfrontIncentives?: UpfrontIncentive[];
  monthlyConcessions?: MonthlyConcession[];
  className?: string;
}
```

### 2. Savings Calculator Utilities
**File:** `/src/lib/savings-calculator.ts`

**Functions:**

#### `parseConcession()`
Parses concession text and categorizes as upfront or monthly:
```typescript
parseConcession(
  "Application fee waived - $50 value",
  2000, // base rent
  12    // lease term
)
// Returns: { upfront: { type: 'application_fee', amount: 50 }, monthly: null }

parseConcession(
  "2 months free",
  2000,
  12
)
// Returns: { upfront: null, monthly: { type: 'free_months', monthlySavings: 2000, monthsApplied: 2 } }
```

#### `parseConcessions()`
Batch parse multiple concessions:
```typescript
const { upfrontIncentives, monthlyConcessions } = parseConcessions(
  [
    { description: "Application fee waived - $50" },
    { description: "Security deposit reduced by $500" },
    { description: "1 month free" },
    { description: "50% off first 2 months" }
  ],
  2000, // base rent
  12    // lease term
);
```

#### `calculateTotalSavings()`
Calculate totals:
```typescript
const { upfrontTotal, monthlyTotal, grandTotal } = calculateTotalSavings(
  upfrontIncentives,
  monthlyConcessions
);
```

---

## Integration

### Already Integrated In:
✅ **ScrapedPropertiesBrowser** - Shows calculator in property details modal

### To Integrate Elsewhere:

#### Example: Property Details Page
```tsx
import UpfrontSavingsCalculator from '@/components/UpfrontSavingsCalculator';
import { parseConcessions } from '@/lib/savings-calculator';

function PropertyDetails({ property }) {
  const { upfrontIncentives, monthlyConcessions } = parseConcessions(
    property.concessions,
    property.baseRent,
    12
  );
  
  return (
    <div>
      {/* ... other property details ... */}
      
      {(upfrontIncentives.length > 0 || monthlyConcessions.length > 0) && (
        <UpfrontSavingsCalculator
          baseRent={property.baseRent}
          leaseTerm={12}
          upfrontIncentives={upfrontIncentives}
          monthlyConcessions={monthlyConcessions}
        />
      )}
    </div>
  );
}
```

---

## How It Works

### Text Parsing Examples

**Upfront Incentives:**
- "Application fee waived" → $50 default
- "No security deposit" → ~$1000 (half month's rent)
- "$200 admin fee waived" → $200
- "$500 Visa gift card" → $500

**Monthly Concessions:**
- "2 months free" → $2000/month × 2 = $4,000 total
- "50% off first 3 months" → $1000/month × 3 = $3,000 total
- "$200 off per month" → $200/month × 12 = $2,400 total

### Calculations

**Total Savings:**
```
Upfront Savings: $550 (app fee + deposit reduction)
Monthly Savings: $4,000 (2 months free @ $2000/mo)
─────────────────────
Total Savings: $4,550 over 12-month lease
```

**Effective Monthly Rent:**
```
Base Rent: $2,000/month
Monthly Savings: $4,000 / 12 months = $333/month average
─────────────────────
Effective Rent: $1,667/month
```

---

## Visual Design

### Total Savings Card
- Primary color border/background
- Large dollar amount (2xl font)
- Grid showing upfront vs monthly breakdown
- Lease term badge

### Upfront Incentives Section
- Gift icon in header
- Each incentive in rounded card with icon
- Green dollar amounts
- Separator + total at bottom

### Monthly Concessions Section
- Calendar icon in header
- Each concession with details (value, months applied)
- Shows total savings + monthly breakdown
- Average savings per month

### Effective Rent Card
- Blue themed (vs green for savings)
- Shows calculation: Base - Avg Savings = Effective
- Large effective rent display

---

## Example Data Structures

### Upfront Incentive
```typescript
{
  type: 'application_fee',
  description: 'Application fee waived - $50 value',
  amount: 50
}
```

### Monthly Concession
```typescript
{
  type: 'free_months',
  description: '2 months free rent',
  value: '2 months',
  monthsApplied: 2,
  monthlySavings: 2000  // Full rent amount
}
```

---

## Testing

### Test Cases

**1. Only Upfront Incentives:**
- Input: Application fee waived ($50), Security deposit reduced ($500)
- Expected: Shows upfront section only
- Total: $550

**2. Only Monthly Concessions:**
- Input: 2 months free @ $2000/mo
- Expected: Shows monthly section + effective rent
- Total: $4,000
- Effective Rent: $1,667/mo

**3. Mixed Incentives:**
- Input: App fee ($50) + 1 month free ($2000)
- Expected: Both sections shown
- Total: $2,050
- Effective Rent: $1,833/mo

**4. No Incentives:**
- Input: Empty arrays
- Expected: "No incentives" message
- Shows base rent only

### Test in Browser

1. **Navigate to:** `/browse-properties`
2. **Find property with concessions**
3. **Click "View Details"**
4. **Verify:**
   - Savings Calculator appears
   - Upfront incentives separated
   - Monthly concessions show effective rent
   - Math is correct

---

## Integration Points

### Current:
- ✅ ScrapedPropertiesBrowser (property details modal)

### Suggested Future:
- Property comparison tool
- Saved properties page
- Generate offer page
- Email reports
- Property card hover/preview

---

## Files

### New Files Created:
- `/src/components/UpfrontSavingsCalculator.tsx` (11.8 KB)
- `/src/lib/savings-calculator.ts` (6.1 KB)
- `SAVINGS_CALCULATOR.md` (this file)

### Modified Files:
- `/src/components/ScrapedPropertiesBrowser.tsx` (added calculator integration)

---

## Benefits

### For Users:
- ✅ Clear separation of upfront vs monthly savings
- ✅ Accurate effective rent calculation
- ✅ Easy comparison between properties
- ✅ Transparent cost breakdown

### For Landlords (Premium Feature):
- ✅ Highlight move-in specials effectively
- ✅ Show true value of concessions
- ✅ Competitive advantage in listings

---

## Next Steps

1. ✅ Test with real property data
2. Add to more pages (property details, comparison, saved)
3. Add "print/share" functionality
4. Track which concessions convert best
5. A/B test concession types for landlords

---

**Status:** Ready for production! 🎉

The calculator now properly separates upfront savings from monthly concessions, showing renters the complete financial picture when evaluating apartments.
