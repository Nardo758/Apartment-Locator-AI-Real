import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, ArrowLeft, Star, MapPin } from 'lucide-react';
import { usePropertyState } from '@/contexts';
import { mockProperties, type Property } from '@/data/mockData';
import PropertyCard from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { designSystem } from '@/lib/design-system';
import ModernPageLayout from '@/components/modern/ModernPageLayout';
import ModernCard from '@/components/modern/ModernCard';
import Header from '@/components/Header';
import { PropertySearchExample } from '@/components/PropertySearchExample';
import { api } from '@/lib/api';
import { useUser } from '@/hooks/useUser';

const SavedProperties: React.FC = () => {
  const { favoriteProperties } = usePropertyState();
  const { user } = useUser();
  const [savedPropertiesList, setSavedPropertiesList] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const mapApiProperty = (property: Awaited<ReturnType<typeof api.getPropertyById>>): Property | null => {
    if (!property) return null;
    const minPrice = property.minPrice ?? 0;
    const maxPrice = property.maxPrice ?? minPrice;
    const aiPrice = minPrice || maxPrice;
    const originalPrice = maxPrice || minPrice;
    const savings = Math.max(0, originalPrice - aiPrice);
    const coordinates = {
      lat: property.latitude ? parseFloat(property.latitude) : 30.2672,
      lng: property.longitude ? parseFloat(property.longitude) : -97.7431,
    };

    return {
      id: property.id,
      name: property.name,
      address: property.address,
      city: property.city,
      state: property.state,
      zip: property.zipCode || '',
      originalPrice,
      aiPrice,
      effectivePrice: aiPrice,
      savings,
      matchScore: 80,
      successRate: 70,
      daysVacant: 0,
      availability: property.isActive ? 'Available Now' : 'Limited Availability',
      availabilityType: property.isActive ? 'immediate' : 'soon',
      features: Object.keys(property.features || {}),
      amenities: Object.keys(property.amenities || {}),
      commutes: [],
      concessions: [],
      coordinates,
      images: property.images?.length ? property.images : ['/placeholder.svg'],
      bedrooms: property.bedroomsMin ?? 0,
      bathrooms: Number(property.bathroomsMin ?? 0),
      sqft: property.squareFeetMin ?? 0,
      yearBuilt: property.yearBuilt ?? 0,
      petPolicy: property.petPolicy ? 'See listing' : 'Contact for details',
      parking: property.parking ? 'See listing' : 'Contact for details',
    };
  };

  useEffect(() => {
    const loadSavedProperties = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const saved = await api.getSavedApartments(user.id);
        const propertyDetails = await Promise.all(
          saved.map((item) => api.getPropertyById(item.apartmentId))
        );
        const mapped = propertyDetails
          .map(mapApiProperty)
          .filter((property): property is Property => property !== null);

        setSavedPropertiesList(mapped);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Failed to load saved properties');
        const fallback = mockProperties.filter(property => 
          favoriteProperties.includes(property.id)
        );
        setSavedPropertiesList(fallback);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedProperties();
  }, [favoriteProperties, user]);

  return (
    <div className={`${designSystem.backgrounds.page} ${designSystem.backgrounds.pageDark}`}>
      <ModernPageLayout
        title="Saved Properties"
        subtitle={`${savedPropertiesList.length} ${savedPropertiesList.length === 1 ? 'property' : 'properties'} saved`}
        showHeader={true}
        headerContent={
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="gap-2">
              <Search size={16} />
              Browse More
            </Button>
          </Link>
        }
      >
        {isLoading ? (
          <div className="text-center py-16">
            <ModernCard className="max-w-md mx-auto text-center p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
                <p className={designSystem.typography.body}>Loading saved properties...</p>
              </div>
            </ModernCard>
          </div>
        ) : loadError ? (
          <div className="text-center py-16">
            <ModernCard className="max-w-md mx-auto text-center p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-red-600" />
                </div>
                <p className={designSystem.typography.body}>Failed to load saved properties.</p>
                <p className="text-sm text-muted-foreground">{loadError}</p>
              </div>
            </ModernCard>
          </div>
        ) : savedPropertiesList.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <ModernCard className="max-w-md mx-auto text-center p-8">
              <div className="flex flex-col items-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 flex items-center justify-center">
                  <Heart className="w-12 h-12 text-pink-600" />
                </div>
                <div>
                  <h2 className={`${designSystem.typography.subheadingLarge} mb-4`}>
                    No Saved Properties Yet
                  </h2>
                  <p className={`${designSystem.typography.body} mb-8`}>
                    Save properties you're interested in to keep track of them and compare options easily. 
                    Use the heart icon on any property to add it to your favorites.
                  </p>
                </div>
                <Link to="/dashboard">
                  <Button className={`${designSystem.buttons.primary} gap-2`}>
                    <Search className="w-4 h-4" />
                    Browse Properties
                  </Button>
                </Link>
              </div>
            </ModernCard>
          </div>
        ) : (
          // Properties Grid
          <div className={designSystem.spacing.content}>
            {/* Property Search Example */}
            <div className="mb-8">
              <PropertySearchExample />
            </div>
            {/* Stats Overview */}
            <div className={`${designSystem.layouts.gridThree} mb-8`}>
              <ModernCard 
                animate
                hover
                className="text-center"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 rounded-full bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20">
                    <Heart className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-pink-600 mb-1">
                      {savedPropertiesList.length}
                    </div>
                    <div className={`${designSystem.typography.label} font-medium`}>
                      Saved Properties
                    </div>
                  </div>
                </div>
              </ModernCard>

              <ModernCard 
                animate
                animationDelay={100}
                hover
                className="text-center"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {new Set(savedPropertiesList.map(p => p.city)).size}
                    </div>
                    <div className={`${designSystem.typography.label} font-medium`}>
                      Locations
                    </div>
                  </div>
                </div>
              </ModernCard>

              <ModernCard 
                animate
                animationDelay={200}
                hover
                className="text-center"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 rounded-full bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      ${Math.round(savedPropertiesList.reduce((avg, p) => avg + p.aiPrice, 0) / savedPropertiesList.length || 0).toLocaleString()}
                    </div>
                    <div className={`${designSystem.typography.label} font-medium`}>
                      Avg. Price
                    </div>
                  </div>
                </div>
              </ModernCard>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {savedPropertiesList.map((property, index) => (
                <div
                  key={property.id}
                  className={designSystem.animations.entrance}
                  style={{ animationDelay: `${index * 100}ms` }}>
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <ModernCard className="mt-12 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/dashboard">
                  <Button className={`${designSystem.buttons.primary} gap-2`}>
                    <Search className="w-4 h-4" />
                    Find More Properties
                  </Button>
                </Link>
                <Link to="/market-intel">
                  <Button variant="outline" className="gap-2">
                    <Star className="w-4 h-4" />
                    Market Analysis
                  </Button>
                </Link>
              </div>
            </ModernCard>
          </div>
        )}
      </ModernPageLayout>
    </div>
  );
};

export default SavedProperties;