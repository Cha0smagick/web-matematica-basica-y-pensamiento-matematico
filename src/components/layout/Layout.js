// Layout principal - Web Component
export class Layout extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: grid;
          grid-template-areas:
            "header header"
            "sidebar main"
            "footer footer";
          grid-template-rows: auto 1fr auto;
          grid-template-columns: var(--sidebar-width, 280px) 1fr;
          min-height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        
        header { grid-area: header; }
        aside { grid-area: sidebar; }
        main { grid-area: main; overflow-y: auto; }
        footer { grid-area: footer; }
        
        @media (max-width: 1024px) {
          :host {
            grid-template-areas:
              "header"
              "main"
              "footer";
            grid-template-columns: 1fr;
          }
          aside {
            position: fixed;
            top: 0; left: 0; bottom: 0;
            z-index: 100;
            transform: translateX(-100%);
            transition: transform var(--transition-normal);
            box-shadow: var(--shadow-xl);
          }
          aside.open {
            transform: translateX(0);
          }
          .sidebar-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 99;
          }
          .sidebar-overlay.visible { display: block; }
        }
        
        @media (min-width: 1025px) {
          .sidebar-toggle { display: none; }
          .sidebar-overlay { display: none !important; }
        }
      </style>
      
      <header><slot name="header"></slot></header>
      <div class="sidebar-overlay" id="sidebarOverlay"></div>
      <aside id="sidebar"><slot name="sidebar"></slot></aside>
      <main id="main"><slot name="main"></slot></main>
      <footer><slot name="footer"></slot></footer>
    `;
    
    this._setupSidebarToggle();
  }

  _setupSidebarToggle() {
    const overlay = this.shadowRoot.getElementById('sidebarOverlay');
    const sidebar = this.shadowRoot.getElementById('sidebar');
    
    // Listen for toggle events
    this.addEventListener('sidebar-toggle', () => {
      const isOpen = sidebar.classList.toggle('open');
      overlay.classList.toggle('visible', isOpen);
      this.store?.set('ui.sidebarOpen', isOpen);
    });
    
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
      this.store?.set('ui.sidebarOpen', false);
    });
  }

  set store(store) {
    this._store = store;
  }

  get store() {
    return this._store || window.__APP_STORE__;
  }
}

if (!customElements.get('app-layout')) {
  customElements.define('app-layout', Layout);
}