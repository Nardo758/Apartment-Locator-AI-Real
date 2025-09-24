import { supabase } from '@/integrations/supabase/client';

export class UserService {
  async saveUserPreferences(userId: string, preferences: any) {
    const { data, error } = await supabase
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
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async updateUserPreferences(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteUserPreferences(userId: string) {
    const { error } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }

  async createUserProfile(userData: {
    userId: string;
    email?: string;
    name?: string;
    [key: string]: any;
  }) {
    const { data, error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userData.userId,
        ...userData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async hasCompletedAIProgramming(userId: string): Promise<boolean> {
    const { data } = await this.getUserPreferences(userId);
    return data?.has_completed_ai_programming || false;
  }

  async markAIProgrammingComplete(userId: string) {
    return this.updateUserPreferences(userId, {
      has_completed_ai_programming: true
    });
  }
}

export const userService = new UserService();