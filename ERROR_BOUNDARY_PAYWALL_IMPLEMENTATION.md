# Error Boundary & Paywall Implementation Guide

**Status:** ✅ Complete  
**Implementation Date:** February 4, 2026  
**Tasks Completed:** TODO.md #8 (Paywall), #12 (Error Boundary)

---

## 📋 Overview

This document describes the implementation of error boundaries and paywall features for Apartment Locator AI. These features improve user experience, increase revenue conversion, and provide better error handling across the application.

---

## 🛡️ Error Boundary Implementation

### Files Created

1. **`src/components/ErrorBoundary.tsx`** - Main error boundary component
2. **`src/lib/errorLogger.ts`** - Centralized error logging service

### Features

#### 1. Error Type Detection & User-Friendly Pages

The ErrorBoundary automatically detects error types and displays appropriate pages:

- **Network Errors** (`WifiOff` icon)
  - Triggers on: "network", "fetch", "failed to fetch" errors
  - Actions: Try Again, Go to Homepage
  - Message: Connection troubleshooting

- **Authentication Errors** (`Lock` icon)
  - Triggers on: "unauthorized", "forbidden", "403" errors
  - Actions: Sign In, Go to Homepage
  - Message: Permission explanation

- **Server Errors** (`AlertTriangle` icon)
  - Triggers on: "500", "internal server" errors
  - Actions: Refresh, Homepage, Report Bug
  - Includes: Error ID for support

- **Client Errors** (Generic fallback)
  - Triggers on: All other errors
  - Actions: Try Again, Reload, Homepage, Report Bug
  - Shows: Error details in development mode

#### 2. Error Logging

The `errorLogger.ts` provides:

```typescript
// Log any error with context
logError(error, context, severity);

// Specialized loggers
logNetworkError(url, status, statusText);
logApiError(endpoint, method, error);
logUserActionError(action, error);

// User context for tracking
setUserContext(userId, userEmail);

// Breadcrumbs for debugging
addBreadcrumb(message, data);
```

**Storage:**
- In-memory queue (last 50 errors)
- localStorage (last 20 errors for debugging)
- Backend logging (production only)

**Features:**
- Automatic unhandled error capture
- Automatic promise rejection capture
- Session tracking
- Development vs production modes

#### 3. Integration

The ErrorBoundary wraps the entire app in `App.tsx`:

```tsx
import ErrorBoundary from "./components/ErrorBoundary";

const App = () => (
  <ErrorBoundary>
    {/* All providers and routes */}
  </ErrorBoundary>
);
```

---

## 💰 Paywall Implementation

### Files Created

1. **`src/hooks/usePaywall.ts`** - Paywall tracking hook
2. **`src/components/PaywallModalEnhanced.tsx`** - Enhanced paywall modal
3. **`src/examples/PropertyViewWithPaywall.tsx`** - Integration example

### Features

#### 1. Trigger Mechanisms

The paywall triggers on:

✅ **3 Property Views** (Free Limit)
```typescript
const { trackPropertyView } = usePaywall();
trackPropertyView(propertyId); // Auto-triggers after 3rd view
```

✅ **AI Score Access**
```typescript
const { trackAIScoreAccess } = usePaywall();
if (trackAIScoreAccess(propertyId)) {
  // Show AI score
} else {
  // Paywall shown automatically
}
```

✅ **Offer Generation**
```typescript
const { trackOfferGeneration } = usePaywall();
if (trackOfferGeneration(propertyId)) {
  // Generate offer
} else {
  // Paywall shown automatically
}
```

✅ **Advanced Features**
```typescript
const { trackAdvancedFeature } = usePaywall();
if (trackAdvancedFeature('feature-name')) {
  // Access feature
} else {
  // Paywall shown automatically
}
```

#### 2. Feature Comparison Table

The paywall shows a detailed comparison:

| Feature | Free | Premium |
|---------|------|---------|
| Property Search | 3 views | Unlimited |
| AI Smart Scores | ❌ | ✅ |
| Offer Generation | ❌ | ✅ |
| Market Intelligence | Basic | Advanced |
| Negotiation Scripts | ❌ | ✅ |
| Email Templates | ❌ | ✅ |
| Lifetime Access | ❌ | ✅ |

