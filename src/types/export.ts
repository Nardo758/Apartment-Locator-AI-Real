// Export types based on data_export_requests table
export interface ExportJob {
  id: string;
  user_id: string;
  export_type: string;
  export_format: string;
  status: string;
  progress_percentage: number | null;
  file_url: string | null;
  error_message: string | null;
  created_at: string | null;
  completed_at: string | null;
  expires_at: string | null;
}

export type ExportJobRow = ExportJob;
export type ExportJobInsert = Omit<ExportJob, 'id' | 'created_at'>;
export type ExportJobUpdate = Partial<ExportJobInsert>;

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
