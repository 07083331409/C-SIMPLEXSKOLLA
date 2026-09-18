import {
    collection,
    addDoc,
    getDoc,
    getDocs,
    doc,
    query,
    where,
    limit,
    serverTimestamp,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

import { db } from "./firebase.js";

const ALLOWED_SYSTEM_ROLES = [
    "administrator",
    "principal",
    "vicePrincipal",
    "teacher",
    "accountant",
    "bursar",
    "librarian",
    "hostelMaster",
    "securityStaff"
];

const STAFF_FIELDS = [
    "staffNumber",
    "schoolId",
    "authUid",
    "firstName",
    "middleName",
    "lastName",
    "fullName",
    "gender",
    "dateOfBirth",
    "maritalStatus",
    "nationality",
    "phone",
    "email",
    "address",
    "state",
    "lga",
    "emergencyContact",
    "staffType",
    "systemRole",
    "department",
    "qualification",
    "employmentDate",
    "employmentStatus",
    "loginEmail",
    "accountStatus",
    "photoUrl",
    "photoStoragePath"
];

const EDITABLE_FIELDS = STAFF_FIELDS.filter(field => ![
    "staffNumber",
    "schoolId",
    "authUid"
].includes(field));

function requireValue(value, fieldName) {
    if (value === undefined || value === null || String(value).trim() === "") {
        throw new Error(`${fieldName} is required.`);
    }

    return String(value).trim();
}

function optionalValue(value) {
    if (value === undefined || value === null) {
        return "";
    }

    return String(value).trim();
}

function requireStaffContext(verifiedSchoolId, currentUserUid) {
    const schoolId = requireValue(verifiedSchoolId, "Verified school ID");
    const userUid = requireValue(currentUserUid, "Authenticated user UID");

    return { schoolId, userUid };
}

function validateSystemRole(systemRole) {
    const role = requireValue(systemRole, "System role");

    if (!ALLOWED_SYSTEM_ROLES.includes(role)) {
        throw new Error("Invalid staff system role.");
    }

    return role;
}

function buildStaffPayload(verifiedSchoolId, staffData, currentUserUid) {
    const { schoolId, userUid } = requireStaffContext(verifiedSchoolId, currentUserUid);
    const data = staffData || {};
    const firstName = requireValue(data.firstName, "First name");
    const lastName = requireValue(data.lastName, "Last name");
    const staffNumber = requireValue(data.staffNumber, "Staff number");
    const fullName = [firstName, optionalValue(data.middleName), lastName]
        .filter(Boolean)
        .join(" ");

    return {
        staffNumber,
        schoolId,
        authUid: "",
        firstName,
        middleName: optionalValue(data.middleName),
        lastName,
        fullName,
        gender: optionalValue(data.gender),
        dateOfBirth: optionalValue(data.dateOfBirth),
        maritalStatus: optionalValue(data.maritalStatus),
        nationality: optionalValue(data.nationality),
        phone: requireValue(data.phone, "Phone number"),
        email: requireValue(data.email, "Email address"),
        address: optionalValue(data.address),
        state: optionalValue(data.state),
        lga: optionalValue(data.lga),
        emergencyContact: optionalValue(data.emergencyContact),
        staffType: requireValue(data.staffType, "Staff type"),
        systemRole: validateSystemRole(data.systemRole),
        department: requireValue(data.department, "Department"),
        qualification: optionalValue(data.qualification),
        employmentDate: requireValue(data.employmentDate, "Employment date"),
        employmentStatus: requireValue(data.employmentStatus, "Employment status"),
        loginEmail: optionalValue(data.loginEmail),
        accountStatus: requireValue(data.accountStatus, "Account status"),
        photoUrl: optionalValue(data.photoUrl),
        photoStoragePath: optionalValue(data.photoStoragePath),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userUid,
        updatedBy: userUid
    };
}

async function getNextStaffNumber(verifiedSchoolId) {
    const schoolId = requireValue(verifiedSchoolId, "Verified school ID");
    const staffRef = collection(db, "schools", schoolId, "staff");
    const results = await getDocs(staffRef);
    let highestNumber = 0;

    results.docs.forEach(document => {
        const staffNumber = document.data().staffNumber;
        const match = typeof staffNumber === "string" && staffNumber.match(/^STF(\d+)$/);
        const numericPart = match ? Number(match[1]) : 0;

        if (numericPart > highestNumber) {
            highestNumber = numericPart;
        }
    });

    let nextNumber = highestNumber + 1;
    let candidate = `STF${String(nextNumber).padStart(3, "0")}`;

    while (!(await isStaffNumberAvailable(schoolId, candidate))) {
        nextNumber += 1;
        candidate = `STF${String(nextNumber).padStart(3, "0")}`;
    }

    return candidate;
}

function buildEditablePayload(staffData) {
    const data = staffData || {};
    const payload = {};

    EDITABLE_FIELDS.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(data, field)) {
            payload[field] = optionalValue(data[field]);
        }
    });

    if (Object.prototype.hasOwnProperty.call(data, "systemRole")) {
        payload.systemRole = validateSystemRole(data.systemRole);
    }

    if (Object.prototype.hasOwnProperty.call(data, "firstName") ||
        Object.prototype.hasOwnProperty.call(data, "middleName") ||
        Object.prototype.hasOwnProperty.call(data, "lastName")) {
        const firstName = requireValue(data.firstName, "First name");
        const lastName = requireValue(data.lastName, "Last name");
        payload.firstName = firstName;
        payload.lastName = lastName;
        payload.middleName = optionalValue(data.middleName);
        payload.fullName = [firstName, payload.middleName, lastName]
            .filter(Boolean)
            .join(" ");
    }

    return payload;
}

