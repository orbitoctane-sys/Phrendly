// Initialize chat system
document.addEventListener('DOMContentLoaded', function() {
    initChatSystem();
});

// Initialize the chat system
function initChatSystem() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = '../../login.html';
        return;
    }

    loadChatData();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const sendBtn = document.getElementById('sendBtn');
    const messageInput = document.getElementById('messageInput');
    const closeChat = document.getElementById('closeChat');

    searchBtn.addEventListener('click', searchUsers);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchUsers();
    });

    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    closeChat.addEventListener('click', closeCurrentChat);
}

// Load all chat data
function loadChatData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Initialize user if needed
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    
    if (userIndex !== -1) {
        const userData = users[userIndex];
        
        // Initialize friend system if not exists
        if (!userData.friends) userData.friends = [];
        if (!userData.friendRequests) userData.friendRequests = [];
        if (!userData.chats) userData.chats = {};
        if (!userData.sentRequests) userData.sentRequests = [];
        
        users[userIndex] = userData;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(userData));
    }

    loadFriendRequests();
    loadFriendsAndChats();
}

// Search for users
function searchUsers() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim().toLowerCase();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (!query) {
        document.getElementById('searchResults').classList.add('hidden');
        return;
    }

    // Filter users
    const results = users.filter(user => 
        user.email !== currentUser.email && (
            user.username.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        )
    );

    displaySearchResults(results);
}

// Display search results
function displaySearchResults(results) {
    const resultsList = document.getElementById('resultsList');
    const searchResults = document.getElementById('searchResults');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (results.length === 0) {
        resultsList.innerHTML = '<p class="empty-message">No users found</p>';
        searchResults.classList.remove('hidden');
        return;
    }

    let html = '';
    results.forEach(user => {
        const isFriend = currentUser.friends && currentUser.friends.includes(user.email);
        const hasRequest = currentUser.sentRequests && currentUser.sentRequests.includes(user.email);
        const hasIncomingRequest = currentUser.friendRequests && 
                                   currentUser.friendRequests.some(req => req.from === user.email);

        let buttonHtml = '';
        if (isFriend) {
            buttonHtml = '<button class="action-btn friend-btn disabled" disabled>Friends</button>';
        } else if (hasRequest) {
            buttonHtml = '<button class="action-btn pending-btn" disabled>Request Pending</button>';
        } else if (hasIncomingRequest) {
            buttonHtml = '<button class="action-btn accept-btn" onclick="acceptFriendRequest(\'' + user.email + '\')">Accept Request</button>';
        } else {
            buttonHtml = '<button class="action-btn send-btn" onclick="sendFriendRequest(\'' + user.email + '\', \'' + user.username + '\')">Add Friend</button>';
        }

        html += `
            <div class="search-result-item">
                <div class="user-info">
                    <p class="username">${user.username}</p>
                    <p class="email">${user.email}</p>
                </div>
                ${buttonHtml}
            </div>
        `;
    });

    resultsList.innerHTML = html;
    searchResults.classList.remove('hidden');
}

// Send friend request
function sendFriendRequest(toEmail, toUsername) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Add to sent requests
    if (!currentUser.sentRequests) currentUser.sentRequests = [];
    if (!currentUser.sentRequests.includes(toEmail)) {
        currentUser.sentRequests.push(toEmail);
    }

    // Add to recipient's incoming requests
    const recipientIndex = users.findIndex(u => u.email === toEmail);
    if (recipientIndex !== -1) {
        const recipient = users[recipientIndex];
        if (!recipient.friendRequests) recipient.friendRequests = [];
        
        if (!recipient.friendRequests.some(req => req.from === currentUser.email)) {
            recipient.friendRequests.push({
                from: currentUser.email,
                username: currentUser.username,
                timestamp: new Date().toLocaleString()
            });
        }
        
        users[recipientIndex] = recipient;
    }

    // Update localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('users', JSON.stringify(users));

    // Refresh search results
    searchUsers();
}

