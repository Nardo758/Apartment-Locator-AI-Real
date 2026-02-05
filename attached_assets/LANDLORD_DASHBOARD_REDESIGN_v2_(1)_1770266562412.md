# 🏢 Landlord Dashboard Redesign v2 — Retention Intelligence

**Created:** February 4, 2026  
**Status:** Revised Feature Specification  
**Revision Note:** Reframed from competitive pricing tool → retention & vacancy reduction platform

---

## 🎯 Strategic Reframe

### The Problem with v1

The original spec positioned the landlord dashboard as "monitor competitors and optimize rent pricing." This creates a fundamental conflict: ApartmentIQ's core value proposition is giving **renters** negotiation leverage. Arming landlords with the same intelligence to maximize rents undermines renter trust and brand integrity.

### The v2 Approach: Retention Intelligence

**Core Insight:** A landlord's biggest cost isn't slightly below-market rent — it's tenant turnover. A single vacancy typically costs 2–3 months of rent when factoring lost income, unit prep, marketing, and showing time. A landlord who retains a tenant at $50/mo below market saves thousands compared to one who prices aggressively and faces vacancy.

**New Positioning:**  
*"Reduce vacancy. Retain tenants. Stop losing money to turnover."*

**Why This Works for Both Sides:**
- **Landlords** get a tool that directly reduces their most expensive problem (vacancy/turnover)
- **Renters** benefit because landlords using this tool are incentivized toward competitive pricing and concessions
- **ApartmentIQ** maintains brand integrity — the platform genuinely helps both sides of the equation

---

## 📐 Wireframe Overview

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ Header (with Profile Settings)                                   │
├─────────────────────────────────────────────────────────────────┤
│ Retention Health Bar                                             │
│ [Austin, TX | Turnover Cost: $4,200 | Retention: 83% | 3 ⚠️]   │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                    │
│  Left Panel  │          Interactive Map                          │
│  Sidebar     │                                                    │
│              │  [Healthy: Green pins]                            │
│  - Portfolio │  [At Risk: Yellow pins]                           │
│    Health    │  [Critical: Red pins]                             │
│              │  [Vacant: Gray pins]                              │
│  - Filters   │                                                    │
│    • City    │                                                    │
│    • Risk    │                                                    │
│    • Status  │                                                    │
│              │                                                    │
│  - Upcoming  │                                                    │
│    Renewals  │                                                    │
│              │                                                    │
│  - Retention │                                                    │
│    Alerts    │                                                    │
│              │                                                    │
└──────────────┴──────────────────────────────────────────────────┘
│ View Toggle: [Map] [List] | Sort: [Retention Risk ▼]           │
├─────────────────────────────────────────────────────────────────┤
│ Property Cards (Risk-first layout with action recommendations)  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Component Breakdown

### 1. Header Component (Same as v1)

Profile dropdown with settings access — this part was fine. Keep the v1 implementation as-is.

```tsx
<Header 
  userType="landlord"
  onProfileClick={() => navigate('/profile')}
  onSettingsClick={() => navigate('/landlord/settings')}
  onBillingClick={() => navigate('/billing')}
/>
```

**Profile Menu Items:**
- My Profile
- Account Settings
- Billing & Subscription
- Notification Preferences
- Sign Out

---

### 2. Retention Health Bar (Replaces Market Intel Bar)

**v1 had:** Median rent, leverage score, "consider raising rents"  
**v2 has:** Turnover cost, retention rate, units at risk, actionable nudge

```tsx
<RetentionHealthBar 
  market="Austin, TX"
  data={{
    avgTurnoverCost: 4200,          // Average cost per vacancy in this market
    portfolioRetention: 83,          // % of tenants retained at last renewal
    marketRetention: 78,             // Market average retention rate
    unitsAtRisk: 3,                  // Units with high churn risk score
    upcomingRenewals: 5,             // Leases expiring within 90 days
    vacantUnits: 2,                  // Currently vacant
    vacancyCostToDate: 6400,         // Money lost to current vacancies
    aiRecommendation: "3 leases expire within 60 days. Units priced 5%+ above market have 3x higher turnover — consider renewal incentives."
  }}
/>
```

**Displayed Metrics (left to right):**

