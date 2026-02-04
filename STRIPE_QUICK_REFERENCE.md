# 🚀 Stripe Integration - Quick Reference Card

## ⚡ 30-Second Setup

```bash
# 1. Add to .env
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# 2. Run migration
npm run db:push

# 3. Restart server
npm run dev

# 4. Test with card: 4242 4242 4242 4242
```

---

## 🎯 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/payments/create-renter-checkout` | POST | Renter $49 payment |
| `/api/payments/create-subscription-checkout` | POST | Landlord/Agent subscription |
| `/api/payments/cancel-subscription` | POST | Cancel subscription |
| `/api/payments/subscription-status/:userId` | GET | Get subscription details |
| `/api/payments/status` | GET | Check renter payment |
| `/api/webhooks/stripe` | POST | Stripe webhooks |

---

## 💳 Test Cards

| Card | Purpose |
|------|---------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 0002` | ❌ Declined |
| `4000 0025 0000 3155` | 🔐 Requires 3DS |

**Exp**: `12/34` | **CVC**: `123` | **ZIP**: `12345`

---

## 💰 Pricing Quick Reference

### Renters
- **$49** one-time → Full access

### Landlords
- **Starter**: $49/mo or $470/yr (14-day trial)
- **Pro**: $99/mo or $950/yr (14-day trial)
- **Enterprise**: $199/mo or $1,910/yr (14-day trial)

### Agents
- **Basic**: $79/mo or $790/yr (7-day trial)
- **Team**: $149/mo or $1,490/yr (7-day trial)
- **Brokerage**: $299/mo or $2,990/yr (7-day trial)

---

## 🧩 Component Usage

```tsx
// Renter
<StripeCheckout
  email="user@example.com"
  userId="user_123"
  isSubscription={false}
>
  Pay $49
</StripeCheckout>

// Landlord
<StripeCheckout
  planType="landlord_starter"
  interval="monthly"
  email="user@example.com"
  userId="user_123"
  isSubscription={true}
>
  Start Trial
</StripeCheckout>
```

---

## 🔔 Webhook Events

- `checkout.session.completed` → Payment done
- `customer.subscription.created` → Sub created
- `customer.subscription.updated` → Sub changed
- `customer.subscription.deleted` → Sub canceled
- `invoice.paid` → Payment successful
- `invoice.payment_failed` → Payment failed

---

## 🗄️ Database Tables

- `subscriptions` → Active subscriptions
- `invoices` → Billing history
- `purchases` → One-time payments

---

## 🐛 Debug Commands

```bash
# View Stripe events
stripe events list --limit 10

# Test webhook locally
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# Trigger test event
stripe trigger checkout.session.completed
```

---

## 📊 SQL Queries

```sql
-- Active subscriptions
SELECT * FROM subscriptions WHERE status = 'active';

-- Revenue today
SELECT SUM(amount_paid)/100.0 FROM invoices WHERE paid_at >= CURRENT_DATE;

-- Recent purchases
SELECT * FROM purchases ORDER BY created_at DESC LIMIT 10;
```

---

## 🚨 Common Errors

| Error | Fix |
|-------|-----|
| "Stripe not configured" | Add `STRIPE_SECRET_KEY` to `.env` |
| "Webhook signature failed" | Check `STRIPE_WEBHOOK_SECRET` |
| "Price ID not found" | Create products in Stripe Dashboard |

---

## 📖 Full Documentation

- **Complete Guide**: `STRIPE_INTEGRATION_COMPLETE.md`
- **Testing Guide**: `STRIPE_TESTING_GUIDE.md`
- **Summary**: `STRIPE_IMPLEMENTATION_SUMMARY.md`

---

## ✅ Quick Checklist

Setup:
- [ ] Add Stripe keys to `.env`
- [ ] Run database migration
- [ ] Create products in Stripe Dashboard
- [ ] Configure webhook endpoint

Testing:
- [ ] Test renter payment
- [ ] Test landlord subscription
- [ ] Test agent subscription
- [ ] Test cancellation

Production:
- [ ] Switch to live keys
- [ ] Create live products
- [ ] Update webhook URL
- [ ] Test one live payment

---

**Need help?** See full docs or Stripe Dashboard → Events
