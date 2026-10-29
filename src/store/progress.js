// Progress Store - Progreso del curso persistente en IndexedDB
import Dexie from 'dexie';

class ProgressDB extends Dexie {
  constructor() {
    super('MathCourseProgress');
    this.version(1).stores({
      lessons: 'id, phaseId, moduleId, completed, score, attempts, timeSpent, lastAttempt',
      modules: 'id, phaseId, completed, score, quizPassed, projectCompleted',
      phases: 'id, completed, score, evaluationPassed, projectCompleted',
      evaluations: 'id, phaseId, score, passed, answers, timestamp',
      practice: 'id, type, questionId, correct, timestamp, responseTime',
      analytics: 'date, lessonsCompleted, timeSpent, streak'
    });
  }
}

const db = new ProgressDB();

export class ProgressStore {
  constructor(mainStore) {
    this.store = mainStore;
    this._cache = new Map();
    this._initialized = false;
  }

  async init() {
    if (this._initialized) return;
    await db.open();
    this._initialized = true;
    await this._syncFromLocalStorage();
  }

  async _syncFromLocalStorage() {
    try {
      const lsProgress = localStorage.getItem('math-course-progress');
      if (lsProgress) {
        const parsed = JSON.parse(lsProgress);
        for (const [key, value] of Object.entries(parsed)) {
          if (key === 'lessons') {
            for (const lesson of value) {
              await this.completeLesson(lesson.id, lesson);
            }
          }
        }
        localStorage.removeItem('math-course-progress');
      }
    } catch (e) {
      console.warn('LS sync failed:', e);
    }
  }

  // Lecciones
  async completeLesson(lessonId, data = {}) {
    const record = {
      id: lessonId,
      phaseId: data.phaseId,
      moduleId: data.moduleId,
      completed: true,
      score: data.score || 100,
      attempts: (data.attempts || 0) + 1,
      timeSpent: data.timeSpent || 0,
      lastAttempt: Date.now(),
      ...data
    };
    await db.lessons.put(record);
    this._invalidateCache('lesson', lessonId);
    this._checkModuleCompletion(data.moduleId);
    this._updateStreak();
    return record;
  }

  async getLessonProgress(lessonId) {
    if (this._cache.has(`lesson:${lessonId}`)) {
      return this._cache.get(`lesson:${lessonId}`);
    }
    const record = await db.lessons.get(lessonId);
    if (record) this._cache.set(`lesson:${lessonId}`, record);
    return record || { id: lessonId, completed: false, score: 0, attempts: 0 };
  }

  async getModuleLessonsProgress(moduleId) {
    return db.lessons.where('moduleId').equals(moduleId).toArray();
  }

  // Módulos
  async completeModule(moduleId, data = {}) {
    const record = {
      id: moduleId,
      phaseId: data.phaseId,
      completed: true,
      score: data.score || 0,
      quizPassed: data.quizPassed || false,
      projectCompleted: data.projectCompleted || false,
      completedAt: Date.now()
    };
    await db.modules.put(record);
    this._invalidateCache('module', moduleId);
    this._checkPhaseCompletion(data.phaseId);
    this.store.achievements.checkModuleAchievements(moduleId);
    return record;
  }

  async getModuleProgress(moduleId) {
    if (this._cache.has(`module:${moduleId}`)) {
      return this._cache.get(`module:${moduleId}`);
    }
    const record = await db.modules.get(moduleId);
    if (record) this._cache.set(`module:${moduleId}`, record);
    return record || { id: moduleId, completed: false, score: 0 };
  }

  // Fases
  async completePhase(phaseId, data = {}) {
    const record = {
      id: phaseId,
      completed: true,
      score: data.score || 0,
      evaluationPassed: data.evaluationPassed || false,
      projectCompleted: data.projectCompleted || false,
      completedAt: Date.now()
    };
    await db.phases.put(record);
    this._invalidateCache('phase', phaseId);
    this.store.achievements.checkPhaseAchievements(phaseId);
    return record;
  }

  async getPhaseProgress(phaseId) {
    if (this._cache.has(`phase:${phaseId}`)) {
      return this._cache.get(`phase:${phaseId}`);
    }
    const record = await db.phases.get(phaseId);
    if (record) this._cache.set(`phase:${phaseId}`, record);
    return record || { id: phaseId, completed: false, score: 0 };
  }

  async getAllPhasesProgress() {
    return db.phases.toArray();
  }

