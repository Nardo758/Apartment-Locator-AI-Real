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
