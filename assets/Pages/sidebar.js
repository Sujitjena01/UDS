class MainSidebar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <aside class="sidebar" id="sidebar">

            <button class="sidebar__collapse-btn" id="collapseBtn" title="Collapse sidebar">
                <i class="fa fa-chevron-left"></i>
            </button>

            <a href="#" class="sidebar__logo">
                <img src="assets/images/white-logo-with-green-bizli.png" alt="TPCODL Logo" />
            </a>

            <nav class="nav">
                <ul>

                    <li class="btnToggle" data-div="dashboard" data-chevron="ch-dashboard">
                        <a href="#">
                            <span class="nav__icon"><i class="fa-solid fa-gauge-high"></i></span>
                            <span class="nav__label">Dashboard</span>
                            <span class="nav__chevron" id="ch-dashboard">
                                <i class="fa fa-chevron-right"></i>
                            </span>
                        </a>
                        <ul id="dashboard" class="toggleDiv">
                            <li><a href="#">Basic Dashboard</a></li>
                            <li><a href="#">Peer Dashboard</a></li>
                            <li><a href="#">Hierarchy Dashboard</a></li>
                            <li><a href="#">Draft Entry Dashboard</a></li>
                        </ul>
                    </li>

                    <li>
                        <a href="#">
                            <span class="nav__icon"><i class="fa-regular fa-file-lines"></i></span>
                            <span class="nav__label">Option</span>
                        </a>
                    </li>

                </ul>
            </nav>

            <div class="sidebar__bottom">
                <a href="#" class="sidebar__settings">
                    <span class="sidebar__settings-icon"><i class="fa-solid fa-gear"></i></span>
                    <span class="sidebar__settings-label">Settings</span>
                </a>
                <a href="#" class="sidebar__profile">
                    <img class="sidebar__profile-avatar" src="assets/images/profile.webp" alt="Sujit Kumar Jena" />
                    <div class="sidebar__profile-info">
                        <span class="sidebar__profile-name">Sujit Kumar Jena</span>
                        <span class="sidebar__profile-role">Account Settings</span>
                    </div>
                </a>
            </div>

        </aside>
        `;

        this._init();
        this._initMobile();
    }

    _init() {
        const root        = this;
        const sidebar     = root.querySelector('#sidebar');
        const collapseBtn = root.querySelector('#collapseBtn');

        function expandIfCollapsed() {
            if (sidebar.classList.contains('collapsed')) {
                sidebar.classList.remove('collapsed');
            }
        }

        // ── Plain nav links (no submenu) ───────────────────────────
        root.querySelectorAll('.nav > ul > li:not(.btnToggle) > a').forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                expandIfCollapsed();

                root.querySelectorAll('.btnToggle.open').forEach(function (el) {
                    el.classList.remove('open');
                    el.querySelector('.toggleDiv').style.display = 'none';
                    el.querySelector('.nav__chevron').classList.remove('rotated');
                });

                root.querySelectorAll('.nav > ul > li').forEach(li => li.classList.remove('active'));
                root.querySelectorAll('.toggleDiv li').forEach(li => li.classList.remove('active'));
                this.closest('li').classList.add('active');
            });
        });

        // ── Submenu items ──────────────────────────────────────────
        root.querySelectorAll('.toggleDiv li a').forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                expandIfCollapsed();

                root.querySelectorAll('.nav > ul > li').forEach(li => li.classList.remove('active'));
                root.querySelectorAll('.toggleDiv li').forEach(li => li.classList.remove('active'));

                this.closest('li').classList.add('active');
                this.closest('.btnToggle').classList.add('active');
            });
        });

        // ── Submenu accordion ──────────────────────────────────────
        root.querySelectorAll('.btnToggle').forEach(function (item) {
            item.querySelector(':scope > a').addEventListener('click', function (e) {
                e.preventDefault();
                expandIfCollapsed();

                const targetId  = item.dataset.div;
                const chevronId = item.dataset.chevron;
                const submenu   = root.querySelector('#' + targetId);
                const chevron   = root.querySelector('#' + chevronId);
                const isOpen    = item.classList.contains('open');

                root.querySelectorAll('.btnToggle.open').forEach(function (el) {
                    el.classList.remove('open');
                    el.querySelector('.toggleDiv').style.display = 'none';
                    el.querySelector('.nav__chevron').classList.remove('rotated');
                });

                if (!isOpen) {
                    item.classList.add('open');
                    submenu.style.display = 'block';
                    chevron.classList.add('rotated');
                }
            });
        });

        // ── Collapse button ────────────────────────────────────────
        collapseBtn.addEventListener('click', function () {
            sidebar.classList.toggle('collapsed');
        });

        // ── Default open: first dashboard item active ──────────────
        (function () {
            const dashToggle = root.querySelector('[data-div="dashboard"]');
            const submenu    = root.querySelector('#dashboard');
            const chevron    = root.querySelector('#ch-dashboard');
            const firstItem  = submenu.querySelector('li:first-child');

            dashToggle.classList.add('open');
            submenu.style.display = 'block';
            chevron.classList.add('rotated');

            firstItem.classList.add('active');
            dashToggle.classList.add('active');
        })();
    }

    _initMobile() {
        const sidebar      = this.querySelector('#sidebar');
        const mobileToggle = document.getElementById('mobileToggle');
        const overlay      = document.getElementById('sidebarOverlay');

        if (mobileToggle) {
            mobileToggle.addEventListener('click', function () {
                sidebar.classList.toggle('open');
                overlay.classList.toggle('active');
            });
        }

        if (overlay) {
            overlay.addEventListener('click', function () {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            });
        }
    }
}

customElements.define('main-sidebar', MainSidebar);