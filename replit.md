# Apartment Locator AI

## Overview
An AI-powered apartment locator application that helps users find apartments, analyze market trends, and make informed rental decisions. The application provides:
- Apartment search with advanced filtering
- AI-powered property recommendations
- Market intelligence and analytics
- User preference management
- Saved apartment tracking

## Recent Changes (February 2026)
- **Unified Dashboard**: Single dashboard at `/dashboard` integrating apartment search, True Cost calculator, and market intelligence
  - Interactive Google Maps with property markers (purple) and user POIs (red=work, blue=gym, green=grocery)
  - Polylines connecting apartments to POIs showing relationships
  - MarketIntelBar: Live market metrics (median rent, days on market, inventory, leverage score, AI recommendation)
  - LeftPanelSidebar: Collapsible sections for locations, True Cost inputs, and filters
  - Map/List toggle view with sorting by True Cost, Base Rent, or Commute Time
  - Cost Comparison table highlighting best deals with potential monthly savings
- **Location Cost Model**: "True Monthly Cost" calculator that factors in commute, parking, groceries, and gym costs
  - Components: InteractivePropertyMap, MarketIntelBar, LeftPanelSidebar
  - LocationCostContext for state management with localStorage persistence
  - Service layer with calculation logic for cost analysis
- **Migration to Replit Fullstack**: Migrated to Replit's fullstack environment with PostgreSQL
- **Backend**: Express server with Drizzle ORM for database operations
- **Database**: PostgreSQL with tables for properties, saved apartments, search history, user preferences, market snapshots, users, and user POIs
- **Authentication**: JWT-based auth with bcrypt password hashing (signup, signin, /me endpoints)
  - Centralized auth helper (`src/lib/authHelpers.ts`) with `getAuthToken()`, `getAuthHeaders()`, `authenticatedFetch()`, and `handleUnauthorized()`
  - Token stored in localStorage as `auth_token` (consistent across all components)
  - `authenticatedFetch()` auto-injects Bearer token and handles 401 responses with user redirect
  - `handleUnauthorized()` clears token and redirects to `/auth?redirect={currentPath}` for session recovery
  - Header component integrates with useUser hook for dynamic auth state display
  - Shows "Sign In" button when not authenticated, user dropdown menu when logged in
  - Sign Out option available in both desktop dropdown and mobile menu
  - ProtectedRoute component available for securing authenticated-only pages
  - All landlord components use `authenticatedFetch()` for consistent 401 handling
- **Google OAuth**: Server-side token verification via Google's tokeninfo endpoint
  - `findOrCreateGoogleUser` in `server/auth.ts` creates/finds users with verified Google emails
  - `POST /api/auth/google` endpoint verifies Google ID tokens and issues JWT
  - Frontend Google Identity Services button renders only when `VITE_GOOGLE_CLIENT_ID` is set
  - `googleLogin` method in useUser hook handles token storage and user type migration
  - Audience check against `GOOGLE_CLIENT_ID` env var for security
- **User Type Flows**: Three user types (renter, landlord, agent) with dedicated flows
  - Pricing pages link to `/auth?type={userType}&mode=signup&plan={planId}`
  - Auth page reads URL params and shows user-type-specific UI (icons, badges, descriptions)
  - After signup/login, redirects to appropriate destination:
    - Renters → `/dashboard`
    - Landlords → `/landlord-onboarding` → `/landlord-dashboard` or `/portfolio-dashboard`
    - Agents → `/agent-onboarding` → `/agent-dashboard`
