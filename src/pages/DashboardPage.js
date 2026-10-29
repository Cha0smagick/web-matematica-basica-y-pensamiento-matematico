// DashboardPage - Panel de progreso con mapa visual
import { store } from '../store/index.js';

export class DashboardPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this._subscribe();
  }

  disconnectedCallback() {
    this._unsubscribe?.();
  }

  _subscribe() {
    this._unsubscribe = store.subscribe('course.phases', () => this.render());
  }

  async render() {
    const stats = await store.progress.getGlobalStats();
    const phases = store.get('course.phases') || {};
    const streak = store.get('session.streak') || 0;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .dashboard { padding: var(--spacing-lg); max-width: 1200px; margin: 0 auto; }
        .dashboard-header { margin-bottom: var(--spacing-xl); }
        .welcome { font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold); margin-bottom: var(--spacing-xs); }
        .subtitle { color: var(--text-muted); }
        
        .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-md); margin-bottom: var(--spacing-xl); }
        .stat-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: var(--spacing-lg); display: flex; align-items: center; gap: var(--spacing-md); }
        .stat-card .stat-icon { font-size: var(--font-size-3xl); flex-shrink: 0; }
        .stat-card .stat-info { flex: 1; }
        .stat-card .stat-value { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); display: block; }
        .stat-card .stat-label { color: var(--text-muted); font-size: var(--font-size-sm); }
        
        .streak-card { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; border-radius: var(--radius-xl); padding: var(--spacing-lg); margin-bottom: var(--spacing-xl); display: flex; justify-content: space-between; align-items: center; }
        .streak-info h3 { margin: 0 0 var(--spacing-xs) 0; font-size: var(--font-size-xl); }
        .streak-info p { margin: 0; opacity: 0.9; font-size: var(--font-size-sm); }
        .streak-number { font-size: var(--font-size-4xl); font-weight: var(--font-weight-bold); }
        
        .phases-section { margin-bottom: var(--spacing-xl); }
        .section-title { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); margin-bottom: var(--spacing-lg); display: flex; align-items: center; gap: var(--spacing-sm); }
        .phases-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--spacing-lg); }
        .phase-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); overflow: hidden; transition: all var(--transition-normal); }
        .phase-card:hover { box-shadow: var(--shadow-lg); border-color: var(--primary); }
        .phase-header { padding: var(--spacing-lg); display: flex; align-items: center; gap: var(--spacing-md); }
        .phase-number { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: var(--font-weight-bold); font-size: var(--font-size-lg); flex-shrink: 0; }
        .phase-info { flex: 1; }
        .phase-name { font-weight: var(--font-weight-semibold); display: block; margin-bottom: 4px; }
        .phase-desc { font-size: var(--font-size-xs); color: var(--text-muted); }
        .phase-progress { padding: 0 var(--spacing-lg) var(--spacing-lg); }
        .progress-bar { height: 8px; background: var(--bg-tertiary); border-radius: var(--radius-full); overflow: hidden; margin-bottom: var(--spacing-xs); }
        .progress-fill { height: 100%; background: var(--primary); border-radius: var(--radius-full); transition: width var(--transition-normal); }
        .progress-text { font-size: var(--font-size-xs); color: var(--text-muted); display: flex; justify-content: space-between; }
        .phase-actions { padding: var(--spacing-lg); border-top: 1px solid var(--border-color); display: flex; gap: var(--spacing-sm); }
        
        .next-lesson { background: var(--bg-tertiary); border-radius: var(--radius-xl); padding: var(--spacing-lg); margin-bottom: var(--spacing-xl); border-left: 4px solid var(--primary); }
        .next-lesson h3 { margin: 0 0 var(--spacing-sm) 0; font-size: var(--font-size-lg); }
        .next-lesson p { margin: 0 0 var(--spacing-md) 0; color: var(--text-secondary); }
        
        .btn-block { width: 100%; justify-content: center; }
        
        @media (max-width: 640px) {
          .stats-row { grid-template-columns: 1fr; }
          .phases-grid { grid-template-columns: 1fr; }
        }
      </style>
      
      <div class="dashboard">
        <div class="dashboard-header">
          <div class="welcome">Hola, ${store.get('user.name') || 'Estudiante'} 👋</div>
          <div class="subtitle">Aquí está tu progreso en el curso</div>
        </div>
        
        <div class="stats-row">
          <div class="stat-card" style="--spacing-md: var(--spacing-md)">
            <span class="stat-icon">📚</span>
            <div class="stat-info">
              <span class="stat-value">${stats.lessonsCompleted}</span>
              <span class="stat-label">Lecciones completadas</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">📦</span>
            <div class="stat-info">
              <span class="stat-value">${stats.modulesCompleted}</span>
              <span class="stat-label">Módulos completados</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🏆</span>
            <div class="stat-info">
              <span class="stat-value">${stats.phasesCompleted}</span>
              <span class="stat-label">Fases completadas</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">📊</span>
            <div class="stat-info">
              <span class="stat-value">${stats.averageScore}%</span>
              <span class="stat-label">Puntuación media</span>
            </div>
          </div>
        </div>
        
        <div class="streak-card">
          <div class="streak-info">
            <h3>Racha Actual</h3>
            <p>Días consecutivos estudiando</p>
          </div>
          <div class="streak-number">🔥 ${streak} días</div>
        </div>
        
        <div class="phases-section">
          <h2 class="section-title">🗺️ Mapa del Curso</h2>
          <div class="phases-grid">
            ${['phase-0', 'phase-1', 'phase-2', 'phase-3', 'phase-4', 'phase-5', 'phase-6'].map((phaseId, i) => {
              const phase = store.get(`course.phases.${phaseId}`) || { completed: false, score: 0 };
              const titles = ['Puente: Números', 'Fundamentos', 'Álgebra', 'Geometría', 'Cálculo', 'Datos', 'Pensamiento'];
              const icons = ['🌉', '🔤', '🔍', '📐', '📈', '📊', '🧠'];
              const colors = ['#3b82f6', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
              const progress = phase.score || 0;
              const isCompleted = phase.completed;
              return `
                <div class="phase-card ${isCompleted ? 'completed' : ''}" data-phase="${phaseId}">
                  <div class="phase-header">
                    <div class="phase-number" style="background: ${isCompleted ? 'var(--success)' : colors[i]}; color: ${isCompleted ? 'white' : 'white'}">${i + 1}</div>
                    <div class="phase-info">
                      <span class="phase-name">${icons[i]} ${titles[i]}</span>
                      <span class="phase-desc">Fase ${i + 1} de 6</span>
                    </div>
                  </div>
                  <div class="phase-progress">
                    <div class="progress-bar"><div class="progress-fill" style="width: ${progress}%;"></div></div>
                    <div class="progress-text"><span>${progress}%</span><span>${isCompleted ? 'Completado' : 'Pendiente'}</span></div>
                  </div>
                  <div class="phase-actions">
                    <button class="btn btn-${isCompleted ? 'outline' : 'primary'} btn-sm" onclick="window.__APP_ROUTER__.navigate('#/phase/${phaseId}')">
                      ${isCompleted ? 'Repasar' : 'Empezar'}
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <div class="next-lesson">
          <h3>🎯 Tu Próximo Paso</h3>
          <p>Continúa desde donde lo dejaste o empieza desde el principio.</p>
          <button class="btn btn-primary btn-block" onclick="window.__APP_ROUTER__.navigate('#/lesson/l0-1-1')">Ir a mi primera lección pendiente</button>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('page-dashboard')) {
  customElements.define('page-dashboard', DashboardPage);
}