-- Add pricing alerts tables for landlord dashboard

-- Pricing Alerts Table
CREATE TABLE IF NOT EXISTS pricing_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id),
  competitor_id UUID REFERENCES properties(id),
  alert_type VARCHAR(50) NOT NULL, -- 'price_change' | 'concession' | 'vacancy_risk' | 'market_trend'
  severity VARCHAR(20) DEFAULT 'info', -- 'info' | 'warning' | 'critical'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  dismissed_at TIMESTAMP
);

-- Alert Preferences Table
CREATE TABLE IF NOT EXISTS alert_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  price_changes BOOLEAN DEFAULT true,
  concessions BOOLEAN DEFAULT true,
  vacancy_risk BOOLEAN DEFAULT true,
  market_trends BOOLEAN DEFAULT true,
  delivery_email BOOLEAN DEFAULT true,
  delivery_sms BOOLEAN DEFAULT false,
  delivery_inapp BOOLEAN DEFAULT true,
  delivery_push BOOLEAN DEFAULT false,
  frequency VARCHAR(20) DEFAULT 'realtime', -- 'realtime' | 'daily' | 'weekly'
  quiet_hours_start VARCHAR(5), -- e.g., '22:00'
  quiet_hours_end VARCHAR(5), -- e.g., '08:00'
  price_threshold DECIMAL(10,2) DEFAULT 50.00,
  vacancy_threshold INTEGER DEFAULT 30,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pricing_alerts_user ON pricing_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_pricing_alerts_type ON pricing_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_pricing_alerts_unread ON pricing_alerts(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_pricing_alerts_created ON pricing_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_preferences_user ON alert_preferences(user_id);

-- Comments for documentation
COMMENT ON TABLE pricing_alerts IS 'Stores pricing alerts for landlords based on competitor activity and market trends';
COMMENT ON TABLE alert_preferences IS 'User preferences for pricing alert notifications and delivery methods';
COMMENT ON COLUMN pricing_alerts.alert_type IS 'Type of alert: price_change, concession, vacancy_risk, or market_trend';
COMMENT ON COLUMN pricing_alerts.severity IS 'Alert severity level: info, warning, or critical';
COMMENT ON COLUMN pricing_alerts.metadata IS 'Additional contextual data specific to the alert type (JSON)';
COMMENT ON COLUMN alert_preferences.frequency IS 'Alert delivery frequency: realtime, daily, or weekly';
