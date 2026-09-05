/*=========================================
SIMPLEXSKOLLA
Staff Management Module - JavaScript
=========================================*/

// Sample staff data for UI demonstration
// In production, this will be replaced with Firestore data
const SAMPLE_STAFF_DATA = [
    {
        id: "STF-2026-001",
        name: "Dr. Mary Johnson",
        role: "Principal",
        department: "Administration",
        phone: "+234 701 234 5678",
        email: "mary.johnson@simplexskolla.edu",
        status: "active",
        avatar: "https://via.placeholder.com/48?text=MJ"
    },
    {
        id: "SK-T-002",
        name: "Prof. David Smith",
        role: "Teacher",
        department: "Science",
        phone: "+234 702 345 6789",
        email: "david.smith@simplexskolla.edu",
        status: "active",
        avatar: "https://via.placeholder.com/48?text=DS"
    },
    {
        id: "SK-T-003",
        name: "Mrs. Amara Okonkwo",
        role: "Teacher",
        department: "Arts",
        phone: "+234 703 456 7890",
        email: "amara.okonkwo@simplexskolla.edu",
        status: "active",
        avatar: "https://via.placeholder.com/48?text=AO"
    },
    {
        id: "SK-T-004",
        name: "Mr. James Adeyemi",
        role: "Vice Principal",
        department: "Administration",
        phone: "+234 704 567 8901",
        email: "james.adeyemi@simplexskolla.edu",
        status: "active",
        avatar: "https://via.placeholder.com/48?text=JA"
    },
    {
        id: "SK-T-005",
        name: "Miss Rebecca Mensah",
        role: "Teacher",
        department: "Commercial",
        phone: "+234 705 678 9012",
        email: "rebecca.mensah@simplexskolla.edu",
        status: "active",
        avatar: "https://via.placeholder.com/48?text=RM"
    },
    {
        id: "SK-T-006",
        name: "Mr. Emmanuel Obiang",
        role: "Bursar",
        department: "Administration",
        phone: "+234 706 789 0123",
        email: "emmanuel.obiang@simplexskolla.edu",
        status: "active",
        avatar: "https://via.placeholder.com/48?text=EO"
    },
    {
        id: "SK-T-007",
        name: "Mrs. Josephine Eze",
        role: "Teacher",
        department: "Science",
        phone: "+234 707 890 1234",
        email: "josephine.eze@simplexskolla.edu",
        status: "on-leave",
        avatar: "https://via.placeholder.com/48?text=JE"
    },
    {
        id: "SK-T-008",
        name: "Mr. Peter Okoro",
        role: "Administrator",
        department: "Administration",
        phone: "+234 708 901 2345",
        email: "peter.okoro@simplexskolla.edu",
        status: "active",
        avatar: "https://via.placeholder.com/48?text=PO"
    },
    {
        id: "SK-T-009",
        name: "Dr. Blessing Chioma",
        role: "Teacher",
        department: "Arts",
        phone: "+234 709 012 3456",
        email: "blessing.chioma@simplexskolla.edu",
        status: "active",
        avatar: "https://via.placeholder.com/48?text=BC"
    },
    {
        id: "SK-T-010",
        name: "Miss Fatima Hussain",
        role: "Teacher",
        department: "Commercial",
        phone: "+234 710 123 4567",
        email: "fatima.hussain@simplexskolla.edu",
        status: "active",
        avatar: "https://via.placeholder.com/48?text=FH"
    },
    {
        id: "SK-T-011",
        name: "Mr. Michael Oladele",
        role: "Support Staff",
        department: "Administration",
        phone: "+234 711 234 5678",
        email: "michael.oladele@simplexskolla.edu",
        status: "active",
        avatar: "https://via.placeholder.com/48?text=MO"
    },
    {
        id: "SK-T-012",
        name: "Mrs. Ngozi Adeyemi",
        role: "Teacher",
        department: "Science",
        phone: "+234 712 345 6789",
        email: "ngozi.adeyemi@simplexskolla.edu",
        status: "active",
        avatar: "https://via.placeholder.com/48?text=NA"
    },
    {
        id: "SK-T-013",
        name: "Mr. Hakeem Ibrahim",
        role: "Teacher",
        department: "Arts",
        phone: "+234 713 456 7890",
        email: "hakeem.ibrahim@simplexskolla.edu",
        status: "inactive",
        avatar: "https://via.placeholder.com/48?text=HI"
    },
    {
        id: "SK-T-014",
        name: "Miss Zainab Akinwande",
        role: "Teacher",
        department: "Commercial",
        phone: "+234 714 567 8901",
        email: "zainab.akinwande@simplexskolla.edu",
        status: "active",
        avatar: "https://via.placeholder.com/48?text=ZA"
    },
    {
        id: "SK-T-015",
        name: "Dr. Kwame Mensah",
        role: "Administrator",
        department: "Administration",
        phone: "+234 715 678 9012",
        email: "kwame.mensah@simplexskolla.edu",
        status: "active",
        avatar: "https://via.placeholder.com/48?text=KM"
    },
    {
        id: "SK-T-016",
        name: "Mrs. Stella Okafor",
        role: "Teacher",
        department: "Science",
        phone: "+234 716 789 0123",
        email: "stella.okafor@simplexskolla.edu",
        status: "active",
        avatar: "https://via.placeholder.com/48?text=SO"
    },
    {
        id: "SK-T-017",
        name: "Mr. Kofi Appiah",
        role: "Support Staff",
        department: "Administration",
        phone: "+234 717 890 1234",
        email: "kofi.appiah@simplexskolla.edu",
        status: "active",
        avatar: "https://via.placeholder.com/48?text=KA"
    },
    {
        id: "SK-T-018",
        name: "Miss Ama Boateng",
        role: "Teacher",
        department: "Arts",
        phone: "+234 718 901 2345",
        email: "ama.boateng@simplexskolla.edu",
        status: "active",
        avatar: "https://via.placeholder.com/48?text=AB"
    },
    {
        id: "SK-T-019",
        name: "Mr. Nonso Ezeoke",
        role: "Teacher",
        department: "Science",
        phone: "+234 719 012 3456",
        email: "nonso.ezeoke@simplexskolla.edu",
        status: "on-leave",
        avatar: "https://via.placeholder.com/48?text=NE"
    },
    {
        id: "SK-T-020",
        name: "Mrs. Aisha Mohammed",
        role: "Teacher",
        department: "Commercial",
        phone: "+234 720 123 4567",
        email: "aisha.mohammed@simplexskolla.edu",
        status: "active",
        avatar: "https://via.placeholder.com/48?text=AM"
    }
];

