# 🚀 Stripe Integration - Deployment Checklist

## Pre-Deployment Setup

### 1. Stripe Dashboard Configuration ⏱️ ~25 minutes

#### A. Create Products (15 min)

Go to: https://dashboard.stripe.com/test/products

**Renter Product:**
- [ ] Name: "Apartment Locator AI - Renter Access"
- [ ] Price: $49.00 USD (one-time)
- [ ] Copy Price ID → `STRIPE_PRICE_RENTER_UNLOCK`

**Landlord Products:**
- [ ] Starter Monthly: $49/month
- [ ] Starter Annual: $470/year
- [ ] Pro Monthly: $99/month
- [ ] Pro Annual: $950/year
- [ ] Enterprise Monthly: $199/month
- [ ] Enterprise Annual: $1,910/year
- [ ] Copy all 6 Price IDs to `.env`

**Agent Products:**
- [ ] Basic Monthly: $79/month
- [ ] Basic Annual: $790/year
- [ ] Team Monthly: $149/month
- [ ] Team Annual: $1,490/year
- [ ] Brokerage Monthly: $299/month
- [ ] Brokerage Annual: $2,990/year
- [ ] Copy all 6 Price IDs to `.env`

#### B. Get API Keys (2 min)

Go to: https://dashboard.stripe.com/test/apikeys

- [ ] Copy Publishable Key (pk_test_...)
- [ ] Copy Secret Key (sk_test_...)
- [ ] Add both to `.env`

#### C. Configure Webhook (8 min)

Go to: https://dashboard.stripe.com/test/webhooks

- [ ] Click "Add endpoint"
- [ ] URL: `https://yourdomain.com/api/webhooks/stripe`
- [ ] Events to select:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.paid`
  - [ ] `invoice.payment_failed`
- [ ] Copy Signing Secret (whsec_...)
- [ ] Add to `.env` as `STRIPE_WEBHOOK_SECRET`

---

### 2. Environment Variables Setup ⏱️ ~5 minutes

**Create/Update `.env` file:**

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# URLs
FRONTEND_URL=http://localhost:5000

# Price IDs (from Stripe Dashboard)
STRIPE_PRICE_RENTER_UNLOCK=price_...

STRIPE_PRICE_LANDLORD_STARTER_MONTHLY=price_...
STRIPE_PRICE_LANDLORD_STARTER_ANNUAL=price_...
STRIPE_PRICE_LANDLORD_PRO_MONTHLY=price_...
STRIPE_PRICE_LANDLORD_PRO_ANNUAL=price_...
STRIPE_PRICE_LANDLORD_ENTERPRISE_MONTHLY=price_...
STRIPE_PRICE_LANDLORD_ENTERPRISE_ANNUAL=price_...

STRIPE_PRICE_AGENT_BASIC_MONTHLY=price_...
STRIPE_PRICE_AGENT_BASIC_ANNUAL=price_...
STRIPE_PRICE_AGENT_TEAM_MONTHLY=price_...
STRIPE_PRICE_AGENT_TEAM_ANNUAL=price_...
STRIPE_PRICE_AGENT_BROKERAGE_MONTHLY=price_...
STRIPE_PRICE_AGENT_BROKERAGE_ANNUAL=price_...
```

- [ ] All environment variables filled in
- [ ] No placeholder values remain

---

### 3. Database Migration ⏱️ ~2 minutes

Run the migration to create subscription tables:

```bash
# Option 1: Using Drizzle ORM
npm run db:push

# Option 2: Manual SQL
psql your_database < database/migrations/003_stripe_subscriptions.sql
```

**Verify:**
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscriptions', 'invoices');