  // Evaluaciones
  async saveEvaluation(phaseId, data) {
    const record = {
      id: `eval-${phaseId}-${Date.now()}`,
      phaseId,
      score: data.score,
      passed: data.passed,
      answers: data.answers,
      timestamp: Date.now()
    };
    await db.evaluations.put(record);
    return record;
  }

  async getPhaseEvaluations(phaseId) {
    return db.evaluations.where('phaseId').equals(phaseId).toArray();
  }

  // Práctica espaciada
  async recordPracticeAttempt(data) {
    const record = {
      id: `practice-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...data,
      timestamp: Date.now()
    };
    await db.practice.put(record);
    return record;
  }

  async getPracticeHistory(limit = 100) {
    return db.practice.orderBy('timestamp').reverse().limit(limit).toArray();
  }

  // Analíticas diarias
  async recordDailyAnalytics(data) {
    const today = new Date().toISOString().split('T')[0];
    const existing = await db.analytics.get(today);
    const record = {
      date: today,
      lessonsCompleted: (existing?.lessonsCompleted || 0) + (data.lessonsCompleted || 0),
      timeSpent: (existing?.timeSpent || 0) + (data.timeSpent || 0),
      streak: data.streak || existing?.streak || 0
    };
    await db.analytics.put(record);
    return record;
  }

  async getAnalytics(days = 30) {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return db.analytics.where('date').above(cutoff).toArray();
  }

  // Verificaciones de completitud
  async _checkModuleCompletion(moduleId) {
    const lessons = await this.getModuleLessonsProgress(moduleId);
    const allCompleted = lessons.length > 0 && lessons.every(l => l.completed);
    if (allCompleted) {
      const module = await this.getModuleProgress(moduleId);
      if (!module.completed) {
        // Auto-complete module if all lessons done
        await this.completeModule(moduleId, { 
          phaseId: lessons[0]?.phaseId,
          score: Math.round(lessons.reduce((s, l) => s + l.score, 0) / lessons.length)
        });
      }
    }
  }

  async _checkPhaseCompletion(phaseId) {
    // Would check all modules in phase
    // Implementation depends on course manifest
  }

  async _updateStreak() {
    const today = new Date().toISOString().split('T')[0];
    const lastVisit = this.store.get('session.lastVisitDate');
    
    if (lastVisit !== today) {
      let streak = this.store.get('session.streak') || 0;
      const yesterday = new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0];
      
      if (lastVisit === yesterday) {
        streak += 1;
      } else if (lastVisit !== today) {
        streak = 1;
      }
      
      this.store.set('session.streak', streak);
      this.store.set('session.lastVisitDate', today);
      await this.recordDailyAnalytics({ streak });
    }
  }

  _invalidateCache(type, id) {
    this._cache.delete(`${type}:${id}`);
    // Also invalidate related caches
    if (type === 'lesson') {
      // Would need moduleId to invalidate module cache
    }
  }

  // Estadísticas globales
  async getGlobalStats() {
    const [lessons, modules, phases, practice] = await Promise.all([
      db.lessons.toArray(),
      db.modules.toArray(),
      db.phases.toArray(),
      db.practice.toArray()
    ]);

    const completedLessons = lessons.filter(l => l.completed).length;
    const totalTime = lessons.reduce((s, l) => s + (l.timeSpent || 0), 0);
    const avgScore = lessons.length ? 
      Math.round(lessons.reduce((s, l) => s + (l.score || 0), 0) / lessons.length) : 0;

    return {
      lessonsCompleted: completedLessons,
      modulesCompleted: modules.filter(m => m.completed).length,
      phasesCompleted: phases.filter(p => p.completed).length,
      totalTimeSpent: totalTime,
      averageScore: avgScore,
      practiceQuestions: practice.length,
      practiceAccuracy: practice.length ?
        Math.round(practice.filter(p => p.correct).length / practice.length * 100) : 0,
      currentStreak: this.store.get('session.streak') || 0
    };
  }

  async exportData() {
    const [lessons, modules, phases, evaluations, practice, analytics] = await Promise.all([
      db.lessons.toArray(),
      db.modules.toArray(),
      db.phases.toArray(),
      db.evaluations.toArray(),
      db.practice.toArray(),
      db.analytics.toArray()
    ]);
    return { lessons, modules, phases, evaluations, practice, analytics, exportedAt: Date.now() };
  }

  async clearAll() {
    await db.delete();
    await db.open();
    this._cache.clear();
  }
}