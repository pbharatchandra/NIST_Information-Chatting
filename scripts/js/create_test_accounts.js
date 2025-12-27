const bcrypt = require('bcryptjs');
const fs = require('fs');

// Function to hash password
async function generateHash(password) {
    return await bcrypt.hash(password, 10);
}

// Generate test accounts
async function createTestAccounts() {
    try {
        console.log('🔐 Generating test account hashes...\n');

        const testAccounts = [
            {
                email: 'admin@nist.edu',
                password: 'Admin@123',
                fullName: 'System Administrator',
                userType: 'admin'
            },
            {
                email: 'student1@nist.edu',
                password: 'Student@123',
                fullName: 'Test Student',
                userType: 'student'
            },
            {
                email: 'faculty1@nist.edu',
                password: 'Faculty@123',
                fullName: 'Test Faculty',
                userType: 'faculty'
            }
        ];

        // Generate SQL
        let sqlStatements = '-- Test Account SQL Inserts\n';
        sqlStatements += '-- Generated: ' + new Date().toISOString() + '\n\n';

        for (const account of testAccounts) {
            const hash = await generateHash(account.password);
            const sql = `INSERT INTO users (email, password_hash, full_name, user_type, created_at, updated_at) 
VALUES ('${account.email}', '${hash}', '${account.fullName}', '${account.userType}', NOW(), NOW());`;
            
            sqlStatements += sql + '\n\n';
            console.log(`✅ ${account.userType.toUpperCase()}`);
            console.log(`   Email: ${account.email}`);
            console.log(`   Password: ${account.password}`);
            console.log(`   Hash: ${hash}\n`);
        }

        // Save to file
        fs.writeFileSync('insert_test_accounts.sql', sqlStatements);
        console.log('📄 SQL saved to: insert_test_accounts.sql\n');
        console.log('📋 Copy the SQL above and run it in your PostgreSQL database:\n');
        console.log(sqlStatements);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createTestAccounts();
