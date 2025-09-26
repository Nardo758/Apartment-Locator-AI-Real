import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { ApartmentScraperAPI, type UnitData, type MarketInsights } from '@/lib/apartment-scraper-api';
import { Loader2, Search, MapPin, Calendar, DollarSign, Home } from 'lucide-react';

export const ConnectedApartmentIQ: React.FC = () => {
  const [zipCodes, setZipCodes] = useState(['33315', '32256']);
  const [units, setUnits] = useState<UnitData[]>([]);
  const [loading, setLoading] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState(0);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [insights, setInsights] = useState<MarketInsights | null>(null);
  const { toast } = useToast();
  
  const handleTriggerScrape = async () => {
    setLoading(true);
    setScrapeProgress(0);
    setUnits([]);
    
    try {
      // Trigger scrape
      const job = await ApartmentScraperAPI.triggerScrape(zipCodes);
      setCurrentJobId(job.jobId);
      
      toast({
        title: "Scrape Started",
        description: "Live data collection in progress. This may take 2-5 minutes.",
      });
      
      // Poll for job status
      const pollInterval = setInterval(async () => {
        try {
          const status = await ApartmentScraperAPI.checkJobStatus(job.jobId);
          
          if (status.progress) {
            setScrapeProgress(status.progress);
          }
          
          if (status.completed) {
            clearInterval(pollInterval);
            const scrapedUnits = await ApartmentScraperAPI.getScrapedData(zipCodes);
            const marketInsights = await ApartmentScraperAPI.getMarketInsights(zipCodes);
            
            setUnits(scrapedUnits);
            setInsights(marketInsights);
            setLoading(false);
            setScrapeProgress(100);
            
            toast({
              title: "Scrape Complete",
              description: `Found ${scrapedUnits.length} units with live data`,
            });
          }
        } catch (error) {
          clearInterval(pollInterval);
          console.error('Error polling job status:', error);
          setLoading(false);
          toast({
            title: "Error",
            description: "Failed to check scrape status",
            variant: "destructive",
          });
        }
      }, 5000); // Poll every 5 seconds
      
    } catch (error) {
      console.error('Scrape failed:', error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to start scrape",
        variant: "destructive",
      });
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="glass-dark rounded-xl p-6">
        <h1 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          🤖 ApartmentIQ Live Scraper
          <Badge variant="secondary" className="text-xs">Beta</Badge>
        </h1>
        
        <div className="flex gap-4 items-end mb-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Target Zip Codes
            </label>
            <Input
              value={zipCodes.join(', ')}
              onChange={(e) => setZipCodes(e.target.value.split(',').map(z => z.trim()).filter(Boolean))}
              placeholder="Enter zip codes (e.g., 33315, 32256)"
              className="bg-background/50"
            />
          </div>
          
          <Button
            onClick={handleTriggerScrape}
            disabled={loading || zipCodes.length === 0}
            className="px-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Start Live Scrape
              </>
            )}
          </Button>
        </div>
        
        {loading && (
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-primary font-medium">
                  🔄 Collecting live data from property websites...
                </span>
                <span className="text-sm text-muted-foreground">{scrapeProgress}%</span>
              </div>
              <Progress value={scrapeProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                This process typically takes 2-5 minutes depending on the number of properties.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {insights && (
        <Card className="glass-dark">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              📊 Market Insights
              <Badge variant="outline" className="text-xs">Live Data</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{formatCurrency(insights.average_rent)}</div>
                <div className="text-sm text-muted-foreground">Average Rent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{formatCurrency(insights.median_rent)}</div>
                <div className="text-sm text-muted-foreground">Median Rent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{insights.availability_rate}%</div>
                <div className="text-sm text-muted-foreground">Availability</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary capitalize">{insights.rent_trend}</div>
                <div className="text-sm text-muted-foreground">Trend</div>
              </div>
            </div>
            
            {Array.isArray(insights?.common_concessions) && insights.common_concessions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Common Concessions</h4>
                <div className="flex flex-wrap gap-2">
                  {insights.common_concessions.map((concession, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {concession.type} ({concession.frequency}%)
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {units.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            🏠 Live Scraping Results
            <Badge variant="outline">{units.length} units found</Badge>
          </h2>
          
          <div className="grid gap-4">
            {units.map((unit) => (
              <Card key={unit.id} className="glass-dark hover:bg-background/10 transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{unit.property_name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {unit.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{formatCurrency(unit.rent)}</div>
                      <div className="text-xs text-muted-foreground">per month</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Home className="w-4 h-4" />
                      {unit.bedrooms} bed, {unit.bathrooms} bath
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      {unit.sqft} sqft
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Available: {new Date(unit.availability_date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Updated: {new Date(unit.last_updated).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {unit.concessions && unit.concessions.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-foreground mb-2">Current Concessions</h4>
                      <div className="flex flex-wrap gap-2">
                        {unit.concessions.map((concession, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                            {concession}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {unit.amenities && unit.amenities.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {unit.amenities.slice(0, 5).map((amenity, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {unit.amenities.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{unit.amenities.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};