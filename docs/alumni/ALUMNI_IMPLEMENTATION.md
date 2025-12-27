# Alumni Role & Roll Number Implementation - Setup Instructions

## ✅ What's Been Implemented

### Backend (Node.js/Express)
- ✅ Signup endpoint now requires `roll_number` field
- ✅ All 3 roles supported: `student`, `faculty`, `alumni`
- ✅ JWT tokens include `roll_number`
- ✅ Profile endpoints return `roll_number`
- ✅ Alumni role treated as equal to student and faculty

### Frontend
- ✅ Signup form updated with `roll_number` field
- ✅ Signup form includes `Alumni` as role option
- ✅ Profile page shows `roll_number` for all users
- ✅ Profile page has alumni-specific sections (company, job, LinkedIn, referrals)
- ✅ Alumni dashboard created at `/alumni_dashboard/dashboard.html`

### Database
- ⚠️ Needs schema update (see instructions below)

---

## 🔧 Database Setup

The system is currently configured to work with roll_number, but the database needs to be updated.

### Option 1: SQL Commands (Recommended)
Run these SQL commands as postgres (superuser):

```sql
-- Add roll_number column with unique constraint
ALTER TABLE users ADD COLUMN IF NOT EXISTS roll_number VARCHAR(50) UNIQUE;

-- Allow duplicate emails (remove email unique constraint)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- Create index on email for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Update user_type check constraint to include 'alumni'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check;
ALTER TABLE users ADD CONSTRAINT users_user_type_check 
    CHECK (user_type IN ('student', 'faculty', 'alumni'));
```

### Option 2: Using pgAdmin
1. Open pgAdmin and connect to `rasa_db` database
2. Go to Tables → users
3. Right-click and select "Queries" → "Create Script"
4. Copy and run the SQL commands above

---

## 🧪 Testing the Implementation

### 1. Test Alumni Signup
```
Go to: http://localhost:3001/signup.html

Fill in:
- Name: Test Alumni
- Email: alumni@test.com
- Password: password123
- Roll Number: ALUM-2024-001
- Role: Alumni (select from dropdown)

Expected: Should create alumni user and redirect to /alumni_dashboard/dashboard.html
```

### 2. Test Student Signup (with roll_number)
```
- Name: Test Student
- Email: student@test.com
- Password: password123
- Roll Number: STU-2024-001
- Role: Student

Expected: Should redirect to /student_dashboard/dashboard.html
```

### 3. Test Faculty Signup (with roll_number)
```
- Name: Test Faculty
- Email: faculty@test.com
- Password: password123
- Roll Number: FAC-2024-001
- Role: Faculty

Expected: Should redirect to /faculty_dashboard/dashboard.html
```

### 4. Verify Profile Display
```
Login as any user → Click Profile (👤)

Expected:
- Roll Number displayed prominently
- For Alumni: See company, job title, LinkedIn, referrals fields
- For Students: See batch and skills fields
- For Faculty: See qualifications and research interests fields
```

---

## 📁 Files Modified/Created

### Modified:
- `signup.html` - Added roll_number field and alumni option
- `profile.html` - Shows roll_number for all roles, alumni-specific sections
- `backend/auth-server.js` - Updated signup/login/profile endpoints
- `student_dashboard/signup.html` - Form submission includes roll_number

### Created:
- `alumni_dashboard/dashboard.html` - Alumni user interface
- `alumni_dashboard/dashboard.js` - Alumni chat functionality
- `migration.sql` - Database migration SQL
- `run_migration.js` - Migration script
- `check_schema.js` - Schema verification script
- This setup file

---

## 🎯 System Architecture

```
Users Table Schema:
├── id (PRIMARY KEY)
├── email (VARCHAR, NOT UNIQUE with index)
├── password (VARCHAR)
├── full_name (VARCHAR)
├── user_type (VARCHAR) - CHECK IN ('student', 'faculty', 'alumni')
├── roll_number (VARCHAR, UNIQUE) ← PRIMARY IDENTIFIER
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

Authentication Flow:
├── Signup: email → generate roll_number → store with user_type
├── Login: email lookup → JWT includes roll_number
└── Profile: roll_number used for all profile operations

User Roles:
├── Student: Has batch, skills, basic profile
├── Faculty: Has qualifications, research interests, office hours
└── Alumni: Has company, job_title, LinkedIn, referral status
```

---

## 🚀 Running the System

```bash
# Terminal 1: Backend server
cd backend
npm install
node auth-server.js

# Terminal 2: Frontend (if using local server)
# Serve from root directory on port 3000

# Terminal 3: Run migration (if database needs updating)
cd root directory
node run_migration.js
```

---

## ✨ Key Features

### For Alumni:
- Separate dashboard with alumni-specific messaging
- Profile section for career information
- Job referral status tracking
- LinkedIn profile linkage
- Network with fellow alumni, students, and faculty

### For All Users:
- Roll number as universal unique identifier
- Cross-role messaging (alumni can chat with students/faculty)
- Profile management by role
- Real-time notifications
- Document sharing

---

## 🔗 Important Endpoints

```
Auth:
POST /api/auth/signup - Requires: email, password, full_name, roll_number, user_type
POST /api/auth/login - Email-based login
GET /api/auth/me - Returns user with roll_number

Profile:
GET /api/profile - Get user profile
PUT /api/profile - Update user profile

Chat:
GET /api/chat/users - List all users
GET /api/chat/conversations - List conversations
GET /api/chat/messages/:convId - Get conversation messages
POST /api/chat/send-message - Send message
```

---

## ⚠️ Known Issues & Workarounds

### Issue: Database says "must be owner of table"
- The rasa_user doesn't have DDL permissions
- **Solution**: Use pgAdmin or execute SQL as postgres superuser

### Issue: Roll number already exists error
- This is expected behavior - prevents duplicate roll numbers
- **Solution**: Use unique roll numbers for each user

### Issue: Alumni dashboard not showing
- Check if signup completed and localStorage has user data
- Check browser console for errors
- Verify backend is running on port 3001

---

## 📝 Migration Checklist

- [ ] Database schema updated (roll_number column added)
- [ ] Backend server restarted
- [ ] Test signup with roll_number
- [ ] Create test users (student, faculty, alumni)
- [ ] Verify alumni can access alumni_dashboard
- [ ] Test profile updates for each role
- [ ] Test messaging between different roles
- [ ] Verify roll_number displays in profiles

---

**Last Updated**: Implementation Complete
**Status**: Ready for Testing
**Next Steps**: Execute SQL migration and run tests
