# Admin Panel Integration Guide

## 🔗 How to Integrate with Your Existing System

This guide explains how to add the admin panel to your NIST Information-Chatting application.

---

## Step 1: Add Admin Link to Navigation

Add a link to the admin panel in your main navigation (if you have one). This should only be visible to admin users.

### In your existing HTML navigation:
```html
<nav>
    <!-- Your existing navigation items -->
    <a href="/dashboard.html">Dashboard</a>
    <a href="/chat.html">Chat</a>
    
    <!-- Add this for admins only -->
    <div id="adminNav" style="display:none;">
        <a href="/admin_dashboard/admin.html" class="admin-link">🔐 Admin Panel</a>
    </div>
</nav>

<script>
// Show admin link only for admin users
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.user_type === 'admin') {
        document.getElementById('adminNav').style.display = 'block';
    }
});
</script>
```

---

## Step 2: Update Your Login System

Ensure your login system sets the correct user_type for admin users.

### In your `auth-server.js` (if using our auth system):
The login endpoint already handles user_type. Just make sure to create an admin user:

```javascript
// After login, the token includes user_type
const token = jwt.sign(
    { id: user.id, email: user.email, user_type: user.user_type },
    JWT_SECRET,
    { expiresIn: '24h' }
);
```

---

## Step 3: Start the Admin Server

You now have THREE servers running:

### Server 1: Main Server (auth-server.js)
```bash
# Port 3001 - Handles authentication and chat
node backend/auth-server.js
```

### Server 2: Timetable Server (server.js)
```bash
# Port 3000 - Handles timetable data
node backend/server.js
```

### Server 3: Admin Server (admin-server.js) - **NEW**
```bash
# Port 3002 - Handles admin operations
node backend/admin-server.js
```

**Recommended:** Create a startup script to run all three:

#### On Windows (run-all-servers.bat):
```batch
@echo off
echo Starting all servers...
start cmd /k "cd backend && node auth-server.js"
timeout /t 2
start cmd /k "cd backend && node server.js"
timeout /t 2
start cmd /k "cd backend && node admin-server.js"
echo All servers started!
pause
```

#### On Mac/Linux (run-all-servers.sh):
```bash
#!/bin/bash
echo "Starting all servers..."
cd backend
node auth-server.js &
sleep 2
node server.js &
sleep 2
node admin-server.js &
echo "All servers started!"
```

---

## Step 4: Database Update

Run the migration script to add admin-related columns:

```bash
psql -U your_db_user -d your_db_name -f admin_migration.sql
```

Or execute the SQL commands manually in your PostgreSQL client.

---

## Step 5: Create Admin Users

You have several options to create admin users:

### Option A: Via Admin Panel (Recommended)
1. Login as an existing admin user
2. Go to Admin Panel → Create User
3. Set user_type to "admin"
4. Click Create User

### Option B: Via SQL
```sql
-- Find a user and make them admin
UPDATE users SET user_type = 'admin' 
WHERE email = 'admin@example.com';
```

### Option C: Via API
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecureAdminPassword123!",
    "full_name": "Admin User",
    "user_type": "admin",
    "roll_number": "ADMIN001"
  }'
