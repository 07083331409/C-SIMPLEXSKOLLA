import { auth, sendPasswordResetEmail } from "./firebase.js";

const form = document.querySelector('form');
const emailInput = document.querySelector('input[type="email"]');
const messageEl = document.querySelector('.form-message');

function showMessage(message, isError = true) {
    if (!messageEl) return;
    messageEl.textContent = message;
    messageEl.style.color = isError ? '#F87171' : '#34D399';
}

function clearMessage() {
    if (!messageEl) return;
    messageEl.textContent = '';
}

function setDisabled(value) {
    if (!form) return;
    const button = form.querySelector('button');
    if (button) button.disabled = value;
}

async function handlePasswordReset(event) {
    event.preventDefault();

    if (!emailInput) return;

    const email = emailInput.value.trim();
    clearMessage();

    if (!email) {
        showMessage('Please enter your registered email address.');
        emailInput.focus();
        return;
    }

    setDisabled(true);

    try {
        await sendPasswordResetEmail(auth, email);
        showMessage('Password reset link sent. Check your inbox.', false);
    } catch (error) {
        const code = error?.code || '';
        switch (code) {
            case 'auth/user-not-found':
                showMessage('No account found for that email.');
                break;
            case 'auth/invalid-email':
                showMessage('Please enter a valid email address.');
                break;
            default:
                showMessage((error?.message) ? error.message : 'Unable to send reset email.');
                break;
        }
    } finally {
        setDisabled(false);
    }
}

if (form) {
    form.addEventListener('submit', handlePasswordReset);
}
