import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

import { db } from "./firebase.js";

export async function createSchoolProfile(schoolData) {
    if (!schoolData?.schoolName || !schoolData?.createdBy) {
        throw new Error("School name and creator are required.");
    }

    const schoolId = doc(collection(db, "schools")).id;
    const schoolRef = doc(db, "schools", schoolId);
    const payload = {
        schoolId,
        schoolName: schoolData.schoolName,
        schoolType: schoolData.schoolType || "",
        schoolMotto: schoolData.schoolMotto || "",
        schoolCode: schoolData.schoolCode || "",
        email: schoolData.email || "",
        phone: schoolData.phone || "",
        address: schoolData.address || "",
        logo: schoolData.logo || "",
        status: "active",
        createdBy: schoolData.createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    await setDoc(schoolRef, payload);

    return {
        id: schoolId,
        ...payload
    };
}

export async function getSchoolProfile(schoolId) {
    if (!schoolId) {
        return null;
    }

    const schoolDoc = await getDoc(doc(db, "schools", schoolId));

    if (!schoolDoc.exists()) {
        return null;
    }

    return {
        id: schoolDoc.id,
        ...schoolDoc.data()
    };
}

export async function updateSchoolProfile(schoolId, updateData) {
    if (!schoolId) {
        throw new Error("School ID is required.");
    }

    await updateDoc(doc(db, "schools", schoolId), {
        ...updateData,
        updatedAt: serverTimestamp()
    });

    return getSchoolProfile(schoolId);
}

export async function createUserProfile(uid, profileData) {
    if (!uid) {
        throw new Error("User UID is required.");
    }

    if (!profileData?.schoolId) {
        throw new Error("School ID is required.");
    }

    const userRef = doc(db, "users", uid);

    const payload = {
        uid,
        email: profileData.email || "",
        schoolId: profileData.schoolId,
        role: "administrator",
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