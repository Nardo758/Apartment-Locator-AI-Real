# Apartment Locator AI

## Overview
The Apartment Locator AI is an AI-powered application designed to streamline the apartment search process. It provides advanced filtering, AI-driven property recommendations, and in-depth market intelligence to help users make informed rental decisions. The application aims to unify apartment search, cost analysis, and market insights into a single, intuitive platform, helping renters find ideal homes and enabling landlords to optimize retention strategies.

## User Preferences
I want iterative development. Ask before making major changes.

## System Architecture

### UI/UX Decisions
- **Unified Dashboard**: A central `/dashboard` integrates apartment search, a "True Monthly Cost" calculator, and market intelligence.
  - Interactive Google Maps display properties (purple markers) and user-defined POIs (work: red, gym: blue, grocery: green). Polylines visualize relationships between apartments and POIs.
  - A MarketIntelBar presents live market metrics including median rent, days on market, inventory, leverage score, and AI recommendations.
  - A LeftPanelSidebar offers collapsible sections for locations, True Cost inputs, and filters.
  - A toggle view switches between map and list, with sorting options for True Cost, Base Rent, or Commute Time.
  - A Cost Comparison table highlights potential monthly savings.
  - Heart/save buttons on each table row to save properties to My Apartments.
- **Landlord Retention Dashboard**: Located at `/landlord-dashboard`, this dashboard focuses on retention intelligence with a light gradient theme. It includes:
  - RetentionHealthBar for portfolio metrics (rate, units at risk, vacancy cost, renewals, AI insight).
  - PortfolioHealthWidget with a retention rate hero, unit stats, and vacancy cost callout.
  - UpcomingRenewalsWidget with risk-colored indicators.
  - RetentionAlertsSidebar for severity-styled alerts.
  - RetentionFilterBar for filtering units by status.
  - VacancyCostCalculator for 12-month cost scenarios.
  - RetentionScoreBreakdown visualizing risk factors.
  - NearbyMarketContext for comparable units.
  - RetentionDetailCard for property-specific risk breakdown.
  - RetentionMapView with health-colored pins.
- **Freemium Renter Flow**: Gated savings data. Free users see basic property info; detailed savings data (deal score, potential savings, negotiation tips) is blurred. Unlocks are available per-property ($1.99) or via time-based plans (Basic: $9.99/7d, Pro: $29.99/30d, Premium: $99.99/90d).
- **Property Browser**: `/browse-properties` displays scraped apartment listings from Supabase with AI-powered savings analysis, blurred monetization (free users see 2 properties, rest are blurred with savings teasers), upfront savings calculator separating one-time incentives from monthly concessions, deal scoring, heart/save buttons on each card, and "View Details" links to property detail pages.
- **Property Detail Page**: `/scraped-property/:id` fetches individual scraped property data from Supabase and displays hero image, property details (bedrooms, bathrooms, pet policy), savings analysis, special offers, amenities, and a save button.
- **My Apartments Page**: `/saved-properties` shows all locally-saved properties with grid/list views, CSV export, remove functionality, and links to property detail pages. Properties are saved to localStorage via `useSavedScrapedProperties` hook for seamless use without login.

