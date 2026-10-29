// Achievements Store - Sistema de logros y diplomas
export class AchievementsStore {
  constructor(mainStore) {
    this.store = mainStore;
    this.definitions = this._loadDefinitions();
    this._unlocked = new Set();
    this._loadUnlocked();
  }

  _loadDefinitions() {
    return {
      // Lecciones
      'lesson-first': {
        id: 'lesson-first',
        type: 'lesson',
        tier: 'bronze',
        title: 'Primer Paso',
        description: 'Completaste tu primera lección',
        icon: '👣',
        condition: (stats) => stats.lessonsCompleted >= 1
      },
      'lesson-10': {
        id: 'lesson-10',
        type: 'lesson',
        tier: 'bronze',
        title: 'Estudiante Dedicado',
        description: 'Completaste 10 lecciones',
        icon: '📚',
        condition: (stats) => stats.lessonsCompleted >= 10
      },
      'lesson-50': {
        id: 'lesson-50',
        type: 'lesson',
        tier: 'silver',
        title: 'Aprendiz Constante',
        description: 'Completaste 50 lecciones',
        icon: '🎓',
        condition: (stats) => stats.lessonsCompleted >= 50
      },
      'lesson-100': {
        id: 'lesson-100',
        type: 'lesson',
        tier: 'gold',
        title: 'Centurión Matemático',
        description: 'Completaste 100 lecciones',
        icon: '💯',
        condition: (stats) => stats.lessonsCompleted >= 100
      },
      'lesson-all': {
        id: 'lesson-all',
        type: 'lesson',
        tier: 'diamond',
        title: 'Maestro de Lecciones',
        description: 'Completaste todas las lecciones del curso',
        icon: '🏆',
        condition: (stats) => stats.lessonsCompleted >= 180
      },

      // Módulos
      'module-first': {
        id: 'module-first',
        type: 'module',
        tier: 'silver',
        title: 'Módulo Completado',
        description: 'Completaste tu primer módulo',
        icon: '📦',
        condition: (stats) => stats.modulesCompleted >= 1
      },
      'module-phase0': {
        id: 'module-phase0',
        type: 'module',
        tier: 'bronze',
        title: 'Fundamentos Sólidos',
        description: 'Completaste todos los módulos de la Fase 0',
        icon: '🧱',
        condition: (stats, progress) => {
          const phase0Modules = ['m0-1', 'm0-2', 'm0-3', 'm0-4'];
          return phase0Modules.every(m => progress.modulesCompleted?.includes(m));
        }
      },

      // Fases
      'phase-0': {
        id: 'phase-0',
        type: 'phase',
        tier: 'silver',
        title: 'Puente Cruzado',
        description: 'Completaste la Fase 0: Los Números Son Tus Amigos',
        icon: '🌉',
        condition: (stats, progress) => progress.phasesCompleted?.includes('phase-0')
      },
      'phase-1': {
        id: 'phase-1',
        type: 'phase',
        tier: 'silver',
        title: 'Lenguaje de Patrones',
        description: 'Completaste la Fase 1: Fundamentos',
        icon: '🔤',
        condition: (stats, progress) => progress.phasesCompleted?.includes('phase-1')
      },
      'phase-2': {
        id: 'phase-2',
        type: 'phase',
        tier: 'gold',
        title: 'Resolvedor de Misterios',
        description: 'Completaste la Fase 2: Álgebra',
        icon: '🔍',
        condition: (stats, progress) => progress.phasesCompleted?.includes('phase-2')
      },
      'phase-3': {
        id: 'phase-3',
        type: 'phase',
        tier: 'gold',
        title: 'Arquitecto de Formas',
        description: 'Completaste la Fase 3: Geometría',
        icon: '📐',
        condition: (stats, progress) => progress.phasesCompleted?.includes('phase-3')
      },
      'phase-4': {
        id: 'phase-4',
        type: 'phase',
        tier: 'gold',
        title: 'Navegante del Cambio',
        description: 'Completaste la Fase 4: Funciones y Cálculo',
        icon: '📈',
        condition: (stats, progress) => progress.phasesCompleted?.includes('phase-4')
      },
      'phase-5': {
        id: 'phase-5',
        type: 'phase',
        tier: 'gold',
        title: 'Analista de Datos',
        description: 'Completaste la Fase 5: Estadística y Probabilidad',
        icon: '📊',
        condition: (stats, progress) => progress.phasesCompleted?.includes('phase-5')
      },
      'phase-6': {
        id: 'phase-6',
        type: 'phase',
        tier: 'diamond',
        title: 'Pensador Matemático',
        description: 'Completaste la Fase 6: Pensamiento Matemático Avanzado',
        icon: '🧠',
        condition: (stats, progress) => progress.phasesCompleted?.includes('phase-6')
      },

      // Rachas
      'streak-3': {
        id: 'streak-3',
        type: 'streak',
        tier: 'bronze',
        title: 'En Rachita',
        description: '3 días consecutivos estudiando',
        icon: '🔥',
        condition: (stats) => stats.currentStreak >= 3
      },
      'streak-7': {
        id: 'streak-7',
        type: 'streak',
        tier: 'silver',
        title: 'Semana de Fuego',
        description: '7 días consecutivos estudiando',
        icon: '🔥🔥',
        condition: (stats) => stats.currentStreak >= 7
      },
      'streak-30': {
        id: 'streak-30',
        type: 'streak',
        tier: 'gold',
        title: 'Hábito de Acero',
        description: '30 días consecutivos estudiando',
        icon: '🔥🔥🔥',
        condition: (stats) => stats.currentStreak >= 30
      },
      'streak-100': {
        id: 'streak-100',
        type: 'streak',
        tier: 'diamond',
        title: 'Leyenda Viviente',
        description: '100 días consecutivos estudiando',
        icon: '🌟',
        condition: (stats) => stats.currentStreak >= 100
      },

      // Perfección
      'perfect-module': {
        id: 'perfect-module',
        type: 'perfect',
        tier: 'gold',
        title: 'Perfeccionista',
        description: 'Obtuviste 100% en un quiz de módulo',
        icon: '💎',
        condition: (stats, progress, event) => event?.type === 'module-quiz' && event.score === 100
      },
      'perfect-phase': {
        id: 'perfect-phase',
        type: 'perfect',
        tier: 'diamond',
        title: 'Impecable',
        description: 'Obtuviste 100% en una evaluación de fase',
        icon: '💎💎',
        condition: (stats, progress, event) => event?.type === 'phase-eval' && event.score === 100
      },

      // Especial
      'speed-runner': {
        id: 'speed-runner',
        type: 'special',
        tier: 'silver',
        title: 'Velocista',
        description: 'Completaste un módulo en menos de la mitad del tiempo estimado',
        icon: '⚡',
        condition: (stats, progress, event) => event?.type === 'module-complete' && event.timeRatio < 0.5
      },
      'night-owl': {
        id: 'night-owl',
        type: 'special',
        tier: 'bronze',
        title: 'Búho Nocturno',
        description: 'Estudiaste después de medianoche',
        icon: '🦉',
        condition: (stats, progress, event) => {
          const hour = new Date().getHours();
          return hour >= 0 && hour < 5;
        }
      },
      'early-bird': {
        id: 'early-bird',
        type: 'special',
        tier: 'bronze',
        title: 'Madrugador',
        description: 'Estudiaste antes de las 6 AM',
        icon: '🌅',
        condition: (stats, progress, event) => {
          const hour = new Date().getHours();
          return hour >= 4 && hour < 6;
        }
      },
      'weekend-warrior': {
        id: 'weekend-warrior',
        type: 'special',
        tier: 'silver',
        title: 'Guerrero de Fin de Semana',
        description: 'Completaste 5 lecciones en un fin de semana',
        icon: '⚔️',
        condition: (stats, progress, event) => event?.type === 'weekend-burst' && event.count >= 5
      },

      // CURSO COMPLETO - Diploma de Honor
      'course-complete': {
        id: 'course-complete',
        type: 'course',
        tier: 'honor',
        title: 'DIPLOMA DE HONOR - Curso Completo',
        description: 'Completaste todas las 6 fases del curso profesional',
        icon: '🏅',
        condition: (stats, progress) => progress.phasesCompleted?.length >= 6
      }
    };
  }

