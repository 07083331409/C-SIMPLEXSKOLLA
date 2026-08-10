import { getStudentById } from "./student-service.js";

function getStudentIdFromQueryString() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function renderStudentProfile() {
    const profileCard = document.querySelector(".profile-card");

    if (!profileCard) {
        return;
    }

    const studentId = getStudentIdFromQueryString();

    if (!studentId) {
        const profileTitle = profileCard.querySelector("h2");

        if (profileTitle) {
            profileTitle.textContent = "Student Profile";
        }

        return;
    }

    try {
        const student = await getStudentById(studentId);

        if (!student) {
            const title = document.querySelector(".profile-card h2");

            if (title) {
                title.textContent = "Student not found";
            }

            return;
        }

        const displayName = [student.firstName, student.middleName, student.lastName]
            .filter(Boolean)
            .join(" ");

        const profileName = profileCard.querySelector("h2");

        if (profileName) {
            profileName.textContent = displayName;
        }

        const admissionText = profileCard.querySelector("p");

        if (admissionText) {
            admissionText.textContent = `Admission No: ${student.admissionNumber || "-"}`;
        }

        const badges = document.querySelector(".student-badges");

        if (badges) {
            badges.innerHTML = "";

            const classBadge = document.createElement("span");
            classBadge.textContent = student.class || "Student";
            badges.appendChild(classBadge);

            const statusBadge = document.createElement("span");
            statusBadge.textContent = student.status || "Active";
            badges.appendChild(statusBadge);
        }

        const profileCards = document.querySelectorAll(".info-grid .info-item");

        const fieldMap = {
            "Full Name": displayName,
            "Admission Number": student.admissionNumber || "-",
            "Gender": student.gender || "-",
            "Date of Birth": student.dateOfBirth || "-",
            "Nationality": student.nationality || "-",
            "State of Origin": student.stateOfOrigin || "-",
            "Religion": student.religion || "-",
            "Blood Group": student.bloodGroup || student.medicalBloodGroup || "-",
            "Residential Address": student.residentialAddress || "-",
            "Guardian": student.guardianName || "-",
            "Father's Name": student.fatherName || "-",
            "Mother's Name": student.motherName || "-",
            "Relationship": student.relationship || "-",
            "Phone Number": student.guardianPhone || "-",
            "Email Address": student.guardianEmail || "-",
            "Occupation": student.occupation || "-",
            "Home Address": student.homeAddress || "-",
            "Current Class": student.class || "-",
            "Department": student.department || "-",
            "Academic Session": student.academicSession || "-",
            "Term": student.term || "-",
            "Class Teacher": student.classTeacher || "-",
            "Admission Date": student.admissionDate || "-",
            "Student House": student.house || "-",
            "Student Type": student.studentType || "-",
            "Student Status": student.status || "Active",
            "Previous School": student.previousSchool || "-",
            "Previous Class": student.previousClass || "-"
        };

        for (const item of profileCards) {
            const label = item.querySelector("span")?.textContent?.trim();
            const value = item.querySelector("h4");

            if (label && value && fieldMap[label]) {
                value.textContent = fieldMap[label];
            }
        }
    } catch (error) {
        console.error("Unable to load profile", error);
    }
}

renderStudentProfile();
