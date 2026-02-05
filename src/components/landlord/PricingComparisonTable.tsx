import React from 'react';
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
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  address: string;
  currentRent: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  pricePerSqFt: number;
}

interface MarketBenchmark {
  medianRent: number;
  avgRent: number;
  minRent: number;
  maxRent: number;
  sampleSize: number;
  yourPercentile: number;
}

interface PricingComparisonTableProps {
  property: Property;
  competitors: Property[];
  marketBenchmark: MarketBenchmark | null;
}

const PricingComparisonTable: React.FC<PricingComparisonTableProps> = ({
  property,
  competitors,
  marketBenchmark,
}) => {
  const avgMarketRent = marketBenchmark?.avgRent || 0;
  
  // Combine all properties for comparison
  const allProperties = [
    { ...property, isYours: true },
    ...competitors.map(c => ({ ...c, isYours: false })),
  ];

  // Calculate variance for each property
  const propertiesWithVariance = allProperties.map(prop => {
    const variance = avgMarketRent > 0 
      ? ((prop.currentRent - avgMarketRent) / avgMarketRent) * 100 
      : 0;
    return { ...prop, variance };
  });

  // Sort by rent (highest to lowest)
  const sortedProperties = [...propertiesWithVariance].sort(
    (a, b) => b.currentRent - a.currentRent
  );

  const getPriceColorClass = (variance: number) => {
    if (variance > 5) return 'text-red-600 bg-red-50';
    if (variance < -5) return 'text-green-600 bg-green-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 5) return <ArrowUp className="h-3 w-3" />;
    if (variance < -5) return <ArrowDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing Comparison</CardTitle>
        <CardDescription>
          Compare your property against {competitors.length} competitors
          {marketBenchmark && ` • Market Avg: ${formatCurrency(avgMarketRent)}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Property</TableHead>
                <TableHead className="text-center">Beds</TableHead>
                <TableHead className="text-center">Baths</TableHead>
                <TableHead className="text-right">Sq Ft</TableHead>
                <TableHead className="text-right">Rent</TableHead>
                <TableHead className="text-right">$/Sq Ft</TableHead>
                <TableHead className="text-center">vs Market</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProperties.map((prop) => (
                <TableRow 
                  key={prop.id}
                  className={prop.isYours ? 'bg-blue-50 font-medium' : ''}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {prop.isYours && (
                        <Badge variant="default" className="text-xs">
                          Your Property
                        </Badge>
                      )}
                      <div>
                        <div className="font-medium">{prop.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {prop.address}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{prop.bedrooms}</TableCell>
                  <TableCell className="text-center">{prop.bathrooms}</TableCell>
                  <TableCell className="text-right">
                    {prop.squareFeet > 0 ? prop.squareFeet.toLocaleString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(prop.currentRent)}
                  </TableCell>
                  <TableCell className="text-right">
                    {prop.pricePerSqFt > 0 
                      ? `$${prop.pricePerSqFt.toFixed(2)}`
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Badge 
                        variant="outline" 
                        className={`${getPriceColorClass(prop.variance)} flex items-center gap-1`}
                      >
                        {getVarianceIcon(prop.variance)}
                        <span>{prop.variance > 0 ? '+' : ''}{prop.variance.toFixed(1)}%</span>
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {/* Market Benchmark Row */}
              {marketBenchmark && (
                <>
                  <TableRow className="border-t-2">
                    <TableCell colSpan={7} className="h-2 p-0 bg-muted/30" />
                  </TableRow>
                  <TableRow className="bg-gray-100 dark:bg-gray-800 font-semibold">
                    <TableCell>Market Average</TableCell>
                    <TableCell className="text-center">—</TableCell>
                    <TableCell className="text-center">—</TableCell>
                    <TableCell className="text-right">—</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(marketBenchmark.avgRent)}
                    </TableCell>
                    <TableCell className="text-right">—</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">Baseline</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/30">
                    <TableCell>Market Median</TableCell>
                    <TableCell className="text-center">—</TableCell>
                    <TableCell className="text-center">—</TableCell>
                    <TableCell className="text-right">—</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(marketBenchmark.medianRent)}
                    </TableCell>
                    <TableCell className="text-right">—</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">50th %ile</Badge>
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Price Distribution Chart */}
        {marketBenchmark && (
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-semibold">Price Distribution</h4>
            <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
              {/* Min to Max Range */}
              <div className="absolute inset-y-0 left-0 right-0 flex items-center px-4">
                <div className="w-full h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full" />
              </div>
              
              {/* Your Property Marker */}
              {avgMarketRent > 0 && (
                <div 
                  className="absolute inset-y-0 flex items-center"
                  style={{
                    left: `${Math.min(
                      Math.max(
                        ((property.currentRent - marketBenchmark.minRent) / 
                        (marketBenchmark.maxRent - marketBenchmark.minRent)) * 100,
                        0
                      ),
                      100
                    )}%`,
                  }}
                >
                  <div className="relative">
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg" />
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <Badge variant="default" className="text-xs">You</Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(marketBenchmark.minRent)}</span>
              <span>Market Range</span>
              <span>{formatCurrency(marketBenchmark.maxRent)}</span>
            </div>
          </div>
        )}

        {/* Color Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 border border-red-200 rounded" />
            <span className="text-muted-foreground">Above Market (+5%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded" />
            <span className="text-muted-foreground">At Market (±5%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border border-green-200 rounded" />
            <span className="text-muted-foreground">Below Market (-5%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingComparisonTable;
