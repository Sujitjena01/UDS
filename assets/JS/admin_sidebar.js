// Sidebar functionality
        // Sidebar toggle (mobile)
        const sidebar = document.querySelector(".sidebar");
        const toggleBtn = document.querySelector(".sidebar-toggle");
        let overlay1;

        function openSidebar() {
            sidebar.classList.add("sidebar--open");

            if (!overlay1) {
                overlay1 = document.createElement("div");
                overlay1.classList.add("sidebar-overlay");
                document.body.appendChild(overlay1);

                overlay1.addEventListener("click", closeSidebar);
            }
        }

        function closeSidebar() {
            sidebar.classList.remove("sidebar--open");
            if (overlay1) {
                overlay1.remove();
                overlay1 = null;
            }
        }

        toggleBtn.addEventListener("click", () => {
            const isOpen = sidebar.classList.contains("sidebar--open");
            if (isOpen) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });

        // Close on Escape
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                closeSidebar();
            }
        });

        // Submenu toggle
        const submenuToggles = document.querySelectorAll(".sidebar__submenu-toggle");

        submenuToggles.forEach((btn) => {
            btn.addEventListener("click", () => {
                const submenu = btn.nextElementSibling;
                const isOpen = submenu.classList.contains("sidebar__submenu--open");

                // Optional: close other submenus
                submenuToggles.forEach((otherBtn) => {
                    if (otherBtn !== btn) {
                        const otherSubmenu = otherBtn.nextElementSibling;
                        otherSubmenu.classList.remove("sidebar__submenu--open");
                        otherBtn.classList.remove("sidebar__submenu-toggle--open");
                    }
                });

                if (isOpen) {
                    submenu.classList.remove("sidebar__submenu--open");
                    btn.classList.remove("sidebar__submenu-toggle--open");
                } else {
                    submenu.classList.add("sidebar__submenu--open");
                    btn.classList.add("sidebar__submenu-toggle--open");
                }
            });
        });
    