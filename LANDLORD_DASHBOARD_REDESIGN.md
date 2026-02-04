# 🏢 Landlord Dashboard Redesign - Feature Spec & Wireframe

**Created:** February 4, 2026  
**Status:** Feature Specification  
**Based On:** UnifiedDashboard (Renter) pattern

---

## 🎯 Design Principle

**"Similar UX, Different Data"**

The Landlord dashboard should mirror the Renter dashboard's clean, map-centric design but show **own properties + competition** instead of rental search results.

---

## 📐 Wireframe Overview

### Layout Structure (Mirroring UnifiedDashboard)

```
┌─────────────────────────────────────────────────────────────────┐
│ Header (with Profile Settings - NEW)                            │
├─────────────────────────────────────────────────────────────────┤
│ Market Intel Bar                                                 │
│ [Austin, TX | Med Rent: $1,847 | Leverage: 72 | Inventory: 3.2%]│
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                    │
│  Left Panel  │          Interactive Map                          │
│  Sidebar     │                                                    │
│              │  [Own Properties: Blue pins]                      │
│  - Portfolio │  [Competition: Red pins]                          │
│    Summary   │  [Selected: Purple highlight]                     │
│              │                                                    │
│  - Filters   │                                                    │
│    • City    │                                                    │
│    • Status  │                                                    │
│    • Risk    │                                                    │
│              │                                                    │
│  - Comp Sets │                                                    │
│    [+ Create]│                                                    │
│    • Set 1   │                                                    │
│    • Set 2   │                                                    │
│              │                                                    │
│  - Alerts    │                                                    │
│    [Settings]│                                                    │
│              │                                                    │
│              │                                                    │
└──────────────┴──────────────────────────────────────────────────┘
│ View Toggle: [Map] [List] | Sort: [Vacancy Risk ▼]             │
├─────────────────────────────────────────────────────────────────┤
│ Property Cards / List View                                       │
│ (Shows selected property + competition side-by-side)            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Component Breakdown

### 1. Header Component (Enhanced)

**Current:** Basic header with logo + navigation  
**New:** Add Profile Settings dropdown (missing for landlords/agents)

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

### 2. Market Intel Bar (Landlord-Specific Metrics)

Similar to renter version but with landlord-relevant data:

```tsx
<MarketIntelBar 
  market="Austin, TX"
  data={{
    medianRent: 1847,
    rentChange: +2.3,
    daysOnMarket: 24,
    inventoryLevel: 3.2,
    leverageScore: 72,
    aiRecommendation: "High demand market. Consider raising rents on lease renewals."
  }}
/>
```

**Landlord-Specific Metrics:**
- Median Rent (market)
- Rent Change % (vs last month)
- Days on Market (avg)
- Inventory Level (supply %)
- Market Leverage Score (demand indicator)
- AI Recommendation (pricing strategy)

---

### 3. Left Panel Sidebar (Portfolio-Focused)

**Replaces:** Renter's lifestyle inputs  
**New Sections:**

#### A. Portfolio Summary Widget
```tsx
<Card>
  <CardHeader>
    <CardTitle>Portfolio Overview</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-4">
      <Stat label="Total Properties" value="12" />
      <Stat label="Occupied" value="10" icon={<Home />} />
      <Stat label="Vacant" value="2" icon={<AlertTriangle />} color="red" />
      <Stat label="Avg Occupancy" value="83%" />
      <Stat label="Monthly Revenue" value="$22,400" icon={<DollarSign />} />
      <Stat label="At Risk" value="3" icon={<TrendingUp />} />
    </div>
  </CardContent>
</Card>
```

#### B. Filters
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
    
    <Select label="Status">
      <option>All</option>
      <option>Occupied</option>
      <option>Vacant</option>
    </Select>
    
    <Select label="Vacancy Risk">
      <option>All</option>
      <option>High Risk</option>
      <option>Medium Risk</option>
      <option>Low Risk</option>
    </Select>
    
    <Select label="Competition Set">
      <option>All Properties</option>
      <option>Downtown Premium Set</option>
      <option>Suburban Budget Set</option>
      {/* Dynamic list from saved sets */}
    </Select>
  </CardContent>
</Card>
```

