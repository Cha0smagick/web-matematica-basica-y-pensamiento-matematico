// ModulePage - Vista de un módulo con sus lecciones y quiz
export class ModulePage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const path = window.location.hash.slice(1);
    const match = path.match(/^\/module\/(.+)$/);
    const moduleId = match ? match[1] : 'm0-1';
    
    const moduleData = {
      'm0-1': { title: 'Conteo y Cantidad', lessons: 5, phase: 'phase-0' },
      'm0-2': { title: 'Operaciones Básicas', lessons: 5, phase: 'phase-0' },
      'm0-3': { title: 'Fracciones y Partes', lessons: 5, phase: 'phase-0' },
      'm0-4': { title: 'Decimales y Porcentajes', lessons: 5, phase: 'phase-0' },
      'm1-1': { title: 'Enteros y Recta Numérica', lessons: 8, phase: 'phase-1' },
      'm1-2': { title: 'Potencias y Raíces', lessons: 8, phase: 'phase-1' },
      'm1-3': { title: 'Expresiones Algebraicas', lessons: 7, phase: 'phase-1' },
      'm1-4': { title: 'Ecuaciones Lineales', lessons: 7, phase: 'phase-1' },
      'm2-1': { title: 'Sistemas de Ecuaciones', lessons: 8, phase: 'phase-2' },
      'm2-2': { title: 'Polinomios y Factorización', lessons: 8, phase: 'phase-2' },
      'm2-3': { title: 'Ecuaciones Cuadráticas', lessons: 7, phase: 'phase-2' },
      'm2-4': { title: 'Funciones', lessons: 7, phase: 'phase-2' },
      'm3-1': { title: 'Geometría Plana', lessons: 8, phase: 'phase-3' },
      'm3-2': { title: 'Geometría Analítica', lessons: 7, phase: 'phase-3' },
      'm3-3': { title: 'Transformaciones', lessons: 8, phase: 'phase-3' },
      'm3-4': { title: 'Trigonometría Básica', lessons: 7, phase: 'phase-3' },
      'm4-1': { title: 'Tipos de Funciones', lessons: 9, phase: 'phase-4' },
      'm4-2': { title: 'Límites Intuitivos', lessons: 9, phase: 'phase-4' },
      'm4-3': { title: 'Derivada', lessons: 9, phase: 'phase-4' },
      'm4-4': { title: 'Integral', lessons: 8, phase: 'phase-4' },
      'm5-1': { title: 'Estadística Descriptiva', lessons: 7, phase: 'phase-5' },
      'm5-2': { title: 'Probabilidad', lessons: 6, phase: 'phase-5' },
      'm5-3': { title: 'Distribuciones', lessons: 6, phase: 'phase-5' },
      'm5-4': { title: 'Inferencia Básica', lessons: 6, phase: 'phase-5' },
      'm6-1': { title: 'Lógica y Argumentación', lessons: 5, phase: 'phase-6' },
      'm6-2': { title: 'Conjuntos y Relaciones', lessons: 5, phase: 'phase-6' },
      'm6-3': { title: 'Demostraciones', lessons: 5, phase: 'phase-6' },
      'm6-4': { title: 'Matemáticas en el Mundo', lessons: 5, phase: 'phase-6' }
    };

    const mod = moduleData[moduleId] || { title: 'Módulo', lessons: 5, phase: 'phase-0' };

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .module-page { padding: var(--spacing-lg); max-width: 900px; margin: 0 auto; }
        .module-header { display: flex; align-items: center; gap: var(--spacing-md); margin-bottom: var(--spacing-xl); flex-wrap: wrap; }
        .back-btn { color: var(--text-muted); font-size: var(--font-size-sm); }
        .back-btn:hover { color: var(--primary); }
        .module-badge { font-size: var(--font-size-2xl); }
        .module-info h1 { margin: 0; font-size: var(--font-size-3xl); }
        .module-info p { margin: var(--spacing-xs) 0 0 0; color: var(--text-muted); }
        
        .lessons-section { margin-bottom: var(--spacing-xl); }
        .section-title { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); margin-bottom: var(--spacing-lg); display: flex; align-items: center; gap: var(--spacing-sm); }
        .lessons-list { display: flex; flex-direction: column; gap: var(--spacing-sm); }
        .lesson-row { display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-md); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); transition: all var(--transition-fast); cursor: pointer; }
        .lesson-row:hover { border-color: var(--primary-light); background: var(--bg-tertiary); }
        .lesson-row.completed { border-color: var(--success); background: var(--success-light); }
        .lesson-number { width: 40px; height: 40px; border-radius: 50%; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; font-weight: var(--font-weight-bold); color: var(--primary); flex-shrink: 0; }
        .lesson-row.completed .lesson-number { background: var(--success); color: white; }
        .lesson-content { flex: 1; }
        .lesson-title { font-weight: var(--font-weight-semibold); display: block; }
        .lesson-desc { font-size: var(--font-size-xs); color: var(--text-muted); }
        .lesson-lock { color: var(--text-muted); font-size: var(--font-size-xs); }
        .lesson-locked { opacity: 0.6; filter: grayscale(0.5); }
        .lesson-locked .lesson-number { background: var(--bg-quaternary); color: var(--text-muted); cursor: not-allowed; }
        
        .quiz-section { background: var(--bg-tertiary); border-radius: var(--radius-xl); padding: var(--spacing-xl); border: 1px solid var(--border-color); }
        .quiz-header { display: flex; align-items: center; gap: var(--spacing-md); margin-bottom: var(--spacing-lg); }
        .quiz-icon { font-size: var(--font-size-3xl); flex-shrink: 0; }
        .quiz-info h2 { margin: 0 0 var(--spacing-xs) 0; font-size: var(--font-size-xl); }
        .quiz-info p { margin: 0; color: var(--text-muted); font-size: var(--font-size-sm); }
        .btn-quiz { width: 100%; padding: var(--spacing-md); font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); }
        
        @media (max-width: 640px) {
          .module-header { flex-direction: column; align-items: flex-start; gap: var(--spacing-md); }
        }
      </style>
      
      <div class="module-page">
        <div class="module-header">
          <a href="#/phase/${mod.phase}" class="back-btn">← Volver a la Fase</a>
          <div class="module-badge">📦</div>
          <div class="module-info">
            <h1>${mod.title}</h1>
            <p>Módulo del curso • ${mod.lessons} lecciones + evaluación final</p>
          </div>
        </div>
        
        <div class="lessons-section">
          <h2 class="section-title">📚 Lecciones del Módulo</h2>
          <div class="lessons-list">
            ${[...Array(mod.lessons)].map((_, i) => {
              const lessonNum = i + 1;
              const lessonId = `l${moduleId.replace('m','l')}-${lessonNum}`;
              const isCompleted = i < 2; // Simulado
              const isLocked = i > 2; // Simulado: solo las primeras 3 disponibles
              return `
                <div class="lesson-row ${isCompleted ? 'completed' : ''} ${isLocked ? 'lesson-locked' : ''}" ${!isLocked ? `onclick="window.__APP_ROUTER__.navigate('#/lesson/${lessonId}')"` : ''}>
                  <div class="lesson-number">${isCompleted ? '✓' : lessonNum}</div>
                  <div class="lesson-content">
                    <span class="lesson-title">Lección ${lessonNum}</span>
                    <span class="lesson-desc">${isCompleted ? 'Completada ✓' : isLocked ? 'Bloqueada - completa la lección anterior' : 'Disponible'}</span>
                  </div>
                  ${isCompleted ? '<span class="lesson-lock">✅</span>' : isLocked ? '<span class="lesson-lock">🔒</span>' : '<span class="lesson-lock">▶</span>'}
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <div class="quiz-section">
          <div class="quiz-header">
            <div class="quiz-icon">📝</div>
            <div class="quiz-info">
              <h2>Evaluación del Módulo</h2>
              <p>15 preguntas para verificar lo aprendido. Necesitas ≥75% para aprobar.</p>
            </div>
          </div>
          <button class="btn btn-primary btn-quiz" onclick="window.__APP_ROUTER__.navigate('#/quiz/${moduleId}')">Empezar Evaluación del Módulo</button>
        </div>
        
        <div style="margin-top: var(--spacing-lg); text-align: center; color: var(--text-muted);">
          <p>Completa todas las lecciones y la evaluación para obtener la Insignia de Módulo 🥈</p>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('page-module')) {
  customElements.define('page-module', ModulePage);
}