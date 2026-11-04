// DashboardPage - Panel de progreso con mapa visual del curso real
import { store } from '../store/index.js';
import { courseManifest, getPhaseModules, isPhaseAvailable } from '../courses/math-fundamentals/index.js';
import baseStyles from '../styles/shadow-base.css?inline';

export class DashboardPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    const stats = await store.progress.getGlobalStats();
    const completedModules = await store.progress.getCompletedModuleIds();
    const phases = courseManifest.phases || [];
    const streak = store.get('session.streak') || 0;

    const phaseRows = phases.map((phase, i) => {
      const mods = getPhaseModules(phase.id);
      const available = mods.length > 0;
      const doneCount = mods.filter(m => completedModules.includes(m.id)).length;
      const pct = available && mods.length
        ? Math.round((doneCount / mods.length) * 100)
        : 0;
      return { phase, i, available, doneCount, total: mods.length, pct };
    });

    this.shadowRoot.innerHTML = `
      <style>${baseStyles}</style>
      <style>
        :host { display: block; }
        .dashboard { padding: var(--spacing-lg); max-width: 1200px; margin: 0 auto; }
        .welcome { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); margin-bottom: var(--spacing-xs); }
        .subtitle { color: var(--text-muted); }

        .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-md); margin-bottom: var(--spacing-xl); }
        .stat-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: var(--spacing-lg); display: flex; align-items: center; gap: var(--spacing-md); }
        .stat-card .stat-icon { font-size: var(--font-size-2xl); }
        .stat-card .stat-value { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); display: block; }
        .stat-card .stat-label { color: var(--text-muted); font-size: var(--font-size-sm); }

        .streak-card { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; border-radius: var(--radius-xl); padding: var(--spacing-lg); margin-bottom: var(--spacing-xl); display: flex; justify-content: space-between; align-items: center; }
        .streak-info h3 { margin: 0 0 var(--spacing-xs) 0; font-size: var(--font-size-xl); }
        .streak-info p { margin: 0; opacity: 0.9; font-size: var(--font-size-sm); }
        .streak-number { font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold); }

        .section-title { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); margin-bottom: var(--spacing-lg); }
        .phases-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--spacing-lg); }
        .phase-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); overflow: hidden; }
        .phase-card.unavailable { opacity: 0.7; }
        .phase-header { padding: var(--spacing-lg); display: flex; align-items: center; gap: var(--spacing-md); }
        .phase-number { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: var(--font-weight-bold); flex-shrink: 0; color: white; }
        .phase-name { font-weight: var(--font-weight-semibold); display: block; margin-bottom: 4px; }
        .phase-desc { font-size: var(--font-size-xs); color: var(--text-muted); }
        .phase-progress { padding: 0 var(--spacing-lg) var(--spacing-lg); }
        .progress-bar { height: 8px; background: var(--bg-tertiary); border-radius: var(--radius-full); overflow: hidden; margin-bottom: var(--spacing-xs); }
        .progress-fill { height: 100%; background: var(--primary); transition: width var(--transition-normal); }
        .progress-text { font-size: var(--font-size-xs); color: var(--text-muted); display: flex; justify-content: space-between; }
        .phase-actions { padding: var(--spacing-lg); border-top: 1px solid var(--border-color); }

        .next-lesson { background: var(--bg-tertiary); border-radius: var(--radius-xl); padding: var(--spacing-lg); border-left: 4px solid var(--primary); }
        .next-lesson h3 { margin: 0 0 var(--spacing-sm) 0; font-size: var(--font-size-lg); }

        @media (max-width: 640px) {
          .stats-row, .phases-grid { grid-template-columns: 1fr; }
        }
      </style>

      <div class="dashboard">
        <div class="dashboard-header">
          <div class="welcome">Hola, ${store.get('user.name') || 'Estudiante'} 👋</div>
          <div class="subtitle">Aquí está tu progreso en el curso</div>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-icon">📚</span>
            <div><span class="stat-value">${stats.lessonsCompleted}</span><span class="stat-label">Lecciones completadas</span></div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">📦</span>
            <div><span class="stat-value">${stats.modulesCompleted}</span><span class="stat-label">Módulos completados</span></div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🏆</span>
            <div><span class="stat-value">${stats.phasesCompleted}</span><span class="stat-label">Fases completadas</span></div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🎯</span>
            <div><span class="stat-value">${stats.practiceAccuracy}%</span><span class="stat-label">Precisión en práctica</span></div>
          </div>
        </div>

        <div class="streak-card">
          <div class="streak-info">
            <h3>Racha Actual</h3>
            <p>Días consecutivos estudiando</p>
          </div>
          <div class="streak-number">🔥 ${streak} días</div>
        </div>

        <h2 class="section-title">🗺️ Mapa del Curso</h2>
        <div class="phases-grid">
          ${phaseRows.map(({ phase, i, available, doneCount, total, pct }) => `
            <div class="phase-card ${available ? '' : 'unavailable'}">
              <div class="phase-header">
                <div class="phase-number" style="background: ${available ? phase.color : 'var(--bg-quaternary)'}">${i + 1}</div>
                <div>
                  <span class="phase-name">${phase.icon} ${phase.title}</span>
                  <span class="phase-desc">${available ? `Fase ${i + 1} · ${total} módulos` : 'En desarrollo 🔒'}</span>
                </div>
              </div>
              <div class="phase-progress">
                <div class="progress-bar"><div class="progress-fill" style="width: ${pct}%"></div></div>
                <div class="progress-text"><span>${pct}%</span><span>${available ? (doneCount === total && total > 0 ? 'Completado' : `${doneCount}/${total} módulos`) : 'Próximamente'}</span></div>
              </div>
              <div class="phase-actions">
                <button class="btn ${available ? 'btn-primary' : 'btn-outline'} btn-block" onclick="window.__APP_ROUTER__.navigate('/phase/${phase.id}')" ${available ? '' : 'disabled'}>
                  ${available ? (pct > 0 ? 'Continuar' : 'Empezar') : 'No disponible'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="next-lesson" style="margin-top: var(--spacing-xl);">
          <h3>🎯 Tu Próximo Paso</h3>
          <p style="margin: 0 0 var(--spacing-md) 0; color: var(--text-secondary);">Continúa desde donde lo dejaste o empieza desde el principio.</p>
          <button class="btn btn-primary btn-block" onclick="window.__APP_ROUTER__.navigate('/lesson/l0-1-1')">Ir a la primera lección</button>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('page-dashboard')) {
  customElements.define('page-dashboard', DashboardPage);
}
