-- Migration: Add Agent Client Management Tables
-- Description: Creates tables for agent client management and activity tracking
-- Created: 2025-02-05

-- Create agent_clients table
CREATE TABLE IF NOT EXISTS agent_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  stage VARCHAR(50) DEFAULT 'lead',
  source VARCHAR(100),
  budget JSONB,
  preferred_locations JSONB DEFAULT '[]'::jsonb,
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  move_in_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  priority VARCHAR(20) DEFAULT 'medium',
  assigned_properties JSONB DEFAULT '[]'::jsonb,
  last_contact TIMESTAMP WITH TIME ZONE,
  next_follow_up TIMESTAMP WITH TIME ZONE,
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for agent_clients
CREATE INDEX idx_agent_clients_agent_id ON agent_clients(agent_id);
CREATE INDEX idx_agent_clients_status ON agent_clients(status);
CREATE INDEX idx_agent_clients_stage ON agent_clients(stage);
CREATE INDEX idx_agent_clients_email ON agent_clients(email);
CREATE INDEX idx_agent_clients_is_archived ON agent_clients(is_archived);
CREATE INDEX idx_agent_clients_next_follow_up ON agent_clients(next_follow_up);
CREATE INDEX idx_agent_clients_created_at ON agent_clients(created_at);

-- Create client_activity table
CREATE TABLE IF NOT EXISTS client_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES agent_clients(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES users(id),
  activity_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  property_id UUID REFERENCES properties(id),
  metadata JSONB,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for client_activity
CREATE INDEX idx_client_activity_client_id ON client_activity(client_id);
CREATE INDEX idx_client_activity_agent_id ON client_activity(agent_id);
CREATE INDEX idx_client_activity_activity_type ON client_activity(activity_type);
CREATE INDEX idx_client_activity_created_at ON client_activity(created_at);
CREATE INDEX idx_client_activity_scheduled_for ON client_activity(scheduled_for);

-- Add comments for documentation
COMMENT ON TABLE agent_clients IS 'Stores client information for real estate agents';
COMMENT ON TABLE client_activity IS 'Tracks all activities and interactions with clients';

COMMENT ON COLUMN agent_clients.status IS 'Client status: active, inactive, archived';
COMMENT ON COLUMN agent_clients.stage IS 'Client stage in the sales pipeline: lead, viewing, negotiating, contract, closed';
COMMENT ON COLUMN agent_clients.priority IS 'Client priority: low, medium, high';
COMMENT ON COLUMN client_activity.activity_type IS 'Type of activity: note, call, email, meeting, viewing, offer, contract';
