import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/supabase/types';

export class UserService {
  async saveUserPreferences(userId: string, preferences: Record<string, unknown>) {
    const { data, error } = await (supabase as any)
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserPreferences(userId: string) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Not found is okay
    return data;
  }

  async saveUserProfile(userId: string, profile: Record<string, unknown>) {
    const { data, error } = await (supabase as any)
      .from('user_preferences') // Using user_preferences instead of user_profiles
      .upsert({
        user_id: userId,
        ...profile,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_preferences') // Using user_preferences instead of user_profiles
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Not found is okay
    return data;
  }
}

export const userService = new UserService();