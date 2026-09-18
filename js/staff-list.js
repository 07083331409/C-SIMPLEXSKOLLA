import { getStaffForCurrentSchool } from "./staff-service.js";
import { requireAuthenticatedSession } from "./auth-service.js";

const itemsPerPage = 10;
const studentImageFallback = "images/image (21) (2).jpg";
let loadedStaff = [];
let filteredStaff = [];
let currentPage = 1;

function safeText(value, fallback = "Not provided") {
    if (value === undefined || value === null) {
        return fallback;
    }

    const normalized = String(value).trim();
    return normalized || fallback;
}

function normalize(value) {
    return safeText(value, "").toLowerCase().replace(/[-_]/g, "");
}

function normalizeStatisticValue(value) {
    return safeText(value, "").toLowerCase().replace(/[\s_-]/g, "");
}

function renderStateRow(message) {
    const tableBody = document.getElementById("staffTableBody");

    if (!tableBody) {
        return;
    }

    tableBody.replaceChildren();

    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 8;
    cell.textContent = message;
    row.appendChild(cell);
    tableBody.appendChild(row);
}

function getStaffName(staff) {
    return safeText(
        staff.fullName || [staff.firstName, staff.middleName, staff.lastName].filter(Boolean).join(" "),
        "Staff member"
    );
}

function getStaffRole(staff) {
    return safeText(staff.systemRole || staff.role, "Not provided");
}

function getStaffStatus(staff) {
    return safeText(staff.employmentStatus || staff.accountStatus, "Not provided");
}

function createStaffRow(staff) {
    const row = document.createElement("tr");
    const name = getStaffName(staff);
    const role = getStaffRole(staff);
    const department = safeText(staff.department);
    const status = getStaffStatus(staff);
    const statusClass = normalize(status) || "inactive";

    const staffCell = document.createElement("td");
    const member = document.createElement("div");
    member.className = "staff-member";

    const image = document.createElement("img");
    image.className = "staff-avatar";
    image.src = staff.photoUrl || studentImageFallback;
    image.alt = `${name} profile`;

    const info = document.createElement("div");
    info.className = "staff-info";
    const nameElement = document.createElement("span");
    nameElement.className = "staff-name";
    nameElement.textContent = name;
    const roleElement = document.createElement("span");
    roleElement.className = "staff-title";
    roleElement.textContent = role;
    info.append(nameElement, roleElement);
    member.append(image, info);
    staffCell.appendChild(member);

    const idCell = document.createElement("td");
    idCell.textContent = safeText(staff.staffNumber);

    const roleCell = document.createElement("td");
    roleCell.textContent = role;

    const departmentCell = document.createElement("td");
    departmentCell.textContent = department;

    const phoneCell = document.createElement("td");
    phoneCell.textContent = safeText(staff.phone);

    const emailCell = document.createElement("td");
    emailCell.textContent = safeText(staff.email);

    const statusCell = document.createElement("td");
    const statusBadge = document.createElement("span");
    statusBadge.className = `status-badge ${statusClass}`;
    statusBadge.textContent = status;
    statusCell.appendChild(statusBadge);

    const actionsCell = document.createElement("td");
    const actions = document.createElement("div");
    actions.className = "staff-actions";

    const viewLink = document.createElement("a");
    viewLink.className = "action-btn view";
    viewLink.href = `staff-profile.html?id=${encodeURIComponent(staff.id)}`;
    viewLink.title = "View";
    viewLink.setAttribute("aria-label", "View staff profile");
    const viewIcon = document.createElement("i");
    viewIcon.className = "fa-solid fa-eye";
    viewLink.appendChild(viewIcon);

    const editLink = document.createElement("a");
    editLink.className = "action-btn edit";
    editLink.href = `edit-staff.html?id=${encodeURIComponent(staff.id)}`;
    editLink.title = "Edit";
    editLink.setAttribute("aria-label", "Edit staff");
    const editIcon = document.createElement("i");
    editIcon.className = "fa-solid fa-pen";
    editLink.appendChild(editIcon);

    const moreButton = document.createElement("button");
    moreButton.className = "action-btn more";
    moreButton.type = "button";
    moreButton.disabled = true;
    moreButton.title = "More actions are not available yet";
    moreButton.setAttribute("aria-label", "More actions are not available yet");
    const moreIcon = document.createElement("i");
    moreIcon.className = "fa-solid fa-ellipsis-vertical";
    moreButton.appendChild(moreIcon);

    actions.append(viewLink, editLink, moreButton);
    actionsCell.appendChild(actions);
    row.append(staffCell, idCell, roleCell, departmentCell, phoneCell, emailCell, statusCell, actionsCell);

    return row;
}

function updateStatistics(staff) {
    const totalStaff = document.getElementById("totalStaff");
    const teachingStaff = document.getElementById("teachingStaff");
    const administrativeStaff = document.getElementById("administrativeStaff");
    const onDutyToday = document.getElementById("onDutyToday");
    const activeStaff = staff.filter(item => {
        const employmentStatus = normalizeStatisticValue(item?.employmentStatus);
        const accountStatus = normalizeStatisticValue(item?.accountStatus);

        return employmentStatus !== "archived"
            && accountStatus !== "disabled"
            && !item?.archivedAt;
    });

    if (totalStaff) {
        totalStaff.textContent = String(activeStaff.length);
    }

    if (teachingStaff) {
        teachingStaff.textContent = String(activeStaff.filter(item => normalizeStatisticValue(item?.staffType) === "teachingstaff").length);
    }

    if (administrativeStaff) {
        administrativeStaff.textContent = String(activeStaff.filter(item => normalizeStatisticValue(item?.staffType) === "administrativestaff").length);
    }

    if (onDutyToday) {
        onDutyToday.textContent = String(activeStaff.filter(item => normalizeStatisticValue(item?.employmentStatus) === "active").length);
    }
}

