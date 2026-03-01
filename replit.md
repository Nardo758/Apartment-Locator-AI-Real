# Apartment Locator AI

## Overview
The Apartment Locator AI is an AI-powered application designed to revolutionize the apartment search and rental market. It provides advanced filtering, AI-driven property recommendations, and in-depth market intelligence to help users make informed rental decisions. The platform aims to unify apartment search, cost analysis, and market insights into a single, intuitive platform, empowering renters to find ideal homes and enabling landlords to optimize retention strategies.

## User Preferences
I want iterative development. Ask before making major changes.

## System Architecture

### UI/UX Decisions
- **Unified Dashboard**: Integrates apartment search, a "True Monthly Cost" calculator, and market intelligence with interactive map displays and a MarketIntelBar.
- **Landlord Retention Dashboard**: Focuses on retention intelligence, displaying portfolio metrics, upcoming renewals, and risk alerts.
- **Freemium Renter Flow**: Gated access to detailed savings data, with unlock options for individual properties or time-based subscriptions.
- **Property Browser**: Displays scraped listings with AI-powered savings analysis, deal scoring, and options to save properties.
- **Property Detail Page**: Provides in-depth information for individual properties, including savings analysis, amenities, and a compact Rent vs Buy comparison.
- **My Apartments Page**: Allows users to view, manage, and export their locally saved properties.

### Technical Implementations
- **Backend**: Express 5.x with TypeScript and Drizzle ORM for PostgreSQL, including CORS and rate limiting.
- **Frontend**: React 18 with Vite, TailwindCSS, and Shadcn/UI, utilizing React.lazy() for code splitting.
- **Authentication**: JWT-based authentication with bcrypt, supporting Google OAuth and automatic token injection for API requests.
- **User Type Flows**: Dedicated onboarding and dashboard experiences for Renters, Landlords, and Agents.
- **Location Cost Model**: Calculates "True Monthly Cost" by factoring in various expenses and amenity values.
- **Program Your AI**: A comprehensive section for users to set apartment preferences across multiple categories, persisting selections via `UnifiedAIContext` and localStorage.
- **Smart Score Engine**: Calculates a composite Smart Score for properties based on Location, Preference Match, Market Intel, and Value components.
- **Payment Processing**: Integrated with Stripe via Replit's managed connector for subscriptions and purchases.
- **API Routes**: RESTful API for properties, saved apartments, user preferences, market data, and lease intelligence.
- **Lease Intelligence Clients**: Provides both landlord-focused lease intelligence and renter-actionable insights like deal scores and negotiation power.

### System Design Choices
- **Database Schema**: PostgreSQL with Drizzle ORM, including tables for users, profiles, properties, saved items, preferences, market data, purchases, and lease intelligence.
- **User Data Engine**: A unified service layer for persisting user-type-specific data, prioritizing Database > localStorage > Defaults.
- **Modularity**: Structured frontend (components, contexts, pages, hooks, services, types, lib) and backend (index, routes, storage, db, vite) for maintainability.
- **Scraped Properties API**: Reads from a PostgreSQL `scraped_properties` table, mapping Drizzle fields to frontend-expected names and generating special offers.
- **Market Intel API**: Provides aggregated market data (median rent, days on market, etc.) with city backfill using Google Geocoding.
- **Rent vs Buy Analysis**: Provides affordability assessment, financial projections, and recommendations using real home price data.
- **Zillow Home Price Integration**: Fetches market analytics, rental listings, and property valuations from Zillow Real Estate API, with caching and fallback estimates.
- **Apify Apartments.com Pipeline**: Imports scraped apartment data from Apify (`memo23/apify-apartments-cheerio`), mapping it to the `scraped_properties` table. Supports detail-page scraping for amenities and unit counts via `includeDetailPage` option. Admin endpoint at `/api/admin/scrape/apartments-com`.
- **Apify ApartmentList.com Pipeline**: Imports scraped apartment data from ApartmentList.com via Apify (`apartmentlist-scraper`). Provides rich data: 25-46 amenities, individual unit counts with pricing, photos, fees, coordinates, pet/parking policies. Admin endpoints at `/api/admin/import/apartmentlist-dataset` and `/api/admin/scrape/apartmentlist`. Source: `apartmentlist.com`.
- **Multi-Source Data Pipeline**: Both Apartments.com and ApartmentList.com feed into the same `scraped_properties` table, distinguished by the `source` column. UPSERT on `(source, external_id)` prevents cross-source collisions.
- **SerpApi Enrichment Pipeline**: Enriches scraped properties with direct website URLs (replacing aggregator links from apartments.com, apartmentlist.com, etc.) via Google Search. Admin endpoints at `/api/admin/enrich/serp` (batch) and `/api/admin/enrich/serp/all` (background auto-enrich). Stores direct URLs in `direct_website_url` column, preserving original `listing_url`. Skips amenity enrichment when existing count >= 5 to preserve rich ApartmentList data. Prioritizes properties missing `direct_website_url` over those needing amenities.
- **Multi-Market Refresh**: `POST /api/admin/scrape/refresh-all` scrapes ApartmentList data for 88 markets in parallel (configurable concurrency). ApartmentList actor requires `startUrls` (e.g., `https://www.apartmentlist.com/{state}/{city}`), `proxy: {useApifyProxy: true}`, and `endPage` fields. Covers full metro areas: GA (Atlanta + 14 suburbs, Savannah), FL (Tampa Bay, Orlando, Jacksonville, South FL, Gulf Coast — 20 cities), NC (Charlotte + 5 suburbs, Triangle + 6), TN (Nashville + 5 suburbs), SC (Charleston + 4 suburbs), TX (Houston + 5, DFW + 8, Austin + 5, San Antonio + 4).
- **Weekly Automated Scheduler**: `server/services/weekly-scheduler.ts` runs full 88-market scrape every Sunday at 6:00 UTC (1 AM ET). Uses `setTimeout`-based scheduling with concurrency=2. Auto-generates market snapshots after scrape completes. Admin endpoints: `GET /api/admin/scheduler/status` (check next run, last result), `POST /api/admin/scheduler/run-now` (trigger manual run). Initializes on server startup via `server/index.ts`.
- **Google Places Photo Integration**: Uses Google Places Text Search API to find and cache apartment complex photos.
- **Market Snapshot Generator**: Aggregates data from `scraped_properties` into `market_snapshots` for each city/state. Calculates median/avg/min/max rent, bedroom counts, new listings, leverage score, supply/demand trends, and AI recommendations. Filters out non-rental prices ($200-$15,000 range). Admin endpoint at `POST /api/admin/generate-market-snapshots`. Auto-generates after `refresh-all` scrape completes.
- **Environment Variables**: Critical configurations managed via Replit Secrets.
- **Database Connection**: Configured to use Replit's built-in PostgreSQL environment variables.

## External Dependencies
- **PostgreSQL**: Replit-managed database for all application data.
- **Google Maps API**: For interactive maps, POI visualization, and place photo lookups.
- **Stripe**: Payment gateway for subscriptions and one-time purchases.
- **Google Identity Services**: For OAuth authentication.
- **Zillow Real Estate API (via RapidAPI)**: For real-time home price data, market analytics, and rental listings.
- **Apify**: For apartment listing scraping and data import.
- **SerpApi**: For Google Search-based property enrichment (direct website URLs and amenities).