| Metric | Example | Why It Matters |
|--------|---------|----------------|
| Market Turnover Cost | $4,200 avg | Anchors the cost of losing a tenant |
| Portfolio Retention | 83% (vs 78% market) | Shows how they compare — green if above market |
| Units at Risk | 3 ⚠️ | Immediate attention needed |
| Upcoming Renewals | 5 in 90 days | Pipeline of potential churn |
| Vacancy Cost to Date | $6,400 lost | Running tally of money lost to empty units |
| AI Recommendation | (dynamic) | Always action-oriented, always retention-focused |

**AI Recommendation Examples:**
- "3 leases expire within 60 days. Units priced 5%+ above market have 3x higher turnover — consider renewal incentives."
- "Unit 4B has been vacant 45 days. Similar units offering 1-month-free are filling in 12 days. Estimated savings vs. continued vacancy: $2,100."
- "Your retention rate is 5% above market average. Strong performance — maintain current pricing strategy."
- "2 nearby properties just started offering pet-friendly policies. 3 of your units don't allow pets — this is a growing market expectation."

**Key difference from v1:** Every recommendation drives toward retention/competitive pricing, never toward "raise your rents."

---

### 3. Left Panel Sidebar (Retention-Focused)

#### A. Portfolio Health Widget (Replaces Portfolio Summary)

**v1 framed this as:** Revenue overview (monthly revenue, occupancy %)  
**v2 frames this as:** Health check (retention risk, vacancy costs, upcoming renewals)

```tsx
<Card>
  <CardHeader>
    <CardTitle>Portfolio Health</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      {/* Retention Score — the hero metric */}
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <div className="text-3xl font-bold text-green-700">83%</div>
        <div className="text-sm text-green-600">Retention Rate</div>
        <div className="text-xs text-gray-500">Market avg: 78%</div>
      </div>
      
      {/* Quick stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Total Units" value="12" />
        <Stat label="Occupied" value="10" color="green" />
        <Stat label="Vacant" value="2" color="red" />
        <Stat label="At Risk" value="3" color="amber" />
      </div>
      
      {/* Vacancy cost callout */}
      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
        <div className="text-sm font-medium text-red-800">
          Vacancy Cost This Month
        </div>
        <div className="text-xl font-bold text-red-700">$6,400</div>
        <div className="text-xs text-red-600">
          2 vacant units × avg 32 days
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

**Why this works:** The hero metric is retention rate (not revenue), and vacancy cost is called out as a loss — this psychologically frames vacancy as the enemy, not below-market rent.

#### B. Filters (Simplified from v1)

```tsx
<Card>
  <CardHeader>
    <CardTitle>Filters</CardTitle>
  </CardHeader>
  <CardContent>
    <Select label="City">
      <option>All Cities</option>
      <option>Austin, TX</option>
      <option>Dallas, TX</option>
    </Select>
    
    <Select label="Retention Risk">
      <option>All Units</option>
      <option>Critical (Score 80+)</option>
      <option>At Risk (Score 50-79)</option>
      <option>Healthy (Score 0-49)</option>
      <option>Vacant</option>
    </Select>
    
    <Select label="Lease Status">
      <option>All</option>
      <option>Expiring in 30 days</option>
      <option>Expiring in 60 days</option>
      <option>Expiring in 90 days</option>
      <option>Month-to-month</option>
      <option>Vacant</option>
    </Select>
  </CardContent>
</Card>
```

**What's removed from v1:** Competition Set filter. That entire feature is cut (see rationale below).

#### C. Upcoming Renewals Widget (Replaces Competition Sets Manager)

**v1 had:** Competition Sets — a complex feature for grouping/tracking competitor properties with a 5-step creation wizard.  
**v2 replaces with:** Upcoming Renewals — a simple, high-urgency list that drives immediate action.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Upcoming Renewals</CardTitle>
    <Badge variant="outline">{renewals.length} in 90 days</Badge>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      {renewals
        .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
        .map(renewal => (
          <RenewalItem 
            key={renewal.id}
            address={renewal.address}
            unitNumber={renewal.unit}
            daysUntilExpiry={renewal.daysUntilExpiry}
            currentRent={renewal.currentRent}
            marketRent={renewal.marketRent}
            retentionRisk={renewal.riskScore}
            onViewDetails={() => selectProperty(renewal.propertyId)}
          />
        ))}
    </div>
  </CardContent>
</Card>
```

