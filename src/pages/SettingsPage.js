// SettingsPage - Configuración de usuario
import { store } from '../store/index.js';

export class SettingsPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const settings = store.settings.getAll();
    const theme = store.get('ui.theme') || 'system';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .settings-page { padding: var(--spacing-lg); max-width: 700px; margin: 0 auto; }
        .settings-header { margin-bottom: var(--spacing-xl); }
        .settings-title { font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold); margin-bottom: var(--spacing-xs); }
        .settings-subtitle { color: var(--text-muted); }
        .settings-group { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: var(--spacing-lg); margin-bottom: var(--spacing-xl); }
        .group-title { font-size: var(--font-size-xl); font-weight: var(--font-weight-semibold); margin-bottom: var(--spacing-lg); display: flex; align-items: center; gap: var(--spacing-sm); }
        .setting-item { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) 0; border-bottom: 1px solid var(--border-color); }
        .setting-item:last-child { border-bottom: none; }
        .setting-label { flex: 1; }
        .setting-title { font-weight: var(--font-weight-medium); display: block; margin-bottom: 2px; }
        .setting-desc { font-size: var(--font-size-xs); color: var(--text-muted); }
        .setting-control { display: flex; align-items: center; gap: var(--spacing-md); }
        .theme-select { padding: var(--spacing-sm) var(--spacing-md); border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-primary); color: var(--text-primary); font-size: var(--font-size-sm); cursor: pointer; }
        .toggle { position: relative; width: 48px; height: 24px; background: var(--border-color); border-radius: 24px; cursor: pointer; transition: background var(--transition-fast); }
        .toggle.active { background: var(--primary); }
        .toggle-knob { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: white; border-radius: 50%; transition: transform var(--transition-fast); }
        .toggle.active .toggle-knob { transform: translateX(24px); }
        .btn-row { display: flex; gap: var(--spacing-md); margin-top: var(--spacing-xl); }
        .btn-action { padding: var(--spacing-md) var(--spacing-lg); font-size: var(--font-size-base); border-radius: var(--radius-lg); cursor: pointer; transition: all var(--transition-fast); }
        .btn-primary { background: var(--primary); color: white; border: none; }
        .btn-primary:hover { background: var(--primary-dark); }
        .btn-outline { border: 2px solid var(--border-color); color: var(--text-secondary); background: transparent; }
        .btn-outline:hover { border-color: var(--primary); color: var(--primary); }
        .btn-danger { border: 2px solid var(--error); color: var(--error); background: transparent; }
        .btn-danger:hover { background: var(--error-light); }
        
        @media (max-width: 640px) {
          .setting-item { flex-direction: column; align-items: flex-start; gap: var(--spacing-md); }
          .btn-row { flex-direction: column; }
          .btn-action { width: 100%; }
        }
      </style>
      
      <div class="settings-page">
        <div class="settings-header">
          <h1 class="settings-title">⚙️ Configuración</h1>
          <p class="settings-subtitle">Personaliza tu experiencia de aprendizaje</p>
        </div>
        
        <div class="settings-group">
          <h2 class="group-title">🎨 Apariencia</h2>
          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-title">Tema de color</span>
              <span class="setting-desc">Claro, oscuro o según el sistema</span>
            </div>
            <select class="theme-select" id="themeSelect">
              <option value="light" ${theme === 'light' ? 'selected' : ''}>☀️ Claro</option>
              <option value="dark" ${theme === 'dark' ? 'selected' : ''}>🌙 Oscuro</option>
              <option value="system" ${theme === 'system' ? 'selected' : ''}>💻 Sistema</option>
            </select>
          </div>
        </div>
        
        <div class="settings-group">
          <h2 class="group-title">♿ Accesibilidad</h2>
          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-title">Reducir movimiento</span>
              <span class="setting-desc">Desactivar animaciones para mayor comodidad</span>
            </div>
            <div class="setting-control">
              <div class="toggle ${settings.reducedMotion ? 'active' : ''}" id="toggleReducedMotion"></div>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-title">Alto contraste</span>
              <span class="setting-desc">Mejorar legibilidad para baja visión</span>
            </div>
            <div class="setting-control">
              <div class="toggle ${settings.highContrast ? 'active' : ''}" id="toggleHighContrast"></div>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-title">Fuente para dislexia</span>
              <span class="setting-desc">Tipografía más fácil de leer</span>
            </div>
            <div class="setting-control">
              <div class="toggle ${settings.dyslexiaFont ? 'active' : ''}" id="toggleDyslexia"></div>
            </div>
          </div>
        </div>
        
        <div class="settings-group">
          <h2 class="group-title">🔔 Notificaciones</h2>
          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-title">Recordatorio diario</span>
              <span class="setting-desc">Recibir aviso para estudiar cada día</span>
            </div>
            <div class="setting-control">
              <div class="toggle ${settings.dailyReminder ? 'active' : ''}" id="toggleReminder"></div>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-title">Sonidos de feedback</span>
              <span class="setting-desc">Sonido al responder correctamente</span>
            </div>
            <div class="setting-control">
              <div class="toggle ${settings.soundEnabled ? 'active' : ''}" id="toggleSound"></div>
            </div>
          </div>
        </div>
        
        <div class="settings-group">
          <h2 class="group-title">📊 Datos</h2>
          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-title">Exportar mi progreso</span>
              <span class="setting-desc">Descargar todos tus datos en JSON</span>
            </div>
            <button class="btn-action btn-outline" onclick="window.__APP_SETTINGS__.exportData()">Exportar</button>
          </div>
          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-title">Reiniciar progreso</span>
              <span class="setting-desc">Borrar todo y empezar de cero</span>
            </div>
            <button class="btn-action btn-danger" onclick="window.__APP_SETTINGS__.resetProgress()">Reiniciar</button>
          </div>
        </div>
        
        <div class="btn-row">
          <button class="btn-action btn-outline" onclick="window.__APP_ROUTER__.navigate('#/dashboard')">Volver al Dashboard</button>
        </div>
      </div>
    `;
    
    this._attachSettingsListeners();
  }

  _attachSettingsListeners() {
    const themeSelect = this.shadowRoot.getElementById('themeSelect');
    themeSelect?.addEventListener('change', (e) => {
      store.settings.set('theme', e.target.value);
    });

    const toggles = {
      reducedMotion: 'toggleReducedMotion',
      highContrast: 'toggleHighContrast',
      dyslexiaFont: 'toggleDyslexia',
      dailyReminder: 'toggleReminder',
      soundEnabled: 'toggleSound'
    };

    Object.entries(toggles).forEach(([key, id]) => {
      const el = this.shadowRoot.getElementById(id);
      if (el) {
        el.addEventListener('click', () => {
          const isActive = el.classList.toggle('active');
          store.settings.set(key, isActive);
        });
      }
    });

    window.__APP_SETTINGS__ = window.__APP_SETTINGS__ || {};
    
    window.__APP_SETTINGS__.exportData = async () => {
      const data = await store.progress.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mi-progreso-matematicas-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };
    
    window.__APP_SETTINGS__.resetProgress = () => {
      if (confirm('¿Estás seguro de que quieres reiniciar todo tu progreso? Esta acción no se puede deshacer.')) {
        store.reset();
      }
    };
  }
}

if (!customElements.get('page-settings')) {
  customElements.define('page-settings', SettingsPage);
}