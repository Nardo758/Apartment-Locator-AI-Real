# 🧠 AI Formula Program - Data Flow Architecture

**Current Date:** Feb 3, 2026  
**Purpose:** Map how Location Intelligence inputs power the AI Formula outputs

---

## 🔄 The Complete Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INPUT PHASE                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────┬────────────────────────┬───────────────────────────┐
│                        │                        │                           │
│   1. PROGRAM AI        │   2. LOCATION          │   3. MARKET INTEL        │
│      (/program-ai)     │      INTELLIGENCE      │      (/market-intel)     │
│   ──────────────       │      (/location-       │   ──────────────         │
│                        │       intelligence)    │                           │
│   User preferences:    │                        │   Market context:         │
│   • Budget: $2,500/mo  │   POIs:                │   • Region: Austin, TX    │
│   • Bedrooms: 1 BR     │   • Work: "123 Main"   │   • Current Rent: $2,200  │
│   • Amenities: Pool    │   • Gym: "LA Fitness"  │   • Property Value: $450K │
│   • Deal Breakers      │   • Grocery: "Whole    │   • Time Horizon: 5 yrs   │
│   • Walkability: High  │     Foods"             │   • Income: $102K         │
│   • Transit: Required  │                        │                           │
│   • Crime: Low         │   Lifestyle:           │   AI analyzes:            │
│   • Lifestyle: Active  │   • Commute: 5 d/wk    │   • Leverage Score: 72/100│
│   • Use Case: First    │   • Vehicle: 28 MPG    │   • Days on Market: 35    │
│     apartment          │   • Gas: $3.50/gal     │   • Inventory: 2.8 mo     │
│                        │   • Transit: $100/mo   │   • Rent Trend: +4.5%     │
│   ✅ Saved to:         │                        │   • Negotiation Power:    │
│      userProfile       │   ✅ Saved to:         │     STRONG                │
│                        │      LocationCost      │   • Rent vs Buy:          │
│                        │      Context           │     KEEP RENTING          │
│                        │                        │                           │
│                        │                        │   ✅ Saved to:            │
│                        │                        │      Market Context       │
│                        │                        │                           │
└────────────────────────┴────────────────────────┴───────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    AI PROCESSING PHASE                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────────────┐
│   3. AI FORMULA CALCULATION (/ai-formula + hooks)                     │
│   ──────────────────────────────────────────────                     │
│                                                                       │
│   FOR EACH APARTMENT:                                                │
│                                                                       │
│   A. LOCATION SCORING (from Location Intelligence)                   │
│      ┌────────────────────────────────────────┐                     │
│      │ Distance to POIs:                      │                     │
│      │ • Work: 3.2 miles (8 min drive)       │                     │
│      │ • Gym: 1.5 miles (4 min drive)        │                     │
│      │ • Grocery: 0.8 miles (2 min drive)    │                     │
│      │                                        │                     │
│      │ Commute Cost:                          │                     │
│      │ 3.2 mi × 2 × 5 days × 4.33 wks        │                     │
│      │ ───────────────────────────────        │                     │
│      │         28 MPG                         │                     │
│      │ = 4.93 gal/mo × $3.50 = $17.26/mo    │                     │
│      │                                        │                     │
│      │ Time Value:                            │                     │
│      │ 8 min × 2 × 5 days × 4.33 = 346 min  │                     │
│      │ 346 min ÷ 60 = 5.77 hrs               │                     │
│      │ 5.77 × $25/hr = $144.25/mo           │                     │
│      │                                        │                     │
│      │ Location Costs: $161.51/mo            │                     │
│      │ TRUE COST = $1,850 + $161.51          │                     │
│      │           = $2,011.51/mo              │                     │
│      └────────────────────────────────────────┘                     │
│                                                                       │
│   B. PREFERENCE MATCHING (from Program AI)                           │
│      ┌────────────────────────────────────────┐                     │
│      │ Budget Match:                          │                     │
│      │ $2,011 < $2,500 ✅ (Score: +30)       │                     │
│      │                                        │                     │
│      │ Amenity Match:                         │                     │
│      │ Pool ✅ Gym ✅ (Score: +25)            │                     │
│      │                                        │                     │
│      │ Deal Breakers:                         │                     │
│      │ Parking ✅ (Score: +20)                │                     │
│      │                                        │                     │
│      │ Walkability:                           │                     │
│      │ Walk Score: 78 (Score: +15)           │                     │
│      │                                        │                     │
│      │ Transit Access:                        │                     │
│      │ Bus stop 0.2 mi ✅ (Score: +10)       │                     │
│      └────────────────────────────────────────┘                     │
│                                                                       │
│   C. MARKET INTELLIGENCE BOOST (from Market Intel)                   │
│      ┌────────────────────────────────────────┐                     │
│      │ Market Leverage: 72/100 (STRONG)      │                     │
│      │                                        │                     │
│      │ Context Applied:                       │                     │
│      │ • Days on Market: 35 (Score: +8)      │                     │
│      │ • Inventory High: 2.8 mo (Score: +5)  │                     │
│      │ • Negotiation Power: Strong (+10)     │                     │
│      │ • Rent Trending Up: +4.5% (Score: -2) │                     │
│      │                                        │                     │
│      │ Recommendation Bonus: +15 points       │                     │
│      │ "Great time to negotiate - landlords  │                     │
│      │  are motivated due to high inventory" │                     │
│      └────────────────────────────────────────┘                     │
│                                                                       │
│   D. COMBINED AI SCORE                                               │
│      ┌────────────────────────────────────────┐                     │
│      │ Location Score:      85/100            │                     │
│      │ Preference Score:    90/100            │                     │
│      │ Market Intelligence: 72/100            │                     │
│      │ True Cost Savings:   $488/mo           │                     │
│      │                                        │                     │
│      │ FINAL SMART SCORE: 92/100 ⭐          │                     │
│      │ RANK: #1 (TOP PICK)                   │                     │
│      │                                        │                     │
│      │ 💰 Negotiation Tip:                    │                     │
│      │ "Ask for $150/mo off - market data    │                     │
│      │  shows 35 days on market indicates    │                     │
│      │  landlord urgency"                     │                     │
│      └────────────────────────────────────────┘                     │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    OUTPUT PHASE (Dashboard)                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────────────┐
│   4. DASHBOARD DISPLAY (/dashboard)                                   │
│   ─────────────────────────────                                      │
│                                                                       │
│   Map View:                                                           │
│   ┌─────────────────────────────────────────────────────┐           │
│   │  🟥 Work (Red Square)                               │           │
│   │  🔵 Gym (Blue Circle)                               │           │
│   │  🟩 Grocery (Green Hexagon)                         │           │
│   │                                                     │           │
│   │  🏠 Apt #1 (Score: 92) - TOP PICK ⭐               │           │
│   │  🏠 Apt #2 (Score: 85)                             │           │
│   │  🏠 Apt #3 (Score: 78)                             │           │
│   └─────────────────────────────────────────────────────┘           │
│                                                                       │
│   Results List:                                                       │
│   ┌─────────────────────────────────────────────────────┐           │
│   │  Camden Apartments ⭐ TOP PICK                      │           │
│   │  ────────────────────────────────                  │           │
│   │  Base Rent: $1,850/mo (small, muted)              │           │
│   │  TRUE COST: $2,011/mo (LARGE GRADIENT)            │           │
│   │  💰 Saves $488/mo vs others                        │           │
│   │                                                     │           │
│   │  AI Score: 92/100 🎯                               │           │
│   │  • Location: 85/100                                │           │
│   │  • Preferences: 90/100                             │           │
│   │  • True Cost: Best Deal                            │           │
│   │                                                     │           │
│   │  Distance to POIs:                                 │           │
│   │  🟥 Work: 8 min drive                              │           │
│   │  🔵 Gym: 4 min drive                               │           │
│   │  🟩 Grocery: 2 min drive                           │           │
│   └─────────────────────────────────────────────────────┘           │
│                                                                       │
│   Cost Comparison Table:                                             │
│   ┌──────────────────────────────────────────────────────────────┐ │
│   │ Apt Name     │ Rent  │ Location +/- │ TRUE COST │ vs Avg    │ │
│   ├──────────────────────────────────────────────────────────────┤ │
│   │ Camden ⭐    │ $1,850│ +$161       │ $2,011    │ -$488 ⬇️  │ │
│   │ Vue Eola     │ $2,200│ +$85        │ $2,285    │ -$214 ⬇️  │ │
│   │ Millenia     │ $1,650│ +$920       │ $2,570    │ +$71 ⬆️   │ │
│   └──────────────────────────────────────────────────────────────┘ │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

