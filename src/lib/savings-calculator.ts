export interface ScrapedProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code?: string;
  min_rent?: number;
  max_rent?: number;
  bedrooms_min?: number;
  bedrooms_max?: number;
  bathrooms_min?: number;
  bathrooms_max?: number;
  special_offers?: string;
  concession_type?: string;
  concession_value?: number;
  effective_price?: number;
  amenities?: string[];
  pet_policy?: string;
  phone?: string;
  website_url?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  source?: string;
  scraped_at?: string;
}

export interface SavingsBreakdown {
  monthlyRent: number;
  marketMedianRent: number;
  monthlySavings: number;
  annualSavings: number;
  upfrontSavings: number;
  monthlyConcessionsValue: number;
  dealScore: number;
  hasSpecialOffer: boolean;
  specialOfferText: string;
  savingsPercentage: number;
}

const MARKET_MEDIAN_RENTS: Record<string, number> = {
  'Orlando': 1847,
  'Austin': 1650,
  'Dallas': 1500,
  'Houston': 1400,
  'San Antonio': 1350,
  'Tampa': 1600,
  'Miami': 2200,
  'Jacksonville': 1450,
  'Atlanta': 1700,
  'Charlotte': 1550,
  'default': 1600,
};

function parseSpecialOffer(offer: string | undefined | null, actualRent?: number): { upfront: number; monthlyValue: number; text: string } {
  if (!offer) return { upfront: 0, monthlyValue: 0, text: '' };

  const text = offer.trim();
  let upfront = 0;
  let monthlyValue = 0;
  const rentBasis = actualRent || 1500;

  const weeksFreePat = /(\d+)\s*weeks?\s*free/i;
  const monthsFreePat = /(\d+)\s*months?\s*free/i;
  const dollarOffPat = /\$(\d[\d,]*)\s*off/i;
  const percentOffPat = /(\d+)%\s*off/i;
  const lookAndLeasePat = /look\s*(?:&|and)\s*lease/i;
  const moveinPat = /move[- ]?in\s*special/i;
  const reducedPat = /reduced/i;
  const waivePat = /waiv/i;

  const weeksMatch = text.match(weeksFreePat);
  if (weeksMatch) {
    const weeks = parseInt(weeksMatch[1], 10);
    upfront = Math.round((weeks / 4.33) * rentBasis);
  }

  const monthsMatch = text.match(monthsFreePat);
  if (monthsMatch) {
    const months = parseInt(monthsMatch[1], 10);
    upfront = months * rentBasis;
  }

  const dollarMatch = text.match(dollarOffPat);
  if (dollarMatch) {
    const amount = parseInt(dollarMatch[1].replace(/,/g, ''), 10);
    if (amount > 500) {
      upfront = amount;
    } else {
      monthlyValue = amount;
    }
  }

  const percentMatch = text.match(percentOffPat);
  if (percentMatch) {
    const pct = parseInt(percentMatch[1], 10);
    monthlyValue = Math.round((pct / 100) * rentBasis);
  }

  if (lookAndLeasePat.test(text) && upfront === 0 && monthlyValue === 0) {
    upfront = 500;
  }

  if ((moveinPat.test(text) || reducedPat.test(text)) && upfront === 0 && monthlyValue === 0) {
    upfront = 300;
  }

  if (waivePat.test(text) && upfront === 0) {
    upfront = 250;
  }

  return { upfront, monthlyValue, text };
}

export function calculatePropertySavings(property: ScrapedProperty, cityMedianRent?: number): SavingsBreakdown {
  const medianRent = cityMedianRent || MARKET_MEDIAN_RENTS[property.city] || MARKET_MEDIAN_RENTS['default'];
  const rent = property.min_rent || property.max_rent || medianRent;

  let offerInfo: { upfront: number; monthlyValue: number; text: string };

  if (property.effective_price && property.effective_price < rent) {
    const monthlyDiscount = rent - property.effective_price;
    const text = property.special_offers || `${property.concession_type || 'Concession'}: saves $${monthlyDiscount}/mo`;
    offerInfo = { upfront: 0, monthlyValue: monthlyDiscount, text };
  } else {
    offerInfo = parseSpecialOffer(property.special_offers, rent);
  }

  const monthlySavings = Math.max(0, medianRent - rent + offerInfo.monthlyValue);
  const annualSavings = monthlySavings * 12 + offerInfo.upfront;
  const savingsPercentage = medianRent > 0 ? Math.round((monthlySavings / medianRent) * 100) : 0;

  let dealScore = 50;
  if (monthlySavings > 0) dealScore += Math.min(25, Math.round((monthlySavings / medianRent) * 100));
  if (offerInfo.upfront > 0) dealScore += Math.min(15, Math.round(offerInfo.upfront / 200));
  if (offerInfo.monthlyValue > 0) dealScore += 10;
  dealScore = Math.min(100, Math.max(0, dealScore));

  return {
    monthlyRent: rent,
    marketMedianRent: medianRent,
    monthlySavings,
    annualSavings,
    upfrontSavings: offerInfo.upfront,
    monthlyConcessionsValue: offerInfo.monthlyValue,
    dealScore,
    hasSpecialOffer: !!(property.special_offers || property.concession_type || property.effective_price),
    specialOfferText: offerInfo.text,
    savingsPercentage,
  };
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}
