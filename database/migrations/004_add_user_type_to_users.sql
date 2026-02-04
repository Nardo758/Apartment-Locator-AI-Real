-- Migration: Add user_type column to users table
-- Description: Adds user_type field to persist user role selection
-- Date: 2025-02-04

-- Add user_type column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'user_type'
  ) THEN
    ALTER TABLE users ADD COLUMN user_type VARCHAR(50) DEFAULT 'renter';
    COMMENT ON COLUMN users.user_type IS 'User role: renter, landlord, agent, or admin';
  END IF;
END $$;

-- Add check constraint for valid user types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_user_type_check'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_user_type_check 
      CHECK (user_type IN ('renter', 'landlord', 'agent', 'admin'));
  END IF;
END $$;

-- Create index for faster queries by user type
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);

COMMENT ON TABLE users IS 'Application users with authentication and profile data';
