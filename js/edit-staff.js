import { auth } from "./firebase.js";
import { requireAuthenticatedSession } from "./auth-service.js";
import { getStaffById, updateStaff } from "./staff-service.js";

let currentStaff = null;
let verifiedSchoolId = "";
let authenticatedUser = null;
let isSubmitting = false;
let hasUnsavedChanges = false;

function safeText(value, fallback = "") {
    if (value === undefined || value === null) {
        return fallback;
    }

    const normalized = String(value).trim();
    return normalized || fallback;
}

function normalizeEmploymentStatus(value) {
    const normalized = String(value || "").trim().toLowerCase();

    if (normalized.includes("leave")) {
        return "On Leave";
    }

    if (normalized.includes("inactive")) {
        return "Inactive";
    }

    return "Active";
}

function normalizeSystemRole(value) {
    const normalized = String(value || "").trim().toLowerCase();
    const map = {
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

    return map[normalized] || "teacher";
}

function mapSystemRoleLabel(value) {
    const normalized = String(value || "").trim();
    const map = {
        administrator: "Administrator",
        principal: "Principal",
        vicePrincipal: "Vice Principal",
        teacher: "Teacher",
        accountant: "Accountant",
        bursar: "Bursar",
        librarian: "Librarian",
        hostelMaster: "Other Staff",
        securityStaff: "Other Staff"
    };

    return map[normalized] || "Teacher";
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

function getFieldValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : "";
}

function populatePhotoPreview(photoUrl) {
    const preview = document.getElementById("photoPreview");

    if (!preview) {
        return;
    }

    preview.replaceChildren();

    if (!photoUrl) {
        const icon = document.createElement("i");
        icon.className = "fa-solid fa-user";
        preview.appendChild(icon);
        return;
    }

    const image = document.createElement("img");
    image.src = photoUrl;
    image.alt = "Staff profile photo";
    image.onerror = () => {
        preview.replaceChildren();
        const fallback = document.createElement("i");
        fallback.className = "fa-solid fa-user";
        preview.appendChild(fallback);
    };
    preview.appendChild(image);
}

function updateHeaderInfo(staff) {
    const headerActions = document.getElementById("headerActions");
    const headerStaffId = document.getElementById("headerStaffId");
    const headerName = document.getElementById("headerName");
    const headerStatus = document.getElementById("headerStatus");

    if (!headerActions || !headerStaffId || !headerName || !headerStatus) {
        return;
    }

    headerActions.style.display = "block";
    headerStaffId.textContent = safeText(staff.staffNumber || staff.id, "—");
    headerName.textContent = safeText(staff.fullName || [staff.firstName, staff.middleName, staff.lastName].filter(Boolean).join(" "), "Staff member");

    const statusText = safeText(staff.employmentStatus || staff.accountStatus, "—");
    headerStatus.textContent = statusText;
    headerStatus.className = "info-value status-badge";

    const normalizedStatus = statusText.toLowerCase();
    if (normalizedStatus.includes("leave")) {
        headerStatus.classList.add("on-leave");
    } else if (normalizedStatus.includes("inactive")) {
        headerStatus.classList.add("inactive");
    } else {
        headerStatus.classList.add("active");
    }
}

function populateForm(staff) {
    const form = document.getElementById("staffForm");
    const notFoundState = document.getElementById("notFoundState");

    if (!form || !notFoundState) {
        return;
    }

    form.style.display = "block";
    notFoundState.style.display = "none";

    document.getElementById("firstName").value = safeText(staff.firstName);
    document.getElementById("middleName").value = safeText(staff.middleName);
    document.getElementById("lastName").value = safeText(staff.lastName);
    document.getElementById("gender").value = safeText(staff.gender);
    document.getElementById("dateOfBirth").value = safeText(staff.dateOfBirth);
    document.getElementById("maritalStatus").value = safeText(staff.maritalStatus);
    document.getElementById("nationality").value = safeText(staff.nationality);
    document.getElementById("phone").value = safeText(staff.phone);
    document.getElementById("email").value = safeText(staff.email);
    document.getElementById("address").value = safeText(staff.address);
    document.getElementById("state").value = safeText(staff.state);
    document.getElementById("lga").value = safeText(staff.lga);
    document.getElementById("emergencyContact").value = safeText(staff.emergencyContact);
    document.getElementById("staffId").value = safeText(staff.staffNumber || staff.id);
    document.getElementById("staffType").value = safeText(staff.staffType);
    document.getElementById("role").value = safeText(staff.role || staff.systemRole || "");
    document.getElementById("department").value = safeText(staff.department);
    document.getElementById("qualification").value = safeText(staff.qualification);
    document.getElementById("employmentDate").value = safeText(staff.employmentDate);
    document.getElementById("employmentStatus").value = normalizeEmploymentStatus(staff.employmentStatus || staff.accountStatus || "Active");
    document.getElementById("loginEmail").value = safeText(staff.loginEmail || staff.email);
    document.getElementById("systemRole").value = mapSystemRoleLabel(staff.systemRole || "teacher");

    populatePhotoPreview(staff.photoUrl || "");
    updateHeaderInfo(staff);

    const profileLink = document.getElementById("profileLink");
    if (profileLink) {
        profileLink.href = `staff-profile.html?id=${encodeURIComponent(staff.id)}`;
    }

    const cancelButton = document.getElementById("cancelButton");
    if (cancelButton) {
        cancelButton.href = `staff-profile.html?id=${encodeURIComponent(staff.id)}`;
    }

    const pageSubtitle = document.getElementById("pageSubtitle");
    if (pageSubtitle) {
        pageSubtitle.textContent = `Update ${safeText(staff.fullName || [staff.firstName, staff.lastName].filter(Boolean).join(" "), "staff member")} details.`;
    }
}

function showNotFound(message) {
    const form = document.getElementById("staffForm");
    const notFoundState = document.getElementById("notFoundState");
    const notFoundMessage = document.getElementById("notFoundMessage");

    if (form) {
        form.style.display = "none";
    }

    if (notFoundState) {
        notFoundState.style.display = "flex";
    }

    if (notFoundMessage) {
        notFoundMessage.textContent = message;
    }
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
        if (!input || !input.value.trim()) {
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

    const phone = document.getElementById("phone");
    if (phone && phone.value.trim() && phone.value.length < 10) {
        setError("phone", "Enter a valid phone number.");
        valid = false;
    }

    return valid;
}

function buildEditablePayload() {
    const employmentStatus = getFieldValue("employmentStatus") || "Active";
    const systemRole = normalizeSystemRole(getFieldValue("systemRole") || getFieldValue("role"));

    return {
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
        systemRole,
        department: getFieldValue("department"),
        qualification: getFieldValue("qualification"),
        employmentDate: getFieldValue("employmentDate"),
        employmentStatus,
        loginEmail: getFieldValue("loginEmail") || getFieldValue("email"),
        accountStatus: normalizeAccountStatus(employmentStatus),
        photoUrl: currentStaff?.photoUrl || ""
    };
}

function setSavingState(isSaving) {
    const saveButton = document.querySelector(".save-button");

    if (!saveButton) {
        return;
    }

    saveButton.disabled = isSaving;

    if (isSaving) {
        saveButton.dataset.originalText = saveButton.dataset.originalText || saveButton.innerHTML;
        saveButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving changes...';
        return;
    }

    saveButton.innerHTML = saveButton.dataset.originalText || '<i class="fa-solid fa-check"></i> Save Changes';
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
    showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 3600);
}

async function initializePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const staffId = urlParams.get("id")?.trim();

    if (!staffId) {
        showNotFound("No staff ID provided. Please select a staff member to edit.");
        return;
    }

    try {
        const session = await requireAuthenticatedSession();
        verifiedSchoolId = session.schoolProfile.id;
        authenticatedUser = auth.currentUser;

        if (!authenticatedUser?.uid) {
            throw new Error("Authenticated user UID is unavailable.");
        }

        const staff = await getStaffById(verifiedSchoolId, staffId);

        if (!staff) {
            showNotFound("Staff member not found.");
            return;
        }

        currentStaff = staff;
        populateForm(staff);
    } catch (error) {
        console.error("Failed to load staff record for editing.", error);
        showNotFound("Staff member not found.");
        showToast("Unable to load staff profile. Please try again.", true);
    }
}

