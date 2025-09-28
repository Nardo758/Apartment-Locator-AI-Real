import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Database, 
  Search, 
  TrendingUp, 
  MapPin, 
  Home, 
  DollarSign,
  Sparkles,
  Target,
  Clock,
  Star
} from 'lucide-react';
import Header from '@/components/Header';
import { TestConnection } from '@/components/TestConnection';
import { MarketIntelligenceDashboard } from '@/components/MarketIntelligenceDashboard';
import { PropertySearchExample } from '@/components/PropertySearchExample';
import { DatabaseService, PropertyWithSavings } from '@/services/databaseService';
import { usePropertySearch } from '@/hooks/usePropertySearch';

const AdvancedFeaturesDemo: React.FC = () => {
  const [savingsProperties, setSavingsProperties] = useState<PropertyWithSavings[]>([]);
  const [minSavings, setMinSavings] = useState(100);
  const [loadingDatabase, setLoadingDatabase] = useState(false);
  
  // Use the property search hook
  const { properties, loading, searchProperties, getSavedProperties } = usePropertySearch();

  // Example: Get properties with savings
  const handleGetSavingsProperties = async () => {
    setLoadingDatabase(true);
    try {
      const result = await DatabaseService.getPropertiesWithSavings(minSavings);
      setSavingsProperties(result);
    } catch (error) {
      console.error('Failed to get savings properties:', error);
    } finally {
      setLoadingDatabase(false);
    }
  };

  // Example: Search properties with AI matching
  const handleAISearch = async () => {
    await searchProperties(
      {
        location: 'Austin',
        minPrice: 200000,
        maxPrice: 500000,
        minSavings: 20000
      },
      {
        useAIMatching: true,
        sortBy: 'score',
        sortOrder: 'desc'
      }
    );
  };

  // Load saved properties on mount
  useEffect(() => {
    getSavedProperties();
  }, [getSavedProperties]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            🚀 Advanced Features Demo
          </h1>
          <p className="text-muted-foreground">
            Demonstration of DatabaseService, usePropertySearch hook, and advanced components
          </p>
        </div>

        <div className="space-y-12">
          {/* Connection Test */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
              <Database className="w-6 h-6" />
              System Connection Status
            </h2>
            <TestConnection />
          </section>

          {/* Market Intelligence */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Market Intelligence Dashboard
            </h2>
            <MarketIntelligenceDashboard defaultLocation="Atlanta, GA" />
          </section>

          {/* Property Search */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
              <Search className="w-6 h-6" />
              Property Search Example
            </h2>
            <PropertySearchExample />
          </section>

          {/* Advanced Database Features */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
              <Database className="w-6 h-6" />
              DatabaseService Features
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Database Controls */}
              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Properties with Savings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="minSavings">Minimum Savings ($)</Label>
                    <Input
                      id="minSavings"
                      type="number"
                      value={minSavings}
                      onChange={(e) => setMinSavings(Number(e.target.value))}
                      className="mt-1"
                      min="0"
                      step="1000"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleGetSavingsProperties}
                    disabled={loadingDatabase}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    {loadingDatabase ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 mr-2" />
                        Get Savings Properties
                      </>
                    )}
                  </Button>

                  <div className="text-sm text-muted-foreground">
                    Found {savingsProperties.length} properties with savings ≥ ${minSavings.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              {/* AI Search */}
              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    AI Property Search
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Search Parameters:</div>
                    <div className="space-y-1 text-xs">
                      <div>• Location: Austin, TX</div>
                      <div>• Price Range: $200k - $500k</div>
                      <div>• Min Savings: $20k</div>
                      <div>• AI Matching: Enabled</div>
                      <div>• Sort by: Recommendation Score</div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleAISearch}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {loading ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Property Search
                      </>
                    )}
                  </Button>

                  <div className="text-sm text-muted-foreground">
                    Found {properties.length} AI-matched properties
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Display */}
            {(savingsProperties.length > 0 || properties.length > 0) && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-foreground">Search Results</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Database Service Results */}
                  {savingsProperties.map((property) => (
                    <Card key={`db-${property.id}`} className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-foreground">{property.address}</h4>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {property.city}, {property.state}
                              </div>
                            </div>
                            <Badge className="bg-green-500 hover:bg-green-600">
                              DB Service
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Price:</span>
                              <div className="font-semibold">${property.price.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Savings:</span>
                              <div className="font-semibold text-green-600">
                                ${property.potentialSavings.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Home className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{property.bedrooms}bd / {property.bathrooms}ba</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4 text-orange-500" />
                              <span className="text-sm font-medium">{property.recommendationScore}/100</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Hook Results */}
                  {properties.map((property) => (
                    <Card key={`hook-${property.id}`} className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-foreground">{property.address}</h4>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {property.city}, {property.state}
                              </div>
                            </div>
                            <Badge className="bg-purple-500 hover:bg-purple-600">
                              AI Hook
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Price:</span>
                              <div className="font-semibold">${property.price.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Savings:</span>
                              <div className="font-semibold text-green-600">
                                ${property.potentialSavings.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Home className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{property.bedrooms}bd / {property.bathrooms}ba</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-purple-500" />
                              <span className="text-sm font-medium">
                                {(property as any).aiMatchScore || property.recommendationScore}/100
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Code Examples */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-foreground">
              Integration Code Examples
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Import Examples */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">1. Import Components & Services</h3>
                <div className="bg-slate-900 rounded-lg p-4 text-green-400 font-mono text-sm overflow-x-auto">
                  <div className="text-blue-300">import</div> {`{ MarketIntelligenceDashboard }`} <div className="text-blue-300">from</div> <div className="text-yellow-300">'./components/MarketIntelligenceDashboard'</div><br />
                  <div className="text-blue-300">import</div> {`{ PropertySearchExample }`} <div className="text-blue-300">from</div> <div className="text-yellow-300">'./components/PropertySearchExample'</div><br />
                  <div className="text-blue-300">import</div> {`{ TestConnection }`} <div className="text-blue-300">from</div> <div className="text-yellow-300">'./components/TestConnection'</div><br /><br />
                  <div className="text-blue-300">import</div> {`{ DatabaseService }`} <div className="text-blue-300">from</div> <div className="text-yellow-300">'./services/databaseService'</div><br />
                  <div className="text-blue-300">import</div> {`{ usePropertySearch }`} <div className="text-blue-300">from</div> <div className="text-yellow-300">'./hooks/usePropertySearch'</div>
                </div>
              </div>

              {/* Usage Examples */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">2. Use in JSX</h3>
                <div className="bg-slate-900 rounded-lg p-4 text-green-400 font-mono text-sm overflow-x-auto">
                  <div className="text-slate-400">// Add anywhere in your JSX:</div><br />
                  <div className="text-red-400">&lt;TestConnection</div> <div className="text-red-400">/&gt;</div><br />
                  <div className="text-red-400">&lt;MarketIntelligenceDashboard</div> <div className="text-yellow-300">defaultLocation</div>=<div className="text-green-300">"Atlanta, GA"</div> <div className="text-red-400">/&gt;</div><br />
                  <div className="text-red-400">&lt;PropertySearchExample</div> <div className="text-red-400">/&gt;</div>
                </div>
              </div>

              {/* Service Usage */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">3. DatabaseService Usage</h3>
                <div className="bg-slate-900 rounded-lg p-4 text-green-400 font-mono text-sm overflow-x-auto">
                  <div className="text-slate-400">// Get properties with savings</div><br />
                  <div className="text-blue-300">const</div> savingsProperties = <div className="text-blue-300">await</div> DatabaseService<br />
                  &nbsp;&nbsp;.getPropertiesWithSavings(<div className="text-orange-300">100</div>)
                </div>
              </div>

              {/* Hook Usage */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">4. usePropertySearch Hook</h3>
                <div className="bg-slate-900 rounded-lg p-4 text-green-400 font-mono text-sm overflow-x-auto">
                  <div className="text-slate-400">// Search properties with AI matching</div><br />
                  <div className="text-blue-300">const</div> {`{ properties, loading, searchProperties }`} = <br />
                  &nbsp;&nbsp;usePropertySearch()<br /><br />
                  <div className="text-blue-300">await</div> searchProperties(filters, {`{ useAIMatching: true }`})
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdvancedFeaturesDemo;