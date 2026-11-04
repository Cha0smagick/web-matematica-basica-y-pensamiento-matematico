// PracticePage - Práctica mixta con preguntas reales del curso
import { store } from '../store/index.js';
import baseStyles from '../styles/shadow-base.css?inline';

export class PracticePage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._type = 'mixed';
    this._current = null;
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

    this._loadQuestions().then(questions => {
      this._paint(typeLabels[this._type] || 'Práctica', questions);
    });
  }

  async _loadQuestions() {
    if (this._questions) {return this._questions;}
    const { getQuizQuestions } = await import('../courses/math-fundamentals/index.js');
    const mods = ['m0-1', 'm0-2', 'm0-3', 'm0-4'];
    this._questions = mods.flatMap(id => getQuizQuestions(id));
    return this._questions;
  }

  _paint(title, questions) {
    if (!questions.length) {
      this.shadowRoot.innerHTML = `<style>${baseStyles}</style><div style="padding:var(--spacing-xl)"><p>No hay preguntas disponibles todavía.</p></div>`;
      return;
    }
    this._current = this._current && questions.includes(this._current)
      ? this._current
      : questions[Math.floor(Math.random() * questions.length)];
    const q = this._current;
    const answered = this._lastAnswer === q.id;

    this.shadowRoot.innerHTML = `
      <style>${baseStyles}</style>
      <style>
        :host { display: block; }
        .practice-page { padding: var(--spacing-lg); max-width: 800px; margin: 0 auto; }
        .practice-header { display: flex; align-items: center; gap: var(--spacing-md); margin-bottom: var(--spacing-xl); flex-wrap: wrap; }
        .back-btn { color: var(--text-muted); font-size: var(--font-size-sm); text-decoration: none; }
        .back-btn:hover { color: var(--primary); }
        .practice-info h1 { margin: 0; font-size: var(--font-size-2xl); }
        .practice-info p { margin: var(--spacing-xs) 0 0 0; color: var(--text-muted); }
        .mode-tabs { display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-xl); border-bottom: 1px solid var(--border-color); flex-wrap: wrap; }
        .mode-tab { padding: var(--spacing-sm) var(--spacing-md); font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); color: var(--text-muted); border: none; border-bottom: 2px solid transparent; background: transparent; cursor: pointer; }
        .mode-tab.active { color: var(--primary); border-bottom-color: var(--primary); }
        .practice-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: var(--spacing-xl); margin-bottom: var(--spacing-xl); }
        .practice-question { font-size: var(--font-size-xl); font-weight: var(--font-weight-semibold); margin-bottom: var(--spacing-lg); line-height: var(--line-height-relaxed); }
        .practice-options { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-md); }
        .practice-option { padding: var(--spacing-lg); border: 2px solid var(--border-color); border-radius: var(--radius-lg); background: var(--bg-primary); cursor: pointer; font-size: var(--font-size-base); color: var(--text-primary); }
        .practice-option:hover:not(:disabled) { border-color: var(--primary); background: var(--primary-light); }
        .practice-option:disabled { cursor: not-allowed; }
        .practice-option.correct { border-color: var(--success); background: var(--success-light); }
        .practice-option.wrong { border-color: var(--error); background: var(--error-light); }
        .practice-feedback { margin-top: var(--spacing-md); padding: var(--spacing-md); border-radius: var(--radius-md); font-size: var(--font-size-sm); }
        .practice-feedback.correct { background: var(--success-light); color: var(--success-600); border: 1px solid var(--border-color); }
        .practice-feedback.wrong { background: var(--error-light); color: var(--error-600); border: 1px solid var(--border-color); }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--spacing-md); margin-bottom: var(--spacing-xl); }
        .stat-item { background: var(--bg-tertiary); padding: var(--spacing-md); border-radius: var(--radius-lg); text-align: center; }
        .stat-value { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--primary); display: block; }
        .stat-label { font-size: var(--font-size-xs); color: var(--text-muted); margin-top: var(--spacing-xs); }

        @media (max-width: 640px) {
          .practice-options { grid-template-columns: 1fr; }
        }
      </style>

      <div class="practice-page">
        <div class="practice-header">
          <a href="#/dashboard" class="back-btn">← Volver al Dashboard</a>
          <div class="practice-info">
            <h1>${title}</h1>
            <p>Entrena lo aprendido con ejercicios del curso</p>
          </div>
        </div>

        <div class="mode-tabs">
          <button class="mode-tab ${this._type === 'mixed' ? 'active' : ''}" data-mode="mixed">Mixta</button>
          <button class="mode-tab ${this._type === 'review' ? 'active' : ''}" data-mode="review">Repaso</button>
          <button class="mode-tab ${this._type === 'weak' ? 'active' : ''}" data-mode="weak">Refuerzo</button>
        </div>

        <div class="practice-card">
          <div class="practice-question">${q.question}</div>
          <div class="practice-options">
            ${q.options.map((opt, i) => `
              <button class="practice-option ${answered ? (i === q.correct ? 'correct' : '') : ''}" data-i="${i}" ${answered ? 'disabled' : ''}>${opt}</button>
            `).join('')}
          </div>
          <div id="practice-feedback">
            ${answered && this._lastCorrect ? '<div class="practice-feedback correct">✅ ¡Correcto! ' + (q.explanation || '') + '</div>' : ''}
            ${answered && !this._lastCorrect ? '<div class="practice-feedback wrong">❌ Incorrecto. ' + (q.explanation || '') + '</div>' : ''}
          </div>
        </div>

        <div>
          <button class="btn btn-primary btn-block" data-next>Siguiente Pregunta →</button>
        </div>
      </div>
    `;

    this._attachListeners(questions);
  }

  _attachListeners(questions) {
    const root = this.shadowRoot;
    root.querySelectorAll('.mode-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this._type = tab.dataset.mode;
        this.render();
      });
    });
    root.querySelectorAll('.practice-option').forEach(btn => {
      btn.addEventListener('click', async () => {
        const i = Number(btn.dataset.i);
        const q = this._current;
        const correct = i === q.correct;
        this._lastAnswer = q.id;
        this._lastCorrect = correct;
        // Marcar estados
        root.querySelectorAll('.practice-option').forEach((b, bi) => {
          b.disabled = true;
          if (bi === q.correct) {b.classList.add('correct');}
          else if (bi === i) {b.classList.add('wrong');}
        });
        root.getElementById('practice-feedback').innerHTML = correct
          ? `<div class="practice-feedback correct">✅ ¡Correcto! ${q.explanation || ''}</div>`
          : `<div class="practice-feedback wrong">❌ Incorrecto. ${q.explanation || ''}</div>`;
        try {
          await store.progress.recordPracticeAttempt({ questionId: q.id, correct, type: 'practice-mixed' });
        } catch (e) { /* sin bloquear la práctica */ }
      });
    });
    root.querySelector('[data-next]').addEventListener('click', () => {
      this._lastAnswer = null;
      this._current = questions[Math.floor(Math.random() * questions.length)];
      this.render();
    });
  }
}

if (!customElements.get('page-practice')) {
  customElements.define('page-practice', PracticePage);
}
