import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './useUser';

export const useDatabase = () => {
  const { user } = useUser();

  // User Preferences
  const saveUserPreferences = useCallback(async (preferences: any) => {
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
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
    
    const { data, error } = await supabase
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
  const saveSearch = useCallback(async (searchParams: any, resultsCount: number, location: any, radius: number) => {
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('search_history')
      .insert({
        user_id: user.id,
        search_parameters: searchParams,
        results_count: resultsCount,
        search_location: location,
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
  const savePOI = useCallback(async (poiData: any) => {
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('user_pois')
      .insert({
        user_id: user.id,
        ...poiData
      })
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