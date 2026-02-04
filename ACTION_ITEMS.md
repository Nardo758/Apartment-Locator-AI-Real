# Apartment Locator AI - Priority Action Items

**Quick Reference for Critical Fixes**  
*See ARCHITECTURAL_REVIEW.md for full details*

---

## 🔴 CRITICAL - Fix Immediately (Week 1)

### 1. Implement Protected Routes
**Priority:** 🔴 **CRITICAL**  
**Effort:** 2-3 hours  
**Impact:** Prevents unauthorized access to authenticated pages

**Tasks:**
- [ ] Create `src/components/routing/ProtectedRoute.tsx`
- [ ] Wrap all authenticated routes in `App.tsx`
- [ ] Add user type enforcement for role-specific routes
- [ ] Test all flows (renter, landlord, agent)

**Files to Update:**
- `src/components/routing/ProtectedRoute.tsx` (new)
- `src/App.tsx`

---

### 2. Add User Type to Backend & Context
**Priority:** 🔴 **CRITICAL**  
**Effort:** 3-4 hours  
**Impact:** Fixes cross-device user type sync, eliminates localStorage fragility

**Tasks:**
- [ ] Update `User` interface in `useUser.tsx` to include `userType` field
- [ ] Add `hasCompletedOnboarding` field to User interface
- [ ] Create backend API endpoint: `PATCH /api/users/:id/profile`
- [ ] Add `updateUserType()` method to `UserProvider`
- [ ] Update `UserTypeSelection.tsx` to save to backend instead of localStorage
- [ ] Test user type persistence across sessions

**Files to Update:**
- `src/hooks/useUser.tsx`
- `src/lib/api.ts`
- `src/pages/UserTypeSelection.tsx`
- Backend: User model, routes

---

### 3. Implement Post-Auth Routing
**Priority:** 🔴 **CRITICAL**  
**Effort:** 1-2 hours  
**Impact:** Better UX, sends users to correct dashboard

**Tasks:**
- [ ] Create `src/utils/authRouter.ts` with `getAuthenticatedRoute()` function
- [ ] Add routing logic to `AuthModern.tsx` after login/signup
- [ ] Handle cases: no user type, incomplete onboarding, completed profile
- [ ] Test all authentication flows

**Files to Update:**
- `src/utils/authRouter.ts` (new)
- `src/pages/AuthModern.tsx`
- `src/pages/Trial.tsx`

**Code Template:**
```typescript
// src/utils/authRouter.ts
export function getAuthenticatedRoute(user: User): string {
  if (!user.userType) return '/user-type';
  if (!user.hasCompletedOnboarding) {
    switch (user.userType) {
      case 'renter': return '/program-ai';
      case 'landlord': return '/landlord-onboarding';
      case 'agent': return '/agent-onboarding';
    }
  }
  switch (user.userType) {
    case 'renter': return '/dashboard';
    case 'landlord': return '/portfolio-dashboard';
    case 'agent': return '/agent-dashboard';
    default: return '/dashboard';
  }
}
```

---

## ⚠️ HIGH PRIORITY - Fix This Sprint (Week 2)

### 4. Resolve Context Provider Overlap
**Priority:** ⚠️ **HIGH**  
**Effort:** 4-6 hours  
**Impact:** Eliminates state sync issues, reduces confusion

**Problem:**
- `UnifiedAIProvider` and `LocationCostProvider` both manage commute preferences
- `commutePreferences` duplicated in both contexts
- Different localStorage keys lead to desyncs

**Tasks:**
- [ ] Decide: Merge LocationCost into UnifiedAI OR clearly separate concerns
- [ ] Consolidate `commutePreferences` (currently duplicated)
- [ ] Update all components using `useLocationCostContext()`
- [ ] Test cost calculations still work

**Recommended Approach:**
- UnifiedAI = User inputs (single source of truth)
- LocationCost = Pure calculation service (no state)

**Files to Update:**
- `src/contexts/UnifiedAIContext.tsx`
- `src/contexts/LocationCostContext.tsx`
- `src/pages/UnifiedDashboard.tsx`

---

### 5. Clean Up OnboardingFlowProvider
**Priority:** ⚠️ **MEDIUM**  
**Effort:** 1-2 hours  
**Impact:** Removes dead code, reduces confusion

**Tasks:**
- [ ] Search codebase for all `OnboardingFlowProvider` usages
- [ ] If unused: Remove from `App.tsx`, delete context files
- [ ] If used: Document why both onboarding systems exist
- [ ] Clean up localStorage keys: `onboardingCurrentStep`, `onboardingFlowData`, `onboardingSteps`

**Files to Update:**
- `src/contexts/OnboardingFlowContext.tsx`
- `src/App.tsx`

---

