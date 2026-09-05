/* SIMPLEXSKOLLA Classes Management - local UI prototype */

const MOCK_CLASSES = [
    { id: "CLS-JSS1-A", className: "JSS1", section: "A", level: "Junior Secondary", classTeacher: "Mr. John Okoro", studentCount: 34, capacity: 40, room: "Room 101", status: "Active" },
    { id: "CLS-JSS1-B", className: "JSS1", section: "B", level: "Junior Secondary", classTeacher: "Mrs. Ngozi Eze", studentCount: 36, capacity: 40, room: "Room 102", status: "Active" },
    { id: "CLS-JSS2-A", className: "JSS2", section: "A", level: "Junior Secondary", classTeacher: "Mr. Chinedu Nwosu", studentCount: 38, capacity: 40, room: "Room 103", status: "Active" },
    { id: "CLS-JSS2-B", className: "JSS2", section: "B", level: "Junior Secondary", classTeacher: "Mrs. Adaobi Obi", studentCount: 31, capacity: 40, room: "Room 104", status: "Active" },
    { id: "CLS-JSS3-A", className: "JSS3", section: "A", level: "Junior Secondary", classTeacher: "Mr. Tunde Adeyemi", studentCount: 40, capacity: 40, room: "Room 105", status: "Active" },
    { id: "CLS-JSS3-B", className: "JSS3", section: "B", level: "Junior Secondary", classTeacher: "Mrs. Fatima Bello", studentCount: 35, capacity: 40, room: "Room 106", status: "Active" },
    { id: "CLS-SS1-A", className: "SS1", section: "A", level: "Senior Secondary", classTeacher: "Mr. Emeka Umeh", studentCount: 42, capacity: 45, room: "Room 201", status: "Active" },
    { id: "CLS-SS1-B", className: "SS1", section: "B", level: "Senior Secondary", classTeacher: "Mrs. Grace Akinyemi", studentCount: 39, capacity: 45, room: "Room 202", status: "Active" },
    { id: "CLS-SS2-A", className: "SS2", section: "A", level: "Senior Secondary", classTeacher: "Mr. Ibrahim Musa", studentCount: 37, capacity: 45, room: "Room 203", status: "Active" },
    { id: "CLS-SS2-B", className: "SS2", section: "B", level: "Senior Secondary", classTeacher: "Mrs. Kemi Balogun", studentCount: 33, capacity: 45, room: "Room 204", status: "Inactive" },
    { id: "CLS-SS3-A", className: "SS3", section: "A", level: "Senior Secondary", classTeacher: "Mr. Daniel Osei", studentCount: 41, capacity: 45, room: "Room 205", status: "Active" },
    { id: "CLS-SS3-B", className: "SS3", section: "B", level: "Senior Secondary", classTeacher: "Mrs. Blessing Okafor", studentCount: 32, capacity: 45, room: "Room 206", status: "Inactive" },
    { id: "CLS-JSS1-C", className: "JSS1", section: "C", level: "Junior Secondary", classTeacher: "Mr. Samuel Danjuma", studentCount: 29, capacity: 40, room: "Room 107", status: "Active" },
    { id: "CLS-SS1-C", className: "SS1", section: "C", level: "Senior Secondary", classTeacher: "Mrs. Amina Yusuf", studentCount: 28, capacity: 45, room: "Room 207", status: "Inactive" }
];

const state = { classes: [...MOCK_CLASSES], filtered: [], page: 1, pageSize: 8, editingId: null };

function initializeClasses() {
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".overlay");
    menuToggle?.addEventListener("click", () => { sidebar?.classList.toggle("show"); overlay?.classList.toggle("active"); sidebar?.classList.toggle("open"); });
    overlay?.addEventListener("click", () => { sidebar?.classList.remove("show", "open"); overlay.classList.remove("active"); });

    const sectionFilter = document.getElementById("sectionFilter");
    [...new Set(state.classes.map(item => item.section))].sort().forEach(section => {
        const option = document.createElement("option"); option.value = section; option.textContent = `Section ${section}`; sectionFilter.appendChild(option);
    });
    document.getElementById("classSearch").addEventListener("input", updateResults);
    document.getElementById("headerSearch").addEventListener("input", event => { document.getElementById("classSearch").value = event.target.value; updateResults(); });
    ["levelFilter", "statusFilter", "sectionFilter"].forEach(id => document.getElementById(id).addEventListener("change", updateResults));
    document.getElementById("addClassButton").addEventListener("click", () => openAddClassModal());
    document.getElementById("exportButton").addEventListener("click", exportClasses);
    document.getElementById("resetEmptyButton").addEventListener("click", resetFilters);
    document.getElementById("classForm").addEventListener("submit", saveClass);
    document.querySelectorAll("[data-close-modal]").forEach(button => button.addEventListener("click", closeClassModal));
    document.querySelectorAll("[data-close-view]").forEach(button => button.addEventListener("click", closeViewModal));
    document.addEventListener("keydown", event => { if (event.key === "Escape") { closeClassModal(); closeViewModal(); } });
    updateResults();
}

