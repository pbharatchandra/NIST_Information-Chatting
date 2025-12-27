/**
 * Database Migration Runner
 * Executes migration.sql to update schema for roll_number support
 * 
 * Run: node run_migration.js
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'rasa_user',
    host: 'localhost',
    database: 'rasa_db',
    password: 'rootadmin',
    port: 5432,
});

async function runMigration() {
    const client = await pool.connect();
    
    try {
        // Read migration SQL file
        const migrationPath = path.join(__dirname, 'migration.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('🔄 Running database migration...\n');
        
        // Split by semicolons and execute each statement
        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        for (const statement of statements) {
            try {
                console.log(`Executing: ${statement.substring(0, 50)}...`);
                await client.query(statement);
                console.log('✅ Success\n');
            } catch (err) {
                // Some errors like "already exists" are OK
                if (err.code === '42P07' || err.message.includes('already exists')) {
                    console.log('⚠️  Already exists (skipped)\n');
                } else if (err.message.includes('does not exist')) {
                    console.log('⚠️  Does not exist (skipped)\n');
                } else {
                    throw err;
                }
            }
        }
        
        console.log('✨ Migration completed successfully!\n');
        
        // Verify schema
        console.log('📊 Verifying schema changes...\n');
        
        const columns = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_name='users'
            ORDER BY ordinal_position
        `);
        
        console.log('Current users table columns:');
        columns.rows.forEach(col => {
            console.log(`  ✓ ${col.column_name} (${col.data_type})`);
        });
        
        // Check if roll_number column exists
        const hasRollNumber = columns.rows.some(col => col.column_name === 'roll_number');
        if (hasRollNumber) {
            console.log('\n✅ roll_number column is now available');
        }
        
        // Show constraints
        const constraints = await client.query(`
            SELECT constraint_name
            FROM information_schema.table_constraints
            WHERE table_name='users' AND constraint_type != 'PRIMARY KEY'
        `);
        
        console.log('\nActive constraints:');
        constraints.rows.forEach(cons => {
            console.log(`  ✓ ${cons.constraint_name}`);
        });
        
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
