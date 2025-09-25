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

export const useLocationIntelligence = (userProfile: any) => {
  const [pointsOfInterest, setPointsOfInterest] = useState<PointOfInterest[]>([]);
  const [smartResults, setSmartResults] = useState<SmartProperty[]>([]);
  const [loading, setLoading] = useState(false);

  // Load POIs from user profile
  useEffect(() => {
    if (userProfile?.points_of_interest) {
      const pois = Array.isArray(userProfile.points_of_interest) 
        ? userProfile.points_of_interest 
        : [];
      
      const formattedPOIs = pois.map((poi: any) => ({
        id: poi.id || Date.now().toString(),
        name: poi.name || '',
        address: poi.address || '',
        category: poi.category || 'custom',
        priority: poi.priority || 'medium',
        coordinates: poi.coordinates || { lat: 30.2672, lng: -97.7431 },
        maxTime: poi.maxTime || 30,
        transportMode: poi.transportMode || 'driving'
      }));
      
      setPointsOfInterest(formattedPOIs);
    }
  }, [userProfile]);

  // Calculate combined scores and generate smart results
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
        const time = Math.round(distance * 2.5); // Rough time estimate
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
  }, [pointsOfInterest, userProfile]);

  useEffect(() => {
    generateSmartResults();
  }, [generateSmartResults]);

  const calculateLocationScore = (property: any, pois: PointOfInterest[]) => {
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
  };

  const calculateAIScore = (property: any, profile: any) => {
    // Budget score
    const budget = profile?.budget || 2500;
    const budgetScore = property.effectivePrice <= budget ? 
      100 - ((property.effectivePrice / budget - 0.8) * 100) : 
      Math.max(0, 100 - ((property.effectivePrice - budget) / budget) * 100);

    // Amenity score
    const userAmenities = profile?.amenities || [];
    const propertyAmenities = property.amenities || [];
    const amenityMatches = userAmenities.filter((a: string) => 
      propertyAmenities.some((pa: string) => pa.toLowerCase().includes(a.toLowerCase()))
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
  };

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
    const newPOI: PointOfInterest = {
      ...poi,
      id: Date.now().toString(),
      coordinates: { lat: 30.2672 + Math.random() * 0.1, lng: -97.7431 + Math.random() * 0.1 } // Mock coordinates
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
    if (userProfile?.budget) count++;
    if (userProfile?.amenities?.length > 0) count++;
    if (userProfile?.lifestyle) count++;
    if (userProfile?.priorities?.length > 0) count++;
    if (userProfile?.deal_breakers?.length > 0) count++;
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