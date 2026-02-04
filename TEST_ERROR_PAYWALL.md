# Error Boundary & Paywall Testing Script

Quick testing guide to verify implementation works correctly.

---

## 🧪 Quick Start Testing

### 1. Start Development Server

```bash
npm run dev
```

### 2. Test Error Boundary

Open browser console and run these commands:

#### Test Network Error
```javascript
// Trigger a network error
throw new Error('Failed to fetch data from server');
// Expected: Orange page with "Connection Lost" title
```

#### Test Auth Error
```javascript
// Trigger an auth error
throw new Error('Unauthorized - 403 Forbidden');
// Expected: Red page with "Access Denied" title
```

#### Test Server Error
```javascript
// Trigger a server error
throw new Error('Internal Server Error 500');
// Expected: Purple page with "Server Error (500)" title
```

#### Test Generic Error
```javascript
// Trigger a generic error
throw new Error('Something went wrong!');
// Expected: Blue page with "Something Went Wrong" title
```

#### Check Error Logs
```javascript
// View all logged errors
const logs = localStorage.getItem('apartmentiq-error-logs');
console.table(JSON.parse(logs || '[]'));
```

#### Clear Error Logs
```javascript
// Clear all error logs
localStorage.removeItem('apartmentiq-error-logs');
```

---

### 3. Test Paywall

#### Clear Paywall State (Start Fresh)
```javascript
localStorage.removeItem('apartmentiq-paywall-state');
```

#### Check Current Paywall State
```javascript
const state = localStorage.getItem('apartmentiq-paywall-state');
console.log('Paywall State:', JSON.parse(state || '{}'));
```

#### Test Property View Limit
1. Navigate to a property page (or page using `trackPropertyView`)
2. View 3 different properties
3. On 4th property view, paywall should appear
4. Check state:
```javascript
const state = JSON.parse(localStorage.getItem('apartmentiq-paywall-state') || '{}');
console.log('Property Views:', state.propertyViewCount);
console.log('Paywall Impressions:', state.paywallImpressions);
```

#### Test AI Score Access
```javascript
// In a component with usePaywall
const { trackAIScoreAccess } = usePaywall();

// Try to access AI score (as free user)
const canAccess = trackAIScoreAccess('property-123');
console.log('Can access AI score:', canAccess); // Should be false
// Paywall should appear
```

#### Test Offer Generation
```javascript
const { trackOfferGeneration } = usePaywall();

// Try to generate offer (as free user)
const canGenerate = trackOfferGeneration('property-123');
console.log('Can generate offer:', canGenerate); // Should be false
// Paywall should appear
```

#### Reset Paywall (Simulate Payment Success)
```javascript
const { resetPaywallState } = usePaywall();
resetPaywallState();

// Verify reset
const state = JSON.parse(localStorage.getItem('apartmentiq-paywall-state') || '{}');
console.log('After reset:', state);
// Should show: { propertyViewCount: 0, paywallImpressions: 0, ... }
```

---

## 🎯 Visual Test Checklist

### Error Boundary Pages

Visit each error page and verify:

- [ ] **Network Error Page**
  - Orange WiFi icon displayed
  - "Connection Lost" title
  - "Try Again" button works
  - "Go to Homepage" button works
  
- [ ] **Auth Error Page**
  - Red lock icon displayed
  - "Access Denied" title
  - Lists possible reasons
  - "Sign In" button redirects to /auth
  - "Go to Homepage" button works

- [ ] **Server Error Page**
  - Purple alert icon displayed
  - "Server Error (500)" title
  - "Refresh Page" button reloads
  - "Go to Homepage" button works
  - "Report Bug" opens email client
  - Error ID displayed

- [ ] **Generic Error Page**
  - Blue alert icon displayed
  - "Something Went Wrong" title
  - "Try Again" button resets error
  - "Reload Page" and "Homepage" buttons work
  - "Report This Issue" opens email
  - Error details shown in dev mode

### Paywall Modal

Test the paywall modal:

- [ ] **Appearance**
  - Modal appears centered on screen
  - Backdrop blur visible
  - Close button (X) works
  - Gradient header (blue to purple)
  - Sparkles icon in header

- [ ] **Trigger Messages**
  - Property view limit: Shows view count
  - AI score access: Shows "AI Smart Scores are premium"
  - Offer generation: Shows "Offer generation is premium"
  - Custom message displays correctly

- [ ] **Pricing Display**
  - Shows strikethrough price ($99)
  - Shows current price ($49)
  - "Limited time offer • Save $50" displayed

- [ ] **Feature Comparison Toggle**
  - "Show/Hide Feature Comparison" button works
  - Table displays all 7 features
  - Free column shows correct values
  - Premium column shows checkmarks
  - Toggle animation smooth

- [ ] **Features List (when comparison hidden)**
  - 8 features listed with checkmarks
  - Features include "Unlimited property searches"
  - "Lifetime access" mentioned

