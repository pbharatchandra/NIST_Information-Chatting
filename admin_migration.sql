-- Admin Panel Database Migration Script
-- Run this if your users table doesn't have all the required columns

-- Check current table structure
-- SELECT * FROM users LIMIT 1;

-- Add missing columns (if they don't already exist)
ALTER TABLE users ADD COLUMN IF NOT EXISTS roll_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS github VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS portfolio VARCHAR(255);

-- Fix the CHECK constraint to include 'admin' and 'alumni' user types
-- First, drop the old constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check;

-- Then add the new constraint with all user types
ALTER TABLE users ADD CONSTRAINT users_user_type_check 
  CHECK (user_type IN ('student', 'faculty', 'alumni', 'admin'));

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_roll_number ON users(roll_number);

-- Verify the table structure
-- This query should show all the columns needed for the admin panel
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Optional: Insert a test admin user (change credentials!)
-- Note: Password is hashed with bcrypt - use the signup endpoint or hash it first
-- This is just for reference - don't use directly!
/*
INSERT INTO users (email, password, full_name, user_type, created_at, updated_at)
VALUES (
    'admin@example.com',
    '$2a$10$[bcrypt_hashed_password_here]',
    'Admin User',
    'admin',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;
*/

-- Get user statistics
SELECT 
    COUNT(*) as total_users,
    user_type,
    COUNT(*) as count
FROM users
GROUP BY user_type
ORDER BY count DESC;
