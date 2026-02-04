# Pages That Need Code/Updates

**Date:** February 3, 2026  
**Status:** Implementation needed

---

## 🔄 Pages Needing Updates

### 1. SavedProperties.tsx → Combined Page
**Current state:** ✅ Exists, shows only saved properties  
**Needs:** Merge with OffersMade.tsx to show both

**Current name:** "Saved & Offers"  
**Better name options:**
- **"My Apartments"** - Simple, clear, personal
- **"Watchlist"** - Industry standard (like stock market)
- **"Tracking"** - Shows active monitoring
- **"Shortlist & Offers"** - More descriptive
- **"My Deals"** - Action-oriented, focuses on negotiation

**Recommended:** "My Apartments" or "Watchlist"

**File location:** `/src/pages/SavedProperties.tsx`

**Implementation:**
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, FileText } from 'lucide-react';

export default function MyApartments() { // New name
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      
      <div className="container mx-auto px-6 pt-24 pb-16">
        <h1 className="text-4xl font-bold text-white mb-2">My Apartments</h1>
        <p className="text-white/70 mb-8">Track saved properties and offers you've made</p>
        
        <Tabs defaultValue="saved" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="saved" className="gap-2">
              <Heart className="w-4 h-4" />
              Saved ({savedCount})
            </TabsTrigger>
            <TabsTrigger value="offers" className="gap-2">
              <FileText className="w-4 h-4" />
              Offers ({offersCount})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="saved" className="mt-0">
            {/* Existing SavedProperties content */}
            {savedPropertiesList.length === 0 ? (
              <EmptyState 
                icon={Heart}
                title="No Saved Apartments Yet"
                description="Click the heart icon on any property to save it here"
                actionLabel="Browse Properties"
                actionLink="/dashboard"
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {savedPropertiesList.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="offers" className="mt-0">
            {/* Content from OffersMade.tsx */}
            {offers.length === 0 ? (
              <EmptyState 
                icon={FileText}
                title="No Offers Made Yet"
                description="Generate and track your negotiation offers here"
                actionLabel="Generate Offer"
                actionLink="/generate-offer"
              />
            ) : (
              <div className="space-y-4">
                {offers.map(offer => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

**Also need to create:**
- `/src/components/EmptyState.tsx` - Reusable empty state component
- `/src/components/OfferCard.tsx` - Display offer details

---

### 2. OffersMade.tsx
**Current state:** ✅ Exists (14KB)  
**Action:** Extract content to use in tabs above  
**Decision:** Keep as separate route OR deprecate after merge?

**Recommendation:** Keep both:
- `/saved-properties` → New combined page ("My Apartments")
- `/offers-made` → Redirect to `/saved-properties?tab=offers`

---

### 3. Program Your AI (ProgramAIUnified.tsx)
**Current state:** ✅ Exists (19KB)  
**Status:** Complete, just moved to settings  
**Action needed:** None (already built)

---

## 🆕 Pages Missing/Needed

### 1. Payment Success Page
**File:** `/src/pages/PaymentSuccess.tsx`  
**Status:** ⚠️ Exists but needs updating for new flow

**Current:** Generic success message  
**Needs:** 
- Verify Stripe payment
- Show unlocked results
- Download/email options
- Track conversion

**Implementation:**
```tsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, Download, Mail, ArrowRight } from 'lucide-react';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify payment and fetch results
    fetch(`/api/verify-payment?session_id=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        setResults(data.results);
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        
        <h1 className="text-5xl font-bold text-white mb-4">
          Payment Successful! 🎉
        </h1>
        
        <p className="text-xl text-white/70 mb-8">
          Your full apartment analysis is ready
        </p>

        {/* Results Preview */}
        <Card variant="highlighted" className="mb-8 text-left">
          <CardHeader>
            <CardTitle>Your Analysis Results</CardTitle>
            <CardDescription>
              Found {results.propertyCount} properties • Potential savings: ${results.totalSavings.toLocaleString()}/year
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Property list, negotiation scripts, etc. */}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="gap-2">
            <Download className="w-5 h-5" />
            Download PDF Report
          </Button>
          <Button variant="outline" size="lg" className="gap-2">
            <Mail className="w-5 h-5" />
            Email to Me
          </Button>
        </div>

        <div className="mt-8">
          <Link to="/dashboard">
            <Button variant="ghost" className="gap-2">
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

**Also need backend route:**
```typescript
// /server/routes.ts
app.get('/api/verify-payment', async (req, res) => {
  const { session_id } = req.query;
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  const session = await stripe.checkout.sessions.retrieve(session_id);
  
  if (session.payment_status === 'paid') {
    // Retrieve results from session metadata
    const resultsData = JSON.parse(session.metadata.resultsData);
    
    // Store in database (user purchase record)
    // ...
    
    res.json({ 
      success: true, 
      results: resultsData 
    });
  } else {
    res.status(400).json({ error: 'Payment not completed' });
  }
});
```

---

### 2. Paywall Modal Component
**File:** `/src/components/PaywallModal.tsx`  
**Status:** ❌ Needs to be built

**Purpose:** Shows pricing/unlock screen after free calculator results

**Implementation:**
```tsx
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X, Lock, Zap } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultsData: any; // The results to unlock
}

export function PaywallModal({ isOpen, onClose, resultsData }: PaywallModalProps) {
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    setLoading(true);
    
    try {
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultsData: resultsData
        })
      });
      
      const { sessionId } = await response.json();
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Payment error:', error);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card variant="highlighted" className="max-w-2xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <CardHeader className="text-center pb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] mb-4 mx-auto">
            <Lock className="w-8 h-8 text-white" />
          </div>
          
          <CardTitle className="text-3xl mb-2">Unlock Full Results</CardTitle>
          <CardDescription className="text-lg">
            One-time payment • Lifetime access • No subscription
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Pricing */}
          <div className="text-center mb-8 p-6 rounded-xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30">
            <div className="text-sm text-white/70 mb-2">One-time payment</div>
            <div className="text-6xl font-bold gradient-text mb-2">$49</div>
            <div className="text-white/60">Save ${resultsData.estimatedSavings.toLocaleString()}/year</div>
          </div>

          {/* What's included */}
          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">What You Get:</h3>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">Full Property List ({resultsData.propertyCount} apartments)</div>
                <div className="text-sm text-white/60">Complete details with Smart Scores</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">AI Negotiation Scripts</div>
                <div className="text-sm text-white/60">Personalized for each property</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">Email Templates</div>
                <div className="text-sm text-white/60">Ready to send to landlords</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">Market Intel Report</div>
                <div className="text-sm text-white/60">PDF download with full analysis</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">Lifetime Access</div>
                <div className="text-sm text-white/60">View your results anytime</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Button 
            onClick={handleUnlock} 
            disabled={loading}
            size="xl" 
            className="w-full mb-4"
          >
            {loading ? 'Processing...' : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Unlock Now - $49
              </>
            )}
          </Button>

          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-4 text-xs text-white/50">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>Secure payment</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>No subscription</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>Instant access</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### 3. Empty State Component
**File:** `/src/components/EmptyState.tsx`  
**Status:** ❌ Needs to be built

**Purpose:** Reusable empty state for pages with no data

**Implementation:**
```tsx
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  actionLink,
  onAction 
}: EmptyStateProps) {
  return (
    <Card variant="glass" className="max-w-md mx-auto">
      <CardContent className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-6">
          <Icon className="w-10 h-10 text-white/60" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-white/70 mb-6">{description}</p>
        
        {actionLabel && (
          actionLink ? (
            <Link to={actionLink}>
              <Button size="lg">{actionLabel}</Button>
            </Link>
          ) : (
            <Button size="lg" onClick={onAction}>{actionLabel}</Button>
          )
        )}
      </CardContent>
    </Card>
  );
}
```

---

### 4. Offer Card Component
**File:** `/src/components/OfferCard.tsx`  
**Status:** ❌ Needs to be built

**Purpose:** Display offer details in the offers tab

**Implementation:**
```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, MapPin, FileText, ExternalLink } from 'lucide-react';

interface OfferCardProps {
  offer: {
    id: string;
    propertyName: string;
    propertyAddress: string;
    originalPrice: number;
    offeredPrice: number;
    status: 'pending' | 'accepted' | 'rejected' | 'countered';
    createdAt: string;
    negotiationScript?: string;
  };
}

export function OfferCard({ offer }: OfferCardProps) {
  const savings = offer.originalPrice - offer.offeredPrice;
  const savingsPercent = ((savings / offer.originalPrice) * 100).toFixed(1);
  
  const statusColors = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'error',
    countered: 'primary'
  };

  return (
    <Card hover variant="elevated">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{offer.propertyName}</CardTitle>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{offer.propertyAddress}</span>
            </div>
          </div>
          <Badge variant={statusColors[offer.status]} size="lg">
            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-sm text-white/60 mb-1">Original Price</div>
            <div className="text-lg font-semibold text-white/80 line-through">
              ${offer.originalPrice.toLocaleString()}/mo
            </div>
          </div>
          
          <div>
            <div className="text-sm text-white/60 mb-1">Your Offer</div>
            <div className="text-2xl font-bold text-emerald-400">
              ${offer.offeredPrice.toLocaleString()}/mo
            </div>
          </div>
          
          <div>
            <div className="text-sm text-white/60 mb-1">Potential Savings</div>
            <div className="text-lg font-semibold text-white">
              ${savings.toLocaleString()}/mo
              <span className="text-sm text-emerald-400 ml-2">({savingsPercent}%)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
          <Calendar className="w-4 h-4" />
          <span>Sent {new Date(offer.createdAt).toLocaleDateString()}</span>
        </div>

        {offer.negotiationScript && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="w-4 h-4" />
              View Script
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Property Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 🎨 Component Library Needed

All these components should use our premium design system:

### Already Built ✅:
- Button (with variants)
- Card (with hover states)
- Badge (with semantic colors)
- Typography classes

### Still Need ❌:
- EmptyState
- PaywallModal
- OfferCard
- LoadingSpinner (for payment success)
- Tabs (from shadcn/ui - may need to install)

---

## 📋 Implementation Checklist

### Tomorrow - Priority Order:

1. **Rename "Saved & Offers"**
   - [ ] Decide on new name (My Apartments? Watchlist?)
   - [ ] Update Header.tsx nav label
   - [ ] Update route if needed

2. **Build Missing Components**
   - [ ] EmptyState.tsx
   - [ ] OfferCard.tsx
   - [ ] PaywallModal.tsx
   - [ ] Install/configure Tabs component

3. **Update SavedProperties Page**
   - [ ] Add tabs (Saved | Offers)
   - [ ] Use EmptyState for empty tabs
   - [ ] Import OffersMade content
   - [ ] Test switching between tabs

4. **Payment Flow**
   - [ ] Update PaymentSuccess.tsx
   - [ ] Build verification endpoint
   - [ ] Store purchases in database
   - [ ] Test with Stripe test mode

---

## 💭 Name Decision Matrix

| Name | Pros | Cons |
|------|------|------|
| **My Apartments** | Clear, personal, simple | Generic |
| **Watchlist** | Industry standard, familiar | Stock market association |
| **Tracking** | Shows active monitoring | Vague |
| **Shortlist & Offers** | Most descriptive | Wordy |
| **My Deals** | Action-oriented | Assumes negotiation |

**Top 2 Recommendations:**
1. **"My Apartments"** - Best for mainstream users
2. **"Watchlist"** - Best for power users (real estate pros)

**Leon's call!** 🎯

---

**Status:** Ready to implement  
**Estimated time:** 3-4 hours to complete all missing pages