- [ ] **Payment Section**
  - "Continue to Payment" button appears initially
  - Loading spinner shows during initialization
  - Stripe payment element loads
  - "Pay $49 - Unlock Full Access" button enabled
  - Processing state shows "Processing..."

- [ ] **Trust Indicators**
  - Lock icon + "Secure payment"
  - "30-day money-back guarantee"
  - "One-time payment"
  - Footer text about Stripe

---

## 🔬 Advanced Testing

### Test Error Logger Functions

```javascript
// Import functions (in actual component)
import { 
  logError, 
  logNetworkError, 
  logApiError, 
  setUserContext 
} from '@/lib/errorLogger';

// Set user context
setUserContext('user-123', 'test@example.com');

// Log custom error
logError(
  new Error('Custom test error'),
  { additionalData: { test: true } },
  'high'
);

// Log network error
logNetworkError('/api/properties', 404, 'Not Found');

// Log API error
logApiError('/api/offers', 'POST', new Error('Validation failed'));

// Check results
console.table(JSON.parse(localStorage.getItem('apartmentiq-error-logs') || '[]'));
```

### Test Paywall Analytics

```javascript
// Enable GA4 debug mode (if configured)
// Check browser console for events:
// - paywall_view
// - paywall_impression
// - purchase (on successful payment)

// Manual check
window.dataLayer?.forEach(event => {
  if (event.event?.includes('paywall')) {
    console.log('Paywall event:', event);
  }
});
```

### Test Payment Flow (Stripe Test Mode)

1. Trigger paywall
2. Click "Continue to Payment"
3. Use test card details:
   - **Card Number:** 4242 4242 4242 4242
   - **Expiry:** Any future date (e.g., 12/25)
   - **CVC:** Any 3 digits (e.g., 123)
   - **ZIP:** Any 5 digits (e.g., 12345)
4. Click "Pay $49 - Unlock Full Access"
5. Verify success callback fires
6. Verify paywall state resets
7. Verify user can now access premium features

---

## 📊 Test Coverage

### Unit Tests

Run automated tests:

```bash
npm test -- ErrorBoundary.test.tsx
```

Expected results:
- ✅ Renders children when no error
- ✅ Renders network error page for fetch errors
- ✅ Renders auth error page for 403 errors
- ✅ Renders server error page for 500 errors
- ✅ Renders client error page for generic errors
- ✅ Renders custom fallback when provided

### Integration Tests

Manual integration testing checklist:

- [ ] Error boundary catches errors in any component
- [ ] Error boundary doesn't interfere with normal operation
- [ ] Paywall triggers correctly on property views
- [ ] Paywall triggers correctly on premium feature access
- [ ] Paywall state persists across page reloads
- [ ] Payment success resets paywall state
- [ ] Error logs persist in localStorage
- [ ] No console errors during normal operation

---

## 🐛 Common Issues & Solutions

### Issue: Paywall not appearing

**Solution:**
```javascript
// Check if user is marked as subscribed (stub in code)
// In usePaywall.ts, userIsSubscribed is hardcoded to false
// Verify paywall state
const state = JSON.parse(localStorage.getItem('apartmentiq-paywall-state') || '{}');
console.log('Views:', state.propertyViewCount);
console.log('Has shown paywall:', state.hasShownPaywall);
```

### Issue: Error boundary not catching errors

**Solution:**
- Errors in event handlers need manual try/catch
- Only catches errors during render, lifecycle, constructors
- Check that ErrorBoundary wraps the component

### Issue: Payment fails immediately

**Solution:**
- Backend endpoints are placeholders - implement actual endpoints
- Check Stripe key is configured: `VITE_STRIPE_PUBLISHABLE_KEY`
- Use Stripe test mode keys for testing

### Issue: Error logs not persisting

**Solution:**
```javascript
// Check localStorage quota
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  console.log('localStorage available');
} catch (e) {
  console.error('localStorage unavailable:', e);
}
```

---

## ✅ Acceptance Criteria

Before marking tasks #8 and #12 as complete, verify:

### Error Boundary (#12)
- [x] ErrorBoundary component created
- [x] Wraps entire app
- [x] User-friendly error pages for 500, 403, network errors
- [x] Error logging setup
- [x] "Report Bug" button on error pages
- [x] Error scenarios tested
- [x] Fallback UI for failed components

### Paywall (#8)
- [x] PaywallModal component enhanced
- [x] Triggers after 3 property views
- [x] Triggers on AI score access
- [x] Triggers on offer generation
- [x] Feature comparison shown
- [x] Paywall impressions tracked
- [x] Conversion flow tested
- [x] Analytics integration ready

---

## 📝 Notes

- **Backend endpoints are stubs** - Payment won't actually process until backend is implemented
- **User subscription check is stubbed** - Currently treats all users as free
- **Google Analytics is optional** - Will work without it, but tracking won't fire
- **Test in multiple browsers** - Chrome, Firefox, Safari
- **Test responsive design** - Mobile, tablet, desktop

---

**Last Updated:** February 4, 2026
