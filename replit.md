# Apartment Locator AI

## Overview
An AI-powered apartment locator application that helps users find apartments, analyze market trends, and make informed rental decisions. The application provides:
- Apartment search with advanced filtering
- AI-powered property recommendations
- Market intelligence and analytics
- User preference management
- Saved apartment tracking

## Recent Changes (February 2026)
- **Migration to Replit Fullstack**: Migrated from Lovable/Supabase to Replit's fullstack environment with PostgreSQL
- **Backend**: Express server with Drizzle ORM for database operations
- **Database**: PostgreSQL with tables for properties, saved apartments, search history, user preferences, and market snapshots
- **API Routes**: RESTful endpoints for properties, saved apartments, search history, preferences, and market data

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
│   ├── pages/           # Page components
│   ├── hooks/           # Custom hooks
│   └── lib/             # Utilities
└── supabase/            # Legacy Supabase functions (being migrated)
```

### Database Schema
- **properties**: Property listings with details, amenities, pricing
- **saved_apartments**: User-saved properties with notes and ratings
- **search_history**: User search parameter history
- **user_preferences**: User notification and filter preferences
- **market_snapshots**: Market analytics and trends by city

### API Endpoints
- `GET /api/properties` - Search properties with filters
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property
- `GET /api/saved-apartments/:userId` - Get user's saved apartments
- `POST /api/saved-apartments` - Save an apartment
- `DELETE /api/saved-apartments/:userId/:apartmentId` - Remove saved apartment
- `GET /api/search-history/:userId` - Get search history
- `POST /api/search-history` - Add search entry
- `GET /api/preferences/:userId` - Get user preferences
- `POST /api/preferences` - Create/update preferences
- `GET /api/market-snapshots/:city/:state` - Get market data
- `POST /api/market-snapshots` - Create market snapshot
- `GET /api/health` - Health check

## Development Commands
- `npm run dev` - Start development server (Express + Vite)
- `npm run build` - Build for production
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio for database management

## Migration Notes
- The application still contains Supabase client code in `src/integrations/supabase/` that needs to be migrated to use the new Express API
- Supabase edge functions in `supabase/functions/` need to be migrated to Express routes
- Authentication needs to be implemented (was previously using Supabase Auth)
