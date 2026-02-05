import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Home, 
  DollarSign, 
  CheckCircle,
  Plus
} from 'lucide-react';
import type { 
  CompetitorProperty, 
  CompetitorSearchResultProps 
} from '@/types/competitionSets.types';

export function CompetitorSearchResult({
  property,
  onAdd,
  isAdded = false,
  isLoading = false,
}: CompetitorSearchResultProps) {
  const formatDistance = (miles?: number) => {
    if (!miles) return null;
    return miles < 1 
      ? `${(miles * 5280).toFixed(0)} ft` 
      : `${miles.toFixed(1)} mi`;
  };

  return (
    <Card 
      variant="elevated" 
      className="hover:border-purple-500/30 transition-all duration-200"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <h4 className="text-base font-semibold text-foreground">
                {property.address}
              </h4>
            </div>
            {property.distance && (
              <p className="text-xs text-muted-foreground ml-6">
                {formatDistance(property.distance)} away
              </p>
            )}
          </div>
          
          {isAdded ? (
            <Badge variant="success" className="flex items-center gap-1 flex-shrink-0">
              <CheckCircle className="w-3 h-3" />
              Added
            </Badge>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onAdd(property)}
              disabled={isLoading}
              className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 flex-shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          )}
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {property.bedrooms !== undefined && property.bathrooms !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <Home className="w-4 h-4 text-blue-400" />
              <span className="text-foreground/80">
                {property.bedrooms}bd / {property.bathrooms}ba
              </span>
            </div>
          )}
          
          {property.squareFeet && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 flex items-center justify-center">
                <span className="text-blue-400 text-xs font-bold">□</span>
              </div>
              <span className="text-foreground/80">
                {property.squareFeet.toLocaleString()} sq ft
              </span>
            </div>
          )}
          
          {property.currentRent && (
            <div className="flex items-center gap-2 text-sm col-span-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-foreground font-semibold">
                ${property.currentRent.toLocaleString()}/mo
              </span>
            </div>
          )}
        </div>

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="pt-3 border-t border-border">
            <div className="flex flex-wrap gap-1.5">
              {property.amenities.slice(0, 4).map((amenity, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className="text-xs"
                >
                  {amenity}
                </Badge>
              ))}
              {property.amenities.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{property.amenities.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Source Badge */}
        {property.source && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground">
              Source: <span className="text-muted-foreground">{property.source}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