**Example Renewal Items:**
```
┌──────────────────────────────────────────┐
│ 🔴 1234 Main St, Unit 4B                │
│ Expires in 18 days | Risk: HIGH          │
│ Current: $2,200 | Market: $2,050         │
│ → $150/mo above market (7.3%)            │
│ [View Details]                           │
├──────────────────────────────────────────┤
│ 🟡 567 Oak Ave, Unit 2A                 │
│ Expires in 42 days | Risk: MEDIUM        │
│ Current: $1,800 | Market: $1,825         │
│ → At market rate ✓                       │
│ [View Details]                           │
├──────────────────────────────────────────┤
│ 🟢 890 Elm St, Unit 1C                  │
│ Expires in 71 days | Risk: LOW           │
│ Current: $1,650 | Market: $1,700         │
│ → $50/mo below market (good retention)   │
│ [View Details]                           │
└──────────────────────────────────────────┘
```

**Why this replaces Competition Sets:** The renewals widget is immediately actionable, requires zero setup, and naturally surfaces the market comparison data without the landlord needing to manually build competitor groups. The market rent data comes from the same scraping infrastructure that powers the renter side.

#### D. Retention Alerts (Reframed from Pricing Alerts)

```tsx
<Card>
  <CardHeader>
    <CardTitle>Retention Alerts</CardTitle>
    <Button variant="ghost" size="sm" onClick={configureAlerts}>
      <Settings className="h-4 w-4" />
    </Button>
  </CardHeader>
  <CardContent>
    <Toggle 
      label="Renewal deadline reminders"
      description="Alert when leases are approaching expiry"
      checked={alerts.renewalReminders}
      onChange={(v) => setAlerts({...alerts, renewalReminders: v})}
    />
    <Toggle 
      label="Vacancy cost warnings"
      description="Weekly updates on money lost to empty units"
      checked={alerts.vacancyCost}
      onChange={(v) => setAlerts({...alerts, vacancyCost: v})}
    />
    <Toggle 
      label="Market shift alerts"
      description="When nearby properties change pricing or offer concessions"
      checked={alerts.marketShifts}
      onChange={(v) => setAlerts({...alerts, marketShifts: v})}
    />
    <Toggle 
      label="Retention risk escalation"
      description="When a unit's risk score increases significantly"
      checked={alerts.riskEscalation}
      onChange={(v) => setAlerts({...alerts, riskEscalation: v})}
    />
  </CardContent>
</Card>
```

---

### 4. Interactive Map (Risk-Colored Pins)

**v1 had:** Blue pins (own) vs Red pins (competitors) — adversarial framing  
**v2 has:** Color-coded by retention health — operational framing

```tsx
<InteractivePropertyMap
  properties={ownProperties.map(p => ({
    ...p,
    markerColor: getHealthColor(p.retentionRisk), // green/yellow/red/gray
    markerIcon: getHealthIcon(p.status),
    tooltipContent: (
      <PropertyTooltip
        address={p.address}
        status={p.status}
        retentionRisk={p.retentionRisk}
        currentRent={p.currentRent}
        marketRent={p.marketRent}
        leaseExpiry={p.leaseExpiry}
      />
    )
  }))}
  nearbyComparables={comparables.map(c => ({
    ...c,
    markerColor: 'slate',
    markerIcon: 'building',
    markerOpacity: 0.4,
    type: 'comparable'
  }))}
  selectedPropertyId={selectedPropertyId}
  onPropertySelect={setSelectedPropertyId}
  center={mapCenter}
  zoom={12}
/>
```

**Map Legend:**
- 🟢 Green = Healthy (low churn risk, occupied, at/below market)
- 🟡 Yellow = At Risk (lease expiring soon, above market, or risk factors present)
- 🔴 Red = Critical (high churn risk, significantly overpriced, or long vacancy)
- ⚪ Gray = Vacant
- 🔘 Faded markers = Nearby comparable properties (context, not competition)

**Click Behavior:**
- Click any owned property → Show Retention Detail Card below map
- Click a comparable → Show how it compares to the nearest owned property
- Hover any pin → Quick tooltip with key metrics