---

## 🔧 Current Issues & Redesign Needs

### ❌ Problems with Current Implementation:

1. **Disconnected Inputs**
   - Program AI preferences stored separately from Location Intelligence
   - No clear indication that BOTH are needed for accurate results
   - Users might skip one and get incomplete scoring

2. **Unclear Data Flow**
   - User doesn't see how their inputs affect the AI score
   - No visual connection between POIs and apartment ranking
   - "Why is this apartment #1?" is not obvious

3. **Missing Integration**
   - True Cost calculation happens separately from AI scoring
   - Should be unified into one "Smart Score"
   - Dashboard doesn't show which inputs are missing

4. **No Progressive Disclosure**
   - All inputs at once = overwhelming
   - Should guide user through a flow:
     1. Basic filters (budget, beds)
     2. Location priorities (POIs)
     3. Lifestyle preferences
     4. Advanced AI tuning

---

## ✅ Proposed Redesign

### 🎯 Unified Onboarding Flow

```
Step 1: Basic Search
├─ Location/Zip Code
├─ Budget Range
├─ Bedrooms
└─ Move-in Date

Step 2: Your Important Locations (POIs)
├─ Work/Office
├─ Gym/Fitness
├─ Grocery Store
├─ Daycare/School (optional)
└─ Other custom locations

Step 3: Lifestyle & Commute
├─ Commute days/week
├─ Vehicle type & MPG
├─ Transit preferences
└─ Time vs money tradeoff

Step 4: Market Intelligence (Recommended)
├─ Annual income
├─ Current savings
├─ Time horizon (years)
├─ Property value interest (if buying)
└─ AI analyzes:
    • Your negotiation leverage
    • Rent vs buy recommendation
    • Best timing for your move
    • Expected rent increases

Step 5: AI Preferences (Optional)
├─ Must-have amenities
├─ Deal breakers
├─ Walkability importance
├─ Safety/crime preferences
└─ Neighborhood vibe
```

