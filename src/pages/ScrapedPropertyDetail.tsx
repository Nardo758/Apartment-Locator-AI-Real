import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Heart,
  ExternalLink,
  Bed,
  Bath,
  Maximize,
  Tag,
  PawPrint,
  DollarSign,
  Calendar,
  Loader2,
} from 'lucide-react';
import { useSavedScrapedProperties } from '@/hooks/useSavedScrapedProperties';
import type { ScrapedProperty } from '@/lib/savings-calculator';
import { calculatePropertySavings, formatMoney } from '@/lib/savings-calculator';

function PropertyHeroImage({ imageUrl, name }: { imageUrl?: string; name: string }) {
  const [imgError, setImgError] = useState(false);

  if (!imageUrl || imgError) {
    return (
      <div className="w-full h-64 md:h-80 bg-muted flex items-center justify-center" data-testid="img-detail-fallback">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Building2 className="w-12 h-12" />
          <span className="text-sm">No image available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 md:h-80 bg-muted">
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
        data-testid="img-detail-property"
      />
    </div>
  );
}

export default function ScrapedPropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSaved, toggleSaveScraped, saved } = useSavedScrapedProperties();

  useEffect(() => {
    document.title = 'Property Details | Apartment Locator AI';
  }, []);

  const isNumericId = id ? /^\d+$/.test(id) : false;

  const { data: property, isLoading, error } = useQuery<ScrapedProperty>({
    queryKey: [`/api/scraped-properties/${id}`],
    enabled: !!id && isNumericId,
  });

  const localProperty = saved.find(p => String(p.id) === String(id));

  const localAsScraped = localProperty ? {
    id: localProperty.id,
    name: localProperty.name,
    address: localProperty.address,
    city: localProperty.city,
    state: localProperty.state || '',
    min_rent: localProperty.min_rent,
    max_rent: localProperty.max_rent,
    bedrooms_min: localProperty.bedrooms_min,
    bedrooms_max: localProperty.bedrooms_max,
    bathrooms_min: localProperty.bathrooms_min,
    image_url: localProperty.image_url,
    website_url: localProperty.website_url,
    amenities: localProperty.amenities,
    pet_policy: localProperty.pet_policy,
    special_offers: localProperty.specials,
  } as unknown as ScrapedProperty : null;

  const displayProperty = property || localAsScraped;

  const needsPhoto = displayProperty && !displayProperty.image_url && displayProperty.address && !displayProperty.address.startsWith('http');
  const photoQuery = useQuery<{ photo_url: string | null }>({
    queryKey: ['/api/places-photo', displayProperty?.address, displayProperty?.city],
    queryFn: async () => {
      const params = new URLSearchParams({
        address: displayProperty!.address,
        city: displayProperty!.city || '',
        state: displayProperty!.state || '',
      });
      const res = await fetch(`/api/places-photo?${params}`);
      if (!res.ok) throw new Error('Photo lookup failed');
      return res.json();
    },
    enabled: !!needsPhoto,
    staleTime: Infinity,
  });

  const resolvedImageUrl = displayProperty?.image_url || photoQuery.data?.photo_url || undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!displayProperty) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24 text-center">
          <Building2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Property not found</h2>
          <p className="text-muted-foreground mb-4">This property may have been removed or the link is invalid.</p>
          <Button onClick={() => navigate('/browse-properties')} data-testid="button-go-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const savings = calculatePropertySavings(displayProperty);
  const rentDisplay = displayProperty.min_rent
    ? `${formatMoney(displayProperty.min_rent)}${displayProperty.max_rent && displayProperty.max_rent !== displayProperty.min_rent ? ` - ${formatMoney(displayProperty.max_rent)}` : ''}`
    : 'Contact for pricing';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-16">
        <PropertyHeroImage imageUrl={resolvedImageUrl} name={displayProperty.name} />

        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              data-testid="button-back"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/browse-properties');
                }
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1" data-testid="text-property-name">
                      {displayProperty.name}
                    </h1>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span data-testid="text-property-address">
                        {displayProperty.address}
                        {displayProperty.city ? `, ${displayProperty.city}` : ''}
                        {displayProperty.state ? `, ${displayProperty.state}` : ''}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant={isSaved(displayProperty.id) ? 'default' : 'outline'}
                    data-testid="button-save-detail"
                    onClick={() => toggleSaveScraped(displayProperty)}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isSaved(displayProperty.id) ? 'fill-current' : ''}`} />
                    {isSaved(displayProperty.id) ? 'Saved' : 'Save'}
                  </Button>
                </div>
              </div>

              <div className="text-3xl font-bold text-foreground" data-testid="text-property-rent">
                {rentDisplay}
                <span className="text-base font-normal text-muted-foreground">/month</span>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                {displayProperty.bedrooms_min != null && (
                  <Badge variant="secondary">
                    <Bed className="w-3.5 h-3.5 mr-1" />
                    {displayProperty.bedrooms_min}
                    {displayProperty.bedrooms_max && displayProperty.bedrooms_max !== displayProperty.bedrooms_min
                      ? `-${displayProperty.bedrooms_max}`
                      : ''} Bedrooms
                  </Badge>
                )}
                {displayProperty.bathrooms_min != null && (
                  <Badge variant="secondary">
                    <Bath className="w-3.5 h-3.5 mr-1" />
                    {displayProperty.bathrooms_min} Bathrooms
                  </Badge>
                )}
                {(displayProperty as any).sqft_min && (
                  <Badge variant="secondary">
                    <Maximize className="w-3.5 h-3.5 mr-1" />
                    {(displayProperty as any).sqft_min.toLocaleString()} sqft
                  </Badge>
                )}
                {displayProperty.pet_policy && (
                  <Badge variant="secondary">
                    <PawPrint className="w-3.5 h-3.5 mr-1" />
                    {displayProperty.pet_policy}
                  </Badge>
                )}
              </div>

              {displayProperty.special_offers && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-500" />
                      Special Offers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-foreground" data-testid="text-special-offers">
                      {displayProperty.special_offers}
                    </p>
                  </CardContent>
                </Card>
              )}

              {displayProperty.amenities && Array.isArray(displayProperty.amenities) && displayProperty.amenities.length > 0 && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Amenities</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {(displayProperty.amenities as string[]).map((amenity, i) => (
                        <Badge key={i} variant="outline">{amenity}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {(displayProperty as any).description && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Description</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground whitespace-pre-line" data-testid="text-description">
                      {(displayProperty as any).description}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:w-80 space-y-4">
              {(savings.monthlySavings > 0 || savings.upfrontSavings > 0) && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      Savings Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {savings.monthlySavings > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Monthly Savings</span>
                        <span className="font-bold text-green-600" data-testid="text-monthly-savings">{formatMoney(savings.monthlySavings)}</span>
                      </div>
                    )}
                    {savings.upfrontSavings > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Upfront Savings</span>
                        <span className="font-bold text-purple-600" data-testid="text-upfront-savings">{formatMoney(savings.upfrontSavings)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="text-sm font-medium">Total (1st Year)</span>
                      <span className="font-bold text-foreground" data-testid="text-total-savings">{formatMoney(savings.annualSavings + savings.upfrontSavings)}</span>
                    </div>
                    {savings.dealScore > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Deal Score</span>
                        <Badge variant={savings.dealScore >= 70 ? 'default' : 'secondary'}>
                          {savings.dealScore}/100
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {displayProperty.website_url && (
                <Button
                  className="w-full"
                  variant="outline"
                  data-testid="button-visit-website"
                  onClick={() => window.open(displayProperty.website_url!, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Property Website
                </Button>
              )}

              {(displayProperty as any).scraped_at && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground justify-center">
                  <Calendar className="w-3 h-3" />
                  Last updated: {new Date((displayProperty as any).scraped_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
