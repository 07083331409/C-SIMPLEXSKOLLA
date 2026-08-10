import { auth, onAuthStateChanged } from "./firebase.js";
import { getUserProfile } from "./user-service.js";
import { getSchoolProfile } from "./school-service.js";
import { setApplicationSession, clearApplicationSession, logout } from "./auth-service.js";

function redirectToLogin() {
    clearApplicationSession();
    window.location.href = 'login.html';
}

async function validateDashboardAccess(user) {
    if (!user) {
        throw new Error('You must sign in to continue.');
    }

    const userProfile = await getUserProfile(user.uid);

    if (!userProfile) {
        throw new Error('Administrator profile not found.');
    }

    if (!userProfile.schoolId) {
        throw new Error('This administrator account has no associated school.');
    }

    const schoolProfile = await getSchoolProfile(userProfile.schoolId);

    if (!schoolProfile) {
        throw new Error('The associated school was not found.');
    }

    if (schoolProfile.status !== 'active') {
        throw new Error('The associated school is not active.');
    }

    setApplicationSession(user, userProfile, schoolProfile);
}

onAuthStateChanged(auth, async (user) => {
    try {
        if (!user) {
            redirectToLogin();
            return;
        }

        await validateDashboardAccess(user);
    } catch (error) {
        console.error('Dashboard access denied:', error);
        redirectToLogin();
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.querySelector('.logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            await logout();
        });
    }
});
