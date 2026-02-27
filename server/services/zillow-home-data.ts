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

export interface MarketAnalytics {
  city: string;
  state: string;
  zhvi: number;
  zhviYoy: number;
  zori: number;
  medianSalePrice: number;
  saleToListRatio: number;
  percentSoldAboveList: number;
  percentSoldBelowList: number;
  daysToPending: number;
  inventoryCount: number;
  forecastData: any;
  historicalTimeSeries: Array<{ date: string; value: number; type: string }>;
  dataSource: 'zillow_api' | 'fallback_estimates';
  lastUpdated: string;
}

export interface ZillowRentalListing {
  zpid: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  homeType: string;
  daysOnZillow: number;
  latitude: number;
  longitude: number;
  photos: string[];
  rentZestimate: number;
  listingUrl: string;
}

export interface RentalSearchResult {
  listings: ZillowRentalListing[];
  totalCount: number;
  page: number;
  city: string;
  state: string;
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

const MARKET_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const SEARCH_CACHE_TTL_MS = 15 * 60 * 1000;

export class ZillowHomeDataService {
  private static instance: ZillowHomeDataService;
  private marketCache = new Map<string, CacheEntry<HomePriceMarketData>>();
  private propertyCache = new Map<string, CacheEntry<PropertyValuation>>();
  private analyticsCache = new Map<string, CacheEntry<MarketAnalytics>>();
  private rentalCache = new Map<string, CacheEntry<RentalSearchResult>>();
  private apiKey: string | null;
  private apiHost = 'zillow-real-estate-api.p.rapidapi.com';
  private baseUrl = 'https://zillow-real-estate-api.p.rapidapi.com/v1';

  private constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || null;
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

  private getHeaders(): Record<string, string> {
    return {
      'x-rapidapi-key': this.apiKey!,
      'x-rapidapi-host': this.apiHost,
    };
  }

