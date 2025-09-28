import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Home, 
  TrendingUp, 
  Calculator,
  Sparkles,
  Clock,
  Target
} from 'lucide-react';

interface PropertySearchExampleProps {
  className?: string;
  onSearch?: (data: { location: string; currentRent: number; propertyValue: number }) => void;
}

export const PropertySearchExample: React.FC<PropertySearchExampleProps> = ({
  className = "",
  onSearch
}) => {
  const [location, setLocation] = useState('Austin, TX');
  const [currentRent, setCurrentRent] = useState('2400');
  const [propertyValue, setPropertyValue] = useState('450000');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);

  const isFormValid = location.trim() && currentRent && propertyValue;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;

    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockResults = {
        location: location.trim(),
        currentRent: parseFloat(currentRent),
        propertyValue: parseFloat(propertyValue),
        marketScore: Math.floor(Math.random() * 30) + 70, // 70-100
        recommendation: Math.random() > 0.5 ? 'BUY' : 'RENT',
        monthlyDifference: Math.floor(Math.random() * 800) + 200,
        breakEvenYears: (Math.random() * 5) + 2,
        confidence: Math.floor(Math.random() * 20) + 80
      };
      
      setSearchResults(mockResults);
      setIsSearching(false);
      
      if (onSearch) {
        onSearch({
          location: location.trim(),
          currentRent: parseFloat(currentRent),
          propertyValue: parseFloat(propertyValue)
        });
      }
    }, 1500);
  };

  const resetSearch = () => {
    setSearchResults(null);
    setLocation('Austin, TX');
    setCurrentRent('2400');
    setPropertyValue('450000');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Form */}
      <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Property Search & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g., Austin, TX"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-background/50"
                  disabled={isSearching}
                />
              </div>

              {/* Current Rent */}
              <div className="space-y-2">
                <Label htmlFor="currentRent" className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Monthly Rent
                </Label>
                <Input
                  id="currentRent"
                  type="number"
                  placeholder="2400"
                  value={currentRent}
                  onChange={(e) => setCurrentRent(e.target.value)}
                  className="bg-background/50"
                  disabled={isSearching}
                  min="0"
                  step="50"
                />
              </div>

              {/* Property Value */}
              <div className="space-y-2">
                <Label htmlFor="propertyValue" className="text-sm font-medium flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Property Value
                </Label>
                <Input
                  id="propertyValue"
                  type="number"
                  placeholder="450000"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(e.target.value)}
                  className="bg-background/50"
                  disabled={isSearching}
                  min="0"
                  step="10000"
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={!isFormValid || isSearching}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              >
                {isSearching ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Market...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Analyze Property
                  </>
                )}
              </Button>
              
              {searchResults && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetSearch}
                  className="px-6"
                >
                  New Search
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Main Recommendation */}
          <Card className={`border-0 shadow-lg ${
            searchResults.recommendation === 'BUY' 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
              : 'bg-gradient-to-r from-blue-500 to-indigo-500'
          } text-white`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    Recommendation: {searchResults.recommendation}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>{searchResults.confidence}% confidence</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-80">Market Score</div>
                  <div className="text-3xl font-bold">{searchResults.marketScore}</div>
                  <div className="text-sm opacity-80">out of 100</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="text-sm opacity-80">Monthly Difference</div>
                  <div className="text-lg font-bold">
                    ${searchResults.monthlyDifference.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm opacity-80">Break-even</div>
                  <div className="text-lg font-bold">
                    {searchResults.breakEvenYears.toFixed(1)} years
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Analysis */}
          <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Market Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Property Value</div>
                  <div className="text-lg font-bold">
                    ${searchResults.propertyValue.toLocaleString()}
                  </div>
                </div>
                <div className="text-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Monthly Rent</div>
                  <div className="text-lg font-bold">
                    ${searchResults.currentRent.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Price-to-Rent Ratio</span>
                  <Badge variant="outline">
                    {Math.round(searchResults.propertyValue / (searchResults.currentRent * 12))}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Location</span>
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="w-3 h-3" />
                    {searchResults.location}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Analysis Time</span>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date().toLocaleTimeString()}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">AI Insight</span>
                </div>
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  {searchResults.recommendation === 'BUY' 
                    ? `Strong buying opportunity with favorable market conditions in ${searchResults.location}.`
                    : `Current market conditions favor renting in ${searchResults.location} for maximum flexibility.`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};