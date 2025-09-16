import React, { useState } from 'react';
import { Heart, Eye, Share2, MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ApartmentData {
  id: string;
  name: string;
  address: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  aiMatchScore: number;
  combinedScore?: number;
  locationScore?: number;
  budgetMatch?: boolean;
  amenityMatch?: boolean;
  lifestyleMatch?: boolean;
  isTopPick?: boolean;
}

interface CompactApartmentCardProps {
  apartment: ApartmentData;
  onFavorite?: (id: string) => void;
  onViewDetails?: (apartment: ApartmentData) => void;
  onShare?: (id: string) => void;
  isFavorited?: boolean;
  className?: string;
}

const CompactApartmentCard: React.FC<CompactApartmentCardProps> = ({
  apartment,
  onFavorite,
  onViewDetails,
  onShare,
  isFavorited = false,
  className = ""
}) => {
  const [localFavorited, setLocalFavorited] = useState(isFavorited);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalFavorited(!localFavorited);
    onFavorite?.(apartment.id);
  };

  const handleViewDetails = () => {
    onViewDetails?.(apartment);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(apartment.id);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-500/20 border-green-500/30';
    if (score >= 80) return 'bg-yellow-500/20 border-yellow-500/30';
    if (score >= 70) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    return 'Poor';
  };

  const displayScore = apartment.combinedScore || apartment.aiMatchScore;

  return (
    <Card 
      className={`apartment-card bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/60 transition-all duration-200 cursor-pointer ${
        apartment.isTopPick ? 'ring-1 ring-green-500/30' : ''
      } ${className}`}
      onClick={handleViewDetails}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Property Info */}
          <div className="flex-1 min-w-0 pr-4">
            {/* Property Name and Address */}
            <div className="mb-3">
              <h3 className="text-lg font-bold text-foreground mb-1 truncate">{apartment.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{apartment.address}</span>
              </p>
              <div className="text-xl font-bold text-green-400 mb-2">${apartment.price.toLocaleString()}/mo</div>
              {apartment.bedrooms && apartment.bathrooms && apartment.sqft && (
                <div className="text-sm text-muted-foreground flex items-center gap-4">
                  <span>{apartment.bedrooms}bd</span>
                  <span>{apartment.bathrooms}ba</span>
                  <span>{apartment.sqft} sqft</span>
                </div>
              )}
            </div>

            {/* Preference Matches */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="flex items-center gap-1">
                <Check className={`w-3 h-3 ${apartment.budgetMatch ? 'text-green-400' : 'text-slate-500'}`} />
                <span className={`text-xs ${apartment.budgetMatch ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Budget Match
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Check className={`w-3 h-3 ${apartment.amenityMatch ? 'text-green-400' : 'text-slate-500'}`} />
                <span className={`text-xs ${apartment.amenityMatch ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Amenities Match
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Check className={`w-3 h-3 ${apartment.lifestyleMatch ? 'text-green-400' : 'text-slate-500'}`} />
                <span className={`text-xs ${apartment.lifestyleMatch ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Lifestyle Match
                </span>
              </div>
            </div>
          </div>

          {/* Right Section - Score and Actions */}
          <div className="flex flex-col items-end gap-3">
            {/* AI Score Circle */}
            <div className={`w-16 h-16 rounded-full ${getScoreBg(displayScore)} flex flex-col items-center justify-center flex-shrink-0`}>
              <div className={`text-xl font-bold ${getScoreColor(displayScore)}`}>
                {displayScore}
              </div>
            </div>

            {/* Score Details */}
            <div className="text-right text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">AI Match:</span>
                <span className="text-orange-400 font-medium">{apartment.aiMatchScore}%</span>
              </div>
              <div className={`text-xs font-medium ${getScoreColor(displayScore)}`}>
                {getScoreLabel(displayScore)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleFavorite}
                className={`w-7 h-7 p-0 transition-all duration-200 ${
                  localFavorited
                    ? 'bg-red-500/20 border-red-500/30 text-red-400'
                    : 'bg-slate-700/30 border-slate-600/50 text-slate-400 hover:text-red-400'
                }`}
              >
                <Heart className={`w-3 h-3 ${localFavorited ? 'fill-current' : ''}`} />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-7 h-7 p-0 bg-slate-700/30 border-slate-600/50"
                onClick={handleViewDetails}
              >
                <Eye className="w-3 h-3" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-7 h-7 p-0 bg-slate-700/30 border-slate-600/50"
                onClick={handleShare}
              >
                <Share2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactApartmentCard;