import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, Trash2, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useDataExport } from '@/hooks/useDataExport';
import { formatDistanceToNow } from 'date-fns';

export const DataExportHistory: React.FC = () => {
  const { exports, getExportHistory, downloadExport, deleteExport } = useDataExport();

  useEffect(() => {
    getExportHistory();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (exports.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Download className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Data Exports Yet</h3>
          <p className="text-muted-foreground text-center">
            Request your first data export to see it here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Export History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {exports.map((exportItem) => (
            <div
              key={exportItem.id}
              className="border rounded-lg p-4 space-y-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(exportItem.status)}
                  <div>
                    <div className="font-medium">
                      {exportItem.export_type.charAt(0).toUpperCase() + exportItem.export_type.slice(1)} Export
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(exportItem.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(exportItem.status)}>
                    {exportItem.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {exportItem.export_format.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Progress */}
              {exportItem.status === 'processing' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing...</span>
                    <span>{exportItem.progress_percentage}%</span>
                  </div>
                  <Progress value={exportItem.progress_percentage} className="h-2" />
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Categories:</span>
                  <div className="text-muted-foreground">
                    {Array.isArray(exportItem.data_categories) 
                      ? exportItem.data_categories.join(', ') 
                      : 'All'
                    }
                  </div>
                </div>
                <div>
                  <span className="font-medium">Size:</span>
                  <div className="text-muted-foreground">
                    {formatFileSize(exportItem.file_size)}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Delivery:</span>
                  <div className="text-muted-foreground capitalize">
                    {exportItem.delivery_method}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Expires:</span>
                  <div className="text-muted-foreground">
                    {formatDistanceToNow(new Date(exportItem.expires_at), { addSuffix: true })}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {exportItem.status === 'failed' && exportItem.error_message && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                  <div className="text-sm text-red-800 dark:text-red-300">
                    <strong>Error:</strong> {exportItem.error_message}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  ID: {exportItem.id.slice(0, 8)}...
                </div>
                <div className="flex gap-2">
                  {exportItem.status === 'completed' && exportItem.file_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadExport(exportItem.id)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteExport(exportItem.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};