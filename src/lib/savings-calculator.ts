/**
 * Savings Calculator Utilities
 * Helper functions to parse and calculate savings from concessions
 */

export interface UpfrontIncentive {
  type: 'application_fee' | 'security_deposit' | 'admin_fee' | 'gift_card' | 'other';
  description: string;
  amount: number;
}

export interface MonthlyConcession {
  type: 'free_months' | 'percent_off' | 'fixed_discount';
  description: string;
  value: string;
  monthsApplied: number;
  monthlySavings: number;
}

/**
 * Parse concession text and determine if it's upfront or monthly
 */
export function parseConcession(
  description: string,
  baseRent: number,
  leaseTerm: number = 12
): { upfront: UpfrontIncentive | null; monthly: MonthlyConcession | null } {
  const text = description.toLowerCase();
  
  // Upfront incentives
  if (text.includes('application fee') && text.includes('waive')) {
    return {
      upfront: {
        type: 'application_fee',
        description,
        amount: extractAmount(text) || 50, // Default $50
      },
      monthly: null,
    };
  }
  
  if (text.includes('security deposit') && (text.includes('waive') || text.includes('reduce'))) {
    const amount = extractAmount(text) || baseRent * 0.5; // Default half month's rent
    return {
      upfront: {
        type: 'security_deposit',
        description,
        amount,
      },
      monthly: null,
    };
  }
  
  if (text.includes('admin fee') && text.includes('waive')) {
    return {
      upfront: {
        type: 'admin_fee',
        description,
        amount: extractAmount(text) || 100, // Default $100
      },
      monthly: null,
    };
  }
  
  if (text.includes('gift card') || text.includes('visa card')) {
    return {
      upfront: {
        type: 'gift_card',
        description,
        amount: extractAmount(text) || 200, // Default $200
      },
      monthly: null,
    };
  }
  
  // Monthly concessions
  if (text.includes('month') && text.includes('free')) {
    const months = extractMonths(text);
    return {
      upfront: null,
      monthly: {
        type: 'free_months',
        description,
        value: `${months} months free`,
        monthsApplied: months,
        monthlySavings: baseRent,
      },
    };
  }
  
  if (text.includes('%') && text.includes('off')) {
    const percent = extractPercent(text);
    const months = extractMonthsDuration(text) || leaseTerm;
    return {
      upfront: null,
      monthly: {
        type: 'percent_off',
        description,
        value: `${percent}% off`,
        monthsApplied: months,
        monthlySavings: baseRent * (percent / 100),
      },
    };
  }
  
  if (text.includes('$') && text.includes('off')) {
    const amount = extractAmount(text);
    const months = extractMonthsDuration(text) || leaseTerm;
    return {
      upfront: null,
      monthly: {
        type: 'fixed_discount',
        description,
        value: `$${amount} off`,
        monthsApplied: months,
        monthlySavings: amount,
      },
    };
  }
  
  // Default: treat as upfront if amount is mentioned
  const amount = extractAmount(text);
  if (amount > 0) {
    return {
      upfront: {
        type: 'other',
        description,
        amount,
      },
      monthly: null,
    };
  }
  
  return { upfront: null, monthly: null };
}

/**
 * Extract dollar amount from text
 */
function extractAmount(text: string): number {
  const match = text.match(/\$?([\d,]+)/);
  if (match) {
    return parseInt(match[1].replace(/,/g, ''));
  }
  return 0;
}

/**
 * Extract number of free months
 */
function extractMonths(text: string): number {
  const patterns = [
    /(\d+)\s*month[s]?\s*free/i,
    /first\s*(\d+)\s*month[s]?\s*free/i,
    /(\d+)\s*free\s*month[s]?/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  // Text-based numbers
  const textNumbers: Record<string, number> = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4,
    'five': 5, 'six': 6, 'seven': 7, 'eight': 8,
  };
  
  for (const [word, num] of Object.entries(textNumbers)) {
    if (text.includes(`${word} month`)) {
      return num;
    }
  }
  
  return 1; // Default to 1 month
}

/**
 * Extract percentage
 */
function extractPercent(text: string): number {
  const match = text.match(/(\d+)%/);
  if (match) {
    return parseInt(match[1]);
  }
  return 50; // Default 50%
}

/**
 * Extract duration for discounts (e.g., "50% off first 3 months")
 */
