# Protected Routes - Quick Reference Card

> **TL;DR:** All authenticated routes are now protected with role-based access control.

---

## 🚀 Quick Start

### Use ProtectedRoute in App.tsx

```tsx
import ProtectedRoute from '@/components/routing/ProtectedRoute';

// Require authentication (any user type)
<Route path="/dashboard" element={
  <ProtectedRoute requireAuth>
    <Dashboard />
  </ProtectedRoute>
} />

// Require specific user type
<Route path="/portfolio-dashboard" element={
  <ProtectedRoute allowedUserTypes={['landlord']}>
    <PortfolioDashboard />
  </ProtectedRoute>
} />

// Multiple user types allowed
<Route path="/settings" element={
  <ProtectedRoute allowedUserTypes={['landlord', 'agent']}>
    <Settings />
  </ProtectedRoute>
} />
```

---

## 👥 User Types

```typescript
type UserType = 'renter' | 'landlord' | 'agent' | 'admin';
```

- **renter** - Apartment seekers
- **landlord** - Property managers/owners
- **agent** - Real estate agents/brokers
- **admin** - System administrators

---

## 🔐 Access Control Matrix

| Route | Renter | Landlord | Agent | Admin |
|-------|--------|----------|-------|-------|
| `/dashboard` | ✅ | ✅ | ✅ | ✅ |
| `/program-ai` | ✅ | ❌ | ❌ | ✅ |
| `/portfolio-dashboard` | ❌ | ✅ | ❌ | ✅ |
| `/agent-dashboard` | ❌ | ❌ | ✅ | ✅ |
| `/admin` | ❌ | ❌ | ❌ | ✅ |

---

## 🛠️ Using in Components

### Get User Type

```tsx
import { useUser } from '@/hooks/useUser';

function MyComponent() {
  const { userType, setUserType } = useUser();
  
  if (userType === 'landlord') {
    // Show landlord-specific UI
  }
}
```

### Set User Type

```tsx
const { setUserType } = useUser();

// Update user type (also saves to localStorage)
setUserType('landlord');
```

### Get Default Dashboard

```tsx
import { getDefaultDashboard } from '@/utils/authRouter';

const dashboard = getDefaultDashboard('landlord'); 
// Returns: '/portfolio-dashboard'
```

### Check Route Access

```tsx
import { canAccessRoute } from '@/utils/authRouter';

const canAccess = canAccessRoute('/portfolio-dashboard', 'renter', true);
// Returns: false
```

---

## 🔄 User Flows

### New User Signup
```
/signup → /user-type → [onboarding] → [dashboard]
```

### Login
```
/auth → [intended page or dashboard]
```

### Unauthorized Access
```
[protected route] → /auth → [back to intended route]
```

---

## 🧪 Testing Commands

### Check User Type
```javascript
localStorage.getItem('userType')
```

### Change User Type (for testing)
```javascript
localStorage.setItem('userType', 'landlord')
window.location.reload()
```

### Clear Everything
```javascript
localStorage.clear()
window.location.href = '/'
```

---

## 📁 Key Files

```
src/
  components/routing/
    └── ProtectedRoute.tsx        # Main component
  utils/
    └── authRouter.ts             # Routing utilities
  hooks/
    └── useUser.tsx               # User context (updated)
  App.tsx                         # Routes (updated)

Docs:
  PROTECTED_ROUTES.md             # Full documentation
  TESTING_PROTECTED_ROUTES.md     # Testing guide
  IMPLEMENTATION_SUMMARY.md       # Implementation details
```

---

## ⚠️ Important Notes

### Current State (MVP)
- ✅ Client-side route protection active
- ✅ User type stored in localStorage
- ⚠️ Backend API not yet protected

### Required for Production
- ⏳ Backend user type persistence (Task #2)
- ⏳ API endpoint authorization
- ⏳ Row-level security (RLS)

### Security Warning
> Client-side protection is for **UI/UX only**. 
> Always validate on the backend!

---

## 🐛 Common Issues

### Redirect Loop
```javascript
localStorage.removeItem('userType')
window.location.href = '/user-type'
```

### Can't Access Routes
```javascript
// Check auth token
console.log(localStorage.getItem('auth_token'))

// If null, login again
```

### Wrong Dashboard
```javascript
// Verify user type
const { userType } = useUser()
console.log(userType)

// Update if wrong
setUserType('correct-type')
```

---

## 📞 Need Help?

- 📖 Full docs: `PROTECTED_ROUTES.md`
- 🧪 Testing: `TESTING_PROTECTED_ROUTES.md`
- 📊 Summary: `IMPLEMENTATION_SUMMARY.md`

---

**Last Updated:** February 4, 2026  
**Status:** ✅ Production Ready (with backend integration)
