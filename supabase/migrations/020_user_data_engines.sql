CREATE TABLE IF NOT EXISTS user_data_engines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  engine_type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, engine_type)
);

CREATE INDEX IF NOT EXISTS idx_user_data_engines_user_id ON user_data_engines(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_engines_engine_type ON user_data_engines(engine_type);
