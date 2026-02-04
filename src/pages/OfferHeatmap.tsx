import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import { HeatmapMap } from '@/components/heatmap/HeatmapMap';
import { ZipCodeStats } from '@/components/heatmap/ZipCodeStats';
import { 
  mockZipCodeData, 
  getTopZipCodes, 
  getZipCodesByCity,
  getSuccessRateColor,
  ZipCodeData
} from '@/data/mockHeatmapData';
import { 
  MapPin, 
  TrendingUp, 
  Filter, 
  Trophy,
  Home,
  Building,
  RefreshCw,
  Download,
  Share2
} from 'lucide-react';

const OfferHeatmap: React.FC = () => {
  const [selectedZip, setSelectedZip] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'renter' | 'landlord'>('renter');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [bedroomFilter, setBedroomFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number]>([3000]);
  const [showRankings, setShowRankings] = useState(true);

  // Filter data based on selections
  const filteredData = useMemo(() => {
    let data = [...mockZipCodeData];

    // City filter
    if (selectedCity !== 'all') {
      data = getZipCodesByCity(selectedCity);
    }

    // Price filter
    data = data.filter(zip => zip.avgRent <= priceRange[0]);

    return data;
  }, [selectedCity, bedroomFilter, priceRange]);

  // Get selected zip data
  const selectedZipData = useMemo(() => {
    if (!selectedZip) return null;
    return filteredData.find(zip => zip.zip === selectedZip) || null;
  }, [selectedZip, filteredData]);

  // Top performing zips
  const topZips = useMemo(() => {
    return getTopZipCodes(10).filter(zip => filteredData.some(f => f.zip === zip.zip));
  }, [filteredData]);

  const handleZipClick = (zip: string) => {
    setSelectedZip(zip);
  };

  const clearFilters = () => {
    setSelectedCity('all');
    setBedroomFilter('all');
    setPriceRange([3000]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Offer Success Heatmap
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Geographic analysis of negotiation success rates across Texas
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-3">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'renter' | 'landlord')}>
              <TabsList className="bg-white">
                <TabsTrigger value="renter" className="gap-2">
                  <Home className="w-4 h-4" />
                  Renter View
                </TabsTrigger>
                <TabsTrigger value="landlord" className="gap-2">
                  <Building className="w-4 h-4" />
                  Landlord View
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Badge variant="secondary" className="text-xs">
              {filteredData.length} ZIP codes
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Map Area */}
          <div className="lg:col-span-8 space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-600" />
                    <CardTitle className="text-sm font-semibold">Filters</CardTitle>
                  </div>
                  {(selectedCity !== 'all' || bedroomFilter !== 'all' || priceRange[0] !== 3000) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters}
                      className="text-xs"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* City Filter */}
                  <div>
                    <Label className="text-xs text-slate-600 mb-2 block">City</Label>
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        <SelectItem value="Austin">Austin</SelectItem>
                        <SelectItem value="Dallas">Dallas</SelectItem>
                        <SelectItem value="Houston">Houston</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bedrooms Filter */}
                  <div>
                    <Label className="text-xs text-slate-600 mb-2 block">Bedrooms</Label>
                    <Select value={bedroomFilter} onValueChange={setBedroomFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="1">1 Bed</SelectItem>
                        <SelectItem value="2">2 Bed</SelectItem>
                        <SelectItem value="3">3+ Bed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <Label className="text-xs text-slate-600 mb-2 block">
                      Max Rent: ${priceRange[0]}/mo
                    </Label>
                    <Slider
                      value={priceRange}
                      onValueChange={(v) => setPriceRange(v as [number])}
                      min={1000}
                      max={3000}
                      step={100}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Map */}
            <Card className="overflow-hidden">
              <div className="h-[600px]">
                <HeatmapMap
                  data={filteredData}
                  selectedZip={selectedZip}
                  onZipClick={handleZipClick}
                  viewMode={viewMode}
                />
              </div>
            </Card>

            {/* Top Performing ZIP Codes */}
            {showRankings && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <CardTitle className="text-lg">Top 10 ZIP Codes for Negotiation</CardTitle>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Highest success rates in the filtered area
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topZips.map((zip, index) => (
                      <div
                        key={zip.zip}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                          selectedZip === zip.zip
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                        onClick={() => handleZipClick(zip.zip)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index < 3 
                              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{zip.zip}</p>
                            <p className="text-xs text-slate-500">{zip.city}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Success Rate</p>
                            <p className="text-sm font-bold" style={{ color: getSuccessRateColor(zip.successRate) }}>
                              {zip.successRate}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Avg. Savings</p>
                            <p className="text-sm font-bold text-green-600">
                              ${zip.avgSavings}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Offers</p>
                            <p className="text-sm font-bold text-blue-600">
                              {zip.offerCount}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Stats */}
          <div className="lg:col-span-4">
            <div className="sticky top-6">
              <ZipCodeStats zipData={selectedZipData} viewMode={viewMode} />
            </div>
          </div>
        </div>

        {/* Market Insights Footer */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-base">Market Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-700">🏆 Best Markets</h4>
                <p className="text-xs text-slate-600">
                  Austin leads with the highest success rates (avg 75%), particularly in central ZIP codes.
                  South Austin (78704, 78741) shows exceptional negotiation outcomes.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-700">💰 Savings Potential</h4>
                <p className="text-xs text-slate-600">
                  Average savings range from $200-340/month across metro areas. 
                  Premium areas show higher absolute savings despite competitive markets.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-700">📊 Market Trends</h4>
                <p className="text-xs text-slate-600">
                  Higher offer volumes correlate with better success rates, indicating healthy rental markets.
                  Consider seasonal timing for optimal negotiation leverage.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OfferHeatmap;
