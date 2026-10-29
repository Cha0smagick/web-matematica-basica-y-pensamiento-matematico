// Settings Store - Configuración de usuario
export class SettingsStore {
  constructor(mainStore) {
    this.store = mainStore;
    this.defaults = {
      theme: 'system',           // 'light', 'dark', 'system'
      language: 'es',            // 'es', 'en' (future)
      fontSize: 'medium',        // 'small', 'medium', 'large', 'xl'
      reducedMotion: false,      // Respeta prefers-reduced-motion
      highContrast: false,       // Modo alto contraste
      dyslexiaFont: false,       // Fuente dislexia-friendly
      soundEnabled: true,        // Sonidos de feedback
      hapticEnabled: true,       // Vibración en móvil
      autoPlayVideo: false,      // Auto-play videos/animaciones
      showHints: true,           // Mostrar pistas automáticas
      spacedRepetition: true,    // Práctica espaciada activa
      dailyReminder: false,      // Recordatorio diario
      reminderTime: '19:00',     // Hora recordatorio
      analytics: true,           // Permitir analíticas anónimas
      shareProgress: false       // Compartir progreso (futuro social)
    };
    this._load();
  }

  _load() {
    try {
      const saved = localStorage.getItem('math-course-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = { ...this.defaults, ...parsed };
      } else {
        this.settings = { ...this.defaults };
      }
      this._applySettings();
    } catch (e) {
      this.settings = { ...this.defaults };
    }
  }

  _save() {
    try {
      localStorage.setItem('math-course-settings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Settings save failed:', e);
    }
  }

  _applySettings() {
    const root = document.documentElement;
    
    // Theme
    this.store.set('ui.theme', this.settings.theme);
    if (this.settings.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', this.settings.theme);
    }

    // Font size
    root.style.setProperty('--font-size-base', this._getFontSize());

    // Accessibility
    root.classList.toggle('reduced-motion', this.settings.reducedMotion);
    root.classList.toggle('high-contrast', this.settings.highContrast);
    root.classList.toggle('dyslexia-font', this.settings.dyslexiaFont);

    // Media query listener for system theme
    if (this._mediaQueryListener) {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this._mediaQueryListener);
    }
    if (this.settings.theme === 'system') {
      this._mediaQueryListener = (e) => {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      };
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this._mediaQueryListener);
    }
  }

  _getFontSize() {
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xl: '20px'
    };
    return sizes[this.settings.fontSize] || sizes.medium;
  }

  get(key) {
    return this.settings[key];
  }

  getAll() {
    return { ...this.settings };
  }

  set(key, value) {
    if (key in this.defaults) {
      this.settings[key] = value;
      this._save();
      this._applySettings();
      this.store.set(`settings.${key}`, value);
      return true;
    }
    return false;
  }

  setMultiple(updates) {
    let changed = false;
    for (const [key, value] of Object.entries(updates)) {
      if (key in this.defaults && this.settings[key] !== value) {
        this.settings[key] = value;
        changed = true;
      }
    }
    if (changed) {
      this._save();
      this._applySettings();
      for (const key of Object.keys(updates)) {
        this.store.set(`settings.${key}`, this.settings[key]);
      }
    }
    return changed;
  }

  reset() {
    this.settings = { ...this.defaults };
    this._save();
    this._applySettings();
    for (const key of Object.keys(this.defaults)) {
      this.store.set(`settings.${key}`, this.settings[key]);
    }
  }

  // Exportar/Importar configuración
  export() {
    return JSON.stringify(this.settings, null, 2);
  }

  import(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      this.settings = { ...this.defaults, ...parsed };
      this._save();
      this._applySettings();
      return true;
    } catch (e) {
      return false;
    }
  }
}