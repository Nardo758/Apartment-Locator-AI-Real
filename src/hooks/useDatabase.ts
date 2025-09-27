import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/supabase/types';
import { useUser } from './useUser';

export const useDatabase = () => {
  const { user } = useUser();

  // User Preferences
  const saveUserPreferences = useCallback(async (preferences: Record<string, unknown>) => {
    if (!user) throw new Error('User not authenticated');
    
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const { data, error } = await (supabase as any)
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }, [user]);

  const getUserPreferences = useCallback(async () => {
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }, [user]);

  // Saved Apartments
  const saveApartment = useCallback(async (apartmentId: string, notes?: string, rating?: number) => {
    if (!user) throw new Error('User not authenticated');
    
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const { data, error } = await (supabase as any)
      .from('saved_apartments')
      .upsert({
        user_id: user.id,
        apartment_id: apartmentId,
        notes,
        rating,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }, [user]);

  const getSavedApartments = useCallback(async () => {
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('saved_apartments')
      .select(`
        *,
        apartments (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }, [user]);

  // Search History
  const saveSearch = useCallback(async (searchParams: Record<string, unknown>, resultsCount: number, location: Record<string, unknown> | null, radius: number) => {
    if (!user) throw new Error('User not authenticated');
    
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const { data, error } = await (supabase as any)
      .from('search_history')
      .insert({
        user_id: user.id,
        search_parameters: searchParams as unknown as Json,
        results_count: resultsCount,
        search_location: (location ?? null) as unknown as Json | null,
        radius: radius
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }, [user]);

  const getSearchHistory = useCallback(async (limit = 10) => {
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }, [user]);

  // Points of Interest
  interface POIInput {
    address: string;
    category: string;
    latitude: number;
    longitude: number;
    name: string;
    notes?: string | null;
    priority?: number | null;
  }

  const savePOI = useCallback(async (poiData: POIInput) => {
    if (!user) throw new Error('User not authenticated');
    
    const poiPayload = {
      address: poiData.address,
      category: poiData.category,
      latitude: poiData.latitude,
      longitude: poiData.longitude,
      name: poiData.name,
      notes: poiData.notes ?? null,
      priority: poiData.priority ?? null,
      user_id: user.id,
      created_at: new Date().toISOString()
    } as const;

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const { data, error } = await (supabase as any)
      .from('user_pois')
      .insert(poiPayload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }, [user]);

  const getPOIs = useCallback(async () => {
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('user_pois')
      .select('*')
      .eq('user_id', user.id)
      .order('priority', { ascending: false });

    if (error) throw error;
    return data;
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