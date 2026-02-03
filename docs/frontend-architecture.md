# Apartment Locator AI - Frontend Architecture

## Application Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APARTMENT LOCATOR AI                               │
│                        React 18 + Vite + TailwindCSS                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

## User Flow Diagram

```
                                    ┌──────────────┐
                                    │   VISITOR    │
                                    └──────┬───────┘
                                           │
                                           ▼
                              ┌────────────────────────┐
                              │     LANDING PAGE       │
                              │   (LandingSSRSafe)     │
                              │                        │
                              │  • Hero Section        │
                              │  • Features Overview   │
                              │  • Pricing Info        │
                              │  • Demo Button         │
                              └───────────┬────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
           ┌───────────────┐    ┌─────────────────┐    ┌───────────────┐
           │  SIGN IN/UP   │    │   VIEW DEMO     │    │   PRICING     │
           │   (/auth)     │    │    (/demo)      │    │  (/pricing)   │
           │               │    │                 │    │               │
           │ • Email/Pass  │    │ • No account    │    │ • Plan tiers  │
           │ • Show/Hide   │    │   needed        │    │ • Features    │
           │   password    │    │ • Sample data   │    │ • Subscribe   │
           └───────┬───────┘    └────────┬────────┘    └───────────────┘
                   │                     │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │  AUTHENTICATED USER  │
                   └──────────┬───────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DASHBOARD (/dashboard)                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         MAIN NAVIGATION                              │    │
│  │  [Dashboard] [Search] [Saved] [Market Intel] [AI Formula] [Profile] │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ Property Search │  │ AI Insights     │  │ Quick Stats     │             │
│  │ • City/State    │  │ • Score Cards   │  │ • Saved Count   │             │
│  │ • Price Range   │  │ • Predictions   │  │ • Searches      │             │
│  │ • Bedrooms      │  │ • Savings Est.  │  │ • Alerts        │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Page Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MAIN PAGES                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PUBLIC PAGES (No Auth Required)                                             │
│  ├── /                    → Landing Page (LandingSSRSafe.tsx)               │
│  ├── /auth                → Sign In / Sign Up (Auth.tsx)                    │
│  ├── /demo                → Demo Dashboard (SearchDashboardDemo.tsx)        │
│  ├── /pricing             → Subscription Plans (Pricing.tsx)                │
│  ├── /about               → About Us (About.tsx)                            │
│  ├── /contact             → Contact Form (Contact.tsx)                      │
│  ├── /help                → Help Center (Help.tsx)                          │
│  ├── /terms               → Terms of Service (TermsOfService.tsx)           │
│  └── /privacy             → Privacy Policy (PrivacyPolicy.tsx)              │
│                                                                              │
│  PROTECTED PAGES (Auth Required)                                             │
│  ├── /dashboard           → Main Dashboard (Dashboard.tsx)                  │
│  ├── /property/:id        → Property Details (PropertyDetails.tsx)          │
│  ├── /saved-properties    → Saved Properties (SavedProperties.tsx)          │
│  ├── /market-intel        → Market Intelligence (MarketIntel.tsx)           │
│  ├── /ai-formula          → AI Explanation (AIFormula.tsx)                  │
│  ├── /generate-offer      → Create Rental Offer (GenerateOffer.tsx)         │
│  ├── /offers-made         → View Submitted Offers (OffersMade.tsx)          │
│  ├── /program-ai          → AI Preferences Setup (ProgramAI.tsx)            │
│  ├── /profile             → User Profile (Profile.tsx)                      │
│  ├── /billing             → Subscription Management (Billing.tsx)           │
│  ├── /data-export         → Export User Data (DataExport.tsx)               │
│  └── /data-management     → Manage Data (DataManagement.tsx)                │
│                                                                              │
│  PAYMENT FLOW                                                                │
│  ├── /trial               → Trial Signup (Trial.tsx)                        │
│  ├── /payment-success     → Payment Confirmation (PaymentSuccess.tsx)       │
│  └── /success             → General Success (Success.tsx)                   │
│                                                                              │
│  ADMIN                                                                       │
│  └── /admin               → Admin Dashboard (Admin.tsx)                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App.tsx
│
├── Providers
│   ├── QueryClientProvider (React Query)
│   ├── TooltipProvider
│   ├── UserProvider (Auth Context)
│   ├── PropertyStateProvider (Property State)
│   └── OnboardingFlowProvider
│
├── Layout Components
│   ├── Header.tsx (Navigation Bar)
│   ├── AppFooter.tsx (Footer)
│   └── ModernPageLayout.tsx (Page Wrapper)
│
├── UI Components (Shadcn/UI)
│   ├── Button, Card, Input, Label
│   ├── Dialog, Sheet, Popover
│   ├── Tabs, Accordion, Badge
│   ├── Table, Progress, Slider
│   └── Alert, Toast, Tooltip
│
└── Feature Components
    ├── PropertyCard.tsx
    ├── PropertySearchExample.tsx
    ├── MarketIntelligenceDashboard.tsx
    ├── AIFormulaExplainer.tsx
    └── Modern/* (ModernCard, ModernLoading, etc.)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────┘

     ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
     │   FRONTEND   │  HTTP   │   EXPRESS    │  SQL    │  POSTGRESQL  │
     │    React     │◄───────►│   SERVER     │◄───────►│   DATABASE   │
     │              │  JSON   │   (API)      │         │              │
     └──────────────┘         └──────────────┘         └──────────────┘
            │                        │
            │                        │
     ┌──────▼──────┐         ┌───────▼───────┐
     │  useUser()  │         │  JWT Token    │
     │  Hook       │◄────────┤  Validation   │
     │             │         │               │
     └─────────────┘         └───────────────┘

API Endpoints Used:
├── POST /api/auth/signup      → Create account
├── POST /api/auth/signin      → Login
├── GET  /api/auth/me          → Get current user
├── GET  /api/properties       → Search properties
├── GET  /api/properties/:id   → Property details
├── GET  /api/saved-apartments → User's saved properties
├── POST /api/saved-apartments → Save a property
├── GET  /api/preferences      → User preferences
├── POST /api/preferences      → Update preferences
├── GET  /api/market-snapshots → Market data
└── POST /api/payments/create-checkout → Payment flow
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AUTHENTICATION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    User                    Frontend                   Backend
      │                        │                          │
      │  Enter credentials     │                          │
      │───────────────────────►│                          │
      │                        │  POST /api/auth/signin   │
      │                        │─────────────────────────►│
      │                        │                          │ Verify password
      │                        │                          │ (bcrypt)
      │                        │     { user, token }      │
      │                        │◄─────────────────────────│
      │                        │                          │
      │                        │ Store token in           │
      │                        │ localStorage             │
      │                        │                          │
      │  Redirect to Dashboard │                          │
      │◄───────────────────────│                          │
      │                        │                          │
      │                        │  GET /api/auth/me        │
      │                        │  Authorization: Bearer   │
      │                        │─────────────────────────►│
      │                        │                          │ Validate JWT
      │                        │     { user }             │
      │                        │◄─────────────────────────│
```

