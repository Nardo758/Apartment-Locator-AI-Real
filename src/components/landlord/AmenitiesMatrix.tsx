import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, TrendingUp, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Property {
  id: string;
  name: string;
  amenities: Record<string, boolean>;
}

interface AmenityPrevalence {
  amenity: string;
  prevalence: number;
  yourPropertyHas: boolean;
}

interface AmenitiesMatrixProps {
  property: Property;
  competitors: Property[];
  amenityPrevalence: AmenityPrevalence[];
}

const AmenitiesMatrix: React.FC<AmenitiesMatrixProps> = ({
  property,
  competitors,
  amenityPrevalence,
}) => {
  const [sortBy, setSortBy] = useState<'name' | 'prevalence'>('prevalence');

  // Collect all unique amenities
  const allAmenities = new Set<string>();
  
  // Add amenities from your property
  if (property.amenities && typeof property.amenities === 'object') {
    Object.keys(property.amenities).forEach(a => allAmenities.add(a));
  }
  
  // Add amenities from competitors
  competitors.forEach(comp => {
    if (comp.amenities && typeof comp.amenities === 'object') {
      Object.keys(comp.amenities).forEach(a => allAmenities.add(a));
    }
  });

  // If amenityPrevalence has more amenities, add them too
  amenityPrevalence.forEach(ap => allAmenities.add(ap.amenity));

  // Create amenity list with data
  let amenityList = Array.from(allAmenities).map(amenity => {
    const prevalenceData = amenityPrevalence.find(ap => ap.amenity === amenity);
    
    // Count how many competitors have this amenity
    const competitorCount = competitors.filter(comp => 
      comp.amenities && typeof comp.amenities === 'object' && comp.amenities[amenity]
    ).length;
    
    const prevalence = prevalenceData?.prevalence || 
      (competitors.length > 0 ? (competitorCount / competitors.length) * 100 : 0);
    
    const yourPropertyHas = property.amenities && 
      typeof property.amenities === 'object' && 
      property.amenities[amenity];

    return {
      name: amenity,
      prevalence: Math.round(prevalence),
      yourPropertyHas: !!yourPropertyHas,
      competitorCount,
    };
  });

  // Sort amenities
  if (sortBy === 'prevalence') {
    amenityList.sort((a, b) => b.prevalence - a.prevalence);
  } else {
    amenityList.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Calculate statistics
  const totalAmenities = amenityList.length;
  const yourAmenityCount = amenityList.filter(a => a.yourPropertyHas).length;
  const missedOpportunities = amenityList.filter(a => !a.yourPropertyHas && a.prevalence >= 50).length;
  const competitiveAdvantages = amenityList.filter(a => a.yourPropertyHas && a.prevalence < 50).length;

  const getPrevalenceBadge = (prevalence: number) => {
    if (prevalence >= 75) return { variant: 'default' as const, label: 'Essential' };
    if (prevalence >= 50) return { variant: 'secondary' as const, label: 'Common' };
    if (prevalence >= 25) return { variant: 'outline' as const, label: 'Some' };
    return { variant: 'outline' as const, label: 'Rare' };
  };

  const formatAmenityName = (name: string) => {
    return name
      .split(/(?=[A-Z])/)
      .join(' ')
      .replace(/^./, str => str.toUpperCase());
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Your Amenities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yourAmenityCount}</div>
            <p className="text-xs text-muted-foreground">
              out of {totalAmenities} tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Coverage Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalAmenities > 0 ? Math.round((yourAmenityCount / totalAmenities) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">of market amenities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Missed Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{missedOpportunities}</div>
            <p className="text-xs text-muted-foreground">common amenities missing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unique Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{competitiveAdvantages}</div>
            <p className="text-xs text-muted-foreground">rare amenities you offer</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert for missing essential amenities */}
      {missedOpportunities > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You're missing {missedOpportunities} amenities that 50%+ of competitors offer. 
            Consider adding these to stay competitive.
          </AlertDescription>
        </Alert>
      )}

      {/* Amenities Matrix Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Amenities Comparison Matrix</CardTitle>
              <CardDescription>
                Compare amenity offerings across {competitors.length} competitors
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge 
                variant={sortBy === 'prevalence' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSortBy('prevalence')}
              >
                Sort by Prevalence
              </Badge>
              <Badge 
                variant={sortBy === 'name' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSortBy('name')}
              >
                Sort by Name
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Amenity</TableHead>
                  <TableHead className="text-center">Your Property</TableHead>
                  <TableHead className="text-center">Competitor Count</TableHead>
                  <TableHead className="text-center">Prevalence</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {amenityList.map((amenity) => {
                  const { variant, label } = getPrevalenceBadge(amenity.prevalence);
                  const isOpportunity = !amenity.yourPropertyHas && amenity.prevalence >= 50;
                  const isAdvantage = amenity.yourPropertyHas && amenity.prevalence < 50;

                  return (
                    <TableRow 
                      key={amenity.name}
                      className={isOpportunity ? 'bg-orange-50' : ''}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {formatAmenityName(amenity.name)}
                          {isOpportunity && (
                            <TrendingUp className="h-3 w-3 text-orange-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {amenity.yourPropertyHas ? (
                          <div className="flex justify-center">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="h-4 w-4 text-green-600" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                              <X className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {amenity.competitorCount} / {competitors.length}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={variant}>
                          {amenity.prevalence}% • {label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {isOpportunity && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700">
                            Opportunity
                          </Badge>
                        )}
                        {isAdvantage && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Advantage
                          </Badge>
                        )}
                        {!isOpportunity && !isAdvantage && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Legend */}
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-semibold">Legend</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Essential</Badge>
                  <span className="text-muted-foreground">75%+ competitors have it</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Common</Badge>
                  <span className="text-muted-foreground">50-74% competitors have it</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-orange-50 text-orange-700">Opportunity</Badge>
                  <span className="text-muted-foreground">Missing a common amenity</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">Advantage</Badge>
                  <span className="text-muted-foreground">You have a rare amenity</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AmenitiesMatrix;
