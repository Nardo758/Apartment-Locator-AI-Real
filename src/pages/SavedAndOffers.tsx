import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Grid,
  List,
  Download,
  Trash2,
  Home,
  MapPin,
  Calendar,
  ExternalLink,
  Building2,
  Bed,
  Bath,
  Maximize
} from 'lucide-react';
import { useSavedScrapedProperties, type SavedPropertyData } from '@/hooks/useSavedScrapedProperties';
import { useState } from 'react';

type ViewMode = 'grid' | 'list';

function formatRent(min?: number, max?: number): string {
  if (!min && !max) return 'Contact';
  if (min && max && min !== max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  return `$${(min || max || 0).toLocaleString()}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

function PropertyImage({ imageUrl, name, id }: { imageUrl?: string; name: string; id: string }) {
  const [imgError, setImgError] = useState(false);

  if (!imageUrl || imgError) {
    return (
      <div className="w-full h-48 bg-muted flex items-center justify-center" data-testid={`img-fallback-saved-${id}`}>
        <div className="flex flex-col items-center gap-1 text-muted-foreground">
          <Building2 className="w-8 h-8" />
          <span className="text-xs">No image</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 bg-muted">
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
        data-testid={`img-saved-property-${id}`}
      />
    </div>
  );
}

export default function SavedAndOffers() {
  const navigate = useNavigate();
  const { saved, removeSaved } = useSavedScrapedProperties();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const handleExport = () => {
    if (saved.length === 0) return;
    const headers = ['Name', 'Address', 'City', 'Rent', 'Bedrooms', 'Saved Date'];
    const rows = saved.map((apt) => [
      apt.name,
      apt.address,
      apt.city,
      formatRent(apt.min_rent, apt.max_rent),
      apt.bedrooms_min ? `${apt.bedrooms_min}` : 'N/A',
      formatDate(apt.savedAt),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saved-apartments.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <div className="border-b pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="heading-my-apartments">
              My Apartments
            </h1>
            <p className="text-muted-foreground">
              Track your favorite properties and compare them side by side
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
          <div className="flex items-center gap-3">
            <Button
              data-testid="button-view-grid"
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              data-testid="button-view-list"
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Badge variant="secondary">{saved.length} saved</Badge>
          </div>
          <div className="flex items-center gap-3">
            {saved.length > 0 && (
              <Button data-testid="button-export" variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </div>

        {saved.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No saved properties yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Save properties you like from the Dashboard or Browse Properties page by clicking the heart icon
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button data-testid="button-go-dashboard" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
                <Button data-testid="button-go-browse" variant="outline" onClick={() => navigate('/browse-properties')}>
                  Browse Properties
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {saved.map((property) => (
              <SavedPropertyCard
                key={property.id}
                property={property}
                onRemove={removeSaved}
                onViewDetails={() => navigate(`/scraped-property/${property.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {saved.map((property) => (
              <SavedPropertyListItem
                key={property.id}
                property={property}
                onRemove={removeSaved}
                onViewDetails={() => navigate(`/scraped-property/${property.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SavedPropertyCard({
  property,
  onRemove,
  onViewDetails,
}: {
  property: SavedPropertyData;
  onRemove: (id: string) => void;
  onViewDetails: () => void;
}) {
  return (
    <Card
      className="cursor-pointer hover-elevate"
      data-testid={`card-saved-property-${property.id}`}
    >
      <div className="relative">
        <PropertyImage imageUrl={property.image_url} name={property.name} id={property.id} />
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 bg-background/70 backdrop-blur-sm"
          data-testid={`button-unsave-${property.id}`}
          onClick={(e) => { e.stopPropagation(); onRemove(property.id); }}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground mb-1" data-testid={`text-saved-name-${property.id}`}>
          {property.name}
        </h3>
        {property.address && (
          <div className="flex items-center text-muted-foreground text-sm mb-3 gap-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{property.address}{property.city ? `, ${property.city}` : ''}</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-lg font-bold text-foreground" data-testid={`text-saved-rent-${property.id}`}>
              {formatRent(property.min_rent, property.max_rent)}
            </div>
            <div className="text-xs text-muted-foreground">per month</div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3 flex-wrap">
          {property.bedrooms_min != null && (
            <div className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5" />
              {property.bedrooms_min}{property.bedrooms_max && property.bedrooms_max !== property.bedrooms_min ? `-${property.bedrooms_max}` : ''} bd
            </div>
          )}
          {property.bathrooms_min != null && (
            <div className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" />
              {property.bathrooms_min} ba
            </div>
          )}
          {property.sqft != null && (
            <div className="flex items-center gap-1">
              <Maximize className="w-3.5 h-3.5" />
              {property.sqft.toLocaleString()} sqft
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <Calendar className="w-3 h-3" />
          Saved {formatDate(property.savedAt)}
        </div>

        <div className="flex gap-2">
          <Button
            data-testid={`button-view-details-${property.id}`}
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
          >
            View Details
          </Button>
          {property.website_url && (
            <Button
              data-testid={`button-visit-website-${property.id}`}
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); window.open(property.website_url!, '_blank'); }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SavedPropertyListItem({
  property,
  onRemove,
  onViewDetails,
}: {
  property: SavedPropertyData;
  onRemove: (id: string) => void;
  onViewDetails: () => void;
}) {
  return (
    <Card
      className="cursor-pointer hover-elevate"
      data-testid={`card-saved-list-${property.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-16 rounded-md bg-muted shrink-0 overflow-hidden">
            {property.image_url ? (
              <img src={property.image_url} alt={property.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Building2 className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{property.name}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {property.address}{property.city ? `, ${property.city}` : ''}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="font-bold text-foreground">{formatRent(property.min_rent, property.max_rent)}</div>
            <div className="text-xs text-muted-foreground">
              {property.bedrooms_min ? `${property.bedrooms_min} bd` : ''}
              {property.bathrooms_min ? ` / ${property.bathrooms_min} ba` : ''}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              data-testid={`button-list-view-details-${property.id}`}
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
            >
              View
            </Button>
            <Button
              data-testid={`button-list-remove-${property.id}`}
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); onRemove(property.id); }}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
