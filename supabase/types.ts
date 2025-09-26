// Centralized Supabase types used across the repo
// Minimal Database placeholder — extend with generated types if available

import type { User } from '@supabase/supabase-js'

export type SupabaseUser = User

export interface Database {
  // Manually-maintained `public` schema mapping for the most-used tables in the app.
  public: {
    user_preferences: {
      Row: {
        id: string
        user_id: string
        key: string
        value: string | null
        created_at: string | null
      }
      Insert: {
        id?: string
        user_id: string
        key: string
        value?: string | null
      }
      Update: {
        value?: string | null
      }
    }
    saved_apartments: {
      Row: {
        id: string
        user_id: string
        property_id: string
        created_at: string | null
        metadata?: Record<string, unknown> | null
      }
      Insert: {
        id?: string
        user_id: string
        property_id: string
        metadata?: Record<string, unknown> | null
      }
      Update: {
        metadata?: Record<string, unknown> | null
      }
    }
    search_history: {
      Row: {
        id: string
        user_id: string
        query: string
        filters?: string | null
        created_at: string | null
      }
      Insert: {
        id?: string
        user_id: string
        query: string
        filters?: string | null
      }
      Update: {
        query?: string
        filters?: string | null
      }
    }
    user_profiles: {
      Row: {
        id: string
        user_id: string
        full_name?: string | null
        email?: string | null
        avatar_url?: string | null
        created_at?: string | null
        updated_at?: string | null
        [key: string]: unknown
      }
      Insert: {
        id?: string
        user_id: string
        full_name?: string | null
        email?: string | null
        avatar_url?: string | null
      }
      Update: {
        full_name?: string | null
        email?: string | null
        avatar_url?: string | null
      }
    }
    data_export_requests: {
      Row: {
        id: string
        user_id: string
        export_type: string | null
        status: string | null
        created_at: string | null
        options?: Record<string, unknown> | null
      }
      Insert: {
        id?: string
        user_id: string
        export_type?: string | null
        status?: string | null
        options?: Record<string, unknown> | null
      }
      Update: {
        status?: string | null
        options?: Record<string, unknown> | null
      }
    }
    user_activity_logs: {
      Row: {
        id: string
        user_id?: string | null
        activity_type?: string | null
        payload?: Record<string, unknown> | null
        created_at?: string | null
      }
      Insert: {
        id?: string
        user_id?: string | null
        activity_type?: string | null
        payload?: Record<string, unknown> | null
      }
      Update: {
        activity_type?: string | null
        payload?: Record<string, unknown> | null
      }
    }
    user_content_logs: {
      Row: {
        id: string
        user_id?: string | null
        content_type?: string | null
        content?: Record<string, unknown> | null
        created_at?: string | null
      }
      Insert: {
        id?: string
        user_id?: string | null
        content_type?: string | null
        content?: Record<string, unknown> | null
      }
      Update: {
        content_type?: string | null
        content?: Record<string, unknown> | null
      }
    }
    user_sessions: {
      Row: {
        id: string
        user_id?: string | null
        session_data?: Record<string, unknown> | null
        created_at?: string | null
      }
      Insert: {
        id?: string
        user_id?: string | null
        session_data?: Record<string, unknown> | null
      }
      Update: {
        session_data?: Record<string, unknown> | null
      }
    }
    orders: {
      Row: {
        id: string
        user_id?: string | null
        amount?: number | null
        currency?: string | null
        status?: string | null
        created_at?: string | null
      }
      Insert: {
        id?: string
        user_id?: string | null
        amount?: number | null
        currency?: string | null
      }
      Update: {
        amount?: number | null
        currency?: string | null
        status?: string | null
      }
    }
    rental_offers: {
      Row: {
        id: string
        user_id?: string | null
        property_id?: string | null
        offer_amount?: number | null
        status?: string | null
        created_at?: string | null
      }
      Insert: {
        id?: string
        user_id?: string | null
        property_id?: string | null
        offer_amount?: number | null
      }
      Update: {
        offer_amount?: number | null
        status?: string | null
      }
    }
    subscribers: {
      Row: {
        id: string
        email: string
        created_at?: string | null
        status?: string | null
      }
      Insert: {
        id?: string
        email: string
      }
      Update: {
        status?: string | null
      }
    }
    access_tokens: {
      Row: {
        id: string
        user_id?: string | null
        token?: string | null
        used?: boolean | null
        created_at?: string | null
      }
      Insert: {
        id?: string
        user_id?: string | null
        token?: string | null
      }
      Update: {
        used?: boolean | null
      }
    }
    server_logs: {
      Row: {
        id: string
        message?: string | null
        created_at?: string | null
      }
      Insert: {
        id?: string
        message?: string | null
      }
      Update: {
        message?: string | null
      }
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
  [key: string]: unknown
}

export interface ContentItem {
  content_type?: string
  created_at?: string
  [key: string]: unknown
}

export interface SessionItem {
  created_at?: string
  [key: string]: unknown
}

export interface OrderItem {
  id?: string
  plan_type?: string
  amount?: number
  currency?: string
  status?: string
  created_at?: string
  [key: string]: unknown
}

export interface ExportRequest {
  exportId: string
  user_id?: string
  user_email?: string
  data_categories?: string[]
  date_range_start?: string
  date_range_end?: string
  export_format?: 'json' | 'csv' | 'xml'
  export_type?: string
}

export interface UserData {
  profile?: UserProfile | null
  activity: ActivityItem[]
  content: ContentItem[]
  sessions: SessionItem[]
  orders: OrderItem[]
}

export interface ExportInfo {
  user_id?: string
  export_date?: string
  export_type?: string
  data_range?: {
    start?: string
    end?: string
  }
  categories?: string[]
  total_records?: Record<string, number>
}

export interface AISuggestionConcession {
  type?: string
  description?: string
  likelihood?: string
}

export interface AISuggestions {
  recommendedOffer?: {
    suggestedRent?: number
    strategy?: string
    reasoning?: string
  }
  marketAnalysis?: {
    marketPosition?: string
    demandLevel?: string
    competitiveAnalysis?: string
  }
  potentialConcessions?: AISuggestionConcession[]
  timingRecommendations?: {
    bestTimeToApply?: string
    reasoning?: string
  }
  [key: string]: unknown
}

export interface OfferEmailRequest {
  userEmail: string
  moveInDate: string
  leaseTerm: number
  monthlyBudget: number
  notes?: string
  propertyId: string
  propertyDetails?: Record<string, unknown>
  aiSuggestions?: AISuggestions
}
