-- Migration: Add Agent Leads Management Tables
-- Created: 2025-02-04
-- Description: Creates tables for agent lead tracking, scoring, and conversion

-- Create agent_leads table
CREATE TABLE IF NOT EXISTS agent_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Contact Information
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  
  -- Lead Details
  status VARCHAR(50) NOT NULL DEFAULT 'new', -- new, contacted, qualified, nurturing, converted, lost
  lead_source VARCHAR(100) NOT NULL, -- website, referral, social, zillow, realtor.com, etc
  property_interest VARCHAR(500),
  property_id UUID REFERENCES properties(id),
  
  -- Lead Scoring (0-100)
  lead_score INTEGER DEFAULT 0,
  score_factors JSONB,
  
  -- Preferences & Requirements
  budget_min INTEGER,
  budget_max INTEGER,
  preferred_locations JSONB DEFAULT '[]'::jsonb,
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  move_in_date TIMESTAMP,
  timeline VARCHAR(50), -- immediate, 1-3months, 3-6months, 6+months
  
  -- Follow-up Tracking
  last_contacted_at TIMESTAMP,
  next_follow_up_at TIMESTAMP,
  follow_up_count INTEGER DEFAULT 0,
  auto_follow_up_enabled BOOLEAN DEFAULT true,
  
  -- Interaction History
  total_interactions INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  properties_viewed INTEGER DEFAULT 0,
  tour_scheduled BOOLEAN DEFAULT false,
  tour_date TIMESTAMP,
  
  -- Conversion Tracking
  converted_to_client_at TIMESTAMP,
  converted_client_id UUID REFERENCES agent_clients(id),
  estimated_value INTEGER,
  
  -- Notes & Tags
  notes TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  
  -- Additional Metadata
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  lost_at TIMESTAMP,
  lost_reason VARCHAR(255)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_leads_agent_id ON agent_leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_leads_status ON agent_leads(status);
CREATE INDEX IF NOT EXISTS idx_agent_leads_lead_source ON agent_leads(lead_source);
CREATE INDEX IF NOT EXISTS idx_agent_leads_lead_score ON agent_leads(lead_score);
CREATE INDEX IF NOT EXISTS idx_agent_leads_email ON agent_leads(email);
CREATE INDEX IF NOT EXISTS idx_agent_leads_created_at ON agent_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_leads_next_follow_up ON agent_leads(next_follow_up_at) WHERE next_follow_up_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agent_leads_converted ON agent_leads(converted_to_client_at) WHERE converted_to_client_at IS NOT NULL;

-- Create GIN indexes for JSONB fields
CREATE INDEX IF NOT EXISTS idx_agent_leads_tags ON agent_leads USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_agent_leads_preferred_locations ON agent_leads USING GIN(preferred_locations);

-- Comments for documentation
COMMENT ON TABLE agent_leads IS 'Stores lead information for real estate agents with scoring and tracking';
COMMENT ON COLUMN agent_leads.lead_score IS 'Automated lead score from 0-100 based on engagement, budget, timeline, etc.';
COMMENT ON COLUMN agent_leads.score_factors IS 'JSON object containing individual scoring factors (engagement, budget, timeline, motivation, responseRate)';
COMMENT ON COLUMN agent_leads.auto_follow_up_enabled IS 'Whether automatic follow-up reminders are enabled for this lead';
COMMENT ON COLUMN agent_leads.converted_client_id IS 'Reference to the agent_clients record if this lead was converted';
COMMENT ON COLUMN agent_leads.estimated_value IS 'Estimated commission value in cents';
