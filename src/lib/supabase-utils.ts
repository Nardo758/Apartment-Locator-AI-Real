import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type UserProfile = Tables['user_profiles']['Row'];
type RentalOffer = Tables['rental_offers']['Row'];
type Subscription = Tables['subscriptions']['Row'];

// User Profile Operations
export const userProfileUtils = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  async upsertProfile(profile: Tables['user_profiles']['Insert']): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profile, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting user profile:', error);
      throw error;
    }
  },

  async updatePreferences(userId: string, preferences: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  }
};

// Rental Offer Operations
export const rentalOfferUtils = {
  async getUserOffers(userId: string): Promise<RentalOffer[]> {
    try {
      const { data, error } = await supabase
        .from('rental_offers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching rental offers:', error);
      return [];
    }
  },

  async createOffer(offer: Tables['rental_offers']['Insert']): Promise<RentalOffer | null> {
    try {
      const { data, error } = await supabase
        .from('rental_offers')
        .insert(offer)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating rental offer:', error);
      throw error;
    }
  },

  async updateOfferStatus(offerId: string, status: string, notes?: string): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };
      
      if (notes) updateData.notes = notes;
      
      const { error } = await supabase
        .from('rental_offers')
        .update(updateData)
        .eq('id', offerId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating offer status:', error);
      return false;
    }
  }
};

// Subscription Operations
export const subscriptionUtils = {
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
  },

  async validateAccessToken(token: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('access_tokens')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (error) return false;
      return !!data;
    } catch (error) {
      console.error('Error validating access token:', error);
      return false;
    }
  },

  async markTokenAsUsed(token: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('access_tokens')
        .update({ 
          used: true,
          updated_at: new Date().toISOString()
        })
        .eq('token', token);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking token as used:', error);
      return false;
    }
  }
};

// Auth Utilities
export const authUtils = {
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  }
};

// Database Health Check
export const healthCheck = {
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  },

  async getTableCounts() {
    const counts = {
      user_profiles: 0,
      rental_offers: 0,
      subscriptions: 0,
      orders: 0,
      access_tokens: 0
    };

    try {
      const tables = Object.keys(counts);
      const results = await Promise.allSettled(
        tables.map(table =>
          supabase
            .from(table as keyof typeof counts)
            .select('*', { count: 'exact', head: true })
        )
      );

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.count !== null) {
          counts[tables[index] as keyof typeof counts] = result.value.count;
        }
      });
    } catch (error) {
      console.error('Error getting table counts:', error);
    }

    return counts;
  }
};

// Error Handler
export const handleSupabaseError = (error: any, context: string) => {
  console.error(`Supabase error in ${context}:`, error);
  
  // Common error types and user-friendly messages
  const errorMessages: Record<string, string> = {
    'PGRST116': 'No data found',
    '23505': 'This record already exists',
    '42501': 'Permission denied',
    '08P01': 'Connection error - please try again',
    'auth/user-not-found': 'User not found',
    'auth/invalid-email': 'Invalid email address',
    'auth/weak-password': 'Password is too weak'
  };

  const userMessage = errorMessages[error.code] || error.message || 'An unexpected error occurred';
  
  return {
    code: error.code,
    message: userMessage,
    details: error.details || null
  };
};