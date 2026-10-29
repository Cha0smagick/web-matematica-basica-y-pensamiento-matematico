// PracticePage - Práctica espaciada y mixta
import { store } from '../store/index.js';

export class PracticePage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._type = 'mixed';
  }

  connectedCallback() {
    const path = window.location.hash.slice(1);
    const match = path.match(/^\/practice\/(.+)$/);
    this._type = match ? match[1] : 'mixed';
    this.render();
  }

  render() {
    const typeLabels = {
      mixed: 'Práctica Mixta',
      review: 'Repaso Espaciado',
      weak: 'Refuerzo de Áreas Débiles'
    };

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .practice-page { padding: var(--spacing-lg); max-width: 800px; margin: 0 auto; }
        .practice-header { display: flex; align-items: center; gap: var(--spacing-md); margin-bottom: var(--spacing-xl); flex-wrap: wrap; }
        .back-btn { color: var(--text-muted); font-size: var(--font-size-sm); text-decoration: none; }
        .back-btn:hover { color: var(--primary); }
        .practice-info h1 { margin: 0; font-size: var(--font-size-3xl); }
        .practice-info p { margin: var(--spacing-xs) 0 0 0; color: var(--text-muted); }
        .mode-tabs { display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-xl); border-bottom: 1px solid var(--border-color); }
        .mode-tab { padding: var(--spacing-sm) var(--spacing-md); font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); color: var(--text-muted); border-bottom: 2px solid transparent; cursor: pointer; transition: all var(--transition-fast); }
        .mode-tab.active { color: var(--primary); border-bottom-color: var(--primary); }
        .mode-tab:hover { color: var(--text-secondary); }
        .practice-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: var(--spacing-xl); margin-bottom: var(--spacing-xl); }
        .practice-question { font-size: var(--font-size-xl); font-weight: var(--font-weight-semibold); margin-bottom: var(--spacing-lg); line-height: var(--line-height-relaxed); }
        .practice-options { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-md); }
        .practice-option { padding: var(--spacing-lg); border: 2px solid var(--border-color); border-radius: var(--radius-lg); background: var(--bg-primary); cursor: pointer; transition: all var(--transition-fast); font-size: var(--font-size-base); }
        .practice-option:hover { border-color: var(--primary); background: var(--primary-light); }
        .practice-feedback { margin-top: var(--spacing-md); padding: var(--spacing-md); border-radius: var(--radius-md); font-size: var(--font-size-sm); }
        .practice-feedback.correct { background: var(--success-light); color: var(--success-600); border: 1px solid var(--success-200); }
        .practice-feedback.wrong { background: var(--error-light); color: var(--error-600); border: 1px solid var(--error-200); }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--spacing-md); margin-bottom: var(--spacing-xl); }
        .stat-item { background: var(--bg-tertiary); padding: var(--spacing-md); border-radius: var(--radius-lg); text-align: center; }
        .stat-value { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--primary); display: block; }
        .stat-label { font-size: var(--font-size-xs); color: var(--text-muted); margin-top: var(--spacing-xs); }
        
        @media (max-width: 640px) {
          .practice-options { grid-template-columns: 1fr; }
          .mode-tabs { overflow-x: auto; padding-bottom: var(--spacing-md); }
        }
      </style>
      
      <div class="practice-page">
        <div class="practice-header">
          <a href="#/dashboard" class="back-btn">← Volver al Dashboard</a>
          <div class="practice-info">
            <h1>${typeLabels[this._type] || 'Práctica'}</h1>
            <p>Entrena lo aprendido con ejercicios adaptados a tu nivel</p>
          </div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item"><span class="stat-value">--</span><span class="stat-label">Precisión</span></div>
          <div class="stat-item"><span class="stat-value">--</span><span class="stat-label">Racha correcta</span></div>
          <div class="stat-item"><span class="stat-value">--</span><span class="stat-label">Tiempo promedio</span></div>
        </div>
        
        <div class="mode-tabs">
          <button class="mode-tab ${this._type === 'mixed' ? 'active' : ''}" onclick="window.__APP_PRACTICE__.setType('mixed')">Mixta</button>
          <button class="mode-tab ${this._type === 'review' ? 'active' : ''}" onclick="window.__APP_PRACTICE__.setType('review')">Repaso</button>
          <button class="mode-tab ${this._type === 'weak' ? 'active' : ''}" onclick="window.__APP_PRACTICE__.setType('weak')">Refuerzo</button>
        </div>
        
        <div class="practice-card">
          <div class="practice-question">¿Cuánto es 7 + 5?</div>
          <div class="practice-options">
            <button class="practice-option" onclick="window.__APP_PRACTICE__.answer(10)">10</button>
            <button class="practice-option" onclick="window.__APP_PRACTICE__.answer(12)">12</button>
            <button class="practice-option" onclick="window.__APP_PRACTICE__.answer(14)">14</button>
            <button class="practice-option" onclick="window.__APP_PRACTICE__.answer(11)">11</button>
          </div>
          <div id="practice-feedback"></div>
        </div>
        
        <div style="text-align: center;">
          <button class="btn btn-primary" style="width: 100%;" onclick="window.__APP_PRACTICE__.nextQuestion()">Siguiente Pregunta →</button>
        </div>
      </div>
    `;
    
    this._attachPracticeListeners();
  }

  _attachPracticeListeners() {
    window.__APP_PRACTICE__ = window.__APP_PRACTICE__ || {};
    
    window.__APP_PRACTICE__.setType = (type) => {
      this._type = type;
      this.render();
    };
    
    window.__APP_PRACTICE__.answer = (selected) => {
      const correct = 12;
      const feedback = this.shadowRoot.getElementById('practice-feedback');
      if (selected === correct) {
        feedback.innerHTML = '<div class="practice-feedback correct">✅ ¡Correcto!</div>';
      } else {
        feedback.innerHTML = `<div class="practice-feedback wrong">❌ Incorrecto. La respuesta es ${correct}</div>`;
      }
    };
    
    window.__APP_PRACTICE__.nextQuestion = () => {
      this.shadowRoot.getElementById('practice-feedback').innerHTML = '';
      this.render();
    };
  }
}

if (!customElements.get('page-practice')) {
  customElements.define('page-practice', PracticePage);
}