### 6. Fix Theme Inconsistency
**Priority:** ⚠️ **MEDIUM**  
**Effort:** 1-2 hours  
**Impact:** Professional, consistent UX across all flows

**Problem:**
- UserTypeSelection: Light theme (blue/indigo gradient)
- LandlordOnboarding: **Dark theme** (`bg-[#0a0a0a]`)
- AgentOnboarding: Light theme (blue/indigo gradient)

**Jarring User Experience:**
```
User clicks "Landlord" on light page
  ↓
Suddenly dark theme
  ↓
Confused user
```

**Tasks:**
- [ ] Decide: All light OR all dark OR user toggle
- [ ] Update `LandlordOnboarding.tsx` to match other flows
- [ ] Test visual consistency across all onboarding paths

**Recommended Fix:**
```typescript
// LandlordOnboarding.tsx - Change from dark to light
<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
  <Card className="p-8 bg-white shadow-2xl">
    {/* Rest of content */}
  </Card>
</div>
```

**Files to Update:**
- `src/pages/LandlordOnboarding.tsx`

---

## ✅ MEDIUM PRIORITY - Next Sprint (Week 3)

### 7. Create Unified Storage Manager
**Priority:** ✅ **MEDIUM**  
**Effort:** 3-4 hours  
**Impact:** Better data persistence, versioning, easier debugging

**Current Issues:**
- 7+ different localStorage keys
- No versioning (breaking changes = broken app)
- No cleanup on logout

**Tasks:**
- [ ] Create `src/utils/storageManager.ts`
- [ ] Add versioning to all stored data
- [ ] Implement migration strategy for schema changes
- [ ] Add cleanup on logout
- [ ] Migrate all localStorage calls to use manager

**Files to Update:**
- `src/utils/storageManager.ts` (new)
- All contexts using localStorage

---

### 8. Standardize Button Components
**Priority:** ✅ **LOW**  
**Effort:** 2-3 hours  
**Impact:** Consistent UI, easier maintenance

**Tasks:**
- [ ] Create `PrimaryButton` component (gradient style)
- [ ] Create `SecondaryButton` component
- [ ] Update all button usage across app
- [ ] Document in design system

**Files to Update:**
- `src/components/ui/PrimaryButton.tsx` (new)
- `src/components/ui/SecondaryButton.tsx` (new)
- `src/lib/design-system.ts`

---

## 🐛 Known Bugs to Fix

### Bug #1: User Type Lost on Different Device
**Scenario:** User selects type on desktop, logs in on mobile → type is lost

**Fix:** Store user type in backend (Action Item #2)

---

### Bug #2: Onboarding Data Persists After Completion
**Scenario:** Complete landlord onboarding → revisit page → old data still there

**Fix:**
```typescript
// LandlordOnboarding.tsx - completeOnboarding()
const completeOnboarding = () => {
  // Clear onboarding data
  localStorage.removeItem('landlord_onboarding_properties');
  localStorage.removeItem('landlord_onboarding_monitoring');
  navigate('/portfolio-dashboard');
};
```

---

### Bug #3: No Route Protection
**Scenario:** Unauthenticated user can access `/portfolio-dashboard`

**Fix:** Action Item #1 (Protected Routes)

---

## 📊 Success Metrics

### Before:
- ❌ 0% of authenticated routes protected
- ⚠️ 2 overlapping contexts (UnifiedAI + LocationCost)
- 🔴 3 different theme styles
- ⚠️ 7 localStorage keys
- ❌ User type NOT in backend

### After:
- ✅ 100% of authenticated routes protected
- ✅ 1 unified context for inputs
- ✅ 1 consistent theme
- ✅ 2-3 localStorage keys (versioned)
- ✅ User type persisted to backend

---

## 🗓️ Recommended Timeline

### Week 1: Critical Security Fixes
- Day 1-2: Protected Routes (#1)
- Day 3-4: User Type Backend (#2)
- Day 5: Post-Auth Routing (#3)

### Week 2: State Management
- Day 1-3: Context Consolidation (#4)
- Day 4: OnboardingFlow Cleanup (#5)
- Day 5: Storage Manager (#7)

### Week 3: UX Polish
- Day 1-2: Theme Consistency (#6)
- Day 3-5: Design System (#8)

---

## 📝 Quick Start

**To start implementation:**

1. **Read full review:** `ARCHITECTURAL_REVIEW.md`
2. **Create branch:** `git checkout -b fix/protected-routes`
3. **Start with #1:** Protected Routes (highest priority, quickest win)
4. **Test thoroughly:** All user flows (renter, landlord, agent)
5. **Move to #2:** User type persistence

**Questions?**
- See full details in `ARCHITECTURAL_REVIEW.md`
- Check Appendix B for localStorage key inventory
- Check Appendix C for route access matrix

---

*Last Updated: February 4, 2025*
