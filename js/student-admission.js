import { createStudent, generateUniqueAdmissionNumber } from "./student-service.js";
import { isFirebaseConfigured } from "./firebase.js";

const requiredFieldMap = {
    firstName: {
        selector: "#firstName",
        label: "First Name",
        validator: value => Boolean(value && value.trim())
    },
    lastName: {
        selector: "#lastName",
        label: "Last Name",
        validator: value => Boolean(value && value.trim())
    },
    gender: {
        selector: "#gender",
        label: "Gender",
        validator: value => Boolean(value && value.trim())
    },
    dateOfBirth: {
        selector: "#dateOfBirth",
        label: "Date of Birth",
        validator: value => Boolean(value && value.trim())
    },
    nationality: {
        selector: "#nationality",
        label: "Nationality",
        validator: value => Boolean(value && value.trim())
    },
    stateOfOrigin: {
        selector: "#stateOfOrigin",
        label: "State of Origin",
        validator: value => Boolean(value && value.trim())
    },
    phone: {
        selector: "#phone",
        label: "Phone Number",
        validator: value => Boolean(value && value.trim())
    },
    email: {
        selector: "#email",
        label: "Email Address",
        validator: value => Boolean(value && value.trim())
    },
    residentialAddress: {
        selector: "#residentialAddress",
        label: "Residential Address",
        validator: value => Boolean(value && value.trim())
    },
    guardianName: {
        selector: "#guardianName",
        label: "Guardian Name",
        validator: value => Boolean(value && value.trim())
    },
    relationship: {
        selector: "#relationship",
        label: "Relationship",
        validator: value => Boolean(value && value.trim())
    },
    guardianPhone: {
        selector: "#guardianPhone",
        label: "Guardian Phone Number",
        validator: value => Boolean(value && value.trim())
    },
    homeAddress: {
        selector: "#homeAddress",
        label: "Home Address",
        validator: value => Boolean(value && value.trim())
    },
    academicSession: {
        selector: "#academicSession",
        label: "Academic Session",
        validator: value => Boolean(value && value.trim())
    },
    term: {
        selector: "#term",
        label: "Term",
        validator: value => Boolean(value && value.trim())
    },
    className: {
        selector: "#class",
        label: "Class",
        validator: value => Boolean(value && value.trim())
    },
    department: {
        selector: "#department",
        label: "Department",
        validator: value => Boolean(value && value.trim())
    },
    studentType: {
        selector: "#studentType",
        label: "Student Type",
        validator: value => Boolean(value && value.trim())
    },
    admissionType: {
        selector: "#admissionType",
        label: "Admission Type",
        validator: value => Boolean(value && value.trim())
    },
    admissionDate: {
        selector: "#admissionDate",
        label: "Admission Date",
        validator: value => Boolean(value && value.trim())
    }
};

function ensureErrorElements() {
    const fields = Object.keys(requiredFieldMap);

    fields.forEach(fieldName => {
        const item = requiredFieldMap[fieldName];
        const field = document.querySelector(item.selector);

        if (!field) {
            return;
        }

        if (!field.parentElement.querySelector(".field-error")) {
            const errorNode = document.createElement("div");
            errorNode.className = "field-error";
            errorNode.dataset.errorFor = fieldName;
            field.parentElement.appendChild(errorNode);
        }
    });
}

function readTextValue(selector) {
    const control = document.querySelector(selector);

    if (!control) {
        return "";
    }

    return control.value ? control.value.trim() : "";
}

function validateForm() {
    const invalid = [];

    Object.entries(requiredFieldMap).forEach(([fieldName, config]) => {
        const control = document.querySelector(config.selector);
        const parent = control ? control.closest(".form-group") : null;
        const errorNode = parent ? parent.querySelector(".field-error") : null;

        control?.classList.remove("input-error");

        if (errorNode) {
            errorNode.textContent = "";
        }

        const value = control ? control.value.trim() : "";

        if (!config.validator(value)) {
            invalid.push({ fieldName, config, control, parent, errorNode });
        }
    });

    invalid.forEach(item => {
        if (item.control) {
            item.control.classList.add("input-error");
        }

        if (item.errorNode) {
            item.errorNode.textContent = `${requiredFieldMap[item.fieldName].label} is required`;
        }
    });

    return invalid.length === 0;
}

