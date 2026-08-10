import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, deleteUser, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

export const firebaseConfig = {
  apiKey: "AIzaSyAmvRKkLPAyPiIIXOhR8NA4yBUlUFpIXDY",
  authDomain: "simplexskolla.firebaseapp.com",
  projectId: "simplexskolla",
  storageBucket: "simplexskolla.firebasestorage.app",
  messagingSenderId: "55130432516",
  appId: "1:55130432516:web:bfa2f29fc77d63e9e04151"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);

export function isFirebaseConfigured() {
    return Boolean(
        firebaseConfig.apiKey &&
        firebaseConfig.apiKey !== "YOUR_API_KEY" &&
        firebaseConfig.projectId &&
        firebaseConfig.projectId !== "YOUR_PROJECT_ID"
    );
}

export function getCurrentAuthenticatedUser() {
    return auth.currentUser;
}

export function getCurrentUserUID() {
    const currentUser = auth.currentUser;

    if (currentUser && currentUser.uid) {
        return currentUser.uid;
    }

    const cachedUid = localStorage.getItem("simplexskolla.currentUser.uid");

    return cachedUid || "anonymous";
}

export function getCurrentSchoolId() {
    const currentSchool = JSON.parse(localStorage.getItem("simplexskolla.currentSchool") || "null");

    if (currentSchool && currentSchool.id) {
        return currentSchool.id;
    }

    return localStorage.getItem("simplexskolla.currentSchoolId") || "";
}

export function getCurrentSchoolDetails() {
    const currentSchool = JSON.parse(localStorage.getItem("simplexskolla.currentSchool") || "null");

    return currentSchool || null;
}

export { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, deleteUser, sendPasswordResetEmail, signOut };