**Key difference from v1:** Comparable properties are shown as faded background context, not as bright red "competitor" pins. The visual emphasis is entirely on the landlord's own portfolio health.

---

### 5. Property Cards (Risk-First Layout)

#### Selected Property — Retention Detail Card

**v1 showed:** Side-by-side "Your Property vs. Competition" with adversarial framing  
**v2 shows:** A single property's retention health with market context and recommended action

```tsx
<Card className={`border-2 ${getRiskBorderColor(property.retentionRisk)}`}>
  <CardHeader>
    <div className="flex justify-between items-start">
      <div>
        <CardTitle>{property.address}, Unit {property.unit}</CardTitle>
        <p className="text-sm text-gray-500">
          {property.bedrooms}BR / {property.bathrooms}BA · {property.squareFeet} sqft
        </p>
      </div>
      <RetentionRiskBadge score={property.retentionRisk} />
    </div>
  </CardHeader>
  
  <CardContent className="space-y-6">
    
    {/* Section 1: Retention Risk Score Breakdown */}
    <RetentionScoreBreakdown
      overallScore={property.retentionRisk}
      factors={[
        { 
          name: "Price vs. Market", 
          score: 35, 
          detail: "$150/mo above market (7.3%)",
          impact: "high"
        },
        { 
          name: "Lease Proximity", 
          score: 25, 
          detail: "Expires in 18 days",
          impact: "high" 
        },
        { 
          name: "Amenity Gap", 
          score: 15, 
          detail: "No pet policy (75% of market allows pets)",
          impact: "medium" 
        },
        { 
          name: "Maintenance History", 
          score: 10, 
          detail: "3 requests in last 90 days (above avg)",
          impact: "low" 
        },
      ]}
    />
    
    {/* Section 2: The "What Am I Losing?" Calculator */}
    <VacancyCostCalculator
      currentRent={property.currentRent}
      marketRent={property.marketRent}
      avgDaysToFill={property.estimatedDaysToFill}
      turnoverCosts={{
        lostRent: property.currentRent * (property.estimatedDaysToFill / 30),
        unitPrep: 800,
        marketing: 200,
        showingTime: 150,
      }}
      comparisonScenarios={[
        {
          label: "Keep current tenant (offer $50/mo discount)",
          annualCost: 600,
          recommendation: true
        },
        {
          label: "Lose tenant, fill at market rate",
          annualCost: 5350,  // turnover costs + lower rent anyway
          recommendation: false
        },
        {
          label: "Lose tenant, hold at current price",
          annualCost: 8200,  // longer vacancy + turnover costs
          recommendation: false
        },
      ]}
    />
    
    {/* Section 3: Nearby Market Context */}
    <NearbyMarketContext
      property={property}
      comparables={nearbyComparables}
      summary={{
        avgRent: 2050,
        avgDaysOnMarket: 24,
        concessionRate: 0.42,  // 42% of nearby units offering concessions
        commonConcessions: ["1 month free", "Waived app fee", "Free parking for 6mo"]
      }}
    />
    
    {/* Section 4: AI Recommendation (always the final section) */}
    <RecommendationCard
      type={property.retentionRisk > 60 ? "urgent" : "standard"}
      recommendation={property.aiRecommendation}
      suggestedActions={property.suggestedActions}
    />
    
  </CardContent>
</Card>
```

---

### 6. The "What Am I Losing?" Calculator (Core New Feature)

This is the centerpiece insight of the v2 redesign. Instead of showing landlords a comparison table and leaving them to draw their own conclusions, we show them the **actual dollar cost** of their decisions.