// Load friend requests
function loadFriendRequests() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const requestsList = document.getElementById('requestsList');
    const requestCount = document.getElementById('requestCount');

    if (!currentUser.friendRequests || currentUser.friendRequests.length === 0) {
        requestsList.innerHTML = '<p class="empty-message">No pending requests</p>';
        requestCount.textContent = '0';
        return;
    }

    let html = '';
    currentUser.friendRequests.forEach(request => {
        html += `
            <div class="request-item">
                <div class="request-info">
                    <p class="username">${request.username}</p>
                    <p class="email">${request.from}</p>
                </div>
                <div class="request-actions">
                    <button class="btn-accept" onclick="acceptFriendRequest('${request.from}')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-reject" onclick="rejectFriendRequest('${request.from}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    });

    requestsList.innerHTML = html;
    requestCount.textContent = currentUser.friendRequests.length;
}

// Accept friend request
function acceptFriendRequest(fromEmail) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Add to current user's friends
    if (!currentUser.friends) currentUser.friends = [];
    if (!currentUser.friends.includes(fromEmail)) {
        currentUser.friends.push(fromEmail);
    }

    // Remove from friend requests
    currentUser.friendRequests = currentUser.friendRequests.filter(req => req.from !== fromEmail);

    // Add current user to friend's friends list
    const friendIndex = users.findIndex(u => u.email === fromEmail);
    if (friendIndex !== -1) {
        const friend = users[friendIndex];
        if (!friend.friends) friend.friends = [];
        if (!friend.friends.includes(currentUser.email)) {
            friend.friends.push(currentUser.email);
        }
        
        // Remove from their sent requests
        if (friend.sentRequests) {
            friend.sentRequests = friend.sentRequests.filter(email => email !== currentUser.email);
        }
        
        users[friendIndex] = friend;
    }

    // Initialize chats if not exist
    if (!currentUser.chats) currentUser.chats = {};
    if (!currentUser.chats[fromEmail]) currentUser.chats[fromEmail] = [];

    // Update localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('users', JSON.stringify(users));

    loadChatData();
}

// Reject friend request
function rejectFriendRequest(fromEmail) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Remove from friend requests
    currentUser.friendRequests = currentUser.friendRequests.filter(req => req.from !== fromEmail);
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    loadFriendRequests();
}

// Load friends and chats
function loadFriendsAndChats() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const friendsList = document.getElementById('friendsList');
    const friendCount = document.getElementById('friendCount');

    if (!currentUser.friends || currentUser.friends.length === 0) {
        friendsList.innerHTML = '<p class="empty-message">No friends yet</p>';
        friendCount.textContent = '0';
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    let html = '';

    currentUser.friends.forEach(friendEmail => {
        const friend = users.find(u => u.email === friendEmail);
        if (friend) {
            const unreadCount = getUnreadCount(friendEmail);
            const unreadBadge = unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : '';
            
            html += `
                <div class="friend-item" onclick="openChat('${friendEmail}', '${friend.username}')">
                    <div class="friend-info">
                        <p class="username">${friend.username}</p>
                        <p class="email">${friendEmail}</p>
                    </div>
                    ${unreadBadge}
                </div>
            `;
        }
    });

    friendsList.innerHTML = html;
    friendCount.textContent = currentUser.friends.length;
}

// Get unread count
function getUnreadCount(friendEmail) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser.chats || !currentUser.chats[friendEmail]) return 0;
    
    return currentUser.chats[friendEmail].filter(msg => !msg.read && msg.to === currentUser.email).length;
}

// Open chat with friend
function openChat(friendEmail, friendUsername) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    localStorage.setItem('currentChat', JSON.stringify({
        email: friendEmail,
        username: friendUsername
    }));

    document.getElementById('noChatSelected').classList.add('hidden');
    document.getElementById('chatArea').classList.remove('hidden');
    document.getElementById('chatName').textContent = friendUsername;
    
    loadMessages(friendEmail);
    markMessagesAsRead(friendEmail);
}

// Load messages for current chat
function loadMessages(friendEmail) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const container = document.getElementById('messagesContainer');

    if (!currentUser.chats || !currentUser.chats[friendEmail]) {
        container.innerHTML = '<p class="no-messages">No messages yet. Start the conversation!</p>';
        return;
    }

    const messages = currentUser.chats[friendEmail];
    let html = '';

    messages.forEach(msg => {
        const isOwn = msg.from === currentUser.email;
        const className = isOwn ? 'own-message' : 'other-message';
        const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        html += `
            <div class="message ${className}">
                <div class="message-content">
                    <p class="message-text">${escapeHtml(msg.text)}</p>
                    <p class="message-time">${time}</p>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
}

// Mark messages as read
function markMessagesAsRead(friendEmail) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser.chats && currentUser.chats[friendEmail]) {
        currentUser.chats[friendEmail].forEach(msg => {
            if (msg.to === currentUser.email) msg.read = true;
        });
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    loadFriendsAndChats();
}

// Send message
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const text = messageInput.value.trim();

    if (!text) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentChat = JSON.parse(localStorage.getItem('currentChat'));

    if (!currentChat) return;

    // Create message object
    const message = {
        from: currentUser.email,
        to: currentChat.email,
        text: text,
        timestamp: new Date().toISOString(),
        read: false
    };

    // Add to current user's chat
    if (!currentUser.chats) currentUser.chats = {};
    if (!currentUser.chats[currentChat.email]) currentUser.chats[currentChat.email] = [];
    currentUser.chats[currentChat.email].push(message);

    // Add to friend's chat
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const friendIndex = users.findIndex(u => u.email === currentChat.email);
    
    if (friendIndex !== -1) {
        const friend = users[friendIndex];
        if (!friend.chats) friend.chats = {};
        if (!friend.chats[currentUser.email]) friend.chats[currentUser.email] = [];
        friend.chats[currentUser.email].push(message);
        
        users[friendIndex] = friend;
        localStorage.setItem('users', JSON.stringify(users));
    }

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    messageInput.value = '';
    loadMessages(currentChat.email);
    loadFriendsAndChats();
}

// Close current chat
function closeCurrentChat() {
    document.getElementById('noChatSelected').classList.remove('hidden');
    document.getElementById('chatArea').classList.add('hidden');
    document.getElementById('messagesContainer').innerHTML = '';
    localStorage.removeItem('currentChat');
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
