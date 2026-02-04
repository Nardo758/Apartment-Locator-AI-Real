-- Migration: Add Stripe Subscription Support
-- Description: Adds tables for subscriptions and invoices
-- Date: 2026-02-04

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_customer_id VARCHAR(255) NOT NULL,
  stripe_price_id VARCHAR(255) NOT NULL,
  stripe_product_id VARCHAR(255),
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'unpaid', 'trialing', 'incomplete', 'incomplete_expired')),
  plan_type VARCHAR(50) NOT NULL,
  user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('renter', 'landlord', 'agent')),
  amount INTEGER NOT NULL CHECK (amount >= 0),
  currency VARCHAR(3) DEFAULT 'usd',
  interval VARCHAR(20) NOT NULL CHECK (interval IN ('month', 'year', 'week', 'day')),
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP,
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_customer_id VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  amount_paid INTEGER DEFAULT 0 CHECK (amount_paid >= 0),
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')),
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

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_type ON subscriptions(plan_type);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_customer_id ON invoices(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_paid_at ON invoices(paid_at);

-- ============================================
-- UPDATE EXISTING USERS TABLE
-- ============================================

-- Add user_type column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'user_type'
  ) THEN
    ALTER TABLE users ADD COLUMN user_type VARCHAR(50) DEFAULT 'renter';
  END IF;
END $$;

-- Update subscription tier options
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_subscription_tier_check;
ALTER TABLE users ADD CONSTRAINT users_subscription_tier_check 
  CHECK (subscription_tier IN (
    'free', 
    'renter_paid',
    'landlord_starter', 'landlord_pro', 'landlord_enterprise',
    'agent_basic', 'agent_team', 'agent_brokerage'
  ));

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for subscriptions
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for invoices
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Active subscriptions summary
CREATE OR REPLACE VIEW active_subscriptions_summary AS
SELECT 
  plan_type,
  user_type,
  COUNT(*) as subscriber_count,
  SUM(amount) / 100.0 as total_monthly_revenue,
  AVG(amount) / 100.0 as avg_subscription_value,
  COUNT(*) FILTER (WHERE status = 'trialing') as trialing_count,
  COUNT(*) FILTER (WHERE status = 'active') as active_count
FROM subscriptions
WHERE status IN ('active', 'trialing')
GROUP BY plan_type, user_type;

-- Monthly revenue report
CREATE OR REPLACE VIEW monthly_revenue_report AS
SELECT 
  DATE_TRUNC('month', paid_at) as month,
  COUNT(*) as invoice_count,
  SUM(amount_paid) / 100.0 as total_revenue,
  AVG(amount_paid) / 100.0 as avg_invoice_amount
FROM invoices
WHERE status = 'paid'
GROUP BY DATE_TRUNC('month', paid_at)
ORDER BY month DESC;

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Uncomment to insert test data
-- INSERT INTO subscriptions (user_id, stripe_subscription_id, stripe_customer_id, stripe_price_id, status, plan_type, user_type, amount, interval, current_period_start, current_period_end)
-- VALUES (
--   (SELECT id FROM users LIMIT 1),
--   'sub_test_123',
--   'cus_test_123',
--   'price_test_123',
--   'trialing',
--   'landlord_starter',
--   'landlord',
--   4900,
--   'month',
--   NOW(),
--   NOW() + INTERVAL '1 month'
-- );

-- ============================================
-- ROLLBACK (if needed)
-- ============================================

-- To rollback this migration, run:
-- DROP VIEW IF EXISTS monthly_revenue_report;
-- DROP VIEW IF EXISTS active_subscriptions_summary;
-- DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
-- DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
-- DROP TABLE IF EXISTS invoices CASCADE;
-- DROP TABLE IF EXISTS subscriptions CASCADE;
-- DROP FUNCTION IF EXISTS update_updated_at_column();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify tables were created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('subscriptions', 'invoices');

-- Verify indexes were created
-- SELECT indexname FROM pg_indexes WHERE tablename IN ('subscriptions', 'invoices');

-- Check views
-- SELECT * FROM active_subscriptions_summary;
-- SELECT * FROM monthly_revenue_report;

COMMENT ON TABLE subscriptions IS 'Stores Stripe subscription data for landlords and agents';
COMMENT ON TABLE invoices IS 'Stores Stripe invoice records for billing history';
COMMENT ON VIEW active_subscriptions_summary IS 'Summary of active subscriptions by plan type';
COMMENT ON VIEW monthly_revenue_report IS 'Monthly revenue from paid invoices';
