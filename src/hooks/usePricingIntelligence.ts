import { useState, useEffect, useCallback } from 'react';
import { 
  PricingEngine, 
  PortfolioAnalyzer,
  type PricingRecommendation, 
  type ApartmentIQData,
  type PortfolioImpactSummary 
} from '@/lib/pricing-engine';

interface Property {
  id: string;
  apartmentIQData?: ApartmentIQData;
  // Legacy support
  price?: number;
  daysOnMarket?: number;
  marketVelocity?: 'hot' | 'normal' | 'slow' | 'stale';
  concessionUrgency?: 'none' | 'standard' | 'aggressive' | 'desperate';
}

export const usePricingIntelligence = (properties: Property[]) => {
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
        if (property.apartmentIQData) {
          // Use comprehensive ApartmentIQ data
          const recommendation = engine.generateRecommendation(property.apartmentIQData);
          newRecommendations[property.id] = recommendation;
        } else if (property.price && property.daysOnMarket !== undefined && property.marketVelocity) {
          // Fallback to legacy data structure
          const legacyData: ApartmentIQData = {
            unitId: property.id,
            propertyName: 'Unknown Property',
            unitNumber: 'Unknown',
            address: 'Unknown Address',
            zipCode: 'Unknown',
            currentRent: property.price,
            originalRent: property.price,
            effectiveRent: property.price,
            rentPerSqft: 0,
            bedrooms: 1,
            bathrooms: 1,
            sqft: 800,
            floor: 1,
            floorPlan: 'Unknown',
            daysOnMarket: property.daysOnMarket,
            firstSeen: new Date().toISOString(),
            marketVelocity: property.marketVelocity,
            concessionValue: 0,
            concessionType: 'none',
            concessionUrgency: property.concessionUrgency || 'none',
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