Users can toggle between detailed comparison and simplified features list.

#### 3. Analytics & Tracking

**Paywall Impressions:**
```typescript
// Automatically tracked
paywallImpressions: number;
lastImpressionTimestamp: number;
triggeredBy: string; // 'property_view_limit', 'ai_score_access', etc.
```

**Conversion Tracking:**
```typescript
// Google Analytics events
gtag('event', 'paywall_view', { triggered_by: ... });
gtag('event', 'purchase', { value: 49, currency: 'USD' });
```

**State Persistence:**
- localStorage: `apartmentiq-paywall-state`
- Tracks: view count, impressions, trigger source

#### 4. Payment Flow

1. User triggers paywall → Modal opens
2. Shows value proposition based on trigger
3. Feature comparison (expandable)
4. Stripe payment initialization
5. Secure payment via Stripe Elements
6. Payment verification
7. Success callback → Reset paywall state
8. User gains full access

---

## 🧪 Testing Guide

### Error Boundary Testing

#### Automated Tests

```bash
npm test -- ErrorBoundary.test.tsx
```

#### Manual Testing Scenarios

**1. Network Error Test:**
```javascript
// In browser console
throw new Error('Failed to fetch');
// Or disconnect internet and try to load data
```

**2. Auth Error Test:**
```javascript
// In browser console
throw new Error('Forbidden - 403');
// Or navigate to /admin without permissions
```

**3. Server Error Test:**
```javascript
// In browser console
throw new Error('Internal Server Error 500');
// Or trigger 500 from backend
```

**4. Generic Error Test:**
```javascript
// In browser console
throw new Error('Something broke!');
```

**5. Check Error Logs:**
```javascript
// View stored errors
const logs = localStorage.getItem('apartmentiq-error-logs');
console.log(JSON.parse(logs));
```

### Paywall Testing

#### Test Paywall Triggers

**1. Property View Limit:**
```typescript
// Clear state first
localStorage.removeItem('apartmentiq-paywall-state');

// View 3 properties
// Navigate to: /property/1, /property/2, /property/3
// 4th view should trigger paywall
```

**2. AI Score Access:**
```typescript
// Click "View AI Smart Score" button
// Should immediately trigger paywall for free users
```

**3. Offer Generation:**
```typescript
// Click "Generate Offer" button
// Should immediately trigger paywall for free users
```

#### Test Analytics

**1. Check Impression Tracking:**
```javascript
// View paywall state
const state = localStorage.getItem('apartmentiq-paywall-state');
console.log(JSON.parse(state));
// Check: paywallImpressions, triggeredBy
```

**2. Check Google Analytics:**
```javascript
// If GA4 is configured, check events in browser console
// Or use GA4 DebugView in Firebase console
```

#### Test Conversion Flow

**1. Complete Payment (Test Mode):**
- Use Stripe test card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- Verify: Success callback fires
- Verify: Paywall state resets
- Verify: User gains access to premium features

---

## 📦 Integration Guide

### Integrate Paywall in Your Component

```tsx
import { usePaywall } from '@/hooks/usePaywall';
import { PaywallModalEnhanced } from '@/components/PaywallModalEnhanced';

export function MyComponent() {
  const {
    isPaywallOpen,
    closePaywall,
    trackPropertyView,
    trackAIScoreAccess,
    resetPaywallState,
  } = usePaywall();

  // Track property view
  useEffect(() => {
    trackPropertyView(propertyId);
  }, [propertyId]);

  // Check before showing premium features
  const handleShowAIScore = () => {
    if (trackAIScoreAccess(propertyId)) {
      // User has access
      showAIScore();
    }
    // Paywall shows automatically if blocked
  };

  const handleSuccess = () => {
    resetPaywallState();
    closePaywall();
  };

  return (
    <>
      {/* Your component */}
      
      <PaywallModalEnhanced
        isOpen={isPaywallOpen}
        onClose={closePaywall}
        onPaymentSuccess={handleSuccess}
      />
    </>
  );
}
```

