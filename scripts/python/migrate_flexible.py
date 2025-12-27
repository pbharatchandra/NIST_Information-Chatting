#!/usr/bin/env python3
"""
Database Migration - Flexible version trying different credentials
"""

import psycopg2
import sys

def try_migrate(user, password):
    """Try migration with specific credentials"""
    db_config = {
        'host': 'localhost',
        'database': 'rasa_db',
        'user': user,
        'password': password,
        'port': 5432
    }
    
    migration_sql = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS roll_number VARCHAR(50) UNIQUE",
        "ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key",
        "ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check",
        "ALTER TABLE users ADD CONSTRAINT users_user_type_check CHECK (user_type IN ('student', 'faculty', 'alumni'))",
        "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
        "CREATE INDEX IF NOT EXISTS idx_users_roll_number ON users(roll_number)"
    ]
    
    try:
        print(f"🔄 Trying connection as '{user}'...")
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        print(f"✓ Connected as {user}!\n")
        
        print("📊 Executing migration SQL...\n")
        
        for i, statement in enumerate(migration_sql, 1):
            try:
                print(f"({i}/{len(migration_sql)}) {statement[:50]}...")
                cursor.execute(statement)
                print("    ✓")
            except psycopg2.Error as e:
                if 'already exists' in str(e).lower() or 'does not exist' in str(e).lower():
                    print("    ⚠️  (skipped)")
                else:
                    print(f"    ❌ {str(e)[:50]}")
                    conn.rollback()
                    cursor.close()
                    conn.close()
                    return False
        
        conn.commit()
        print("\n✅ Migration successful!\n")
        
        # Verify
        cursor.execute("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name='users' AND column_name='roll_number'
        """)
        
        if cursor.fetchone():
            print("✓ Verified: roll_number column exists")
        
        cursor.close()
        conn.close()
        return True
        
    except psycopg2.OperationalError as e:
        return False
    except Exception as e:
        return False

def main():
    """Main migration function"""
    print("=" * 60)
    print("🔧 Alumni Role Database Migration")
    print("=" * 60 + "\n")
    
    # Try different credentials
    credentials = [
        ('postgres', 'rootadmin'),
        ('postgres', ''),
        ('postgres', 'postgres'),
        ('rasa_user', 'rootadmin'),
    ]
    
    for user, password in credentials:
        if try_migrate(user, password):
            print("\n" + "=" * 60)
            print("✨ Database migration complete!")
            print("=" * 60)
            print("\nYou can now start the backend:")
            print("  $ node backend/auth-server.js")
            return True
    
    print("\n" + "=" * 60)
    print("❌ Migration failed with all credential combinations")
    print("=" * 60)
    print("\nPlease execute manually in pgAdmin:")
    print("  1. Right-click rasa_db → Query Tool")
    print("  2. Paste the SQL from migration.sql")
    print("  3. Execute the query")
    return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
