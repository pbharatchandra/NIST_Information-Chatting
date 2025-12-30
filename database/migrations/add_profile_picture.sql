-- Migration: Add profile_picture column to users table
-- Stores the relative path to the uploaded image file
-- Run with: psql -U postgres -d rasa_db -f add_profile_picture.sql

-- Add profile_picture column
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255);

-- Grant privileges
GRANT ALL PRIVILEGES ON TABLE users TO rasa_user;

-- Verify
SELECT 'Profile picture column added successfully' as status;