### Technical Implementations
- **Backend**: Express 5.x with TypeScript, using Drizzle ORM for PostgreSQL database interactions. CORS configured, rate limiting on `/api/auth/` (20/15min), `/api/payments/` (10/15min), `/api/` (100/min). Environment validation at startup for DATABASE_URL and JWT_SECRET.
- **Frontend**: React 18 with Vite, TailwindCSS, and Shadcn/UI components. All 30+ pages use React.lazy() with Suspense for code splitting.
- **Authentication**: JWT-based authentication with bcrypt hashing. `authenticatedFetch()` auto-injects Bearer tokens and handles 401 responses by redirecting to `/auth`. `queryClient.ts` also injects Bearer tokens via `getAuthHeaders()` in both `apiRequest()` and `getQueryFn()`, with automatic 401 redirect. Google OAuth is supported with server-side token verification.
- **User Type Flows**: Dedicated onboarding and dashboard flows for Renters, Landlords, and Agents, determined by URL parameters during signup.
- **Location Cost Model**: Calculates "True Monthly Cost" by factoring in commute, parking, groceries, gym expenses, and amenity savings. Amenity value calculator (`src/lib/amenity-value-calculator.ts`) detects included amenities (gym $50, parking $150-200, laundry $40, utilities $15-90, etc.) and subtracts their monthly value from True Cost. This model uses `LocationCostContext` for state management and localStorage persistence.
- **Program Your AI** (`/program-ai`): `ProgramAIUnified.tsx` provides comprehensive apartment preference setup with 10 collapsible categories: Basic Requirements (bedrooms, bathrooms, sq ft, furnished), Building Amenities (gym, pool, elevator, laundry, etc.), In-Unit Features (A/C, heating, washer/dryer, balcony, etc.), Utilities & Services (heat/water/electric/gas/trash included, internet, cable), Pet Policy (dogs, cats, size restrictions, deposit), Parking (included, garage, covered, EV), Accessibility (wheelchair, first floor, elevator), Safety & Security (security system, surveillance, gated), Lease Terms (short-term, month-to-month, flexible, preferred term), Location Preferences (transit, walkability, grocery, parks, quiet). All selections persist through `AIPreferences` in `UnifiedAIContext` with localStorage. Market Intelligence section references profile income data (no duplication).
- **Smart Score Engine**: `src/lib/smart-score-engine.ts` implements the 4-component Smart Score formula from the AI Formula page: Smart Score = (Location × 25%) + (Preference Match × 25%) + (Market Intel × 25%) + (Value × 25%). Location Score uses commute quality, POI proximity, and True Cost savings. Preference Score uses Budget Match (30%), Amenity Match (35%), and Deal Breaker Avoidance (35%), pulling from both legacy amenities array and structured nested preferences (buildingAmenities, inUnitFeatures, utilities, parking, petPolicy, safety, accessibility, locationPrefs). Market Score uses leverage score from MarketContext. Value Score uses concession value and deal score from savings calculator. Integrated into `ScrapedPropertiesBrowser.tsx` with clickable Smart Score badges, 4-component breakdown panel, and "Smart Score" as default sort option.
- **Payment Processing**: Integrated with Stripe via Replit's managed connector. It uses `stripe-replit-sync` for database synchronization of Stripe entities and manages webhooks.
- **API Routes**: Comprehensive RESTful API for properties, saved apartments, search history, user preferences, market data, authentication, payments, and lease intelligence.
- **Lease Intelligence Client**: `src/lib/apartmentiq-client.ts` provides `ApartmentIQClient` class with `fetchLeaseIntel(propertyIds)` for retrieving lease expiration, market rate, renewal rate, and rollover risk data per property. Backend route: `POST /api/landlord/lease-intel`.
- **Renter Lease Intelligence**: `src/lib/renter-lease-intel.ts` translates landlord data into renter-actionable insights: deal score (0-100), negotiation power level, below-market opportunity detection, incentive probability, rent trend prediction, urgency indicators, and best move-in timing. Component `src/components/renter/RenterLeaseIntelBadges.tsx` renders compact/full badge views. Backend route: `POST /api/renter/lease-intel`. Hook: `src/hooks/useRenterLeaseIntel.ts`.

### System Design Choices
- **Database Schema**: Utilizes PostgreSQL with Drizzle ORM, featuring tables for `users`, `renter_profiles`, `properties`, `saved_apartments`, `search_history`, `user_preferences`, `market_snapshots`, `user_pois`, `submarkets`, `purchases`, `subscriptions`, `invoices`, `property_unlocks`, `lease_verifications`, `competition_sets`, `competition_set_competitors`, `pricing_alerts`, `alert_preferences`, `agent_clients`, `client_activity`, `deals`, `deal_notes`, `agent_leads`, `api_keys`, and `user_data_engines`.
- **User Data Engine**: Unified service layer (`src/services/`) for persisting user-type-specific data. Base class `UserDataEngine` with load/save/subscribe/refresh and priority: Database > localStorage > Defaults. Implementations: `RenterDataEngine` (location, budget, commute, preferences), `LandlordDataEngine` (portfolio, retention goals, notifications), `AgentDataEngine` (profile, pipeline, clients, markets). Storage: `user_data_engines` table (JSONB). Migration: `supabase/migrations/020_user_data_engines.sql`.
- **Modularity**: Frontend components are organized into `components/`, `contexts/`, `pages/`, `hooks/`, `services/`, `types/`, and `lib/`. Backend is structured with `index.ts`, `routes.ts`, `storage.ts`, `db.ts`, and `vite.ts`.
- **Scraped Properties API**: `server/routes/scraped-properties.ts` connects to Supabase (using `SUPABASE_URL` and `SUPABASE_ANON_KEY`) to fetch scraped apartment data. Routes: `GET /api/scraped-properties` (all listings), `GET /api/scraped-properties/stats` (aggregate stats). Frontend: `src/lib/savings-calculator.ts` for deal scoring and savings breakdowns.
- **Environment Variables**: Critical configurations like `JWT_SECRET`, `VITE_GOOGLE_MAPS_API_KEY`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY` are managed via Replit Secrets.

## External Dependencies
- **PostgreSQL**: Primary database for all application data.
- **Google Maps API**: Used for interactive property maps and POI visualization.
- **Stripe**: Payment gateway for handling subscriptions and one-time purchases, integrated via Replit's managed connector.
- **Google Identity Services**: For Google OAuth-based user authentication.
- **Supabase**: Used for scraped property data storage and retrieval via `@supabase/supabase-js`.