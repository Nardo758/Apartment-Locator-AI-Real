# Apartment Locator AI - Project Overview

## What We've Built

A comprehensive AI-powered apartment locator application that helps users find apartments, analyze market trends, and make informed rental decisions by calculating the **True Monthly Cost** of living at each property.

---

## Core Features

### 1. Unified Dashboard (`/dashboard`)
The central hub integrating apartment search, True Cost calculation, and market intelligence.

**Components:**
- **Interactive Google Map** with property markers and user Points of Interest (POIs)
- **MarketIntelBar** displaying live market metrics (median rent, days on market, inventory, leverage score, AI recommendation)
- **LeftPanelSidebar** with collapsible sections for locations, cost inputs, lifestyle costs, and filters
- **Map/List toggle** with sorting by True Cost, Base Rent, or Commute Time
- **Cost Comparison table** highlighting best deals with potential monthly savings

### 2. Location Cost Model ("True Monthly Cost")
Calculates the real cost of living at each apartment based on the user's lifestyle.

**Fixed Cost Categories:**
- Commute costs (gas, transit, time)
- Grocery shopping frequency and preferred store
- Gym/fitness membership and visit frequency

**Custom Lifestyle Costs:**
Users can add any recurring expense category:
- Daycare/Childcare
- School
- Doctor/Medical
- Pet Services
- Place of Worship
- Favorite Restaurants
- Bars/Nightlife
- Entertainment venues
- Library
- Coworking spaces
- Parks/Recreation
- Beach/Waterfront
- Coffee shops
- Any custom category

Each category tracks:
- Visit frequency (per week)
- Cost per visit
- Automatic monthly cost calculation

### 3. Points of Interest (POIs)
17+ location types with unique color-coded map markers:
| Category | Color | Icon |
|----------|-------|------|
| Work | Red | Briefcase |
| Gym | Blue | Dumbbell |
| Grocery | Green | Shopping Cart |
| Daycare | Pink | Baby |
| School | Yellow | Graduation Cap |
| Medical | Teal | Stethoscope |
| Pet Services | Orange | Dog |
| Religious | Purple | Church |
| Dining | Amber | Utensils |
| Nightlife | Indigo | Beer |
| Entertainment | Fuchsia | Music |
| Library | Cyan | Book |
| Coworking | Slate | Building |
| Park | Emerald | Tree |
| Beach | Sky | Waves |
| Coffee | Stone | Coffee |
| Other | Gray | Map Pin |

### 4. Market Intelligence Hub (`/market-intel`)
Comprehensive market analysis and rent vs buy intelligence.

**Features:**
- Real-time market metrics per city
- Leverage Score (renter negotiation power)
- AI-powered rent vs buy analysis
- Break-even calculations
- City comparison (Austin, Dallas, Houston)
- Competitor analysis
- Market trend analytics

### 5. AI Features
- **AI Formula** (`/ai-formula`): Proprietary scoring algorithms
- **Program AI** (`/program-ai`): AI-assisted apartment matching
- **AI Insights**: Market predictions and recommendations

### 6. User Features
- **Saved Properties** (`/saved`): Track favorite apartments with notes and ratings
- **Offers Made** (`/offers`): Track negotiation history
- **User Profile** (`/profile`): Account settings and preferences
- **Authentication**: Sign up, sign in, JWT-based sessions

---

## Technical Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for development and builds
- **TailwindCSS** with Shadcn/UI components
- **Google Maps API** for interactive mapping
- **TanStack Query** for data fetching
- **Wouter** for routing

### Backend
- **Express 5.x** with TypeScript
- **Drizzle ORM** for database operations
- **JWT authentication** with bcrypt password hashing
- RESTful API design

### Database (PostgreSQL)
Tables:
- `users` - User accounts and subscription info
- `properties` - Apartment listings with details/amenities
- `saved_apartments` - User-saved properties
- `search_history` - Search parameter history
- `user_preferences` - Notification and filter settings
- `market_snapshots` - Market analytics by city
- `user_pois` - User points of interest

---

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Sign in
- `GET /api/auth/me` - Get current user

### Properties
- `GET /api/properties` - Search with filters
- `GET /api/properties/:id` - Property details
- `POST /api/properties` - Create listing

### User Data
- `GET/POST/DELETE /api/saved-apartments` - Manage saved properties
- `GET/POST /api/search-history` - Search history
- `GET/POST /api/preferences` - User preferences
- `GET/POST/DELETE /api/pois` - User POIs

### Market Data
- `GET /api/market-snapshots/:city/:state` - Market data
- `POST /api/market-snapshots` - Create snapshot

### Payments
- `POST /api/payments/create-checkout` - Payment session (stub)

---

## Key Screens

1. **Dashboard** - Main apartment search with map and True Cost
2. **Market Intel** - Market analysis and rent vs buy calculator
3. **AI Formula** - AI scoring explanation
4. **Program AI** - AI matching assistant
5. **Saved Properties** - Saved apartment list
6. **Offers Made** - Negotiation tracking
7. **Profile** - User settings
8. **Auth** - Sign in/Sign up

---

## Design Principles

- **True Cost Focus**: Every apartment shows total monthly cost, not just rent
- **Lifestyle-Based**: Costs adapt to user's actual living patterns
- **Data-Driven**: Real market intelligence informs decisions
- **AI-Powered**: Leverage scores and recommendations guide negotiations
- **Visual**: Color-coded maps make location relationships clear
- **Flexible**: Users can add any cost category relevant to their life

---

## Development

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run db:push      # Push schema changes
npm run db:studio    # Database management UI
```

Server runs on port 5000 (Express + Vite).
