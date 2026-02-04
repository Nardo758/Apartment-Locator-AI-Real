# 🎯 Complete Stripe Payment Integration

## Overview

This integration supports **three payment models**:
1. **Renters**: $49 one-time payment
2. **Landlords**: $49-$199/mo SaaS subscriptions (Starter, Professional, Enterprise)
3. **Agents**: $79-$299/mo SaaS subscriptions (Basic, Team, Brokerage)

---

## 📋 Table of Contents

1. [Environment Variables Setup](#environment-variables-setup)
2. [Stripe Dashboard Configuration](#stripe-dashboard-configuration)
3. [Database Migration](#database-migration)
4. [Testing with Stripe Test Mode](#testing-with-stripe-test-mode)
5. [Production Deployment](#production-deployment)
6. [Usage Examples](#usage-examples)
7. [Webhook Events Reference](#webhook-events-reference)
8. [Troubleshooting](#troubleshooting)

---

## 🔐 Environment Variables Setup

### Required Environment Variables

Add these to your `.env` file:

```bash
# ============================================
# STRIPE API KEYS
# ============================================
# Get these from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhook signing secret (get after creating webhook endpoint)
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL for redirects
FRONTEND_URL=http://localhost:5000

# ============================================
# STRIPE PRICE IDS (for subscriptions)
# ============================================
# You'll create these in Stripe Dashboard

# Renter one-time payment
STRIPE_PRICE_RENTER_UNLOCK=price_xxxxx

# Landlord Plans
STRIPE_PRICE_LANDLORD_STARTER_MONTHLY=price_xxxxx
STRIPE_PRICE_LANDLORD_STARTER_ANNUAL=price_xxxxx
STRIPE_PRICE_LANDLORD_PRO_MONTHLY=price_xxxxx
STRIPE_PRICE_LANDLORD_PRO_ANNUAL=price_xxxxx
STRIPE_PRICE_LANDLORD_ENTERPRISE_MONTHLY=price_xxxxx
STRIPE_PRICE_LANDLORD_ENTERPRISE_ANNUAL=price_xxxxx

# Agent Plans
STRIPE_PRICE_AGENT_BASIC_MONTHLY=price_xxxxx
STRIPE_PRICE_AGENT_BASIC_ANNUAL=price_xxxxx
STRIPE_PRICE_AGENT_TEAM_MONTHLY=price_xxxxx
STRIPE_PRICE_AGENT_TEAM_ANNUAL=price_xxxxx
STRIPE_PRICE_AGENT_BROKERAGE_MONTHLY=price_xxxxx
STRIPE_PRICE_AGENT_BROKERAGE_ANNUAL=price_xxxxx
```

### Frontend Environment Variables

Add to `.env` for Vite frontend:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🏗️ Stripe Dashboard Configuration

### Step 1: Create Products & Prices

1. Go to https://dashboard.stripe.com/test/products
2. Create products for each plan:

#### Renter Product
- **Name**: Apartment Locator AI - Renter Access
- **Description**: One-time payment for full platform access
- **Pricing**: One-time payment of $49.00 USD
- Copy the **Price ID** (starts with `price_`)
- Set as `STRIPE_PRICE_RENTER_UNLOCK`

#### Landlord Products

**Starter Plan**
- **Name**: Landlord Starter
- **Description**: For individual landlords (up to 10 properties)
- **Pricing**: 
  - Monthly: $49.00 USD (recurring)
  - Annual: $470.00 USD (recurring) - 20% discount
- Copy Price IDs for both monthly and annual

**Professional Plan**
- **Name**: Landlord Professional
- **Description**: For growing property managers (up to 50 properties)
- **Pricing**: 
  - Monthly: $99.00 USD (recurring)
  - Annual: $950.00 USD (recurring) - 20% discount

**Enterprise Plan**
- **Name**: Landlord Enterprise
- **Description**: For professional property managers (unlimited properties)
- **Pricing**: 
  - Monthly: $199.00 USD (recurring)
  - Annual: $1,910.00 USD (recurring) - 20% discount

#### Agent Products

**Basic Plan**
- **Name**: Agent Basic
- **Description**: For individual real estate agents (up to 25 clients)
- **Pricing**: 
  - Monthly: $79.00 USD (recurring)
  - Annual: $790.00 USD (recurring) - ~17% discount

**Team Plan**
- **Name**: Agent Team
- **Description**: For growing agent teams (up to 100 clients)
- **Pricing**: 
  - Monthly: $149.00 USD (recurring)
  - Annual: $1,490.00 USD (recurring) - ~17% discount

**Brokerage Plan**
- **Name**: Agent Brokerage
- **Description**: For brokerages and large teams (unlimited clients)
- **Pricing**: 
  - Monthly: $299.00 USD (recurring)
  - Annual: $2,990.00 USD (recurring) - ~17% discount

### Step 2: Configure Webhook Endpoint

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **Add endpoint**
3. **Endpoint URL**: `https://yourdomain.com/api/webhooks/stripe`
4. **Events to listen for**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Set as `STRIPE_WEBHOOK_SECRET`

---

## 💾 Database Migration

Run this SQL to create the necessary tables:

```sql
-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_customer_id VARCHAR(255) NOT NULL,
  stripe_price_id VARCHAR(255) NOT NULL,
  stripe_product_id VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  plan_type VARCHAR(50) NOT NULL,
  user_type VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  interval VARCHAR(20) NOT NULL,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP,
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  subscription_id UUID REFERENCES subscriptions(id),
  stripe_invoice_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_customer_id VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL,
  amount_paid INTEGER DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(50) NOT NULL,
  invoice_number VARCHAR(100),
  hosted_invoice_url TEXT,
  invoice_pdf TEXT,
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  due_date TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_subscription_id ON invoices(subscription_id);
```

Or use Drizzle ORM:

```bash
npm run db:push
```

---

## 🧪 Testing with Stripe Test Mode

### Test Cards

Stripe provides test cards that simulate different scenarios:

```
✅ Successful payment:
Card: 4242 4242 4242 4242
Exp: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)

❌ Payment declined:
Card: 4000 0000 0000 0002

🔐 Requires authentication (3D Secure):
Card: 4000 0025 0000 3155

💳 Insufficient funds:
Card: 4000 0000 0000 9995
```

### Test Scenarios

#### 1. Renter One-Time Payment

```typescript
// Frontend usage
import StripeCheckout from '@/components/StripeCheckout';

<StripeCheckout
  email="renter@example.com"
  name="John Doe"
  userId="user_123"
  isSubscription={false}
>
  Unlock Full Access - $49
</StripeCheckout>
```

**Testing Steps:**
1. Click checkout button
2. Use test card `4242 4242 4242 4242`
3. Complete payment
4. Verify redirect to `/payment-success`
5. Check database: `purchases` table should have new record with status `completed`

#### 2. Landlord Subscription

```typescript
<StripeCheckout
  planType="landlord_starter"
  interval="monthly"
  email="landlord@example.com"
  name="Property Manager"
  userId="user_456"
  isSubscription={true}
>
  Start 14-Day Free Trial
</StripeCheckout>
```

**Testing Steps:**
1. Subscribe to plan
2. Complete checkout
3. Verify 14-day trial period starts
4. Check database: `subscriptions` table should have status `trialing`
5. After trial, subscription auto-converts to `active`

#### 3. Agent Subscription

```typescript
<StripeCheckout
  planType="agent_team"
  interval="annual"
  email="agent@example.com"
  name="Real Estate Agent"
  userId="user_789"
  isSubscription={true}
>
  Subscribe to Team Plan - $1,490/year
</StripeCheckout>
```

### Webhook Testing

Use Stripe CLI to test webhooks locally:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger invoice.payment_failed
```

---

## 🚀 Production Deployment

### 1. Switch to Live Mode

1. Go to https://dashboard.stripe.com/settings/api
2. Toggle to **Live mode** (top right)
3. Copy **live keys** (start with `pk_live_` and `sk_live_`)
4. Update environment variables in production

### 2. Create Live Products

Repeat the product creation steps in live mode with the same pricing structure.

### 3. Configure Production Webhook

1. Create webhook endpoint with production URL
2. Select same events
3. Copy live webhook secret
4. Update `STRIPE_WEBHOOK_SECRET` in production

### 4. Security Checklist

- ✅ All Stripe keys in environment variables (not hardcoded)
- ✅ Webhook signature verification enabled
- ✅ HTTPS enabled on production domain
- ✅ CORS properly configured
- ✅ Rate limiting on payment endpoints
- ✅ Database backups configured

---

## 📚 Usage Examples

### Frontend Components

#### Pricing Page with Checkout

```typescript
import StripeCheckout from '@/components/StripeCheckout';
import { useUser } from '@/hooks/useUser';

const PricingPage = () => {
  const { user } = useUser();

  return (
    <div className="pricing-cards">
      {/* Renter Plan */}
      <div className="plan-card">
        <h3>Renter Access</h3>
        <p className="price">$49 one-time</p>
        <StripeCheckout
          email={user?.email || ''}
          userId={user?.id}
          isSubscription={false}
        >
          Get Started
        </StripeCheckout>
      </div>

      {/* Landlord Starter */}
      <div className="plan-card">
        <h3>Landlord Starter</h3>
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

      {/* Agent Team */}
      <div className="plan-card">
        <h3>Agent Team</h3>
        <p className="price">$149/month</p>
        <StripeCheckout
          planType="agent_team"
          interval="monthly"
          email={user?.email || ''}
          userId={user?.id}
          isSubscription={true}
        >
          Start Free Trial
        </StripeCheckout>
      </div>
    </div>
  );
};
```

#### Check Payment Status

```typescript
const checkRenterAccess = async (email: string) => {
  const response = await fetch(`/api/payments/status?email=${email}`);
  const data = await response.json();
  
  if (data.hasUnlocked) {
    console.log('User has paid!');
  }
};
```

#### Get Subscription Status

```typescript
const getSubscriptionStatus = async (userId: string) => {
  const response = await fetch(`/api/payments/subscription-status/${userId}`);
  const data = await response.json();
  
  if (data.hasActiveSubscription) {
    console.log('Active subscription:', data.subscription);
  }
};
```

---

## 🔔 Webhook Events Reference

### Event Flow Diagrams

#### Renter One-Time Payment
```
User clicks checkout
  ↓
checkout.session.completed → Create purchase record
  ↓
User redirected to /payment-success
```

#### Subscription Creation
```
User subscribes
  ↓
checkout.session.completed → Track session
  ↓
customer.subscription.created → Create subscription record
  ↓
invoice.paid → Create invoice record
  ↓
User gets access (trial or immediate)
```

#### Subscription Renewal
```
Billing date arrives
  ↓
invoice.paid → Create new invoice record
  ↓
customer.subscription.updated → Update period dates
```

#### Payment Failure
```
Payment fails
  ↓
invoice.payment_failed → Mark subscription past_due
  ↓
Send dunning email (configured in Stripe)
  ↓
After retries exhausted → customer.subscription.deleted
```

### Handled Events

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create purchase or track subscription checkout |
| `customer.subscription.created` | Create subscription record, update user tier |
| `customer.subscription.updated` | Update subscription status, dates, cancellation |
| `customer.subscription.deleted` | Cancel subscription, revoke access |
| `invoice.paid` | Create invoice record, confirm payment |
| `invoice.payment_failed` | Mark subscription past_due, trigger retry |

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Stripe not configured" error

**Problem**: `STRIPE_SECRET_KEY` not set  
**Solution**: 
```bash
echo "STRIPE_SECRET_KEY=sk_test_..." >> .env
```
Restart server after adding.

#### 2. Webhook signature verification failed

**Problem**: `STRIPE_WEBHOOK_SECRET` incorrect or missing  
**Solution**:
- Go to Stripe Dashboard → Webhooks
- Copy the signing secret for your endpoint
- Update environment variable
- For local testing, use Stripe CLI

#### 3. Payment succeeds but not showing in database

**Problem**: Webhook not triggered or failed  
**Solution**:
- Check webhook endpoint is accessible (not localhost in production)
- Verify webhook secret is correct
- Check server logs for webhook errors
- Test with `stripe trigger` command

#### 4. Redirect URL not working

**Problem**: `FRONTEND_URL` not set correctly  
**Solution**:
```bash
# Development
FRONTEND_URL=http://localhost:5000

# Production
FRONTEND_URL=https://yourdomain.com
```

#### 5. Price ID not found

**Problem**: Using placeholder price IDs  
**Solution**:
- Create products in Stripe Dashboard
- Copy actual Price IDs (start with `price_`)
- Update environment variables

### Debug Mode

Enable detailed logging:

```typescript
// In server/routes/payments.ts
console.log('[Payment Debug] Incoming request:', req.body);
console.log('[Webhook Debug] Event type:', event.type);
console.log('[Webhook Debug] Event data:', event.data.object);
```

### Testing Checklist

- [ ] Test card 4242 completes payment
- [ ] Declined card 4000 0002 shows error
- [ ] Webhook events create database records
- [ ] Subscription trial period works correctly
- [ ] Cancellation flow works (immediate and at period end)
- [ ] Invoice generation and download works
- [ ] Email receipts sent (configure in Stripe)
- [ ] User tier updates correctly after payment

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

1. **Conversion Rate**: Checkout starts → Completed payments
2. **Trial Conversion**: Trial starts → Paid subscriptions
3. **Churn Rate**: Subscriptions canceled
4. **MRR**: Monthly Recurring Revenue
5. **Failed Payments**: Track and recover

### Stripe Dashboard Reports

- **Payments**: https://dashboard.stripe.com/payments
- **Subscriptions**: https://dashboard.stripe.com/subscriptions
- **Customers**: https://dashboard.stripe.com/customers
- **Analytics**: https://dashboard.stripe.com/analytics

### Database Queries for Analytics

```sql
-- Total revenue today
SELECT SUM(amount) / 100.0 as revenue_usd
FROM invoices
WHERE paid_at >= CURRENT_DATE;

-- Active subscriptions by plan
SELECT plan_type, COUNT(*) as count
FROM subscriptions
WHERE status IN ('active', 'trialing')
GROUP BY plan_type;

-- Churn rate this month
SELECT 
  COUNT(*) FILTER (WHERE canceled_at >= DATE_TRUNC('month', CURRENT_DATE)) as churned,
  COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) as new_subs,
  ROUND(
    COUNT(*) FILTER (WHERE canceled_at >= DATE_TRUNC('month', CURRENT_DATE)) * 100.0 /
    NULLIF(COUNT(*) FILTER (WHERE status = 'active'), 0),
    2
  ) as churn_rate_percent
FROM subscriptions;
```

---

## 🎓 Additional Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Testing**: https://stripe.com/docs/testing
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
- **Webhook Events**: https://stripe.com/docs/api/events/types
- **Subscription Lifecycle**: https://stripe.com/docs/billing/subscriptions/overview

---

## ✅ Implementation Checklist

- [x] Database schema updated with subscriptions & invoices tables
- [x] Payment routes created for all user types
- [x] Webhook endpoint implemented at `/api/webhooks/stripe`
- [x] Billing.tsx updated to show real subscription data
- [x] StripeCheckout component created
- [x] Environment variables documented
- [x] Testing instructions provided
- [x] Production deployment guide included

---

**Status**: ✅ Complete and ready for production  
**Time to implement**: Already done!  
**Next steps**: Configure Stripe Dashboard, add environment variables, test with test mode cards
