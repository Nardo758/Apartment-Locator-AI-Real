// BACKUP: Original useDatabase.ts with full functionality
// This file contained comprehensive database operations
// Use this for reference when adding back additional database methods

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/supabase/types';
import { useUser } from './useUser';

// Types for database operations
export interface POIInput {
  address: string;
  category: string;
  latitude: number;
  longitude: number;
  name: string;
  notes?: string | null;
  priority?: number | null;
}

export const useFullDatabase = () => {
  const { user } = useUser();

  // User Preferences
  const saveUserPreferences = useCallback(async (preferences: Record<string, unknown>) => {
    if (!user) throw new Error('User not authenticated');
    
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

  // Additional methods were here: saveApartment, getSavedApartments, 
  // saveSearch, getSearchHistory, savePOI, getPOIs
  
  return {
    saveUserPreferences,
    getUserPreferences,
    // ... other methods
  };
};