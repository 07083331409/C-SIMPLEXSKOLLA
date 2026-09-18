import { auth } from "./firebase.js";
import { requireAuthenticatedSession } from "./auth-service.js";
import { archiveStaff, getStaffById } from "./staff-service.js";

const defaultAvatar = "images/dashboard.png";
let verifiedSchoolId = "";
let authenticatedUser = null;
let currentStaff = null;
let isArchiving = false;

function safeText(value, fallback = "Not provided") {
    if (value === undefined || value === null) {
        return fallback;
    }

    const normalized = String(value).trim();
    return normalized || fallback;
}

function setStatusNote(message, isError = false) {
    const note = document.getElementById("profileStatus");

    if (!note) {
        return;
    }

    note.classList.toggle("error-state", isError);
    note.replaceChildren();

    const icon = document.createElement("i");
    icon.className = isError ? "fa-solid fa-triangle-exclamation" : "fa-solid fa-circle-info";

    const text = document.createElement("span");
    text.textContent = message;

    note.append(icon, text);
}

function setProfileImage(src) {
    const profileImage = document.querySelector(".hero-avatar");

    if (!profileImage) {
        return;
    }

    profileImage.src = src || defaultAvatar;
    profileImage.alt = "Staff profile photo";
    profileImage.onerror = () => {
        profileImage.src = defaultAvatar;
    };
}

function setMetaValue(selector, prefixClass, text) {
    const meta = document.querySelector(selector);

    if (!meta) {
        return;
    }

    meta.replaceChildren();

    const icon = document.createElement("i");
    icon.className = prefixClass;
    const value = document.createTextNode(` ${text}`);
    meta.append(icon, value);
}