#### C. Competition Sets Manager (NEW FEATURE)
```tsx
<Card>
  <CardHeader>
    <CardTitle>Competition Sets</CardTitle>
    <Button size="sm" onClick={createNewSet}>
      <Plus className="h-4 w-4 mr-1" /> Create Set
    </Button>
  </CardHeader>
  <CardContent>
    {competitionSets.map(set => (
      <CompetitionSetItem 
        key={set.id}
        name={set.name}
        propertyCount={set.properties.length}
        competitorCount={set.competitors.length}
        onView={() => viewSet(set.id)}
        onEdit={() => editSet(set.id)}
        onDelete={() => deleteSet(set.id)}
      />
    ))}
  </CardContent>
</Card>
```

**Example Sets:**
- "Downtown Premium Set" (3 properties vs 12 competitors)
- "Suburban Budget Set" (5 properties vs 8 competitors)
- "Riverside District" (2 properties vs 6 competitors)

#### D. Pricing Alerts (NEW FEATURE)
```tsx
<Card>
  <CardHeader>
    <CardTitle>Pricing Alerts</CardTitle>
    <Button variant="ghost" size="sm" onClick={configureAlerts}>
      <Settings className="h-4 w-4" />
    </Button>
  </CardHeader>
  <CardContent>
    <Toggle 
      label="Competitor Price Changes"
      checked={alerts.priceChanges}
      onChange={(v) => setAlerts({...alerts, priceChanges: v})}
    />
    <Toggle 
      label="New Concessions Offered"
      checked={alerts.concessions}
      onChange={(v) => setAlerts({...alerts, concessions: v})}
    />
    <Toggle 
      label="Market Trends"
      checked={alerts.marketTrends}
      onChange={(v) => setAlerts({...alerts, marketTrends: v})}
    />
    <Toggle 
      label="Vacancy Risk Warnings"
      checked={alerts.vacancyRisk}
      onChange={(v) => setAlerts({...alerts, vacancyRisk: v})}
    />
  </CardContent>
</Card>
```

---

### 4. Interactive Map (Property-Focused)

**Same Component:** `<InteractivePropertyMap />`  
**Different Data:**

```tsx
<InteractivePropertyMap
  properties={ownProperties.map(p => ({
    ...p,
    markerColor: 'blue',
    markerIcon: 'home',
    type: 'own'
  }))}
  competitors={competitorProperties.map(c => ({
    ...c,
    markerColor: 'red',
    markerIcon: 'building',
    type: 'competitor'
  }))}
  selectedPropertyId={selectedPropertyId}
  onPropertySelect={setSelectedPropertyId}
  center={mapCenter}
  zoom={12}
/>
```

**Map Legend:**
- 🔵 Blue pins = Own Properties
- 🔴 Red pins = Competitors
- 🟣 Purple highlight = Selected property + active comparison

**Click Behavior:**
- Click own property → Show details + "Compare with Competition" button
- Click competitor → Add to comparison view
- Right-click competitor → "Add to Competition Set"

---

### 5. Property Cards / List View (Comparison-Focused)

#### View Modes:
- **Map View** (default) - Properties on map
- **List View** - Table with sortable columns

#### Selected Property + Competition Card

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Left: Your Property */}
  <Card className="border-blue-500 border-2">
    <CardHeader>
      <Badge variant="default">Your Property</Badge>
      <CardTitle>{selectedProperty.address}</CardTitle>
    </CardHeader>
    <CardContent>
      <PropertyDetails property={selectedProperty} />
      <MetricsGrid 
        rent={selectedProperty.currentRent}
        bedrooms={selectedProperty.bedrooms}
        sqft={selectedProperty.squareFeet}
        occupancyRate={100}
        daysVacant={0}
      />
      <PricingRecommendation property={selectedProperty} />
    </CardContent>
  </Card>

  {/* Right: Competition Comparison */}
  <Card className="border-red-500 border-2">
    <CardHeader>
      <Badge variant="destructive">Market Competition</Badge>
      <CardTitle>Average of {competitors.length} Properties</CardTitle>
    </CardHeader>
    <CardContent>
      <ComparisonMetrics 
        yourProperty={selectedProperty}
        competitors={competitors}
        metrics={['rent', 'occupancy', 'amenities', 'concessions']}
      />
      <CompetitiveAdvantages property={selectedProperty} />
      <GapAnalysis property={selectedProperty} market={competitors} />
    </CardContent>
  </Card>
