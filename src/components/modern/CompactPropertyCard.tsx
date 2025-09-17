import React, { useState } from 'react';
import { Heart, Eye, Star, MapPin, Car, Clock, Check, TrendingUp, AlertTriangle, Target, DollarSign, Calendar, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface CompactPropertyCardProps {
  property: {
    id: string;
    name: string;
    address: string;
    price: number;
    aiMatchScore: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    isTopPick?: boolean;
    combinedScore?: number;
    savings?: number;
    poiTimes?: Array<{
      poiId: string;
      poiName: string;
      time: number;
      color: 'green' | 'yellow' | 'red';
    }>;
  };
  isSelected?: boolean;
  onClick?: () => void;
}

const CompactPropertyCard: React.FC<CompactPropertyCardProps> = ({
  property,
  isSelected = false,
  onClick
}) => {
  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'from-emerald-400 to-green-500';
    if (score >= 80) return 'from-yellow-400 to-amber-500';
    if (score >= 70) return 'from-orange-400 to-red-400';
    return 'from-red-400 to-rose-500';
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 backdrop-blur-sm ${
        isSelected 
          ? 'ring-2 ring-blue-500/60 bg-blue-500/10 shadow-xl shadow-blue-500/20 scale-105' 
          : 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/60 hover:scale-105'
      } ${property.isTopPick ? 'ring-1 ring-emerald-500/40' : ''}`}
      onClick={onClick}
    >
      {/* Floating AI Top Pick Badge */}
      {property.isTopPick && (
        <div className="absolute -top-2 -right-2 z-20">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
            <Star className="w-4 h-4 text-white" fill="currentColor" />
          </div>
        </div>
      )}

      <CardContent className="p-4 relative">
        <div className="flex items-start gap-3">
          {/* Property Image */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-600/40 via-slate-700/50 to-slate-800/60 flex items-center justify-center border border-slate-500/30 shadow-lg overflow-hidden backdrop-blur-sm">
              <Home className="w-6 h-6 text-slate-300 opacity-70" />
            </div>
            
            {/* Floating Score Badge */}
            <div className="absolute -bottom-2 -right-2 z-10">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${getScoreGradient(property.combinedScore || property.aiMatchScore)} flex items-center justify-center shadow-lg`}>
                <span className="text-xs font-bold text-white">{property.combinedScore || property.aiMatchScore}</span>
              </div>
            </div>
          </div>

          {/* Property Info */}
          <div className="flex-1 min-w-0">
            <div className="space-y-2">
              <div>
                <h4 className="font-semibold text-foreground text-sm truncate leading-tight">{property.name}</h4>
                <p className="text-xs text-muted-foreground/80 truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-400/60 flex-shrink-0" />
                  {property.address}
                </p>
              </div>
              
              {/* Pricing Section */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                    ${property.price.toLocaleString()}/mo
                  </div>
                  {property.savings && (
                    <div className="text-xs text-emerald-400 font-medium">
                      Save ${property.savings}
                    </div>
                  )}
                </div>
                
                {/* Property Details */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground/80">
                  <span className="font-medium">{property.bedrooms}bd</span>
                  <span className="font-medium">{property.bathrooms}ba</span>
                  <span className="font-medium">{property.sqft} sqft</span>
                </div>
              </div>

              {/* Quick Commute Times */}
              {property.poiTimes && property.poiTimes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {property.poiTimes.slice(0, 2).map((poi) => (
                    <div 
                      key={poi.poiId}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                        poi.color === 'green' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        poi.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      <Car className="w-3 h-3" />
                      <span>{poi.time}min</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/10 via-transparent to-blue-500/5 pointer-events-none" />
        )}
      </CardContent>
    </Card>
  );
};

export default CompactPropertyCard;