-- User Data Engines Table
-- Single source of truth for all user data (renter/landlord/agent)
-- Replaces scattered data across multiple tables

CREATE TABLE IF NOT EXISTS user_data_engines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('renter', 'landlord', 'agent')),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one record per user per type
  UNIQUE(user_id, user_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_data_engines_user_id ON user_data_engines(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_engines_user_type ON user_data_engines(user_type);
CREATE INDEX IF NOT EXISTS idx_user_data_engines_updated_at ON user_data_engines(updated_at DESC);

-- GIN index for JSONB queries (optional, for advanced filtering)
CREATE INDEX IF NOT EXISTS idx_user_data_engines_data ON user_data_engines USING GIN (data);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE user_data_engines ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON user_data_engines
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own data
CREATE POLICY "Users can insert own data" ON user_data_engines
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON user_data_engines
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own data
CREATE POLICY "Users can delete own data" ON user_data_engines
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admin policy (assuming you have an is_admin function)
-- If not, create one or adjust based on your admin setup
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has admin role
  -- Adjust this logic based on your admin implementation
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = user_id
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Admins can read all data
CREATE POLICY "Admins can read all data" ON user_data_engines
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Policy: Admins can update all data
CREATE POLICY "Admins can update all data" ON user_data_engines
  FOR UPDATE
  USING (is_admin(auth.uid()));

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_data_engines_updated_at
  BEFORE UPDATE ON user_data_engines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get user data by type
CREATE OR REPLACE FUNCTION get_user_data(user_type_param TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT data INTO result
  FROM user_data_engines
  WHERE user_id = auth.uid()
  AND user_type = user_type_param;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upsert user data
CREATE OR REPLACE FUNCTION upsert_user_data(
  user_type_param TEXT,
  data_param JSONB
)
RETURNS user_data_engines AS $$
DECLARE
  result user_data_engines;
BEGIN
  INSERT INTO user_data_engines (user_id, user_type, data, version)
  VALUES (auth.uid(), user_type_param, data_param, 1)
  ON CONFLICT (user_id, user_type)
  DO UPDATE SET
    data = EXCLUDED.data,
    version = user_data_engines.version + 1,
    updated_at = NOW()
  RETURNING * INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE user_data_engines IS 'Single source of truth for all user data across renter/landlord/agent types';
COMMENT ON COLUMN user_data_engines.user_type IS 'Type of user: renter, landlord, or agent';
COMMENT ON COLUMN user_data_engines.data IS 'JSONB containing all user-specific data (flexible schema)';
COMMENT ON COLUMN user_data_engines.version IS 'Version number for optimistic locking and data migration tracking';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_data_engines TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_data(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_user_data(TEXT, JSONB) TO authenticated;
