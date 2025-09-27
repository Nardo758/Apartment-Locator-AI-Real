import type { ExportJobRow, ExportJobInsert, ExportJobUpdate } from './supabase'

export type { ExportJobRow, ExportJobInsert, ExportJobUpdate }

export interface ExportJob extends ExportJobRow {
  // Additional client-side fields if needed
  progress?: number
  estimated_completion_time?: string
}

export interface ExportFilters {
  property_ids?: string[]
  date_range?: {
    start: string
    end: string
  }
  include_images?: boolean
  market_data_only?: boolean
  report_type?: 'summary' | 'detailed'
}

// Type guards
export function isExportJob(data: unknown): data is ExportJob {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'status' in data &&
    'user_id' in data
  )
}

export function isExportJobArray(data: unknown): data is ExportJob[] {
  return Array.isArray(data) && data.every(isExportJob)
}
