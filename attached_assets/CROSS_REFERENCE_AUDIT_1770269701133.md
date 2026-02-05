# ApartmentIQ — Cross-Reference Audit
## Current Codebase vs. Proposed Spec

**Date:** February 5, 2026  
**Sources:** GitHub repo (Nardo758/Apartment-Locator-AI-Real), past conversation history, uploaded screenshot

---

## CRITICAL CORRECTION: Renter Flow

**My proposal was wrong on the renter flow.** I proposed a traditional sign-up-first funnel:

> ❌ My proposal: Landing → Sign-Up → Free search with limited analyses → Hit limit → Pricing modal → Pay

**Your actual design (correct):**

> ✅ Your design: Landing → Search for free (no account needed) → See listings with blurred/locked savings → Pay to unlock results

This is a fundamentally better conversion strategy. The user gets to *experience the product* before you ask for anything. They see apartments, they see the leverage scores teased, they see "$180–420/month savings potential" blurred — and *then* they're motivated to pay. No sign-up gate between them and value discovery.

---

## 1. RENTER FLOW — Side by Side

| Aspect | Current Build | My Proposal | Correct Action |
|--------|--------------|-------------|----------------|
| **Entry** | Free search, no sign-up required | Sign-up required before search | **KEEP CURRENT** — free search is the hook |
| **What free users see** | Listings with leverage scores, blurred savings, "🔒 Premium" locks | Similar concept but behind sign-up wall | **KEEP CURRENT** — zero-friction discovery |
| **Paywall trigger** | User clicks to unlock specific apartment's savings/tactics | After X queries or time limit | **KEEP CURRENT** — intent-based conversion (they want THIS apartment's data) is higher-converting than arbitrary limits |
| **Payment model** | One-time: $9.99/7d, $29.99/30d, $99.99/90d | Same pricing ✅ | **KEEP** — matches time-bound apartment search |
| **When account created** | During/after payment (email collected inline) | Before seeing any results | **KEEP CURRENT** — account creation is part of purchase, not a gate |
| **Trial system** | 3 queries / 72 hours with progressive upgrade prompts | I proposed sign-up → limited free tier | **KEEP CURRENT** trial mechanics but clarify: is the trial pre-payment or post-signup? |
| **Post-payment** | Full access: exact savings, negotiation tactics, landlord contact info, timing strategies | Same ✅ | **ALIGNED** |

### What my spec got wrong (to fix):

1. **Remove the `/signup/renter` form as a gate.** Renters should land on search immediately. Account creation happens at payment.
2. **Remove "Get Started Free" CTA leading to sign-up.** Instead it should go directly to `/apartments` (search page).
3. **The renter pricing tiers stay as one-time payments** — this was correct in both versions.

### What my spec got right (to keep):

1. Landing page renter card copy improvements (leverage scores, hidden fees)
2. The progressive data collection idea (budget/beds during search, income via Plaid later)
3. Renter route structure post-payment (`/apartments`, `/apartments/:id`, `/saved`, `/offers`)

### Updated Renter Flow Diagram

```
                    ┌──────────────┐
                    │ Landing Page │
                    └──────┬───────┘
                           │ "Get Started Free"
                    ┌──────▼───────┐
                    │ Apartment    │  ← NO sign-up, NO account
                    │ Search Page  │    Search, filter, browse freely
                    └──────┬───────┘
                           │ 
                    ┌──────▼───────┐
                    │ Listings     │  ← Leverage scores visible
                    │ with Teasers │    Savings ranges shown but blurred
                    │              │    "🔒 Unlock savings" on each card
                    └──────┬───────┘
                           │ Clicks "Unlock" on a listing
                    ┌──────▼───────┐
                    │ Pricing      │  ← $9.99 / $29.99 / $99.99
                    │ Modal/Page   │    Email collected inline
                    │              │    Stripe checkout
                    └──────┬───────┘
                           │ Payment succeeds
                    ┌──────▼───────┐
                    │ Full Access  │  ← Account auto-created
                    │ Unlocked     │    Exact savings, tactics, contacts
                    │ Discovery    │    Can now save searches, track offers
                    └──────────────┘
```

---

## 2. LANDING PAGE — Side by Side

