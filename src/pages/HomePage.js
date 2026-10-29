// HomePage - Landing con demo interactiva y marketing
import { store } from '../store/index.js';
import { navigateTo } from '../router.js';

export class HomePage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this._setupEvents();
  }

  _setupEvents() {
    const startBtn = this.shadowRoot.getElementById('btn-start');
    const demoBtn = this.shadowRoot.getElementById('btn-demo');
    
    startBtn?.addEventListener('click', () => {
      // Iniciar usuario invitado si no existe
      if (!store.get('user.authenticated')) {
        store.set('user.name', 'Estudiante');
        store.set('user.authenticated', true);
        store.set('user.id', 'guest-' + Date.now());
      }
      navigateTo('/lesson/l0-1-1');
    });
    
    demoBtn?.addEventListener('click', () => {
      navigateTo('/lesson/l0-1-1');
    });
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .hero {
          min-height: 70vh;
          background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-16) var(--spacing-lg);
          text-align: center;
        }
        [data-theme="dark"] .hero {
          background: linear-gradient(135deg, var(--primary-900) 0%, var(--neutral-900) 100%);
        }
        .hero-content { max-width: 800px; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: var(--spacing-sm);
          padding: var(--spacing-xs) var(--spacing-md);
          background: var(--primary); color: white; border-radius: var(--radius-full);
          font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold);
          margin-bottom: var(--spacing-md);
        }
        .hero h1 { font-size: var(--font-size-5xl); margin-bottom: var(--spacing-lg); line-height: var(--line-height-tight); }
        .hero p { font-size: var(--font-size-lg); color: var(--text-secondary); margin-bottom: var(--spacing-xl); line-height: var(--line-height-relaxed); }
        .hero-actions { display: flex; gap: var(--spacing-md); justify-content: center; flex-wrap: wrap; }
        
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-lg); margin: var(--spacing-20) 0; padding: var(--spacing-xl) 0; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); }
        .stat-card { text-align: center; padding: var(--spacing-lg); background: var(--bg-tertiary); border-radius: var(--radius-xl); }
        .stat-number { font-size: var(--font-size-4xl); font-weight: var(--font-weight-bold); color: var(--primary); display: block; }
        .stat-label { color: var(--text-muted); font-size: var(--font-size-sm); margin-top: var(--spacing-xs); }
        
        .features { padding: var(--spacing-20) 0; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--spacing-lg); max-width: 1200px; margin: 0 auto; }
        .feature-card { padding: var(--spacing-xl); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); transition: transform var(--transition-normal); }
        .feature-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        .feature-icon { font-size: var(--font-size-3xl); margin-bottom: var(--spacing-md); }
        .feature-title { font-size: var(--font-size-xl); margin-bottom: var(--spacing-sm); }
        .feature-desc { color: var(--text-secondary); font-size: var(--font-size-sm); line-height: var(--line-height-relaxed); }
        
        .cta-section { padding: var(--spacing-20) 0; background: var(--bg-tertiary); text-align: center; }
        .demo-preview { max-width: 600px; margin: 0 auto var(--spacing-xl); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: var(--spacing-lg); }
        
        @media (max-width: 640px) {
          .hero h1 { font-size: var(--font-size-3xl); }
          .hero-actions { flex-direction: column; }
          .btn-lg { width: 100%; }
        }
      </style>
      
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <span class="hero-badge">🎓 Curso Gratis • Sin Ansiedad • Con Diploma</span>
          <h1>De <span style="color: var(--primary)">"odio las mates"</span> a "entiendo el mundo"</h1>
          <p>Curso profesional completo de Matemática Básica y Pensamiento Matemático. Diseñado para quienes parten de cero, incluso si sienten repulsión por los números. Lecciones de 5-7 minutos, gráficas interactivas, fórmulas explicadas al pasar el mouse, y diplomas honorarios por cada logro.</p>
          <div class="hero-actions">
            <button class="btn btn-primary btn-lg" id="btn-start">Empezar Gratis Ahora →</button>
            <button class="btn btn-outline btn-lg" id="btn-demo">Probar Primera Lección</button>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <section class="stats">
        <div class="stat-card"><span class="stat-number">6</span><span class="stat-label">Fases del curso</span></div>
        <div class="stat-card"><span class="stat-number">24</span><span class="stat-label">Módulos</span></div>
        <div class="stat-card"><span class="stat-number">180+</span><span class="stat-label">Lecciones</span></div>
        <div class="stat-card"><span class="stat-number">600+</span><span class="stat-label">Ejercicios</span></div>
        <div class="stat-card"><span class="stat-number">6</span><span class="stat-label">Diplomas Honorarios</span></div>
        <div class="stat-card"><span class="stat-number">20 min</span><span class="stat-label">al día</span></div>
      </section>

      <!-- Features -->
      <section class="features">
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🧠</div>
            <div class="feature-title">Para Cero Experiencia</div>
            <div class="feature-desc">Empieza desde subitizing (reconocer cantidad sin contar). No se asume nada previo.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <div class="feature-title">Extremadamente Intuitivo</div>
            <div class="feature-desc">Analogías cotidianas, visualizaciones interactivas y un concepto a la vez.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📐</div>
            <div class="feature-title">Fórmulas con Hover</div>
            <div class="feature-desc">Pasa el mouse sobre cualquier símbolo LaTeX para ver qué significa.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <div class="feature-title">Gráficas Interactivas</div>
            <div class="feature-desc">Funciones, parábolas, integrales y más con deslizadores en tiempo real.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🏅</div>
            <div class="feature-title">Diplomas Honorarios</div>
            <div class="feature-desc">Certificados por lección, módulo, fase y curso completo. Verificables.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💚</div>
            <div class="feature-title">Sin Ansiedad Matemática</div>
            <div class="feature-desc">Sin temporizadores, reintentos ilimitados, mentalidad de crecimiento.</div>
          </div>
        </div>
      </section>

      <!-- CTA / Demo -->
      <section class="cta-section">
        <h2 style="font-size: var(--font-size-3xl); margin-bottom: var(--spacing-lg);">¿Listo para empezar?</h2>
        <p style="color: var(--text-muted); margin-bottom: var(--spacing-xl); max-width: 600px; margin-left: auto; margin-right: auto;">Tu primera lección dura menos de 6 minutos. Garantizado.</p>
        <div class="demo-preview">
          <div style="text-align: center; color: var(--text-muted); font-size: var(--font-size-sm); margin-bottom: var(--spacing-md);">
            Vista previa interactiva
          </div>
          <div id="demo-container">
            <latex-renderer latex="2 + 3 = 5" display-mode size="lg"></latex-renderer>
            <div style="margin-top: var(--spacing-md);">
              <button class="btn btn-primary btn-sm" id="btn-demo-start">¡Empezar la Lección 1!</button>
            </div>
          </div>
        </div>
      </section>
    `;

    this._setupDemoEvents();
  }

  _setupDemoEvents() {
    const btn = this.shadowRoot.getElementById('btn-demo-start');
    btn?.addEventListener('click', () => {
      if (!store.get('user.authenticated')) {
        store.set('user.name', 'Estudiante');
        store.set('user.authenticated', true);
        store.set('user.id', 'guest-' + Date.now());
      }
      navigateTo('/lesson/l0-1-1');
    });
  }
}

if (!customElements.get('page-home')) {
  customElements.define('page-home', HomePage);
}