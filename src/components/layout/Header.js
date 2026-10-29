// Header - Navegación superior
import { store } from '../../store/index.js';

export class Header extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this._setupEvents();
    this._subscribe();
  }

  disconnectedCallback() {
    this._unsubscribe?.();
  }

  _subscribe() {
    this._unsubscribe = store.subscribe('user', () => this.render());
    store.subscribe('ui.theme', () => this._updateThemeIcon());
  }

  _setupEvents() {
    const menuBtn = this.shadowRoot.getElementById('menuBtn');
    const themeBtn = this.shadowRoot.getElementById('themeBtn');
    const profileBtn = this.shadowRoot.getElementById('profileBtn');
    
    menuBtn?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('sidebar-toggle', { bubbles: true, composed: true }));
    });
    
    themeBtn?.addEventListener('click', () => this._cycleTheme());
    profileBtn?.addEventListener('click', () => this._showProfileMenu());
  }

  _cycleTheme() {
    const themes = ['light', 'dark', 'system'];
    const current = store.get('ui.theme') || 'system';
    const next = themes[(themes.indexOf(current) + 1) % themes.length];
    store.settings.set('theme', next);
  }

  _updateThemeIcon() {
    const btn = this.shadowRoot.getElementById('themeBtn');
    const theme = store.get('ui.theme') || 'system';
    const icons = { light: '☀️', dark: '🌙', system: '💻' };
    if (btn) btn.textContent = icons[theme] || icons.system;
  }

  _showProfileMenu() {
    // Simple dropdown - could be enhanced
    const user = store.get('user');
    if (user.authenticated) {
      alert(`Usuario: ${user.name}\nEmail: ${user.email}`);
    } else {
      alert('Inicia sesión para ver tu perfil');
    }
  }

  render() {
    const user = store.get('user');
    const theme = store.get('ui.theme') || 'system';
    const themeIcons = { light: '☀️', dark: '🌙', system: '💻' };
    const streak = store.get('session.streak') || 0;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: var(--header-height, 64px);
          padding: 0 var(--spacing-lg);
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .header-left { display: flex; align-items: center; gap: var(--spacing-md); }
        .header-right { display: flex; align-items: center; gap: var(--spacing-sm); }
        .logo { display: flex; align-items: center; gap: var(--spacing-sm); text-decoration: none; color: var(--text-primary); font-weight: 700; font-size: var(--font-size-xl); }
        .logo-icon { font-size: 1.5rem; }
        .logo-text { display: none; }
        @media (min-width: 640px) { .logo-text { display: block; } }
        .streak-badge { display: flex; align-items: center; gap: 4px; padding: 4px 10px; background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; border-radius: 999px; font-size: var(--font-size-sm); font-weight: 600; }
        .btn-icon { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border: none; background: transparent; border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; transition: all var(--transition-fast); }
        .btn-icon:hover { background: var(--bg-tertiary); color: var(--text-primary); }
        .btn-icon:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
        .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: var(--font-size-sm); cursor: pointer; }
      </style>
      
      <header class="header" role="banner">
        <div class="header-left">
          <button class="btn-icon sidebar-toggle" id="menuBtn" aria-label="Menú" title="Menú">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <a href="#/" class="logo" aria-label="Ir al inicio">
            <span class="logo-icon">🧮</span>
            <span class="logo-text">MateBásico</span>
          </a>
          ${streak > 0 ? `<span class="streak-badge">🔥 ${streak} días</span>` : ''}
        </div>
        <div class="header-right">
          <button class="btn-icon" id="themeBtn" aria-label="Cambiar tema" title="Tema: ${theme}">${themeIcons[theme] || '💻'}</button>
          ${user.authenticated ? `
            <button class="user-avatar" id="profileBtn" aria-label="Perfil">${user.name?.[0]?.toUpperCase() || 'U'}</button>
          ` : `
            <a href="#/login" class="btn-icon" aria-label="Iniciar sesión">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </a>
          `}
        </div>
      </header>
    `;
  }
}

if (!customElements.get('app-header')) {
  customElements.define('app-header', Header);
}