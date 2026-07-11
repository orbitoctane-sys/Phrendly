// Initialize test user if none exists
function initializeTestUser() {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        // Create test user with admin privileges
        const testUser = {
            username: "TestUser",
            email: "test@phrendly.com",
            password: "Test123456",
            balance: 5000,
            referrals: [
                {
                    username: "User1",
                    email: "user1@test.com",
                    date: new Date().toLocaleDateString(),
                    commission: 100
                },
                {
                    username: "User2",
                    email: "user2@test.com",
                    date: new Date().toLocaleDateString(),
                    commission: 100
                }
            ],
            totalEarnings: 2500,
            totalWithdraws: 1500,
            registeredAt: new Date().toLocaleString(),
            referralCode: "TEST1234",
            friends: [],
            friendRequests: [],
            sentRequests: [],
            chats: {},
            isAdmin: true  // Admin flag
        };

        // Save test user to currentUser
        localStorage.setItem('currentUser', JSON.stringify(testUser));

        // Also add to users array
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userExists = users.some(u => u.email === testUser.email);
        
        if (!userExists) {
            users.push(testUser);
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
}

// Load stats on page load
function loadDashboardStats() {
    initializeTestUser();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = '/login.html';
        return;
    }

    // Check if user is admin and show/hide admin panel menu item
    const adminMenuItem = document.querySelector('.menu li:last-child');
    if (adminMenuItem && adminMenuItem.querySelector('span').textContent === 'Admin Panel') {
        if (!currentUser.isAdmin) {
            adminMenuItem.style.display = 'none';
        }
    }

    // Get user data
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userData = users.find(u => u.email === currentUser.email);

    // Initialize values
    const balance = userData.balance || 0;
    const referrals = userData.referrals ? userData.referrals.length : 0;
    const totalWithdraws = userData.totalWithdraws || 0;
    const totalEarnings = userData.totalEarnings || 0;

    // Store values for later use
    window.dashboardData = {
        balance: balance,
        referrals: referrals,
        totalWithdraws: totalWithdraws,
        totalEarnings: totalEarnings
    };
}

