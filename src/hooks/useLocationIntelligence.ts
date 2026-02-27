import { useState, useEffect, useCallback } from 'react';
import { mockProperties } from '@/data/mockData';
import { toast } from 'sonner';

export interface PointOfInterest {
  id: string;
  name: string;
  address: string;
  category: 'work' | 'gym' | 'school' | 'shopping' | 'custom';
  priority: 'high' | 'medium' | 'low';
  coordinates: { lat: number; lng: number };
  maxTime: number;
  transportMode: 'driving' | 'transit' | 'walking' | 'biking';
}

export interface SmartProperty {
  id: string;
  name: string;
  address: string;
  price: number;
  aiMatchScore: number;
  locationScore: number;
  combinedScore: number;
  budgetMatch: boolean;
  amenityMatch: boolean;
  lifestyleMatch: boolean;
  isTopPick: boolean;
  savings?: number; // monthly savings compared to market average
  poiTimes: Array<{
    poiId: string;
    poiName: string;
    time: number;
    color: 'green' | 'yellow' | 'red';
  }>;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  images: string[];
  features: string[];
  coordinates: { lat: number; lng: number };
}

export const useLocationIntelligence = (userProfile: Record<string, unknown> | null) => {
  const [pointsOfInterest, setPointsOfInterest] = useState<PointOfInterest[]>([]);
  const [smartResults, setSmartResults] = useState<SmartProperty[]>([]);
  const [loading, setLoading] = useState(false);

  // Load POIs from user profile
  useEffect(() => {
    const raw = userProfile && userProfile['points_of_interest'];
    const poisArr = Array.isArray(raw) ? raw : [];

    const formattedPOIs: PointOfInterest[] = poisArr.map((poiRaw) => {
      const poi = poiRaw as Record<string, unknown>;
      const coords = poi['coordinates'] as Record<string, unknown> | undefined;
      const hasCoords = coords && typeof coords['lat'] === 'number' && typeof coords['lng'] === 'number';
      const category = typeof poi['category'] === 'string' ? poi['category'] as PointOfInterest['category'] : 'custom';
      const priority = typeof poi['priority'] === 'string' ? poi['priority'] as PointOfInterest['priority'] : 'medium';
      const transport = typeof poi['transportMode'] === 'string' ? poi['transportMode'] as PointOfInterest['transportMode'] : 'driving';

      return {
        id: (typeof poi['id'] === 'string' ? poi['id'] as string : Date.now().toString()),
        name: typeof poi['name'] === 'string' ? poi['name'] as string : '',
        address: typeof poi['address'] === 'string' ? poi['address'] as string : '',
        category,
        priority,
        coordinates: hasCoords ? { lat: coords!['lat'] as number, lng: coords!['lng'] as number } : { lat: 30.2672, lng: -97.7431 },
        maxTime: typeof poi['maxTime'] === 'number' ? poi['maxTime'] as number : 30,
        transportMode: transport
      };
    });

    setPointsOfInterest(formattedPOIs);
  }, [userProfile]);

  // Calculate combined scores and generate smart results
  const calculateLocationScore = useCallback((property: { coordinates: { lat: number; lng: number } }, pois: PointOfInterest[]) => {
    if (pois.length === 0) return 85; // Default score if no POIs

    let totalScore = 0;
    let weightSum = 0;
    
    pois.forEach(poi => {
      const distance = calculateDistance(property.coordinates, poi.coordinates);
      const time = distance * 2.5; // Rough time estimate
      
      // Score based on proximity to POI max time
      const proximityScore = Math.max(0, 100 - (time / poi.maxTime) * 50);
      
      // Weight by priority
      const weight = poi.priority === 'high' ? 3 : poi.priority === 'medium' ? 2 : 1;
      
      totalScore += proximityScore * weight;
      weightSum += weight;
    });
    
    return Math.round(totalScore / weightSum);
  }, []);

  const calculateAIScore = useCallback((property: { effectivePrice?: number; amenities?: string[] }, profile: Record<string, unknown> | null) => {
    // Budget score
    const budget = (profile && typeof profile['budget'] === 'number') ? profile['budget'] as number : 2500;
    const effective = property.effectivePrice ?? 0;
    const budgetScore = effective <= budget ? 
      100 - ((effective / budget - 0.8) * 100) : 
      Math.max(0, 100 - ((effective - budget) / budget) * 100);

    // Amenity score
    const userAmenities = Array.isArray(profile?.['amenities']) ? profile?.['amenities'] as string[] : [];
    const propertyAmenities = Array.isArray(property.amenities) ? property.amenities : [];
    const amenityMatches = userAmenities.filter((a) => 
      propertyAmenities.some((pa) => pa.toLowerCase().includes((a as string).toLowerCase()))
    ).length;
    const amenityScore = userAmenities.length > 0 ? 
      (amenityMatches / userAmenities.length) * 100 : 85;

    // Lifestyle score (simplified)
    const lifestyleScore = 75; // Base score, could be enhanced with more data

    return {
      budgetScore: Math.round(Math.max(0, Math.min(100, budgetScore))),
      amenityScore: Math.round(amenityScore),
      lifestyleScore
    };
  }, []);

  const generateSmartResults = useCallback(() => {
    setLoading(true);
    
    const results: SmartProperty[] = mockProperties.map((property) => {
      // Calculate location score based on POI proximity
      const locationScore = calculateLocationScore(property, pointsOfInterest);
      
      // Calculate AI preference score
      const aiScore = calculateAIScore(property, userProfile);
      
      // Combine scores with weights
      const combinedScore = Math.round(
        (locationScore * 0.35) + // Location/Commute: 35%
        (aiScore.budgetScore * 0.25) + // Budget: 25%
        (aiScore.lifestyleScore * 0.20) + // Lifestyle: 20%
        (aiScore.amenityScore * 0.20) // Amenities: 20%
      );

      // Calculate POI drive times
      const poiTimes = pointsOfInterest.map(poi => {
        const distance = calculateDistance(property.coordinates, poi.coordinates);
        const time = Math.round(distance * 2.5 * 10) / 10;
        const color = time <= poi.maxTime * 0.7 ? 'green' : 
                     time <= poi.maxTime ? 'yellow' : 'red';
        
        return {
          poiId: poi.id,
          poiName: poi.name,
          time,
          color: color as 'green' | 'yellow' | 'red'
        };
      });

      return {
        id: property.id,
        name: property.name,
        address: property.address,
        price: property.effectivePrice,
        aiMatchScore: Math.round((aiScore.budgetScore + aiScore.lifestyleScore + aiScore.amenityScore) / 3),
        locationScore,
        combinedScore,
        budgetMatch: aiScore.budgetScore >= 80,
        amenityMatch: aiScore.amenityScore >= 70,
        lifestyleMatch: aiScore.lifestyleScore >= 70,
        isTopPick: combinedScore >= 90,
        savings: property.id === '3' ? 545 : // South Lamar Residences: $345 AI + $200 concessions
                 property.id === '1' ? 883 : // Mosaic Lake: $683 AI + $200 concessions  
                 property.id === '2' ? 400 : // East Austin Lofts: $200 AI + $200 concessions
                 property.savings + 200, // Default: AI savings + estimated concessions
        poiTimes,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        sqft: property.sqft,
        images: property.images,
        features: property.features,
        coordinates: property.coordinates
      };
    });

    // Sort by combined score
    results.sort((a, b) => b.combinedScore - a.combinedScore);
    
    setSmartResults(results);
    setLoading(false);
  }, [pointsOfInterest, userProfile, calculateLocationScore, calculateAIScore]);

  useEffect(() => {
    generateSmartResults();
  }, [generateSmartResults]);

  // (older un-typed helpers removed — using the typed, memoized versions above)

  const calculateDistance = (coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const addPOI = async (poi: Omit<PointOfInterest, 'id'>) => {
    const hasValidCoords = poi.coordinates && poi.coordinates.lat !== 0 && poi.coordinates.lng !== 0;
    const newPOI: PointOfInterest = {
      ...poi,
      id: Date.now().toString(),
      coordinates: hasValidCoords ? poi.coordinates : { lat: 30.2672 + Math.random() * 0.1, lng: -97.7431 + Math.random() * 0.1 }
    };
    
    setPointsOfInterest(prev => [...prev, newPOI]);
    toast.success(`Added ${poi.name} to your points of interest`);
  };

  const removePOI = async (id: string) => {
    setPointsOfInterest(prev => prev.filter(poi => poi.id !== id));
    toast.success('Point of interest removed');
  };

  const updatePOIPriority = async (id: string, priority: 'high' | 'medium' | 'low') => {
    setPointsOfInterest(prev => 
      prev.map(poi => poi.id === id ? { ...poi, priority } : poi)
    );
  };

  const getAIPreferencesCount = () => {
    let count = 0;
    if (userProfile && typeof userProfile['budget'] !== 'undefined') count++;
    if (userProfile && Array.isArray(userProfile['amenities']) && userProfile['amenities'].length > 0) count++;
    if (userProfile && typeof userProfile['lifestyle'] !== 'undefined') count++;
    if (userProfile && Array.isArray(userProfile['priorities']) && userProfile['priorities'].length > 0) count++;
    if (userProfile && Array.isArray(userProfile['deal_breakers']) && userProfile['deal_breakers'].length > 0) count++;
    return count;
  };

  const getCombinedScore = (propertyId: string) => {
    const result = smartResults.find(r => r.id === propertyId);
    return result?.combinedScore || 0;
  };

  return {
    pointsOfInterest,
    smartResults,
    loading,
    addPOI,
    removePOI,
    updatePOIPriority,
    getAIPreferencesCount,
    getCombinedScore
  };
};