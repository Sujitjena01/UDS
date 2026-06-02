class TopBar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="topbar">
        <div class="topbar__left">
          <h1 class="topbar__title">Welcome back, Sujit</h1>
          <p class="topbar__subtitle">
            Measure your advertising ROI and report website traffic.
          </p>
        </div>

        <div class="topbar__right">
          <div class="topbar__search">
            <i class="fa fa-magnifying-glass"></i>
            <input type="text" placeholder="Search for..." />
          </div>

          <button class="tp-btn tp-btn--primary">
            Export data <i class="fa-solid fa-download"></i>
          </button>

          <button class="tp-btn tp-btn--accent">
            Create report <i class="fa-solid fa-plus"></i>
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
  }
}

customElements.define('main-topbar', TopBar);