function collectAdmissionPayload() {
    const payload = {
        firstName: readTextValue("#firstName"),
        middleName: readTextValue("#middleName"),
        lastName: readTextValue("#lastName"),
        gender: readTextValue("#gender"),
        dateOfBirth: readTextValue("#dateOfBirth"),
        nationality: readTextValue("#nationality"),
        stateOfOrigin: readTextValue("#stateOfOrigin"),
        religion: readTextValue("#religion"),
        bloodGroup: readTextValue("#bloodGroup") || readTextValue("#medicalBloodGroup"),
        phone: readTextValue("#phone"),
        email: readTextValue("#email"),
        residentialAddress: readTextValue("#residentialAddress"),
        passport: readTextValue("#passportFile") || "",
        fatherName: readTextValue("#fatherName"),
        motherName: readTextValue("#motherName"),
        guardianName: readTextValue("#guardianName"),
        relationship: readTextValue("#relationship"),
        guardianPhone: readTextValue("#guardianPhone"),
        alternativePhone: readTextValue("#alternativePhone"),
        guardianEmail: readTextValue("#guardianEmail"),
        occupation: readTextValue("#occupation"),
        homeAddress: readTextValue("#homeAddress"),
        academicSession: readTextValue("#academicSession"),
        term: readTextValue("#term"),
        class: readTextValue("#class"),
        department: readTextValue("#department"),
        studentType: readTextValue("#studentType"),
        house: readTextValue("#house"),
        admissionType: readTextValue("#admissionType"),
        admissionDate: readTextValue("#admissionDate"),
        previousSchool: readTextValue("#previousSchool"),
        previousClass: readTextValue("#previousClass"),
        classTeacher: readTextValue("#classTeacher"),
        academicNotes: readTextValue("#academicNotes"),
        genotype: readTextValue("#genotype"),
        medicalCondition: readTextValue("#medicalCondition"),
        allergies: readTextValue("#allergies"),
        disabilityOrSpecialNeeds: readTextValue("#disabilityOrSpecialNeeds"),
        medication: readTextValue("#medication"),
        preferredHospital: readTextValue("#preferredHospital"),
        doctorOrMedicalContact: readTextValue("#doctorOrMedicalContact"),
        emergencyContactName: readTextValue("#emergencyContactName"),
        emergencyContactPhone: readTextValue("#emergencyContactPhone"),
        medicalNotes: readTextValue("#medicalNotes"),
        birthCertificate: readTextValue("#birthCertificateFile") || "",
        previousResult: readTextValue("#previousResultFile") || "",
        transferCertificate: readTextValue("#transferCertificateFile") || "",
        medicalReport: readTextValue("#medicalReportFile") || "",
        otherDocument: readTextValue("#otherDocumentFile") || ""
    };

    const fullName = [payload.firstName, payload.middleName, payload.lastName].filter(Boolean).join(" ");

    payload.fullName = fullName;

    return payload;
}

function setReviewData(payload) {
    const map = {
        "#reviewStudentName": [payload.firstName, payload.middleName, payload.lastName].filter(Boolean).join(" ") || "Not provided",
        "#reviewGender": payload.gender || "Not provided",
        "#reviewDateOfBirth": payload.dateOfBirth || "Not provided",
        "#reviewNationality": payload.nationality || "Not provided",
        "#reviewPhone": payload.phone || "Not provided",
        "#reviewEmail": payload.email || "Not provided",
        "#reviewFatherName": payload.fatherName || "Not provided",
        "#reviewMotherName": payload.motherName || "Not provided",
        "#reviewGuardianName": payload.guardianName || "Not provided",
        "#reviewRelationship": payload.relationship || "Not provided",
        "#reviewGuardianPhone": payload.guardianPhone || "Not provided",
        "#reviewGuardianEmail": payload.guardianEmail || "Not provided",
        "#reviewAcademicSession": payload.academicSession || "Not provided",
        "#reviewClass": payload.class || "Not provided",
        "#reviewDepartment": payload.department || "Not provided",
        "#reviewStudentType": payload.studentType || "Not provided",
        "#reviewAdmissionType": payload.admissionType || "Not provided",
        "#reviewPreviousSchool": payload.previousSchool || "Not provided",
        "#reviewMedicalBloodGroup": payload.bloodGroup || payload.medicalBloodGroup || "Not provided",
        "#reviewGenotype": payload.genotype || "Not provided",
        "#reviewAllergies": payload.allergies || "Not provided",
        "#reviewMedicalCondition": payload.medicalCondition || "Not provided",
        "#reviewEmergencyContactName": payload.emergencyContactName || "Not provided",
        "#reviewEmergencyContactPhone": payload.emergencyContactPhone || "Not provided"
    };

    Object.entries(map).forEach(([selector, value]) => {
        const node = document.querySelector(selector);

        if (node) {
            node.textContent = value;
        }
    });
}

