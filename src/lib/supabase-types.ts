import type { Database } from '@/supabase/types'

export type ExportRequestRow = Database['public']['Tables']['data_export_requests']['Row']
export type ExportRequestInsert = Database['public']['Tables']['data_export_requests']['Insert']
export type ExportRequestUpdate = Database['public']['Tables']['data_export_requests']['Update']

export const exportRequestsTable = 'data_export_requests' as const

