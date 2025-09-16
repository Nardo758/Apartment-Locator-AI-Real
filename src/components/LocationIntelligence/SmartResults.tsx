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
}

const SmartResults: React.FC<SmartResultsProps> = ({
  smartResults,
  pointsOfInterest,
  userProfile,
  getCombinedScore
}) => {
  const [sortBy, setSortBy] = useState<'combinedScore' | 'locationScore' | 'price'>('combinedScore');
  const [filterBy, setFilterBy] = useState<'all' | 'topPicks' | 'budgetMatch'>('all');
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);

  const sortedResults = [...smartResults].sort((a, b) => {
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
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Smart Results
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
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

      {/* AI Insights Panel */}
      {getPreferencesCount() > 0 && (
        <Card className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Star className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">AI Insights</h3>
                <p className="text-sm text-muted-foreground">How your preferences affect results</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Budget Priority</div>
                <div className="text-foreground font-medium">
                  Properties under ${userProfile?.budget?.toLocaleString() || '2,500'}/month prioritized
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Location Weighting</div>
                <div className="text-foreground font-medium">
                  {pointsOfInterest.length} POIs with commute optimization
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Amenity Matching</div>
                <div className="text-foreground font-medium">
                  {userProfile?.amenities?.length || 0} preferred amenities tracked
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Results */}
      <div className="space-y-4">
        {filteredResults.map((property) => (
          <Card 
            key={property.id}
            className={`bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/40 transition-all duration-200 ${
              property.isTopPick ? 'ring-1 ring-green-500/30' : ''
            }`}
            onMouseEnter={() => setHoveredProperty(property.id)}
            onMouseLeave={() => setHoveredProperty(null)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {/* Property Image */}
                  <div className="w-24 h-24 rounded-lg bg-slate-700/50 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-slate-400" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-foreground">{property.name}</h3>
                      {property.isTopPick && (
                        <Badge className="bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border-green-500/30">
                          <Star className="w-3 h-3 mr-1" />
                          AI TOP PICK
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{property.address}</p>
                    <div className="text-xl font-bold text-green-400">${property.price.toLocaleString()}/mo</div>
                    <div className="text-sm text-muted-foreground">
                      {property.bedrooms}bd • {property.bathrooms}ba • {property.sqft} sqft
                    </div>
                  </div>
                </div>

                {/* Scores */}
                <div className="text-right space-y-2">
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getScoreBg(property.combinedScore)}`}>
                    <span className="text-sm font-medium text-foreground">Combined Score</span>
                    <span className={`text-xl font-bold ${getScoreColor(property.combinedScore)}`}>
                      {property.combinedScore}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">AI Match:</span>
                      <span className={`font-medium ${getScoreColor(property.aiMatchScore)}`}>
                        {property.aiMatchScore}%
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Location:</span>
                      <span className={`font-medium ${getScoreColor(property.locationScore)}`}>
                        {property.locationScore}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preference Matches */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Check className={`w-4 h-4 ${property.budgetMatch ? 'text-green-400' : 'text-slate-500'}`} />
                  <span className={`text-sm ${property.budgetMatch ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Budget
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className={`w-4 h-4 ${property.amenityMatch ? 'text-green-400' : 'text-slate-500'}`} />
                  <span className={`text-sm ${property.amenityMatch ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Amenities
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className={`w-4 h-4 ${property.lifestyleMatch ? 'text-green-400' : 'text-slate-500'}`} />
                  <span className={`text-sm ${property.lifestyleMatch ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Lifestyle
                  </span>
                </div>
              </div>

              {/* POI Commute Times */}
              {property.poiTimes.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Commute Times
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {property.poiTimes.map((poiTime) => (
                      <div key={poiTime.poiId} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground truncate">{poiTime.poiName}:</span>
                        <Badge 
                          variant="outline" 
                          className={`ml-2 ${
                            poiTime.color === 'green' ? 'border-green-500/50 text-green-400' :
                            poiTime.color === 'yellow' ? 'border-yellow-500/50 text-yellow-400' :
                            'border-red-500/50 text-red-400'
                          }`}
                        >
                          {poiTime.time}min
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Score Breakdown on Hover */}
              {hoveredProperty === property.id && (
                <div className="mt-4 p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <h4 className="text-sm font-medium text-foreground mb-3">Score Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Budget Match (25%)</span>
                      <div className="flex items-center gap-2">
                        <Progress value={property.budgetMatch ? 85 : 60} className="w-16 h-2" />
                        <span className="text-sm font-medium w-8">{property.budgetMatch ? '85' : '60'}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Location/Commute (35%)</span>
                      <div className="flex items-center gap-2">
                        <Progress value={property.locationScore} className="w-16 h-2" />
                        <span className="text-sm font-medium w-8">{property.locationScore}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Lifestyle (20%)</span>
                      <div className="flex items-center gap-2">
                        <Progress value={property.lifestyleMatch ? 80 : 65} className="w-16 h-2" />
                        <span className="text-sm font-medium w-8">{property.lifestyleMatch ? '80' : '65'}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Amenities (20%)</span>
                      <div className="flex items-center gap-2">
                        <Progress value={property.amenityMatch ? 90 : 70} className="w-16 h-2" />
                        <span className="text-sm font-medium w-8">{property.amenityMatch ? '90' : '70'}%</span>
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