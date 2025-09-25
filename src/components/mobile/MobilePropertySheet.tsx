import React, { useState } from 'react';
import { X, Heart, Eye, DollarSign, MapPin, Bed, Bath, Maximize, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useFlowNavigation } from '@/hooks/useFlowNavigation';
import { SmartProperty } from '@/hooks/useLocationIntelligence';

interface MobilePropertySheetProps {
  property: SmartProperty | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (id: string) => void;
  saved?: boolean;
}

export const MobilePropertySheet: React.FC<MobilePropertySheetProps> = ({
  property,
  isOpen,
  onClose,
  onSave,
  saved = false
}) => {
  const { goToPropertyDetails, goToGenerateOffer } = useFlowNavigation();
  
  if (!property) return null;

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'from-emerald-400 to-green-500';
    if (score >= 80) return 'from-yellow-400 to-amber-500';
    if (score >= 70) return 'from-orange-400 to-red-400';
    return 'from-red-400 to-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent Match';
    if (score >= 80) return 'Good Match';
    if (score >= 70) return 'Fair Match';
    return 'Poor Match';
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] bg-slate-900/95 border-t border-slate-700/50"
      >
        <SheetHeader className="space-y-4">
          {/* Header with close button */}
          <div className="flex items-center justify-between">
            <SheetTitle className="text-left">
              <div className="flex items-center gap-3">
                {property.isTopPick && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" fill="currentColor" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-foreground">{property.name}</h3>
                  <p className="text-sm text-muted-foreground">{property.address}</p>
                </div>
              </div>
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Property highlights */}
          <div className="grid grid-cols-3 gap-4 py-4 border-b border-slate-700/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                ${property.price.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">per month</div>
              {property.savings && (
                <div className="text-xs text-green-400">
                  Save ${property.savings}/mo
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${getScoreGradient(property.combinedScore)} flex items-center justify-center`}>
                <span className="text-lg font-bold text-white">{property.combinedScore}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {getScoreLabel(property.combinedScore)}
              </div>
            </div>
            
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-sm">
                <Bed className="w-4 h-4" />
                <span>{property.bedrooms}</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-sm">
                <Bath className="w-4 h-4" />
                <span>{property.bathrooms}</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-sm">
                <Maximize className="w-4 h-4" />
                <span>{property.sqft}</span>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Match indicators */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">AI Match Analysis</h4>
            <div className="grid grid-cols-2 gap-3">
              {property.budgetMatch && (
                <Badge variant="outline" className="justify-center border-green-500/30 text-green-400">
                  <DollarSign className="w-3 h-3 mr-1" />
                  Budget Match
                </Badge>
              )}
              {property.amenityMatch && (
                <Badge variant="outline" className="justify-center border-blue-500/30 text-blue-400">
                  <Star className="w-3 h-3 mr-1" />
                  Amenity Match
                </Badge>
              )}
              {property.lifestyleMatch && (
                <Badge variant="outline" className="justify-center border-purple-500/30 text-purple-400">
                  <Heart className="w-3 h-3 mr-1" />
                  Lifestyle Match
                </Badge>
              )}
            </div>
          </div>

          {/* POI commute times */}
          {property.poiTimes.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Commute Times</h4>
              <div className="space-y-2">
                {property.poiTimes.slice(0, 3).map((poi) => (
                  <div key={poi.poiId} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium">{poi.poiName}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        poi.color === 'green' ? 'border-green-500/30 text-green-400' :
                        poi.color === 'yellow' ? 'border-yellow-500/30 text-yellow-400' :
                        'border-red-500/30 text-red-400'
                      }`}
                    >
                      {poi.time} min
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Property features preview */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Key Features</h4>
            <div className="grid grid-cols-2 gap-2">
              {property.features.slice(0, 4).map((feature, index) => (
                <div key={index} className="text-xs p-2 bg-slate-800/30 rounded-lg text-center">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="border-t border-slate-700/30 pt-4 space-y-3">
          {/* Primary actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => {
                goToPropertyDetails(property.id);
                onClose();
              }}
              variant="outline"
              className="w-full"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            <Button
              onClick={() => {
                goToGenerateOffer(property.id);
                onClose();
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Make Offer
            </Button>
          </div>
          
          {/* Secondary actions */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSave?.(property.id)}
              className={saved ? "text-red-400" : "text-muted-foreground"}
            >
              <Heart className={`w-4 h-4 mr-2 ${saved ? 'fill-current' : ''}`} />
              {saved ? 'Remove from Favorites' : 'Add to Favorites'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};