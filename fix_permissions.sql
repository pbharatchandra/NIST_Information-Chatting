-- Fix all permissions for rasa_user in PostgreSQL
-- Run this as postgres superuser

-- Step 1: Ensure rasa_user exists and has correct password
ALTER USER rasa_user WITH PASSWORD 'rootadmin';

-- Step 2: Grant schema usage
GRANT USAGE ON SCHEMA public TO rasa_user;

-- Step 3: Grant all privileges on existing tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rasa_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rasa_user;

-- Step 4: Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO rasa_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO rasa_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO rasa_user;

-- Step 5: Specific table permissions (if needed)
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO rasa_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON conversations TO rasa_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON conversation_members TO rasa_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO rasa_user;

-- Step 6: Verify permissions
SELECT 
    grantee, 
    privilege_type
FROM role_table_grants 
WHERE table_name = 'users' AND grantee = 'rasa_user';

-- Success message
SELECT 'All permissions granted successfully to rasa_user!' as status;
