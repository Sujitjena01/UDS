        let currentStep = 1;
        const totalSteps = 3;

        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        const successPopup = document.getElementById('successPopup');
        const closeSuccessBtn = document.getElementById('closeSuccessBtn');
        const steps = document.querySelectorAll('.step');
        const stepLines = document.querySelectorAll('.step-line');
        const sections = document.querySelectorAll('.form-section');

        function showSuccessPopup() {
            successPopup.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent background scroll
            closeSuccessBtn.focus(); // Focus on OK button for accessibility
        }

        function hideSuccessPopup() {
            successPopup.classList.remove('show');
            document.body.style.overflow = ''; // Restore scroll
        }

        closeSuccessBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hideSuccessPopup();
            // Optionally reset form and go back to step 1
            const form = document.getElementById('registrationForm');
            form.reset();
            currentStep = 1;
            updateStepper();
        });

        // Close popup on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && successPopup.classList.contains('show')) {
                hideSuccessPopup();
            }
        });

        // Close popup on overlay click
        successPopup.addEventListener('click', (e) => {
            if (e.target === successPopup) {
                hideSuccessPopup();
            }
        });

        function updateStepper() {
            steps.forEach((step, index) => {
                const stepNum = index + 1;
                const stepCircle = step.querySelector('.step-circle');
                step.classList.remove('active', 'completed');

                if (stepNum < currentStep) {
                    step.classList.add('completed');
                    stepCircle.innerHTML = '<i class="fas fa-check"></i>';
                    stepCircle.setAttribute('aria-label', `Step ${stepNum} completed`);
                } else if (stepNum === currentStep) {
                    step.classList.add('active');
                    stepCircle.textContent = stepNum;
                    stepCircle.setAttribute('aria-label', `Step ${stepNum} current`);
                } else {
                    stepCircle.textContent = stepNum;
                    stepCircle.setAttribute('aria-label', `Step ${stepNum}`);
                }
            });

            stepLines.forEach((line, index) => {
                if (index < currentStep - 1) {
                    line.classList.add('completed');
                } else {
                    line.classList.remove('completed');
                }
            });

            sections.forEach(section => {
                section.classList.remove('active');
                if (parseInt(section.dataset.section) === currentStep) {
                    section.classList.add('active');
                }
            });

            // Button visibility logic
            // if (currentStep === 1) {
            //     prevBtn.classList.add('hidden');
            // } else {
            //     prevBtn.classList.remove('hidden');
            // }

            // if (currentStep === totalSteps) {
            //     nextBtn.classList.add('hidden');
            //     submitBtn.classList.remove('hidden');
            // } else {
            //     nextBtn.classList.remove('hidden');
            //     submitBtn.classList.add('hidden');
            // }


            // Button visibility logic using inline styles
            if (currentStep === 1) {
                prevBtn.style.display = 'none';
            } else {
                prevBtn.style.display = 'block';
            }

            if (currentStep === totalSteps) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'block';
            } else {
                nextBtn.style.display = 'block';
                submitBtn.style.display = 'none';
            }
        }

        function validateCurrentStep() {
            const currentSection = document.querySelector(`.form-section[data-section="${currentStep}"]`);
            const inputs = currentSection.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;
            let firstInvalidInput = null;

            // Remove previous validation classes
            inputs.forEach(input => {
                input.classList.remove('is-invalid');
            });

            inputs.forEach(input => {
                if (!input.checkValidity()) {
                    isValid = false;
                    input.classList.add('is-invalid');
                    if (!firstInvalidInput) {
                        firstInvalidInput = input;
                    }
                }
            });

            // Focus on first invalid input
            if (firstInvalidInput) {
                firstInvalidInput.focus();
            }

            return isValid;
        }

        async function validateServerSide(stepData) {
            // Placeholder for server-side validation
            // Implement your server-side validation here if needed
            return true;
        }



        // Add real-time validation on input
        document.querySelectorAll('.form-control').forEach(input => {
            input.addEventListener('blur', function () {
                if (this.hasAttribute('required') && !this.checkValidity()) {
                    this.classList.add('is-invalid');
                } else {
                    this.classList.remove('is-invalid');
                }
            });

            input.addEventListener('input', function () {
                if (this.classList.contains('is-invalid') && this.checkValidity()) {
                    this.classList.remove('is-invalid');
                }
            });
        });

        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentStep > 1) {
                currentStep--;
                updateStepper();
            }
        });

        nextBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            // Validate client-side
            if (!validateCurrentStep()) {
                return;
            }

            if (currentStep < totalSteps) {
                currentStep++;
                updateStepper();
            }
        });

        // submitBtn.addEventListener('click', async (e) => {
        //     e.preventDefault();

        //     // Validate the final step
        //     if (!validateCurrentStep()) {
        //         return;
        //     }

        //     const form = document.getElementById('registrationForm');
        //     if (form.checkValidity()) {
        //         // Get all form data
        //         const formData = new FormData(form);

        //         // Here you can add your form submission logic
        //         // For example: send data to server
        //         // fetch('/api/submit', { method: 'POST', body: formData });

        //         showSuccessPopup();
        //     } else {
        //         form.reportValidity();
        //     }
        // });

        // Initialize
        updateStepper();



        //sidemenu
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