- **Landlord Retention Dashboard**: New retention intelligence dashboard at `/landlord-dashboard` 
  - Strategic pivot from "competitive pricing" to "retention intelligence" platform
  - Light gradient theme (bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50)
  - Components in `src/components/retention/`:
    - RetentionHealthBar: Portfolio retention metrics (retention rate, units at risk, vacancy cost, renewals due, AI insight)
    - PortfolioHealthWidget: Sidebar with retention rate hero, unit stats grid, vacancy cost callout
    - UpcomingRenewalsWidget: Renewal list with risk-colored indicators and lease expiry countdown
    - RetentionAlertsSidebar: Severity-styled alert cards (critical, warning, info, success)
    - RetentionFilterBar: Filter buttons (All, Critical, At Risk, Healthy, Vacant)
    - VacancyCostCalculator: 12-month cost scenarios comparing retention vs. turnover
    - RetentionScoreBreakdown: Risk factor visualization with score bars
    - NearbyMarketContext: Nearby comparable units with concessions
    - RetentionDetailCard: Property detail panel with risk breakdown and cost calculator
    - RetentionMapView: Map with health-colored pins (green=healthy, yellow=at risk, red=critical, gray=vacant)
  - Types in `src/types/retention.types.ts`: RetentionUnit, RetentionAlert, PortfolioHealth, RetentionMetrics
  - Mock data fallback until API endpoints are implemented
  - All interactive elements have data-testid attributes for testing
- **Freemium Renter Flow**: Gated savings data with unlock options
  - Free renters can search and see property listings with basic info (name, location, rent, beds/baths)
  - Savings data (deal score, potential savings, negotiation tips, timing advice) is blurred/locked
  - Two unlock options: per-property unlock ($1.99) or time-based plan purchase
  - Plans: Basic ($9.99/7d, 5 analyses), Pro ($29.99/30d, unlimited), Premium ($99.99/90d, unlimited + concierge)
  - `PaywallModal`: Two-step flow (plan selection then checkout) prevents premature Stripe initialization
  - `SavingsDataGate`: Blur-and-overlay component replaces old `LockedSavingsOverlay`
  - `usePaywall` hook: Tracks per-property unlocks in localStorage, checks subscription status from UserContext
  - Payment endpoints: `POST /api/payments/create-intent` creates Stripe PaymentIntent after plan selection
  - Payment verification: `POST /api/payments/verify` confirms payment and updates user subscription
  - `RenterUnitCard` uses `SavingsDataGate` for clean locked/unlocked state rendering
  - `RenterDashboard` uses `PaywallModal` and `usePaywall` for paywall flow management
- **API Routes**: RESTful endpoints for properties, saved apartments, search history, preferences, market data, auth, and payments

## Project Architecture

### Tech Stack
- **Frontend**: React 18 with Vite, TailwindCSS, Shadcn/UI components
- **Backend**: Express 5.x with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Build**: tsx for development, esbuild for production

### Directory Structure
```
├── client/src/          # Frontend source (currently in src/)
├── server/              # Express backend
│   ├── index.ts         # Main server entry
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Database storage layer
│   ├── db.ts           # Database connection
│   └── vite.ts         # Vite middleware for development
├── shared/              # Shared types and schemas
│   └── schema.ts        # Drizzle schema definitions
├── src/                 # React frontend
│   ├── components/      # UI components
│   │   ├── dashboard/   # Dashboard components (MarketIntelBar, LeftPanelSidebar)
│   │   ├── maps/        # Map components (InteractivePropertyMap)
│   │   └── location-cost/ # Location Cost Calculator components
│   ├── contexts/        # React contexts (LocationCostContext)
│   ├── pages/           # Page components (UnifiedDashboard, etc.)
│   ├── hooks/           # Custom hooks (useLocationCost)
│   ├── services/        # Business logic (locationCostService)
│   ├── types/           # TypeScript types (locationCost.types)
│   └── lib/             # Utilities
└── supabase/            # Legacy Supabase functions (being migrated)
```