function extractMonthsDuration(text: string): number | null {
  const patterns = [
    /first\s*(\d+)\s*month[s]?/i,
    /(\d+)\s*month[s]?\s*lease/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  return null;
}

/**
 * Parse multiple concessions from an array
 */
export function parseConcessions(
  concessions: Array<{ description: string; type?: string }>,
  baseRent: number,
  leaseTerm: number = 12
): {
  upfrontIncentives: UpfrontIncentive[];
  monthlyConcessions: MonthlyConcession[];
} {
  const upfrontIncentives: UpfrontIncentive[] = [];
  const monthlyConcessions: MonthlyConcession[] = [];
  
  for (const concession of concessions) {
    const parsed = parseConcession(concession.description, baseRent, leaseTerm);
    
    if (parsed.upfront) {
      upfrontIncentives.push(parsed.upfront);
    }
    if (parsed.monthly) {
      monthlyConcessions.push(parsed.monthly);
    }
  }
  
  return { upfrontIncentives, monthlyConcessions };
}

/**
 * Calculate total savings
 * 
 * IMPORTANT: Total savings = Upfront + Monthly over lease term
 * - Upfront: One-time savings (application fees, deposits, etc.)
 * - Monthly: Recurring savings over the lease period
 * - Grand Total: Sum of both (what the renter actually saves)
 */
export function calculateTotalSavings(
  upfrontIncentives: UpfrontIncentive[],
  monthlyConcessions: MonthlyConcession[],
  leaseTerm: number = 12
): {
  upfrontTotal: number;
  monthlyTotal: number;
  grandTotal: number;
  averageMonthlySavings: number;
  effectiveRent: (baseRent: number) => number;
} {
  const upfrontTotal = upfrontIncentives.reduce((sum, i) => sum + i.amount, 0);
  const monthlyTotal = monthlyConcessions.reduce(
    (sum, c) => sum + c.monthlySavings * c.monthsApplied,
    0
  );
  
  // Grand total includes BOTH upfront and monthly savings
  const grandTotal = upfrontTotal + monthlyTotal;
  
  // Average monthly savings (monthly concessions only)
  const averageMonthlySavings = monthlyTotal / leaseTerm;
  
  // Effective rent calculator
  const effectiveRent = (baseRent: number) => {
    // Monthly effective rent = base rent - average monthly concessions
    const monthlyEffective = baseRent - averageMonthlySavings;
    
    // If we amortize upfront savings over the lease term:
    const amortizedUpfront = upfrontTotal / leaseTerm;
    
    return {
      withoutUpfront: monthlyEffective,
      withAmortizedUpfront: monthlyEffective - amortizedUpfront,
      upfrontSavingsPerMonth: amortizedUpfront,
    };
  };
  
  return {
    upfrontTotal,
    monthlyTotal,
    grandTotal, // ⭐ THIS IS THE KEY NUMBER - Total savings over lease
    averageMonthlySavings,
    effectiveRent,
  };
}

/**
 * Calculate effective monthly cost with upfront amortization
 * 
 * This gives the "true monthly cost" when upfront savings are spread across the lease
 */
export function calculateEffectiveMonthlyRent(
  baseRent: number,
  upfrontIncentives: UpfrontIncentive[],
  monthlyConcessions: MonthlyConcession[],
  leaseTerm: number = 12
): {
  baseRent: number;
  monthlyDiscount: number;
  amortizedUpfrontSavings: number;
  effectiveMonthlyRent: number;
  totalSavingsOverLease: number;
} {
  const { upfrontTotal, monthlyTotal, grandTotal, averageMonthlySavings } = calculateTotalSavings(
    upfrontIncentives,
    monthlyConcessions,
    leaseTerm
  );
  
  const amortizedUpfront = upfrontTotal / leaseTerm;
  
  return {
    baseRent,
    monthlyDiscount: averageMonthlySavings,
    amortizedUpfrontSavings: amortizedUpfront,
    effectiveMonthlyRent: baseRent - averageMonthlySavings - amortizedUpfront,
    totalSavingsOverLease: grandTotal,
  };
}

/**
 * Format savings for display
 */
export function formatSavingsDisplay(
  upfrontTotal: number,
  monthlyTotal: number,
  grandTotal: number
): string {
  const parts: string[] = [];
  
  if (upfrontTotal > 0) {
    parts.push(`$${upfrontTotal.toLocaleString()} upfront`);
  }
  
  if (monthlyTotal > 0) {
    parts.push(`$${monthlyTotal.toLocaleString()} over lease`);
  }
  
  if (parts.length === 0) {
    return 'No savings';
  }
  
  if (parts.length === 1) {
    return `Save ${parts[0]}`;
  }
  
  return `Save $${grandTotal.toLocaleString()} (${parts.join(' + ')})`;
}
