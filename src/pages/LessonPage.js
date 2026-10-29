// LessonPage - Vista de una lección individual con contenido, práctica y navegación
import { store } from '../store/index.js';
import { navigateTo } from '../router.js';

export class LessonPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._currentLesson = null;
    this._currentContentIndex = 0;
  }

  connectedCallback() {
    this.render();
    this._loadLesson();
  }

  _loadLesson() {
    const path = window.location.hash.slice(1);
    const match = path.match(/^\/lesson\/(.+)$/);
    const lessonId = match ? match[1] : 'l0-1-1';
    this._lessonId = lessonId;
    
    // Cargar datos de la lección desde el módulo correspondiente
    // Por ahora usamos datos hardcodeados para la lección 1 del módulo 0.1
    this._currentLesson = {
      id: lessonId,
      title: 'Reconoce Cantidad Sin Contar (Subitizing)',
      objective: 'Identificar cantidades pequeñas (1-5) de un vistazo, sin contar uno por uno',
      type: 'conceptual',
      durationMin: 5,
      content: [
        { type: 'hook', text: 'Mira estos dados. ¿Cuántos puntos hay? No cuentes uno por uno, ¡mira el dibujo!' },
        { type: 'explanation', text: 'El <strong>subitizing</strong> es reconocer cantidades pequeñas (1-5) de inmediato, sin contar. Tu cerebro ve el patrón completo, no los puntos individuales.', latex: '\\text{subitizing}: \\text{cantidad reconocida de vista, sin contar}' },
        { type: 'analogy', text: 'Como reconocer la cara de un amigo a distancia: no analizas nariz, ojos y boca por separado, ¡ves la cara completa!', conceptId: 'variable' },
        { type: 'interactive', component: 'SubitizingGame', description: 'Juego de dados: aparecen puntos 1-5 por 1 segundo, elige la cantidad correcta' },
        { type: 'practice', questions: [
          { id: 'q1', type: 'multiple-choice', question: '¿Cuántos puntos ves?', options: [2, 3, 4, 5], correct: 3, feedback: '¡Correcto! 3 puntos forman un triángulo.' },
          { id: 'q2', type: 'multiple-choice', question: '¿Qué es subitizing?', options: ['Contar uno por uno muy rápido', 'Reconocer cantidad de vista sin contar', 'Sumar números grandes', 'Escribir números en orden'], correct: 1, explanation: 'Subitizing = ver la cantidad completa de un vistazo, como los puntos de un dado.' }
        ]}
      ]
    };
    
    this.render();
  }

  render() {
    if (!this._currentLesson) {
      this.shadowRoot.innerHTML = '<div class="loading">Cargando lección...</div>';
      return;
    }

    const lesson = this._currentLesson;
    const content = lesson.content || [];
    const currentContent = content[this._currentContentIndex] || {};
    const isLast = this._currentContentIndex >= content.length - 1;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .lesson-page { padding: var(--spacing-lg); max-width: 800px; margin: 0 auto; }
        .lesson-header { display: flex; align-items: center; gap: var(--spacing-md); margin-bottom: var(--spacing-xl); flex-wrap: wrap; }
        .back-btn { color: var(--text-muted); font-size: var(--font-size-sm); text-decoration: none; }
        .back-btn:hover { color: var(--primary); }
        .lesson-meta { display: flex; gap: var(--spacing-md); margin-left: auto; font-size: var(--font-size-xs); color: var(--text-muted); }
        .lesson-info h1 { margin: 0 0 var(--spacing-xs) 0; font-size: var(--font-size-3xl); }
        .lesson-info p { margin: 0; color: var(--text-secondary); }
        .objective { background: var(--primary-light); border-left: 4px solid var(--primary); padding: var(--spacing-md); border-radius: 0 var(--radius-md) var(--radius-md) 0; margin-bottom: var(--spacing-xl); font-size: var(--font-size-sm); }
        
        .content-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: var(--spacing-xl); margin-bottom: var(--spacing-xl); }
        .content-type { font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); text-transform: uppercase; letter-spacing: 0.05em; color: var(--primary); margin-bottom: var(--spacing-sm); display: block; }
        .content-text { font-size: var(--font-size-base); line-height: var(--line-height-relaxed); color: var(--text-primary); margin-bottom: var(--spacing-lg); }
        .content-latex { margin: var(--spacing-lg) 0; text-align: center; }
        .interactive-box { background: var(--bg-tertiary); border: 2px dashed var(--border-color); border-radius: var(--radius-lg); padding: var(--spacing-lg); text-align: center; margin: var(--spacing-lg) 0; }
        .interactive-box.disabled { opacity: 0.5; pointer-events: none; }
        
        .nav-bar { display: flex; justify-content: space-between; align-items: center; margin-top: var(--spacing-xl); padding-top: var(--spacing-lg); border-top: 1px solid var(--border-color); }
        .nav-btn { padding: var(--spacing-md) var(--spacing-lg); font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); border-radius: var(--radius-lg); cursor: pointer; transition: all var(--transition-fast); }
        .nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .nav-btn.prev { color: var(--text-muted); border: 1px solid var(--border-color); background: transparent; }
        .nav-btn.prev:not(:disabled):hover { border-color: var(--primary); color: var(--primary); }
        .nav-btn.next { background: var(--primary); color: white; border: none; }
        .nav-btn.next:not(:disabled):hover { background: var(--primary-dark); }
        .progress-text { font-size: var(--font-size-sm); color: var(--text-muted); }
        
        .practice-section { background: var(--bg-tertiary); border-radius: var(--radius-xl); padding: var(--spacing-xl); border: 1px solid var(--border-color); }
        .practice-title { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); margin-bottom: var(--spacing-lg); display: flex; align-items: center; gap: var(--spacing-sm); }
        .question-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: var(--spacing-lg); margin-bottom: var(--spacing-md); }
        .question-text { font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); margin-bottom: var(--spacing-md); }
        .options { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--spacing-md); }
        .option-btn { padding: var(--spacing-md); border: 2px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-primary); cursor: pointer; transition: all var(--transition-fast); font-size: var(--font-size-base); }
        .option-btn:hover { border-color: var(--primary); background: var(--primary-light); }
        .option-btn.selected { border-color: var(--primary); background: var(--primary); color: white; }
        .option-btn.correct { border-color: var(--success); background: var(--success-light); color: var(--success-600); }
        .option-btn.wrong { border-color: var(--error); background: var(--error-light); color: var(--error-600); }
        .feedback { margin-top: var(--spacing-md); padding: var(--spacing-md); border-radius: var(--radius-md); font-size: var(--font-size-sm); }
        .feedback.correct { background: var(--success-light); color: var(--success-600); border: 1px solid var(--success-200); }
        .feedback.wrong { background: var(--error-light); color: var(--error-600); border: 1px solid var(--error-200); }
        
        .latex-renderer-wrap { margin: var(--spacing-lg) 0; }
        
        @media (max-width: 640px) {
          .nav-bar { flex-direction: column; gap: var(--spacing-md); }
          .nav-btn { width: 100%; }
        }
      </style>
      
      <div class="lesson-page">
        <div class="lesson-header">
          <a href="#/module/m0-1" class="back-btn">← Volver al Módulo</a>
          <h1 style="margin: 0; font-size: var(--font-size-3xl);">${lesson.title}</h1>
          <div class="lesson-meta">
            <span>⏱️ ${lesson.durationMin} min</span>
            <span>📍 ${this._currentContentIndex + 1} / ${content.length}</span>
          </div>
        </div>
        
        <div class="objective">
          🎯 Objetivo: ${lesson.objective}
        </div>
        
        <div class="content-card">
          <span class="content-type">${this._getTypeLabel(currentContent.type)}</span>
          <div class="content-text">${currentContent.text || ''}</div>
          ${currentContent.latex ? `<div class="content-latex latex-renderer-wrap"><latex-renderer latex="${currentContent.latex}" display-mode size="lg"></latex-renderer></div>` : ''}
          ${currentContent.visual ? `<div style="text-align: center; margin: var(--spacing-lg) 0;"><img src="${currentContent.visual}" alt="Ilustración" style="max-width: 100%; border-radius: var(--radius-lg);"></div>` : ''}
          ${currentContent.type === 'interactive' ? `
            <div class="interactive-box ${!currentContent.component ? 'disabled' : ''}">
              <p style="margin: 0; color: var(--text-muted);">${currentContent.description || 'Elemento interactivo'}</p>
              <div style="margin-top: var(--spacing-md); color: var(--primary); font-weight: var(--font-weight-medium);">👆 Interactúa con los elementos de arriba</div>
            </div>
          ` : ''}
          ${currentContent.type === 'analogy' ? `<div style="background: var(--warning-light); border-left: 4px solid var(--warning); padding: var(--spacing-md); border-radius: 0 var(--radius-md) var(--radius-md) 0; margin-top: var(--spacing-lg); font-style: italic;">"${currentContent.text}"</div>` : ''}
        </div>
        
        ${currentContent.type === 'practice' ? `
          <div class="practice-section">
            <div class="practice-title">✅ Práctica Guiada</div>
            ${currentContent.questions.map((q, qi) => `
              <div class="question-card">
                <div class="question-text">${q.question}</div>
                <div class="options">
                  ${q.options.map((opt, oi) => `
                    <button class="option-btn" onclick="window.__APP__.answerQuestion('${q.id}', ${oi}, ${q.correct})">${opt}</button>
                  `).join('')}
                </div>
                <div id="feedback-${q.id}"></div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <div class="nav-bar">
          <button class="nav-btn prev" ${this._currentContentIndex === 0 ? 'disabled' : ''} onclick="window.__APP__.prevContent()">
            ← Anterior
          </button>
          <div class="progress-text">${this._currentContentIndex + 1} de ${content.length}</div>
          <button class="nav-btn next" ${isLast ? 'disabled' : ''} onclick="window.__APP__.nextContent()">
            ${isLast ? 'Finalizar Lección' : 'Siguiente →'}
          </button>
        </div>
      </div>
    `;
    
    this._attachAnswerListeners();
  }

  _getTypeLabel(type) {
    const labels = {
      hook: '🪝 Gancho',
      explanation: '💡 Explicación',
      analogy: '🔗 Analogía',
      interactive: '🎮 Interactivo',
      practice: '✅ Práctica'
    };
    return labels[type] || type;
  }

  _attachAnswerListeners() {
    window.__APP__ = window.__APP__ || {};
    
    window.__APP__.answerQuestion = (questionId, selectedIndex, correctIndex) => {
      const feedbackEl = this.shadowRoot.getElementById(`feedback-${questionId}`);
      const optionBtns = this.shadowRoot.querySelectorAll(`.option-btn`);
      
      optionBtns.forEach(btn => btn.disabled = true);
      
      if (selectedIndex === correctIndex) {
        optionBtns[selectedIndex].classList.add('correct');
        feedbackEl.innerHTML = `<div class="feedback correct">✅ ¡Correcto!</div>`;
        feedbackEl.className = 'feedback correct';
      } else {
        optionBtns[selectedIndex].classList.add('wrong');
        optionBtns[correctIndex].classList.add('correct');
        feedbackEl.innerHTML = `<div class="feedback wrong">❌ Incorrecto. La respuesta correcta está marcada en verde.</div>`;
        feedbackEl.className = 'feedback wrong';
      }
    };
    
    window.__APP__.nextContent = () => {
      if (this._currentContentIndex < (this._currentLesson.content || []).length - 1) {
        this._currentContentIndex++;
        this.render();
      } else {
        this._completeLesson();
      }
    };
    
    window.__APP__.prevContent = () => {
      if (this._currentContentIndex > 0) {
        this._currentContentIndex--;
        this.render();
      }
    };
  }

  async _completeLesson() {
    // Marcar lección como completada
    await store.progress.completeLesson(this._lessonId, {
      phaseId: 'phase-0',
      moduleId: 'm0-1',
      score: 100,
      timeSpent: 0
    });
    
    // Verificar logros
    const stats = await store.progress.getGlobalStats();
    await store.achievements.checkAll(stats);
    
    navigateTo('/dashboard');
  }
}

if (!customElements.get('page-lesson')) {
  customElements.define('page-lesson', LessonPage);
}