// Load Home content with dashboard
function loadHomeContent() {
    const content = document.getElementById("content");
    
    const balance = window.dashboardData.balance || 0;
    const referrals = window.dashboardData.referrals || 0;
    const totalWithdraws = window.dashboardData.totalWithdraws || 0;
    const totalEarnings = window.dashboardData.totalEarnings || 0;

    content.innerHTML = `
        <div class="dashboard-stats">
            <h2>Dashboard</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-info">
                        <h3>Balance</h3>
                        <p class="stat-value">KES ${balance.toFixed(2)}</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-info">
                        <h3>Total Referrals</h3>
                        <p class="stat-value">${referrals} Users</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">🏦</div>
                    <div class="stat-info">
                        <h3>Total Withdraws</h3>
                        <p class="stat-value">KES ${totalWithdraws.toFixed(2)}</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-info">
                        <h3>Total Earnings</h3>
                        <p class="stat-value">KES ${totalEarnings.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Load stats on page load
loadDashboardStats();

// Load home content by default
loadHomeContent();

const content = document.getElementById("content");

document.querySelectorAll(".menu li").forEach(item => {

    item.addEventListener("click", () => {

        document.querySelectorAll(".menu li")
        .forEach(li => li.classList.remove("active"));

        item.classList.add("active");

        const text = item.querySelector("span").textContent;

        switch(text){

            case "Home":
                loadHomeContent();
                break;

            case "Chat With Lonely People":
                loadChatSystem();
                break;

            case "Lucky Spin":
                content.innerHTML = `
                    <div style="padding: 20px 0;">
                        <iframe id="luckySpinFrame" src="pages/luckyspin.html" style="width: 100%; border: none; display: block; margin: 0 auto; background: transparent; min-height: 600px;" frameborder="0" scrolling="no"></iframe>
                    </div>
                `;
                // Auto-resize iframe after it loads
                setTimeout(() => {
                    const frame = document.getElementById('luckySpinFrame');
                    if (frame) {
                        frame.onload = function() {
                            try {
                                frame.style.height = (frame.contentDocument.body.scrollHeight + 20) + 'px';
                            } catch(e) {
                                console.log('Could not resize iframe');
                            }
                        };
                    }
                }, 100);
                break;

            case "Affiliate":
                loadAffiliateContent();
                break;

            case "footograpfy":
                content.innerHTML = `
                    <div class="affiliate-main">
                        <div class="affiliate-header">
                            <h1>📸 Photography</h1>
                            <p>Upload and view photos</p>
                        </div>
                        <div class="affiliate-content">
                            <div class="referral-box">
                                <h2>Upload Photos</h2>
                                <p>Upload your best photos to share with the community.</p>
                            </div>
                        </div>
                    </div>
                `;
                break;

            case "Withdraw":
                content.innerHTML = `
                    <div class="affiliate-main">
                        <div class="affiliate-header">
                            <h1>💸 Withdraw Earnings</h1>
                            <p>Withdraw your balance</p>
                        </div>
                        <div class="affiliate-content">
                            <div class="referral-box">
                                <h2>Available Balance</h2>
                                <p style="font-size: 24px; color: #7c3aed; font-weight: bold;">KES ${window.dashboardData.balance.toFixed(2)}</p>
                                <button class="copy-btn" style="padding: 10px 20px; margin-top: 15px;">Withdraw Now</button>
                            </div>
                        </div>
                    </div>
                `;
                break;

            case "watch videos":
                content.innerHTML = `
                    <div class="affiliate-main">
                        <div class="affiliate-header">
                            <h1>📺 Watch Videos</h1>
                            <p>Deposit money to your account</p>
                        </div>
                        <div class="affiliate-content">
                            <div class="referral-box">
                                <h2>Choose Amount</h2>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                                    <button class="copy-btn">100 KES</button>
                                    <button class="copy-btn">500 KES</button>
                                    <button class="copy-btn">1000 KES</button>
                                    <button class="copy-btn">5000 KES</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                break;

            case "Shop":
                content.innerHTML = `
                    <div class="affiliate-main">
                        <div class="affiliate-header">
                            <h1>🛍️ Shop</h1>
                            <p>Browse and buy products</p>
                        </div>
                        <div class="affiliate-content">
                            <div class="referral-box">
                                <h2>Featured Products</h2>
                                <p>Coming soon!</p>
                            </div>
                        </div>
                    </div>
                `;
                break;

            case "Support":
                content.innerHTML = `
                    <div class="affiliate-main">
                        <div class="affiliate-header">
                            <h1>💬 Support</h1>
                            <p>Get help with your account</p>
                        </div>
                        <div class="affiliate-content">
                            <div class="referral-box">
                                <h2>Contact Us</h2>
                                <p>Email: support@phrendly.com</p>
                                <p>Chat with us in real-time</p>
                                <button class="copy-btn">Start Chat</button>
                            </div>
                        </div>
                    </div>
                `;
                break;

            case "Admin Panel":
                loadAdminPanel();
                break;
        }
    });
});

// Logout functionality
const logoutBtn = document.querySelector(".logout");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        // Clear the current user session
        localStorage.removeItem('currentUser');
        
        // Redirect to login page
        window.location.href = '/login.html';
    });
}

