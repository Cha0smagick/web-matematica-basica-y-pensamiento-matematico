// ProfilePage - Perfil de usuario con estadísticas
import { store } from '../store/index.js';

export class ProfilePage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    const stats = await store.progress.getGlobalStats();
    const user = store.get('user');
    const unlocked = store.achievements.getUnlocked();
    const locked = store.achievements.getLocked();

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .profile-page { padding: var(--spacing-lg); max-width: 800px; margin: 0 auto; }
        .profile-header { display: flex; align-items: center; gap: var(--spacing-lg); margin-bottom: var(--spacing-xl); }
        .avatar-large { width: 96px; height: 96px; border-radius: var(--radius-full); background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: var(--font-size-4xl); font-weight: var(--font-weight-bold); flex-shrink: 0; }
        .profile-info h1 { margin: 0 0 var(--spacing-xs) 0; font-size: var(--font-size-3xl); }
        .profile-info p { margin: 0; color: var(--text-muted); }
        .profile-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--spacing-md); margin-bottom: var(--spacing-xl); }
        .stat-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: var(--spacing-lg); text-align: center; }
        .stat-value { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); display: block; color: var(--primary); }
        .stat-label { font-size: var(--font-size-xs); color: var(--text-muted); margin-top: var(--spacing-xs); }
        .achievements-section { margin-bottom: var(--spacing-xl); }
        .section-title { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); margin-bottom: var(--spacing-lg); display: flex; align-items: center; gap: var(--spacing-sm); }
        .achievements-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: var(--spacing-md); }
        .achievement-card { background: var(--bg-secondary); border: 2px solid var(--border-color); border-radius: var(--radius-lg); padding: var(--spacing-md); text-align: center; transition: all var(--transition-fast); }
        .achievement-card.unlocked { border-color: var(--primary); background: var(--primary-light); }
        .achievement-card.locked { opacity: 0.6; filter: grayscale(0.5); }
        .achievement-icon { font-size: var(--font-size-3xl); margin-bottom: var(--spacing-xs); display: block; }
        .achievement-title { font-weight: var(--font-weight-semibold); font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs); }
        .achievement-desc { font-size: var(--font-size-xs); color: var(--text-muted); }
        .tier-badge { display: inline-block; font-size: var(--font-size-xs); font-weight: var(--font-weight-bold); padding: 2px 8px; border-radius: var(--radius-md); margin-top: var(--spacing-xs); }
        .tier-bronze { background: #cd7f32; color: white; }
        .tier-silver { background: #c0c0c0; color: #333; }
        .tier-gold { background: #ffd700; color: #333; }
        .tier-diamond { background: #b9f2ff; color: #000; }
        .tier-honor { background: #ffd700; color: #333; font-size: var(--font-size-xs); }
        
        @media (max-width: 640px) {
          .profile-header { flex-direction: column; text-align: center; gap: var(--spacing-md); }
          .achievements-grid { grid-template-columns: repeat(2, 1fr); }
        }
      </style>
      
      <div class="profile-page">
        <div class="profile-header">
          <div class="avatar-large">${user.name?.[0]?.toUpperCase() || 'E'}</div>
          <div class="profile-info">
            <h1>${user.name || 'Estudiante'}</h1>
            <p>${user.authenticated ? 'Usuario autenticado' : 'Modo invitado'} • ${user.email || ''}</p>
          </div>
        </div>
        
        <div class="profile-stats">
          <div class="stat-card">
            <span class="stat-value">${stats.lessonsCompleted}</span>
            <span class="stat-label">Lecciones</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${stats.modulesCompleted}</span>
            <span class="stat-label">Módulos</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${stats.phasesCompleted}</span>
            <span class="stat-label">Fases</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${stats.averageScore}%</span>
            <span class="stat-label">Puntuación Media</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">🔥 ${stats.currentStreak}</span>
            <span class="stat-label">Racha</span>
          </div>
        </div>
        
        <div class="achievements-section">
          <h2 class="section-title">🏆 Mis Logros</h2>
          <div class="achievements-grid">
            ${unlocked.map(a => `
              <div class="achievement-card unlocked">
                <span class="achievement-icon">${a.icon}</span>
                <div class="achievement-title">${a.title}</div>
                <div class="achievement-desc">${a.description}</div>
                <span class="tier-badge tier-${a.tier}">${a.tier}</span>
              </div>
            `).join('')}
            ${locked.slice(0, 6).map(a => `
              <div class="achievement-card locked">
                <span class="achievement-icon">❓</span>
                <div class="achievement-title">???</div>
                <div class="achievement-desc">Logro bloqueado</div>
                <span class="tier-badge tier-${a.tier}">${a.tier}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div style="text-align: center; margin-top: var(--spacing-xl);">
          <button class="btn btn-outline" onclick="window.__APP_ROUTER__.navigate('#/settings')">⚙️ Configuración</button>
          <button class="btn btn-error" onclick="window.__APP__.resetProgress()">🗑️ Reiniciar Progreso</button>
        </div>
      </div>
    `;
    
    this._attachProfileListeners();
  }

  _attachProfileListeners() {
    window.__APP__ = window.__APP__ || {};
    window.__APP__.resetProgress = () => {
      if (confirm('¿Estás seguro de que quieres reiniciar todo tu progreso? Esta acción no se puede deshacer.')) {
        store.reset();
      }
    };
  }
}

if (!customElements.get('page-profile')) {
  customElements.define('page-profile', ProfilePage);
}