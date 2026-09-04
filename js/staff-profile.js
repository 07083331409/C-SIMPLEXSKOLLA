document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".overlay");
    const editButton = document.getElementById("editStaff");
    const printButton = document.getElementById("printProfile");
    const moreButton = document.getElementById("moreActions");
    const actionMenu = document.getElementById("actionMenu");
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");

    menuToggle?.addEventListener("click", () => {
        sidebar?.classList.toggle("show");
        overlay?.classList.toggle("active");
    });
    overlay?.addEventListener("click", () => {
        sidebar?.classList.remove("show");
        overlay.classList.remove("active");
    });

    editButton?.addEventListener("click", () => showToast("Edit Staff is coming soon."));
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
