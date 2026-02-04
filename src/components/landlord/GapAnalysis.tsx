import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Home, 
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Download
} from 'lucide-react';

interface Property {
  id: string;
  name: string;
  currentRent: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  pricePerSqFt: number;
  amenities: Record<string, boolean>;
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
}

interface GapAnalysisProps {
  property: Property;
  competitors: Property[];
  analysis: Analysis;
  marketBenchmark: MarketBenchmark | null;
}

interface Gap {
  category: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  estimatedCost?: string;
  icon: React.ReactNode;
}

const GapAnalysis: React.FC<GapAnalysisProps> = ({
  property,
  competitors,
  analysis,
  marketBenchmark,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  // Identify gaps
  const gaps: Gap[] = [];

  // 1. Pricing Gaps
  if (analysis.pricingPosition === 'above_market' && Math.abs(analysis.variancePercent) > 10) {
    gaps.push({
      category: 'critical',
      title: 'Pricing Above Market',
      description: `Your rent is ${Math.abs(analysis.variancePercent).toFixed(1)}% above market average ($${analysis.variance} higher).`,
      impact: 'High risk of extended vacancy periods and lost revenue',
      recommendation: `Reduce rent to $${marketBenchmark?.avgRent.toLocaleString() || 'N/A'} to match market average, or add premium amenities to justify premium pricing.`,
      estimatedCost: 'Revenue loss: $' + Math.abs(analysis.variance * 12).toLocaleString() + '/year',
      icon: <TrendingUp className="h-5 w-5 text-red-500" />,
    });
  } else if (analysis.pricingPosition === 'below_market' && Math.abs(analysis.variancePercent) > 15) {
    gaps.push({
      category: 'high',
      title: 'Underpricing Opportunity',
      description: `Your rent is ${Math.abs(analysis.variancePercent).toFixed(1)}% below market average. You're leaving money on the table.`,
      impact: 'Lost rental income and potential property value depreciation',
      recommendation: `Increase rent to $${marketBenchmark?.avgRent.toLocaleString() || 'N/A'} to capture market rate.`,
      estimatedCost: 'Lost revenue: $' + Math.abs(analysis.variance * 12).toLocaleString() + '/year',
      icon: <TrendingDown className="h-5 w-5 text-orange-500" />,
    });
  }

  // 2. Amenity Gaps
  const missingEssentialAmenities = analysis.gaps.filter(gap => 
    gap.includes('50%') || gap.includes('60%') || gap.includes('70%') || gap.includes('80%')
  );

  if (missingEssentialAmenities.length > 0) {
    gaps.push({
      category: 'high',
      title: 'Missing Essential Amenities',
      description: `You're missing ${missingEssentialAmenities.length} amenities that most competitors offer.`,
      impact: 'Reduced competitiveness and potential for lower occupancy rates',
      recommendation: `Prioritize adding: ${missingEssentialAmenities.slice(0, 3).join(', ')}`,
      estimatedCost: 'Varies by amenity',
      icon: <Home className="h-5 w-5 text-orange-500" />,
    });
  }

  // 3. Size/Space Gap
  const avgCompetitorSqFt = competitors.reduce((sum, c) => sum + c.squareFeet, 0) / competitors.length;
  const sqFtDiff = property.squareFeet - avgCompetitorSqFt;
  const sqFtDiffPercent = avgCompetitorSqFt > 0 ? (sqFtDiff / avgCompetitorSqFt) * 100 : 0;

  if (Math.abs(sqFtDiffPercent) > 15) {
    gaps.push({
      category: sqFtDiffPercent < 0 ? 'medium' : 'low',
      title: sqFtDiffPercent < 0 ? 'Smaller Than Competition' : 'Larger Than Competition',
      description: `Your property is ${Math.abs(sqFtDiffPercent).toFixed(1)}% ${sqFtDiffPercent < 0 ? 'smaller' : 'larger'} than average (${Math.abs(Math.round(sqFtDiff))} sq ft).`,
      impact: sqFtDiffPercent < 0 
        ? 'May justify lower pricing but could limit appeal' 
        : 'Potential premium pricing opportunity',
      recommendation: sqFtDiffPercent < 0
        ? 'Emphasize other features (location, amenities, quality) to offset size disadvantage'
        : 'Leverage extra space as a selling point for premium pricing',
      icon: <Sparkles className="h-5 w-5 text-blue-500" />,
    });
  }

  // 4. Competitive Advantages (low priority items, but still worth noting)
  if (analysis.competitiveAdvantages.length > 0) {
    gaps.push({
      category: 'low',
      title: 'Unique Advantages',
      description: `You offer ${analysis.competitiveAdvantages.length} amenities that most competitors don't have.`,
      impact: 'Positive differentiation in the market',
      recommendation: `Market these features prominently: ${analysis.competitiveAdvantages.slice(0, 3).join(', ')}`,
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    });
  }

  // 5. Market Position Gap
  if (marketBenchmark && marketBenchmark.yourPercentile < 25) {
    gaps.push({
      category: 'critical',
      title: 'Bottom Quartile Position',
      description: `Your property is in the bottom 25% of market pricing (${marketBenchmark.yourPercentile}th percentile).`,
      impact: 'Risk of being perceived as lower quality or attracting less desirable tenants',
      recommendation: 'Consider strategic improvements and modest rent increases to move to the 40-60th percentile range',
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
    });
  } else if (marketBenchmark && marketBenchmark.yourPercentile > 85) {
    gaps.push({
      category: 'high',
      title: 'Top Quartile Pricing',
      description: `Your property is in the top 15% of market pricing (${marketBenchmark.yourPercentile}th percentile).`,
      impact: 'Premium positioning may limit tenant pool and increase time-to-lease',
      recommendation: 'Ensure property features and condition justify premium pricing, or consider modest reduction',
      icon: <DollarSign className="h-5 w-5 text-orange-500" />,
    });
  }

  // Filter gaps by category
  const filteredGaps = selectedCategory === 'all' 
    ? gaps 
    : gaps.filter(g => g.category === selectedCategory);

  // Calculate scores
  const criticalCount = gaps.filter(g => g.category === 'critical').length;
  const highCount = gaps.filter(g => g.category === 'high').length;
  const mediumCount = gaps.filter(g => g.category === 'medium').length;
  const lowCount = gaps.filter(g => g.category === 'low').length;

  // Calculate overall competitive score (0-100)
  const maxScore = 100;
  const criticalDeduction = criticalCount * 25;
  const highDeduction = highCount * 15;
  const mediumDeduction = mediumCount * 8;
  const lowDeduction = lowCount * 3;
  const competitiveScore = Math.max(0, maxScore - criticalDeduction - highDeduction - mediumDeduction - lowDeduction);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'critical': return 'destructive' as const;
      case 'high': return 'default' as const;
      case 'medium': return 'secondary' as const;
      case 'low': return 'outline' as const;
      default: return 'outline' as const;
    }
  };

  const exportReport = () => {
    const reportData = {
      property: property.name,
      generatedAt: new Date().toISOString(),
      competitiveScore,
      marketBenchmark,
      gaps: gaps.map(g => ({
        category: g.category,
        title: g.title,
        description: g.description,
        recommendation: g.recommendation,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gap-analysis-${property.id}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Competitive Score Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Competitive Health Score</CardTitle>
              <CardDescription>Overall market position assessment</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-5xl font-bold ${getScoreColor(competitiveScore)}`}>
                {competitiveScore}
              </div>
              <p className="text-lg text-muted-foreground mt-1">{getScoreLabel(competitiveScore)}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Issues Found</div>
              <div className="flex gap-2">
                {criticalCount > 0 && (
                  <Badge variant="destructive">{criticalCount} Critical</Badge>
                )}
                {highCount > 0 && (
                  <Badge variant="default">{highCount} High</Badge>
                )}
                {mediumCount > 0 && (
                  <Badge variant="secondary">{mediumCount} Medium</Badge>
                )}
              </div>
            </div>
          </div>
          <Progress value={competitiveScore} className="h-3" />
          <p className="text-sm text-muted-foreground mt-4">
            {competitiveScore >= 80 && "Your property is well-positioned in the market with strong competitive advantages."}
            {competitiveScore >= 60 && competitiveScore < 80 && "Your property is competitive but has room for improvement."}
            {competitiveScore >= 40 && competitiveScore < 60 && "Your property faces moderate competitive challenges that should be addressed."}
            {competitiveScore < 40 && "Your property has significant competitive gaps that require immediate attention."}
          </p>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card 
          className={`cursor-pointer transition-colors ${selectedCategory === 'critical' ? 'border-red-500 bg-red-50' : ''}`}
          onClick={() => setSelectedCategory(selectedCategory === 'critical' ? 'all' : 'critical')}
        >
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Critical Issues</p>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-colors ${selectedCategory === 'high' ? 'border-orange-500 bg-orange-50' : ''}`}
          onClick={() => setSelectedCategory(selectedCategory === 'high' ? 'all' : 'high')}
        >
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{highCount}</div>
            <p className="text-xs text-muted-foreground">High Priority</p>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-colors ${selectedCategory === 'medium' ? 'border-yellow-500 bg-yellow-50' : ''}`}
          onClick={() => setSelectedCategory(selectedCategory === 'medium' ? 'all' : 'medium')}
        >
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{mediumCount}</div>
            <p className="text-xs text-muted-foreground">Medium Priority</p>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-colors ${selectedCategory === 'low' ? 'border-blue-500 bg-blue-50' : ''}`}
          onClick={() => setSelectedCategory(selectedCategory === 'low' ? 'all' : 'low')}
        >
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{lowCount}</div>
            <p className="text-xs text-muted-foreground">Low Priority</p>
          </CardContent>
        </Card>
      </div>

      {/* Gap Details */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {selectedCategory === 'all' ? 'All Gaps & Opportunities' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Priority Items`}
          </h3>
          {selectedCategory !== 'all' && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedCategory('all')}>
              Show All
            </Button>
          )}
        </div>

        {filteredGaps.length === 0 ? (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>No Issues Found</AlertTitle>
            <AlertDescription>
              {selectedCategory === 'all' 
                ? "Your property is well-positioned with no significant gaps identified."
                : `No ${selectedCategory} priority issues found.`}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {filteredGaps.map((gap, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Category Indicator */}
                    <div className={`w-2 ${
                      gap.category === 'critical' ? 'bg-red-500' :
                      gap.category === 'high' ? 'bg-orange-500' :
                      gap.category === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">{gap.icon}</div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-lg">{gap.title}</h4>
                              <Badge variant={getCategoryBadgeVariant(gap.category)} className="mt-1">
                                {gap.category.charAt(0).toUpperCase() + gap.category.slice(1)} Priority
                              </Badge>
                            </div>
                            {gap.estimatedCost && (
                              <Badge variant="outline" className="ml-2">
                                {gap.estimatedCost}
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground">{gap.description}</p>

                          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-1">IMPACT</p>
                                <p className="text-sm">{gap.impact}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                            <div className="flex items-start gap-2">
                              <ArrowRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-green-700 mb-1">RECOMMENDATION</p>
                                <p className="text-sm text-green-900">{gap.recommendation}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GapAnalysis;
