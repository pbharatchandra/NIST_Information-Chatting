#!/usr/bin/env python3
"""
Database Migration Script for Alumni Role Implementation
Requires: PostgreSQL installed and running on localhost:5432
"""

import psycopg2
import sys

def run_migration():
    """Execute database migration for roll_number support"""
    
    # PostgreSQL connection details
    db_config = {
        'host': 'localhost',
        'database': 'rasa_db',
        'user': 'postgres',
        'password': 'rootadmin',  # Default PostgreSQL password
        'port': 5432
    }
    
    migration_sql = """
    -- Add roll_number column if it doesn't exist
    ALTER TABLE users ADD COLUMN IF NOT EXISTS roll_number VARCHAR(50) UNIQUE;
    
    -- Drop email UNIQUE constraint if it exists
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
    
    -- Drop old user_type check constraint if it exists
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check;
    
    -- Add new user_type check constraint with alumni
    ALTER TABLE users ADD CONSTRAINT users_user_type_check 
        CHECK (user_type IN ('student', 'faculty', 'alumni'));
    
    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_roll_number ON users(roll_number);
    """
    
    try:
        print("🔄 Connecting to PostgreSQL database...")
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        
        print("✓ Connected successfully!")
        print("\n📊 Executing migration SQL...\n")
        
        # Execute each statement
        statements = [s.strip() for s in migration_sql.split(';') if s.strip()]
        
        for i, statement in enumerate(statements, 1):
            try:
                print(f"({i}/{len(statements)}) {statement[:60]}...")
                cursor.execute(statement)
                print("    ✓ Success")
            except psycopg2.Error as e:
                if 'already exists' in str(e).lower() or 'does not exist' in str(e).lower():
                    print(f"    ⚠️  Skipped (already exists or not applicable)")
                else:
                    print(f"    ❌ Error: {e}")
                    conn.rollback()
                    return False
        
        conn.commit()
        print("\n✅ Migration completed successfully!\n")
        
        # Verify the migration
        print("📋 Verifying schema changes...\n")
        cursor.execute("""
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_name='users'
            ORDER BY ordinal_position
        """)
        
        print("Columns in users table:")
        for col_name, col_type in cursor.fetchall():
            marker = "✓" if col_name == "roll_number" else " "
            print(f"  {marker} {col_name} ({col_type})")
        
        cursor.close()
        conn.close()
        
        print("\n✨ Database is ready for alumni role system!")
        return True
        
    except psycopg2.OperationalError as e:
        print(f"❌ Connection failed: {e}")
        print("\nTroubleshooting:")
        print("  • Make sure PostgreSQL is running")
        print("  • Verify postgres user password is 'rootadmin'")
        print("  • Check that database 'rasa_db' exists")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    try:
        success = run_migration()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Migration cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        sys.exit(1)