```

---

## Step 6: Test the Admin Panel

1. **Login as Admin User**
   - Go to http://localhost:3000/login.html (or your login page)
   - Enter admin credentials
   - Click Login

2. **Access Admin Panel**
   - Navigate to http://localhost:3000/admin_dashboard/admin.html
   - You should see the dashboard load
   - If you see a login screen, your admin user wasn't created properly

3. **Test Admin Functions**
   - Click "User Management"
   - You should see a list of all users
   - Try filtering, searching, and pagination
   - Try creating a new user
   - Try editing a user
   - Try deleting a user (be careful!)

---

## Integration Checklist

- [ ] Admin panel files copied to `admin_dashboard/` folder
- [ ] Admin server (`admin-server.js`) is in `backend/` folder
- [ ] Database migration script executed
- [ ] Admin user created in database
- [ ] Admin server is running on port 3002
- [ ] JWT tokens from auth-server work with admin-server
- [ ] Can access admin panel at http://localhost:3000/admin_dashboard/admin.html
- [ ] User statistics display correctly
- [ ] Can create, edit, and delete users
- [ ] Search and filter functions work
- [ ] Logout redirects to login page

---

## API Compatibility

The admin server uses the **same JWT token format** as your existing auth-server, so:

✅ Tokens from `/api/auth/login` work with `/api/admin/*` endpoints
✅ The same database (rasa_db) is used
✅ Same PostgreSQL connection configuration

---

## File Structure After Integration

```
NIST_Information-Chatting/
├── backend/
│   ├── auth-server.js          (Port 3001)
│   ├── server.js               (Port 3000)
│   ├── admin-server.js         (Port 3002) ← NEW
│   └── chat-server.js
├── admin_dashboard/            ← NEW
│   ├── admin.html
│   ├── admin-style.css
│   └── admin-dashboard.js
├── student_dashboard/
├── faculty_dashboard/
├── alumni_dashboard/
├── Users_dashboard/
├── admin_migration.sql         ← NEW
├── ADMIN_SETUP_GUIDE.md       ← NEW
├── ADMIN_PANEL_CHECKLIST.md   ← NEW
└── [other files...]
```

---

## Customization Options

### Change Admin Port
In `backend/admin-server.js`, line with `const port`:
```javascript
const port = 3003;  // Change from 3002 to your preferred port
```

### Change Admin URL
In `admin_dashboard/admin-dashboard.js`, line with `const API_URL`:
```javascript
const API_URL = 'http://localhost:3003/api/admin';  // Match your port
```

### Add Custom Styling
Edit `admin_dashboard/admin-style.css` to match your brand colors and design

### Add More User Fields
1. Add column to users table in PostgreSQL
2. Update the SQL migration script
3. Add form field in admin.html
4. Add JavaScript handler in admin-dashboard.js
5. Update API endpoints in admin-server.js

---

## Security Best Practices Post-Integration

1. **Change JWT Secret**
   ```javascript
   // In auth-server.js and admin-server.js
   const JWT_SECRET = 'generate-a-random-long-string-here';
   ```

2. **Use Environment Variables**
   ```bash
   # Create .env file
   DB_USER=your_user
   DB_HOST=localhost
   DB_NAME=rasa_db
   DB_PASSWORD=your_password
   JWT_SECRET=your_secret_key
   ```

3. **Update Code to Use .env**
   ```javascript
   require('dotenv').config();
   const pool = new Pool({
       user: process.env.DB_USER,
       host: process.env.DB_HOST,
       database: process.env.DB_NAME,
       password: process.env.DB_PASSWORD,
       port: 5432,
   });
   ```

4. **Add HTTPS in Production**
   - Use SSL certificates
   - Update URLs to use https://

5. **Add Rate Limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
       windowMs: 15 * 60 * 1000,
       max: 100
   });
   app.use('/api/admin', limiter);
   ```

---

## Troubleshooting Integration Issues

### Issue: "Cannot find module" error
**Solution**: Make sure all files are in correct directories
```
backend/admin-server.js ✓
admin_dashboard/admin.html ✓
admin_dashboard/admin-style.css ✓
admin_dashboard/admin-dashboard.js ✓
```

### Issue: "Admin access required" error
**Solution**: Verify user has admin type
```sql
SELECT * FROM users WHERE user_type = 'admin';
```

### Issue: "Failed to load users" error
**Solution**: Make sure admin-server.js is running on port 3002
```bash
node backend/admin-server.js
```

### Issue: CORS error
**Solution**: Ensure CORS is enabled in admin-server.js:
```javascript
app.use(cors());  // Should be present
```

### Issue: Token not being sent to admin API
**Solution**: Check that localStorage has 'authToken' set after login:
```javascript
// In browser console
localStorage.getItem('authToken')  // Should return a token
```

---

## Next Steps

After successful integration:

1. ✅ Create backup of your database
2. ✅ Test all admin functions in a safe environment
3. ✅ Train admins on how to use the panel
4. ✅ Set up regular admin user audits
5. ✅ Monitor admin actions through logs (future enhancement)
6. ✅ Plan for production deployment

---

## Support

If you encounter issues:
1. Check `ADMIN_SETUP_GUIDE.md` for detailed API documentation
2. Review `ADMIN_PANEL_CHECKLIST.md` for testing checklist
3. Check browser console (F12) for JavaScript errors
4. Check server console for backend errors
5. Verify database connection

---

**Integration Version**: 1.0
**Last Updated**: December 2024
