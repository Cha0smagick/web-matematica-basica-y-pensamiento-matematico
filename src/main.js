// Bootstrap principal - Inicialización de la aplicación
console.log('main.js loaded');

// Error global NO destructivo: no borra la app, solo informa
window.addEventListener('error', function (e) {
  console.error('Global error:', e.error || e.message);
  let banner = document.getElementById('error-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'error-banner';
    banner.setAttribute('role', 'alert');
    banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#dc2626;color:#fff;padding:10px 16px;font:14px sans-serif;display:flex;gap:12px;align-items:center;';
    banner.innerHTML = '<span>⚠️ Ocurrió un error inesperado.</span>';
    const dismiss = document.createElement('button');
    dismiss.textContent = 'Cerrar';
    dismiss.style.cssText = 'margin-left:auto;background:transparent;color:#fff;border:1px solid #fff;border-radius:4px;padding:2px 8px;cursor:pointer;';
    dismiss.onclick = () => banner.remove();
    banner.appendChild(dismiss);
    document.body.appendChild(banner);
  }
});

import { Router } from './router.js';
import { store } from './store/index.js';
import { Layout } from './components/layout/Layout.js';
import { Header } from './components/layout/Header.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { Footer } from './components/layout/Footer.js';
import { HomePage } from './pages/HomePage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { PhasePage } from './pages/PhasePage.js';
import { ModulePage } from './pages/ModulePage.js';
import { LessonPage } from './pages/LessonPage.js';
import { QuizPage } from './pages/QuizPage.js';
import { PracticePage } from './pages/PracticePage.js';
import { DiplomaPage } from './pages/DiplomaPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { LatexRenderer } from './components/math/LatexRenderer.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { LegalPage } from './pages/LegalPage.js';
import './styles/globals.css';

console.log('Imports done');

// Exponer store global
window.__APP_STORE__ = store;
console.log('Store initialized');

// Registrar componentes de layout (solo si no están registrados)
const registerComponent = (name, ctor) => {
  if (!customElements.get(name)) {
    customElements.define(name, ctor);
  }
};

registerComponent('app-layout', Layout);
registerComponent('app-header', Header);
registerComponent('app-sidebar', Sidebar);
registerComponent('app-footer', Footer);
console.log('Layout components registered');

// Registrar páginas
registerComponent('page-home', HomePage);
registerComponent('page-dashboard', DashboardPage);
registerComponent('page-phase', PhasePage);
registerComponent('page-module', ModulePage);
registerComponent('page-lesson', LessonPage);
registerComponent('page-quiz', QuizPage);
registerComponent('page-practice', PracticePage);
registerComponent('page-diploma', DiplomaPage);
registerComponent('page-profile', ProfilePage);
registerComponent('page-settings', SettingsPage);
registerComponent('latex-renderer', LatexRenderer);
registerComponent('page-not-found', NotFoundPage);
registerComponent('page-legal', LegalPage);
console.log('Pages registered');

// Configurar rutas
const routes = [
  { path: '/', component: 'page-home', title: 'Inicio' },
  { path: '/dashboard', component: 'page-dashboard', title: 'Panel', auth: true },
  { path: '/phase/:phaseId', component: 'page-phase', title: 'Fase' },
  { path: '/module/:moduleId', component: 'page-module', title: 'Módulo' },
  { path: '/lesson/:lessonId', component: 'page-lesson', title: 'Lección' },
  { path: '/quiz/:quizId', component: 'page-quiz', title: 'Cuestionario' },
  { path: '/practice/:type', component: 'page-practice', title: 'Práctica' },
  { path: '/diploma/:type/:id', component: 'page-diploma', title: 'Diploma' },
  { path: '/profile', component: 'page-profile', title: 'Perfil', auth: true },
  { path: '/settings', component: 'page-settings', title: 'Configuración' },
  { path: '/legal', component: 'page-legal', title: 'Privacidad y Términos' },
  { path: '/404', component: 'page-not-found', title: 'No encontrado' }
];

// Inicializar router
const router = new Router(routes, store);
window.__APP_ROUTER__ = router;
console.log('Router initialized');

// Montar app
const app = document.getElementById('app');
app.innerHTML = `
  <app-layout>
    <app-header slot="header"></app-header>
    <app-sidebar slot="sidebar"></app-sidebar>
    <main slot="main" id="main-content" role="main"></main>
    <app-footer slot="footer"></app-footer>
  </app-layout>
`;
console.log('App mounted');

// Escuchar cambios de ruta
router.on('route', ({ component, params, route }) => {
  console.log('Route changed:', component);
  const main = document.getElementById('main-content');
  main.innerHTML = `<${component}></${component}>`;
  const page = main.querySelector(component);
  if (page && page.init) {
    page.init(params);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.title = route?.title ? `${route.title} | Matemática Básica` : 'Matemática Básica';
});

// Iniciar router
router.start();
console.log('Router started');

// Service Worker solo en producción (el dev server no debe cachear)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((e) => {
      console.warn('No se pudo registrar el service worker:', e);
    });
  });
}

// Exponer para debugging
window.__APP__ = { store, router };

console.log('🎓 App initialized successfully');