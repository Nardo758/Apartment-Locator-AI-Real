import { useQuery } from "@tanstack/react-query";

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
  dataSource: "zillow_api" | "fallback_estimates";
  lastUpdated: string;
  apiConfigured: boolean;
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
  dataSource: "zillow_api" | "fallback_estimates";
  lastUpdated: string;
  apiConfigured: boolean;
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
  dataSource: "zillow_api" | "fallback_estimates";
  lastUpdated: string;
  apiConfigured: boolean;
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
  dataSource: "zillow_api" | "fallback_estimates";
  lastUpdated: string;
  apiConfigured: boolean;
}

export function useHomePriceData(city: string | undefined, state: string = "GA") {
  const url = city
    ? `/api/home-prices/market?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`
    : "";

  return useQuery<HomePriceMarketData>({
    queryKey: [url],
    enabled: !!city,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

export function usePropertyValuation(address: string | undefined, city: string | undefined, state: string = "GA") {
  const url = address && city
    ? `/api/home-prices/property?address=${encodeURIComponent(address)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`
    : "";

  return useQuery<PropertyValuation>({
    queryKey: [url],
    enabled: !!address && !!city,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

export function useMarketAnalytics(city: string | undefined, state: string = "GA") {
  const url = city
    ? `/api/home-prices/analytics?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`
    : "";

  return useQuery<MarketAnalytics>({
    queryKey: [url],
    enabled: !!city,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

export function useZillowRentals(
  city: string | undefined,
  state: string = "GA",
  filters?: {
    price_min?: number;
    price_max?: number;
    beds_min?: number;
    beds_max?: number;
    sort?: string;
    page?: number;
  }
) {
  const params = new URLSearchParams();
  if (city) params.set("city", city);
  params.set("state", state);
  if (filters?.price_min) params.set("price_min", String(filters.price_min));
  if (filters?.price_max) params.set("price_max", String(filters.price_max));
  if (filters?.beds_min) params.set("beds_min", String(filters.beds_min));
  if (filters?.beds_max) params.set("beds_max", String(filters.beds_max));
  if (filters?.sort) params.set("sort", filters.sort);
  if (filters?.page) params.set("page", String(filters.page));

  const url = city ? `/api/home-prices/rentals?${params.toString()}` : "";

  return useQuery<RentalSearchResult>({
    queryKey: [url],
    enabled: !!city,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