### 📊 Enhanced Dashboard Output

**Smart Score Components:**
```
┌────────────────────────────────────────┐
│  SMART SCORE: 92/100 ⭐               │
│  ───────────────────────────────       │
│                                        │
│  🎯 Location Intelligence: 85/100      │
│     • Commute: 8 min to work          │
│     • True Cost: $2,011/mo            │
│     • Savings: $488/mo                │
│                                        │
│  ✨ AI Preference Match: 90/100       │
│     • Budget: ✅ Under limit           │
│     • Amenities: ✅ Pool + Gym         │
│     • Walkability: ✅ Score 78         │
│                                        │
│  📊 Market Intelligence: 72/100       │
│     • Leverage: Strong (35 days)      │
│     • Negotiation Power: High         │
│     • Potential Discount: $150/mo     │
│                                        │
│  💡 Why This is #1:                    │
│     "Best combination of location      │
│      convenience, true cost savings,   │
│      your must-have amenities, AND     │
│      strong negotiation leverage"      │
│                                        │
│  💰 Action: Ask for $1,700/mo          │
│     (Based on 35 days on market)      │
└────────────────────────────────────────┘
```

---

## 🔄 Integration Points to Fix

### 1. Context Unification
**Merge LocationCostContext + UserProfile + MarketContext:**
```typescript
interface UnifiedAIInputs {
  // Basic Search
  budget: number;
  bedrooms: string;
  location: string;
  zipCode: string;
  moveInDate?: Date;
  
  // POIs (Location Intelligence)
  pointsOfInterest: POI[];
  commutePreferences: {
    daysPerWeek: number;
    vehicleMpg: number;
    gasPrice: number;
    transitPass: number;
  };
  
  // AI Preferences (Program AI)
  amenities: string[];
  dealBreakers: string[];
  lifestyle: string;
  priorities: string[];
  walkabilityScore: number;
  transitAccess: string;
  crimeRate: string;
  
  // Market Intelligence
  marketContext?: {
    leverageScore: number;
    daysOnMarket: number;
    inventoryLevel: number;
    rentTrend: number;
    negotiationPower: 'weak' | 'moderate' | 'strong';
    rentVsBuyRecommendation: 'rent' | 'buy' | 'neutral';
    propertyValue?: number;
    timeHorizon?: number;
  };
  
  // Calculated
  hasCompletedSetup: boolean;
  setupProgress: number; // 0-100%
  missingInputs: string[]; // ["Add work location", "Complete market analysis"]
}
```