  async getMarketData(city: string, state: string = 'GA'): Promise<HomePriceMarketData> {
    const cacheKey = `market_${city.toLowerCase()}_${state.toLowerCase()}`;
    const cached = this.marketCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < MARKET_CACHE_TTL_MS) {
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
    const cacheKey = `prop_${address.toLowerCase()}_${city.toLowerCase()}`;
    const cached = this.propertyCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < MARKET_CACHE_TTL_MS) {
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

  async getMarketAnalytics(city: string, state: string = 'GA'): Promise<MarketAnalytics> {
    const cacheKey = `analytics_${city.toLowerCase()}_${state.toLowerCase()}`;
    const cached = this.analyticsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < MARKET_CACHE_TTL_MS) {
      return cached.data;
    }

    let data: MarketAnalytics;

    if (this.apiKey) {
      try {
        data = await this.fetchMarketAnalyticsFromApi(city, state);
      } catch (error) {
        console.error(`Zillow analytics API error for ${city}, ${state}:`, error);
        data = this.getFallbackAnalytics(city, state);
      }
    } else {
      data = this.getFallbackAnalytics(city, state);
    }

    this.analyticsCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async searchRentals(
    city: string,
    state: string = 'GA',
    filters?: {
      price_min?: number;
      price_max?: number;
      beds_min?: number;
      beds_max?: number;
      sort?: string;
      page?: number;
    }
  ): Promise<RentalSearchResult> {
    const filterKey = JSON.stringify(filters || {});
    const cacheKey = `rentals_${city.toLowerCase()}_${state.toLowerCase()}_${filterKey}`;
    const cached = this.rentalCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_TTL_MS) {
      return cached.data;
    }

    let data: RentalSearchResult;

    if (this.apiKey) {
      try {
        data = await this.fetchRentalsFromApi(city, state, filters);
      } catch (error) {
        console.error(`Zillow rentals API error for ${city}, ${state}:`, error);
        data = this.getFallbackRentals(city, state);
      }
    } else {
      data = this.getFallbackRentals(city, state);
    }

    this.rentalCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  private async fetchMarketDataFromApi(city: string, state: string): Promise<HomePriceMarketData> {
    const location = encodeURIComponent(`${city}, ${state}`);
    const marketUrl = `${this.baseUrl}/market?location=${location}`;

    const response = await fetch(marketUrl, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Zillow market API returned ${response.status}: ${response.statusText} - ${errorBody}`);
    }

    const json = await response.json() as any;

    if (!json.success || !json.data) {
      throw new Error(`Zillow market API returned unsuccessful: ${json.error?.message || 'Unknown error'}`);
    }

    const data = json.data;
    const homeValues = data.home_values || {};
    const rental = data.rental || {};
    const salesMetrics = data.sales_metrics || {};
    const inventory = data.inventory || {};

    const zhvi = homeValues.zhvi || 0;
    const zhviYoy = homeValues.zhvi_yoy || 0;
    const zori = rental.zori || 0;
    const medianSalePrice = salesMetrics.median_sale_price || zhvi;
    const daysToPending = salesMetrics.days_to_pending || salesMetrics.median_days_to_pending || 0;
    const inventoryCount = inventory.total || inventory.count || 0;

    const fallback = ATLANTA_METRO_FALLBACKS[city.toLowerCase()];
    const medianRent = zori > 0 ? zori : (fallback?.medianRent || 1600);
    const medianHome = zhvi > 0 ? zhvi : (medianSalePrice > 0 ? medianSalePrice : (fallback?.medianHome || 320000));
    const yoyChange = zhviYoy !== 0 ? zhviYoy : (fallback?.yoyChange || 0.035);

    return {
      city,
      state,
      medianHomePrice: medianHome,
      medianPricePerSqFt: homeValues.zhvi_per_sqft || Math.round(medianHome / 1800),
      avgHomePrice: Math.round(medianHome * 1.05),
      minPrice: Math.round(medianHome * 0.4),
      maxPrice: Math.round(medianHome * 2.5),
      totalListings: inventoryCount,
      medianDaysOnMarket: daysToPending,
      priceRange: { min: Math.round(medianHome * 0.4), max: Math.round(medianHome * 2.5) },
      yearOverYearChange: yoyChange,
      medianRentZestimate: medianRent,
      priceToRentRatio: medianRent > 0 ? Math.round((medianHome / (medianRent * 12)) * 10) / 10 : 0,
      sampleProperties: [],
      dataSource: 'zillow_api',
      lastUpdated: new Date().toISOString(),
    };
  }

  private async fetchPropertyFromApi(address: string, city: string, state: string): Promise<PropertyValuation> {
    const fullAddress = `${address}, ${city}, ${state}`;
    const lookupUrl = `${this.baseUrl}/property/lookup?address=${encodeURIComponent(fullAddress)}&include=photos,schools,history`;

    const response = await fetch(lookupUrl, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Zillow property lookup API returned ${response.status}`);
    }

    const json = await response.json() as any;

    if (!json.success || !json.data) {
      throw new Error(`Zillow property lookup unsuccessful: ${json.error?.message || 'Unknown error'}`);
    }

    const p = json.data;
    const financials = p.financials || {};

    return {
      address: fullAddress,
      zestimate: financials.zestimate || p.price || 0,
      rentZestimate: financials.rent_zestimate || 0,
      pricePerSqFt: p.price && p.sqft ? Math.round(p.price / p.sqft) : 0,
      bedrooms: p.beds || p.bedrooms || 0,
      bathrooms: p.baths || p.bathrooms || 0,
      sqft: p.sqft || p.living_area || 0,
      yearBuilt: p.year_built || 0,
      homeType: p.home_type || 'Unknown',
      taxAssessment: financials.tax_assessed_value || 0,
      dataSource: 'zillow_api',
      lastUpdated: new Date().toISOString(),
    };
  }

