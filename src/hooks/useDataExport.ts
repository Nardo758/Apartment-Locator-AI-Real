import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { Database } from '@/supabase/types'
import { exportRequestsTable, type ExportRequestRow, type ExportRequestInsert } from '@/lib/supabase-types'
import { useToast } from '@/hooks/use-toast';

export interface ExportRequest {
  exportType: 'complete' | 'partial' | 'category';
  exportFormat: 'json' | 'csv' | 'pdf' | 'xml';
  dataCategories: string[];
  dateRangeStart?: string;
  dateRangeEnd?: string;
  deliveryMethod: 'download' | 'email';
}

export interface ExportStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress_percentage: number;
  file_url?: string;
  file_size?: number;
  error_message?: string;
  created_at: string;
  expires_at: string;
  export_type: 'complete' | 'partial' | 'category';
  export_format: 'json' | 'csv' | 'pdf' | 'xml';
  data_categories: string[];
  delivery_method: 'download' | 'email';
  date_range_start?: string;
  date_range_end?: string;
  user_id: string;
  updated_at: string;
}

export const useDataExport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [exports, setExports] = useState<ExportStatus[]>([]);
  const { toast } = useToast();

  const requestExport = async (request: ExportRequest) => {
    setIsLoading(true);
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User must be authenticated to request data export');
      }

      const insertPayload: ExportRequestInsert = {
          user_id: session.user.id,
          export_type: request.exportType,
          export_format: request.exportFormat,
          status: 'processing',
          data_categories: request.dataCategories,
          date_range_start: request.dateRangeStart,
          date_range_end: request.dateRangeEnd,
          delivery_method: request.deliveryMethod
      }

      const { data, error } = await supabase
        .from(exportRequestsTable)
        .insert([insertPayload])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Export Requested",
        description: "Your data export has been queued for processing. You'll be notified when it's ready.",
      });

      // Trigger background processing
      await supabase.functions.invoke('process-data-export', {
        body: { exportId: (data as ExportRequestRow).id }
      });

      return data;
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to request export",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getExportHistory = async () => {
    try {
      const { data, error } = await supabase
        .from(exportRequestsTable)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExports(((data || []) as unknown) as ExportStatus[]);
      return data;
    } catch (error) {
      toast({
        title: "Failed to load export history",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      return [];
    }
  };

  const getExportStatus = async (exportId: string) => {
    try {
      const { data, error } = await supabase
        .from(exportRequestsTable)
        .select('*')
        .eq('id', exportId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      toast({
        title: "Failed to get export status",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      return null;
    }
  };

  const downloadExport = async (exportId: string) => {
    try {
      const status = await getExportStatus(exportId) as ExportRequestRow | null;
      if (!status?.file_url) {
        throw new Error('Export file not available');
      }

      // Create download link
      const link = document.createElement('a');
      link.href = status.file_url;
      link.download = `data-export-${exportId}.${status.export_format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: "Your data export is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download export",
        variant: "destructive",
      });
    }
  };

  const deleteExport = async (exportId: string) => {
    try {
      const { error } = await supabase
        .from(exportRequestsTable)
        .delete()
        .eq('id', exportId);

      if (error) throw error;

      toast({
        title: "Export Deleted",
        description: "Export has been removed from your history.",
      });

      // Refresh the export list
      await getExportHistory();
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete export",
        variant: "destructive",
      });
    }
  };

  return {
    isLoading,
    exports,
    requestExport,
    getExportHistory,
    getExportStatus,
    downloadExport,
    deleteExport
  };
};