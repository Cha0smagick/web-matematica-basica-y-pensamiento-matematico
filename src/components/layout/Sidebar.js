// Sidebar - Navegación lateral con progreso
import { store } from '../../store/index.js';
import { navigateTo } from '../../router.js';

export class Sidebar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._phases = [];
  }

  connectedCallback() {
    this._loadPhases();
    this.render();
    this._setupEvents();
  }

  async _loadPhases() {
    try {
      const basePath = import.meta.env.BASE_URL || '/';
const res = await fetch(`${basePath}courses/math-fundamentals/manifest.json`);
      if (res.ok) {
        const manifest = await res.json();
        this._phases = manifest.phases || [];
        this.render();
      }
    } catch (e) {
      console.warn('Could not load phases:', e);
    }
  }

  _setupEvents() {
    this.shadowRoot.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const href = el.getAttribute('href');
        if (href) navigateTo(href);
        // Close sidebar on mobile
        this.dispatchEvent(new CustomEvent('sidebar-close', { bubbles: true }));
      });
    });
  }

  render() {
    const user = store.get('user');
    const currentPhase = store.get('course.currentPhase');
    const stats = store.get('course.phases') || {};
    const streak = store.get('session.streak') || 0;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .sidebar {
          height: 100vh;
          padding: var(--spacing-lg);
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .sidebar-section { margin-bottom: var(--spacing-xl); }
        .sidebar-title { font-size: var(--font-size-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: var(--spacing-sm); }
        .nav-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
        .nav-item { display: flex; align-items: center; gap: var(--spacing-sm); padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--radius-md); color: var(--text-secondary); text-decoration: none; font-size: var(--font-size-sm); transition: all var(--transition-fast); }
        .nav-item:hover { background: var(--bg-tertiary); color: var(--text-primary); }
        .nav-item.active { background: var(--primary-light); color: var(--primary); font-weight: 600; }
        .nav-icon { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .nav-progress { margin-left: auto; font-size: var(--font-size-xs); color: var(--text-muted); }
        .phase-card { padding: var(--spacing-md); border-radius: var(--radius-lg); background: var(--bg-tertiary); border: 1px solid var(--border-color); margin-bottom: var(--spacing-sm); }
        .phase-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-xs); }
        .phase-number { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: var(--font-size-sm); flex-shrink: 0; }
        .phase-info { flex: 1; min-width: 0; }
        .phase-name { font-weight: 600; font-size: var(--font-size-sm); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .phase-desc { font-size: var(--font-size-xs); color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .phase-progress { width: 48px; height: 48px; flex-shrink: 0; }
        .user-panel { margin-top: auto; padding-top: var(--spacing-lg); border-top: 1px solid var(--border-color); }
        .user-info { display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-md); }
        .user-avatar-lg { width: 44px; height: 44px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; }
        .user-details { flex: 1; min-width: 0; }
        .user-name { font-weight: 600; font-size: var(--font-size-sm); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-email { font-size: var(--font-size-xs); color: var(--text-muted); }
        .stat-row { display: flex; justify-content: space-between; font-size: var(--font-size-sm); margin-bottom: 4px; }
        .stat-label { color: var(--text-muted); }
        .stat-value { font-weight: 600; color: var(--text-primary); }
      </style>
      
      <nav class="sidebar" aria-label="Navegación principal">
        <div class="sidebar-section">
          <h2 class="sidebar-title">Mi Progreso</h2>
          <div class="user-panel">
            <div class="user-info">
              <div class="user-avatar-lg">${user.name?.[0]?.toUpperCase() || 'E'}</div>
              <div class="user-details">
                <div class="user-name">${user.name || 'Estudiante'}</div>
                <div class="user-email">${user.authenticated ? user.email : 'Modo invitado'}</div>
              </div>
            </div>
            <div class="stat-row"><span class="stat-label">Racha</span><span class="stat-value">🔥 ${streak} días</span></div>
            <div class="stat-row"><span class="stat-label">Lecciones</span><span class="stat-value">${stats.lessonsCompleted || 0}</span></div>
            <div class="stat-row"><span class="stat-label">Fases</span><span class="stat-value">${Object.values(stats).filter(p => p?.completed).length || 0}/6</span></div>
          </div>
        </div>

        <div class="sidebar-section">
          <h2 class="sidebar-title">Fases del Curso</h2>
          <div class="nav-list" role="list">
            ${this._phases.map((phase, i) => {
              const phaseStat = stats[phase.id] || {};
              const progress = phaseStat.score || 0;
              const isCurrent = currentPhase === phase.id;
              const isCompleted = phaseStat.completed;
              const bgColor = isCompleted ? 'var(--success)' : (isCurrent ? 'var(--primary)' : 'var(--bg-quaternary)');
              const textColor = isCompleted || isCurrent ? 'white' : 'var(--text-primary)';
              return `
                <a href="#/phase/${phase.id}" class="phase-card" data-nav>
                  <div class="phase-header">
                    <div class="phase-number" style="background: ${bgColor}; color: ${textColor};">${i + 1}</div>
                    <div class="phase-info">
                      <div class="phase-name">${phase.title}</div>
                      <div class="phase-desc">${phase.description}</div>
                    </div>
                    <svg class="phase-progress" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="var(--border-color)" stroke-width="4"/>
                      <circle cx="24" cy="24" r="20" fill="none" stroke="${isCompleted ? 'var(--success)' : 'var(--primary)'}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${progress * 1.256} 125.6" transform="rotate(-90 24 24)" style="transition: stroke-dasharray 0.5s ease;"/>
                      <text x="24" y="26" text-anchor="middle" font-size="10" fill="var(--text-primary)" font-weight="700">${progress}%</text>
                    </svg>
                  </div>
                </a>
              `;
            }).join('')}
          </div>
        </div>

        <div class="sidebar-section">
          <h2 class="sidebar-title">Herramientas</h2>
          <ul class="nav-list">
            <li><a href="#/dashboard" class="nav-item" data-nav><span class="nav-icon">📊</span>Panel de control<span class="nav-progress"></span></a></li>
            <li><a href="#/practice/mixed" class="nav-item" data-nav><span class="nav-icon">🎯</span>Práctica mixta<span class="nav-progress"></span></a></li>
            <li><a href="#/profile" class="nav-item" data-nav><span class="nav-icon">👤</span>Mi perfil<span class="nav-progress"></span></a></li>
            <li><a href="#/settings" class="nav-item" data-nav><span class="nav-icon">⚙️</span>Configuración<span class="nav-progress"></span></a></li>
          </ul>
        </div>
      </nav>
    `;
  }
}

if (!customElements.get('app-sidebar')) {
  customElements.define('app-sidebar', Sidebar);
}