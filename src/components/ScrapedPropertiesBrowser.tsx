import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Building2, Tag, ExternalLink, Brain, CheckCircle2, TrendingUp, DollarSign, AlertTriangle, Heart, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import BlurredPropertyCard from '@/components/BlurredPropertyCard';
import UpfrontSavingsCalculator from '@/components/UpfrontSavingsCalculator';
import type { ScrapedProperty } from '@/lib/savings-calculator';
import { calculatePropertySavings, formatMoney } from '@/lib/savings-calculator';
import { usePaywall } from '@/hooks/usePaywall';
import { useSavedScrapedProperties } from '@/hooks/useSavedScrapedProperties';
import { PaywallModal } from '@/components/PaywallModal';
import { useUnifiedAI } from '@/contexts/UnifiedAIContext';
import { calculateSmartScore, getScoreColor, getScoreBgColor, getScoreLabel, type SmartScoreResult } from '@/lib/smart-score-engine';

interface ScrapedPropertiesBrowserProps {
  properties: ScrapedProperty[];
  isLoading: boolean;
}

const FREE_VISIBLE_COUNT = 999;

function PropertyImage({ imageUrl, name, id }: { imageUrl?: string; name: string; id: string }) {
  const [imgError, setImgError] = useState(false);

  if (!imageUrl || imgError) {
    return (
      <div className="w-full h-32 bg-muted flex items-center justify-center" data-testid={`img-fallback-${id}`}>
        <div className="flex flex-col items-center gap-1 text-muted-foreground">
          <Building2 className="w-6 h-6" />
          <span className="text-xs">No image</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-40 bg-muted">
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
        data-testid={`img-property-${id}`}
      />
    </div>
  );
}

export default function ScrapedPropertiesBrowser({ properties, isLoading }: ScrapedPropertiesBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rent-asc' | 'rent-desc' | 'effective-rent' | 'deal-score' | 'savings' | 'smart-score' | 'concessions'>('smart-score');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [expandedScoreId, setExpandedScoreId] = useState<string | null>(null);

  const navigate = useNavigate();
  const aiContext = useUnifiedAI();
  const hasPreferences = (aiContext.aiPreferences?.amenities?.length ?? 0) > 0 || aiContext.budget > 0;
  const { isSaved, toggleSaveScraped } = useSavedScrapedProperties();

  const {
    isPaywallOpen,
    paywallPropertyId,
    openPaywall,
    closePaywall,
    unlockProperty,
    activatePlan,
    isPropertyUnlocked,
    userIsSubscribed,
  } = usePaywall();

  const cities = useMemo(() => {
    const citySet = new Set(properties.map(p => p.city).filter(Boolean));
    return Array.from(citySet).sort();
  }, [properties]);

  const propertiesWithSavings = useMemo(() => {
    return properties.map(p => {
      const savings = calculatePropertySavings(p);
      const smartScore = calculateSmartScore(
        p,
        savings,
        aiContext.aiPreferences,
        aiContext.budget,
        aiContext.marketContext,
        aiContext.pointsOfInterest,
        aiContext.commutePreferences,
      );
      return { property: p, savings, smartScore };
    });
  }, [properties, aiContext.aiPreferences, aiContext.budget, aiContext.marketContext, aiContext.pointsOfInterest, aiContext.commutePreferences]);

  const filtered = useMemo(() => {
    let result = propertiesWithSavings;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(({ property }) =>
        property.name?.toLowerCase().includes(term) ||
        property.address?.toLowerCase().includes(term) ||
        property.city?.toLowerCase().includes(term)
      );
    }

    if (selectedCity !== 'all') {
      result = result.filter(({ property }) => property.city === selectedCity);
    }

    switch (sortBy) {
      case 'smart-score':
        result = [...result].sort((a, b) => b.smartScore.overall - a.smartScore.overall);
        break;
      case 'rent-asc':
        result = [...result].sort((a, b) => (a.property.min_rent || 9999) - (b.property.min_rent || 9999));
        break;
      case 'rent-desc':
        result = [...result].sort((a, b) => (b.property.min_rent || 0) - (a.property.min_rent || 0));
        break;
      case 'deal-score':
        result = [...result].sort((a, b) => b.savings.dealScore - a.savings.dealScore);
        break;
      case 'savings':
        result = [...result].sort((a, b) => b.savings.annualSavings - a.savings.annualSavings);
        break;
      case 'effective-rent':
        result = [...result].sort((a, b) => {
          const aEff = a.property.effective_price || a.property.min_rent || 9999;
          const bEff = b.property.effective_price || b.property.min_rent || 9999;
          return aEff - bEff;
        });
        break;
      case 'concessions':
        result = [...result].sort((a, b) => {
          const aHas = a.savings.hasSpecialOffer ? 1 : 0;
          const bHas = b.savings.hasSpecialOffer ? 1 : 0;
          if (bHas !== aHas) return bHas - aHas;
          return b.savings.upfrontSavings - a.savings.upfrontSavings;
        });
        break;
    }

    return result;
  }, [propertiesWithSavings, searchTerm, selectedCity, sortBy]);

  const selectedSavings = useMemo(() => {
    if (!selectedPropertyId) return null;
    const found = propertiesWithSavings.find(p => p.property.id === selectedPropertyId);
    return found || null;
  }, [selectedPropertyId, propertiesWithSavings]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="flex gap-2">
                  <div className="h-8 bg-muted rounded w-20" />
                  <div className="h-8 bg-muted rounded w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-properties"
          />
        </div>
        <div className="flex gap-2">
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-[150px]" data-testid="select-city-filter">
              <MapPin className="w-3 h-3 mr-1" />
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[150px]" data-testid="select-sort-properties">
              <SlidersHorizontal className="w-3 h-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="smart-score">Smart Score</SelectItem>
              <SelectItem value="effective-rent">Effective Rent</SelectItem>
              <SelectItem value="concessions">Best Concessions</SelectItem>
              <SelectItem value="deal-score">Best Deals</SelectItem>
              <SelectItem value="savings">Most Savings</SelectItem>
              <SelectItem value="rent-asc">Rent: Low to High</SelectItem>
              <SelectItem value="rent-desc">Rent: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            <Building2 className="w-3 h-3 mr-1" />
            {filtered.length} properties
          </Badge>
          {filtered.filter(f => f.savings.hasSpecialOffer).length > 0 && (
            <Badge variant="outline" className="text-green-600 border-green-300">
              <Tag className="w-3 h-3 mr-1" />
              {filtered.filter(f => f.savings.hasSpecialOffer).length} with offers
            </Badge>
          )}
        </div>
        {!userIsSubscribed && (
          <p className="text-xs text-muted-foreground">
            Viewing {Math.min(FREE_VISIBLE_COUNT, filtered.length)} of {filtered.length} free.
            <Button variant="link" size="sm" className="px-1 h-auto" onClick={() => openPaywall()} data-testid="button-unlock-all">
              Unlock all
            </Button>
          </p>
        )}
      </div>

      {selectedSavings && (
        <UpfrontSavingsCalculator
          savings={selectedSavings.savings}
          propertyName={selectedSavings.property.name}
        />
      )}

      {hasPreferences && sortBy === 'smart-score' && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <Brain className="w-4 h-4 text-blue-600 shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Properties ranked by Smart Score using your AI preferences, budget, and market data.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(({ property, savings, smartScore }, index) => {
          const isVisible = userIsSubscribed || isPropertyUnlocked(property.id) || index < FREE_VISIBLE_COUNT;

          if (!isVisible) {
            return (
              <BlurredPropertyCard
                key={property.id}
                property={property}
                savings={savings}
                onUnlock={(id) => openPaywall(id)}
              />
            );
          }

          const isScoreExpanded = expandedScoreId === property.id;

          return (
            <Card
              key={property.id}
              className={`cursor-pointer hover-elevate ${selectedPropertyId === property.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedPropertyId(prev => prev === property.id ? null : property.id)}
              data-testid={`card-scraped-property-${property.id}`}
            >
              <div className="relative">
                <PropertyImage imageUrl={property.image_url} name={property.name} id={property.id} />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-background/70 backdrop-blur-sm"
                  data-testid={`button-save-scraped-${property.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSaveScraped(property);
                  }}
                >
                  <Heart
                    className={`w-4 h-4 ${isSaved(property.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
                  />
                </Button>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground">{property.name}</h3>
                    <p className="text-sm text-muted-foreground">{property.address}, {property.city}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border cursor-pointer ${getScoreBgColor(smartScore.overall)}`}
                          onClick={(e) => { e.stopPropagation(); setExpandedScoreId(prev => prev === property.id ? null : property.id); }}
                          data-testid={`badge-smart-score-${property.id}`}
                        >
                          <Brain className={`w-3.5 h-3.5 ${getScoreColor(smartScore.overall)}`} />
                          <span className={`text-sm font-bold ${getScoreColor(smartScore.overall)}`}>{smartScore.overall}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-[200px]">
                        <p className="font-semibold">{getScoreLabel(smartScore.overall)}</p>
                        <p className="text-xs">Click to see breakdown</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {isScoreExpanded && (
                  <div className="mb-3 p-3 rounded-md bg-muted/50 space-y-2" onClick={e => e.stopPropagation()} data-testid={`panel-score-breakdown-${property.id}`}>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <MapPin className="w-3 h-3 mx-auto text-blue-600 mb-0.5" />
                        <div className={`text-sm font-bold ${getScoreColor(smartScore.locationScore)}`}>{smartScore.locationScore}</div>
                        <div className="text-[10px] text-muted-foreground">Location</div>
                      </div>
                      <div>
                        <CheckCircle2 className="w-3 h-3 mx-auto text-purple-600 mb-0.5" />
                        <div className={`text-sm font-bold ${getScoreColor(smartScore.preferenceScore)}`}>{smartScore.preferenceScore}</div>
                        <div className="text-[10px] text-muted-foreground">Prefs</div>
                      </div>
                      <div>
                        <TrendingUp className="w-3 h-3 mx-auto text-indigo-600 mb-0.5" />
                        <div className={`text-sm font-bold ${getScoreColor(smartScore.marketScore)}`}>{smartScore.marketScore}</div>
                        <div className="text-[10px] text-muted-foreground">Market</div>
                      </div>
                      <div>
                        <DollarSign className="w-3 h-3 mx-auto text-green-600 mb-0.5" />
                        <div className={`text-sm font-bold ${getScoreColor(smartScore.valueScore)}`}>{smartScore.valueScore}</div>
                        <div className="text-[10px] text-muted-foreground">Value</div>
                      </div>
                    </div>
                    {smartScore.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {smartScore.highlights.map((h, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {h}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {smartScore.warnings.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {smartScore.warnings.map((w, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 text-orange-600 border-orange-300">
                            <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                            {w}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {smartScore.amenityMatches.length > 0 && (
                      <div className="text-[10px] text-muted-foreground">
                        Matched: {smartScore.amenityMatches.slice(0, 5).join(', ')}
                        {smartScore.amenityMatches.length > 5 && ` +${smartScore.amenityMatches.length - 5} more`}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4 mb-3 flex-wrap">
                  <div>
                    <p className="text-xs text-muted-foreground">Rent</p>
                    <p className="font-medium text-foreground">
                      {property.min_rent ? formatMoney(property.min_rent) : 'Contact'}
                      {property.max_rent && property.min_rent && property.max_rent !== property.min_rent
                        ? ` - ${formatMoney(property.max_rent)}`
                        : ''}
                    </p>
                  </div>
                  {property.effective_price && property.min_rent && property.effective_price < property.min_rent && (
                    <div className="border-l pl-4">
                      <p className="text-xs text-muted-foreground">Eff. Rent</p>
                      <p className="font-bold text-green-600">{formatMoney(property.effective_price)}</p>
                    </div>
                  )}
                  {savings.monthlySavings > 0 && (
                    <div className="border-l pl-4">
                      <p className="text-xs text-muted-foreground">Monthly Savings</p>
                      <p className="font-bold text-green-600">{formatMoney(savings.monthlySavings)}</p>
                    </div>
                  )}
                  {savings.upfrontSavings > 0 && (
                    <div className="border-l pl-4">
                      <p className="text-xs text-muted-foreground">Upfront</p>
                      <p className="font-bold text-purple-600">{formatMoney(savings.upfrontSavings)}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {property.bedrooms_min && (
                    <Badge variant="outline">
                      {property.bedrooms_min}
                      {property.bedrooms_max && property.bedrooms_max !== property.bedrooms_min
                        ? `-${property.bedrooms_max}`
                        : ''} bd
                    </Badge>
                  )}
                  {savings.hasSpecialOffer && (
                    <Badge variant="secondary" className="text-green-600">
                      <Tag className="w-3 h-3 mr-1" />
                      Offer
                    </Badge>
                  )}
                  {property.pet_policy && (
                    <Badge variant="outline">{property.pet_policy}</Badge>
                  )}
                  {smartScore.overall >= 80 && (
                    <Badge variant="default" className="bg-gradient-to-r from-blue-600 to-purple-600">
                      {getScoreLabel(smartScore.overall)}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <a
                    href={`/scraped-property/${property.id}`}
                    className="text-xs text-primary flex items-center gap-1"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/scraped-property/${property.id}`); }}
                    data-testid={`link-view-details-${property.id}`}
                  >
                    <Eye className="w-3 h-3" />
                    View Details
                  </a>
                  {property.website_url && (
                    <a
                      href={property.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary flex items-center gap-1"
                      onClick={e => e.stopPropagation()}
                      data-testid={`link-property-website-${property.id}`}
                    >
                      <ExternalLink className="w-3 h-3" />
                      Visit Website
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No properties found matching your search.</p>
          </CardContent>
        </Card>
      )}

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={closePaywall}
        propertyId={paywallPropertyId}
        potentialSavings={filtered.length > 0 ? filtered[0].savings.annualSavings : 0}
        propertiesCount={filtered.length}
        onPaymentSuccess={(planId) => {
          if (planId) {
            activatePlan(planId);
          } else if (paywallPropertyId) {
            unlockProperty(paywallPropertyId);
          }
          closePaywall();
        }}
      />
    </div>
  );
}
