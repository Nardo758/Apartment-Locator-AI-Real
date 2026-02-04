# Apartment Locator AI - Route Inventory

**Last Updated:** 2024
**Application:** Apartment Locator AI
**Framework:** React Router v6

---

## Table of Contents
- [Overview](#overview)
- [User Types](#user-types)
- [Authentication System](#authentication-system)
- [Route Categories](#route-categories)
- [Complete Route Reference](#complete-route-reference)
- [Route Protection Status](#route-protection-status)
- [Recommendations](#recommendations)

---

## Overview

This document provides a comprehensive inventory of all routes in the Apartment Locator AI application. The application uses React Router for client-side routing and supports three primary user types: Renters, Landlords/Property Managers, and Agents/Brokers.

**Total Routes:** 39
**Protected Routes:** 0 (currently not implemented in routing)
**Public Routes:** 39

---

## User Types

The application supports three distinct user types, selected via the `/user-type` page:

| User Type | Description | Primary Dashboard | Key Features |
|-----------|-------------|-------------------|--------------|
| **Renter** | Individual looking for an apartment | `/dashboard` | Smart search, market intel, negotiation tools, saved searches |
| **Landlord/Property Manager** | Property owner or portfolio manager | `/portfolio-dashboard` | Portfolio management, competitive intelligence, renewal optimizer, email templates |
| **Agent/Broker** | Real estate agent or broker | `/agent-dashboard` | Client portfolio, lead capture, commission calculator, activity tracking |

---

## Authentication System

### Components
- **UserProvider** (`src/hooks/useUser.tsx`): Context provider managing authentication state
- **ProtectedRoute** (`src/components/ProtectedRoute.tsx`): HOC for route protection (defined but NOT currently used)

### Authentication Flow
1. User visits landing page (`/`)
2. Signs up via `/signup` or `/trial`
3. Authenticates via `/auth`
4. Selects user type via `/user-type`
5. Redirects to appropriate onboarding or dashboard

### Current Implementation Status
⚠️ **CRITICAL:** While a `ProtectedRoute` component exists, it is NOT applied to any routes in `App.tsx`. All routes are currently accessible without authentication.

---

## Route Categories

### 1. Public & Marketing Routes (7)
Landing pages, pricing, and informational content accessible to all visitors.

### 2. Authentication Routes (4)
User registration, login, and user type selection.

### 3. Dashboard & Core Features (5)
Main application functionality for renters.

### 4. Property & Offers Routes (3)
Property viewing and offer generation.

### 5. User Account Routes (4)
Profile management and data controls.

### 6. Support & Legal Routes (4)
Help documentation and legal pages.

### 7. Payment Routes (2)
Payment success and confirmation pages.

### 8. Landlord/Property Manager Routes (6)
Portfolio management and landlord-specific tools.

### 9. Agent/Broker Routes (3)
Agent dashboard and client management.

### 10. Admin Routes (1)
System administration.

---

## Complete Route Reference

### 1. Public & Marketing Routes

#### `/` - Landing Page
- **Component:** `LandingSSRSafe`
- **Purpose:** Main marketing landing page with SSR-safe rendering
- **Authentication:** None (Public)
- **User Type:** All
- **Key Features:**
  - Feature highlights
  - Hero section
  - Call-to-action buttons
  - Links to pricing and signup
- **Components Used:**
  - `Button`, `Link` from UI components
  - Icons from `lucide-react`
- **Navigation To:** `/signup`, `/pricing`, `/about`, `/auth`

---

#### `/about` - About Page
- **Component:** `About`
- **Purpose:** Information about the company and platform
- **Authentication:** None (Public)
- **User Type:** All
- **Key Features:**
  - Company information
  - Mission and values
  - Team details
- **Navigation From:** Landing page, header

---

#### `/pricing` - Renter Pricing
- **Component:** `Pricing`
- **Purpose:** Display pricing plans for renters
- **Authentication:** None (Public)
- **User Type:** Primarily Renters
- **Key Features:**
  - Subscription tiers
  - Feature comparison
  - Payment options
- **Related Routes:** `/landlord-pricing`, `/agent-pricing`

---

#### `/landlord-pricing` - Landlord Pricing
- **Component:** `LandlordPricing`
- **Purpose:** Display pricing plans for landlords and property managers
- **Authentication:** None (Public)
- **User Type:** Landlords/Property Managers
- **Key Features:**
  - Landlord-specific pricing tiers
  - Feature comparison
  - ROI calculator

---

#### `/agent-pricing` - Agent Pricing
- **Component:** `AgentPricing`
- **Purpose:** Display pricing plans for agents and brokers
- **Authentication:** None (Public)
- **User Type:** Agents/Brokers
- **Key Features:**
  - Agent-specific pricing tiers
  - Commission structure
  - Feature comparison

---

#### `/terms` - Terms of Service
- **Component:** `TermsOfService`
- **Purpose:** Legal terms and conditions
- **Authentication:** None (Public)
- **User Type:** All
- **Required For:** Legal compliance
- **Navigation From:** Footer, signup flow

---

#### `/privacy` - Privacy Policy
- **Component:** `PrivacyPolicy`
- **Purpose:** Privacy policy and data handling practices
- **Authentication:** None (Public)
- **User Type:** All
- **Required For:** Legal compliance
- **Navigation From:** Footer, signup flow

---

### 2. Authentication Routes

#### `/auth` - Authentication Page
- **Component:** `AuthModern`
- **Purpose:** Unified login/signup interface
- **Authentication:** None (Entry point for authentication)
- **User Type:** All
- **Key Features:**
  - Email/password login
  - Sign up form
  - Social authentication (potential)
- **Components Used:**
  - Form inputs
  - `useUser` hook for authentication
- **Navigation To:** `/user-type` (after successful auth), `/dashboard`

---

#### `/signup` - Sign Up Page
- **Component:** `Trial`
- **Purpose:** New user registration and trial signup
- **Authentication:** None (Registration flow)
- **User Type:** All
- **Key Features:**
  - Registration form
  - Trial account creation
  - Email validation
- **Navigation To:** `/user-type`, `/dashboard`

---

#### `/trial` - Trial Signup (Alias)
- **Component:** `Trial`
- **Purpose:** Same as `/signup`, alternative URL for trial sign-ups
- **Authentication:** None (Registration flow)
- **User Type:** All
- **Navigation To:** `/user-type`, `/dashboard`

---

#### `/user-type` - User Type Selection
- **Component:** `UserTypeSelection`
- **Purpose:** Allow new users to select their role (Renter, Landlord, Agent)
- **Authentication:** Recommended (should be protected)
- **User Type:** All (selection page)
- **Key Features:**
  - Three user type cards with descriptions
  - Feature lists per user type
  - LocalStorage persistence of selection
- **Navigation From:** `/auth`, `/signup`
- **Navigation To:**
  - Renter → `/program-ai`
  - Landlord → `/landlord-onboarding`
  - Agent → `/agent-onboarding`
- **Data Storage:** `localStorage.setItem('userType', selectedType)`

---

### 3. Dashboard & Core Features

#### `/dashboard` - Unified Dashboard
- **Component:** `UnifiedDashboard`
- **Purpose:** Main dashboard for renters with property search and market intelligence
- **Authentication:** Should be protected
- **User Type:** Renters
- **Key Features:**
  - Property listings in list/map view
  - Market intelligence bar
  - Left sidebar with lifestyle inputs
  - Interactive property map
  - Cost calculations
  - Property sorting and filtering
- **Components Used:**
  - `Header`
  - `MarketIntelBar`
  - `LeftPanelSidebar`
  - `InteractivePropertyMap`
  - Table components
- **Context Dependencies:**
  - `useLocationCostContext`
  - `useUser`
- **Mock Data:** Uses `MOCK_PROPERTIES` array

---

#### `/program-ai` - AI Programming Interface
- **Component:** `ProgramAIUnified`
- **Purpose:** AI-powered apartment search and preference configuration
- **Authentication:** Should be protected
- **User Type:** Renters
- **Key Features:**
  - Natural language search input
  - AI-powered recommendations
  - Preference learning
  - Search history
- **Context Dependencies:**
  - `UnifiedAIContext`

---

#### `/ai-formula` - AI Formula Configuration
- **Component:** `AIFormulaNew`
- **Purpose:** Configure AI search algorithm parameters and preferences
- **Authentication:** Should be protected
- **User Type:** Renters
- **Key Features:**
  - Custom weighting of search criteria
  - Algorithm fine-tuning
  - Preference visualization
- **Navigation From:** `/dashboard`, `/program-ai`

---

#### `/market-intel` - Market Intelligence
- **Component:** `MarketIntel`
- **Purpose:** Detailed market analysis and trends
- **Authentication:** Should be protected
- **User Type:** Renters, Landlords, Agents (all benefit from market data)
- **Key Features:**
  - Rent trends
  - Market comparisons
  - Neighborhood analytics
  - Rent vs. buy analysis
- **Components Used:**
  - Charts and graphs
  - Market data visualizations

---

#### `/saved-properties` - Saved Properties and Offers
- **Component:** `SavedAndOffers`
- **Purpose:** View saved properties and active offers
- **Authentication:** Should be protected
- **User Type:** Renters
- **Key Features:**
  - Saved property list
  - Active offers status
  - Property comparison
  - Quick actions
- **Navigation From:** Dashboard, Header

---

### 4. Property & Offers Routes

#### `/property/:id` - Property Details
- **Component:** `PropertyDetails`
- **Purpose:** Detailed view of a specific property
- **Authentication:** Should be protected
- **User Type:** Renters, Agents
- **URL Parameters:**
  - `:id` - Property ID
- **Key Features:**
  - Property photos
  - Amenities list
  - Location map
  - Cost breakdown
  - Similar properties
  - Save/favorite option
  - Generate offer button
- **Navigation To:** `/generate-offer`
- **Navigation From:** `/dashboard`, `/saved-properties`

---

#### `/generate-offer` - Generate Offer
- **Component:** `GenerateOffer`
- **Purpose:** Create and submit rental offers with AI assistance
- **Authentication:** Should be protected
- **User Type:** Renters
- **Key Features:**
  - AI-powered offer generation
  - Market comparison data
  - Negotiation suggestions
  - Custom terms
  - Offer submission
- **Navigation From:** `/property/:id`
- **Navigation To:** `/offers-made`

---

#### `/offers-made` - Offers Made
- **Component:** `OffersMade`
- **Purpose:** Track submitted offers and their status
- **Authentication:** Should be protected
- **User Type:** Renters
- **Key Features:**
  - Offer history
  - Status tracking
  - Response notifications
  - Offer analytics
- **Navigation From:** Header, `/generate-offer`

---

### 5. User Account Routes

#### `/profile` - User Profile
- **Component:** `Profile`
- **Purpose:** Manage user profile and preferences
- **Authentication:** Should be protected
- **User Type:** All
- **Key Features:**
  - Profile information editing
  - Preference settings
  - Notification preferences
  - Account details
- **Navigation From:** Header dropdown, Settings

---

#### `/billing` - Billing & Subscription
- **Component:** `Billing`
- **Purpose:** Manage subscription and payment methods
- **Authentication:** Should be protected
- **User Type:** All
- **Key Features:**
  - Current subscription status
  - Payment method management
  - Billing history
  - Plan upgrade/downgrade
  - Invoice download
- **Navigation From:** Header, Profile
- **Navigation To:** `/pricing`

---

#### `/data-export` - Data Export
- **Component:** `DataExport`
- **Purpose:** Export user data and search history
- **Authentication:** Should be protected
- **User Type:** All
- **Key Features:**
  - GDPR compliance
  - Data download options
  - Export format selection
  - Export history
- **Compliance:** GDPR, CCPA

---

#### `/data-management` - Data Management
- **Component:** `DataManagement`
- **Purpose:** Manage stored data and privacy settings
- **Authentication:** Should be protected
- **User Type:** All
- **Key Features:**
  - Data viewing
  - Data deletion
  - Privacy controls
  - Cookie preferences
- **Compliance:** GDPR, CCPA
- **Navigation From:** Profile, Settings

---

### 6. Support & Legal Routes

#### `/help` - Help Center
- **Component:** `Help`
- **Purpose:** User documentation and help resources
- **Authentication:** None (Public)
- **User Type:** All
- **Key Features:**
  - FAQ
  - Tutorials
  - Video guides
  - Search functionality
- **Navigation From:** Header, Footer

---

#### `/contact` - Contact Support
- **Component:** `Contact`
- **Purpose:** Contact form for support inquiries
- **Authentication:** None (Public, but enhanced for authenticated users)
- **User Type:** All
- **Key Features:**
  - Contact form
  - Support ticket creation
  - Email integration
  - Response tracking (for authenticated users)
- **Navigation From:** Header, Footer, Help

---

### 7. Payment Routes

#### `/payment-success` - Payment Success
- **Component:** `PaymentSuccess`
- **Purpose:** Confirmation page after successful payment
- **Authentication:** Should be protected
- **User Type:** All (post-payment)
- **Key Features:**
  - Payment confirmation
  - Receipt details
  - Next steps
  - Email confirmation notice
- **Navigation From:** External payment processor
- **Navigation To:** `/dashboard`, `/profile`

---

#### `/success` - General Success Page
- **Component:** `Success`
- **Purpose:** Generic success confirmation (registration, actions, etc.)
- **Authentication:** Varies by context
- **User Type:** All
- **Key Features:**
  - Success message
  - Next action suggestions
  - Navigation options
- **Navigation From:** Various flows

---

### 8. Landlord/Property Manager Routes

#### `/landlord-onboarding` - Landlord Onboarding
- **Component:** `LandlordOnboarding`
- **Purpose:** Onboarding flow for new landlord users
- **Authentication:** Should be protected
- **User Type:** Landlords/Property Managers
- **Key Features:**
  - Portfolio setup wizard
  - Property addition
  - Pricing configuration
  - Market setup
- **Navigation From:** `/user-type` (when landlord selected)
- **Navigation To:** `/portfolio-dashboard`

---

#### `/portfolio-dashboard` - Portfolio Dashboard
- **Component:** `PortfolioDashboard`
- **Purpose:** Main dashboard for landlords to manage property portfolio
- **Authentication:** Should be protected
- **User Type:** Landlords/Property Managers
- **Key Features:**
  - Property list with vacancy risk indicators
  - Market comparison per property
  - Competitor concessions tracking
  - Performance metrics
  - Pricing recommendations
  - Quick actions (add property, filter, download, settings)
- **Components Used:**
  - `PropertyCard`
  - `MarketComparisonWidget`
- **Mock Data:** `mockProperties` array
- **Navigation To:** `/email-templates`, `/renewal-optimizer`, `/verify-lease`

---

#### `/email-templates` - Email Templates
- **Component:** `EmailTemplates`
- **Purpose:** Manage and customize tenant communication templates
- **Authentication:** Should be protected
- **User Type:** Landlords/Property Managers
- **Key Features:**
  - Pre-built email templates
  - Template customization
  - Merge fields
  - Template categories (renewal, maintenance, payment, etc.)
- **Navigation From:** `/portfolio-dashboard`

---

#### `/renewal-optimizer` - Renewal Optimizer
- **Component:** `RenewalOptimizer`
- **Purpose:** AI-powered lease renewal optimization
- **Authentication:** Should be protected
- **User Type:** Landlords/Property Managers
- **Key Features:**
  - Renewal probability scoring
  - Pricing recommendations
  - Market comparison
  - Tenant retention strategies
  - ROI calculator
- **Navigation From:** `/portfolio-dashboard`

---

#### `/verify-lease` - Lease Verification
- **Component:** `LeaseVerification`
- **Purpose:** Verify and validate lease documents
- **Authentication:** Should be protected
- **User Type:** Landlords/Property Managers, possibly Renters
- **Key Features:**
  - Lease document upload
  - AI-powered verification
  - Compliance checking
  - Document storage
- **Navigation From:** `/portfolio-dashboard`, potentially `/property/:id`

---

### 9. Agent/Broker Routes

#### `/agent-onboarding` - Agent Onboarding
- **Component:** `AgentOnboarding`
- **Purpose:** Onboarding flow for new agent/broker users
- **Authentication:** Should be protected
- **User Type:** Agents/Brokers
- **Key Features:**
  - License verification
  - Brokerage information
  - Service area setup
  - Commission structure configuration
- **Navigation From:** `/user-type` (when agent selected)
- **Navigation To:** `/agent-dashboard`

---

#### `/agent-dashboard` - Agent Dashboard
- **Component:** `AgentDashboard`
- **Purpose:** Main dashboard for agents to manage clients and deals
- **Authentication:** Should be protected
- **User Type:** Agents/Brokers
- **Key Features:**
  - Client portfolio overview
  - Active deals tracking
  - Commission tracking
  - Lead capture
  - Performance metrics
  - Recent activity feed
- **Components Used:**
  - `LeadCaptureForm`
  - `ClientPortfolio`
  - `CommissionCalculator`
- **Tabs:**
  - Overview
  - Clients
  - Lead Capture
  - Calculator
  - Reports
- **Mock Data:** Stats object with client and commission data
- **Navigation From:** Header (for agents)

---

### 10. Admin Routes

#### `/admin` - Admin Dashboard
- **Component:** `Admin`
- **Purpose:** System administration and monitoring
- **Authentication:** Should be protected + Admin role required
- **User Type:** Administrators only
- **Key Features:**
  - System status monitoring
  - Database connection testing
  - User management
  - Configuration settings
  - Activity logs
- **Components Used:**
  - `TestConnection`
  - `Card`, `Tabs` components
- **Tabs:**
  - System Status
  - Monitoring
  - Settings
- **Security:** ⚠️ Currently no role-based access control implemented

---

### 11. Error Routes

#### `*` - 404 Not Found
- **Component:** `NotFound`
- **Purpose:** Catch-all for undefined routes
- **Authentication:** None
- **User Type:** All
- **Key Features:**
  - 404 error message
  - Navigation suggestions
  - Link to home
- **Trigger:** Any undefined route path

---

## Route Protection Status

### Current Implementation
❌ **No routes are currently protected** despite the existence of a `ProtectedRoute` component.

### Protected Route Component
Location: `src/components/ProtectedRoute.tsx`

**Features:**
- Checks `isAuthenticated` from `useUser` hook
- Shows loading spinner during authentication check
- Redirects to `/auth` if not authenticated
- Preserves intended destination in location state

**Example Usage (NOT currently implemented):**
```tsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <UnifiedDashboard />
  </ProtectedRoute>
} />
```

---

## Recommendations

### 🔴 Critical Priority

#### 1. Implement Route Protection
Apply `ProtectedRoute` wrapper to all authenticated routes:

**Routes requiring protection:**
- All dashboard routes (`/dashboard`, `/program-ai`, `/ai-formula`, `/market-intel`)
- Property routes (`/property/:id`, `/generate-offer`, `/offers-made`, `/saved-properties`)
- Account routes (`/profile`, `/billing`, `/data-export`, `/data-management`)
- Landlord routes (`/portfolio-dashboard`, `/email-templates`, `/renewal-optimizer`, `/verify-lease`)
- Agent routes (`/agent-dashboard`)
- Payment success pages (`/payment-success`)
- Onboarding routes (`/landlord-onboarding`, `/agent-onboarding`, `/user-type`)

#### 2. Implement Role-Based Access Control (RBAC)
Create user type/role checking for type-specific routes:

**Needed:**
- `RequireUserType` component or HOC
- User type stored in database, not just localStorage
- Validation on both client and server side

**Example implementation:**
```tsx
<Route path="/portfolio-dashboard" element={
  <ProtectedRoute>
    <RequireUserType types={['landlord']}>
      <PortfolioDashboard />
    </RequireUserType>
  </ProtectedRoute>
} />
```

#### 3. Admin Route Protection
Implement admin role checking:
- Add `isAdmin` or `role` field to User type
- Create `RequireAdmin` component
- Apply to `/admin` route

### 🟡 High Priority

#### 4. Improve Authentication Flow
- Persist user type to database, not localStorage
- Add email verification step
- Implement password reset flow
- Add "Remember me" functionality

#### 5. Add Route Guards
Create specific guard components:
- `RequireOnboarding` - Ensure user completed onboarding
- `RequireSubscription` - Check active subscription for premium features
- `RequireEmailVerified` - Ensure email is verified

#### 6. Enhance Navigation
- Add breadcrumbs to complex pages
- Implement back button handling
- Add route-specific loading states

### 🟢 Medium Priority

#### 7. Add Route Metadata
Implement route metadata for:
- Page titles (SEO)
- Meta descriptions
- Open Graph tags
- Analytics tracking

#### 8. Implement Route Transitions
- Add page transition animations
- Loading states between route changes
- Progress indicators for multi-step flows

#### 9. Create Route Constants
Centralize route paths in a constants file:
```typescript
// routes.ts
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROPERTY_DETAILS: (id: string) => `/property/${id}`,
  // ... etc
}
```

### 🔵 Low Priority

#### 10. Add Route Analytics
- Track route navigation
- Monitor most visited pages
- Identify drop-off points in onboarding

#### 11. Implement Deep Linking
- Support deep linking for mobile apps
- Handle social media sharing links
- Email link handling

---

## Context Providers Hierarchy

The application wraps routes in multiple context providers (from outer to inner):

1. `QueryClientProvider` - React Query for data fetching
2. `UserProvider` - Authentication state
3. `UnifiedAIProvider` - AI functionality
4. `LocationCostProvider` - Location-based cost calculations
5. `PropertyStateProvider` - Property state management
6. `TooltipProvider` - UI tooltips
7. `BrowserRouter` - React Router
8. `OnboardingFlowProvider` - Onboarding flow state

---

## API Integration Notes

### Current State
Most routes use mock data and are ready for API integration.

### Routes with Mock Data:
- `/dashboard` - `MOCK_PROPERTIES`, `MOCK_MARKET_DATA`
- `/portfolio-dashboard` - `mockProperties`
- `/agent-dashboard` - Stats object

### API Endpoints Needed:
- User authentication (`/api/auth/*`)
- Property listings (`/api/properties`)
- Market intelligence (`/api/market-intel`)
- User profile (`/api/user`)
- Offers (`/api/offers`)
- Landlord portfolio (`/api/landlord/properties`)
- Agent clients (`/api/agent/clients`)

---

## Testing Checklist

### Route Testing
- [ ] All routes render without errors
- [ ] 404 page displays for invalid routes
- [ ] Protected routes redirect when not authenticated
- [ ] User type restrictions work correctly
- [ ] Admin routes require admin role
- [ ] Deep links work correctly
- [ ] Browser back/forward buttons work
- [ ] Page refresh maintains state
- [ ] Mobile responsive on all routes

### Authentication Flow Testing
- [ ] Login redirects to intended page
- [ ] Logout clears state and redirects
- [ ] Token expiration handling
- [ ] Concurrent login handling
- [ ] Session persistence

---

## File Locations

- **Router Configuration:** `/src/App.tsx`
- **Protected Route Component:** `/src/components/ProtectedRoute.tsx`
- **User Context:** `/src/hooks/useUser.tsx`
- **Route Components:** `/src/pages/*`

---

## Version History

- **v1.0** - Initial route inventory (current)
  - 39 total routes documented
  - Authentication system analyzed
  - Route protection recommendations provided

---

## Notes

- Routes are defined using React Router v6 syntax
- No route lazy loading currently implemented (could improve performance)
- No route preloading implemented
- Some routes may benefit from code splitting
- Consider implementing Suspense boundaries for better loading UX

---

**Document Maintained By:** AI Development Team  
**Review Frequency:** Update when routes are added, modified, or removed  
**Related Documents:** `ARCHITECTURE.md`, `API.md`, `AUTHENTICATION.md`
