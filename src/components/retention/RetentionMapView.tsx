import { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RetentionUnit, NearbyComparable } from "@/types/retention.types";

const GOOGLE_MAPS_LIBRARIES: ("places")[] = ['places'];

interface RetentionMapViewProps {
  units: RetentionUnit[];
  nearbyComparables: NearbyComparable[];
  selectedId: string | null;
  onSelect: (unit: RetentionUnit) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '500px',
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

function getMarkerColor(unit: RetentionUnit): string {
  if (unit.status === 'vacant') return '#9CA3AF';
  if (unit.risk >= 70) return '#EF4444';
  if (unit.risk >= 40) return '#F59E0B';
  return '#10B981';
}

function getRiskLabel(risk: number): string {
  if (risk >= 70) return 'Critical';
  if (risk >= 40) return 'At Risk';
  return 'Healthy';
}

export default function RetentionMapView({ units, nearbyComparables, selectedId, onSelect }: RetentionMapViewProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeInfoWindow, setActiveInfoWindow] = useState<string | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const mapCenter = useMemo(() => {
    const unitsWithCoords = units.filter(u => u.lat !== undefined && u.lng !== undefined);
    if (unitsWithCoords.length > 0) {
      const avgLat = unitsWithCoords.reduce((sum, u) => sum + (u.lat || 0), 0) / unitsWithCoords.length;
      const avgLng = unitsWithCoords.reduce((sum, u) => sum + (u.lng || 0), 0) / unitsWithCoords.length;
      return { lat: avgLat, lng: avgLng };
    }
    return { lat: 30.2672, lng: -97.7431 };
  }, [units]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    const unitsWithCoords = units.filter(u => u.lat !== undefined && u.lng !== undefined);
    if (unitsWithCoords.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      unitsWithCoords.forEach(u => {
        if (u.lat && u.lng) bounds.extend({ lat: u.lat, lng: u.lng });
      });
      map.fitBounds(bounds);
    }
  }, [units]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (unit: RetentionUnit) => {
    setActiveInfoWindow(unit.id);
    onSelect(unit);
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center bg-muted rounded-xl h-full" style={{ minHeight: '500px' }} data-testid="retention-map">
        <div className="text-center text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Error loading map</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl animate-pulse h-full" style={{ minHeight: '500px' }} data-testid="retention-map">
        <div className="text-center text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50 animate-bounce" />
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  const selected = units.find(u => u.id === selectedId) || null;

  return (
    <div className="relative rounded-xl overflow-hidden h-full" data-testid="retention-map">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {nearbyComparables.map(comp => (
          <Marker
            key={comp.id}
            position={{ lat: comp.lat || 30.27, lng: comp.lng || -97.74 }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: '#64748B',
              fillOpacity: 0.4,
              strokeColor: '#475569',
              strokeWeight: 1,
            }}
            title={comp.name}
          />
        ))}

        {units.map(unit => {
          if (!unit.lat || !unit.lng) return null;
          const markerColor = getMarkerColor(unit);
          const isSelected = selectedId === unit.id;
          
          return (
            <Marker
              key={unit.id}
              position={{ lat: unit.lat, lng: unit.lng }}
              onClick={() => handleMarkerClick(unit)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: isSelected ? 14 : 10,
                fillColor: markerColor,
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }}
            >
              {activeInfoWindow === unit.id && (
                <InfoWindow onCloseClick={() => setActiveInfoWindow(null)}>
                  <Card className="border-0 shadow-none min-w-[220px]" data-testid={`info-window-${unit.id}`}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{unit.address}</h4>
                        <Badge 
                          variant={unit.status === 'vacant' ? 'secondary' : unit.risk >= 70 ? 'destructive' : 'default'}
                          className="text-xs"
                        >
                          {unit.status === 'vacant' ? 'Vacant' : getRiskLabel(unit.risk)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">Unit {unit.unit}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div>
                          <p className="text-muted-foreground">Rent</p>
                          <p className="font-medium">${unit.rent.toLocaleString()}/mo</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Risk Score</p>
                          <p className="font-bold" style={{ color: markerColor }}>{unit.risk}/100</p>
                        </div>
                      </div>

                      {unit.tenant && (
                        <div className="text-xs">
                          <p className="text-muted-foreground">Tenant</p>
                          <p className="font-medium">{unit.tenant}</p>
                        </div>
                      )}

                      {unit.leaseExpiry > 0 && (
                        <div className="text-xs mt-1">
                          <p className="text-muted-foreground">Lease Expires</p>
                          <p className="font-medium">{unit.leaseExpiry} days</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </InfoWindow>
              )}
            </Marker>
          );
        })}
      </GoogleMap>

      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2.5 flex gap-4 border border-gray-200 shadow-md">
        {[
          { color: '#10B981', label: 'Healthy' },
          { color: '#F59E0B', label: 'At Risk' },
          { color: '#EF4444', label: 'Critical' },
          { color: '#9CA3AF', label: 'Vacant' },
          { color: '#64748B', label: 'Nearby Comps', hollow: true },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ 
                backgroundColor: l.hollow ? 'transparent' : l.color,
                border: l.hollow ? `2px solid ${l.color}` : 'none',
                opacity: l.hollow ? 0.5 : 1,
              }}
            />
            <span className="text-gray-600 text-xs font-medium">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
