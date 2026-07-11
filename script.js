// REGISTER USER FUNCTION

async function registerUser() {
    const username = document.getElementById('username')?.value?.trim() || '';
    const email = document.getElementById('email')?.value?.trim() || '';
    const password = document.getElementById('password')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';
    const referralCode = document.getElementById('referralCode')?.value?.trim() || '';
    const errorDiv = document.getElementById('registerError');
    const apiBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:3000'
        : window.location.origin;

    if (errorDiv) {
        errorDiv.innerHTML = '';
    }

    if (!username) {
        showError('registerError', 'Username is required');
        return;
    }

    if (!email) {
        showError('registerError', 'Email is required');
        return;
    }

    if (!isValidEmail(email)) {
        showError('registerError', 'Please enter a valid email');
        return;
    }

    if (!password) {
        showError('registerError', 'Password is required');
        return;
    }

    if (password.length < 6) {
        showError('registerError', 'Password must be at least 6 characters');
        return;
    }

    if (password !== confirmPassword) {
        showError('registerError', 'Passwords do not match');
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, referralCode })
        });

        const data = await response.json();

        if (!response.ok) {
            showError('registerError', data.message || 'Registration failed');
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));

        if (errorDiv) {
            errorDiv.style.color = '#4dff91';
            errorDiv.innerHTML = '✓ Account created successfully! Redirecting...';
        }

        setTimeout(() => {
            window.location.href = 'extra-files/loading.html';
        }, 1500);
    } catch (error) {
        showError('registerError', 'Network error. Please try again.');
    }
}

const registerBtn = document.getElementById('registerBtn');

if (registerBtn) {
    registerBtn.addEventListener('click', function (e) {
        e.preventDefault();
        registerUser();
    });
}

// LOGIN USER FUNCTION

async function loginUser() {
    const email = document.getElementById('loginEmail')?.value?.trim() || '';
    const password = document.getElementById('loginPassword')?.value || '';
    const errorDiv = document.getElementById('loginError');
    const apiBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:3000'
        : window.location.origin;

    if (errorDiv) {
        errorDiv.innerHTML = '';
    }

    if (!email) {
        showError('loginError', 'Email is required');
        return;
    }

    if (!password) {
        showError('loginError', 'Password is required');
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showError('loginError', data.message || 'Login failed');
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('userEmail', data.user.email);

        if (errorDiv) {
            errorDiv.style.color = '#4dff91';
            errorDiv.innerHTML = '✓ Login successful! Redirecting...';
        }

        setTimeout(() => {
            window.location.href = 'extra-files/loading.html';
        }, 1000);
    } catch (error) {
        showError('loginError', 'Network error. Please try again.');
    }
}

const loginBtn = document.getElementById('loginBtn');

if (loginBtn) {
    loginBtn.addEventListener('click', function (e) {
        e.preventDefault();
        loginUser();
    });
}

// SHOW ERROR FUNCTION

function showError(elementId, message) {
    const errorDiv = document.getElementById(elementId);

    if (errorDiv) {
        errorDiv.style.color = '#ff6b6b';
        errorDiv.innerHTML = '✗ ' + message;
    }
}

// EMAIL VALIDATION

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// CHECK LOGIN

function checkLogin() {
    const currentUser = localStorage.getItem('currentUser');

    if (!currentUser) {
        window.location.href = 'login.html';
    } else {
        const user = JSON.parse(currentUser);

        const userNameElement = document.getElementById('userName');
        const userEmailElement = document.getElementById('userEmail');
        const userUsernameElement = document.getElementById('userUsername');

        if (userNameElement) userNameElement.textContent = user.username;
        if (userEmailElement) userEmailElement.textContent = user.email;
        if (userUsernameElement) userUsernameElement.textContent = user.username;
    }
}

// LOGOUT

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// RESET PASSWORD SYSTEM

const resetBtn = document.getElementById('resetBtn');

if (resetBtn) {
    resetBtn.addEventListener('click', async function () {
        const resetEmail = document.getElementById('resetEmail')?.value?.trim() || '';
        const newPassword = document.getElementById('newPassword')?.value || '';
        const confirmNewPassword = document.getElementById('confirmNewPassword')?.value || '';
        const apiBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://127.0.0.1:3000'
            : window.location.origin;

        if (resetEmail === '' || newPassword === '' || confirmNewPassword === '') {
            alert('Please fill all fields');
            return;
        }

        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}/api/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail, newPassword, confirmNewPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || 'Password reset failed');
                return;
            }

            alert('Password reset successful');
            window.location.href = '../login.html';
        } catch (error) {
            alert('Network error. Please try again.');
        }
    });
}

// SHOW / HIDE PASSWORD

function togglePassword(id) {
    const input = document.getElementById(id);

    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

// REFERRAL SYSTEM

function generateReferralCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return code;
}

function getReferralLink() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser && currentUser.referralCode) {
        return window.location.origin + '/?ref=' + currentUser.referralCode;
    }

    return '';
}

function addReferrer(referralCode) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const referrer = users.find((u) => u.referralCode === referralCode);

    if (referrer && referrer.referrals === undefined) {
        referrer.referrals = [];
        referrer.totalEarnings = 0;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (referrer && currentUser) {
        if (!referrer.referrals) {
            referrer.referrals = [];
        }

        referrer.referrals.push({
            username: currentUser.username,
            email: currentUser.email,
            date: new Date().toLocaleString(),
            commission: 100
        });

        referrer.totalEarnings += 100;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// RUN ON PAGE LOAD

document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.includes('dashboard.html')) {
        checkLogin();
    }
});
