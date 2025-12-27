#!/usr/bin/env python3
"""
Database migration script to add missing columns to users table
This requires postgres superuser credentials
"""

import psycopg2
from psycopg2 import sql
import sys

def run_migration():
    # Try connecting with postgres superuser
    credentials = [
        {'user': 'postgres', 'password': 'postgres', 'host': 'localhost', 'port': 5432},
        {'user': 'postgres', 'password': 'password', 'host': 'localhost', 'port': 5432},
        {'user': 'postgres', 'password': 'admin', 'host': 'localhost', 'port': 5432},
        {'user': 'postgres', 'password': '', 'host': 'localhost', 'port': 5432},  # No password
    ]
    
    connection = None
    for creds in credentials:
        try:
            print(f"Attempting to connect with user: {creds['user']}")
            connection = psycopg2.connect(
                user=creds['user'],
                password=creds['password'],
                host=creds['host'],
                port=creds['port'],
                database='rasa_db'
            )
            print("✅ Connected successfully!")
            break
        except psycopg2.OperationalError as e:
            print(f"❌ Failed: {e}")
            continue
    
    if not connection:
        print("\n❌ Could not connect with any credentials")
        print("Please run the migration manually with:")
        print("  psql -U postgres -d rasa_db -f migrate_add_columns.sql")
        return False
    
    try:
        cursor = connection.cursor()
        
        # List of columns to add with their definitions
        columns = [
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
        
        # Add each column
        for column_name, column_type in columns:
            try:
                alter_sql = f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {column_name} {column_type}"
                cursor.execute(alter_sql)
                print(f"✅ Added/verified column: {column_name}")
            except psycopg2.Error as e:
                print(f"⚠️  Column {column_name}: {e.pgerror}")
        
        # Grant privileges to rasa_user
        print("\nGranting privileges to rasa_user...")
        cursor.execute("GRANT ALL PRIVILEGES ON TABLE users TO rasa_user")
        cursor.execute("GRANT ALL PRIVILEGES ON SEQUENCE users_id_seq TO rasa_user")
        print("✅ Privileges granted to rasa_user")
        
        # Verify the schema
        print("\n📋 Current users table schema:")
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position
        """)
        
        for row in cursor.fetchall():
            print(f"  {row[0]:30} {row[1]:20} nullable={row[2]}")
        
        connection.commit()
        print("\n✅ Migration completed successfully!")
        return True
        
    except psycopg2.Error as e:
        print(f"\n❌ Migration failed: {e}")
        connection.rollback()
        return False
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    success = run_migration()
    sys.exit(0 if success else 1)