### Integrate Error Logging

```typescript
import { logError, logApiError, setUserContext } from '@/lib/errorLogger';

// In your auth flow
useEffect(() => {
  if (user) {
    setUserContext(user.id, user.email);
  }
}, [user]);

// In API calls
try {
  const response = await fetch('/api/endpoint');
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
} catch (error) {
  logApiError('/api/endpoint', 'GET', error);
  throw error;
}

// For user actions
try {
  // Some risky operation
} catch (error) {
  logUserActionError('submit_form', error);
}
```

---

## 🚀 Deployment Checklist

- [x] ErrorBoundary wraps entire app
- [x] Error logger initialized
- [x] Paywall hook created
- [x] PaywallModal enhanced with features
- [x] Analytics tracking configured
- [ ] Backend payment endpoint configured (`/api/payments/create-intent`)
- [ ] Backend payment verification endpoint configured (`/api/payments/verify`)
- [ ] Backend error logging endpoint configured (`/api/errors/log`)
- [ ] Stripe API keys configured (production)
- [ ] Google Analytics configured (if not already)
- [ ] Test all error scenarios
- [ ] Test paywall conversion flow
- [ ] Monitor error logs after launch
- [ ] Monitor paywall conversion rate

---

## 🔧 Configuration

### Environment Variables

```bash
# .env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Replace with production key
```

### Backend Endpoints Required

**1. Create Payment Intent:**
```
POST /api/payments/create-intent
Body: { guestEmail, guestName, triggeredBy }
Response: { clientSecret }
```

**2. Verify Payment:**
```
POST /api/payments/verify
Body: { paymentIntentId }
Response: { success: boolean }
```

**3. Log Errors (Optional):**
```
POST /api/errors/log
Body: ErrorLog object
Response: { success: boolean }
```

---

## 📊 Metrics to Track

### Error Boundary Metrics
- Error frequency by type (network, auth, server, client)
- Error recovery rate (user actions after error)
- Most common error messages
- Error rate by page/route

### Paywall Metrics
- Paywall impression rate
- Conversion rate by trigger type
- Average views before paywall
- Revenue per paywall impression
- Abandonment rate
- Feature comparison view rate

---

## 🎯 Future Enhancements

### Error Boundary
- [ ] Integrate with Sentry for advanced error tracking
- [ ] Add retry logic with exponential backoff
- [ ] Component-level error boundaries for partial failures
- [ ] Custom error pages per route
- [ ] A/B test different error messages

### Paywall
- [ ] Add social proof (testimonials, user count)
- [ ] Implement exit-intent popup
- [ ] A/B test different price points
- [ ] Add discount codes
- [ ] Implement referral rewards
- [ ] Add "Why this price?" explainer
- [ ] Implement tiered pricing (Basic/Pro/Enterprise)

---

## 📝 Notes

- **Error logs are stored in localStorage** - Clear periodically or implement cleanup
- **Paywall state persists across sessions** - Reset after payment
- **Backend endpoints are placeholders** - Implement actual payment processing
- **Analytics integration is optional** - Works standalone but tracking is recommended
- **Free tier limits are configurable** - Adjust `FREE_PROPERTY_VIEW_LIMIT` in `usePaywall.ts`

---

## 🐛 Known Issues & Limitations

1. **Backend endpoints not implemented** - Placeholder fetch calls will fail until backend is ready
2. **User subscription check is stubbed** - Currently assumes all users are free
3. **Google Analytics events** - Only fire if `gtag` is available on window
4. **Error logger backend** - Only sends in production, requires endpoint implementation

---

## 👥 Support

For questions or issues:
- Create an issue in the repository
- Contact: support@apartmentlocatorai.com
- Check error logs: `localStorage.getItem('apartmentiq-error-logs')`

---

**Last Updated:** February 4, 2026  
**Implemented By:** AI Assistant  
**Reviewed By:** Pending