</div>
```

---

## 🆕 New Feature: Competition Sets

### What Are Competition Sets?

**Definition:** Named groups of competitor properties that landlords track against specific assets.

**Use Cases:**
- Track premium downtown competitors for luxury units
- Monitor budget properties in suburban areas
- Compare across different neighborhoods
- Benchmark against similar property types

### Competition Set Structure

```typescript
interface CompetitionSet {
  id: string;
  name: string;
  description?: string;
  ownProperties: string[]; // Array of property IDs
  competitors: CompetitorProperty[];
  createdAt: Date;
  updatedAt: Date;
  alertsEnabled: boolean;
}

interface CompetitorProperty {
  id: string;
  address: string;
  coordinates: { lat: number; lng: number };
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  currentRent: number;
  amenities: string[];
  concessions: Concession[];
  lastUpdated: Date;
  source: 'manual' | 'scraper' | 'api';
}
```

### Create Competition Set Flow

**Step 1: Name Your Set**
```tsx
<Dialog open={creatingSet}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create Competition Set</DialogTitle>
    </DialogHeader>
    <Input 
      label="Set Name"
      placeholder="e.g., Downtown Premium Competitors"
      value={newSet.name}
      onChange={(e) => setNewSet({...newSet, name: e.target.value})}
    />
    <Textarea
      label="Description (optional)"
      placeholder="Describe what this set tracks..."
      value={newSet.description}
      onChange={(e) => setNewSet({...newSet, description: e.target.value})}
    />
  </DialogContent>
</Dialog>
```

**Step 2: Select Your Properties**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Select Your Properties</CardTitle>
    <p className="text-sm text-gray-600">
      Choose which of your properties to include in this set
    </p>
  </CardHeader>
  <CardContent>
    {ownProperties.map(property => (
      <Checkbox
        key={property.id}
        label={property.address}
        checked={newSet.ownProperties.includes(property.id)}
        onChange={(checked) => toggleOwnProperty(property.id, checked)}
      />
    ))}
  </CardContent>
</Card>
```

**Step 3: Add Competitors**

Three ways to add competitors:

**A. Map Selection**
```tsx
<InteractivePropertyMap
  mode="select-competitors"
  onCompetitorSelect={(competitor) => addCompetitor(competitor)}
  selectedCompetitors={newSet.competitors}
/>
```

**B. Manual Entry**
```tsx
<Button onClick={openManualEntry}>
  <Plus className="h-4 w-4 mr-2" />
  Add Competitor Manually
</Button>

<Dialog open={manualEntry}>
  <DialogContent>
    <Input label="Address" />
    <Input label="Rent" type="number" />
    <Input label="Bedrooms" type="number" />
    <Input label="Bathrooms" type="number" />
    <Input label="Square Feet" type="number" />
    <MultiSelect label="Amenities" options={amenityOptions} />
  </DialogContent>
</Dialog>
```

**C. Search & Import**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Find Competitors</CardTitle>
  </CardHeader>
  <CardContent>
    <Input 
      placeholder="Search by address or property name..."
      value={search}
      onChange={handleSearch}
    />
    <div className="space-y-2 mt-4">
      {searchResults.map(result => (
        <CompetitorSearchResult
          key={result.id}
          property={result}
          onAdd={() => addCompetitor(result)}
          isAdded={newSet.competitors.some(c => c.id === result.id)}
        />
      ))}
    </div>
  </CardContent>
</Card>
```

**Step 4: Configure Alerts (Optional)**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Alert Settings</CardTitle>
  </CardHeader>
  <CardContent>
    <Toggle
      label="Enable alerts for this competition set"
      checked={newSet.alertsEnabled}
      onChange={(v) => setNewSet({...newSet, alertsEnabled: v})}
    />
    
    {newSet.alertsEnabled && (
      <div className="mt-4 space-y-2">
        <Checkbox label="Price changes" checked />
        <Checkbox label="New concessions" checked />
        <Checkbox label="Amenity updates" />
        <Checkbox label="Availability changes" />
      </div>
    )}
  </CardContent>
</Card>
```

