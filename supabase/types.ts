
// Centralized Supabase types used across the repo
// Generated from database schema and code usage analysis

import type { User } from '@supabase/supabase-js'

export type SupabaseUser = User

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      // Core property tables (from schema)
      properties: {
        Row: {
          id: string
          external_id: string
          source: string
          name: string
          address: string
          city: string
          state: string
          zip_code?: string
          current_price: number
          original_price?: number
          price_per_sqft?: number
          bedrooms: number
          bathrooms: number
          sqft?: number
          year_built?: number
          availability?: string
          availability_type?: 'immediate' | 'soon' | 'waitlist' | 'unknown'
          days_on_market?: number
          features?: Json
          amenities?: Json
          images?: Json
          virtual_tour_url?: string
          phone_number?: string
          website_url?: string
          listing_url: string
          coordinates?: string
          pet_policy?: string
          parking?: string
          lease_terms?: Json
          match_score?: number
          ai_predicted_price?: number
          market_velocity?: 'hot' | 'normal' | 'slow'
          scraped_at?: string
          last_updated?: string
          is_active?: boolean
          data_quality_score?: number
        }
        Insert: {
          id?: string
          external_id: string
          source: string
          name: string
          address: string
          city: string
          state: string
          zip_code?: string
          current_price: number
          original_price?: number
          price_per_sqft?: number
          bedrooms?: number
          bathrooms?: number
          sqft?: number
          year_built?: number
          availability?: string
          availability_type?: 'immediate' | 'soon' | 'waitlist' | 'unknown'
          days_on_market?: number
          features?: Json
          amenities?: Json
          images?: Json
          virtual_tour_url?: string
          phone_number?: string
          website_url?: string
          listing_url: string
          coordinates?: string
          pet_policy?: string
          parking?: string
          lease_terms?: Json
          match_score?: number
          ai_predicted_price?: number
          market_velocity?: 'hot' | 'normal' | 'slow'
          scraped_at?: string
          last_updated?: string
          is_active?: boolean
          data_quality_score?: number
        }
        Update: {
          external_id?: string
          source?: string
          name?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string
          current_price?: number
          original_price?: number
          price_per_sqft?: number
          bedrooms?: number
          bathrooms?: number
          sqft?: number
          year_built?: number
          availability?: string
          availability_type?: 'immediate' | 'soon' | 'waitlist' | 'unknown'
          days_on_market?: number
          features?: Json
          amenities?: Json
          images?: Json
          virtual_tour_url?: string
          phone_number?: string
          website_url?: string
          listing_url?: string
          coordinates?: string
          pet_policy?: string
          parking?: string
          lease_terms?: Json
          match_score?: number
          ai_predicted_price?: number
          market_velocity?: 'hot' | 'normal' | 'slow'
          scraped_at?: string
          last_updated?: string
          is_active?: boolean
          data_quality_score?: number
        }
      }
      // User-related tables (from code usage)
      user_preferences: {
        Row: {
          id?: string
          user_id: string
          email?: string
          location?: string
          bio?: string
          budget?: number
          lifestyle?: string
          has_completed_ai_programming?: boolean
          updated_at?: string
          bedrooms?: string
          amenities?: Json
          deal_breakers?: Json
          public_transit_access?: Json
          walkability_score_requirement?: string
          bike_friendly?: boolean
          search_criteria?: Json
          [key: string]: any
        }
        Insert: {
          id?: string
          user_id: string
          email?: string
          location?: string
          bio?: string
          budget?: number
          lifestyle?: string
          has_completed_ai_programming?: boolean
          updated_at?: string
          bedrooms?: string
          amenities?: Json
          deal_breakers?: Json
          public_transit_access?: Json
          walkability_score_requirement?: string
          bike_friendly?: boolean
          search_criteria?: Json
          [key: string]: any
        }
        Update: {
          user_id?: string
          email?: string
          location?: string
          bio?: string
          budget?: number
          lifestyle?: string
          has_completed_ai_programming?: boolean
          updated_at?: string
          bedrooms?: string
          amenities?: Json
          deal_breakers?: Json
          public_transit_access?: Json
          walkability_score_requirement?: string
          bike_friendly?: boolean
          search_criteria?: Json
          [key: string]: any
        }
      }
      user_activities: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          component_name?: string
          page_name?: string
          action_details?: Json
          metadata?: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          component_name?: string
          page_name?: string
          action_details?: Json
          metadata?: Json
          created_at?: string
        }
        Update: {
          user_id?: string
          activity_type?: string
          component_name?: string
          page_name?: string
          action_details?: Json
          metadata?: Json
          created_at?: string
        }
      }
      user_sessions: {
        Row: {
          id?: string
          user_id: string
          session_id: string
          device_info: Json
          user_agent: string
          logout_time?: string
          session_duration?: number
          created_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          device_info: Json
          user_agent: string
          logout_time?: string
          session_duration?: number
          created_at?: string
        }
        Update: {
          user_id?: string
          session_id?: string
          device_info?: Json
          user_agent?: string
          logout_time?: string
          session_duration?: number
          created_at?: string
        }
      }
      user_activity_logs: {
        Row: {
          id?: string
          user_id: string
          session_id: string
          activity_type: string
          page_url: string
          element_clicked: string
          activity_data: Json
          device_info: Json
          created_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          activity_type: string
          page_url: string
          element_clicked: string
          activity_data: Json
          device_info: Json
          created_at?: string
        }
        Update: {
          user_id?: string
          session_id?: string
          activity_type?: string
          page_url?: string
          element_clicked?: string
          activity_data?: Json
          device_info?: Json
          created_at?: string
        }
      }
      user_content_logs: {
        Row: {
          id?: string
          session_id: string
          content_type: string
          content_id: string
          content_data: Json
          action: 'view' | 'update' | 'delete' | 'create'
          created_at?: string
        }
        Insert: {
          id?: string
          session_id: string
          content_type: string
          content_id: string
          content_data: Json
          action: 'view' | 'update' | 'delete' | 'create'
          created_at?: string
        }
        Update: {
          session_id?: string
          content_type?: string
          content_id?: string
          content_data?: Json
          action?: 'view' | 'update' | 'delete' | 'create'
          created_at?: string
        }
      }
      saved_apartments: {
        Row: {
          id?: string
          user_id: string
          apartment_id: string
          notes: string
          rating: number
          created_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          apartment_id: string
          notes: string
          rating: number
          created_at?: string
        }
        Update: {
          user_id?: string
          apartment_id?: string
          notes?: string
          rating?: number
          created_at?: string
        }
      }
      search_history: {
        Row: {
          id?: string
          user_id: string
          search_parameters: Json
          results_count: number
          search_location: Json | null
          radius: number
          created_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          search_parameters: Json
          results_count: number
          search_location: Json | null
          radius: number
          created_at?: string
        }
        Update: {
          user_id?: string
          search_parameters?: Json
          results_count?: number
          search_location?: Json | null
          radius?: number
          created_at?: string
        }
      }
      user_pois: {
        Row: {
          id?: string
          user_id: string
          name: string
          address: string
          latitude: number
          longitude: number
          category: string
          priority: number
          notes: string
          created_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          address: string
          latitude: number
          longitude: number
          category: string
          priority: number
          notes: string
          created_at?: string
        }
        Update: {
          user_id?: string
          name?: string
          address?: string
          latitude?: number
          longitude?: number
          category?: string
          priority?: number
          notes?: string
          created_at?: string
        }
      }
      subscribers: {
        Row: {
          id: string
          plan_end?: string
          status?: string
          expires_at?: string
          [key: string]: any
        }
        Insert: {
          id?: string
          plan_end?: string
          status?: string
          expires_at?: string
          [key: string]: any
        }
        Update: {
          plan_end?: string
          status?: string
          expires_at?: string
          [key: string]: any
        }
      }
      access_tokens: {
        Row: {
          id: string
          expires_at?: string
          used?: boolean
          [key: string]: any
        }
        Insert: {
          id?: string
          expires_at?: string
          used?: boolean
          [key: string]: any
        }
        Update: {
          expires_at?: string
          used?: boolean
          [key: string]: any
        }
      }
      rental_offers: {
        Row: {
          id?: string
          [key: string]: any
        }
        Insert: {
          id?: string
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
      data_export_requests: {
        Row: {
          id?: string
          user_id: string
          export_type: string
          export_format: string
          status: string
          delivery_method: string
          data_categories: string[]
          file_url?: string
          progress_percentage?: number
          error_message?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Insert: {
          id?: string
          user_id: string
          export_type: string
          export_format: string
          status: string
          delivery_method: string
          data_categories: string[]
          file_url?: string
          progress_percentage?: number
          error_message?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Update: {
          user_id?: string
          export_type?: string
          export_format?: string
          status?: string
          delivery_method?: string
          data_categories?: string[]
          file_url?: string
          progress_percentage?: number
          error_message?: string
          updated_at?: string
          [key: string]: any
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// --- Common table shapes used by serverless functions ---
export interface UserProfile {
  id?: string
  user_id?: string
  email?: string | null
  [key: string]: unknown
}

export interface ActivityItem {
  activity_type?: string
  created_at?: string
}

export interface ContentItem {
  content_type?: string
  created_at?: string
}

export interface SessionItem {
  created_at?: string
}

export interface OrderItem {
  id?: string
  plan_type?: string
  amount?: number
  currency?: string
  status?: string
  created_at?: string
}

// Additional types for edge functions - keeping both comprehensive Database interface above
// and these minimal stubs for edge function compatibility
export interface ExportRequest {
  exportId?: string;
  user_id?: string;
  user_email?: string;
  data_categories?: string[];
  date_range_start?: string;
  date_range_end?: string;
  export_type?: string;
  export_format?: string;
}

// UserProfile interface is defined above in the comprehensive Database interface
// ActivityItem, ContentItem, SessionItem, and OrderItem interfaces are defined above with specific properties

export interface UserData {
  profile: UserProfile | null;
  activity: ActivityItem[];
  content: ContentItem[];
  sessions: SessionItem[];
  orders: OrderItem[];
}

export interface ExportInfo {
  user_id?: string;
  export_date?: string;
  export_type?: string;
  data_range?: { start?: string; end?: string };
  categories?: string[];
  total_records?: Record<string, number>;
}

export default {} as const;
// Bridge module: re-export the generated supabase types and provide small
// helpers used across the codebase. The authoritative generated types live
// Compatibility aliases for existing code
// Use SupabaseUser directly instead of re-exporting as User to avoid naming conflict
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
export type UserActivity = Database['public']['Tables']['user_activities']['Row']  
export type SearchHistory = Database['public']['Tables']['search_history']['Row']
export type SavedApartment = Database['public']['Tables']['saved_apartments']['Row']
