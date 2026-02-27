import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Gift,
  TrendingDown,
  Target,
  Zap,
  Share2,
  Star,
  BarChart3,
  Car,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';
import { useSavedScrapedProperties } from '@/hooks/useSavedScrapedProperties';
import type { ScrapedProperty } from '@/lib/savings-calculator';
import { calculatePropertySavings, formatMoney } from '@/lib/savings-calculator';
import { toast } from '@/hooks/use-toast';
import { useUnifiedAI } from '@/contexts/UnifiedAIContext';
import { AMENITY_KEYWORDS } from '@/lib/smart-score-engine';

function calcConcession(property: ScrapedProperty): number {
  const rent = property.min_rent || property.max_rent || 0;
  if (rent <= 0) return 0;

  if (property.effective_price && property.effective_price < rent) {
    return rent - property.effective_price;
  }

  const ct = (property.concession_type || '').toLowerCase();
  const cv = property.concession_value || 0;

  if (ct && cv > 0) {
    if (ct.includes('week')) return Math.round((rent * 12 * (cv / 52)) / 12);
    if (ct.includes('month') || ct.includes('free')) return Math.round((rent * cv) / 12);
    if (ct.includes('percent') || ct.includes('%')) return Math.round(rent * (cv / 100));
    if (ct.includes('dollar') || ct.includes('fixed')) return cv > 500 ? Math.round(cv / 12) : cv;
  }

  const text = (property.special_offers || '').toLowerCase();
  const wk = text.match(/(\d+)\s*weeks?\s*free/);
  if (wk) return Math.round((rent * 12 * (parseInt(wk[1]) / 52)) / 12);
  const mo = text.match(/(\d+)\s*months?\s*free/);
  if (mo) return Math.round((rent * parseInt(mo[1])) / 12);
  const dl = text.match(/\$(\d[\d,]*)\s*off/);
  if (dl) { const a = parseInt(dl[1].replace(/,/g, ''), 10); return a > 500 ? Math.round(a / 12) : a; }

  return 0;
}

