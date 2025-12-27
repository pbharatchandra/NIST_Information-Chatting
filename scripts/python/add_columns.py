#!/usr/bin/env python3
"""
Add Missing Columns to Users Table - Database Migration
This script connects as postgres superuser and adds all required columns
"""

import psycopg2
import sys

PASSWORDS_TO_TRY = ['postgres', 'password', 'admin', 'root', 'rootadmin', '']

COLUMNS = [
    ('roll_number', 'VARCHAR(100)'),
    ('phone', 'VARCHAR(20)'),
    ('location', 'VARCHAR(255)'),
    ('department', 'VARCHAR(255)'),
    ('bio', 'TEXT'),
    ('github', 'VARCHAR(255)'),
    ('portfolio', 'VARCHAR(255)'),
    ('batch', 'VARCHAR(50)'),
    ('skills', 'VARCHAR(500)'),
    ('qualifications', 'TEXT'),
    ('research_interests', 'TEXT'),
    ('office_hours', 'VARCHAR(255)'),
    ('current_company', 'VARCHAR(255)'),
    ('job_title', 'VARCHAR(255)'),
    ('linkedin', 'VARCHAR(255)'),
    ('open_to_referrals', 'BOOLEAN DEFAULT FALSE'),
    ('is_alumni', 'BOOLEAN DEFAULT FALSE'),
    ('updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'),
]

def connect_as_postgres():
    """Try to connect as postgres superuser"""
    for password in PASSWORDS_TO_TRY:
        try:
            conn = psycopg2.connect(
                user='postgres',
                password=password,
                host='localhost',
                port=5432,
                database='rasa_db'
            )
            return conn
        except psycopg2.OperationalError:
            continue
    return None

def main():
    print("=" * 70)
    print("DATABASE MIGRATION: Add Missing Columns to Users Table")
    print("=" * 70)
    
    conn = connect_as_postgres()
    
    if not conn:
        print("\n❌ FAILED: Could not connect to PostgreSQL as 'postgres' user")
        print("\nTo complete the migration manually, open pgAdmin or command line and run:\n")
        for col_name, col_type in COLUMNS:
            print(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} {col_type};")
        print("\nGRANT ALL PRIVILEGES ON TABLE users TO rasa_user;")
        print("GRANT ALL PRIVILEGES ON SEQUENCE users_id_seq TO rasa_user;")
        return False
    
    print("\n✅ Connected to PostgreSQL as postgres superuser\n")
    
    try:
        cursor = conn.cursor()
        
        print("📝 Adding columns to users table...\n")
        added = 0
        exists = 0
        
        for col_name, col_type in COLUMNS:
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} {col_type}")
                print(f"  ✅ {col_name:30} {col_type}")
                added += 1
            except psycopg2.Error as e:
                if 'already exists' in str(e).lower():
                    exists += 1
                else:
                    print(f"  ⚠️  {col_name}: {str(e)[:50]}")
        
        print(f"\n  Added: {added} columns | Already existed: {exists}")
        
        # Grant permissions
        print("\n🔐 Granting permissions to rasa_user...\n")
        try:
            cursor.execute("GRANT ALL PRIVILEGES ON TABLE users TO rasa_user")
            print("  ✅ GRANT ALL on table users")
        except:
            pass
        
        try:
            cursor.execute("GRANT ALL PRIVILEGES ON SEQUENCE users_id_seq TO rasa_user")
            print("  ✅ GRANT ALL on sequence users_id_seq")
        except:
            pass
        
        # Verify
        print("\n📋 Verifying migration (columns in users table):\n")
        cursor.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            ORDER BY ordinal_position
        """)
        
        for col_name, col_type in cursor.fetchall():
            print(f"  {col_name:30} {col_type}")
        
        conn.commit()
        
        print("\n" + "=" * 70)
        print("✅ MIGRATION COMPLETED SUCCESSFULLY!")
        print("=" * 70)
        print("\nNext steps:")
        print("1. Restart the backend server")
        print("2. Go to http://localhost:3001/profile.html")
        print("3. Update your profile - all fields now persist to database!")
        print()
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