// Load Affiliate Content Function
function loadAffiliateContent() {
    const content = document.getElementById("content");
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {
        window.location.href = '/login.html';
        return;
    }

    // Get all users to find current user's data
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userData = users.find(u => u.email === currentUser.email);

    // Initialize referral fields if they don't exist
    if (!userData.referralCode) {
        userData.referralCode = generateReferralCode();
    }

    if (!userData.referrals) {
        userData.referrals = [];
    }

    if (!userData.totalEarnings) {
        userData.totalEarnings = 0;
    }

    // Update current user with new data
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    // Update users array
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    
    if (userIndex !== -1) {
        users[userIndex] = userData;
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Generate referral link
    const referralLink = window.location.origin + '/?ref=' + userData.referralCode;

    // Build HTML content
    let html = `
        <div class="affiliate-main">
            <div class="affiliate-header">
                <h1>🔗 Affiliate Program</h1>
                <p>Earn money by referring friends to Phrendly</p>
            </div>

            <div class="affiliate-content">
                <!-- Referral Link Section -->
                <div class="referral-box">
                    <h2>Your Referral Link</h2>
                    <div class="link-section">
                        <input type="text" id="referralLink" readonly class="referral-input" value="${referralLink}">
                        <button class="copy-btn" onclick="copyAffiliateLink()">
                            📋 Copy
                        </button>
                    </div>
                    <p class="link-note">Share this link with your friends. They'll earn when they sign up using your link!</p>
                </div>

                <!-- Referral Code Section -->
                <div class="referral-box">
                    <h2>Your Referral Code</h2>
                    <div class="code-section">
                        <input type="text" id="referralCode" readonly class="referral-code-input" value="${userData.referralCode}">
                        <button class="copy-btn" onclick="copyAffiliateCode()">
                            📋 Copy
                        </button>
                    </div>
                    <p class="code-note">Share your code on social media and earn commissions</p>
                </div>

                <!-- Stats Section -->
                <div class="stats-section">
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-info">
                            <h3>Total Referrals</h3>
                            <p class="stat-value">${userData.referrals.length}</p>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-info">
                            <h3>Total Earnings</h3>
                            <p class="stat-value">Ksh ${userData.totalEarnings}</p>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-info">
                            <h3>Commission Per Referral</h3>
                            <p class="stat-value">Ksh 100</p>
                        </div>
                    </div>
                </div>

                <!-- Referrals List -->
                <div class="referrals-list">
                    <h2>Your Referrals</h2>
                    <div id="referralsList" class="list-container">
                        ${userData.referrals.length === 0 ? '<p class="no-referrals">No referrals yet. Start sharing your link!</p>' : getReferralsTableHTML(userData.referrals)}
                    </div>
                </div>

                <!-- How It Works -->
                <div class="how-it-works">
                    <h2>How It Works</h2>
                    <div class="steps">
                        <div class="step">
                            <div class="step-number">1</div>
                            <h3>Share Your Link</h3>
                            <p>Copy your unique referral link and share it with friends on social media or email</p>
                        </div>
                        <div class="step">
                            <div class="step-number">2</div>
                            <h3>They Sign Up</h3>
                            <p>When your friends click your link and register on Phrendly, they become your referrals</p>
                        </div>
                        <div class="step">
                            <div class="step-number">3</div>
                            <h3>You Earn</h3>
                            <p>You earn Ksh 100 for every successful referral. The more you refer, the more you earn!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    content.innerHTML = html;
}

// Generate unique referral code
function generateReferralCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

// Get referrals table HTML
function getReferralsTableHTML(referrals) {
    let html = '<table class="referrals-table"><thead><tr><th>Name</th><th>Email</th><th>Date Joined</th><th>Commission</th></tr></thead><tbody>';
    
    referrals.forEach(referral => {
        html += '<tr>';
        html += '<td>' + referral.username + '</td>';
        html += '<td>' + referral.email + '</td>';
        html += '<td>' + referral.date + '</td>';
        html += '<td>Ksh ' + referral.commission + '</td>';
        html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
}

// Copy referral link
function copyAffiliateLink() {
    const input = document.getElementById('referralLink');
    input.select();
    document.execCommand('copy');

    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓ Copied!';
    btn.style.backgroundColor = '#4dff91';
    btn.style.color = '#000';

    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.backgroundColor = '';
        btn.style.color = '';
    }, 2000);
}

// Copy referral code
function copyAffiliateCode() {
    const input = document.getElementById('referralCode');
    input.select();
    document.execCommand('copy');

    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓ Copied!';
    btn.style.backgroundColor = '#4dff91';
    btn.style.color = '#000';

    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.backgroundColor = '';
        btn.style.color = '';
    }, 2000);
}

// Load Chat System
function loadChatSystem() {
    const content = document.getElementById("content");
    
    // Load chat HTML via iframe with clean styling
    content.innerHTML = `
        <div style="width: 100%; color: #fff; padding: 0;">
            <div style="text-align: center; margin-bottom: 20px; padding: 20px 0; border-bottom: 2px solid #7c3aed;">
                <h1 style="font-size: 2rem; margin: 0 0 10px 0; color: #7c3aed;">💬 Chat With Lonely People</h1>
                <p style="font-size: 1rem; color: #aaa; margin: 0;">Connect with people who want to chat online</p>
            </div>
            <div style="width: 100%; height: 600px; border: 2px solid #7c3aed; border-radius: 10px; background: rgba(124, 58, 237, 0.05); overflow: hidden;">
                <iframe src="pages/chat.html" style="width: 100%; height: 100%; border: none; background: #050505;"></iframe>
            </div>
        </div>
    `;
}

// Load Admin Panel
function loadAdminPanel() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Security check - only admins can access
    if (!currentUser || !currentUser.isAdmin) {
        alert('Access Denied! Only administrators can access this panel.');
        return;
    }

    const content = document.getElementById("content");
    const users = JSON.parse(localStorage.getItem('users')) || [];

    let html = `
        <div class="affiliate-main">
            <div class="affiliate-header">
                <h1>⚙️ Admin Panel</h1>
                <p>Manage users and system settings</p>
            </div>

            <div class="affiliate-content">
                <!-- Users Management Section -->
                <div class="referral-box">
                    <h2>👥 All Users (${users.length})</h2>
                    <div id="usersList" class="list-container">
                        <table class="referrals-table" style="width: 100%;">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Balance</th>
                                    <th>Referrals</th>
                                    <th>Earnings</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${users.map((user, index) => `
                                    <tr>
                                        <td>${user.username}</td>
                                        <td>${user.email}</td>
                                        <td>KES ${(user.balance || 0).toFixed(2)}</td>
                                        <td>${(user.referrals || []).length}</td>
                                        <td>KES ${(user.totalEarnings || 0).toFixed(2)}</td>
                                        <td>
                                            <button onclick="editUserBalance('${user.email}')" class="copy-btn" style="padding: 5px 10px; font-size: 12px;">Edit Balance</button>
                                            <button onclick="deleteUser('${user.email}')" class="copy-btn" style="padding: 5px 10px; font-size: 12px; background: #ff6b6b;">Delete</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- System Stats -->
                <div class="referral-box">
                    <h2>📊 System Statistics</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div style="background: rgba(124, 58, 237, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #7c3aed;">
                            <p style="color: #aaa; margin: 0 0 5px 0;">Total Users</p>
                            <h3 style="color: #7c3aed; margin: 0; font-size: 24px;">${users.length}</h3>
                        </div>
                        <div style="background: rgba(77, 255, 145, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #4dff91;">
                            <p style="color: #aaa; margin: 0 0 5px 0;">Total Balance Distributed</p>
                            <h3 style="color: #4dff91; margin: 0; font-size: 24px;">KES ${users.reduce((sum, u) => sum + (u.balance || 0), 0).toFixed(2)}</h3>
                        </div>
                        <div style="background: rgba(255, 107, 107, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #ff6b6b;">
                            <p style="color: #aaa; margin: 0 0 5px 0;">Total Earnings Credited</p>
                            <h3 style="color: #ff6b6b; margin: 0; font-size: 24px;">KES ${users.reduce((sum, u) => sum + (u.totalEarnings || 0), 0).toFixed(2)}</h3>
                        </div>
                    </div>
                </div>

                <!-- Add Balance Section -->
                <div class="referral-box">
                    <h2>➕ Add Balance to User</h2>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <input type="email" id="adminUserEmail" placeholder="User email" style="flex: 1; min-width: 200px; padding: 10px; background: rgba(0, 0, 0, 0.3); border: 1px solid #7c3aed; border-radius: 5px; color: #fff;">
                        <input type="number" id="adminBalanceAmount" placeholder="Amount (KES)" style="flex: 1; min-width: 200px; padding: 10px; background: rgba(0, 0, 0, 0.3); border: 1px solid #7c3aed; border-radius: 5px; color: #fff;">
                        <button onclick="addBalanceToUser()" class="copy-btn">Add Balance</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    content.innerHTML = html;
}

// Edit user balance
function editUserBalance(email) {
    const newBalance = prompt('Enter new balance (KES):');
    if (newBalance === null || isNaN(newBalance)) return;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex !== -1) {
        users[userIndex].balance = parseFloat(newBalance);
        localStorage.setItem('users', JSON.stringify(users));
        alert('Balance updated successfully!');
        loadAdminPanel();
    }
}

// Add balance to user
function addBalanceToUser() {
    const email = document.getElementById('adminUserEmail').value.trim();
    const amount = parseFloat(document.getElementById('adminBalanceAmount').value);

    if (!email || isNaN(amount) || amount <= 0) {
        alert('Please enter valid email and amount');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
        alert('User not found');
        return;
    }

    users[userIndex].balance = (users[userIndex].balance || 0) + amount;
    localStorage.setItem('users', JSON.stringify(users));
    
    document.getElementById('adminUserEmail').value = '';
    document.getElementById('adminBalanceAmount').value = '';
    
    alert(`Added KES ${amount} to user balance!`);
    loadAdminPanel();
    loadDashboardStats();
}

// Delete user
function deleteUser(email) {
    if (confirm('Are you sure you want to delete this user?')) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const filteredUsers = users.filter(u => u.email !== email);
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        alert('User deleted successfully!');
        loadAdminPanel();
    }
}