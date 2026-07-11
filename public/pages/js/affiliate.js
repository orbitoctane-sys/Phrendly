// Load affiliate data when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadAffiliateData();
});

// Load and display affiliate data
function loadAffiliateData() {
    const currentUser = JSON.parse(
        localStorage.getItem('currentUser')
    );

    if (!currentUser) {
        window.location.href = '../../login.html';
        return;
    }

    // Get all users to find current user's data
    const users = JSON.parse(
        localStorage.getItem('users')
    ) || [];

    const userData = users.find(
        u => u.email === currentUser.email
    );

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
    const userIndex = users.findIndex(
        u => u.email === currentUser.email
    );
    
    if (userIndex !== -1) {
        users[userIndex] = userData;
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Display referral link
    const referralLink = window.location.origin + '/?ref=' + userData.referralCode;
    document.getElementById('referralLink').value = referralLink;

    // Display referral code
    document.getElementById('referralCode').value = userData.referralCode;

    // Display stats
    document.getElementById('totalReferrals').textContent = userData.referrals.length;
    document.getElementById('totalEarnings').textContent = 'Ksh ' + userData.totalEarnings;

    // Display referrals list
    displayReferralsList(userData.referrals);
}

// Generate unique referral code
function generateReferralCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }
    return code;
}

// Display referrals list
function displayReferralsList(referrals) {
    const listContainer = document.getElementById('referralsList');

    if (referrals.length === 0) {
        listContainer.innerHTML = '<p class="no-referrals">No referrals yet. Start sharing your link!</p>';
        return;
    }

    let html = '<table class="referrals-table">';
    html += '<thead><tr><th>Name</th><th>Email</th><th>Date Joined</th><th>Commission</th></tr></thead>';
    html += '<tbody>';

    referrals.forEach(referral => {
        html += '<tr>';
        html += '<td>' + referral.username + '</td>';
        html += '<td>' + referral.email + '</td>';
        html += '<td>' + referral.date + '</td>';
        html += '<td>Ksh ' + referral.commission + '</td>';
        html += '</tr>';
    });

    html += '</tbody></table>';
    listContainer.innerHTML = html;
}

// Copy referral link to clipboard
function copyToClipboard() {
    const input = document.getElementById('referralLink');
    input.select();
    document.execCommand('copy');

    // Show feedback
    const btn = event.target.closest('.copy-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    btn.style.backgroundColor = '#4dff91';
    btn.style.color = '#000';

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = '';
        btn.style.color = '';
    }, 2000);
}

// Copy referral code to clipboard
function copyCodeToClipboard() {
    const input = document.getElementById('referralCode');
    input.select();
    document.execCommand('copy');

    // Show feedback
    const btn = event.target.closest('.copy-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    btn.style.backgroundColor = '#4dff91';
    btn.style.color = '#000';

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = '';
        btn.style.color = '';
    }, 2000);
}
