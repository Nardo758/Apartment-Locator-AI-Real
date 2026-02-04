# 🧪 Stripe Integration Testing Guide

## Quick Start Testing (5 minutes)

### Prerequisites
- Stripe account (free): https://dashboard.stripe.com/register
- Test mode enabled in Stripe Dashboard

### Step 1: Get Test API Keys (1 min)

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy **Publishable key** (`pk_test_...`)
3. Copy **Secret key** (`sk_test_...`)
4. Add to `.env`:

```bash
STRIPE_SECRET_KEY=sk_test_51...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...
```

5. Restart server: `npm run dev`

### Step 2: Test Renter Payment (2 min)

1. Navigate to `/pricing` or your renter checkout page
2. Click "Unlock Full Access - $49"
3. In Stripe checkout, use test card:
   - **Card**: `4242 4242 4242 4242`
   - **Expiry**: `12/34`
   - **CVC**: `123`
   - **ZIP**: `12345`
4. Complete payment
5. Verify redirect to `/payment-success`
6. Check database:
   ```sql
   SELECT * FROM purchases ORDER BY created_at DESC LIMIT 1;
   ```
   Should show status = `completed`

### Step 3: Test Subscription (2 min)

1. Navigate to landlord or agent pricing page
2. Click "Start Free Trial" for any plan
3. Use same test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify redirect to success page
6. Check database:
   ```sql
   SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 1;
   ```
   Should show status = `trialing` or `active`

---

## Test Card Reference

### ✅ Success Scenarios

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Succeeds immediately |
| `5555 5555 5555 4444` | Mastercard success |
| `3782 822463 10005` | American Express |

### ❌ Failure Scenarios

| Card Number | Description |
|-------------|-------------|
| `4000 0000 0000 0002` | Generic decline |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0069` | Expired card |
| `4000 0000 0000 0127` | Incorrect CVC |

### 🔐 3D Secure (Authentication Required)

| Card Number | Description |
|-------------|-------------|
| `4000 0025 0000 3155` | Requires authentication |

**Use any future expiry, any CVC, any ZIP**

More test cards: https://stripe.com/docs/testing#cards

---

## Testing Checklist

### Renter Flow
- [ ] Checkout page loads without errors
- [ ] Test card `4242` completes payment
- [ ] Declined card `0002` shows error message
- [ ] Success redirect works to `/payment-success`
- [ ] Database `purchases` table has new record
- [ ] Purchase status is `completed`
- [ ] User can access paid features

### Landlord Subscription
- [ ] Can select monthly/annual billing
- [ ] Free trial period shows (14 days)
- [ ] Checkout completes successfully
- [ ] Database `subscriptions` table has new record
- [ ] Subscription status is `trialing`
- [ ] User tier updated in `users` table
- [ ] Billing page shows subscription details

### Agent Subscription
- [ ] Three plans visible (Basic, Team, Brokerage)
- [ ] Can subscribe to any plan
- [ ] Free trial period shows (7 days)
- [ ] All fields same as landlord testing

### Billing Page
- [ ] Shows active subscription
- [ ] Displays correct plan name and price
- [ ] Shows next billing date
- [ ] Trial countdown visible (if in trial)
- [ ] Invoices list populated (after first payment)
- [ ] Download invoice PDF works
- [ ] Cancel subscription button works

### Webhook Testing
- [ ] Install Stripe CLI: https://stripe.com/docs/stripe-cli
- [ ] Run: `stripe listen --forward-to localhost:5000/api/webhooks/stripe`
- [ ] Trigger events:
  ```bash
  stripe trigger checkout.session.completed
  stripe trigger customer.subscription.created
  stripe trigger invoice.paid
  ```
- [ ] Verify events create database records
- [ ] Check server logs for event processing

---

## Common Test Scenarios

### 1. Renter Converts to Subscriber

**Scenario**: User paid $49 as renter, now wants to become a landlord

**Test**:
1. Complete renter payment
2. Navigate to landlord pricing
3. Subscribe to landlord plan
4. Verify both records exist:
   - `purchases` table: renter payment
   - `subscriptions` table: landlord subscription

### 2. Subscription Cancellation

**Test Cancel at Period End**:
1. Subscribe to any plan
2. Go to `/billing`
3. Click "Cancel at Period End"
4. Verify `cancel_at_period_end = true` in database
5. Verify access continues until period end

**Test Immediate Cancellation**:
1. Subscribe to any plan
2. Click "Cancel Immediately"
3. Verify subscription status = `canceled`
4. Verify access revoked immediately

### 3. Payment Failure

**Simulate Failed Payment**:
1. Subscribe using card `4242` (succeeds)
2. In Stripe Dashboard, update payment method to `4000 0000 0000 0002`
3. Trigger renewal: `stripe trigger invoice.payment_failed`
4. Verify subscription status = `past_due`
5. Verify retry logic (Stripe automatic)

### 4. Plan Upgrade/Downgrade

**Upgrade**:
1. Subscribe to Starter plan
2. In Stripe Dashboard, manually change to Pro plan
3. Webhook fires: `customer.subscription.updated`
4. Verify database updated with new plan

**Downgrade**:
1. Subscribe to Pro plan
2. Change to Starter in Stripe Dashboard
3. Verify downgrade scheduled for period end

---

## Debugging Tips

### Enable Verbose Logging

In `server/routes/payments.ts`, add:

```typescript
console.log('[DEBUG] Request body:', JSON.stringify(req.body, null, 2));
console.log('[DEBUG] Stripe response:', JSON.stringify(response, null, 2));
```

### Check Stripe Dashboard

1. **Events**: https://dashboard.stripe.com/test/events
   - See all webhook events in real-time
   - Click event to see payload

2. **Logs**: https://dashboard.stripe.com/test/logs
   - API request logs
   - Webhook delivery logs

3. **Customers**: https://dashboard.stripe.com/test/customers
   - View customer payment methods
   - See subscription status

### Database Queries

```sql
-- Check recent subscriptions
SELECT 
  s.*,
  u.email,
  u.name
