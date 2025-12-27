# Quick Start Guide - NIST Professional Network

## 🚀 Start Server in 3 Steps

### Step 1: Navigate to Project
```bash
cd "c:\Games\NIST_Information-Chatting"
```

### Step 2: Install Dependencies (First Time Only)
```bash
npm install
```

### Step 3: Start Server
```bash
node backend/auth-server.js
```

**Output should show:**
```
Auth & Chat server running on http://localhost:3001
```

---

## 🌐 Access Application

Open in browser: **http://localhost:3001/**

---

## 👤 Test Accounts

### Faculty Account
- **Email**: faculty@nist.edu
- **Password**: faculty123
- **Role**: Faculty
- **Features**: Upload documents, manage courses

### Student Account
- **Email**: student@nist.edu  
- **Password**: student123
- **Role**: Student
- **Features**: Access documents, message faculty

---

## 📱 New Features Available

| Feature | Page | Access |
|---------|------|--------|
| **Real-Time Chat** | Dashboard | Main interface |
| **Profile Management** | /profile.html | Click 👤 icon |
| **Document Sharing** | /documents.html | Click 📄 icon |
| **Alumni Network** | /alumni.html | Click 🎓 icon |

---

## ✨ Key Pages

### Landing Page
- URL: `http://localhost:3001/`
- Sign Up / Login

### Student Dashboard
- URL: `http://localhost:3001/student_dashboard/dashboard.html`
- Real-time messaging
- View documents
- Browse alumni

### Faculty Dashboard
- URL: `http://localhost:3001/faculty_dashboard/dashboard.html`
- Message students
- Upload documents
- Manage resources

### Profile Page
- URL: `http://localhost:3001/profile.html`
- Edit personal information
- Update professional details
- Add skills and links

### Documents Page
- URL: `http://localhost:3001/documents.html`
- Browse course materials
- Upload (faculty only)
- Share with students

### Alumni Network
- URL: `http://localhost:3001/alumni.html`
- Search alumni
- Request referrals
- Browse job opportunities

---

## 🔧 Troubleshooting

### Server Won't Start?
```bash
# Kill any process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Then try again
node backend/auth-server.js
```

### Database Connection Error?
1. Check PostgreSQL is running
2. Database: `rasa_db`
3. User: `rasa_user`
4. Password: `rootadmin`

### Can't Create Account?
- Use unique email address
- Password must be provided
- Select valid role (Student/Faculty)

---

## 📞 Quick Help

**Can't login?**
→ Register new account with unique email

**Messages not appearing?**
→ Refresh page, check database connection

**Can't upload documents?**
→ Must be logged in as Faculty role

**Socket.IO errors?**
→ Clear browser cache and refresh

---

## 🎯 Next Steps

1. ✅ Start server (`node backend/auth-server.js`)
2. ✅ Open browser (`http://localhost:3001`)
3. ✅ Create account (Sign Up)
4. ✅ Login with credentials
5. ✅ Start messaging!
6. ✅ Explore new features (Profile, Documents, Alumni)

---

## 📊 API Base URL

All API calls use: **`http://localhost:3001`**

Example:
```javascript
fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
})
```

---

**Need more help?** See FEATURES_README.md for detailed documentation.
