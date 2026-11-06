// ModulePage - Vista de un módulo con sus lecciones reales y quiz
import { store } from '../store/index.js';
import { getModule, getLessons, getQuizQuestions } from '../courses/math-fundamentals/index.js';
import baseStyles from '../styles/shadow-base.css?inline';

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

    const mod = getModule(moduleId);
    if (!mod) {
      this.shadowRoot.innerHTML = `
        <style>${baseStyles}</style>
        <div style="padding: var(--spacing-xl); text-align: center;">
          <h1>Módulo no disponible</h1>
          <p>El módulo "${moduleId}" está en desarrollo.</p>
          <button class="btn btn-primary" onclick="window.__APP_ROUTER__.navigate('/')">Volver al inicio</button>
        </div>
      `;
      return;
    }

    const lessons = getLessons(moduleId);
    const quizQuestions = getQuizQuestions(moduleId);
    const quizCount = quizQuestions.length;

    // Estado de progreso real (async -> pinta después)
    this._paint(mod, lessons, quizCount, []);
    store.progress
      .getModuleLessonsProgress(moduleId)
      .then((done) => {
        this._paint(mod, lessons, quizCount, done);
      })
      .catch(() => {});
  }

  _paint(mod, lessons, quizCount, progressRows) {
    const done = new Map(progressRows.filter((r) => r.completed).map((r) => [r.id, r]));
    const completedCount = done.size;
    const pct = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;
    // Una lección se desbloquea si la anterior está completada (la primera siempre)
    let prevDone = true;

    this.shadowRoot.innerHTML = `
      <style>${baseStyles}</style>
      <style>
        :host { display: block; }
        .module-page { padding: var(--spacing-lg); max-width: 900px; margin: 0 auto; }
        .module-header { display: flex; align-items: center; gap: var(--spacing-md); margin-bottom: var(--spacing-xl); flex-wrap: wrap; }
        .back-btn { color: var(--text-muted); font-size: var(--font-size-sm); text-decoration: none; }
        .back-btn:hover { color: var(--primary); }
        .module-info h1 { margin: 0; font-size: var(--font-size-3xl); }
        .module-info p { margin: var(--spacing-xs) 0 0 0; color: var(--text-muted); }

        .lessons-section { margin-bottom: var(--spacing-xl); }
        .section-title { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); margin-bottom: var(--spacing-lg); }
        .lessons-list { display: flex; flex-direction: column; gap: var(--spacing-sm); }
        .lesson-row { display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-md); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); transition: all var(--transition-fast); cursor: pointer; }
        .lesson-row:hover:not(.lesson-locked) { border-color: var(--primary-light); background: var(--bg-tertiary); }
        .lesson-row.completed { border-color: var(--success); background: var(--success-light); }
        .lesson-number { width: 40px; height: 40px; border-radius: 50%; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; font-weight: var(--font-weight-bold); color: var(--primary); flex-shrink: 0; }
        .lesson-row.completed .lesson-number { background: var(--success); color: white; }
        .lesson-content { flex: 1; }
        .lesson-title { font-weight: var(--font-weight-semibold); display: block; }
        .lesson-desc { font-size: var(--font-size-xs); color: var(--text-muted); }
        .lesson-locked { filter: grayscale(1); cursor: not-allowed; }

        .progress-line { height: 8px; background: var(--bg-tertiary); border-radius: var(--radius-full); overflow: hidden; margin-bottom: var(--spacing-xl); }
        .progress-fill { height: 100%; background: var(--primary); transition: width var(--transition-normal); }

        .quiz-section { background: var(--bg-tertiary); border-radius: var(--radius-xl); padding: var(--spacing-xl); border: 1px solid var(--border-color); }
        .quiz-info h2 { margin: 0 0 var(--spacing-xs) 0; font-size: var(--font-size-xl); }
        .quiz-info p { margin: 0 0 var(--spacing-md) 0; color: var(--text-muted); font-size: var(--font-size-sm); }

        @media (max-width: 640px) {
          .module-header { flex-direction: column; align-items: flex-start; }
        }
      </style>

      <div class="module-page">
        <div class="module-header">
          <a href="#/phase/${mod.phaseId}" class="back-btn">← Volver a la Fase</a>
          <div class="module-info">
            <h1>📦 ${mod.title}</h1>
            <p>${mod.number} · ${lessons.length} lecciones + evaluación</p>
          </div>
        </div>

        <div class="progress-line"><div class="progress-fill" style="width: ${pct}%"></div></div>

        <div class="lessons-section">
          <h2 class="section-title">📚 Lecciones del Módulo</h2>
          <div class="lessons-list">
            ${lessons
              .map((lesson, i) => {
                const isCompleted = done.has(lesson.id);
                const isLocked = !isCompleted && !prevDone;
                if (!isCompleted) {
                  prevDone = false;
                }
                return `
                <div class="lesson-row ${isCompleted ? 'completed' : ''} ${isLocked ? 'lesson-locked' : ''}"
                     ${!isLocked ? `onclick="window.__APP_ROUTER__.navigate('/lesson/${lesson.id}')"` : ''}
                     role="link" tabindex="0">
                  <div class="lesson-number">${isCompleted ? '✓' : i + 1}</div>
                  <div class="lesson-content">
                    <span class="lesson-title">${lesson.title}</span>
                    <span class="lesson-desc">${isCompleted ? 'Completada ✓' : isLocked ? 'Bloqueada: completa la anterior' : `${lesson.durationMin} min`}</span>
                  </div>
                  <span>${isCompleted ? '✅' : isLocked ? '🔒' : '▶'}</span>
                </div>
              `;
              })
              .join('')}
          </div>
        </div>

        <div class="quiz-section">
          <div class="quiz-info">
            <h2>📝 Evaluación del Módulo</h2>
            <p>${quizCount} preguntas. Necesitas ≥75% para aprobar.</p>
          </div>
          <button class="btn btn-primary btn-block" onclick="window.__APP_ROUTER__.navigate('/quiz/${mod.id}')" ${quizCount === 0 ? 'disabled' : ''}>
            ${quizCount === 0 ? 'Evaluación próximamente' : 'Empezar Evaluación del Módulo'}
          </button>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('page-module')) {
  customElements.define('page-module', ModulePage);
}
