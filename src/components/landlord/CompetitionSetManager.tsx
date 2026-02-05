import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CompetitionSetDialog } from './CompetitionSetDialog';
import { useToast } from '@/hooks/use-toast';
import { authenticatedFetch } from '@/lib/authHelpers';
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Users,
  Bell,
  BellOff,
  Loader2,
  MoreVertical,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CompetitionSet, Property } from '@/types/competitionSets.types';

interface CompetitionSetManagerProps {
  userId?: string;
}

export function CompetitionSetManager({ userId }: CompetitionSetManagerProps) {
  const [competitionSets, setCompetitionSets] = useState<CompetitionSet[]>([]);
  const [userProperties, setUserProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<CompetitionSet | null>(null);
  const [deletingSetId, setDeletingSetId] = useState<string | null>(null);
  const [expandedSetId, setExpandedSetId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch competition sets
  const fetchCompetitionSets = async () => {
    try {
      const response = await authenticatedFetch('/api/competition-sets');

      if (response.status === 401) {
        return; // handleUnauthorized already called by authenticatedFetch
      }

      if (!response.ok) {
        throw new Error('Failed to fetch competition sets');
      }

      const data = await response.json();
      setCompetitionSets(data.sets || []);
    } catch (error) {
      console.error('Error fetching competition sets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load competition sets',
        variant: 'destructive',
      });
    }
  };

  // Fetch user properties (for the dialog)
  const fetchUserProperties = async () => {
    try {
      const response = await authenticatedFetch('/api/landlord/properties');

      if (response.status === 401) {
        return; // handleUnauthorized already called by authenticatedFetch
      }

      if (response.ok) {
        const data = await response.json();
        setUserProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Error fetching user properties:', error);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchCompetitionSets(),
        fetchUserProperties(),
      ]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Fetch detailed competition set (with competitors)
  const fetchCompetitionSetDetails = async (setId: string) => {
    try {
      const response = await authenticatedFetch(`/api/competition-sets/${setId}`);

      if (response.status === 401) {
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch competition set details');
      }

      const data = await response.json();
      
      // Update the set in the list with full details
      setCompetitionSets(prev =>
        prev.map(set => set.id === setId ? data : set)
      );
      
      return data;
    } catch (error) {
      console.error('Error fetching competition set details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load competition set details',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Create or update competition set
  const handleSubmit = async (formData: any) => {
    try {
      const url = editingSet
        ? `/api/competition-sets/${editingSet.id}`
        : '/api/competition-sets';
      
      const method = editingSet ? 'PATCH' : 'POST';

      const response = await authenticatedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          ownPropertyIds: formData.ownPropertyIds,
          alertsEnabled: formData.alertsEnabled,
        }),
      });

      if (response.status === 401) {
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save competition set');
      }

      const savedSet = await response.json();

      // Add competitors if this is a new set and has competitors
      if (!editingSet && formData.competitors.length > 0) {
        await Promise.all(
          formData.competitors.map(async (competitor: any) => {
            try {
              await authenticatedFetch(`/api/competition-sets/${savedSet.id}/competitors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(competitor),
              });
            } catch (err) {
              console.error('Error adding competitor:', err);
            }
          })
        );
      }

      // Refresh the list
      await fetchCompetitionSets();

      setEditingSet(null);
      setIsDialogOpen(false);

      toast({
        title: 'Success',
        description: editingSet
          ? 'Competition set updated successfully'
          : 'Competition set created successfully',
      });
    } catch (error) {
      console.error('Error saving competition set:', error);
      throw error;
    }
  };

  // Delete competition set
  const handleDelete = async (setId: string) => {
    if (!confirm('Are you sure you want to delete this competition set? This will also remove all tracked competitors.')) {
      return;
    }

    setDeletingSetId(setId);

    try {
      const response = await authenticatedFetch(`/api/competition-sets/${setId}`, {
        method: 'DELETE',
      });

      if (response.status === 401) {
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to delete competition set');
      }

      setCompetitionSets(prev => prev.filter(set => set.id !== setId));

      toast({
        title: 'Success',
        description: 'Competition set deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting competition set:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete competition set',
        variant: 'destructive',
      });
    } finally {
      setDeletingSetId(null);
    }
  };

  // Edit competition set
  const handleEdit = async (set: CompetitionSet) => {
    // Fetch full details if not already loaded
    const fullSet = set.competitors ? set : await fetchCompetitionSetDetails(set.id);
    
    if (fullSet) {
      setEditingSet(fullSet);
      setIsDialogOpen(true);
    }
  };

  // Toggle expanded view
  const toggleExpanded = async (setId: string) => {
    if (expandedSetId === setId) {
      setExpandedSetId(null);
    } else {
      // Fetch details if not already loaded
      const set = competitionSets.find(s => s.id === setId);
      if (set && !set.competitors) {
        await fetchCompetitionSetDetails(setId);
      }
      setExpandedSetId(setId);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card variant="elevated">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-400" />
                Competition Sets
              </CardTitle>
              <CardDescription className="mt-2">
                Track competitor pricing, concessions, and availability across multiple properties
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setEditingSet(null);
                setIsDialogOpen(true);
              }}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Set
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Competition Sets List */}
      {competitionSets.length === 0 ? (
        <Card variant="elevated">
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Competition Sets Yet
            </h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Create your first competition set to start tracking competitor pricing and
              activity across your properties.
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Set
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {competitionSets.map((set) => (
            <Card
              key={set.id}
              variant="elevated"
              className="hover:border-purple-500/30 transition-all"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">
                        {set.name}
                      </h3>
                      {set.alertsEnabled ? (
                        <Badge variant="success" className="flex items-center gap-1">
                          <Bell className="w-3 h-3" />
                          Alerts On
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <BellOff className="w-3 h-3" />
                          Alerts Off
                        </Badge>
                      )}
                    </div>
                    {set.description && (
                      <p className="text-white/60 text-sm">{set.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(set)}
                      className="text-white/60 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(set.id)}
                      disabled={deletingSetId === set.id}
                      className="text-white/60 hover:text-red-400"
                    >
                      {deletingSetId === set.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-white/60">Your Properties</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {set.ownPropertyIds.length}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-white/60">Competitors</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {set.competitorCount || set.competitors?.length || 0}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Bell className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-white/60">Status</span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {set.alertsEnabled ? 'Monitoring' : 'Inactive'}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedSetId === set.id && set.competitors && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold text-white mb-3">
                      Tracked Competitors
                    </h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {set.competitors.length === 0 ? (
                        <p className="text-white/50 text-sm text-center py-4">
                          No competitors added yet
                        </p>
                      ) : (
                        set.competitors.map((competitor) => (
                          <div
                            key={competitor.id}
                            className="p-3 rounded-lg bg-muted/50 border border-border"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <MapPin className="w-3 h-3 text-purple-400" />
                                  <span className="text-sm text-white">
                                    {competitor.address}
                                  </span>
                                </div>
                                {(competitor.bedrooms || competitor.bathrooms || competitor.currentRent) && (
                                  <div className="flex items-center gap-3 text-xs text-white/60 ml-5">
                                    {competitor.bedrooms && competitor.bathrooms && (
                                      <span>{competitor.bedrooms}bd / {competitor.bathrooms}ba</span>
                                    )}
                                    {competitor.currentRent && (
                                      <span className="text-green-400 font-medium">
                                        ${competitor.currentRent.toLocaleString()}/mo
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              {competitor.source && (
                                <Badge variant="secondary" className="text-xs">
                                  {competitor.source}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Toggle Details Button */}
                <div className="pt-4 border-t border-border mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(set.id)}
                    className="text-white/60 hover:text-white w-full"
                  >
                    {expandedSetId === set.id ? 'Hide Details' : 'View Details'}
                  </Button>
                </div>

                {/* Last Updated */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-white/40">
                    Last updated: {new Date(set.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <CompetitionSetDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingSet(null);
          }
        }}
        onSubmit={handleSubmit}
        editData={editingSet ? {
          id: editingSet.id,
          name: editingSet.name,
          description: editingSet.description ?? undefined,
          ownPropertyIds: editingSet.ownPropertyIds,
          alertsEnabled: editingSet.alertsEnabled,
          competitors: editingSet.competitors?.map(c => ({
            id: c.id,
            address: c.address,
            bedrooms: c.bedrooms ?? undefined,
            bathrooms: typeof c.bathrooms === 'string' ? parseFloat(c.bathrooms) : c.bathrooms ?? undefined,
            currentRent: typeof c.currentRent === 'string' ? parseFloat(c.currentRent) : c.currentRent ?? undefined,
            source: c.source,
          })),
        } : undefined}
        userProperties={userProperties}
      />
    </div>
  );
}
