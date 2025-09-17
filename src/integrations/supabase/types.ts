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
      orders: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          plan_type: string
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          plan_type: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          plan_type?: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      rental_offers: {
        Row: {
          ai_suggestions: Json | null
          created_at: string
          id: string
          lease_term: number
          monthly_budget: number | null
          move_in_date: string
          notes: string | null
          property_details: Json | null
          property_id: string
          updated_at: string
          user_email: string
        }
        Insert: {
          ai_suggestions?: Json | null
          created_at?: string
          id?: string
          lease_term: number
          monthly_budget?: number | null
          move_in_date: string
          notes?: string | null
          property_details?: Json | null
          property_id: string
          updated_at?: string
          user_email: string
        }
        Update: {
          ai_suggestions?: Json | null
          created_at?: string
          id?: string
          lease_term?: number
          monthly_budget?: number | null
          move_in_date?: string
          notes?: string | null
          property_details?: Json | null
          property_id?: string
          updated_at?: string
          user_email?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          access_token: string | null
          amount: number
          created_at: string
          currency: string | null
          email: string
          id: string
          name: string | null
          plan_end: string
          plan_start: string | null
          plan_type: string
          status: string | null
          stripe_customer_id: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          amount: number
          created_at?: string
          currency?: string | null
          email: string
          id?: string
          name?: string | null
          plan_end: string
          plan_start?: string | null
          plan_type: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          amount?: number
          created_at?: string
          currency?: string | null
          email?: string
          id?: string
          name?: string | null
          plan_end?: string
          plan_start?: string | null
          plan_type?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          additional_notes: string | null
          age_demographics: string | null
          ai_preferences: Json | null
          airport_proximity: string | null
          amenities: string[] | null
          banking_access: boolean | null
          bedrooms: string | null
          bike_friendly: boolean | null
          bio: string | null
          budget: number | null
          cell_coverage: string | null
          communication: string[] | null
          created_at: string
          credit_score: string | null
          crime_rate_preference: string | null
          current_address: string | null
          current_rent: number | null
          deal_breakers: string[] | null
          diversity_importance: string | null
          dry_cleaning_services: boolean | null
          email: string
          emergency_services_response: string | null
          employment_type: string | null
          ev_charging_stations: boolean | null
          farmers_markets: boolean | null
          fire_safety_features: string[] | null
          flood_zone_avoidance: boolean | null
          gated_community_preference: string | null
          grocery_store_types: string[] | null
          gross_income: number | null
          has_completed_ai_programming: boolean | null
          has_completed_social_signup: boolean | null
          highway_access: boolean | null
          household_size: string | null
          id: string
          income_verified: boolean | null
          internet_speed_requirement: string | null
          lease_duration: string | null
          lease_expiration: string | null
          lifestyle: string | null
          local_culture_arts: boolean | null
          location: string | null
          max_budget: number | null
          max_commute: number | null
          max_drive_time: number | null
          min_bedrooms: string | null
          move_timeline: string | null
          negotiation_comfort: string | null
          neighborhoods: string | null
          noise_tolerance_level: string | null
          other_locations: Json | null
          pet_info: string | null
          points_of_interest: Json | null
          population_density: string | null
          post_office_proximity: boolean | null
          priorities: string[] | null
          program_ai_prompt_dismissed: boolean | null
          public_transit_access: string[] | null
          rental_history: string | null
          school_district_quality: string | null
          search_criteria: Json | null
          search_radius: number | null
          security_system_required: boolean | null
          shopping_mall_access: boolean | null
          smart_home_compatibility: boolean | null
          streaming_options: string[] | null
          transportation: string | null
          updated_at: string
          use_case: string | null
          user_id: string | null
          walkability_importance: string | null
          work_address: string | null
          work_frequency: string | null
          work_schedule: string | null
        }
        Insert: {
          additional_notes?: string | null
          age_demographics?: string | null
          ai_preferences?: Json | null
          airport_proximity?: string | null
          amenities?: string[] | null
          banking_access?: boolean | null
          bedrooms?: string | null
          bike_friendly?: boolean | null
          bio?: string | null
          budget?: number | null
          cell_coverage?: string | null
          communication?: string[] | null
          created_at?: string
          credit_score?: string | null
          crime_rate_preference?: string | null
          current_address?: string | null
          current_rent?: number | null
          deal_breakers?: string[] | null
          diversity_importance?: string | null
          dry_cleaning_services?: boolean | null
          email: string
          emergency_services_response?: string | null
          employment_type?: string | null
          ev_charging_stations?: boolean | null
          farmers_markets?: boolean | null
          fire_safety_features?: string[] | null
          flood_zone_avoidance?: boolean | null
          gated_community_preference?: string | null
          grocery_store_types?: string[] | null
          gross_income?: number | null
          has_completed_ai_programming?: boolean | null
          has_completed_social_signup?: boolean | null
          highway_access?: boolean | null
          household_size?: string | null
          id?: string
          income_verified?: boolean | null
          internet_speed_requirement?: string | null
          lease_duration?: string | null
          lease_expiration?: string | null
          lifestyle?: string | null
          local_culture_arts?: boolean | null
          location?: string | null
          max_budget?: number | null
          max_commute?: number | null
          max_drive_time?: number | null
          min_bedrooms?: string | null
          move_timeline?: string | null
          negotiation_comfort?: string | null
          neighborhoods?: string | null
          noise_tolerance_level?: string | null
          other_locations?: Json | null
          pet_info?: string | null
          points_of_interest?: Json | null
          population_density?: string | null
          post_office_proximity?: boolean | null
          priorities?: string[] | null
          program_ai_prompt_dismissed?: boolean | null
          public_transit_access?: string[] | null
          rental_history?: string | null
          school_district_quality?: string | null
          search_criteria?: Json | null
          search_radius?: number | null
          security_system_required?: boolean | null
          shopping_mall_access?: boolean | null
          smart_home_compatibility?: boolean | null
          streaming_options?: string[] | null
          transportation?: string | null
          updated_at?: string
          use_case?: string | null
          user_id?: string | null
          walkability_importance?: string | null
          work_address?: string | null
          work_frequency?: string | null
          work_schedule?: string | null
        }
        Update: {
          additional_notes?: string | null
          age_demographics?: string | null
          ai_preferences?: Json | null
          airport_proximity?: string | null
          amenities?: string[] | null
          banking_access?: boolean | null
          bedrooms?: string | null
          bike_friendly?: boolean | null
          bio?: string | null
          budget?: number | null
          cell_coverage?: string | null
          communication?: string[] | null
          created_at?: string
          credit_score?: string | null
          crime_rate_preference?: string | null
          current_address?: string | null
          current_rent?: number | null
          deal_breakers?: string[] | null
          diversity_importance?: string | null
          dry_cleaning_services?: boolean | null
          email?: string
          emergency_services_response?: string | null
          employment_type?: string | null
          ev_charging_stations?: boolean | null
          farmers_markets?: boolean | null
          fire_safety_features?: string[] | null
          flood_zone_avoidance?: boolean | null
          gated_community_preference?: string | null
          grocery_store_types?: string[] | null
          gross_income?: number | null
          has_completed_ai_programming?: boolean | null
          has_completed_social_signup?: boolean | null
          highway_access?: boolean | null
          household_size?: string | null
          id?: string
          income_verified?: boolean | null
          internet_speed_requirement?: string | null
          lease_duration?: string | null
          lease_expiration?: string | null
          lifestyle?: string | null
          local_culture_arts?: boolean | null
          location?: string | null
          max_budget?: number | null
          max_commute?: number | null
          max_drive_time?: number | null
          min_bedrooms?: string | null
          move_timeline?: string | null
          negotiation_comfort?: string | null
          neighborhoods?: string | null
          noise_tolerance_level?: string | null
          other_locations?: Json | null
          pet_info?: string | null
          points_of_interest?: Json | null
          population_density?: string | null
          post_office_proximity?: boolean | null
          priorities?: string[] | null
          program_ai_prompt_dismissed?: boolean | null
          public_transit_access?: string[] | null
          rental_history?: string | null
          school_district_quality?: string | null
          search_criteria?: Json | null
          search_radius?: number | null
          security_system_required?: boolean | null
          shopping_mall_access?: boolean | null
          smart_home_compatibility?: boolean | null
          streaming_options?: string[] | null
          transportation?: string | null
          updated_at?: string
          use_case?: string | null
          user_id?: string | null
          walkability_importance?: string | null
          work_address?: string | null
          work_frequency?: string | null
          work_schedule?: string | null
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
