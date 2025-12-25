const express = require('express');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const port = 3001;
const JWT_SECRET = 'your_jwt_secret_key_change_this_in_production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Database Connection
const pool = new Pool({
    user: 'rasa_user',
    host: 'localhost',
    database: 'rasa_db',
    password: 'rootadmin',
    port: 5432,
});

// Store active users
const activeUsers = new Map();

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

// ==================== AUTH ENDPOINTS ====================

// Sign Up
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, full_name, user_type } = req.body;

        // Validate input
        if (!email || !password || !full_name || !user_type) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (user_type !== 'student' && user_type !== 'faculty') {
            return res.status(400).json({ error: 'Invalid user type' });
        }

        // Check if user already exists
        const userExists = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const result = await pool.query(
            `INSERT INTO users (email, password, full_name, user_type)
            VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, user_type`,
            [email, hashedPassword, full_name, user_type]
        );

        const user = result.rows[0];

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, user_type: user.user_type },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                user_type: user.user_type
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const result = await pool.query(
            'SELECT id, email, password, full_name, user_type FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Compare password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, user_type: user.user_type },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                user_type: user.user_type
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user
app.get('/api/auth/me', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, full_name, user_type FROM users WHERE id = $1',
            [req.user.id]
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

// ==================== CHAT ENDPOINTS ====================

// Get all users except current user
app.get('/api/chat/users', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, full_name, user_type FROM users WHERE id != $1 ORDER BY full_name',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get or create conversation between two users
app.post('/api/chat/conversation', verifyToken, async (req, res) => {
    try {
        const { user2_id } = req.body;
        const user1_id = req.user.id;

        // Check if conversation already exists
        let conversation = await pool.query(
            `SELECT c.id FROM conversations c
            JOIN conversation_members cm1 ON c.id = cm1.conversation_id AND cm1.user_id = $1
            JOIN conversation_members cm2 ON c.id = cm2.conversation_id AND cm2.user_id = $2
            WHERE c.conversation_type = 'direct'`,
            [user1_id, user2_id]
        );

        if (conversation.rows.length > 0) {
            return res.json({ conversation_id: conversation.rows[0].id });
        }

        // Create new conversation
        const newConv = await pool.query(
            `INSERT INTO conversations (conversation_type)
            VALUES ('direct') RETURNING id`
        );

        const conversationId = newConv.rows[0].id;

        // Add members
        await pool.query(
            `INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2), ($1, $3)`,
            [conversationId, user1_id, user2_id]
        );

        res.json({ conversation_id: conversationId });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get chat history
app.get('/api/chat/messages/:conversation_id', verifyToken, async (req, res) => {
    try {
        const { conversation_id } = req.params;
        const limit = req.query.limit || 50;
        const offset = req.query.offset || 0;

        const result = await pool.query(
            `SELECT m.id, m.message_text, m.sender_id, u.full_name, u.user_type, 
                    m.created_at, m.is_read
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.conversation_id = $1
            ORDER BY m.created_at DESC
            LIMIT $2 OFFSET $3`,
            [conversation_id, limit, offset]
        );

        res.json(result.rows.reverse());
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user conversations list
app.get('/api/chat/conversations', verifyToken, async (req, res) => {
    try {
        const user_id = req.user.id;

        const result = await pool.query(
            `SELECT c.id, c.conversation_name, 
                    CASE 
                        WHEN c.conversation_type = 'direct' THEN u.full_name 
                        ELSE c.conversation_name 
                    END as display_name,
                    u.id as other_user_id,
                    m.message_text as last_message,
                    m.created_at as last_message_time,
                    COALESCE(m.created_at, c.updated_at) as sort_time
            FROM conversations c
            JOIN conversation_members cm ON c.id = cm.conversation_id AND cm.user_id = $1
            LEFT JOIN conversation_members cm2 ON c.id = cm2.conversation_id AND cm2.user_id != $1
            LEFT JOIN users u ON cm2.user_id = u.id
            LEFT JOIN LATERAL (
                SELECT message_text, created_at FROM messages 
                WHERE conversation_id = c.id 
                ORDER BY created_at DESC LIMIT 1
            ) m ON true
            ORDER BY sort_time DESC`,
            [user_id]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== SOCKET.IO EVENTS ====================

io.on('connection', (socket) => {
    console.log(`New user connected: ${socket.id}`);

    // User joins chat
    socket.on('user_joined', (data) => {
        const { user_id, full_name } = data;
        activeUsers.set(user_id, { socket_id: socket.id, full_name });
        io.emit('user_online', { user_id, full_name });
        console.log(`User ${full_name} (${user_id}) is online`);
    });

    // Join conversation room
    socket.on('join_conversation', (data) => {
        const { conversation_id } = data;
        socket.join(`conversation_${conversation_id}`);
        console.log(`Socket ${socket.id} joined conversation ${conversation_id}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (data) => {
        const { conversation_id } = data;
        socket.leave(`conversation_${conversation_id}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
        try {
            const { conversation_id, sender_id, message_text } = data;

            // Save to database
            const result = await pool.query(
                `INSERT INTO messages (conversation_id, sender_id, message_text, message_type)
                VALUES ($1, $2, $3, 'text') RETURNING id, created_at`,
                [conversation_id, sender_id, message_text]
            );

            const messageId = result.rows[0].id;
            const createdAt = result.rows[0].created_at;

            // Get sender info
            const senderInfo = await pool.query(
                `SELECT full_name, user_type FROM users WHERE id = $1`,
                [sender_id]
            );

            const messageData = {
                id: messageId,
                conversation_id,
                sender_id,
                message_text,
                full_name: senderInfo.rows[0].full_name,
                user_type: senderInfo.rows[0].user_type,
                created_at: createdAt,
                is_read: false
            };

            // Broadcast to conversation room
            io.to(`conversation_${conversation_id}`).emit('receive_message', messageData);
            console.log(`Message sent in conversation ${conversation_id}`);
        } catch (err) {
            console.error(err.message);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    // User typing
    socket.on('user_typing', (data) => {
        const { conversation_id, user_id, full_name } = data;
        io.to(`conversation_${conversation_id}`).emit('user_typing', {
            user_id,
            full_name
        });
    });

    // User stopped typing
    socket.on('user_stopped_typing', (data) => {
        const { conversation_id, user_id } = data;
        io.to(`conversation_${conversation_id}`).emit('user_stopped_typing', {
            user_id
        });
    });

    // Disconnect
    socket.on('disconnect', () => {
        for (let [userId, userData] of activeUsers.entries()) {
            if (userData.socket_id === socket.id) {
                activeUsers.delete(userId);
                io.emit('user_offline', { user_id: userId });
                console.log(`User ${userData.full_name} is offline`);
                break;
            }
        }
    });
});

// Get active users
app.get('/api/chat/active-users', (req, res) => {
    const users = Array.from(activeUsers.entries()).map(([userId, userData]) => ({
        user_id: userId,
        full_name: userData.full_name
    }));
    res.json(users);
});

// Start server
server.listen(port, () => {
    console.log(`Auth & Chat server running on http://localhost:${port}`);
});
