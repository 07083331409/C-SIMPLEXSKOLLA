import { auth } from "./firebase.js";
import { requireAuthenticatedSession } from "./auth-service.js";
import { createStaff } from "./staff-service.js";

const systemRoleMap = {
    administrator: "administrator",
    principal: "principal",
    "vice principal": "vicePrincipal",
    viceprincipal: "vicePrincipal",
    teacher: "teacher",
    accountant: "accountant",
    bursar: "bursar",
    librarian: "librarian",
    "hostel master": "hostelMaster",
    "security staff": "securityStaff",
    "other staff": "teacher"
};

let verifiedSchoolId = "";
let authenticatedUser = null;
let isSubmitting = false;

function getFieldValue(id, fallback = "") {
    const element = document.getElementById(id);

    if (!element) {
        return fallback;
    }

    const value = element.value ? element.value.trim() : "";
    return value || fallback;
}

function normalizeSystemRole(value) {
    const normalized = String(value || "").trim().toLowerCase();
    return systemRoleMap[normalized] || "teacher";
}

function normalizeAccountStatus(value) {
    const normalized = String(value || "").trim().toLowerCase();

    if (normalized.includes("leave")) {
        return "onLeave";
    }

    if (normalized.includes("inactive")) {
        return "inactive";
    }

    return "active";
}

function setError(id, message) {
    const input = document.getElementById(id);
    const field = input?.closest(".field");
    const error = document.querySelector(`[data-error-for="${id}"]`);
    field?.classList.add("invalid");
    if (error) error.textContent = message;
}

function clearError(id) {
    const input = document.getElementById(id);
    const field = input?.closest(".field");
    const error = document.querySelector(`[data-error-for="${id}"]`);
    field?.classList.remove("invalid");
    if (error) error.textContent = "";
}

function validateForm() {
    const requiredFields = [
        "firstName",
        "lastName",
        "gender",
        "phone",
        "email",
        "staffType",
        "role",
        "department",
        "employmentDate",
        "employmentStatus"
    ];

    let valid = true;

    requiredFields.forEach((id) => {
        const input = document.getElementById(id);
        if (!input || !input.value || !input.value.trim()) {
            setError(id, "This field is required.");
            valid = false;
            return;
        }

        clearError(id);
    });

    const email = document.getElementById("email");
    if (email && email.value.trim() && !email.validity.valid) {
        setError("email", "Enter a valid email address.");
        valid = false;
    }

    const loginEmail = document.getElementById("loginEmail");
    if (loginEmail && loginEmail.value.trim() && !loginEmail.validity.valid) {
        setError("loginEmail", "Enter a valid login email address.");
        valid = false;
    }

    const systemRoleValue = document.getElementById("systemRole")?.value || document.getElementById("role")?.value || "";
    if (!systemRoleValue.trim()) {
        setError("role", "This field is required.");
        valid = false;
    }

    return valid;
}

function buildStaffPayload() {
    const formSystemRole = document.getElementById("systemRole");
    const roleInput = document.getElementById("role");
    const roleValue = formSystemRole?.value || roleInput?.value || "Teacher";
    const employmentStatus = getFieldValue("employmentStatus", "Active");
    const staffNumber = getFieldValue("staffId");

    return {
        staffNumber,
        firstName: getFieldValue("firstName"),
        middleName: getFieldValue("middleName"),
        lastName: getFieldValue("lastName"),
        gender: getFieldValue("gender"),
        dateOfBirth: getFieldValue("dateOfBirth"),
        maritalStatus: getFieldValue("maritalStatus"),
        nationality: getFieldValue("nationality"),
        phone: getFieldValue("phone"),
        email: getFieldValue("email"),
        address: getFieldValue("address"),
        state: getFieldValue("state"),
        lga: getFieldValue("lga"),
        emergencyContact: getFieldValue("emergencyContact"),
        staffType: getFieldValue("staffType"),
        systemRole: normalizeSystemRole(roleValue),
        department: getFieldValue("department"),
        qualification: getFieldValue("qualification"),
        employmentDate: getFieldValue("employmentDate"),
        employmentStatus,
        loginEmail: getFieldValue("loginEmail", getFieldValue("email")),
        accountStatus: normalizeAccountStatus(employmentStatus)
    };
}

function setSavingState(isSaving) {
    const form = document.getElementById("staffForm");
    const submitButtons = form ? form.querySelectorAll("button[type='submit']") : [];

    submitButtons.forEach((button) => {
        button.disabled = isSaving;

        if (isSaving) {
            button.dataset.originalText = button.dataset.originalText || button.innerHTML;
            button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving staff...';
            return;
        }

        const originalText = button.dataset.originalText || button.innerHTML;
        button.innerHTML = originalText;
    });
}

