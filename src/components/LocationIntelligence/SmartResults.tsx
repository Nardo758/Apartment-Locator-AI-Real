import React, { useState } from 'react';
import { TrendingUp, Filter, ArrowUpDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PointOfInterest, SmartProperty } from '@/hooks/useLocationIntelligence';
import CompactApartmentCard from '../CompactApartmentCard';

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
      <div className="space-y-4">
        {filteredResults.map((property) => {
          // Convert SmartProperty to CompactApartmentCard format
          const apartmentData = {
            id: property.id,
            name: property.name,
            address: property.address,
            price: property.price,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            sqft: property.sqft,
            aiMatchScore: property.aiMatchScore,
            combinedScore: property.combinedScore,
            locationScore: property.locationScore,
            budgetMatch: property.budgetMatch,
            amenityMatch: property.amenityMatch,
            lifestyleMatch: property.lifestyleMatch,
            isTopPick: property.isTopPick
          };

          return (
            <CompactApartmentCard
              key={property.id}
              apartment={apartmentData}
              onFavorite={(id) => console.log('Favorite:', id)}
              onViewDetails={() => console.log('View details:', property.id)}
              onShare={(id) => console.log('Share:', id)}
              isFavorited={false}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SmartResults;