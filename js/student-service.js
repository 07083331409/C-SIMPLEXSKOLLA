import {
    collection,
    addDoc,
    getDoc,
    getDocs,
    doc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

import {
    db,
    getCurrentSchoolId,
    getCurrentUserUID
} from "./firebase.js";

export const STUDENT_STATUS_ACTIVE = "active";

export async function generateUniqueAdmissionNumber() {
    const schoolId = getCurrentSchoolId();

    if (!schoolId) {
        throw new Error("School context is missing. Please sign in to a school session.");
    }

    const admissionsRef = collection(db, "schools", schoolId, "students");
    const snapshot = await getDocs(query(admissionsRef, orderBy("createdAt", "desc"), limit(1)));

    let nextNumber = 1;

    if (!snapshot.empty) {
        const latest = snapshot.docs[0].data();

        if (latest && latest.admissionNumber) {
            const currentNumeric = Number(String(latest.admissionNumber).replace(/\D/g, ""));

            if (!Number.isNaN(currentNumeric)) {
                nextNumber = currentNumeric + 1;
            }
        }
    }

    const year = new Date().getFullYear();
    const admissionNumber = `SK${year}-${String(nextNumber).padStart(6, "0")}`;

    const duplicateCheck = await getDocs(query(admissionsRef, where("admissionNumber", "==", admissionNumber), limit(1)));

    if (!duplicateCheck.empty) {
        return generateUniqueAdmissionNumber();
    }

    return admissionNumber;
}

export async function createStudent(studentData) {
    const schoolId = getCurrentSchoolId();

    if (!schoolId) {
        throw new Error("Unable to create student. No school is active in this session.");
    }

    if (!studentData || !studentData.firstName || !studentData.lastName) {
        throw new Error("Student personal information is incomplete.");
    }

    const createdBy = getCurrentUserUID();

    const payload = {
        ...studentData,
        schoolId,
        createdBy,
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    const studentsRef = collection(db, "schools", schoolId, "students");

    const documentRef = await addDoc(studentsRef, payload);

    return {
        success: true,
        id: documentRef.id,
        schoolId,
        admissionNumber: studentData.admissionNumber || ""
    };
}

export async function getStudentsForCurrentSchool() {
    const schoolId = getCurrentSchoolId();

    if (!schoolId) {
        return [];
    }

    const studentsRef = collection(db, "schools", schoolId, "students");
    const results = await getDocs(query(studentsRef, orderBy("createdAt", "desc")));

    return results.docs.map(document => ({
        id: document.id,
        ...document.data()
    }));
}

export async function getStudentById(studentId) {
    const schoolId = getCurrentSchoolId();

    if (!schoolId || !studentId) {
        throw new Error("The selected student cannot be loaded without school context.");
    }

    const studentDoc = await getDoc(doc(db, "schools", schoolId, "students", studentId));

    if (!studentDoc.exists()) {
        return null;
    }

    return {
        id: studentDoc.id,
        ...studentDoc.data()
    };
}