```tsx
<Card className="bg-amber-50 border-amber-200">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Calculator className="h-5 w-5" />
      Vacancy Cost Calculator
    </CardTitle>
  </CardHeader>
  <CardContent>
    
    {/* Current vacancy cost (if vacant) */}
    {property.status === 'vacant' && (
      <div className="p-4 bg-red-100 rounded-lg mb-4">
        <div className="text-sm text-red-800">
          This unit has been vacant for {property.daysVacant} days
        </div>
        <div className="text-2xl font-bold text-red-700">
          ${property.vacancyCostToDate.toLocaleString()} lost so far
        </div>
        <div className="text-xs text-red-600 mt-1">
          Lost rent: ${property.lostRent} · Unit prep: $800 · Marketing: $200
        </div>
      </div>
    )}
    
    {/* Scenario comparison */}
    <div className="space-y-3">
      <h4 className="font-semibold text-sm">Cost Scenarios (12 months)</h4>
      
      {/* Recommended scenario */}
      <div className="p-3 bg-green-100 rounded-lg border-2 border-green-500">
        <div className="flex justify-between items-center">
          <div>
            <Badge className="bg-green-600 mb-1">Recommended</Badge>
            <div className="font-medium">Offer renewal at $2,050/mo</div>
            <div className="text-sm text-gray-600">$150/mo below current · at market rate</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-green-700">-$1,800</div>
            <div className="text-xs text-gray-500">annual cost of discount</div>
          </div>
        </div>
      </div>
      
      {/* Alternative: lose tenant, fill at market */}
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium">Lose tenant → fill at market rate</div>
            <div className="text-sm text-gray-600">
              Est. {avgDaysToFill} days vacant · turnover costs · new tenant at $2,050
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-red-600">-$5,350</div>
            <div className="text-xs text-gray-500">total cost</div>
          </div>
        </div>
      </div>
      
      {/* Alternative: lose tenant, hold price */}
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium">Lose tenant → hold at $2,200/mo</div>
            <div className="text-sm text-gray-600">
              Est. {extendedDaysToFill} days vacant · above-market pricing
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-red-600">-$8,200</div>
            <div className="text-xs text-gray-500">total cost</div>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 italic">
        Based on market data for comparable {property.bedrooms}BR units within 1 mile. 
        Turnover costs include lost rent, unit preparation, and marketing.
      </p>
    </div>
    
  </CardContent>
</Card>
```

**Why this is the killer feature:** It reframes pricing decisions from "how much can I charge?" to "what will this decision actually cost me?" The math almost always favors competitive pricing and retention — which is exactly the landlord behavior that benefits ApartmentIQ's renter users.

---

### 7. Retention Risk Score (Replaces Leverage Score)

The same ApartmentIQ algorithm that generates negotiation leverage scores for renters, run in reverse.

```typescript
interface RetentionRiskScore {
  overall: number;        // 0-100, higher = more likely to churn
  factors: RiskFactor[];
  recommendation: string;
  suggestedActions: Action[];
}

interface RiskFactor {
  name: string;
  weight: number;         // How much this factor contributes
  score: number;          // 0-100 for this factor
  detail: string;         // Human-readable explanation
  impact: 'low' | 'medium' | 'high';
}

// Risk factors and their weights
const RISK_WEIGHTS = {
  priceVsMarket: 0.30,       // How far above/below market rate
  leaseProximity: 0.25,      // How soon lease expires
  amenityGap: 0.15,          // Missing amenities common in market
  vacancyDuration: 0.15,     // How long unit has been vacant (if vacant)
  maintenanceHistory: 0.10,  // Recent maintenance request volume
  marketTrend: 0.05,         // Is the market softening or tightening?
};
```

**Score Ranges:**
- **0–30 (Healthy/Green):** Tenant likely to renew. Unit is competitively priced, well-maintained, no major gaps.
- **31–60 (At Risk/Yellow):** Some risk factors present. Lease may be expiring, unit slightly above market, or amenity gaps exist.
- **61–80 (High Risk/Red):** Multiple risk factors. Significantly overpriced, lease expiring soon, or comparable units offering better deals.
- **81–100 (Critical/Red pulse):** Very likely to lose tenant or extended vacancy. Immediate action recommended.

---

### 8. Nearby Market Context (Replaces Competition Sets)

