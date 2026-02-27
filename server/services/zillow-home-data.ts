interface ZillowSearchResult {
  zpid: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  price: number;
  zestimate: number;
  rentZestimate: number;
  bedrooms: number;
  bathrooms: number;
  livingArea: number;
  homeType: string;
  yearBuilt: number;
  daysOnZillow: number;
  latitude: number;
  longitude: number;
}

export interface HomePriceMarketData {
  city: string;
  state: string;
  medianHomePrice: number;
  medianPricePerSqFt: number;
  avgHomePrice: number;
  minPrice: number;
  maxPrice: number;
  totalListings: number;
  medianDaysOnMarket: number;
  priceRange: { min: number; max: number };
  yearOverYearChange: number;
  medianRentZestimate: number;
  priceToRentRatio: number;
  sampleProperties: Array<{
    address: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    homeType: string;
  }>;
  dataSource: 'zillow_api' | 'fallback_estimates';
  lastUpdated: string;
}

export interface PropertyValuation {
  address: string;
  zestimate: number;
  rentZestimate: number;
  pricePerSqFt: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  homeType: string;
  taxAssessment: number;
  dataSource: 'zillow_api' | 'fallback_estimates';
  lastUpdated: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const ATLANTA_METRO_FALLBACKS: Record<string, { medianHome: number; yoyChange: number; medianRent: number }> = {
  'atlanta': { medianHome: 395000, yoyChange: 0.034, medianRent: 1850 },
  'alpharetta': { medianHome: 575000, yoyChange: 0.042, medianRent: 2200 },
  'roswell': { medianHome: 490000, yoyChange: 0.038, medianRent: 2100 },
  'milton': { medianHome: 725000, yoyChange: 0.045, medianRent: 2800 },
  'austell': { medianHome: 265000, yoyChange: 0.052, medianRent: 1550 },
  'college park': { medianHome: 225000, yoyChange: 0.058, medianRent: 1400 },
  'east point': { medianHome: 275000, yoyChange: 0.055, medianRent: 1500 },
  'union city': { medianHome: 250000, yoyChange: 0.048, medianRent: 1450 },
  'fairburn': { medianHome: 310000, yoyChange: 0.044, medianRent: 1600 },
  'fayetteville': { medianHome: 365000, yoyChange: 0.036, medianRent: 1750 },
  'palmetto': { medianHome: 280000, yoyChange: 0.040, medianRent: 1500 },
  'lithia springs': { medianHome: 275000, yoyChange: 0.050, medianRent: 1500 },
  'evans': { medianHome: 320000, yoyChange: 0.032, medianRent: 1600 },
  'swainsboro': { medianHome: 145000, yoyChange: 0.028, medianRent: 950 },
  'norman park': { medianHome: 130000, yoyChange: 0.025, medianRent: 850 },
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export class ZillowHomeDataService {
  private static instance: ZillowHomeDataService;
  private marketCache = new Map<string, CacheEntry<HomePriceMarketData>>();
  private propertyCache = new Map<string, CacheEntry<PropertyValuation>>();
  private apiKey: string | null;
  private apiHost: string;

  private constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || null;
    this.apiHost = 'zillow-com1.p.rapidapi.com';
  }

  static getInstance(): ZillowHomeDataService {
    if (!ZillowHomeDataService.instance) {
      ZillowHomeDataService.instance = new ZillowHomeDataService();
    }
    return ZillowHomeDataService.instance;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async getMarketData(city: string, state: string = 'GA'): Promise<HomePriceMarketData> {
    const cacheKey = `${city.toLowerCase()}_${state.toLowerCase()}`;
    const cached = this.marketCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    let data: HomePriceMarketData;

    if (this.apiKey) {
      try {
        data = await this.fetchMarketDataFromApi(city, state);
      } catch (error) {
        console.error(`Zillow API error for ${city}, ${state}:`, error);
        data = this.getFallbackMarketData(city, state);
      }
    } else {
      data = this.getFallbackMarketData(city, state);
    }

    this.marketCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getPropertyValuation(address: string, city: string, state: string = 'GA'): Promise<PropertyValuation> {
    const cacheKey = `${address.toLowerCase()}_${city.toLowerCase()}`;
    const cached = this.propertyCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    let data: PropertyValuation;

    if (this.apiKey) {
      try {
        data = await this.fetchPropertyFromApi(address, city, state);
      } catch (error) {
        console.error(`Zillow property API error for ${address}:`, error);
        data = this.getFallbackPropertyValuation(address, city, state);
      }
    } else {
      data = this.getFallbackPropertyValuation(address, city, state);
    }

    this.propertyCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  private async fetchMarketDataFromApi(city: string, state: string): Promise<HomePriceMarketData> {
    const searchUrl = `https://${this.apiHost}/propertyExtendedSearch?location=${encodeURIComponent(city + ', ' + state)}&status_type=ForSale&home_type=Houses,Condos,Townhomes&sort=Newest&page=1`;

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': this.apiKey!,
        'x-rapidapi-host': this.apiHost,
      },
    });

    if (!response.ok) {
      throw new Error(`Zillow API returned ${response.status}: ${response.statusText}`);
    }

    const json = await response.json() as any;
    const props = json.props || [];

    if (props.length === 0) {
      return this.getFallbackMarketData(city, state);
    }

    const prices = props
      .map((p: any) => p.price)
      .filter((p: number) => p && p > 50000 && p < 5000000)
      .sort((a: number, b: number) => a - b);

    const sqftPrices = props
      .filter((p: any) => p.price && p.livingArea && p.livingArea > 0)
      .map((p: any) => p.price / p.livingArea);

    const daysOnMarket = props
      .map((p: any) => p.daysOnZillow)
      .filter((d: number) => d != null && d >= 0);

    const rentEstimates = props
      .map((p: any) => p.rentZestimate)
      .filter((r: number) => r && r > 200 && r < 15000);

    const medianPrice = prices.length > 0 ? prices[Math.floor(prices.length / 2)] : 0;
    const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length) : 0;
    const medianSqFtPrice = sqftPrices.length > 0 ? Math.round(sqftPrices[Math.floor(sqftPrices.length / 2)]) : 0;
    const medianDOM = daysOnMarket.length > 0 ? daysOnMarket[Math.floor(daysOnMarket.length / 2)] : 0;
    const medianRentZ = rentEstimates.length > 0 ? rentEstimates[Math.floor(rentEstimates.length / 2)] : 0;

    const fallback = ATLANTA_METRO_FALLBACKS[city.toLowerCase()];
    const yoyChange = fallback?.yoyChange || 0.035;

    const sampleProperties = props.slice(0, 5).map((p: any) => ({
      address: p.address || 'Unknown',
      price: p.price || 0,
      bedrooms: p.bedrooms || 0,
      bathrooms: p.bathrooms || 0,
      sqft: p.livingArea || 0,
      homeType: p.propertyType || p.homeType || 'Unknown',
    }));

    return {
      city,
      state,
      medianHomePrice: medianPrice,
      medianPricePerSqFt: medianSqFtPrice,
      avgHomePrice: avgPrice,
      minPrice: prices[0] || 0,
      maxPrice: prices[prices.length - 1] || 0,
      totalListings: props.length,
      medianDaysOnMarket: medianDOM,
      priceRange: { min: prices[0] || 0, max: prices[prices.length - 1] || 0 },
      yearOverYearChange: yoyChange,
      medianRentZestimate: medianRentZ,
      priceToRentRatio: medianRentZ > 0 ? Math.round((medianPrice / (medianRentZ * 12)) * 10) / 10 : 0,
      sampleProperties,
      dataSource: 'zillow_api',
      lastUpdated: new Date().toISOString(),
    };
  }