function populateFilterOptions(staff) {
    const roleFilter = document.getElementById("roleFilter");
    const departmentFilter = document.getElementById("departmentFilter");
    const statusFilter = document.getElementById("statusFilter");

    const populate = (select, values, label) => {
        if (!select) {
            return;
        }

        select.replaceChildren(new Option(label, ""));
        [...new Set(values.filter(Boolean))]
            .sort((first, second) => String(first).localeCompare(String(second)))
            .forEach(value => select.add(new Option(value, value)));
    };

    populate(roleFilter, staff.map(getStaffRole), "All Roles");
    populate(departmentFilter, staff.map(item => item.department), "All Departments");
    populate(statusFilter, staff.map(getStaffStatus), "All Status");
}

function applyFilters() {
    const search = document.getElementById("staffSearch")?.value.trim().toLowerCase() || "";
    const role = normalize(document.getElementById("roleFilter")?.value);
    const department = normalize(document.getElementById("departmentFilter")?.value);
    const status = normalize(document.getElementById("statusFilter")?.value);

    filteredStaff = loadedStaff.filter(staff => {
        const name = getStaffName(staff).toLowerCase();
        const staffNumber = safeText(staff.staffNumber, "").toLowerCase();
        const email = safeText(staff.email, "").toLowerCase();
        const staffRole = normalize(getStaffRole(staff));
        const staffDepartment = normalize(staff.department);
        const staffStatus = normalize(getStaffStatus(staff));

        return (!search || name.includes(search) || staffNumber.includes(search) || email.includes(search))
            && (!role || staffRole === role)
            && (!department || staffDepartment === department)
            && (!status || staffStatus === status);
    });

    currentPage = 1;
    renderStaffTable();
}

function renderStaffTable() {
    const tableBody = document.getElementById("staffTableBody");
    const emptyState = document.getElementById("emptyState");

    if (!tableBody) {
        return;
    }

    if (!filteredStaff.length) {
        tableBody.replaceChildren();
        tableBody.parentElement.style.display = "none";
        if (emptyState) {
            emptyState.style.display = "flex";
        }
        updatePagination();
        return;
    }

    tableBody.parentElement.style.display = "block";
    if (emptyState) {
        emptyState.style.display = "none";
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageItems = filteredStaff.slice(startIndex, startIndex + itemsPerPage);
    tableBody.replaceChildren(...pageItems.map(createStaffRow));
    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
    const paginationNumbers = document.getElementById("paginationNumbers");
    const prevButton = document.getElementById("prevBtn");
    const nextButton = document.getElementById("nextBtn");
    const paginationStart = document.getElementById("paginationStart");
    const paginationEnd = document.getElementById("paginationEnd");
    const paginationTotal = document.getElementById("paginationTotal");

    paginationNumbers?.replaceChildren();

    if (paginationNumbers) {
        for (let page = 1; page <= totalPages; page += 1) {
            const button = document.createElement("button");
            button.className = `page-number ${page === currentPage ? "active" : ""}`;
            button.type = "button";
            button.textContent = String(page);
            button.addEventListener("click", () => {
                currentPage = page;
                renderStaffTable();
            });
            paginationNumbers.appendChild(button);
        }
    }

    if (prevButton) {
        prevButton.disabled = currentPage <= 1 || totalPages === 0;
        prevButton.onclick = () => {
            if (currentPage > 1) {
                currentPage -= 1;
                renderStaffTable();
            }
        };
    }

    if (nextButton) {
        nextButton.disabled = currentPage >= totalPages || totalPages === 0;
        nextButton.onclick = () => {
            if (currentPage < totalPages) {
                currentPage += 1;
                renderStaffTable();
            }
        };
    }

    if (paginationStart) paginationStart.textContent = filteredStaff.length ? String((currentPage - 1) * itemsPerPage + 1) : "0";
    if (paginationEnd) paginationEnd.textContent = String(Math.min(currentPage * itemsPerPage, filteredStaff.length));
    if (paginationTotal) paginationTotal.textContent = String(filteredStaff.length);
}

function setupEvents() {
    document.getElementById("staffSearch")?.addEventListener("input", applyFilters);
    document.getElementById("roleFilter")?.addEventListener("change", applyFilters);
    document.getElementById("departmentFilter")?.addEventListener("change", applyFilters);
    document.getElementById("statusFilter")?.addEventListener("change", applyFilters);

    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".overlay");

    menuToggle?.addEventListener("click", () => {
        sidebar?.classList.toggle("show");
        overlay?.classList.toggle("active");
    });

    overlay?.addEventListener("click", () => {
        sidebar?.classList.remove("show");
        overlay.classList.remove("active");
    });
}

async function renderStaffPage() {
    renderStateRow("Loading staff...");
    setupEvents();

    try {
        const session = await requireAuthenticatedSession();
        const verifiedSchoolId = session?.schoolProfile?.id;

        if (!verifiedSchoolId) {
            throw new Error("Verified school context is unavailable.");
        }

        loadedStaff = await getStaffForCurrentSchool(verifiedSchoolId);
        filteredStaff = loadedStaff;
        updateStatistics(loadedStaff);
        populateFilterOptions(loadedStaff);
        renderStaffTable();
    } catch (error) {
        console.error("Unable to load staff records", error);
        renderStateRow("Unable to load staff records. Please try again.");
    }
}

document.addEventListener("DOMContentLoaded", renderStaffPage, { once: true });
