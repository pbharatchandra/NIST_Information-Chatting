// Student Dashboard Script
const API_URL = 'http://localhost:3001';

// Get user data from localStorage
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

if (!user || !token) {
    window.location.href = '/login.html';
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
const userListModal = document.getElementById('userListModal');

// Initialize
window.addEventListener('load', async () => {
    userName.textContent = user.full_name;
    
    // Request notification permission
    requestNotificationPermission();
    
    await loadUsers();
    await loadConversations();
    
    socket.emit('user_joined', {
        user_id: user.id,
        full_name: user.full_name
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

        const displayName = conv.display_name || 'Group Chat';
        const lastMessage = conv.last_message ? conv.last_message.substring(0, 30) + '...' : 'No messages';

        convEl.innerHTML = `
            <h4>${displayName}</h4>
            <p>${lastMessage}</p>
        `;

        convEl.addEventListener('click', () => selectConversation(conv));
        conversationsList.appendChild(convEl);
    });
}

function updateOnlineUsers() {
    onlineUsersList.innerHTML = '';
    
    allUsers.forEach(user => {
        if (activeUsers.has(user.id)) {
            const userEl = document.createElement('div');
            userEl.className = 'online-user';
            userEl.innerHTML = `
                <span class="status-dot"></span>
                <span>${user.full_name}</span>
            `;
            userEl.addEventListener('click', () => startConversation(user));
            onlineUsersList.appendChild(userEl);
        }
    });

    if (onlineUsersList.children.length === 0) {
        onlineUsersList.innerHTML = '<p style="text-align: center; color: #999; padding: 10px; font-size: 12px;">No users online</p>';
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
}

async function startConversation(selectedUser) {
    try {
        const response = await fetch(`${API_URL}/api/chat/conversation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ user2_id: selectedUser.id })
        });

        const data = await response.json();
        const conversation = {
            id: data.conversation_id,
            display_name: selectedUser.full_name,
            other_user_id: selectedUser.id,
            last_message: '',
            conversation_type: 'direct'
        };

        selectedConversation = conversation;
        closeUserModal();
        
        if (!messages[conversation.id]) {
            await loadMessages(conversation.id);
        }

        loadConversations();
        selectConversation(conversation);
    } catch (error) {
        console.error('Failed to start conversation:', error);
        alert('Failed to start conversation');
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
    if (!selectedConversation) return;

    const convMessages = messages[selectedConversation.id] || [];
    messagesArea.innerHTML = '';

    convMessages.forEach(msg => {
        const msgEl = document.createElement('div');
        msgEl.className = 'message';
        msgEl.classList.add(msg.sender_id === user.id ? 'sent' : 'received');

        const time = new Date(msg.created_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        msgEl.innerHTML = `
            <div class="message-content">
                <strong>${msg.full_name}</strong>
                <p>${escapeHtml(msg.message_text)}</p>
                <span class="message-time">${time}</span>
            </div>
        `;

        messagesArea.appendChild(msgEl);
    });
}

function updateUserStatus() {
    if (!selectedConversation) return;

    if (selectedConversation.other_user_id && activeUsers.has(selectedConversation.other_user_id)) {
        userStatus.textContent = 'Online';
        userStatus.classList.add('online');
        userStatus.classList.remove('offline');
    } else {
        userStatus.textContent = 'Offline';
        userStatus.classList.add('offline');
        userStatus.classList.remove('online');
    }
}

function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !selectedConversation) return;

    socket.emit('send_message', {
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        message_text: text
    });

    messageInput.value = '';
    messageInput.focus();
}

function scrollToBottom() {
    setTimeout(() => {
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }, 0);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function openUserModal() {
    userModal.style.display = 'block';
    displayUserList();
    document.getElementById('userSearchInput').focus();
}

function closeUserModal() {
    userModal.style.display = 'none';
}

function filterUsers(searchTerm) {
    displayUserList(searchTerm);
}

function displayUserList(searchTerm = '') {
    userListModal.innerHTML = '';

    const filteredUsers = allUsers.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredUsers.length === 0) {
        userListModal.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No users found</p>';
        return;
    }

    filteredUsers.forEach(user => {
        const userEl = document.createElement('div');
        userEl.className = 'user-item-modal';
        const isOnline = activeUsers.has(user.id);
        userEl.innerHTML = `
            <div>
                <strong>${user.full_name}</strong>
                <p>${user.user_type}</p>
            </div>
            <span class="status-dot" style="background: ${isOnline ? '#4caf50' : '#ccc'};"></span>
        `;
        userEl.addEventListener('click', () => startConversation(user));
        userListModal.appendChild(userEl);
    });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// ==================== NOTIFICATION FUNCTIONS ====================

function showNotification(messageData) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <strong>${messageData.full_name}</strong>
            <p>${escapeHtml(messageData.message_text.substring(0, 50))}${messageData.message_text.length > 50 ? '...' : ''}</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove();">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
    
    // Also show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`New message from ${messageData.full_name}`, {
            body: messageData.message_text.substring(0, 100),
            icon: '/assets/icon.png'
        });
    }
}

function playNotificationSound() {
    // Create a simple beep sound using Web Audio API
    try {
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
    } catch (error) {
        console.log('Notification sound not available');
    }
}

function markConversationAsRead(conversationId) {
    unreadCount[conversationId] = 0;
    updateConversationsList();
}

function updateConversationsList() {
    conversationsList.innerHTML = '';
    
    allConversations.forEach(conv => {
        const convEl = document.createElement('div');
        convEl.className = 'conversation-item';
        if (selectedConversation?.id === conv.id) {
            convEl.classList.add('active');
        }
        
        const unread = unreadCount[conv.id] || 0;
        const badge = unread > 0 ? `<span class="unread-badge">${unread}</span>` : '';
        
        convEl.innerHTML = `
            <div style="flex: 1;">
                <strong>${escapeHtml(conv.display_name || conv.conversation_name)}</strong>
                <p style="font-size: 12px; color: #999; margin: 5px 0 0;">
                    ${escapeHtml(conv.last_message.substring(0, 30) || 'No messages yet')}${conv.last_message.length > 30 ? '...' : ''}
                </p>
            </div>
            ${badge}
        `;
        
        convEl.addEventListener('click', () => selectConversation(conv));
        conversationsList.appendChild(convEl);
    });
}

// Request notification permission on load
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Event listeners
document.getElementById('userSearchInput')?.addEventListener('input', (e) => {
    filterUsers(e.target.value);
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

window.addEventListener('click', (e) => {
    if (e.target === userModal) {
        closeUserModal();
    }
});