  _loadUnlocked() {
    try {
      const saved = localStorage.getItem('math-course-achievements');
      if (saved) {
        const parsed = JSON.parse(saved);
        this._unlocked = new Set(parsed.unlocked || []);
        this._notified = new Set(parsed.notified || []);
      }
    } catch (e) {}
  }

  _saveUnlocked() {
    try {
      localStorage.setItem('math-course-achievements', JSON.stringify({
        unlocked: [...this._unlocked],
        notified: [...this._notified]
      }));
    } catch (e) {}
  }

  async checkAll(progressStats, progressData = {}) {
    const newlyUnlocked = [];
    for (const [id, def] of Object.entries(this.definitions)) {
      if (!this._unlocked.has(id)) {
        try {
          if (def.condition(progressStats, progressData)) {
            this._unlocked.add(id);
            newlyUnlocked.push({ ...def, unlockedAt: Date.now() });
          }
        } catch (e) {
          console.warn(`Achievement check failed for ${id}:`, e);
        }
      }
    }
    if (newlyUnlocked.length > 0) {
      this._saveUnlocked();
      this._notify(newlyUnlocked);
    }
    return newlyUnlocked;
  }

  checkEvent(eventType, eventData) {
    const progressStats = this.store.getState(); // simplified
    const newlyUnlocked = [];
    for (const [id, def] of Object.entries(this.definitions)) {
      if (!this._unlocked.has(id) && def.condition(progressStats, {}, { type: eventType, ...eventData })) {
        this._unlocked.add(id);
        newlyUnlocked.push({ ...def, unlockedAt: Date.now() });
      }
    }
    if (newlyUnlocked.length > 0) {
      this._saveUnlocked();
      this._notify(newlyUnlocked);
    }
    return newlyUnlocked;
  }

