// QuizPage - Evaluación de módulo con preguntas reales del contenido
import { store } from '../store/index.js';
import { navigateTo } from '../router.js';
import { getModule, getQuizQuestions } from '../courses/math-fundamentals/index.js';
import baseStyles from '../styles/shadow-base.css?inline';

export class QuizPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._questions = [];
    this._currentQuestion = 0;
    this._answers = [];
    this._startTime = null;
    this._finished = false;
  }

  connectedCallback() {
    this._startQuiz();
  }

  _startQuiz() {
    const path = window.location.hash.slice(1);
    const match = path.match(/^\/quiz\/(.+)$/);
    const moduleId = match ? match[1] : 'm0-1';

    this._moduleId = moduleId;
    this._module = getModule(moduleId);
    this._questions = getQuizQuestions(moduleId).map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correct: q.correct,
      explanation: q.explanation || ''
    }));
    this._currentQuestion = 0;
    this._answers = [];
    this._startTime = Date.now();
    this._finished = false;
    this.render();
  }

  render() {
    // Sin módulo o sin preguntas: pantalla clara en lugar de crash
    if (!this._module || this._questions.length === 0) {
      this.shadowRoot.innerHTML = `
        <style>${baseStyles}</style>
        <div style="padding: var(--spacing-xl); text-align: center;">
          <h1>Evaluación no disponible</h1>
          <p>El módulo "${this._moduleId}" aún no tiene evaluación.</p>
          <button class="btn btn-primary" onclick="window.__APP_ROUTER__.navigate('/')">Volver al inicio</button>
        </div>
      `;
      return;
    }

    if (this._finished) {return;} // la pantalla de resultado ya está renderizada

    const q = this._questions[this._currentQuestion];
    const progress = (this._currentQuestion / this._questions.length) * 100;
    const answered = this._answers[this._currentQuestion] !== undefined;

    this.shadowRoot.innerHTML = `
      <style>${baseStyles}</style>
      <style>
        :host { display: block; }
        .quiz-page { padding: var(--spacing-lg); max-width: 700px; margin: 0 auto; }
        .quiz-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-xl); flex-wrap: wrap; gap: var(--spacing-sm); }
        .quiz-title { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); margin: 0; }
        .quiz-progress { font-size: var(--font-size-sm); color: var(--text-muted); }
        .progress-bar-container { height: 10px; background: var(--bg-tertiary); border-radius: var(--radius-full); overflow: hidden; margin: var(--spacing-md) 0 var(--spacing-xl) 0; }
        .progress-bar { height: 100%; background: var(--primary); border-radius: var(--radius-full); width: ${progress}%; transition: width var(--transition-normal); }
        .question-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: var(--spacing-xl); margin-bottom: var(--spacing-xl); }
        .question-counter { font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--primary); margin-bottom: var(--spacing-sm); display: block; }
        .question-text { font-size: var(--font-size-xl); font-weight: var(--font-weight-semibold); margin-bottom: var(--spacing-lg); line-height: var(--line-height-relaxed); }
        .options { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-md); }
        .option-btn { padding: var(--spacing-lg); border: 2px solid var(--border-color); border-radius: var(--radius-lg); background: var(--bg-primary); cursor: pointer; transition: all var(--transition-fast); font-size: var(--font-size-base); text-align: left; color: var(--text-primary); }
        .option-btn:hover:not(:disabled) { border-color: var(--primary); background: var(--primary-light); }
        .option-btn:disabled { cursor: not-allowed; }
        .option-btn.correct { border-color: var(--success); background: var(--success-light); color: var(--success-600); }
        .option-btn.wrong { border-color: var(--error); background: var(--error-light); color: var(--error-600); }
        .feedback { margin-top: var(--spacing-md); padding: var(--spacing-md); border-radius: var(--radius-md); font-size: var(--font-size-sm); }
        .feedback.correct { background: var(--success-light); color: var(--success-600); border: 1px solid var(--border-color); }
        .feedback.wrong { background: var(--error-light); color: var(--error-600); border: 1px solid var(--border-color); }
        .nav-bar { display: flex; justify-content: space-between; align-items: center; }

        .result { text-align: center; padding: var(--spacing-xl); }
        .result-score { font-size: var(--font-size-5xl); font-weight: var(--font-weight-bold); color: var(--primary); }
        .result-pass { color: var(--success); font-size: var(--font-size-xl); font-weight: var(--font-weight-semibold); }
        .result-fail { color: var(--error); font-size: var(--font-size-xl); font-weight: var(--font-weight-semibold); }

        @media (max-width: 640px) {
          .options { grid-template-columns: 1fr; }
          .nav-bar { flex-direction: column; gap: var(--spacing-md); }
        }
      </style>

      <div class="quiz-page">
        <div class="quiz-header">
          <h1 class="quiz-title">Evaluación: ${this._module.title}</h1>
          <div class="quiz-progress">Pregunta ${this._currentQuestion + 1} de ${this._questions.length}</div>
        </div>

        <div class="progress-bar-container">
          <div class="progress-bar"></div>
        </div>

        <div class="question-card">
          <span class="question-counter">Pregunta ${this._currentQuestion + 1}</span>
          <div class="question-text">${q.question}</div>
          <div class="options">
            ${q.options.map((opt, i) => `
              <button class="option-btn ${answered ? this._getOptionClass(i, q.correct) : ''}" ${answered ? 'disabled' : ''} data-i="${i}">${opt}</button>
            `).join('')}
          </div>
          ${answered ? `<div class="feedback ${this._answers[this._currentQuestion] === q.correct ? 'correct' : 'wrong'}">
            ${this._answers[this._currentQuestion] === q.correct ? '✅ ¡Correcto!' : '❌ Incorrecto'} ${q.explanation || ''}
          </div>` : ''}
        </div>

        <div class="nav-bar">
          <button class="btn btn-ghost" ${this._currentQuestion === 0 ? 'disabled' : ''} data-prev>← Anterior</button>
          ${this._currentQuestion < this._questions.length - 1 ? `
            <button class="btn btn-primary" ${!answered ? 'disabled' : ''} data-next>Siguiente →</button>
          ` : `
            <button class="btn btn-primary" ${!answered ? 'disabled' : ''} data-finish>Finalizar Evaluación</button>
          `}
        </div>
      </div>
    `;

    this._attachQuizListeners();
  }

  _getOptionClass(index, correct) {
    if (index === correct) {return 'correct';}
    if (index === this._answers[this._currentQuestion]) {return 'wrong';}
    return '';
  }

  _attachQuizListeners() {
    const root = this.shadowRoot;
    root.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._answers[this._currentQuestion] = Number(btn.dataset.i);
        this.render();
      });
    });
    root.querySelector('[data-prev]')?.addEventListener('click', () => {
      if (this._currentQuestion > 0) { this._currentQuestion--; this.render(); }
    });
    root.querySelector('[data-next]')?.addEventListener('click', () => {
      if (this._currentQuestion < this._questions.length - 1) { this._currentQuestion++; this.render(); }
    });
    root.querySelector('[data-finish]')?.addEventListener('click', () => this.finishQuiz());
  }

  async finishQuiz() {
    const correctCount = this._answers.filter((ans, i) => ans === this._questions[i].correct).length;
    const score = Math.round((correctCount / this._questions.length) * 100);
    const passed = score >= 75;
    this._finished = true;

    const lessonsDone = await store.progress.isModuleLessonsComplete(this._moduleId);

    // Solo se completa el módulo si se aprueba; si hay todas las lecciones hechas, además marca completado
    await store.progress.completeModule(this._moduleId, {
      phaseId: this._module.phaseId,
      score,
      quizPassed: passed,
      completed: passed && lessonsDone
    });

    const stats = await store.progress.getGlobalStats();
    await store.achievements.checkAll(stats, { type: 'module-quiz', score, moduleId: this._moduleId });

    this._renderResult(score, passed);
  }

  _renderResult(score, passed) {
    this.shadowRoot.innerHTML = `
      <style>${baseStyles}</style>
      <style>
        :host { display: block; }
        .quiz-page { padding: var(--spacing-lg); max-width: 700px; margin: 0 auto; text-align: center; }
        .result-score { font-size: var(--font-size-5xl); font-weight: var(--font-weight-bold); color: var(--primary); }
        .result-pass { color: var(--success); font-size: var(--font-size-xl); font-weight: var(--font-weight-semibold); }
        .result-fail { color: var(--error); font-size: var(--font-size-xl); font-weight: var(--font-weight-semibold); }
      </style>
      <div class="quiz-page">
        <div class="result-score">${score}%</div>
        <div class="${passed ? 'result-pass' : 'result-fail'}">${passed ? '🎉 ¡Aprobado! (≥75%)' : 'Necesitas 75% para aprobar'}</div>
        <p style="color: var(--text-muted);">${passed
    ? 'Has desbloqueado la constancia de este módulo.'
    : 'Puedes reintentar cuando quieras: sin castigos, sin presión.'}</p>
        <div style="display: flex; gap: var(--spacing-md); justify-content: center; margin-top: var(--spacing-lg); flex-wrap: wrap;">
          <button class="btn btn-outline" data-retry>Reintentar</button>
          ${passed ? '<button class="btn btn-primary" data-diploma>Ver constancia</button>' : ''}
          <button class="btn btn-ghost" data-home>Ir al inicio</button>
        </div>
      </div>
    `;
    const root = this.shadowRoot;
    root.querySelector('[data-retry]').addEventListener('click', () => this._startQuiz());
    root.querySelector('[data-diploma]')?.addEventListener('click', () => navigateTo(`/diploma/module/${this._moduleId}`));
    root.querySelector('[data-home]').addEventListener('click', () => navigateTo('/'));
  }
}

if (!customElements.get('page-quiz')) {
  customElements.define('page-quiz', QuizPage);
}