function showToast(message, isError = false) {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");

    if (!toast || !toastMessage) {
        return;
    }

    toastMessage.textContent = message;
    toast.classList.toggle("error", isError);
    toast.classList.add("show");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 4800);
}

function clearSuccessBanner() {
    const existingBanner = document.querySelector(".staff-save-success");
    if (existingBanner) {
        existingBanner.remove();
    }
}

function showSuccessBanner(staffId) {
    clearSuccessBanner();

    const successBanner = document.createElement("div");
    successBanner.className = "staff-save-success";
    successBanner.innerHTML = `
        <div class="success-message">
            <i class="fa-solid fa-circle-check"></i>
            <span>Staff created successfully.</span>
        </div>
        <div class="success-actions">
            <a href="staff-list.html" class="primary-btn">Staff List</a>
            <a href="staff-profile.html?id=${encodeURIComponent(staffId)}" class="secondary-submit">View Staff</a>
        </div>
    `;

    const form = document.getElementById("staffForm");
    form?.insertAdjacentElement("afterend", successBanner);
}

async function initializeAuthenticatedStaffSession() {
    try {
        const session = await requireAuthenticatedSession();
        verifiedSchoolId = session.schoolProfile.id;
        authenticatedUser = auth.currentUser;

        if (!authenticatedUser?.uid) {
            throw new Error("Authenticated user UID is unavailable.");
        }
    } catch (error) {
        console.error("Staff creation session initialization failed.", error);
        showToast("Your session is not valid. Please sign in again.", true);
        window.setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("staffForm");
    const photoInput = document.getElementById("profilePhoto");
    const photoPreview = document.getElementById("photoPreview");
    const saveAnotherButton = document.getElementById("saveAnother");
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".overlay");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("show");
            overlay?.classList.toggle("active");
        });
    }

    overlay?.addEventListener("click", () => {
        sidebar?.classList.remove("show");
        overlay?.classList.remove("active");
    });

    photoInput?.addEventListener("change", () => {
        const file = photoInput.files?.[0];
        clearError("profilePhoto");

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError("profilePhoto", "Please choose an image file.");
            photoInput.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError("profilePhoto", "Photo must be 2 MB or smaller.");
            photoInput.value = "";
            return;
        }

        const reader = new FileReader();
        reader.addEventListener("load", () => {
            photoPreview.innerHTML = `<img src="${reader.result}" alt="Selected profile photo">`;
        });
        reader.readAsDataURL(file);
    });

    form?.querySelectorAll("input, select, textarea").forEach((input) => {
        input.addEventListener("input", () => {
            if (input.value.trim()) {
                clearError(input.id);
            }
        });

        input.addEventListener("change", () => {
            if (input.value.trim()) {
                clearError(input.id);
            }
        });
    });

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const saveAnother = event.submitter === saveAnotherButton;

        if (!validateForm()) {
            showToast("Please review the highlighted required fields.", true);
            document.querySelector(".field.invalid input, .field.invalid select")?.focus();
            return;
        }

        if (!verifiedSchoolId || !authenticatedUser?.uid) {
            showToast("Your session is not active. Please sign in again.", true);
            return;
        }

        if (isSubmitting) {
            return;
        }

        isSubmitting = true;
        setSavingState(true);

        try {
            const staffData = buildStaffPayload();
            const result = await createStaff(verifiedSchoolId, staffData, authenticatedUser.uid);

            clearSuccessBanner();
            showToast(saveAnother ? "Staff member saved. You can add another profile." : "Staff saved successfully.");

            if (saveAnother) {
                form.reset();
                photoPreview.innerHTML = '<i class="fa-solid fa-user"></i>';
                form.querySelectorAll(".field").forEach((field) => field.classList.remove("invalid"));
                form.querySelectorAll(".field-error").forEach((error) => {
                    error.textContent = "";
                });
                return;
            }

            showSuccessBanner(result.id);
        } catch (error) {
            console.error("Failed to create staff record.", error);

            const message = error?.message?.includes("already in use")
                ? "Staff number is already in use. Please enter another staff number."
                : "Unable to save staff. Please review the form and try again.";

            showToast(message, true);
        } finally {
            isSubmitting = false;
            setSavingState(false);
        }
    });

    initializeAuthenticatedStaffSession();
});
