import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { db } from "./firebase.js";

export async function createSchoolProfile(schoolData) {
    const schoolRef = doc(collection(db, "schools"));
    const schoolId = schoolRef.id;

    const payload = {
        schoolId,
        schoolName: schoolData.schoolName || "",
        schoolType: schoolData.schoolType || "",
        schoolMotto: schoolData.schoolMotto || "",
        schoolCode: schoolData.schoolCode || schoolId,
        email: schoolData.email || "",
        phone: schoolData.phone || "",
        address: schoolData.address || "",
        logo: schoolData.logo || "",
        status: "active",
        createdBy: schoolData.createdBy || "",
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

    const schoolRef = doc(db, "schools", schoolId);
    await updateDoc(schoolRef, {
        ...updateData,
        updatedAt: serverTimestamp()
    });
}
