import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Loader2,
  Settings,
  Calculator
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUnifiedRentalIntelligence } from '@/hooks/useUnifiedRentalIntelligence';
import { LeverageScoreCard } from '@/components/intelligence/LeverageScoreCard';
import { InsightsList } from '@/components/intelligence/InsightsList';
import { OwnershipAnalysisCard } from '@/components/intelligence/OwnershipAnalysisCard';
import Header from '@/components/Header';

const MarketIntel: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState('austin');
  const [currentRent, setCurrentRent] = useState(2200);
  const [propertyValue, setPropertyValue] = useState(350000);
  const [showSettings, setShowSettings] = useState(false);

  const { intelligence, loading, error, refresh } = useUnifiedRentalIntelligence(
    selectedRegion, currentRent, propertyValue
  );

  const locationMap: Record<string, string> = {
    'austin': 'Austin, TX',
    'dallas': 'Dallas, TX',
    'houston': 'Houston, TX'
  };

  const getLocationName = () => locationMap[selectedRegion] || 'Austin, TX';

  const getQuickStats = () => {
    if (!intelligence?.marketData[0]) return [];
    
    const latest = intelligence.marketData[0];
    return [
      {
        title: 'Median Rent',
        value: `$${Math.round(latest.medianRent).toLocaleString()}`,
        change: `${latest.rentYoYChange > 0 ? '+' : ''}${latest.rentYoYChange.toFixed(1)}%`,
        description: 'vs last year'
      },
      {
        title: 'Market Inventory',
        value: Math.round(latest.inventoryLevel).toLocaleString(),
        change: `${latest.daysOnMarket} days avg`,
        description: 'days on market'
      },
      {
        title: 'Leverage Score',
        value: `${intelligence.overallLeverageScore}/100`,
        change: intelligence.recommendation.action.replace(/_/g, ' '),
        description: 'negotiation power'
      }
    ];
  };




  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Settings Panel */}
        {showSettings && (
          <Card className="mb-8 bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Analysis Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="current-rent">Current Monthly Rent</Label>
                  <Input
                    id="current-rent"
                    type="number"
                    value={currentRent}
                    onChange={(e) => setCurrentRent(Number(e.target.value))}
                    placeholder="e.g. 2200"
                  />
                </div>
                <div>
                  <Label htmlFor="property-value">Estimated Property Value</Label>
                  <Input
                    id="property-value"
                    type="number"
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(Number(e.target.value))}
                    placeholder="e.g. 350000"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Adjust these values to get personalized negotiation intelligence and rent vs buy analysis.
              </p>
              <div className="flex gap-3">
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="austin">Austin, TX</SelectItem>
                    <SelectItem value="dallas">Dallas, TX</SelectItem>
                    <SelectItem value="houston">Houston, TX</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="gap-2"
                >
                  <Settings size={16} />
                  Settings
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refresh}
                  className="gap-2"
                >
                  <Calculator size={16} />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!showSettings && (
          <div className="mb-6 flex justify-end gap-3">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="austin">Austin, TX</SelectItem>
                <SelectItem value="dallas">Dallas, TX</SelectItem>
                <SelectItem value="houston">Houston, TX</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="gap-2"
            >
              <Settings size={16} />
              Settings
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="gap-2"
            >
              <Calculator size={16} />
              Refresh
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              Generating unified rental intelligence for {getLocationName()}...
            </span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-destructive mb-2">{error}</div>
              <Button onClick={refresh} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        ) : intelligence ? (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {getQuickStats().map((stat, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="text-sm text-muted-foreground mb-1">{stat.title}</div>
                    <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.change} • {stat.description}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Intelligence Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Leverage Score & Recommendation */}
              <div className="lg:col-span-2">
                <LeverageScoreCard
                  leverageScore={intelligence.overallLeverageScore}
                  recommendation={intelligence.recommendation}
                  dataStatus={intelligence.dataStatus}
                />
              </div>

              {/* AI Insights */}
              <div>
                <InsightsList insights={intelligence.combinedInsights} />
              </div>
            </div>

            {/* Ownership Analysis (if available) */}
            {intelligence.ownershipAnalysis && (
              <OwnershipAnalysisCard 
                ownershipAnalysis={intelligence.ownershipAnalysis}
              />
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default MarketIntel;