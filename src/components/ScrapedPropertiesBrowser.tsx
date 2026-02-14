/**
 * Scraped Properties Browser
 * Displays real apartment data from the apartment-scraper-worker
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Building,
  MapPin,
  DollarSign,
  Bed,
  Square,
  Calendar,
  Tag,
  Phone,
  ExternalLink,
  Filter,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import UpfrontSavingsCalculator from './UpfrontSavingsCalculator';
import BlurredPropertyCard from './BlurredPropertyCard';
import { parseConcessions, calculateTotalSavings } from '@/lib/savings-calculator';
import { useUser } from '@/hooks/useUser';

interface LeaseRate {
  id: string;
  unit_type: string;
  sqft: number | null;
  price: number;
  lease_term: string;
  available: string;
}

interface Concession {
  id: string;
  type: string;
  description: string;
  value: string | null;
}

interface Property {
  id: string;
  property_name: string;
  address: string;
  city: string;
  state: string;
  phone: string | null;
  website_url: string | null;
  pms_type: string | null;
  min_price: number | null;
  max_price: number | null;
  available_units: number;
  scraped_at: string;
}

interface PropertyDetails extends Property {
  lease_rates: LeaseRate[];
  concessions: Concession[];
  amenities: string[];
}

export const ScrapedPropertiesBrowser: React.FC = () => {
  const { user } = useUser();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total_properties: 0, total_lease_rates: 0, total_concessions: 0 });
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  
  // Check if user is on free tier
  const isFreeUser = !user?.subscriptionTier || user.subscriptionTier === 'free';

  // Filters
  const [searchCity, setSearchCity] = useState('');
  const [searchState, setSearchState] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Fetch properties
  const fetchProperties = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchCity) params.append('city', searchCity);
      if (searchState) params.append('state', searchState);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      params.append('limit', '50');

      const response = await fetch(`/api/scraped-properties?${params}`);
      if (!response.ok) throw new Error('Failed to fetch properties');

      const data = await response.json();
      setProperties(data.properties || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/scraped-properties/stats/summary');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Fetch property details
  const fetchPropertyDetails = async (propertyId: string) => {
    setDetailsLoading(true);

    try {
      const response = await fetch(`/api/scraped-properties/${propertyId}`);
      if (!response.ok) throw new Error('Failed to fetch property details');

      const data = await response.json();
      setSelectedProperty(data as PropertyDetails);
    } catch (err: any) {
      console.error('Error fetching details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchStats();
  }, []);

  const handleSearch = () => {
    fetchProperties();
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A';
    return `$${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_properties}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lease Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_lease_rates}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Concessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_concessions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Properties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Atlanta"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="GA"
                maxLength={2}
                value={searchState}
                onChange={(e) => setSearchState(e.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minPrice">Min Price</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="1500"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPrice">Max Price</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="3000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleSearch} className="w-full md:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Search Properties
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Properties List */}
      <Card>
        <CardHeader>
          <CardTitle>Scraped Properties ({properties.length})</CardTitle>
          <CardDescription>
            Real apartment data from property management systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-md">
              <AlertCircle className="h-5 w-5" />
              <span>Error: {error}</span>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No properties found. Try adjusting your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((property, index) => {
                // Free users: Show first 2 properties fully, then blur the rest
                const shouldBlur = isFreeUser && index >= 2;
                
                if (shouldBlur) {
                  // Calculate savings for this property
                  const lowestRent = property.min_price || 0;
                  const { upfrontIncentives, monthlyConcessions } = parseConcessions(
                    [], // We don't have concessions in the list view
                    lowestRent,
                    12
                  );
                  const { monthlyTotal } = calculateTotalSavings(upfrontIncentives, monthlyConcessions);
                  const estimatedMonthlySavings = Math.floor(lowestRent * 0.1); // Estimate 10% savings
                  
                  return (
                    <BlurredPropertyCard
                      key={property.id}
                      savings={estimatedMonthlySavings}
                      totalSavings={estimatedMonthlySavings * 12}
                      score={Math.floor(Math.random() * 20) + 80} // Random score 80-100
                      rank={index + 1}
                      leaseTerm={12}
                      onUpgrade={() => setShowPaywallModal(true)}
                    />
                  );
                }
                
                // Paid users or first 2 properties: Show full card
                return (
                <Card key={property.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-start justify-between">
                      <span className="flex-1">{property.property_name}</span>
                      {property.pms_type && (
                        <Badge variant="secondary" className="ml-2">
                          {property.pms_type}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">
                        {property.address}, {property.city}, {property.state}
                      </span>
                    </div>

                    {property.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{property.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatPrice(property.min_price)} - {formatPrice(property.max_price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {property.available_units} available units
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground text-xs">
                        Scraped: {formatDate(property.scraped_at)}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => fetchPropertyDetails(property.id)}
                      >
                        View Details
                      </Button>
                      {property.website_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(property.website_url!, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Paywall Modal */}
      {showPaywallModal && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <CardContent className="max-w-lg w-full mx-4">
            <div className="space-y-6 p-6">
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Unlock All Properties
                </div>
                <p className="text-muted-foreground">
                  Get full access to all {properties.length} properties with detailed information, contact details, and savings calculators
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold">Full Property Details</div>
                    <div className="text-muted-foreground">Address, contact info, amenities</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold">Savings Calculator</div>
                    <div className="text-muted-foreground">See exact upfront & monthly savings</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold">Move-in Concessions</div>
                    <div className="text-muted-foreground">Free months, fee waivers, gift cards</div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPaywallModal(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => window.location.href = '/pricing'}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  View Plans
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Details Modal */}
      {selectedProperty && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedProperty.property_name}</span>
              <Button size="sm" variant="ghost" onClick={() => setSelectedProperty(null)}>
                Close
              </Button>
            </CardTitle>
            <CardDescription>{selectedProperty.address}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {detailsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                {/* Lease Rates */}
                {selectedProperty.lease_rates.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Available Units ({selectedProperty.lease_rates.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedProperty.lease_rates.map((rate) => (
                        <div
                          key={rate.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-md"
                        >
                          <div className="space-y-1">
                            <div className="font-medium">{rate.unit_type}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-3">
                              {rate.sqft && (
                                <span className="flex items-center gap-1">
                                  <Square className="h-3 w-3" />
                                  {rate.sqft} sqft
                                </span>
                              )}
                              <span>{rate.lease_term}</span>
                              <span>Available: {rate.available}</span>
                            </div>
                          </div>
                          <div className="text-lg font-bold text-primary">
                            {formatPrice(rate.price)}/mo
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Savings Calculator */}
                {(() => {
                  // Get lowest rent for calculator
                  const lowestRent = selectedProperty.lease_rates.length > 0
                    ? Math.min(...selectedProperty.lease_rates.map(r => r.price))
                    : 0;
                  
                  // Parse concessions into upfront/monthly
                  const { upfrontIncentives, monthlyConcessions } = parseConcessions(
                    selectedProperty.concessions.map(c => ({ description: c.description, type: c.type })),
                    lowestRent,
                    12
                  );
                  
                  // Only show if there are any incentives
                  if (upfrontIncentives.length > 0 || monthlyConcessions.length > 0) {
                    return (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Savings Calculator
                        </h3>
                        <UpfrontSavingsCalculator
                          baseRent={lowestRent}
                          leaseTerm={12}
                          upfrontIncentives={upfrontIncentives}
                          monthlyConcessions={monthlyConcessions}
                        />
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Amenities */}
                {selectedProperty.amenities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProperty.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    {selectedProperty.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${selectedProperty.phone}`} className="text-primary hover:underline">
                          {selectedProperty.phone}
                        </a>
                      </div>
                    )}
                    {selectedProperty.website_url && (
                      <Button
                        variant="default"
                        onClick={() => window.open(selectedProperty.website_url!, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Website
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScrapedPropertiesBrowser;
