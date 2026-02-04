import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import PricingComparisonTable from './PricingComparisonTable';
import AmenitiesMatrix from './AmenitiesMatrix';
import GapAnalysis from './GapAnalysis';

interface Property {
  id: string;
  name: string;
  address: string;
  currentRent: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  pricePerSqFt: number;
  amenities: Record<string, boolean>;
  features: Record<string, any>;
  petPolicy: Record<string, any>;
  parking: Record<string, any>;
}

interface MarketBenchmark {
  medianRent: number;
  avgRent: number;
  minRent: number;
  maxRent: number;
  sampleSize: number;
  yourPercentile: number;
}

interface Analysis {
  pricingPosition: 'above_market' | 'at_market' | 'below_market';
  variance: number;
  variancePercent: number;
  competitiveAdvantages: string[];
  gaps: string[];
  recommendation: string;
  amenityPrevalence: Array<{
    amenity: string;
    prevalence: number;
    yourPropertyHas: boolean;
  }>;
}

interface ComparisonData {
  property: Property;
  competitors: Property[];
  marketBenchmark: MarketBenchmark | null;
  analysis: Analysis;
  generatedAt: string;
}

interface ComparisonViewProps {
  propertyId: string;
  competitorIds: string[];
  onError?: (error: string) => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ 
  propertyId, 
  competitorIds,
  onError 
}) => {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchComparisonData();
  }, [propertyId, competitorIds]);

  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/comparison', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId,
          competitorIds,
          includeMarketBenchmark: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comparison data');
      }

      const comparisonData = await response.json();
      setData(comparisonData);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Analyzing market data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button variant="outline" size="sm" onClick={fetchComparisonData} className="mt-4">
          Retry
        </Button>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  const { property, competitors, marketBenchmark, analysis } = data;

  const getPricingTrendIcon = () => {
    if (analysis.pricingPosition === 'above_market') {
      return <TrendingUp className="h-5 w-5 text-red-500" />;
    } else if (analysis.pricingPosition === 'below_market') {
      return <TrendingDown className="h-5 w-5 text-green-500" />;
    }
    return <Minus className="h-5 w-5 text-yellow-500" />;
  };

  const getPricingBadgeVariant = () => {
    if (analysis.pricingPosition === 'above_market') return 'destructive';
    if (analysis.pricingPosition === 'below_market') return 'default';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {property.name}
            {getPricingTrendIcon()}
          </CardTitle>
          <CardDescription>{property.address}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current Rent</p>
              <p className="text-2xl font-bold">${property.currentRent.toLocaleString()}</p>
              <Badge variant={getPricingBadgeVariant()}>
                {analysis.variancePercent > 0 ? '+' : ''}{analysis.variancePercent.toFixed(1)}% vs market
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Market Average</p>
              <p className="text-2xl font-bold">
                ${marketBenchmark?.avgRent.toLocaleString() || 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground">
                Based on {marketBenchmark?.sampleSize || 0} properties
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Market Position</p>
              <p className="text-2xl font-bold">{marketBenchmark?.yourPercentile || 0}th</p>
              <p className="text-xs text-muted-foreground">Percentile</p>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Recommendation</AlertTitle>
            <AlertDescription>{analysis.recommendation}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="concessions">Concessions</TabsTrigger>
          <TabsTrigger value="market">Vs Market</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Competitive Advantages</CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.competitiveAdvantages.length > 0 ? (
                  <ul className="space-y-2">
                    {analysis.competitiveAdvantages.map((advantage, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">✓</Badge>
                        <span className="text-sm">{advantage}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No unique advantages identified</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Range</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Minimum</span>
                  <span className="font-semibold">${marketBenchmark?.minRent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Median</span>
                  <span className="font-semibold">${marketBenchmark?.medianRent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average</span>
                  <span className="font-semibold">${marketBenchmark?.avgRent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Maximum</span>
                  <span className="font-semibold">${marketBenchmark?.maxRent.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing">
          <PricingComparisonTable 
            property={property}
            competitors={competitors}
            marketBenchmark={marketBenchmark}
          />
        </TabsContent>

        <TabsContent value="amenities">
          <AmenitiesMatrix
            property={property}
            competitors={competitors}
            amenityPrevalence={analysis.amenityPrevalence}
          />
        </TabsContent>

        <TabsContent value="concessions">
          <Card>
            <CardHeader>
              <CardTitle>Concessions & Special Offers</CardTitle>
              <CardDescription>Compare promotional offers and move-in specials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Your Property</h4>
                  <p className="text-sm text-muted-foreground">
                    No active concessions configured. Consider adding move-in specials to compete.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Competitor Concessions</h4>
                  <p className="text-sm text-muted-foreground">
                    Concession tracking coming soon. This feature will show competitor move-in specials,
                    rent discounts, and promotional offers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market">
          <GapAnalysis
            property={property}
            competitors={competitors}
            analysis={analysis}
            marketBenchmark={marketBenchmark}
          />
        </TabsContent>
      </Tabs>

      <div className="text-xs text-muted-foreground text-right">
        Last updated: {new Date(data.generatedAt).toLocaleString()}
      </div>
    </div>
  );
};

export default ComparisonView;