  private async fetchPropertyFromApi(address: string, city: string, state: string): Promise<PropertyValuation> {
    const fullAddress = `${address}, ${city}, ${state}`;
    const searchUrl = `https://${this.apiHost}/propertyByAddress?address=${encodeURIComponent(fullAddress)}`;

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': this.apiKey!,
        'x-rapidapi-host': this.apiHost,
      },
    });

    if (!response.ok) {
      throw new Error(`Zillow property API returned ${response.status}`);
    }

    const data = await response.json() as any;

    return {
      address: fullAddress,
      zestimate: data.zestimate || data.price || 0,
      rentZestimate: data.rentZestimate || 0,
      pricePerSqFt: data.resoFacts?.pricePerSquareFoot || (data.price && data.livingArea ? Math.round(data.price / data.livingArea) : 0),
      bedrooms: data.bedrooms || 0,
      bathrooms: data.bathrooms || 0,
      sqft: data.livingArea || 0,
      yearBuilt: data.yearBuilt || 0,
      homeType: data.homeType || 'Unknown',
      taxAssessment: data.taxAssessedValue || 0,
      dataSource: 'zillow_api',
      lastUpdated: new Date().toISOString(),
    };
  }

  private getFallbackMarketData(city: string, state: string): HomePriceMarketData {
    const fallback = ATLANTA_METRO_FALLBACKS[city.toLowerCase()] || {
      medianHome: 320000,
      yoyChange: 0.035,
      medianRent: 1600,
    };

    const priceVariation = 0.3;
    const minPrice = Math.round(fallback.medianHome * (1 - priceVariation));
    const maxPrice = Math.round(fallback.medianHome * (1 + priceVariation));

    return {
      city,
      state,
      medianHomePrice: fallback.medianHome,
      medianPricePerSqFt: Math.round(fallback.medianHome / 1800),
      avgHomePrice: Math.round(fallback.medianHome * 1.05),
      minPrice,
      maxPrice,
      totalListings: 0,
      medianDaysOnMarket: 28,
      priceRange: { min: minPrice, max: maxPrice },
      yearOverYearChange: fallback.yoyChange,
      medianRentZestimate: fallback.medianRent,
      priceToRentRatio: Math.round((fallback.medianHome / (fallback.medianRent * 12)) * 10) / 10,
      sampleProperties: [],
      dataSource: 'fallback_estimates',
      lastUpdated: new Date().toISOString(),
    };
  }

  private getFallbackPropertyValuation(address: string, city: string, state: string): PropertyValuation {
    const fallback = ATLANTA_METRO_FALLBACKS[city.toLowerCase()] || {
      medianHome: 320000,
      yoyChange: 0.035,
      medianRent: 1600,
    };

    return {
      address: `${address}, ${city}, ${state}`,
      zestimate: fallback.medianHome,
      rentZestimate: fallback.medianRent,
      pricePerSqFt: Math.round(fallback.medianHome / 1800),
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1800,
      yearBuilt: 2005,
      homeType: 'SingleFamily',
      taxAssessment: Math.round(fallback.medianHome * 0.85),
      dataSource: 'fallback_estimates',
      lastUpdated: new Date().toISOString(),
    };
  }
}
