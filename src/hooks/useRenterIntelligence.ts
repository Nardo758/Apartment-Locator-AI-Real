import { useState, useEffect, useCallback, useMemo } from 'react';
import { RenterIntelligenceEngine, type RenterDealIntelligence, type RenterMarketSummary } from '@/lib/renter-intelligence';
import { type ApartmentIQData, PricingEngine } from '@/lib/pricing-engine';

interface Property {
  id: string;
  apartmentIQData?: ApartmentIQData;
}

export const useRenterIntelligence = (properties: Property[]) => {
  const [dealIntelligence, setDealIntelligence] = useState<Record<string, RenterDealIntelligence>>({});
  const [marketSummary, setMarketSummary] = useState<RenterMarketSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [renterEngine] = useState(() => new RenterIntelligenceEngine());
  const [pricingEngine] = useState(() => new PricingEngine());

  const generateRenterIntelligence = useCallback(async () => {
    if (!properties.length) return;

    setLoading(true);
    setError(null);

    try {
      const newDealIntelligence: Record<string, RenterDealIntelligence> = {};
      const dealIntelligenceArray: RenterDealIntelligence[] = [];

      for (const property of properties) {
        if (property.apartmentIQData) {
          // Generate pricing recommendation first
          const pricingRec = pricingEngine.generateRecommendation(property.apartmentIQData);
          
          // Transform to renter intelligence
          const dealIntel = renterEngine.transformToRenterIntelligence(
            property.apartmentIQData, 
            pricingRec
          );
          
          newDealIntelligence[property.id] = dealIntel;
          dealIntelligenceArray.push(dealIntel);
        }
      }

      // Generate market summary
      const summary = renterEngine.generateMarketSummary(dealIntelligenceArray);
      
      setDealIntelligence(newDealIntelligence);
      setMarketSummary(summary);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate renter intelligence';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [properties, renterEngine, pricingEngine]);

  useEffect(() => {
    generateRenterIntelligence();
  }, [generateRenterIntelligence]);

  // Memoized derived data
  const sortedByDealScore = useMemo(() => {
    return Object.entries(dealIntelligence)
      .sort(([, a], [, b]) => b.dealScore - a.dealScore)
      .map(([id]) => id);
  }, [dealIntelligence]);

  const greatDeals = useMemo(() => {
    return Object.entries(dealIntelligence)
      .filter(([, deal]) => deal.dealLevel === 'great_deal')
      .map(([id]) => id);
  }, [dealIntelligence]);

  const highNegotiationPotential = useMemo(() => {
    return Object.entries(dealIntelligence)
      .filter(([, deal]) => deal.negotiationPotential === 'high')
      .map(([id]) => id);
  }, [dealIntelligence]);

  const immediateOpportunities = useMemo(() => {
    return Object.entries(dealIntelligence)
      .filter(([, deal]) => deal.timing.advice === 'negotiate_now' && deal.dealLevel !== 'hot_market')
      .map(([id]) => id);
  }, [dealIntelligence]);

  return {
    dealIntelligence,
    marketSummary,
    loading,
    error,
    refresh: generateRenterIntelligence,
    
    // Helper functions
    getDealIntelligence: (propertyId: string) => dealIntelligence[propertyId],
    
    // Sorted and filtered lists
    sortedByDealScore,
    greatDeals,
    highNegotiationPotential,
    immediateOpportunities,
    
    // Summary stats
    getTotalPotentialSavings: () => {
      return Object.values(dealIntelligence).reduce(
        (sum, deal) => sum + deal.potentialSavings.annualSavings, 0
      );
    },
    
    getAverageDealScore: () => {
      const deals = Object.values(dealIntelligence);
      if (deals.length === 0) return 0;
      return deals.reduce((sum, deal) => sum + deal.dealScore, 0) / deals.length;
    },
    
    getDealLevelCounts: () => {
      const counts = { great_deal: 0, good_deal: 0, fair_deal: 0, hot_market: 0 };
      Object.values(dealIntelligence).forEach(deal => {
        counts[deal.dealLevel]++;
      });
      return counts;
    }
  };
};