**Step 5: Review & Save**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Review Competition Set</CardTitle>
  </CardHeader>
  <CardContent>
    <dl className="space-y-2">
      <dt className="font-semibold">Set Name:</dt>
      <dd>{newSet.name}</dd>
      
      <dt className="font-semibold">Your Properties:</dt>
      <dd>{newSet.ownProperties.length} properties</dd>
      
      <dt className="font-semibold">Competitors:</dt>
      <dd>{newSet.competitors.length} competitors</dd>
      
      <dt className="font-semibold">Alerts:</dt>
      <dd>{newSet.alertsEnabled ? 'Enabled' : 'Disabled'}</dd>
    </dl>
    
    <div className="flex gap-2 mt-6">
      <Button onClick={saveSet}>Save Competition Set</Button>
      <Button variant="outline" onClick={cancel}>Cancel</Button>
    </div>
  </CardContent>
</Card>
```

---

## 📊 Comparison View (Core Feature)

### Asset vs Competition Comparison

When a competition set is active:

```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="pricing">Pricing</TabsTrigger>
    <TabsTrigger value="amenities">Amenities</TabsTrigger>
    <TabsTrigger value="concessions">Concessions</TabsTrigger>
    <TabsTrigger value="market">vs Market</TabsTrigger>
  </TabsList>
  
  {/* Tab 1: Overview */}
  <TabsContent value="overview">
    <ComparisonOverview 
      yourProperties={selectedSet.ownProperties}
      competitors={selectedSet.competitors}
    />
  </TabsContent>
  
  {/* Tab 2: Pricing Comparison */}
  <TabsContent value="pricing">
    <PricingComparisonTable
      properties={[
        ...selectedSet.ownProperties,
        ...selectedSet.competitors
      ]}
      highlightYours
    />
  </TabsContent>
  
  {/* Tab 3: Amenities Comparison */}
  <TabsContent value="amenities">
    <AmenitiesMatrix 
      properties={selectedSet.ownProperties}
      competitors={selectedSet.competitors}
    />
  </TabsContent>
  
  {/* Tab 4: Concessions */}
  <TabsContent value="concessions">
    <ConcessionsTracker
      competitors={selectedSet.competitors}
      showAlerts
    />
  </TabsContent>
  
  {/* Tab 5: Market Comparison */}
  <TabsContent value="market">
    <MarketBenchmark
      yourProperties={selectedSet.ownProperties}
      marketData={marketData}
    />
  </TabsContent>
</Tabs>
```

### Pricing Comparison Table

```
┌─────────────────────┬──────┬──────┬─────────┬──────────┬──────────┐
│ Property            │ Rent │ $/SF │ Beds    │ Amenities│ Status   │
├─────────────────────┼──────┼──────┼─────────┼──────────┼──────────┤
│ 🔵 YOUR PROPERTY    │      │      │         │          │          │
│ 1234 Main St #203   │$2,200│$2.00 │ 2BR/2BA │ Pool, Gym│ Occupied │
├─────────────────────┼──────┼──────┼─────────┼──────────┼──────────┤
│ 🔴 COMPETITORS      │      │      │         │          │          │
│ Riverside Apts      │$2,100│$1.91 │ 2BR/2BA │ Pool     │ 2mo free │
│ Downtown Towers     │$2,150│$1.96 │ 2BR/2BA │ Pool, Gym│ $500 off │
│ Urban Living        │$2,250│$2.05 │ 2BR/2BA │ Gym      │ Occupied │
├─────────────────────┼──────┼──────┼─────────┼──────────┼──────────┤
│ Market Average      │$2,100│$1.91 │    -    │     -    │    -     │
└─────────────────────┴──────┴──────┴─────────┴──────────┴──────────┘
```

**Color Coding:**
- 🟢 Green = You're priced competitively (within 5% of market)
- 🟡 Yellow = Slightly high/low (5-10% variance)
- 🔴 Red = Significant variance (>10%)

### Amenities Comparison Matrix

```
┌─────────────────────┬──────┬─────┬──────┬────────┬────────┬──────┐
│ Amenity             │ YOU  │ R1  │ R2   │ R3     │ Market │ Gap  │
├─────────────────────┼──────┼─────┼──────┼────────┼────────┼──────┤
│ Pool                │  ✅  │ ✅  │ ✅   │  ❌    │  75%   │  -   │
│ Fitness Center      │  ✅  │ ❌  │ ✅   │  ✅    │  75%   │  -   │
│ Pet-Friendly        │  ❌  │ ✅  │ ✅   │  ✅    │  100%  │ ⚠️   │
│ In-Unit Laundry     │  ✅  │ ❌  │ ❌   │  ✅    │  50%   │  -   │
│ Parking Included    │  ❌  │ ✅  │ ✅   │  ❌    │  66%   │ ⚠️   │
│ High-Speed Internet │  ✅  │ ✅  │ ✅   │  ✅    │  100%  │  -   │
└─────────────────────┴──────┴─────┴──────┴────────┴────────┴──────┘
```

**Gap Analysis:**
- ⚠️ = You're missing an amenity that >66% of competitors have
- ✅ = Competitive or better

---

## 🔔 Pricing Alerts System

### Alert Types

**1. Competitor Price Changes**
```tsx
<Alert variant="warning">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Price Drop Alert</AlertTitle>
  <AlertDescription>
    <strong>Riverside Apartments</strong> dropped rent from $2,200 to $2,100 (-$100)
    <br />
    Your property at <strong>1234 Main St</strong> is now $100 higher.
    <Button variant="link" size="sm">View Comparison</Button>
  </AlertDescription>
