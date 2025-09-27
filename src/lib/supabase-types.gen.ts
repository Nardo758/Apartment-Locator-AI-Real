// src/lib/supabase-types.gen.ts (placeholder for generated types)
// This can be replaced later with `supabase gen types typescript`

export interface ExportJobRow {
  id?: string
  user_id?: string
  filters?: Record<string, unknown>
  status?: 'pending' | 'processing' | 'completed' | 'failed'
  download_url?: string | null
  export_format?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface ExportJobInsert {
  user_id: string
  filters?: Record<string, unknown>
  status?: 'pending' | 'processing' | 'completed' | 'failed'
  download_url?: string | null
  export_format?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface ExportJobUpdate {
  user_id?: string
  filters?: Record<string, unknown>
  status?: 'pending' | 'processing' | 'completed' | 'failed'
  download_url?: string | null
  export_format?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface Database {
  public: {
    Tables: {
      export_jobs: {
        Row: ExportJobRow
        Insert: ExportJobInsert
        Update: ExportJobUpdate
      }
      // Add other tables as needed
    }
  }
}
