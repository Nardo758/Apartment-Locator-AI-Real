# Stripe Payment Integration - Setup Instructions

## 🎯 What Was Built

### Backend (✅ Complete)
1. **Database Schema** (`shared/schema.ts`)
   - Added `purchases` table to track payments
   - Columns: userId, guestEmail, amount, stripePaymentIntentId, status, etc.

2. **Payment Routes** (`server/routes/payments.ts`)
   - `POST /api/payments/create-intent` - Creates $49 payment
   - `POST /api/payments/verify` - Confirms payment succeeded
   - `GET /api/payments/status` - Check if user has paid
   - `POST /api/payments/webhook` - Stripe webhook handler

3. **Route Registration** (`server/routes.ts`)
   - Payment routes connected to main server

### Frontend (✅ Complete)
1. **PaywallModal Component** (`src/components/PaywallModal.tsx`)
   - Stripe Elements integration
   - Secure payment form
   - Success/error handling

2. **FreeSavingsCalculator Updates** (`src/components/FreeSavingsCalculator.tsx`)
   - Email capture flow
   - Paywall integration
   - Payment success redirect

3. **Landing Page** (`src/pages/LandingSSRSafe.tsx`)
   - Free calculator prominently displayed

---

## 📦 Installation Steps

### 1. Install Stripe Packages

Run in Replit terminal:

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Add Environment Variables

In Replit, go to **Secrets** (lock icon in sidebar) and add:

```bash
# Stripe API Keys (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhook Secret (optional for testing, required for production)
STRIPE_WEBHOOK_SECRET=whsec_...
```

Also create/update `.env` file for local development:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Run Database Migration

The `purchases` table needs to be created. Run:

```bash
npm run db:push
```

Or manually create the table in your PostgreSQL database:

```sql
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  guest_email VARCHAR(255),
  guest_name VARCHAR(255),
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  stripe_payment_intent_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_customer_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  product_type VARCHAR(100) DEFAULT 'one_time_unlock',
  search_criteria JSONB,
  unlocked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_purchases_guest_email ON purchases(guest_email);
CREATE INDEX idx_purchases_stripe_payment_intent ON purchases(stripe_payment_intent_id);
CREATE INDEX idx_purchases_status ON purchases(status);
```

---

## 🧪 Testing

### Test Mode Setup

1. **Get Test API Keys**
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy `Publishable key` (starts with `pk_test_`)
   - Copy `Secret key` (starts with `sk_test_`)

2. **Test Cards** (use these for testing):
   ```
   Successful payment:
   4242 4242 4242 4242
   Exp: Any future date
   CVC: Any 3 digits
   ZIP: Any 5 digits

   Declined payment:
   4000 0000 0000 0002

   Requires authentication (3D Secure):
   4000 0025 0000 3155
   ```

3. **Test Flow**:
   - Open landing page
   - Fill out free calculator
   - Click "Unlock Full Results - $49"
   - Enter email
   - Click "Continue to Payment"
   - Use test card: `4242 4242 4242 4242`
   - Complete payment
   - Should redirect to dashboard

### Verify Backend

```bash
# Check if Stripe is configured
curl http://localhost:5000/api/health

# Test payment intent creation (should return error if STRIPE_SECRET_KEY not set)
curl -X POST http://localhost:5000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{"guestEmail":"test@example.com"}'
```

---

## 🚀 Go Live (Production)

### 1. Switch to Live Mode

1. Go to https://dashboard.stripe.com/settings/api
2. Toggle to **Live mode** (top right)
3. Copy live keys (start with `pk_live_` and `sk_live_`)
4. Update environment variables in Replit/production

### 2. Set Up Webhook (Important!)

Webhooks ensure payments are recorded even if user closes browser:

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Endpoint URL: `https://your-domain.com/api/payments/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy **Signing secret** (starts with `whsec_`)
6. Add to environment variables as `STRIPE_WEBHOOK_SECRET`

### 3. Update Pricing

Current: $49 one-time payment

To change price, edit `server/routes/payments.ts`:
```typescript
amount: 4900, // $49.00 in cents (change to 9900 for $99, etc.)
```

---

## 🔐 Security Checklist

- ✅ Stripe Secret Key is in environment variables (not hardcoded)
- ✅ Payment verification happens on backend (not frontend)
- ✅ Webhook secret validates Stripe requests
- ✅ Database records every payment attempt
- ✅ Client secret is one-time use only

---

## 📊 Monitoring

### View Payments
```bash
# Check all purchases
SELECT * FROM purchases ORDER BY created_at DESC LIMIT 10;

# Check successful payments
SELECT * FROM purchases WHERE status = 'completed';

# Total revenue
SELECT SUM(amount) / 100.0 as total_revenue_usd 
FROM purchases 
WHERE status = 'completed';
```

### Stripe Dashboard

- View all payments: https://dashboard.stripe.com/payments
- Customer details: https://dashboard.stripe.com/customers
- Refunds: https://dashboard.stripe.com/refunds
- Analytics: https://dashboard.stripe.com/analytics

---

## 🐛 Troubleshooting

### "Stripe not configured" error
- Check `STRIPE_SECRET_KEY` is set in environment
- Restart server after adding environment variables

### Payment succeeds but not showing in database
- Check webhook is configured
- Verify webhook secret is correct
- Check server logs for webhook errors

### "Invalid API Key" error
- Make sure you're using test keys in test mode
- Live keys won't work in test mode and vice versa

### Frontend shows "Initializing secure payment..." forever
- Check browser console for errors
- Verify `VITE_STRIPE_PUBLISHABLE_KEY` is set
- Check API endpoint is responding: `/api/payments/create-intent`

---

## 💰 Revenue Tracking

### Quick Stats Query
```sql
-- Daily revenue
SELECT 
  DATE(created_at) as date,
  COUNT(*) as sales,
  SUM(amount) / 100.0 as revenue_usd
FROM purchases 
WHERE status = 'completed'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Conversion funnel
SELECT
  COUNT(*) FILTER (WHERE status = 'pending') as started,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / 
    COUNT(*), 2
  ) as conversion_rate
FROM purchases;
```

---

## 📝 Next Steps

1. **Test the full flow** with Stripe test cards
2. **Add email confirmations** (send receipt after payment)
3. **Build dashboard unlock logic** (show full results after payment)
4. **Add refund handling** (if needed)
5. **Track conversions** (analytics for landing page → payment)

---

## 🆘 Support

- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Test Cards: https://stripe.com/docs/testing

---

**Status:** ✅ Ready to test!  
**Time to deploy:** ~10 minutes (npm install + env vars + DB migration)