  private async fetchMarketAnalyticsFromApi(city: string, state: string): Promise<MarketAnalytics> {
    const location = encodeURIComponent(`${city}, ${state}`);
    const marketUrl = `${this.baseUrl}/market?location=${location}`;

    const response = await fetch(marketUrl, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Zillow market analytics API returned ${response.status}`);
    }

    const json = await response.json() as any;

    if (!json.success || !json.data) {
      throw new Error(`Zillow analytics unsuccessful: ${json.error?.message || 'Unknown error'}`);
    }

    const data = json.data;
    const homeValues = data.home_values || {};
    const rental = data.rental || {};
    const salesMetrics = data.sales_metrics || {};
    const inventory = data.inventory || {};

    const historicalTimeSeries: Array<{ date: string; value: number; type: string }> = [];

    if (homeValues.time_series && Array.isArray(homeValues.time_series)) {
      for (const point of homeValues.time_series) {
        historicalTimeSeries.push({
          date: point.date || point.period || '',
          value: point.value || point.zhvi || 0,
          type: 'zhvi',
        });
      }
    }

    if (rental.time_series && Array.isArray(rental.time_series)) {
      for (const point of rental.time_series) {
        historicalTimeSeries.push({
          date: point.date || point.period || '',
          value: point.value || point.zori || 0,
          type: 'zori',
        });
      }
    }

    return {
      city,
      state,
      zhvi: homeValues.zhvi || 0,
      zhviYoy: homeValues.zhvi_yoy || 0,
      zori: rental.zori || 0,
      medianSalePrice: salesMetrics.median_sale_price || 0,
      saleToListRatio: salesMetrics.sale_to_list_ratio || 0,
      percentSoldAboveList: salesMetrics.percent_sold_above_list || 0,
      percentSoldBelowList: salesMetrics.percent_sold_below_list || 0,
      daysToPending: salesMetrics.days_to_pending || salesMetrics.median_days_to_pending || 0,
      inventoryCount: inventory.total || inventory.count || 0,
      forecastData: data.forecast || null,
      historicalTimeSeries,
      dataSource: 'zillow_api',
      lastUpdated: new Date().toISOString(),
    };
  }

  private async fetchRentalsFromApi(
    city: string,
    state: string,
    filters?: {
      price_min?: number;
      price_max?: number;
      beds_min?: number;
      beds_max?: number;
      sort?: string;
      page?: number;
    }
  ): Promise<RentalSearchResult> {
    const params = new URLSearchParams({
      location: `${city}, ${state}`,
      status: 'for_rent',
    });

    if (filters?.price_min) params.set('price_min', String(filters.price_min));
    if (filters?.price_max) params.set('price_max', String(filters.price_max));
    if (filters?.beds_min) params.set('beds_min', String(filters.beds_min));
    if (filters?.beds_max) params.set('beds_max', String(filters.beds_max));
    if (filters?.sort) params.set('sort', filters.sort);
    if (filters?.page) params.set('page', String(filters.page));

    const searchUrl = `${this.baseUrl}/search?${params.toString()}`;

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Zillow rental search API returned ${response.status}`);
    }

    const json = await response.json() as any;

    if (!json.success || !json.data) {
      throw new Error(`Zillow rental search unsuccessful: ${json.error?.message || 'Unknown error'}`);
    }

    const results = json.data.results || [];
    const totalCount = json.data.total_count || results.length;

    const listings: ZillowRentalListing[] = results.map((r: any) => ({
      zpid: String(r.zpid || ''),
      address: r.address || '',
      city: r.city || city,
      state: r.state || state,
      zipcode: r.zipcode || r.zip || '',
      price: r.price || 0,
      bedrooms: r.beds || r.bedrooms || 0,
      bathrooms: r.baths || r.bathrooms || 0,
      sqft: r.sqft || r.living_area || 0,
      homeType: r.home_type || r.homeType || 'Unknown',
      daysOnZillow: r.days_on_zillow || 0,
      latitude: r.latitude || r.lat || 0,
      longitude: r.longitude || r.lng || 0,
      photos: r.photos?.map((p: any) => typeof p === 'string' ? p : p.url || p.href || '') || [],
      rentZestimate: r.rent_zestimate || r.zestimate || 0,
      listingUrl: r.zillow_url || r.url || '',
    }));

    return {
      listings,
      totalCount,
      page: filters?.page || 1,
      city,
      state,
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

  private getFallbackAnalytics(city: string, state: string): MarketAnalytics {
    const fallback = ATLANTA_METRO_FALLBACKS[city.toLowerCase()] || {
      medianHome: 320000,
      yoyChange: 0.035,
      medianRent: 1600,
    };

    return {
      city,
      state,
      zhvi: fallback.medianHome,
      zhviYoy: fallback.yoyChange,
      zori: fallback.medianRent,
      medianSalePrice: fallback.medianHome,
      saleToListRatio: 0.98,
      percentSoldAboveList: 35,
      percentSoldBelowList: 25,
      daysToPending: 28,
      inventoryCount: 0,
      forecastData: null,
      historicalTimeSeries: [],
      dataSource: 'fallback_estimates',
      lastUpdated: new Date().toISOString(),
    };
  }

  private getFallbackRentals(city: string, state: string): RentalSearchResult {
    return {
      listings: [],
      totalCount: 0,
      page: 1,
      city,
      state,
      dataSource: 'fallback_estimates',
      lastUpdated: new Date().toISOString(),
    };
  }
}
