import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { CompetitorSearchResult } from './CompetitorSearchResult';
import { useToast } from '@/hooks/use-toast';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  MapPin,
  Home,
  Users,
  Bell,
  Loader2,
  X,
  Search,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  Property,
  CompetitorData,
  CompetitionSetFormData,
  CompetitionSetDialogProps,
  CompetitionSetEditData,
} from '@/types/competitionSets.types';

const STEPS = [
  { id: 1, title: 'Name Set', icon: MapPin },
  { id: 2, title: 'Select Properties', icon: Home },
  { id: 3, title: 'Add Competitors', icon: Users },
  { id: 4, title: 'Configure Alerts', icon: Bell },
];

export function CompetitionSetDialog({
  open,
  onOpenChange,
  onSubmit,
  editData,
  userProperties = [],
  isLoading = false,
}: CompetitionSetDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CompetitionSetFormData>({
    name: '',
    description: '',
    ownPropertyIds: [],
    alertsEnabled: false,
    competitors: [],
  });
  const [competitorSearch, setCompetitorSearch] = useState('');
  const [manualCompetitorAddress, setManualCompetitorAddress] = useState('');
  const [searchResults, setSearchResults] = useState<CompetitorData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Initialize form data when editing
  useEffect(() => {
    if (editData && open) {
      setFormData({
        name: editData.name,
        description: editData.description || '',
        ownPropertyIds: editData.ownPropertyIds,
        alertsEnabled: editData.alertsEnabled,
        competitors: editData.competitors || [],
      });
    } else if (!open) {
      // Reset form when dialog closes
      setFormData({
        name: '',
        description: '',
        ownPropertyIds: [],
        alertsEnabled: false,
        competitors: [],
      });
      setCurrentStep(1);
      setErrors({});
      setCompetitorSearch('');
      setManualCompetitorAddress('');
      setSearchResults([]);
    }
  }, [editData, open]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Competition set name is required';
      } else if (formData.name.length > 255) {
        newErrors.name = 'Name must be 255 characters or less';
      }
    }

    if (step === 2) {
      if (formData.ownPropertyIds.length === 0) {
        newErrors.ownPropertyIds = 'Select at least one of your properties';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      toast({
        title: 'Validation Error',
        description: 'Please complete required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onSubmit(formData);
      toast({
        title: 'Success',
        description: editData ? 'Competition set updated successfully' : 'Competition set created successfully',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save competition set',
        variant: 'destructive',
      });
    }
  };

  const toggleProperty = (propertyId: string) => {
    setFormData(prev => ({
      ...prev,
      ownPropertyIds: prev.ownPropertyIds.includes(propertyId)
        ? prev.ownPropertyIds.filter(id => id !== propertyId)
        : [...prev.ownPropertyIds, propertyId],
    }));
  };

  const addCompetitor = (competitor: CompetitorData) => {
    // Check for duplicates
    const isDuplicate = formData.competitors.some(
      c => c.address.toLowerCase() === competitor.address.toLowerCase()
    );

    if (isDuplicate) {
      toast({
        title: 'Duplicate Competitor',
        description: 'This competitor has already been added',
        variant: 'destructive',
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      competitors: [...prev.competitors, { ...competitor, source: competitor.source || 'manual' }],
    }));

    toast({
      title: 'Competitor Added',
      description: `${competitor.address} added to competition set`,
    });
  };

  const removeCompetitor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      competitors: prev.competitors.filter((_, i) => i !== index),
    }));
  };

  const handleManualAdd = () => {
    if (!manualCompetitorAddress.trim()) {
      toast({
        title: 'Address Required',
        description: 'Please enter a competitor address',
        variant: 'destructive',
      });
      return;
    }

    addCompetitor({
      address: manualCompetitorAddress.trim(),
      source: 'manual',
    });

    setManualCompetitorAddress('');
  };

  const handleSearchCompetitors = async () => {
    if (!competitorSearch.trim()) return;

    setIsSearching(true);
    try {
      // Mock search - in production, this would call your API
      // For now, simulate results based on user properties
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/properties/search?query=${competitorSearch}`);
      // const results = await response.json();
      
      setSearchResults([]);
      toast({
        title: 'Search Complete',
        description: 'No competitors found. Try adding them manually.',
      });
    } catch (error) {
      toast({
        title: 'Search Error',
        description: 'Failed to search for competitors',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">
                Competition Set Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  setErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder="e.g., Downtown Premium Competitors"
                className={cn(
                  'mt-2 bg-muted/50 border-border text-white',
                  errors.name && 'border-red-500'
                )}
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="text-white">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this competition set is tracking..."
                rows={4}
                className="mt-2 bg-muted/50 border-border text-white resize-none"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <p className="text-white/70 text-sm">
              Select which of your properties you want to track competitors for:
            </p>
            {errors.ownPropertyIds && (
              <p className="text-red-400 text-sm">{errors.ownPropertyIds}</p>
            )}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {userProperties.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  <Home className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No properties found</p>
                  <p className="text-sm mt-1">Add properties to your portfolio first</p>
                </div>
              ) : (
                userProperties.map((property) => (
                  <div
                    key={property.id}
                    onClick={() => toggleProperty(property.id)}
                    className={cn(
                      'p-4 rounded-lg border cursor-pointer transition-all',
                      formData.ownPropertyIds.includes(property.id)
                        ? 'bg-purple-500/20 border-purple-500/50'
                        : 'bg-muted/50 border-border hover:bg-muted/80'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-purple-400" />
                          <span className="text-white font-medium">
                            {property.address}
                          </span>
                        </div>
                        {(property.bedrooms || property.bathrooms) && (
                          <p className="text-sm text-white/60 mt-1 ml-6">
                            {property.bedrooms}bd / {property.bathrooms}ba
                            {property.currentRent && ` • $${property.currentRent.toLocaleString()}/mo`}
                          </p>
                        )}
                      </div>
                      {formData.ownPropertyIds.includes(property.id) && (
                        <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <p className="text-white/70 text-sm">
              Add competitors from the map or manually enter their addresses:
            </p>

            {/* Search Section */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={competitorSearch}
                  onChange={(e) => setCompetitorSearch(e.target.value)}
                  placeholder="Search by address, city, or zip code..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchCompetitors()}
                  className="bg-muted/50 border-border text-white"
                />
                <Button
                  onClick={handleSearchCompetitors}
                  disabled={isSearching || !competitorSearch.trim()}
                  variant="secondary"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {searchResults.map((result, idx) => (
                    <CompetitorSearchResult
                      key={idx}
                      property={result}
                      onAdd={addCompetitor}
                      isAdded={formData.competitors.some(c => c.address === result.address)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Manual Add Section */}
            <div className="pt-4 border-t border-border">
              <Label className="text-white mb-2 block">Add Manually</Label>
              <div className="flex gap-2">
                <Input
                  value={manualCompetitorAddress}
                  onChange={(e) => setManualCompetitorAddress(e.target.value)}
                  placeholder="123 Main St, City, State ZIP"
                  onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
                  className="bg-muted/50 border-border text-white"
                />
                <Button
                  onClick={handleManualAdd}
                  disabled={!manualCompetitorAddress.trim()}
                  variant="secondary"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Added Competitors List */}
            {formData.competitors.length > 0 && (
              <div className="pt-4 border-t border-border">
                <Label className="text-white mb-3 block">
                  Added Competitors ({formData.competitors.length})
                </Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {formData.competitors.map((competitor, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <span className="text-white text-sm truncate">
                          {competitor.address}
                        </span>
                        {competitor.source && (
                          <Badge variant="secondary" className="text-xs">
                            {competitor.source}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCompetitor(idx)}
                        className="text-white/50 hover:text-red-400 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.competitors.length === 0 && (
              <div className="text-center py-8 text-white/50">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No competitors added yet</p>
                <p className="text-sm mt-1">Search or manually add competitor addresses</p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <p className="text-white/70 text-sm mb-4">
              Configure how you want to be notified about competitor activity:
            </p>

            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <Label htmlFor="alerts" className="text-white font-medium">
                      Enable Pricing Alerts
                    </Label>
                    <p className="text-sm text-white/60 mt-1">
                      Get notified when competitors change prices or add concessions
                    </p>
                  </div>
                </div>
                <Switch
                  id="alerts"
                  checked={formData.alertsEnabled}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, alertsEnabled: checked }))
                  }
                />
              </div>
            </div>

            {formData.alertsEnabled && (
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <p className="text-purple-300 text-sm">
                  ✓ You'll receive alerts when:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-white/70 ml-4">
                  <li>• Competitors lower their rent prices</li>
                  <li>• New concessions or deals are offered</li>
                  <li>• Competitor properties become vacant</li>
                  <li>• Major amenity changes are detected</li>
                </ul>
              </div>
            )}

            {/* Summary */}
            <div className="pt-4 border-t border-border">
              <Label className="text-white mb-3 block">Summary</Label>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Competition Set:</span>
                  <span className="text-white font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Your Properties:</span>
                  <span className="text-white font-medium">
                    {formData.ownPropertyIds.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Competitors:</span>
                  <span className="text-white font-medium">
                    {formData.competitors.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Alerts:</span>
                  <Badge variant={formData.alertsEnabled ? 'success' : 'secondary'}>
                    {formData.alertsEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editData ? 'Edit Competition Set' : 'Create Competition Set'}
          </DialogTitle>
          <DialogDescription>
            {STEPS[currentStep - 1].title}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-2 py-4">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={cn(
                    'flex items-center gap-2 transition-all',
                    isActive && 'scale-110'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                      isCompleted && 'bg-purple-500 border-purple-500',
                      isActive && 'bg-purple-500/20 border-purple-500',
                      !isActive && !isCompleted && 'bg-muted/50 border-border'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Icon
                        className={cn(
                          'w-4 h-4',
                          isActive ? 'text-purple-400' : 'text-white/40'
                        )}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium hidden sm:inline',
                      isActive ? 'text-purple-400' : 'text-white/60'
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-2 transition-all',
                      isCompleted ? 'bg-purple-500' : 'bg-white/10'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-1">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <DialogFooter className="flex-row gap-2 sm:gap-2">
          {currentStep > 1 && (
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={isLoading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          <div className="flex-1" />
          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} disabled={isLoading}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {editData ? 'Update' : 'Create'} Competition Set
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
