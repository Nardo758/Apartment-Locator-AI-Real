// Manual Supabase Database Types (generated from code analysis)
// These interfaces are based on the tables found in your codebase

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          password_hash: string | null
          email_verified: boolean
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          password_hash?: string | null
          email_verified?: boolean
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          password_hash?: string | null
          email_verified?: boolean
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          budget_min: number | null
          budget_max: number | null
          bedrooms: number | null
          bathrooms: number | null
          search_radius: number
          drive_time_max: number | null
          preferred_locations: any // JSONB
          amenities: any // JSONB
          deal_breakers: any // JSONB
          pet_friendly: boolean | null
          parking_required: boolean | null
          furnished: boolean | null
          lease_duration_months: number | null
          move_in_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          budget_min?: number | null
          budget_max?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          search_radius?: number
          drive_time_max?: number | null
          preferred_locations?: any
          amenities?: any
          deal_breakers?: any
          pet_friendly?: boolean | null
          parking_required?: boolean | null
          furnished?: boolean | null
          lease_duration_months?: number | null
          move_in_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          budget_min?: number | null
          budget_max?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          search_radius?: number
          drive_time_max?: number | null
          preferred_locations?: any
          amenities?: any
          deal_breakers?: any
          pet_friendly?: boolean | null
          parking_required?: boolean | null
          furnished?: boolean | null
          lease_duration_months?: number | null
          move_in_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          financial_info: any // JSONB
          employment_info: any // JSONB
          emergency_contact: any // JSONB
          bank_verification_status: string
          bank_verification_data: any // JSONB
          document_verification: any // JSONB
          background_check_status: string
          preferences_completed: boolean
          profile_completion_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          financial_info?: any
          employment_info?: any
          emergency_contact?: any
          bank_verification_status?: string
          bank_verification_data?: any
          document_verification?: any
          background_check_status?: string
          preferences_completed?: boolean
          profile_completion_percentage?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          financial_info?: any
          employment_info?: any
          emergency_contact?: any
          bank_verification_status?: string
          bank_verification_data?: any
          document_verification?: any
          background_check_status?: string
          preferences_completed?: boolean
          profile_completion_percentage?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_activities: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          activity_type: string
          page_name: string | null
          component_name: string | null
          action_name: string | null
          action_details: any // JSONB
          before_state: any // JSONB
          after_state: any // JSONB
          metadata: any // JSONB
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          duration_ms: number | null
          success: boolean
          error_details: any // JSONB
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string | null
          activity_type: string
          page_name?: string | null
          component_name?: string | null
          action_name?: string | null
          action_details?: any
          before_state?: any
          after_state?: any
          metadata?: any
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          duration_ms?: number | null
          success?: boolean
          error_details?: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string | null
          activity_type?: string
          page_name?: string | null
          component_name?: string | null
          action_name?: string | null
          action_details?: any
          before_state?: any
          after_state?: any
          metadata?: any
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          duration_ms?: number | null
          success?: boolean
          error_details?: any
          created_at?: string
        }
      }
      search_history: {
        Row: {
          id: string
          user_id: string
          search_query: string | null
          search_parameters: any // JSONB
          search_location: any // JSONB
          radius: number | null
          results_count: number
          results_viewed: number
          saved_search: boolean
          search_name: string | null
          alert_frequency: string | null
          last_alert_sent: string | null
          search_duration_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          search_query?: string | null
          search_parameters?: any
          search_location?: any
          radius?: number | null
          results_count?: number
          results_viewed?: number
          saved_search?: boolean
          search_name?: string | null
          alert_frequency?: string | null
          last_alert_sent?: string | null
          search_duration_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          search_query?: string | null
          search_parameters?: any
          search_location?: any
          radius?: number | null
          results_count?: number
          results_viewed?: number
          saved_search?: boolean
          search_name?: string | null
          alert_frequency?: string | null
          last_alert_sent?: string | null
          search_duration_ms?: number | null
          created_at?: string
        }
      }
      saved_apartments: {
        Row: {
          id: string
          user_id: string
          apartment_id: string
          saved_type: string
          notes: string | null
          user_rating: number | null
          pros: any // JSONB
          cons: any // JSONB
          visit_date: string | null
          application_date: string | null
          application_status: string | null
          priority: number
          alert_preferences: any // JSONB
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          apartment_id: string
          saved_type?: string
          notes?: string | null
          user_rating?: number | null
          pros?: any
          cons?: any
          visit_date?: string | null
          application_date?: string | null
          application_status?: string | null
          priority?: number
          alert_preferences?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          apartment_id?: string
          saved_type?: string
          notes?: string | null
          user_rating?: number | null
          pros?: any
          cons?: any
          visit_date?: string | null
          application_date?: string | null
          application_status?: string | null
          priority?: number
          alert_preferences?: any
          created_at?: string
          updated_at?: string
        }
      }
      apartments: {
        Row: {
          id: string
          external_id: string
          source: string
          url: string | null
          title: string
          description: string | null
          address: string
          city: string
          state: string
          zip_code: string | null
          country: string
          latitude: number | null
          longitude: number | null
          rent_min: number | null
          rent_max: number | null
          deposit: number | null
          application_fee: number | null
          bedrooms: number | null
          bathrooms: number | null
          square_feet: number | null
          lot_size: number | null
          year_built: number | null
          property_type: string | null
          lease_terms: any // JSONB
          available_date: string | null
          pet_policy: any // JSONB
          parking_info: any // JSONB
          amenities: any // JSONB
          utilities_included: any // JSONB
          images: any // JSONB
          floor_plans: any // JSONB
          contact_info: any // JSONB
          tour_info: any // JSONB
          application_requirements: any // JSONB
          neighborhood_info: any // JSONB
          commute_data: any // JSONB
          price_history: any // JSONB
          availability_status: string
          data_quality_score: number
          is_active: boolean
          is_verified: boolean
          scraped_at: string
          last_verified: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          external_id: string
          source: string
          url?: string | null
          title: string
          description?: string | null
          address: string
          city: string
          state: string
          zip_code?: string | null
          country?: string
          latitude?: number | null
          longitude?: number | null
          rent_min?: number | null
          rent_max?: number | null
          deposit?: number | null
          application_fee?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          square_feet?: number | null
          lot_size?: number | null
          year_built?: number | null
          property_type?: string | null
          lease_terms?: any
          available_date?: string | null
          pet_policy?: any
          parking_info?: any
          amenities?: any
          utilities_included?: any
          images?: any
          floor_plans?: any
          contact_info?: any
          tour_info?: any
          application_requirements?: any
          neighborhood_info?: any
          commute_data?: any
          price_history?: any
          availability_status?: string
          data_quality_score?: number
          is_active?: boolean
          is_verified?: boolean
          scraped_at?: string
          last_verified?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          external_id?: string
          source?: string
          url?: string | null
          title?: string
          description?: string | null
          address?: string
          city?: string
          state?: string
          zip_code?: string | null
          country?: string
          latitude?: number | null
          longitude?: number | null
          rent_min?: number | null
          rent_max?: number | null
          deposit?: number | null
          application_fee?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          square_feet?: number | null
          lot_size?: number | null
          year_built?: number | null
          property_type?: string | null
          lease_terms?: any
          available_date?: string | null
          pet_policy?: any
          parking_info?: any
          amenities?: any
          utilities_included?: any
          images?: any
          floor_plans?: any
          contact_info?: any
          tour_info?: any
          application_requirements?: any
          neighborhood_info?: any
          commute_data?: any
          price_history?: any
          availability_status?: string
          data_quality_score?: number
          is_active?: boolean
          is_verified?: boolean
          scraped_at?: string
          last_verified?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_exports: {
        Row: {
          id: string
          user_id: string
          export_type: string
          export_format: string
          export_filters: any // JSONB
          file_name: string | null
          file_path: string | null
          file_size: number | null
          download_url: string | null
          export_status: string
          error_details: any // JSONB
          expires_at: string | null
          downloaded_at: string | null
          download_count: number
          processing_time_ms: number | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          export_type: string
          export_format: string
          export_filters?: any
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          download_url?: string | null
          export_status?: string
          error_details?: any
          expires_at?: string | null
          downloaded_at?: string | null
          download_count?: number
          processing_time_ms?: number | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          export_type?: string
          export_format?: string
          export_filters?: any
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          download_url?: string | null
          export_status?: string
          error_details?: any
          expires_at?: string | null
          downloaded_at?: string | null
          download_count?: number
          processing_time_ms?: number | null
          created_at?: string
          completed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_apartments: {
        Args: {
          p_user_id?: string
          p_city?: string
          p_state?: string
          p_latitude?: number
          p_longitude?: number
          p_radius?: number
          p_rent_min?: number
          p_rent_max?: number
          p_bedrooms?: number[]
          p_bathrooms?: number
          p_amenities?: string[]
          p_pet_friendly?: boolean
          p_available_date?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          apartment_data: any
          distance_miles: number
          match_score: number
        }[]
      }
      export_user_data: {
        Args: {
          p_user_id: string
          p_export_type?: string
          p_date_from?: string
          p_date_to?: string
        }
        Returns: any // JSONB
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for common operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Specific table types for easier usage
export type User = Tables<'users'>
export type UserPreferences = Tables<'user_preferences'>
export type UserProfile = Tables<'user_profiles'>
export type UserActivity = Tables<'user_activities'>
export type SearchHistory = Tables<'search_history'>
export type SavedApartment = Tables<'saved_apartments'>
export type Apartment = Tables<'apartments'>
export type UserExport = Tables<'user_exports'>
