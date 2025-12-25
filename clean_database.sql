-- Clear database properly respecting foreign key constraints
-- Run this as postgres superuser

-- First, delete all messages (dependent table)
DELETE FROM messages;

-- Then delete all users (referenced table)
DELETE FROM users;

-- Reset sequences to 1
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE messages_id_seq RESTART WITH 1;

-- Verify tables are empty
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as message_count FROM messages;

-- Show table structure
\d users
\d messages
