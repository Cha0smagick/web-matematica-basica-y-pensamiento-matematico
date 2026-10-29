// QuizPage - Evaluación de módulo con múltiples preguntas
import { store } from '../store/index.js';
import { navigateTo } from '../router.js';

export class QuizPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._questions = [];
    this._currentQuestion = 0;
    this._answers = [];
    this._startTime = null;
  }

  connectedCallback() {
    this.render();
    this._startQuiz();
  }

  _startQuiz() {
    const path = window.location.hash.slice(1);
    const match = path.match(/^\/quiz\/(.+)$/);
    const moduleId = match ? match[1] : 'm0-1';
    
    this._moduleId = moduleId;
    this._questions = [
      { id: 'q1', type: 'multiple-choice', question: '¿Qué es subitizing?', options: ['Contar uno por uno', 'Reconocer cantidad de vista', 'Sumar números', 'Escribir números'], correct: 1 },
      { id: 'q2', type: 'multiple-choice', question: '2 + 3 = ?', options: ['4', '5', '6', '7'], correct: 1 },
      { id: 'q3', type: 'multiple-choice', question: '5 - 2 = ?', options: ['2', '3', '4', '7'], correct: 1 },
      { id: 'q4', type: 'multiple-choice', question: '3 × 4 = ?', options: ['7', '10', '12', '14'], correct: 2 },
      { id: 'q5', type: 'multiple-choice', question: '12 ÷ 3 = ?', options: ['3', '4', '6', '9'], correct: 1 }
    ];
    this._startTime = Date.now();
    this.render();
  }

  render() {
    const q = this._questions[this._currentQuestion];
    const progress = ((this._currentQuestion) / this._questions.length) * 100;
    const answered = this._answers[this._currentQuestion] !== undefined;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .quiz-page { padding: var(--spacing-lg); max-width: 700px; margin: 0 auto; }
        .quiz-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-xl); }
        .quiz-title { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); }
        .quiz-progress { font-size: var(--font-size-sm); color: var(--text-muted); }
        .progress-bar-container { height: 10px; background: var(--bg-tertiary); border-radius: var(--radius-full); overflow: hidden; margin: var(--spacing-md) 0 var(--spacing-xl) 0; }
        .progress-bar { height: 100%; background: var(--primary); border-radius: var(--radius-full); width: ${progress}%; transition: width var(--transition-normal); }
        .question-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: var(--spacing-xl); margin-bottom: var(--spacing-xl); }
        .question-counter { font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--primary); margin-bottom: var(--spacing-sm); display: block; }
        .question-text { font-size: var(--font-size-xl); font-weight: var(--font-weight-semibold); margin-bottom: var(--spacing-lg); line-height: var(--line-height-relaxed); }
        .options { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-md); }
        .option-btn { padding: var(--spacing-lg); border: 2px solid var(--border-color); border-radius: var(--radius-lg); background: var(--bg-primary); cursor: pointer; transition: all var(--transition-fast); font-size: var(--font-size-base); text-align: left; }
        .option-btn:hover:not(:disabled) { border-color: var(--primary); background: var(--primary-light); }
        .option-btn:disabled { cursor: not-allowed; }
        .option-btn.selected { border-color: var(--primary); background: var(--primary-light); }
        .option-btn.correct { border-color: var(--success); background: var(--success-light); color: var(--success-600); }
        .option-btn.wrong { border-color: var(--error); background: var(--error-light); color: var(--error-600); }
        .feedback { margin-top: var(--spacing-md); padding: var(--spacing-md); border-radius: var(--radius-md); font-size: var(--font-size-sm); }
        .feedback.correct { background: var(--success-light); color: var(--success-600); border: 1px solid var(--success-200); }
        .feedback.wrong { background: var(--error-light); color: var(--error-600); border: 1px solid var(--error-200); }
        .nav-bar { display: flex; justify-content: space-between; align-items: center; }
        .nav-btn { padding: var(--spacing-md) var(--spacing-lg); font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); border-radius: var(--radius-lg); cursor: pointer; transition: all var(--transition-fast); }
        .nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .nav-btn.prev { color: var(--text-muted); border: 1px solid var(--border-color); background: transparent; }
        .nav-btn.next { background: var(--primary); color: white; border: none; }
        .nav-btn.finish { background: var(--success); color: white; border: none; }
        
        @media (max-width: 640px) {
          .options { grid-template-columns: 1fr; }
          .nav-bar { flex-direction: column; gap: var(--spacing-md); }
          .nav-btn { width: 100%; }
        }
      </style>
      
      <div class="quiz-page">
        <div class="quiz-header">
          <div class="quiz-title">Evaluación del Módulo</div>
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
              <button class="option-btn ${answered ? this._getOptionClass(i, q.correct) : ''}" ${answered ? 'disabled' : ''} onclick="window.__APP_QUIZ__.selectAnswer(${i})">${opt}</button>
            `).join('')}
          </div>
          ${answered ? `<div class="feedback ${this._answers[this._currentQuestion] === q.correct ? 'correct' : 'wrong'}">
            ${this._answers[this._currentQuestion] === q.correct ? '✅ ¡Correcto!' : '❌ Incorrecto'}
          </div>` : ''}
        </div>
        
        <div class="nav-bar">
          <button class="nav-btn prev" ${this._currentQuestion === 0 ? 'disabled' : ''} onclick="window.__APP_QUIZ__.prevQuestion()">← Anterior</button>
          ${this._currentQuestion < this._questions.length - 1 ? `
            <button class="nav-btn next" ${!answered ? 'disabled' : ''} onclick="window.__APP_QUIZ__.nextQuestion()">Siguiente →</button>
          ` : `
            <button class="nav-btn finish" ${!answered ? 'disabled' : ''} onclick="window.__APP_QUIZ__.finishQuiz()">Finalizar Evaluación</button>
          `}
        </div>
      </div>
    `;
    
    this._attachQuizListeners();
  }

  _getOptionClass(index, correct) {
    if (index === correct) return 'correct';
    if (index === this._answers[this._currentQuestion]) return 'wrong';
    return '';
  }

  _attachQuizListeners() {
    window.__APP_QUIZ__ = window.__APP_QUIZ__ || {};
    
    window.__APP_QUIZ__.selectAnswer = (index) => {
      const q = this._questions[this._currentQuestion];
      this._answers[this._currentQuestion] = index;
      this.render();
    };
    
    window.__APP_QUIZ__.nextQuestion = () => {
      if (this._currentQuestion < this._questions.length - 1) {
        this._currentQuestion++;
        this.render();
      }
    };
    
    window.__APP_QUIZ__.prevQuestion = () => {
      if (this._currentQuestion > 0) {
        this._currentQuestion--;
        this.render();
      }
    };
    
    window.__APP_QUIZ__.finishQuiz = async () => {
      const correctCount = this._answers.filter((ans, i) => ans === this._questions[i].correct).length;
      const score = Math.round((correctCount / this._questions.length) * 100);
      const passed = score >= 75;
      
      // Guardar resultado
      await store.progress.completeModule(this._moduleId, {
        phaseId: 'phase-0',
        score,
        quizPassed: passed,
        projectCompleted: false
      });
      
      const stats = await store.progress.getGlobalStats();
      await store.achievements.checkAll(stats, { type: 'module-quiz', score, moduleId: this._moduleId });
      
      navigateTo(`/diploma/module/${this._moduleId}`);
    };
  }
}

if (!customElements.get('page-quiz')) {
  customElements.define('page-quiz', QuizPage);
}