import { getStudentsForCurrentSchool } from "./student-service.js";

async function renderStudentsPage() {
    const rows = document.querySelector(".student-table tbody");

    if (!rows) {
        return;
    }

    try {
        const students = await getStudentsForCurrentSchool();

        rows.innerHTML = "";

        if (!students.length) {
            rows.innerHTML = `<tr><td colspan="6" class="empty-row">No students found for this school.</td></tr>`;
            return;
        }

        students.forEach(student => {
            const row = document.createElement("tr");
            const name = [student.firstName, student.middleName, student.lastName]
                .filter(Boolean)
                .join(" ") || "Student";

            row.innerHTML = `
                <td>
                    <div class="student-info">
                        <img src="assets/images/student.png" alt="${name}">
                        <div>
                            <strong>${name}</strong>
                            <small>${student.email || "No email provided"}</small>
                        </div>
                    </div>
                </td>
                <td>${student.admissionNumber || "-"}</td>
                <td>${student.class || student.className || "-"}</td>
                <td>${student.gender || "-"}</td>
                <td>
                    <span class="status ${student.status || "active"}">
                        ${(student.status || "Active").toUpperCase()}
                    </span>
                </td>
                <td>
                    <a class="action-btn view" href="student-profile.html?id=${student.id}" title="View profile">
                        <i class="fa-solid fa-eye"></i>
                    </a>
                    <button class="action-btn edit" title="Edit">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="action-btn delete" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;

            rows.appendChild(row);
        });
    } catch (error) {
        console.error("Unable to load students", error);

        rows.innerHTML = `<tr><td colspan="6" class="empty-row">Unable to load students.</td></tr>`;
    }
}

renderStudentsPage();
