document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".overlay");
    const editButton = document.getElementById("editStaff");
    const editStaffNav = document.getElementById("editStaffNav");
    const printButton = document.getElementById("printProfile");
    const moreButton = document.getElementById("moreActions");
    const actionMenu = document.getElementById("actionMenu");
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");

    // Get staff ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const staffId = urlParams.get("id") || "STF-2026-001";
    const mockStaff = {
        "STF-2026-001": {
            name: "Chinedu Okafor", firstName: "Chinedu", middleName: "Emeka", lastName: "Okafor",
            gender: "Male", dateOfBirth: "23 August 1990", maritalStatus: "Married", nationality: "Nigerian",
            phone: "+234 803 456 7890", email: "chinedu.okafor@simplexskolla.edu", address: "12 Unity Crescent, GRA, Enugu",
            state: "Enugu", lga: "Enugu North", emergencyContact: "Amaka Okafor · +234 805 123 4567",
            staffType: "Teaching Staff", role: "Mathematics Teacher", department: "Academic", qualification: "B.Sc. Mathematics Education",
            employmentDate: "15 January 2022", employmentStatus: "Active", systemRole: "Teacher", accountStatus: "Active"
        },
        "STF-2026-002": {
            name: "Mary Johnson", firstName: "Mary", middleName: "Adeola", lastName: "Johnson",
            gender: "Female", dateOfBirth: "14 March 1985", maritalStatus: "Married", nationality: "Nigerian",
            phone: "+234 701 234 5678", email: "mary.johnson@simplexskolla.edu", address: "45 Ikoyi Drive, Lagos",
            state: "Lagos", lga: "Ikoyi", emergencyContact: "John Johnson · +234 802 345 6789",
            staffType: "Administrative Staff", role: "Principal", department: "Administration", qualification: "M.Ed. Educational Administration",
            employmentDate: "01 June 2018", employmentStatus: "Active", systemRole: "Principal", accountStatus: "Active"
        }
    };
    const currentStaff = mockStaff[staffId] || mockStaff["STF-2026-001"];

    document.querySelector(".hero-identity h1")?.replaceChildren(currentStaff.name);
    const heroRole = document.querySelector(".hero-role");
    if (heroRole) heroRole.textContent = `${currentStaff.role} • ${currentStaff.department} Department`;
    const heroMeta = document.querySelectorAll(".hero-meta span");
    if (heroMeta[0]) heroMeta[0].innerHTML = `<i class="fa-regular fa-id-badge"></i> ${staffId}`;
    if (heroMeta[1]) heroMeta[1].innerHTML = `<i class="fa-solid fa-circle-check"></i> ${currentStaff.employmentStatus}`;
    if (heroMeta[2]) heroMeta[2].innerHTML = `<i class="fa-solid fa-graduation-cap"></i> ${currentStaff.staffType}`;

    const detailValues = {
        "Staff ID": staffId, "Staff Type": currentStaff.staffType, "Role": currentStaff.role,
        "Position / Role": currentStaff.role, Department: currentStaff.department, "Employment Status": currentStaff.employmentStatus,
        "Employment Date": currentStaff.employmentDate, Qualification: currentStaff.qualification, "System Role": currentStaff.systemRole,
        "First Name": currentStaff.firstName, "Middle Name": currentStaff.middleName, "Last Name": currentStaff.lastName,
        Gender: currentStaff.gender, "Date of Birth": currentStaff.dateOfBirth, "Marital Status": currentStaff.maritalStatus,
        Nationality: currentStaff.nationality, "Phone Number": currentStaff.phone, "Email Address": currentStaff.email,
        "Residential Address": currentStaff.address, State: currentStaff.state, "Local Government Area": currentStaff.lga,
        "Emergency Contact": currentStaff.emergencyContact, "Login Email": currentStaff.email, "Account Status": currentStaff.accountStatus,
        "Highest Qualification": currentStaff.qualification
    };
    document.querySelectorAll(".detail-list > div").forEach((row) => {
        const label = row.querySelector("span")?.textContent.trim();
        const value = detailValues[label];
        if (value !== undefined) {
            const target = row.querySelector("strong");
            if (target) target.textContent = value;
        }
    });

    // Update Edit Staff navigation link
    if (editStaffNav) {
        editStaffNav.href = `edit-staff.html?id=${staffId}`;
    }

    menuToggle?.addEventListener("click", () => {
        sidebar?.classList.toggle("show");
        overlay?.classList.toggle("active");
    });
    overlay?.addEventListener("click", () => {
        sidebar?.classList.remove("show");
        overlay.classList.remove("active");
    });

    editButton?.addEventListener("click", () => {
        window.location.href = `edit-staff.html?id=${staffId}`;
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
                deactivate: "Deactivate Staff is a mock action for now.",
                activity: "Showing sample activity for this profile."
            };
            actionMenu.classList.remove("show");
            moreButton?.setAttribute("aria-expanded", "false");
            showToast(messages[button.dataset.action] || "This mock action is coming soon.");
        });
    });
    document.addEventListener("click", (event) => {
        if (actionMenu?.classList.contains("show") && !event.target.closest(".action-menu-wrap")) {
            actionMenu.classList.remove("show");
            moreButton?.setAttribute("aria-expanded", "false");
        }
    });

    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.add("show");
        window.clearTimeout(showToast.timeout);
        showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 3600);
    }
});
