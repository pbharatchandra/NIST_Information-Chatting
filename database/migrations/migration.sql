-- Database Migration SQL
-- Migrates users table to support roll_number as unique identifier
-- and alumni as a third user role

-- Step 1: Add roll_number column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS roll_number VARCHAR(50) UNIQUE;

-- Step 2: Drop the email UNIQUE constraint (to allow duplicate emails)
-- First, find and drop the constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- Step 3: Add an index on email for performance (without uniqueness)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Step 4: Create an index on roll_number for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_roll_number ON users(roll_number);

-- Step 5: Update the user_type check constraint to include 'alumni'
-- Drop old constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check;

-- Add new constraint with alumni option
ALTER TABLE users ADD CONSTRAINT users_user_type_check 
    CHECK (user_type IN ('student', 'faculty', 'alumni'));

-- Confirmation
SELECT 'Migration completed successfully' as status;