Instead of manually creating competition groups, the system automatically shows relevant market context based on proximity and unit similarity.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Nearby Market Context</CardTitle>
    <p className="text-sm text-gray-500">
      Comparable {bedrooms}BR units within 1 mile
    </p>
  </CardHeader>
  <CardContent>
    
    {/* Summary stats */}
    <div className="grid grid-cols-3 gap-3 mb-4">
      <Stat label="Avg Rent" value="$2,050" />
      <Stat label="Avg Days to Fill" value="24" />
      <Stat label="Offering Concessions" value="42%" />
    </div>
    
    {/* Your position indicator */}
    <RentPositionBar
      yourRent={2200}
      marketLow={1850}
      marketMedian={2050}
      marketHigh={2350}
      label="Your unit is in the 72nd percentile"
    />
    
    {/* Common concessions nearby */}
    <div className="mt-4">
      <h4 className="text-sm font-semibold mb-2">Concessions Being Offered Nearby</h4>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">1 month free (28%)</Badge>
        <Badge variant="outline">Waived app fee (35%)</Badge>
        <Badge variant="outline">Free parking 6mo (15%)</Badge>
        <Badge variant="outline">Reduced deposit (12%)</Badge>
      </div>
    </div>
    
    {/* What renters are searching for */}
    <div className="mt-4">
      <h4 className="text-sm font-semibold mb-2">Top Renter Searches in This Area</h4>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">Pet-friendly</Badge>
        <Badge variant="secondary">In-unit laundry</Badge>
        <Badge variant="secondary">EV charging</Badge>
        <Badge variant="secondary">Under $2,000</Badge>
      </div>
    </div>
    
  </CardContent>
</Card>
```

**What this achieves that Competition Sets didn't:**
- Zero setup friction (no 5-step wizard)
- Auto-updates as market changes (no manual competitor management)
- Uses the same scraped data that powers the renter search
- Shows what renters actually want (demand signals from ApartmentIQ search data)
- The "Top Renter Searches" section is a unique ApartmentIQ advantage — no competitor has this because they don't have the renter demand data

---

### 9. Alerts System (Retention-Framed, In-App Only for MVP)

**v1 had:** Full notification infrastructure (email, SMS, in-app) with real-time delivery  
**v2 MVP has:** In-app only, with weekly email digest as the only external channel

#### Alert Types (Reframed)

**1. Renewal Deadline Alert**
```tsx
<Alert variant="warning">
  <Clock className="h-4 w-4" />
  <AlertTitle>Lease Expiring Soon</AlertTitle>
  <AlertDescription>
    <strong>1234 Main St, Unit 4B</strong> expires in 18 days.
    Retention risk is HIGH — unit is $150/mo above market.
    <br />
    <strong>Suggested:</strong> Offer renewal at $2,050/mo (market rate). 
    Annual cost of discount: $1,800. Annual cost of vacancy: ~$5,350.
    <Button variant="link" size="sm">View Details</Button>
  </AlertDescription>
</Alert>
```

**2. Vacancy Cost Update**
```tsx
<Alert variant="destructive">
  <DollarSign className="h-4 w-4" />
  <AlertTitle>Vacancy Cost Update</AlertTitle>
  <AlertDescription>
    <strong>2468 Riverside Dr, Unit 1A</strong> has been vacant 45 days.
    <br />
    Total cost so far: <strong>$5,200</strong> (lost rent + turnover).
    Comparable units offering 1-month-free concession are filling in 12 days avg.
    <Button variant="link" size="sm">View Recommendation</Button>
  </AlertDescription>
</Alert>
```

**3. Market Shift Alert**
```tsx
<Alert>
  <TrendingDown className="h-4 w-4" />
  <AlertTitle>Market Shift Nearby</AlertTitle>
  <AlertDescription>
    3 comparable properties within 0.5mi just listed concessions (1-month free, waived fees).
    <br />
    Your vacant unit at <strong>890 Elm St</strong> may need a competitive offer to fill quickly.
    <Button variant="link" size="sm">See Comparables</Button>
  </AlertDescription>
</Alert>
```

**4. Retention Win 🎉**
```tsx
<Alert variant="success">
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>Retention Win!</AlertTitle>
  <AlertDescription>
    Tenant renewed at <strong>567 Oak Ave, Unit 2A</strong>.
    <br />
    Estimated savings vs. vacancy: <strong>$4,200</strong>. 
    Your portfolio retention rate is now 85%.
  </AlertDescription>
