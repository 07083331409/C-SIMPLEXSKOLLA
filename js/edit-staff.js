/*=========================================
SIMPLEXSKOLLA
Edit Staff Page - JavaScript
=========================================*/

// Mock staff data for UI demonstration
// In production, this will be replaced with Firestore data
const STAFF_DATABASE = [
    {
        id: "STF-2026-001",
        firstName: "Chinedu",
        middleName: "Emeka",
        lastName: "Okafor",
        gender: "Male",
        dateOfBirth: "1990-08-23",
        maritalStatus: "Married",
        nationality: "Nigerian",
        phone: "+2348034567890",
        email: "chinedu.okafor@simplexskolla.edu",
        address: "12 Unity Crescent, GRA, Enugu",
        state: "Enugu",
        lga: "Enugu North",
        emergencyContact: "Amaka Okafor · +2348051234567",
        staffId: "STF-2026-001",
        staffType: "Teaching Staff",
        role: "Mathematics Teacher",
        department: "Academic",
        qualification: "B.Sc. Mathematics Education",
        employmentDate: "2022-01-15",
        employmentStatus: "Active",
        loginEmail: "chinedu.okafor@simplexskolla.edu",
        systemRole: "Teacher",
        photo: null
    },
    {
        id: "STF-2026-002",
        firstName: "Mary",
        middleName: "Adeola",
        lastName: "Johnson",
        gender: "Female",
        dateOfBirth: "1985-03-14",
        maritalStatus: "Married",
        nationality: "Nigerian",
        phone: "+2347012345678",
        email: "mary.johnson@simplexskolla.edu",
        address: "45 Ikoyi Drive, Lagos",
        state: "Lagos",
        lga: "Ikoyi",
        emergencyContact: "John Johnson · +2348023456789",
        staffId: "STF-2026-002",
        staffType: "Administrative Staff",
        role: "Principal",
        department: "Administration",
        qualification: "M.Ed. Educational Administration",
        employmentDate: "2018-06-01",
        employmentStatus: "Active",
        loginEmail: "mary.johnson@simplexskolla.edu",
        systemRole: "Principal",
        photo: null
    },
    {
        id: "STF-2026-003",
        firstName: "David",
        middleName: "Chisom",
        lastName: "Okoro",
        gender: "Male",
        dateOfBirth: "1988-05-20",
        maritalStatus: "Single",
        nationality: "Nigerian",
        phone: "+2348156789012",
        email: "david.okoro@simplexskolla.edu",
        address: "78 Shomolu Road, Lagos",
        state: "Lagos",
        lga: "Somolu",
        emergencyContact: "Mrs. Grace Okoro · +2348167890123",
        staffId: "STF-2026-003",
        staffType: "Teaching Staff",
        role: "Science Teacher",
        department: "Science",
        qualification: "B.Sc. Physics Education",
        employmentDate: "2020-09-15",
        employmentStatus: "Active",
        loginEmail: "david.okoro@simplexskolla.edu",
        systemRole: "Teacher",
        photo: null
    },
    {
        id: "STF-2026-004",
        firstName: "Amara",
        middleName: "Chioma",
        lastName: "Adeyemi",
        gender: "Female",
        dateOfBirth: "1992-11-08",
        maritalStatus: "Married",
        nationality: "Nigerian",
        phone: "+2347892345678",
        email: "amara.adeyemi@simplexskolla.edu",
        address: "23 Banana Island, Lagos",
        state: "Lagos",
        lga: "Ikoyi",
        emergencyContact: "Toyin Adeyemi · +2348903456789",
        staffId: "STF-2026-004",
        staffType: "Teaching Staff",
        role: "English Language Teacher",
        department: "Arts",
        qualification: "B.A. English Education",
        employmentDate: "2021-02-10",
        employmentStatus: "On Leave",
        loginEmail: "amara.adeyemi@simplexskolla.edu",
        systemRole: "Teacher",
        photo: null
    },
    {
        id: "STF-2026-005",
        firstName: "Emmanuel",
        middleName: "Obinna",
        lastName: "Okonkwo",
        gender: "Male",
        dateOfBirth: "1980-07-12",
        maritalStatus: "Married",
        nationality: "Nigerian",
        phone: "+2347654321098",
        email: "emmanuel.okonkwo@simplexskolla.edu",
        address: "156 Allen Avenue, Ikeja, Lagos",
        state: "Lagos",
        lga: "Ikeja",
        emergencyContact: "Nkechi Okonkwo · +2348054321098",
        staffId: "STF-2026-005",
        staffType: "Administrative Staff",
        role: "Bursar",
        department: "Administration",
        qualification: "B.Sc. Accounting",
        employmentDate: "2015-01-20",
        employmentStatus: "Active",
        loginEmail: "emmanuel.okonkwo@simplexskolla.edu",
        systemRole: "Bursar",
        photo: null
    },
    {
        id: "STF-2026-006",
        firstName: "Josephine",
        middleName: "Uche",
        lastName: "Eze",
        gender: "Female",
        dateOfBirth: "1987-04-30",
        maritalStatus: "Single",
        nationality: "Nigerian",
        phone: "+2348765432109",
        email: "josephine.eze@simplexskolla.edu",
        address: "34 Lekki Phase 1, Lagos",
        state: "Lagos",
        lga: "Lekki",
        emergencyContact: "Mrs. Priscilla Eze · +2348876543210",
        staffId: "STF-2026-006",
        staffType: "Support Staff",
        role: "Librarian",
        department: "Support Services",
        qualification: "B.Sc. Library Science",
        employmentDate: "2019-08-05",
        employmentStatus: "Inactive",
        loginEmail: "josephine.eze@simplexskolla.edu",
        systemRole: "Librarian",
        photo: null
    }
];

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("staffForm");
    const notFoundState = document.getElementById("notFoundState");
    const editContent = document.getElementById("editContent");
    const photoInput = document.getElementById("profilePhoto");
    const photoPreview = document.getElementById("photoPreview");
    const removePhotoBtn = document.getElementById("removePhotoBtn");
    const cancelButton = document.getElementById("cancelButton");
    const saveModal = document.getElementById("saveModal");
    const modalOverlay = document.getElementById("modalOverlay");
    const viewProfileButton = document.getElementById("viewProfileButton");
    const unsavedModal = document.getElementById("unsavedModal");
    const keepEditingBtn = document.getElementById("keepEditingBtn");
    const leaveBtn = document.getElementById("leaveBtn");
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".overlay");
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");

    let currentStaff = null;
    let hasUnsavedChanges = false;
    let pendingNavigation = null;

    // Initialize
    initializePage();

    function initializePage() {
        const urlParams = new URLSearchParams(window.location.search);
        const staffId = urlParams.get("id");

        if (!staffId) {
            showNotFound("No staff ID provided. Please select a staff member to edit.");
            return;
        }

        currentStaff = findStaffById(staffId);

        if (!currentStaff) {
            showNotFound(`Staff member with ID ${staffId} not found.`);
            return;
        }

        loadStaffData();
        setupEventListeners();
    }

    function findStaffById(id) {
        return STAFF_DATABASE.find(staff => staff.id === id);
    }

    function showNotFound(message) {
        notFoundState.style.display = "flex";
        form.style.display = "none";
        document.getElementById("notFoundMessage").textContent = message;
    }

    function loadStaffData() {
        form.style.display = "block";
        notFoundState.style.display = "none";

        document.getElementById("firstName").value = currentStaff.firstName || "";
        document.getElementById("middleName").value = currentStaff.middleName || "";
        document.getElementById("lastName").value = currentStaff.lastName || "";
        document.getElementById("gender").value = currentStaff.gender || "";
        document.getElementById("dateOfBirth").value = currentStaff.dateOfBirth || "";
        document.getElementById("maritalStatus").value = currentStaff.maritalStatus || "";
        document.getElementById("nationality").value = currentStaff.nationality || "";
        document.getElementById("phone").value = currentStaff.phone || "";
        document.getElementById("email").value = currentStaff.email || "";
        document.getElementById("address").value = currentStaff.address || "";
        document.getElementById("state").value = currentStaff.state || "";
        document.getElementById("lga").value = currentStaff.lga || "";
        document.getElementById("emergencyContact").value = currentStaff.emergencyContact || "";
        document.getElementById("staffId").value = currentStaff.staffId || "";
        document.getElementById("staffType").value = currentStaff.staffType || "";
        document.getElementById("role").value = currentStaff.role || "";
        document.getElementById("department").value = currentStaff.department || "";
        document.getElementById("qualification").value = currentStaff.qualification || "";
        document.getElementById("employmentDate").value = currentStaff.employmentDate || "";
        document.getElementById("employmentStatus").value = currentStaff.employmentStatus || "";
        document.getElementById("loginEmail").value = currentStaff.loginEmail || "";
        document.getElementById("systemRole").value = currentStaff.systemRole || "";

        // Update header info
        updateHeaderInfo();
        updateProfileLink();
    }

    function updateHeaderInfo() {
        if (currentStaff) {
            document.getElementById("headerActions").style.display = "block";
            document.getElementById("headerStaffId").textContent = currentStaff.staffId;
            document.getElementById("headerName").textContent = `${currentStaff.firstName} ${currentStaff.lastName}`;
            
            const statusBadge = document.getElementById("headerStatus");
            statusBadge.textContent = currentStaff.employmentStatus;
            statusBadge.className = "info-value status-badge";
            statusBadge.classList.add(currentStaff.employmentStatus.toLowerCase().replace(" ", "-"));
        }
    }

    function updateProfileLink() {
        if (currentStaff) {
            const profileLink = document.getElementById("profileLink");
            profileLink.href = `staff-profile.html?id=${currentStaff.id}`;
        }
    }

    function setupEventListeners() {
        photoInput?.addEventListener("change", handlePhotoChange);
        removePhotoBtn?.addEventListener("click", handleRemovePhoto);
        form?.addEventListener("submit", handleFormSubmit);
        cancelButton?.addEventListener("click", handleCancel);
        viewProfileButton?.addEventListener("click", handleViewProfile);
        keepEditingBtn?.addEventListener("click", handleKeepEditing);
        leaveBtn?.addEventListener("click", handleLeaveWithoutSaving);

        // Track unsaved changes
        form?.querySelectorAll("input, select, textarea").forEach(field => {
            if (field.id !== "staffId" && field.id !== "profilePhoto") {
                field.addEventListener("change", () => {
                    hasUnsavedChanges = true;
                });
            }
        });

        photoInput?.addEventListener("change", () => {
            hasUnsavedChanges = true;
        });
    }

    function handlePhotoChange() {
        const file = photoInput.files?.[0];
        clearError("profilePhoto");

        if (!file) return;

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
            removePhotoBtn.disabled = false;
        });
        reader.readAsDataURL(file);
    }

    function handleRemovePhoto() {
        photoInput.value = "";
        photoPreview.innerHTML = '<i class="fa-solid fa-user"></i>';
        removePhotoBtn.disabled = true;
        clearError("profilePhoto");
        hasUnsavedChanges = true;
    }

    function handleCancel() {
        if (hasUnsavedChanges) {
            showUnsavedChangesModal();
        } else {
            navigateToProfile();
        }
    }

    function handleFormSubmit(event) {
        event.preventDefault();

        if (!validateForm()) {
            showToast("Please review the highlighted required fields.", true);
            form.querySelector(".field.invalid input, .field.invalid select")?.focus();
            return;
        }

        simulateSave();
    }

    async function simulateSave() {
        const buttons = form.querySelectorAll("button[type='submit'], .cancel-button");
        buttons.forEach((button) => { 
            if (button.type === "submit") button.disabled = true;
        });

        // Simulate loading delay
        await new Promise((resolve) => window.setTimeout(resolve, 750));

        buttons.forEach((button) => { 
            if (button.type === "submit") button.disabled = false;
        });

        // Show success modal
        showSuccessModal();
        hasUnsavedChanges = false;
    }

    function showSuccessModal() {
        saveModal.classList.add("show");
    }

    function handleViewProfile() {
        saveModal.classList.remove("show");
        if (currentStaff) {
            window.location.href = `staff-profile.html?id=${currentStaff.id}`;
        }
    }

    function handleKeepEditing() {
        unsavedModal.classList.remove("show");
    }

    function handleLeaveWithoutSaving() {
        unsavedModal.classList.remove("show");
        if (pendingNavigation) {
            window.location.href = pendingNavigation;
        } else {
            navigateToProfile();
        }
    }

    function navigateToProfile() {
        if (currentStaff) {
            window.location.href = `staff-profile.html?id=${currentStaff.id}`;
        } else {
            window.location.href = "staff-list.html";
        }
    }

    function showUnsavedChangesModal() {
        unsavedModal.classList.add("show");
    }

    function validateForm() {
        const requiredFields = ["firstName", "lastName", "gender", "phone", "email", "staffType", "role", "department", "employmentDate", "employmentStatus"];
        let valid = true;

        requiredFields.forEach((id) => {
            const input = document.getElementById(id);
            if (!input.value.trim()) {
                setError(id, "This field is required.");
                valid = false;
            } else {
                clearError(id);
            }
        });

        const email = document.getElementById("email");
        if (email.value.trim() && !email.validity.valid) {
            setError("email", "Enter a valid email address.");
            valid = false;
        }

        const loginEmail = document.getElementById("loginEmail");
        if (loginEmail.value.trim() && !loginEmail.validity.valid) {
            setError("loginEmail", "Enter a valid email address.");
            valid = false;
        }

        const phone = document.getElementById("phone");
        if (phone.value.trim() && phone.value.length < 10) {
            setError("phone", "Enter a valid phone number.");
            valid = false;
        }

        return valid;
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

    function showToast(message, isError = false) {
        toastMessage.textContent = message;
        toast.classList.add("show");
        if (isError) toast.classList.add("error");
        else toast.classList.remove("error");

        window.clearTimeout(showToast.timeout);
        showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 3600);
    }

    // Mobile menu toggle
    menuToggle?.addEventListener("click", () => {
        sidebar?.classList.toggle("show");
        overlay?.classList.toggle("active");
    });

    overlay?.addEventListener("click", () => {
        sidebar?.classList.remove("show");
        overlay.classList.remove("active");
    });

    // Modal close on overlay click
    modalOverlay?.addEventListener("click", () => {
        saveModal.classList.remove("show");
    });

    document.getElementById("unsavedOverlay")?.addEventListener("click", () => {
        unsavedModal.classList.remove("show");
    });

    // Close modals on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            saveModal.classList.remove("show");
        }
    });
});
