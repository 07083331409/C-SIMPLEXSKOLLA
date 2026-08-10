import { auth, signOut } from "./firebase.js";
import { getUserProfile } from "./user-service.js";
import { getSchoolProfile } from "./school-service.js";

export function setApplicationSession(user, userProfile, schoolProfile) {
    if (!user || !userProfile || !schoolProfile) {
        return;
    }

    localStorage.setItem("simplexskolla.currentUser.uid", user.uid);
    localStorage.setItem("simplexskolla.currentUser.email", user.email || "");
    localStorage.setItem("simplexskolla.currentSchoolId", schoolProfile.id);
    localStorage.setItem(
        "simplexskolla.currentSchool",
        JSON.stringify({
            id: schoolProfile.id,
            schoolName: schoolProfile.schoolName || "",
            schoolCode: schoolProfile.schoolCode || "",
            email: schoolProfile.email || ""
        })
    );
}

export function clearApplicationSession() {
    localStorage.removeItem("simplexskolla.currentSchoolId");
    localStorage.removeItem("simplexskolla.currentSchool");
    localStorage.removeItem("simplexskolla.currentUser.uid");
    localStorage.removeItem("simplexskolla.currentUser.email");
}

export async function resolveAuthenticatedSession() {
    const currentUser = auth.currentUser;

    if (!currentUser) {
        throw new Error("No authenticated user found.");
    }

    const userProfile = await getUserProfile(currentUser.uid);

    if (!userProfile) {
        throw new Error("No administrator profile exists for this account.");
    }

    if (!userProfile.schoolId) {
        throw new Error("This account is not associated with a school.");
    }

    const schoolProfile = await getSchoolProfile(userProfile.schoolId);

    if (!schoolProfile) {
        throw new Error("The school for this administrator could not be found.");
    }

    if (schoolProfile.status !== "active") {
        throw new Error("The school associated with this account is not active.");
    }

    setApplicationSession(currentUser, userProfile, schoolProfile);

    return {
        userProfile,
        schoolProfile
    };
}

export async function logout() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout failed", error);
    } finally {
        clearApplicationSession();
        window.location.href = "login.html";
    }
}
