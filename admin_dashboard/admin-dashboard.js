// Admin Dashboard JavaScript

const API_URL = 'http://localhost:3002/api/admin';
let token = localStorage.getItem('token') || localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('user') || '{}');
let allUsers = [];
let filteredUsers = [];
let currentPage = 1;
const itemsPerPage = 10;
let editingUserId = null;
let deletingUserId = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (!token || currentUser.user_type !== 'admin') {
        window.location.href = '/admin_login.html';
        return;
    }

    displayUserInfo();
    setupEventListeners();
    loadDashboard();
});

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);

            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Sidebar toggle
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.admin-sidebar');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Create User Form
    document.getElementById('createUserForm').addEventListener('submit', createUser);

    // Edit Modal
    const editModal = document.getElementById('editModal');
    const closeEditBtns = editModal.querySelectorAll('.close-btn');
    closeEditBtns.forEach(btn => {
        btn.addEventListener('click', closeEditModal);
    });

    // Delete Modal
    const deleteModal = document.getElementById('deleteModal');
    const closeDeleteBtns = deleteModal.querySelectorAll('.close-btn');
    closeDeleteBtns.forEach(btn => {
        btn.addEventListener('click', closeDeleteModal);
    });

    document.getElementById('editUserForm').addEventListener('submit', saveUserChanges);
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);

    // Type Filter
    document.getElementById('typeFilter').addEventListener('change', filterUsers);

    // Search
    document.getElementById('searchBtn').addEventListener('click', searchUsers);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchUsers();
    });

    // Pagination
    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayUsers();
        }
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (currentPage * itemsPerPage < filteredUsers.length) {
            currentPage++;
            displayUsers();
        }
    });

    // Close modal on outside click
    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeEditModal();
    });

    document.getElementById('deleteModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeDeleteModal();
    });
}

// Display user info in header
function displayUserInfo() {
    const userInfo = document.getElementById('userInfo');
    userInfo.textContent = `👤 ${currentUser.full_name} (Admin)`;
}

// Switch between sections
function switchSection(section) {
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    const targetSection = document.getElementById(`${section}-section`);
    if (targetSection) {
        targetSection.classList.add('active');

        if (section === 'users') {
            loadUsers();
        } else if (section === 'statistics') {
            loadStatistics();
        } else if (section === 'dashboard') {
            loadDashboard();
        }
    }
}

