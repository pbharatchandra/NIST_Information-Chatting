# NIST College Chat - Complete Setup Guide

## 🎯 Overview

This is a **full-stack authenticated chat application** with:
- ✅ User registration (Sign Up)
- ✅ User authentication (Login)
- ✅ JWT token-based session management
- ✅ Real-time messaging with Socket.IO
- ✅ Separate student and faculty dashboards
- ✅ User online/offline status
- ✅ Message history persistence

## 📋 Prerequisites

- Node.js (v14+)
- PostgreSQL (v10+)
- npm or yarn

## 🚀 Installation Steps

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `express` - Web framework
- `socket.io` - Real-time communication
- `pg` - PostgreSQL driver
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `cors` - Cross-origin requests

### Step 2: Setup Database

**Create the database schema:**

```bash
psql -U rasa_user -h localhost -d rasa_db -f auth_schema.sql
```

Or manually:

```sql
psql -U rasa_user -h localhost -d rasa_db
```

Then paste the contents of `auth_schema.sql`

**Grant permissions:**

```sql
GRANT USAGE ON SCHEMA public TO rasa_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO rasa_user;
GRANT INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO rasa_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rasa_user;
```

### Step 3: Start the Server

```bash
node backend/auth-server.js
```

You should see:
```
Auth & Chat server running on http://localhost:3001
```

### Step 4: Access the Application

Open your browser and go to:
```
http://localhost:3001
```

## 📱 User Flow

### 1. **Landing Page** (`index.html`)
   - Choose "Sign Up" or "Login"

### 2. **Sign Up Page** (`signup.html`)
   - Enter: Full Name, Email, Password, Role (Student/Faculty)
   - Creates user in database
   - Auto-login and redirects to dashboard

### 3. **Login Page** (`login.html`)
   - Enter: Email, Password
   - Validates credentials
   - Redirects to appropriate dashboard

### 4. **Student Dashboard** (`/student_dashboard/dashboard.html`)
   - View online users
   - View conversation list
   - Send/receive messages in real-time
   - Search and start new conversations

### 5. **Faculty Dashboard** (`/faculty_dashboard/dashboard.html`)
   - Same as student dashboard
   - Can communicate with students and other faculty

## 🔐 Authentication Flow

1. **Sign Up**: Email + Password → Hash Password → Store in DB → Generate JWT
2. **Login**: Email + Password → Hash Comparison → Generate JWT → Store in LocalStorage
3. **Authenticated Requests**: JWT included in Authorization header
4. **Socket.IO**: JWT passed in connection auth

## 📁 Project Structure

```
NIST_Information-Chatting/
├── index.html                           # Landing page
├── signup.html                          # Registration form
├── login.html                           # Login form
├── style.css                            # Global styles
├── auth_schema.sql                      # Database schema
├── package.json                         # Dependencies
├── backend/
│   └── auth-server.js                   # Auth & Chat server
├── student_dashboard/
│   ├── dashboard.html                   # Student interface
│   └── dashboard.js                     # Student logic
└── faculty_dashboard/
    ├── dashboard.html                   # Faculty interface
    └── dashboard.js                     # Faculty logic
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/signup` | `{email, password, full_name, user_type}` | `{token, user}` |
| POST | `/api/auth/login` | `{email, password}` | `{token, user}` |
| GET | `/api/auth/me` | - | `{user}` |

### Chat

| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| GET | `/api/chat/users` | JWT | `[{id, full_name, user_type}]` |
| POST | `/api/chat/conversation` | JWT | `{conversation_id}` |
| GET | `/api/chat/messages/:id` | JWT | `[{message}]` |
| GET | `/api/chat/conversations` | JWT | `[{conversation}]` |

### WebSocket Events

**Client → Server:**
- `user_joined` - User comes online
- `join_conversation` - Join a conversation room
- `send_message` - Send a message
- `user_typing` - User is typing
- `user_stopped_typing` - User stopped typing
- `leave_conversation` - Leave a conversation

