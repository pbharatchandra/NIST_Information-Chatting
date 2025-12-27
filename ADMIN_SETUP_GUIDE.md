# Admin User Management System - Complete Guide

## Overview

This admin panel provides comprehensive user management capabilities including creating, reading, updating, and deleting users of all types (students, faculty, alumni, and admins).

## Components

### 1. Backend Server (`backend/admin-server.js`)

**Port:** 3002

#### Features:
- JWT-based authentication
- Role-based access control (Admin only)
- Full CRUD operations for users
- User statistics and filtering

#### API Endpoints:

**Authentication Required:** All endpoints require JWT token in Authorization header

```
Authorization: Bearer <your_jwt_token>
```

##### Get All Users
```
GET /api/admin/users
Returns: Array of all users
```

##### Get Single User
```
GET /api/admin/users/:id
Returns: User object with all details
```

##### Create New User
```
POST /api/admin/users
Body: {
    email: "user@example.com",
    password: "securepassword",
    full_name: "John Doe",
    user_type: "student|faculty|alumni|admin",
    roll_number: "21BIT042" (optional),
    phone: "9876543210" (optional),
    location: "City, Country" (optional),
    bio: "User bio" (optional),
    github: "https://github.com/username" (optional),
    portfolio: "https://portfolio.com" (optional)
}
```

##### Update User
```
PUT /api/admin/users/:id
Body: {
    email: "newemail@example.com" (optional),
    full_name: "New Name" (optional),
    user_type: "faculty|student|alumni|admin" (optional),
    roll_number: "21BIT043" (optional),
    phone: "9876543211" (optional),
    location: "New City" (optional),
    bio: "Updated bio" (optional),
    github: "https://github.com/newusername" (optional),
    portfolio: "https://newportfolio.com" (optional)
}
```

##### Delete User
```
DELETE /api/admin/users/:id
Returns: Success message
```

##### Change User Password (by Admin)
```
POST /api/admin/users/:id/change-password
Body: {
    new_password: "newpassword123"
}
```

##### Get Statistics
```
GET /api/admin/statistics
Returns: {
    total_users: number,
    users_by_type: [
        { user_type: "student", count: number },
        { user_type: "faculty", count: number },
        ...
    ]
}
```

### 2. Admin Dashboard Frontend

#### Files:
- `admin_dashboard/admin.html` - HTML structure
- `admin_dashboard/admin-style.css` - Styling
- `admin_dashboard/admin-dashboard.js` - JavaScript functionality

#### Features:

**Dashboard Section:**
- Quick statistics with total users, students, faculty, alumni, and admins
- Recent users list
- Visual cards with trending information

**User Management Section:**
- View all users in a sortable table
- Filter users by type (student, faculty, alumni, admin)
- Search users by name, email, or roll number
- Paginated display (10 users per page)
- Edit and delete actions for each user

**Create User Section:**
- Form to create new users
- All required fields validation
- Optional fields for additional information
- Success/error messages

**Statistics Section:**
- User distribution by type
- Total user counts

### 3. User Types

The system supports 4 user types:

1. **Student** 🎓
   - Regular student accounts
   - Associated roll numbers
   - Can participate in chats

2. **Faculty** 👨‍🏫
   - Faculty/instructor accounts
   - Can manage discussions
   - Can initiate groups

3. **Alumni** 🎖️
   - Alumni accounts
   - Same privileges as students for historical data
   - Identified separately in statistics

4. **Admin** 🔐
   - Administrative accounts
   - Full access to user management
   - Can create, modify, and delete users

## Database Schema Requirements

The system requires the following columns in the `users` table:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'faculty', 'alumni', 'admin')),
    roll_number VARCHAR(50),
    phone VARCHAR(20),
    location VARCHAR(100),
    bio TEXT,
    github VARCHAR(255),
    portfolio VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Note:** If your existing schema doesn't have all these columns, run a migration script to add them.

## Migration Script

If you need to add the new columns:

```sql
-- Add new columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS roll_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS github VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS portfolio VARCHAR(255);

-- Ensure user_type accepts all values
ALTER TABLE users ADD CONSTRAINT check_user_type CHECK (user_type IN ('student', 'faculty', 'alumni', 'admin'));
```

## Starting the Admin Server

1. **Install dependencies** (if not already done):
```bash
npm install
```

2. **Update database configuration** in `backend/admin-server.js`:
```javascript
const pool = new Pool({
    user: 'your_db_user',
    host: 'localhost',
    database: 'your_db_name',
    password: 'your_db_password',
    port: 5432,
});
```

3. **Start the admin server**:
```bash
node backend/admin-server.js
```

