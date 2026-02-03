import { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import { MapPin, Home, Briefcase, Dumbbell, ShoppingCart, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Coordinates } from '@/types/locationCost.types';

type POICategory = 'work' | 'gym' | 'grocery' | 'daycare' | 'school' | 'medical' | 'pet' | 'religious' | 'dining' | 'nightlife' | 'entertainment' | 'library' | 'coworking' | 'park' | 'beach' | 'coffee' | 'other';

interface POI {
  id: string;
  name: string;
  address: string;
  category: POICategory;
  coordinates: Coordinates;
  priority?: 'high' | 'medium' | 'low';
}

interface PropertyMarker {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  baseRent: number;
  trueCost?: number;
  commuteMinutes?: number;
  parkingIncluded?: boolean;
  imageUrl?: string;
}

interface InteractivePropertyMapProps {
  properties: PropertyMarker[];
  pois: POI[];
  center?: Coordinates;
  onPropertyClick?: (propertyId: string) => void;
  onPropertyHover?: (propertyId: string | null) => void;
  selectedPropertyId?: string | null;
  showConnections?: boolean;
  className?: string;
}

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  ],
};

const POI_COLORS: Record<POICategory, string> = {
  work: '#ef4444',
  gym: '#3b82f6',
  grocery: '#22c55e',
  daycare: '#ec4899',
  school: '#eab308',
  medical: '#14b8a6',
  pet: '#f97316',
  religious: '#a855f7',
  dining: '#f59e0b',
  nightlife: '#6366f1',
  entertainment: '#d946ef',
  library: '#06b6d4',
  coworking: '#64748b',
  park: '#10b981',
  beach: '#0ea5e9',
  coffee: '#78716c',
  other: '#6b7280',
};

const POI_COLORS_LEGACY: Record<string, string> = {
  work: '#ef4444',
  gym: '#3b82f6',
  grocery: '#22c55e',
  other: '#a855f7',
};

const POI_ICONS: Record<string, typeof Briefcase> = {
  work: Briefcase,
  gym: Dumbbell,
  grocery: ShoppingCart,
  other: MapPin,
};

export default function InteractivePropertyMap({
  properties,
  pois,
  center,
  onPropertyClick,
  onPropertyHover,
  selectedPropertyId,
  showConnections = true,
  className = '',
}: InteractivePropertyMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeInfoWindow, setActiveInfoWindow] = useState<string | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  const mapCenter = useMemo(() => {
    if (center) return center;
    if (properties.length > 0) {
      const avgLat = properties.reduce((sum, p) => sum + p.coordinates.lat, 0) / properties.length;
      const avgLng = properties.reduce((sum, p) => sum + p.coordinates.lng, 0) / properties.length;
      return { lat: avgLat, lng: avgLng };
    }
    return { lat: 30.2672, lng: -97.7431 };
  }, [center, properties]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    if (properties.length > 0 || pois.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      properties.forEach(p => bounds.extend(p.coordinates));
      pois.forEach(p => bounds.extend(p.coordinates));
      map.fitBounds(bounds);
    }
  }, [properties, pois]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handlePropertyMarkerClick = (propertyId: string) => {
    setActiveInfoWindow(propertyId);
    onPropertyClick?.(propertyId);
  };

  const connectionLines = useMemo(() => {
    if (!showConnections || !selectedPropertyId) return [];
    
    const selectedProperty = properties.find(p => p.id === selectedPropertyId);
    if (!selectedProperty) return [];

    return pois.map(poi => ({
      id: `${selectedPropertyId}-${poi.id}`,
      path: [selectedProperty.coordinates, poi.coordinates],
      color: POI_COLORS[poi.category] || POI_COLORS.other,
      poi,
    }));
  }, [showConnections, selectedPropertyId, properties, pois]);

  if (loadError) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-xl ${className}`} style={{ minHeight: '400px' }}>
        <div className="text-center text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Error loading map</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-xl animate-pulse ${className}`} style={{ minHeight: '400px' }}>
        <div className="text-center text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50 animate-bounce" />
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {connectionLines.map(line => (
          <Polyline
            key={line.id}
            path={line.path}
            options={{
              strokeColor: line.color,
              strokeOpacity: 0.6,
              strokeWeight: 3,
              geodesic: true,
            }}
          />
        ))}

        {properties.map(property => (
          <Marker
            key={property.id}
            position={property.coordinates}
            onClick={() => handlePropertyMarkerClick(property.id)}
            onMouseOver={() => onPropertyHover?.(property.id)}
            onMouseOut={() => onPropertyHover?.(null)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: selectedPropertyId === property.id ? 14 : 10,
              fillColor: selectedPropertyId === property.id ? '#6366f1' : '#8b5cf6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
          >
            {activeInfoWindow === property.id && (
              <InfoWindow onCloseClick={() => setActiveInfoWindow(null)}>
                <Card className="border-0 shadow-none min-w-[200px]" data-testid={`info-window-${property.id}`}>
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-sm mb-1">{property.name}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{property.address}</p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Rent</p>
                        <p className="font-medium">${property.baseRent.toLocaleString()}</p>
                      </div>
                      {property.trueCost && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">True Cost</p>
                          <p className="font-bold text-primary">${property.trueCost.toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {property.commuteMinutes && (
                        <Badge variant="secondary" className="text-xs">
                          <Navigation className="w-3 h-3 mr-1" />
                          {property.commuteMinutes} min
                        </Badge>
                      )}
                      {property.parkingIncluded && (
                        <Badge variant="outline" className="text-xs">P incl.</Badge>
                      )}
                    </div>

                    <Button 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => onPropertyClick?.(property.id)}
                      data-testid={`button-view-details-${property.id}`}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </InfoWindow>
            )}
          </Marker>
        ))}

        {pois.map(poi => {
          const IconComponent = POI_ICONS[poi.category] || MapPin;
          return (
            <Marker
              key={poi.id}
              position={poi.coordinates}
              icon={{
                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                scale: 8,
                fillColor: POI_COLORS[poi.category] || POI_COLORS.other,
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }}
              title={`${poi.name} (${poi.category})`}
            />
          );
        })}
      </GoogleMap>

      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <p className="text-xs font-medium mb-2">Legend</p>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-violet-500" />
            <span className="text-xs">Apartments</span>
          </div>
          {Object.entries(POI_COLORS).map(([category, color]) => (
            <div key={category} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs capitalize">{category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
