class MainFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="dashboard-footer">
                <div class="dashboard-footer__content">
                    <span>&copy; 2026 TPCODL. All Rights Reserved.</span>
                    <span>Powered by TP Odisha IT Shared Service</span>
                </div>
            </footer>
        `;
    }
}

customElements.define('main-footer', MainFooter);