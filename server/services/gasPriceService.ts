// ============================================
// GAS PRICE SERVICE
// Scrapes AAA daily gas price averages
// ============================================

interface StateGasPrice {
  state: string;
  regular: number;
  midgrade: number;
  premium: number;
  diesel: number;
  lastUpdated: string;
}

interface GasPriceCache {
  [state: string]: {
    price: StateGasPrice;
    timestamp: number;
  };
}

const cache: GasPriceCache = {};
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get gas price for a state
 * Uses AAA daily averages, cached for 24 hours
 */
export async function getStateGasPrice(state: string): Promise<number> {
  const stateCode = state.toUpperCase();
  
  // Check cache first
  const cached = cache[stateCode];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.price.regular;
  }
  
  try {
    // Scrape AAA gas prices
    const price = await scrapeAAAGasPrice(stateCode);
    
    // Cache the result
    cache[stateCode] = {
      price,
      timestamp: Date.now(),
    };
    
    return price.regular;
  } catch (error) {
    console.error('Failed to fetch gas price:', error);
    
    // Return cached value if available (even if stale)
    if (cached) {
      return cached.price.regular;
    }
    
    // Fallback to national average
    return 3.50;
  }
}

/**
 * Scrape AAA gas prices
 * Source: https://gasprices.aaa.com/
 */
async function scrapeAAAGasPrice(state: string): Promise<StateGasPrice> {
  const url = 'https://gasprices.aaa.com/';
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Parse HTML to find state gas prices
    // AAA provides data in a table format
    const stateData = parseAAAHTML(html, state);
    
    if (stateData) {
      return stateData;
    }
  } catch (error) {
    console.error('AAA scrape failed:', error);
  }
  
  // Fallback: use national average
  return {
    state,
    regular: 3.50,
    midgrade: 3.80,
    premium: 4.10,
    diesel: 3.90,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Parse AAA HTML to extract gas prices
 */
function parseAAAHTML(html: string, state: string): StateGasPrice | null {
  // AAA page structure (as of 2026):
  // State prices are in a table with class "gas-prices-table"
  // Each row has: state name, regular, midgrade, premium, diesel
  
  const stateMap: { [key: string]: string } = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
    'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
    'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
    'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
    'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
    'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
    'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
    'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
    'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
    'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'
  };
  
  const stateName = stateMap[state.toUpperCase()];
  if (!stateName) return null;
  
  // Find the state row in the HTML
  const stateRegex = new RegExp(`${stateName}.*?(\\d+\\.\\d+).*?(\\d+\\.\\d+).*?(\\d+\\.\\d+).*?(\\d+\\.\\d+)`, 'i');
  const match = html.match(stateRegex);
  
  if (match) {
    return {
      state,
      regular: parseFloat(match[1]),
      midgrade: parseFloat(match[2]),
      premium: parseFloat(match[3]),
      diesel: parseFloat(match[4]),
      lastUpdated: new Date().toISOString(),
    };
  }
  
  return null;
}

/**
 * Get gas price for a specific ZIP code
 * For now, returns state average
 * Future: integrate GasBuddy API for hyperlocal pricing
 */
export async function getZipGasPrice(zipCode: string): Promise<number> {
  // Map ZIP to state (first digit roughly corresponds to region)
  const state = zipToState(zipCode);
  return getStateGasPrice(state);
}

/**
 * Map ZIP code to state code
 * This is a simplified version - in production, use a proper ZIP database
 */
function zipToState(zip: string): string {
  const firstDigit = zip.charAt(0);
  
  // Rough mapping by ZIP prefix
  const zipMap: { [key: string]: string } = {
    '0': 'CT', '1': 'NY', '2': 'DC', '3': 'FL',
    '4': 'KY', '5': 'MN', '6': 'IL', '7': 'TX',
    '8': 'CO', '9': 'CA'
  };
  
  return zipMap[firstDigit] || 'TX'; // Default to TX
}

/**
 * Get all state gas prices (for admin dashboard)
 */
export async function getAllStateGasPrices(): Promise<StateGasPrice[]> {
  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
  ];
  
  const prices: StateGasPrice[] = [];
  
  for (const state of states) {
    try {
      const price = await getStateGasPrice(state);
      prices.push({
        state,
        regular: price,
        midgrade: price + 0.30,
        premium: price + 0.60,
        diesel: price + 0.40,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Failed to get price for ${state}:`, error);
    }
  }
  
  return prices;
}

export default {
  getStateGasPrice,
  getZipGasPrice,
  getAllStateGasPrices,
};
