import { useState } from 'react';
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
  status: string;
  progress_percentage: number | null;
  file_url?: string | null;
  file_size?: number;
  error_message?: string | null;
  created_at: string | null;
  expires_at: string | null;
  export_type: string;
  export_format: string;
  completed_at?: string | null;
  user_id: string;
}

export const useDataExport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [exports, setExports] = useState<ExportStatus[]>([]);
  const { toast } = useToast();

  const requestExport = async (request: ExportRequest) => {
    setIsLoading(true);
    try {
      console.warn('Supabase integration removed - using API routes');
      toast({
        title: "Export Unavailable",
        description: "Data export is currently being migrated to API routes.",
        variant: "destructive",
      });
      return null;
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
    console.warn('Supabase integration removed - using API routes');
    setExports([]);
    return [];
  };

  const getExportStatus = async (exportId: string) => {
    console.warn('Supabase integration removed - using API routes');
    return null;
  };

  const downloadExport = async (exportId: string) => {
    console.warn('Supabase integration removed - using API routes');
    toast({
      title: "Download Unavailable",
      description: "Data export download is currently being migrated to API routes.",
      variant: "destructive",
    });
  };

  const deleteExport = async (exportId: string) => {
    console.warn('Supabase integration removed - using API routes');
    toast({
      title: "Delete Unavailable",
      description: "Data export deletion is currently being migrated to API routes.",
      variant: "destructive",
    });
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
