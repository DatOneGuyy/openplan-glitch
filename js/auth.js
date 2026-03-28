import { state } from './state.js';

// DOM Elements (Queried as needed to ensure availability)
const getAuthContainer = () => document.getElementById('authContainer');
const getUserStatusContainer = () => document.getElementById('userStatusContainer');
const getWelcomeText = () => document.getElementById('welcomeText');
const getLogoutBtn = () => document.getElementById('logoutBtn');

export function initAuth() {
    // Check initial status on any page
    checkUserStatus();

    const logoutBtn = getLogoutBtn();
    if (logoutBtn) {
        logoutBtn.onclick = handleLogout;
    }
}

/**
 * Initialization for dedicated login/signup pages
 * @param {string} type - 'login' or 'signup'
 */
export function initAuthPage(type) {
    if (type === 'login') {
        const loginSubmitBtn = document.getElementById('loginSubmitBtn');
        if (loginSubmitBtn) {
            loginSubmitBtn.onclick = handleLogin;
        }
        
        // Handle URL success messages
        const urlParams = new URLSearchParams(window.location.search);
        const msg = urlParams.get('msg');
        if (msg) {
            const errorEl = document.getElementById('loginError');
            if (errorEl) {
                errorEl.textContent = msg;
                errorEl.style.color = '#10b981'; // Success Green
            }
        }
    } else if (type === 'signup') {
        const registerSubmitBtn = document.getElementById('registerSubmitBtn');
        if (registerSubmitBtn) {
            registerSubmitBtn.onclick = handleRegister;
        }
    }

    // Support Enter key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (type === 'login') handleLogin();
            else if (type === 'signup') handleRegister();
        }
    });
}

async function checkUserStatus() {
    try {
        const response = await fetch('/api/user_status');
        const data = await response.json();
        if (data.is_logged_in) {
            showLoggedIn(data.user.username);
        } else {
            showLoggedOut();
        }
    } catch (err) {
        console.error('Status check failed:', err);
    }
}

async function handleLogin() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (response.ok) {
            // Redirect to home on success
            window.location.href = '/';
        } else {
            errorEl.textContent = data.error || 'Login failed';
        }
    } catch (err) {
        errorEl.textContent = 'Connection error';
    }
}

async function handleRegister() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const errorEl = document.getElementById('registerError');

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (response.ok) {
            // Success! Redirect to login
            window.location.href = '/login?msg=Account created! Please login.';
        } else {
            errorEl.textContent = data.error || 'Registration failed';
        }
    } catch (err) {
        errorEl.textContent = 'Connection error';
    }
}

async function handleLogout() {
    try {
        const response = await fetch('/api/logout', { method: 'POST' });
        if (response.ok) {
            window.location.reload();
        }
    } catch (err) {
        console.error('Logout failed:', err);
    }
}

function showLoggedIn(username) {
    state.isLoggedIn = true;
    const authContainer = getAuthContainer();
    const userStatusContainer = getUserStatusContainer();
    const welcomeText = getWelcomeText();

    if (authContainer) authContainer.style.display = 'none';
    if (userStatusContainer) userStatusContainer.style.display = 'flex';
    if (welcomeText) welcomeText.textContent = username;
}

function showLoggedOut() {
    state.isLoggedIn = false;
    const authContainer = getAuthContainer();
    const userStatusContainer = getUserStatusContainer();
    const welcomeText = getWelcomeText();

    if (authContainer) authContainer.style.display = 'flex';
    if (userStatusContainer) userStatusContainer.style.display = 'none';
    if (welcomeText) welcomeText.textContent = '';
}