function showError(message) {
    const alertBox = document.querySelector(".admission-alert");

    if (alertBox) {
        alertBox.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
        alertBox.classList.add("show");
    } else {
        console.error(message);
    }
}

function clearWizard() {
    const form = document.querySelector(".admission-card .form-step");

    if (form) {
        form.closest(".admission-card")?.querySelectorAll("form, input, select, textarea").forEach(control => {
            if (control && control.tagName.toLowerCase() !== "button") {
                if (control.type === "file") {
                    control.value = "";
                } else if (control.tagName.toLowerCase() === "textarea") {
                    control.value = "";
                } else {
                    control.value = "";
                }
            }
        });
    }

    const reviewValues = document.querySelectorAll("#reviewStudentName, #reviewGender, #reviewDateOfBirth, #reviewNationality, #reviewPhone, #reviewEmail, #reviewFatherName, #reviewMotherName, #reviewGuardianName, #reviewRelationship, #reviewGuardianPhone, #reviewGuardianEmail, #reviewAcademicSession, #reviewClass, #reviewDepartment, #reviewStudentType, #reviewAdmissionType, #reviewPreviousSchool, #reviewMedicalBloodGroup, #reviewGenotype, #reviewAllergies, #reviewMedicalCondition, #reviewEmergencyContactName, #reviewEmergencyContactPhone");

    reviewValues.forEach(node => {
        if (node) {
            node.textContent = "Not provided";
        }
    });
}

function showSuccessState(studentRecord) {
    const card = document.querySelector(".admission-card");

    if (!card) {
        return;
    }

    const fullName = [studentRecord.firstName, studentRecord.middleName, studentRecord.lastName].filter(Boolean).join(" ");

    const successHtml = `
        <div class="admission-success-state show">
            <div class="success-icon">
                <i class="fa-solid fa-circle-check"></i>
            </div>
            <h2 class="success-title">Student Admission Completed</h2>
            <p class="success-subtitle">
                ${fullName} has been successfully registered.
            </p>
            <div class="success-details">
                <div class="success-detail-row">
                    <span>Admission Number:</span>
                    <strong>${studentRecord.admissionNumber}</strong>
                </div>
                <div class="success-detail-row">
                    <span>Student ID:</span>
                    <strong>${studentRecord.id || "-"}</strong>
                </div>
            </div>
            <div class="success-action-row">
                <a class="primary-btn" href="student-profile.html?id=${studentRecord.id}">
                    <i class="fa-solid fa-user"></i> View Student Profile
                </a>
                <a class="secondary-btn" href="student.html">
                    <i class="fa-solid fa-users"></i> Return to Students
                </a>
                <button type="button" class="primary-btn register-another">
                    <i class="fa-solid fa-user-plus"></i> Register Another Student
                </button>
            </div>
        </div>
    `;

    card.innerHTML = successHtml;

    const registerAnother = card.querySelector(".register-another");

    if (registerAnother) {
        registerAnother.addEventListener("click", () => {
            window.location.reload();
        });
    }
}

function setupWizard() {
    const steps = Array.from(document.querySelectorAll(".form-step"));
    const progressSteps = Array.from(document.querySelectorAll(".wizard-progress .step"));
    const nextButtons = Array.from(document.querySelectorAll(".next-step"));
    const previousButtons = Array.from(document.querySelectorAll(".prev-step"));

    let currentStep = 0;

    function showStep(index) {
        steps.forEach((step, i) => {
            step.classList.toggle("active-step", i === index);
        });

        progressSteps.forEach((step, i) => {
            step.classList.remove("active", "completed");

            if (i === index) {
                step.classList.add("active");
            } else if (i < index) {
                step.classList.add("completed");
            }
        });

        currentStep = index;
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    nextButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (currentStep < steps.length - 1) {
                showStep(currentStep + 1);
            }
        });
    });

    previousButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (currentStep > 0) {
                showStep(currentStep - 1);
            }
        });
    });

    document.querySelectorAll(".review-edit").forEach(button => {
        button.addEventListener("click", () => {
            const step = Number(button.dataset.step || 0);
            showStep(step);
        });
    });

    showStep(0);
}

