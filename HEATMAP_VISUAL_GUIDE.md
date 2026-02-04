# Offer Heatmap - Visual Guide

## Page Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Header                                                    [Share] [Export]│
│ 📍 Offer Success Heatmap                                                 │
│    Geographic analysis of negotiation success rates across Texas        │
│                                                                          │
│ [Renter View] [Landlord View]    🏷️ 100 ZIP codes                      │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┬────────────────────────────────────────┐
│ FILTERS                      │                                        │
│ City: [All Cities ▼]         │                                        │
│ Bedrooms: [All ▼]            │                                        │
│ Max Rent: $3000/mo [━━━━━━●]│                                        │
└──────────────────────────────┘                                        │
                                                                         │
┌───────────────────────────────────────────┬────────────────────────────┤
│                                           │ SELECTED ZIP DETAILS       │
│          INTERACTIVE MAP                  │ ┌────────────────────────┐ │
│                                           │ │ 78704                  │ │
│         Dallas •                          │ │ Austin, TX             │ │
│           ●●●●●                           │ │ [Excellent] badge      │ │
│         ●●●●●●●                           │ └────────────────────────┘ │
│                                           │                            │
│                  ● ●                      │ Success Rate: 88% ████████ │
│      Austin ●●●●●●●●●                     │                            │
│           ●●●●●●●●●●●                     │ 💰 Avg Savings: $340      │
│         ●●●●●●●●●●●●                      │ 📄 Total Offers: 189      │
│           ●●●●●●●                         │ 🏠 Average Rent: $2,350   │
│            ●●●●                           │                            │
│                                           │ 💡 Pro Tips for 78704     │
│                  ●●●●                     │ • Request concessions...   │
│         Houston ●●●●●●                    │ • Consider negotiating...  │
│                ●●●●●●●                    │ • Best time: Nov-Feb      │
│               ●●●●●●●●                    │                            │
│                 ●●●●                      │                            │
│                                           │                            │
│  ● <50%  ● 50-59%  ● 60-69%              │                            │
│  ● 70-79%  ● 80-100%                     │                            │
└───────────────────────────────────────────┴────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 🏆 TOP 10 ZIP CODES FOR NEGOTIATION                                     │
│                                                                          │
│ 🥇 1  78704  Austin     88%  $340   189 offers                         │
│ 🥈 2  78701  Austin     85%  $320   147 offers                         │
│ 🥉 3  78703  Austin     82%  $310   156 offers                         │
│    4  78745  Austin     80%  $292   115 offers                         │
│    5  75225  Dallas     80%  $292   131 offers                         │
│    6  75219  Dallas     79%  $288   127 offers                         │
│    7  78756  Austin     79%  $287   109 offers                         │
│    8  78721  Austin     79%  $290   112 offers                         │
│    9  77056  Houston    78%  $283   132 offers                         │
│   10  75205  Dallas     78%  $285   125 offers                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 📊 MARKET INSIGHTS                                                       │
│                                                                          │
│ 🏆 Best Markets         │ 💰 Savings Potential   │ 📊 Market Trends     │
│ Austin leads with       │ Average savings range  │ Higher offer volumes │
│ highest success rates   │ from $200-340/month    │ correlate with better│
│ (avg 75%). South Austin │ across metro areas.    │ success rates.       │
│ shows exceptional wins. │ Premium areas higher.  │ Consider seasonality.│
└─────────────────────────────────────────────────────────────────────────┘
```

## Color System Visual

```
Success Rate Scale:

  0%   ────────────────────────────────────────────────── 100%
  │                                                          │
  🔴                🟠         🟡         🟢         🟢
  Red            Orange     Yellow      Lime      Green
 <50%          50-59%     60-69%     70-79%    80-100%
Challenging     Fair        Good    Very Good  Excellent
```

## Interaction Flow

```
USER ACTION                    SYSTEM RESPONSE
──────────────────────────────────────────────────────────
1. Load page               → Show full Texas map
                            + 100+ colored circles
                            + Default filters
                            + Empty stats panel

2. Click ZIP circle        → Highlight circle (pulse)
   OR                       + Show stats in sidebar
   Click Top 10 item        + Scroll into view on map
                            + Display recommendations

3. Apply filter            → Update visible circles
   (city/bedroom/price)     + Recalculate Top 10
                            + Maintain selection if valid

4. Toggle view mode        → Update all text labels
   (Renter ↔ Landlord)      + Change recommendations
                            + Update pro tips

