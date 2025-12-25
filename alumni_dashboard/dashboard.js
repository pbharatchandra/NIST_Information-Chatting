// Alumni Dashboard Script
const API_URL = 'http://localhost:3001';

// Get user data from localStorage
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

if (!user || !token) {
    window.location.href = '/login.html';
}

// Check if user is alumni
if (user.user_type !== 'alumni') {
    // Redirect to appropriate dashboard
    if (user.user_type === 'student') {
        window.location.href = '/student_dashboard/dashboard.html';
    } else if (user.user_type === 'faculty') {
        window.location.href = '/faculty_dashboard/dashboard.html';
    }
}

// Initialize Socket.IO
const socket = io(API_URL, {
    auth: {
        token: token
    }
});

// State management
let selectedConversation = null;
let allUsers = [];
let allConversations = [];
let messages = {};
let activeUsers = new Set();
let unreadCount = {}; // Track unread messages per conversation

// DOM Elements
const userName = document.getElementById('userName');
const chatWindow = document.getElementById('chatWindow');
const noChatSelected = document.getElementById('noChatSelected');
const messagesArea = document.getElementById('messagesArea');
const messageInput = document.getElementById('messageInput');
const chatUserName = document.getElementById('chatUserName');
const userStatus = document.getElementById('userStatus');
const onlineUsersList = document.getElementById('onlineUsersList');
const conversationsList = document.getElementById('conversationsList');
const userModal = document.getElementById('userModal');

// Initialize
window.addEventListener('load', async () => {
    userName.textContent = user.full_name;
    
    // Request notification permission
    requestNotificationPermission();
    
    await loadUsers();
    await loadConversations();
    
    socket.emit('user_joined', {
        user_id: user.id,
        full_name: user.full_name,
        user_type: 'alumni'
    });
});

// ==================== SOCKET.IO EVENTS ====================

socket.on('user_online', (data) => {
    activeUsers.add(data.user_id);
    updateOnlineUsers();
});

socket.on('user_offline', (data) => {
    activeUsers.delete(data.user_id);
    updateOnlineUsers();
    if (selectedConversation?.other_user_id === data.user_id) {
        updateUserStatus();
    }
});

socket.on('receive_message', (data) => {
    if (!messages[data.conversation_id]) {
        messages[data.conversation_id] = [];
    }
    messages[data.conversation_id].push(data);
    
    // Update unread count if message is not from current user
    if (data.sender_id !== user.id) {
        if (!unreadCount[data.conversation_id]) {
            unreadCount[data.conversation_id] = 0;
        }
        unreadCount[data.conversation_id]++;
        
        // Show notification
        showNotification(data);
        playNotificationSound();
    }
    
    if (selectedConversation?.id === data.conversation_id) {
        displayMessages();
        scrollToBottom();
        // Mark as read
        markConversationAsRead(data.conversation_id);
    }
    loadConversations();
    updateConversationsList();
});

socket.on('user_typing', (data) => {
    if (selectedConversation?.other_user_id === data.user_id) {
        // Show typing indicator
    }
});

// ==================== FUNCTIONS ====================

async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/api/chat/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        allUsers = await response.json();
    } catch (error) {
        console.error('Failed to load users:', error);
    }
}

async function loadConversations() {
    try {
        const response = await fetch(`${API_URL}/api/chat/conversations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        allConversations = await response.json();
        displayConversations();
    } catch (error) {
        console.error('Failed to load conversations:', error);
    }
}

function displayConversations() {
    conversationsList.innerHTML = '';
    
    if (allConversations.length === 0) {
        conversationsList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No conversations yet</p>';
        return;
    }

    allConversations.forEach(conv => {
        const convEl = document.createElement('div');
        convEl.className = 'conversation-item';
        if (selectedConversation?.id === conv.id) {
            convEl.classList.add('active');
        }

        const displayName = conv.display_name || 'User';
        const lastMessage = conv.last_message ? conv.last_message.substring(0, 30) + '...' : 'No messages';
        const unread = unreadCount[conv.id] || 0;

        convEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h4>${displayName}</h4>
                    <p>${lastMessage}</p>
                </div>
                ${unread > 0 ? `<span class="unread-badge">${unread}</span>` : ''}
            </div>
        `;

        convEl.addEventListener('click', () => selectConversation(conv));
        conversationsList.appendChild(convEl);
    });
}

function updateOnlineUsers() {
    onlineUsersList.innerHTML = '';
    
    allUsers.forEach(usr => {
        if (activeUsers.has(usr.id) && usr.id !== user.id) {
            const userEl = document.createElement('div');
            userEl.className = 'online-user';
            const userRole = usr.user_type === 'alumni' ? ' (Alumni)' : 
                            usr.user_type === 'faculty' ? ' (Faculty)' : '';
            userEl.innerHTML = `
                <span class="status-dot"></span>
                <span>${usr.full_name}${userRole}</span>
            `;
            userEl.addEventListener('click', () => startConversation(usr));
            onlineUsersList.appendChild(userEl);
        }
    });

    if (onlineUsersList.children.length === 0) {
        onlineUsersList.innerHTML = '<p style="text-align: center; color: #999; padding: 10px; font-size: 12px;">No other users online</p>';
    }
}

