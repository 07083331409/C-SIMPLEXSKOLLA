document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("staffForm");
    const photoInput = document.getElementById("profilePhoto");
    const photoPreview = document.getElementById("photoPreview");
    const saveAnotherButton = document.getElementById("saveAnother");
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".overlay");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("show");
            overlay?.classList.toggle("active");
        });
    }
    overlay?.addEventListener("click", () => {
        sidebar?.classList.remove("show");
        overlay.classList.remove("active");
    });

    photoInput?.addEventListener("change", () => {
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
        });
        reader.readAsDataURL(file);
    });

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const saveAnother = event.submitter === saveAnotherButton;
        if (!validateForm()) {
            showToast("Please review the highlighted required fields.", true);
            document.querySelector(".field.invalid input, .field.invalid select")?.focus();
            return;
        }

        const buttons = form.querySelectorAll("button");
        buttons.forEach((button) => { button.disabled = true; });
        await new Promise((resolve) => window.setTimeout(resolve, 650));
        buttons.forEach((button) => { button.disabled = false; });
        showToast(saveAnother ? "Staff member saved. You can add another profile." : "Staff member saved successfully.");

        if (saveAnother) {
            form.reset();
            photoPreview.innerHTML = '<i class="fa-solid fa-user"></i>';
            form.querySelectorAll(".field").forEach((field) => field.classList.remove("invalid"));
            form.querySelectorAll(".field-error").forEach((error) => { error.textContent = ""; });
        }
    });

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
            setError("loginEmail", "Enter a valid login email address.");
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

    form?.querySelectorAll("input, select, textarea").forEach((input) => {
        input.addEventListener("input", () => { if (input.value.trim()) clearError(input.id); });
        input.addEventListener("change", () => { if (input.value.trim()) clearError(input.id); });
    });

    function showToast(message, isError = false) {
        toastMessage.textContent = message;
        toast.classList.toggle("error", isError);
        toast.classList.add("show");
        window.clearTimeout(showToast.timeout);
        showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 3800);
    }
});