### Database Schema
- **users**: User accounts with email, password hash, subscription tier/status, user type (renter/landlord/agent)
- **renter_profiles**: Renter-specific onboarding data (current rent, lease expiry, budget, commute preferences, setup progress)
- **properties**: Property listings with details, amenities, pricing, landlord/retention fields
- **saved_apartments**: User-saved properties with notes and ratings
- **search_history**: User search parameter history
- **user_preferences**: User notification and filter preferences
- **market_snapshots**: Market analytics and trends by city
- **user_pois**: User points of interest with priority level, transport mode, max commute time
- **submarkets**: Submarket boundaries, rent stats, opportunity scores
- **purchases**: One-time property unlock purchases (Stripe integration)
- **subscriptions**: User subscription plans (Stripe integration)
- **invoices**: Billing invoices linked to subscriptions
- **property_unlocks**: Per-property unlock records for freemium gating
- **lease_verifications**: Lease verification submissions for savings validation
- **competition_sets**: Landlord competition set groupings
- **competition_set_competitors**: Competitor properties within sets
- **pricing_alerts**: Price change, concession, vacancy risk alerts
- **alert_preferences**: User notification delivery preferences
- **agent_clients**: Agent CRM client records
- **client_activity**: Agent-client interaction history
- **deals**: Agent deal pipeline tracking
- **deal_notes**: Notes on deals
- **agent_leads**: Agent lead management with scoring
- **api_keys**: JEDI RE B2B API key management

### API Endpoints
**Authentication**
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in existing user
- `GET /api/auth/me` - Get current user (requires auth token)

**Properties**
- `GET /api/properties` - Search properties with filters
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property

**User Data**
- `GET /api/saved-apartments/:userId` - Get user's saved apartments
- `POST /api/saved-apartments` - Save an apartment
- `DELETE /api/saved-apartments/:userId/:apartmentId` - Remove saved apartment
- `GET /api/search-history/:userId` - Get search history
- `POST /api/search-history` - Add search entry
- `GET /api/preferences/:userId` - Get user preferences
- `POST /api/preferences` - Create/update preferences
- `GET /api/pois/:userId` - Get user POIs
- `POST /api/pois` - Create POI
- `DELETE /api/pois/:userId/:poiId` - Delete POI

**Renter Profile**
- `GET /api/renter-profile` - Get current user's renter profile (requires auth)
- `POST /api/renter-profile` - Create/update renter profile (requires auth)

**Market Data**
- `GET /api/market-snapshots/:city/:state` - Get market data
- `POST /api/market-snapshots` - Create market snapshot

**Access & Payments**
- `GET /api/access/status` - Check user's access status (plan or per-property)
- `GET /api/access/unlocked-properties/:userId` - Get unlocked property IDs
- `POST /api/access/unlock-property` - Unlock single property (stub - needs Stripe)
- `POST /api/access/activate-plan` - Activate time-based plan (stub - needs Stripe)
- `POST /api/payments/create-intent` - Create Stripe PaymentIntent for selected plan
- `POST /api/payments/verify` - Verify payment and update user subscription
- `POST /api/auth/google` - Google OAuth: verify Google ID token and sign in/create account

**Health**
- `GET /api/health` - Health check

## Environment Variables (Required)
The following secrets must be configured in Replit Secrets:
- **JWT_SECRET** - Secure random string for signing authentication tokens (required - server will not start without it)
- **ADMIN_EMAIL** - Email address for admin account bootstrap
- **ADMIN_PASSWORD** - Password for admin account bootstrap
- **VITE_GOOGLE_MAPS_API_KEY** - Google Maps API key for map features

Optional (for future features):
- STRIPE_SECRET_KEY, VITE_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET - For payment processing
- VITE_GOOGLE_CLIENT_ID, GOOGLE_CLIENT_ID - For Google OAuth sign-in

## Development Commands
- `npm run dev` - Start development server (Express + Vite)
- `npm run build` - Build for production
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio for database management

## Migration Status

### Completed
- Database schema migrated to PostgreSQL with Drizzle ORM
- Authentication system with JWT tokens and bcrypt password hashing
- Auth pages (Auth.tsx, AuthModern.tsx) using new Express API
- useUser hook calling Express auth endpoints
- Payment checkout endpoint stub (returns placeholder URLs)
- All core CRUD operations for properties, saved apartments, search history, preferences, POIs, market data

### Remaining (Future Phases)
- Some pages still reference Supabase client (Landing, Profile, etc.) - need UI updates to call Express API
- Full Stripe integration for payments (add STRIPE_SECRET_KEY when ready)
- Data export functionality migration
- User tracking migration
- Legacy Supabase files in `src/integrations/supabase/` can be removed once all pages migrated