export async function getStaffForCurrentSchool(verifiedSchoolId) {
    const schoolId = requireValue(verifiedSchoolId, "Verified school ID");
    const staffRef = collection(db, "schools", schoolId, "staff");
    const results = await getDocs(staffRef);

    return results.docs.map(document => ({
        id: document.id,
        ...document.data()
    }));
}

export async function getStaffById(verifiedSchoolId, staffId) {
    const schoolId = requireValue(verifiedSchoolId, "Verified school ID");
    const id = requireValue(staffId, "Staff ID");
    const staffDoc = await getDoc(doc(db, "schools", schoolId, "staff", id));

    if (!staffDoc.exists()) {
        return null;
    }

    return {
        id: staffDoc.id,
        ...staffDoc.data()
    };
}

export async function isStaffNumberAvailable(verifiedSchoolId, staffNumber, excludeStaffId = null) {
    const schoolId = requireValue(verifiedSchoolId, "Verified school ID");
    const number = requireValue(staffNumber, "Staff number");
    const staffRef = collection(db, "schools", schoolId, "staff");
    const results = await getDocs(query(staffRef, where("staffNumber", "==", number), limit(1)));

    return results.empty || (excludeStaffId !== null && results.docs[0].id === excludeStaffId);
}

export async function createStaff(verifiedSchoolId, staffData, currentUserUid) {
    const data = { ...(staffData || {}) };
    data.staffNumber = optionalValue(data.staffNumber) || await getNextStaffNumber(verifiedSchoolId);
    const payload = buildStaffPayload(verifiedSchoolId, data, currentUserUid);
    const available = await isStaffNumberAvailable(verifiedSchoolId, payload.staffNumber);

    if (!available) {
        throw new Error("Staff number is already in use by this school.");
    }

    const staffRef = await addDoc(collection(db, "schools", payload.schoolId, "staff"), payload);

    return {
        success: true,
        id: staffRef.id,
        schoolId: payload.schoolId,
        staffNumber: payload.staffNumber
    };
}

export async function updateStaff(verifiedSchoolId, staffId, staffData, currentUserUid) {
    const { schoolId, userUid } = requireStaffContext(verifiedSchoolId, currentUserUid);
    const id = requireValue(staffId, "Staff ID");
    const payload = buildEditablePayload(staffData);

    if (Object.keys(payload).length === 0) {
        throw new Error("No editable staff fields were supplied.");
    }

    payload.updatedAt = serverTimestamp();
    payload.updatedBy = userUid;

    await updateDoc(doc(db, "schools", schoolId, "staff", id), payload);

    return getStaffById(schoolId, id);
}

export async function archiveStaff(verifiedSchoolId, staffId, currentUserUid) {
    const { schoolId, userUid } = requireStaffContext(verifiedSchoolId, currentUserUid);
    const id = requireValue(staffId, "Staff ID");
    const timestamp = serverTimestamp();

    await updateDoc(doc(db, "schools", schoolId, "staff", id), {
        employmentStatus: "archived",
        accountStatus: "disabled",
        archivedAt: timestamp,
        archivedBy: userUid,
        updatedAt: timestamp,
        updatedBy: userUid
    });

    return getStaffById(schoolId, id);
}