function setupFileNameLabels() {
    document.querySelectorAll(".file-upload input[type='file']").forEach(input => {
        input.addEventListener("change", () => {
            const card = input.closest(".upload-card");
            const fileName = card?.querySelector(".file-name");

            if (input.files && input.files.length > 0 && fileName) {
                fileName.textContent = input.files[0].name;
                fileName.style.color = "#4ADE80";
            } else if (fileName) {
                fileName.textContent = "No file selected";
                fileName.style.color = "#64748B";
            }
        });
    });
}

async function submitAdmission() {
    const completeButton = document.querySelector(".complete-admission");

    if (!completeButton) {
        return;
    }

    if (!validateForm()) {
        showError("Please complete all required fields before submitting the admission.");
        return;
    }

    const payload = collectAdmissionPayload();

    if (!payload.firstName || !payload.lastName) {
        showError("A student first name and surname are required.");
        return;
    }

    const firebaseReady = isFirebaseConfigured();

    if (!firebaseReady) {
        console.warn("Firebase is not configured in this environment. Admission can be collected but not saved to Firestore.");
        showError("Firebase configuration is incomplete. Please connect your Firebase project before saving records.");
        return;
    }

    const schoolId = localStorage.getItem("simplexskolla.currentSchoolId") || localStorage.getItem("simplexskolla.currentSchool") || "";

    if (!schoolId || schoolId === "null") {
        showError("Missing school context. Please select or sign into a school before registering a student.");
        return;
    }

    if (!payload.schoolId && !schoolId) {
        showError("Missing school context.");
        return;
    }

    completeButton.disabled = true;
    completeButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

    try {
        const admissionNumber = await generateUniqueAdmissionNumber();
        payload.admissionNumber = admissionNumber;

        const result = await createStudent(payload);

        if (!result || result.success !== true) {
            throw new Error((result && result.error) || "Student record could not be saved.");
        }

        const savedRecord = {
            ...payload,
            id: result.id,
            admissionNumber,
            schoolId: result.schoolId,
            schoolId
        };

        showSuccessState(savedRecord);

        const confirmation = document.querySelector(".admission-success-state");

        if (confirmation) {
            confirmation.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    } catch (error) {
        console.error("Admission failed", error);
        showError(error.message || "Admission could not be completed. Please try again.");

        completeButton.disabled = false;
        completeButton.innerHTML = '<i class="fa-solid fa-check"></i> Complete Admission';
    }
}

function setupAdmissionCompleteButton() {
    const completeButton = document.querySelector(".complete-admission");

    if (completeButton) {
        completeButton.addEventListener("click", submitAdmission);
    }
}

function setupReviewSync() {
    const fields = [
        ["#firstName", "#firstName"],
        ["#middleName", "#middleName"],
        ["#lastName", "#lastName"],
        ["#gender", "#gender"],
        ["#dateOfBirth", "#dateOfBirth"],
        ["#nationality", "#nationality"],
        ["#phone", "#phone"],
        ["#email", "#email"],
        ["#guardianName", "#guardianName"],
        ["#guardianPhone", "#guardianPhone"],
        ["#guardianEmail", "#guardianEmail"],
        ["#academicSession", "#academicSession"],
        ["#class", "#class"],
        ["#department", "#department"],
        ["#studentType", "#studentType"],
        ["#admissionType", "#admissionType"],
        ["#previousSchool", "#previousSchool"],
        ["#medicalBloodGroup", "#medicalBloodGroup"],
        ["#genotype", "#genotype"],
        ["#allergies", "#allergies"],
        ["#medicalCondition", "#medicalCondition"],
        ["#emergencyContactName", "#emergencyContactName"],
        ["#emergencyContactPhone", "#emergencyContactPhone"]
    ];

    fields.forEach(([source, _]) => {
        const sourceControl = document.querySelector(source);

        if (sourceControl) {
            sourceControl.addEventListener("input", () => {
                const payload = collectAdmissionPayload();
                setReviewData(payload);
            });

            sourceControl.addEventListener("change", () => {
                const payload = collectAdmissionPayload();
                setReviewData(payload);
            });
        }
    });
}

function initAdmissionWizard() {
    ensureErrorElements();
    setupWizard();
    setupFileNameLabels();
    setupAdmissionCompleteButton();
    setupReviewSync();

    const reviewButton = document.querySelector(".review-edit[data-step]");

    if (reviewButton) {
        reviewButton.addEventListener("click", () => {
            const payload = collectAdmissionPayload();
            setReviewData(payload);
        });
    }
}

document.addEventListener("DOMContentLoaded", initAdmissionWizard);