function getFilters() {
    return { search: document.getElementById("classSearch").value.trim().toLowerCase(), level: document.getElementById("levelFilter").value, status: document.getElementById("statusFilter").value, section: document.getElementById("sectionFilter").value };
}

function filterClasses() {
    const filters = getFilters();
    state.filtered = state.classes.filter(item => {
        const searchable = [item.id, item.className, item.section, item.level, item.classTeacher, item.room].join(" ").toLowerCase();
        return (!filters.search || searchable.includes(filters.search)) && (!filters.level || item.level === filters.level) && (!filters.status || item.status === filters.status) && (!filters.section || item.section === filters.section);
    });
    return state.filtered;
}

function updateResults() {
    filterClasses(); state.page = 1; renderSummary(); renderClasses(); renderPagination();
}

function renderSummary() {
    const totalStudents = state.classes.reduce((sum, item) => sum + item.studentCount, 0);
    const average = state.classes.length ? Math.round(totalStudents / state.classes.length) : 0;
    document.getElementById("totalClasses").textContent = state.classes.length;
    document.getElementById("activeClasses").textContent = state.classes.filter(item => item.status === "Active").length;
    document.getElementById("totalStudents").textContent = totalStudents;
    document.getElementById("averageClassSize").textContent = average;
}

function renderClasses() {
    const body = document.getElementById("classesBody");
    const empty = document.getElementById("emptyState");
    const start = (state.page - 1) * state.pageSize;
    const pageItems = state.filtered.slice(start, start + state.pageSize);
    body.innerHTML = pageItems.map(item => `<tr><td class="class-id">${escapeHtml(item.id)}</td><td class="class-name">${escapeHtml(item.className)}</td><td>${escapeHtml(item.section)}</td><td>${escapeHtml(item.level)}</td><td class="teacher-name">${escapeHtml(item.classTeacher)}</td><td class="student-count">${item.studentCount}</td><td>${item.capacity}</td><td>${escapeHtml(item.room)}</td><td><span class="status-badge ${item.status === "Active" ? "status-active" : "status-inactive"}">${item.status}</span></td><td><div class="row-actions"><button class="row-action" type="button" title="View ${escapeHtml(item.id)}" aria-label="View ${escapeHtml(item.id)}" data-action="view" data-id="${item.id}"><i class="fa-solid fa-eye"></i></button><button class="row-action" type="button" title="Edit ${escapeHtml(item.id)}" aria-label="Edit ${escapeHtml(item.id)}" data-action="edit" data-id="${item.id}"><i class="fa-solid fa-pen"></i></button><button class="row-action archive" type="button" title="Archive ${escapeHtml(item.id)}" aria-label="Archive ${escapeHtml(item.id)}" data-action="archive" data-id="${item.id}"><i class="fa-solid fa-box-archive"></i></button></div></td></tr>`).join("");
    empty.hidden = pageItems.length > 0;
    body.querySelectorAll("[data-action='view']").forEach(button => button.addEventListener("click", () => viewClass(button.dataset.id)));
    body.querySelectorAll("[data-action='edit']").forEach(button => button.addEventListener("click", () => openEditClassModal(button.dataset.id)));
    body.querySelectorAll("[data-action='archive']").forEach(button => button.addEventListener("click", () => archiveClass(button.dataset.id)));
    const shownStart = state.filtered.length ? start + 1 : 0;
    const shownEnd = Math.min(start + state.pageSize, state.filtered.length);
    document.getElementById("paginationSummary").textContent = `Showing ${shownStart}-${shownEnd} of ${state.filtered.length} classes`;
}

function renderPagination() {
    const pagination = document.getElementById("pagination"); const pages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));
    state.page = Math.min(state.page, pages);
    pagination.innerHTML = `<button class="page-button" type="button" data-page="prev" aria-label="Previous page" ${state.page === 1 ? "disabled" : ""}><i class="fa-solid fa-chevron-left"></i></button>${Array.from({ length: pages }, (_, index) => `<button class="page-button ${state.page === index + 1 ? "active" : ""}" type="button" data-page="${index + 1}">${index + 1}</button>`).join("")}<button class="page-button" type="button" data-page="next" aria-label="Next page" ${state.page === pages ? "disabled" : ""}><i class="fa-solid fa-chevron-right"></i></button>`;
    pagination.querySelectorAll("[data-page]").forEach(button => button.addEventListener("click", () => { const page = button.dataset.page; if (page === "prev") state.page--; else if (page === "next") state.page++; else state.page = Number(page); renderClasses(); renderPagination(); }));
}

