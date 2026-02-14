# Admin Panel Integration Guide

**Phase 2 Complete:** Frontend admin UI built  
**Status:** Ready to integrate into App.tsx  
**NOT pushed to GitHub** (as requested)

---

## 📂 Files Created

All files in `src/pages/admin/`:

1. **AdminLayout.tsx** (3.7 KB) - Navigation wrapper
2. **AdminDashboard.tsx** (10.6 KB) - Overview page
3. **PropertiesBrowser.tsx** (14.9 KB) - Property list/grouped views
4. **UnitMixView.tsx** (12.6 KB) - Unit breakdown & charts
5. **DemandDashboard.tsx** (16.6 KB) - User demand signals
6. **ScrapingMonitor.tsx** (15.0 KB) - Scraper stats & logs
7. **index.ts** (402 bytes) - Exports

**Total:** ~73 KB of production React code

---

## 🚀 Integration Steps

### Step 1: Add Routes to App.tsx

Add these imports:
```typescript
import {
  AdminLayout,
  AdminDashboard,
  PropertiesBrowser,
  UnitMixView,
  DemandDashboard,
  ScrapingMonitor,
} from './pages/admin';
```

Add these routes inside your `<Routes>` component:
```typescript
{/* Admin Routes */}
<Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
<Route path="/admin/properties" element={<AdminLayout><PropertiesBrowser /></AdminLayout>} />
<Route path="/admin/units" element={<AdminLayout><UnitMixView /></AdminLayout>} />
<Route path="/admin/demand" element={<AdminLayout><DemandDashboard /></AdminLayout>} />
<Route path="/admin/scraping" element={<AdminLayout><ScrapingMonitor /></AdminLayout>} />
```

### Step 2: Install Chart Dependencies (if not already installed)

```bash
npm install recharts
```

### Step 3: Run Database Migration

```bash
cd /home/leon/clawd/apartment-locator-ai
npm run db:push
```

Or manually:
```bash
psql $DATABASE_URL < migrations/021_enhanced_property_schema.sql
```

### Step 4: Test Admin Panel