</Alert>
```

**2. New Concessions**
```tsx
<Alert variant="info">
  <DollarSign className="h-4 w-4" />
  <AlertTitle>New Concession Offered</AlertTitle>
  <AlertDescription>
    <strong>Downtown Towers</strong> now offering: 2 months free rent
    <br />
    Effective value: $4,300 (for your comparable unit)
    <Button variant="link" size="sm">See Details</Button>
  </AlertDescription>
</Alert>
```

**3. Vacancy Risk Warning**
```tsx
<Alert variant="destructive">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>High Vacancy Risk</AlertTitle>
  <AlertDescription>
    Your property at <strong>2468 Riverside Dr</strong> has been vacant for 45 days.
    <br />
    You're priced $300/mo above market average.
    <Button variant="link" size="sm">View Recommendations</Button>
  </AlertDescription>
</Alert>
```

**4. Market Trend Alert**
```tsx
<Alert>
  <TrendingUp className="h-4 w-4" />
  <AlertTitle>Market Trend Alert</AlertTitle>
  <AlertDescription>
    Austin 2BR median rent increased 3.2% this month.
    <br />
    Consider adjusting rates on upcoming lease renewals.
    <Button variant="link" size="sm">View Market Report</Button>
  </AlertDescription>
</Alert>
```

### Alert Configuration

```tsx
<Card>
  <CardHeader>
    <CardTitle>Alert Preferences</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div>
      <h4 className="font-semibold mb-2">Delivery Method</h4>
      <Checkbox label="Email" checked />
      <Checkbox label="SMS" />
      <Checkbox label="In-app notifications" checked />
    </div>
    
    <div>
      <h4 className="font-semibold mb-2">Frequency</h4>
      <Select>
        <option>Real-time (as they happen)</option>
        <option>Daily digest</option>
        <option>Weekly summary</option>
      </Select>
    </div>
    
    <div>
      <h4 className="font-semibold mb-2">Thresholds</h4>
      <Input 
        label="Price change minimum"
        type="number"
        value={50}
        suffix="dollars"
      />
      <Input 
        label="Vacancy risk threshold"
        type="number"
        value={30}
        suffix="days"
      />
    </div>
  </CardContent>
</Card>
```

---

## 🆕 Missing Feature: Profile Settings

### Current State
❌ Landlord dashboard has NO profile/settings access  
❌ Agent dashboard has NO profile/settings access  
✅ Renter dashboard has profile access via Header

### Required Implementation

**1. Add Profile Dropdown to Header**

```tsx
// src/components/Header.tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
      <Avatar>
        <AvatarImage src={user.avatar} />
        <AvatarFallback>{user.initials}</AvatarFallback>
      </Avatar>
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>
      {user.name}
      <span className="text-sm text-gray-500">{user.email}</span>
    </DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={() => navigate('/profile')}>
      <User className="mr-2 h-4 w-4" />
      My Profile
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => navigate('/settings')}>
      <Settings className="mr-2 h-4 w-4" />
      Settings
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => navigate('/billing')}>
      <CreditCard className="mr-2 h-4 w-4" />
      Billing
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={handleSignOut}>
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**2. Landlord-Specific Settings Page**