async function selectConversation(conversation) {
    selectedConversation = conversation;
    
    if (!messages[conversation.id]) {
        await loadMessages(conversation.id);
    }

    displayConversations();
    displayMessages();
    updateUserStatus();
    
    chatWindow.style.display = 'flex';
    noChatSelected.style.display = 'none';

    socket.emit('join_conversation', { conversation_id: conversation.id });
    messageInput.focus();
    scrollToBottom();
    
    // Mark as read
    markConversationAsRead(conversation.id);
}

async function startConversation(selectedUser) {
    try {
        const response = await fetch(`${API_URL}/api/chat/conversation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                other_user_id: selectedUser.id
            })
        });

        const conversation = await response.json();
        await selectConversation(conversation);
        closeUserModal();
    } catch (error) {
        console.error('Failed to start conversation:', error);
        showToast('Failed to start conversation', 'error');
    }
}

async function loadMessages(conversationId) {
    try {
        const response = await fetch(`${API_URL}/api/chat/messages/${conversationId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        messages[conversationId] = await response.json();
    } catch (error) {
        console.error('Failed to load messages:', error);
    }
}

function displayMessages() {
    messagesArea.innerHTML = '';
    
    if (!selectedConversation || !messages[selectedConversation.id]) {
        return;
    }

    messages[selectedConversation.id].forEach(msg => {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${msg.sender_id === user.id ? 'sent' : 'received'}`;
        
        const timestamp = new Date(msg.created_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageEl.innerHTML = `
            <div class="message-content">
                <p>${msg.content}</p>
                <small>${timestamp}</small>
            </div>
        `;
        
        messagesArea.appendChild(messageEl);
    });
}

function updateUserStatus() {
    if (!selectedConversation) return;
    
    const isOnline = activeUsers.has(selectedConversation.other_user_id);
    userStatus.textContent = isOnline ? '● Online' : '● Offline';
    userStatus.style.color = isOnline ? '#25D366' : '#999';
}

async function sendMessage() {
    const content = messageInput.value.trim();
    
    if (!content || !selectedConversation) return;

    try {
        const response = await fetch(`${API_URL}/api/chat/send-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                conversation_id: selectedConversation.id,
                content: content
            })
        });

        if (response.ok) {
            messageInput.value = '';
            const message = await response.json();
            
            if (!messages[selectedConversation.id]) {
                messages[selectedConversation.id] = [];
            }
            messages[selectedConversation.id].push(message);
            
            displayMessages();
            scrollToBottom();
            
            socket.emit('send_message', {
                conversation_id: selectedConversation.id,
                ...message
            });
        }
    } catch (error) {
        console.error('Failed to send message:', error);
        showToast('Failed to send message', 'error');
    }
}

function markConversationAsRead(conversationId) {
    delete unreadCount[conversationId];
    updateConversationsList();
}

function scrollToBottom() {
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

// ==================== MODAL FUNCTIONS ====================

function openUserModal() {
    userModal.style.display = 'block';
    const searchInput = document.getElementById('userSearchInput');
    const results = document.getElementById('userSearchResults');
    
    results.innerHTML = '';
    allUsers.forEach(usr => {
        if (usr.id !== user.id) {
            const userEl = document.createElement('div');
            userEl.className = 'user-search-result';
            const userRole = usr.user_type === 'alumni' ? ' (Alumni)' : 
                            usr.user_type === 'faculty' ? ' (Faculty)' : '';
            userEl.innerHTML = `
                <div>
                    <h4>${usr.full_name}${userRole}</h4>
                    <p>${usr.email}</p>
                </div>
                <button onclick="startConversationWithUser(${usr.id})">Chat</button>
            `;
            results.appendChild(userEl);
        }
    });
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filteredUsers = allUsers.filter(usr => 
            usr.id !== user.id && 
            (usr.full_name.toLowerCase().includes(query) || 
             usr.email.toLowerCase().includes(query))
        );
        
        results.innerHTML = '';
        filteredUsers.forEach(usr => {
            const userEl = document.createElement('div');
            userEl.className = 'user-search-result';
            const userRole = usr.user_type === 'alumni' ? ' (Alumni)' : 
                            usr.user_type === 'faculty' ? ' (Faculty)' : '';
            userEl.innerHTML = `
                <div>
                    <h4>${usr.full_name}${userRole}</h4>
                    <p>${usr.email}</p>
                </div>
                <button onclick="startConversationWithUser(${usr.id})">Chat</button>
            `;
            results.appendChild(userEl);
        });
    });
}

function closeUserModal() {
    userModal.style.display = 'none';
}

async function startConversationWithUser(userId) {
    const selectedUser = allUsers.find(u => u.id === userId);
    if (selectedUser) {
        await startConversation(selectedUser);
    }
}

// ==================== UTILITY FUNCTIONS ====================

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const senderName = allUsers.find(u => u.id === message.sender_id)?.full_name || 'Someone';
        new Notification(`${senderName} sent a message`, {
            body: message.content,
            icon: '💬'
        });
    }
}

function playNotificationSound() {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function updateConversationsList() {
    displayConversations();
}

// Handle page unload
window.addEventListener('beforeunload', () => {
    socket.emit('user_left', { user_id: user.id });
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    socket.emit('user_left', { user_id: user.id });
    window.location.href = '/login.html';
}

function goToDashboard() {
    window.location.href = '/alumni_dashboard/dashboard.html';
}

// Allow sending messages on Enter key
messageInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
