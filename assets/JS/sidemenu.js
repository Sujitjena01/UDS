// Get elements
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const closeBtn = document.getElementById('closeBtn');
        const overlay = document.getElementById('overlay');
        const sideMenu = document.getElementById('sideMenu');
        const submenuLinks = document.querySelectorAll('.has-submenu');

        // Store first and last focusable elements
        let firstFocusableElement;
        let lastFocusableElement;

        // Open menu
        function openMenu() {
            sideMenu.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Update ARIA attributes
            hamburgerBtn.setAttribute('aria-expanded', 'true');
            sideMenu.setAttribute('aria-hidden', 'false');
            overlay.setAttribute('aria-hidden', 'false');

            // Set focus to close button
            setTimeout(() => {
                closeBtn.focus();
                setupFocusTrap();
            }, 100);
        }

        // Close menu
        function closeMenu() {
            sideMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';

            // Update ARIA attributes
            hamburgerBtn.setAttribute('aria-expanded', 'false');
            sideMenu.setAttribute('aria-hidden', 'true');
            overlay.setAttribute('aria-hidden', 'true');

            // Close all submenus
            document.querySelectorAll('.submenu').forEach(sub => {
                sub.setAttribute('aria-hidden', 'true');
            });
            document.querySelectorAll('.has-submenu').forEach(link => {
                link.setAttribute('aria-expanded', 'false');
            });

            // Return focus to hamburger button
            hamburgerBtn.focus();
        }

        // Setup focus trap
        function setupFocusTrap() {
            const focusableElements = sideMenu.querySelectorAll(
                'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const focusableArray = Array.from(focusableElements);
            firstFocusableElement = focusableArray[0];
            lastFocusableElement = focusableArray[focusableArray.length - 1];
        }

        // Toggle submenu
        function toggleSubmenu(e, submenuId, menuLink) {
            e.preventDefault();
            const submenu = document.getElementById(`submenu-${submenuId}`);
            const isExpanded = menuLink.getAttribute('aria-expanded') === 'true';

            // Close all submenus
            document.querySelectorAll('.submenu').forEach(sub => {
                sub.setAttribute('aria-hidden', 'true');
            });
            document.querySelectorAll('.has-submenu').forEach(link => {
                link.setAttribute('aria-expanded', 'false');
            });

            // Toggle current submenu
            if (!isExpanded) {
                submenu.setAttribute('aria-hidden', 'false');
                menuLink.setAttribute('aria-expanded', 'true');
            }
        }

        // Event listeners
        hamburgerBtn.addEventListener('click', openMenu);
        closeBtn.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);

        // Submenu toggles
        submenuLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                const submenuId = this.getAttribute('data-submenu');
                toggleSubmenu(e, submenuId, this);
            });
        });

        // Close menu on ESC key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && sideMenu.classList.contains('active')) {
                closeMenu();
            }

            // Focus trap
            if (sideMenu.classList.contains('active') && e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        e.preventDefault();
                        lastFocusableElement.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        e.preventDefault();
                        firstFocusableElement.focus();
                    }
                }
            }
        });

        // Announce menu state to screen readers
        function announceToScreenReader(message) {
            const announcement = document.createElement('div');
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.className = 'sr-only';
            announcement.textContent = message;
            document.body.appendChild(announcement);
            setTimeout(() => announcement.remove(), 1000);
        }