**Server → Client:**
- `user_online` - User came online
- `user_offline` - User went offline
- `receive_message` - New message received
- `user_typing` - Someone is typing
- `user_stopped_typing` - Someone stopped typing

## 🧪 Testing

### Test Scenario 1: Basic Chat

1. **User A (Student)**: Sign up
   - Email: `student1@college.edu`
   - Password: `password123`
   - Role: Student

2. **User B (Faculty)**: Sign up
   - Email: `faculty1@college.edu`
   - Password: `password123`
   - Role: Faculty

3. **Start Chat**: User A searches for User B and sends "Hello"

4. **Receive**: User B receives message in real-time

### Test Scenario 2: Multiple Users

- Open 3-4 browser windows
- Sign up different users
- Have conversations between different pairs
- Test online/offline status

## ⚙️ Configuration

### JWT Secret (IMPORTANT - Change in Production)

In `backend/auth-server.js`:
```javascript
const JWT_SECRET = 'your_jwt_secret_key_change_this_in_production';
```

**Change this to a secure random string!**

### Database Connection

In `backend/auth-server.js`:
```javascript
const pool = new Pool({
    user: 'rasa_user',
    host: 'localhost',
    database: 'rasa_db',
    password: 'rootadmin',
    port: 5432,
});
```

### API URL

In all `.html` and `.js` files:
```javascript
const API_URL = 'http://localhost:3001';
```

## 🛡️ Security Features

✅ Password hashing with bcryptjs
✅ JWT token-based authentication
✅ CORS protection
✅ Input validation
✅ SQL injection protection (parameterized queries)
✅ XSS protection (HTML escaping)

## 📊 Database Schema

### users table
```sql
- id (PRIMARY KEY)
- email (UNIQUE)
- password (HASHED)
- full_name
- user_type (student/faculty)
- created_at
- updated_at
```

### conversations table
```sql
- id (PRIMARY KEY)
- conversation_name
- conversation_type (direct/group)
- created_at
- updated_at
```

### conversation_members table
```sql
- id (PRIMARY KEY)
- conversation_id (FK)
- user_id (FK)
- joined_at
```

### messages table
```sql
- id (PRIMARY KEY)
- conversation_id (FK)
- sender_id (FK)
- message_text
- message_type (text/image/file)
- is_read
- created_at
```

## 🚨 Troubleshooting

### Server won't start
- Check if port 3001 is in use
- Verify Node.js is installed: `node --version`
- Check database connection

### Can't sign up
- Verify database tables exist
- Check database permissions
- Ensure email doesn't already exist

### Messages not loading
- Check browser console (F12)
- Verify Socket.IO is connected
- Check API URL is correct

### "Invalid token" error
- Clear localStorage: F12 → Application → LocalStorage → Clear All
- Log in again

## 🔄 Deployment

### Environment Variables

Create a `.env` file:
```
DB_USER=rasa_user
DB_HOST=localhost
DB_NAME=rasa_db
DB_PASSWORD=rootadmin
DB_PORT=5432
JWT_SECRET=your_secret_key
PORT=3001
NODE_ENV=production
```

### Production Checklist

- [ ] Change JWT_SECRET
- [ ] Use HTTPS/WSS
- [ ] Enable CORS properly
- [ ] Set NODE_ENV=production
- [ ] Use environment variables
- [ ] Enable rate limiting
- [ ] Add request validation
- [ ] Set up error logging
- [ ] Use reverse proxy (nginx)
- [ ] Enable GZIP compression

## 📝 Future Enhancements

- [ ] Group chat support
- [ ] File sharing
- [ ] Message search
- [ ] User profiles
- [ ] Message reactions/emojis
- [ ] Voice/video calling
- [ ] Message encryption
- [ ] Push notifications
- [ ] Message editing/deletion
- [ ] Read receipts

## 📚 Dependencies

```json
{
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "express": "^5.2.1",
  "jsonwebtoken": "^9.0.0",
  "pg": "^8.16.3",
  "socket.io": "^4.5.4"
}
```

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review browser console logs
- Check server terminal output
- Verify database tables exist
- Ensure all dependencies are installed

---

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Status:** Production Ready ✅