// Load Dashboard
async function loadDashboard() {
    try {
        await loadStatistics();
        await loadRecentUsers();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load Statistics
async function loadStatistics() {
    try {
        const response = await fetch(`${API_URL}/statistics`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load statistics');

        const data = await response.json();

        // Update stat cards
        document.getElementById('totalUsersCount').textContent = data.total_users;

        // Reset counts
        document.getElementById('studentCount').textContent = '0';
        document.getElementById('facultyCount').textContent = '0';
        document.getElementById('alumniCount').textContent = '0';
        document.getElementById('adminCount').textContent = '0';

        // Update from user types
        data.users_by_type.forEach(type => {
            const element = document.getElementById(`${type.user_type}Count`);
            if (element) element.textContent = type.count;
        });
    } catch (error) {
        console.error('Error loading statistics:', error);
        showMessage('Error loading statistics', 'error');
    }
}

// Load Recent Users
async function loadRecentUsers() {
    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load users');

        const users = await response.json();
        const recentList = document.getElementById('recentUsersList');
        recentList.innerHTML = '';

        users.slice(0, 5).forEach(user => {
            const item = document.createElement('div');
            item.className = 'user-preview-item';
            item.innerHTML = `
                <div>
                    <div class="user-preview-name">${user.full_name}</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">${user.email}</div>
                </div>
                <span class="user-preview-type type-${user.user_type}">${user.user_type}</span>
            `;
            recentList.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading recent users:', error);
    }
}

// Load All Users
async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load users');

        allUsers = await response.json();
        filteredUsers = [...allUsers];
        currentPage = 1;
        displayUsers();
    } catch (error) {
        console.error('Error loading users:', error);
        showMessage('Error loading users', 'error');
    }
}

// Display users in table
function displayUsers() {
    const tbody = document.getElementById('usersTableBody');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageUsers = filteredUsers.slice(startIndex, endIndex);

    tbody.innerHTML = '';

    if (pageUsers.length === 0) {
        tbody.innerHTML = '<tr class="loading"><td colspan="7">No users found</td></tr>';
        return;
    }

    pageUsers.forEach(user => {
        const row = document.createElement('tr');
        const createdAt = new Date(user.created_at).toLocaleDateString();

        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.full_name}</td>
            <td>${user.email}</td>
            <td><span class="type-badge ${user.user_type}">${user.user_type}</span></td>
            <td>${user.roll_number || '-'}</td>
            <td>${createdAt}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-edit" onclick="openEditModal(${user.id})">✏️ Edit</button>
                    <button class="action-btn btn-delete" onclick="openDeleteModal(${user.id}, '${user.full_name}')">🗑️ Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Update pagination
    const maxPages = Math.ceil(filteredUsers.length / itemsPerPage);
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${maxPages}`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === maxPages;
}

// Filter users by type
function filterUsers() {
    const filterValue = document.getElementById('typeFilter').value;
    currentPage = 1;

    if (filterValue === '') {
        filteredUsers = [...allUsers];
    } else {
        filteredUsers = allUsers.filter(user => user.user_type === filterValue);
    }

    displayUsers();
}

// Search users
function searchUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    currentPage = 1;

    if (searchTerm === '') {
        filteredUsers = [...allUsers];
    } else {
        filteredUsers = allUsers.filter(user =>
            user.full_name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            (user.roll_number && user.roll_number.toLowerCase().includes(searchTerm))
        );
    }

    displayUsers();
}

// Create new user
async function createUser(e) {
    e.preventDefault();

    const userData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        full_name: document.getElementById('fullName').value,
        user_type: document.getElementById('userType').value,
        roll_number: document.getElementById('rollNumber').value || null,
        phone: document.getElementById('phone').value || null,
        location: document.getElementById('location').value || null,
        bio: document.getElementById('bio').value || null,
        github: document.getElementById('github').value || null,
        portfolio: document.getElementById('portfolio').value || null
    };

    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.error || 'Failed to create user', 'error');
            return;
        }

        showMessage('User created successfully!', 'success');
        document.getElementById('createUserForm').reset();

        // Reload users list
        await loadUsers();
        await loadDashboard();
    } catch (error) {
        console.error('Error creating user:', error);
        showMessage('Error creating user', 'error');
    }
}

// Open edit modal
async function openEditModal(userId) {
    editingUserId = userId;

    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load user');

        const user = await response.json();

        document.getElementById('editUserId').value = user.id;
        document.getElementById('editFullName').value = user.full_name;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editUserType').value = user.user_type;
        document.getElementById('editRollNumber').value = user.roll_number || '';
        document.getElementById('editPhone').value = user.phone || '';
        document.getElementById('editLocation').value = user.location || '';
        document.getElementById('editBio').value = user.bio || '';
        document.getElementById('editGithub').value = user.github || '';
        document.getElementById('editPortfolio').value = user.portfolio || '';
        document.getElementById('editPassword').value = '';

        document.getElementById('editModal').classList.add('active');
    } catch (error) {
        console.error('Error loading user:', error);
        showMessage('Error loading user details', 'error');
    }
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    editingUserId = null;
}

// Save user changes
async function saveUserChanges(e) {
    e.preventDefault();

    const userId = document.getElementById('editUserId').value;
    const userData = {
        email: document.getElementById('editEmail').value,
        full_name: document.getElementById('editFullName').value,
        user_type: document.getElementById('editUserType').value,
        roll_number: document.getElementById('editRollNumber').value || null,
        phone: document.getElementById('editPhone').value || null,
        location: document.getElementById('editLocation').value || null,
        bio: document.getElementById('editBio').value || null,
        github: document.getElementById('editGithub').value || null,
        portfolio: document.getElementById('editPortfolio').value || null
    };

    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.error || 'Failed to update user', 'error');
            return;
        }

        // Handle password change separately if provided
        const newPassword = document.getElementById('editPassword').value;
        if (newPassword) {
            await fetch(`${API_URL}/users/${userId}/change-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ new_password: newPassword })
            });
        }

        showMessage('User updated successfully!', 'success');
        closeEditModal();

        // Reload users list
        await loadUsers();
        await loadDashboard();
    } catch (error) {
        console.error('Error updating user:', error);
        showMessage('Error updating user', 'error');
    }
}

// Open delete modal
function openDeleteModal(userId, userName) {
    deletingUserId = userId;
    document.getElementById('deleteUserName').textContent = userName;
    document.getElementById('deleteModal').classList.add('active');
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    deletingUserId = null;
}

// Confirm delete
async function confirmDelete() {
    if (!deletingUserId) return;

    try {
        const response = await fetch(`${API_URL}/users/${deletingUserId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to delete user');

        showMessage('User deleted successfully!', 'success');
        closeDeleteModal();

        // Reload users list
        await loadUsers();
        await loadDashboard();
    } catch (error) {
        console.error('Error deleting user:', error);
        showMessage('Error deleting user', 'error');
    }
}

// Show message
function showMessage(message, type) {
    const messageBox = document.getElementById('createMessage');
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;

    setTimeout(() => {
        messageBox.classList.remove('success', 'error');
    }, 5000);
}

// Logout
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/frontend/login.html';
}