function attachFormEvents() {
    const form = document.getElementById("staffForm");
    const photoInput = document.getElementById("profilePhoto");
    const removePhotoBtn = document.getElementById("removePhotoBtn");
    const cancelButton = document.getElementById("cancelButton");
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".overlay");
    const keepEditingBtn = document.getElementById("keepEditingBtn");
    const leaveBtn = document.getElementById("leaveBtn");
    const saveModal = document.getElementById("saveModal");
    const viewProfileButton = document.getElementById("viewProfileButton");

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
            populatePhotoPreview(String(reader.result));
            hasUnsavedChanges = true;
        });
        reader.readAsDataURL(file);
    });

    removePhotoBtn?.addEventListener("click", () => {
        photoInput.value = "";
        populatePhotoPreview("");
        hasUnsavedChanges = true;
    });

    cancelButton?.addEventListener("click", (event) => {
        event.preventDefault();
        if (hasUnsavedChanges) {
            document.getElementById("unsavedModal")?.classList.add("show");
            return;
        }

        const staffId = new URLSearchParams(window.location.search).get("id");
        window.location.href = `staff-profile.html?id=${encodeURIComponent(staffId || "")}`;
    });

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!currentStaff || !currentStaff.id) {
            showToast("Staff member not found.", true);
            return;
        }

        if (!validateForm()) {
            showToast("Please review the highlighted required fields.", true);
            form.querySelector(".field.invalid input, .field.invalid select")?.focus();
            return;
        }

        if (isSubmitting) {
            return;
        }

        isSubmitting = true;
        setSavingState(true);

        try {
            const staffId = currentStaff.id;
            const updateData = buildEditablePayload();
            await updateStaff(verifiedSchoolId, staffId, updateData, authenticatedUser.uid);

            hasUnsavedChanges = false;
            showToast("Staff information updated successfully.");

            if (saveModal && viewProfileButton) {
                viewProfileButton.href = `staff-profile.html?id=${encodeURIComponent(staffId)}`;
                saveModal.classList.add("show");
            }
        } catch (error) {
            console.error("Failed to update staff record.", error);
            const message = error?.message?.includes("already in use")
                ? "Staff number is already in use. Please enter another staff number."
                : "Unable to update staff. Please try again.";
            showToast(message, true);
        } finally {
            isSubmitting = false;
            setSavingState(false);
        }
    });

    form?.querySelectorAll("input, select, textarea").forEach((input) => {
        if (input.id === "staffId" || input.id === "profilePhoto") {
            return;
        }

        input.addEventListener("input", () => {
            hasUnsavedChanges = true;
            if (input.value.trim()) {
                clearError(input.id);
            }
        });

        input.addEventListener("change", () => {
            hasUnsavedChanges = true;
            if (input.value.trim()) {
                clearError(input.id);
            }
        });
    });

    keepEditingBtn?.addEventListener("click", () => {
        document.getElementById("unsavedModal")?.classList.remove("show");
    });

    leaveBtn?.addEventListener("click", () => {
        document.getElementById("unsavedModal")?.classList.remove("show");
        const staffId = new URLSearchParams(window.location.search).get("id");
        window.location.href = `staff-profile.html?id=${encodeURIComponent(staffId || "")}`;
    });

    viewProfileButton?.addEventListener("click", (event) => {
        event.preventDefault();
        const staffId = new URLSearchParams(window.location.search).get("id");
        window.location.href = `staff-profile.html?id=${encodeURIComponent(staffId || "")}`;
    });

    menuToggle?.addEventListener("click", () => {
        sidebar?.classList.toggle("show");
        overlay?.classList.toggle("active");
    });

    overlay?.addEventListener("click", () => {
        sidebar?.classList.remove("show");
        overlay?.classList.remove("active");
    });

    document.getElementById("unsavedOverlay")?.addEventListener("click", () => {
        document.getElementById("unsavedModal")?.classList.remove("show");
    });

    document.getElementById("modalOverlay")?.addEventListener("click", () => {
        document.getElementById("saveModal")?.classList.remove("show");
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            document.getElementById("saveModal")?.classList.remove("show");
            document.getElementById("unsavedModal")?.classList.remove("show");
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    attachFormEvents();
    await initializePage();
});
