# Testing Protected Routes - Quick Start Guide

## How to Test the Implementation

### Prerequisites
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:5173`

---

## Test Scenarios

### 1. Unauthenticated Access Protection

**Goal:** Verify that protected routes redirect to /auth when not logged in

**Steps:**
1. Make sure you're logged out (clear localStorage if needed)
2. Try to access these URLs directly:
   - `http://localhost:5173/dashboard`
   - `http://localhost:5173/portfolio-dashboard`
   - `http://localhost:5173/agent-dashboard`
   - `http://localhost:5173/saved-properties`

**Expected Result:**
- ✅ All should redirect to `/auth` login page
- ✅ After login, should return to the page you tried to access

---

### 2. User Type Selection Flow

**Goal:** Verify new users are prompted to select their type

**Steps:**
1. Create a new account at `/signup`
2. Complete signup

**Expected Result:**
- ✅ Redirected to `/user-type` page
- ✅ See three options: Renter, Landlord, Agent
- ✅ Selecting "Renter" → redirects to `/program-ai`
- ✅ Selecting "Landlord" → redirects to `/landlord-onboarding`
- ✅ Selecting "Agent" → redirects to `/agent-onboarding`

---

### 3. Role-Based Access Control (RBAC)

**Goal:** Verify users can only access routes for their user type

#### Test as Renter

**Setup:**
1. Login or create account
2. Select "Renter" as user type

**Test Access:**
- ✅ CAN access:
  - `/dashboard`
  - `/program-ai`
  - `/saved-properties`
  - `/generate-offer`
  - `/profile`
  - `/billing`

- ❌ CANNOT access (should redirect to `/dashboard`):
  - `/portfolio-dashboard`
  - `/renewal-optimizer`
  - `/agent-dashboard`
  - `/admin`

#### Test as Landlord

**Setup:**
1. Logout
2. Login again or create new account
3. Select "Landlord" as user type

**Test Access:**
- ✅ CAN access:
  - `/dashboard`
  - `/portfolio-dashboard`
  - `/renewal-optimizer`
  - `/email-templates`
  - `/verify-lease`
  - `/profile`
  - `/billing`

- ❌ CANNOT access (should redirect to `/portfolio-dashboard`):
  - `/program-ai`
  - `/saved-properties`
  - `/agent-dashboard`
  - `/admin`

#### Test as Agent

**Setup:**
1. Logout
2. Login again or create new account
3. Select "Agent" as user type

**Test Access:**
- ✅ CAN access:
  - `/dashboard`
  - `/agent-dashboard`
  - `/profile`
  - `/billing`

- ❌ CANNOT access (should redirect to `/agent-dashboard`):
  - `/program-ai`
  - `/portfolio-dashboard`
  - `/renewal-optimizer`
  - `/admin`

---

### 4. Loading States

**Goal:** Verify smooth loading experience

**Steps:**
1. While logged in, refresh the page on `/dashboard`
2. Watch for loading spinner

**Expected Result:**
- ✅ Brief loading spinner appears
- ✅ No flash of login page
- ✅ Smooth transition to dashboard

---

### 5. Return-to-Intended-Destination

**Goal:** Verify users return to page they tried to access after login

**Steps:**
1. Logout completely
2. Try to access `/saved-properties` directly
3. You'll be redirected to `/auth`
4. Login with valid credentials

**Expected Result:**
- ✅ After login, automatically redirected to `/saved-properties`
- ✅ Not stuck on `/auth` or `/dashboard`

---

## Manual Testing Checklist

Copy this checklist and mark off as you test:

### Unauthenticated Access
- [ ] `/dashboard` redirects to `/auth` when logged out
- [ ] `/portfolio-dashboard` redirects to `/auth` when logged out
- [ ] `/agent-dashboard` redirects to `/auth` when logged out
- [ ] Public routes (`/`, `/about`, `/pricing`) work without login

### User Type Selection
- [ ] New signup redirects to `/user-type`
- [ ] Selecting "Renter" works correctly
- [ ] Selecting "Landlord" works correctly
- [ ] Selecting "Agent" works correctly
- [ ] "Skip for now" button redirects to `/dashboard`

### Renter Access Control
- [ ] Can access `/dashboard`
- [ ] Can access `/program-ai`
- [ ] Can access `/saved-properties`
- [ ] CANNOT access `/portfolio-dashboard` (redirects)
- [ ] CANNOT access `/agent-dashboard` (redirects)

### Landlord Access Control
- [ ] Can access `/dashboard`
- [ ] Can access `/portfolio-dashboard`
- [ ] Can access `/renewal-optimizer`
- [ ] CANNOT access `/program-ai` (redirects)
- [ ] CANNOT access `/agent-dashboard` (redirects)

### Agent Access Control
- [ ] Can access `/dashboard`
- [ ] Can access `/agent-dashboard`
- [ ] CANNOT access `/portfolio-dashboard` (redirects)
- [ ] CANNOT access `/program-ai` (redirects)

### Common Routes (All User Types)
- [ ] All types can access `/profile`
- [ ] All types can access `/billing`
- [ ] All types can access `/help`
- [ ] All types can access `/contact`

