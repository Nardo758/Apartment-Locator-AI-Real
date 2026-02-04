import React, { useMemo } from 'react';
import { ZipCodeData, TEXAS_BOUNDS, getSuccessRateColor } from '@/data/mockHeatmapData';

interface HeatmapMapProps {
  data: ZipCodeData[];
  selectedZip: string | null;
  onZipClick: (zip: string) => void;
  viewMode: 'renter' | 'landlord';
}

export const HeatmapMap: React.FC<HeatmapMapProps> = ({ 
  data, 
  selectedZip, 
  onZipClick,
  viewMode 
}) => {
  // SVG dimensions
  const width = 800;
  const height = 600;
  const padding = 40;

  // Convert lat/lng to SVG coordinates
  const latToY = (lat: number) => {
    const normalized = (lat - TEXAS_BOUNDS.minLat) / (TEXAS_BOUNDS.maxLat - TEXAS_BOUNDS.minLat);
    return height - padding - (normalized * (height - 2 * padding));
  };

  const lngToX = (lng: number) => {
    const normalized = (lng - TEXAS_BOUNDS.minLng) / (TEXAS_BOUNDS.maxLng - TEXAS_BOUNDS.minLng);
    return padding + (normalized * (width - 2 * padding));
  };

  // Calculate circle size based on offer count
  const getCircleSize = (offerCount: number) => {
    const min = 6;
    const max = 24;
    const maxCount = Math.max(...data.map(d => d.offerCount));
    return min + ((offerCount / maxCount) * (max - min));
  };

  // Group nearby zip codes for better visualization
  const processedData = useMemo(() => {
    return data.map(zip => ({
      ...zip,
      x: lngToX(zip.lng),
      y: latToY(zip.lat),
      size: getCircleSize(zip.offerCount),
      color: getSuccessRateColor(zip.successRate),
    }));
  }, [data]);

  // City labels
  const cityLabels = [
    { name: 'Austin', lat: 30.27, lng: -97.74 },
    { name: 'Dallas', lat: 32.78, lng: -96.80 },
    { name: 'Houston', lat: 29.76, lng: -95.37 },
  ];

  return (
    <div className="relative w-full h-full bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
      >
        {/* Background */}
        <rect width={width} height={height} fill="#f8fafc" />
        
        {/* Grid lines */}
        <g opacity="0.1">
          {[...Array(10)].map((_, i) => {
            const x = padding + (i * (width - 2 * padding) / 9);
            const y = padding + (i * (height - 2 * padding) / 9);
            return (
              <g key={i}>
                <line x1={x} y1={padding} x2={x} y2={height - padding} stroke="#94a3b8" strokeWidth="1" />
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#94a3b8" strokeWidth="1" />
              </g>
            );
          })}
        </g>

        {/* City labels */}
        {cityLabels.map((city, i) => (
          <text
            key={i}
            x={lngToX(city.lng)}
            y={latToY(city.lat) - 30}
            textAnchor="middle"
            className="text-base font-bold fill-slate-700"
            style={{ fontSize: '18px' }}
          >
            {city.name}
          </text>
        ))}

        {/* Zip code circles */}
        {processedData.map((zip) => {
          const isSelected = zip.zip === selectedZip;
          return (
            <g key={zip.zip}>
              {/* Glow effect for selected */}
              {isSelected && (
                <circle
                  cx={zip.x}
                  cy={zip.y}
                  r={zip.size + 8}
                  fill={zip.color}
                  opacity="0.3"
                  className="animate-pulse"
                />
              )}
              
              {/* Main circle */}
              <circle
                cx={zip.x}
                cy={zip.y}
                r={zip.size}
                fill={zip.color}
                opacity={isSelected ? 1 : 0.75}
                stroke={isSelected ? '#1e293b' : 'white'}
                strokeWidth={isSelected ? 3 : 2}
                className="cursor-pointer transition-all duration-200 hover:opacity-100"
                onClick={() => onZipClick(zip.zip)}
                style={{ 
                  filter: isSelected ? 'brightness(1.1)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <title>
                  {`${zip.zip} - ${zip.city}\nSuccess Rate: ${zip.successRate}%\nAvg Savings: $${zip.avgSavings}\nOffers: ${zip.offerCount}`}
                </title>
              </circle>

              {/* Zip code label for larger circles or selected */}
              {(isSelected || zip.size > 16) && (
                <text
                  x={zip.x}
                  y={zip.y + 4}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-white pointer-events-none"
                  style={{ fontSize: isSelected ? '11px' : '9px' }}
                >
                  {zip.zip}
                </text>
              )}
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(${width - 160}, ${height - 120})`}>
          <rect width="140" height="110" rx="6" fill="white" opacity="0.95" stroke="#cbd5e1" strokeWidth="1" />
          <text x="70" y="18" textAnchor="middle" className="text-sm font-semibold fill-slate-700">
            Success Rate
          </text>
          
          {[
            { rate: 80, color: '#10b981', label: '80-100%' },
            { rate: 70, color: '#84cc16', label: '70-79%' },
            { rate: 60, color: '#eab308', label: '60-69%' },
            { rate: 50, color: '#f97316', label: '50-59%' },
            { rate: 40, color: '#ef4444', label: '< 50%' },
          ].map((item, i) => (
            <g key={i} transform={`translate(15, ${30 + i * 16})`}>
              <circle cx="8" cy="0" r="6" fill={item.color} />
              <text x="20" y="4" className="text-xs fill-slate-600">
                {item.label}
              </text>
            </g>
          ))}
        </g>

        {/* Info text */}
        <text x="20" y="30" className="text-sm fill-slate-500 font-medium">
          {viewMode === 'renter' ? 'Renter Success Rates' : 'Landlord Acceptance Rates'}
        </text>
        <text x="20" y="50" className="text-xs fill-slate-400">
          Circle size = offer volume
        </text>
      </svg>

      {/* Interaction hint */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-slate-200">
        <p className="text-xs text-slate-600">
          💡 Click any circle to see details
        </p>
      </div>
    </div>
  );
};
