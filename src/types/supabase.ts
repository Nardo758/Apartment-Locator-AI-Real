import type { Database } from '../../supabase/types'

export type ExportJobRow = Database['public']['Tables']['export_jobs']['Row']
export type ExportJobInsert = Database['public']['Tables']['export_jobs']['Insert']
export type ExportJobUpdate = Database['public']['Tables']['export_jobs']['Update']

// Re-export Database in case other modules need it
export type { Database }