### 2. Progressive Setup Wizard
- Guide user through 4 steps
- Show progress: "2 of 4 steps complete"
- Allow skipping optional steps
- Save at each step

### 3. Dashboard Intelligence Bar
```
┌──────────────────────────────────────────────────────────┐
│ 🎯 AI Setup: 75% Complete                                │
│ ──────────────────────────────────────                  │
│ ✅ Basic Search    ✅ POIs Added    ⚠️  Lifestyle Setup │
│                                                          │
│ [Complete Setup] → Get more accurate recommendations     │
└──────────────────────────────────────────────────────────┘
```

### 4. Explainable AI Scores
- Click any score to see breakdown
- Show which inputs affected the ranking
- Suggest improvements: "Add work location to improve accuracy"

### 5. Market Intel Integration
**How Market Intelligence Powers Smarter Recommendations:**

```typescript
// Market Intelligence affects multiple aspects:

1. SCORING BOOST
   - High leverage → Boost apartments with longer days on market
   - Strong negotiation power → Flag apartments with discount potential
   - Rent trending up → Prioritize locking in current prices

2. NEGOTIATION TIPS
   - 35+ days on market → Suggest $100-200/mo discount
   - High inventory (>2.5 mo) → "Landlords are motivated"
   - Low crime + high walkability → Justify asking price
   
3. RENT VS BUY CONTEXT
   - If "Keep Renting" → Emphasize True Cost savings
   - If "Consider Buying" → Show rent increases over time
   - Neutral → Present both sides with data

4. TIMING INTELLIGENCE
   - Best time to move: When inventory peaks (typically summer)
   - Urgency indicator: "Prices up 4.5% - lock in now"
   - Seasonal adjustments: Winter = better deals

5. COMPETITIVE INTELLIGENCE
   - Compare vs market average rent
   - Show if apartment is overpriced/underpriced
   - Predict future rent increases
```

**Market Intel adds "When & How Much" to the "Where & What" from other inputs.**

---

## 🚀 Implementation Priority

### Phase 1: Connect the Dots (This Sprint)
- [ ] Unify contexts (merge Location + Preferences)
- [ ] Show setup progress on Dashboard
- [ ] Display Smart Score (Location + Preferences combined)
- [ ] Add "Why #1?" explainer

### Phase 2: Guided Onboarding (Next Sprint)
- [ ] Build 4-step wizard
- [ ] Progressive disclosure of complexity
- [ ] Save state at each step
- [ ] Skip/come back later option

