import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Filter, 
  X, 
  MapPin, 
  Building2, 
  AlertTriangle,
  Users,
  RotateCcw
} from 'lucide-react';
import { authenticatedFetch } from '@/lib/authHelpers';
import type { PropertyFilterOptions, CompetitionSet } from '@/types/landlord.types';

interface PropertyFiltersProps {
  filters: PropertyFilterOptions;
  onFiltersChange: (filters: PropertyFilterOptions) => void;
  availableCities?: string[];
  availableCompetitionSets?: CompetitionSet[];
  resultCount?: number;
  className?: string;
}

export function PropertyFilters({ 
  filters, 
  onFiltersChange,
  availableCities = [],
  availableCompetitionSets = [],
  resultCount,
  className = ''
}: PropertyFiltersProps) {
  const [cities, setCities] = useState<string[]>(availableCities);
  const [competitionSets, setCompetitionSets] = useState(availableCompetitionSets);
  const [loading, setLoading] = useState(false);

  // Fetch cities if not provided
  useEffect(() => {
    if (availableCities.length === 0) {
      fetchCities();
    }
  }, [availableCities]);

  // Fetch competition sets if not provided
  useEffect(() => {
    if (availableCompetitionSets.length === 0) {
      fetchCompetitionSets();
    }
  }, [availableCompetitionSets]);

  const fetchCities = async () => {
    try {
      const response = await authenticatedFetch('/api/landlord/properties/cities');
      
      if (response.status === 401) {
        return; // handleUnauthorized already called by authenticatedFetch
      }
      
      if (response.ok) {
        const data = await response.json();
        setCities(data.cities || []);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchCompetitionSets = async () => {
    try {
      const response = await authenticatedFetch('/api/competition-sets');
      
      if (response.status === 401) {
        return; // handleUnauthorized already called by authenticatedFetch
      }
      
      if (response.ok) {
        const data = await response.json();
        setCompetitionSets(data.sets || []);
      }
    } catch (error) {
      console.error('Error fetching competition sets:', error);
    }
  };

  const handleFilterChange = (key: keyof PropertyFilterOptions, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? undefined : value,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      city: undefined,
      status: 'all',
      vacancyRisk: 'all',
      competitionSet: undefined,
    });
  };

  const activeFilterCount = [
    filters.city,
    filters.status && filters.status !== 'all',
    filters.vacancyRisk && filters.vacancyRisk !== 'all',
    filters.competitionSet,
  ].filter(Boolean).length;

  const riskColors = {
    low: 'text-green-400 bg-green-500/10 border-green-500/30',
    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    high: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  return (
    <Card variant="elevated" className={className}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-7 text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* City Filter */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            City
          </label>
          <Select
            value={filters.city || 'all'}
            onValueChange={(value) => handleFilterChange('city', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            Status
          </label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="occupied">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Occupied
                </div>
              </SelectItem>
              <SelectItem value="vacant">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  Vacant
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Vacancy Risk Filter */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            Vacancy Risk
          </label>
          <Select
            value={filters.vacancyRisk || 'all'}
            onValueChange={(value) => handleFilterChange('vacancyRisk', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Risk Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Low Risk
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  Medium Risk
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  High Risk
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Competition Set Filter */}
        {competitionSets.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Competition Set
            </label>
            <Select
              value={filters.competitionSet || 'all'}
              onValueChange={(value) => handleFilterChange('competitionSet', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Competition Sets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {competitionSets.map((set) => (
                  <SelectItem key={set.id} value={set.id}>
                    {set.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground mb-2">Active Filters:</div>
            <div className="flex flex-wrap gap-2">
              {filters.city && (
                <Badge 
                  variant="secondary" 
                  className="gap-1 cursor-pointer hover:bg-white/10"
                  onClick={() => handleFilterChange('city', 'all')}
                >
                  <MapPin className="w-3 h-3" />
                  {filters.city}
                  <X className="w-3 h-3" />
                </Badge>
              )}
              {filters.status && filters.status !== 'all' && (
                <Badge 
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-white/10"
                  onClick={() => handleFilterChange('status', 'all')}
                >
                  <Building2 className="w-3 h-3" />
                  {filters.status}
                  <X className="w-3 h-3" />
                </Badge>
              )}
              {filters.vacancyRisk && filters.vacancyRisk !== 'all' && (
                <Badge 
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-white/10"
                  onClick={() => handleFilterChange('vacancyRisk', 'all')}
                >
                  <AlertTriangle className="w-3 h-3" />
                  {filters.vacancyRisk}
                  <X className="w-3 h-3" />
                </Badge>
              )}
              {filters.competitionSet && (
                <Badge 
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-white/10"
                  onClick={() => handleFilterChange('competitionSet', 'all')}
                >
                  <Users className="w-3 h-3" />
                  {competitionSets.find(s => s.id === filters.competitionSet)?.name || 'Set'}
                  <X className="w-3 h-3" />
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Result Count */}
        {resultCount !== undefined && (
          <div className="pt-3 border-t border-border">
            <div className="text-sm text-muted-foreground text-center">
              {resultCount} {resultCount === 1 ? 'property' : 'properties'} found
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