// Pagination variables
let currentPage = 1;
const itemsPerPage = 10;
let filteredStaffData = [...SAMPLE_STAFF_DATA];

document.addEventListener("DOMContentLoaded", () => {
    // Initialize page
    renderStaffTable();
    setupEventListeners();
    
    // Mobile menu toggle
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".overlay");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("show");
            if (overlay) {
                overlay.classList.toggle("active");
            }
        });
    }

    if (overlay) {
        overlay.addEventListener("click", () => {
            if (sidebar) {
                sidebar.classList.remove("show");
            }
            overlay.classList.remove("active");
        });
    }
});

/**
 * Setup event listeners for filters and search
 */
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("staffSearch");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterStaffData(searchTerm, null, null, null);
        });
    }

    // Role filter
    const roleFilter = document.getElementById("roleFilter");
    if (roleFilter) {
        roleFilter.addEventListener("change", (e) => {
            const searchTerm = document.getElementById("staffSearch")?.value.toLowerCase() || "";
            filterStaffData(
                searchTerm,
                e.target.value,
                document.getElementById("departmentFilter")?.value || "",
                document.getElementById("statusFilter")?.value || ""
            );
        });
    }

    // Department filter
    const departmentFilter = document.getElementById("departmentFilter");
    if (departmentFilter) {
        departmentFilter.addEventListener("change", (e) => {
            const searchTerm = document.getElementById("staffSearch")?.value.toLowerCase() || "";
            filterStaffData(
                searchTerm,
                document.getElementById("roleFilter")?.value || "",
                e.target.value,
                document.getElementById("statusFilter")?.value || ""
            );
        });
    }

    // Status filter
    const statusFilter = document.getElementById("statusFilter");
    if (statusFilter) {
        statusFilter.addEventListener("change", (e) => {
            const searchTerm = document.getElementById("staffSearch")?.value.toLowerCase() || "";
            filterStaffData(
                searchTerm,
                document.getElementById("roleFilter")?.value || "",
                document.getElementById("departmentFilter")?.value || "",
                e.target.value
            );
        });
    }

    // Add Staff button
    const addStaffBtn = document.querySelector(".add-staff-btn");
    if (addStaffBtn) {
        addStaffBtn.addEventListener("click", () => {
            console.log("Add Staff button clicked - Modal will be implemented with Firebase");
            // Future: Open modal for adding staff
        });
    }

    // Export button
    const exportBtn = document.querySelector(".secondary-btn");
    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            console.log("Export button clicked - Export functionality will be implemented");
            // Future: Export staff data to CSV or PDF
        });
    }

    // Logout button
    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            console.log("Logout clicked - Auth logout will be implemented");
            // Future: Implement logout functionality
        });
    }
}

/**
 * Filter staff data based on search term and filter criteria
 */