```tsx
// src/pages/LandlordSettings.tsx
<Tabs defaultValue="profile">
  <TabsList>
    <TabsTrigger value="profile">Profile</TabsTrigger>
    <TabsTrigger value="notifications">Notifications</TabsTrigger>
    <TabsTrigger value="alerts">Alert Settings</TabsTrigger>
    <TabsTrigger value="integrations">Integrations</TabsTrigger>
  </TabsList>
  
  <TabsContent value="profile">
    <ProfileSettings />
  </TabsContent>
  
  <TabsContent value="notifications">
    <NotificationPreferences />
  </TabsContent>
  
  <TabsContent value="alerts">
    <AlertConfiguration />
  </TabsContent>
  
  <TabsContent value="integrations">
    <IntegrationSettings />
  </TabsContent>
</Tabs>
```

**3. Agent-Specific Settings Page**

Same structure as landlord but with agent-specific options:
- CRM integration settings
- Commission calculator defaults
- Client notification preferences
- Team management (for Brokerage tier)

---

## 📦 New Components to Build

### Required Components

1. **LandlordDashboard.tsx** (main page)
   - Replaces current PortfolioDashboard.tsx
   - Uses UnifiedDashboard pattern

2. **CompetitionSetManager.tsx**
   - Create/edit/delete competition sets
   - Manage competitors

3. **CompetitionSetDialog.tsx**
   - Multi-step wizard for creating sets
   - Map selection interface
   - Manual entry form

4. **ComparisonView.tsx**
   - Side-by-side property comparison
   - Metrics tables
   - Gap analysis

5. **PricingAlertConfig.tsx**
   - Alert preferences
   - Notification settings
   - Threshold configuration

6. **AlertsWidget.tsx**
   - Show recent alerts
   - Quick actions
   - Mark as read/dismissed

7. **LandlordSettings.tsx**
   - Settings page for landlords
   - Profile, notifications, alerts, integrations

8. **AgentSettings.tsx**
   - Settings page for agents
   - CRM, team, notifications

---

## 🗄️ Database Schema Updates

### New Tables

