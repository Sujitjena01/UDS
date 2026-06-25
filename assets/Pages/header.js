class MainTopbar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="topbar">
            <div class="topbar__left">
                <button id="mobileToggle" class="sidebar__toggle-btn">
                    <i class="fa-solid fa-bars"></i>
                </button>
                <p class="topbar__subtitle"><strong>Last Updated On:</strong> 01/06/2026 00:00:00</p>
            </div>
            <div class="topbar__right">
                <div class="topbar__search">
                    <i class="fa fa-magnifying-glass"></i>
                    <input type="text" placeholder="Search for..." />
                </div>
                <button class="tp-btn tp-btn--primary">
                    Export Data <i class="fa-solid fa-download"></i>
                </button>
                <button class="tp-btn tp-btn--accent">
                    Create Report <i class="fa-solid fa-plus"></i>
                </button>
                <label class="mode-toggle" title="Toggle light/dark mode">
                    <input type="checkbox" id="modeToggle" hidden />
                    <span class="toggle-track">
                        <span class="toggle-thumb"></span>
                    </span>
                </label>
            </div>
        </div>
        `;

        this._initTheme();
        this._initMobileToggle();
    }

    _initTheme() {
        const toggle = this.querySelector('#modeToggle');
        if (!toggle) return;

        // Apply saved theme immediately
        const saved = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
        toggle.checked = saved === 'dark';
        this._swapImages(saved);

        toggle.addEventListener('change', () => {
            const theme = toggle.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            this._swapImages(theme);
        });
    }

    _initMobileToggle() {
        const mobileToggle = this.querySelector('#mobileToggle');
        const overlay      = document.getElementById('sidebarOverlay');
        const sidebar      = document.querySelector('#sidebar');

        if (mobileToggle && sidebar) {
            mobileToggle.addEventListener('click', function () {
                sidebar.classList.toggle('open');
                if (overlay) overlay.classList.toggle('active');
            });
        }

        if (overlay && sidebar) {
            overlay.addEventListener('click', function () {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            });
        }
    }

    _swapImages(theme) {
        document.querySelectorAll('img[data-dark]').forEach(img => {
            img.src = theme === 'light' ? img.dataset.light : img.dataset.dark;
        });
    }
}

customElements.define('main-topbar', MainTopbar);