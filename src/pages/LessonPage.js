// LessonPage - Vista de una lección individual con contenido, práctica y navegación
import { store } from '../store/index.js';
import { navigateTo } from '../router.js';
import { getLesson } from '../courses/math-fundamentals/index.js';
import baseStyles from '../styles/shadow-base.css?inline';

export class LessonPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._currentLesson = null;
    this._currentContentIndex = 0;
  }

  connectedCallback() {
    this._loadLesson();
  }

  _loadLesson() {
    const path = window.location.hash.slice(1);
    const match = path.match(/^\/lesson\/(.+)$/);
    const lessonId = match ? match[1] : 'l0-1-1';
    this._lessonId = lessonId;

    const found = getLesson(lessonId);
    if (!found) {
      this._notFound = true;
      this._renderNotFound();
      return;
    }
    this._currentLesson = found.lesson;
    this._module = found.module;
    this._currentContentIndex = 0;
    this.render();
  }

  _renderNotFound() {
    this.shadowRoot.innerHTML = `
      <style>${baseStyles}</style>
      <div style="padding: var(--spacing-xl); text-align: center;">
        <h1>Lección no encontrada</h1>
        <p>No existe la lección "${this._lessonId}".</p>
        <button class="btn btn-primary" onclick="window.__APP_ROUTER__.navigate('/')">Volver al inicio</button>
      </div>
    `;
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
      <style>${baseStyles}</style>
      <style>
        :host { display: block; }
        .lesson-page { padding: var(--spacing-lg); max-width: 800px; margin: 0 auto; }
        .lesson-header { display: flex; align-items: center; gap: var(--spacing-md); margin-bottom: var(--spacing-xl); flex-wrap: wrap; }
        .back-btn { color: var(--text-muted); font-size: var(--font-size-sm); text-decoration: none; }
        .back-btn:hover { color: var(--primary); }
        .lesson-meta { display: flex; gap: var(--spacing-md); margin-left: auto; font-size: var(--font-size-xs); color: var(--text-muted); }
        .lesson-info h1 { margin: 0 0 var(--spacing-xs) 0; font-size: var(--font-size-3xl); }
        .objective { background: var(--primary-light); border-left: 4px solid var(--primary); padding: var(--spacing-md); border-radius: 0 var(--radius-md) var(--radius-md) 0; margin-bottom: var(--spacing-xl); font-size: var(--font-size-sm); }

        .content-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: var(--spacing-xl); margin-bottom: var(--spacing-xl); }
        .content-type { font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); text-transform: uppercase; letter-spacing: 0.05em; color: var(--primary); margin-bottom: var(--spacing-sm); display: block; }
        .content-text { font-size: var(--font-size-base); line-height: var(--line-height-relaxed); color: var(--text-primary); margin-bottom: var(--spacing-lg); }
        .content-latex { margin: var(--spacing-lg) 0; }
        .content-visual { text-align: center; margin: var(--spacing-lg) 0; }
        .content-visual img { max-width: 100%; border-radius: var(--radius-lg); }
        .visual-missing { display: inline-block; padding: var(--spacing-md) var(--spacing-lg); border: 1px dashed var(--border-color-strong); border-radius: var(--radius-lg); color: var(--text-muted); font-size: var(--font-size-sm); background: var(--bg-tertiary); }
        .interactive-box { background: var(--bg-tertiary); border: 2px dashed var(--border-color); border-radius: var(--radius-lg); padding: var(--spacing-lg); text-align: center; margin: var(--spacing-lg) 0; }

        .nav-bar { display: flex; justify-content: space-between; align-items: center; margin-top: var(--spacing-xl); padding-top: var(--spacing-lg); border-top: 1px solid var(--border-color); }
        .progress-text { font-size: var(--font-size-sm); color: var(--text-muted); }

        .practice-section { background: var(--bg-tertiary); border-radius: var(--radius-xl); padding: var(--spacing-xl); border: 1px solid var(--border-color); }
        .practice-title { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); margin-bottom: var(--spacing-lg); }
        .question-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: var(--spacing-lg); margin-bottom: var(--spacing-md); }
        .question-text { font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); margin-bottom: var(--spacing-md); }
        .options { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--spacing-md); }
        .option-btn { padding: var(--spacing-md); border: 2px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-primary); cursor: pointer; transition: all var(--transition-fast); font-size: var(--font-size-base); color: var(--text-primary); }
        .option-btn:hover:not(:disabled) { border-color: var(--primary); background: var(--primary-light); }
        .option-btn:disabled { cursor: not-allowed; opacity: 0.85; }
        .option-btn.correct { border-color: var(--success); background: var(--success-light); color: var(--success-600); }
        .option-btn.wrong { border-color: var(--error); background: var(--error-light); color: var(--error-600); }
        .feedback { margin-top: var(--spacing-md); padding: var(--spacing-md); border-radius: var(--radius-md); font-size: var(--font-size-sm); }
        .feedback.correct { background: var(--success-light); color: var(--success-600); border: 1px solid var(--border-color); }
        .feedback.wrong { background: var(--error-light); color: var(--error-600); border: 1px solid var(--border-color); }
        .fill-row { display: flex; gap: var(--spacing-md); }
        .fill-input { flex: 1; max-width: 220px; padding: var(--spacing-md); border: 2px solid var(--border-color); border-radius: var(--radius-md); font-size: var(--font-size-base); background: var(--bg-primary); color: var(--text-primary); }
        .match-row { display: flex; align-items: center; gap: var(--spacing-md); margin-bottom: var(--spacing-sm); }
        .match-select { padding: var(--spacing-sm); border: 2px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-primary); color: var(--text-primary); }

        .latex-renderer-wrap { margin: var(--spacing-lg) 0; }

        @media (max-width: 640px) {
          .nav-bar { flex-direction: column; gap: var(--spacing-md); }
        }
      </style>

      <div class="lesson-page">
        <div class="lesson-header">
          <a href="#/module/${this._module.id}" class="back-btn">← Volver al Módulo</a>
          <h1 style="margin: 0; font-size: var(--font-size-3xl);">${lesson.title}</h1>
          <div class="lesson-meta">
            <span>⏱️ ${lesson.durationMin} min</span>
            <span>📍 ${this._currentContentIndex + 1} / ${content.length}</span>
          </div>
        </div>

        <div class="objective">
          🎯 Objetivo: ${lesson.objective || ''}
        </div>

        <div class="content-card">
          <span class="content-type">${this._getTypeLabel(currentContent.type)}</span>
          ${
            currentContent.type === 'analogy'
              ? `<div style="background: var(--warning-light); border-left: 4px solid var(--warning); padding: var(--spacing-md); border-radius: 0 var(--radius-md) var(--radius-md) 0; font-style: italic;">"${currentContent.text}"</div>`
              : `<div class="content-text">${currentContent.text || ''}</div>`
          }
          ${currentContent.latex ? `<div class="content-latex latex-renderer-wrap"><latex-renderer latex="${currentContent.latex}" display-mode size="lg"></latex-renderer></div>` : ''}
          ${currentContent.visual ? `<div class="content-visual"><img src="${currentContent.visual}" alt="Ilustración de la lección" onerror="this.outerHTML='<span class=visual-missing>Ilustración próximamente</span>'"></div>` : ''}
          ${
            currentContent.type === 'interactive'
              ? `
            <div class="interactive-box">
              <p style="margin: 0 0 var(--spacing-sm) 0;">🎮 ${currentContent.description || 'Actividad interactiva'}</p>
              <span style="color: var(--text-muted); font-size: var(--font-size-sm);">(Interactivo en desarrollo — la práctica te espera abajo)</span>
            </div>
          `
              : ''
          }
        </div>

        ${
          currentContent.type === 'practice'
            ? `
          <div class="practice-section">
            <div class="practice-title">✅ Práctica Guiada</div>
            ${(currentContent.questions || []).map((q) => this._renderQuestion(q)).join('')}
          </div>
        `
            : ''
        }

        <div class="nav-bar">
          <button class="btn btn-ghost" ${this._currentContentIndex === 0 ? 'disabled' : ''} onclick="window.__APP__.prevContent()">
            ← Anterior
          </button>
          <div class="progress-text">${this._currentContentIndex + 1} de ${content.length}</div>
          <button class="btn btn-primary" ${isLast ? 'disabled' : ''} onclick="window.__APP__.nextContent()">
            ${isLast ? 'Finalizar Lección' : 'Siguiente →'}
          </button>
        </div>
      </div>
    `;

    this._attachAnswerListeners();
  }

  _renderQuestion(q) {
    let body = '';
    if (Array.isArray(q.options)) {
      body = `
        <div class="options">
          ${q.options
            .map(
              (opt, oi) => `
            <button class="option-btn" data-q="${q.id}" data-i="${oi}">${opt}</button>
          `
            )
            .join('')}
        </div>`;
    } else if (q.answer !== undefined) {
      body = `
        <div class="fill-row">
          <input class="fill-input" type="text" data-fill="${q.id}" aria-label="Respuesta">
          <button class="btn btn-primary btn-sm" data-check="${q.id}">Comprobar</button>
        </div>`;
    } else if (q.items && q.targets) {
      body = q.items.map(
        (item) => `
        <div class="match-row">
          <span style="min-width: 80px;">${item}</span>
          <select class="match-select" data-match="${q.id}" data-item="${item}" aria-label="Empareja ${item}">
            <option value="">— elige —</option>
            ${q.targets.map((t) => `<option value="${t}">${t}</option>`).join('')}
          </select>
        </div>
        <button class="btn btn-primary btn-sm" data-check="${q.id}">Comprobar</button>`
      );
    }
    return `
      <div class="question-card" id="qcard-${q.id}">
        <div class="question-text">${q.question}</div>
        ${q.image ? `<div class="content-visual"><img src="${q.image}" alt="" onerror="this.style.display='none'"></div>` : ''}
        ${body}
        <div id="feedback-${q.id}"></div>
      </div>
    `;
  }

  _getTypeLabel(type) {
    const labels = {
      hook: '🪝 Gancho',
      explanation: '💡 Explicación',
      analogy: '🔗 Analogía',
      interactive: '🎮 Interactivo',
      practice: '✅ Práctica',
    };
    return labels[type] || type;
  }

  _attachAnswerListeners() {
    window.__APP__ = window.__APP__ || {};
    const root = this.shadowRoot;

    // Opciones: delegación por pregunta (cada tarjeta es su propio ámbito)
    root.querySelectorAll('.option-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const qid = btn.dataset.q;
        const qi = Number(btn.dataset.i);
        const card = root.getElementById(`qcard-${qid}`);
        const q = this._findQuestion(qid);
        if (!q || !card) {
          return;
        }
        card.querySelectorAll('.option-btn').forEach((b) => (b.disabled = true));
        const correct = q.correct;
        const fb = card.querySelector('.feedback') || root.getElementById(`feedback-${qid}`);
        if (qi === correct) {
          btn.classList.add('correct');
          fb.innerHTML = `<div class="feedback correct">✅ ¡Correcto! ${q.explanation || q.feedback || ''}</div>`;
        } else {
          btn.classList.add('wrong');
          card.querySelectorAll('.option-btn')[correct]?.classList.add('correct');
          fb.innerHTML = `<div class="feedback wrong">❌ Incorrecto. ${q.explanation || ''}</div>`;
        }
        this._recordAttempt(qid, qi === correct);
      });
    });

    // Fill-in
    root.querySelectorAll('[data-check]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const qid = btn.dataset.check;
        const card = root.getElementById(`qcard-${qid}`);
        const q = this._findQuestion(qid);
        if (!q || !card) {
          return;
        }
        const input = card.querySelector(`[data-fill="${qid}"]`);
        const selects = card.querySelectorAll(`[data-match="${qid}"]`);
        const fb = root.getElementById(`feedback-${qid}`);
        let ok = false;
        if (input) {
          ok = String(input.value).trim().toLowerCase() === String(q.answer).trim().toLowerCase();
        } else if (selects.length) {
          ok = q.correct.every((pair) => {
            const [item, target] = pair.split('-');
            const sel = card.querySelector(`[data-match="${qid}"][data-item="${item}"]`);
            return sel && sel.value === target;
          });
        }
        fb.innerHTML = ok
          ? `<div class="feedback correct">✅ ¡Correcto! ${q.explanation || ''}</div>`
          : `<div class="feedback wrong">❌ Incorrecto. ${q.explanation || ''}</div>`;
        this._recordAttempt(qid, ok);
      });
    });

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

  _findQuestion(qid) {
    for (const block of this._currentLesson.content || []) {
      for (const q of block.questions || []) {
        if (q.id === qid) {
          return q;
        }
      }
    }
    return null;
  }

  async _recordAttempt(questionId, isCorrect) {
    try {
      await store.progress.recordPracticeAttempt({
        questionId,
        correct: isCorrect,
        type: 'lesson-practice',
      });
    } catch (e) {
      console.warn('No se pudo registrar la práctica:', e);
    }
  }

  async _completeLesson() {
    await store.progress.completeLesson(this._lessonId, {
      phaseId: this._module.phaseId,
      moduleId: this._module.id,
      score: 100,
      timeSpent: 0,
    });

    const stats = await store.progress.getGlobalStats();
    await store.achievements.checkAll(stats);

    navigateTo(`/module/${this._module.id}`);
  }
}

if (!customElements.get('page-lesson')) {
  customElements.define('page-lesson', LessonPage);
}