**1. competition_sets**
```sql
CREATE TABLE competition_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  own_property_ids UUID[] NOT NULL,
  alerts_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**2. competition_set_competitors**
```sql
CREATE TABLE competition_set_competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  set_id UUID REFERENCES competition_sets(id) ON DELETE CASCADE,
  property_id UUID, -- Reference to properties table if scraped
  address VARCHAR(500) NOT NULL,
  coordinates POINT,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  square_feet INTEGER,
  current_rent DECIMAL(10,2),
  amenities TEXT[],
  concessions JSONB,
  last_updated TIMESTAMP DEFAULT NOW(),
  source VARCHAR(50) DEFAULT 'manual' -- 'manual' | 'scraper' | 'api'
);
```

**3. pricing_alerts**
```sql
CREATE TABLE pricing_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  set_id UUID REFERENCES competition_sets(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'price_change' | 'concession' | 'vacancy_risk' | 'market_trend'
  severity VARCHAR(20) DEFAULT 'info', -- 'info' | 'warning' | 'critical'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**4. alert_preferences**
```sql
CREATE TABLE alert_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  price_changes BOOLEAN DEFAULT true,
  concessions BOOLEAN DEFAULT true,
  vacancy_risk BOOLEAN DEFAULT true,
  market_trends BOOLEAN DEFAULT true,
  delivery_email BOOLEAN DEFAULT true,
  delivery_sms BOOLEAN DEFAULT false,
  delivery_inapp BOOLEAN DEFAULT true,
  frequency VARCHAR(20) DEFAULT 'realtime', -- 'realtime' | 'daily' | 'weekly'
  price_threshold DECIMAL(10,2) DEFAULT 50.00,
  vacancy_threshold INTEGER DEFAULT 30,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);
```

---

## 🔌 API Endpoints

### Competition Sets

```
POST   /api/competition-sets              - Create new set
GET    /api/competition-sets              - List user's sets
GET    /api/competition-sets/:id          - Get set details
PATCH  /api/competition-sets/:id          - Update set
DELETE /api/competition-sets/:id          - Delete set

POST   /api/competition-sets/:id/competitors  - Add competitor
DELETE /api/competition-sets/:id/competitors/:competitorId  - Remove competitor
```

### Alerts

```
GET    /api/alerts                        - Get user's alerts
PATCH  /api/alerts/:id                    - Mark as read/dismissed
DELETE /api/alerts/:id                    - Delete alert

GET    /api/alert-preferences             - Get preferences
PATCH  /api/alert-preferences             - Update preferences
```

### Comparison

```
POST   /api/comparison                    - Generate comparison report
GET    /api/comparison/market-benchmark   - Get market data
```

---

## 🎨 Visual Design Consistency

### Match UnifiedDashboard Styling

**Colors:**
- Own properties: `bg-blue-50 border-blue-500`
- Competitors: `bg-red-50 border-red-500`
- Market average: `bg-gray-50 border-gray-300`

**Gradients:**
- Headers: `from-blue-600 to-purple-600`
- Buttons: Same blue-purple gradient as renter dashboard

**Typography:**
- Same font families and sizes
- Consistent heading hierarchy
- Match card padding and spacing

**Icons:**
- Use Lucide React icons (same as UnifiedDashboard)
- Consistent icon sizing (h-4 w-4 for inline, h-6 w-6 for larger)

---

## ✅ Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Create LandlordDashboard.tsx using UnifiedDashboard pattern
- [ ] Add profile dropdown to Header component
- [ ] Create LandlordSettings.tsx page
- [ ] Create AgentSettings.tsx page
- [ ] Update routing to protect /landlord/settings and /agent/settings

### Phase 2: Competition Sets (Week 2)
- [ ] Create database tables (competition_sets, competition_set_competitors)
- [ ] Build CompetitionSetManager component
- [ ] Build CompetitionSetDialog wizard
- [ ] Create API endpoints for CRUD operations
- [ ] Add map selection interface for adding competitors
- [ ] Implement manual competitor entry form

### Phase 3: Comparison View (Week 3)
- [ ] Build ComparisonView component
- [ ] Create PricingComparisonTable
- [ ] Create AmenitiesMatrix
- [ ] Implement MarketBenchmark calculations
- [ ] Add gap analysis logic
- [ ] Create side-by-side comparison cards

### Phase 4: Alerts System (Week 4)
- [ ] Create alert database tables
- [ ] Build AlertsWidget component
- [ ] Create PricingAlertConfig component
- [ ] Implement alert generation logic (background job)
- [ ] Add email/SMS notification system
- [ ] Create alert management UI (read/dismiss)

### Phase 5: Polish & Testing (Week 5)
- [ ] End-to-end testing of all features
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Documentation
- [ ] User onboarding tooltips

---

## 🚀 Launch Criteria

**MVP Requirements:**
- ✅ Landlord dashboard mirrors renter dashboard design
- ✅ Map shows own properties + competition
- ✅ Basic competition set creation (manual entry)
- ✅ Simple comparison view (pricing + amenities)
- ✅ Profile settings accessible
- ✅ Basic alert configuration

**Post-MVP Enhancements:**
- Automated competitor discovery (scrapers)
- Historical pricing trends
- Predictive vacancy risk scores
- Integration with property management systems
- Advanced market analytics
- Bulk property import (CSV)

---

## 📝 Notes

**Key Design Decisions:**
1. **Reuse UnifiedDashboard structure** - Maintain UX consistency across user types
2. **Competition sets are core** - Not just a comparison tool, but a strategic management feature
3. **Alerts are opt-in** - Default to off, landlords enable what they want
4. **Manual first, automation later** - Allow manual competitor entry before building scrapers

**Technical Considerations:**
- Use same map component (InteractivePropertyMap) with different data
- Reuse existing UI components from shadcn/ui
- Maintain TypeScript type safety throughout
- Ensure mobile responsiveness from day 1

---

**Status:** Ready for implementation  
**Next Step:** Review with Leon, get approval, start Phase 1