## Key Features by Page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            KEY FEATURES                                      │
└─────────────────────────────────────────────────────────────────────────────┘

DASHBOARD
├── Property search with filters (city, price, bedrooms)
├── AI-powered opportunity scores
├── Quick access to saved properties
└── Recent search history

PROPERTY DETAILS (/property/:id)
├── Full property information
├── Image gallery
├── AI analysis and predictions
├── Negotiation recommendations
├── Save to favorites
└── Generate offer button

MARKET INTELLIGENCE (/market-intel)
├── City/state market trends
├── Price analytics
├── Supply/demand indicators
├── Seasonal patterns
└── Investment insights

AI FORMULA (/ai-formula)
├── How the AI works explanation
├── Scoring methodology
├── Accuracy metrics
└── Feature importance

SAVED PROPERTIES (/saved-properties)
├── Favorites list
├── Notes and ratings
├── Compare properties
└── Export data

PROFILE (/profile)
├── Account settings
├── Email preferences
├── Notification settings
└── Points of interest (POIs)
```

## State Management

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STATE MANAGEMENT                                    │
└─────────────────────────────────────────────────────────────────────────────┘

React Query (Server State)
├── Properties list
├── Property details
├── Market data
└── User data

React Context (Client State)
├── UserProvider → Authentication state, user info
├── PropertyStateProvider → Selected property, favorites
└── OnboardingFlowProvider → Onboarding steps

Local State (useState)
├── Form inputs
├── UI toggles (modals, tabs)
├── Loading states
└── Error messages

localStorage
├── JWT token (auth-token)
└── User preferences cache
```

## File Structure

```
src/
├── App.tsx                 # Main app with routing
├── main.tsx               # Entry point
│
├── pages/                  # Page components
│   ├── Landing.tsx
│   ├── Auth.tsx
│   ├── Dashboard.tsx
│   ├── PropertyDetails.tsx
│   └── ...
│
├── components/             # Reusable components
│   ├── ui/                # Shadcn UI components
│   ├── modern/            # Custom modern components
│   ├── Header.tsx
│   ├── PropertyCard.tsx
│   └── ...
│
├── hooks/                  # Custom hooks
│   ├── useUser.tsx
│   ├── usePayment.ts
│   └── ...
│
├── contexts/               # React contexts
│   ├── PropertyState.ts
│   └── onboarding-flow-*.ts
│
├── lib/                    # Utilities
│   ├── api.ts             # API client
│   ├── queryClient.ts
│   └── design-system.ts
│
└── data/                   # Mock data & types
    ├── mockData.ts
    └── OfferFormTypes.ts
```

---
*Generated: February 2026*
*Stack: React 18 + Vite + TailwindCSS + Express + PostgreSQL*
