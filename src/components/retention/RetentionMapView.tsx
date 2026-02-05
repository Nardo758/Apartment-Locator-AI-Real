import { RetentionUnit, NearbyComparable, getRiskColors } from "@/types/retention.types";

interface RetentionMapViewProps {
  units: RetentionUnit[];
  nearbyComparables: NearbyComparable[];
  selectedId: string | null;
  onSelect: (unit: RetentionUnit) => void;
}

interface MapPinProps {
  unit: RetentionUnit;
  selected: RetentionUnit | null;
  onClick: () => void;
  isNearby?: boolean;
}

function MapPin({ unit, selected, onClick, isNearby }: MapPinProps) {
  if (isNearby) {
    return (
      <div
        onClick={onClick}
        className="absolute cursor-pointer opacity-40 hover:opacity-70 transition-opacity z-[1]"
        style={{
          left: `${(unit as any).lng + 70}%`,
          top: `${(unit as any).lat}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-gray-500" />
      </div>
    );
  }

  const c = getRiskColors(unit.risk, unit.status);
  const isSelected = selected?.id === unit.id;
  const dotColor = c.dot.replace('bg-', '');
  
  const colorMap: Record<string, string> = {
    'red-500': '#EF4444',
    'amber-500': '#F59E0B',
    'green-500': '#10B981',
    'gray-400': '#9CA3AF',
  };
  const actualColor = colorMap[dotColor] || '#9CA3AF';

  return (
    <div
      onClick={onClick}
      className={`absolute cursor-pointer transition-transform z-10 ${isSelected ? 'z-20' : ''}`}
      style={{
        left: `${unit.lng + 70}%`,
        top: `${unit.lat}%`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="flex flex-col items-center">
        {isSelected && (
          <div 
            className="absolute w-10 h-10 rounded-full opacity-20 animate-ping"
            style={{ backgroundColor: actualColor, top: '-6px' }}
          />
        )}
        <div
          className={`
            rounded-full transition-all
            ${isSelected ? 'w-5 h-5 border-[3px] border-white shadow-lg' : 'w-3.5 h-3.5 border-2'}
          `}
          style={{ 
            backgroundColor: actualColor,
            borderColor: isSelected ? '#fff' : actualColor,
            boxShadow: isSelected ? `0 0 0 3px ${actualColor}40, 0 2px 8px rgba(0,0,0,0.3)` : '0 1px 4px rgba(0,0,0,0.2)',
          }}
        />
        <div 
          className={`
            mt-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap
            ${isSelected ? 'text-white' : 'text-gray-700'}
          `}
          style={{ 
            backgroundColor: isSelected ? actualColor : 'rgba(255,255,255,0.9)',
          }}
        >
          {unit.unit}
        </div>
      </div>
    </div>
  );
}

export default function RetentionMapView({ units, nearbyComparables, selectedId, onSelect }: RetentionMapViewProps) {
  const selected = units.find(u => u.id === selectedId) || null;

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg overflow-hidden" data-testid="retention-map">
      <svg className="absolute inset-0 w-full h-full opacity-[0.15]">
        {[...Array(20)].map((_, i) => (
          <line key={`h${i}`} x1="0" y1={`${i * 5}%`} x2="100%" y2={`${i * 5}%`} stroke="#6366F1" strokeWidth="0.5" />
        ))}
        {[...Array(20)].map((_, i) => (
          <line key={`v${i}`} x1={`${i * 5}%`} y1="0" x2={`${i * 5}%`} y2="100%" stroke="#6366F1" strokeWidth="0.5" />
        ))}
      </svg>
      
      <svg className="absolute inset-0 w-full h-full opacity-[0.2]">
        <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#94A3B8" strokeWidth="2" />
        <line x1="50%" y1="10%" x2="50%" y2="90%" stroke="#94A3B8" strokeWidth="2" />
        <line x1="20%" y1="20%" x2="80%" y2="80%" stroke="#94A3B8" strokeWidth="1.5" />
        <line x1="30%" y1="10%" x2="30%" y2="90%" stroke="#94A3B8" strokeWidth="1" />
        <line x1="10%" y1="30%" x2="90%" y2="30%" stroke="#94A3B8" strokeWidth="1" />
        <line x1="10%" y1="70%" x2="90%" y2="70%" stroke="#94A3B8" strokeWidth="1" />
      </svg>

      {nearbyComparables.map(n => (
        <MapPin 
          key={n.id} 
          unit={n as any} 
          selected={null}
          isNearby 
          onClick={() => {}} 
        />
      ))}

      {units.map(u => (
        <div key={u.id} data-testid={`map-pin-${u.id}`}>
          <MapPin 
            unit={u} 
            selected={selected} 
            onClick={() => onSelect(u)} 
          />
        </div>
      ))}

      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 flex gap-4 border border-gray-200 shadow-sm">
        {[
          { color: '#10B981', label: 'Healthy' },
          { color: '#F59E0B', label: 'At Risk' },
          { color: '#EF4444', label: 'Critical' },
          { color: '#9CA3AF', label: 'Vacant' },
          { color: '#64748B', label: 'Nearby Comps', hollow: true },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ 
                backgroundColor: l.hollow ? 'transparent' : l.color,
                border: l.hollow ? `2px solid ${l.color}` : 'none',
                opacity: l.hollow ? 0.5 : 1,
              }}
            />
            <span className="text-gray-600 text-[10px] font-medium">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
