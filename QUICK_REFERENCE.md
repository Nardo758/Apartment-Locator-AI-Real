# Quick Reference: Error Boundaries & Paywall

Fast copy-paste guide for common tasks.

---

## 🚨 Error Handling

### Log an Error
```typescript
import { logError } from '@/lib/errorLogger';

try {
  // risky code
} catch (error) {
  logError(error, { 
    componentName: 'MyComponent',
    action: 'submit_form' 
  });
}
```

### Log API Error
```typescript
import { logApiError } from '@/lib/errorLogger';

try {
  const res = await fetch('/api/endpoint');
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
} catch (error) {
  logApiError('/api/endpoint', 'GET', error);
}
```

### Set User Context
```typescript
import { setUserContext } from '@/lib/errorLogger';

useEffect(() => {
  if (user) {
    setUserContext(user.id, user.email);
  }
}, [user]);
```

### View Error Logs
```javascript
// Browser console
const logs = localStorage.getItem('apartmentiq-error-logs');
console.table(JSON.parse(logs || '[]'));
```

---

## 💰 Paywall Integration

### Basic Setup
```tsx
import { usePaywall } from '@/hooks/usePaywall';
import { PaywallModalEnhanced } from '@/components/PaywallModalEnhanced';

export function MyComponent() {
  const {
    isPaywallOpen,
    closePaywall,
    resetPaywallState,
  } = usePaywall();

  const handleSuccess = () => {
    resetPaywallState();
    closePaywall();
  };

  return (
    <>
      {/* Your content */}
      
      <PaywallModalEnhanced
        isOpen={isPaywallOpen}
        onClose={closePaywall}
        onPaymentSuccess={handleSuccess}
      />
    </>
  );
}
```

### Track Property View
```tsx
const { trackPropertyView } = usePaywall();

useEffect(() => {
  trackPropertyView(propertyId);
}, [propertyId]);
```

### Check Premium Feature Access
```tsx
const { trackAIScoreAccess } = usePaywall();

const handleShowAIScore = () => {
  if (trackAIScoreAccess(propertyId)) {
    // Show AI score
    showAIScore();
  }
  // Paywall shows automatically if blocked
};
```

### Check Remaining Views
```tsx
const { getRemainingViews } = usePaywall();

const remaining = getRemainingViews();
console.log(`${remaining} free views left`);
```

### Reset Paywall State
```tsx
const { resetPaywallState } = usePaywall();

// After successful payment
resetPaywallState();
```

---

## 🧪 Testing

### Trigger Errors in Console

```javascript
// Network error
throw new Error('Failed to fetch');

// Auth error
throw new Error('Forbidden - 403');

// Server error
throw new Error('Internal Server Error 500');

// Generic error
throw new Error('Something broke!');
```

### Check Paywall State

```javascript
const state = JSON.parse(
  localStorage.getItem('apartmentiq-paywall-state') || '{}'
);
console.log('Paywall State:', state);
```

### Reset Paywall

```javascript
localStorage.removeItem('apartmentiq-paywall-state');
location.reload();
```

### Test Payment (Stripe Test Card)

```
Card Number: 4242 4242 4242 4242
Expiry: 12/25 (any future date)
CVC: 123 (any 3 digits)
ZIP: 12345 (any 5 digits)
```

---

## 📦 Environment Variables

```bash
# .env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🔧 Backend Endpoints Needed

```typescript
// 1. Create Payment Intent
POST /api/payments/create-intent
Body: { guestEmail, guestName, triggeredBy }
Response: { clientSecret: string }

// 2. Verify Payment
POST /api/payments/verify
Body: { paymentIntentId: string }
Response: { success: boolean }

// 3. Log Errors (Optional)
POST /api/errors/log
Body: ErrorLog
Response: { success: boolean }
```

---

## 📊 Check Analytics

```javascript
// Google Analytics events
window.dataLayer?.forEach(event => {
  if (event.event?.includes('paywall')) {
    console.log(event);
  }
});
```

---

## 🐛 Troubleshooting

### Paywall Not Showing
```javascript
// Check state
const state = localStorage.getItem('apartmentiq-paywall-state');
console.log(JSON.parse(state || '{}'));

// Check view count
// propertyViewCount should be >= 3 for trigger
```

### Error Boundary Not Catching
```typescript
// Only catches render errors, not event handlers
// Use try/catch in event handlers:

const handleClick = async () => {
  try {
    await riskyOperation();
  } catch (error) {
    logError(error);
  }
};
```

### Payment Fails
```bash
# Check Stripe key is set
echo $VITE_STRIPE_PUBLISHABLE_KEY

# Check backend endpoints exist
curl -X POST http://localhost:5000/api/payments/create-intent
```

---

## 📝 Common Patterns

### Property Page Pattern
```tsx
const PropertyPage = () => {
  const { id } = useParams();
  const {
    trackPropertyView,
    trackAIScoreAccess,
    isPaywallOpen,
    closePaywall,
    resetPaywallState,
  } = usePaywall();

  useEffect(() => {
    trackPropertyView(id!);
  }, [id]);

  return (
    <>
      <PropertyDetails />
      
      <Button onClick={() => {
        if (trackAIScoreAccess(id!)) {
          showAIScore();
        }
      }}>
        View AI Score
      </Button>

      <PaywallModalEnhanced
        isOpen={isPaywallOpen}
        onClose={closePaywall}
        onPaymentSuccess={() => {
          resetPaywallState();
          closePaywall();
        }}
      />
    </>
  );
};
```

### API Call with Error Logging
```tsx
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    logApiError('/api/data', 'GET', error);
    throw error;
  }
};
```

---

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `src/components/ErrorBoundary.tsx` | Main error boundary |
| `src/lib/errorLogger.ts` | Error logging service |
| `src/hooks/usePaywall.ts` | Paywall hook |
| `src/components/PaywallModalEnhanced.tsx` | Paywall modal |
| `src/examples/PropertyViewWithPaywall.tsx` | Integration example |
| `ERROR_BOUNDARY_PAYWALL_IMPLEMENTATION.md` | Full documentation |
| `TEST_ERROR_PAYWALL.md` | Testing guide |

---

**Need Help?** Check the full documentation in `ERROR_BOUNDARY_PAYWALL_IMPLEMENTATION.md`
