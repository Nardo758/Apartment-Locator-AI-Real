# Apartment Locator AI - Features Inventory by User Type

**Last Updated:** February 4, 2026  
**Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Shared Features (All User Types)](#shared-features-all-user-types)
3. [Renter Features](#renter-features)
4. [Landlord/Property Manager Features](#landlordproperty-manager-features)
5. [Agent/Broker Features](#agentbroker-features)
6. [Admin Features](#admin-features)
7. [Technical Components](#technical-components)

---

## Overview

Apartment Locator AI is a multi-sided platform serving three distinct user types with specialized features for each:

- **Renters** - Find apartments, negotiate better deals, and calculate true living costs
- **Landlords/Property Managers** - Optimize pricing, monitor competition, manage portfolios
- **Agents/Brokers** - Manage clients, capture leads, calculate commissions

---

## Shared Features (All User Types)

### Authentication & Onboarding
**Pages:**
- `/auth` - Authentication (AuthModern.tsx)
- `/signup` - Trial signup
- `/trial` - Trial experience with limited searches
- `/user-type` - User type selection (Renter/Landlord/Agent)

**Components:**
- JWT-based authentication with bcrypt password hashing
- Trial system with usage tracking
- Auto-upgrade modals and triggers
- User type selection wizard

### Core Navigation
**Components:**
- Header.tsx - Global navigation with user menu
- AppFooter.tsx - Footer with links
- Breadcrumb.tsx - Navigation breadcrumbs
- ProtectedRoute.tsx - Route protection

### Account Management
**Pages:**
- `/profile` - User profile and settings (Profile.tsx)
- `/billing` - Subscription and payment management (Billing.tsx)
- `/payment-success` - Payment confirmation (PaymentSuccess.tsx)
- `/success` - General success page
- `/data-export` - Export user data (DataExport.tsx)
- `/data-management` - Manage user data (DataManagement.tsx)

**Features:**
- Profile editing (location, bio, employment info)
- Financial verification fields (income, employment, credit score)
- Plaid integration for bank verification
- Subscription status display
- Payment history
- Data export (JSON/CSV)
- GDPR compliance tools

### Help & Legal
**Pages:**
- `/about` - About page with platform features (About.tsx)
- `/help` - Help documentation (Help.tsx)
- `/contact` - Contact form (Contact.tsx)
- `/terms` - Terms of Service (TermsOfService.tsx)
- `/privacy` - Privacy Policy (PrivacyPolicy.tsx)

### Pricing & Plans
**Pages:**
- `/pricing` - General pricing page (Pricing.tsx)
  - Basic Plan ($9.99) - 7 days, 5 AI analyses
  - Pro Plan ($29.99) - 30 days, unlimited analyses
  - Premium Plan ($99.99) - 90 days, white-glove service

**Components:**
- PricingCard.tsx - Individual pricing card display
- PricingBreakdown.tsx - Detailed pricing breakdown
- SubscriptionStatus.tsx - Current subscription display
- PaywallModal.tsx - Upgrade prompts
- GuestCheckoutModal.tsx - Guest purchase flow

---

## Renter Features

### Primary Dashboard
**Page:** `/dashboard` (UnifiedDashboard.tsx)

**Core Features:**
- **Interactive Map** (InteractivePropertyMap.tsx)
  - Google Maps integration
  - Property markers with clustering
  - POI markers (17+ categories)
  - Real-time location search
  - Hover tooltips with property preview
  
- **Market Intelligence Bar** (MarketIntelBar.tsx)
  - Median rent display
  - Rent change percentage
  - Days on market average
  - Inventory level
  - Leverage score (renter negotiation power)
  - AI recommendation

- **Left Panel Sidebar** (LeftPanelSidebar.tsx)
  - Location search and filters
  - Budget range sliders
  - Bedroom/bathroom filters
  - Points of Interest (POI) management
  - Lifestyle cost inputs
  - Amenity filters
  - Cost category customization

- **View Modes:**
  - Map view with property markers
  - List view with sortable cards
  - Grid view for compact display

- **Sorting Options:**
  - Sort by True Cost (lowest to highest)
  - Sort by Base Rent
  - Sort by Commute Time
  - Sort by Smart Score

### True Cost Calculation
**Components:**
- TrueCostCard.tsx - Visual cost breakdown card
- TrueCostBadge.tsx - Badge display of true cost
- CostComparisonTable.tsx - Compare costs across properties
- LocationCostWidget.tsx - Widget for cost display

**Cost Categories:**
1. **Base Rent** - Listed monthly rent
2. **Parking** - If not included
3. **Commute Costs:**
   - Driving: Gas costs (distance × days × MPG × gas price)
   - Transit: Monthly pass cost
   - Time value: Commute time × hourly rate
4. **Grocery Costs:**
   - Distance to preferred store
   - Trip frequency × cost per trip
5. **Gym/Fitness:**
   - Membership cost (if not included)
   - Visit frequency × cost
6. **Custom Categories** (user-defined):
   - Daycare/Childcare
   - School
   - Medical/Doctor
   - Pet Services
   - Religious Services
   - Dining/Restaurants
   - Nightlife/Bars
   - Entertainment
   - Library
   - Coworking
   - Parks/Recreation
   - Beach/Waterfront
   - Coffee Shops
   - Any custom category

### Points of Interest (POI) System
**Component:** POIStep.tsx (in wizard)

**17+ POI Categories:**
| Category | Color | Icon | Use Case |
|----------|-------|------|----------|
| Work | Red | Briefcase | Daily commute |
| Gym | Blue | Dumbbell | Fitness routine |
| Grocery | Green | Shopping Cart | Weekly shopping |
| Daycare | Pink | Baby | Childcare |
| School | Yellow | Graduation Cap | Education |
| Medical | Teal | Stethoscope | Healthcare |
| Pet Services | Orange | Dog | Pet care |
| Religious | Purple | Church | Worship |
| Dining | Amber | Utensils | Restaurants |
| Nightlife | Indigo | Beer | Social life |
| Entertainment | Fuchsia | Music | Events/Shows |
| Library | Cyan | Book | Reading/Study |
| Coworking | Slate | Building | Remote work |
| Park | Emerald | Tree | Recreation |
| Beach | Sky | Waves | Waterfront |
| Coffee | Stone | Coffee | Coffee shops |
| Other | Gray | Map Pin | Custom |

**Features:**
- Add multiple POIs per category
- Assign priority (High/Medium/Low)
- Set visit frequency
- Calculate distance from properties
- Visual map markers

### Property Search & Discovery
**Page:** `/dashboard` (UnifiedDashboard.tsx)

**Search Features:**
- Location-based search (city, zip code, address)
- Price range filters (min/max)
- Bedroom/bathroom filters
- Amenity filters (pool, gym, parking, pets, etc.)
- Move-in date preferences
- Lease term preferences

**Property Display:**
- CompactPropertyCard.tsx - Compact card view
- ModernApartmentCard.tsx - Modern design card
- ReferencePropertyCard.tsx - Reference comparison

**Property Information:**
- Property name and address
- Base rent and true monthly cost
- Square footage
- Bedrooms/bathrooms
- Floor plan
- Amenities list
- Photos/gallery
- Days on market
- Availability status

### Property Details
**Page:** `/property/:id` (PropertyDetails.tsx)

**Detailed Information:**
- Photo gallery with navigation
- Full property description
- Detailed amenity list
- Location map with nearby POIs
- Price history
- Days on market
- Contact information

**AI Analysis Section:**
- Opportunity score (0-100)
- Success rate prediction
- Tier classification (Gold/Silver/Bronze)
- AI recommendation text
- Negotiation potential score

**Action Buttons:**
- Save property (favorite)
- Generate offer
- Share property
- Contact landlord
- Schedule viewing

### Renter Intelligence Dashboard
**Page:** `/renter-intelligence` (RenterIntelligence.tsx)

**Components:**
- RenterDashboard.tsx - Main intelligence dashboard
- RenterUnitCard.tsx - Unit card with AI insights

**Intelligence Features:**
1. **ApartmentIQ Analysis:**
   - Urgency score (1-10)
   - Negotiation potential (1-10)
   - Lease probability (0-100%)
   - Market velocity (hot/normal/slow/stale)
   - Days on market tracking
   - Concession urgency (desperate/aggressive/standard/none)

2. **Market Position:**
   - Percentile rank in market
   - Rent trend (increasing/stable/decreasing)
   - Rent change percentage
   - Concession trend tracking
   - Market position (above/at/below market)

3. **Scoring Breakdown:**
   - Amenity score (0-100)
   - Location score (0-100)
   - Management score (0-100)
   - Overall Smart Score

4. **Concession Intelligence:**
   - Current concessions offered
   - Concession value ($)
   - Concession type (free rent, fee waiver, reduced deposit)
   - Effective rent calculation
   - Historical concession tracking

5. **Recommendations:**
   - Optimal offer amount
   - Best negotiation strategy
   - Timing recommendations
   - Success probability

### AI-Powered Features

#### AI Formula
**Page:** `/ai-formula` (AIFormulaNew.tsx)

**Features:**
- Explanation of AI scoring algorithm
- Transparency in AI decision-making
- Factor weighting visualization
- Example calculations
- Confidence score display

#### Program AI (Setup Wizard)
**Page:** `/program-ai` (ProgramAIUnified.tsx)

**Wizard Steps:**
1. **Basic Search** (BasicSearchStep.tsx)
   - Location input
   - Budget range
   - Bedroom/bathroom preferences
   - Move-in timeline

2. **Points of Interest** (POIStep.tsx)
   - Add work location
   - Add frequently visited places
   - Set priorities and frequencies

3. **Lifestyle Costs** (LifestyleStep.tsx)
   - Commute preferences (days/week)
   - Vehicle MPG or transit pass
   - Grocery shopping habits
   - Gym/fitness routine
   - Custom cost categories

4. **Market Intelligence** (MarketIntelStep.tsx)
   - Annual income
   - Current savings
   - Investment time horizon
   - Risk tolerance

5. **Preferences** (PreferencesStep.tsx)
   - Must-have amenities
   - Deal breakers
   - Additional notes
   - Move-in preferences

6. **Completion** (CompletionScreen.tsx)
   - Setup summary
   - Profile completion percentage
   - Dashboard redirect

**Progress Tracking:**
- StepIndicator.tsx - Visual progress
- SetupProgressBar.tsx - Completion percentage
- ProfileSummaryCard.tsx - Profile overview

### Market Intelligence
**Page:** `/market-intel` (MarketIntel.tsx)

**Market Metrics:**
- Median rent by city
- Rent change trends
- Days on market average
- Inventory levels
- Leverage score (renter vs landlord power)
- Market velocity indicators

**Rent vs Buy Analysis:**
- Property value input
- Down payment calculator
- Mortgage payment estimation
- Rent vs buy comparison
- Break-even point calculation
- 5/10/15/20 year projections
- Opportunity cost analysis
- Tax implications

**City Comparisons:**
- Austin, TX
- Dallas, TX
- Houston, TX
- Custom city addition

**Intelligence Components:**
- LeverageScoreCard.tsx - Negotiation power display
- OwnershipAnalysisCard.tsx - Buy vs rent analysis
- InsightsList.tsx - Market insights list

### Location Intelligence
**Page:** `/location-intelligence` (LocationIntelligence.tsx)

**Features:**
- Comprehensive location cost analysis
- Multi-property comparison
- Distance calculations from all POIs
- True cost ranking
- Savings potential identification
- Lifestyle cost breakdown
- Best deal identification

**Components:**
- LifestyleInputsForm.tsx - Lifestyle input form
- LocationCostContext.tsx - Cost calculation context
- LocationCostWidget.tsx - Cost display widget

### Offer Generation & Negotiation
**Page:** `/generate-offer` (GenerateOffer.tsx)

**Offer Form Fields:**
1. **Basic Information:**
   - Email address
   - Move-in date
   - Lease term (months)
   - Monthly budget
   - Security deposit offer

2. **Important Terms:**
   - Pet policy preferences
   - Utilities (who pays)
   - Parking needs
   - Trash/recycling

3. **Lease Incentives:**
   - First month free request
   - Reduced deposit request
   - Application fee waiver request
   - Other concessions

4. **Qualifications:**
   - Monthly income
   - Credit score
   - Employment history
   - Rental history

**AI Features:**
- Smart offer amount suggestion
- Success probability prediction
- Comparable properties analysis
- Market-based recommendations
- Negotiation talking points
- Email template generation

**Validation:**
- Email format validation
- Date validation
- Budget range checks (100-50,000)
- Credit score validation (300-850)
- Lease term validation (1-36 months)

### Offer Tracking
**Pages:**
- `/offers-made` (OffersMade.tsx)
- `/saved-properties` (SavedAndOffers.tsx - combined view)

**Offer Management:**
- View all submitted offers
- Track offer status (pending/accepted/declined/countered)
- See landlord responses
- Counter-offer tracking
- Next step recommendations
- Email communication history
- Success rate by property type

**Saved Properties:**
- Grid or list view
- Property cards with key details
- True cost display
- Smart Score display
- Personal notes
- Save date tracking
- Quick offer generation
- Remove from saved list

### Offer Heatmap
**Page:** `/offer-heatmap` (OfferHeatmap.tsx)

**Features:**
- Zip code success rate visualization
- Color-coded map (green = high success, red = low success)
- Zip code statistics:
  - Total offers made
  - Success rate percentage
  - Average rent
  - Average savings
  - Median days to accept
- Top performing zip codes list
- City filtering
- Price range filtering
- Bedroom filtering
- Interactive map with clickable zones
- Detailed stats on zip selection

**Heatmap Components:**
- HeatmapMap.tsx - Interactive map component
- ZipCodeStats.tsx - Statistics display

**Use Cases:**
- Identify best negotiation areas
- Target high-success neighborhoods
- Avoid difficult landlord zones
- Plan apartment search strategy

### Competitive Intelligence (Renter View)
**Page:** `/competitive-intelligence` (CompetitiveIntelligence.tsx)

**Renter Features:**
- See competing properties in area
- Identify concessions at nearby properties
- Leverage competitor data in negotiation
- Price comparison tools
- Best deal identification

### Lease Verification
**Page:** `/verify-lease` (LeaseVerification.tsx)

**Purpose:** Post-negotiation success verification and refund system

**Features:**
1. **Lease Upload:**
   - PDF/image upload
   - Document verification
   - OCR text extraction

2. **Verification Details:**
   - Property name
   - Final rent amount
   - Lease signed date
   - Move-in date
   - Landlord information

3. **Savings Calculation:**
   - Compare predicted vs actual savings
   - Calculate monthly savings
   - Calculate annual savings
   - Refund tier determination

4. **Refund Tiers:**
   - **Gold Tier:** $100+ monthly savings = 50% refund ($25)
   - **Silver Tier:** $50-99 monthly savings = 30% refund ($15)
   - **Bronze Tier:** $1-49 monthly savings = 20% refund ($10)
   - **Bonus Tier:** Exact prediction match = 10% refund ($5)

5. **Success Tracking:**
   - Add to success statistics
   - Update user achievement badges
   - Contribute to AI model training

### Free Tools (No Login Required)
**Page:** `/` (Landing page) or dedicated component

**Components:**
- FreeSavingsCalculator.tsx - Estimate potential savings

**Features:**
- Quick savings estimate
- Current rent input
- Market comparison
- Concession probability
- Lead capture for trial signup

---

## Landlord/Property Manager Features

### Onboarding
**Pages:**
- `/landlord-onboarding` (LandlordOnboarding.tsx)
- `/landlord-pricing` (LandlordPricing.tsx)

**Onboarding Steps:**
- Property portfolio setup
- Market area selection
- Competitive monitoring preferences
- Alert configuration
- Payment plan selection

**Pricing Tiers:**
- **Starter:** Small portfolio (1-5 units)
- **Professional:** Medium portfolio (6-25 units)
- **Enterprise:** Large portfolio (26+ units)

### Portfolio Dashboard
**Page:** `/portfolio-dashboard` (PortfolioDashboard.tsx)

**Overview Metrics:**
- Total properties count
- Total units count
- Currently vacant units
- Average occupancy rate
- Monthly revenue
- At-risk properties (high vacancy risk)
- Portfolio-wide statistics

**Property Management:**
- Add new property
- Edit property details
- View property performance
- Bulk operations
- Property grouping (by city, type, etc.)
- Export portfolio data

**Property Cards:**
- PropertyCard.tsx (landlord version)
- Shows current rent
- Market average rent comparison
- Vacancy risk indicator
- Days vacant
- Competitor concessions
- AI recommendations

**Vacancy Risk Indicators:**
- **High Risk:** Red badge, immediate action needed
- **Medium Risk:** Yellow badge, monitor closely
- **Low Risk:** Green badge, performing well

**AI Recommendations:**
- Price adjustment suggestions
- Concession recommendations
- Market positioning advice
- Revenue optimization tips

### Competitive Intelligence (Landlord)
**Page:** `/competitive-intelligence` (CompetitiveIntelligence.tsx)

**Alert System:**
- AlertCard.tsx - Real-time competitor alerts

**Alert Types:**
1. **Price Drop Alerts:**
   - Competitor property name
   - Old vs new price
   - Percentage decrease
   - Affected properties in portfolio
   - Revenue risk calculation
   - Recommended actions

2. **Concession Alerts:**
   - Concession type (free rent, deposit waiver, etc.)
   - Concession value
   - Competitor property details
   - Market impact analysis
   - Counter-strategy recommendations

3. **New Competitor Alerts:**
   - New property in market
   - Property details
   - Pricing strategy
   - Amenity comparison
   - Competitive threat level

4. **Market Shift Alerts:**
   - Vacancy rate changes
   - Median rent changes
   - Inventory level changes
   - Seasonal trends

**Alert Management:**
- Filter by severity (critical/high/medium/low)
- Filter by alert type
- Mark as read/unread
- Archive alerts
- Alert history
- Batch actions

**Competitor Activity Feed:**
- CompetitorActivityFeed.tsx
- Real-time updates
- Property additions
- Price changes
- Concession updates
- Market trends

**Impact Analysis:**
- ImpactAnalysis.tsx
- Revenue risk calculation
- Affected properties list
- Probability of tenant loss
- Recommended response timeline
- ROI of different strategies

### Renewal Optimizer
**Page:** `/renewal-optimizer` (RenewalOptimizer.tsx)

**Tenant Management:**
- Tenant list with lease expiration tracking
- Filter by time frame (30/60/90 days, all)
- Sort by expiration date
- Tenant communication history

**Tenant Profile:**
- Name and contact information
- Current property and unit
- Current rent
- Lease start and end dates
- Days until lease expiration
- Time in unit (months)
- Payment history percentage
- Renewal status tracking

**Renewal Intelligence:**
- Market average rent comparison
- Recommended renewal rent
- Success probability (AI-powered)
- Incentive suggestions
- Turnover cost calculation
- Revenue optimization

**Renewal Status Tracking:**
- **Pending:** Renewal not yet sent
- **Sent:** Offer sent, awaiting response
- **Negotiating:** In negotiation phase
- **Accepted:** Tenant renewed
- **Declined:** Tenant not renewing

**Communication Tools:**
- Send renewal offers
- Email template integration
- Track communication dates
- Follow-up reminders
- Bulk renewal sending

**Financial Analysis:**
- Compare rent increase vs vacancy cost
- Calculate turnover expenses
- ROI of incentives
- Break-even analysis
- Occupancy cost modeling

### Email Templates
**Page:** `/email-templates` (EmailTemplates.tsx)

**Template Categories:**
1. **Renewal Templates:**
   - Standard renewal offer
   - Renewal with incentive
   - Urgent renewal (lease expiring soon)
   - Rent increase notification
   - Renewal reminder

2. **Offer Response Templates:**
   - Accept offer
   - Decline offer politely
   - Counter-offer
   - Request more information

3. **Follow-up Templates:**
   - Post-viewing follow-up
   - Application status update
   - Decision deadline reminder
   - Thank you for interest

4. **Maintenance Templates:**
   - Maintenance notification
   - Work order completion
   - Scheduled maintenance reminder

**Template Features:**
- Custom variable support:
  - {{tenant_name}}
  - {{property_address}}
  - {{lease_end}}
  - {{offered_rent}}
  - {{response_deadline}}
  - {{incentive_description}}
  - {{landlord_name}}
  - {{management_company}}
- Preview before sending
- Success rate tracking per template
- Usage statistics
- Copy to clipboard
- Edit templates
- Create custom templates
- Delete templates
- Search templates

**Template Manager:**
- Create new templates
- Organize by category
- Track usage count
- Monitor success rates
- A/B test templates
- Version history

### Market Comparison Widget
**Component:** MarketComparisonWidget.tsx

**Features:**
- Your property vs market comparison
- Rent positioning visualization
- Amenity comparison
- Occupancy rate comparison
- Days on market comparison
- Competitive insights

### Data & Reporting
**Features:**
- Portfolio performance reports
- Vacancy reports
- Revenue analysis
- Market trend reports
- Competitive analysis reports
- Export to CSV/PDF
- Scheduled report delivery
- Custom report builder

---

## Agent/Broker Features

### Onboarding
**Pages:**
- `/agent-onboarding` (AgentOnboarding.tsx)
- `/agent-pricing` (AgentPricing.tsx)

**Onboarding Steps:**
- Brokerage information
- License verification
- Commission structure setup
- Service area definition
- Marketing preferences

**Pricing Tiers:**
- **Solo Agent:** Individual agents
- **Team:** Small teams (2-5 agents)
- **Brokerage:** Full brokerage access

### Agent Dashboard
**Page:** `/agent-dashboard` (AgentDashboard.tsx)

**Dashboard Tabs:**
1. **Overview**
2. **Clients**
3. **Lead Capture**
4. **Calculator**
5. **Reports**

**Overview Statistics:**
- Total clients
- Active deals
- Monthly commissions earned
- Projected revenue
- This month's leads
- Conversion rate
- Average commission per deal
- Next move-in date

**Key Metrics:**
- Client acquisition rate
- Deal close rate
- Average days to close
- Revenue per client
- Commission trends

**Activity Feed:**
- New lead notifications
- Offer submissions
- Viewing schedules
- Lease signings
- Commission payments
- Client milestones

**Upcoming Tasks:**
- Follow-ups scheduled
- Property viewings
- Report deadlines
- Client meetings
- Priority indicators (high/medium/low)
- Due date tracking

### Client Portfolio Management
**Component:** ClientPortfolio.tsx

**Client Management:**
- Add new clients
- Client profile cards
- Search and filter clients
- Client status tracking
- Quick contact access

**Client Profiles:**
- Name and contact information
- Budget and preferences
- Move-in timeline
- Current search status
- Number of viewings scheduled
- Properties shown
- Offers submitted
- Communication history
- Important notes

**Client Status:**
- **Searching:** Actively looking
- **Viewing:** Scheduling viewings
- **Offer:** Made an offer
- **Pending:** Awaiting landlord response
- **Signed:** Lease signed
- **Inactive:** Paused search

**Client Actions:**
- Schedule viewing
- Send properties
- Generate offer
- Update status
- Add notes
- Set reminders
- Archive client

### Lead Capture System
**Component:** LeadCaptureForm.tsx

**Lead Form Fields:**
- Name
- Email
- Phone number
- Budget range
- Bedrooms needed
- Desired location
- Move-in timeline
- How they heard about you
- Additional notes

**Lead Qualification:**
- Auto-scoring based on inputs
- Priority ranking
- Budget qualification
- Timeline urgency
- Contact preference
- Lead source tracking

**Lead Management:**
- New lead notifications
- Lead assignment (team)
- Follow-up reminders
- Lead status tracking
- Conversion tracking
- Lead source analytics

**Lead Nurturing:**
- Automated follow-up emails
- Property recommendations
- Market updates
- Educational content
- Re-engagement campaigns

### Commission Calculator
**Component:** CommissionCalculator.tsx

**Calculator Features:**
1. **Input Fields:**
   - Annual rent amount
   - Commission percentage
   - Fee split with brokerage
   - Closing costs
   - Marketing expenses
   - Other deductions

2. **Calculations:**
   - Gross commission
   - Brokerage split
   - Net commission (your take)
   - Monthly equivalent
   - Annual earnings projection

3. **Scenarios:**
   - Compare different commission rates
   - Calculate team splits
   - Factor in expenses
   - Break-even analysis
   - Goal tracking

4. **Deal Tracking:**
   - Save calculated deals
   - Track expected commissions
   - Monitor payment status
   - Historical commission data
   - Tax estimates

**Reporting:**
- Monthly commission summary
- Year-to-date earnings
- Commission by client
- Commission by property type
- Commission trends
- Export for accounting

### Agent Tools

**Property Matching:**
- Access to full renter property database
- Advanced filtering for client needs
- Save properties per client
- Create property showing lists
- Share properties with clients

**Showing Management:**
- Schedule viewings
- Viewing calendar
- Client reminders
- Property owner coordination
- Route optimization for multiple showings
- Check-in/out tracking

**Offer Management:**
- Generate offers on behalf of clients
- Track multiple offers per client
- Monitor offer status
- Facilitate negotiations
- Document storage

**Reports & Analytics:**
- Client pipeline report
- Commission forecast
- Lead source ROI
- Conversion funnel analysis
- Market opportunity reports
- Performance benchmarking

### Marketing Tools

**Branding:**
- Custom agent profile
- Bio and credentials
- Service area map
- Client testimonials
- Success stories

**Lead Generation:**
- Landing page creation
- Lead capture forms
- Email marketing integration
- Social media sharing
- Referral tracking

**Client Communication:**
- Automated email campaigns
- Property alert emails
- Newsletter templates
- SMS messaging
- Appointment reminders

---

## Admin Features

**Page:** `/admin` (Admin.tsx)

**Admin Dashboard:**
- User management
- Property management
- System monitoring
- Analytics overview
- Content moderation

**User Management:**
- View all users
- User activity logs
- Subscription management
- Ban/suspend users
- User support tickets
- Impersonate users (for support)

**Property Management:**
- Approve/reject listings
- Edit property details
- Bulk import properties
- Property verification
- Remove spam listings
- Featured listings management

**System Analytics:**
- User growth metrics
- Revenue analytics
- Feature usage statistics
- Search analytics
- Conversion tracking
- Performance monitoring

**Content Management:**
- Edit marketing pages
- Manage blog posts
- Update help documentation
- Email template editing
- Announcement system

**Platform Settings:**
- Feature flags
- System configuration
- API rate limits
- Payment gateway settings
- Email service configuration
- Map API settings

---

## Technical Components

### AI & Intelligence Services

**apartmentiq-ai.ts:**
- ApartmentIQAI class
- Opportunity scoring algorithm
- Success rate prediction
- Negotiation potential calculation
- Market velocity analysis
- Concession urgency detection
- Tier classification (Gold/Silver/Bronze)
- Confidence score generation

**pricing-engine.ts:**
- Dynamic pricing calculations
- Market position analysis
- Rent trend analysis
- Effective rent calculations
- Percentile ranking
- Smart Score generation
- Amenity/location/management scoring

**renter-intelligence.ts:**
- Renter-specific intelligence
- Leverage score calculation
- Best deal identification
- Negotiation strategy generation
- Market timing recommendations

**unified-rental-intelligence.ts:**
- Comprehensive market analysis
- Rent vs buy intelligence
- Break-even calculations
- Investment analysis
- Opportunity cost modeling

**rent-vs-buy-analysis.ts:**
- RentVsBuyAnalyzer class
- Property value calculations
- Mortgage estimation
- Tax implications
- Appreciation modeling
- Time horizon analysis
- Risk assessment

### Location & Cost Services

**locationCostService.ts:**
- calculateApartmentCosts() - Calculate true monthly costs
- createComparison() - Compare multiple properties
- formatCurrency() - Consistent currency formatting
- Distance calculations
- Route time estimation
- Gas cost calculations
- Transit cost calculations

**LocationCostContext.tsx:**
- Global cost calculation state
- User lifestyle inputs
- Gas price data
- POI management
- Cost category configuration

### Data Services

**apartment-scraper-api.ts:**
- External property data integration
- Web scraping services
- Data normalization
- Property enrichment

**redfin-scraper.ts:**
- Redfin data integration
- Property market data
- Historical pricing
- Neighborhood statistics

**api.ts:**
- RESTful API client
- Authentication handling
- Request/response interceptors
- Error handling

**data-tracker.ts:**
- User behavior analytics
- Event tracking
- Conversion tracking
- A/B test implementation

### Analytics & Monitoring

**analytics-architecture-audit.ts:**
- AlgorithmAnalyticsTracker class
- Feature usage tracking
- Performance monitoring
- AI model metrics
- User interaction logging
- Success rate tracking

### UI Components Library

**Modern Design System (components/modern/):**
- ModernPageLayout.tsx - Page layout wrapper
- ModernCard.tsx - Card component
- ModernButton.tsx - Button variations
- ModernLoading.tsx - Loading states
- ModernApartmentCard.tsx - Property card
- CompactPropertyCard.tsx - Compact card view
- ReferencePropertyCard.tsx - Reference card
- GradientSection.tsx - Gradient backgrounds
- AnimatedMetrics.tsx - Animated statistics

**Apartment Components (components/apartment/):**
- SmartScoreCard.tsx - Score visualization
- ConcessionBadge.tsx - Concession display

**UI Components (components/ui/):**
- All Shadcn/UI components
- Button, Input, Card, Badge, etc.
- Dialog, Popover, Select, Alert
- Tabs, Progress, Slider, etc.

### Design System

**design-system.ts:**
- Color palette definitions
- Typography scales
- Spacing system
- Animation presets
- Layout grids
- Button styles
- Card styles
- Consistent design tokens

### Maps Integration

**components/maps/:**
- InteractivePropertyMap.tsx - Main map component
- Google Maps API integration
- Marker clustering
- Custom markers for POIs
- Info windows
- Route visualization
- Distance calculations

**PropertyMap.tsx:**
- Simple property map display
- Single location focus
- Nearby amenities

### State Management

**Contexts:**
- PropertyStateProvider - Property selection and favorites
- OnboardingFlowProvider - Onboarding wizard state
- UserProvider - User authentication state
- LocationCostProvider - Cost calculation state
- UnifiedAIProvider - AI preferences and inputs

**Types:**
- locationCost.types.ts - Location cost interfaces
- unifiedAI.types.ts - AI-related types
- Property types, Offer types, User types

### Database Integration

**Supabase:**
- supabase/client.ts - Supabase client setup
- Real-time subscriptions
- Authentication
- Database queries
- Storage for documents/images

**Tables:**
- users - User accounts
- properties - Property listings
- saved_apartments - Saved properties
- offers - Offer tracking
- user_preferences - User settings
- market_snapshots - Market data
- user_pois - Points of interest
- email_templates - Template storage
- client_portfolio - Agent clients
- lead_captures - Agent leads

### Form Management

**Forms:**
- React Hook Form integration
- Zod validation schemas
- Form components with validation
- Error handling
- Field validation rules
- Custom validators

### Payment Integration

**Stripe:**
- PaymentButton.tsx
- Checkout session creation
- Subscription management
- Refund processing (lease verification)
- Payment webhooks
- Invoice generation

### Utility Services

**utils.ts:**
- Common utility functions
- Date formatting
- String manipulation
- Validation helpers

**queryClient.ts:**
- TanStack Query setup
- Cache configuration
- Query defaults
- Mutation handling

### Data & Mock Services

**mockData.ts:**
- Mock property data
- Mock user data
- Development data

**mockApartments.ts:**
- Mock apartment listings
- Filter functions
- Sort functions

**mockHeatmapData.ts:**
- Mock heatmap data
- Zip code statistics
- Success rate data

---

## Feature Access Matrix

| Feature | Renter | Landlord | Agent | Admin |
|---------|--------|----------|-------|-------|
| Property Search | ✅ | ❌ | ✅ | ✅ |
| True Cost Calculator | ✅ | ❌ | ✅ | ✅ |
| Save Properties | ✅ | ❌ | ✅ | ✅ |
| Generate Offers | ✅ | ❌ | ✅ | ❌ |
| Renter Intelligence | ✅ | ❌ | ✅ | ✅ |
| Offer Heatmap | ✅ | ❌ | ✅ | ✅ |
| Market Intelligence | ✅ | ✅ | ✅ | ✅ |
| Location Intelligence | ✅ | ❌ | ✅ | ✅ |
| AI Formula | ✅ | ❌ | ✅ | ✅ |
| Portfolio Dashboard | ❌ | ✅ | ❌ | ✅ |
| Competitive Intel | ✅ | ✅ | ❌ | ✅ |
| Renewal Optimizer | ❌ | ✅ | ❌ | ✅ |
| Email Templates | ❌ | ✅ | ✅ | ✅ |
| Agent Dashboard | ❌ | ❌ | ✅ | ✅ |
| Lead Capture | ❌ | ❌ | ✅ | ✅ |
| Client Portfolio | ❌ | ❌ | ✅ | ✅ |
| Commission Calculator | ❌ | ❌ | ✅ | ✅ |
| Admin Panel | ❌ | ❌ | ❌ | ✅ |

---

## Routes Summary

### Public Routes
- `/` - Landing page
- `/about` - About page
- `/pricing` - Pricing page
- `/contact` - Contact page
- `/help` - Help documentation
- `/terms` - Terms of Service
- `/privacy` - Privacy Policy

### Authentication Routes
- `/auth` - Sign in/Sign up
- `/signup` - Trial signup
- `/trial` - Trial experience
- `/user-type` - User type selection

### Renter Routes
- `/dashboard` - Unified dashboard (main)
- `/program-ai` - AI setup wizard
- `/ai-formula` - AI explanation
- `/market-intel` - Market intelligence
- `/location-intelligence` - Location analysis
- `/property/:id` - Property details
- `/generate-offer` - Create offer
- `/offers-made` - Track offers
- `/saved-properties` - Saved listings
- `/renter-intelligence` - Renter intelligence
- `/offer-heatmap` - Success heatmap
- `/verify-lease` - Lease verification

### Landlord Routes
- `/landlord-onboarding` - Onboarding
- `/landlord-pricing` - Pricing page
- `/portfolio-dashboard` - Portfolio management
- `/competitive-intelligence` - Competition monitoring
- `/renewal-optimizer` - Lease renewals
- `/email-templates` - Email management

### Agent Routes
- `/agent-onboarding` - Onboarding
- `/agent-pricing` - Pricing page
- `/agent-dashboard` - Agent dashboard

### Account Routes
- `/profile` - User profile
- `/billing` - Billing & subscription
- `/data-export` - Export data
- `/data-management` - Manage data
- `/payment-success` - Payment confirmation
- `/success` - Success page

### Admin Routes
- `/admin` - Admin dashboard

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/signup` - Register
- `POST /api/auth/signin` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Properties
- `GET /api/properties` - Search properties
- `GET /api/properties/:id` - Get property
- `POST /api/properties` - Create property (admin/landlord)
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Saved Properties
- `GET /api/saved-apartments` - Get saved
- `POST /api/saved-apartments` - Save property
- `DELETE /api/saved-apartments/:id` - Remove saved

### Offers
- `GET /api/offers` - Get user offers
- `POST /api/offers` - Submit offer
- `PUT /api/offers/:id` - Update offer
- `DELETE /api/offers/:id` - Delete offer

### User Data
- `GET /api/preferences` - Get preferences
- `POST /api/preferences` - Update preferences
- `GET /api/pois` - Get POIs
- `POST /api/pois` - Add POI
- `DELETE /api/pois/:id` - Remove POI

### Market Data
- `GET /api/market-snapshots/:city/:state` - Get market data
- `POST /api/market-snapshots` - Create snapshot

### Landlord
- `GET /api/portfolio` - Get portfolio
- `POST /api/portfolio/property` - Add property
- `GET /api/competitive-alerts` - Get alerts
- `GET /api/renewal-candidates` - Get renewal list
- `POST /api/renewal-offers` - Send renewal

### Agent
- `GET /api/clients` - Get clients
- `POST /api/clients` - Add client
- `GET /api/leads` - Get leads
- `POST /api/leads` - Capture lead
- `GET /api/commissions` - Get commission data

### Payments
- `POST /api/payments/create-checkout` - Create checkout
- `POST /api/payments/webhook` - Stripe webhook
- `GET /api/payments/history` - Payment history

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/analytics` - Get analytics
- `POST /api/admin/feature-flags` - Update features

---

## Integration Points

### External Services
1. **Google Maps API**
   - Interactive maps
   - Geocoding
   - Distance calculations
   - Route planning

2. **Stripe**
   - Payment processing
   - Subscription management
   - Refunds
   - Invoicing

3. **Plaid** (Financial Verification)
   - Bank account verification
   - Income verification
   - Balance checks

4. **Email Service** (SendGrid/SES)
   - Transactional emails
   - Marketing emails
   - Email templates
   - Delivery tracking

5. **SMS Service** (Twilio)
   - SMS notifications
   - Verification codes
   - Appointment reminders

6. **Property Data APIs**
   - Zillow/Redfin data
   - Market statistics
   - Property enrichment
   - Historical data

7. **Analytics**
   - Google Analytics
   - Mixpanel
   - Amplitude
   - Custom tracking

---

## Mobile Responsiveness

All pages and components are responsive with breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

Mobile-specific components in `components/mobile/`

---

## Performance Features

- Code splitting by route
- Lazy loading of components
- Image optimization
- Map marker clustering
- Virtual scrolling for large lists
- Debounced search inputs
- Memoized expensive calculations
- React Query caching
- Service worker (PWA support)

---

## Accessibility Features

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus indicators
- ARIA labels
- Alt text for images
- Semantic HTML

---

## Security Features

- JWT authentication
- Password hashing (bcrypt)
- HTTPS only
- CSRF protection
- XSS prevention
- SQL injection prevention
- Rate limiting
- Input validation
- File upload restrictions
- Session management

---

## Testing Coverage

- Unit tests for utilities
- Component tests (React Testing Library)
- Integration tests for key flows
- E2E tests (Playwright)
- API tests
- Performance tests
- Accessibility tests

---

## Documentation

- User guides by role
- API documentation
- Component storybook
- Architecture diagrams
- Database schema docs
- Deployment guides
- Troubleshooting guides

---

## Future Features (Roadmap)

### Renter
- Mobile app (iOS/Android)
- Virtual property tours
- Roommate matching
- Moving service integration
- Utility setup automation
- Renter's insurance marketplace

### Landlord
- Tenant screening integration
- Maintenance request system
- Rent collection automation
- Lease signing (e-signature)
- Accounting integration
- Marketing automation

### Agent
- CRM integration
- MLS integration
- Document management
- Team collaboration tools
- Video call scheduling
- Client portal

### Platform
- Multi-language support
- Additional markets/cities
- Blockchain for lease verification
- AI chatbot assistant
- Voice search
- Augmented reality property viewing

---

**Document Version:** 1.0  
**Last Updated:** February 4, 2026  
**Maintained By:** Development Team  
**Next Review:** Monthly
