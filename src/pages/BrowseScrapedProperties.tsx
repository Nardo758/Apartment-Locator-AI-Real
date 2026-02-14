import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, TrendingDown, Tag, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import ScrapedPropertiesBrowser from '@/components/ScrapedPropertiesBrowser';
import { formatMoney } from '@/lib/savings-calculator';

export default function BrowseScrapedProperties() {
  useEffect(() => {
    document.title = 'Browse Properties | Apartment Locator AI';
  }, []);

  const { data: properties = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/scraped-properties'],
  });

  const { data: stats } = useQuery<{
    totalProperties: number;
    propertiesWithOffers: number;
    averageRent: number;
    cities: string[];
  }>({
    queryKey: ['/api/scraped-properties/stats'],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground" data-testid="text-browse-title">
            Browse Properties
          </h1>
          <p className="text-sm text-muted-foreground">
            Scraped apartment listings with AI-powered savings analysis
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/30">
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Listings</p>
                  <p className="font-bold text-foreground" data-testid="text-total-listings">{stats.totalProperties}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="p-2 rounded-md bg-green-50 dark:bg-green-950/30">
                  <Tag className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">With Offers</p>
                  <p className="font-bold text-foreground" data-testid="text-with-offers">{stats.propertiesWithOffers}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="p-2 rounded-md bg-purple-50 dark:bg-purple-950/30">
                  <TrendingDown className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg. Rent</p>
                  <p className="font-bold text-foreground" data-testid="text-avg-rent">
                    {stats.averageRent > 0 ? formatMoney(stats.averageRent) : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="p-2 rounded-md bg-orange-50 dark:bg-orange-950/30">
                  <BarChart3 className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Markets</p>
                  <p className="font-bold text-foreground" data-testid="text-markets-count">{stats.cities?.length || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <ScrapedPropertiesBrowser
          properties={properties}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
