import React, { useState } from 'react';
import { Star, MapPin, Clock, Check, TrendingUp, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { PointOfInterest, SmartProperty } from '@/hooks/useLocationIntelligence';

interface SmartResultsProps {
  smartResults: SmartProperty[];
  pointsOfInterest: PointOfInterest[];
  userProfile: any;
  getCombinedScore: (propertyId: string) => number;
  onPropertySelect?: (id: string) => void;
  selectedPropertyId?: string | null;
}

const SmartResults: React.FC<SmartResultsProps> = ({
  smartResults,
  pointsOfInterest,
  userProfile,
  getCombinedScore,
  onPropertySelect,
  selectedPropertyId
}) => {
  const [sortBy, setSortBy] = useState<'combinedScore' | 'locationScore' | 'price'>('combinedScore');
  const [filterBy, setFilterBy] = useState<'all' | 'topPicks' | 'budgetMatch'>('all');
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);

  const sortedResults = [...smartResults].sort((a, b) => {
    // Always prioritize AI Top Picks first
    if (a.isTopPick && !b.isTopPick) return -1;
    if (!a.isTopPick && b.isTopPick) return 1;
    
    // Then sort by selected criteria
    switch (sortBy) {
      case 'combinedScore':
        return b.combinedScore - a.combinedScore;
      case 'locationScore':
        return b.locationScore - a.locationScore;
      case 'price':
        return a.price - b.price;
      default:
        return 0;
    }
  });

  const filteredResults = sortedResults.filter(property => {
    switch (filterBy) {
      case 'topPicks':
        return property.isTopPick;
      case 'budgetMatch':
        return property.budgetMatch;
      default:
        return true;
    }
  });

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

  const getPreferencesCount = () => {
    let count = 0;
    if (userProfile?.budget) count++;
    if (userProfile?.amenities?.length > 0) count++;
    if (userProfile?.lifestyle) count++;
    if (userProfile?.priorities?.length > 0) count++;
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Results Header with Controls */}
      <Card className="bg-slate-800/30 border border-slate-700/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                Smart Results
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {filteredResults.length} properties ranked by AI + location scoring
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600/50">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="combinedScore">Combined AI Score</SelectItem>
                  <SelectItem value="locationScore">Location Score</SelectItem>
                  <SelectItem value="price">Price (Low to High)</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                <SelectTrigger className="w-36 bg-slate-700/50 border-slate-600/50">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="topPicks">Top Picks</SelectItem>
                  <SelectItem value="budgetMatch">Budget Match</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Property Results */}
      <div className="space-y-4 w-full">
        {filteredResults.map((property) => (
          <Card 
            key={property.id}
            className={`w-full max-w-none cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 ${
              selectedPropertyId === property.id 
                ? 'ring-2 ring-blue-500/50 bg-blue-500/5 bg-slate-800/40' 
                : 'bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/40'
            } ${
              property.isTopPick ? 'ring-1 ring-green-500/30 bg-gradient-to-r from-green-500/5 to-transparent' : ''
            }`}
            onClick={() => onPropertySelect?.(property.id)}
            onMouseEnter={() => setHoveredProperty(property.id)}
            onMouseLeave={() => setHoveredProperty(null)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-6">
                  {/* Property Image */}
                  <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center border border-slate-600/50">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <div className="text-xs text-muted-foreground">Property</div>
                      <div className="text-xs text-muted-foreground">Image</div>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-1">{property.name}</h3>
                        <p className="text-muted-foreground mb-3">{property.address}</p>
                        {/* Enhanced ApartmentIQ Pricing Display */}
                        <div className="mb-4">
                          <div className="flex items-baseline gap-3 mb-2">
                            <div className="text-lg line-through text-slate-400">$1,200/mo</div>
                            <div className="text-2xl font-bold text-green-400">${property.price.toLocaleString()}/mo</div>
                          </div>
                          <div className="text-sm font-semibold text-green-400 mb-2">
                            2 months free on 12-month lease
                          </div>
                          
                          {/* Enhanced Math Breakdown */}
                          <div className="text-xs text-muted-foreground bg-slate-700/30 rounded p-3 space-y-1">
                            <div className="flex justify-between font-semibold text-green-400 border-b border-slate-600/30 pb-1 mb-2">
                              <span>🎯 ApartmentIQ Analysis:</span>
                              <span>200% Savings Ratio</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Lease Savings:</span>
                              <span className="text-green-400 font-semibold">$2,400</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Negotiation Potential:</span>
                              <span className="text-green-400 font-semibold">9/10</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                          <span>{property.bedrooms}bd</span>
                          <span>{property.bathrooms}ba</span>
                          <span>{property.sqft} sqft</span>
                        </div>
                      </div>
                      {property.isTopPick && (
                        <Badge className="bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border-green-500/30 px-3 py-1">
                          <Star className="w-4 h-4 mr-1" />
                          AI TOP PICK
                        </Badge>
                )}
              </div>

              {/* Additional Property Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Walkability Scores */}
                <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <h5 className="text-sm font-semibold text-foreground mb-2">Walkability</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Walk Score:</span>
                      <span className="font-medium text-foreground">85/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transit:</span>
                      <span className="font-medium text-foreground">78/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bike Score:</span>
                      <span className="font-medium text-foreground">82/100</span>
                    </div>
                  </div>
                </div>

                {/* Property Info */}
                <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <h5 className="text-sm font-semibold text-foreground mb-2">Property Info</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Year Built:</span>
                      <span className="font-medium text-foreground">2020</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pet Policy:</span>
                      <span className="font-medium text-foreground">Dogs & Cats Welcome</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Parking:</span>
                      <span className="font-medium text-foreground">Covered Garage</span>
                    </div>
                  </div>
                </div>

                {/* Utilities & Features */}
                <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <h5 className="text-sm font-semibold text-foreground mb-2">Included</h5>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Water</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Trash</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Internet</span>
                    </div>
                  </div>
                </div>
              </div>
                  </div>
                </div>

                {/* Scores */}
                <div className="text-right space-y-3">
                  <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl border ${getScoreBg(property.combinedScore)}`}>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">Combined Score</div>
                      <div className={`text-3xl font-bold ${getScoreColor(property.combinedScore)}`}>
                        {property.combinedScore}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-6">
                      <span className="text-muted-foreground">AI Match:</span>
                      <span className={`font-semibold ${getScoreColor(property.aiMatchScore)}`}>
                        {property.aiMatchScore}%
                      </span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="text-muted-foreground">Location:</span>
                      <span className={`font-semibold ${getScoreColor(property.locationScore)}`}>
                        {property.locationScore}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preference Matches */}
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Check className={`w-5 h-5 ${property.budgetMatch ? 'text-green-400' : 'text-slate-500'}`} />
                  <span className={`text-sm font-medium ${property.budgetMatch ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Budget Match
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className={`w-5 h-5 ${property.amenityMatch ? 'text-green-400' : 'text-slate-500'}`} />
                  <span className={`text-sm font-medium ${property.amenityMatch ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Amenities Match
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className={`w-5 h-5 ${property.lifestyleMatch ? 'text-green-400' : 'text-slate-500'}`} />
                  <span className={`text-sm font-medium ${property.lifestyleMatch ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Lifestyle Match
                  </span>
                </div>
              </div>

              {/* POI Commute Times */}
              {property.poiTimes.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Commute Times
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {property.poiTimes.map((poiTime) => (
                      <div key={poiTime.poiId} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                        <span className="text-sm text-muted-foreground truncate mr-2">{poiTime.poiName}</span>
                        <Badge 
                          variant="outline" 
                          className={`${
                            poiTime.color === 'green' ? 'border-green-500/50 text-green-400 bg-green-500/10' :
                            poiTime.color === 'yellow' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' :
                            'border-red-500/50 text-red-400 bg-red-500/10'
                          }`}
                        >
                          {poiTime.time}min
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  View Details
                </Button>
                <Button size="sm" variant="outline" className="flex-1 border-slate-600/50 hover:bg-slate-700/50">
                  Save Property
                </Button>
                <Button size="sm" variant="outline" className="px-4 border-green-600/50 text-green-400 hover:bg-green-600/10">
                  💰 Make Offer
                </Button>
              </div>

              {/* Score Breakdown on Hover */}
              {hoveredProperty === property.id && (
                <div className="mt-6 p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <h4 className="text-sm font-semibold text-foreground mb-4">Detailed Score Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Budget Match (25%)</span>
                      <div className="flex items-center gap-3">
                        <Progress value={property.budgetMatch ? 85 : 60} className="w-20 h-2" />
                        <span className="text-sm font-medium w-10 text-right">{property.budgetMatch ? '85' : '60'}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Location/Commute (35%)</span>
                      <div className="flex items-center gap-3">
                        <Progress value={property.locationScore} className="w-20 h-2" />
                        <span className="text-sm font-medium w-10 text-right">{property.locationScore}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Lifestyle (20%)</span>
                      <div className="flex items-center gap-3">
                        <Progress value={property.lifestyleMatch ? 80 : 65} className="w-20 h-2" />
                        <span className="text-sm font-medium w-10 text-right">{property.lifestyleMatch ? '80' : '65'}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Amenities (20%)</span>
                      <div className="flex items-center gap-3">
                        <Progress value={property.amenityMatch ? 90 : 70} className="w-20 h-2" />
                        <span className="text-sm font-medium w-10 text-right">{property.amenityMatch ? '90' : '70'}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SmartResults;