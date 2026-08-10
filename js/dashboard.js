document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".overlay");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("open");

            if (overlay) {
                overlay.classList.add("show");
            }
        });
    }

    if (overlay) {
        overlay.addEventListener("click", () => {
            if (sidebar) {
                sidebar.classList.remove("open");
            }

            overlay.classList.remove("show");
        });
    }
});