### Loading States
- [ ] Loading spinner shows during auth check
- [ ] No flash of unauthorized content
- [ ] Smooth transitions between pages

### Return to Intended Destination
- [ ] Accessing protected route while logged out saves destination
- [ ] After login, redirected back to intended page
- [ ] Works for different route types

---

## Debugging Tools

### Check Current User Type

Open browser console and run:
```javascript
localStorage.getItem('userType')
```

Expected output: `"renter"`, `"landlord"`, `"agent"`, or `null`

### Check Authentication Token

```javascript
localStorage.getItem('auth_token')
```

Should return a token string if logged in, or `null` if logged out.

### Clear User Type (Reset)

```javascript
localStorage.removeItem('userType')
localStorage.removeItem('auth_token')
window.location.href = '/user-type'
```

### Change User Type (for testing)

```javascript
// Change to renter
localStorage.setItem('userType', 'renter')
window.location.reload()

// Change to landlord
localStorage.setItem('userType', 'landlord')
window.location.reload()

// Change to agent
localStorage.setItem('userType', 'agent')
window.location.reload()
```

---

## Common Issues and Solutions

### Issue: Redirect Loop

**Symptoms:** Page keeps redirecting between `/user-type` and another route

**Solution:**
```javascript
// Clear corrupted state
localStorage.clear()
// Then login again and select user type
```

### Issue: Can't Access Any Routes

**Symptoms:** All routes redirect to `/auth` even when logged in

**Solution:**
1. Check if auth token exists:
   ```javascript
   console.log(localStorage.getItem('auth_token'))
   ```
2. If `null`, login again
3. If exists but still redirecting, clear and re-login:
   ```javascript
   localStorage.clear()
   ```

### Issue: Accessing Wrong User Type Routes

**Symptoms:** Renter can access landlord routes (or vice versa)

**Solution:**
This is a bug! Check:
1. Is `ProtectedRoute` wrapper present in `App.tsx`?
2. Is `allowedUserTypes` prop correct?
3. Report to developer if issue persists

### Issue: Loading Spinner Never Disappears

**Symptoms:** Stuck on loading screen

**Solution:**
1. Check console for errors (F12 → Console tab)
2. Verify API is running (backend server)
3. Clear localStorage and try again:
   ```javascript
   localStorage.clear()
   window.location.href = '/'
   ```

---

## Automated Testing (Future)

### Unit Tests

```bash
npm run test
```

Tests to add:
- ProtectedRoute redirects unauthenticated users
- ProtectedRoute allows authenticated users
- ProtectedRoute respects user type restrictions
- authRouter functions return correct routes
- useUser hook manages user type correctly

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

Scenarios to automate:
- Complete signup and user type selection flow
- Login and access protected route
- Try accessing route with wrong user type
- Verify return-to-intended-destination

---

## Performance Testing

### Metrics to Check

1. **Time to Interactive (TTI):**
   - Loading spinner duration should be < 500ms
   
2. **Redirect Speed:**
   - Unauthorized redirects should be instant

3. **Auth Check:**
   - Initial auth check should not block rendering of public pages

### How to Measure

Use Chrome DevTools:
1. Open DevTools (F12)
2. Go to "Performance" tab
3. Record page load
4. Check timing of auth checks

---

## Test Report Template

```markdown
## Protected Routes Test Report

**Date:** [DATE]
**Tester:** [NAME]
**Environment:** Development / Staging / Production

### Results Summary
- Total Tests: [NUMBER]
- Passed: [NUMBER]
- Failed: [NUMBER]

### Detailed Results

#### Unauthenticated Access
- [ ] PASS / [ ] FAIL - Dashboard redirect
- [ ] PASS / [ ] FAIL - Portfolio redirect
- [ ] PASS / [ ] FAIL - Agent redirect

#### User Type Selection
- [ ] PASS / [ ] FAIL - Renter selection
- [ ] PASS / [ ] FAIL - Landlord selection
- [ ] PASS / [ ] FAIL - Agent selection

#### RBAC (Renter)
- [ ] PASS / [ ] FAIL - Can access renter routes
- [ ] PASS / [ ] FAIL - Cannot access landlord routes

#### RBAC (Landlord)
- [ ] PASS / [ ] FAIL - Can access landlord routes
- [ ] PASS / [ ] FAIL - Cannot access renter routes

#### RBAC (Agent)
- [ ] PASS / [ ] FAIL - Can access agent routes
- [ ] PASS / [ ] FAIL - Cannot access other routes

### Issues Found
1. [Description of issue]
2. [Description of issue]

### Notes
[Any additional observations]
```

---

## Next Steps After Testing

1. ✅ Complete manual testing checklist
2. ⏳ Document any bugs found
3. ⏳ Fix critical bugs
4. ⏳ Implement automated tests
5. ⏳ Test on multiple browsers
6. ⏳ Test on mobile devices
7. ⏳ Backend integration testing

---

**Happy Testing! 🧪**

If you find any issues, document them and report to the development team.
