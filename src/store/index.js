// Store principal - Estado reactivo con persistencia
import { ProgressStore } from './progress.js';
import { AchievementsStore } from './achievements.js';
import { SettingsStore } from './settings.js';

export class Store {
  constructor() {
    this._state = {
      user: {
        id: null,
        name: '',
        email: '',
        authenticated: false,
        preferences: {}
      },
      course: {
        currentPhase: null,
        currentModule: null,
        currentLesson: null,
        phases: {}
      },
      ui: {
        theme: 'system',
        sidebarOpen: false,
        modalOpen: null,
        notifications: [],
        loading: false
      },
      session: {
        startTime: Date.now(),
        lastActivity: Date.now(),
        streak: 0,
        lastVisitDate: null
      }
    };

    this._subscribers = new Map();
    this._proxiedState = new Proxy(this._state, {
      set: (target, prop, value) => {
        target[prop] = value;
        this._notify(prop, value);
        return true;
      }
    });

    // Inicializar sub-stores
    this.progress = new ProgressStore(this);
    this.achievements = new AchievementsStore(this);
    this.settings = new SettingsStore(this);

    // Cargar estado persistido
    this._loadPersisted();
    
    // Auto-save en cambios
    this._setupAutoSave();
    
    // Track actividad
    this._setupActivityTracking();
  }

  get(path) {
    const keys = path.split('.');
    let value = this._proxiedState;
    for (const key of keys) {
      if (value === undefined || value === null) return undefined;
      value = value[key];
    }
    return value;
  }

  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = this._proxiedState;
    for (const key of keys) {
      if (!(key in target)) target[key] = {};
      target = target[key];
    }
    target[lastKey] = value;
  }

  // Reactive subscription
  subscribe(path, callback) {
    if (!this._subscribers.has(path)) {
      this._subscribers.set(path, new Set());
    }
    this._subscribers.get(path).add(callback);
    
    // Return unsubscribe function
    return () => {
      const subs = this._subscribers.get(path);
      if (subs) subs.delete(callback);
    };
  }

  _notify(path, value) {
    // Notify exact path subscribers
    const exactSubs = this._subscribers.get(path);
    if (exactSubs) {
      exactSubs.forEach(cb => cb(value, path));
    }
    // Notify parent path subscribers (e.g., 'user' for 'user.name')
    const parts = path.split('.');
    for (let i = parts.length - 1; i > 0; i--) {
      const parentPath = parts.slice(0, i).join('.');
      const parentSubs = this._subscribers.get(parentPath);
      if (parentSubs) {
        const parentValue = this.get(parentPath);
        parentSubs.forEach(cb => cb(parentValue, parentPath));
      }
    }
  }

  _loadPersisted() {
    try {
      const persisted = localStorage.getItem('math-course-state');
      if (persisted) {
        const parsed = JSON.parse(persisted);
        this._deepMerge(this._state, parsed);
        // Apply theme immediately
        this._applyTheme(this._state.ui.theme);
      }
    } catch (e) {
      console.warn('Failed to load persisted state:', e);
    }
  }

  _deepMerge(target, source) {
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        this._deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  _setupAutoSave() {
    let saveTimeout;
    const save = () => {
      try {
        // Don't save UI transient state
        const { ui, session, ...persistState } = this._state;
        localStorage.setItem('math-course-state', JSON.stringify(persistState));
      } catch (e) {
        console.warn('Auto-save failed:', e);
      }
    };

    this.subscribe('', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(save, 1000);
    });
  }

  _setupActivityTracking() {
    const updateActivity = () => {
      this._state.session.lastActivity = Date.now();
    };
    ['click', 'keydown', 'scroll', 'mousemove'].forEach(evt => {
      document.addEventListener(evt, updateActivity, { passive: true });
    });
  }

  _applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }

  // Métodos de conveniencia
  getState() {
    return { ...this._state };
  }

  reset() {
    localStorage.removeItem('math-course-state');
    localStorage.removeItem('math-course-progress');
    localStorage.removeItem('math-course-achievements');
    location.reload();
  }
}

// Export singleton instance
export const store = new Store();