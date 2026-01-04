# 🎓 NIST College Chat

A full-stack real-time chat application for NIST College with authentication, notifications, and role-based dashboards.

## ✅ Features

| Feature | Description |
|---------|-------------|
| **Authentication** | JWT-based login/signup with bcrypt password hashing |
| **Real-time Chat** | Socket.IO powered instant messaging |
| **Notifications** | Toast popups, audio alerts, unread badges, browser notifications |
| **Profile Pictures** | Upload with protected access (auth headers) |
| **Role Dashboards** | Student, Faculty, Alumni, and Admin portals |
| **Status Tracking** | Online/offline user status |
| **Message History** | Persistent PostgreSQL storage |

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the server
node backend/auth-server.js

# 3. Open in browser
http://localhost:3001
```

## 📁 Project Structure

```
├── frontend/          # HTML pages (login, signup, profile, etc.)
├── backend/           # Express + Socket.IO servers
├── student_dashboard/ # Student portal
├── faculty_dashboard/ # Faculty portal
├── alumni_dashboard/  # Alumni portal
├── admin_dashboard/   # Admin portal
├── database/          # SQL schemas & migrations
└── uploads/           # Profile pictures (protected)
```

## 💻 Tech Stack

- **Backend:** Node.js, Express.js, Socket.IO, PostgreSQL
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Auth:** JWT, bcryptjs
- **File Upload:** Multer

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/users` | List available users |
| POST | `/api/chat/conversation` | Create conversation |
| GET | `/api/chat/messages/:id` | Get messages |
| GET | `/api/chat/conversations` | List conversations |

## 🔐 Security

- JWT token authentication
- bcrypt password hashing
- Protected image endpoints with auth headers
- Directory traversal protection
- File size limits (500KB)
- File type validation

## 📊 Database Tables

- `users` - User accounts with profile info
- `conversations` - Chat conversations (direct/group)
- `conversation_members` - Conversation participants
- `messages` - Message storage with timestamps

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Port in use | `taskkill /F /IM node.exe` |
| DB connection error | Verify PostgreSQL is running |
| Notifications not showing | Check browser console & Socket.IO connection |

## ✅ Production Checklist

- [ ] Change JWT_SECRET to secure value
- [ ] Enable HTTPS
- [ ] Set CORS origin to actual domain
- [ ] Enable database backups
- [ ] Set up error logging & monitoring

---

**Version:** 3.0  
**Status:** ✅ Production Ready  
**URL:** http://localhost:3001