function filterStaffData(searchTerm = "", roleFilter = "", departmentFilter = "", statusFilter = "") {
    filteredStaffData = SAMPLE_STAFF_DATA.filter((staff) => {
        // Search term check (searches name, id, and email)
        const matchesSearch = !searchTerm ||
            staff.name.toLowerCase().includes(searchTerm) ||
            staff.id.toLowerCase().includes(searchTerm) ||
            staff.email.toLowerCase().includes(searchTerm);

        // Role filter check
        const matchesRole = !roleFilter || staff.role.toLowerCase() === roleFilter.toLowerCase();

        // Department filter check
        const matchesDepartment = !departmentFilter || 
            staff.department.toLowerCase() === departmentFilter.toLowerCase();

        // Status filter check
        const matchesStatus = !statusFilter || staff.status === statusFilter;

        return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
    });

    // Reset to page 1 when filtering
    currentPage = 1;
    renderStaffTable();
}

/**
 * Render the staff table with pagination
 */
function renderStaffTable() {
    const tableBody = document.getElementById("staffTableBody");
    const emptyState = document.getElementById("emptyState");

    if (!tableBody) return;

    // Check if there's data
    if (filteredStaffData.length === 0) {
        tableBody.parentElement.style.display = "none";
        if (emptyState) {
            emptyState.style.display = "flex";
        }
        updatePagination();
        return;
    }

    // Show table, hide empty state
    tableBody.parentElement.style.display = "block";
    if (emptyState) {
        emptyState.style.display = "none";
    }

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredStaffData.slice(startIndex, endIndex);

    // Clear table
    tableBody.innerHTML = "";

    // Render rows
    paginatedData.forEach((staff) => {
        const row = createStaffRow(staff);
        tableBody.appendChild(row);
    });

    // Update pagination
    updatePagination();
}

/**
 * Create a staff table row element
 */
function createStaffRow(staff) {
    const row = document.createElement("tr");

    // Status badge color
    const statusColor = {
        "active": "active",
        "on-leave": "on-leave",
        "inactive": "inactive"
    };

    // Status icon
    const statusIcons = {
        "active": "fa-circle-check",
        "on-leave": "fa-hourglass-end",
        "inactive": "fa-circle-xmark"
    };

    // Format status text
    const statusText = staff.status.charAt(0).toUpperCase() + staff.status.slice(1);

    row.innerHTML = `
        <td>
            <div class="staff-member">
                <img src="${staff.avatar}" alt="${staff.name}" class="staff-avatar">
                <div class="staff-info">
                    <span class="staff-name">${staff.name}</span>
                    <span class="staff-title">${staff.role}</span>
                </div>
            </div>
        </td>
        <td><strong>${staff.id}</strong></td>
        <td>${staff.role}</td>
        <td>${staff.department}</td>
        <td>${staff.phone}</td>
        <td>${staff.email}</td>
        <td>
            <span class="status-badge ${statusColor[staff.status]}">
                <i class="fa-solid ${statusIcons[staff.status]}"></i>
                ${statusText}
            </span>
        </td>
        <td>
            <div class="staff-actions">
                <button class="action-btn view" title="View" onclick="viewStaffProfile('${staff.id}')">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <button class="action-btn edit" title="Edit" onclick="editStaff('${staff.id}')">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="action-btn more" title="More" onclick="showMoreOptions('${staff.id}')">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                </button>
            </div>
        </td>
    `;

    return row;
}

/**
 * Update pagination UI and info
 */
function updatePagination() {
    const totalPages = Math.ceil(filteredStaffData.length / itemsPerPage);
    const paginationNumbers = document.getElementById("paginationNumbers");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const paginationStart = document.getElementById("paginationStart");
    const paginationEnd = document.getElementById("paginationEnd");
    const paginationTotal = document.getElementById("paginationTotal");

    // Clear pagination numbers
    if (paginationNumbers) {
        paginationNumbers.innerHTML = "";

        // Generate page numbers
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement("button");
            btn.className = `page-number ${i === currentPage ? "active" : ""}`;
            btn.textContent = i;
            btn.addEventListener("click", () => {
                currentPage = i;
                renderStaffTable();
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
            paginationNumbers.appendChild(btn);
        }
    }

    // Update prev/next buttons
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderStaffTable();
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        });
    }

    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderStaffTable();
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        });
    }

    // Update pagination info
    if (paginationStart && paginationEnd && paginationTotal) {
        const startIndex = (currentPage - 1) * itemsPerPage + 1;
        const endIndex = Math.min(currentPage * itemsPerPage, filteredStaffData.length);
        
        paginationStart.textContent = startIndex;
        paginationEnd.textContent = endIndex;
        paginationTotal.textContent = filteredStaffData.length;
    }
}

/**
 * View staff profile (future Firebase integration)
 */
function viewStaffProfile(staffId) {
    window.location.href = `staff-profile.html?id=${encodeURIComponent(staffId)}`;
}

/**
 * Edit staff (future Firebase integration)
 */
function editStaff(staffId) {
    window.location.href = `edit-staff.html?id=${encodeURIComponent(staffId)}`;
}

/**
 * Show more options (future context menu)
 */
function showMoreOptions(staffId) {
    console.log("Show more options for:", staffId);
    // Future: Show context menu with delete, reassign, etc.
}
