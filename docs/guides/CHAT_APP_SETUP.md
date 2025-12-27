# Chat Application Setup Guide

## Overview
This is a full-stack real-time chatting application for your college website that enables communication between students and faculty using WebSocket technology.

## Features
✅ Real-time messaging using Socket.IO
✅ Direct one-to-one conversations
✅ User online/offline status
✅ Message history persistence
✅ Typing indicators
✅ Search functionality
✅ Responsive design for mobile and desktop
✅ Separate interfaces for students and faculty

## Architecture
```
Frontend (Students & Faculty)
    ↓
Backend Server (Express + Socket.IO)
    ↓
PostgreSQL Database
```

## Installation Steps

### 1. Install Node.js Dependencies
```bash
npm install
```

This will install:
- express (Web framework)
- socket.io (Real-time communication)
- socket.io-client (Client-side WebSocket)
- pg (PostgreSQL driver)
- cors (Cross-Origin Resource Sharing)

### 2. Database Setup

**Step 1: Connect to PostgreSQL**
```bash
psql -U rasa_user -h localhost -d rasa_db
```

**Step 2: Run the schema file**
```bash
psql -U rasa_user -h localhost -d rasa_db -f chat_schema.sql
```

This creates the following tables:
- `users` - User information (students, faculty, admins)
- `conversations` - Chat conversations (direct or group)
- `conversation_members` - Members in each conversation
- `messages` - Actual messages with timestamps

**Step 3: Insert sample users (optional)**
```sql
INSERT INTO users (username, email, password, user_type, full_name) VALUES
('student1', 'student1@nist.edu', 'password123', 'student', 'John Doe'),
('faculty1', 'faculty1@nist.edu', 'password123', 'faculty', 'Dr. Sarah Smith'),
('student2', 'student2@nist.edu', 'password123', 'student', 'Jane Smith'),
('faculty2', 'faculty2@nist.edu', 'password123', 'faculty', 'Dr. Mike Johnson');
```

### 3. Start the Chat Server

Open a terminal and run:
```bash
node backend/chat-server.js
```

You should see:
```
Chat server running on http://localhost:3001
```

### 4. Access the Chat Application

**For Students:**
- Open: `http://localhost:3001/student_dashboard/chat.html`

**For Faculty:**
- Open: `http://localhost:3001/faculty_dashboard/chat.html`

## Usage Guide

### Starting a Chat
1. Click the **+** button in the Messages header
2. Search for the person you want to chat with
3. Click their name to start a conversation
4. Type your message and press Enter or click Send

### Online Status
- Green dot = User is online
- Gray dot = User is offline

### Typing Indicator
See when someone is typing in real-time before they send a message

### Chat History
All messages are automatically saved to the database and can be retrieved even after page refresh

## Project Structure
```
.
├── backend/
│   └── chat-server.js              # Main chat server with Socket.IO
├── student_dashboard/
│   ├── chat.html                   # Student chat interface
│   ├── chat.js                     # Student chat logic
│   └── chat.css                    # Chat styling
├── faculty_dashboard/
│   ├── chat.html                   # Faculty chat interface
│   ├── chat.js                     # Faculty chat logic
│   └── chat.css                    # Chat styling
├── chat_schema.sql                 # Database schema
└── package.json                    # Dependencies
```

## API Endpoints

### REST Endpoints
- `GET /api/chat/users/:user_id` - Get all users except current user
- `POST /api/chat/conversation` - Create or get existing conversation
- `GET /api/chat/messages/:conversation_id` - Get chat history
- `GET /api/chat/conversations/:user_id` - Get user's conversations
- `GET /api/chat/active-users` - Get currently online users

### WebSocket Events

**Client → Server:**
- `user_joined` - User comes online
- `join_conversation` - Join a conversation room
- `send_message` - Send a message
- `user_typing` - User is typing
- `user_stopped_typing` - User stopped typing
- `mark_read` - Mark message as read
- `leave_conversation` - Leave a conversation

**Server → Client:**
- `receive_message` - New message received
- `user_online` - User came online
- `user_offline` - User went offline
- `user_typing` - Someone is typing
- `user_stopped_typing` - Someone stopped typing

## Configuration

### Database Credentials
Update these in `backend/chat-server.js`:
```javascript
const pool = new Pool({
    user: 'rasa_user',      // Your PostgreSQL user
    host: 'localhost',      // Your PostgreSQL host
    database: 'rasa_db',    // Your database name
    password: 'rootadmin',  // Your password
    port: 5432,             // PostgreSQL port
});
```

### Server Port
Default port is `3001`. Change it in `backend/chat-server.js`:
```javascript
const port = 3001;
```

### Chat Server URL
Update in chat.js files if your server is on a different URL:
```javascript
const CHAT_SERVER = 'http://localhost:3001';
```

## Authentication Integration

Currently, the app uses localStorage for user identification. For production:

1. **Replace localStorage with proper authentication:**
   ```javascript
   // Current (demo):
   let currentUserId = localStorage.getItem('user_id');
   
   // Should be:
   let currentUserId = getFromAuthenticationSystem();
   ```

2. **Add JWT token validation in the backend:**
   ```javascript
   // In chat-server.js
   io.use((socket, next) => {
       const token = socket.handshake.auth.token;
       // Validate JWT and set socket.userId
   });
   ```

## Troubleshooting

### Chat server not connecting
- Verify port 3001 is not in use: `netstat -an | findstr 3001` (Windows)
- Check firewall settings
- Ensure Node.js is installed: `node --version`

### Database connection failed
- Verify PostgreSQL is running
- Check credentials in chat-server.js
- Ensure the database and tables exist: `\dt` in psql

### Messages not appearing
- Check browser console for errors (F12)
- Verify Socket.IO is loaded (check Network tab)
- Check that both users are in the same conversation

### User list not loading
- Clear browser cache
- Check if other users' user_id matches in localStorage
- Verify database has multiple users

## Performance Optimization

1. **Message Pagination:** The app loads 50 messages by default. Implement pagination for large chat histories
2. **Message Compression:** Use gzip compression for Socket.IO
3. **Database Indexing:** Already included in chat_schema.sql
4. **Connection Pooling:** Configured in chat-server.js

## Security Considerations

⚠️ **For Production:**
1. Add authentication/authorization
2. Validate all user inputs
3. Use HTTPS/WSS (WebSocket Secure)
4. Implement rate limiting
5. Add message encryption
6. Sanitize HTML in messages
7. Add CSRF protection
8. Use environment variables for sensitive data

## Future Enhancements

- [ ] File/image sharing
- [ ] Group chat support
- [ ] Message reactions/emojis
- [ ] Voice/video calling
- [ ] Message search functionality
- [ ] Notification system
- [ ] Message deletion/editing
- [ ] User profiles
- [ ] End-to-end encryption
- [ ] Mobile app (React Native)

## Support

For issues or questions, please refer to:
- Socket.IO Documentation: https://socket.io/docs/
- Express Documentation: https://expressjs.com/
- PostgreSQL Documentation: https://www.postgresql.org/docs/

---

**Last Updated:** December 2024
**Version:** 1.0.0