1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:5000/admin`
3. Test each section:
   - Dashboard: Overview stats
   - Properties: List and grouped views
   - Unit Mix: Charts and breakdown
   - Demand: User signals
   - Scraping: Stats and logs

---

## 🔐 Access Control (TODO)

Currently, admin panel is **publicly accessible**. Add auth middleware:

### Option A: Simple Role Check (Recommended)
```typescript
// Add to App.tsx
import { useAuth } from './contexts/AuthContext';

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user || user.userType !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Wrap admin routes:
<Route path="/admin/*" element={<ProtectedAdmin><AdminLayout>...</AdminLayout></ProtectedAdmin>} />
```

### Option B: Backend Middleware (More Secure)
Already implemented in `server/routes/admin.ts`:
```typescript
const requireAdmin = (req, res, next) => {
  // TODO: Verify user is admin via Supabase auth
  next();
};
```

Update this middleware to check `req.user.userType === 'admin'`.

---

## 📊 Features Built

### 1. Admin Dashboard (`/admin`)
- **KPI Cards:** Total properties, units, occupancy, users
- **Charts:** User distribution, property growth (placeholder)
- **Quick Links:** Navigate to other admin sections
- **Auto-refresh:** Every 60 seconds

### 2. Properties Browser (`/admin/properties`)
- **List View:** Searchable table with pagination
- **Grouped View:** Properties by city/state with aggregates
- **Filters:** City, state, zip, property class
- **Details:** Name, address, units, occupancy, class, last scraped

### 3. Unit Mix View (`/admin/units`)
- **Summary Cards:** Total units, types, availability, avg rent
- **Pie Chart:** Unit distribution by type
- **Bar Chart:** Average rent by unit type
- **Detailed Table:** Full breakdown with occupancy rates

### 4. Demand Dashboard (`/admin/demand`)
- **Summary Cards:** Total renters, lease expirations, avg budget
- **Bedroom Demand Chart:** Distribution by unit size
- **Top Amenities Chart:** Most requested features
- **Recent Signals Table:** Latest user preferences (first 10)
- **Timeline:** Lease expiration visualization (placeholder)

### 5. Scraping Monitor (`/admin/scraping`)
- **Stats Cards:** Total, last 24h, last 7d, success rate
- **By Source:** Progress bars showing properties per source
- **By Market:** Properties per city/state
- **Manual Scrape:** URL input for ad-hoc scraping (placeholder)
- **Data Quality:** Coverage metrics (units, amenities, availability)
- **Auto-refresh:** Every 30 seconds

---

## 🎨 Design System

**Colors:**
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)
- Purple: (#8B5CF6)

**Components:**
- Tailwind CSS for styling
- Recharts for data visualization
- React Query for data fetching
- React Router for navigation

**Responsive:**
- Mobile-first design
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

---

## 🔄 API Endpoints Used

All endpoints from `server/routes/admin.ts`:

- `GET /api/admin/dashboard` - Overview stats
- `GET /api/admin/properties` - List properties (paginated)
- `GET /api/admin/properties/grouped` - Grouped by location
- `GET /api/admin/units` - Unit mix breakdown
- `GET /api/admin/availability-forecast` - Supply pipeline
- `GET /api/admin/rent-growth` - Rent trends
- `GET /api/admin/demand-signals` - User demand data
- `GET /api/admin/scraping-stats` - Scraper performance

All endpoints return JSON and support query parameters for filtering.

---

## 🐛 Known Issues / TODOs

### High Priority:
1. **Auth:** Add admin role check (see Access Control section)
2. **Migration:** Run database migration before first use
3. **Charts Dependency:** Install `recharts` if not present

### Medium Priority:
4. **Property Growth Chart:** Needs historical data (currently placeholder)
5. **Lease Expiration Timeline:** Needs implementation (currently placeholder)
6. **Manual Scrape:** Needs Cloudflare Worker integration
7. **Data Quality Metrics:** Currently hardcoded percentages (should calculate from DB)

### Low Priority:
8. **Export Functionality:** CSV/Excel export for tables
9. **Search:** Global search across all properties
10. **Sorting:** Column sorting in tables
11. **Property Detail Modal:** Click property row to see full details
12. **Real-time Updates:** WebSocket for live scraper status

---

## 🚀 Next Steps (Phase 3)

After integrating admin panel, Phase 3 focuses on **Enhanced Scraper**:

1. **Availability Date Parsing**
   - Extract "Available Now", "March 15", etc.
   - Parse move-in ready dates

2. **Property Characteristics**
   - Year built / renovated detection
   - Property class inference (A/B/C)
   - Building type detection

3. **Financial Data Extraction**
   - Parking fees, pet rent, application fees
   - Utility inclusions

4. **Historical Tracking**
   - Insert rent_history records on each scrape
   - Track price changes over time

See `ENHANCED_SCHEMA_BUILD.md` for Phase 3 details.

---

## 📝 Testing Checklist

Before going live:

- [ ] Run database migration
- [ ] Install recharts dependency
- [ ] Add routes to App.tsx
- [ ] Test dashboard loads
- [ ] Test properties list view
- [ ] Test properties grouped view
- [ ] Test unit mix charts render
- [ ] Test demand dashboard
- [ ] Test scraping monitor
- [ ] Test filters on each page
- [ ] Test pagination on properties
- [ ] Test navigation between sections
- [ ] Add admin auth middleware
- [ ] Test on mobile viewport
- [ ] Check console for errors

---

## 💡 Usage Tips

**For Development:**
```bash
# Start dev server
npm run dev

# Access admin panel
open http://localhost:5000/admin

# Watch logs
tail -f logs/app.log
```

**For Production:**
```bash
# Build frontend
npm run build

# Deploy backend
# (depends on your hosting setup)

# Access admin panel
open https://yourdomain.com/admin
```

**Quick Stats:**
- Navigate to `/admin` for high-level overview
- Use filters to drill down by location
- Charts auto-update every 30-60 seconds
- Click markets in grouped view to see properties

---

## 🎯 Success Criteria

Admin panel is ready when:

✅ All 5 pages render without errors  
✅ API endpoints return data  
✅ Charts display correctly  
✅ Filters work on all pages  
✅ Navigation between sections works  
✅ Mobile responsive  
✅ Auth middleware protects routes  

---

**Built:** February 14, 2026  
**Phase:** 2 of 3 (Frontend Complete)  
**Next:** Phase 3 - Enhanced Scraper  
**Status:** Ready for integration 🚀