-- Should return 2 rows
```

- [ ] `subscriptions` table created
- [ ] `invoices` table created
- [ ] Indexes created
- [ ] Views created (optional but recommended)

---

### 4. Server Restart ⏱️ ~1 minute

```bash
# Kill existing server
# Restart with new environment variables
npm run dev
```

- [ ] Server starts without errors
- [ ] No "Stripe not configured" warnings
- [ ] Environment variables loaded

---

## Testing Phase ⏱️ ~30 minutes

### Test 1: Renter One-Time Payment (5 min)

1. Navigate to pricing/trial page
2. Click "Unlock Full Access - $49"
3. Complete checkout with test card: `4242 4242 4242 4242`
4. Verify redirect to `/payment-success`
5. Check database:
   ```sql
   SELECT * FROM purchases ORDER BY created_at DESC LIMIT 1;
   -- Should show status = 'completed'
   ```

- [ ] Checkout loads successfully
- [ ] Payment completes
- [ ] Redirect works
- [ ] Database updated
- [ ] User granted access

### Test 2: Landlord Subscription (10 min)

**Test Starter Plan:**
1. Navigate to landlord pricing
2. Click "Start 14-Day Free Trial" on Starter
3. Complete checkout
4. Verify trial period shows
5. Check database:
   ```sql
   SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 1;
   -- Should show status = 'trialing', plan_type = 'landlord_starter'
   ```

- [ ] Checkout shows correct price ($49/mo or $470/yr)
- [ ] Trial period displayed (14 days)
- [ ] Subscription created
- [ ] User tier updated

**Test Other Plans:**
- [ ] Professional plan works
- [ ] Enterprise plan works
- [ ] Annual billing works

### Test 3: Agent Subscription (10 min)

**Test Team Plan:**
1. Navigate to agent pricing
2. Select Team plan
3. Complete checkout
4. Verify 7-day trial

- [ ] All 3 plans work (Basic, Team, Brokerage)
- [ ] 7-day trial period correct
- [ ] Subscription created successfully

### Test 4: Billing Page (3 min)

1. Navigate to `/billing`
2. Verify subscription displays
3. Check invoice list
4. Test "Download Invoice" if available

- [ ] Subscription details show
- [ ] Plan name correct
- [ ] Next billing date shown
- [ ] Trial countdown (if in trial)
- [ ] Cancel button visible

### Test 5: Subscription Cancellation (2 min)

1. Click "Cancel at Period End"
2. Verify database updates
3. Check `cancel_at_period_end = true`

- [ ] Cancellation confirmed
- [ ] Database updated
- [ ] Access continues until period end
- [ ] UI shows cancellation notice

---

## Webhook Testing ⏱️ ~15 minutes

### Local Webhook Testing

**Install Stripe CLI:**
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Or download: https://github.com/stripe/stripe-cli/releases
```

**Test Webhooks:**
```bash
# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# In another terminal, trigger events:
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger invoice.paid
stripe trigger invoice.payment_failed
```

**Verify:**
- [ ] Webhook events received
- [ ] Database updates correctly
- [ ] Server logs show processing
- [ ] No errors in webhook handler

---

## Integration Testing ⏱️ ~20 minutes

### Add Checkout Buttons to Pricing Pages

**Example: Landlord Pricing Page**

```tsx
import StripeCheckout from '@/components/StripeCheckout';
import { useUser } from '@/hooks/useUser';

const LandlordPricing = () => {
  const { user } = useUser();

  return (
    <div className="pricing-grid">
      {/* Starter Plan */}
      <div className="plan-card">
        <h3>Starter</h3>
        <p className="price">$49/month</p>
        <StripeCheckout
          planType="landlord_starter"
          interval="monthly"
          email={user?.email || ''}
          userId={user?.id}
          isSubscription={true}
        >
          Start Free Trial
        </StripeCheckout>
      </div>
      
      {/* Repeat for other plans */}
    </div>
  );
};
```

**Update These Pages:**
- [ ] `src/pages/LandlordPricing.tsx`
- [ ] `src/pages/AgentPricing.tsx`
- [ ] `src/pages/Trial.tsx` (renter)
- [ ] `src/pages/Pricing.tsx` (if exists)

**Test:**
- [ ] Buttons render correctly
- [ ] Click triggers checkout
- [ ] Correct plan selected
- [ ] Email pre-filled (if logged in)

---

## Error Handling Testing ⏱️ ~10 minutes

### Test Failure Scenarios

**1. Declined Card:**
- Use card: `4000 0000 0000 0002`
- [ ] Error message displayed
- [ ] User can retry
- [ ] No database record created

**2. Network Error:**
- Disconnect internet briefly
- [ ] Error message shown
- [ ] Graceful fallback

**3. Missing Environment Variables:**
- Temporarily remove `STRIPE_SECRET_KEY`
- [ ] Server shows helpful error
- [ ] Frontend handles gracefully

