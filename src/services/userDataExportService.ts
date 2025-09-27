import { supabase } from "@/integrations/supabase/client"
import type { Database } from '@/supabase/types';

export class UserDataExportService {
  async exportUserData(userId: string, exportType: string, format: string) {
    // Create export record
    const { data: exportRecord, error: exportError } = await supabase
      .from('data_export_requests')
      .insert({
        user_id: userId,
        export_type: exportType,
        export_format: format,
        status: 'processing',
        delivery_method: 'download',
        data_categories: [exportType]
      })
      .select()
      .single()

    if (exportError) throw exportError

    try {
  let data: unknown = {}

      switch (exportType) {
        case 'profile':
          data = await this.exportProfileData(userId)
          break
        case 'activity':
          data = await this.exportActivityData(userId)
          break
        case 'searches':
          data = await this.exportSearchData(userId)
          break
        case 'apartments':
          data = await this.exportSavedApartments(userId)
          break
        case 'all':
          data = await this.exportAllUserData(userId)
          break
        default:
          throw new Error(`Unknown export type: ${exportType}`)
      }

      // Generate file based on format
      const fileContent = this.formatData(data, format)
      const fileName = `user_export_${exportType}_${Date.now()}.${format}`

      // Update export record
      await supabase
        .from('data_export_requests')
        .update({
          status: 'completed',
          file_url: fileName,
          progress_percentage: 100,
          updated_at: new Date().toISOString()
        })
        .eq('id', (exportRecord as Database['public']['Tables']['data_export_requests']['Row']).id)

      return { fileName, fileContent, exportId: (exportRecord as Database['public']['Tables']['data_export_requests']['Row']).id }

    } catch (error) {
      // Mark export as failed
      await supabase
        .from('data_export_requests')
        .update({ 
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Export failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', (exportRecord as Database['public']['Tables']['data_export_requests']['Row']).id)
      throw error
    }
  }

  private async exportActivityData(userId: string) {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  private async exportProfileData(userId: string) {
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (preferencesError && preferencesError.code !== 'PGRST116') throw preferencesError

    return {
      preferences: preferences || {}
    }
  }

  private async exportSearchData(userId: string) {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  private async exportSavedApartments(userId: string) {
    const { data, error } = await supabase
      .from('saved_apartments')
      .select(`
        *,
        apartments (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  private async exportAllUserData(userId: string) {
    const [activity, profileData, searches, apartments] = await Promise.all([
      this.exportActivityData(userId),
      this.exportProfileData(userId),
      this.exportSearchData(userId),
      this.exportSavedApartments(userId)
    ])

    return {
      activity,
      ...profileData,
      searches,
      saved_apartments: apartments,
      exported_at: new Date().toISOString()
    }
  }

  private formatData(data: unknown, format: string): string {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2)
      case 'csv':
        return this.convertToCSV(data)
      default:
        return JSON.stringify(data, null, 2)
    }
  }

  private convertToCSV(data: unknown): string {
    if (!Array.isArray(data) || data.length === 0) return JSON.stringify(data);

    const first = data[0] as Record<string, unknown>;
    const headers = Object.keys(first).join(',');
    const rows = (data as Array<Record<string, unknown>>).map(row =>
      Object.values(row).map(value => {
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        if (value === null || value === undefined) return '';
        return String(value);
      }).join(',')
    ).join('\n');

    return `${headers}\n${rows}`;
  }
}