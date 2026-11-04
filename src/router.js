// Router SPA hash-based para GitHub Pages
export class Router {
  constructor(routes, store) {
    this.routes = routes;
    this.store = store;
    this.listeners = new Set();
    this.currentRoute = null;
    this.currentParams = {};
    this.currentMatch = null;
    
    this._bindEvents();
  }

  _bindEvents() {
    window.addEventListener('hashchange', () => this._handleHashChange());
    window.addEventListener('load', () => this._handleHashChange());
  }

  _handleHashChange() {
    const hash = window.location.hash.slice(1) || '/';
    // Evitar re-render duplicado cuando el propio navigate() cambia el hash
    if (hash === this._lastEmitted) {return;}
    this.navigate(hash, false);
  }

  _matchRoute(path) {
    for (const route of this.routes) {
      const regex = this._pathToRegex(route.path);
      const match = path.match(regex);
      if (match) {
        const params = {};
        const keys = this._getPathKeys(route.path);
        keys.forEach((key, i) => {
          params[key] = match[i + 1];
        });
        return { route, params, match };
      }
    }
    return null;
  }

  _pathToRegex(path) {
    const regexStr = path
      .replace(/\//g, '\\/')
      .replace(/:([^/]+)/g, '([^/]+)');
    return new RegExp(`^${regexStr}$`);
  }

  _getPathKeys(path) {
    const keys = [];
    path.replace(/:([^/]+)/g, (_, key) => keys.push(key));
    return keys;
  }

  _generatePath(route, params) {
    return route.path.replace(/:([^/]+)/g, (_, key) => params[key] || '');
  }

  on(event, callback) {
    if (event === 'route') {
      this.listeners.add(callback);
    }
  }

  off(callback) {
    this.listeners.delete(callback);
  }

  _emit(event, data) {
    this.listeners.forEach(cb => cb(data));
  }

  navigate(path, pushState = true) {
    // Aceptar '#/ruta' o '/ruta'; descartar query para el matching
    const cleanPath = (path || '/').replace(/^#/, '').split('?')[0] || '/';
    const matched = this._matchRoute(cleanPath);

    if (!matched) {
      this._notFound(cleanPath, pushState);
      return;
    }

    const { route, params, match } = matched;

    // Sin backend: si una ruta protegida se pide sin sesión, crear invitado local
    if (route.auth && !this.store.get('user.authenticated')) {
      this.store.set('user.name', 'Estudiante');
      this.store.set('user.authenticated', true);
      this.store.set('user.id', 'guest-' + Date.now());
    }

    this.currentRoute = route;
    this.currentParams = params;
    this.currentMatch = match;
    this._lastEmitted = cleanPath;

    if (pushState && window.location.hash.slice(1) !== cleanPath) {
      window.location.hash = cleanPath;
    }

    this._emit('route', { component: route.component, params, match, route, path: cleanPath });
  }

  _notFound(path, pushState) {
    const fallback = this.routes.find(r => r.path === '/404') || { path: '/404', component: 'page-not-found', title: 'No encontrado' };
    this.currentRoute = fallback;
    this.currentParams = { path };
    this.currentMatch = null;
    this._lastEmitted = '/404';
    if (pushState && window.location.hash.slice(1) !== '/404') {
      window.location.hash = '/404';
    }
    this._emit('route', { component: fallback.component, params: { path }, match: null, route: fallback, path: '/404' });
  }

  start() {
    this._handleHashChange();
  }

  getCurrentRoute() {
    return this.currentRoute;
  }

  getCurrentParams() {
    return { ...this.currentParams };
  }

  // Helper para generar URLs
  urlFor(routePath, params = {}) {
    const route = this.routes.find(r => r.path === routePath);
    if (!route) {return '#';}
    const path = this._generatePath(route, params);
    return `#${path}`;
  }
}

// Helper global para navegación
export function navigateTo(path) {
  if (window.__APP_ROUTER__) {
    window.__APP_ROUTER__.navigate(path);
  }
}