import { auth, signInWithEmailAndPassword, signOut } from "./firebase.js";
import { getUserProfile } from "./user-service.js";
import { getSchoolProfile } from "./school-service.js";
import { setApplicationSession } from "./auth-service.js";

const emailInput = document.querySelector('input[type="email"]');
const passwordInput = document.querySelector('#password');
const loginButton = document.querySelector('.login-btn');
const messageEl = document.querySelector('.form-message');
const rememberMeCheckbox = document.querySelector('.options input[type="checkbox"]');
const passwordToggle = document.querySelector('.password-toggle');

function showMessage(message, isError = true) {
    if (!messageEl) return;
    messageEl.textContent = message;
    messageEl.style.color = isError ? '#F87171' : '#34D399';
}

function clearMessage() {
    if (!messageEl) return;
    messageEl.textContent = '';
}

function setLoading(enabled) {
    if (!loginButton) return;
    if (enabled) {
        loginButton.classList.add('loading');
    } else {
        loginButton.classList.remove('loading');
    }
}

function getRememberedEmail() {
    return localStorage.getItem('simplexskolla.rememberEmail') || '';
}

function saveRememberedEmail(email) {
    if (rememberMeCheckbox?.checked) {
        localStorage.setItem('simplexskolla.rememberEmail', email);
    } else {
        localStorage.removeItem('simplexskolla.rememberEmail');
    }
}

function initPasswordToggle() {
    if (!passwordToggle) return;

    passwordToggle.addEventListener('click', () => {
        if (!passwordInput) return;
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        const icon = passwordToggle.querySelector('i');
        if (icon) {
            icon.className = isPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
        }
        passwordToggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    });
}

function initRememberMe() {
    if (!rememberMeCheckbox || !emailInput) return;
    const savedEmail = getRememberedEmail();
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
    }
}

async function handleLogin() {
    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    clearMessage();

    if (!email) {
        showMessage('Please enter your email address.');
        emailInput.focus();
        return;
    }

    if (!password) {
        showMessage('Please enter your password.');
        passwordInput.focus();
        return;
    }

    setLoading(true);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (user) {
            const userProfile = await getUserProfile(user.uid);

            if (!userProfile) {
                await signOut(auth);
                showMessage('This account is not associated with an administrator profile.');
                return;
            }

            if (!userProfile.schoolId) {
                await signOut(auth);
                showMessage('Your account does not have a school assigned yet.');
                return;
            }

            const schoolProfile = await getSchoolProfile(userProfile.schoolId);

            if (!schoolProfile) {
                await signOut(auth);
                showMessage('The school associated with this account was not found.');
                return;
            }

            if (schoolProfile.status !== 'active') {
                await signOut(auth);
                showMessage('The school associated with this account is not active.');
                return;
            }

            saveRememberedEmail(email);
            setApplicationSession(user, userProfile, schoolProfile);
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        const code = error?.code || ''; 
        switch (code) {
            case 'auth/user-not-found':
                showMessage('No account found for that email.');
                break;
            case 'auth/wrong-password':
                showMessage('Incorrect password.');
                break;
            case 'auth/invalid-email':
                showMessage('Please enter a valid email address.');
                break;
            case 'auth/user-disabled':
                showMessage('This account has been disabled.');
                break;
            default:
                showMessage((error?.message) ? error.message : 'Unable to sign in.');
                break;
        }
    } finally {
        setLoading(false);
    }
}

if (loginButton) {
    loginButton.addEventListener('click', handleLogin);
}

document.addEventListener('DOMContentLoaded', () => {
    initPasswordToggle();
    initRememberMe();
});
