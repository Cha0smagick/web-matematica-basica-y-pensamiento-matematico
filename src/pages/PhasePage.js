// PhasePage - Vista de una fase con sus módulos
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
    
    const phaseData = {
      'phase-0': { title: 'Los Números Son Tus Amigos', icon: '🌉', color: '#3b82f6', modules: ['m0-1', 'm0-2', 'm0-3', 'm0-4'] },
      'phase-1': { title: 'El Lenguaje de los Patrones', icon: '🔤', color: '#16a34a', modules: ['m1-1', 'm1-2', 'm1-3', 'm1-4'] },
      'phase-2': { title: 'Resolver Misterios', icon: '🔍', color: '#f59e0b', modules: ['m2-1', 'm2-2', 'm2-3', 'm2-4'] },
      'phase-3': { title: 'Arquitecto de Formas', icon: '📐', color: '#ef4444', modules: ['m3-1', 'm3-2', 'm3-3', 'm3-4'] },
      'phase-4': { title: 'Navegante del Cambio', icon: '📈', color: '#8b5cf6', modules: ['m4-1', 'm4-2', 'm4-3', 'm4-4'] },
      'phase-5': { title: 'Analista de Datos', icon: '📊', color: '#06b6d4', modules: ['m5-1', 'm5-2', 'm5-3', 'm5-4'] },
      'phase-6': { title: 'Pensador Matemático', icon: '🧠', color: '#ec4899', modules: ['m6-1', 'm6-2', 'm6-3', 'm6-4'] }
    };

    const phase = phaseData[phaseId] || phaseData['phase-0'];
    const moduleTitles = {
      'm0-1': 'Conteo y Cantidad', 'm0-2': 'Operaciones Básicas', 'm0-3': 'Fracciones', 'm0-4': 'Decimales y Porcentajes',
      'm1-1': 'Enteros y Recta', 'm1-2': 'Potencias y Raíces', 'm1-3': 'Expresiones', 'm1-4': 'Ecuaciones Lineales',
      'm2-1': 'Sistemas', 'm2-2': 'Polinomios', 'm2-3': 'Cuadráticas', 'm2-4': 'Funciones',
      'm3-1': 'Geometría Plana', 'm3-2': 'Geometría Analítica', 'm3-3': 'Transformaciones', 'm3-4': 'Trigonometría',
      'm4-1': 'Tipos de Funciones', 'm4-2': 'Límites', 'm4-3': 'Derivadas', 'm4-4': 'Integrales',
      'm5-1': 'Estadística Descriptiva', 'm5-2': 'Probabilidad', 'm5-3': 'Distribuciones', 'm5-4': 'Inferencia',
      'm6-1': 'Lógica', 'm6-2': 'Conjuntos', 'm6-3': 'Demostraciones', 'm6-4': 'Matemáticas en el Mundo'
    };

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .phase-page { padding: var(--spacing-lg); max-width: 1000px; margin: 0 auto; }
        .phase-header { background: linear-gradient(135deg, ${phase.color}, ${phase.color}); color: white; border-radius: var(--radius-2xl); padding: var(--spacing-2xl); margin-bottom: var(--spacing-xl); display: flex; align-items: center; gap: var(--spacing-lg); }
        .phase-icon { font-size: var(--font-size-5xl); flex-shrink: 0; }
        .phase-info h1 { margin: 0 0 var(--spacing-xs) 0; font-size: var(--font-size-4xl); }
        .phase-info p { margin: 0; opacity: 0.9; font-size: var(--font-size-lg); }
        .nav-bar { display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-xl); flex-wrap: wrap; }
        .nav-btn { padding: var(--spacing-sm) var(--spacing-md); background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-full); color: var(--text-secondary); font-size: var(--font-size-sm); cursor: pointer; transition: all var(--transition-fast); }
        .nav-btn:hover { background: var(--primary-light); color: var(--primary-dark); border-color: var(--primary); }
        .nav-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
        .modules-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--spacing-lg); }
        .module-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); overflow: hidden; transition: all var(--transition-normal); display: flex; flex-direction: column; }
        .module-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
        .module-header { padding: var(--spacing-lg); background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color); }
        .module-title { font-weight: var(--font-weight-semibold); margin-bottom: var(--spacing-xs); }
        .module-lessons { font-size: var(--font-size-xs); color: var(--text-muted); }
        .module-body { padding: var(--spacing-lg); flex: 1; display: flex; flex-direction: column; gap: var(--spacing-sm); }
        .lesson-item { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md); border-radius: var(--radius-md); background: var(--bg-primary); cursor: pointer; transition: all var(--transition-fast); border: 1px solid transparent; }
        .lesson-item:hover { background: var(--bg-tertiary); border-color: var(--primary-light); }
        .lesson-item.completed { border-color: var(--success); background: var(--success-light); }
        .lesson-info { flex: 1; }
        .lesson-number { font-weight: var(--font-weight-bold); color: var(--primary); margin-right: var(--spacing-sm); }
        .lesson-title { font-weight: var(--font-weight-medium); }
        .lesson-status { font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); }
        .status-done { color: var(--success); }
        .status-pending { color: var(--text-muted); }
        .module-footer { padding: var(--spacing-lg); border-top: 1px solid var(--border-color); display: flex; gap: var(--spacing-sm); }
        .btn-go-module { width: 100%; justify-content: center; }
        
        @media (max-width: 640px) {
          .phase-header { flex-direction: column; text-align: center; gap: var(--spacing-md); }
          .modules-grid { grid-template-columns: 1fr; }
        }
      </style>
      
      <div class="phase-page">
        <a href="#/" class="btn btn-ghost" style="margin-bottom: var(--spacing-lg);">← Volver al Dashboard</a>
        
        <div class="phase-header">
          <div class="phase-icon">${phase.icon}</div>
          <div class="phase-info">
            <h1>${phase.title}</h1>
            <p>Fase ${['phase-0','phase-1','phase-2','phase-3','phase-4','phase-5','phase-6'].indexOf(phaseId) + 1} de 6 del curso</p>
          </div>
        </div>
        
        <div class="nav-bar">
          ${phase.modules.map((modId, i) => `
            <button class="nav-btn" onclick="window.__APP_ROUTER__.navigate('#/module/${modId}')">${i + 1}</button>
          `).join('')}
          <button class="nav-btn btn-outline" onclick="window.__APP_ROUTER__.navigate('#/phase/${phaseId}')" style="margin-left: auto;">Ver todo</button>
        </div>
        
        <div class="modules-grid">
          ${phase.modules.map((modId, i) => {
            const modNum = i + 1;
            return `
              <div class="module-card">
                <div class="module-header">
                  <div class="module-title">${modNum}. ${moduleTitles[modId] || 'Módulo'}</div>
                  <div class="module-lessons">5 lecciones • ~25 min</div>
                </div>
                <div class="module-body">
                  ${[1,2,3,4,5].map(j => {
                    const lessonId = `l${modId.replace('m','l')}-${j}`;
                    return `
                      <div class="lesson-item" onclick="window.__APP_ROUTER__.navigate('#/lesson/${lessonId}')" data-lesson="${lessonId}">
                        <div class="lesson-info">
                          <span class="lesson-number">L${modNum}.${j}</span>
                          <span class="lesson-title">Lección ${j}</span>
                        </div>
                        <span class="lesson-status status-pending">⏳</span>
                      </div>
                    `;
                  }).join('')}
                </div>
                <div class="module-footer">
                  <button class="btn btn-primary btn-go-module" onclick="window.__APP_ROUTER__.navigate('#/module/${modId}')">Entrar al Módulo</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <div style="margin-top: var(--spacing-xl); text-align: center; color: var(--text-muted);">
          <p>Completa todos los módulos para obtener el Certificado de Fase 🏆</p>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('page-phase')) {
  customElements.define('page-phase', PhasePage);
}