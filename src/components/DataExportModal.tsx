import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, Mail, Clock, FileText } from 'lucide-react';
import { useDataExport, ExportRequest } from '@/hooks/useDataExport';

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DATA_CATEGORIES = [
  { id: 'profile', label: 'Profile Information', description: 'Personal details, preferences, settings' },
  { id: 'activity', label: 'Activity Data', description: 'Page views, clicks, searches, interactions' },
  { id: 'content', label: 'User Content', description: 'Created content, saved items, notes' },
  { id: 'sessions', label: 'Session Data', description: 'Login history, device information' },
  { id: 'transactions', label: 'Transaction Data', description: 'Purchases, subscriptions (anonymized)' },
];

export const DataExportModal: React.FC<DataExportModalProps> = ({ isOpen, onClose }) => {
  const { requestExport, isLoading } = useDataExport();
  const [exportType, setExportType] = useState<'complete' | 'partial' | 'category'>('complete');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf' | 'xml'>('json');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['profile', 'activity', 'content']);
  const [deliveryMethod, setDeliveryMethod] = useState<'download' | 'email'>('download');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async () => {
    const request: ExportRequest = {
      exportType,
      exportFormat,
      dataCategories: exportType === 'complete' ? DATA_CATEGORIES.map(c => c.id) : selectedCategories,
      dateRangeStart: dateRangeStart || undefined,
      dateRangeEnd: dateRangeEnd || undefined,
      deliveryMethod
    };

    try {
      await requestExport(request);
      onClose();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export My Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Export Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div 
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    exportType === 'complete' ? 'border-primary bg-primary/10' : 'border-border'
                  }`}
                  onClick={() => setExportType('complete')}
                >
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      aria-label="Complete export"
                      checked={exportType === 'complete'} 
                      onChange={() => setExportType('complete')}
                      className="text-primary"
                    />
                    <div>
                      <div className="font-medium">Complete Export</div>
                      <div className="text-sm text-muted-foreground">All your data across all categories</div>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    exportType === 'category' ? 'border-primary bg-primary/10' : 'border-border'
                  }`}
                  onClick={() => setExportType('category')}
                >
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      aria-label="Selective export"
                      checked={exportType === 'category'} 
                      onChange={() => setExportType('category')}
                      className="text-primary"
                    />
                    <div>
                      <div className="font-medium">Selective Export</div>
                      <div className="text-sm text-muted-foreground">Choose specific data categories</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Categories */}
          {exportType === 'category' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Data Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {DATA_CATEGORIES.map(category => (
                  <div key={category.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={category.id}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={category.id} 
                        className="font-medium cursor-pointer"
                      >
                        {category.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Date Range (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="dateStart">Start Date</Label>
                  <Input
                    id="dateStart"
                    type="date"
                    value={dateRangeStart}
                    onChange={(e) => setDateRangeStart(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dateEnd">End Date</Label>
                  <Input
                    id="dateEnd"
                    type="date"
                    value={dateRangeEnd}
                    onChange={(e) => setDateRangeEnd(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Format & Delivery */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Format & Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Export Format</Label>
                <Select value={exportFormat} onValueChange={(value: string) => setExportFormat(value as 'json' | 'csv' | 'pdf' | 'xml')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON (Structured data)</SelectItem>
                    <SelectItem value="csv">CSV (Spreadsheet format)</SelectItem>
                    <SelectItem value="pdf">PDF (Human-readable report)</SelectItem>
                    <SelectItem value="xml">XML (System integration)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Delivery Method</Label>
                <Select value={deliveryMethod} onValueChange={(value: string) => setDeliveryMethod(value as 'download' | 'email')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose delivery method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="download">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Instant Download
                      </div>
                    </SelectItem>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Link
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || (exportType === 'category' && selectedCategories.length === 0)}
            >
              {isLoading ? 'Processing...' : 'Request Export'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};