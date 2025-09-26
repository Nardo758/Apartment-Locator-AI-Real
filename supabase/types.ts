// Centralized Supabase types used across the repo
// Minimal Database placeholder — extend with generated types if available

import type { User } from '@supabase/supabase-js'

export type SupabaseUser = User

export interface Database {
  // Add table type mappings here when you have a generated Database type
  // Example:
  // public: {
  //   users: { Row: { id: string; email: string | null; }; Insert: {}; Update: {} }
  // }
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