| Aspect | Current Build (from screenshot) | My Proposal | Correct Action |
|--------|-------------------------------|-------------|----------------|
| **Section heading** | "Solutions for Everyone in Real Estate" | "Built for Every Side of the Rental Market" | **USE PROPOSAL** — more specific to rental |
| **Renter card title** | "For Renters" | Same ✅ | No change |
| **Renter description** | "Find your perfect home with AI-powered search and negotiation tools" | "...AI-powered search and built-in negotiation leverage" | **MINOR** — either works |
| **Renter bullet 1** | "Smart apartment recommendations" | Same ✅ | No change |
| **Renter bullet 2** | "Market intelligence & negotiation leverage" | "Negotiation leverage scores for every listing" | **USE PROPOSAL** — more specific |
| **Renter bullet 3** | "True cost analysis (commute + lifestyle)" | "True cost analysis (commute + lifestyle + hidden fees)" | **USE PROPOSAL** — "hidden fees" is a pain point |
| **Renter bullet 4** | "Save searches & track offers" | Same ✅ | No change |
| **Renter CTA** | "Get Started Free" | Same, but linked to `/signup?type=renter` | **FIX:** Should link to `/apartments` (free search page), NOT signup |
| | | | |
| **Landlord card title** | "For Landlords" | Same ✅ | No change |
| **Landlord description** | "Optimize your portfolio and reduce vacancies with market intelligence" | "Reduce vacancy, retain tenants, and stop losing money to turnover" | **USE PROPOSAL** — aligns with retention reframe |
| **Landlord bullet 1** | "Portfolio dashboard & analytics" | "Retention risk scores for every unit" | **USE PROPOSAL** — specific value prop |
| **Landlord bullet 2** | "Competitive intelligence alerts" | "Vacancy cost calculator with action recommendations" | **USE PROPOSAL** — removes competitive framing |
| **Landlord bullet 3** | "Renewal optimizer to reduce turnover" | "Renewal deadline tracking & alerts" | **EITHER** — current is fine conceptually, proposal is more concrete |
| **Landlord bullet 4** | "Pre-built email templates" | "Market context — see what renters actually want nearby" | **USE PROPOSAL** — unique differentiator; email templates is a commodity feature |
| **Landlord CTA** | "View Pricing" | "View Plans" → `/landlord/pricing` | **ALIGNED** — minor copy preference |
| | | | |
| **Agent card title** | "For Agents & Brokers" | Same ✅ | No change |
| **Agent description** | "Manage clients and close more deals with powerful broker tools" | "...with AI-powered market intelligence" | **MINOR** — proposal is slightly better (AI angle) |
| **Agent bullet 1** | "Client portfolio management" | Same ✅ | No change |
| **Agent bullet 2** | "Lead capture & tracking system" | "Lead capture & matching system" | **USE PROPOSAL** — "matching" implies intelligence |
| **Agent bullet 3** | "Commission calculator & reports" | Same ✅ | No change |
| **Agent bullet 4** | "Activity tracking dashboard" | "Market insights to advise clients better" | **USE PROPOSAL** — value-oriented vs. feature-oriented |
| **Agent CTA** | "View Pricing" | "View Plans" → `/agent/pricing` | **ALIGNED** |

---

## 3. LANDLORD PRICING — Side by Side

| Aspect | Current Build | My Proposal | Correct Action |
|--------|--------------|-------------|----------------|
| **Pricing model** | Not yet built (v1 dashboard was competitive-intel focused, no separate pricing page visible) | Monthly subscription: $19/$49/$99 by unit count | **USE PROPOSAL** — needs to be built from scratch per v2 reframe |
| **Tier logic** | N/A | Scaled by unit count (5/20/100) | **USE PROPOSAL** — matches small landlord mental model |
| **Trial** | N/A | 14-day free trial, no credit card | **USE PROPOSAL** |
| **ROI anchor** | N/A | "One vacancy costs $4,200. This is $19." | **USE PROPOSAL** — critical for conversion |

### What already exists in repo for landlords:

From the repo file listing, there's substantial landlord infrastructure already built:
- `LANDLORD_COMPONENTS_COMPLETED.md` — landlord UI components exist
- `LANDLORD_DASHBOARD_REDESIGN.md` — dashboard spec (v1, now superseded by our v2)
- `LANDLORD_PORTFOLIO_IMPLEMENTATION.md` — portfolio management
- `COMPETITION_SETS_*` — competition sets UI (v1, to be replaced by Nearby Market Context)
- `LANDLORD_API_GAP_ANALYSIS.md` — API gaps identified
- `LANDLORD_DB_IMPLEMENTATION_SUMMARY.md` — database tables exist
- `PRICING_ALERTS_*` — alert system partially built
- `ALERTS_SETTINGS_IMPLEMENTATION.md` — alert settings UI

