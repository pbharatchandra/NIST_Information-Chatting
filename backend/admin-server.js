const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');

const app = express();
const server = http.createServer(app);

const port = 3002;
const JWT_SECRET = 'your_jwt_secret_key_change_this_in_production';

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
    user: 'rasa_user',
    host: 'localhost',
    database: 'rasa_db',
    password: 'rootadmin',
    port: 5432,
});

// ==================== MIDDLEWARE ====================

// Verify JWT Token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Verify Admin Role
const verifyAdmin = async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT user_type FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0 || result.rows[0].user_type !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        next();
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// ==================== ADMIN USER MANAGEMENT ENDPOINTS ====================

// GET ALL USERS
app.get('/api/admin/users', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, email, full_name, user_type, roll_number, created_at, updated_at 
             FROM users ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET SINGLE USER BY ID
app.get('/api/admin/users/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT id, email, full_name, user_type, roll_number, phone, location, bio, 
                    github, portfolio, created_at, updated_at
             FROM users WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// CREATE NEW USER (by admin)
app.post('/api/admin/users', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { email, password, full_name, user_type, roll_number, phone, location, bio, github, portfolio } = req.body;

        // Validate required fields
        if (!email || !password || !full_name || !user_type) {
            return res.status(400).json({ error: 'Email, password, full_name, and user_type are required' });
        }

        // Validate user_type
        const validUserTypes = ['student', 'faculty', 'alumni', 'admin'];
        if (!validUserTypes.includes(user_type)) {
            return res.status(400).json({ error: 'Invalid user type' });
        }

        // Check if user already exists
        const userExists = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const result = await pool.query(
            `INSERT INTO users (email, password, full_name, user_type, roll_number, phone, location, bio, github, portfolio)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING id, email, full_name, user_type, roll_number, created_at`,
            [email, hashedPassword, full_name, user_type, roll_number || null, phone || null, location || null, bio || null, github || null, portfolio || null]
        );

        const user = result.rows[0];
        console.log(`✅ Admin created new user: ${user.full_name} (${user.email})`);

        res.status(201).json({
            message: 'User created successfully',
            user
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// UPDATE USER
app.put('/api/admin/users/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { email, full_name, user_type, roll_number, phone, location, bio, github, portfolio } = req.body;

        // Check if user exists
        const userExists = await pool.query(
            'SELECT id FROM users WHERE id = $1',
            [id]
        );

        if (userExists.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if email is taken by another user
        if (email) {
            const emailExists = await pool.query(
                'SELECT id FROM users WHERE email = $1 AND id != $2',
                [email, id]
            );

            if (emailExists.rows.length > 0) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }

        // Validate user_type if provided
        if (user_type) {
            const validUserTypes = ['student', 'faculty', 'alumni', 'admin'];
            if (!validUserTypes.includes(user_type)) {
                return res.status(400).json({ error: 'Invalid user type' });
            }
        }

        // Build dynamic update query
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (email) {
            updates.push(`email = $${paramCount}`);
            values.push(email);
            paramCount++;
        }
        if (full_name) {
            updates.push(`full_name = $${paramCount}`);
            values.push(full_name);
            paramCount++;
        }
        if (user_type) {
            updates.push(`user_type = $${paramCount}`);
            values.push(user_type);
            paramCount++;
        }
        if (roll_number !== undefined) {
            updates.push(`roll_number = $${paramCount}`);
            values.push(roll_number || null);
            paramCount++;
        }
        if (phone !== undefined) {
            updates.push(`phone = $${paramCount}`);
            values.push(phone || null);
            paramCount++;
        }
        if (location !== undefined) {
            updates.push(`location = $${paramCount}`);
            values.push(location || null);
            paramCount++;
        }
        if (bio !== undefined) {
            updates.push(`bio = $${paramCount}`);
            values.push(bio || null);
            paramCount++;
        }
        if (github !== undefined) {
            updates.push(`github = $${paramCount}`);
            values.push(github || null);
            paramCount++;
        }
        if (portfolio !== undefined) {
            updates.push(`portfolio = $${paramCount}`);
            values.push(portfolio || null);
            paramCount++;
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);

        if (updates.length === 1) { // Only updated_at
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(id);

        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, email, full_name, user_type, roll_number, created_at, updated_at`;

        const result = await pool.query(query, values);

        console.log(`✅ Admin updated user: ${result.rows[0].full_name}`);

        res.json({
            message: 'User updated successfully',
            user: result.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE USER
app.delete('/api/admin/users/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const userExists = await pool.query(
            'SELECT full_name FROM users WHERE id = $1',
            [id]
        );

        if (userExists.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userName = userExists.rows[0].full_name;

        // Delete user (cascading deletes will handle related data)
        await pool.query('DELETE FROM users WHERE id = $1', [id]);

        console.log(`✅ Admin deleted user: ${userName}`);

        res.json({
            message: 'User deleted successfully'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// CHANGE USER PASSWORD (by admin)
app.post('/api/admin/users/:id/change-password', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { new_password } = req.body;

        if (!new_password) {
            return res.status(400).json({ error: 'New password is required' });
        }

        // Check if user exists
        const userExists = await pool.query(
            'SELECT full_name FROM users WHERE id = $1',
            [id]
        );

        if (userExists.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update password
        await pool.query(
            'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [hashedPassword, id]
        );

        console.log(`✅ Admin changed password for user: ${userExists.rows[0].full_name}`);

        res.json({
            message: 'Password changed successfully'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET USER STATISTICS
app.get('/api/admin/statistics', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const totalUsers = await pool.query('SELECT COUNT(*) as count FROM users');
        const usersByType = await pool.query(
            `SELECT user_type, COUNT(*) as count FROM users GROUP BY user_type`
        );

        res.json({
            total_users: parseInt(totalUsers.rows[0].count),
            users_by_type: usersByType.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Start Server
server.listen(port, () => {
    console.log(`Admin Server running on http://localhost:${port}`);
});