function openAddClassModal() { state.editingId = null; document.getElementById("classModalTitle").textContent = "Add Class"; document.getElementById("classForm").reset(); document.getElementById("classStatus").value = "Active"; clearErrors(); showModal("classModal"); document.getElementById("className").focus(); }
function openEditClassModal(id) { const item = state.classes.find(record => record.id === id); if (!item) return; state.editingId = id; document.getElementById("classModalTitle").textContent = "Edit Class"; document.getElementById("classRecordId").value = item.id; document.getElementById("className").value = item.className; document.getElementById("classSection").value = item.section; document.getElementById("classLevel").value = item.level; document.getElementById("classTeacher").value = item.classTeacher; document.getElementById("studentCapacity").value = item.capacity; document.getElementById("classRoom").value = item.room; document.getElementById("classStatus").value = item.status; clearErrors(); showModal("classModal"); document.getElementById("className").focus(); }
function saveClass(event) { event.preventDefault(); const fields = { className: document.getElementById("className"), classSection: document.getElementById("classSection"), classLevel: document.getElementById("classLevel"), classTeacher: document.getElementById("classTeacher"), studentCapacity: document.getElementById("studentCapacity"), classRoom: document.getElementById("classRoom") }; let valid = true; Object.entries(fields).forEach(([id, field]) => { if (!field.value.trim()) { setError(id, "This field is required."); valid = false; } else clearError(id); }); if (!valid) return; const record = { className: fields.className.value.trim(), section: fields.classSection.value.trim().toUpperCase(), level: fields.classLevel.value, classTeacher: fields.classTeacher.value.trim(), capacity: Number(fields.studentCapacity.value), room: fields.classRoom.value.trim(), status: document.getElementById("classStatus").value }; if (!record.capacity || record.capacity < 1) { setError("studentCapacity", "Enter a capacity greater than zero."); return; } if (state.editingId) { const existing = state.classes.find(item => item.id === state.editingId); Object.assign(existing, record); showToast("Class updated successfully."); } else { const idBase = `${record.className}-${record.section}`.replace(/\s+/g, "-").toUpperCase(); record.id = `CLS-${idBase}-${Date.now().toString().slice(-4)}`; record.studentCount = 0; state.classes.push(record); showToast("Class added successfully."); } closeClassModal(); updateResults(); }
function viewClass(id) { const item = state.classes.find(record => record.id === id); if (!item) return; document.getElementById("viewModalTitle").textContent = `${item.className} ${item.section}`; document.getElementById("viewDetails").innerHTML = [["Class ID", item.id], ["Class Name", item.className], ["Section/Arm", item.section], ["Academic Level", item.level], ["Class Teacher", item.classTeacher], ["Students", item.studentCount], ["Capacity", item.capacity], ["Room", item.room], ["Status", item.status]].map(([label, value]) => `<div class="view-item"><span>${label}</span><strong>${escapeHtml(String(value))}</strong></div>`).join(""); showModal("viewModal"); }
function archiveClass(id) { const item = state.classes.find(record => record.id === id); if (!item) return; if (!window.confirm(`Archive ${item.className} ${item.section}?`)) return; item.status = "Inactive"; showToast("Class archived locally."); updateResults(); }
function exportClasses() { const rows = filterClasses(); if (!rows.length) { showToast("There are no classes to export.", true); return; } const headers = ["Class ID", "Class Name", "Section", "Academic Level", "Class Teacher", "Students", "Capacity", "Room", "Status"]; const csv = [headers, ...rows.map(item => [item.id, item.className, item.section, item.level, item.classTeacher, item.studentCount, item.capacity, item.room, item.status])].map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n"); const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" })); link.download = "simplexskolla-classes.csv"; link.click(); URL.revokeObjectURL(link.href); showToast("Class directory exported."); }
function resetFilters() { document.getElementById("classSearch").value = ""; document.getElementById("headerSearch").value = ""; document.getElementById("levelFilter").value = ""; document.getElementById("statusFilter").value = ""; document.getElementById("sectionFilter").value = ""; updateResults(); }
function showModal(id) { document.getElementById(id).hidden = false; document.body.classList.add("modal-open"); }
function closeClassModal() { document.getElementById("classModal").hidden = true; document.body.classList.remove("modal-open"); }
function closeViewModal() { document.getElementById("viewModal").hidden = true; document.body.classList.remove("modal-open"); }
function setError(id, message) { const field = document.getElementById(id); field?.closest(".field")?.classList.add("invalid"); const error = document.querySelector(`[data-error-for="${id}"]`); if (error) error.textContent = message; }
function clearError(id) { const field = document.getElementById(id); field?.closest(".field")?.classList.remove("invalid"); const error = document.querySelector(`[data-error-for="${id}"]`); if (error) error.textContent = ""; }
function clearErrors() { document.querySelectorAll(".field").forEach(field => field.classList.remove("invalid")); document.querySelectorAll(".field-error").forEach(error => { error.textContent = ""; }); }
function showToast(message, error = false) { const toast = document.getElementById("toast"); document.getElementById("toastMessage").textContent = message; toast.classList.toggle("error", error); toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 3300); }
function escapeHtml(value) { return value.replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" }[character])); }

document.addEventListener("DOMContentLoaded", initializeClasses);