### Key landlord changes needed:

1. **Replace** competition sets UI → Nearby Market Context (auto-populated)
2. **Replace** leverage scores → retention risk scores (same algo, inverted)
3. **Add** Vacancy Cost Calculator (new feature)
4. **Add** landlord pricing page (doesn't exist yet)
5. **Add** landlord onboarding wizard (doesn't exist yet)
6. **Reframe** all landlord copy from competitive intelligence → retention intelligence
7. **Keep** existing portfolio management, alert infrastructure, database tables (modify fields)

---

## 4. ROUTES — Side by Side

### Current API Routes (from README):

```
POST /api/auth/signup          — Single sign-up endpoint (no user type branching)
POST /api/auth/signin          — Single sign-in
GET  /api/auth/me              — Get current user
GET  /api/properties           — Search properties
GET  /api/saved-apartments/:userId
POST /api/saved-apartments/:userId
GET  /api/preferences/:userId
POST /api/preferences/:userId
GET  /api/market-snapshots/:city/:state
```

Plus (inferred from repo docs): Agent APIs, Lead APIs, Client Management APIs, Deal Pipeline APIs, Landlord APIs, Commission Analytics APIs.

### Current Frontend Routes (inferred from `PROTECTED_ROUTES.md`):

Based on repo file names and past conversations, likely routes include:
- `/` — Landing page
- `/signup` or `/register` — Sign-up (single form, no type branching)
- `/login` — Login
- `/apartments` or `/dashboard` — Renter apartment discovery
- `/pricing` — Renter pricing
- Some landlord routes (likely `/landlord/dashboard` or similar)
- Agent routes (likely `/agent/dashboard` or similar)

### My Proposed Routes vs. What Needs to Change:

| Route | Current (likely) | My Proposal | Correct Action |
|-------|-----------------|-------------|----------------|
| `/` | Landing page | Same ✅ | No change |
| `/apartments` | Requires auth? | Free search, no auth | **FIX** — must be accessible without login |
| `/signup` | Single form | Type branching (`?type=renter/landlord/agent`) | **PARTIALLY USE** — but renters don't go here first |
| `/login` | Exists | Same ✅ | Keep |
| `/pricing` | Renter pricing (one-time tiers) | Redirect to `/signup` | **DON'T REDIRECT** — keep as renter pricing page |
| `/landlord/pricing` | Doesn't exist | Monthly subscription tiers | **BUILD** |
| `/agent/pricing` | Doesn't exist | Monthly subscription tiers | **BUILD** |
| `/landlord/dashboard` | Exists (v1 competitive intel) | Retention dashboard (v2) | **REBUILD** per retention reframe |
| `/landlord/onboarding` | Doesn't exist | Onboarding wizard | **BUILD** |
| `/agent/dashboard` | Likely exists | Same ✅ | Keep, refine |

### Auth & Route Protection Changes:

| Concern | Current | Needed |
|---------|---------|--------|
| `/apartments` access | Likely requires auth | Must be **PUBLIC** (free search) |
| Apartment detail/savings | Behind paywall | Keep paywall — but trigger is per-listing unlock, not auth gate |
| Landlord routes | Protected | Keep protected — landlords must sign up + subscribe |
| Agent routes | Protected | Keep protected — agents must sign up + subscribe |
| User type on sign-up | Single `POST /api/auth/signup` | Add `user_type` field to sign-up payload |

---

## 5. SIGN-UP DATA — Side by Side

### Current Sign-Up (from README):

`POST /api/auth/signup` — likely collects email + password (standard JWT auth). Based on past conversations, user table has evolved over time with various fields but the core sign-up is minimal.

### My Proposal vs. What Actually Needs to Happen:

#### Renters:

| My Proposal | Reality Check | Correct Action |
|-------------|--------------|----------------|
| Sign-up form with email, password, name, search city | Renters don't sign up first — they search free | **No renter sign-up form.** Account created at payment. Collect email + name during Stripe checkout. |
| Progressive data collection | Good idea ✅ | Keep — budget/beds from search filters, income via Plaid later |

#### Landlords:

| My Proposal | Reality Check | Correct Action |
|-------------|--------------|----------------|
| Email, password, name, phone, primary market, unit count | Reasonable for landlords who need a dashboard | **USE PROPOSAL** — landlords need accounts to manage portfolios |
| Onboarding wizard (add properties → add units → alert prefs) | Doesn't exist currently | **BUILD** — dashboard is useless without unit data |
| 14-day free trial, no credit card | Not currently implemented | **BUILD** with Stripe trial period |

#### Agents:

| My Proposal | Reality Check | Correct Action |
|-------------|--------------|----------------|
| Email, password, name, phone, brokerage, license#, market, role | Agent tools already built with APIs | **USE PROPOSAL** — but verify against existing agent schema |
| Agent onboarding | Not clearly built | **BUILD** — lighter than landlord onboarding |

---

## 6. DATABASE SCHEMA — What Exists vs. What's Needed

### Current Schema (from README — Drizzle ORM, PostgreSQL):

The repo has `shared/schema.ts` with Drizzle definitions. Based on past conversations and repo docs, tables likely include:

```
users              — id, email, password_hash, (maybe user_type?)
properties         — listings data
saved_apartments   — user_id, property_id
preferences        — user_id, preferences JSON
market_snapshots   — city, state, data
```

Plus landlord tables (from `LANDLORD_DB_IMPLEMENTATION_SUMMARY.md`):
```
landlord_properties     — landlord's owned properties
competition_sets        — v1 competitor groupings (TO BE REMOVED)
pricing_alerts          — price change alerts
```

Plus agent tables (from various AGENT_* docs):
```
agent_clients          — client portfolio
leads                  — lead tracking
deals / deal_pipeline  — deal tracking
commissions            — commission analytics
```

### What My Proposal Adds/Changes:

| Table | Status | Action |
|-------|--------|--------|
| `users` — add `user_type` column | May already have it, may not | **VERIFY** — if not, add `user_type ENUM('renter','landlord','agent')` |
| `users` — add landlord fields (`unit_count_range`, etc.) | Probably not there | **ADD** to users or create `landlord_profiles` table |
| `users` — add agent fields (`brokerage`, `license_number`, etc.) | May partially exist in agent tables | **VERIFY** against existing agent schema |
| `users` — add subscription fields (`plan_id`, `plan_status`, `stripe_*`) | `.env.stripe.example` exists — partial Stripe integration? | **VERIFY** — extend if partial |
| `competition_sets` | EXISTS (v1) | **DEPRECATE** — replaced by auto-populated nearby market context |
| `retention_alerts` | Doesn't exist | **CREATE** (replaces/supplements `pricing_alerts`) |
| `landlord_properties` — add retention fields | Exists | **ALTER** — add `retention_risk_score`, `lease_expiry_date`, `days_vacant` |

---

## 7. WHAT'S ALREADY BUILT (KEEP) vs. REBUILD vs. BUILD NEW

### ✅ KEEP AS-IS

| Component | Reason |
|-----------|--------|
| Renter free search → paywall flow | Core product loop, working correctly |
| Renter one-time payment tiers ($9.99/$29.99/$99.99) | Proven pricing model |
| JWT authentication system | Works fine, just needs `user_type` awareness |
| Property search API (`GET /api/properties`) | Core functionality |
| Saved apartments API | Keep for renter flow |
| Market snapshots API | Keep for both renter and landlord context |
| Agent client management API + UI | Already built per AGENT_* docs |
| Agent lead management | Already built |
| Agent deal pipeline | Already built |
| Agent commission analytics | Already built |
| Pricing alerts infrastructure | Reusable for retention alerts |
| Stripe integration (partial) | Extend, don't rebuild |

### 🔄 REBUILD / REFRAME

| Component | What Changes |
|-----------|-------------|
| Landing page "Solutions" section | Landlord card copy rewrite (retention framing) |
| Landlord dashboard UI | v1 competitive intel → v2 retention intelligence |
| Competition sets UI | Replace with Nearby Market Context (simpler, auto-populated) |
| Landlord "leverage score" | Invert to "retention risk score" (same algo) |
| Alert copy/framing | "Competitor dropped price" → "Your vacancy is costing $X/week" |
| Sign-up endpoint | Add `user_type` to payload + branched sign-up forms |
| Auth guard / route protection | Add user-type-aware routing |

### 🆕 BUILD NEW

| Component | Priority |
|-----------|----------|
| **Landlord pricing page** (`/landlord/pricing`) | HIGH — no landlord monetization exists |
| **Landlord onboarding wizard** (`/landlord/onboarding`) | HIGH — dashboard is useless without unit data |
| **Vacancy Cost Calculator** | HIGH — core v2 differentiator |
| **Retention Risk Score display** | HIGH — replaces leverage score for landlords |
| **Agent pricing page** (`/agent/pricing`) | MEDIUM — agents are v2 feature |
| **User type selector** on `/signup` | MEDIUM — branched sign-up |
| **Landlord subscription billing** (Stripe monthly) | HIGH — new revenue stream |
| **Post-login redirect logic** (type-aware) | MEDIUM — route users to correct dashboard |

---

## 8. SUMMARY OF CORRECTIONS TO MY SPEC

| Item | What I Got Wrong | Corrected Version |
|------|-----------------|-------------------|
| **Renter entry point** | Proposed sign-up as first step | Free search is first step — no account needed |
| **Renter CTA** | "Get Started Free" → `/signup?type=renter` | "Get Started Free" → `/apartments` (search page) |
| **Renter account creation** | Separate sign-up form before search | Account auto-created during payment (email captured at Stripe checkout) |
| **`/apartments` route** | Protected (auth required) | **PUBLIC** — anyone can search |
| **Renter trial limits** | 3 queries / 72 hours from sign-up | Unlimited browsing; paywall is on unlocking specific listing's savings/tactics |
| **Proposed `/signup/renter`** | Full sign-up form | Not needed — renter "sign-up" happens at payment |
| **Renter flow in route map** | `AuthGuard allowedTypes={['renter']}` on `/apartments` | `/apartments` is PUBLIC; only `/saved` and `/offers` need auth |

### What I got right (no changes needed):

- Landlord pricing tiers ($19/$49/$99 monthly by unit count)
- Landlord onboarding wizard concept
- Landlord retention reframe (entire v2 spec)
- Agent sign-up data collection
- Route structure for landlord/agent (protected)
- Database schema additions
- Progressive data collection philosophy
- Landing page copy improvements
- ROI anchor on landlord pricing

---

## 9. REVISED ROUTE MAP (CORRECTED)

```typescript
function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/apartments" element={<ApartmentDiscoveryPage />} />  {/* FREE — no auth */}
        <Route path="/apartments/:id" element={<ApartmentDetailPage />} />  {/* FREE browse, paywall on unlock */}
        <Route path="/pricing" element={<RenterPricingPage />} />  {/* Renter one-time tiers */}
        <Route path="/landlord/pricing" element={<LandlordPricingPage />} />  {/* NEW */}
        <Route path="/agent/pricing" element={<AgentPricingPage />} />  {/* NEW */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpRouter />} />  {/* Type branching — landlord/agent only */}
        
        {/* ===== RENTER ROUTES (auth = paid user) ===== */}
        <Route element={<AuthGuard allowedTypes={['renter']} />}>
          <Route path="/saved" element={<SavedSearchesPage />} />
          <Route path="/offers" element={<OfferTrackingPage />} />
        </Route>
        
        {/* ===== LANDLORD ROUTES ===== */}
        <Route element={<AuthGuard allowedTypes={['landlord']} />}>
          <Route path="/landlord/dashboard" element={<LandlordRetentionDashboard />} />
          <Route path="/landlord/units/:id" element={<UnitDetailPage />} />
          <Route path="/landlord/onboarding" element={<LandlordOnboarding />} />  {/* NEW */}
          <Route path="/landlord/settings" element={<LandlordSettingsPage />} />
        </Route>
        
        {/* ===== AGENT ROUTES ===== */}
        <Route element={<AuthGuard allowedTypes={['agent']} />}>
          <Route path="/agent/dashboard" element={<AgentDashboard />} />
          <Route path="/agent/clients" element={<ClientPortfolioPage />} />
          <Route path="/agent/settings" element={<AgentSettingsPage />} />
        </Route>
        
        {/* ===== SHARED AUTH ROUTES ===== */}
        <Route element={<AuthGuard />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/billing" element={<BillingPage />} />
        </Route>
        
        {/* ===== PAYMENT CALLBACKS ===== */}
        <Route path="/purchase-success" element={<PurchaseSuccessPage />} />
        <Route path="/purchase-cancel" element={<PurchaseCancelPage />} />
        
        {/* ===== LEGACY REDIRECTS ===== */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/trial" element={<Navigate to="/apartments" replace />} />
        <Route path="/register" element={<Navigate to="/signup" replace />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Key difference from my original:** `/apartments` and `/apartments/:id` are now PUBLIC routes. The paywall lives *inside* the apartment detail page (unlock button per listing), not at the route level.
