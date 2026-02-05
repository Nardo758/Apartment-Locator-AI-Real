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
- **User Type Flows**: Three user types (renter, landlord, agent) with dedicated flows
  - Pricing pages link to `/auth?type={userType}&mode=signup&plan={planId}`
  - Auth page reads URL params and shows user-type-specific UI (icons, badges, descriptions)
  - After signup/login, redirects to appropriate destination:
    - Renters → `/dashboard`
    - Landlords → `/landlord-onboarding` → `/landlord-dashboard` or `/portfolio-dashboard`
    - Agents → `/agent-onboarding` → `/agent-dashboard`
- **Landlord Dashboard**: New unified dashboard at `/landlord-dashboard` mirroring UnifiedDashboard pattern
  - Dark gradient theme (bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900)
  - MarketIntelBar with landlord-specific metrics (portfolio value, avg rent, vacancy rate)
  - LeftPanelSidebar with PortfolioSummaryWidget, PropertyFilters, CompetitionSetManager, AlertsWidget
  - Map/List toggle view with property cards
  - All components use `authenticatedFetch()` for consistent 401 handling
  - Mock data fallback when API endpoints don't exist yet
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
- **users**: User accounts with email, password hash, subscription tier/status
- **properties**: Property listings with details, amenities, pricing
- **saved_apartments**: User-saved properties with notes and ratings
- **search_history**: User search parameter history
- **user_preferences**: User notification and filter preferences
- **market_snapshots**: Market analytics and trends by city
- **user_pois**: User points of interest (custom locations)

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

**Market Data**
- `GET /api/market-snapshots/:city/:state` - Get market data
- `POST /api/market-snapshots` - Create market snapshot

**Payments**
- `POST /api/payments/create-checkout` - Create payment checkout session (stub - needs Stripe config)

**Health**
- `GET /api/health` - Health check

## Environment Variables (Required)
The following secrets must be configured in Replit Secrets:
- **JWT_SECRET** - Secure random string for signing authentication tokens (required - server will not start without it)
- **ADMIN_EMAIL** - Email address for admin account bootstrap
- **ADMIN_PASSWORD** - Password for admin account bootstrap
- **VITE_GOOGLE_MAPS_API_KEY** - Google Maps API key for map features

Optional (for future features):
- STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET - For payment processing

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
