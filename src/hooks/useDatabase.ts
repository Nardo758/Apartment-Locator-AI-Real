// src/hooks/useDatabase.ts - VITE VERSION
import { useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './useAuth';

export const useDatabase = () => {
  const { user } = useAuth();

  const getUserPreferences = useCallback(async () => {
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No preferences found
      }
      throw error;
    }
    
    return data;
  }, [user]);

  return {
    getUserPreferences,
  };
};