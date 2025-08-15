import { useState, useEffect, useCallback } from 'react';
import { UnifiedRentalIntelligenceEngine, type UnifiedRentalIntelligence } from '@/lib/unified-rental-intelligence';

export const useUnifiedRentalIntelligence = (
  location: string,
  currentRent: number,
  propertyValue: number
) => {
  const [intelligence, setIntelligence] = useState<UnifiedRentalIntelligence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [engine] = useState(() => new UnifiedRentalIntelligenceEngine());

  const fetchIntelligence = useCallback(async () => {
    if (!location || !currentRent || !propertyValue) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`🧠 Generating unified intelligence for ${location}`);
      const result = await engine.getCompleteRentalIntelligence(location, currentRent, propertyValue);
      setIntelligence(result);
      console.log(`✅ Intelligence complete: ${result.combinedInsights.length} insights, ${result.overallLeverageScore}/100 leverage`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Intelligence generation failed';
      console.error('Unified intelligence error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [location, currentRent, propertyValue, engine]);

  useEffect(() => {
    fetchIntelligence();
  }, [fetchIntelligence]);

  return {
    intelligence,
    loading,
    error,
    refresh: fetchIntelligence,
    leverageScore: intelligence?.overallLeverageScore || 0,
    recommendation: intelligence?.recommendation || null,
    insights: intelligence?.combinedInsights || [],
    dataStatus: intelligence?.dataStatus || null
  };
};