  checkModuleAchievements(moduleId) {
    return this.checkEvent('module-complete', { moduleId });
  }

  checkPhaseAchievements(phaseId) {
    return this.checkEvent('phase-complete', { phaseId });
  }

  _notify(achievements) {
    achievements.forEach(a => {
      if (!this._notified.has(a.id)) {
        this.store.set('ui.notifications', [
          ...(this.store.get('ui.notifications') || []),
          {
            id: `achievement-${a.id}`,
            type: 'achievement',
            title: `¡Logro desbloqueado: ${a.title}!`,
            message: a.description,
            icon: a.icon,
            tier: a.tier,
            timestamp: Date.now()
          }
        ]);
        this._notified.add(a.id);
      }
    });
  }

  getUnlocked() {
    return [...this._unlocked].map(id => ({
      ...this.definitions[id],
      unlocked: true
    }));
  }

  getLocked() {
    return Object.entries(this.definitions)
      .filter(([id]) => !this._unlocked.has(id))
      .map(([id, def]) => ({ ...def, unlocked: false }));
  }

  getAll() {
    return Object.entries(this.definitions).map(([id, def]) => ({
      ...def,
      unlocked: this._unlocked.has(id)
    }));
  }

  isUnlocked(id) {
    return this._unlocked.has(id);
  }

  getByTier(tier) {
    return this.getAll().filter(a => a.tier === tier);
  }

  getByType(type) {
    return this.getAll().filter(a => a.type === type);
  }

  // Generar diploma
  generateDiplomaData(type, id) {
    const user = this.store.get('user');
    const stats = this.store.progress.getGlobalStats ? 
      this.store.progress.getGlobalStats() : {};
    
    const diplomaTypes = {
      lesson: { title: 'Certificado de Lección', subtitle: 'Lección completada con éxito' },
      module: { title: 'Insignia de Módulo', subtitle: 'Módulo completado con éxito' },
      phase: { title: 'Certificado de Fase', subtitle: 'Fase completada con éxito' },
      course: { title: 'DIPLOMA DE HONOR', subtitle: 'Curso Profesional Completo de Matemática Básica y Pensamiento Matemático' }
    };

    const config = diplomaTypes[type] || diplomaTypes.lesson;
    const achievement = this.definitions[id];
    
    return {
      type,
      id,
      title: config.title,
      subtitle: config.subtitle,
      recipient: user.name || 'Estudiante',
      achievement: achievement ? {
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        tier: achievement.tier
      } : null,
      date: new Date().toISOString().split('T')[0],
      verificationHash: this._generateHash(user, id, type),
      stats: {
        lessonsCompleted: stats.lessonsCompleted,
        modulesCompleted: stats.modulesCompleted,
        phasesCompleted: stats.phasesCompleted,
        averageScore: stats.averageScore,
        currentStreak: stats.currentStreak
      }
    };
  }

  _generateHash(user, id, type) {
    const data = `${user.id || 'anon'}-${id}-${type}-${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).toUpperCase();
  }

  // Verificación pública
  static verifyDiploma(hash) {
    // En producción: verificar contra backend o blockchain
    // Por ahora: validación básica de formato
    return hash && hash.length >= 8;
  }
}