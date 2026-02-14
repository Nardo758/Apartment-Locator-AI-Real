import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, MapPin, Building2, Tag, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BlurredPropertyCard from '@/components/BlurredPropertyCard';
import UpfrontSavingsCalculator from '@/components/UpfrontSavingsCalculator';
import type { ScrapedProperty } from '@/lib/savings-calculator';
import { calculatePropertySavings, formatMoney } from '@/lib/savings-calculator';
import { usePaywall } from '@/hooks/usePaywall';
import { PaywallModal } from '@/components/PaywallModal';

interface ScrapedPropertiesBrowserProps {
  properties: ScrapedProperty[];
  isLoading: boolean;
}

const FREE_VISIBLE_COUNT = 2;

export default function ScrapedPropertiesBrowser({ properties, isLoading }: ScrapedPropertiesBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rent-asc' | 'rent-desc' | 'deal-score' | 'savings'>('deal-score');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

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
    return properties.map(p => ({
      property: p,
      savings: calculatePropertySavings(p),
    }));
  }, [properties]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(({ property, savings }, index) => {
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

          return (
            <Card
              key={property.id}
              className={`cursor-pointer hover-elevate ${selectedPropertyId === property.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedPropertyId(prev => prev === property.id ? null : property.id)}
              data-testid={`card-scraped-property-${property.id}`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                  <div>
                    <h3 className="font-semibold text-foreground">{property.name}</h3>
                    <p className="text-sm text-muted-foreground">{property.address}, {property.city}</p>
                  </div>
                  {savings.dealScore >= 70 && (
                    <Badge variant="default" className="bg-green-600 shrink-0">
                      Score: {savings.dealScore}
                    </Badge>
                  )}
                </div>

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
                </div>

                {property.website_url && (
                  <div className="mt-2">
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
                  </div>
                )}
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
