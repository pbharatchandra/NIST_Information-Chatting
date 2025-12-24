// Faculty Chat JavaScript
const CHAT_SERVER = 'http://localhost:3001';

// Get user ID from session/localStorage (you should implement proper auth)
let currentUserId = localStorage.getItem('user_id');
let currentFullName = localStorage.getItem('user_name') || 'Faculty';
let currentUserType = localStorage.getItem('user_type') || 'faculty';

if (!currentUserId) {
    // For demo purposes - in production, get from authentication
    currentUserId = prompt('Enter your User ID:') || '1';
    currentFullName = prompt('Enter your Full Name:') || 'Faculty ' + currentUserId;
    localStorage.setItem('user_id', currentUserId);
    localStorage.setItem('user_name', currentFullName);
}

// Initialize Socket.IO
const socket = io(CHAT_SERVER);

// State management
let selectedConversation = null;
let allUsers = [];
let allConversations = [];
let messages = {};
let typingUsers = new Set();
let activeUsers = new Set();

// DOM Elements
const chatWindow = document.getElementById('chatWindow');
const noChatSelected = document.getElementById('noChatSelected');
const messagesArea = document.getElementById('messagesArea');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatUserName = document.getElementById('chatUserName');
const userStatus = document.getElementById('userStatus');
const onlineUsersList = document.getElementById('onlineUsersList');
const conversationsList = document.getElementById('conversationsList');
const typingIndicator = document.getElementById('typingIndicator');
const typingUserName = document.getElementById('typingUserName');
const newChatBtn = document.getElementById('newChatBtn');
const userModal = document.getElementById('userModal');
const userSearchInput = document.getElementById('userSearchInput');
const userListModal = document.getElementById('userListModal');
const closeModal = document.querySelector('.close');

let typingTimeout;

// ==================== SOCKET.IO EVENTS ====================

socket.on('connect', () => {
    console.log('Connected to chat server');
    socket.emit('user_joined', {
        user_id: parseInt(currentUserId),
        full_name: currentFullName
    });
});

socket.on('user_online', (data) => {
    activeUsers.add(data.user_id);
    loadConversations();
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
    
    if (selectedConversation?.id === data.conversation_id) {
        displayMessages();
        scrollToBottom();
    }
    loadConversations(); // Update conversations list
});

socket.on('user_typing', (data) => {
    if (selectedConversation?.other_user_id === data.user_id) {
        typingUsers.add(data.user_id);
        typingUserName.textContent = data.full_name;
        typingIndicator.style.display = 'block';
    }
});

socket.on('user_stopped_typing', (data) => {
    typingUsers.delete(data.user_id);
    if (typingUsers.size === 0) {
        typingIndicator.style.display = 'none';
    }
});

socket.on('error', (data) => {
    alert('Error: ' + data.message);
});

// ==================== FUNCTIONS ====================

async function loadUsers() {
    try {
        const response = await fetch(`${CHAT_SERVER}/api/chat/users/${currentUserId}`);
        allUsers = await response.json();
    } catch (error) {
        console.error('Failed to load users:', error);
    }
}

async function loadConversations() {
    try {
        const response = await fetch(`${CHAT_SERVER}/api/chat/conversations/${currentUserId}`);
        allConversations = await response.json();
        displayConversations();
    } catch (error) {
        console.error('Failed to load conversations:', error);
    }
}

function displayConversations() {
    conversationsList.innerHTML = '';
    
    if (allConversations.length === 0) {
        conversationsList.innerHTML = '<p class="no-conversations">No conversations yet</p>';
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
            <div class="conv-header">
                <h4>${displayName}</h4>
                ${conv.other_user_id && activeUsers.has(conv.other_user_id) ? '<span class="status-dot online"></span>' : '<span class="status-dot offline"></span>'}
            </div>
            <p class="last-message">${lastMessage}</p>
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
                <span class="status-dot online"></span>
                <span>${user.full_name}</span>
            `;
            userEl.addEventListener('click', () => startConversation(user));
            onlineUsersList.appendChild(userEl);
        }
    });

    if (onlineUsersList.children.length === 0) {
        onlineUsersList.innerHTML = '<p class="no-users">No users online</p>';
    }
}

async function selectConversation(conversation) {
    selectedConversation = conversation;
    
    // Load messages
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

async function startConversation(user) {
    try {
        const response = await fetch(`${CHAT_SERVER}/api/chat/conversation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user1_id: parseInt(currentUserId),
                user2_id: user.id
            })
        });

        const data = await response.json();
        const conversation = {
            id: data.conversation_id,
            display_name: user.full_name,
            other_user_id: user.id,
            last_message: '',
            conversation_type: 'direct'
        };

        selectedConversation = conversation;
        userModal.style.display = 'none';
        
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
        const response = await fetch(`${CHAT_SERVER}/api/chat/messages/${conversationId}`);
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
        msgEl.classList.add(msg.sender_id === parseInt(currentUserId) ? 'sent' : 'received');

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
        sender_id: parseInt(currentUserId),
        message_text: text
    });

    messageInput.value = '';
    socket.emit('user_stopped_typing', {
        conversation_id: selectedConversation.id,
        user_id: parseInt(currentUserId)
    });
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

// ==================== EVENT LISTENERS ====================

sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

messageInput.addEventListener('input', () => {
    if (selectedConversation) {
        socket.emit('user_typing', {
            conversation_id: selectedConversation.id,
            user_id: parseInt(currentUserId),
            full_name: currentFullName
        });

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit('user_stopped_typing', {
                conversation_id: selectedConversation.id,
                user_id: parseInt(currentUserId)
            });
        }, 2000);
    }
});

newChatBtn.addEventListener('click', () => {
    userModal.style.display = 'block';
    userSearchInput.focus();
});

closeModal.addEventListener('click', () => {
    userModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === userModal) {
        userModal.style.display = 'none';
    }
});

userSearchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    displayUserList(searchTerm);
});

function displayUserList(searchTerm = '') {
    userListModal.innerHTML = '';

    const filteredUsers = allUsers.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm)
    );

    if (filteredUsers.length === 0) {
        userListModal.innerHTML = '<p>No users found</p>';
        return;
    }

    filteredUsers.forEach(user => {
        const userEl = document.createElement('div');
        userEl.className = 'user-item-modal';
        userEl.innerHTML = `
            <div>
                <strong>${user.full_name}</strong>
                <p>${user.user_type}</p>
            </div>
            ${activeUsers.has(user.id) ? '<span class="status-dot online"></span>' : '<span class="status-dot offline"></span>'}
        `;
        userEl.addEventListener('click', () => startConversation(user));
        userListModal.appendChild(userEl);
    });
}

// Initialize
window.addEventListener('load', async () => {
    await loadUsers();
    await loadConversations();
    displayUserList();
});
