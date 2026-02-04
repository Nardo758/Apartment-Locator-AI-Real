# Heatmap Components

Interactive geographic visualization for offer success rates across Texas.

## Components

### HeatmapMap.tsx
Interactive SVG map showing ZIP codes as colored circles.

**Props:**
```typescript
{
  data: ZipCodeData[];           // Array of ZIP data to display
  selectedZip: string | null;    // Currently selected ZIP code
  onZipClick: (zip: string) => void;  // Callback when ZIP is clicked
  viewMode: 'renter' | 'landlord';    // Display perspective
}
```

**Features:**
- Color-coded by success rate
- Size-coded by offer volume
- Click to select
- Hover for quick info
- Auto-positioned city labels
- Built-in legend

### ZipCodeStats.tsx
Detailed statistics panel for selected ZIP code.

**Props:**
```typescript
{
  zipData: ZipCodeData | null;   // Selected ZIP data (null = no selection)
  viewMode: 'renter' | 'landlord';  // Display perspective
}
```

**Features:**
- Success rate with progress bar
- Average savings display
- Offer count and rent stats
- Context-aware recommendations
- Pro tips section
- Empty state when no selection

## Usage Example

```tsx
import { HeatmapMap } from '@/components/heatmap/HeatmapMap';
import { ZipCodeStats } from '@/components/heatmap/ZipCodeStats';
import { mockZipCodeData } from '@/data/mockHeatmapData';

function MyComponent() {
  const [selectedZip, setSelectedZip] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'renter' | 'landlord'>('renter');

  const zipData = selectedZip 
    ? mockZipCodeData.find(z => z.zip === selectedZip) 
    : null;

  return (
    <div className="grid grid-cols-2 gap-4">
      <HeatmapMap
        data={mockZipCodeData}
        selectedZip={selectedZip}
        onZipClick={setSelectedZip}
        viewMode={viewMode}
      />
      <ZipCodeStats zipData={zipData} viewMode={viewMode} />
    </div>
  );
}
```

## Data Format

See `/src/data/mockHeatmapData.ts` for the `ZipCodeData` interface:

```typescript
interface ZipCodeData {
  zip: string;
  city: string;
  lat: number;
  lng: number;
  successRate: number;  // 0-100
  avgSavings: number;
  offerCount: number;
  avgRent: number;
}
```

## Color Legend

| Success Rate | Color | Hex | Label |
|--------------|-------|-----|-------|
| 80-100% | Green | #10b981 | Excellent |
| 70-79% | Lime | #84cc16 | Very Good |
| 60-69% | Yellow | #eab308 | Good |
| 50-59% | Orange | #f97316 | Fair |
| <50% | Red | #ef4444 | Challenging |

## Customization

### Change Map Bounds
Edit `TEXAS_BOUNDS` in `mockHeatmapData.ts`:
```typescript
export const TEXAS_BOUNDS = {
  minLat: 29.4,
  maxLat: 33.2,
  minLng: -100.0,
  maxLng: -94.0,
};
```

### Adjust Circle Sizes
Modify `getCircleSize()` in `HeatmapMap.tsx`:
```typescript
const getCircleSize = (offerCount: number) => {
  const min = 6;   // Smallest circle
  const max = 24;  // Largest circle
  // ... calculation
};
```

### Change Color Thresholds
Update `getSuccessRateColor()` in `mockHeatmapData.ts`.

## Performance

- Efficiently renders 100+ SVG elements
- Uses `useMemo` for data processing
- No external dependencies (pure SVG)
- Smooth CSS transitions
- Lazy calculations

## Accessibility

- Semantic HTML with ARIA roles
- Keyboard navigable
- Color + text labels (not color alone)
- Screen reader friendly tooltips
- High contrast mode compatible

## Browser Support

- Modern browsers with SVG support
- Tested on Chrome, Firefox, Safari, Edge
- Mobile responsive