function populateProfileFields(staff) {
    const fullName = safeText(staff.fullName || [staff.firstName, staff.middleName, staff.lastName].filter(Boolean).join(" "), "Staff member");
    const roleValue = safeText(staff.systemRole || staff.role, "Not provided");
    const departmentValue = safeText(staff.department, "Not provided");
    const staffTypeValue = safeText(staff.staffType, "Not provided");
    const employmentStatusValue = safeText(staff.employmentStatus || staff.accountStatus, "Not provided");
    const staffNumberValue = safeText(staff.staffNumber || staff.id, "Not provided");

    const heroName = document.querySelector(".hero-identity h1");
    if (heroName) {
        heroName.textContent = fullName;
    }

    const heroRole = document.querySelector(".hero-role");
    if (heroRole) {
        heroRole.textContent = `${roleValue} • ${departmentValue} Department`;
    }

    setMetaValue(".hero-meta span:nth-child(1)", "fa-regular fa-id-badge", staffNumberValue);
    setMetaValue(".hero-meta span:nth-child(2)", "fa-solid fa-circle-check", employmentStatusValue);
    setMetaValue(".hero-meta span:nth-child(3)", "fa-solid fa-graduation-cap", staffTypeValue);

    const fieldMap = new Map([
        ["Staff ID", staffNumberValue],
        ["Staff Type", staffTypeValue],
        ["Role", roleValue],
        ["Position / Role", roleValue],
        ["Department", departmentValue],
        ["Employment Status", employmentStatusValue],
        ["Employment Date", safeText(staff.employmentDate)],
        ["Qualification", safeText(staff.qualification)],
        ["System Role", safeText(staff.systemRole)],
        ["First Name", safeText(staff.firstName)],
        ["Middle Name", safeText(staff.middleName)],
        ["Last Name", safeText(staff.lastName)],
        ["Gender", safeText(staff.gender)],
        ["Date of Birth", safeText(staff.dateOfBirth)],
        ["Marital Status", safeText(staff.maritalStatus)],
        ["Nationality", safeText(staff.nationality)],
        ["Phone Number", safeText(staff.phone)],
        ["Email Address", safeText(staff.email)],
        ["Residential Address", safeText(staff.address)],
        ["State", safeText(staff.state)],
        ["Local Government Area", safeText(staff.lga)],
        ["Emergency Contact", safeText(staff.emergencyContact)],
        ["Login Email", safeText(staff.loginEmail || staff.email)],
        ["Account Status", safeText(staff.accountStatus)],
        ["Highest Qualification", safeText(staff.qualification)]
    ]);

    document.querySelectorAll(".detail-list > div").forEach((row) => {
        const label = row.querySelector("span")?.textContent.trim();
        const valueTarget = row.querySelector("strong");

        if (!label || !valueTarget) {
            return;
        }

        if (fieldMap.has(label)) {
            valueTarget.textContent = fieldMap.get(label);
        }
    });

    setProfileImage(staff.photoUrl || defaultAvatar);
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

function isArchivedStaff(staff) {
    return String(staff?.employmentStatus || "").trim().toLowerCase() === "archived" || Boolean(staff?.archivedAt);
}

function setArchiveActionState(button, isArchived, isProcessing = false) {
    if (!button) {
        return;
    }

    button.disabled = isArchived || isProcessing;
    button.innerHTML = isProcessing
        ? '<i class="fa-solid fa-spinner fa-spin"></i> Archiving Staff...'
        : isArchived
            ? '<i class="fa-solid fa-box-archive"></i> Already Archived'
            : '<i class="fa-solid fa-box-archive"></i> Archive Staff';
}

async function handleArchiveStaff(button) {
    if (!currentStaff?.id || isArchiving) {
        return;
    }

    if (isArchivedStaff(currentStaff)) {
        setArchiveActionState(button, true);
        showToast("This staff member is already archived.");
        return;
    }

    const confirmed = window.confirm("Are you sure you want to archive this staff member?");
    if (!confirmed) {
        return;
    }

    isArchiving = true;
    setArchiveActionState(button, false, true);

    try {
        const session = await requireAuthenticatedSession();
        verifiedSchoolId = session.schoolProfile.id;
        authenticatedUser = auth.currentUser;

        if (!authenticatedUser?.uid) {
            throw new Error("Authenticated user UID is unavailable.");
        }

        currentStaff = await archiveStaff(verifiedSchoolId, currentStaff.id, authenticatedUser.uid);
        setArchiveActionState(button, true);
        showToast("Staff member archived successfully.");
        setStatusNote("Staff member archived successfully.");

        window.setTimeout(() => {
            window.location.href = "staff-list.html";
        }, 900);
    } catch (error) {
        console.error("Failed to archive staff member.", error);
        isArchiving = false;
        setArchiveActionState(button, false);
        showToast("Unable to archive staff member. Please try again.", true);
    }
}

async function loadStaffProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const staffId = urlParams.get("id")?.trim();

    if (!staffId) {
        setStatusNote("Staff member not found.", true);
        showToast("Unable to load staff profile. Please try again.", true);
        return;
    }

    setStatusNote("Loading staff profile...");
    const editButton = document.getElementById("editStaff");
    const editStaffNav = document.getElementById("editStaffNav");

    if (editButton) {
        editButton.disabled = true;
    }

    if (editStaffNav) {
        editStaffNav.href = `edit-staff.html?id=${encodeURIComponent(staffId)}`;
    }

    try {
        const session = await requireAuthenticatedSession();
        verifiedSchoolId = session.schoolProfile.id;

        const staff = await getStaffById(verifiedSchoolId, staffId);

        if (!staff) {
            setStatusNote("Staff member not found.", true);
            showToast("Staff member not found.", true);
            return;
        }

        currentStaff = staff;
        populateProfileFields(staff);
        setStatusNote("Staff profile loaded.");

        const archiveButton = document.querySelector('[data-action="archive"]');
        setArchiveActionState(archiveButton, isArchivedStaff(staff));

        if (editButton) {
            editButton.disabled = false;
        }
    } catch (error) {
        console.error("Failed to load staff profile.", error);
        setStatusNote("Unable to load staff profile. Please try again.", true);
        showToast("Unable to load staff profile. Please try again.", true);

        if (editButton) {
            editButton.disabled = true;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".overlay");
    const editButton = document.getElementById("editStaff");
    const editStaffNav = document.getElementById("editStaffNav");
    const printButton = document.getElementById("printProfile");
    const moreButton = document.getElementById("moreActions");
    const actionMenu = document.getElementById("actionMenu");

    menuToggle?.addEventListener("click", () => {
        sidebar?.classList.toggle("show");
        overlay?.classList.toggle("active");
    });

    overlay?.addEventListener("click", () => {
        sidebar?.classList.remove("show");
        overlay?.classList.remove("active");
    });

    if (editStaffNav) {
        editStaffNav.href = `edit-staff.html?id=${encodeURIComponent(new URLSearchParams(window.location.search).get("id") || "")}`;
    }

    editButton?.addEventListener("click", () => {
        const staffId = new URLSearchParams(window.location.search).get("id");

        if (!staffId) {
            showToast("Unable to open the staff record.", true);
            return;
        }

        window.location.href = `edit-staff.html?id=${encodeURIComponent(staffId)}`;
    });

    printButton?.addEventListener("click", () => window.print());

    moreButton?.addEventListener("click", (event) => {
        event.stopPropagation();
        const isOpen = actionMenu?.classList.toggle("show");
        moreButton.setAttribute("aria-expanded", String(Boolean(isOpen)));
    });

    actionMenu?.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
            const messages = {
                download: "Profile download is available when staff records are connected.",
                activity: "Activity history is not available in this view."
            };
            actionMenu.classList.remove("show");
            moreButton?.setAttribute("aria-expanded", "false");

            if (button.dataset.action === "archive") {
                handleArchiveStaff(button);
                return;
            }

            showToast(messages[button.dataset.action] || "This action is not available yet.");
        });
    });

    document.addEventListener("click", (event) => {
        if (actionMenu?.classList.contains("show") && !event.target.closest(".action-menu-wrap")) {
            actionMenu.classList.remove("show");
            moreButton?.setAttribute("aria-expanded", "false");
        }
    });

    loadStaffProfile();
});
