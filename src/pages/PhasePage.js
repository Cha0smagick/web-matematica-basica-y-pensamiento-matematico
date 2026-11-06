// PhasePage - Vista de una fase con sus módulos reales
import {
  getPhase,
  getPhaseModules,
  getLessons,
  isPhaseAvailable,
} from '../courses/math-fundamentals/index.js';
import baseStyles from '../styles/shadow-base.css?inline';

export class PhasePage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const path = window.location.hash.slice(1);
    const match = path.match(/^\/phase\/(.+)$/);
    const phaseId = match ? match[1] : 'phase-0';

    const phase = getPhase(phaseId);
    if (!phase) {
      this.shadowRoot.innerHTML = `
        <style>${baseStyles}</style>
        <div style="padding: var(--spacing-xl); text-align: center;">
          <h1>Fase no encontrada</h1>
          <button class="btn btn-primary" onclick="window.__APP_ROUTER__.navigate('/')">Volver al inicio</button>
        </div>
      `;
      return;
    }

    const available = isPhaseAvailable(phaseId);
    const modules = getPhaseModules(phaseId);
    const phaseNumber = (phase.number ?? 0) + 1;
    const totalPhases = 7; // fases 0-6 en el plan

    this.shadowRoot.innerHTML = `
      <style>${baseStyles}</style>
      <style>
        :host { display: block; }
        .phase-page { padding: var(--spacing-lg); max-width: 1000px; margin: 0 auto; }
        .back-btn { color: var(--text-muted); font-size: var(--font-size-sm); text-decoration: none; display: inline-block; margin-bottom: var(--spacing-lg); }
        .back-btn:hover { color: var(--primary); }
        .phase-header { background: ${phase.color}; color: white; border-radius: var(--radius-2xl); padding: var(--spacing-2xl); margin-bottom: var(--spacing-xl); display: flex; align-items: center; gap: var(--spacing-lg); flex-wrap: wrap; }
        .phase-icon { font-size: var(--font-size-5xl); flex-shrink: 0; }
        .phase-info h1 { margin: 0 0 var(--spacing-xs) 0; font-size: var(--font-size-3xl); }
        .phase-info p { margin: 0; opacity: 0.9; }
        .phase-sub { font-size: var(--font-size-sm); opacity: 0.85; margin-top: var(--spacing-xs); }
        .modules-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--spacing-lg); }
        .module-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); overflow: hidden; transition: all var(--transition-normal); display: flex; flex-direction: column; }
        .module-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
        .module-header { padding: var(--spacing-lg); background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color); }
        .module-title { font-weight: var(--font-weight-semibold); margin-bottom: var(--spacing-xs); }
        .module-lessons { font-size: var(--font-size-xs); color: var(--text-muted); }
        .lesson-item { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md); border-radius: var(--radius-md); background: var(--bg-primary); cursor: pointer; transition: all var(--transition-fast); border: 1px solid transparent; }
        .lesson-item:hover { background: var(--bg-tertiary); border-color: var(--primary-light); }
        .lesson-info { flex: 1; }
        .lesson-number { font-weight: var(--font-weight-bold); color: var(--primary); margin-right: var(--spacing-sm); }
        .lesson-title { font-weight: var(--font-weight-medium); font-size: var(--font-size-sm); }
        .module-footer { padding: var(--spacing-lg); border-top: 1px solid var(--border-color); }
        .coming-soon { text-align: center; padding: var(--spacing-2xl); color: var(--text-muted); }

        @media (max-width: 640px) {
          .phase-header { flex-direction: column; text-align: center; }
          .modules-grid { grid-template-columns: 1fr; }
        }
      </style>

      <div class="phase-page">
        <a href="#/" class="back-btn">← Volver al inicio</a>

        <div class="phase-header">
          <div class="phase-icon">${phase.icon}</div>
          <div class="phase-info">
            <h1>${phase.title}</h1>
            <p>Fase ${phaseNumber} de ${totalPhases} del curso</p>
            <div class="phase-sub">${available ? phase.description : '🔒 Esta fase está en desarrollo. Se desbloqueará cuando esté lista.'}</div>
          </div>
        </div>

        ${
          available
            ? `
          <div class="modules-grid">
            ${modules
              .map((mod) => {
                const lessons = getLessons(mod.id);
                return `
                <div class="module-card">
                  <div class="module-header">
                    <div class="module-title">${mod.number}. ${mod.title}</div>
                    <div class="module-lessons">${lessons.length} lecciones</div>
                  </div>
                  <div style="padding: var(--spacing-lg); display: flex; flex-direction: column; gap: var(--spacing-sm); flex: 1;">
                    ${lessons
                      .map(
                        (lesson, j) => `
                      <div class="lesson-item" onclick="window.__APP_ROUTER__.navigate('/lesson/${lesson.id}')">
                        <div class="lesson-info">
                          <span class="lesson-number">L${j + 1}</span>
                          <span class="lesson-title">${lesson.title}</span>
                        </div>
                        <span>▶</span>
                      </div>
                    `
                      )
                      .join('')}
                  </div>
                  <div class="module-footer">
                    <button class="btn btn-primary btn-block" onclick="window.__APP_ROUTER__.navigate('/module/${mod.id}')">Entrar al Módulo</button>
                  </div>
                </div>
              `;
              })
              .join('')}
          </div>
        `
            : `
          <div class="coming-soon">
            <div style="font-size: var(--font-size-4xl); margin-bottom: var(--spacing-md);">🚧</div>
            <p>Las fases 1 a 6 están en desarrollo. ¡La fase 0 ya está completa y disponible!</p>
            <button class="btn btn-primary" onclick="window.__APP_ROUTER__.navigate('/phase/phase-0')">Ir a la Fase 0</button>
          </div>
        `
        }
      </div>
    `;
  }
}

if (!customElements.get('page-phase')) {
  customElements.define('page-phase', PhasePage);
}