The server will run on `http://localhost:3002`

## Accessing the Admin Panel

1. Ensure you're logged in as an admin user
2. Navigate to `http://localhost:3000/admin_dashboard/admin.html` (or adjust port as needed)
3. The system will check for admin authorization and redirect if not authorized

## Security Features

1. **JWT Token Authentication**: All API endpoints require valid JWT token
2. **Role-Based Access Control**: Only users with 'admin' user_type can access the admin panel
3. **Password Hashing**: All passwords are hashed using bcryptjs with 10 salt rounds
4. **Email Validation**: Email uniqueness is enforced at the database level
5. **Input Validation**: All inputs are validated on the backend

## Usage Examples

### Example 1: Create a New Student
```javascript
const userData = {
    email: "student123@example.com",
    password: "SecurePass123!",
    full_name: "Alice Johnson",
    user_type: "student",
    roll_number: "21BIT045",
    phone: "9876543210",
    location: "Delhi, India"
};

fetch('http://localhost:3002/api/admin/users', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
})
.then(res => res.json())
.then(data => console.log('User created:', data));
```

### Example 2: Update User Type
```javascript
const updateData = {
    user_type: "admin"
};

fetch('http://localhost:3002/api/admin/users/5', {
    method: 'PUT',
    headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
})
.then(res => res.json())
.then(data => console.log('User updated:', data));
```

### Example 3: Delete User
```javascript
fetch('http://localhost:3002/api/admin/users/5', {
    method: 'DELETE',
    headers: {
        'Authorization': `Bearer ${adminToken}`
    }
})
.then(res => res.json())
.then(data => console.log('User deleted:', data));
```

## Features Breakdown

### Dashboard Section
- **Total Users Card**: Shows all users in the system
- **Students Card**: Count of student accounts
- **Faculty Card**: Count of faculty accounts
- **Alumni Card**: Count of alumni accounts
- **Admins Card**: Count of admin accounts
- **Recent Users**: Shows the 5 most recently created users

### User Management Table
| Column | Description |
|--------|-------------|
| ID | Unique user identifier |
| Name | Full name of user |
| Email | Email address |
| User Type | Student/Faculty/Alumni/Admin badge |
| Roll Number | Academic roll number if applicable |
| Created At | Account creation date |
| Actions | Edit and Delete buttons |

### Filtering & Search
- **Type Filter**: Dropdown to filter users by type
- **Search Box**: Search by name, email, or roll number
- **Pagination**: Navigate through user list (10 per page)

### Create User Form
Input fields for:
- Full Name (required)
- Email (required, must be unique)
- Password (required)
- User Type (required)
- Roll Number (optional)
- Phone (optional)
- Location (optional)
- Bio (optional)
- GitHub Profile (optional)
- Portfolio (optional)

### Edit Modal
- Open by clicking Edit button on any user
- Modify any user information
- Change password optionally
- Save all changes with single submit

### Delete Confirmation
- Confirmation modal before deletion
- Shows user name being deleted
- Prevents accidental deletions

## Troubleshooting

### Issue: "Admin access required" error
**Solution**: Ensure the logged-in user has `user_type = 'admin'` in the database

### Issue: Connection refused on port 3002
**Solution**: Make sure `admin-server.js` is running. Start with:
```bash
node backend/admin-server.js
```

### Issue: Token validation failed
**Solution**: Ensure the JWT token is valid and hasn't expired. Re-login to get a fresh token.

### Issue: User not found when editing
**Solution**: Refresh the user list by clicking "User Management" again or F5 to reload

## Performance Considerations

1. **Pagination**: User list is paginated to improve performance with large datasets
2. **Caching**: Recent users are cached from the last load
3. **Lazy Loading**: Statistics are loaded only when needed

## Future Enhancements

Potential improvements:
- Bulk user import (CSV)
- User role templates
- Activity logs for admin actions
- Email verification for new users
- Two-factor authentication
- Advanced filtering and sorting
- User groups and permissions
- Export user data (CSV/Excel)
- Admin audit trail

## Support

For issues or questions regarding the admin panel:
1. Check the console for error messages
2. Verify database connection
3. Ensure all required columns exist in users table
4. Check that admin-server.js is running on port 3002
5. Validate JWT token validity

## Security Notes

⚠️ **Important**: 
- Change the JWT_SECRET in production
- Never commit database credentials to version control
- Use environment variables for sensitive data
- Implement HTTPS in production
- Add rate limiting to API endpoints
- Consider adding admin action logging for compliance

---

**Version**: 1.0.0
**Last Updated**: December 2024
