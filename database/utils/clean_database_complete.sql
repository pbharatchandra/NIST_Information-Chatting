-- WARNING: This script DELETES ALL DATA from the database
-- This includes all users, chats, messages, conversations, etc.
-- This action CANNOT be undone!

-- Disable foreign key constraints temporarily
ALTER TABLE conversation_members DISABLE TRIGGER ALL;
ALTER TABLE messages DISABLE TRIGGER ALL;
ALTER TABLE conversations DISABLE TRIGGER ALL;
ALTER TABLE users DISABLE TRIGGER ALL;

-- Delete all data
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE conversation_members CASCADE;
TRUNCATE TABLE conversations CASCADE;
TRUNCATE TABLE users CASCADE;

-- Re-enable triggers
ALTER TABLE conversation_members ENABLE TRIGGER ALL;
ALTER TABLE messages ENABLE TRIGGER ALL;
ALTER TABLE conversations ENABLE TRIGGER ALL;
ALTER TABLE users ENABLE TRIGGER ALL;

-- Reset auto-increment sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE conversations_id_seq RESTART WITH 1;
ALTER SEQUENCE conversation_members_id_seq RESTART WITH 1;
ALTER SEQUENCE messages_id_seq RESTART WITH 1;

-- Verify all tables are empty
SELECT 'users' as table_name, COUNT(*) as rows FROM users
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'conversation_members', COUNT(*) FROM conversation_members
UNION ALL
SELECT 'messages', COUNT(*) FROM messages;

-- Display completion message
SELECT 'Database cleared successfully!' as status;