FROM subscriptions s
JOIN users u ON s.user_id = u.id
ORDER BY s.created_at DESC
LIMIT 10;

-- Check invoices
SELECT * FROM invoices ORDER BY created_at DESC LIMIT 10;

-- Check purchases (renters)
SELECT * FROM purchases ORDER BY created_at DESC LIMIT 10;

-- Active subscribers
SELECT 
  plan_type,
  COUNT(*) as count,
  SUM(amount) / 100.0 as monthly_revenue
FROM subscriptions
WHERE status IN ('active', 'trialing')
GROUP BY plan_type;
```

---

## Production Pre-Flight Checklist

Before going live:

- [ ] Switched to **live mode** API keys
- [ ] Created all products in **live mode**
- [ ] Updated price IDs in `.env`
- [ ] Webhook endpoint publicly accessible (HTTPS)
- [ ] Webhook secret updated for live mode
- [ ] Tested one payment in live mode (can refund)
- [ ] Email receipts configured in Stripe
- [ ] Billing emails configured
- [ ] Tax settings configured (if applicable)
- [ ] Terms of service link added
- [ ] Privacy policy link added
- [ ] Refund policy documented

---

## Quick Commands

```bash
# Test webhook locally
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
stripe trigger invoice.payment_failed

# View recent events
stripe events list --limit 10

# View customer subscriptions
stripe subscriptions list --customer cus_xxxxx

# Cancel subscription
stripe subscriptions cancel sub_xxxxx
```

---

## Support Resources

- **Stripe Docs**: https://stripe.com/docs
- **Test Cards**: https://stripe.com/docs/testing
- **Webhook Events**: https://stripe.com/docs/api/events/types
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
- **Community**: https://stripe.com/community

---

**Happy Testing! 🎉**

If you encounter issues, check:
1. Server logs (`npm run dev` output)
2. Browser console (F12)
3. Stripe Dashboard → Events
4. Database records