### Phase 3: Intelligence Layer (Future)
- [ ] ML-based scoring improvements
- [ ] Learn from user saves/rejects
- [ ] Predictive preferences
- [ ] "Similar to apartments you liked"

---

## 📝 Technical TODOs

### High Priority (This Sprint)
- [ ] Merge `LocationCostContext` + `userProfile` + `marketContext` into single unified source
- [ ] Update `useLocationIntelligence` hook to consume unified data
- [ ] Integrate `useUnifiedRentalIntelligence` into scoring engine
- [ ] Modify ProgramAI to write to unified context
- [ ] Connect Market Intel outputs to apartment scoring
- [ ] Update Dashboard to show setup completeness (now 5 steps)
- [ ] Add Smart Score calculation (Location + Preferences + Market)
- [ ] Build explainer tooltips for all score components
- [ ] Add negotiation tip generator based on market leverage

### Medium Priority (Next Sprint)
- [ ] Create 5-step setup wizard flow
- [ ] Build "missing inputs" indicator on Dashboard
- [ ] Add Market Intel summary card to Dashboard
- [ ] Implement "Best Time to Move" recommendation
- [ ] Create rent trend projections (1-3 year outlook)
- [ ] Add competitive pricing analysis vs market

### Low Priority (Future)
- [ ] Historical market data tracking
- [ ] Predictive rent increase warnings
- [ ] Automated negotiation script generator
- [ ] Market alert notifications (inventory spikes, price drops)

---

**Next Step:** Review this architecture and confirm it matches your vision!

---

## 🎯 EXECUTIVE SUMMARY

### The Problem
**THREE separate input pages create fragmented data:**
1. Program AI → User preferences (budget, amenities, lifestyle)
2. Location Intelligence → POIs + commute data
3. Market Intel → Leverage scores + timing intelligence

**Result:** AI can't give accurate recommendations because inputs are disconnected.

---

### The Solution
**UNIFIED SMART SCORE = All Three Combined**

```
SMART SCORE: 92/100 ⭐

🎯 Location (85)  +  ✨ Preferences (90)  +  📊 Market (72)
────────────────────────────────────────────────────────────
        ↓
"Camden Apartments is your #1 match because:
 • 8 min commute saves you $488/mo
 • Has all your must-haves (pool, gym, parking)
 • Strong leverage - ask for $150/mo discount
 • Lock in now before 4.5% rent increase"
```

---

### Implementation Roadmap

**Phase 1: Unify Contexts (This Week)**
- Merge all three input sources into one `UnifiedAIContext`
- Update scoring to use all three data sources
- Show setup progress on Dashboard (e.g., "3/5 steps complete")
- Add Market Intel summary to apartment cards

**Phase 2: Guided Onboarding (Next Week)**
- Build 5-step wizard (Basic → POIs → Lifestyle → Market → Preferences)
- Progressive disclosure (start simple, add complexity)
- Show "why this matters" for each step
- Allow skip/come back later

**Phase 3: Intelligence Layer (Future)**
- Negotiation tip generator
- Rent trend predictions
- Best time to move recommendations
- Automated market alerts

---

### Key Metrics to Track

**Setup Completion:**
- % of users who complete all 5 steps
- Average time to complete setup
- Most commonly skipped steps

**Score Accuracy:**
- User satisfaction with top recommendations
- Save/reject rates by score tier
- Correlation between Smart Score and user actions

**Market Intel Impact:**
- How many users leverage negotiation tips
- Successful discount rates when following advice
- Rent vs buy decision correlation

---

### User Value Proposition

**Before (Current):**
"Find apartments that match your budget and preferences"

**After (With Smart Score):**
"Find apartments optimized for YOUR life, YOUR commute, YOUR budget, at the RIGHT TIME to negotiate the BEST DEAL"

**Competitive Advantage:**
- Zillow: Shows listings (WHERE)
- Apartments.com: Has filters (WHAT)
- **Apartment Locator AI: Tells you WHERE, WHAT, HOW MUCH to pay, and WHEN to move** ✨