</Alert>
```

**Note the addition of "Retention Win" alerts.** Positive reinforcement when a tenant renews — this celebrates the behavior we want to encourage and shows the landlord the value of retention-focused management.

---

## 🗄️ Database Schema Updates

### Modified Tables (Simplified from v1)

**v1 had 4 new tables:** competition_sets, competition_set_competitors, pricing_alerts, alert_preferences  
**v2 has 2 new tables:** retention_alerts, alert_preferences (competition set tables are cut entirely)

**1. retention_alerts** (replaces pricing_alerts)
```sql
CREATE TABLE retention_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id),
  alert_type VARCHAR(50) NOT NULL, 
    -- 'renewal_deadline' | 'vacancy_cost' | 'market_shift' | 'risk_escalation' | 'retention_win'
  severity VARCHAR(20) DEFAULT 'info', 
    -- 'info' | 'warning' | 'critical' | 'success'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
    -- Stores: cost calculations, market comparisons, recommendations
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_retention_alerts_user ON retention_alerts(user_id, is_read, created_at DESC);
```

**2. alert_preferences** (simplified from v1)
```sql
CREATE TABLE alert_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  renewal_reminders BOOLEAN DEFAULT true,
  vacancy_cost_updates BOOLEAN DEFAULT true,
  market_shift_alerts BOOLEAN DEFAULT true,
  risk_escalation BOOLEAN DEFAULT true,
  retention_wins BOOLEAN DEFAULT true,
  delivery_inapp BOOLEAN DEFAULT true,
  delivery_email_digest BOOLEAN DEFAULT false,  -- Weekly digest only
  digest_day VARCHAR(10) DEFAULT 'monday',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### Existing Table Modifications

**Add to properties table:**
```sql
ALTER TABLE properties ADD COLUMN IF NOT EXISTS 
  retention_risk_score INTEGER DEFAULT 0,
  lease_expiry_date DATE,
  days_vacant INTEGER DEFAULT 0,
  last_risk_calculation TIMESTAMP;
```

---

## 🔌 API Endpoints (Simplified from v1)

**v1 had:** 9 endpoints across competition sets, alerts, comparison  
**v2 has:** 5 endpoints focused on retention data and alerts

```
GET    /api/portfolio/health              - Portfolio health summary + retention metrics
GET    /api/portfolio/renewals            - Upcoming renewals with risk scores
GET    /api/properties/:id/retention      - Single property retention detail + vacancy calculator

GET    /api/alerts                        - Get user's retention alerts (paginated)
PATCH  /api/alerts/:id                    - Mark as read/dismissed
GET    /api/alert-preferences             - Get preferences
PATCH  /api/alert-preferences             - Update preferences

GET    /api/market-context/:propertyId    - Nearby comparables, concessions, renter search trends
```

**What's removed from v1:** All competition set CRUD endpoints (6 endpoints cut). The market context endpoint replaces all of that functionality with zero user setup.

---

## 🎨 Visual Design

### Color System (Retention-Themed)

**Property health colors (replaces own/competitor colors):**
- Healthy: `bg-green-50 border-green-500 text-green-700`
- At Risk: `bg-amber-50 border-amber-500 text-amber-700`
- Critical: `bg-red-50 border-red-500 text-red-700`
- Vacant: `bg-gray-50 border-gray-400 text-gray-600`

**Comparable properties (background context):**
- `bg-slate-50 border-slate-200 text-slate-500 opacity-60`

**Cost/savings highlighting:**
- Money lost: `text-red-700 bg-red-50`
- Money saved: `text-green-700 bg-green-50`
- Recommended action: `border-2 border-green-500 bg-green-50`

**Gradients, typography, icons:** Same as renter dashboard (maintain UX consistency).

---

## ✅ Implementation Checklist (Revised)

### Phase 1: Foundation (Week 1)
- [ ] Create LandlordRetentionDashboard.tsx using UnifiedDashboard layout
- [ ] Build RetentionHealthBar component
- [ ] Build PortfolioHealth sidebar widget
- [ ] Add retention_risk_score to properties table
- [ ] Add profile dropdown to Header (carry over from v1)
- [ ] Create LandlordSettings.tsx page

### Phase 2: Risk Scoring + Map (Week 2)
- [ ] Implement retention risk scoring algorithm (inverse of renter leverage score)
- [ ] Build risk-colored map pins (green/yellow/red/gray)
- [ ] Create property tooltips with risk summary
- [ ] Build NearbyMarketContext component (auto-populated from existing scraped data)
- [ ] Build UpcomingRenewals sidebar widget

