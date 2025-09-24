export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      access_tokens: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          plan_type: string
          token: string
          used: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          plan_type: string
          token: string
          used?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          plan_type?: string
          token?: string
          used?: boolean | null
        }
        Relationships: []
      }
      apartments: {
        Row: {
          address: string
          amenities: Json | null
          bathrooms: number | null
          bedrooms: number | null
          contact_info: Json | null
          created_at: string
          id: string
          images: Json | null
          location_data: Json | null
          rent: number | null
          square_feet: number | null
          updated_at: string
        }
        Insert: {
          address: string
          amenities?: Json | null
          bathrooms?: number | null
          bedrooms?: number | null
          contact_info?: Json | null
          created_at?: string
          id: string
          images?: Json | null
          location_data?: Json | null
          rent?: number | null
          square_feet?: number | null
          updated_at?: string
        }
        Update: {
          address?: string
          amenities?: Json | null
          bathrooms?: number | null
          bedrooms?: number | null
          contact_info?: Json | null
          created_at?: string
          id?: string
          images?: Json | null
          location_data?: Json | null
          rent?: number | null
          square_feet?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      data_export_requests: {
        Row: {
          created_at: string
          data_categories: string[] | null
          date_range_end: string | null
          date_range_start: string | null
          delivery_method: string
          error_message: string | null
          expires_at: string | null
          export_format: string
          export_type: string
          file_url: string | null
          id: string
          progress_percentage: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_categories?: string[] | null
          date_range_end?: string | null
          date_range_start?: string | null
          delivery_method: string
          error_message?: string | null
          expires_at?: string | null
          export_format: string
          export_type: string
          file_url?: string | null
          id?: string
          progress_percentage?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_categories?: string[] | null
          date_range_end?: string | null
          date_range_start?: string | null
          delivery_method?: string
          error_message?: string | null
          expires_at?: string | null
          export_format?: string
          export_type?: string
          file_url?: string | null
          id?: string
          progress_percentage?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rental_offers: {
        Row: {
          ai_suggestions: Json | null
          applicant_email: string
          applicant_name: string
          applicant_phone: string | null
          created_at: string
          id: string
          leasing_office_email: string
          offer_details: Json | null
          property_address: string
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ai_suggestions?: Json | null
          applicant_email: string
          applicant_name: string
          applicant_phone?: string | null
          created_at?: string
          id?: string
          leasing_office_email: string
          offer_details?: Json | null
          property_address: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ai_suggestions?: Json | null
          applicant_email?: string
          applicant_name?: string
          applicant_phone?: string | null
          created_at?: string
          id?: string
          leasing_office_email?: string
          offer_details?: Json | null
          property_address?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      saved_apartments: {
        Row: {
          apartment_id: string
          created_at: string
          id: string
          notes: string | null
          rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          apartment_id: string
          created_at?: string
          id?: string
          notes?: string | null
          rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          apartment_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      search_history: {
        Row: {
          created_at: string
          id: string
          radius: number | null
          results_count: number
          search_location: Json | null
          search_parameters: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          radius?: number | null
          results_count?: number
          search_location?: Json | null
          search_parameters: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          radius?: number | null
          results_count?: number
          search_location?: Json | null
          search_parameters?: Json
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          access_token: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          plan_end: string
          plan_type: string
          status: string
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          email: string
          id?: string
          name?: string | null
          plan_end: string
          plan_type: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          plan_end?: string
          plan_type?: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          action_details: Json | null
          activity_type: string
          component_name: string | null
          created_at: string
          id: string
          metadata: Json | null
          page_name: string | null
          user_id: string
        }
        Insert: {
          action_details?: Json | null
          activity_type: string
          component_name?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          page_name?: string | null
          user_id: string
        }
        Update: {
          action_details?: Json | null
          activity_type?: string
          component_name?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          page_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          id: string
          session_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          id?: string
          session_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          id?: string
          session_id?: string
        }
        Relationships: []
      }
      user_content_logs: {
        Row: {
          action: string
          content_data: Json | null
          content_id: string | null
          content_type: string
          created_at: string
          id: string
          session_id: string
        }
        Insert: {
          action: string
          content_data?: Json | null
          content_id?: string | null
          content_type: string
          created_at?: string
          id?: string
          session_id: string
        }
        Update: {
          action?: string
          content_data?: Json | null
          content_id?: string | null
          content_type?: string
          created_at?: string
          id?: string
          session_id?: string
        }
        Relationships: []
      }
      user_pois: {
        Row: {
          address: string
          category: string
          created_at: string
          id: string
          latitude: number
          longitude: number
          name: string
          notes: string | null
          priority: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          category: string
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          name: string
          notes?: string | null
          priority?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          category?: string
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          notes?: string | null
          priority?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          additional_notes: string | null
          amenities: string[] | null
          bedrooms: string | null
          bio: string | null
          budget: number | null
          created_at: string
          deal_breakers: string[] | null
          has_completed_ai_programming: boolean | null
          id: string
          lifestyle: string | null
          location: string | null
          max_drive_time: number | null
          preferences: Json | null
          priorities: string[] | null
          search_radius: number | null
          updated_at: string
          use_case: string | null
          user_id: string
          work_schedule: string | null
        }
        Insert: {
          additional_notes?: string | null
          amenities?: string[] | null
          bedrooms?: string | null
          bio?: string | null
          budget?: number | null
          created_at?: string
          deal_breakers?: string[] | null
          has_completed_ai_programming?: boolean | null
          id?: string
          lifestyle?: string | null
          location?: string | null
          max_drive_time?: number | null
          preferences?: Json | null
          priorities?: string[] | null
          search_radius?: number | null
          updated_at?: string
          use_case?: string | null
          user_id: string
          work_schedule?: string | null
        }
        Update: {
          additional_notes?: string | null
          amenities?: string[] | null
          bedrooms?: string | null
          bio?: string | null
          budget?: number | null
          created_at?: string
          deal_breakers?: string[] | null
          has_completed_ai_programming?: boolean | null
          id?: string
          lifestyle?: string | null
          location?: string | null
          max_drive_time?: number | null
          preferences?: Json | null
          priorities?: string[] | null
          search_radius?: number | null
          updated_at?: string
          use_case?: string | null
          user_id?: string
          work_schedule?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          id: string
          logout_time: string | null
          session_id: string
          start_time: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          id?: string
          logout_time?: string | null
          session_id: string
          start_time?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          id?: string
          logout_time?: string | null
          session_id?: string
          start_time?: string
          user_id?: string | null
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