5. Hover over circle       → Show tooltip with quick stats
                            + Brighten circle

6. Clear filters           → Reset to all 100+ ZIPs
                            + Clear selection
```

## Component Tree

```
OfferHeatmap (Page)
├── Header
├── View Toggle (Tabs)
│   ├── Renter View
│   └── Landlord View
├── Filter Card
│   ├── City Select
│   ├── Bedroom Select
│   └── Price Slider
├── Map Card
│   └── HeatmapMap (SVG)
│       ├── Background + Grid
│       ├── City Labels
│       ├── ZIP Circles (100+)
│       └── Legend
├── Top 10 Rankings Card
│   └── Ranked List Items
└── Stats Sidebar (Sticky)
    └── ZipCodeStats
        ├── Header (ZIP + Badge)
        ├── Success Rate Progress
        ├── Savings Card
        ├── Offer Count Card
        ├── Rent Card
        ├── Recommendation Box
        ├── Quick Stats Grid
        └── Pro Tips Card

Market Insights Footer
├── Best Markets Column
├── Savings Potential Column
└── Market Trends Column
```

## Data Flow

```
mockHeatmapData.ts
       ↓
  100+ ZIP objects
       ↓
  ┌────┴────┐
  ↓         ↓
Filter    Select
Logic     Logic
  ↓         ↓
HeatmapMap ← → ZipCodeStats
  (visual)     (details)
```

## Responsive Breakpoints

```
Mobile (<768px)
┌─────────────┐
│   Header    │
├─────────────┤
│   Filters   │
├─────────────┤
│     Map     │
├─────────────┤
│  Rankings   │
├─────────────┤
│    Stats    │
└─────────────┘

Desktop (≥1024px)
┌──────────────────────┬──────────┐
│      Header          │  Actions │
├──────────────────────┴──────────┤
│         Filters                 │
├─────────────────────┬───────────┤
│                     │           │
│        Map          │   Stats   │
│                     │  (sticky) │
├─────────────────────┤           │
│      Rankings       │           │
└─────────────────────┴───────────┘
```

## State Management

```typescript
// Local state in OfferHeatmap.tsx
selectedZip: string | null        // "78704" or null
viewMode: 'renter' | 'landlord'   // Toggle state
selectedCity: string              // "all", "Austin", etc.
bedroomFilter: string             // "all", "1", "2", etc.
priceRange: [number]              // [3000] max rent

// Computed values (useMemo)
filteredData: ZipCodeData[]       // After applying filters
selectedZipData: ZipCodeData | null  // Details for sidebar
topZips: ZipCodeData[]            // Top 10 sorted by success
```

## File Structure

```
apartment-locator-ai/
├── src/
│   ├── pages/
│   │   └── OfferHeatmap.tsx          ← Main page (13.5 KB)
│   ├── components/
│   │   └── heatmap/
│   │       ├── HeatmapMap.tsx        ← SVG map (6.5 KB)
│   │       ├── ZipCodeStats.tsx      ← Stats panel (9.8 KB)
│   │       └── README.md             ← Component docs
│   ├── data/
│   │   └── mockHeatmapData.ts        ← Mock data (16 KB)
│   └── App.tsx                       ← Route added
├── OFFER_HEATMAP_FEATURE.md          ← Full documentation
└── HEATMAP_VISUAL_GUIDE.md           ← This file
```

## Quick Stats

- **Total Code:** ~46 KB
- **Components:** 3 files
- **Data:** 100+ ZIP codes
- **Cities:** Austin, Dallas, Houston
- **Features:** 15+ (filters, toggle, rankings, etc.)
- **Dependencies:** 0 new packages
- **Route:** `/offer-heatmap`

## Testing URLs (Local Dev)

```
http://localhost:5173/offer-heatmap              # Full page
http://localhost:5173/offer-heatmap?city=Austin  # (future: query params)
```

## Key Features Checklist

✅ Interactive SVG map
✅ 100+ ZIP codes with real coordinates
✅ Color-coded by success rate (5 tiers)
✅ Size-coded by offer volume
✅ Click to select functionality
✅ Renter/Landlord view toggle
✅ City, bedroom, price filters
✅ Top 10 rankings list
✅ Detailed stats sidebar
✅ Context-aware recommendations
✅ Pro tips section
✅ Market insights footer
✅ Responsive design
✅ Smooth animations
✅ No external dependencies

---

**Note:** This is a **mock data MVP**. Real implementation would connect to API endpoints for live ZIP code statistics.