### Phase 3: Vacancy Calculator + Property Detail (Week 3)
- [ ] Build VacancyCostCalculator component (the centerpiece)
- [ ] Build RetentionScoreBreakdown component
- [ ] Build RetentionDetailCard (selected property view)
- [ ] Wire up AI recommendation generation
- [ ] Build RentPositionBar visualization

### Phase 4: Alerts (Week 4)
- [ ] Create retention_alerts and alert_preferences tables
- [ ] Build in-app alert components (4 alert types)
- [ ] Build alert preferences UI
- [ ] Implement alert generation logic (background job)
- [ ] Optional: weekly email digest

### Phase 5: Polish (Week 5)
- [ ] End-to-end testing
- [ ] Mobile responsiveness
- [ ] Onboarding flow / first-time experience
- [ ] Performance optimization

---

## 📦 Components to Build (Revised)

| Component | Purpose | Complexity |
|-----------|---------|------------|
| LandlordRetentionDashboard.tsx | Main page layout | Medium |
| RetentionHealthBar.tsx | Top-level portfolio metrics | Low |
| PortfolioHealthWidget.tsx | Sidebar health summary | Low |
| UpcomingRenewalsWidget.tsx | Sidebar renewal list | Low |
| RetentionAlertToggle.tsx | Sidebar alert config | Low |
| RetentionDetailCard.tsx | Selected property detail | Medium |
| RetentionScoreBreakdown.tsx | Risk factor visualization | Medium |
| VacancyCostCalculator.tsx | Cost scenario comparison | Medium |
| NearbyMarketContext.tsx | Auto-populated market data | Medium |
| RentPositionBar.tsx | Visual rent percentile | Low |
| RetentionRiskBadge.tsx | Color-coded risk indicator | Low |
| RecommendationCard.tsx | AI action recommendation | Low |

**Total: 12 components** (vs v1's 8, but most are simpler — no multi-step wizards)

---

## 🚀 Launch Criteria (Revised)

**MVP Requirements:**
- ✅ Dashboard shows portfolio with retention risk scores per unit
- ✅ Map pins colored by health status (not own vs. competitor)
- ✅ Vacancy Cost Calculator shows dollar impact of pricing decisions
- ✅ Nearby Market Context auto-populates from existing scraped data
- ✅ Upcoming renewals list with risk indicators
- ✅ Basic in-app alerts (renewal deadlines, vacancy cost updates)
- ✅ Profile settings accessible

**Post-MVP Enhancements:**
- Historical retention trends per property
- Predictive churn model (ML-based, using anonymized renter behavior data)
- "What-if" pricing simulator (adjust rent, see projected retention/vacancy impact)
- Integration with property management systems (auto-import lease dates)
- Tenant satisfaction pulse surveys
- Automated renewal offer generation (draft offers based on market data)

---

## 📝 Key Differences Summary: v1 → v2

| Aspect | v1 (Competitive Pricing) | v2 (Retention Intelligence) |
|--------|--------------------------|----------------------------|
| **Core metric** | Leverage Score | Retention Risk Score |
| **Hero message** | "Consider raising rents" | "3 leases at risk — act now" |
| **Map pins** | Own (blue) vs Competitor (red) | Health status (green/yellow/red/gray) |
| **Sidebar focus** | Competition Sets manager | Upcoming Renewals + Portfolio Health |
| **Key feature** | Side-by-side pricing comparison | Vacancy Cost Calculator |
| **Market data** | Manual competitor groups | Auto-populated nearby context |
| **Alert framing** | "Competitor dropped price" | "Your vacancy is costing $X/week" |
| **AI recommendations** | "Raise rents on renewals" | "Offer $50 discount — saves $3,500 vs vacancy" |
| **New tables** | 4 (incl. competition_sets) | 2 (retention_alerts + preferences) |
| **API endpoints** | 9 | 5 |
| **Setup friction** | 5-step wizard to create comp sets | Zero — works immediately |
| **Brand alignment** | Conflicts with renter value prop | Reinforces it |

---

**Status:** Ready for review  
**Next Step:** Approve direction, begin Phase 1
