import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { db } from "./firebase.js";

export async function createUserProfile(uid, profileData) {
    if (!uid) {
        throw new Error("User UID is required.");
    }

    const userRef = doc(db, "users", uid);

    const payload = {
        uid,
        email: profileData.email || "",
        schoolId: profileData.schoolId || "",
        role: profileData.role || "administrator",
        displayName: profileData.displayName || "Administrator",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    await setDoc(userRef, payload);

    return {
        id: uid,
        ...payload
    };
}

export async function getUserProfile(uid) {
    if (!uid) {
        return null;
    }

    const userDoc = await getDoc(doc(db, "users", uid));

    if (!userDoc.exists()) {
        return null;
    }

    return {
        id: userDoc.id,
        ...userDoc.data()
    };
}

export async function updateUserProfile(uid, updateData) {
    if (!uid) {
        throw new Error("User UID is required.");
    }

    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
        ...updateData,
        updatedAt: serverTimestamp()
    });
}
