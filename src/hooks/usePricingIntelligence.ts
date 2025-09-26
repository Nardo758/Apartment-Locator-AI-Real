import { useState, useEffect, useCallback } from 'react';
import { PricingEngine, PortfolioAnalyzer } from '@/lib/pricing-engine';
import type { PricingRecommendation, ApartmentIQData, PortfolioImpactSummary } from '@/lib/pricing-engine';
import type { Property as MockProperty } from '@/data/mockData';

function inferMarketVelocity(daysVacant?: number): 'hot' | 'normal' | 'slow' | 'stale' {
  if (!daysVacant) return 'normal';
  if (daysVacant <= 7) return 'hot';
  if (daysVacant <= 21) return 'normal';
  if (daysVacant <= 45) return 'slow';
  return 'stale';
}

export const usePricingIntelligence = (properties: MockProperty[]) => {
  const [recommendations, setRecommendations] = useState<Record<string, PricingRecommendation>>({});
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioImpactSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [engine] = useState(() => new PricingEngine());

  const generateRecommendations = useCallback(async () => {
    if (!properties.length) return;

    setLoading(true);
    setError(null);

    try {
      const newRecommendations: Record<string, PricingRecommendation> = {};
      
      for (const property of properties) {
        if (property.apartmentIQData && typeof property.apartmentIQData === 'object') {
          // Use comprehensive ApartmentIQ data (narrowed at runtime)
          const typed = property.apartmentIQData as ApartmentIQData;
          const recommendation = engine.generateRecommendation(typed);
          newRecommendations[property.id] = recommendation;
        } else if (property.aiPrice !== undefined && property.daysVacant !== undefined) {
          // Fallback to legacy data structure using MockProperty fields
          const legacyData: ApartmentIQData = {
            unitId: property.id,
            propertyName: property.name || 'Unknown Property',
            unitNumber: 'Unknown',
            address: property.address || 'Unknown Address',
            zipCode: property.zip || '00000',
            currentRent: property.aiPrice,
            originalRent: property.aiPrice,
            effectiveRent: property.effectivePrice ?? property.aiPrice,
            rentPerSqft: property.effectivePrice && property.sqft ? property.effectivePrice / property.sqft : 0,
            bedrooms: property.bedrooms || 1,
            bathrooms: property.bathrooms || 1,
            sqft: property.sqft || 800,
            floor: 1,
            floorPlan: 'Unknown',
            daysOnMarket: property.daysVacant,
            firstSeen: new Date().toISOString(),
            marketVelocity: inferMarketVelocity(property.daysVacant),
            concessionValue: 0,
            concessionType: 'none',
            concessionUrgency: 'none',
            rentTrend: 'stable',
            rentChangePercent: 0,
            concessionTrend: 'none',
            marketPosition: 'at_market',
            percentileRank: 50,
            amenityScore: 50,
            locationScore: 50,
            managementScore: 50,
            leaseProbability: 0.5,
            negotiationPotential: 5,
            urgencyScore: 5,
            dataFreshness: new Date().toISOString(),
            confidenceScore: 0.5
          };
          
          const recommendation = engine.generateRecommendation(legacyData);
          newRecommendations[property.id] = recommendation;
        }
      }
      
      setRecommendations(newRecommendations);
      
      // Generate portfolio analysis
      const recommendationsList = Object.values(newRecommendations);
      if (recommendationsList.length > 0) {
        const summary = PortfolioAnalyzer.analyzePortfolio(recommendationsList);
        setPortfolioSummary(summary);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate pricing recommendations';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [properties, engine]);

  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  return {
    recommendations,
    portfolioSummary,
    loading,
    error,
    refresh: generateRecommendations,
    getRecommendation: (propertyId: string) => recommendations[propertyId],
    getTotalImpact: () => portfolioSummary?.totalImpact || 0,
    getUrgentProperties: () => Object.entries(recommendations)
      .filter(([, rec]) => (rec as PricingRecommendation).urgencyLevel === 'immediate')
      .map(([id]) => id),
    getStrategyDistribution: () => portfolioSummary?.strategyDistribution || {},
    getUrgencyDistribution: () => portfolioSummary?.urgencyDistribution || {},
    getAverageConfidence: () => portfolioSummary?.averageConfidenceScore || 0,
    getPortfolioInsights: () => portfolioSummary 
      ? PortfolioAnalyzer.generatePortfolioInsights(portfolioSummary) 
      : [],
    getRecommendationsByUrgency: (urgency: 'immediate' | 'soon' | 'moderate' | 'low') => 
      Object.entries(recommendations)
        .filter(([, rec]) => (rec as PricingRecommendation).urgencyLevel === urgency)
        .map(([id, rec]) => ({ id, ...(rec as PricingRecommendation) })),
    getRecommendationsByStrategy: (strategy: 'aggressive_reduction' | 'moderate_reduction' | 'hold' | 'increase') => 
      Object.entries(recommendations)
        .filter(([, rec]) => (rec as PricingRecommendation).strategy === strategy)
        .map(([id, rec]) => ({ id, ...(rec as PricingRecommendation) })),
    getTotalVacancySavings: () => portfolioSummary?.totalVacancySavings || 0,
    getTotalNetBenefit: () => portfolioSummary?.totalNetBenefit || 0
  };
};