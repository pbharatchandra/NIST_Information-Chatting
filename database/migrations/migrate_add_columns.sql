-- Migration: Add missing columns to users table
-- This script should be run with PostgreSQL superuser privileges (postgres user)
-- Run with: psql -U postgres -d rasa_db -f migrate_add_columns.sql

-- Add missing columns to the users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS roll_number VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS github VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS portfolio VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS batch VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS qualifications TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS research_interests TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS office_hours VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_company VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS open_to_referrals BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_alumni BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Grant all privileges on users table to rasa_user
GRANT ALL PRIVILEGES ON TABLE users TO rasa_user;
GRANT ALL PRIVILEGES ON SEQUENCE users_id_seq TO rasa_user;

-- Verify the migration
\d users
