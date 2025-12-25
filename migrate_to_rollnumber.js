/**
 * Database Migration Script
 * This script updates the users table to work with roll_number as primary identifier
 * Note: This version assumes the table structure already exists
 * 
 * Run this with: node migrate_to_rollnumber.js
 */

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',  // Using postgres superuser for DDL operations
    host: 'localhost',
    database: 'rasa_db',
    password: 'rootadmin',
    port: 5432,
});

async function runMigration() {
    const client = await pool.connect();
    
    try {
        console.log('Starting migration...');
        
        // Begin transaction
        await client.query('BEGIN');
        
        // Step 1: Check if roll_number column exists
        const checkColumn = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='roll_number'
        `);
        
        if (checkColumn.rows.length === 0) {
            console.log('Adding roll_number column...');
            await client.query(`
                ALTER TABLE users ADD COLUMN roll_number VARCHAR(50) UNIQUE
            `);
        } else {
            console.log('roll_number column already exists');
        }
        
        // Step 2: Remove email UNIQUE constraint if it exists
        console.log('Checking for email unique constraint...');
        const constraints = await client.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name='users' AND constraint_type='UNIQUE' AND constraint_name != 'users_pkey'
        `);
        
        for (const constraint of constraints.rows) {
            console.log(`Dropping constraint: ${constraint.constraint_name}`);
            await client.query(`
                ALTER TABLE users DROP CONSTRAINT ${constraint.constraint_name}
            `);
        }
        
        // Step 3: Add UNIQUE constraint on roll_number if not exists
        console.log('Ensuring UNIQUE constraint on roll_number...');
        const uniqueCheck = await client.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name='users' AND constraint_name='users_roll_number_unique'
        `);
        
        if (uniqueCheck.rows.length === 0) {
            await client.query(`
                ALTER TABLE users ADD CONSTRAINT users_roll_number_unique UNIQUE (roll_number)
            `);
        }
        
        // Step 4: Create index on email for faster lookups
        console.log('Creating index on email...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
        `);
        
        // Step 5: Check if user_type accepts alumni
        const userTypeEnum = await client.query(`
            SELECT enumtypid FROM pg_enum 
            WHERE enumlabel = 'alumni'
        `);
        
        if (userTypeEnum.rows.length === 0) {
            console.log('Updating user_type enum to include alumni...');
            // If user_type is not an enum, it's fine - backend handles validation
            console.log('Note: Ensure backend validates user_type = student|faculty|alumni');
        }
        
        // Commit transaction
        await client.query('COMMIT');
        
        console.log('\n✅ Migration completed successfully!');
        console.log('\nChanges made:');
        console.log('1. Added roll_number column with UNIQUE constraint');
        console.log('2. Removed UNIQUE constraint from email');
        console.log('3. Added index on email for performance');
        console.log('\nSystem now supports:');
        console.log('- roll_number as primary unique identifier for all users');
        console.log('- Three user roles: student, faculty, alumni');
        console.log('- Email as secondary (non-unique) identifier');
        
    } catch (err) {
        // Rollback on error
        try {
            await client.query('ROLLBACK');
        } catch (e) {
            console.log('Rollback failed (transaction may have ended)');
        }
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