**4. Invalid Price ID:**
- Use wrong plan type
- [ ] Validation catches error
- [ ] Clear error message

---

## Production Readiness ⏱️ Ongoing

### Switch to Live Mode

**When ready for production:**

1. **Get Live API Keys:**
   - [ ] Go to https://dashboard.stripe.com/settings/api
   - [ ] Toggle to Live mode
   - [ ] Copy live keys (pk_live_..., sk_live_...)

2. **Create Live Products:**
   - [ ] Repeat product creation in live mode
   - [ ] Same pricing structure
   - [ ] Copy all live price IDs

3. **Update Production Environment:**
   - [ ] Update `STRIPE_SECRET_KEY` (live)
   - [ ] Update `STRIPE_PUBLISHABLE_KEY` (live)
   - [ ] Update `VITE_STRIPE_PUBLISHABLE_KEY` (live)
   - [ ] Update all `STRIPE_PRICE_*` variables (live)

4. **Configure Production Webhook:**
   - [ ] Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - [ ] Select same events
   - [ ] Copy live webhook secret
   - [ ] Update `STRIPE_WEBHOOK_SECRET` (live)

5. **Security Checklist:**
   - [ ] HTTPS enabled
   - [ ] Environment variables secured
   - [ ] Webhook signature verified
   - [ ] Rate limiting configured
   - [ ] Error logging setup (Sentry, etc.)

6. **Business Setup:**
   - [ ] Tax settings configured
   - [ ] Email receipts enabled
   - [ ] Billing emails configured
   - [ ] Terms of service link added
   - [ ] Privacy policy link added
   - [ ] Refund policy documented

7. **First Live Transaction:**
   - [ ] Test with small amount
   - [ ] Verify webhook fires
   - [ ] Check database
   - [ ] Refund test transaction

---

## Monitoring Setup ⏱️ Ongoing

### Stripe Dashboard

**Set up alerts for:**
- [ ] Failed payments
- [ ] Subscription cancellations
- [ ] High churn rate
- [ ] Revenue milestones

**Monitor:**
- [ ] Daily revenue
- [ ] Active subscriptions
- [ ] Trial conversion rate
- [ ] Churn rate
- [ ] Failed payment retry success

### Application Monitoring

**Database Queries:**
```sql
-- Daily active subscriptions
SELECT COUNT(*) FROM subscriptions WHERE status IN ('active', 'trialing');

-- Today's revenue
SELECT SUM(amount_paid) / 100.0 FROM invoices WHERE paid_at >= CURRENT_DATE;

-- Churn this month
SELECT COUNT(*) FROM subscriptions 
WHERE canceled_at >= DATE_TRUNC('month', CURRENT_DATE);
```

**Set up alerts for:**
- [ ] Webhook failures (check Stripe Events)
- [ ] Database errors
- [ ] High API error rates
- [ ] Webhook retry exhaustion

---

## Documentation ✅ Complete

All documentation created:
- [x] `STRIPE_INTEGRATION_COMPLETE.md` - Full guide
- [x] `STRIPE_TESTING_GUIDE.md` - Testing instructions
- [x] `STRIPE_IMPLEMENTATION_SUMMARY.md` - Overview
- [x] `STRIPE_QUICK_REFERENCE.md` - Quick commands
- [x] `STRIPE_DEPLOYMENT_CHECKLIST.md` - This file
- [x] `.env.stripe.example` - Environment template

---

## Support Resources

- **Stripe Dashboard**: https://dashboard.stripe.com
- **Stripe Docs**: https://stripe.com/docs
- **Test Cards**: https://stripe.com/docs/testing
- **Webhook Events**: https://stripe.com/docs/api/events
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
- **Support**: https://support.stripe.com

---

## Final Sign-Off

Before marking complete:

- [ ] All test scenarios pass
- [ ] Webhooks working correctly
- [ ] Database schema updated
- [ ] Environment variables configured
- [ ] Documentation reviewed
- [ ] Team trained on monitoring
- [ ] Rollback plan documented
- [ ] Production checklist ready

---

**Estimated Total Setup Time**: 
- Configuration: ~25 min
- Testing: ~75 min  
- Integration: ~30 min
- **Total: ~2 hours**

**Ready for Production**: When all checkboxes ✅

---

*Last updated: February 4, 2026*
