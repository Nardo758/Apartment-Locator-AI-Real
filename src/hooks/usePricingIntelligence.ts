import { useState, useEffect, useCallback } from 'react';
import { PricingEngine, type PricingRecommendation, type ApartmentIQData } from '@/lib/pricing-engine';

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
    loading,
    error,
    refresh: generateRecommendations,
    getRecommendation: (propertyId: string) => recommendations[propertyId],
    getTotalImpact: () => Object.values(recommendations).reduce(
      (sum, rec) => sum + rec.revenueImpact.totalImpact, 0
    ),
    getUrgentProperties: () => Object.entries(recommendations)
      .filter(([, rec]) => rec.urgencyLevel === 'immediate')
      .map(([id]) => id),
    getStrategyDistribution: () => {
      const distribution: Record<string, number> = {};
      Object.values(recommendations).forEach(rec => {
        distribution[rec.strategy] = (distribution[rec.strategy] || 0) + 1;
      });
      return distribution;
    },
    getAverageConfidence: () => {
      const recommendations_array = Object.values(recommendations);
      if (recommendations_array.length === 0) return 0;
      return recommendations_array.reduce((sum, rec) => sum + rec.confidenceScore, 0) / recommendations_array.length;
    }
  };
};