function doesAmenityMatch(propertyAmenity: string, userPref: string): boolean {
  const amenityLower = propertyAmenity.toLowerCase();
  const prefLower = userPref.toLowerCase();

  if (amenityLower.includes(prefLower) || prefLower.includes(amenityLower)) return true;

  const keywords = AMENITY_KEYWORDS[userPref] || [];
  if (keywords.some(kw => amenityLower.includes(kw))) return true;

  for (const [label, kws] of Object.entries(AMENITY_KEYWORDS)) {
    if (label.toLowerCase() === prefLower || kws.includes(prefLower)) {
      if (kws.some(kw => amenityLower.includes(kw)) || amenityLower.includes(label.toLowerCase())) {
        return true;
      }
    }
  }

  return false;
}

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
  const [showMath, setShowMath] = useState(false);

  const { inputs } = useUnifiedAI();
  const userAmenityPrefs: string[] = inputs?.aiPreferences?.amenities || [];

  useEffect(() => {
    document.title = 'Property Details | Apartment Locator AI';
  }, []);

  const isNumericId = id ? /^\d+$/.test(id) : false;

  const { data: property, isLoading } = useQuery<ScrapedProperty>({
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

  const savings = useMemo(() => {
    if (!displayProperty) return null;
    try {
      return calculatePropertySavings(displayProperty);
    } catch (e) {
      console.error('Savings calc failed:', e);
      return null;
    }
  }, [displayProperty]);

  const rent = displayProperty?.min_rent || displayProperty?.max_rent || 0;
  const concessionMonthly = displayProperty ? calcConcession(displayProperty) : 0;
  const effectiveRent = rent - concessionMonthly;

  const MARKET_MEDIANS: Record<string, number> = {
    'Atlanta': 1700, 'Orlando': 1847, 'Austin': 1650, 'Dallas': 1500,
    'Houston': 1400, 'Tampa': 1600, 'Miami': 2200, 'Charlotte': 1550,
  };
  const medianRent = displayProperty ? (MARKET_MEDIANS[displayProperty.city] || 1600) : 1600;
  const vsMarket = medianRent - effectiveRent;

  const amenities = useMemo(() => {
    if (!displayProperty) return [];
    return Array.isArray(displayProperty.amenities) ? displayProperty.amenities as string[] : [];
  }, [displayProperty]);

  const amenityMatchResult = useMemo(() => {
    if (userAmenityPrefs.length === 0 || amenities.length === 0) {
      return { matched: [] as string[], unmatched: [] as string[], total: userAmenityPrefs.length };
    }

    const matched: string[] = [];
    const unmatched: string[] = [];

    for (const pref of userAmenityPrefs) {
      const hasMatch = amenities.some(a => doesAmenityMatch(String(a), pref));
      if (hasMatch) {
        matched.push(pref);
      } else {
        unmatched.push(pref);
      }
    }

    return { matched, unmatched, total: userAmenityPrefs.length };
  }, [amenities, userAmenityPrefs]);

  const isAmenityMatched = useMemo(() => {
    const matchedSet = new Set<string>();
    for (const amenity of amenities) {
      for (const pref of amenityMatchResult.matched) {
        if (doesAmenityMatch(String(amenity), pref)) {
          matchedSet.add(String(amenity));
        }
      }
    }
    return matchedSet;
  }, [amenities, amenityMatchResult.matched]);

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

  const rentDisplay = displayProperty.min_rent
    ? `${formatMoney(displayProperty.min_rent)}${displayProperty.max_rent && displayProperty.max_rent !== displayProperty.min_rent ? ` - ${formatMoney(displayProperty.max_rent)}` : ''}`
    : 'Contact for pricing';

  const sqft = (displayProperty as any).sqft;
  const volatility = (displayProperty as any).volatility_score || 0;
  const priceChanges = (displayProperty as any).price_change_count || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-16">
        <PropertyHeroImage imageUrl={resolvedImageUrl} name={displayProperty.name} />

        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
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
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                data-testid="button-share-property"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({ title: 'Link copied!', description: 'Property link copied to clipboard' });
                }}
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Button
                variant={isSaved(displayProperty.id) ? 'default' : 'outline'}
                size="sm"
                data-testid="button-save-detail"
                onClick={() => toggleSaveScraped(displayProperty)}
              >
                <Heart className={`w-4 h-4 mr-1 ${isSaved(displayProperty.id) ? 'fill-current' : ''}`} />
                {isSaved(displayProperty.id) ? 'Saved' : 'Save'}
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1" data-testid="text-property-name">
                  {displayProperty.name}
                </h1>
                <div className="flex items-center gap-1 text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span data-testid="text-property-address">
                    {displayProperty.address}
                    {displayProperty.city ? `, ${displayProperty.city}` : ''}
                    {displayProperty.state ? `, ${displayProperty.state}` : ''}
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-3xl font-bold text-foreground" data-testid="text-property-rent">
                    {rentDisplay}
                    <span className="text-base font-normal text-muted-foreground">/mo</span>
                  </div>
                  {concessionMonthly > 0 && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-sm">
                      <Gift className="w-3.5 h-3.5 mr-1" />
                      Save {formatMoney(concessionMonthly)}/mo
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-3 flex-wrap">
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
                  {sqft && (
                    <Badge variant="secondary">
                      <Maximize className="w-3.5 h-3.5 mr-1" />
                      {Number(sqft).toLocaleString()} sqft
                    </Badge>
                  )}
                  {displayProperty.pet_policy && (
                    <Badge variant="secondary">
                      <PawPrint className="w-3.5 h-3.5 mr-1" />
                      {displayProperty.pet_policy}
                    </Badge>
                  )}
                </div>
              </div>

              <Card>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-500" />
                      True Cost Analysis
                    </CardTitle>
                    {vsMarket > 0 && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        {formatMoney(vsMarket)}/mo below market
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-slate-500" />
                      </div>
                      <span className="text-sm font-medium">Base Rent</span>
                    </div>
                    <span className="text-sm font-semibold">{formatMoney(rent)}/mo</span>
                  </div>

                  {concessionMonthly > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                            <Gift className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-emerald-600">Concession Discount</span>
                            {displayProperty.special_offers && (
                              <p className="text-xs text-muted-foreground">{displayProperty.special_offers}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-emerald-500">
                          -{formatMoney(concessionMonthly)}/mo
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                        <span className="text-sm text-muted-foreground">Effective Rent</span>
                        <span className="text-sm font-bold">{formatMoney(effectiveRent)}/mo</span>
                      </div>

                      <button
                        onClick={() => setShowMath(!showMath)}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                        data-testid="button-toggle-math"
                      >
                        {showMath ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {showMath ? 'Hide' : 'Show'} concession math
                      </button>
                      {showMath && (
                        <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 text-xs space-y-1 text-muted-foreground">
                          <p>Base rent: {formatMoney(rent)}/mo</p>
                          <p>Concession saves: {formatMoney(concessionMonthly)}/mo (amortized over 12 months)</p>
                          <p>Annual concession value: {formatMoney(concessionMonthly * 12)}</p>
                          <p className="font-medium text-emerald-600">
                            Effective rent: {formatMoney(rent)} - {formatMoney(concessionMonthly)} = {formatMoney(effectiveRent)}/mo
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="border-t pt-3 mt-2">
                    <div className="p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 text-center">
                      <Car className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                      <p className="text-sm font-medium mb-1">Personalize with Your Commute</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Enter your work address to see commute, parking, and lifestyle costs.
                      </p>
                      <Button size="sm" variant="outline" onClick={() => navigate('/dashboard')} data-testid="button-go-dashboard">
                        Go to Dashboard
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {displayProperty.city || 'Market'} median rent
                      </span>
                      <span className="text-sm">{formatMoney(medianRent)}/mo</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        {vsMarket >= 0 ? 'You save vs market' : 'Above market by'}
                      </span>
                      <span className={`text-lg font-bold ${vsMarket >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {vsMarket >= 0 ? '' : '+'}{formatMoney(Math.abs(vsMarket))}/mo
                      </span>
                    </div>
                    {vsMarket > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Annual savings</span>
                        <span className="font-semibold text-emerald-500">{formatMoney(vsMarket * 12)}/yr</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {displayProperty.special_offers && (
                <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/10">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-500" />
                      Special Offer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400" data-testid="text-special-offers">
                      {displayProperty.special_offers}
                    </p>
                    {concessionMonthly > 0 && (
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Monthly value:</span>
                        <span className="font-bold text-emerald-600">{formatMoney(concessionMonthly)}/mo</span>
                        <span className="text-muted-foreground">Annual:</span>
                        <span className="font-bold text-emerald-600">{formatMoney(concessionMonthly * 12)}/yr</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {amenities.length > 0 && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Star className="w-4 h-4 text-purple-500" />
                      Amenities
                      <Badge variant="secondary" className="ml-1 text-xs">{amenities.length}</Badge>
                      {amenityMatchResult.total > 0 && (
                        <Badge
                          variant={amenityMatchResult.matched.length === amenityMatchResult.total ? 'default' : 'secondary'}
                          className={`ml-auto text-xs ${amenityMatchResult.matched.length > 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : ''}`}
                          data-testid="badge-amenity-match"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {amenityMatchResult.matched.length} of {amenityMatchResult.total} match your profile
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {amenities.map((amenity, i) => {
                        const matched = isAmenityMatched.has(String(amenity));
                        return (
                          <Badge
                            key={i}
                            variant={matched ? 'default' : 'outline'}
                            className={matched ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' : ''}
                            data-testid={`badge-amenity-${i}`}
                          >
                            {matched && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {String(amenity)}
                          </Badge>
                        );
                      })}
                    </div>
                    {amenityMatchResult.unmatched.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Missing from your wishlist:</p>
                        <div className="flex flex-wrap gap-1">
                          {amenityMatchResult.unmatched.map((pref, i) => (
                            <Badge key={i} variant="outline" className="text-xs text-muted-foreground border-dashed">
                              {pref}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {(displayProperty as any).description && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">About This Property</CardTitle>
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
              {savings && (savings.monthlySavings > 0 || savings.upfrontSavings > 0 || concessionMonthly > 0) && (
                <Card className="border-emerald-200 dark:border-emerald-800">
                  <CardHeader className="py-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      Savings Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    {concessionMonthly > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Concession</span>
                        <span className="font-bold text-emerald-600">{formatMoney(concessionMonthly)}/mo</span>
                      </div>
                    )}
                    {savings.monthlySavings > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Monthly Savings</span>
                        <span className="font-bold text-emerald-600" data-testid="text-monthly-savings">
                          {formatMoney(savings.monthlySavings)}
                        </span>
                      </div>
                    )}
                    {savings.upfrontSavings > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Upfront Savings</span>
                        <span className="font-bold text-purple-600" data-testid="text-upfront-savings">
                          {formatMoney(savings.upfrontSavings)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="text-sm font-medium">Total (1st Year)</span>
                      <span className="text-lg font-bold" data-testid="text-total-savings">
                        {formatMoney((savings.annualSavings || 0) + (savings.upfrontSavings || 0))}
                      </span>
                    </div>
                    {savings.dealScore > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Deal Score</span>
                        <div className="flex items-center gap-2">
                          <Progress value={savings.dealScore} className="w-16 h-2" />
                          <Badge variant={savings.dealScore >= 70 ? 'default' : 'secondary'} className="text-xs">
                            {savings.dealScore}/100
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-500" />
                    Market Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">vs {displayProperty.city || 'Market'} Median</span>
                    <span className={`text-sm font-semibold ${vsMarket >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {vsMarket >= 0
                        ? `${medianRent > 0 ? Math.round((vsMarket / medianRent) * 100) : 0}% below`
                        : `${medianRent > 0 ? Math.round((Math.abs(vsMarket) / medianRent) * 100) : 0}% above`
                      }
                    </span>
                  </div>

                  {volatility > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Price Volatility</span>
                      <Badge variant={volatility >= 70 ? 'destructive' : 'secondary'} className="text-xs">
                        {volatility >= 70 ? 'High' : volatility >= 40 ? 'Moderate' : 'Low'}
                      </Badge>
                    </div>
                  )}

                  {priceChanges > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Price Changes</span>
                      <span className="text-sm font-medium">{priceChanges}x</span>
                    </div>
                  )}

                  {(volatility >= 60 || vsMarket < 0 || priceChanges >= 2) && (
                    <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50">
                      <div className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-0.5">
                            Negotiation Tip
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-500">
                            {priceChanges >= 2
                              ? 'Multiple price changes signal flexibility. Ask for rent reduction or additional concessions.'
                              : volatility >= 60
                              ? 'High volatility suggests room to negotiate. Try requesting 1-2 weeks free.'
                              : 'Priced above market. Use comparable listings to negotiate a lower rate.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-2">
                {displayProperty.website_url && (
                  <Button
                    className="w-full"
                    variant="default"
                    data-testid="button-visit-website"
                    onClick={() => window.open(displayProperty.website_url!, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {displayProperty.direct_website_url ? 'Visit Property Website' : 'View on Apartments.com'}
                  </Button>
                )}
                {displayProperty.direct_website_url && displayProperty.listing_url && displayProperty.listing_url !== displayProperty.direct_website_url && (
                  <Button
                    className="w-full"
                    variant="outline"
                    data-testid="button-view-on-apartments"
                    onClick={() => window.open(displayProperty.listing_url!, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Apartments.com
                  </Button>
                )}
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  data-testid="button-calculate-true-cost"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Calculate True Cost
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    toast({ title: 'Coming Soon', description: 'Tour scheduling will be available soon!' });
                  }}
                  data-testid="button-schedule-tour"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Tour
                </Button>
              </div>

              {(displayProperty as any).scraped_at && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground justify-center pt-2">
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
