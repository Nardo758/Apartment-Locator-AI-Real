import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Zap, Heart, Eye, MessageCircle, Check } from 'lucide-react';
import { Property } from '../data/mockData';
import { usePropertyState } from '../contexts/PropertyStateContext';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const navigate = useNavigate();
  const { 
    setSelectedProperty, 
    favoriteProperties, 
    setFavoriteProperties 
  } = usePropertyState();

  const isFavorited = favoriteProperties.includes(property.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorited) {
      setFavoriteProperties(favoriteProperties.filter(id => id !== property.id));
      toast({
        title: "Removed from favorites",
        description: "Property removed from your favorites"
      });
    } else {
      setFavoriteProperties([...favoriteProperties, property.id]);
      toast({
        title: "Added to favorites",
        description: "Property saved to your favorites"
      });
    }
  };

  const handleViewDetails = () => {
    setSelectedProperty(property);
    navigate(`/property/${property.id}`);
  };

  const handleGenerateOffer = () => {
    setSelectedProperty(property);
    navigate('/generate-offer');
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

  // Mock data for demonstration
  const isTopPick = property.matchScore >= 85;
  const budgetMatch = property.effectivePrice <= 2500;
  const amenityMatch = true; // Mock value
  const lifestyleMatch = true; // Mock value

  return (
    <Card 
      className={`bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/60 transition-all duration-200 ${
        isTopPick ? 'ring-1 ring-green-500/30' : ''
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          {/* Left Section */}
          <div className="flex items-start gap-4 flex-1">
            {/* Property Image */}
            <div className="w-20 h-20 rounded-lg bg-slate-700/50 border border-slate-600/50 flex items-center justify-center flex-shrink-0">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Property</div>
                <div className="text-xs text-muted-foreground">Image</div>
              </div>
            </div>
            
            {/* Property Details */}
            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-foreground">{property.name}</h3>
                  {isTopPick && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs px-2 py-1">
                      AI TOP PICK
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                  <MapPin className="w-3 h-3" />
                  {property.address}, {property.city}, {property.state}
                </p>
                <div className="text-xl font-bold text-green-400 mb-2">${property.effectivePrice.toLocaleString()}/mo</div>
                <div className="text-sm text-muted-foreground flex items-center gap-4">
                  <span>2bd</span>
                  <span>2ba</span>
                  <span>1,150 sqft</span>
                </div>
              </div>

              {/* Preference Matches */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <Check className={`w-4 h-4 ${budgetMatch ? 'text-green-400' : 'text-slate-500'}`} />
                  <span className={`text-sm ${budgetMatch ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Budget Match
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className={`w-4 h-4 ${amenityMatch ? 'text-green-400' : 'text-slate-500'}`} />
                  <span className={`text-sm ${amenityMatch ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Amenities Match
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className={`w-4 h-4 ${lifestyleMatch ? 'text-green-400' : 'text-slate-500'}`} />
                  <span className={`text-sm ${lifestyleMatch ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Lifestyle Match
                  </span>
                </div>
              </div>

              {/* Commute Times */}
              <div>
                <h4 className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Commute Times
                </h4>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-700/30 border border-slate-600/30">
                    <span className="text-sm text-muted-foreground">My Office</span>
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-green-500/20 text-green-400 border-green-500/30"
                    >
                      5min
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-700/30 border border-slate-600/30">
                    <span className="text-sm text-muted-foreground">Local Gym</span>
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    >
                      15min
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Scores */}
          <div className="flex flex-col items-end gap-3 ml-6">
            {/* Combined Score */}
            <div className={`px-4 py-3 rounded-lg border text-center ${getScoreBg(property.matchScore)}`}>
              <div className="text-xs text-muted-foreground mb-1">Combined Score</div>
              <div className={`text-2xl font-bold ${getScoreColor(property.matchScore)}`}>
                {property.matchScore}
              </div>
            </div>

            {/* Individual Scores */}
            <div className="space-y-2 text-right">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">AI Match:</span>
                <span className="text-sm font-medium text-orange-400">{property.matchScore}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Location:</span>
                <span className="text-sm font-medium text-green-400">92%</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleFavorite}
                className={`w-8 h-8 p-0 transition-all duration-200 ${
                  isFavorited
                    ? 'bg-red-500/20 border-red-500/30 text-red-400'
                    : 'bg-slate-700/30 border-slate-600/50 text-slate-400 hover:text-red-400'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-8 h-8 p-0 bg-slate-700/30 border-slate-600/50"
                onClick={handleViewDetails}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-8 h-8 p-0 bg-slate-700/30 border-slate-600/50"
                onClick={handleGenerateOffer}
              >
                <Zap className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;