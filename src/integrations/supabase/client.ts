// src/integrations/supabase/client.ts - VITE VERSION
import { createClient } from '@supabase/supabase-js';
import type { SupabaseUser, Database } from '../../../supabase/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Helper function to get current user
export const getCurrentUser = async (): Promise<SupabaseUser | null> => {
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  // data has shape { user?: User | null }
  return data?.user ?? null
}

// Helper to return current user id (or null)
export const getCurrentUserId = async () => {
  const user = await getCurrentUser()
  return user?.id || null
}