import React, { useState } from 'react';
import { Heart, Eye, Star, MapPin, Car, Clock, Check, TrendingUp, AlertTriangle, Target, DollarSign, Calendar, Home, Wifi, ParkingCircle, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ModernApartmentCardProps {
  apartment: {
    id: string;
    name: string;
    address: string;
    price: number;
    aiMatchScore: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    isTopPick?: boolean;
    budgetMatch?: boolean;
    amenityMatch?: boolean;
    lifestyleMatch?: boolean;
    locationScore?: number;
    combinedScore?: number;
    savings?: number;
    walkScore?: number;
    transitScore?: number;
    bikeScore?: number;
    yearBuilt?: number;
    petPolicy?: string;
    parking?: string;
    utilities?: string[];
    marketAverage?: number;
    apartmentIQData?: {
      currentRent: number;
      originalRent: number;
      concessions: {
        type: string;
        value: number;
        description: string;
      }[];
      negotiationPotential: {
        score: number;
        factors: string[];
      };
      landlordLossIndicator: {
        days30: number;
        days60: number;
        days90: number;
      };
    };
    poiDistances?: { [key: string]: { distance: string; driveTime: number } };
  };
  pointsOfInterest?: { id: string; name?: string; distance?: string; driveTime?: number }[];
  onSave?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onMakeOffer?: (id: string) => void;
  saved?: boolean;
}

const ModernApartmentCard: React.FC<ModernApartmentCardProps> = ({
  apartment,
  pointsOfInterest = [],
  onSave,
  onViewDetails,
  onMakeOffer,
  saved = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'from-emerald-400 to-green-500';
    if (score >= 80) return 'from-yellow-400 to-amber-500';
    if (score >= 70) return 'from-orange-400 to-red-400';
    return 'from-red-400 to-rose-500';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const formatSavings = (savings: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(savings);
  };

  const getLossColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage <= 30) return 'text-green-400';
    if (percentage <= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card 
      className="group relative overflow-hidden bg-gradient-to-br from-slate-800/40 via-slate-800/30 to-slate-900/40 border-0 shadow-2xl shadow-black/20 hover:shadow-3xl hover:shadow-blue-500/10 transition-all duration-500 backdrop-blur-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating AI Top Pick Badge */}
      {apartment.isTopPick && (
        <div className="absolute -top-3 -right-3 z-30">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-pulse-glow">
              <Star className="w-8 h-8 text-white" fill="currentColor" />
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/30 to-green-500/30 animate-ping"></div>
          </div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap shadow-lg">
            AI TOP PICK
          </div>
        </div>
      )}

      {/* Glass morphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
      
      <CardContent className="p-0 relative">
        {/* Header Section with Flowing Design */}
        <div className="relative p-8 pb-6">
          <div className="flex items-start gap-6">
            {/* Property Image - More Prominent */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-slate-600/30 via-slate-700/40 to-slate-800/50 flex items-center justify-center border border-slate-500/20 shadow-xl overflow-hidden backdrop-blur-sm">
                <div className="text-center text-slate-300">
                  <Home className="w-10 h-10 mx-auto mb-2 opacity-60" />
                  <div className="text-xs opacity-50">Property</div>
                  <div className="text-xs opacity-50">Photo</div>
                </div>
              </div>
              
              {/* Floating Match Score */}
              <div className="absolute -bottom-3 -right-3 z-20">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getScoreGradient(apartment.combinedScore || apartment.aiMatchScore)} flex items-center justify-center shadow-xl backdrop-blur-sm transform transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{apartment.combinedScore || apartment.aiMatchScore}</div>
                    <div className="text-xs text-white/80">SCORE</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Info with Flowing Typography */}
            <div className="flex-1 min-w-0">
              <div className="space-y-3">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-1 leading-tight">{apartment.name}</h3>
                  <p className="text-muted-foreground/80 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400/60" />
                    {apartment.address}
                  </p>
                </div>
                
                {/* Property Details */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="font-medium">{apartment.bedrooms}bd</span>
                  <span className="font-medium">{apartment.bathrooms}ba</span>
                  <span className="font-medium">{apartment.sqft} sqft</span>
                  {apartment.yearBuilt && (
                    <span className="text-blue-400/70">Built {apartment.yearBuilt}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons - Floating Style */}
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onSave?.(apartment.id)}
                className={`w-10 h-10 rounded-xl transition-all duration-300 ${saved ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20' : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'}`}
              >
                <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onViewDetails?.(apartment.id)}
                className="w-10 h-10 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-300"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Pricing Section */}
        <div className="relative px-8 pb-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-700/20 via-slate-800/30 to-slate-900/40 border border-slate-600/20 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5" />
            
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <div className="flex items-baseline gap-3">
                    {apartment.apartmentIQData?.originalRent && apartment.apartmentIQData.originalRent > apartment.price && (
                      <div className="text-lg line-through text-slate-400">
                        ${apartment.apartmentIQData.originalRent.toLocaleString()}
                      </div>
                    )}
                    <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                      ${apartment.price.toLocaleString()}/mo
                    </div>
                  </div>
                  
                  {apartment.apartmentIQData?.concessions && apartment.apartmentIQData.concessions.length > 0 && (
                    <div className="text-sm font-semibold text-emerald-400">
                      {apartment.apartmentIQData.concessions[0].description}
                    </div>
                  )}
                </div>
                
                {apartment.savings && (
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-400">
                      {formatSavings(apartment.savings)}
                    </div>
                    <div className="text-xs text-emerald-400/70">Monthly Savings</div>
                  </div>
                )}
              </div>

              {/* Enhanced ApartmentIQ Analysis */}
              {apartment.apartmentIQData && (
                <div 
                  className="cursor-pointer"
                  onClick={() => setExpandedSection(expandedSection === 'iq' ? null : 'iq')}
                >
                  <div className="bg-gradient-to-r from-slate-800/40 to-slate-700/30 rounded-2xl p-4 border border-slate-600/20 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        ApartmentIQ Analysis
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {Math.round((apartment.savings || 0) / (apartment.apartmentIQData.originalRent || apartment.price) * 100 * 2)}% Savings Ratio
                      </span>
                    </div>
                    
                    {expandedSection === 'iq' ? (
                      <div className="space-y-3 animate-fade-in">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Lease Savings:</span>
                            <span className="text-emerald-400 font-semibold">
                              {formatSavings((apartment.savings || 0) * 12)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Negotiation Potential:</span>
                            <span className="text-emerald-400 font-semibold">
                              {apartment.apartmentIQData.negotiationPotential?.score || 9}/10
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground opacity-70">
                        Click to expand detailed analysis
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Landlord Loss Indicator - Modern Timeline */}
        {apartment.apartmentIQData?.landlordLossIndicator && (
          <div className="px-8 pb-6">
            <div 
              className="cursor-pointer"
              onClick={() => setExpandedSection(expandedSection === 'loss' ? null : 'loss')}
            >
              <div className="bg-gradient-to-r from-slate-800/30 to-slate-700/20 rounded-2xl p-5 border border-slate-600/20 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Landlord Loss Timeline
                  </h4>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                    Opportunity Window
                  </Badge>
                </div>
                
                <div className="relative">
                  {/* Modern Progress Visualization */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-center flex-1">
                      <div className="text-lg font-bold text-green-400">
                        {formatSavings(apartment.apartmentIQData.landlordLossIndicator.days30)}
                      </div>
                      <div className="text-xs text-muted-foreground">30 Days</div>
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-lg font-bold text-yellow-400">
                        {formatSavings(apartment.apartmentIQData.landlordLossIndicator.days60)}
                      </div>
                      <div className="text-xs text-muted-foreground">60 Days</div>
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-lg font-bold text-red-400">
                        {formatSavings(apartment.apartmentIQData.landlordLossIndicator.days90)}
                      </div>
                      <div className="text-xs text-muted-foreground">90 Days</div>
                    </div>
                  </div>
                  
                  {/* Flowing Progress Bar */}
                  <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-yellow-400/20 to-red-400/20 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Match Indicators - Flowing Design */}
        <div className="px-8 pb-6">
          <div className="flex items-center gap-4 flex-wrap">
            {[
              { match: apartment.budgetMatch, label: 'Budget Match', icon: DollarSign },
              { match: apartment.amenityMatch, label: 'Amenities Match', icon: Check },
              { match: apartment.lifestyleMatch, label: 'Lifestyle Match', icon: TrendingUp }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  item.match 
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20' 
                    : 'bg-slate-700/30 text-slate-500'
                }`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  item.match ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Commute Times - Badge Style */}
        {pointsOfInterest.length > 0 && apartment.poiDistances && (
          <div className="px-8 pb-6">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Commute Times
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(apartment.poiDistances).slice(0, 4).map(([poiId, data]) => {
                const time = data.driveTime;
                const color = time <= 10 ? 'from-emerald-400 to-green-500' : 
                             time <= 20 ? 'from-yellow-400 to-amber-500' : 
                             'from-red-400 to-rose-500';
                
                return (
                  <div key={poiId} className={`bg-gradient-to-r ${color} rounded-full px-4 py-2 flex items-center gap-2 shadow-lg`}>
                    <Car className="w-3 h-3 text-white" />
                    <span className="text-white font-medium text-sm">{time}min</span>
                    <span className="text-white/80 text-xs">{poiId}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Utilities & Features - Integrated Design */}
        {apartment.utilities && apartment.utilities.length > 0 && (
          <div className="px-8 pb-6">
            <div className="bg-gradient-to-r from-slate-800/20 to-slate-700/20 rounded-2xl p-4 border border-slate-600/20 backdrop-blur-sm">
              <h5 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Waves className="w-4 h-4 text-blue-400" />
                Included Utilities
              </h5>
              <div className="flex flex-wrap gap-2">
                {apartment.utilities.map((utility, index) => {
                  const Icon = utility === 'Internet' ? Wifi : 
                              utility === 'Parking' ? ParkingCircle : 
                              Waves;
                  
                  return (
                    <div key={index} className="flex items-center gap-2 bg-blue-500/10 rounded-xl px-3 py-1 border border-blue-500/20">
                      <Icon className="w-3 h-3 text-blue-400" />
                      <span className="text-xs text-blue-400 font-medium">{utility}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Action Bar - Floating Modern Design */}
        <div className="px-8 pb-8">
          <div className="flex gap-3">
            <Button 
              size="sm" 
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20 rounded-xl"
              onClick={() => onViewDetails?.(apartment.id)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 border-slate-600/50 hover:bg-slate-700/50 rounded-xl backdrop-blur-sm"
              onClick={() => onSave?.(apartment.id)}
            >
              <Heart className={`w-4 h-4 mr-2 ${saved ? 'fill-current text-red-400' : ''}`} />
              {saved ? 'Saved' : 'Save'}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="px-4 border-emerald-600/50 text-emerald-400 hover:bg-emerald-600/10 rounded-xl backdrop-blur-sm"
              onClick={() => onMakeOffer?.(apartment.id)}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Make Offer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernApartmentCard;