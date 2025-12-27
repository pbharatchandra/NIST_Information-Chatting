#!/bin/bash
# Comprehensive permission fix script

PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"
DB_HOST="localhost"
DB_NAME="rasa_db"
DB_USER="rasa_user"
DB_ADMIN="postgres"

echo "=== Fixing Database Permissions ==="

# Step 1: Reset password
echo "Step 1: Resetting rasa_user password..."
$PSQL -U $DB_ADMIN -h $DB_HOST -d $DB_NAME << EOF
\password $DB_USER
rootadmin
rootadmin
EOF

# Step 2: Grant schema permissions
echo "Step 2: Granting schema permissions..."
$PSQL -U $DB_ADMIN -h $DB_HOST -d $DB_NAME -c "GRANT USAGE ON SCHEMA public TO $DB_USER;"

# Step 3: Grant table permissions
echo "Step 3: Granting table permissions..."
$PSQL -U $DB_ADMIN -h $DB_HOST -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;"

# Step 4: Grant sequence permissions
echo "Step 4: Granting sequence permissions..."
$PSQL -U $DB_ADMIN -h $DB_HOST -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;"

# Step 5: Set default privileges
echo "Step 5: Setting default privileges..."
$PSQL -U $DB_ADMIN -h $DB_HOST -d $DB_NAME << EOF
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO $DB_USER;
EOF

# Step 6: Verify
echo "Step 6: Verifying permissions..."
$PSQL -U $DB_USER -h $DB_HOST -d $DB_NAME -c "SELECT 'Permission check passed!' as status;" 2>&1 || echo "Verification failed"

echo "=== Permission Fix Complete ==="
