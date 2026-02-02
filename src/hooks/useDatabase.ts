import { useCallback } from 'react';
import { api } from '@/lib/api';
import { useUser } from './useUser';

export const useDatabase = () => {
  const { user } = useUser();

  const saveUserPreferences = useCallback(async (preferences: Record<string, unknown>) => {
    if (!user) throw new Error('User not authenticated');
    
    return api.saveUserPreferences({
      userId: user.id,
      ...preferences,
    });
  }, [user]);

  const getUserPreferences = useCallback(async () => {
    if (!user) throw new Error('User not authenticated');
    return api.getUserPreferences(user.id);
  }, [user]);

  const saveApartment = useCallback(async (apartmentId: string, notes?: string, rating?: number) => {
    if (!user) throw new Error('User not authenticated');
    
    return api.saveApartment({
      userId: user.id,
      apartmentId,
      notes,
      rating,
    });
  }, [user]);

  const getSavedApartments = useCallback(async () => {
    if (!user) throw new Error('User not authenticated');
    return api.getSavedApartments(user.id);
  }, [user]);

  const saveSearch = useCallback(async (
    searchParams: Record<string, unknown>, 
    resultsCount: number, 
    location: Record<string, unknown> | null, 
    radius: number
  ) => {
    if (!user) throw new Error('User not authenticated');
    
    return api.addSearchHistory({
      userId: user.id,
      searchParameters: searchParams,
      resultsCount,
      searchLocation: location ?? undefined,
      radius,
    });
  }, [user]);

  const getSearchHistory = useCallback(async (limit = 10) => {
    if (!user) throw new Error('User not authenticated');
    return api.getSearchHistory(user.id, limit);
  }, [user]);

  const savePOI = useCallback(async (poiData: {
    address: string;
    category: string;
    latitude: number;
    longitude: number;
    name: string;
    notes?: string | null;
    priority?: number | null;
  }) => {
    if (!user) throw new Error('User not authenticated');
    return api.createUserPoi({
      userId: user.id,
      name: poiData.name,
      address: poiData.address,
      category: poiData.category,
      latitude: poiData.latitude,
      longitude: poiData.longitude,
      notes: poiData.notes ?? undefined,
      priority: poiData.priority ?? undefined,
    });
  }, [user]);

  const getPOIs = useCallback(async () => {
    if (!user) throw new Error('User not authenticated');
    return api.getUserPois(user.id);
  }, [user]);

  return {
    saveUserPreferences,
    getUserPreferences,
    saveApartment,
    getSavedApartments,
    saveSearch,
    getSearchHistory,
    savePOI,
    getPOIs
  };
};
